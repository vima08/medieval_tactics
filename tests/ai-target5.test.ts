import { expect, it } from 'vitest';
import { PRESETS } from '../src/engine';
import { playHeadless } from '../src/ai/selfplay';

it('compares completed target-five control battles across roster orders', () => {
  const configs = [
    { label: 'default', a: PRESETS[0], b: PRESETS[1] },
    { label: 'mirror', a: PRESETS[0], b: PRESETS[0] },
    { label: 'swapped', a: PRESETS[1], b: PRESETS[0] },
  ];
  const summary = configs.map(config => {
    const game = playHeadless({ map: 'highland', seed: 1, blueprintA: config.a, blueprintB: config.b, controlTarget: 5, maxCommands: 300 });
    return {
      setup: config.label,
      winner: game.winner,
      turn: game.final.turn,
      commands: game.commands.length,
      score: game.final.objective.scores,
      survivors: {
        blue: game.final.units.filter(u => u.team === 'blue' && u.alive).length,
        red: game.final.units.filter(u => u.team === 'red' && u.alive).length,
      },
      attacks: game.commands.filter(c => c.type === 'attack').length,
      positions: game.final.units.filter(u => u.alive).map(u => [u.id, u.x, u.y]),
      commanderAlive: {
        blue: game.final.units.find(u => u.team === 'blue' && u.commander)?.alive,
        red: game.final.units.find(u => u.team === 'red' && u.commander)?.alive,
      },
    };
  });
  console.log('target-five self-play', JSON.stringify(summary));
  expect(summary.every(row => row.winner && row.commands < 300)).toBe(true);
}, 120000);
