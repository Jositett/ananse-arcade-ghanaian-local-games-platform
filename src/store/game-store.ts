import { create } from 'zustand';
import { createInitialOware, sowSeeds, OwareState } from '@/lib/game-logic/oware-engine';
import { PlayerColor, Token, moveToken, getValidMoves } from '@/lib/game-logic/ludo-engine';
import { getBestLudoMove, getBestOwareMove } from '@/lib/game-logic/ai-engine';
interface GameState {
  gameType: 'ludo' | 'oware' | null;
  gameMode: 'pvp' | 'pvc' | 'online';
  winner: string | null;
  roomId: string | null;
  ludo: {
    tokens: Token[];
    currentPlayer: PlayerColor;
    diceRoll: number | null;
    isRolling: boolean;
    validMoveIds: number[];
  };
  oware: OwareState;
  setGame: (type: 'ludo' | 'oware' | null, mode: 'pvp' | 'pvc' | 'online', roomId?: string) => void;
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
  COLORS.flatMap(color =>
    [1, 2, 3, 4].map(id => ({ id: Math.random(), color, position: -1 }))
  );
export const useGameStore = create<GameState>((set, get) => ({
  gameType: null,
  gameMode: 'pvp',
  winner: null,
  roomId: null,
  ludo: {
    tokens: initialLudoTokens(),
    currentPlayer: 'red',
    diceRoll: null,
    isRolling: false,
    validMoveIds: [],
  },
  oware: createInitialOware(),
  setGame: (gameType, gameMode, roomId) => set({ 
    gameType, 
    gameMode, 
    roomId: roomId || null,
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
      if (json.success) {
        set(json.data.state);
      }
    } catch (e) {
      console.error("Sync failed", e);
    }
  },
  rollDice: () => {
    const { ludo, gameMode, roomId } = get();
    if (ludo.isRolling || ludo.diceRoll !== null) return;
    set((state) => ({ ludo: { ...state.ludo, isRolling: true } }));
    setTimeout(async () => {
      const roll = Math.floor(Math.random() * 6) + 1;
      const validMoves = getValidMoves(get().ludo.tokens, get().ludo.currentPlayer, roll);
      set((state) => ({
        ludo: { ...state.ludo, isRolling: false, diceRoll: roll, validMoveIds: validMoves }
      }));
      if (gameMode === 'online' && roomId) {
        await fetch(`/api/games/${roomId}/sync`, {
          method: 'POST',
          body: JSON.stringify({ state: get() })
        });
      }
      if (validMoves.length === 0) {
        setTimeout(() => {
          const nextIdx = (COLORS.indexOf(get().ludo.currentPlayer) + 1) % 4;
          set(s => ({
            ludo: { ...s.ludo, diceRoll: null, currentPlayer: COLORS[nextIdx], validMoveIds: [] }
          }));
          get().checkCPUTurn();
        }, 1000);
      } else if (gameMode === 'pvc' && get().ludo.currentPlayer !== 'red') {
        const bestMove = await getBestLudoMove(get().ludo.tokens, get().ludo.currentPlayer, roll);
        if (bestMove) get().moveLudoToken(bestMove);
      }
    }, 600);
  },
  moveLudoToken: async (tokenId) => {
    const { ludo, roomId, gameMode } = get();
    if (!ludo.diceRoll) return;
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
    const { oware, gameMode, roomId } = get();
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
      if (bestMove !== null) get().playOwarePit(bestMove);
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
      if (oware.captured[0] > 24) set({ winner: 'PLAYER 1' });
      if (oware.captured[1] > 24) set({ winner: 'PLAYER 2' });
    }
  },
  checkCPUTurn: () => {
    const { gameMode, ludo, gameType } = get();
    if (gameType === 'ludo' && gameMode === 'pvc' && ludo.currentPlayer !== 'red' && !get().winner) {
      setTimeout(() => get().rollDice(), 500);
    }
  },
  resetGame: () => set({
    winner: null,
    ludo: { tokens: initialLudoTokens(), currentPlayer: 'red', diceRoll: null, isRolling: false, validMoveIds: [] },
    oware: createInitialOware()
  })
}));