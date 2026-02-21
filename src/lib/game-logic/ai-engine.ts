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
  // 1. Ananse Kick (Capture in home stretch)
  const kickMove = validMoves.find(m => m.isKick);
  if (kickMove) return kickMove;
  // 2. Capture (Standard)
  const captureMove = validMoves.find(m => {
    const targetToken = tokens.find(t => t.position === m.targetPos && t.color !== color && !SAFE_ZONES.includes(m.targetPos));
    return !!targetToken;
  });
  if (captureMove) return captureMove;
  // 3. Exit Base
  const exitMove = validMoves.find(m => tokens.find(t => t.id === m.tokenId)?.position === -1);
  if (exitMove) return exitMove;
  // 4. Backward Strategy (if it lands on a safe zone)
  const bwdSafeMove = validMoves.find(m => m.direction === 'backward' && SAFE_ZONES.includes(m.targetPos));
  if (bwdSafeMove) return bwdSafeMove;
  // 5. Progress forward
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