const ACHIEVEMENTS_KEY = 'planet_merge_achievements';

const DEFINITIONS = [
  { id: 'first_merge', name: 'First Merge', desc: 'Merge two planets' },
  { id: 'first_sun', name: 'Solar Power', desc: 'Create a Sun' },
  { id: 'combo_3', name: 'Triple Threat', desc: 'Reach combo x3' },
  { id: 'combo_5', name: 'Chain Reaction', desc: 'Reach combo x5' },
  { id: 'score_1000', name: 'High Scorer', desc: 'Score 1000+ points' },
  { id: 'score_5000', name: 'Master', desc: 'Score 5000+ points' },
];

let unlocked = {};
let toastQueue = [];
let toastTimeout = null;
let currentPlaySound = null;

function load() {
  try {
    const raw = localStorage.getItem(ACHIEVEMENTS_KEY);
    if (raw) unlocked = JSON.parse(raw);
  } catch {
    unlocked = {};
  }
}

function save() {
  localStorage.setItem(ACHIEVEMENTS_KEY, JSON.stringify(unlocked));
}

export function initAchievements() {
  load();
}

export function getAchievements() {
  return DEFINITIONS.map(d => ({
    ...d,
    unlocked: !!unlocked[d.id],
    unlockedAt: unlocked[d.id]?.unlockedAt ?? null,
  }));
}

export function isUnlocked(id) {
  return !!unlocked[id];
}

function unlock(id) {
  if (unlocked[id]) return false;
  unlocked[id] = { unlockedAt: Date.now() };
  save();
  return true;
}

export function checkMerge(level, combo) {
  const newlyUnlocked = [];

  if (unlock('first_merge')) {
    newlyUnlocked.push('first_merge');
  }

  if (level >= 10 && unlock('first_sun')) {
    newlyUnlocked.push('first_sun');
  }

  if (combo >= 3 && unlock('combo_3')) {
    newlyUnlocked.push('combo_3');
  }

  if (combo >= 5 && unlock('combo_5')) {
    newlyUnlocked.push('combo_5');
  }

  return newlyUnlocked;
}

export function checkScore(score) {
  const newlyUnlocked = [];

  if (score >= 1000 && unlock('score_1000')) {
    newlyUnlocked.push('score_1000');
  }

  if (score >= 5000 && unlock('score_5000')) {
    newlyUnlocked.push('score_5000');
  }

  return newlyUnlocked;
}

export function queueToasts(ids, playSound) {
  currentPlaySound = playSound;
  toastQueue.push(...ids);
  processToastQueue();
}

function processToastQueue() {
  if (toastTimeout || toastQueue.length === 0) return;

  const id = toastQueue.shift();
  const def = DEFINITIONS.find(d => d.id === id);
  if (!def) {
    processToastQueue();
    return;
  }

  showToast(def.name);
  if (currentPlaySound) currentPlaySound();
}

function showToast(name) {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = `🏆 ${name}`;
  container.appendChild(toast);

  toastTimeout = setTimeout(() => {
    toast.remove();
    toastTimeout = null;
    processToastQueue(currentPlaySound);
  }, 3000);
}

export function renderAchievementList(container) {
  container.innerHTML = '';
  const achievements = getAchievements();

  for (const a of achievements) {
    const li = document.createElement('li');
    li.className = a.unlocked ? 'unlocked' : 'locked';
    li.innerHTML = `
      <span class="icon">${a.unlocked ? '✓' : '🔒'}</span>
      <span class="name">${a.name}</span>
      <span class="desc">${a.desc}</span>
    `;
    container.appendChild(li);
  }
}
