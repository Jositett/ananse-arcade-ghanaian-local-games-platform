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
  direction: 'forward' | 'backward';
  isKick: boolean;
  capturedTokenId?: number;
}
export interface GameSession {
  id: string;
  gameType: GameType;
  status: 'playing' | 'finished';
  state: Record<string, any>;
  playerCount: number;
  lastActionTimestamp: number;
  updatedAt: number;
}