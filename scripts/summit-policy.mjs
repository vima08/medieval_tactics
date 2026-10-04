import {registerHooks} from 'node:module';import {writeFileSync} from 'node:fs';
registerHooks({resolve(s,c,n){if(s.startsWith('.')&&!/\.[cm]?[jt]s$/.test(s)){try{return n(s+'.ts',c)}catch{}try{return n(s+'/index.ts',c)}catch{}}return n(s,c)}});
const {createGame,applyAction,previewAction,replayGame}=await import('../src/engine/index.ts');const {chooseAiCommand,aiCandidates,evaluatePosition}=await import('../src/ai/index.ts');
const dist=(a,b)=>Math.abs(a.x-b.x)+Math.abs(a.y-b.y);
function policy(s,kind){const leader=s.units.find(u=>u.alive&&u.team==='blue'&&u.commander),enemies=s.units.filter(u=>u.alive&&u.team==='red');
 if(kind.startsWith('stay')){
  const target=kind.includes('back')?{x:1,y:4}:{x:3,y:4};
  if(leader&&!leader.moved&&(leader.x!==target.x||leader.y!==target.y)){const a={type:'move',unitId:leader.id,...target};if(previewAction(s,a).valid)return a}
  if(leader&&!leader.acted){const a={type:'ability',unitId:leader.id,x:leader.x,y:leader.y};if(previewAction(s,a).valid)return a}
  const p={...s,objective:{...s.objective,kind:'elimination'},units:s.units.map(u=>u.commander&&u.team==='blue'?{...u,moved:true,acted:true}:u)};
  return chooseAiCommand(p,kind.endsWith('hard')?'hard':'normal');
 }
 const threatWeight=Number(kind);let best,value=-Infinity;
 for(const a of aiCandidates(s)){const n=applyAction(s,a);let score=n.winner?n.winner==='blue'?1e6:-1e6:0;
  const friends=n.units.filter(u=>u.alive&&u.team==='blue'),foes=n.units.filter(u=>u.alive&&u.team==='red');
  for(const u of friends){score+=u.hp*(u.commander?12:5)+15;const nearest=Math.min(...foes.map(e=>dist(e,u)),15);
   if(u.commander)score-=Math.max(0,3-nearest)*12;
   else score-=(u.archetype==='archer'||u.archetype==='engineer'?Math.abs(nearest-3):nearest)*2;
   let incoming=0,ready=0;
   for(const e of foes){let p=previewAction({...n,team:'red',units:n.units.map(z=>z.id===e.id?{...z,acted:false}:z)},{type:'attack',unitId:e.id,x:u.x,y:u.y});if(p.valid)incoming+=p.damage??0;
    if(!u.acted){p=previewAction(n,{type:'attack',unitId:u.id,x:e.x,y:e.y});if(p.valid)ready=Math.max(ready,(p.damage??0)+(p.fallDamage??0)-(p.counterDamage??0)+(p.killed?2:0))}}
   score-=incoming*threatWeight*(u.commander?2:1);if(incoming>=u.hp)score-=u.commander?80:12;score+=ready*2.5;
   if(leader&&!u.commander)score-=Math.max(0,dist(u,leader)-3)*.5;
  }
  for(const e of foes)score-=e.hp*7+15;
  if(a.type==='endTurn')score-=.01;
  if(score>value){value=score;best=a}
 }
 return best;
}
for(const kind of (process.env.SUMMIT_POLICY?[process.env.SUMMIT_POLICY]:['staynormal','stayhard','staybacknormal','staybackhard','2','4','6','8'])){
 let s=createGame({map:'summit',mode:'ai',mission:'summit',seed:1});for(let i=0;i<400&&!s.winner;i++){const a=s.team==='red'?chooseAiCommand(s,'easy'):policy(s,kind);if(!a||a.type!=='endTurn'&&!previewAction(s,a).valid)break;const n=applyAction(s,a);if(n.history.length===s.history.length)break;s=n}
 console.log(kind,s.winner,s.turn,s.history.length,s.units.filter(u=>u.alive).map(u=>[u.id,u.hp,u.x,u.y]));writeFileSync(`workbench/summit-independent-${kind}.json`,JSON.stringify({initial:s.initial,commands:s.history,final:s},null,2));
 if(s.winner==='blue'){if(JSON.stringify(replayGame(s.initial,s.history))!==JSON.stringify(s))throw Error('Replay mismatch');break}
}
