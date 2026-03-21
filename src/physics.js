const { Engine, Runner, Bodies, Composite, Events, Body } = Matter;

const CANVAS_W = 480;
const CANVAS_H = 600;
const WALL_T = 50;

let engine, runner, world;

/**
 * Initialises Matter.js engine and static boundary walls.
 * Call startPhysics() separately to begin simulation.
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

/** Returns all non-static bodies */
export function getBalls() {
  return Composite.allBodies(world).filter(b => !b.isStatic);
}

/** Removes all non-static bodies (for restart) */
export function clearBalls() {
  getBalls().forEach(b => Composite.remove(world, b));
}

export { engine, Events, Body, Bodies };
