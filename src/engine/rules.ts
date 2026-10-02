import { ARCHETYPES, ARTIFACTS, MODIFIERS, PRESETS, VARIANTS, validateBlueprint } from './catalog';
import { makeMap } from './maps';
import type { Archetype, Blueprint, Command, GameMap, GameState, ObjectiveKind, Preview, ReachableCell, Team, Tile, Unit, UnitRules } from './types';

export type GameConfig = { map: 'tutorial' | 'highland'; mode: 'ai' | 'pvp'; seed?: number; objective?: ObjectiveKind; blueprintA?: Blueprint; blueprintB?: Blueprint };
const other = (t: Team): Team => t === 'blue' ? 'red' : 'blue';
export const MAX_ROUNDS = 12;
const key = (x: number, y: number) => `${x},${y}`;
const dist = (a: {x:number;y:number}, b: {x:number;y:number}) => Math.abs(a.x-b.x)+Math.abs(a.y-b.y);
const cheb = (a: {x:number;y:number}, b: {x:number;y:number}) => Math.max(Math.abs(a.x-b.x),Math.abs(a.y-b.y));
export const tileAt = (map: GameMap, x: number, y: number): Tile | undefined => x >= 0 && y >= 0 && x < map.width && y < map.height ? map.tiles[y * map.width + x] : undefined;
export const unitAt = (state: GameState, x: number, y: number): Unit | undefined => state.units.find(u => u.alive && u.x === x && u.y === y);
export function getUnitRules(unit: Unit): UnitRules {
  const r = { ...ARCHETYPES[unit.archetype] };
  switch (unit.variant) {
    case 'longbow': r.range++; r.move--; break;
    case 'hunter': r.range--; r.move++; break;
    case 'warden': r.hp++; r.move--; break;
    case 'duelist': r.hp--; break;
    case 'pike': r.range = 3; r.move--; break;
    case 'raider': r.move++; r.hp--; break;
    case 'tower': r.hp += 2; r.move--; break;
    case 'escort': r.move++; break;
    case 'runner': r.move++; r.hp--; break;
  }
  if (unit.modifier === 'heavy') r.move--;
  if (unit.modifier === 'swift') { r.move++; r.hp--; }
  if (unit.modifier === 'veteran') r.hp++;
  return r;
}
function initialHp(archetype: Archetype, variant: string, modifier?: string): number { return getUnitRules({ archetype, variant, modifier } as Unit).hp; }
function deploy(map: GameMap, team: Team, blueprint: Blueprint): Unit[] {
  const ys = map.id === 'tutorial' ? [2,4,6,1,5] : [5,8,11,3,14];
  const x = team === 'blue' ? 1 : map.width - 2;
  return blueprint.units.map((c, i) => {
    const variant = c.variant ?? VARIANTS[c.archetype][0].id;
    const hp = initialHp(c.archetype, variant, c.modifier);
    return { id: `${team}-${i+1}`, team, archetype: c.archetype, variant, modifier: c.modifier, artifact: c.artifact, x, y: ys[i], hp, maxHp: hp, moved: false, acted: false, guard: false, pinned: false, alive: true, commander: i === 0 };
  });
}
export function createGame(config: GameConfig): GameState {
  const tutorial = config.map === 'tutorial';
  const blue = config.blueprintA ?? (tutorial ? {name:'Учебный дозор',units:[{archetype:'sword' as const},{archetype:'archer' as const},{archetype:'spear' as const}]} : PRESETS[0]);
  const red = config.blueprintB ?? (tutorial ? {name:'Учебный враг',units:[{archetype:'sword' as const},{archetype:'spear' as const},{archetype:'archer' as const}]} : PRESETS[1]);
  const errors = [...validateBlueprint(blue), ...validateBlueprint(red)];
  if (errors.length) throw new Error(errors.join('; '));
  const map = makeMap(config.map);
  const objectiveKind = config.objective ?? (tutorial ? 'commander' : 'control');
  const points = objectiveKind === 'control' ? (tutorial ? [{x:4,y:1}] : [{x:3,y:9},{x:8,y:9},{x:9,y:9},{x:14,y:9}]) : [];
  return { map, units: [...deploy(map,'blue',blue),...deploy(map,'red',red)], team:'blue', turn:1, mode:config.mode, log:[{turn:1,team:'blue',message:'Битва начинается'}], history:[], seed:config.seed ?? 1, objective: {kind:objectiveKind,points,scores:{blue:0,red:0},target:tutorial?1:5}, initial:{map:config.map,mode:config.mode,seed:config.seed ?? 1,objective:objectiveKind,blueprintA:blue,blueprintB:red} };
}
function passable(tile?: Tile): boolean { return !!tile && tile.terrain !== 'water' && tile.object !== 'cover'; }
function movementCost(from: Tile, to: Tile, unit: Unit): number {
  const rise = to.h - from.h;
  if (rise > (to.terrain === 'stairs' ? 2 : 1) || rise < -2) return Infinity;
  let cost = 1 + Math.max(0,rise) + (to.terrain === 'rubble' ? 1 : 0);
  if (unit.artifact === 'boots' && rise > 0) cost--;
  return Math.max(1,cost);
}
export function legalMoves(state: GameState, unitId: string): ReachableCell[] {
  const u = state.units.find(v => v.id === unitId);
  if (!u || !u.alive || u.team !== state.team || u.moved || u.pinned || state.winner) return [];
  const limit = getUnitRules(u).move;
  const start = tileAt(state.map,u.x,u.y)!;
  const frontier = [{x:u.x,y:u.y,cost:0,path:[] as {x:number;y:number}[]}];
  const best = new Map<string, number>([[key(u.x,u.y),0]]);
  const paths = new Map<string, {x:number;y:number}[]>();
  const cells: ReachableCell[] = [];
  while (frontier.length) {
    frontier.sort((a,b)=>a.cost-b.cost);
    const cur = frontier.shift()!;
    if (cur.cost !== best.get(key(cur.x,cur.y))) continue;
    for (const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]) {
      const x=cur.x+dx,y=cur.y+dy, from=tileAt(state.map,cur.x,cur.y) ?? start,to=tileAt(state.map,x,y);
      if (!passable(to) || unitAt(state,x,y)) continue;
      const cost=cur.cost+movementCost(from,to!,u);
      if (cost > limit || cost >= (best.get(key(x,y)) ?? Infinity)) continue;
      const path=[...cur.path,{x,y}];
      best.set(key(x,y),cost); paths.set(key(x,y),path); frontier.push({x,y,cost,path});
    }
  }
  for (const [k,cost] of best) if (cost>0) {
    const [x,y]=k.split(',').map(Number);
    // Forecast direct attacks from visible enemy positions after this move.
    const forecast:GameState={...state,team:other(u.team),units:state.units.map(v=>v.id===u.id?{...v,x,y}:v.team!==u.team?{...v,acted:false}:v)};
    const threatened=forecast.units.some(v=>v.alive&&v.team!==u.team&&previewAction(forecast,{type:'attack',unitId:v.id,x,y}).valid);
    cells.push({x,y,cost,path:paths.get(k) ?? [{x,y}],threatened});
  }
  return cells.sort((a,b)=>a.cost-b.cost||a.y-b.y||a.x-b.x);
}

export function lineOfSight(state: GameState, from: {x:number;y:number}, to: {x:number;y:number}, ignoreAllies = false): {clear:boolean;reason?:string} {
  const a=tileAt(state.map,from.x,from.y), b=tileAt(state.map,to.x,to.y);
  if (!a || !b) return {clear:false,reason:'Вне поля'};
  const steps=Math.max(Math.abs(to.x-from.x),Math.abs(to.y-from.y));
  for(let i=1;i<steps;i++) {
    const x=Math.round(from.x+(to.x-from.x)*i/steps),y=Math.round(from.y+(to.y-from.y)*i/steps);
    const tile=tileAt(state.map,x,y);
    if (!tile) return {clear:false,reason:'Вне поля'};
    const ray=a.h+0.8+(b.h-a.h)*i/steps;
    if (tile.h > ray || tile.object === 'cover') return {clear:false,reason:`Обзор закрыт: ${x+1}:${y+1}`};
    const blocker=unitAt(state,x,y);
    if (blocker && !(ignoreAllies && blocker.team===unitAt(state,from.x,from.y)?.team)) return {clear:false,reason:`Обзор закрыт бойцом ${blocker.id}`};
  }
  return {clear:true};
}
function adjacentAlly(state: GameState, unit: Unit, kind?: Archetype): boolean { return state.units.some(v=>v.alive&&v.id!==unit.id&&v.team===unit.team&&(!kind||v.archetype===kind)&&dist(v,unit)===1); }
function defended(state: GameState, target: Unit): number {
  let armor=target.guard?1:0;
  if(state.units.some(v=>v.alive&&v.team===target.team&&v.archetype==='shield'&&v.id!==target.id&&dist(v,target)===1&&(v.variant!=='escort'||v.guard))) armor++;
  return Math.min(2,armor);
}
function attackDamage(state: GameState, u: Unit, target: Unit, ability: boolean): number {
  let d=getUnitRules(u).damage;
  const from=tileAt(state.map,u.x,u.y)!,to=tileAt(state.map,target.x,target.y)!;
  if(from.h>to.h) d++;
  if(u.archetype==='archer' && to.h>from.h) d=Math.max(1,d-1);
  if(u.archetype==='archer' && ability) d++;
  if(u.archetype==='sword' && ability) d=2;
  if(u.variant==='duelist'&&!adjacentAlly(state,target)) d++;
  if(u.archetype==='scout' && state.units.some(v=>v.alive&&v.team===u.team&&dist(v,target)===1&&v.id!==u.id)) d++;
  if(u.variant==='ambusher' && (to.object==='trap'||to.object==='brazier')) d++;
  if(u.artifact==='ember' && (to.object==='trap'||to.object==='brazier')) d++;
  if(state.units.some(v=>v.alive&&v.team===u.team&&v.id!==u.id&&v.artifact==='standard'&&dist(v,u)===1)) d++;
  return Math.max(0,d-defended(state,target));
}
function attackGeometry(state: GameState,u:Unit,target:Unit): string|undefined {
  const r=getUnitRules(u),dx=Math.abs(target.x-u.x),dy=Math.abs(target.y-u.y),n=dist(u,target);
  if(u.archetype==='archer') {
    if(n<r.minRange) return 'Лучник не стреляет вплотную';
    if(n>r.range) return 'Цель вне дальности';
    const los=lineOfSight(state,u,target);
    if(!los.clear) return los.reason;
  } else if(u.archetype==='spear') {
    if(n>r.range || !(dx===0||dy===0)) return 'Копьё бьёт только по прямой';
    if(n>1 && !lineOfSight(state,u,target,true).clear) return 'Линия копья перекрыта';
  } else if(u.archetype==='engineer') {
    if(n>r.range) return 'Цель вне дальности';
    if(!lineOfSight(state,u,target).clear) return 'Нет линии броска';
  } else if((u.archetype==='scout'?cheb(u,target):n)>r.range) return 'Нужна соседняя клетка';
  const from=tileAt(state.map,u.x,u.y)!,to=tileAt(state.map,target.x,target.y)!;
  if(Math.abs(from.h-to.h)>1 && u.archetype!=='archer' && u.archetype!=='engineer') return 'Слишком большой перепад высот';
  return undefined;
}
function objectAttackPreview(state:GameState,u:Unit,tile:Tile,ability:boolean):Preview {
  const base:Preview={valid:false,type:ability?'ability':'attack',unitId:u.id,from:{x:u.x,y:u.y},to:{x:tile.x,y:tile.y}};
  if(tile.object!=='cover'&&tile.object!=='fragile') return {...base,reason:'Нет разрушаемого объекта'};
  const sabotage=ability&&u.archetype==='engineer'&&dist(u,tile)===1&&tile.object==='fragile';
  if(!sabotage) {
    const geometry=attackGeometry(state,u,{x:tile.x,y:tile.y} as Unit);
    if(geometry) return {...base,reason:geometry,blockedBy:geometry};
  }
  const from=tileAt(state.map,u.x,u.y)!;
  const raw=sabotage?2:Math.max(1,getUnitRules(u).damage+(from.h>tile.h?1:0));
  const objectDamage=Math.min(tile.hp??2,raw);
  const remaining=Math.max(0,(tile.hp??2)-objectDamage);
  const collapsed=remaining===0;
  const tileChange={x:tile.x,y:tile.y,h:collapsed&&tile.object==='fragile'?0:tile.h,
    terrain:collapsed?(tile.object==='fragile'?'water' as const:'rubble' as const):tile.terrain,
    object:collapsed?undefined:tile.object,hp:collapsed?undefined:remaining};
  const occupant=collapsed&&tile.object==='fragile'?unitAt(state,tile.x,tile.y):undefined;
  return {...base,valid:true,objectDamage,tileChange,targetId:occupant?.id,
    damage:occupant?.hp,killed:!!occupant,
    explanation:collapsed?(tile.object==='fragile'?'Мост рушится: вода; боец на мосту погибает':'Укрытие разрушено: проход открыт'):
      `${tile.object==='fragile'?'Мост':'Укрытие'}: ${remaining} прочности после удара`};
}
function pushPreview(state:GameState,u:Unit,t:Unit): Pick<Preview,'push'|'fallDamage'|'hazardDamage'> {
  if(t.modifier==='heavy') return {};
  const dx=Math.sign(t.x-u.x),dy=Math.sign(t.y-u.y);
  if(Math.abs(dx)+Math.abs(dy)!==1) return {};
  let x=t.x+dx,y=t.y+dy;
  const from=tileAt(state.map,t.x,t.y)!,to=tileAt(state.map,x,y);
  if(!passable(to)||unitAt(state,x,y)) return {hazardDamage:1};
  if(u.artifact==='hook') { const next=tileAt(state.map,x+dx,y+dy); if(passable(next)&&!unitAt(state,x+dx,y+dy)) {x+=dx;y+=dy;} }
  const end=tileAt(state.map,x,y)!;
  return {push:{x,y},fallDamage:Math.max(0,from.h-end.h-1)*2,hazardDamage:end.object==='trap'?2:end.object==='brazier'?1:0};
}
export function previewAction(state:GameState,command:Command):Preview {
  if(command.type==='endTurn') return {valid:!state.winner,type:'endTurn',reason:state.winner?'Матч завершён':undefined};
  if(command.type==='undo') {const u=state.units.find(v=>v.id===command.unitId);return {valid:!!u?.undo&&!u.acted,type:'undo',unitId:command.unitId,reason:u?.undo&&!u.acted?undefined:'Перемещение уже нельзя отменить'};}
  const u=state.units.find(v=>v.id===command.unitId);
  const base:Preview={valid:false,type:command.type,unitId:command.unitId,from:u?{x:u.x,y:u.y}:undefined,to:{x:command.x,y:command.y}};
  if(state.winner) return {...base,reason:'Матч завершён'};
  if(!u||!u.alive) return {...base,reason:'Боец недоступен'};
  if(u.team!==state.team) return {...base,reason:'Ход другой стороны'};
  const tile=tileAt(state.map,command.x,command.y);
  if(!tile) return {...base,reason:'Вне поля'};
  if(command.type==='move') {
    if(u.moved) return {...base,reason:'Движение уже потрачено'};
    const move=legalMoves(state,u.id).find(c=>c.x===command.x&&c.y===command.y);
    if(!move) return {...base,reason:'Клетка недоступна: дальность, высота или препятствие'};
    return {...base,valid:true,path:move.path,cost:move.cost,hazardDamage:tile.object==='trap'?2:tile.object==='brazier'?1:0,explanation:`Маршрут: ${move.cost} очк. движения`};
  }
  if(u.acted) return {...base,reason:'Действие уже потрачено'};
  if(command.type==='ability' && u.archetype==='shield') {
    if(command.x!==u.x||command.y!==u.y) return {...base,reason:'Стража применяется к себе'};
    return {...base,valid:true,explanation:'Стража: -1 урон себе и соседним союзникам до следующего хода'};
  }
  if(command.type==='ability' && u.archetype==='engineer') {
    if(tile.object==='fragile') {
      if(dist(u,command)!==1) return {...base,reason:'Подрыв моста только с соседней клетки'};
      return objectAttackPreview(state,u,tile,true);
    }
    if(dist(u,command)!==1||!passable(tile)||unitAt(state,command.x,command.y)||tile.object) return {...base,reason:'Ловушка ставится на свободную соседнюю клетку'};
    return {...base,valid:true,explanation:'Ловушка: 2 урона вступившему бойцу'};
  }
  if(command.type==='ability' && u.archetype==='scout') {
    if(cheb(u,command)!==2||!passable(tile)||unitAt(state,command.x,command.y)) return {...base,reason:'Рывок на свободную клетку в двух шагах'};
    if(Math.abs(tile.h-tileAt(state.map,u.x,u.y)!.h)>1) return {...base,reason:'Перепад высот слишком велик'};
    return {...base,valid:true,hazardDamage:tile.object==='trap'?2:tile.object==='brazier'?1:0,explanation:'Рывок через занятую клетку'};
  }
  const target=unitAt(state,command.x,command.y);
  if(command.type==='attack'&&!target&&(tile.object==='cover'||tile.object==='fragile')) return objectAttackPreview(state,u,tile,false);
  if(!target||target.team===u.team) return {...base,reason:'Нужен вражеский боец'};
  const geometry=attackGeometry(state,u,target);
  if(geometry) return {...base,reason:geometry,blockedBy:geometry};
  let damage=attackDamage(state,u,target,command.type==='ability');
  const push=(damage<target.hp&&command.type==='ability'&&['sword','spear'].includes(u.archetype))?pushPreview(state,u,target):{};
  const total=damage+(push.fallDamage??0)+(push.hazardDamage??0);
  const counterDamage=(dist(u,target)===1&&target.archetype==='sword'&&target.guard&&target.hp>total)?1:0;
  return {...base,valid:true,targetId:target.id,damage,counterDamage,killed:total>=target.hp,...push,explanation:`${damage} урона${push.push?' · отбрасывание':''}${push.fallDamage?` · падение ${push.fallDamage}`:''}${push.hazardDamage?` · опасность ${push.hazardDamage}`:''}${counterDamage?' · контратака 1':''}`};
}
function clone(state:GameState):GameState { return JSON.parse(JSON.stringify(state)) as GameState; }
function record(s:GameState,message:string,command?:Command) { s.log.push({turn:s.turn,team:s.team,message,command}); if(s.log.length>120)s.log.shift(); }
function checkVictory(s:GameState) {
  const blueAlive=s.units.some(u=>u.alive&&u.team==='blue');
  const redAlive=s.units.some(u=>u.alive&&u.team==='red');
  if(!blueAlive||!redAlive) {
    s.winner=blueAlive?'blue':redAlive?'red':'draw';
    record(s,s.winner==='draw'?'Обе дружины погибли':`Победа: ${s.winner==='blue'?'Синий дозор':'Красная дружина'}`);
    return;
  }
  if(s.objective.kind==='commander') {
    const blueCommander=s.units.some(u=>u.alive&&u.team==='blue'&&u.commander);
    const redCommander=s.units.some(u=>u.alive&&u.team==='red'&&u.commander);
    if(!blueCommander||!redCommander) {
      s.winner=blueCommander?'blue':redCommander?'red':'draw';
      record(s,s.winner==='draw'?'Оба командира погибли':`Победа над командиром: ${s.winner}`);
    }
    return;
  }
  if(s.objective.kind==='control') {
    const {blue,red}=s.objective.scores;
    if(blue>=s.objective.target||red>=s.objective.target) {
      if(blue>red) s.winner='blue';
      if(red>blue) s.winner='red';
      if(s.winner) record(s,`Победа по контролю: ${s.winner} (${blue}:${red})`);
    }
  }
}
export function applyAction(state:GameState,command:Command):GameState {
  if(command.type==='endTurn') return endTurn(state);
  if(command.type==='undo') return undoMove(state,command.unitId);
  const p=previewAction(state,command);
  if(!p.valid) throw new Error(p.reason??'Недопустимое действие');
  const s=clone(state),u=s.units.find(v=>v.id===command.unitId)!;
  if(command.type==='move') {
    u.undo=(p.hazardDamage??0)>0?undefined:{x:u.x,y:u.y,moved:u.moved};u.x=command.x;u.y=command.y;u.moved=true;
    u.hp-=p.hazardDamage??0;
    if(u.hp<=0){u.hp=0;u.alive=false;}
    const tile=tileAt(s.map,u.x,u.y)!;
    if(tile.object==='trap') tile.object=undefined;
    record(s,`${u.id} переместился (${p.cost} очк.)${p.hazardDamage?` и получил ${p.hazardDamage} урона`:''}`,command);
  } else if(command.type==='ability'&&u.archetype==='shield') {
    u.guard=true;u.acted=true;u.undo=undefined;record(s,`${u.id} встал в стражу`,command);
  } else if(command.type==='ability'&&u.archetype==='engineer'&&!p.tileChange) {
    tileAt(s.map,command.x,command.y)!.object='trap';u.acted=true;u.undo=undefined;record(s,`${u.id} поставил ловушку`,command);
  } else if(command.type==='ability'&&u.archetype==='scout') {
    u.x=command.x;u.y=command.y;u.acted=true;u.moved=true;u.undo=undefined;u.hp-=p.hazardDamage??0;
    if(u.hp<=0){u.hp=0;u.alive=false;}
    record(s,`${u.id} совершил рывок`,command);
  } else if(p.tileChange) {
    const changed=tileAt(s.map,p.tileChange.x,p.tileChange.y)!;
    changed.h=p.tileChange.h;changed.terrain=p.tileChange.terrain;
    changed.object=p.tileChange.object;changed.hp=p.tileChange.hp;
    if(p.targetId) {const victim=s.units.find(v=>v.id===p.targetId)!;victim.hp=0;victim.alive=false;}
    u.acted=true;u.undo=undefined;
    record(s,`${u.id} повредил объект на ${p.objectDamage}; ${p.explanation}`,command);
  } else {
    const t=s.units.find(v=>v.id===p.targetId)!;
    t.hp-=p.damage??0;
    if(t.hp>0) {
      if(p.push) {t.x=p.push.x;t.y=p.push.y;t.pinned=u.archetype==='spear';}
      t.hp-=(p.fallDamage??0)+(p.hazardDamage??0);
      if(p.push&&p.hazardDamage&&tileAt(s.map,t.x,t.y)?.object==='trap')tileAt(s.map,t.x,t.y)!.object=undefined;
    }
    if(t.hp<=0){t.hp=0;t.alive=false;}
    if(p.counterDamage&&u.alive){u.hp-=p.counterDamage;if(u.hp<=0){u.hp=0;u.alive=false;}}
    u.acted=true;u.undo=undefined;
    if(command.type==='ability'&&u.archetype==='archer')u.moved=true;
    record(s,`${u.id} ударил ${t.id}: ${p.damage} урона${p.push?`, толчок (${p.push.x+1}:${p.push.y+1})`:''}${p.fallDamage?`, падение ${p.fallDamage}`:''}${!t.alive?', цель погибла':''}`,command);
  }
  s.history.push(command);checkVictory(s);return s;
}
export function undoMove(state:GameState,unitId:string):GameState {
  const u=state.units.find(v=>v.id===unitId);
  if(!u||u.team!==state.team||!u.undo||u.acted||!u.alive) throw new Error('Перемещение уже нельзя отменить');
  const s=clone(state),v=s.units.find(w=>w.id===unitId)!;
  if(unitAt(s,v.undo!.x,v.undo!.y)) throw new Error('Исходная клетка занята');
  const old=v.undo!;v.x=old.x;v.y=old.y;v.moved=old.moved;v.undo=undefined;
  // Undo is also a command in the replay stream, so it reproduces the same state.
  s.history.push({type:'undo',unitId,x:old.x,y:old.y});
  record(s,`${unitId} отменил перемещение`);
  return s;
}
export function endTurn(state:GameState):GameState {
  if(state.winner) throw new Error('Матч завершён');
  const s=clone(state),current=s.team;
  if(s.objective.kind==='control' && current==='red') {
    // Resolve the entire round at one instant. Red can answer blue's occupation.
    for(const team of ['blue','red'] as Team[]) {
      let held=0;
      for(const p of s.objective.points) if(s.units.some(u=>u.alive&&u.team===team&&u.x===p.x&&u.y===p.y)) held++;
      if(held>=Math.min(2,s.objective.points.length)) {s.objective.scores[team]++;record(s,`${team==='blue'?'Синий дозор':'Красная дружина'} удерживает ${held} точки: ${s.objective.scores[team]}/${s.objective.target}`);}
      else s.objective.scores[team]=0;
    }
  }
  s.history.push({type:'endTurn'});checkVictory(s);
  if(!s.winner&&current==='red'&&s.turn>=MAX_ROUNDS) {
    if(s.objective.kind==='control') {
      const {blue,red}=s.objective.scores;
      s.winner=blue===red?'draw':blue>red?'blue':'red';
      record(s,s.winner==='draw'?'Ничья по лимиту раундов':`Победа по очкам: ${s.winner}`);
    } else {
      const blue=s.units.filter(u=>u.alive&&u.team==='blue');
      const red=s.units.filter(u=>u.alive&&u.team==='red');
      const blueHp=blue.reduce((total,u)=>total+u.hp,0);
      const redHp=red.reduce((total,u)=>total+u.hp,0);
      s.winner=blue.length!==red.length?(blue.length>red.length?'blue':'red'):blueHp===redHp?'draw':blueHp>redHp?'blue':'red';
      record(s,s.winner==='draw'?'Ничья по лимиту раундов':`Победа по числу бойцов и здоровью: ${s.winner}`);
    }
  }
  if(s.winner)return s;
  s.team=other(current);if(s.team==='blue')s.turn++;
  for(const u of s.units) if(u.team===s.team){u.moved=false;u.acted=false;u.guard=false;u.pinned=false;u.undo=undefined;}
  record(s,`Ход ${s.turn}: ${s.team==='blue'?'Синий дозор':'Красная дружина'}`);
  return s;
}
export function getThreats(state:GameState,team:Team): {unitId:string;targetId:string;damage:number;cells:{x:number;y:number}[]}[] {
  const s=state.team===team?state:{...state,team};
  const out:{unitId:string;targetId:string;damage:number;cells:{x:number;y:number}[]}[]=[];
  for(const u of s.units.filter(v=>v.alive&&v.team===team&&!v.acted)) for(const t of s.units.filter(v=>v.alive&&v.team!==team)) {
    const p=previewAction(s,{type:'attack',unitId:u.id,x:t.x,y:t.y});
    if(p.valid)out.push({unitId:u.id,targetId:t.id,damage:p.damage??0,cells:[{x:t.x,y:t.y}]});
  }
  return out;
}
export function availableTargets(state:GameState,unitId:string):Preview[] {
  const u=state.units.find(v=>v.id===unitId);if(!u)return[];
  return state.units.filter(v=>v.alive&&v.team!==u.team).map(v=>previewAction(state,{type:'attack',unitId,x:v.x,y:v.y})).filter(p=>p.valid);
}
export function serializeGame(state:GameState):string {return JSON.stringify(state);}
export function restoreGame(json:string):GameState {const s=JSON.parse(json) as GameState;if(!s.map||!Array.isArray(s.units)||!Array.isArray(s.history))throw new Error('Повреждённое сохранение');return s;}
export function replayGame(initial:GameConfig,commands:Command[]):GameState {
  let s=createGame(initial);
  for(const c of commands) s=applyAction(s,c);
  return s;
}
