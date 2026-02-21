import { Token, PlayerColor, SAFE_ZONES, isCellBlocked } from './ludo-engine';
import { OwareState } from './oware-engine';
import { LudoMove } from '@shared/types';
export async function getBestLudoMove(
  tokens: Token[],
  color: PlayerColor,
  roll: number,
  validMoves: LudoMove[]
): Promise<LudoMove | null> {
  await new Promise(r => setTimeout(r, 800));
  if (validMoves.length === 0) return null;
  // Ghanaian Strategy Priority:
  // 1. Home Stretch Strike (Highest Priority)
  const strikeMove = validMoves.find(m => m.isKick && m.targetPos >= 52);
  if (strikeMove) return strikeMove;
  // 2. Ghanaian Backward Capture
  const bwdCapture = validMoves.find(m => m.direction === 'backward' && m.isKick);
  if (bwdCapture) return bwdCapture;
  // 3. Forward Capture (Main Path)
  const forwardCapture = validMoves.find(m => m.isKick && m.direction === 'forward');
  if (forwardCapture) return forwardCapture;
  // 4. Create a Block (Protection Strategy)
  const blockMove = validMoves.find(m => {
    const tokensOnTarget = tokens.filter(t => t.position === m.targetPos && t.color === color);
    return tokensOnTarget.length === 1; // If 1 exists, moving another there creates a block
  });
  if (blockMove) return blockMove;
  // 5. Exit Base
  const exitMove = validMoves.find(m => tokens.find(t => t.id === m.tokenId)?.position === -1);
  if (exitMove) return exitMove;
  // 6. Overshoot Bounce Capture (Pro-level tactical move)
  const bounceCapture = validMoves.find(m => m.direction === 'bounce' && m.isKick);
  if (bounceCapture) return bounceCapture;
  // 7. Standard Progress
  const fwdMove = validMoves.find(m => m.direction === 'forward');
  return fwdMove || validMoves[0];
}
export async function getBestOwareMove(state: OwareState): Promise<number | null> {
  await new Promise(r => setTimeout(r, 800));
  const playerPits = state.currentPlayer === 0 ? [0, 1, 2, 3, 4, 5] : [6, 7, 8, 9, 10, 11];
  const validPits = playerPits.filter(i => state.pits[i] > 0);
  if (validPits.length === 0) return null;
  return validPits.sort((a, b) => state.pits[b] - state.pits[a])[0];
}