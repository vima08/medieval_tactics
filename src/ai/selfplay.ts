import { applyAction, createGame } from '../engine';
import type { Blueprint, Command, GameState, Team } from '../engine/types';
import { chooseAiCommand, type Difficulty } from './index';

export type SelfPlayResult = {
  final: GameState;
  commands: Command[];
  winner?: Team | 'draw';
  byClass: Record<string, { deployed: number; survived: number }>;
  endedByLimit: boolean;
};

export function playHeadless(options: {
  map?: 'tutorial' | 'highland';
  seed?: number;
  difficultyBlue?: Difficulty;
  difficultyRed?: Difficulty;
  blueprintA?: Blueprint;
  blueprintB?: Blueprint;
  maxCommands?: number;
  controlTarget?: number;
} = {}): SelfPlayResult {
  let state = createGame({ map: options.map ?? 'highland', mode: 'pvp', seed: options.seed ?? 1, blueprintA: options.blueprintA, blueprintB: options.blueprintB });
  if (state.objective.kind === 'control' && options.controlTarget !== undefined) {
    state = { ...state, objective: { ...state.objective, target: options.controlTarget } };
  }
  const initialUnits = state.units.map(u => ({ archetype: u.archetype, id: u.id }));
  const commands: Command[] = [];
  const limit = options.maxCommands ?? 300;
  for (let i = 0; i < limit && !state.winner; i++) {
    const action = chooseAiCommand(state, state.team === 'blue' ? options.difficultyBlue ?? 'normal' : options.difficultyRed ?? 'normal');
    if (!action) break;
    const next = applyAction(state, action);
    commands.push(action);
    if (next === state || (next.history.length === state.history.length && !next.winner)) break;
    state = next;
  }
  const byClass: SelfPlayResult['byClass'] = {};
  for (const unit of initialUnits) {
    const stat = byClass[unit.archetype] ?? { deployed: 0, survived: 0 };
    stat.deployed++;
    if (state.units.find(u => u.id === unit.id)?.alive) stat.survived++;
    byClass[unit.archetype] = stat;
  }
  return { final: state, commands, winner: state.winner, byClass, endedByLimit: !state.winner };
}

export function runSelfPlaySeries(count = 12, options: Omit<Parameters<typeof playHeadless>[0], 'seed'> = {}) {
  const results = Array.from({ length: count }, (_, seed) => playHeadless({ ...options, seed: seed + 1 }));
  return {
    matches: count,
    wins: { blue: results.filter(r => r.winner === 'blue').length, red: results.filter(r => r.winner === 'red').length, draw: results.filter(r => !r.winner || r.winner === 'draw').length },
    averageCommands: results.reduce((sum, r) => sum + r.commands.length, 0) / Math.max(1, count),
    stalled: results.filter(r => r.endedByLimit).length,
    results,
  };
}
