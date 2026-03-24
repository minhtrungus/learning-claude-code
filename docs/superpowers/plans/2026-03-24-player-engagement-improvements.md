# Player Engagement Improvements Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add sound effects, combo system, particle effects, and achievements to increase player engagement.

**Architecture:** Four new modules (audio.js, particles.js, achievements.js, combo in score.js) integrated into existing collision/render pipeline. Web Audio API for sounds, custom particle system, localStorage for persistence.

**Tech Stack:** Vanilla JS ES Modules, Web Audio API, localStorage

---

## File Map

| File | Responsibility |
|------|---------------|
| `src/audio.js` | Web Audio sound generation, mute toggle |
| `src/particles.js` | Particle spawn, update, render |
| `src/achievements.js` | Achievement definitions, unlock tracking, toast/modal |
| `src/score.js` | Add combo tracking (modified) |
| `src/collision.js` | Trigger audio, particles, achievements on merge (modified) |
| `src/ui.js` | Render particles, combo display, toast (modified) |
| `src/main.js` | Init new modules, wire achievements (modified) |
| `index.html` | Add mute button, trophy button, toast container (modified) |
| `style.css` | Style new UI elements (modified) |
| `tests/test.js` | Add tests for score combo logic (modified) |

---

## Task 1: Sound Effects Module

**Files:**
- Create: `src/audio.js`

- [ ] **Step 1: Create `src/audio.js`**

```js
const MUTE_KEY = 'planet_merge_muted';

let audioCtx = null;
let muted = localStorage.getItem(MUTE_KEY) === 'true';

function getCtx() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  return audioCtx;
}

export function initAudio() {
  getCtx();
}

function playTone(freq, duration, type = 'sine', volume = 0.3) {
  if (muted) return;
  const ctx = getCtx();
  if (ctx.state === 'suspended') ctx.resume();

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = type;
  osc.frequency.setValueAtTime(freq, ctx.currentTime);

  gain.gain.setValueAtTime(volume, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + duration);
}

export function playDrop() {
  playTone(150, 0.1, 'sine', 0.2);
}

export function playMerge(level) {
  const freq = 200 + level * 50;
  playTone(freq, 0.2, 'sine', 0.25);
}

export function playCombo(comboLevel) {
  const freq = 600 + comboLevel * 100;
  playTone(freq, 0.15, 'sine', 0.2);
}

export function playGameOver() {
  if (muted) return;
  const ctx = getCtx();
  if (ctx.state === 'suspended') ctx.resume();

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(400, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.5);

  gain.gain.setValueAtTime(0.3, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + 0.5);
}

export function playAchievement() {
  if (muted) return;
  const ctx = getCtx();
  if (ctx.state === 'suspended') ctx.resume();

  const notes = [523, 659, 784]; // C5, E5, G5
  notes.forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.1);

    gain.gain.setValueAtTime(0.25, ctx.currentTime + i * 0.1);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + i * 0.1 + 0.15);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(ctx.currentTime + i * 0.1);
    osc.stop(ctx.currentTime + i * 0.1 + 0.15);
  });
}

export function isMuted() {
  return muted;
}

export function toggleMute() {
  muted = !muted;
  localStorage.setItem(MUTE_KEY, String(muted));
  return muted;
}
```

- [ ] **Step 2: Commit**

```bash
git add src/audio.js
git commit -m "feat: audio module with programmatic sounds and mute toggle"
```

---

## Task 2: Add Mute Button to UI

**Files:**
- Modify: `index.html`
- Modify: `style.css`
- Modify: `src/main.js`

- [ ] **Step 1: Add mute button to `index.html` header**

Change the header from:
```html
<header>
  <span>SCORE: <span id="score-display">0</span></span>
  <span>BEST: <span id="best-display">0</span></span>
</header>
```

To:
```html
<header>
  <button id="mute-btn" title="Toggle sound">🔊</button>
  <span>SCORE: <span id="score-display">0</span></span>
  <span>BEST: <span id="best-display">0</span></span>
</header>
```

- [ ] **Step 2: Add styles for mute button to `style.css`**

Add after the `header` styles:
```css
#mute-btn {
  background: transparent;
  border: none;
  font-size: 18px;
  cursor: pointer;
  padding: 0 8px;
}

#mute-btn:hover {
  opacity: 0.7;
}
```

- [ ] **Step 3: Wire mute button in `src/main.js`**

Add import at top:
```js
import { initAudio, toggleMute, isMuted } from './audio.js';
```

Add inside `init()` function, after `initUI()`:
```js
  initAudio();

  const muteBtn = document.getElementById('mute-btn');
  muteBtn.textContent = isMuted() ? '🔇' : '🔊';
  muteBtn.addEventListener('click', () => {
    const muted = toggleMute();
    muteBtn.textContent = muted ? '🔇' : '🔊';
  });
```

- [ ] **Step 4: Open `index.html` in browser, click mute button, verify icon toggles**

- [ ] **Step 5: Commit**

```bash
git add index.html style.css src/main.js
git commit -m "feat: add mute button to header"
```

---

## Task 3: Wire Drop and Game Over Sounds

**Files:**
- Modify: `src/main.js`

- [ ] **Step 1: Add playDrop to handleDrop in `src/main.js`**

Add import:
```js
import { initAudio, toggleMute, isMuted, playDrop, playGameOver } from './audio.js';
```

Inside `handleDrop()`, after `state = 'dropping';`:
```js
  playDrop();
```

- [ ] **Step 2: Add playGameOver to triggerGameOver in `src/main.js`**

Inside `triggerGameOver()`, at the start:
```js
  playGameOver();
```

- [ ] **Step 3: Open browser, drop a ball, verify sound plays (if not muted)**

- [ ] **Step 4: Trigger game over, verify sound plays**

- [ ] **Step 5: Commit**

```bash
git add src/main.js
git commit -m "feat: wire drop and game over sounds"
```

---

## Task 4: Combo System in Score Module

**Files:**
- Modify: `src/score.js`
- Modify: `tests/test.js`

- [ ] **Step 1: Add failing tests to `tests/test.js`**

Add at the end:
```js
import { resetScore, addMerge, getCombo, resetCombo } from '../src/score.js';

section('score.js combo');
resetScore();
resetCombo();
assert('combo starts at 1', getCombo() === 1);

addMerge(3, Date.now());
assert('first merge sets combo to 1', getCombo() === 1);

addMerge(3, Date.now() + 500);
assert('quick second merge increments combo', getCombo() === 2);

addMerge(4, Date.now() + 1000);
assert('third merge within window increments combo', getCombo() === 3);

resetCombo();
assert('resetCombo returns to 1', getCombo() === 1);
```

- [ ] **Step 2: Open `tests/test.html`, verify tests FAIL**

- [ ] **Step 3: Modify `src/score.js` to add combo logic**

Replace entire file with:
```js
const BEST_KEY = 'planet_merge_best';

let score = 0;
let combo = 1;
let lastMergeTime = 0;
const COMBO_WINDOW = 2000;
const MAX_COMBO = 10;

export function resetScore() {
  score = 0;
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
```

- [ ] **Step 4: Open `tests/test.html`, verify tests PASS**

- [ ] **Step 5: Commit**

```bash
git add src/score.js tests/test.js
git commit -m "feat: combo system in score module"
```

---

## Task 5: Wire Combo and Merge Sounds

**Files:**
- Modify: `src/collision.js`

- [ ] **Step 1: Modify `src/collision.js` to use combo and play sounds**

Add imports at top:
```js
import { addMerge, getCombo } from './score.js';
import { playMerge, playCombo } from './audio.js';
```

Replace the `setTimeout` callback inside `setupCollisionListener`:

Change from:
```js
        addToWorld(newBody);
        addScore(newLevel);

        if (onMerge) onMerge(newBody);
```

To:
```js
        addToWorld(newBody);
        const result = addMerge(newLevel, Date.now());
        playMerge(newLevel);
        if (result.combo > 1) playCombo(result.combo);

        if (onMerge) onMerge(newBody, result.combo);
```

Also update the onMerge callback signature in `main.js` later (Task 8).

- [ ] **Step 2: Remove unused `addScore` import, keep `addMerge`**

Remove `addScore` from imports, add `addMerge` and `getCombo`.

- [ ] **Step 3: Open browser, merge two planets quickly, verify combo sound plays**

- [ ] **Step 4: Commit**

```bash
git add src/collision.js
git commit -m "feat: wire combo and merge sounds to collision"
```

---

## Task 6: Particle Effects Module

**Files:**
- Create: `src/particles.js`

- [ ] **Step 1: Create `src/particles.js`**

```js
let particles = [];
const MAX_PARTICLES = 100;

export function spawnParticles(x, y, color, count = 10) {
  for (let i = 0; i < count && particles.length < MAX_PARTICLES; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 2 + Math.random() * 3;
    particles.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      radius: 3 + Math.random() * 3,
      color,
      alpha: 1,
      decay: 0.02 + Math.random() * 0.02,
    });
  }
}

export function updateParticles() {
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.x += p.vx;
    p.y += p.vy;
    p.vy += 0.1;
    p.alpha -= p.decay;
    if (p.alpha <= 0) {
      particles.splice(i, 1);
    }
  }
}

export function renderParticles(ctx) {
  for (const p of particles) {
    ctx.save();
    ctx.globalAlpha = p.alpha;
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

export function clearParticles() {
  particles = [];
}
```

- [ ] **Step 2: Commit**

```bash
git add src/particles.js
git commit -m "feat: particle effects module"
```

---

## Task 7: Wire Particles to Merge and Render Loop

**Files:**
- Modify: `src/collision.js`
- Modify: `src/ui.js`
- Modify: `src/main.js`

- [ ] **Step 1: Add particle import and spawn in `src/collision.js`**

Add import:
```js
import { spawnParticles } from './particles.js';
import { PLANETS } from './ball.js';
```

Inside the `setTimeout` callback, after `addToWorld(newBody);`:
```js
        const newColor = PLANETS[newLevel - 1].color;
        spawnParticles(mx, my, newColor, 12);
```

- [ ] **Step 2: Add particle render to `src/ui.js`**

Add import:
```js
import { updateParticles, renderParticles } from './particles.js';
```

Inside `drawFrame()`, after the merge effects loop and before the score HUD update:
```js
  // Particles
  updateParticles();
  renderParticles(ctx);
```

- [ ] **Step 3: Clear particles on restart in `src/main.js`**

Add import:
```js
import { clearParticles } from './particles.js';
```

Inside `restart()`:
```js
  clearParticles();
```

- [ ] **Step 4: Open browser, merge planets, verify particle burst appears**

- [ ] **Step 5: Commit**

```bash
git add src/collision.js src/ui.js src/main.js
git commit -m "feat: wire particles to merge events and render loop"
```

---

## Task 8: Combo Display in UI

**Files:**
- Modify: `src/ui.js`
- Modify: `style.css`
- Modify: `src/main.js`

- [ ] **Step 1: Add combo display element to `index.html`**

After the `<header>` and before `<div id="canvas-wrap">`:
```html
    <div id="combo-display" class="hidden">COMBO x1</div>
```

- [ ] **Step 2: Add styles for combo display to `style.css`**

Add:
```css
#combo-display {
  text-align: center;
  font-size: 24px;
  font-weight: bold;
  color: #FFD700;
  padding: 8px;
  text-shadow: 0 0 10px rgba(255, 215, 0, 0.5);
  transition: transform 0.1s;
}

#combo-display.hidden {
  display: none;
}

#combo-display.pop {
  transform: scale(1.2);
}
```

- [ ] **Step 3: Add combo display functions to `src/ui.js`**

Add at the end:
```js
export function showCombo(combo) {
  const el = document.getElementById('combo-display');
  el.textContent = `COMBO x${combo}`;
  el.classList.remove('hidden');
  el.classList.add('pop');
  setTimeout(() => el.classList.remove('pop'), 100);
}

export function hideCombo() {
  document.getElementById('combo-display').classList.add('hidden');
}
```

- [ ] **Step 4: Wire combo display in `src/main.js`**

Add imports:
```js
import { showCombo, hideCombo } from './ui.js';
import { getCombo, resetCombo } from './score.js';
```

Update `setupCollisionListener` callback to receive combo:
```js
  setupCollisionListener((newBody, combo) => {
    const r = PLANETS[newBody.gameData.level - 1].radius;
    addMergeEffect(newBody.position.x, newBody.position.y, r);
    if (combo > 1) showCombo(combo);
    saveState();
  });
```

Add `resetCombo()` to `restart()`:
```js
  resetCombo();
  hideCombo();
```

- [ ] **Step 5: Open browser, merge quickly, verify combo display appears**

- [ ] **Step 6: Commit**

```bash
git add index.html style.css src/ui.js src/main.js
git commit -m "feat: combo display in UI"
```

---

## Task 9: Achievements Module

**Files:**
- Create: `src/achievements.js`

- [ ] **Step 1: Create `src/achievements.js`**

```js
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

  if (!isUnlocked('first_merge')) {
    unlock('first_merge');
    newlyUnlocked.push('first_merge');
  }

  if (level >= 10 && !isUnlocked('first_sun')) {
    unlock('first_sun');
    newlyUnlocked.push('first_sun');
  }

  if (combo >= 3 && !isUnlocked('combo_3')) {
    unlock('combo_3');
    newlyUnlocked.push('combo_3');
  }

  if (combo >= 5 && !isUnlocked('combo_5')) {
    unlock('combo_5');
    newlyUnlocked.push('combo_5');
  }

  return newlyUnlocked;
}

export function checkScore(score) {
  const newlyUnlocked = [];

  if (score >= 1000 && !isUnlocked('score_1000')) {
    unlock('score_1000');
    newlyUnlocked.push('score_1000');
  }

  if (score >= 5000 && !isUnlocked('score_5000')) {
    unlock('score_5000');
    newlyUnlocked.push('score_5000');
  }

  return newlyUnlocked;
}

export function queueToasts(ids, playSound) {
  toastQueue.push(...ids);
  processToastQueue(playSound);
}

function processToastQueue(playSound) {
  if (toastTimeout || toastQueue.length === 0) return;

  const id = toastQueue.shift();
  const def = DEFINITIONS.find(d => d.id === id);
  if (!def) {
    processToastQueue(playSound);
    return;
  }

  showToast(def.name);
  if (playSound) playSound();
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
    processToastQueue();
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
```

- [ ] **Step 2: Commit**

```bash
git add src/achievements.js
git commit -m "feat: achievements module with definitions and unlock logic"
```

---

## Task 10: Achievement Toast and Modal UI

**Files:**
- Modify: `index.html`
- Modify: `style.css`
- Modify: `src/main.js`

- [ ] **Step 1: Add toast container and trophy button to `index.html`**

Add trophy button to header (after mute button):
```html
  <span>BEST: <span id="best-display">0</span></span>
  <button id="trophy-btn" title="Achievements">🏆</button>
</header>
```

Add toast container after `<div id="app">`:
```html
<div id="app">
  <header>...</header>
  <div id="toast-container"></div>
  <div id="combo-display" class="hidden">COMBO x1</div>
```

Add achievement modal before the game over overlay:
```html
    <div id="achievement-modal" class="hidden">
      <div id="achievement-content">
        <h2>Achievements</h2>
        <ul id="achievement-list"></ul>
        <button id="close-achievements">Close</button>
      </div>
    </div>
    <div id="overlay" class="hidden">
```

- [ ] **Step 2: Add styles for toast and modal to `style.css`**

Add:
```css
#toast-container {
  position: absolute;
  top: 60px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 20;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.toast {
  background: linear-gradient(135deg, #1a1a3a, #2a2a4a);
  border: 2px solid #FFD700;
  border-radius: 8px;
  padding: 12px 24px;
  font-size: 16px;
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from { transform: translateY(-20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

#trophy-btn {
  background: transparent;
  border: none;
  font-size: 18px;
  cursor: pointer;
  padding: 0 8px;
}

#trophy-btn:hover { opacity: 0.7; }

#achievement-modal {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0, 0, 0, 0.85);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 15;
}

#achievement-modal.hidden { display: none; }

#achievement-content {
  background: #0f0f2a;
  border: 1px solid #444;
  border-radius: 12px;
  padding: 24px;
  max-width: 320px;
  width: 90%;
}

#achievement-content h2 {
  text-align: center;
  margin-bottom: 16px;
  color: #FFD700;
}

#achievement-list {
  list-style: none;
  margin-bottom: 16px;
}

#achievement-list li {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 0;
  border-bottom: 1px solid #333;
}

#achievement-list li:last-child { border-bottom: none; }

#achievement-list .icon { font-size: 16px; width: 24px; }
#achievement-list .name { font-weight: bold; flex: 1; }
#achievement-list .desc { font-size: 12px; color: #888; }

#achievement-list li.unlocked .name { color: #FFD700; }
#achievement-list li.locked { opacity: 0.6; }

#close-achievements {
  width: 100%;
  background: #1a6bb5;
  color: #fff;
  border: none;
  padding: 10px;
  font-size: 14px;
  font-family: monospace;
  border-radius: 6px;
  cursor: pointer;
}

#close-achievements:hover { background: #2280d0; }
```

- [ ] **Step 3: Wire achievements in `src/main.js`**

Add imports:
```js
import { initAchievements, checkMerge, checkScore, queueToasts, renderAchievementList } from './achievements.js';
import { playAchievement } from './audio.js';
```

Inside `init()`, after `initUI()`:
```js
  initAchievements();

  const trophyBtn = document.getElementById('trophy-btn');
  const achievementModal = document.getElementById('achievement-modal');
  const closeAchievements = document.getElementById('close-achievements');
  const achievementList = document.getElementById('achievement-list');

  trophyBtn.addEventListener('click', () => {
    renderAchievementList(achievementList);
    achievementModal.classList.remove('hidden');
  });

  closeAchievements.addEventListener('click', () => {
    achievementModal.classList.add('hidden');
  });
```

Update the `setupCollisionListener` callback:
```js
  setupCollisionListener((newBody, combo) => {
    const r = PLANETS[newBody.gameData.level - 1].radius;
    addMergeEffect(newBody.position.x, newBody.position.y, r);
    if (combo > 1) showCombo(combo);
    const newAchievements = checkMerge(newBody.gameData.level, combo);
    if (newAchievements.length > 0) queueToasts(newAchievements, playAchievement);
    const scoreAchievements = checkScore(getScore());
    if (scoreAchievements.length > 0) queueToasts(scoreAchievements, playAchievement);
    saveState();
  });
```

- [ ] **Step 4: Open browser, trigger a merge, verify achievement toast appears**

- [ ] **Step 5: Click trophy button, verify achievement modal shows**

- [ ] **Step 6: Commit**

```bash
git add index.html style.css src/main.js
git commit -m "feat: achievement toast and modal UI"
```

---

## Task 11: Final Integration and Testing

**Files:**
- Modify: `src/main.js`

- [ ] **Step 1: Ensure resetCombo is called on restart**

Verify `restart()` includes:
```js
function restart() {
  clearBalls();
  resetScore();
  resetCombo();
  hideCombo();
  clearParticles();
  clearSavedState();
  currentBall = createBallDef();
  clearPreview();
  state = 'playing';
  hideOverlay();
}
```

- [ ] **Step 2: Manual test checklist**

Open `index.html` and verify:
- [ ] Drop sound plays when dropping a planet
- [ ] Merge sound plays on merge
- [ ] Combo sound plays on rapid merges (within 2s)
- [ ] Combo display shows "COMBO xN" when combo > 1
- [ ] Particles burst on merge
- [ ] "First Merge" achievement unlocks on first merge
- [ ] Achievement toast slides in
- [ ] Mute button toggles sound on/off
- [ ] Trophy button opens achievement modal
- [ ] Game over sound plays
- [ ] Run unit tests: open `tests/test.html`

- [ ] **Step 3: Final commit**

```bash
git add -A
git commit -m "feat: player engagement improvements complete — sound, combo, particles, achievements"
```

---

## Manual Test Checklist

| Test | Expected |
|------|----------|
| Drop a planet | Sound plays |
| Merge two planets | Sound + particles |
| Quick merges (within 2s) | Combo counter increases, combo sound |
| Combo display | Shows "COMBO xN" above canvas |
| First merge | Achievement toast appears |
| Create Sun (level 10) | "Solar Power" achievement |
| Score 1000 | "High Scorer" achievement |
| Mute button | Icon toggles, sounds stop |
| Trophy button | Opens achievement modal |
| Game over | Sound plays |
| Restart | Combo resets, particles clear |
