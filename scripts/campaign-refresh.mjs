import { registerHooks } from 'node:module';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import assert from 'node:assert/strict';
registerHooks({resolve(s,c,n){if(s.startsWith('.')&&!/\.[cm]?[jt]s$/.test(s)){try{return n(`${s}.ts`,c)}catch{}try{return n(`${s}/index.ts`,c)}catch{}}return n(s,c)}});
const { CAMPAIGN_MISSIONS, createGame, applyAction, previewAction, legalMoves, replayGame }=await import('../src/engine/index.ts');
const { chooseAiCommand }=await import('../src/ai/index.ts');
const output='workbench/current-campaign-replays';
mkdirSync(output,{recursive:true});

function archiveBlueTurns(mission){
  const name=mission.id==='gate'?'gate-reserve-shield':mission.id;
  const archived=JSON.parse(readFileSync(`workbench/campaign-replays/${name}.json`,'utf8'));
  const turns=[];let team='blue',pending=[];
  for(const c of archived.commands){
    if(team==='blue')pending.push(c);
    if(c.type==='endTurn'){if(team==='blue'){turns.push(pending);pending=[];}team=team==='blue'?'red':'blue';}
  }
  if(pending.length)turns.push(pending);
  return turns;
}

function reserveShieldPlan(s){
  const enemies=s.units.some(u=>u.alive&&u.team==='red');
  if(!enemies){
    for(const point of s.objective.points){
      if(s.units.some(u=>u.alive&&u.team==='blue'&&u.x===point.x&&u.y===point.y))continue;
      for(const u of s.units.filter(u=>u.alive&&u.team==='blue')){
        // Keep existing occupants in place; the reserved shield covers the vacant flag.
        if(s.objective.points.some(p=>p.x===u.x&&p.y===u.y))continue;
        const c={type:'move',unitId:u.id,...point};if(previewAction(s,c).valid)return c;
        if(!u.moved){
          const cells=legalMoves(s,u.id).sort((a,b)=>(Math.abs(a.x-point.x)+Math.abs(a.y-point.y))-(Math.abs(b.x-point.x)+Math.abs(b.y-point.y))||a.cost-b.cost||a.y-b.y||a.x-b.x);
          const m=cells[0];if(m&&Math.abs(m.x-point.x)+Math.abs(m.y-point.y)<Math.abs(u.x-point.x)+Math.abs(u.y-point.y))return {type:'move',unitId:u.id,x:m.x,y:m.y};
        }
      }
    }
    return {type:'endTurn'};
  }
  // This decision-only plan reserves the commander shield while the other units
  // clear enemies. Every returned command is validated/applied to the real state.
  const decision={...s,objective:{...s.objective,kind:'elimination'},units:s.units.map(u=>u.id==='blue-1'?{...u,moved:true,acted:true}:u)};
  return chooseAiCommand(decision,'hard');
}

function run(mission,strategy){
  let s=createGame({map:mission.map,mode:'ai',mission:mission.id,seed:1});
  const initial=structuredClone(s.initial),commands=[],trace=[],repairs=[];
  const planned=strategy==='archive-blue-current-red'?archiveBlueTurns(mission):null;
  let blueTurnIndex=0,blueActionIndex=0;
  while(!s.winner&&commands.length<400){
    let c;
    if(s.team==='red')c=chooseAiCommand(s,'easy');
    else if(strategy==='reserve-shield-current-rules')c=reserveShieldPlan(s);
    else if(planned){
      c=planned[blueTurnIndex]?.[blueActionIndex++];
      if(!c||!previewAction(s,c).valid){
        const intended=c;c=chooseAiCommand(s,'hard');
        repairs.push({round:s.turn,intended:intended??null,replacement:c});
      }
    }else c=chooseAiCommand(s,strategy);
    assert(c&&previewAction(s,c).valid,`${mission.id}/${strategy}: illegal ${JSON.stringify(c)}`);
    if(s.team==='red')assert.deepEqual(c,chooseAiCommand(s,'easy'),'Red must match the current UI exactly');
    const before=s;s=applyAction(s,c);commands.push(c);
    trace.push({round:before.turn,team:before.team,command:c,scores:s.objective.scores,alive:s.units.filter(u=>u.alive).map(u=>({id:u.id,hp:u.hp,x:u.x,y:u.y,pinned:u.pinned}))});
    if(before.team==='blue'&&c.type==='endTurn'){blueTurnIndex++;blueActionIndex=0;}
  }
  assert.deepEqual(replayGame(initial,commands),s,`${mission.id}/${strategy} replay mismatch`);
  const result={mission:mission.id,strategy,seed:1,bluePlan:strategy,redDifficulty:'easy',winner:s.winner,turn:s.turn,commands:commands.length,scores:s.objective.scores,repairs:repairs.length,survivors:s.units.filter(u=>u.alive).map(u=>({id:u.id,hp:u.hp,x:u.x,y:u.y}))};
  console.log(JSON.stringify(result));
  return {initial,commands,result,trace,repairs};
}

const summary=[];
for(const mission of CAMPAIGN_MISSIONS){
  const strategies=mission.id==='gate'?['hard','normal','reserve-shield-current-rules','archive-blue-current-red']:['hard','normal','archive-blue-current-red'];
  const attempts=[];let winning;
  for(const strategy of strategies){
    const trial=run(mission,strategy);attempts.push(trial.result);
    writeFileSync(`${output}/${mission.id}-${strategy}-attempt.json`,JSON.stringify(trial,null,2));
    if(trial.result.winner==='blue'){winning=trial;break;}
  }
  assert(winning,`No current-rules blue win for ${mission.id}. Attempts preserved for a human-directed repair.`);
  writeFileSync(`${output}/${mission.id}.json`,JSON.stringify(winning,null,2));
  summary.push({...winning.result,replay:`${output}/${mission.id}.json`,attempts});
  writeFileSync(`${output}/summary.json`,JSON.stringify(summary,null,2));
}
assert.equal(summary.length,6);
console.log(JSON.stringify({verifiedWins:summary.length,summary:summary.map(({mission,strategy,winner,turn,commands})=>({mission,strategy,winner,turn,commands}))}));
