import { registerHooks } from 'node:module';
import { writeFileSync } from 'node:fs';
registerHooks({resolve(s,c,n){if(s.startsWith('.')&&!/\.[cm]?[jt]s$/.test(s)){try{return n(`${s}.ts`,c)}catch{} try{return n(`${s}/index.ts`,c)}catch{}}return n(s,c)}});
const {createGame,applyAction,previewAction,replayGame}=await import('../src/engine/index.ts');
const {chooseAiCommand}=await import('../src/ai/index.ts');
for(const strategy of ['reserve-shield','reserve-archer']){
 let state=createGame({map:'gate',mode:'ai',mission:'gate'}),commands=[];
 while(!state.winner&&commands.length<300){
  let decision=state;
  const reserve=strategy==='reserve-shield'?'blue-1':'blue-3';
  let command;
  if(state.team==='blue' && !state.units.some(u=>u.alive&&u.team==='red')) {
   for(const point of state.objective.points) {
    if(state.units.some(u=>u.alive&&u.team==='blue'&&u.x===point.x&&u.y===point.y))continue;
    for(const u of state.units.filter(u=>u.alive&&u.team==='blue')) {
      if(previewAction(state,{type:'move',unitId:u.id,...point}).valid){command={type:'move',unitId:u.id,...point};break;}
    }
    if(command)break;
   }
  }
  if(state.team==='blue'&&state.units.some(u=>u.alive&&u.team==='red')) decision={...state,objective:{...state.objective,kind:'elimination'},units:state.units.map(u=>u.id===reserve?{...u,moved:true,acted:true}:u)};
  command??=chooseAiCommand(decision,state.team==='red'?'easy':'hard');
  if(!previewAction(state,command).valid)throw Error('invalid');
  state=applyAction(state,command);commands.push(command);
 }
 if(JSON.stringify(state)!==JSON.stringify(replayGame(state.initial,commands)))throw Error('replay');
 const result={strategy,winner:state.winner,turn:state.turn,commands:commands.length,scores:state.objective.scores,alive:state.units.filter(u=>u.alive).map(u=>`${u.id}:${u.hp}@${u.x},${u.y}`)};
 console.log(JSON.stringify(result));
 writeFileSync(`workbench/campaign-replays/gate-${strategy}.json`,JSON.stringify({initial:state.initial,commands,result},null,2));
}
