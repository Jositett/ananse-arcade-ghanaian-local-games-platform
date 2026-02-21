import { Token, PlayerColor, getValidMoves } from './ludo-engine';
import { OwareState } from './oware-engine';
export async function getBestLudoMove(tokens: Token[], color: PlayerColor, roll: number): Promise<number | null> {
  await new Promise(r => setTimeout(r, 800)); // Simulate thinking
  const validIds = getValidMoves(tokens, color, roll);
  if (validIds.length === 0) return null;
  // Simple Priority:
  // 1. Enter home
  // 2. Capture (not implemented in simple AI here, just random for now)
  // 3. Move out of base
  // 4. Random
  const baseToken = validIds.find(id => tokens.find(t => t.id === id)?.position === -1);
  if (baseToken && roll === 6) return baseToken;
  return validIds[Math.floor(Math.random() * validIds.length)];
}
export async function getBestOwareMove(state: OwareState): Promise<number | null> {
  await new Promise(r => setTimeout(r, 800));
  const playerPits = state.currentPlayer === 0 ? [0, 1, 2, 3, 4, 5] : [6, 7, 8, 9, 10, 11];
  const validPits = playerPits.filter(i => state.pits[i] > 0);
  if (validPits.length === 0) return null;
  // Greedy: pick pit with most seeds or random
  return validPits.sort((a, b) => state.pits[b] - state.pits[a])[0];
}