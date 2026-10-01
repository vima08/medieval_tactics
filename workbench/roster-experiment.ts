import { mkdirSync, writeFileSync } from 'node:fs';
import { playHeadless } from '../src/ai/selfplay';
import { BUDGET, PRESETS, rosterCost, validateBlueprint } from '../src/engine/catalog';
import { replayGame } from '../src/engine';
import type { Blueprint, Team } from '../src/engine/types';
import type { Difficulty } from '../src/ai';

const baseline = PRESETS[0];
const incumbent = PRESETS[1];
const replace = (source: Blueprint, index: number, choice: Blueprint['units'][number], name: string): Blueprint => ({
  name, units: source.units.map((unit, i) => i === index ? choice : { ...unit }),
});
const sword = replace(incumbent, 3, { archetype: 'sword', variant: 'duelist' }, 'Sword for engineer');
const mobileSword: Blueprint = {
  name: 'Sword and mobile flank',
  units: sword.units.map((unit, i) => i === 0 ? { archetype: 'shield', variant: 'escort' }
    : i === 2 ? { archetype: 'archer', variant: 'hunter' } : { ...unit }),
};
const mobileEngineer: Blueprint = {
  name: 'Mobile engineer',
  units: incumbent.units.map((unit, i) => i === 0 ? { archetype: 'shield', variant: 'escort' }
    : i === 2 ? { archetype: 'archer', variant: 'hunter' } : { ...unit }),
};
const candidates = { incumbent, sword, mobileSword, mobileEngineer };
const difficulties: [Difficulty, Difficulty][] = [
  ['normal', 'normal'], ['hard', 'hard'], ['hard', 'normal'], ['normal', 'hard'],
];
const outDir = 'workbench/roster-experiment-replays';
mkdirSync(outDir, { recursive: true });
const rows = [];
for (const [candidateId, candidate] of Object.entries(candidates)) {
  const errors = validateBlueprint(candidate);
  if (errors.length || rosterCost(candidate) > BUDGET) throw new Error(`${candidateId}: ${errors.join('; ')}`);
  for (const [difficultyBlue, difficultyRed] of difficulties) {
    for (const candidateTeam of ['blue', 'red'] as Team[]) {
      const id = `${candidateId}-${candidateTeam}-${difficultyBlue[0]}${difficultyRed[0]}`;
      const result = playHeadless({
        map: 'highland', seed: 1, maxCommands: 300, controlTarget: 5,
        difficultyBlue, difficultyRed,
        blueprintA: candidateTeam === 'blue' ? candidate : baseline,
        blueprintB: candidateTeam === 'red' ? candidate : baseline,
      });
      const initial = result.final.initial!;
      const replayed = replayGame(initial, result.commands);
      if (JSON.stringify(replayed) !== JSON.stringify(result.final)) throw new Error(`Replay mismatch: ${id}`);
      const row = {
        id, candidateId, candidateTeam, difficultyBlue, difficultyRed,
        cost: rosterCost(candidate), winner: result.winner ?? null,
        candidateWon: result.winner === candidateTeam,
        turn: result.final.turn, commands: result.commands.length,
        scores: result.final.objective.scores,
        survivors: {
          blue: result.final.units.filter(u => u.team === 'blue' && u.alive).length,
          red: result.final.units.filter(u => u.team === 'red' && u.alive).length,
        },
        endedByLimit: result.endedByLimit,
      };
      rows.push(row);
      writeFileSync(`${outDir}/${id}.json`, JSON.stringify({ initial, controlTarget: 5, commands: result.commands, result: row }, null, 2));
      process.stdout.write(`${JSON.stringify(row)}\n`);
    }
  }
}
writeFileSync(`${outDir}/summary.json`, JSON.stringify({
  baseline: { name: baseline.name, cost: rosterCost(baseline), units: baseline.units },
  candidates: Object.fromEntries(Object.entries(candidates).map(([id, blueprint]) => [id, { cost: rosterCost(blueprint), units: blueprint.units }])),
  rows,
}, null, 2));
