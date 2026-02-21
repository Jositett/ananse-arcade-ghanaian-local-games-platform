import { create } from 'zustand';
import { createInitialOware, sowSeeds, OwareState } from '@/lib/game-logic/oware-engine';
import { PlayerColor, Token, moveToken, getValidMoves } from '@/lib/game-logic/ludo-engine';
import { getBestLudoMove, getBestOwareMove } from '@/lib/game-logic/ai-engine';
import { LudoMove } from '@shared/types';
import { toast } from 'sonner';
interface GameState {
  gameType: 'ludo' | 'oware' | null;
  gameMode: 'pvp' | 'pvc' | 'online';
  winner: string | null;
  roomId: string | null;
  localPlayerId: number;
  selectedTokenId: number | null;
  ludo: {
    tokens: Token[];
    currentPlayer: PlayerColor;
    diceRoll: number | null;
    isRolling: boolean;
    validMoves: LudoMove[];
    consecutiveSixes: number;
    showTripleSixWarning: boolean;
  };
  oware: OwareState;
  setGame: (type: 'ludo' | 'oware' | null, mode: 'pvp' | 'pvc' | 'online', roomId?: string, playerIdx?: number) => void;
  rollDice: () => void;
  selectLudoToken: (tokenId: number) => void;
  executeLudoMove: (move: LudoMove) => void;
  playOwarePit: (index: number) => void;
  resetGame: () => void;
  checkWinner: () => void;
  checkCPUTurn: () => void;
  syncWithServer: () => Promise<void>;
}
const COLORS: PlayerColor[] = ['red', 'green', 'yellow', 'blue'];
const initialLudoTokens = (): Token[] =>
  COLORS.flatMap(color => {
    const colorIndex = COLORS.indexOf(color);
    return [1, 2, 3, 4].map(id => ({ id: colorIndex * 4 + id, color, position: -1 }));
  });
export const useGameStore = create<GameState>((set, get) => ({
  gameType: null,
  gameMode: 'pvp',
  winner: null,
  roomId: null,
  localPlayerId: 0,
  selectedTokenId: null,
  ludo: {
    tokens: initialLudoTokens(),
    currentPlayer: 'red',
    diceRoll: null,
    isRolling: false,
    validMoves: [],
    consecutiveSixes: 0,
    showTripleSixWarning: false
  },
  oware: createInitialOware(),
  setGame: (gameType, gameMode, roomId, playerIdx) => set({
    gameType, gameMode, roomId: roomId || null, localPlayerId: playerIdx ?? 0,
    winner: null, selectedTokenId: null,
    ludo: { tokens: initialLudoTokens(), currentPlayer: 'red', diceRoll: null, isRolling: false, validMoves: [], consecutiveSixes: 0, showTripleSixWarning: false },
    oware: createInitialOware()
  }),
  syncWithServer: async () => {
    const roomId = get().roomId;
    if (get().gameMode !== 'online' || !roomId) return;
    try {
      const res = await fetch(`/api/games/${roomId}`);
      const json = await res.json();
      if (json.success) set({ ludo: json.data.state.ludo, oware: json.data.state.oware, winner: json.data.state.winner });
    } catch (e) { console.error("Sync failed", e); }
  },
  rollDice: () => {
    const ludo = get().ludo;
    if (get().winner || ludo.isRolling || ludo.diceRoll !== null) return;
    if (get().gameMode === 'online' && COLORS.indexOf(ludo.currentPlayer) !== get().localPlayerId) return;
    set(state => ({ ludo: { ...state.ludo, isRolling: true, showTripleSixWarning: false } }));
    setTimeout(async () => {
      const roll = Math.floor(Math.random() * 6) + 1;
      const newConsecutive = roll === 6 ? ludo.consecutiveSixes + 1 : 0;
      if (newConsecutive === 3) {
        set(state => ({ ludo: { ...state.ludo, isRolling: false, diceRoll: roll, consecutiveSixes: 0, showTripleSixWarning: true } }));
        setTimeout(() => {
          const nextIdx = (COLORS.indexOf(get().ludo.currentPlayer) + 1) % 4;
          set(s => ({ ludo: { ...s.ludo, diceRoll: null, currentPlayer: COLORS[nextIdx], showTripleSixWarning: false } }));
          get().checkCPUTurn();
        }, 2000);
        return;
      }
      const validMoves = getValidMoves(get().ludo.tokens, get().ludo.currentPlayer, roll);
      set(state => ({ ludo: { ...state.ludo, isRolling: false, diceRoll: roll, validMoves, consecutiveSixes: newConsecutive } }));
      if (validMoves.length === 0) {
        setTimeout(() => {
          const nextIdx = (COLORS.indexOf(get().ludo.currentPlayer) + 1) % 4;
          set(s => ({ ludo: { ...s.ludo, diceRoll: null, currentPlayer: COLORS[nextIdx], validMoves: [], consecutiveSixes: 0 } }));
          get().checkCPUTurn();
        }, 1500);
      } else if (get().gameMode === 'pvc' && get().ludo.currentPlayer !== 'red') {
        const bestMove = await getBestLudoMove(get().ludo.tokens, get().ludo.currentPlayer, roll, validMoves);
        if (bestMove) setTimeout(() => get().executeLudoMove(bestMove), 1000);
      }
    }, 600);
  },
  selectLudoToken: (tokenId) => {
    const ludo = get().ludo;
    if (get().winner || ludo.diceRoll === null) return;
    const tokenMoves = ludo.validMoves.filter(m => m.tokenId === tokenId);
    if (tokenMoves.length === 1) {
      get().executeLudoMove(tokenMoves[0]);
    } else if (tokenMoves.length > 1) {
      set({ selectedTokenId: tokenId });
    }
  },
  executeLudoMove: async (move) => {
    const ludo = get().ludo;
    if (get().winner || ludo.diceRoll === null) return;
    set({ selectedTokenId: null });
    const result = moveToken(ludo.tokens, move, ludo.diceRoll);
    const nextPlayer = result.extraTurn ? ludo.currentPlayer : COLORS[(COLORS.indexOf(ludo.currentPlayer) + 1) % 4];
    set(s => ({
      ludo: {
        ...s.ludo,
        tokens: result.newTokens,
        diceRoll: null,
        validMoves: [],
        currentPlayer: nextPlayer,
        consecutiveSixes: result.extraTurn && s.ludo.diceRoll === 6 ? s.ludo.consecutiveSixes : 0
      }
    }));
    get().checkWinner();
    if (get().gameMode === 'online' && get().roomId) {
      await fetch(`/api/games/${get().roomId}/sync`, { method: 'POST', body: JSON.stringify({ state: get() }) });
    }
    get().checkCPUTurn();
  },
  playOwarePit: async (index) => {
    const oware = get().oware;
    if (get().winner) return;
    const newState = sowSeeds(oware, index);
    set({ oware: newState });
    get().checkWinner();
    if (get().gameMode === 'online' && get().roomId) {
      await fetch(`/api/games/${get().roomId}/sync`, { method: 'POST', body: JSON.stringify({ state: get() }) });
    }
    if (get().gameMode === 'pvc' && newState.currentPlayer === 1 && !get().winner) {
      const bestMove = await getBestOwareMove(newState);
      if (bestMove !== null) setTimeout(() => get().playOwarePit(bestMove), 1000);
    }
  },
  checkWinner: () => {
    const gameType = get().gameType;
    if (gameType === 'ludo') {
      const ludo = get().ludo;
      COLORS.forEach(color => {
        if (ludo.tokens.filter(t => t.color === color && t.position === 58).length === 4) set({ winner: color.toUpperCase() });
      });
    } else if (gameType === 'oware') {
      const oware = get().oware;
      if (oware.captured[0] >= 25) set({ winner: 'PLAYER 1' });
      else if (oware.captured[1] >= 25) set({ winner: 'PLAYER 2' });
    }
  },
  checkCPUTurn: () => {
    if (get().winner) return;
    if (get().gameType === 'ludo' && get().gameMode === 'pvc' && get().ludo.currentPlayer !== 'red') {
      setTimeout(() => get().rollDice(), 1000);
    }
  },
  resetGame: () => set({
    winner: null, selectedTokenId: null,
    ludo: { tokens: initialLudoTokens(), currentPlayer: 'red', diceRoll: null, isRolling: false, validMoves: [], consecutiveSixes: 0, showTripleSixWarning: false },
    oware: createInitialOware()
  })
}));