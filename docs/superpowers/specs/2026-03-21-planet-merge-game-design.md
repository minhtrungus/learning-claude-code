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
    ├── input.js        # click/touch → drop position → trigger drop
    ├── collision.js    # Collision event listener, merge detection
    ├── score.js        # Score calculation, localStorage high score
    └── ui.js           # Canvas render: planets, overflow line, score HUD
```

---

## Game Mechanics

### Drop System
- Each turn, one planet is randomly selected from levels 1–5 (to keep game winnable).
- Player clicks or taps the canvas to set the horizontal drop position.
- The planet falls straight down from the top at the chosen X position.
- Input is locked for ~500ms after each drop to prevent spamming.

### Merge System
- When two planets of the same level collide, both are removed from the world.
- A new planet of level+1 is created at the midpoint of the collision.
- Level 10 (Sun) cannot merge further — it is the maximum achievement.

### Overflow / Game Over
- A danger line is drawn ~20% from the top of the canvas (dashed red).
- If any planet rests touching or above this line, the game ends.
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
| 8     | Saturn     | Orange-gold + ring (#e8a951) | 80px |
| 9     | Jupiter    | Brown-orange striped (#c88b3a) | 93px |
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
- Canvas height: ~600px.
- Scales to fit narrower mobile screens.
- Supports both `mousedown` (desktop) and `touchstart` (mobile).

### Visual Style
- Dark space background (`#0a0a1a`).
- Danger line: red dashed line across canvas.
- Planets: gradient circles (radial), glow effect on Sun.
- Score HUD: monospace font, white on dark.

---

## Game States

| State | Description |
|-------|-------------|
| `playing` | Awaiting player input |
| `dropping` | Ball is falling, input locked (~500ms) |
| `gameover` | Overlay shown, no input accepted |

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
    → ui.js: check overflow line → if triggered → gameover state
```

---

## Out of Scope

- No "next ball" preview
- No animations beyond physics simulation
- No sound effects
- No multiplayer
- No backend / server
