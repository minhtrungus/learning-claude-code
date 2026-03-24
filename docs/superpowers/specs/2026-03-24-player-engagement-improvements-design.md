# Player Engagement Improvements — Design Spec

**Date:** 2026-03-24
**Status:** Approved

---

## Overview

Add four high-impact engagement features to Planet Merge Game: sound effects, combo system, particle effects, and achievements. These transform a quiet, solitary experience into something satisfying and rewarding.

---

## Stack Additions

- **Audio:** Web Audio API (programmatic sounds, no external files)
- **Particles:** Custom lightweight particle system (separate from Matter.js)
- **Persistence:** localStorage for achievements and mute preference

---

## File Structure Additions

```
src/
├── audio.js        # Web Audio sound generation, mute toggle
├── particles.js    # Particle system: spawn, update, render
└── achievements.js # Achievement definitions, unlock tracking, toast display
```

Existing files modified:
- `src/score.js` — add combo tracking logic
- `src/ui.js` — render particles, combo indicator, mute button, achievement toast
- `src/collision.js` — trigger audio and particles on merge
- `src/main.js` — init new modules, wire achievement checks
- `index.html` — add mute button, achievement button, toast container
- `style.css` — style new UI elements

---

## Feature 1: Sound Effects

### Architecture

New `src/audio.js` module using Web Audio API. Sounds generated programmatically using oscillators and gain envelopes — no external audio files.

### Sounds

| Event | Sound | Implementation |
|-------|-------|----------------|
| Drop | Short "plop" | Low sine wave (150Hz), quick decay (100ms) |
| Merge | Rising "ding" | Sine wave, frequency based on level (200Hz + level×50), decay 200ms |
| Combo | Chime layer | Higher sine (600Hz + combo×100), decay 150ms, played with merge |
| Game Over | Descending tone | Descending frequency sweep, sad feel |
| Achievement | Arpeggio | 3-note ascending (C-E-G), 100ms each |

### User Control

- Mute button in header (speaker icon toggle)
- Mute state persists in localStorage
- `AudioContext` created on first user interaction (browser autoplay policy)

### API

```js
export function initAudio();           // Call on first interaction
export function playDrop();            // Drop sound
export function playMerge(level);      // Merge sound (pitch scales with level)
export function playCombo(level);      // Combo chime
export function playGameOver();        // Game over sound
export function playAchievement();     // Achievement arpeggio
export function isMuted();             // Get mute state
export function toggleMute();          // Toggle mute, returns new state
```

---

## Feature 2: Combo System

### Mechanics

- Track merge timestamps in `src/score.js`
- If two merges occur within **2 seconds**, increment combo counter
- Combo resets after 2 seconds of no merges
- Score multiplier: `comboLevel × basePoints`
  - basePoints = `newLevel × 10`
  - combo 1 = x1 (no bonus), combo 2 = x2, etc.
- Max combo: x10
- Combo displayed only when combo > 1

### Display

- Combo indicator appears near score when active
- Format: "COMBO x3"
- Fades out after combo ends (combo = 1 or timeout)
- Text briefly scales up when combo increases

### API (score.js additions)

```js
export function addMerge(level, timestamp);  // Returns { points, combo }
export function getCombo();                   // Current combo level
export function resetCombo();                 // Called on game over/restart
```

### Data Flow

```
collision.js detects merge
  → score.addMerge(level, Date.now())
  → returns { points, combo }
  → if combo > 1: audio.playCombo(combo), ui.showCombo(combo)
  → collision.js triggers particles + audio.playMerge(level)
```

---

## Feature 3: Particle Effects

### Architecture

New `src/particles.js` module. Simple particle system managed separately from Matter.js physics.

### Behavior

- On merge, spawn 8-12 particles at merge position
- Particles are small circles (3-6px radius, randomized)
- Color matches the merged planet's color (next level)
- Explode outward with random velocity (angle spread 360°, speed 2-5)
- Fade out over 300-500ms (alpha decays per frame)
- Rendered on canvas after balls, before HUD

### Data Structure

```js
particle = {
  x: number,      // position x
  y: number,      // position y
  vx: number,     // velocity x
  vy: number,     // velocity y
  radius: number, // 3-6
  color: string,  // hex color
  alpha: number,  // 1.0 → 0.0
  decay: number   // alpha reduction per frame
}
```

### Performance

- Max 100 particles active at once
- Particles removed when alpha <= 0
- Particle array cleared on game restart

### API

```js
export function spawnParticles(x, y, color, count);  // Create particles
export function updateParticles();                    // Update positions/alpha
export function renderParticles(ctx);                 // Draw to canvas
export function clearParticles();                     // Clear all (restart)
```

### Integration

- `collision.js` calls `spawnParticles()` after merge
- `ui.js` calls `updateParticles()` and `renderParticles()` in draw loop
- `main.js` calls `clearParticles()` on restart

---

## Feature 4: Achievements

### Architecture

New `src/achievements.js` module. Tracks and persists unlocked achievements in localStorage.

### Achievement Definitions

| ID | Name | Description | Condition |
|----|------|-------------|-----------|
| `first_merge` | First Merge | Merge two planets | Any merge |
| `first_sun` | Solar Power | Create a Sun | Merge to level 10 |
| `combo_3` | Triple Threat | Chain 3 merges | Combo reaches x3 |
| `combo_5` | Chain Reaction | Chain 5 merges | Combo reaches x5 |
| `score_1000` | High Scorer | Score 1000+ points | Score >= 1000 |
| `score_5000` | Master | Score 5000+ points | Score >= 5000 |

### Display

**Toast Notification:**
- Slides in from top center when unlocked
- Format: "🏆 [Name]"
- Auto-dismisses after 3 seconds
- Multiple unlocks queue sequentially

**Achievement List:**
- Button in header (trophy icon) opens modal
- Shows all achievements with locked/unlocked status
- Unlocked shows checkmark + unlock date
- Locked shows lock icon + hint

### Persistence

- Achievements stored in localStorage as `planet_merge_achievements`
- Format: `{ [id]: { unlocked: boolean, unlockedAt: timestamp } }`

### API

```js
export function checkMerge(level, combo);      // Check merge-related achievements
export function checkScore(score);             // Check score achievements
export function getAchievements();             // Return all with status
export function isUnlocked(id);                // Check specific achievement
export function renderToast(container);        // Show toast notification
```

### Integration

- `collision.js` calls `checkMerge(level, combo)` after merge
- `main.js` calls `checkScore(score)` after score changes
- `ui.js` handles toast rendering

---

## UI Changes

### Header Additions

```
┌─────────────────────────────────────┐
│ 🔊 SCORE: 120  BEST: 500  🏆  │  ← Mute + Trophy buttons added
├─────────────────────────────────────┤
│         COMBO x3                    │  ← Combo indicator (when active)
│- - - - - - - - - - - -│
```

### Toast Container

```html
<div id="toast-container"></div>
```
- Fixed position, top center, z-index above everything
- Toasts stack vertically, oldest at top

### Achievement Modal

```html
<div id="achievement-modal" class="hidden">
  <div class="modal-content">
    <h2>Achievements</h2>
    <ul id="achievement-list"></ul>
    <button id="close-achievements">Close</button>
  </div>
</div>
```

---

## Data Flow Summary

```
User drops ball
  → main.js: handleDrop()
  → audio.js: playDrop()

Ball collides with same-level ball
  → collision.js: detects collision
  → particles.js: spawnParticles(x, y, color)
  → score.js: addMerge(level, timestamp) → returns { points, combo }
  → audio.js: playMerge(level)
  → if combo > 1: audio.js: playCombo(combo)
  → achievements.js: checkMerge(level, combo)
  → ui.js: update combo display

Score threshold crossed
  → main.js: checks after score change
  → achievements.js: checkScore(score)

Achievement unlocked
  → achievements.js: updates localStorage, queues toast
  → ui.js: shows toast notification
  → audio.js: playAchievement()
```

---

## Out of Scope

- No online leaderboards
- No social sharing
- No sound customization (volume, different sounds)
- No animation for achievement unlock beyond toast
