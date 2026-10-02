import { describe, expect, it } from 'vitest';
import { applyAction, createGame, previewAction, replayGame, legalMoves } from '../src/engine';
import { aiCandidates } from '../src/ai';
import type { Archetype, GameState, Unit } from '../src/engine';

function fixture(attacker:Archetype='sword',defender:Archetype='sword'):GameState {
  const s=createGame({map:'tutorial',mode:'pvp',objective:'elimination'});
  s.map.tiles.forEach(t=>{t.h=0;t.terrain='grass';t.object=undefined});
  s.units=s.units.filter((u,i)=>i===0||i===3);
  for(const [i,u]of s.units.entries())Object.assign(u,{archetype:i?attacker:defender,variant:'',modifier:undefined,artifact:undefined,x:i?3:2,y:3,hp:8,maxHp:8});
  return s;
}
const self=(u:Unit)=>({type:'ability' as const,unitId:u.id,x:u.x,y:u.y});
const hit=(s:GameState,type:'attack'|'ability'='attack')=>({type,unitId:s.units[1].id,x:s.units[0].x,y:s.units[0].y});
function guarded(s:GameState){return applyAction(applyAction(s,self(s.units[0])),{type:'endTurn'});}

describe('preparing and reading sword counterattacks',()=>{
  it('self ability costs the attack, preserves movement and grants visible guard',()=>{
    const before=fixture(),u=before.units[0];expect(previewAction(before,self(u)).explanation).toContain('ответ 1');
    const s=applyAction(before,self(u));expect(s.units[0].guard).toBe(true);expect(s.units[0].acted).toBe(true);
    expect(s.units[0].moved).toBe(false);expect(legalMoves(s,u.id).length).toBeGreaterThan(0);
    expect(previewAction(s,self(s.units[0])).valid).toBe(false);
  });
  it('neighboring attack loses one direct damage and gets the exact previewed counter',()=>{
    const s=guarded(fixture()),p=previewAction(s,hit(s));expect(p.damage).toBe(2);expect(p.counterDamage).toBe(1);
    const next=applyAction(s,hit(s));expect(next.units[0].hp).toBe(6);expect(next.units[1].hp).toBe(7);
  });
  it('distant spear attacks avoid counters, even when using thrust',()=>{
    const s=guarded(fixture('spear'));s.units[1].x=4;
    for(const type of ['attack','ability'] as const)expect(previewAction(s,hit(s,type)).counterDamage).toBe(0);
  });
  it('a lethal hit cannot receive a counter',()=>{
    const s=guarded(fixture());s.units[0].hp=2;const p=previewAction(s,hit(s));expect(p.killed).toBe(true);expect(p.counterDamage).toBe(0);
    expect(applyAction(s,hit(s)).units[1].hp).toBe(8);
  });
  it('adjacent pushes can still trigger a counter when the defender survives',()=>{
    const s=guarded(fixture()),p=previewAction(s,hit(s,'ability'));expect(p.push).toBeDefined();expect(p.counterDamage).toBe(1);
    expect(applyAction(s,hit(s,'ability')).units[1].hp).toBe(7);
  });
  it('shield guard never grants a counter; sword guard expires at its next turn start',()=>{
    const shield=guarded(fixture('sword','shield'));expect(previewAction(shield,hit(shield)).counterDamage).toBe(0);
    const s=applyAction(guarded(fixture()),{type:'endTurn'});expect(s.units[0].guard).toBe(false);
  });
  it('AI has the same legal self guard command and committed guard streams replay',()=>{
    const s=createGame({map:'tutorial',mode:'pvp',objective:'elimination'}),u=s.units.find(u=>u.team==='blue'&&u.archetype==='sword')!;
    expect(aiCandidates(s)).toContainEqual(self(u));
    const next=applyAction(s,self(u));expect(replayGame(s.initial!,next.history)).toEqual(next);
  });
});
