import { registerHooks } from 'node:module';
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';

registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier.startsWith('.') && !/\.[cm]?[jt]s$/.test(specifier)) {
      try { return nextResolve(`${specifier}.ts`, context); } catch {}
      try { return nextResolve(`${specifier}/index.ts`, context); } catch {}
    }
    return nextResolve(specifier, context);
  },
});

const { createGame, applyAction } = await import('../src/engine/rules.ts');
const dirs = ['workbench/round2-replays', 'workbench/roster-experiment-replays'];
const rows = [];
for (const dir of dirs) {
  for (const file of readdirSync(dir).filter(name => name.endsWith('.json') && name !== 'summary.json' && !name.startsWith('tutorial-'))) {
    const replay = JSON.parse(readFileSync(`${dir}/${file}`, 'utf8'));
    const state0 = createGame(replay.initial);
    let state = state0;
    const rounds = [];
    const cumulative = {blue: 0, red: 0};
    let hypothetical = null;
    let previous = {blue: 0, red: 0};
    let resetCount = 0;
    for (const [index, command] of replay.commands.entries()) {
      if (command.type === 'endTurn' && state.team === 'red') {
        const held = {blue: 0, red: 0};
        for (const point of state.objective.points) {
          const unit = state.units.find(u => u.alive && u.x === point.x && u.y === point.y);
          if (unit) held[unit.team]++;
        }
        for (const team of ['blue', 'red']) {
          if (held[team] >= 2) cumulative[team]++;
          if (held[team] < 2 && previous[team] > 0) resetCount++;
        }
        previous = { ...state.objective.scores };
        if (!hypothetical && (cumulative.blue >= state.objective.target || cumulative.red >= state.objective.target) && cumulative.blue !== cumulative.red) {
          hypothetical = {round: state.turn, command: index + 1, winner: cumulative.blue > cumulative.red ? 'blue' : 'red', score: {...cumulative}};
        }
        rounds.push({round: state.turn, held, cumulative: {...cumulative}});
      }
      state = applyAction(state, command);
    }
    rows.push({source: `${dir}/${file}`, originalWinner: state.winner ?? replay.result?.winner ?? null, originalTurn: state.turn, originalScore: state.objective.scores,
      hypothetical, cumulativeAtOriginalEnd: cumulative, resetCount, rounds,
      commanderDeath: state.units.some(u => u.commander && !u.alive)});
  }
}
writeFileSync('workbench/scoring-study-data.json', JSON.stringify(rows, null, 2));
const summary = {matches: rows.length, hypotheticalReached: rows.filter(r=>r.hypothetical).length,
  changedWinner: rows.filter(r=>r.hypothetical && r.hypothetical.winner !== r.originalWinner).length,
  earlier: rows.filter(r=>r.hypothetical && r.hypothetical.round < r.originalTurn).length,
  resets: rows.reduce((n,r)=>n+r.resetCount,0)};
process.stdout.write(JSON.stringify(summary, null, 2)+'\n');
const baseline = rows.filter(r=>r.source.includes('round2-replays/') && !r.source.includes('-s2.json'));
const headToHead = baseline.filter(r=>/\/(default|swap)-/.test(r.source));
for (const [name, group] of [['baseline-no-seed-duplicates',baseline],['preset-head-to-head',headToHead]]) {
  process.stdout.write(`${name}: ${JSON.stringify({count:group.length,reached:group.filter(r=>r.hypothetical).length,earlier:group.filter(r=>r.hypothetical&&r.hypothetical.round<r.originalTurn).length,changedWinner:group.filter(r=>r.hypothetical&&r.hypothetical.winner!==r.originalWinner).length,resets:group.reduce((n,r)=>n+r.resetCount,0)})}\n`);
}
for (const r of rows) process.stdout.write(`${r.source.split('/').at(-1)}: ${r.originalWinner}@${r.originalTurn} ${r.originalScore.blue}:${r.originalScore.red} => ${r.hypothetical?.winner ?? '?'}@${r.hypothetical?.round ?? '?'} ${r.cumulativeAtOriginalEnd.blue}:${r.cumulativeAtOriginalEnd.red} resets=${r.resetCount}\n`);
