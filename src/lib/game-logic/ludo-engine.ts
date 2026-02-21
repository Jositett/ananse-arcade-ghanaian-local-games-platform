import { LudoMove } from '@shared/types';
export type PlayerColor = 'red' | 'green' | 'yellow' | 'blue';
export interface Token {
  id: number;
  color: PlayerColor;
  position: number; // -1: base, 0-51: main path, 52-57: home stretch, 58: home
}
export const GRID_SIZE = 15;
const MAIN_PATH_COORDS: [number, number][] = [
  [6, 1], [6, 2], [6, 3], [6, 4], [6, 5],
  [5, 6], [4, 6], [3, 6], [2, 6], [1, 6], [0, 6], [0, 7], [0, 8],
  [1, 8], [2, 8], [3, 8], [4, 8], [5, 8],
  [6, 9], [6, 10], [6, 11], [6, 12], [6, 13], [6, 14], [7, 14], [8, 14],
  [8, 13], [8, 12], [8, 11], [8, 10], [8, 9],
  [9, 8], [10, 8], [11, 8], [12, 8], [13, 8], [14, 8], [14, 7], [14, 6],
  [13, 6], [12, 6], [11, 6], [10, 6], [9, 6],
  [8, 5], [8, 4], [8, 3], [8, 2], [8, 1], [8, 0], [7, 0], [6, 0]
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
const HOME_CENTER_OFFSETS: Record<PlayerColor, [number, number]> = {
  red: [6.5, 6.5],
  green: [6.5, 7.5],
  yellow: [7.5, 7.5],
  blue: [7.5, 6.5]
};
export const PLAYER_CONFIG = {
  red: { startIdx: 0, entryIdx: 50, color: 'red' },
  green: { startIdx: 13, entryIdx: 11, color: 'green' },
  yellow: { startIdx: 26, entryIdx: 24, color: 'yellow' },
  blue: { startIdx: 39, entryIdx: 37, color: 'blue' }
};
export const SAFE_ZONES = [0, 8, 13, 21, 26, 34, 39, 47];
export function isSafeZone(pos: number): boolean {
  return SAFE_ZONES.includes(pos) || pos >= 52;
}
export function getNewPosition(pos: number, roll: number, color: PlayerColor, direction: 'forward' | 'backward'): number | null {
  if (pos === -1) {
    return (roll === 6 && direction === 'forward') ? PLAYER_CONFIG[color].startIdx : null;
  }
  if (pos === 58) return null;
  let current = pos;
  const config = PLAYER_CONFIG[color];
  for (let i = 0; i < roll; i++) {
    if (direction === 'forward') {
      if (current === config.entryIdx) {
        current = 52;
      } else if (current >= 52) {
        if (current + 1 > 58) return null;
        current++;
      } else {
        current = (current + 1) % 52;
      }
    } else {
      if (current >= 52) return null;
      current = (current - 1 + 52) % 52;
    }
  }
  return current;
}
export function getValidMoves(tokens: Token[], color: PlayerColor, roll: number): LudoMove[] {
  if (roll === null) return [];
  const moves: LudoMove[] = [];
  tokens.filter(t => t.color === color).forEach(t => {
    // 1. Forward Move Logic
    const fwdPos = getNewPosition(t.position, roll, color, 'forward');
    if (fwdPos !== null) {
      moves.push({ tokenId: t.id, targetPos: fwdPos, direction: 'forward', isKick: false });
    }
    // 2. Backward Move Logic (Ghanaian Rule: ONLY if it captures)
    if (t.position >= 0 && t.position <= 51) {
      const bwdPos = getNewPosition(t.position, roll, color, 'backward');
      if (bwdPos !== null && !SAFE_ZONES.includes(bwdPos)) {
        const opponentAtTarget = tokens.find(ot => ot.position === bwdPos && ot.color !== color);
        if (opponentAtTarget) {
          moves.push({ 
            tokenId: t.id, 
            targetPos: bwdPos, 
            direction: 'backward', 
            isKick: true, 
            capturedTokenId: opponentAtTarget.id 
          });
        }
      }
    }
    // 3. Ananse Kick (Capture in home stretch)
    if (t.position >= 52 && t.position < 57) {
      const opponentAhead = tokens.find(ot =>
        ot.color !== color &&
        ot.position === t.position + 2 &&
        ot.position >= 52 && ot.position <= 57
      );
      if (opponentAhead && roll >= 2) {
        moves.push({
          tokenId: t.id,
          targetPos: t.position + 2,
          direction: 'forward',
          isKick: true,
          capturedTokenId: opponentAhead.id
        });
      }
    }
  });
  return moves;
}
export function moveToken(tokens: Token[], move: LudoMove, roll: number): {
  newTokens: Token[],
  captured: boolean,
  extraTurn: boolean
} {
  const targetToken = tokens.find(t => t.id === move.tokenId);
  if (!targetToken) return { newTokens: tokens, captured: false, extraTurn: false };
  let captured = false;
  let extraTurn = roll === 6;
  const newTokens = tokens.map(t => {
    if (t.id === move.tokenId) {
      return { ...t, position: move.targetPos };
    }
    if (move.isKick && t.id === move.capturedTokenId) {
      captured = true;
      extraTurn = true;
      return { ...t, position: -1 };
    }
    const isMainPath = move.targetPos <= 51;
    const isSafe = SAFE_ZONES.includes(move.targetPos);
    if (isMainPath && !isSafe && t.position === move.targetPos && t.color !== targetToken.color) {
      captured = true;
      extraTurn = true;
      return { ...t, position: -1 };
    }
    return t;
  });
  if (move.targetPos === 58) extraTurn = true;
  return { newTokens, captured, extraTurn };
}
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
  if (token.position === 58) {
    return HOME_CENTER_OFFSETS[token.color];
  }
  return [7, 7];
}