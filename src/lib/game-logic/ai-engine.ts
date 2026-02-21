import { Token, PlayerColor, SAFE_ZONES } from './ludo-engine';
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
  // 3. Forward Capture on main path
  const forwardCapture = validMoves.find(m => {
    const isMainPath = m.targetPos <= 51;
    const targetToken = tokens.find(t => t.position === m.targetPos && t.color !== color && !SAFE_ZONES.includes(m.targetPos));
    return isMainPath && !!targetToken;
  });
  if (forwardCapture) return forwardCapture;
  // 4. Exit Base
  const exitMove = validMoves.find(m => tokens.find(t => t.id === m.tokenId)?.position === -1);
  if (exitMove) return exitMove;
  // 5. Entering Home Stretch
  const homeStretchEntry = validMoves.find(m => m.targetPos >= 52 && m.targetPos < 58);
  if (homeStretchEntry) return homeStretchEntry;
  // 6. Standard Progress
  const fwdMove = validMoves.find(m => m.direction === 'forward');
  return fwdMove || validMoves[0];
}
export async function getBestOwareMove(state: OwareState): Promise<number | null> {
  await new Promise(r => setTimeout(r, 800));
  const playerPits = state.currentPlayer === 0 ? [0, 1, 2, 3, 4, 5] : [6, 7, 8, 9, 10, 11];
  const validPits = playerPits.filter(i => state.pits[i] > 0);
  if (validPits.length === 0) return null;
  // Simple AI: Play the pit with most seeds to maximize sowing
  return validPits.sort((a, b) => state.pits[b] - state.pits[a])[0];
}