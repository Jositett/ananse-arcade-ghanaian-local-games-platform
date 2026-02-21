export interface DemoItem {
  id: string;
  name: string;
  value: number;
}
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}
export type GameType = 'ludo' | 'oware';
export interface GameSession {
  id: string;
  gameType: GameType;
  status: 'waiting' | 'playing' | 'finished';
  state: any; // Serialized state from Zustand
  playerCount: number;
  lastActionTimestamp: number;
  updatedAt: number;
}