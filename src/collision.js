import { removeFromWorld, addToWorld, engine, Events, Body, Bodies } from './physics.js';
import { PLANETS } from './ball.js';
import { addScore } from './score.js';

/**
 * Registers the collision listener on the Matter.js engine.
 * When two same-level balls collide, merges them into the next level.
 * @param {((body: Matter.Body) => void) | null} onMerge - called with the new merged body
 */
export function setupCollisionListener(onMerge) {
  Events.on(engine, 'collisionStart', (event) => {
    for (const pair of event.pairs) {
      const { bodyA, bodyB } = pair;

      // Skip walls and already-merging bodies
      if (bodyA.isStatic || bodyB.isStatic) continue;
      if (bodyA.gameData?.ismerging || bodyB.gameData?.ismerging) continue;
      if (!bodyA.gameData || !bodyB.gameData) continue;

      const levelA = bodyA.gameData.level;
      const levelB = bodyB.gameData.level;

      if (levelA !== levelB) continue;
      if (levelA >= 10) continue; // Sun cannot merge

      // Mark both to prevent double-fire in the same tick
      bodyA.gameData.ismerging = true;
      bodyB.gameData.ismerging = true;

      const newLevel = levelA + 1;
      const newPlanet = PLANETS[newLevel - 1];
      const mx = (bodyA.position.x + bodyB.position.x) / 2;
      const my = (bodyA.position.y + bodyB.position.y) / 2;

      // Defer to next tick to avoid mutating world during collision event
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
