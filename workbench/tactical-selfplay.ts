import { mkdirSync, writeFileSync } from 'node:fs';
import { playHeadless } from '../src/ai/selfplay';
import { replayGame } from '../src/engine';

mkdirSync('workbench/replays', { recursive: true });
const rows = [];
for (const map of ['tutorial', 'highland'] as const) {
  for (const seed of [1, 2, 3, 4, 5, 6]) {
    const result = playHeadless({ map, seed, maxCommands: 300 });
    const initial = result.final.initial!;
    const replay = replayGame(initial, result.commands);
    if (JSON.stringify(replay) !== JSON.stringify(result.final)) throw new Error(`Replay mismatch: ${map}/${seed}`);
    const endTurns = result.commands.filter(c => c.type === 'endTurn').length;
    const row = {
      map, seed, winner: result.winner ?? null, commands: result.commands.length,
      turns: result.final.turn, endTurns,
      scores: result.final.objective.scores,
      survivors: {
        blue: result.final.units.filter(u => u.team === 'blue' && u.alive).length,
        red: result.final.units.filter(u => u.team === 'red' && u.alive).length,
      },
      byClass: result.byClass,
    };
    rows.push(row);
    writeFileSync(`workbench/replays/${map}-${seed}.json`, JSON.stringify({ initial, commands: result.commands, result: row }, null, 2));
    process.stdout.write(`${JSON.stringify(row)}\n`);
  }
}
writeFileSync('workbench/replays/summary.json', JSON.stringify(rows, null, 2));
