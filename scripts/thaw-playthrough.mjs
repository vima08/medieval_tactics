import {registerHooks} from 'node:module';
import {writeFile,mkdir} from 'node:fs/promises';
registerHooks({resolve(s,c,n){if(s.startsWith('.')&&!/\.[cm]?[jt]s$/.test(s)){try{return n(`${s}.ts`,c)}catch{}try{return n(`${s}/index.ts`,c)}catch{}}return n(s,c)}});
const {createGame,applyAction,previewAction,legalMoves,replayGame}=await import('../src/engine/index.ts');
const {chooseAiCommand,aiCandidates,evaluatePosition,visibleOrderCost}=await import('../src/ai/index.ts');
const dist=(a,b)=>Math.abs(a.x-b.x)+Math.abs(a.y-b.y);
function blueCommand(s){
 if(process.env.THAW_BLUE)return chooseAiCommand(s,process.env.THAW_BLUE);
 if(s.campaignMission==='thaw_sluice'&&!process.env.THAW_ASSAULT)return chooseAiCommand(s,'normal');
 if(['thaw_mill','thaw_ferry'].includes(s.campaignMission))return escortCommand(s);
 if(s.campaignMission!=='thaw_sluice')return chooseAiCommand(s,'normal');
 const enemy=s.units.find(u=>u.alive&&u.team==='red'&&u.commander);
 let best,score=-Infinity;
 for(const a of aiCandidates(s)){
  const n=applyAction(s,a);let v=evaluatePosition(n,'blue')-visibleOrderCost(s,a,n);
  if(enemy)for(const u of n.units.filter(u=>u.alive&&u.team==='blue')){
   v-=dist(u,enemy)*(u.archetype==='archer'?1.4:u.commander?1.5:2.8);
   if(u.commander)for(const e of n.units.filter(e=>e.alive&&e.team==='red')){const p=previewAction({...n,team:'red',units:n.units.map(z=>z.id===e.id?{...z,acted:false}:z)},{type:'attack',unitId:e.id,x:u.x,y:u.y});if(p.valid)v-=(p.damage??0)*8}
   if(u.commander&&u.hp<=4)v-=Math.max(0,4-dist(u,enemy))*5;
   if(!u.acted){let ready=0;for(const e of n.units.filter(u=>u.alive&&u.team==='red')){const p=previewAction(n,{type:'attack',unitId:u.id,x:e.x,y:e.y});if(p.valid)ready=Math.max(ready,(p.damage??0)+(p.fallDamage??0)-(p.counterDamage??0))}v+=ready*2.5}
  }
  if(a.type==='endTurn')v-=.01;
  if(v>score){best=a;score=v}
 }
 return best;
}
function route(s,u){const exits=s.objective.exits??[],queue=[{x:u.x,y:u.y,d:0}],seen=new Set([`${u.x},${u.y}`]);for(let i=0;i<queue.length;i++){const p=queue[i];if(exits.some(e=>e.x===p.x&&e.y===p.y))return p.d;const from=s.map.tiles[p.y*s.map.width+p.x];for(const [dx,dy]of [[1,0],[-1,0],[0,1],[0,-1]]){const x=p.x+dx,y=p.y+dy,key=`${x},${y}`;if(x<0||y<0||x>=s.map.width||y>=s.map.height||seen.has(key))continue;const t=s.map.tiles[y*s.map.width+x];if(t.terrain==='water'||t.object==='cover'||t.h-from.h>1&&t.terrain!=='stairs'&&from.terrain!=='stairs')continue;seen.add(key);queue.push({x,y,d:p.d+1})}}return 50}
function escortCommand(s){let best,value=-Infinity;const threatCache=new Map();function threat(n,u){const key=`${u.id}:${u.x}:${u.y}:${n.units.filter(e=>e.team==='red').map(e=>`${e.id},${e.x},${e.y},${e.alive}`).join(';')}`;if(threatCache.has(key))return threatCache.get(key);let total=0;for(const e of n.units.filter(e=>e.alive&&e.team==='red')){let max=0;const red={...n,team:'red',units:n.units.map(z=>z.id===e.id?{...z,moved:false,acted:false}:z)};for(const cell of [e,...legalMoves(red,e.id)]){const test={...red,units:red.units.map(z=>z.id===e.id?{...z,x:cell.x,y:cell.y}:z)};for(const type of ['attack','ability']){const p=previewAction(test,{type,unitId:e.id,x:u.x,y:u.y});if(p.valid)max=Math.max(max,(p.damage??0)+(p.fallDamage??0))}}total+=max}threatCache.set(key,total);return total}
 for(const a of aiCandidates(s)){const n=applyAction(s,a);let v=0;if(n.winner)v=n.winner==='blue'?100000:-100000;else{
 const friends=n.units.filter(u=>u.alive&&u.team==='blue'),enemies=n.units.filter(u=>u.alive&&u.team==='red');
 v+=(n.objective.evacuatedIds?.length??0)*300;
 for(const u of friends){const protect=n.objective.protectedIds?.includes(u.id);v+=u.hp*(protect?14:5)+15;
 if(protect){v-=route(n,u)*9;const danger=threat(n,u);v-=danger*15;if(danger>=u.hp)v-=100;for(const e of enemies){const close=dist(e,u);if(close<3)v-=(3-close)*9}}
 else if(enemies.length)v-=Math.min(...enemies.map(e=>dist(u,e)))*(u.archetype==='archer'?1:3);
 if(!u.acted){let ready=0;for(const e of enemies){const p=previewAction(n,{type:'attack',unitId:u.id,x:e.x,y:e.y});if(p.valid)ready=Math.max(ready,(p.damage??0)+(p.fallDamage??0)-(p.counterDamage??0))}v+=ready*2}
 }
 for(const e of enemies)v-=e.hp*5+15;
 v-=visibleOrderCost(s,a,n);if(a.type==='endTurn')v-=.1;
 }if(v>value){value=v;best=a}}return best}
await mkdir('scripts/campaign-replays',{recursive:true});
const results=[];
const seed=Number(process.env.THAW_SEED??1),missionIds=process.env.THAW_MISSION?[process.env.THAW_MISSION]:['thaw_dike','thaw_mill','thaw_bells','thaw_ferry','thaw_quarry','thaw_sluice'];
for(const mission of missionIds){
 let s=createGame({map:mission,mission,mode:'ai',seed});const start=s.initial;
 for(let i=0;i<500&&!s.winner;i++){
  const a=s.team==='red'?chooseAiCommand(s,'easy'):blueCommand(s);
  if(!a)throw Error('No command');let n=applyAction(s,a);if(n.history.length===s.history.length)throw Error(`Illegal ${JSON.stringify(a)}`);s=n;
 }
 const summary={mission,winner:s.winner,turn:s.turn,commands:s.history.length,alive:s.units.filter(u=>u.alive).map(u=>({id:u.id,hp:u.hp,x:u.x,y:u.y})),log:s.log};results.push(summary);
 if(JSON.stringify(replayGame(start,s.history))!==JSON.stringify(s))throw Error(`Replay diverged ${mission}`);
 console.log(JSON.stringify({...summary,log:undefined}));
 await writeFile(`workbench/thaw-${mission}-critic${seed===1?'':`-seed${seed}`}.json`,JSON.stringify({initial:start,commands:s.history,final:s,summary},null,2));
 if(s.winner==='blue'&&seed===1)await writeFile(`scripts/campaign-replays/${mission}.json`,JSON.stringify({initial:start,commands:s.history},null,2));
}
await writeFile(`workbench/thaw-tactical-results${seed===1?'':`-seed${seed}`}.json`,JSON.stringify(results,null,2));
