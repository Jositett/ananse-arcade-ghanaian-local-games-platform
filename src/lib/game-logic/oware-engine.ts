export interface OwareState {
  pits: number[]; // 12 pits total, 0-5 (Player 1), 6-11 (Player 2)
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
export function sowSeeds(state: OwareState, pitIndex: number): OwareState {
  const newState = { ...state, pits: [...state.pits], captured: [...state.captured] as [number, number] };
  let seeds = newState.pits[pitIndex];
  if (seeds === 0) return state;
  newState.pits[pitIndex] = 0;
  let currentPos = pitIndex;
  while (seeds > 0) {
    currentPos = (currentPos + 1) % 12;
    if (currentPos === pitIndex) continue; // Skip original pit
    newState.pits[currentPos]++;
    seeds--;
  }
  // Capture logic (Abapa Rules)
  // If last seed fell in opponent's pit and total is 2 or 3, capture
  const isOpponentPit = newState.currentPlayer === 0 ? currentPos >= 6 : currentPos < 6;
  if (isOpponentPit) {
    let checkPos = currentPos;
    while (
      (newState.currentPlayer === 0 ? checkPos >= 6 : checkPos < 6) &&
      (newState.pits[checkPos] === 2 || newState.pits[checkPos] === 3)
    ) {
      newState.captured[newState.currentPlayer] += newState.pits[checkPos];
      newState.pits[checkPos] = 0;
      // Continue capturing backwards if the rule applies
      checkPos = (checkPos - 1 + 12) % 12;
    }
  }
  newState.currentPlayer = newState.currentPlayer === 0 ? 1 : 0;
  return newState;
}