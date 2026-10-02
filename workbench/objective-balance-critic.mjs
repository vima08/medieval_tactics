import { registerHooks } from 'node:module';
import { writeFileSync } from 'node:fs';

registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier.startsWith('.') && !/\.[cm]?[jt]s$/.test(specifier)) {
      try { return nextResolve(`${specifier}.ts`, context); } catch {}
      try { return nextResolve(`${specifier}/index.ts`, context); } catch {}
    }
    return nextResolve(specifier, context);
  },
});

const { playHeadless } = await import('../src/ai/selfplay.ts');
const { applyAction, createGame, PRESETS, replayGame } = await import('../src/engine/index.ts');

const rows = [];
for (const objective of ['commander', 'elimination']) {
  for (const [blue, red] of [[0, 1], [1, 0], [0, 2], [2, 0]]) {
    for (const difficulty of ['easy', 'normal']) {
      const seed = 1;
      const result = playHeadless({ objective, seed, blueprintA: PRESETS[blue], blueprintB: PRESETS[red], difficultyBlue: difficulty, difficultyRed: difficulty, maxCommands: 300 });
      let state = createGame({ map: 'highland', mode: 'pvp', objective, seed, blueprintA: PRESETS[blue], blueprintB: PRESETS[red] });
      const actions = { move: 0, attack: 0, ability: 0, endTurn: 0 };
      let firstDamageTurn = null, damagingActions = 0, commanderKills = 0, turnDamage = 0, zeroDamageRounds = 0;
      const movement = [];
      for (const command of result.commands) {
        const hpBefore = new Map(state.units.map(u => [u.id, u.hp]));
        const previousTurn = state.turn;
        const previousTeam = state.team;
        state = applyAction(state, command);
        actions[command.type]++;
        const damage = state.units.reduce((total, u) => total + Math.max(0, (hpBefore.get(u.id) ?? 0) - u.hp), 0);
        if (damage) { damagingActions++; turnDamage += damage; firstDamageTurn ??= previousTurn; }
        commanderKills += state.units.filter(u => u.commander && u.hp === 0 && (hpBefore.get(u.id) ?? 0) > 0).length;
        if (command.type === 'move') movement.push(`${command.unitId}:${command.x},${command.y}`);
        if (command.type === 'endTurn' && previousTeam === 'red') {
          if (!turnDamage) zeroDamageRounds++;
          turnDamage = 0;
        }
      }
      if (JSON.stringify(state) !== JSON.stringify(result.final)) throw new Error(`Replay mismatch ${objective} ${blue}-${red} ${difficulty}`);
      const replayed = replayGame(result.final.initial, result.commands);
      if (JSON.stringify(replayed) !== JSON.stringify(result.final)) throw new Error('Engine replay mismatch');
      const survivors = Object.fromEntries(['blue', 'red'].map(team => [team, result.final.units.filter(u => u.team === team && u.alive).length]));
      const commanders = Object.fromEntries(['blue', 'red'].map(team => [team, result.final.units.find(u => u.team === team && u.commander)?.alive]));
      const outcome = Math.min(...Object.values(survivors)) === 0 ? 'team wipe' : objective === 'commander' && commanderKills ? 'commander kill' : 'round cap';
      const row = { objective, blue, red, difficulty, seed, winner: result.winner ?? null, turn: result.final.turn, commands: result.commands.length, actions, firstDamageTurn, damagingActions, commanderKills, zeroDamageRounds, survivors, commanders, outcome, endedByLimit: result.endedByLimit, repeatedMoveTargets: movement.length - new Set(movement).size };
      rows.push(row);
      if (objective === 'elimination' && blue === 0 && red === 1 && difficulty === 'normal') {
        writeFileSync('workbench/objective-elimination-normal-replay.json', JSON.stringify({ initial: result.final.initial, commands: result.commands, result: row }, null, 2));
      }
      process.stdout.write(`${JSON.stringify(row)}\n`);
    }
  }
}
writeFileSync('workbench/objective-balance-critic-data.json', JSON.stringify(rows, null, 2));
