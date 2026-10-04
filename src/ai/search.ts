/** Small, deterministic beam search over the same commands available to a player. */
export type Difficulty = 'easy' | 'normal' | 'hard';

export interface SearchAdapter<S, A> {
  candidates(state: S): readonly A[];
  apply(state: S, action: A): S;
  evaluate(state: S): number;
  /** Visible tactical costs not represented by the resulting board (consumed hazards). */
  actionCost?(state: S, action: A, next: S): number;
  key(action: A): string;
  isTerminal(state: S): boolean;
  isEndTurn(action: A): boolean;
}

function hash(value: string): number {
  let result = 2166136261;
  for (let i = 0; i < value.length; i++) {
    result ^= value.charCodeAt(i);
    result = Math.imul(result, 16777619);
  }
  return result >>> 0;
}

export function searchAction<S, A>(
  state: S,
  adapter: SearchAdapter<S, A>,
  difficulty: Difficulty = 'normal',
  seed = 0,
): A | null {
  const choices = adapter.candidates(state);
  if (choices.length === 0) return null;
  const base = adapter.evaluate(state);
  const ranked = choices.map(action => {
    const next = adapter.apply(state, action);
    const cost = adapter.actionCost?.(state, action, next) ?? 0;
    const delta = adapter.evaluate(next) - base - cost;
    return { action, next, delta, cost, key: adapter.key(action) };
  });
  ranked.sort((a, b) => b.delta - a.delta || a.key.localeCompare(b.key));

  if (difficulty === 'easy') {
    // Controlled fallibility: occasionally selects a near-best move, never a wild one.
    const close = ranked.filter(entry => entry.delta >= ranked[0].delta - 5).slice(0, 4);
    return close[hash(`${seed}:${close.map(entry => entry.key).join('|')}`) % close.length].action;
  }
  if (difficulty === 'normal') return ranked[0].action;

  let best = ranked[0];
  let bestScore = -Infinity;
  // A short same-turn lookahead rewards combinations without delaying the UI.
  for (const entry of ranked.slice(0, 12)) {
    let score = entry.delta;
    if (!adapter.isEndTurn(entry.action) && !adapter.isTerminal(entry.next)) {
      const replies = adapter.candidates(entry.next);
      for (const reply of replies) {
        if (adapter.isEndTurn(reply)) continue;
        const next = adapter.apply(entry.next, reply);
        const follow = adapter.evaluate(next) - base - entry.cost - (adapter.actionCost?.(entry.next, reply, next) ?? 0);
        score = Math.max(score, follow * 0.93);
      }
    }
    if (score > bestScore || (score === bestScore && entry.key < best.key)) {
      bestScore = score;
      best = entry;
    }
  }
  return best.action;
}
