import { create } from 'zustand';
import { createInitialOware, sowSeeds, OwareState } from '@/lib/game-logic/oware-engine';
import { PlayerColor, Token, moveToken, getValidMoves } from '@/lib/game-logic/ludo-engine';
import { getBestLudoMove, getBestOwareMove } from '@/lib/game-logic/ai-engine';
import { LudoMove, GameEvent } from '@shared/types';
import { v4 as uuidv4 } from 'uuid';
interface GameState {
  gameType: 'ludo' | 'oware' | null;
  gameMode: 'pvp' | 'pvc' | 'online';
  winner: string | null;
  roomId: string | null;
  localPlayerId: number;
  selectedTokenId: number | null;
  isAnimating: boolean;
  battleLog: GameEvent[];
  ludo: {
    tokens: Token[];
    currentPlayer: PlayerColor;
    diceRoll: number | null;
    isRolling: boolean;
    validMoves: LudoMove[];
    consecutiveSixes: number;
    showTripleSixWarning: boolean;
    lastMove?: LudoMove;
  };
  oware: OwareState & { lastPitPlayed?: number };
  setGame: (type: 'ludo' | 'oware' | null, mode: 'pvp' | 'pvc' | 'online', roomId?: string, playerIdx?: number) => void;
  addLog: (type: GameEvent['type'], player: string, message: string) => void;
  rollDice: () => void;
  selectLudoToken: (tokenId: number) => void;
  executeLudoMove: (move: LudoMove) => void;
  playOwarePit: (index: number, animated?: boolean) => Promise<void>;
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
  isAnimating: false,
  battleLog: [],
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
    winner: null, selectedTokenId: null, isAnimating: false, battleLog: [],
    ludo: { tokens: initialLudoTokens(), currentPlayer: 'red', diceRoll: null, isRolling: false, validMoves: [], consecutiveSixes: 0, showTripleSixWarning: false },
    oware: createInitialOware()
  }),
  addLog: (type, player, message) => set(s => ({
    battleLog: [{ id: uuidv4(), type, player, message, timestamp: Date.now() }, ...s.battleLog].slice(0, 20)
  })),
  selectLudoToken: (tokenId: number) => set({ selectedTokenId: tokenId }),

  syncWithServer: async () => {
    const roomId = get().roomId;
    if (get().gameMode !== 'online' || !roomId || get().isAnimating) return;
    try {
      const res = await fetch(`/api/games/${roomId}`);
      const json = await res.json();
      if (json.success) {
        set({ 
          ludo: json.data.state.ludo, 
          oware: json.data.state.oware, 
          winner: json.data.state.winner,
          battleLog: json.data.state.battleLog || []
        });
      }
    } catch (e) { console.error("Sync failed", e); }
  },
  rollDice: () => {
    const ludo = get().ludo;
    if (get().winner || ludo.isRolling || ludo.diceRoll !== null || get().isAnimating) return;
    set(state => ({ ludo: { ...state.ludo, isRolling: true, showTripleSixWarning: false } }));
    setTimeout(async () => {
      const roll = Math.floor(Math.random() * 6) + 1;
      get().addLog('roll', ludo.currentPlayer.toUpperCase(), `Rolled a ${roll}`);
      const newConsecutive = roll === 6 ? ludo.consecutiveSixes + 1 : 0;
      if (newConsecutive === 3) {
        set(state => ({ ludo: { ...state.ludo, isRolling: false, diceRoll: roll, consecutiveSixes: 0, showTripleSixWarning: true } }));
        get().addLog('turn_skip', ludo.currentPlayer.toUpperCase(), "Triple Six! Turn Lost");
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
        get().addLog('turn_skip', ludo.currentPlayer.toUpperCase(), "No valid moves!");
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
  executeLudoMove: async (move) => {
    const ludo = get().ludo;
    if (get().winner || ludo.diceRoll === null || get().isAnimating) return;
    set({ selectedTokenId: null });
    const result = moveToken(ludo.tokens, move, ludo.diceRoll!);
    if (move.isKick) get().addLog('kick', ludo.currentPlayer.toUpperCase(), "Captured an opponent!");
    if (move.targetPos === 58) get().addLog('home', ludo.currentPlayer.toUpperCase(), "Reached home!");
    const nextPlayer = result.extraTurn ? ludo.currentPlayer : COLORS[(COLORS.indexOf(ludo.currentPlayer) + 1) % 4];
    set(s => ({
      ludo: {
        ...s.ludo,
        tokens: result.newTokens,
        diceRoll: null,
        validMoves: [],
        currentPlayer: nextPlayer,
        consecutiveSixes: result.extraTurn && s.ludo.diceRoll === 6 ? s.ludo.consecutiveSixes : 0,
        lastMove: move
      }
    }));
    get().checkWinner();
    if (get().gameMode === 'online' && get().roomId) {
      const state = get();
      await fetch(`/api/games/${get().roomId}/sync`, { 
        method: 'POST', 
        body: JSON.stringify({ state: { ludo: state.ludo, oware: state.oware, winner: state.winner, battleLog: state.battleLog } }) 
      });
    }
    get().checkCPUTurn();
  },
  playOwarePit: async (index, animated = true) => {
    const oware = get().oware;
    if (get().winner || get().isAnimating || oware.pits[index] === 0) return;
    if (animated) {
      set({ isAnimating: true });
      let seeds = oware.pits[index];
      let currentPits = [...oware.pits];
      currentPits[index] = 0;
      let currentPos = index;
      get().addLog('sow', `Player ${oware.currentPlayer + 1}`, `Sowing from pit ${index + 1}`);
      while (seeds > 0) {
        currentPos = (currentPos + 1) % 12;
        if (currentPos === index) continue;
        currentPits[currentPos]++;
        seeds--;
        set(s => ({ oware: { ...s.oware, pits: [...currentPits], lastPitPlayed: currentPos } }));
        await new Promise(r => setTimeout(r, 150));
      }
      const finalState = sowSeeds(oware, index);
      const capturedDiff = finalState.captured[oware.currentPlayer] - oware.captured[oware.currentPlayer];
      if (capturedDiff > 0) get().addLog('capture', `Player ${oware.currentPlayer + 1}`, `Captured ${capturedDiff} seeds!`);
      set({ oware: finalState, isAnimating: false });
    } else {
      const newState = sowSeeds(oware, index);
      set({ oware: newState });
    }
    get().checkWinner();
    if (get().gameMode === 'online' && get().roomId) {
      const state = get();
      await fetch(`/api/games/${get().roomId}/sync`, { 
        method: 'POST', 
        body: JSON.stringify({ state: { ludo: state.ludo, oware: state.oware, winner: state.winner, battleLog: state.battleLog } }) 
      });
    }
    if (get().gameMode === 'pvc' && get().oware.currentPlayer === 1 && !get().winner) {
      const bestMove = await getBestOwareMove(get().oware);
      if (bestMove !== null) setTimeout(() => get().playOwarePit(bestMove), 1000);
    }
  },
  checkWinner: () => {
    const state = get();
    if (state.gameType === 'ludo') {
      COLORS.forEach(color => {
        if (state.ludo.tokens.filter(t => t.color === color && t.position === 58).length === 4) {
          set({ winner: color.toUpperCase() });
          get().addLog('win', color.toUpperCase(), "WON THE GAME!");
        }
      });
    } else if (state.gameType === 'oware') {
      if (state.oware.captured[0] >= 25) { set({ winner: 'PLAYER 1' }); get().addLog('win', 'P1', "WON THE GAME!"); }
      else if (state.oware.captured[1] >= 25) { set({ winner: 'PLAYER 2' }); get().addLog('win', 'P2', "WON THE GAME!"); }
    }
  },
  checkCPUTurn: () => {
    const state = get();
    if (state.winner || state.isAnimating) return;
    if (state.gameType === 'ludo' && state.gameMode === 'pvc' && state.ludo.currentPlayer !== 'red') {
      setTimeout(() => get().rollDice(), 1000);
    }
  },
  resetGame: () => set({
    winner: null, selectedTokenId: null, isAnimating: false, battleLog: [],
    ludo: { tokens: initialLudoTokens(), currentPlayer: 'red', diceRoll: null, isRolling: false, validMoves: [], consecutiveSixes: 0, showTripleSixWarning: false },
    oware: createInitialOware()
  })
}));