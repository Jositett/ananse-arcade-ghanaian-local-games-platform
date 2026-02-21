export type PlayerColor = 'red' | 'green' | 'yellow' | 'blue';
export interface Token {
  id: number;
  color: PlayerColor;
  position: number; // -1: base, 0-51: main path, 52-57: home stretch, 58: home
}
export const PLAYER_CONFIG = {
  red: { start: 0, homeEntry: 50, baseId: 'R' },
  green: { start: 13, homeEntry: 11, baseId: 'G' },
  yellow: { start: 26, homeEntry: 24, baseId: 'Y' },
  blue: { start: 39, homeEntry: 37, baseId: 'B' },
};
export function getGridCoords(pos: number, color: PlayerColor): [number, number] {
  // Simplification for the path mapping
  // Real Ludo uses a complex mapping of 0-51 to grid [x, y]
  // This would return [row, col]
  return [0, 0]; 
}
export function isTokenInBase(token: Token) {
  return token.position === -1;
}
export function isTokenHome(token: Token) {
  return token.position === 58;
}
export function calculateNewPosition(current: number, roll: number): number {
  if (current === -1) return roll === 6 ? 0 : -1;
  const next = current + roll;
  if (next > 58) return current; // Must land exactly
  return next;
}