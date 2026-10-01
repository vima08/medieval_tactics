import { describe, expect, it } from 'vitest';
import { searchAction } from '../src/ai/search';

type State = { score: number; turns: number };
type Action = 'gain-one' | 'gain-two' | 'end';
const adapter = {
  candidates: (s: State): Action[] => s.turns ? ['end'] : ['gain-one', 'gain-two', 'end'],
  apply: (s: State, a: Action): State => ({ score: s.score + (a === 'gain-one' ? 1 : a === 'gain-two' ? 2 : 0), turns: a === 'end' ? 1 : s.turns }),
  evaluate: (s: State) => s.score,
  key: (a: Action) => a,
  isTerminal: (s: State) => s.turns > 0,
  isEndTurn: (a: Action) => a === 'end',
};

describe('deterministic AI search', () => {
  it('takes the strongest immediate option on normal difficulty', () => {
    expect(searchAction({ score: 0, turns: 0 }, adapter, 'normal')).toBe('gain-two');
  });
  it('returns the same easy decision for the same seed', () => {
    const a = searchAction({ score: 0, turns: 0 }, adapter, 'easy', 78);
    expect(searchAction({ score: 0, turns: 0 }, adapter, 'easy', 78)).toBe(a);
  });
  it('does not search once the turn is over', () => {
    expect(searchAction({ score: 0, turns: 1 }, adapter, 'hard')).toBe('end');
  });
});
