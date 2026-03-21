import { assert, section } from './helpers.js';
import { PLANETS, createBallDef } from '../src/ball.js';

section('ball.js — PLANETS table');
assert('has 10 planets', PLANETS.length === 10);
assert('level 1 is Meteorite', PLANETS[0].name === 'Meteorite');
assert('level 10 is Sun', PLANETS[9].name === 'Sun');
assert('radii increase with level', PLANETS.every((p, i) => i === 0 || p.radius > PLANETS[i - 1].radius));

section('ball.js — createBallDef');
const def = createBallDef(3);
assert('createBallDef returns correct level', def.level === 3);
assert('createBallDef returns correct radius', def.radius === PLANETS[2].radius);
assert('createBallDef returns color string', typeof def.color === 'string');

const randomDefs = Array.from({ length: 50 }, () => createBallDef());
assert('random ball is always level 1–5', randomDefs.every(d => d.level >= 1 && d.level <= 5));
