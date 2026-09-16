// Only the test page imports this fixture. Production always uses logic.mjs.
export * from '../logic.mjs?clear-test-original';
import { goal, move } from '../logic.mjs?clear-test-original';

export function shuffle(n) {
  // One legal move away from completion, for every supported size.
  return move(goal(n), n, n * n - 2);
}
