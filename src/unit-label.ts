import type { Unit } from './engine/types';

/** Display-only alias for saves from the earlier story; never mutate a replay. */
export function campaignUnitName(unit: Unit): string | undefined {
  return unit.name?.replace(/^Мира(?=,|$)/, 'Мирон');
}
