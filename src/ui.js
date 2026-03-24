import { renderBall, PLANETS } from './ball.js';
import { getBalls } from './physics.js';
import { getScore, getBest } from './score.js';
import { updateParticles, renderParticles } from './particles.js';

const CANVAS_W = 480;
const CANVAS_H = 600;
export const DANGER_LINE_Y = CANVAS_H * 0.15; // 90px

let canvas, ctx;
let animFrameId = null;
let preview = null; // { x, level } — current ball preview position
let mergeEffects = []; // { x, y, r, startTime }
const MERGE_DURATION = 400;

export function initUI() {
  canvas = document.getElementById('game-canvas');
  ctx = canvas.getContext('2d');
}

/**
 * Ray-cast a vertical drop at dropX for a ball of dropRadius.
 * Returns the y-center of where the ball would come to rest:
 * - top surface of the first ball it hits, or
 * - the floor (CANVAS_H - dropRadius)
 */
function calcLandingY(dropX, dropRadius) {
  let minY = CANVAS_H - dropRadius; // floor

  for (const body of getBalls()) {
    if (!body.gameData) continue;
    const { x: bx, y: by } = body.position;
    const br = PLANETS[body.gameData.level - 1].radius;
    const dx = dropX - bx;
    const sumR = dropRadius + br;
    if (Math.abs(dx) >= sumR) continue; // ray misses this ball horizontally
    const hitY = by - Math.sqrt(sumR * sumR - dx * dx);
    if (hitY > dropRadius && hitY < minY) minY = hitY;
  }

  return minY;
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

    // Ray cast: find y where dropping ball would first touch another ball or the floor
    const landingY = calcLandingY(clampedX, r);

    // Guide line from bottom of preview ball to top of landing surface
    ctx.save();
    ctx.strokeStyle = 'rgba(255,255,255,0.25)';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 6]);
    ctx.beginPath();
    ctx.moveTo(clampedX, r * 2);       // bottom edge of preview ball
    ctx.lineTo(clampedX, landingY + r); // bottom edge of ball at rest = top of obstacle
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();

    // Preview ball — full opacity
    renderBall(ctx, clampedX, r, level);
  }

  // Balls
  const balls = getBalls();
  for (const body of balls) {
    const { x, y } = body.position;
    const level = body.gameData?.level;
    if (level) renderBall(ctx, x, y, level);
  }

  // Merge effects — expanding ring that fades out
  const now = Date.now();
  mergeEffects = mergeEffects.filter(e => now - e.startTime < MERGE_DURATION);
  for (const e of mergeEffects) {
    const t = (now - e.startTime) / MERGE_DURATION; // 0 → 1
    ctx.save();
    ctx.globalAlpha = (1 - t) * 0.8;
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(e.x, e.y, e.r * (1 + t * 0.7), 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  // Particles
  updateParticles();
  renderParticles(ctx);

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

/** Spawn a white expanding-ring effect at the merge point */
export function addMergeEffect(x, y, r) {
  mergeEffects.push({ x, y, r, startTime: Date.now() });
}

export { canvas };
