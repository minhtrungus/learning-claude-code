const BEST_KEY = 'planet_merge_best';

let score = 0;
let combo = 1;
let lastMergeTime = 0;
const COMBO_WINDOW = 2000;
const MAX_COMBO = 10;

export function resetScore() {
  score = 0;
  combo = 1;
  lastMergeTime = 0;
}

export function resetCombo() {
  combo = 1;
  lastMergeTime = 0;
}

export function getCombo() {
  return combo;
}

export function addScore(newLevel) {
  score += newLevel * 10;
  updateBest();
}

export function addMerge(level, timestamp) {
  if (timestamp - lastMergeTime < COMBO_WINDOW && combo < MAX_COMBO) {
    combo++;
  } else if (timestamp - lastMergeTime >= COMBO_WINDOW) {
    combo = 1;
  }
  lastMergeTime = timestamp;

  const points = level * 10 * combo;
  score += points;
  updateBest();

  return { points, combo };
}

function updateBest() {
  const stored = parseInt(localStorage.getItem(BEST_KEY) ?? '0', 10);
  if (score > stored) {
    localStorage.setItem(BEST_KEY, String(score));
  }
}

export function getScore() { return score; }

export function restoreScore(value) {
  score = value;
  updateBest();
}

export function getBest() {
  return parseInt(localStorage.getItem(BEST_KEY) ?? '0', 10);
}
