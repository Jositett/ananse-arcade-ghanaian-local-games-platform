import { create } from 'zustand';
import { createInitialOware, sowSeeds, OwareState } from '@/lib/game-logic/oware-engine';
import { PlayerColor, Token, moveToken, getValidMoves } from '@/lib/game-logic/ludo-engine';
import { getBestLudoMove, getBestOwareMove } from '@/lib/game-logic/ai-engine';
interface GameState {
  gameType: 'ludo' | 'oware' | null;
  gameMode: 'pvp' | 'pvc' | 'online';
  winner: string | null;
  roomId: string | null;
  localPlayerId: number; // 0 for Red/P1, 1 for Green/P2 etc
  ludo: {
    tokens: Token[];
    currentPlayer: PlayerColor;
    diceRoll: number | null;
    isRolling: boolean;
    validMoveIds: number[];
  };
  oware: OwareState;
  setGame: (type: 'ludo' | 'oware' | null, mode: 'pvp' | 'pvc' | 'online', roomId?: string, playerIdx?: number) => void;
  rollDice: () => void;
  moveLudoToken: (tokenId: number) => void;
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
    return [1, 2, 3, 4].map(id => {
      const uniqueId = colorIndex * 4 + id;
      return { id: uniqueId, color, position: -1 };
    });
  });
export const useGameStore = create<GameState>((set, get) => ({
  gameType: null,
  gameMode: 'pvp',
  winner: null,
  roomId: null,
  localPlayerId: 0,
  ludo: {
    tokens: initialLudoTokens(),
    currentPlayer: 'red',
    diceRoll: null,
    isRolling: false,
    validMoveIds: []
  },
  oware: createInitialOware(),
  setGame: (gameType, gameMode, roomId, playerIdx) => set({
    gameType,
    gameMode,
    roomId: roomId || null,
    localPlayerId: playerIdx ?? 0,
    winner: null,
    ludo: { tokens: initialLudoTokens(), currentPlayer: 'red', diceRoll: null, isRolling: false, validMoveIds: [] },
    oware: createInitialOware()
  }),
  syncWithServer: async () => {
    const { roomId, gameMode } = get();
    if (gameMode !== 'online' || !roomId) return;
    try {
      const res = await fetch(`/api/games/${roomId}`);
      const json = await res.json();
      if (json.success && json.data.updatedAt > (Date.now() - 10000)) {
        // Simple heuristic: Only sync if turn has changed or board state changed
        const serverState = json.data.state;
        set({ 
          ludo: serverState.ludo,
          oware: serverState.oware,
          winner: serverState.winner
        });
      }
    } catch (e) {
      console.error("Sync failed", e);
    }
  },
  rollDice: () => {
    const { ludo, gameMode, roomId, localPlayerId, gameType } = get();
    if (ludo.isRolling || ludo.diceRoll !== null) return;
    // Turn enforcement
    if (gameMode === 'online' && COLORS.indexOf(ludo.currentPlayer) !== localPlayerId) return;
    set((state) => ({ ludo: { ...state.ludo, isRolling: true } }));
    setTimeout(async () => {
      const roll = Math.floor(Math.random() * 6) + 1;
      const validMoves = getValidMoves(get().ludo.tokens, get().ludo.currentPlayer, roll);
      set((state) => ({
        ludo: { ...state.ludo, isRolling: false, diceRoll: roll, validMoveIds: validMoves }
      }));

      if (gameMode === 'pvc' && ludo.currentPlayer !== 'red') {
        setTimeout(async () => {
          const state = get();
          if (state.ludo.diceRoll === null) return;
          const bestTokenId = await getBestLudoMove(state.ludo.tokens, state.ludo.currentPlayer, state.ludo.diceRoll!);
          if (bestTokenId !== null && state.ludo.validMoveIds.includes(bestTokenId)) {
            get().moveLudoToken(bestTokenId);
          } else {
            const nextIdx = (COLORS.indexOf(state.ludo.currentPlayer) + 1) % 4;
            set((s) => ({
              ludo: { ...s.ludo, diceRoll: null, validMoveIds: [], currentPlayer: COLORS[nextIdx] }
            }));
            get().checkCPUTurn();
          }
        }, 1500);
      }

      if (gameMode === 'online' && roomId) {
        await fetch(`/api/games/${roomId}/sync`, {
          method: 'POST',
          body: JSON.stringify({ state: get() })
        });
      }
      if (validMoves.length === 0) {
        setTimeout(async () => {
          const state = get();
          const nextIdx = (COLORS.indexOf(state.ludo.currentPlayer) + 1) % 4;
          set(s => ({
            ludo: { ...s.ludo, diceRoll: null, currentPlayer: COLORS[nextIdx], validMoveIds: [] }
          }));
          const currentState = get();
          if (currentState.gameMode === 'online' && currentState.roomId) {
            await fetch(`/api/games/${currentState.roomId}/sync`, {
              method: 'POST',
              body: JSON.stringify({ state: currentState })
            });
          }
          get().checkCPUTurn();
        }, 1200);
      }
    }, 600);
  },
  moveLudoToken: async (tokenId) => {
    const { ludo, roomId, gameMode, localPlayerId } = get();
    if (!ludo.diceRoll) return;
    // Online turn enforcement
    if (gameMode === 'online' && COLORS.indexOf(ludo.currentPlayer) !== localPlayerId) return;
    const { newTokens, extraTurn } = moveToken(ludo.tokens, tokenId, ludo.diceRoll);
    set(s => ({
      ludo: {
        ...s.ludo,
        tokens: newTokens,
        diceRoll: null,
        validMoveIds: [],
        currentPlayer: extraTurn ? s.ludo.currentPlayer : COLORS[(COLORS.indexOf(s.ludo.currentPlayer) + 1) % 4]
      }
    }));
    get().checkWinner();
    if (gameMode === 'online' && roomId) {
      await fetch(`/api/games/${roomId}/sync`, {
        method: 'POST',
        body: JSON.stringify({ state: get() })
      });
    }
    get().checkCPUTurn();
  },
  playOwarePit: async (index) => {
    const { oware, gameMode, roomId, localPlayerId } = get();
    // Turn enforcement
    if (gameMode === 'online' && oware.currentPlayer !== localPlayerId) return;
    const newState = sowSeeds(oware, index);
    set({ oware: newState });
    get().checkWinner();
    if (gameMode === 'online' && roomId) {
      await fetch(`/api/games/${roomId}/sync`, {
        method: 'POST',
        body: JSON.stringify({ state: get() })
      });
    }
    if (gameMode === 'pvc' && newState.currentPlayer === 1 && !get().winner) {
      const bestMove = await getBestOwareMove(newState);
      if (bestMove !== null) {
        setTimeout(() => get().playOwarePit(bestMove), 1000);
      }
    }
  },
  checkWinner: () => {
    const { gameType, ludo, oware } = get();
    if (gameType === 'ludo') {
      for (const color of COLORS) {
        if (ludo.tokens.filter(t => t.color === color && t.position === 58).length === 4) {
          set({ winner: color.toUpperCase() });
        }
      }
    } else {
      if (oware.captured[0] >= 25) set({ winner: 'PLAYER 1' });
      else if (oware.captured[1] >= 25) set({ winner: 'PLAYER 2' });
    }
  },
  checkCPUTurn: () => {
    const { gameMode, ludo, gameType, winner } = get();
    if (winner) return;
    if (gameType === 'ludo' && gameMode === 'pvc' && ludo.currentPlayer !== 'red') {
      setTimeout(() => get().rollDice(), 1000);
    }
  },
  resetGame: () => set({
    winner: null,
    ludo: { tokens: initialLudoTokens(), currentPlayer: 'red', diceRoll: null, isRolling: false, validMoveIds: [] },
    oware: createInitialOware()
  })
}));