import { describe, expect, it } from 'vitest';
import { applyAction, createGame, replayGame, restoreGame, serializeGame } from '../src/engine';
import type { GameState, ObjectiveKind } from '../src/engine';

const game = (objective: ObjectiveKind) => createGame({ map: 'highland', mode: 'pvp', seed: 31, objective });
const redCommander = (s: GameState) => s.units.find(u => u.team === 'red' && u.commander)!;

describe('selectable match objectives', () => {
  it('preserves default objectives on both maps', () => {
    expect(createGame({ map: 'tutorial', mode: 'pvp' }).objective.kind).toBe('commander');
    expect(createGame({ map: 'highland', mode: 'pvp' }).objective.kind).toBe('control');
  });

  it('commander victory does not require eliminating the remaining fighters', () => {
    const s = game('commander');
    redCommander(s).alive = false;
    expect(s.units.some(u => u.team === 'red' && u.alive)).toBe(true);
    expect(applyAction(s, { type: 'endTurn' }).winner).toBe('blue');
  });

  it('control does not end when a commander dies, but still ends on a full team wipe', () => {
    const s = game('control');
    redCommander(s).alive = false;
    const ongoing = applyAction(s, { type: 'endTurn' });
    expect(ongoing.winner).toBeUndefined();
    for (const u of ongoing.units) if (u.team === 'red') u.alive = false;
    expect(applyAction(ongoing, { type: 'endTurn' }).winner).toBe('blue');
  });

  it('elimination continues after commander death and ends on the last fighter', () => {
    const s = game('elimination');
    redCommander(s).alive = false;
    const ongoing = applyAction(s, { type: 'endTurn' });
    expect(ongoing.winner).toBeUndefined();
    for (const u of ongoing.units) if (u.team === 'red') u.alive = false;
    expect(applyAction(ongoing, { type: 'endTurn' }).winner).toBe('blue');
  });

  it('uses surviving fighter count, then remaining HP at the round cap', () => {
    const count = game('elimination');
    count.turn = 12;
    count.units.find(u => u.team === 'red' && !u.commander)!.alive = false;
    const countEnd = applyAction(applyAction(count, { type: 'endTurn' }), { type: 'endTurn' });
    expect(countEnd.winner).toBe('blue');

    const hp = game('commander');
    hp.turn = 12;
    hp.units.find(u => u.team === 'blue' && !u.commander)!.hp = 1;
    const hpEnd = applyAction(applyAction(hp, { type: 'endTurn' }), { type: 'endTurn' });
    expect(hpEnd.winner).toBe('red');

    const draw = game('elimination');
    draw.turn = 12;
    expect(applyAction(applyAction(draw, { type: 'endTurn' }), { type: 'endTurn' }).winner).toBe('draw');
  });

  it('serializes and replays each selected objective deterministically', () => {
    for (const objective of ['control', 'commander', 'elimination'] as const) {
      const s = game(objective);
      const played = applyAction(applyAction(s, { type: 'endTurn' }), { type: 'endTurn' });
      expect(played.initial?.objective).toBe(objective);
      expect(restoreGame(serializeGame(played))).toEqual(played);
      expect(replayGame(s.initial!, played.history)).toEqual(played);
    }
  });
});
