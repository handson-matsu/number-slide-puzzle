export function goal(n) {
  return Array.from({ length: n * n }, (_, i) => i + 1);
}

export function neighbors(board, n) {
  const blank = board.indexOf(n * n);
  const r = Math.floor(blank / n), c = blank % n;
  return [r > 0 ? blank - n : -1, r < n - 1 ? blank + n : -1,
    c > 0 ? blank - 1 : -1, c < n - 1 ? blank + 1 : -1].filter(i => i >= 0);
}

export function move(board, n, index) {
  if (!neighbors(board, n).includes(index)) return null;
  const next = [...board], blank = board.indexOf(n * n);
  [next[index], next[blank]] = [next[blank], next[index]];
  return next;
}

export function analyze(board, n) {
  let inversions = 0;
  for (let i = 0; i < board.length; i++) {
    for (let j = i + 1; j < board.length; j++) {
      if (board[i] > board[j]) inversions++;
    }
  }
  const blank = board.indexOf(n * n);
  const r = Math.floor(blank / n) + 1, c = blank % n + 1;
  const positionSum = r + c, total = inversions + positionSum;
  return { inversions, r, c, positionSum, total, parity: total % 2 };
}

export function solved(board) {
  return board.every((value, i) => value === i + 1);
}

export function shuffle(n, random = Math.random) {
  let board = goal(n), previousBlank = -1;
  for (let i = 0; i < n * n * 80; i++) {
    const choices = neighbors(board, n).filter(index => index !== previousBlank);
    const index = choices[Math.floor(random() * choices.length)];
    previousBlank = board.indexOf(n * n);
    board = move(board, n, index);
  }
  if (solved(board)) board = move(board, n, neighbors(board, n)[0]);
  return board;
}

export function challenge(n) {
  const board = goal(n);
  [board[n * n - 3], board[n * n - 2]] = [board[n * n - 2], board[n * n - 3]];
  return board;
}
