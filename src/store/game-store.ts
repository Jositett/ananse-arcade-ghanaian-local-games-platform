import { create } from 'zustand';
import { createInitialOware, sowSeeds, OwareState } from '@/lib/game-logic/oware-engine';
import { PlayerColor, Token, moveToken, getValidMoves } from '@/lib/game-logic/ludo-engine';
import { getBestLudoMove, getBestOwareMove } from '@/lib/game-logic/ai-engine';
import { LudoMove } from '@shared/types';
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
    validMoves: []
  },
  oware: createInitialOware(),
  setGame: (gameType, gameMode, roomId, playerIdx) => set({
    gameType, gameMode, roomId: roomId || null, localPlayerId: playerIdx ?? 0,
    winner: null, selectedTokenId: null,
    ludo: { tokens: initialLudoTokens(), currentPlayer: 'red', diceRoll: null, isRolling: false, validMoves: [] },
    oware: createInitialOware()
  }),
  syncWithServer: async () => {
    const roomId = get().roomId;
    const gameMode = get().gameMode;
    if (gameMode !== 'online' || !roomId) return;
    try {
      const res = await fetch(`/api/games/${roomId}`);
      const json = await res.json();
      if (json.success) set({ ludo: json.data.state.ludo, oware: json.data.state.oware, winner: json.data.state.winner });
    } catch (e) { console.error("Sync failed", e); }
  },
  rollDice: () => {
    const ludo = get().ludo;
    const gameMode = get().gameMode;
    const localPlayerId = get().localPlayerId;
    const winner = get().winner;
    if (winner || ludo.isRolling || ludo.diceRoll !== null) return;
    if (gameMode === 'online' && COLORS.indexOf(ludo.currentPlayer) !== localPlayerId) return;
    set(state => ({ ludo: { ...state.ludo, isRolling: true } }));
    setTimeout(async () => {
      if (!get().gameType) return; // Guard against reset
      const roll = Math.floor(Math.random() * 6) + 1;
      const validMoves = getValidMoves(get().ludo.tokens, get().ludo.currentPlayer, roll);
      set(state => ({ ludo: { ...state.ludo, isRolling: false, diceRoll: roll, validMoves } }));
      if (validMoves.length === 0) {
        setTimeout(() => {
          if (!get().gameType) return;
          const currentPlayer = get().ludo.currentPlayer;
          const nextIdx = (COLORS.indexOf(currentPlayer) + 1) % 4;
          set(s => ({ ludo: { ...s.ludo, diceRoll: null, currentPlayer: COLORS[nextIdx], validMoves: [] } }));
          get().checkCPUTurn();
        }, 1200);
      } else if (gameMode === 'pvc' && get().ludo.currentPlayer !== 'red') {
        const bestMove = await getBestLudoMove(get().ludo.tokens, get().ludo.currentPlayer, roll, validMoves);
        if (bestMove) setTimeout(() => get().executeLudoMove(bestMove), 1000);
      }
    }, 600);
  },
  selectLudoToken: (tokenId) => {
    const ludo = get().ludo;
    const selectedTokenId = get().selectedTokenId;
    const winner = get().winner;
    if (winner) return;
    if (selectedTokenId === tokenId) {
      set({ selectedTokenId: null });
      return;
    }
    const tokenMoves = ludo.validMoves.filter(m => m.tokenId === tokenId);
    if (tokenMoves.length === 1) {
      get().executeLudoMove(tokenMoves[0]);
    } else if (tokenMoves.length > 1) {
      set({ selectedTokenId: tokenId });
    }
  },
  executeLudoMove: async (move) => {
    const ludo = get().ludo;
    const roomId = get().roomId;
    const gameMode = get().gameMode;
    const winner = get().winner;
    if (winner) return;
    const result = moveToken(ludo.tokens, move, ludo.diceRoll!);
    set(s => ({
      selectedTokenId: null,
      ludo: {
        ...s.ludo,
        tokens: result.newTokens,
        diceRoll: null,
        validMoves: [],
        currentPlayer: result.extraTurn ? s.ludo.currentPlayer : COLORS[(COLORS.indexOf(s.ludo.currentPlayer) + 1) % 4]
      }
    }));
    get().checkWinner();
    if (gameMode === 'online' && roomId) {
      await fetch(`/api/games/${roomId}/sync`, { method: 'POST', body: JSON.stringify({ state: get() }) });
    }
    get().checkCPUTurn();
  },
  playOwarePit: async (index) => {
    const oware = get().oware;
    const gameMode = get().gameMode;
    const roomId = get().roomId;
    const localPlayerId = get().localPlayerId;
    const winner = get().winner;
    if (winner) return;
    if (gameMode === 'online' && oware.currentPlayer !== localPlayerId) return;
    const newState = sowSeeds(oware, index);
    set({ oware: newState });
    get().checkWinner();
    if (gameMode === 'online' && roomId) {
      await fetch(`/api/games/${roomId}/sync`, { method: 'POST', body: JSON.stringify({ state: get() }) });
    }
    if (gameMode === 'pvc' && newState.currentPlayer === 1 && !get().winner) {
      const bestMove = await getBestOwareMove(newState);
      if (bestMove !== null) setTimeout(() => {
        if (!get().gameType) return;
        get().playOwarePit(bestMove);
      }, 1000);
    }
  },
  checkWinner: () => {
    const gameType = get().gameType;
    const ludo = get().ludo;
    const oware = get().oware;
    if (gameType === 'ludo') {
      COLORS.forEach(color => {
        if (ludo.tokens.filter(t => t.color === color && t.position === 58).length === 4) set({ winner: color.toUpperCase() });
      });
    } else {
      if (oware.captured[0] >= 25) set({ winner: 'PLAYER 1' });
      else if (oware.captured[1] >= 25) set({ winner: 'PLAYER 2' });
    }
  },
  checkCPUTurn: () => {
    const winner = get().winner;
    const gameType = get().gameType;
    const gameMode = get().gameMode;
    const currentPlayer = get().ludo.currentPlayer;
    if (winner) return;
    if (gameType === 'ludo' && gameMode === 'pvc' && currentPlayer !== 'red') {
      setTimeout(() => {
        if (!get().gameType) return;
        get().rollDice();
      }, 1000);
    }
  },
  resetGame: () => set({
    winner: null, selectedTokenId: null,
    ludo: { tokens: initialLudoTokens(), currentPlayer: 'red', diceRoll: null, isRolling: false, validMoves: [] },
    oware: createInitialOware()
  })
}));