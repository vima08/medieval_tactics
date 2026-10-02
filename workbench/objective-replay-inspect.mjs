import { registerHooks } from 'node:module';
import { readFileSync } from 'node:fs';

registerHooks({ resolve(specifier, context, nextResolve) {
  if (specifier.startsWith('.') && !/\.[cm]?[jt]s$/.test(specifier)) {
    try { return nextResolve(`${specifier}.ts`, context); } catch {}
    try { return nextResolve(`${specifier}/index.ts`, context); } catch {}
  }
  return nextResolve(specifier, context);
} });

const { applyAction, createGame } = await import('../src/engine/index.ts');
const { aiCandidates } = await import('../src/ai/index.ts');
const replay = JSON.parse(readFileSync('workbench/objective-elimination-normal-replay.json', 'utf8'));
let state = createGame(replay.initial);
let availableAttackActions = 0;
const rounds = [];
for (const command of replay.commands) {
  if (aiCandidates(state).some(c => c.type === 'attack' || (c.type === 'ability' && state.units.some(u => u.alive && u.team !== state.team && u.x === c.x && u.y === c.y)))) availableAttackActions++;
  const team = state.team;
  state = applyAction(state, command);
  if (command.type === 'endTurn' && team === 'red') {
    const blue = state.units.filter(u => u.alive && u.team === 'blue');
    const red = state.units.filter(u => u.alive && u.team === 'red');
    const gap = Math.min(...blue.flatMap(b => red.map(r => Math.abs(b.x-r.x)+Math.abs(b.y-r.y))));
    rounds.push({ round: state.turn, gap, blueX: [Math.min(...blue.map(u=>u.x)), Math.max(...blue.map(u=>u.x))], redX: [Math.min(...red.map(u=>u.x)), Math.max(...red.map(u=>u.x))] });
  }
}
process.stdout.write(JSON.stringify({ availableAttackActions, rounds }, null, 2));
