import { goal, neighbors, move, analyze, solved, shuffle, challenge } from './logic.mjs';

const $ = id => document.getElementById(id);
let n = 3, board, initial, steps = 0, history = [], previous = null, mathOn = false, mode = 'normal';
const parityName = value => value % 2 ? '奇' : '偶';
const badge = value => `<span class="badge ${value % 2 ? 'odd' : 'even'}">${value % 2 ? '奇数' : '偶数'}</span>`;

function start(next, nextMode = mode) {
  board = [...next]; initial = [...next]; steps = 0; mode = nextMode; previous = null;
  history = [{ step: 0, ...analyze(board, n) }];
  buildBoard(); render();
}

function buildBoard() {
  const container = $('board');
  container.replaceChildren();
  container.style.setProperty('--n', n);
  container.dataset.size = n;
  container.setAttribute('aria-label', `${n} × ${n} のパズル盤面`);
  for (let value = 1; value <= n * n; value++) {
    const tile = document.createElement(value === n * n ? 'div' : 'button');
    tile.className = value === n * n ? 'tile blank' : 'tile';
    tile.id = `tile-${value}`;
    if (value === n * n) {
      tile.innerHTML = `<span class="blank-number">${value}</span>`;
    } else {
      tile.textContent = value;
      tile.addEventListener('click', () => play(board.indexOf(value)));
    }
    container.append(tile);
  }
}

function play(index) {
  const next = move(board, n, index);
  if (!next) return;
  previous = analyze(board, n); board = next; steps++;
  history.push({ step: steps, ...analyze(board, n) });
  history = history.slice(-12);
  render();
  if (mathOn) {
    for (const id of ['inversions-change', 'position-change', 'invariant-change']) {
      const element = $(id);
      element.classList.remove('flash');
      void element.offsetWidth;
      element.classList.add('flash');
    }
  }
}

function render() {
  const legal = neighbors(board, n);
  board.forEach((value, index) => {
    const tile = $(`tile-${value}`);
    tile.style.setProperty('--x', index % n);
    tile.style.setProperty('--y', Math.floor(index / n));
    tile.setAttribute('aria-label', `${value === n * n ? '空白' : value}：${Math.floor(index / n) + 1}行${index % n + 1}列`);
    if (value !== n * n) {
      tile.dataset.movable = legal.includes(index);
      tile.setAttribute('aria-disabled', String(!legal.includes(index)));
    }
  });
  $('moves').textContent = steps;
  $('mode-label').textContent = mode === 'challenge' ? 'チャレンジ' : 'フリープレイ';
  // Recheck the whole board after every legal move, independently of math mode.
  const isComplete = solved(board);
  $('clear-title').hidden = !isComplete;
  $('status-message').textContent = isComplete
    ? `おめでとう！ ${steps}手で完成しました`
    : '空白のとなりのタイルをタップ';
  $('status').classList.toggle('clear', isComplete);
  $('restart').textContent = isComplete ? 'もう一度' : '最初から';
  if (mathOn) renderMath();
}

function renderMath() {
  const current = analyze(board, n), target = analyze(goal(n), n);
  $('blank-value').textContent = n * n;
  $('permutation').innerHTML = board.map(value => `<span${value === n * n ? ' class="blank-chip" title="空白"' : ''}>${value}</span>`).join('');
  $('inversions').textContent = current.inversions;
  $('inversions-parity').innerHTML = badge(current.inversions);
  $('position').textContent = `(${current.r}, ${current.c})`;
  $('position-parity').innerHTML = badge(current.positionSum);
  $('position-sum').textContent = `r + c = ${current.positionSum}`;
  $('current-parity').innerHTML = badge(current.parity);
  $('total-equation').textContent = `${current.inversions} + ${current.r} + ${current.c} = ${current.total} → 2で割った余り ${current.parity}`;
  $('inversions-change').textContent = previous ? `${previous.inversions} → ${current.inversions} ｜ ${parityName(previous.inversions)} → ${parityName(current.inversions)}：反転` : '1手動かして変化を観察';
  $('position-change').textContent = previous ? `${previous.positionSum} → ${current.positionSum} ｜ ${parityName(previous.positionSum)} → ${parityName(current.positionSum)}：反転` : '行 + 列の偶奇に注目';
  $('invariant-change').textContent = previous ? `不変量：${parityName(previous.parity)} → ${parityName(current.parity)}　変わらない！` : '動かしても、この偶奇は変わりません。';
  $('goal-parity').innerHTML = `0 ${badge(target.parity)}`;
  $('compare-current').innerHTML = `${current.parity} ${badge(current.parity)}`;
  const same = target.parity === current.parity;
  $('compare-sign').textContent = same ? '＝' : '≠';
  $('comparison-note').textContent = same ? 'ゴールと同じ偶奇。合法手を動かしても、この関係は変わりません。' : 'ゴールと偶奇が違います。合法手では P が変わらないため、ゴールには到達できません。';
  $('comparison-note').classList.toggle('different', !same);
  $('history-body').innerHTML = history.map(item => `<tr><td>${item.step}</td><td>${item.inversions}</td><td>(${item.r}, ${item.c})</td><td>${item.positionSum}</td><td>${item.total}</td><td>${badge(item.parity)}</td></tr>`).join('');
}

document.querySelectorAll('.size-select button').forEach(button => button.addEventListener('click', () => {
  n = Number(button.dataset.size);
  document.querySelectorAll('.size-select button').forEach(item => item.setAttribute('aria-pressed', String(item === button)));
  start(mode === 'challenge' ? challenge(n) : shuffle(n));
}));
$('shuffle').addEventListener('click', () => start(shuffle(n), 'normal'));
$('restart').addEventListener('click', () => start(initial));
$('challenge').addEventListener('click', () => start(challenge(n), 'challenge'));
$('math-toggle').addEventListener('click', () => {
  mathOn = !mathOn;
  $('math-toggle').setAttribute('aria-pressed', String(mathOn));
  $('toggle-state').textContent = mathOn ? 'ON' : 'OFF';
  $('math-content').hidden = !mathOn;
  $('math-placeholder').hidden = mathOn;
  $('workspace').classList.toggle('math-on', mathOn);
  if (mathOn) renderMath();
});
document.addEventListener('keydown', event => {
  if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
  if (event.target.closest('input, textarea, select, [contenteditable="true"]')) return;
  const blank = board.indexOf(n * n);
  const destinations = { ArrowUp: blank - n, ArrowDown: blank + n, ArrowLeft: blank % n > 0 ? blank - 1 : -1, ArrowRight: blank % n < n - 1 ? blank + 1 : -1 };
  if (!(event.key in destinations)) return;
  event.preventDefault();
  play(destinations[event.key]);
});
start(shuffle(n));
