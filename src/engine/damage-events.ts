import { previewAction, tileAt } from './rules';
import type { Archetype, Command, GameState, Unit } from './types';

export type DamageEvent = { unitId: string; x: number; y: number; h: number; amount: number; source: string };
const classNames: Record<Archetype, string> = {
  archer: 'Лучник', sword: 'Мечник', spear: 'Копейщик', shield: 'Щитоносец', scout: 'Разведчик', engineer: 'Инженер',
};

/** Presentation events derived from the same preview as the simulation.
 * Each cause is capped against the actual health lost, in resolution order.
 * The destination of a displacement is used for its environmental damage.
 */
export function damageEvents(before: GameState, after: GameState, command: Command): DamageEvent[] {
  const events: DamageEvent[] = [];
  const remaining = new Map(before.units.map(u => {
    const next = after.units.find(v => v.id === u.id);
    return [u.id, next ? Math.max(0, u.hp - next.hp) : 0] as const;
  }));
  if (![...remaining.values()].some(n => n > 0)) return events;
  const emit = (unit: Unit, amount: number, source: string, x = unit.x, y = unit.y, map = before.map) => {
    const effective = Math.min(Math.max(0, amount), remaining.get(unit.id) ?? 0);
    if (effective <= 0) return;
    events.push({ unitId: unit.id, x, y, h: tileAt(map, x, y)?.h ?? 0, amount: effective, source });
    remaining.set(unit.id, (remaining.get(unit.id) ?? 0) - effective);
  };
  const hazardName = (x: number, y: number) => {
    const object = tileAt(before.map, x, y)?.object;
    return object === 'trap' ? 'Ловушка' : object === 'brazier' ? 'Костёр' : 'Опасная клетка';
  };
  if (command.type !== 'endTurn' && command.type !== 'undo') {
    const actor = before.units.find(u => u.id === command.unitId);
    const p = previewAction(before, command);
    if (actor && p.valid) {
      if (command.type === 'move' || (command.type === 'ability' && actor.archetype === 'scout')) {
        emit(actor, p.hazardDamage ?? 0, hazardName(command.x, command.y), command.x, command.y);
      } else if (p.tileChange && p.targetId) {
        const victim = before.units.find(u => u.id === p.targetId);
        if (victim) emit(victim, p.damage ?? 0, 'Обрушение моста');
      } else if (p.targetId) {
        const victim = before.units.find(u => u.id === p.targetId);
        if (victim) {
          emit(victim, p.damage ?? 0, classNames[actor.archetype]);
          const x = p.push?.x ?? victim.x, y = p.push?.y ?? victim.y;
          emit(victim, p.fallDamage ?? 0, 'Падение', x, y);
          emit(victim, p.hazardDamage ?? 0, p.push ? hazardName(x, y) : 'Столкновение', x, y);
          emit(actor, p.counterDamage ?? 0, `Контратака · ${classNames[victim.archetype]}`);
        }
      }
    }
  }
  // Preserve the real HP delta if future rules add another damage source.
  // Do not guess a trap or a fall merely from the current terrain.
  for (const unit of before.units) {
    const next = after.units.find(u => u.id === unit.id);
    if (next) emit(unit, remaining.get(unit.id) ?? 0, 'Урон', next.x, next.y, after.map);
  }
  return events;
}
