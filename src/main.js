import { initPhysics, startPhysics, engine, Events, Bodies, addToWorld, clearBalls, getBalls } from './physics.js';
import { initUI, startRenderLoop, showOverlay, hideOverlay, setPreview, clearPreview, DANGER_LINE_Y, canvas } from './ui.js';
import { setupInput } from './input.js';
import { setupCollisionListener } from './collision.js';
import { createBallDef, PLANETS } from './ball.js';
import { resetScore, getScore } from './score.js';

// ── State ─────────────────────────────────────────────────────────────────────
// 'playing' | 'dropping' | 'gameover'
let state = 'playing';
let currentBall = null; // next ball to drop (held in state, not shown)

function isLocked() {
  return state !== 'playing';
}

// ── Init ──────────────────────────────────────────────────────────────────────
function init() {
  initPhysics();
  initUI();

  currentBall = createBallDef(); // first ball, random level 1–5

  setupCollisionListener(null);
  setupOverflowDetection();
  setupInput(canvas, handleDrop, handleMove, isLocked);

  document.getElementById('restart-btn').addEventListener('click', restart);

  startPhysics();
  startRenderLoop();
}

// ── Move (preview) ────────────────────────────────────────────────────────────
function handleMove(canvasX) {
  if (state === 'gameover') return;
  if (currentBall) setPreview(canvasX, currentBall.level);
}

// ── Drop ──────────────────────────────────────────────────────────────────────
function handleDrop(canvasX) {
  if (state !== 'playing' || !currentBall) return;

  clearPreview();
  state = 'dropping';

  const { level, radius } = currentBall;

  // Clamp X so ball doesn't spawn inside a wall
  const clampedX = Math.max(radius, Math.min(480 - radius, canvasX));

  const body = Bodies.circle(clampedX, radius, radius, {
    restitution: 0.3,
    friction: 0.5,
    label: 'ball',
  });
  body.gameData = { level, ismerging: false, createdAt: Date.now() };
  addToWorld(body);

  // Queue next ball immediately (not displayed)
  currentBall = createBallDef();

  // Unlock input after fixed 500ms
  setTimeout(() => {
    if (state === 'dropping') state = 'playing';
  }, 500);
}

// ── Overflow Detection ────────────────────────────────────────────────────────
function setupOverflowDetection() {
  Events.on(engine, 'afterUpdate', () => {
    if (state === 'gameover') return;

    for (const body of getBalls()) {
      if (!body.gameData) continue;
      const r = PLANETS[body.gameData.level - 1].radius;
      const age = Date.now() - (body.gameData.createdAt ?? 0);
      if (age < 800) continue; // grace period — ball is still falling from spawn
      if ((body.position.y - r) <= DANGER_LINE_Y && body.speed < 1.5) {
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
  clearBalls();
  resetScore();
  currentBall = createBallDef();
  clearPreview();
  state = 'playing';
  hideOverlay();
}

// ── Boot ──────────────────────────────────────────────────────────────────────
init();
