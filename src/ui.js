import { renderBall, PLANETS } from './ball.js';
import { getBalls } from './physics.js';
import { getScore, getBest } from './score.js';

const CANVAS_W = 480;
const CANVAS_H = 600;
export const DANGER_LINE_Y = CANVAS_H * 0.15; // 90px

let canvas, ctx;
let animFrameId = null;
let preview = null; // { x, level } — current ball preview position

export function initUI() {
  canvas = document.getElementById('game-canvas');
  ctx = canvas.getContext('2d');
}

/** Clears and redraws the full canvas each animation frame */
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

  // Preview ball + guide line
  if (preview) {
    const { x, level } = preview;
    const r = PLANETS[level - 1].radius;
    const clampedX = Math.max(r, Math.min(CANVAS_W - r, x));

    // Vertical guide line from top to danger line
    ctx.save();
    ctx.strokeStyle = 'rgba(255,255,255,0.15)';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 6]);
    ctx.beginPath();
    ctx.moveTo(clampedX, 0);
    ctx.lineTo(clampedX, DANGER_LINE_Y);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();

    // Preview ball — semi-transparent
    ctx.save();
    ctx.globalAlpha = 0.5;
    renderBall(ctx, clampedX, r, level);
    ctx.restore();
  }

  // Balls
  const balls = getBalls();
  for (const body of balls) {
    const { x, y } = body.position;
    const level = body.gameData?.level;
    if (level) renderBall(ctx, x, y, level);
  }

  // Score HUD (HTML elements)
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

/** Update the preview ball position. Pass null to hide. */
export function setPreview(x, level) {
  preview = { x, level };
}

export function clearPreview() {
  preview = null;
}

export { canvas };
