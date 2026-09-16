import test from 'node:test';
import assert from 'node:assert/strict';
import { goal, neighbors, move, analyze, solved, shuffle, challenge } from './logic.mjs';

function randomGenerator(seed) {
  return () => ((seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0) / 2 ** 32);
}

test('転倒数は空白を含めて数え、座標は1から始まる', () => {
  assert.deepEqual(analyze([1, 2, 3, 4, 5, 6, 7, 9, 8], 3),
    { inversions: 1, r: 3, c: 2, positionSum: 5, total: 6, parity: 0 });
  assert.deepEqual(analyze([9, 8, 7, 6, 5, 4, 3, 2, 1], 3),
    { inversions: 36, r: 1, c: 1, positionSum: 2, total: 38, parity: 0 });
});

for (const n of [3, 4, 5]) {
  test(`${n}×${n}: ゴール、隣接判定、無効な移動`, () => {
    const board = goal(n);
    assert.equal(solved(board), true);
    assert.equal(analyze(board, n).inversions, 0);
    assert.equal(analyze(board, n).parity, 0);
    assert.deepEqual(neighbors(board, n), [n * n - 1 - n, n * n - 2]);
    assert.equal(move(board, n, 0), null);
    assert.equal(move(board, n, -1), null);
    assert.equal(move(board, n, n * n - 1), null);
    const next = move(board, n, n * n - 2);
    assert.deepEqual(board, goal(n));
    assert.deepEqual(move(next, n, n * n - 1), board);
    const edge = [...board];
    [edge[n], edge[n * n - 1]] = [edge[n * n - 1], edge[n]];
    assert.equal(move(edge, n, n - 1), null, '行の境界をまたいで横移動しない');
  });

  test(`${n}×${n}: 通常・チャレンジの各10000手で偶奇反転と不変量を検証`, () => {
    const random = randomGenerator(42 + n);
    for (const first of [goal(n), challenge(n)]) {
      let board = first;
      const parity = analyze(board, n).parity;
      for (let step = 0; step < 10000; step++) {
        const choices = neighbors(board, n), before = analyze(board, n);
        board = move(board, n, choices[Math.floor(random() * choices.length)]);
        const after = analyze(board, n);
        assert.notEqual(after.inversions % 2, before.inversions % 2);
        assert.notEqual(after.positionSum % 2, before.positionSum % 2);
        assert.equal(Math.abs(after.r - before.r) + Math.abs(after.c - before.c), 1);
        assert.equal(after.parity, parity);
      }
    }
  });

  test(`${n}×${n}: 100回のシャッフルはゴールと同じパリティ`, () => {
    const random = randomGenerator(200 + n);
    for (let i = 0; i < 100; i++) {
      const board = shuffle(n, random);
      assert.deepEqual([...board].sort((a, b) => a - b), goal(n));
      assert.equal(analyze(board, n).parity, 0);
      assert.equal(solved(board), false);
    }
  });

  test(`${n}×${n}: チャレンジは最後の数字2枚だけが異なり、ゴールと異なるパリティ`, () => {
    const board = challenge(n), target = goal(n);
    assert.deepEqual(board.slice(0, -3), target.slice(0, -3));
    assert.deepEqual(board.slice(-3), [n * n - 1, n * n - 2, n * n]);
    assert.equal(analyze(board, n).inversions, 1);
    assert.equal(analyze(board, n).parity, 1);
  });
}
