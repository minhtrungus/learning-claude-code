import { initPhysics, startPhysics, engine, Events, Bodies, Body, addToWorld, clearBalls, getBalls } from './physics.js';
import { initUI, startRenderLoop, showOverlay, hideOverlay, setPreview, clearPreview, addMergeEffect, DANGER_LINE_Y, canvas, showCombo, hideCombo } from './ui.js';
import { setupInput } from './input.js';
import { setupCollisionListener } from './collision.js';
import { createBallDef, PLANETS } from './ball.js';
import { resetScore, getScore, restoreScore, getCombo, resetCombo } from './score.js';
import { initAudio, toggleMute, isMuted, playDrop, playGameOver } from './audio.js';
import { clearParticles } from './particles.js';

const STATE_KEY = 'planet_merge_state';

// ── State ─────────────────────────────────────────────────────────────────────
// 'playing' | 'dropping' | 'gameover'
let state = 'playing';
let currentBall = null;

function isLocked() {
  return state !== 'playing';
}

// ── Init ──────────────────────────────────────────────────────────────────────
function init() {
  initPhysics();
  initUI();

  initAudio();

  const muteBtn = document.getElementById('mute-btn');
  muteBtn.textContent = isMuted() ? '🔇' : '🔊';
  muteBtn.addEventListener('click', () => {
    const muted = toggleMute();
    muteBtn.textContent = muted ? '🔇' : '🔊';
  });

  setupCollisionListener((newBody, combo) => {
    const r = PLANETS[newBody.gameData.level - 1].radius;
    addMergeEffect(newBody.position.x, newBody.position.y, r);
    if (combo > 1) {
      showCombo(combo);
    } else {
      hideCombo();
    }
    saveState();
  });

  setupOverflowDetection();
  setupInput(canvas, handleDrop, handleMove, isLocked);
  document.getElementById('restart-btn').addEventListener('click', restart);

  startPhysics();
  startRenderLoop();

  // Try to restore previous session; start fresh if none
  if (!loadState()) {
    currentBall = createBallDef();
  }
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
  playDrop();

  const { level, radius } = currentBall;
  const clampedX = Math.max(radius, Math.min(480 - radius, canvasX));

  const body = Bodies.circle(clampedX, radius, radius, {
    restitution: 0.3,
    friction: 0.5,
    label: 'ball',
  });
  body.gameData = { level, ismerging: false, createdAt: Date.now() };
  addToWorld(body);

  currentBall = createBallDef();
  saveState();

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
      if (age < 800) continue;
      if ((body.position.y - r) <= DANGER_LINE_Y && body.speed < 1.5) {
        triggerGameOver();
        return;
      }
    }
  });
}

function triggerGameOver() {
  playGameOver();
  state = 'gameover';
  clearSavedState();
  showOverlay(getScore());
}

// ── Save / Restore ────────────────────────────────────────────────────────────
function saveState() {
  const balls = getBalls()
    .filter(b => b.gameData?.level)
    .map(b => ({
      x: b.position.x,
      y: b.position.y,
      vx: b.velocity.x,
      vy: b.velocity.y,
      level: b.gameData.level,
      createdAt: b.gameData.createdAt ?? 0,
    }));
  localStorage.setItem(STATE_KEY, JSON.stringify({
    balls,
    score: getScore(),
    nextLevel: currentBall?.level ?? 1,
  }));
}

function loadState() {
  try {
    const raw = localStorage.getItem(STATE_KEY);
    if (!raw) return false;
    const data = JSON.parse(raw);
    if (!Array.isArray(data?.balls)) return false;

    for (const b of data.balls) {
      const planet = PLANETS[b.level - 1];
      if (!planet) continue;
      const body = Bodies.circle(b.x, b.y, planet.radius, {
        restitution: 0.3,
        friction: 0.5,
        label: 'ball',
      });
      body.gameData = { level: b.level, ismerging: false, createdAt: b.createdAt ?? 0 };
      Body.setVelocity(body, { x: b.vx ?? 0, y: b.vy ?? 0 });
      addToWorld(body);
    }

    if (data.score) restoreScore(data.score);
    currentBall = createBallDef(data.nextLevel ?? undefined);
    return true;
  } catch {
    return false;
  }
}

function clearSavedState() {
  localStorage.removeItem(STATE_KEY);
}

// ── Restart ───────────────────────────────────────────────────────────────────
function restart() {
  clearBalls();
  clearParticles();
  resetScore();
  resetCombo();
  hideCombo();
  clearSavedState();
  currentBall = createBallDef();
  clearPreview();
  state = 'playing';
  hideOverlay();
}

// ── Boot ──────────────────────────────────────────────────────────────────────
init();
