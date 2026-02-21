export interface DemoItem {
  id: string;
  name: string;
  value: number;
}
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}
export type GameType = 'ludo' | 'oware';
export interface LudoMove {
  tokenId: number;
  targetPos: number;
  direction: 'forward' | 'backward' | 'bounce';
  isKick: boolean;
  capturedTokenId?: number;
}
export interface GameEvent {
  id: string;
  type: 'roll' | 'move' | 'kick' | 'capture' | 'home' | 'turn_skip' | 'win' | 'sow';
  player: string;
  message: string;
  timestamp: number;
}
export interface LudoState {
  tokens: {
    id: number;
    color: 'red' | 'green' | 'yellow' | 'blue';
    position: number;
  }[];
  currentPlayer: 'red' | 'green' | 'yellow' | 'blue';
  diceRoll: number | null;
  isRolling: boolean;
  validMoves: LudoMove[];
  consecutiveSixes: number;
  lastMove?: LudoMove;
}
export interface OwareState {
  pits: number[];
  captured: [number, number];
  currentPlayer: 0 | 1;
  lastPitPlayed?: number;
}
export interface GameSession {
  id: string;
  gameType: GameType;
  status: 'playing' | 'finished';
  state: {
    ludo: LudoState;
    oware: OwareState;
    winner: string | null;
    battleLog: GameEvent[];
  };
  playerCount: number;
  lastActionTimestamp: number;
  updatedAt: number;
  serverTime?: number;
}