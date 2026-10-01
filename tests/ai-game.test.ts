import { describe, expect, it } from 'vitest';
import { applyAction, createGame, previewAction } from '../src/engine';
import { aiCandidates, chooseAiCommand, evaluatePosition } from '../src/ai';
import { playHeadless } from '../src/ai/selfplay';

describe('AI against actual rules', () => {
  it('chooses legal, reproducible commands from visible state', () => {
    const game = createGame({ map: 'highland', mode: 'ai', seed: 17 });
    const action = chooseAiCommand(game, 'normal');
    expect(action).toEqual(chooseAiCommand(game, 'normal'));
    expect(action).not.toBeNull();
    expect(previewAction(game, action! ).valid).toBe(true);
    expect(aiCandidates(game).length).toBeGreaterThan(1);
  });

  it('values a secured objective and a healthy commander', () => {
    const game = createGame({ map: 'highland', mode: 'ai' });
    game.units = game.units.filter(u => u.team === 'blue');
    const baseline = evaluatePosition(game, 'blue');
    const holding = structuredClone(game);
    holding.units[0].x = game.objective.points[0].x;
    holding.units[0].y = game.objective.points[0].y;
    expect(evaluatePosition(holding, 'blue')).toBeGreaterThan(baseline);
    holding.units[0].hp = 1;
    expect(evaluatePosition(holding, 'blue')).toBeLessThan(evaluatePosition({ ...holding, units: holding.units.map((u, i) => i === 0 ? { ...u, hp: u.maxHp } : u) }, 'blue'));
  });

  it('runs a headless sequence without invalid commands', () => {
    const result = playHeadless({ map: 'tutorial', seed: 4, maxCommands: 36 });
    expect(result.commands.length).toBeGreaterThan(8);
    expect(result.final.history.length).toBe(result.commands.length);
  });

  it('completes a tutorial battle headlessly', () => {
    const result = playHeadless({ map: 'tutorial', seed: 6, maxCommands: 180 });
    expect(result.winner).toBeDefined();
    expect(result.commands.length).toBeLessThan(180);
  });

  it('completes a highland control battle headlessly', () => {
    const result = playHeadless({ map: 'highland', seed: 3, maxCommands: 300 });
    expect(result.winner).toBeDefined();
    expect(result.commands.length).toBeLessThan(300);
    expect(result.commands.some(action => action.type === 'attack')).toBe(true);
  }, 90000);

  it('defends an imminent scoring threat without vacating its home point', () => {
    let state = createGame({ map: 'highland', mode: 'pvp', seed: 1 });
    state.team = 'red';
    state.turn = 2;
    state.objective.scores.blue = 1;
    const positions: Record<string, [number, number]> = {
      'blue-2': [3, 9], 'blue-5': [8, 9], 'red-2': [14, 9], 'red-5': [13, 8],
    };
    state.units = state.units.map(u => positions[u.id] ? { ...u, x: positions[u.id][0], y: positions[u.id][1] } : u);
    const first = chooseAiCommand(state, 'normal');
    expect(first).not.toEqual({ type: 'move', unitId: 'red-2', x: 14, y: 8 });
    let redCommands = 0;
    while (!state.winner && state.team === 'red' && redCommands < 20) {
      const action = chooseAiCommand(state, 'normal')!;
      state = applyAction(state, action);
      redCommands++;
    }
    expect(state.units.some(u => u.team === 'red' && u.alive && u.x === 14 && u.y === 9)).toBe(true);
    const runner = state.units.find(u => u.id === 'red-5')!;
    expect(Math.abs(runner.x - 8) + Math.abs(runner.y - 9)).toBeLessThanOrEqual(3);
  }, 20000);
});
