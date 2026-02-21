import { Token, PlayerColor, SAFE_ZONES, isCellBlocked } from './ludo-engine';
import { OwareState, getValidOwareMoves, sowSeeds } from './oware-engine';
import { LudoMove } from '@shared/types';
export async function getBestLudoMove(
  tokens: Token[],
  color: PlayerColor,
  roll: number,
  validMoves: LudoMove[]
): Promise<LudoMove | null> {
  await new Promise(r => setTimeout(r, 800));
  if (validMoves.length === 0) return null;
  const strikeMove = validMoves.find(m => m.isKick && m.targetPos >= 52);
  if (strikeMove) return strikeMove;
  const bwdCapture = validMoves.find(m => m.direction === 'backward' && m.isKick);
  if (bwdCapture) return bwdCapture;
  const forwardCapture = validMoves.find(m => m.isKick && m.direction === 'forward');
  if (forwardCapture) return forwardCapture;
  const blockMove = validMoves.find(m => {
    const tokensOnTarget = tokens.filter(t => t.position === m.targetPos && t.color === color);
    return tokensOnTarget.length === 1;
  });
  if (blockMove) return blockMove;
  const exitMove = validMoves.find(m => tokens.find(t => t.id === m.tokenId)?.position === -1);
  if (exitMove) return exitMove;
  const bounceCapture = validMoves.find(m => m.direction === 'bounce' && m.isKick);
  if (bounceCapture) return bounceCapture;
  const fwdMove = validMoves.find(m => m.direction === 'forward');
  return fwdMove || validMoves[0];
}
export async function getBestOwareMove(state: OwareState): Promise<number | null> {
  await new Promise(r => setTimeout(r, 800));
  const validPits = getValidOwareMoves(state);
  if (validPits.length === 0) return null;
  // Simple heuristic: Maximize immediate capture chain
  let bestPit = validPits[0];
  let maxCapture = -1;
  for (const pitIdx of validPits) {
    const simulation = sowSeeds(state, pitIdx);
    const captureCount = simulation.captured[state.currentPlayer] - state.captured[state.currentPlayer];
    // Favor captures, but also consider leaving the opponent with fewer seeds to capture back
    const opponentPits = state.currentPlayer === 0 ? [6, 7, 8, 9, 10, 11] : [0, 1, 2, 3, 4, 5];
    const opponentStrength = opponentPits.reduce((sum, i) => sum + simulation.pits[i], 0);
    const score = captureCount * 10 + (100 - opponentStrength); // Rough weight
    if (score > maxCapture) {
      maxCapture = score;
      bestPit = pitIdx;
    }
  }
  return bestPit;
}