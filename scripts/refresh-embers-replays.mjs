import {registerHooks} from 'node:module';
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
registerHooks({resolve(s,c,n){if(s.startsWith('.')&&!/\.[cm]?[jt]s$/.test(s)){try{return n(s+'.ts',c)}catch{}try{return n(s+'/index.ts',c)}catch{}}return n(s,c)}});
const {CAMPAIGN_MISSIONS,createGame,applyAction,replayGame,previewAction,legalMoves}=await import('../src/engine/index.ts');
const {chooseAiCommand,aiCandidates,evaluatePosition,visibleOrderCost}=await import('../src/ai/index.ts');
function defend(s){
  const engineer=s.units.find(u=>u.id==='blue-5'),shield=s.units.find(u=>u.id==='blue-1');
  for(const [u,p]of[[engineer,{x:0,y:4}],[shield,{x:2,y:4}]])if(u?.alive&&!u.moved&&(u.x!==p.x||u.y!==p.y)){const c={type:'move',unitId:u.id,...p};if(previewAction(s,c).valid)return c;if(u.id==='blue-1'){const c={type:'move',unitId:u.id,x:3,y:4};if(previewAction(s,c).valid)return c;}}
  if(shield?.alive&&!shield.acted){const c={type:'ability',unitId:shield.id,x:shield.x,y:shield.y};if(previewAction(s,c).valid)return c;}
  const decision={...s,objective:{...s.objective,kind:'elimination'},units:s.units.map(u=>['blue-1','blue-5'].includes(u.id)?{...u,moved:true,acted:true}:u)};
  return chooseAiCommand(decision,'hard');
}
function assault(s){const enemy=s.units.find(u=>u.alive&&u.team==='red'&&u.commander);let best,score=-Infinity;for(const a of aiCandidates(s)){const n=applyAction(s,a);let v=evaluatePosition(n,'blue')-visibleOrderCost(s,a,n);if(enemy)for(const u of n.units.filter(u=>u.alive&&u.team==='blue')){v-=(Math.abs(u.x-enemy.x)+Math.abs(u.y-enemy.y))*(u.archetype==='archer'?1.4:u.commander?1.5:2.8);if(u.commander)for(const e of n.units.filter(e=>e.alive&&e.team==='red')){const p=previewAction({...n,team:'red',units:n.units.map(z=>z.id===e.id?{...z,acted:false}:z)},{type:'attack',unitId:e.id,x:u.x,y:u.y});if(p.valid)v-=(p.damage??0)*8;}if(!u.acted){let ready=0;for(const e of n.units.filter(e=>e.alive&&e.team==='red')){const p=previewAction(n,{type:'attack',unitId:u.id,x:e.x,y:e.y});if(p.valid)ready=Math.max(ready,(p.damage??0)+(p.fallDamage??0)-(p.counterDamage??0));}v+=ready*2.5;}}if(v>score){score=v;best=a;}}return best;}
const dist=(a,b)=>Math.abs(a.x-b.x)+Math.abs(a.y-b.y);
function route(s,u){const exits=s.objective.exits??[],queue=[{x:u.x,y:u.y,d:0}],seen=new Set([`${u.x},${u.y}`]);for(let i=0;i<queue.length;i++){const p=queue[i];if(exits.some(e=>e.x===p.x&&e.y===p.y))return p.d;const from=s.map.tiles[p.y*s.map.width+p.x];for(const [dx,dy]of [[1,0],[-1,0],[0,1],[0,-1]]){const x=p.x+dx,y=p.y+dy,key=`${x},${y}`;if(x<0||y<0||x>=s.map.width||y>=s.map.height||seen.has(key))continue;const t=s.map.tiles[y*s.map.width+x];if(t.terrain==='water'||t.object==='cover'||t.h-from.h>1&&t.terrain!=='stairs'&&from.terrain!=='stairs')continue;seen.add(key);queue.push({x,y,d:p.d+1})}}return 50}
function tacticalCommand(s){let best,value=-Infinity;const threatCache=new Map();function threat(n,u){const key=`${u.id}:${u.x}:${u.y}:${n.units.filter(e=>e.team==='red').map(e=>`${e.id},${e.x},${e.y},${e.alive}`).join(';')}`;if(threatCache.has(key))return threatCache.get(key);let total=0;for(const e of n.units.filter(e=>e.alive&&e.team==='red')){let max=0;const red={...n,team:'red',units:n.units.map(z=>z.id===e.id?{...z,moved:false,acted:false}:z)};for(const cell of [e,...legalMoves(red,e.id)]){const test={...red,units:red.units.map(z=>z.id===e.id?{...z,x:cell.x,y:cell.y}:z)};for(const type of ['attack','ability']){const p=previewAction(test,{type,unitId:e.id,x:u.x,y:u.y});if(p.valid)max=Math.max(max,(p.damage??0)+(p.fallDamage??0))}}total+=max}threatCache.set(key,total);return total}
 for(const a of aiCandidates(s)){const n=applyAction(s,a);let v=0;if(n.winner)v=n.winner==='blue'?100000:-100000;else{
 const friends=n.units.filter(u=>u.alive&&u.team==='blue'),enemies=n.units.filter(u=>u.alive&&u.team==='red');
 v+=(n.objective.evacuatedIds?.length??0)*300;if(n.objective.kind==='defend'){v+=(n.objective.defendedRounds??0)*100;for(const p of n.objective.defendPoints??[])if(friends.some(u=>u.x===p.x&&u.y===p.y))v+=180;}
 for(const u of friends){const protect=n.objective.protectedIds?.includes(u.id)||n.objective.kind==='commander'&&u.commander;v+=u.hp*(protect?14:5)+15;
 if(protect){if(n.objective.kind!=='defend')v-=route(n,u)*9;const danger=threat(n,u);v-=danger*(n.objective.kind==='commander'?Number(process.env.EMBERS_COMMANDER_THREAT??1):15);if(danger>=u.hp)v-=100;if(n.objective.kind!=='commander')for(const e of enemies){const close=dist(e,u);if(close<3)v-=(3-close)*9}}
 else if(enemies.length){const targets=n.objective.kind==='commander'?enemies.filter(e=>e.archetype==='archer'):enemies;v-=Math.min(...(targets.length?targets:enemies).map(e=>dist(u,e)))*(u.archetype==='archer'?1:3);if(n.objective.kind==='commander'){const danger=threat(n,u);v-=danger*Number(process.env.EMBERS_THREAT??0.3);if(danger>=u.hp)v-=30;}}
 if(!u.acted){let ready=0;for(const e of enemies){const p=previewAction(n,{type:'attack',unitId:u.id,x:e.x,y:e.y});if(p.valid)ready=Math.max(ready,(p.damage??0)+(p.fallDamage??0)-(p.counterDamage??0))}v+=ready*2}
 }
 for(const e of enemies)v-=e.hp*5+15;
 if(n.objective.kind==='commander'&&enemies.some(e=>e.archetype==='archer')){const shield=friends.find(u=>u.commander);if(shield)for(const u of friends)if(u.id!==shield.id)v-=Math.max(0,dist(u,shield)-1)*Number(process.env.EMBERS_COHESION??1);}
 v-=visibleOrderCost(s,a,n);if(a.type==='endTurn')v-=.1;
 }if(v>value){value=v;best=a}}return best}
mkdirSync('workbench',{recursive:true});const rows=[];
for(const mission of CAMPAIGN_MISSIONS.slice(0,10).filter(m=>!process.argv[2]||m.id===process.argv[2])){
  const file=`scripts/campaign-replays/${mission.id}.json`,old=JSON.parse(readFileSync(file,'utf8'));let before=createGame(old.initial),blue=[];
  const targets=[];for(const c of old.commands){if(before.team==='blue'){blue.push(c);targets.push(c.type==='attack'||c.type==='ability'?before.units.find(u=>u.alive&&u.team==='red'&&u.x===c.x&&u.y===c.y)?.id:undefined);}before=applyAction(before,c);}
  const attempts=[];let result;
  for(const policy of (process.env.EMBERS_POLICY?[process.env.EMBERS_POLICY]:mission.id==='granary'?['tactical','defend','previous','normal','hard','easy']:mission.id==='summit'?['retarget','tactical','assault','adaptive','previous','normal','hard','easy']:['previous','normal','hard','easy'])){
    let state=createGame({map:mission.map,mode:'ai',mission:mission.id,seed:1}),cursor=0;const started=Date.now();
    for(let i=0;i<350&&!state.winner;i++){
      let c=state.team==='red'?chooseAiCommand(state,'easy'):['previous','adaptive','retarget'].includes(policy)?blue[cursor++]:policy==='tactical'?tacticalCommand(state):policy==='defend'?defend(state):policy==='assault'?assault(state):chooseAiCommand(state,policy);
      if(state.team==='blue'&&policy==='retarget'){
        const enemy=state.units.find(u=>u.alive&&u.id===targets[cursor-1]);if(enemy&&c)c={...c,x:enemy.x,y:enemy.y};
        if(!c||!previewAction(state,c).valid){const options=aiCandidates(state).filter(a=>a.type!=='endTurn'&&(!c?.unitId||a.unitId===c.unitId));c=options.sort((a,b)=>evaluatePosition(applyAction(state,b),'blue')-evaluatePosition(applyAction(state,a),'blue'))[0]??chooseAiCommand(state,'hard');}
      }
      if(state.team==='blue'&&policy==='adaptive'&&(!c||!previewAction(state,c).valid))c=chooseAiCommand(state,'hard');
      if(!c)break;
      if(c.type!=='endTurn'&&!previewAction(state,c).valid)break;
      const next=applyAction(state,c);if(next===state||next.history.length===state.history.length)break;state=next;
    }
    attempts.push({policy,winner:state.winner??'unfinished',turn:state.turn,commands:state.history.length,ms:Date.now()-started});writeFileSync(`workbench/embers-${mission.id}-${policy}.json`,JSON.stringify({initial:state.initial,commands:state.history,final:state},null,2));console.log(mission.id,JSON.stringify(attempts.at(-1)));
    if(state.winner==='blue'){result={initial:state.initial,commands:state.history,final:state};break;}
  }
  if(result){const replay=replayGame(result.initial,result.commands);if(JSON.stringify(replay)!==JSON.stringify(result.final))throw Error('Replay mismatch '+mission.id);let check=createGame(result.initial);for(const c of result.commands){if(check.team==='red'&&JSON.stringify(c)!==JSON.stringify(chooseAiCommand(check,'easy')))throw Error('Current AI mismatch '+mission.id);check=applyAction(check,c);}writeFileSync(file,JSON.stringify(result,null,2));}
  rows.push({id:mission.id,refreshed:!!result,attempts});writeFileSync('workbench/embers-refresh.json',JSON.stringify(rows,null,2));
}
if(rows.some(r=>!r.refreshed))process.exitCode=1;
