import { describe, expect, it } from 'vitest';
import { applyAction, createGame, tileAt } from '../src/engine';
import { damageEvents } from '../src/engine/damage-events';
import type { Command, GameState } from '../src/engine';

function arena(): GameState {
  const state = createGame({ map: 'tutorial', mode: 'pvp' });
  for (const tile of state.map.tiles) { tile.h = 0; tile.terrain = 'grass'; tile.object = undefined; }
  for (const unit of state.units) unit.alive = false;
  const a = state.units[0], b = state.units.find(u => u.team === 'red')!;
  Object.assign(a, { alive: true, archetype: 'sword', variant: 'warden', x: 2, y: 3, hp: 8 });
  Object.assign(b, { alive: true, archetype: 'sword', variant: 'warden', x: 3, y: 3, hp: 8 });
  return state;
}
function resolve(state: GameState, command: Command) {
  const after = applyAction(state, command);
  const events = damageEvents(state, after, command);
  for (const unit of state.units) {
    expect(events.filter(e => e.unitId === unit.id).reduce((n, e) => n + e.amount, 0))
      .toBe(Math.max(0, unit.hp - after.units.find(u => u.id === unit.id)!.hp));
  }
  return events;
}

describe('damage source presentation', () => {
  it('labels a consumed movement trap at the destination, capped to lethal HP', () => {
    const state = arena(), actor = state.units[0]; actor.hp = 1;
    tileAt(state.map, 2, 4)!.object = 'trap';
    const events = resolve(state, { type: 'move', unitId: actor.id, x: 2, y: 4 });
    expect(events).toEqual([{ unitId: actor.id, x: 2, y: 4, h: 0, amount: 1, source: 'Ловушка' }]);
  });
  it('labels brazier and scout dash damage at the landing cell', () => {
    const state = arena(), actor = state.units[0]; actor.archetype = 'scout';
    tileAt(state.map, 2, 5)!.object = 'brazier';
    expect(resolve(state, { type: 'ability', unitId: actor.id, x: 2, y: 5 })[0])
      .toMatchObject({ x: 2, y: 5, amount: 1, source: 'Костёр' });
  });
  it('separates spear damage, fall and trap in simulation order', () => {
    const state = arena(), actor = state.units[0], victim = state.units.find(u => u.team === 'red')!;
    actor.archetype = 'spear'; actor.variant = 'raider';
    tileAt(state.map, 2, 3)!.h = 2; tileAt(state.map, 3, 3)!.h = 2;
    tileAt(state.map, 4, 3)!.object = 'trap';
    expect(resolve(state, { type: 'ability', unitId: actor.id, x: 3, y: 3 }).map(e => [e.source, e.amount, e.x, e.h]))
      .toEqual([['Копейщик', 2, 3, 2], ['Падение', 2, 4, 0], ['Ловушка', 2, 4, 0]]);
    victim.hp = 3;
    expect(resolve(state, { type: 'ability', unitId: actor.id, x: 3, y: 3 }).map(e => [e.source, e.amount]))
      .toEqual([['Копейщик', 2], ['Падение', 1]]);
  });
  it('shows collision rather than a trap when a push cannot reach the trap cell', () => {
    const state = arena(), actor = state.units[0];
    tileAt(state.map, 4, 3)!.object = 'trap'; tileAt(state.map, 4, 3)!.terrain = 'water';
    expect(resolve(state, { type: 'ability', unitId: actor.id, x: 3, y: 3 }).map(e => [e.source, e.amount]))
      .toEqual([['Мечник', 2], ['Столкновение', 1]]);
  });
  it('labels counterattack on the attacker and does not infer stationary trap damage', () => {
    const state = arena(), actor = state.units[0], victim = state.units.find(u => u.team === 'red')!;
    victim.guard = true; tileAt(state.map, 3, 3)!.object = 'trap';
    const events = resolve(state, { type: 'attack', unitId: actor.id, x: 3, y: 3 });
    expect(events.map(e => [e.unitId, e.source, e.amount])).toEqual([
      [victim.id, 'Мечник', 2], [actor.id, 'Контратака · Мечник', 1],
    ]);
  });
  it('caps lethal attack damage and excludes unapplied push hazards', () => {
    const state = arena(), actor = state.units[0], victim = state.units.find(u => u.team === 'red')!;
    victim.hp = 1; tileAt(state.map, 4, 3)!.object = 'trap';
    expect(resolve(state, { type: 'ability', unitId: actor.id, x: 3, y: 3 }).map(e => [e.source, e.amount]))
      .toEqual([['Мечник', 1]]);
  });
  it('labels occupied bridge destruction and preserves the original bridge height', () => {
    const state = arena(), actor = state.units[0], victim = state.units.find(u => u.team === 'red')!;
    actor.archetype = 'engineer';
    Object.assign(tileAt(state.map, 3, 3)!, { terrain: 'bridge', object: 'fragile', hp: 2, h: 1 });
    expect(resolve(state, { type: 'ability', unitId: actor.id, x: 3, y: 3 }))
      .toEqual([{ unitId: victim.id, x: 3, y: 3, h: 1, amount: 8, source: 'Обрушение моста' }]);
  });
  it('emits nothing for end turn or movement without damage', () => {
    const state = arena();
    expect(resolve(state, { type: 'endTurn' })).toEqual([]);
    expect(resolve(state, { type: 'move', unitId: state.units[0].id, x: 2, y: 4 })).toEqual([]);
  });
});
