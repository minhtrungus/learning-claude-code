# Planet Merge Game — Design Spec

**Date:** 2026-03-21
**Status:** Approved

---

## Overview

A web-based drop-and-merge ball game with a space/planet theme, inspired by Suika Game mechanics. The player drops planets onto a board; two planets of the same type collide and merge into the next level planet. The game ends when planets overflow past the danger line.

---

## Stack

- **Runtime:** Browser (no build step required)
- **Physics:** Matter.js (via CDN)
- **Rendering:** HTML5 Canvas 2D
- **Language:** Vanilla JavaScript (ES Modules)
- **Storage:** localStorage (high score)

---

## File Structure

```
learning-claude-code/
├── index.html          # Entry point, loads Matter.js CDN + ES modules
├── style.css           # Layout, header, game over overlay, responsive
└── src/
    ├── main.js         # Game init, main loop, state machine
    ├── physics.js      # Matter.js engine setup, world walls, gravity
    ├── ball.js         # Planet definitions, ball creation, merge logic
    ├── input.js        # click/touch → drop position (clamped to [radius, 480-radius]) → trigger drop
    ├── collision.js    # Collision event listener, merge detection
    ├── score.js        # Score calculation, localStorage high score
    └── ui.js           # Canvas render: planets, overflow line, score HUD; DOM game-over overlay show/hide
```

---

## Game Mechanics

### Drop System
- Each turn, one planet is randomly selected from levels 1–5 (to keep game winnable).
- The next planet is chosen immediately after the previous drop (when the `dropping` state begins), and stored in `main.js` state as `currentBall`.
- Player clicks or taps the canvas to set the horizontal drop position.
- The planet is spawned at the top of the canvas at the chosen X, then falls under gravity.
- **Input lock:** Input is locked for a fixed **500ms** after each drop (design tradeoff — simple and predictable). This is acceptable because levels 1–5 planets are small and land quickly. Documented as intentional.

### Merge System
- When two planets of the same level collide, both bodies are removed from the Matter.js world.
- A new planet of level+1 is created at the **average position** of the two removed bodies: `x = (a.x + b.x) / 2`, `y = (a.y + b.y) / 2`.
- The new body is spawned with **zero initial velocity** (`Matter.Body.setVelocity(body, { x: 0, y: 0 })`). Matter.js overlap resolution will naturally push surrounding bodies outward — this is acceptable behavior.
- Each body carries an `ismerging` flag set to `true` during the merge frame to prevent double-merge events on the same collision tick.
- **Chain merges** (A+A → B, then B immediately touches another B) are handled naturally via Matter.js collision events in subsequent frames. No special debounce needed.
- Level 10 (Sun) cannot merge further — it is the maximum achievement.

### Overflow / Game Over
- A danger line is drawn at `canvasHeight * 0.15` from the top of the canvas (i.e., 15% — approximately 90px on a 600px canvas). This is drawn as a red dashed line across the full canvas width.
- **Overflow detection:** Registered in `main.js` via `Matter.Events.on(engine, 'afterUpdate', ...)`. After each physics update tick, check all active bodies. If any body's `position.y - radius <= dangerLineY` **and** `body.speed < 1.5` (nearly at rest), the game transitions to `gameover`. The speed threshold prevents false triggers when a ball passes through the line mid-fall.
- A Game Over overlay appears showing final score and a "Play Again" button.

### Scoring
- Points are awarded per merge: `new_level × 10`
  - e.g., merging two Earths (level 5) → Neptune (level 6) = 60 points
- High score is persisted in localStorage and shown in the header.

---

## Planet Definitions

| Level | Name       | Color          | Radius |
|-------|------------|----------------|--------|
| 1     | Meteorite  | Gray (#888)    | 15px   |
| 2     | Mercury    | Brownish gray (#a0917a) | 22px |
| 3     | Mars       | Red-orange (#c1440e) | 30px |
| 4     | Venus      | Pale yellow (#e8cda0) | 38px |
| 5     | Earth      | Blue (#1a6bb5) | 47px   |
| 6     | Neptune    | Deep blue (#3f54ba) | 57px |
| 7     | Uranus     | Light cyan (#7de8e8) | 68px |
| 8     | Saturn     | Orange-gold + ring (#e8a951) | 80px | Ring: ellipse, rx=planet_radius*1.6, ry=planet_radius*0.35, stroke #c8923a width 4px, drawn below planet circle |
| 9     | Jupiter    | Brown-orange (#c88b3a) | 93px | 3 horizontal stripes: lighter (#d9a55a), each 20% of diameter tall, evenly spaced, drawn as filled rectangles clipped to circle |
| 10    | Sun        | Bright yellow + glow (#FFD700) | 108px |

Planets are rendered using Canvas 2D radial gradients for depth. Saturn includes a simple elliptical ring drawn separately.

---

## UI / UX

### Layout
```
┌─────────────────────┐
│  SCORE: 0  BEST: 0  │  ← Header (HTML)
├─────────────────────┤
│- - - - - - - - - - -│  ← Overflow danger line (red dashed)
│                     │
│      [canvas]       │  ← Game board
│                     │
└─────────────────────┘
```

### Responsive Design
- Canvas max-width: 480px, centered on page.
- Canvas width is set via CSS `width: 100%; max-width: 480px`. The HTML canvas `width`/`height` attributes are fixed at 480×600 (Matter.js world coordinates). CSS scaling via `width: 100%` on the canvas element handles narrower screens — the Matter.js world coordinates do not change, so no physics constants need to scale.
- Supports both `mousedown`/`mousemove` (desktop) and `touchstart`/`touchmove` (mobile).
- Input X position is mapped from CSS pixel space to canvas coordinate space using `canvas.getBoundingClientRect()` and the ratio `canvas.width / rect.width`.

### Visual Style
- Dark space background (`#0a0a1a`).
- Danger line at `canvasHeight * 0.15` as red (`#ff4444`) dashed line (`setLineDash([10, 5])`).
- Planets: radial gradient circles for depth; Sun has glow effect (`shadowBlur: 20, shadowColor: #FFD700`).
- Score HUD: monospace font, white on dark.
- Physics walls: invisible, 50px thick, positioned so their inner edges align with the canvas edges (left, right, bottom). No top wall.
- Gravity: `Matter.Engine` gravity set to `{ x: 0, y: 2 }` for snappy feel.

---

## Game States

| State | Description |
|-------|-------------|
| `playing` | Awaiting player input; `currentBall` is set and ready to drop; **not displayed to player** (no preview) |
| `dropping` | Ball has been spawned into world; input locked for 500ms; `currentBall` immediately replaced with next random ball (held in state only, not shown) |
| `gameover` | Overflow condition triggered; DOM overlay shown with final score and "Play Again" button; no input accepted |

State transitions:
- `playing → dropping`: on valid click/tap
- `dropping → playing`: after 500ms timer expires
- `playing → gameover`: overflow detected in physics afterUpdate hook (`main.js`)
- `gameover → playing`: "Play Again" button clicked — resets score, removes all bodies from world, picks new `currentBall`, clears overlay

---

## Data Flow

```
User click/touch
    → input.js: compute X position
    → main.js: spawn ball via ball.js
    → physics.js: add body to Matter.js world
    → Matter.js: simulate physics each frame
    → collision.js: on collision event, check if same level
        → ball.js: remove both, create merged ball
        → score.js: add points
    → ui.js: render canvas each frame (requestAnimationFrame)
    → main.js: afterUpdate hook checks overflow → if triggered → gameover state → ui.js shows DOM overlay
```

---

## Out of Scope

- No "next ball" preview
- No animations beyond physics simulation
- No sound effects
- No multiplayer
- No backend / server
