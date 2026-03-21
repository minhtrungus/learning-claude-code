const BEST_KEY = 'planet_merge_best';

let score = 0;

export function resetScore() {
  score = 0;
}

/** @param {number} newLevel - level of the merged planet */
export function addScore(newLevel) {
  score += newLevel * 10;
  const stored = parseInt(localStorage.getItem(BEST_KEY) ?? '0', 10);
  if (score > stored) {
    localStorage.setItem(BEST_KEY, String(score));
  }
}

export function getScore() { return score; }

export function restoreScore(value) {
  score = value;
  const stored = parseInt(localStorage.getItem(BEST_KEY) ?? '0', 10);
  if (score > stored) localStorage.setItem(BEST_KEY, String(score));
}

export function getBest() {
  return parseInt(localStorage.getItem(BEST_KEY) ?? '0', 10);
}
