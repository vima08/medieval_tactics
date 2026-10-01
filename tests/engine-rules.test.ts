import { describe, expect, it } from 'vitest';
import { applyAction, createGame, getUnitRules, legalMoves, lineOfSight, previewAction, replayGame, restoreGame, rosterCost, serializeGame, tileAt, undoMove, validateBlueprint, VARIANTS } from '../src/engine';
import type { Blueprint, GameState, Unit } from '../src/engine';

const game = () => createGame({map:'tutorial',mode:'pvp',seed:17});
function setup(archetype:Unit['archetype'],target:Unit['archetype']='sword'):GameState {
  const s=game(),a=s.units.find(u=>u.team==='blue')!,b=s.units.find(u=>u.team==='red')!;
  a.archetype=archetype;a.variant=VARIANTS[archetype][0].id;a.x=2;a.y=3;a.moved=false;a.acted=false;
  b.archetype=target;b.variant=VARIANTS[target][0].id;b.x=3;b.y=3;b.moved=false;b.acted=false;
  for(const u of s.units) if(u!==a&&u!==b)u.alive=false;
  return s;
}
describe('deterministic engine',()=>{
  it('has a complete legal starting state and serializes',()=>{const s=game();expect(s.units.filter(u=>u.alive).length).toBe(6);expect(restoreGame(serializeGame(s))).toEqual(s);});
  it('finds a cheapest movement path and prevents impossible climb',()=>{
    const s=game(),u=s.units[0];
    const cells=legalMoves(s,u.id);expect(cells.length).toBeGreaterThan(0);
    expect(cells.every(c=>c.cost<=getUnitRules(u).move)).toBe(true);
    const high=tileAt(s.map,4,3)!;high.h=4;
    expect(previewAction(s,{type:'move',unitId:u.id,x:4,y:3}).valid).toBe(false);
  });
  it('blocks archers with cover and respects height',()=>{
    const s=setup('archer');const a=s.units[0],b=s.units.find(u=>u.team==='red')!;
    b.x=5;b.y=3;a.x=1;a.y=3;
    tileAt(s.map,3,3)!.object='cover';
    expect(lineOfSight(s,a,b).clear).toBe(false);
    expect(previewAction(s,{type:'attack',unitId:a.id,x:b.x,y:b.y}).valid).toBe(false);
    tileAt(s.map,3,3)!.object=undefined;
    expect(previewAction(s,{type:'attack',unitId:a.id,x:b.x,y:b.y}).valid).toBe(true);
  });
  it('uses distinct attack geometry',()=>{
    const sword=setup('sword'),spear=setup('spear'),archer=setup('archer');
    const b=sword.units.find(u=>u.team==='red')!;
    b.x=4;b.y=3;
    expect(previewAction(sword,{type:'attack',unitId:sword.units[0].id,x:4,y:3}).valid).toBe(false);
    const bs=spear.units.find(u=>u.team==='red')!;bs.x=4;bs.y=4;spear.units[0].y=4;
    expect(previewAction(spear,{type:'attack',unitId:spear.units[0].id,x:4,y:4}).valid).toBe(true);
    expect(previewAction(archer,{type:'attack',unitId:archer.units[0].id,x:3,y:3}).valid).toBe(false);
  });
  it('supports shield, scout and engineer abilities',()=>{
    const shield=setup('shield');expect(previewAction(shield,{type:'ability',unitId:shield.units[0].id,x:2,y:3}).valid).toBe(true);
    const scout=setup('scout');expect(previewAction(scout,{type:'ability',unitId:scout.units[0].id,x:2,y:5}).valid).toBe(true);
    const engineer=setup('engineer');expect(previewAction(engineer,{type:'ability',unitId:engineer.units[0].id,x:2,y:4}).valid).toBe(true);
  });
  it('matches attack preview to applied damage',()=>{
    const s=setup('sword'),a=s.units[0],b=s.units.find(u=>u.team==='red')!;
    const p=previewAction(s,{type:'attack',unitId:a.id,x:b.x,y:b.y});
    const next=applyAction(s,{type:'attack',unitId:a.id,x:b.x,y:b.y});
    expect(next.units.find(u=>u.id===b.id)!.hp).toBe(b.hp-(p.damage??0));
  });
  it('undoes a move before commitment and replays commands',()=>{
    const s=game(),a=s.units[0],m=legalMoves(s,a.id)[0];
    const moved=applyAction(s,{type:'move',unitId:a.id,x:m.x,y:m.y});
    const undone=undoMove(moved,a.id);
    expect([undone.units[0].x,undone.units[0].y]).toEqual([a.x,a.y]);
    const replay=replayGame(s.initial!,undone.history);
    expect(replay.units).toEqual(undone.units);
  });
  it('ends turns and keeps health symmetric across difficulty',()=>{
    const s=game(),r=applyAction(s,{type:'endTurn'});
    expect(r.team).toBe('red');expect(r.units.map(u=>u.hp)).toEqual(s.units.map(u=>u.hp));
  });
  it('checks roster price and conflicts',()=>{
    const b:Blueprint={name:'test',units:[{archetype:'scout',modifier:'heavy'},{archetype:'sword',artifact:'hook'},{archetype:'archer'}]};
    expect(rosterCost(b)).toBeGreaterThan(0);expect(validateBlueprint(b).join(' ')).toContain('несовместимо');
  });
  it('pushes with a previewed result and heavy units resist',()=>{
    const s=setup('sword'),a=s.units[0],b=s.units.find(u=>u.team==='red')!;
    const cmd={type:'ability' as const,unitId:a.id,x:b.x,y:b.y};
    const p=previewAction(s,cmd);expect(p.push).toEqual({x:4,y:3});
    const next=applyAction(s,cmd);expect([next.units.find(u=>u.id===b.id)!.x,next.units.find(u=>u.id===b.id)!.y]).toEqual([4,3]);
    b.modifier='heavy';expect(previewAction(s,cmd).push).toBeUndefined();
  });
  it('applies collision damage exactly when a push is blocked',()=>{
    const s=setup('sword'),a=s.units[0],b=s.units.find(u=>u.team==='red')!;
    const blocker=s.units.find(u=>u.id!==a.id&&u.id!==b.id)!;
    blocker.alive=true;blocker.x=4;blocker.y=3;
    const cmd={type:'ability' as const,unitId:a.id,x:b.x,y:b.y},p=previewAction(s,cmd);
    expect(p.push).toBeUndefined();expect(p.hazardDamage).toBe(1);
    const next=applyAction(s,cmd),target=next.units.find(u=>u.id===b.id)!;
    expect(target.hp).toBe(b.hp-(p.damage??0)-1);
  });
  it('height gives attack advantage and a commander death ends the battle',()=>{
    const s=setup('sword'),a=s.units[0],b=s.units.find(u=>u.team==='red')!;
    tileAt(s.map,a.x,a.y)!.h=2;tileAt(s.map,b.x,b.y)!.h=1;
    const high=previewAction(s,{type:'attack',unitId:a.id,x:b.x,y:b.y}).damage!;
    tileAt(s.map,a.x,a.y)!.h=1;
    const level=previewAction(s,{type:'attack',unitId:a.id,x:b.x,y:b.y}).damage!;
    expect(high).toBe(level+1);
    b.hp=1;b.commander=true;
    const done=applyAction(s,{type:'attack',unitId:a.id,x:b.x,y:b.y});expect(done.winner).toBe('blue');
  });
  it('variant, modifier and artifact rules are visible in effective stats',()=>{
    const s=setup('archer'),u=s.units[0],base=getUnitRules(u);
    u.variant='hunter';u.modifier='swift';
    expect(getUnitRules(u).move).toBe(base.move+3);
    u.artifact='boots';expect(u.artifact).toBe('boots');
    const invalid:Blueprint={name:'too many',units:[{archetype:'sword',artifact:'hook'},{archetype:'spear',artifact:'hook'},{archetype:'archer',artifact:'boots'}]};
    expect(validateBlueprint(invalid).join(' ')).toContain('не более двух');
  });
  it('awards control only after both sides have acted',()=>{
    const s=createGame({map:'highland',mode:'pvp'});
    expect(s.objective.points.map(p=>p.x)).toEqual([3,8,9,14]);
    expect(s.objective.target).toBe(5);
    const blue=s.units.filter(u=>u.team==='blue'),red=s.units.filter(u=>u.team==='red');
    blue[0].x=3;blue[0].y=9;blue[1].x=8;blue[1].y=9;
    red[0].x=14;red[0].y=9;
    const afterBlue=applyAction(s,{type:'endTurn'});
    expect(afterBlue.objective.scores).toEqual({blue:0,red:0});
    const afterRed=applyAction(afterBlue,{type:'endTurn'});
    expect(afterRed.objective.scores).toEqual({blue:1,red:0});
    const swapped=restoreGame(serializeGame(afterRed));
    const b=swapped.units.filter(u=>u.team==='blue'),r=swapped.units.filter(u=>u.team==='red');
    b[1].x=7;b[1].y=9;r[1].x=8;r[1].y=9;
    const next=applyAction(applyAction(swapped,{type:'endTurn'}),{type:'endTurn'});
    expect(next.objective.scores).toEqual({blue:0,red:1});
  });
  it('marks reachable cells threatened by a future enemy direct attack',()=>{
    const s=setup('sword');s.units[0].y=4;
    const enemy=s.units.find(u=>u.team==='red')!;enemy.x=4;enemy.y=4;
    const cells=legalMoves(s,s.units[0].id);
    expect(cells.find(c=>c.x===3&&c.y===4)?.threatened).toBe(true);
  });
  it('replays full-round scoring deterministically',()=>{
    const s=createGame({map:'highland',mode:'pvp',seed:42});
    const played=applyAction(applyAction(s,{type:'endTurn'}),{type:'endTurn'});
    expect(replayGame(s.initial!,played.history)).toEqual(played);
  });
  it('keeps a tied score at the target alive until one side leads',()=>{
    const s=createGame({map:'highland',mode:'pvp'});
    s.objective.scores={blue:4,red:4};
    const blue=s.units.filter(u=>u.team==='blue'),red=s.units.filter(u=>u.team==='red');
    blue[0].x=3;blue[0].y=9;blue[1].x=8;blue[1].y=9;
    red[0].x=14;red[0].y=9;red[1].x=9;red[1].y=9;
    const tied=applyAction(applyAction(s,{type:'endTurn'}),{type:'endTurn'});
    expect(tied.objective.scores).toEqual({blue:5,red:5});expect(tied.winner).toBeUndefined();
    const shifted=restoreGame(serializeGame(tied));shifted.units.find(u=>u.id===blue[1].id)!.x=7;
    const decided=applyAction(applyAction(shifted,{type:'endTurn'}),{type:'endTurn'});
    expect(decided.winner).toBe('red');
  });
  it('ends unresolved control at the round limit',()=>{
    const s=createGame({map:'highland',mode:'pvp'});s.turn=12;
    const ended=applyAction(applyAction(s,{type:'endTurn'}),{type:'endTurn'});
    expect(ended.winner).toBe('draw');
  });
  it('mirrors terrain, objects and heights across both deployment sides',()=>{
    const s=createGame({map:'highland',mode:'pvp'});
    for(const t of s.map.tiles) {
      const mirror=tileAt(s.map,s.map.width-1-t.x,t.y)!;
      expect([t.h,t.terrain,t.object]).toEqual([mirror.h,mirror.terrain,mirror.object]);
    }
  });
});
