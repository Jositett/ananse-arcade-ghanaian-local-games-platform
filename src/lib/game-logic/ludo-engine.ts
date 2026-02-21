export type PlayerColor = 'red' | 'green' | 'yellow' | 'blue';
export interface Token {
  id: number;
  color: PlayerColor;
  position: number; // -1: base, 0-51: main path, 52-57: home stretch, 58: home
}
// 15x15 Grid Layout:
// Row 0-5, Col 0-5: Red Base
// Row 0-5, Col 9-14: Green Base
// Row 9-14, Col 0-5: Blue Base
// Row 9-14, Col 9-14: Yellow Base
// Center 3x3 (6,6 to 8,8): Home Goal
export const GRID_SIZE = 15;
// Coordinate Mapping for the Main Path (52 cells)
// This is the common loop starting from Red's exit point
const MAIN_PATH_COORDS: [number, number][] = [
  [6, 1], [6, 2], [6, 3], [6, 4], [6, 5], // Red exit to Green corner
  [5, 6], [4, 6], [3, 6], [2, 6], [1, 6], [0, 6], [0, 7], [0, 8], // Top Green stretch
  [1, 8], [2, 8], [3, 8], [4, 8], [5, 8], // Down to Green corner
  [6, 9], [6, 10], [6, 11], [6, 12], [6, 13], [6, 14], [7, 14], [8, 14], // Right Yellow stretch
  [8, 13], [8, 12], [8, 11], [8, 10], [8, 9], // Left to Yellow corner
  [9, 8], [10, 8], [11, 8], [12, 8], [13, 8], [14, 8], [14, 7], [14, 6], // Bottom Blue stretch
  [13, 6], [12, 6], [11, 6], [10, 6], [9, 6], // Up to Blue corner
  [8, 5], [8, 4], [8, 3], [8, 2], [8, 1], [8, 0], [7, 0], [6, 0] // Left Red stretch
];
const HOME_STRETCH_COORDS: Record<PlayerColor, [number, number][]> = {
  red: [[7, 1], [7, 2], [7, 3], [7, 4], [7, 5]],
  green: [[1, 7], [2, 7], [3, 7], [4, 7], [5, 7]],
  yellow: [[7, 13], [7, 12], [7, 11], [7, 10], [7, 9]],
  blue: [[13, 7], [12, 7], [11, 7], [10, 7], [9, 7]]
};
const BASE_COORDS: Record<PlayerColor, [number, number][]> = {
  red: [[1, 1], [1, 4], [4, 1], [4, 4]],
  green: [[1, 10], [1, 13], [4, 10], [4, 13]],
  yellow: [[10, 10], [10, 13], [13, 10], [13, 13]],
  blue: [[10, 1], [10, 4], [13, 1], [13, 4]]
};
export const PLAYER_CONFIG = {
  red: { startIdx: 0, entryIdx: 50, color: 'red' },
  green: { startIdx: 13, entryIdx: 11, color: 'green' },
  yellow: { startIdx: 26, entryIdx: 24, color: 'yellow' },
  blue: { startIdx: 39, entryIdx: 37, color: 'blue' }
};
export const SAFE_ZONES = [0, 8, 13, 21, 26, 34, 39, 47];
export function getGridCoords(token: Token, tokenIdxInBase: number): [number, number] {
  if (token.position === -1) {
    return BASE_COORDS[token.color][tokenIdxInBase];
  }
  if (token.position >= 0 && token.position <= 51) {
    return MAIN_PATH_COORDS[token.position];
  }
  if (token.position >= 52 && token.position <= 57) {
    const stretchIdx = token.position - 52;
    return HOME_STRETCH_COORDS[token.color][stretchIdx] || [7, 7];
  }
  return [7, 7]; // Home center
}
export function getValidMoves(tokens: Token[], color: PlayerColor, roll: number): number[] {
  if (roll === null) return [];
  return tokens
    .filter(t => t.color === color)
    .filter(t => {
      if (t.position === -1) return roll === 6;
      if (t.position === 58) return false;
      const config = PLAYER_CONFIG[color];
      const distToHome = 58 - t.position;
      if (roll > distToHome) return false;
      return true;
    })
    .map(t => t.id);
}
export function moveToken(tokens: Token[], tokenId: number, roll: number): { 
  newTokens: Token[], 
  captured: boolean,
  extraTurn: boolean 
} {
  let captured = false;
  let extraTurn = roll === 6;
  const targetToken = tokens.find(t => t.id === tokenId);
  if (!targetToken) return { newTokens: tokens, captured, extraTurn };
  const colorConfig = PLAYER_CONFIG[targetToken.color];
  let nextPos = targetToken.position;
  if (targetToken.position === -1) {
    nextPos = colorConfig.startIdx;
  } else {
    // Logic for pathing from main to home stretch
    for (let i = 0; i < roll; i++) {
      if (nextPos === colorConfig.entryIdx) {
        nextPos = 52; // Enter home stretch
      } else if (nextPos >= 52) {
        nextPos++;
      } else {
        nextPos = (nextPos + 1) % 52;
      }
    }
  }
  const newTokens = tokens.map(t => {
    if (t.id === tokenId) return { ...t, position: nextPos };
    // Capture logic: Only on main path (0-51) and not in safe zones
    if (
      nextPos <= 51 && 
      !SAFE_ZONES.includes(nextPos) && 
      t.position === nextPos && 
      t.color !== targetToken.color
    ) {
      captured = true;
      extraTurn = true;
      return { ...t, position: -1 };
    }
    return t;
  });
  if (nextPos === 58) extraTurn = true;
  return { newTokens, captured, extraTurn };
}