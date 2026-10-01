import { mkdirSync, writeFileSync } from 'node:fs';
import { PRESETS, replayGame } from '../src/engine';
import { playHeadless } from '../src/ai/selfplay';

mkdirSync('workbench/replays', { recursive: true });
const scenarios = [
  { name: 'mirror-normal', blueprintA: PRESETS[0], blueprintB: PRESETS[0], difficultyBlue: 'normal', difficultyRed: 'normal' },
  { name: 'swap-normal', blueprintA: PRESETS[1], blueprintB: PRESETS[0], difficultyBlue: 'normal', difficultyRed: 'normal' },
  { name: 'mirror-hard', blueprintA: PRESETS[0], blueprintB: PRESETS[0], difficultyBlue: 'hard', difficultyRed: 'hard' },
] as const;
for (const scenario of scenarios) {
  const result = playHeadless({ map: 'highland', seed: 1, maxCommands: 300, ...scenario });
  const initial = result.final.initial!;
  if (JSON.stringify(replayGame(initial, result.commands)) !== JSON.stringify(result.final)) throw new Error(`Replay mismatch: ${scenario.name}`);
  const row = { scenario: scenario.name, winner: result.winner ?? null, commands: result.commands.length, turn: result.final.turn,
    scores: result.final.objective.scores,
    survivors: { blue: result.final.units.filter(u => u.team === 'blue' && u.alive).length, red: result.final.units.filter(u => u.team === 'red' && u.alive).length } };
  writeFileSync(`workbench/replays/${scenario.name}.json`, JSON.stringify({ initial, commands: result.commands, result: row }, null, 2));
  process.stdout.write(`${JSON.stringify(row)}\n`);
}
