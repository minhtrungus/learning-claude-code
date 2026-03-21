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
    const stripeH = r * 0.4; // 20% of diameter
    const offsets = [-r * 0.5, 0, r * 0.5];
    ctx.fillStyle = stripeColor;
    for (const oy of offsets) {
      ctx.fillRect(cx - r, cy + oy - stripeH / 2, r * 2, stripeH);
    }
    ctx.restore();
  }

  // Planet name label
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
