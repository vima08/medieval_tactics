import { describe, expect, it } from 'vitest';
import { applyAction, choiceCost, createGame, damageEvents, legalMoves, MODIFIERS, previewAction, replayGame, tileAt, undoMove } from '../src/engine';
import type { Archetype, Command, GameState, Team, Unit } from '../src/engine';

function unit(id:string,team:Team,archetype:Archetype,x:number,y:number,extra:Partial<Unit>={}):Unit {
  return {id,team,archetype,variant:'',x,y,hp:10,maxHp:10,moved:false,acted:false,guard:false,pinned:false,alive:true,...extra};
}
function board(units:Unit[]):GameState {
  const s=createGame({map:'tutorial',mode:'pvp',objective:'elimination'});
  s.map={id:'tutorial',name:'Rules regression board',width:10,height:8,tiles:Array.from({length:80},(_,i)=>({x:i%10,y:Math.floor(i/10),h:0,terrain:'grass'}))};
  s.units=units;
  return s;
}
const find=(s:GameState,id:string)=>s.units.find(u=>u.id===id)!;
const cmd=(type:'move'|'attack'|'ability'|'undo',unitId:string,x:number,y:number):Command=>({type,unitId,x,y});
const end:Command={type:'endTurn'};

describe('audited rules regressions',()=>{
  it('explains aimed-shot movement lock without mislabelling a normal move followed by attack',()=>{
    const initial=board([unit('b','blue','archer',2,3),unit('r','red','sword',5,3)]);
    const aimed=applyAction(initial,cmd('ability','b',5,3));
    expect(previewAction(aimed,cmd('move','b',2,4)).reason).toContain('прицельного выстрела');
    const moved=applyAction(initial,cmd('move','b',2,4));
    const attacked=applyAction(moved,cmd('attack','b',5,3));
    expect(previewAction(attacked,cmd('move','b',3,4)).reason).toBe('Движение уже потрачено');
  });
  it('keeps spear pin for the next victim turn, blocks scout dash, then releases it',()=>{
    let s=board([unit('b','blue','spear',2,3),unit('ally','blue','shield',4,4),unit('r','red','scout',3,3)]);
    s=applyAction(s,cmd('ability','b',3,3));
    expect(find(s,'r').pinned).toBe(true);
    s=applyAction(s,end);
    expect(find(s,'r').pinned).toBe(true);
    expect(legalMoves(s,'r')).toEqual([]);
    expect(previewAction(s,cmd('ability','r',6,3)).valid).toBe(false);
    expect(()=>applyAction(s,cmd('ability','r',6,3))).toThrow('натиском');
    expect(previewAction(s,cmd('attack','r',4,4)).valid).toBe(true);
    s=applyAction(s,end);
    expect(find(s,'r').pinned).toBe(false);
    s=applyAction(s,end);
    expect(legalMoves(s,'r').length).toBeGreaterThan(0);
    expect(previewAction(s,cmd('ability','r',6,3)).valid).toBe(true);
  });

  it('a sword pushing an already pinned target preserves the pin',()=>{
    let s=board([unit('b','blue','sword',2,3),unit('r','red','sword',3,3,{pinned:true})]);
    s=applyAction(s,cmd('ability','b',3,3));
    expect(find(s,'r').pinned).toBe(true);
  });

  it.each(['move','dash','push'] as const)('sapper-created trap deals 3 and is consumed on %s, including damage events',entry=>{
    let s=board([unit('eng','blue','engineer',4,2,{variant:'sapper'}),unit('b','blue','sword',2,3),unit('r','red',entry==='dash'?'scout':'sword',entry==='push'?3:6,3)]);
    s=applyAction(s,cmd('ability','eng',4,3));
    expect(tileAt(s.map,4,3)!.trapDamage).toBe(3);
    const entryCommand=entry==='push'?cmd('ability','b',3,3):cmd(entry==='dash'?'ability':'move','r',4,3);
    if(entry!=='push')s=applyAction(s,end);
    const preview=previewAction(s,entryCommand);
    expect(preview.valid).toBe(true);
    expect(preview.hazardDamage).toBe(3);
    const after=applyAction(s,entryCommand);
    expect(find(after,'r').hp).toBe(10-3-(preview.damage??0));
    expect(tileAt(after.map,4,3)!.object).toBeUndefined();
    expect(tileAt(after.map,4,3)!.trapDamage).toBeUndefined();
    expect(damageEvents(s,after,entryCommand).find(e=>e.source==='Ловушка')?.amount).toBe(3);
  });

  it('legacy traps without metadata remain 2 damage and are consumed by a lethal dash',()=>{
    const s=board([unit('b','blue','scout',2,3,{hp:2}),unit('r','red','sword',8,6)]);
    tileAt(s.map,4,3)!.object='trap';
    const c=cmd('ability','b',4,3),p=previewAction(s,c),after=applyAction(s,c);
    expect(p.hazardDamage).toBe(2);
    expect(find(after,'b').alive).toBe(false);
    expect(tileAt(after.map,4,3)!.object).toBeUndefined();
    expect(damageEvents(s,after,c).map(e=>[e.amount,e.source])).toEqual([[2,'Ловушка']]);
  });

  it.each(['cover','fragile'] as const)('mason reinforces %s by 2, caps at 4, and preserves occupants',object=>{
    let s=board([unit('b','blue','engineer',2,3,{variant:'mason'}),unit('r','red','sword',8,6),unit('ally','blue','sword',3,3)]);
    if(object==='cover')find(s,'ally').alive=false;
    Object.assign(tileAt(s.map,3,3)!,{object,hp:1,terrain:object==='fragile'?'bridge':'grass'});
    const c=cmd('ability','b',3,3),before=s,p=previewAction(s,c);
    expect(p.valid).toBe(true);expect(p.objectDamage).toBe(0);expect(p.tileChange?.hp).toBe(3);
    s=applyAction(s,c);
    expect(tileAt(s.map,3,3)!.hp).toBe(3);
    expect(tileAt(s.map,3,3)!.object).toBe(object);
    expect(find(s,'ally').alive).toBe(object==='fragile');
    expect(find(s,'ally').hp).toBe(10);
    expect(damageEvents(before,s,c)).toEqual([]);
    expect(find(s,'b').acted).toBe(true);
    s=applyAction(applyAction(s,end),end);
    s=applyAction(s,c);
    expect(tileAt(s.map,3,3)!.hp).toBe(4);
    s=applyAction(applyAction(s,end),end);
    expect(previewAction(s,c).valid).toBe(false);
    expect(previewAction(s,c).reason).toContain('предела');
    expect(()=>applyAction(s,c)).toThrow('предела');
  });

  it('mason still places traps and other engineers still sabotage bridges',()=>{
    let s=board([unit('b','blue','engineer',2,3,{variant:'mason'}),unit('r','red','sword',8,6)]);
    s=applyAction(s,cmd('ability','b',3,3));
    expect(tileAt(s.map,3,3)!.trapDamage).toBe(2);
    s=board([unit('b','blue','engineer',2,3,{variant:'sapper'}),unit('r','red','sword',3,3)]);
    Object.assign(tileAt(s.map,3,3)!,{object:'fragile',terrain:'bridge',hp:2});
    s=applyAction(s,cmd('ability','b',3,3));
    expect(tileAt(s.map,3,3)!.terrain).toBe('water');
    expect(find(s,'r').alive).toBe(false);
  });

  it.each(['opponent','occupied','water','cover','dead','winner','acted'] as const)('undo preview and both apply APIs reject %s with the same reason',condition=>{
    let s=board([unit('b','blue','sword',2,3),unit('b2','blue','scout',2,4),unit('r','red','sword',8,6)]);
    s=applyAction(s,cmd('move','b',3,3));
    if(condition==='opponent')s=applyAction(s,end);
    if(condition==='occupied')s=applyAction(s,cmd('move','b2',2,3));
    if(condition==='water')tileAt(s.map,2,3)!.terrain='water';
    if(condition==='cover')tileAt(s.map,2,3)!.object='cover';
    if(condition==='dead')find(s,'b').alive=false;
    if(condition==='winner')s.winner='blue';
    if(condition==='acted')find(s,'b').acted=true;
    const c=cmd('undo','b',2,3),p=previewAction(s,c);
    expect(p.valid).toBe(false);
    expect(()=>applyAction(s,c)).toThrow(p.reason);
    expect(()=>undoMove(s,'b')).toThrow(p.reason);
  });

  it('rejects undo after an allied engineer collapses the vacant origin bridge',()=>{
    let s=board([unit('b','blue','sword',2,3),unit('eng','blue','engineer',2,4),unit('r','red','sword',8,6)]);
    Object.assign(tileAt(s.map,2,3)!,{terrain:'bridge',object:'fragile',hp:2});
    s=applyAction(s,cmd('move','b',3,3));s=applyAction(s,cmd('ability','eng',2,3));
    expect(tileAt(s.map,2,3)!.terrain).toBe('water');
    expect(previewAction(s,cmd('undo','b',2,3)).valid).toBe(false);
    expect(()=>undoMove(s,'b')).toThrow('недоступна');
  });

  it('veteran cost description agrees with its unchanged surcharge',()=>{
    expect(MODIFIERS.veteran.description).toContain('+2 стоимость');
    expect(choiceCost({archetype:'sword',variant:'warden',modifier:'veteran'})-choiceCost({archetype:'sword',variant:'warden'})).toBe(2);
  });

  it('legal undo/end-turn streams still replay exactly',()=>{
    let s=createGame({map:'tutorial',mode:'pvp',objective:'elimination',seed:17});
    const initial=s.initial!;
    for(let i=0;i<4;i++){
      const u=s.units.find(u=>u.team===s.team&&u.alive)!,m=legalMoves(s,u.id)[0];
      s=applyAction(s,cmd('move',u.id,m.x,m.y));s=undoMove(s,u.id);s=applyAction(s,end);
    }
    expect(replayGame(initial,s.history)).toEqual(s);
  });

  it('sapper trap metadata is deterministic in an unmodified initial-game replay',()=>{
    let s=createGame({map:'tutorial',mode:'pvp',objective:'elimination',blueprintA:{name:'Sapper replay',units:[{archetype:'engineer',variant:'sapper'},{archetype:'sword',variant:'warden'},{archetype:'scout',variant:'runner'}]}});
    const initial=s.initial!,eng=s.units[0];
    const placement=s.map.tiles.map(t=>cmd('ability',eng.id,t.x,t.y)).find(c=>previewAction(s,c).valid)!;
    expect(placement).toBeDefined();
    s=applyAction(s,placement);
    expect(s.map.tiles.some(t=>t.object==='trap'&&t.trapDamage===3)).toBe(true);
    s=applyAction(s,end);
    expect(replayGame(initial,s.history)).toEqual(s);
  });
});
