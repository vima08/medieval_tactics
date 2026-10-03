import { describe,it,expect } from 'vitest';
import { CAMPAIGN_MISSIONS,createGame,applyAction,replayGame,serializeGame,restoreGame,previewAction,damageEvents,validateBlueprint } from '../src/engine';
import { playHeadless } from '../src/ai/selfplay';

describe('campaign scenario objectives',()=>{
  it('previews extraction caused by a surviving knockback and excludes lethal pushes',()=>{
    const s=createGame({map:'caravan',mission:'caravan',mode:'ai'});s.team='red';
    const attacker=s.units.find(u=>u.team==='red'&&u.archetype==='sword')!,target=s.units.find(u=>u.id==='blue-5')!;
    attacker.x=9;attacker.y=7;target.x=10;target.y=7;
    for(const u of s.units)if(u!==attacker&&u!==target&&u.y===7&&u.x>=9)u.y=0;
    const command={type:'ability' as const,unitId:attacker.id,x:10,y:7};
    const p=previewAction(s,command);expect(p.valid).toBe(true);expect(p.objectiveProgress).toEqual({evacuates:target.id,wins:true});
    const next=applyAction(s,command);expect(next.winner).toBe('blue');expect(next.units.find(u=>u.id===target.id)?.evacuated).toBe(true);
    target.hp=1;expect(previewAction(s,command).objectiveProgress).toBeUndefined();expect(applyAction(s,command).winner).toBe('red');
  });
  it('authors four distinct legal deployments with existing classes',()=>{
    expect(CAMPAIGN_MISSIONS.slice(6).map(m=>m.id)).toEqual(['caravan','granary','evacuation','summit']);
    for(const m of CAMPAIGN_MISSIONS.slice(6)) {
      expect(validateBlueprint(m.blue,{minUnits:1})).toEqual([]);expect(validateBlueprint(m.red,{minUnits:1})).toEqual([]);
      const s=createGame({map:m.map,mission:m.id,mode:'ai'});
      expect(new Set(s.units.map(u=>`${u.x},${u.y}`)).size).toBe(s.units.length);
      for(const u of s.units){const t=s.map.tiles[u.y*s.map.width+u.x];expect(t.terrain).not.toBe('water');expect(t.object).not.toBe('cover');}
    }
  });
  it.each(['caravan','granary','evacuation'])('%s cannot bypass its objective by eliminating defenders',id=>{
    let s=createGame({map:'caravan',mission:id,mode:'ai'});for(const u of s.units.filter(u=>u.team==='red')){u.alive=false;u.hp=0;}
    s=applyAction(s,{type:'endTurn'});expect(s.winner).toBeUndefined();
  });
  it.each(['caravan','granary','evacuation'])('%s fails on protected death',id=>{
    let s=createGame({map:'caravan',mission:id,mode:'ai'});const u=s.units.find(u=>u.id===s.objective.protectedIds![0])!;u.alive=false;u.hp=0;
    s=applyAction(s,{type:'endTurn'});expect(s.winner).toBe('red');
  });
  it('counts extraction once, removes fighter without damage, commits movement and previews victory',()=>{
    let s=createGame({map:'evacuation',mission:'evacuation',mode:'ai'});
    const u=s.units.find(u=>u.id==='blue-5')!;u.x=9;u.y=2;
    const action={type:'move' as const,unitId:u.id,x:10,y:2};expect(previewAction(s,action).objectiveProgress).toEqual({evacuates:u.id,wins:false});
    const next=applyAction(s,action);expect(damageEvents(s,next,action)).toEqual([]);expect(next.units.find(v=>v.id===u.id)).toMatchObject({evacuated:true,alive:false,hp:u.hp,undo:undefined});
    expect(next.objective.evacuatedIds).toEqual(['blue-5']);s=applyAction(next,{type:'endTurn'});expect(s.objective.evacuatedIds).toEqual(['blue-5']);
    expect(restoreGame(serializeGame(s))).toEqual(s);
  });
  it('wins escort only after reaching exit alive and cannot undo extraction',()=>{
    let s=createGame({map:'caravan',mission:'caravan',mode:'ai'});const u=s.units.find(u=>u.id==='blue-5')!;u.x=10;u.y=3;
    const c={type:'move' as const,unitId:u.id,x:11,y:3};expect(previewAction(s,c).objectiveProgress?.wins).toBe(true);s=applyAction(s,c);expect(s.winner).toBe('blue');
    expect(previewAction(s,{type:'undo',unitId:u.id,x:10,y:3}).valid).toBe(false);
  });
  it('defends for full rounds and resolves breach at red endTurn',()=>{
    let s=createGame({map:'granary',mission:'granary',mode:'ai'});
    for(let i=0;i<7;i++)s=applyAction(s,{type:'endTurn'});expect(s.objective.defendedRounds).toBe(3);expect(s.winner).toBeUndefined();
    s=applyAction(s,{type:'endTurn'});expect(s.winner).toBe('blue');
    s=createGame({map:'granary',mission:'granary',mode:'ai'});s.units.find(u=>u.id==='blue-5')!.x=1;s.units.find(u=>u.id==='red-1')!.x=2;s.units.find(u=>u.id==='red-1')!.y=4;
    s=applyAction(s,{type:'endTurn'});expect(s.winner).toBeUndefined();s=applyAction(s,{type:'endTurn'});expect(s.winner).toBe('red');
  });
  it.each(['caravan','evacuation','summit'])('%s fails at final red turn deadline',id=>{
    let s=createGame({map:'caravan',mission:id,mode:'ai'});for(let i=0;i<24;i++)s=applyAction(s,{type:'endTurn'});expect(s.winner).toBe('red');expect(s.turn).toBe(12);
  });
  it('restores old six-mission game states unchanged',()=>{
    for(const m of CAMPAIGN_MISSIONS.slice(0,6)){const s=createGame({map:m.map,mission:m.id,mode:'ai'});expect(restoreGame(serializeGame(s))).toEqual(s);}
  });
  it.each(['caravan','granary','evacuation','summit'])('legal deterministic normal selfplay completes %s and replays',id=>{
    const r=playHeadless({mission:id,maxCommands:300,seed:1});console.log('SCENARIO_RESULT',id,JSON.stringify({winner:r.winner,turn:r.final.turn,commands:r.commands.length,evacuated:r.final.objective.evacuatedIds}));
    expect(r.endedByLimit).toBe(false);expect(replayGame(r.final.initial!,r.commands)).toEqual(r.final);
  },120000);
});
