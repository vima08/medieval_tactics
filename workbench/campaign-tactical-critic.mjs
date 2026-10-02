import { registerHooks } from 'node:module';
import { mkdirSync, writeFileSync } from 'node:fs';
registerHooks({ resolve(specifier, context, nextResolve) {
  if (specifier.startsWith('.') && !/\.[cm]?[jt]s$/.test(specifier)) {
    try { return nextResolve(`${specifier}.ts`, context); } catch {}
    try { return nextResolve(`${specifier}/index.ts`, context); } catch {}
  }
  return nextResolve(specifier, context);
}});
const { CAMPAIGN_MISSIONS, createGame, applyAction, previewAction, legalMoves, replayGame } = await import('../src/engine/index.ts');
const { chooseAiCommand } = await import('../src/ai/index.ts');
mkdirSync('workbench/campaign-replays', {recursive:true});
const results = [];
for (const mission of CAMPAIGN_MISSIONS) {
  let state = createGame({map:mission.map, mode:'ai', mission:mission.id});
  const initial = structuredClone(state);
  const openings = state.units.filter(u=>u.team==='blue').map(u=>({id:u.id, archetype:u.archetype, moves:legalMoves(state,u.id).length, attacks:state.units.filter(t=>t.team==='red').map(t=>previewAction(state,{type:'attack',unitId:u.id,x:t.x,y:t.y})).filter(p=>p.valid)}));
  const commands = [], trace=[];
  while (!state.winner && commands.length < 400) {
    const command=chooseAiCommand(state,state.team==='blue'?'hard':'easy');
    if(!command || !previewAction(state,command).valid) throw new Error(`Invalid AI action ${mission.id} ${JSON.stringify(command)}`);
    const next=applyAction(state,command);
    trace.push({turn:state.turn,team:state.team,command,score:next.objective.scores,alive:next.units.filter(u=>u.alive).map(u=>`${u.id}:${u.hp}@${u.x},${u.y}`)});
    if(next.history.length<=state.history.length) throw new Error('No progress');
    commands.push(command); state=next;
  }
  const replay=replayGame(initial.initial,commands);
  if(JSON.stringify(replay)!==JSON.stringify(state)) throw new Error(`Replay mismatch ${mission.id}`);
  const result={mission:mission.id, winner:state.winner,turn:state.turn, commands:commands.length,scores:state.objective.scores,survivors:state.units.filter(u=>u.alive).map(u=>({id:u.id,hp:u.hp,x:u.x,y:u.y})), openings,firstTurn:trace.filter(t=>t.turn===1),lastLog:state.log.slice(-4)};
  results.push(result);
  writeFileSync(`workbench/campaign-replays/${mission.id}.json`,JSON.stringify({initial:initial.initial,commands,result,trace},null,2));
  console.log(JSON.stringify(result));
}
writeFileSync('workbench/campaign-replays/summary.json',JSON.stringify(results,null,2));
