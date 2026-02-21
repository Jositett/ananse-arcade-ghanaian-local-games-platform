export interface OwareState {
  pits: number[]; // 0-5: Player 1, 6-11: Player 2
  captured: [number, number];
  currentPlayer: 0 | 1;
}
export function createInitialOware(): OwareState {
  return {
    pits: Array(12).fill(4),
    captured: [0, 0],
    currentPlayer: 0,
  };
}
export function getValidOwareMoves(state: OwareState): number[] {
  const playerPits = state.currentPlayer === 0 ? [0, 1, 2, 3, 4, 5] : [6, 7, 8, 9, 10, 11];
  const opponentPits = state.currentPlayer === 0 ? [6, 7, 8, 9, 10, 11] : [0, 1, 2, 3, 4, 5];
  const opponentSeeds = opponentPits.reduce((sum, i) => sum + state.pits[i], 0);
  const possiblePits = playerPits.filter(i => state.pits[i] > 0);
  // Feeding Rule: If opponent has no seeds, player MUST play a move that gives them seeds if possible
  if (opponentSeeds === 0) {
    const feedingMoves = possiblePits.filter(pitIdx => {
      const seeds = state.pits[pitIdx];
      const distanceToOpponent = state.currentPlayer === 0 ? (6 - pitIdx) : (12 - pitIdx);
      return seeds >= distanceToOpponent;
    });
    return feedingMoves.length > 0 ? feedingMoves : possiblePits;
  }
  return possiblePits;
}
export function sowSeeds(state: OwareState, pitIndex: number): OwareState {
  const newState = { 
    ...state, 
    pits: [...state.pits], 
    captured: [...state.captured] as [number, number] 
  };
  let seeds = newState.pits[pitIndex];
  if (seeds === 0) return state;
  newState.pits[pitIndex] = 0;
  let currentPos = pitIndex;
  // Distribution phase
  while (seeds > 0) {
    currentPos = (currentPos + 1) % 12;
    // Abapa Rule: Skip the starting pit if we lap the board (12+ seeds)
    if (currentPos === pitIndex) continue;
    newState.pits[currentPos]++;
    seeds--;
  }
  // Capture logic (Abapa Rules: Backward Chain)
  const isOpponentPit = newState.currentPlayer === 0 ? currentPos >= 6 : currentPos < 6;
  if (isOpponentPit) {
    let capturedThisTurn = 0;
    const tempPits = [...newState.pits];
    let checkPos = currentPos;
    const oppRange = newState.currentPlayer === 0 ? [6, 7, 8, 9, 10, 11] : [0, 1, 2, 3, 4, 5];
    while (oppRange.includes(checkPos) && (tempPits[checkPos] === 2 || tempPits[checkPos] === 3)) {
      capturedThisTurn += tempPits[checkPos];
      tempPits[checkPos] = 0;
      // Move backwards (counter-clockwise reverse)
      checkPos = (checkPos - 1 + 12) % 12;
    }
    // Grand Slam Rule: If capture leaves opponent with NO seeds, the capture is voided
    const remainingOpponentSeeds = oppRange.reduce((sum, i) => sum + tempPits[i], 0);
    if (remainingOpponentSeeds > 0 || capturedThisTurn === 0) {
      newState.pits = tempPits;
      newState.captured[newState.currentPlayer] += capturedThisTurn;
    }
  }
  newState.currentPlayer = newState.currentPlayer === 0 ? 1 : 0;
  return newState;
}