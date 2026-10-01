import { mkdirSync, writeFileSync } from 'node:fs';
import { chooseAiCommand } from '../../src/ai';
import { PRESETS } from '../../src/engine/catalog';
import { applyAction, createGame, legalMoves, previewAction, replayGame, tileAt } from '../../src/engine';
import type { Blueprint, Command, GameState, Unit } from '../../src/engine/types';

type Entry = { turn: number; team: string; command: Command; reason: string; score: string; units: string };
mkdirSync('workbench/design-replays', { recursive: true });

function snapshot(s: GameState) {
  return s.units.filter(u => u.alive).map(u => `${u.id}:${u.archetype}@${u.x},${u.y}(${u.hp})`).join(' ');
}
function play(name: string, blue: Blueprint, red: Blueprint) {
  const initial = { map: 'highland' as const, mode: 'pvp' as const, seed: 1, blueprintA: blue, blueprintB: red };
  let s = createGame(initial);
  const journal: Entry[] = [];
  function commit(c: Command, reason: string) {
    const p = previewAction(s, c);
    if (!p.valid) throw new Error(`${name}: ${JSON.stringify(c)} ${p.reason}`);
    journal.push({turn:s.turn,team:s.team,command:c,reason,score:`${s.objective.scores.blue}:${s.objective.scores.red}`,units:snapshot(s)});
    s = applyAction(s,c);
  }
  const goals = [{x:3,y:9},{x:8,y:9},{x:9,y:9},{x:14,y:9}];
  function attack(u: Unit): boolean {
    const options = s.units.filter(v=>v.alive&&v.team==='red').flatMap(v=>
      (['attack','ability'] as const).map(type=>({command:{type,unitId:u.id,x:v.x,y:v.y} as Command, target:v,
        preview:previewAction(s,{type,unitId:u.id,x:v.x,y:v.y})}))).filter(q=>q.preview.valid);
    options.sort((a,b)=>Number(!!b.preview.killed)-Number(!!a.preview.killed)
      || (b.preview.damage??0)-(a.preview.damage??0)
      || Number(!!b.preview.push)-Number(!!a.preview.push));
    if (!options.length) return false;
    const best=options[0];
    commit(best.command,`Player chooses ${best.preview.killed?'a kill':'best available damage'} against ${best.target.id}; forecast ${best.preview.explanation}`);
    return true;
  }
  function advance(u: Unit) {
    const cells=legalMoves(s,u.id);
    if(!cells.length)return;
    const occupied=(x:number,y:number)=>s.units.some(v=>v.alive&&v.team==='blue'&&v.id!==u.id&&v.x===x&&v.y===y);
    const ownGoal=goals.filter(g=>!occupied(g.x,g.y)).sort((a,b)=>
      Math.abs(u.x-a.x)+Math.abs(u.y-a.y)-Math.abs(u.x-b.x)-Math.abs(u.y-b.y))[0]??goals[0];
    const current=Math.abs(u.x-ownGoal.x)+Math.abs(u.y-ownGoal.y);
    const ranked=cells.map(c=>({c,value:Math.abs(c.x-ownGoal.x)+Math.abs(c.y-ownGoal.y)
      + (c.threatened&&u.hp<=3?2:0) - (tileAt(s.map,c.x,c.y)?.h??0)*.18
      + (tileAt(s.map,c.x,c.y)?.object==='trap'?3:0)}));
    ranked.sort((a,b)=>a.value-b.value||a.c.cost-b.c.cost);
    const chosen=ranked[0];
    if(chosen.value>=current+.5)return;
    commit({type:'move',unitId:u.id,x:chosen.c.x,y:chosen.c.y},
      `Player advances toward open objective ${ownGoal.x},${ownGoal.y}; route cost ${chosen.c.cost}, threatened ${chosen.c.threatened}`);
  }
  while(!s.winner&&journal.length<300) {
    if(s.team==='blue') {
      for(const id of s.units.filter(u=>u.team==='blue').map(u=>u.id)) {
        if(s.winner)break;
        let u=s.units.find(v=>v.id===id)!;
        if(!u.alive)continue;
        if(!u.acted)attack(u);
        u=s.units.find(v=>v.id===id)!;
        if(u.alive&&!u.moved)advance(u);
        u=s.units.find(v=>v.id===id)!;
        if(!u.alive||u.acted)continue;
        if(attack(u))continue;
        if(u.archetype==='shield')commit({type:'ability',unitId:id,x:u.x,y:u.y},'Player guards the objective approach and adjacent allies');
        else if(u.archetype==='engineer') {
          const enemy=s.units.filter(v=>v.alive&&v.team==='red').sort((a,b)=>Math.abs(a.x-u.x)+Math.abs(a.y-u.y)-Math.abs(b.x-u.x)-Math.abs(b.y-u.y))[0];
          const near=enemy&&Math.abs(enemy.x-u.x)+Math.abs(enemy.y-u.y)<=4;
          const opts=[{x:u.x+1,y:u.y},{x:u.x,y:u.y+1},{x:u.x-1,y:u.y},{x:u.x,y:u.y-1}]
            .filter(c=>previewAction(s,{type:'ability',unitId:id,...c}).valid);
          if(near&&opts.length)commit({type:'ability',unitId:id,...opts[0]},'Player traps the approach to the nearby enemy');
        }
      }
      if(!s.winner)commit({type:'endTurn'},'Player yields after each unit has had a move and useful action');
    } else {
      for(let i=0;i<18&&!s.winner&&s.team==='red';i++) {
        const c=chooseAiCommand(s,'hard');
        if(!c||c.type==='endTurn')break;
        commit(c,'Hard AI opponent');
      }
      if(!s.winner&&s.team==='red')commit({type:'endTurn'},'Hard AI ends turn');
    }
  }
  const replay=replayGame(initial,journal.map(e=>e.command));
  if(JSON.stringify(replay)!==JSON.stringify(s))throw new Error(`${name}: replay mismatch`);
  const result={winner:s.winner??null,turn:s.turn,score:s.objective.scores,commands:journal.length,
    blueDeaths:s.units.filter(u=>u.team==='blue'&&!u.alive).length,redDeaths:s.units.filter(u=>u.team==='red'&&!u.alive).length};
  writeFileSync(`workbench/design-replays/${name}.json`,JSON.stringify({initial,commands:journal.map(e=>e.command),result},null,2));
  writeFileSync(`workbench/design-replays/${name}.md`,[`# ${name}`,'',`Result: ${JSON.stringify(result)}`,'',
    '| Turn | Side | Command | Decision | Score before | Board before |','| --- | --- | --- | --- | --- | --- |',
    ...journal.map(e=>`| ${e.turn} | ${e.team} | ${JSON.stringify(e.command)} | ${e.reason} | ${e.score} | ${e.units} |`),''].join('\n'));
  console.log(name,result);
}

play('incumbent-player',PRESETS[0],PRESETS[1]);
const crafted:Blueprint={name:'Objective defense with artifacts',units:[
  {archetype:'shield',variant:'tower',artifact:'standard'},
  {archetype:'spear',variant:'raider'},
  {archetype:'archer',variant:'longbow'},
  {archetype:'engineer',variant:'sapper',artifact:'ember'},
  {archetype:'scout',variant:'runner'},
]};
play('challenger-player',crafted,PRESETS[0]);
