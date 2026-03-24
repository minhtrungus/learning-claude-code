import { assert, section } from './helpers.js';
import { PLANETS, createBallDef } from '../src/ball.js';
import { resetScore, addScore, getScore, getBest } from '../src/score.js';

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

section('score.js');
resetScore();
assert('score starts at 0 after reset', getScore() === 0);
addScore(6);
assert('addScore(level) adds level*10', getScore() === 60);
addScore(3);
assert('addScore accumulates', getScore() === 90);
const best1 = getBest();
resetScore();
assert('reset clears score', getScore() === 0);
assert('best preserved after reset', getBest() === best1);

import { resetScore as resetScore2, addMerge, getCombo, resetCombo } from '../src/score.js';

section('score.js combo');
resetScore2();
resetCombo();
assert('combo starts at 1', getCombo() === 1);

addMerge(3, Date.now());
assert('first merge sets combo to 1', getCombo() === 1);

addMerge(3, Date.now() + 500);
assert('quick second merge increments combo', getCombo() === 2);

addMerge(4, Date.now() + 1000);
assert('third merge within window increments combo', getCombo() === 3);

resetCombo();
assert('resetCombo returns to 1', getCombo() === 1);
