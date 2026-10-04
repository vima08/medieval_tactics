import {describe,it,expect} from 'vitest';
import {createGame,applyAction,previewAction} from '../src/engine';
import {chooseAiCommand,visibleOrderCost} from '../src/ai';

function ownTrap(corridor=false){
  let s=createGame({map:'tutorial',mode:'pvp',objective:'elimination',seed:8});
  for(const t of s.map.tiles){t.h=0;t.terrain=corridor?'water':'grass';delete t.object;delete t.hp;}
  const engineer=s.units.find(u=>u.team==='blue')!,sword=s.units.filter(u=>u.team==='blue')[1],enemy=s.units.find(u=>u.team==='red')!;
  s.units=[engineer,sword,enemy];engineer.archetype='engineer';engineer.x=4;engineer.y=3;engineer.moved=true;
  sword.archetype='sword';sword.x=3;sword.y=4;enemy.x=corridor?5:6;enemy.y=4;enemy.hp=corridor?3:6;
  for(const u of s.units){u.commander=false;u.acted=false;u.alive=true;u.variant='';delete u.modifier;delete u.artifact;}
  for(const [x,y]of [[4,3],[3,4],[4,4],[enemy.x,4]])s.map.tiles[y*s.map.width+x].terrain='grass';
  s=applyAction(s,{type:'ability',unitId:engineer.id,x:4,y:4});
  return {s,swordId:sword.id};
}

describe('AI sees allied traps and the cost of consuming hazards',()=>{
  for(const difficulty of ['easy','normal','hard'] as const)it(`${difficulty} advances safely around its engineer's actual trap`,()=>{
    const {s,swordId}=ownTrap();const command=chooseAiCommand(s,difficulty)!;
    expect(command.type).toBe('move');expect('unitId'in command&&command.unitId).toBe(swordId);
    expect(previewAction(s,command).hazardDamage??0).toBe(0);
    expect(applyAction(s,command).units.find(u=>u.id===swordId)!.hp).toBe(s.units.find(u=>u.id===swordId)!.hp);
  });
  it('keeps the consumed trap damage in the order evaluation',()=>{
    const {s,swordId}=ownTrap();const command={type:'move' as const,unitId:swordId,x:4,y:4};const next=applyAction(s,command);
    expect(next.map.tiles[4*s.map.width+4].object).toBeUndefined();
    expect(visibleOrderCost(s,command,next)).toBe(20);
  });
  it('can accept a trap to achieve a proven same-turn win in a narrow corridor',()=>{
    let {s,swordId}=ownTrap(true);const move=chooseAiCommand(s,'hard')!;
    expect(move).toEqual({type:'move',unitId:swordId,x:4,y:4});s=applyAction(s,move);
    const finish=chooseAiCommand(s,'hard')!;s=applyAction(s,finish);expect(s.winner).toBe('blue');
  });
});
