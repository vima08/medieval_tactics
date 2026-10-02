import type { Archetype, Blueprint, UnitChoice, UnitRules } from './types';

export const ARCHETYPES: Record<Archetype, UnitRules> = {
  archer: { move: 3, range: 6, minRange: 2, damage: 2, hp: 4, cost: 4, description: 'Чистая линия обзора. С высоты +1 урон.', ability: 'Прицельный выстрел: +1 урон, затем стрелок не может двигаться.' },
  sword: { move: 4, range: 1, minRange: 1, damage: 3, hp: 7, cost: 4, description: 'Сильный ближний бой, держит проход.', ability: 'Толчок: 2 урона и отбрасывание на клетку.' },
  spear: { move: 3, range: 2, minRange: 1, damage: 2, hp: 6, cost: 4, description: 'Удар по прямой через союзника.', ability: 'Натиск: удар с отбрасыванием, останавливает цель.' },
  shield: { move: 2, range: 1, minRange: 1, damage: 2, hp: 9, cost: 4, description: 'Соседние союзники получают -1 урон.', ability: 'Стража: до следующего хода щитоносец получает на 1 урон меньше.' },
  scout: { move: 5, range: 1, minRange: 1, damage: 2, hp: 4, cost: 3, description: 'Быстрый обход. +1 урон по врагу рядом с союзником.', ability: 'Рывок вместо атаки: на свободную клетку в двух шагах, затем движение использовано.' },
  engineer: { move: 3, range: 3, minRange: 1, damage: 1, hp: 5, cost: 4, description: 'Ставит ловушки, ломает укрытия и мосты.', ability: 'Ловушка на соседней пустой клетке или подрыв соседнего хрупкого моста.' },
};
export const VARIANTS: Record<Archetype, { id: string; name: string; description: string; cost: number }[]> = {
  archer: [{ id: 'longbow', name: 'Дальнострел', description: '+1 дальность, -1 движение', cost: 1 }, { id: 'hunter', name: 'Охотник', description: '+1 движение, дальность -1', cost: 0 }],
  sword: [{ id: 'warden', name: 'Хранитель', description: '+1 здоровье, движение -1', cost: 1 }, { id: 'duelist', name: 'Дуэлянт', description: '+1 урон по одинокой цели, -1 здоровье', cost: 1 }],
  spear: [{ id: 'pike', name: 'Пикинёр', description: 'Дальность 3 по прямой, движение -1', cost: 1 }, { id: 'raider', name: 'Налётчик', description: '+1 движение, -1 здоровье', cost: 0 }],
  shield: [{ id: 'tower', name: 'Башня', description: '+2 здоровье, движение -1', cost: 1 }, { id: 'escort', name: 'Конвоир', description: '+1 движение, защита соседей только в страже', cost: 0 }],
  scout: [{ id: 'runner', name: 'Бегун', description: '+1 движение, -1 здоровье', cost: 0 }, { id: 'ambusher', name: 'Засадник', description: '+1 урон по цели на опасной клетке', cost: 1 }],
  engineer: [{ id: 'sapper', name: 'Сапёр', description: 'Ловушки наносят +1 урон', cost: 1 }, { id: 'mason', name: 'Каменщик', description: 'Укрепляет укрытие и мост', cost: 0 }],
};
export const MODIFIERS = {
  heavy: { name: 'Тяжёлый', description: 'Не отбрасывается, -1 движение', cost: 1 },
  swift: { name: 'Стремительный', description: '+1 движение, -1 здоровье', cost: 1 },
  veteran: { name: 'Ветеран', description: '+1 здоровье, +1 стоимость', cost: 2 },
} as const;
export const ARTIFACTS = {
  hook: { name: 'Крюк ущелья', description: 'Толчок отбрасывает ещё на клетку, если она свободна', cost: 2 },
  boots: { name: 'Сапоги склона', description: 'Подъём на один уровень не требует доплаты', cost: 2 },
  ember: { name: 'Угольный знак', description: '+1 урон по цели у костра или в ловушке', cost: 1 },
  standard: { name: 'Полевой стяг', description: 'Союзники рядом наносят +1 урон', cost: 2 },
} as const;
export const BUDGET = 25;
export const PRESETS: Blueprint[] = [
  { name: 'Каменный дозор', units: [{ archetype: 'shield', variant: 'escort' }, { archetype: 'sword', variant: 'duelist' }, { archetype: 'spear', variant: 'pike' }, { archetype: 'archer', variant: 'hunter' }, { archetype: 'scout', variant: 'runner' }] },
  { name: 'Стражи перевала', units: [{ archetype: 'shield', variant: 'tower' }, { archetype: 'spear', variant: 'raider' }, { archetype: 'archer', variant: 'longbow' }, { archetype: 'engineer', variant: 'sapper' }, { archetype: 'scout', variant: 'runner' }] },
  { name: 'Быстрый удар', units: [{ archetype: 'sword', variant: 'warden' }, { archetype: 'scout', variant: 'ambusher' }, { archetype: 'spear', variant: 'raider' }, { archetype: 'archer', variant: 'hunter' }, { archetype: 'engineer', variant: 'mason' }] },
];
export function choiceCost(c: UnitChoice): number { return ARCHETYPES[c.archetype].cost + (VARIANTS[c.archetype].find(v => v.id === c.variant)?.cost ?? 0) + (c.modifier ? MODIFIERS[c.modifier as keyof typeof MODIFIERS]?.cost ?? 0 : 0) + (c.artifact ? ARTIFACTS[c.artifact as keyof typeof ARTIFACTS]?.cost ?? 0 : 0); }
export function rosterCost(b: Blueprint): number { return b.units.reduce((n, c) => n + choiceCost(c), 0); }
export function validateBlueprint(b: Blueprint, options: {minUnits?:number} = {}): string[] {
  const errors: string[] = [];
  const minimum = options.minUnits ?? 3;
  if (b.units.length < minimum || b.units.length > 5) errors.push(`Отряд: от ${minimum} до 5 бойцов`);
  if (rosterCost(b) > BUDGET) errors.push(`Бюджет ${BUDGET} превышен`);
  if (b.units.filter(u => !!u.artifact).length > 2) errors.push('В отряде не более двух артефактов');
  for (const c of b.units) {
    if (!ARCHETYPES[c.archetype]) errors.push(`Неизвестный класс: ${c.archetype}`);
    if (c.variant && !VARIANTS[c.archetype]?.some(v => v.id === c.variant)) errors.push(`Неизвестная специализация: ${c.variant}`);
    if (c.modifier && !MODIFIERS[c.modifier as keyof typeof MODIFIERS]) errors.push(`Неизвестный модификатор: ${c.modifier}`);
    if (c.artifact && !ARTIFACTS[c.artifact as keyof typeof ARTIFACTS]) errors.push(`Неизвестный артефакт: ${c.artifact}`);
    if (c.archetype === 'scout' && c.modifier === 'heavy') errors.push('Тяжёлое снаряжение несовместимо с разведчиком');
    if (c.archetype === 'shield' && c.modifier === 'swift') errors.push('Щитоносец не может взять стремительный модификатор');
    if (c.artifact === 'hook' && !['sword', 'spear'].includes(c.archetype)) errors.push('Крюк доступен только мечнику и копейщику');
    if (c.artifact === 'standard' && c.archetype === 'scout') errors.push('Разведчик не несёт стяг');
  }
  return errors;
}
