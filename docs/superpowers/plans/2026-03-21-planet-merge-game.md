# Planet Merge Game Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a browser-based drop-and-merge planet game where players drop planets that merge when same-level planets collide, using realistic physics.

**Architecture:** Vanilla JS ES Modules + Matter.js (CDN) + HTML5 Canvas. No build step. Each module has one responsibility and communicates through explicit function calls. `main.js` owns the state machine and orchestrates all modules.

**Tech Stack:** HTML5, CSS3, JavaScript (ES Modules), Matter.js v0.19 (CDN)

---

## File Map

| File | Responsibility |
|------|---------------|
| `index.html` | Entry point, loads CDN, wires canvas/overlay elements |
| `style.css` | Layout, header, game-over overlay, responsive canvas |
| `src/ball.js` | Planet data table, `createBall()`, `renderBall()` |
| `src/physics.js` | Matter.js engine + runner + walls, `addToWorld()`, `removeFromWorld()` |
| `src/score.js` | Score state, `addScore()`, `getScore()`, `getBest()`, `resetScore()` |
| `src/ui.js` | Canvas render loop, `drawFrame()`, overlay show/hide |
| `src/collision.js` | `setupCollisionListener()` — detects same-level contacts, triggers merge |
| `src/input.js` | Mouse + touch handlers, maps CSS coords → canvas coords, calls drop callback |
| `src/main.js` | Game state machine (`playing`/`dropping`/`gameover`), init, restart |
| `tests/test.html` | Test runner page (open in browser to run unit tests) |
| `tests/helpers.js` | `assert()` and `section()` helpers exported for test files |
| `tests/test.js` | Unit tests for pure-logic modules (ball, score) |

---

## Testing Strategy

This is a browser game with no build step. Tests are written as vanilla JS assertions loaded via `tests/test.html`. Open the file in a browser — pass/fail is logged to the console and shown on the page.

```js
// test helper pattern used throughout
function assert(description, condition) {
  const el = document.getElementById('results');
  const pass = condition === true;
  el.innerHTML += `<div class="${pass ? 'pass' : 'fail'}">${pass ? '✓' : '✗'} ${description}</div>`;
  if (!pass) console.error('FAIL:', description);
}
```

Pure-logic modules (`ball.js`, `score.js`) get unit tests. Physics, rendering, and input are verified manually after each task via browser.

---

## Task 1: Project Scaffold

**Files:**
- Create: `index.html`
- Create: `style.css`
- Create: `tests/test.html`
- Create: `tests/test.js`

- [ ] **Step 1: Create `index.html`**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Planet Merge</title>
  <link rel="stylesheet" href="style.css" />
  <script src="https://cdnjs.cloudflare.com/ajax/libs/matter-js/0.19.0/matter.min.js"></script>
</head>
<body>
  <div id="app">
    <header>
      <span>SCORE: <span id="score-display">0</span></span>
      <span>BEST: <span id="best-display">0</span></span>
    </header>
    <div id="canvas-wrap">
      <canvas id="game-canvas" width="480" height="600"></canvas>
    </div>
    <div id="overlay" class="hidden">
      <div id="overlay-content">
        <h2>GAME OVER</h2>
        <p>Score: <span id="final-score">0</span></p>
        <button id="restart-btn">Play Again</button>
      </div>
    </div>
  </div>
  <script type="module" src="src/main.js"></script>
</body>
</html>
```

- [ ] **Step 2: Create `style.css`**

```css
* { box-sizing: border-box; margin: 0; padding: 0; }

body {
  background: #0a0a1a;
  color: #fff;
  font-family: monospace;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  min-height: 100vh;
}

#app {
  width: 100%;
  max-width: 480px;
  position: relative;
}

header {
  display: flex;
  justify-content: space-between;
  padding: 12px 16px;
  font-size: 18px;
  letter-spacing: 1px;
  background: #0f0f2a;
  border-bottom: 1px solid #333;
}

#canvas-wrap {
  position: relative;
  width: 100%;
}

#game-canvas {
  width: 100%;
  display: block;
  cursor: crosshair;
}

#overlay {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0, 0, 0, 0.75);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
}

#overlay.hidden { display: none; }

#overlay-content {
  text-align: center;
  background: #0f0f2a;
  border: 1px solid #444;
  padding: 32px 48px;
  border-radius: 12px;
}

#overlay-content h2 {
  font-size: 32px;
  margin-bottom: 16px;
  color: #ff4444;
  letter-spacing: 3px;
}

#overlay-content p {
  font-size: 20px;
  margin-bottom: 24px;
}

#restart-btn {
  background: #1a6bb5;
  color: #fff;
  border: none;
  padding: 12px 32px;
  font-size: 16px;
  font-family: monospace;
  border-radius: 6px;
  cursor: pointer;
  letter-spacing: 1px;
}

#restart-btn:hover { background: #2280d0; }
```

- [ ] **Step 3: Create `tests/test.html`**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Planet Merge — Tests</title>
  <style>
    body { font-family: monospace; background: #111; color: #eee; padding: 24px; }
    .pass { color: #4caf50; }
    .fail { color: #f44336; font-weight: bold; }
    h2 { margin: 16px 0 8px; color: #aaa; }
  </style>
</head>
<body>
  <h1>Planet Merge — Unit Tests</h1>
  <div id="results"></div>
  <script type="module" src="test.js"></script>
</body>
</html>
```

- [ ] **Step 4: Create `tests/helpers.js` (assert helpers — separate file to avoid self-import)**

```js
export function assert(description, condition) {
  const el = document.getElementById('results');
  const pass = condition === true;
  el.innerHTML += `<div class="${pass ? 'pass' : 'fail'}">${pass ? '✓' : '✗'} ${description}</div>`;
  if (!pass) console.error('FAIL:', description);
}

export function section(name) {
  document.getElementById('results').innerHTML += `<h2>${name}</h2>`;
}
```

- [ ] **Step 5: Create `tests/test.js` (empty entry point — tests added in later tasks)**

```js
// Tests are added in Task 2 (ball.js) and Task 3 (score.js)
```

- [ ] **Step 6: Open `index.html` in browser, verify layout renders (dark header + black canvas area, no JS errors)**

- [ ] **Step 7: Commit**

```bash
git add index.html style.css tests/test.html tests/helpers.js tests/test.js
git commit -m "feat: project scaffold — HTML, CSS, test runner"
```

---

## Task 2: Planet Definitions (`ball.js`)

**Files:**
- Create: `src/ball.js`
- Modify: `tests/test.js`

- [ ] **Step 1: Write failing tests in `tests/test.js`**

Add at the bottom of `tests/test.js`:

```js
import { assert, section } from './helpers.js';
import { PLANETS, createBallDef } from '../src/ball.js';

section('ball.js — PLANETS table');
assert('has 10 planets', PLANETS.length === 10);
assert('level 1 is Meteorite', PLANETS[0].name === 'Meteorite');
assert('level 10 is Sun', PLANETS[9].name === 'Sun');
assert('radii increase with level', PLANETS.every((p, i) => i === 0 || p.radius > PLANETS[i - 1].radius));

section('ball.js — createBallDef');
const def = createBallDef(3);
assert('createBallDef returns correct level', def.level === 3);
assert('createBallDef returns correct radius', def.radius === PLANETS[2].radius);
assert('createBallDef returns color string', typeof def.color === 'string');

const randomDefs = Array.from({ length: 50 }, () => createBallDef());
assert('random ball is always level 1–5', randomDefs.every(d => d.level >= 1 && d.level <= 5));
```

- [ ] **Step 2: Open `tests/test.html` in browser — verify tests FAIL (ball.js not found)**

- [ ] **Step 3: Create `src/ball.js`**

```js
export const PLANETS = [
  { level: 1,  name: 'Meteorite', color: '#888888',  radius: 15  },
  { level: 2,  name: 'Mercury',   color: '#a0917a',  radius: 22  },
  { level: 3,  name: 'Mars',      color: '#c1440e',  radius: 30  },
  { level: 4,  name: 'Venus',     color: '#e8cda0',  radius: 38  },
  { level: 5,  name: 'Earth',     color: '#1a6bb5',  radius: 47  },
  { level: 6,  name: 'Neptune',   color: '#3f54ba',  radius: 57  },
  { level: 7,  name: 'Uranus',    color: '#7de8e8',  radius: 68  },
  { level: 8,  name: 'Saturn',    color: '#e8a951',  radius: 80  },
  { level: 9,  name: 'Jupiter',   color: '#c88b3a',  radius: 93  },
  { level: 10, name: 'Sun',       color: '#FFD700',  radius: 108 },
];

/**
 * Returns a planet definition object.
 * @param {number} [level] - 1–10. If omitted, random from 1–5.
 */
export function createBallDef(level) {
  const l = level ?? (Math.floor(Math.random() * 5) + 1);
  const planet = PLANETS[l - 1];
  return { level: planet.level, name: planet.name, color: planet.color, radius: planet.radius };
}

/**
 * Renders a planet on the canvas context at (cx, cy).
 * Handles special rendering for Saturn (ring) and Jupiter (stripes) and Sun (glow).
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} cx - center x
 * @param {number} cy - center y
 * @param {number} level - 1–10
 */
export function renderBall(ctx, cx, cy, level) {
  const planet = PLANETS[level - 1];
  const r = planet.radius;

  ctx.save();

  // Saturn ring — drawn BEFORE planet (behind)
  if (level === 8) {
    ctx.beginPath();
    ctx.ellipse(cx, cy, r * 1.6, r * 0.35, 0, 0, Math.PI * 2);
    ctx.strokeStyle = '#c8923a';
    ctx.lineWidth = 4;
    ctx.stroke();
  }

  // Sun glow
  if (level === 10) {
    ctx.shadowBlur = 20;
    ctx.shadowColor = '#FFD700';
  }

  // Radial gradient fill
  const grad = ctx.createRadialGradient(cx - r * 0.3, cy - r * 0.3, r * 0.1, cx, cy, r);
  grad.addColorStop(0, lighten(planet.color, 0.4));
  grad.addColorStop(1, planet.color);
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fillStyle = grad;
  ctx.fill();

  ctx.shadowBlur = 0;
  ctx.shadowColor = 'transparent';

  // Jupiter stripes — drawn AFTER fill (on top), clipped to circle
  if (level === 9) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.clip();
    const stripeColor = '#d9a55a';
    const stripeH = r * 0.4; // 20% of diameter = 0.2 * 2r = 0.4r
    const offsets = [-r * 0.5, 0, r * 0.5]; // evenly spaced
    ctx.fillStyle = stripeColor;
    for (const oy of offsets) {
      ctx.fillRect(cx - r, cy + oy - stripeH / 2, r * 2, stripeH);
    }
    ctx.restore();
  }

  // Planet name label (small text)
  ctx.fillStyle = 'rgba(255,255,255,0.7)';
  ctx.font = `bold ${Math.max(8, r * 0.22)}px monospace`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(planet.name.slice(0, 3).toUpperCase(), cx, cy);

  ctx.restore();
}

/** Lightens a hex color by a factor 0–1 */
function lighten(hex, factor) {
  const n = parseInt(hex.replace('#', ''), 16);
  const r = Math.min(255, ((n >> 16) & 0xff) + Math.round(255 * factor));
  const g = Math.min(255, ((n >> 8) & 0xff) + Math.round(255 * factor));
  const b = Math.min(255, (n & 0xff) + Math.round(255 * factor));
  return `rgb(${r},${g},${b})`;
}
```

- [ ] **Step 4: Reload `tests/test.html` — verify all ball.js tests PASS**

- [ ] **Step 5: Commit**

```bash
git add src/ball.js tests/test.js
git commit -m "feat: planet definitions and ball renderer (ball.js)"
```

---

## Task 3: Score Module (`score.js`)

**Files:**
- Create: `src/score.js`
- Modify: `tests/test.js`

- [ ] **Step 1: Add failing tests to `tests/test.js`**

```js
import { assert, section } from './helpers.js';
import { resetScore, addScore, getScore, getBest } from '../src/score.js';

section('score.js');
resetScore();
assert('score starts at 0 after reset', getScore() === 0);
addScore(6);
assert('addScore(level) adds level*10', getScore() === 60);
addScore(3);
assert('addScore accumulates', getScore() === 90);
const best1 = getBest();
resetScore();
assert('reset clears score', getScore() === 0);
assert('best preserved after reset', getBest() === best1);
```

- [ ] **Step 2: Open `tests/test.html` — verify score tests FAIL**

- [ ] **Step 3: Create `src/score.js`**

```js
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

export function getBest() {
  return parseInt(localStorage.getItem(BEST_KEY) ?? '0', 10);
}
```

- [ ] **Step 4: Reload `tests/test.html` — verify all score tests PASS**

- [ ] **Step 5: Commit**

```bash
git add src/score.js tests/test.js
git commit -m "feat: score module with localStorage best score"
```

---

## Task 4: Physics Setup (`physics.js`)

**Files:**
- Create: `src/physics.js`

No unit tests for physics — Matter.js is third-party; manual verification in browser.

- [ ] **Step 1: Create `src/physics.js`**

```js
const { Engine, Render, Runner, Bodies, Composite, Events, Body, Vector } = Matter;

const CANVAS_W = 480;
const CANVAS_H = 600;
const WALL_T = 50; // wall thickness (outside canvas)

let engine, runner, world;

/**
 * Initialises Matter.js engine and static walls.
 * Does NOT start the runner — call startPhysics() for that.
 */
export function initPhysics() {
  engine = Engine.create({ gravity: { x: 0, y: 2 } });
  world = engine.world;
  runner = Runner.create();

  // Walls: left, right, bottom — inner edges align with canvas bounds
  const walls = [
    Bodies.rectangle(-WALL_T / 2, CANVAS_H / 2, WALL_T, CANVAS_H + WALL_T * 2, { isStatic: true, label: 'wall' }),
    Bodies.rectangle(CANVAS_W + WALL_T / 2, CANVAS_H / 2, WALL_T, CANVAS_H + WALL_T * 2, { isStatic: true, label: 'wall' }),
    Bodies.rectangle(CANVAS_W / 2, CANVAS_H + WALL_T / 2, CANVAS_W + WALL_T * 2, WALL_T, { isStatic: true, label: 'wall' }),
  ];
  Composite.add(world, walls);

  return engine;
}

export function startPhysics() {
  Runner.run(runner, engine);
}

export function stopPhysics() {
  Runner.stop(runner);
}

/** Adds a Matter.js body to the world */
export function addToWorld(body) {
  Composite.add(world, body);
}

/** Removes a Matter.js body from the world */
export function removeFromWorld(body) {
  Composite.remove(world, body);
}

/** Returns all non-static, non-wall bodies */
export function getBalls() {
  return Composite.allBodies(world).filter(b => !b.isStatic);
}

/** Clears all non-static bodies (for restart) */
export function clearBalls() {
  getBalls().forEach(b => Composite.remove(world, b));
}

export { engine, Events, Body, Bodies };
```

- [ ] **Step 2: Manual verification — temporarily add a test import in `index.html` console. Open browser DevTools, confirm no import errors when you add `<script type="module">import { initPhysics } from './src/physics.js'; initPhysics(); console.log('physics ok');</script>` to index.html. Remove after test.**

- [ ] **Step 3: Commit**

```bash
git add src/physics.js
git commit -m "feat: Matter.js physics engine setup (physics.js)"
```

---

## Task 5: Canvas Renderer (`ui.js`)

**Files:**
- Create: `src/ui.js`

- [ ] **Step 1: Create `src/ui.js`**

```js
import { renderBall } from './ball.js';
import { getBalls } from './physics.js';
import { getScore, getBest } from './score.js';

const CANVAS_W = 480;
const CANVAS_H = 600;
export const DANGER_LINE_Y = CANVAS_H * 0.15; // 90px

let canvas, ctx;
let animFrameId = null;

export function initUI() {
  canvas = document.getElementById('game-canvas');
  ctx = canvas.getContext('2d');
}

/** Called every animation frame — clears and redraws everything */
export function drawFrame() {
  ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);

  // Background
  ctx.fillStyle = '#0a0a1a';
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

  // Danger line
  ctx.save();
  ctx.strokeStyle = '#ff4444';
  ctx.lineWidth = 2;
  ctx.setLineDash([10, 5]);
  ctx.beginPath();
  ctx.moveTo(0, DANGER_LINE_Y);
  ctx.lineTo(CANVAS_W, DANGER_LINE_Y);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.restore();

  // Balls
  const balls = getBalls();
  for (const body of balls) {
    const { x, y } = body.position;
    const level = body.gameData?.level;
    if (level) renderBall(ctx, x, y, level);
  }

  // Score HUD update (HTML elements — not canvas)
  document.getElementById('score-display').textContent = getScore();
  document.getElementById('best-display').textContent = getBest();
}

export function startRenderLoop() {
  function loop() {
    drawFrame();
    animFrameId = requestAnimationFrame(loop);
  }
  animFrameId = requestAnimationFrame(loop);
}

export function stopRenderLoop() {
  if (animFrameId) cancelAnimationFrame(animFrameId);
}

export function showOverlay(finalScore) {
  document.getElementById('final-score').textContent = finalScore;
  document.getElementById('overlay').classList.remove('hidden');
}

export function hideOverlay() {
  document.getElementById('overlay').classList.add('hidden');
}

export { canvas };
```

- [ ] **Step 2: Wire up a minimal test in `main.js` (create stub) to verify render loop works**

Create `src/main.js` temporarily:

```js
import { initPhysics, startPhysics } from './physics.js';
import { initUI, startRenderLoop } from './ui.js';

initPhysics();
initUI();
startRenderLoop();
```

- [ ] **Step 3: Open `index.html` in browser — verify dark canvas with red dashed line at ~90px from top, no JS errors**

- [ ] **Step 4: Commit**

```bash
git add src/ui.js src/main.js
git commit -m "feat: canvas renderer with danger line and render loop (ui.js)"
```

---

## Task 6: Input Handling (`input.js`)

**Files:**
- Create: `src/input.js`

- [ ] **Step 1: Create `src/input.js`**

```js
/**
 * Sets up click and touch listeners on the canvas.
 * Calls onDrop(canvasX) when the user taps/clicks.
 * canvasX is clamped to [minRadius, 480 - minRadius].
 * @param {HTMLCanvasElement} canvas
 * @param {(x: number) => void} onDrop
 * @param {() => boolean} isLocked - returns true when input should be ignored
 */
export function setupInput(canvas, onDrop, isLocked) {
  function getCanvasX(clientX) {
    const rect = canvas.getBoundingClientRect();
    const ratio = canvas.width / rect.width;
    return (clientX - rect.left) * ratio;
  }

  canvas.addEventListener('mousedown', (e) => {
    if (isLocked()) return;
    onDrop(getCanvasX(e.clientX));
  });

  canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    if (isLocked()) return;
    const touch = e.touches[0];
    onDrop(getCanvasX(touch.clientX));
  }, { passive: false });
}
```

- [ ] **Step 2: Verify by adding a temporary console.log in `main.js`:**

```js
import { setupInput } from './input.js';
import { canvas } from './ui.js';
// ... after initUI()
setupInput(canvas, (x) => console.log('drop at x:', x), () => false);
```

Open `index.html`, click the canvas, confirm X values log to console and are within 0–480.

- [ ] **Step 3: Remove the temporary console.log**

- [ ] **Step 4: Commit**

```bash
git add src/input.js
git commit -m "feat: mouse and touch input handler (input.js)"
```

---

## Task 7: Collision & Merge Detection (`collision.js`)

**Files:**
- Create: `src/collision.js`

- [ ] **Step 1: Create `src/collision.js`**

```js
import { removeFromWorld, addToWorld, engine, Events, Body, Bodies } from './physics.js';
import { PLANETS } from './ball.js';
import { addScore } from './score.js';

/**
 * Registers the collision listener on the Matter.js engine.
 * When two same-level balls collide, merges them into the next level.
 * @param {(body: Matter.Body) => void} onMerge - called with new merged body
 */
export function setupCollisionListener(onMerge) {
  Events.on(engine, 'collisionStart', (event) => {
    const pairs = event.pairs;

    for (const pair of pairs) {
      const { bodyA, bodyB } = pair;

      // Skip walls and already-merging balls
      if (bodyA.isStatic || bodyB.isStatic) continue;
      if (bodyA.gameData?.ismerging || bodyB.gameData?.ismerging) continue;
      if (!bodyA.gameData || !bodyB.gameData) continue;

      const levelA = bodyA.gameData.level;
      const levelB = bodyB.gameData.level;

      if (levelA !== levelB) continue;
      if (levelA >= 10) continue; // Sun cannot merge

      // Mark both as merging to prevent double-fire
      bodyA.gameData.ismerging = true;
      bodyB.gameData.ismerging = true;

      const newLevel = levelA + 1;
      const newPlanet = PLANETS[newLevel - 1];
      const mx = (bodyA.position.x + bodyB.position.x) / 2;
      const my = (bodyA.position.y + bodyB.position.y) / 2;

      // Defer removal to next tick to avoid modifying world during collision event
      setTimeout(() => {
        removeFromWorld(bodyA);
        removeFromWorld(bodyB);

        const newBody = Bodies.circle(mx, my, newPlanet.radius, {
          restitution: 0.3,
          friction: 0.5,
          label: 'ball',
        });
        newBody.gameData = { level: newLevel, ismerging: false };
        Body.setVelocity(newBody, { x: 0, y: 0 });

        addToWorld(newBody);
        addScore(newLevel);

        if (onMerge) onMerge(newBody);
      }, 0);
    }
  });
}
```

- [ ] **Step 2: Manual verification plan (done after Task 8 integration) — drop two same-level balls in the same column, verify they merge into the next level**

- [ ] **Step 3: Commit**

```bash
git add src/collision.js
git commit -m "feat: collision listener and merge logic (collision.js)"
```

---

## Task 8: Main Game Loop & State Machine (`main.js`)

**Files:**
- Modify: `src/main.js` (replace the stub from Task 5)

- [ ] **Step 1: Replace `src/main.js` with the full implementation**

```js
import { initPhysics, startPhysics, engine, Events, Bodies, addToWorld, clearBalls, getBalls } from './physics.js';
import { initUI, startRenderLoop, showOverlay, hideOverlay, DANGER_LINE_Y, canvas } from './ui.js';
import { setupInput } from './input.js';
import { setupCollisionListener } from './collision.js';
import { createBallDef, PLANETS } from './ball.js';
import { resetScore, getScore, getBest } from './score.js';

// ── State ────────────────────────────────────────────────────────────────────
// 'playing' | 'dropping' | 'gameover'
let state = 'playing';
let currentBall = null; // { level, radius } — next ball to drop

function isLocked() {
  return state !== 'playing';
}

// ── Init ─────────────────────────────────────────────────────────────────────
function init() {
  initPhysics();
  initUI();

  currentBall = createBallDef(); // first ball (random 1–5)

  setupCollisionListener(null);
  setupOverflowDetection();
  setupInput(canvas, handleDrop, isLocked);

  document.getElementById('restart-btn').addEventListener('click', restart);

  startPhysics();
  startRenderLoop();
}

// ── Drop ─────────────────────────────────────────────────────────────────────
function handleDrop(canvasX) {
  if (state !== 'playing' || !currentBall) return;

  state = 'dropping';

  const { level, radius } = currentBall;
  const planet = PLANETS[level - 1];

  // Clamp X so ball doesn't spawn inside walls
  const clampedX = Math.max(radius, Math.min(480 - radius, canvasX));

  const body = Bodies.circle(clampedX, radius, radius, {
    restitution: 0.3,
    friction: 0.5,
    label: 'ball',
  });
  body.gameData = { level, ismerging: false };
  addToWorld(body);

  // Pick next ball immediately
  currentBall = createBallDef();

  // Unlock input after 500ms
  setTimeout(() => {
    if (state === 'dropping') state = 'playing';
  }, 500);
}

// ── Overflow Detection ────────────────────────────────────────────────────────
function setupOverflowDetection() {
  Events.on(engine, 'afterUpdate', () => {
    if (state === 'gameover') return;

    const balls = getBalls();
    for (const body of balls) {
      if (!body.gameData) continue;
      const { x, y } = body.position;
      const r = body.gameData.level ? PLANETS[body.gameData.level - 1].radius : 0;
      if ((y - r) <= DANGER_LINE_Y && body.speed < 1.5) {
        triggerGameOver();
        return;
      }
    }
  });
}

function triggerGameOver() {
  state = 'gameover';
  showOverlay(getScore());
}

// ── Restart ───────────────────────────────────────────────────────────────────
function restart() {
  state = 'playing';
  clearBalls();
  resetScore();
  currentBall = createBallDef();
  hideOverlay();
}

// ── Boot ──────────────────────────────────────────────────────────────────────
init();
```

- [ ] **Step 2: Open `index.html` in browser. Verify:**
  - Canvas renders with dark background and red dashed danger line
  - Clicking the canvas drops a planet that falls with gravity
  - Score display shows 0
  - No JS errors in console

- [ ] **Step 3: Drop two identical planets in the same column. Verify they merge into the next-level planet and score increases.**

- [ ] **Step 4: Fill the board until planets reach the danger line. Verify Game Over overlay appears with correct score and "Play Again" button.**

- [ ] **Step 5: Click "Play Again". Verify board clears, score resets, game resumes.**

- [ ] **Step 6: Test on mobile (or DevTools mobile emulation). Verify tap-to-drop works.**

- [ ] **Step 7: Commit**

```bash
git add src/main.js
git commit -m "feat: main game loop, state machine, drop and overflow detection"
```

---

## Task 9: Polish & Final Verification

**Files:**
- Modify: `style.css` (minor tweaks if needed)
- Modify: `src/ball.js` (verify all 10 planets render correctly)

- [ ] **Step 1: Play through the game. Check each planet renders correctly:**
  - Level 1 (Meteorite): gray circle
  - Level 8 (Saturn): orange circle with elliptical ring behind it
  - Level 9 (Jupiter): orange-brown circle with 3 horizontal stripes
  - Level 10 (Sun): bright yellow with glow

- [ ] **Step 2: Verify score resets to 0 on "Play Again" but Best score persists**

- [ ] **Step 3: Verify Best score persists across page refresh (localStorage)**

- [ ] **Step 4: Run all unit tests — open `tests/test.html` in browser. Confirm all pass.**

- [ ] **Step 5: Run a final smoke test on mobile viewport (320px wide). Confirm canvas scales, touch works, no overflow.**

- [ ] **Step 6: Final commit**

```bash
git add -A
git commit -m "feat: Planet Merge Game — complete implementation"
```

---

## Appendix: Manual Test Checklist

| Test | Expected |
|------|----------|
| Drop a planet | Falls with gravity, lands on bottom |
| Drop two same-level planets in same spot | Merge → next level, score increases |
| Chain merge (A+A → B, B touches B) | B merges into C on next collision tick |
| Fill board past danger line | Game Over overlay appears |
| "Play Again" | Board clears, score = 0, game resumes |
| Refresh page | Best score persists from localStorage |
| Mobile tap | Drop works correctly |
| Saturn render | Ring visible around planet |
| Jupiter render | 3 stripes visible on planet |
| Sun render | Yellow glow visible |
