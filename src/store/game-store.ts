import { create } from 'zustand';
import { createInitialOware, sowSeeds, OwareState } from '@/lib/game-logic/oware-engine';
import { PlayerColor, Token } from '@/lib/game-logic/ludo-engine';
interface GameState {
  gameType: 'ludo' | 'oware' | null;
  ludo: {
    tokens: Token[];
    currentPlayer: PlayerColor;
    diceRoll: number | null;
    isRolling: boolean;
  };
  oware: OwareState;
  // Actions
  setGame: (type: 'ludo' | 'oware' | null) => void;
  // Oware
  playOwarePit: (index: number) => void;
  // Ludo
  rollDice: () => void;
  moveLudoToken: (tokenId: number) => void;
  resetGame: () => void;
}
const initialLudoTokens: Token[] = [
  ...(['red', 'green', 'yellow', 'blue'] as PlayerColor[]).flatMap(color => 
    [1, 2, 3, 4].map(id => ({ id: Math.random(), color, position: -1 }))
  )
];
export const useGameStore = create<GameState>((set) => ({
  gameType: null,
  ludo: {
    tokens: initialLudoTokens,
    currentPlayer: 'red',
    diceRoll: null,
    isRolling: false,
  },
  oware: createInitialOware(),
  setGame: (gameType) => set({ gameType }),
  playOwarePit: (index) => set((state) => ({
    oware: sowSeeds(state.oware, index)
  })),
  rollDice: () => {
    set((state) => ({ ludo: { ...state.ludo, isRolling: true } }));
    setTimeout(() => {
      const roll = Math.floor(Math.random() * 6) + 1;
      set((state) => ({
        ludo: { ...state.ludo, isRolling: false, diceRoll: roll }
      }));
    }, 600);
  },
  moveLudoToken: (tokenId) => {
    // Logic for movement would be integrated here in later steps
  },
  resetGame: () => set({
    ludo: { tokens: initialLudoTokens, currentPlayer: 'red', diceRoll: null, isRolling: false },
    oware: createInitialOware()
  })
}));