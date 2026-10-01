import { describe, expect, it } from 'vitest';
import { applyAction, createGame, lineOfSight, previewAction, restoreGame, serializeGame, tileAt } from '../src/engine';

describe('destructible terrain', () => {
  it('shows the exact cover change and opens a blocked shot', () => {
    const s=createGame({map:'highland',mode:'pvp'});
    const archer=s.units.find(u=>u.team==='blue')!;
    const target=s.units.find(u=>u.team==='red')!;
    archer.archetype='archer';archer.x=4;archer.y=8;
    target.x=7;target.y=8;
    for(const u of s.units) if(u!==archer&&u!==target) u.alive=false;
    expect(lineOfSight(s,archer,target).clear).toBe(false);
    const cmd={type:'attack' as const,unitId:archer.id,x:6,y:8};
    const preview=previewAction(s,cmd);
    expect(preview.valid).toBe(true);
    expect(preview.objectDamage).toBe(2);
    expect(preview.tileChange).toMatchObject({x:6,y:8,terrain:'rubble'});
    const next=applyAction(s,cmd);
    expect(tileAt(next.map,6,8)).toMatchObject(preview.tileChange!);
    expect(lineOfSight(next,archer,target).clear).toBe(true);
    expect(s.map.tiles.find(t=>t.x===6&&t.y===8)?.object).toBe('cover');
  });

  it('chips cover without changing passability until zero HP', () => {
    const s=createGame({map:'highland',mode:'pvp'});
    const engineer=s.units.find(u=>u.team==='blue')!;
    engineer.archetype='engineer';engineer.x=4;engineer.y=8;
    for(const u of s.units) if(u!==engineer) u.alive=false;
    const cmd={type:'attack' as const,unitId:engineer.id,x:6,y:8};
    const p=previewAction(s,cmd);
    expect(p.objectDamage).toBe(1);
    expect(p.tileChange).toMatchObject({object:'cover',hp:1,terrain:'grass'});
    const next=applyAction(s,cmd);
    expect(tileAt(next.map,6,8)).toMatchObject(p.tileChange!);
    expect(serializeGame(restoreGame(serializeGame(next)))).toBe(serializeGame(next));
  });

  it('lets an engineer collapse an occupied bridge with exact lethal preview', () => {
    const s=createGame({map:'highland',mode:'pvp'});
    const engineer=s.units.find(u=>u.team==='blue')!;
    const victim=s.units.find(u=>u.team==='red')!;
    engineer.archetype='engineer';engineer.x=7;engineer.y=4;
    victim.x=8;victim.y=4;
    for(const u of s.units) if(u!==engineer&&u!==victim) u.alive=false;
    const cmd={type:'ability' as const,unitId:engineer.id,x:8,y:4};
    const p=previewAction(s,cmd);
    expect(p).toMatchObject({valid:true,objectDamage:2,targetId:victim.id,damage:victim.hp,killed:true,tileChange:{x:8,y:4,h:0,terrain:'water'}});
    const next=applyAction(s,cmd);
    expect(tileAt(next.map,8,4)).toMatchObject(p.tileChange!);
    expect(next.units.find(u=>u.id===victim.id)).toMatchObject({alive:false,hp:0});
    expect(next.winner).toBe('blue');
    expect(applyAction(s,cmd)).toEqual(next);
  });

  it('prevents long range sabotage and denies movement onto collapsed water', () => {
    const s=createGame({map:'highland',mode:'pvp'});
    const engineer=s.units.find(u=>u.team==='blue')!;
    engineer.archetype='engineer';engineer.x=6;engineer.y=4;
    expect(previewAction(s,{type:'ability',unitId:engineer.id,x:8,y:4}).valid).toBe(false);
    engineer.x=7;
    const next=applyAction(s,{type:'ability',unitId:engineer.id,x:8,y:4});
    expect(tileAt(next.map,8,4)?.terrain).toBe('water');
    expect(previewAction(next,{type:'move',unitId:engineer.id,x:8,y:4}).valid).toBe(false);
  });
});
