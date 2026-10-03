import { ARCHETYPES } from '../engine/catalog';
import { applyAction, legalMoves, previewAction } from '../engine';
import type { Command, GameState, Team, Unit } from '../engine/types';
import { searchAction, type Difficulty } from './search';

export type { Difficulty } from './search';

const distance = (a: {x:number;y:number}, b: {x:number;y:number}) => Math.abs(a.x - b.x) + Math.abs(a.y - b.y);

function height(state: GameState, x: number, y: number): number {
  const tile = state.map.tiles[y * state.map.width + x];
  return tile?.x === x && tile?.y === y ? tile.h : state.map.tiles.find(t => t.x === x && t.y === y)?.h ?? 0;
}

function routeDistance(state:GameState,from:{x:number;y:number},targets:{x:number;y:number}[]):number {
  if(!targets.length)return 0;
  const queue=[{...from,d:0}],seen=new Set([`${from.x},${from.y}`]);
  for(let i=0;i<queue.length;i++) {
    const c=queue[i];if(targets.some(t=>t.x===c.x&&t.y===c.y))return c.d;
    for(const [dx,dy]of [[1,0],[-1,0],[0,1],[0,-1]]) {
      const x=c.x+dx,y=c.y+dy,k=`${x},${y}`,tile=state.map.tiles[y*state.map.width+x];
      if(x<0||y<0||x>=state.map.width||y>=state.map.height||seen.has(k)||!tile||tile.terrain==='water'||tile.object==='cover')continue;
      seen.add(k);queue.push({x,y,d:c.d+1});
    }
  }
  return state.map.width+state.map.height;
}
function scenarioValue(state:GameState):number {
  const o=state.objective;if(!['escort','evacuate','defend'].includes(o.kind))return 0;
  const protectedUnits=state.units.filter(u=>o.protectedIds?.includes(u.id));
  let value=(o.evacuatedIds?.length??0)*180+(o.defendedRounds??0)*22;
  if(o.kind==='defend')for(const p of o.defendPoints??[]) {
    if(state.units.some(u=>u.alive&&u.team==='blue'&&u.x===p.x&&u.y===p.y))value+=100;
    else value-=35;
  }
  for(const u of protectedUnits) {
    if(u.evacuated)continue;
    value+=u.alive?u.hp*12: -200;
    if(u.alive&&o.kind!=='defend')value-=routeDistance(state,u,o.exits??[])*12;
    if(u.alive&&o.kind==='defend')value-=routeDistance(state,u,o.defendPoints??[])*20;
    if(u.alive)for(const enemy of state.units.filter(e=>e.alive&&e.team==='red')) {
      const range=ARCHETYPES[enemy.archetype].range;
      const move=ARCHETYPES[enemy.archetype].move;
      const gap=distance(u,enemy);
      if(gap<=range+move)value-=(range+move+1-gap)*10;
    }
  }
  for(const u of state.units.filter(u=>u.alive&&u.team==='red')) {
    const targets=o.kind==='defend'?[...(o.defendPoints??[]),...protectedUnits.filter(p=>p.alive)]:protectedUnits.filter(p=>p.alive);
    value+=routeDistance(state,u,targets)*1.8;
    if(o.exits?.some(p=>p.x===u.x&&p.y===u.y))value-=14;
    if(o.defendPoints?.some(p=>p.x===u.x&&p.y===u.y))value-=60;
  }
  return value;
}
function positionalValue(state: GameState, unit: Unit, friends: Unit[], enemies: Unit[]): number {
  const tile = state.map.tiles.find(t => t.x === unit.x && t.y === unit.y);
  const strategicTargets = state.objective.kind === 'commander' && !unit.commander ? enemies.filter(e => e.commander) : enemies;
  const nearestEnemy = strategicTargets.length ? Math.min(...strategicTargets.map(e => distance(unit, e))) : 9;
  const elevated = height(state, unit.x, unit.y);
  let score = elevated * (unit.archetype === 'archer' ? 1.2 : 0.65);
  if (unit.archetype === 'archer') {
    score -= Math.abs(nearestEnemy - 4) * 0.38;
    if (nearestEnemy <= 1) score -= 5;
  } else if (unit.archetype === 'engineer') {
    score -= Math.abs(nearestEnemy - 3) * 0.3;
  } else {
    const pursuit = state.objective.kind === 'control' ? (unit.archetype === 'scout' ? 0.38 : 0.28) : state.objective.kind === 'elimination' ? 1.8 : 1.3;
    score -= nearestEnemy * pursuit;
  }
  if (state.objective.kind === 'elimination') score -= (Math.abs(unit.x - (state.map.width-1)/2) + Math.abs(unit.y - (state.map.height-1)/2)) * 1.6;

  if (tile?.object === 'trap') score -= 6;
  if (tile?.object === 'brazier') score -= 2;
  if (tile?.terrain === 'water') score -= 1.5;
  if (unit.guard && nearestEnemy <= 2) score += 1.8;
  if (state.objective.kind === 'commander' && unit.commander && nearestEnemy <= 3) score -= (4 - nearestEnemy) * 2.5;
  if (unit.pinned) score -= 1.2;
  if (unit.archetype === 'archer' && friends.some(f => f.id !== unit.id && f.archetype === 'shield' && distance(f, unit) === 1)) score += 1;

  for (const enemy of enemies) {
    const gap = distance(unit, enemy);
    const rules = ARCHETYPES[enemy.archetype];
    const reach = rules.range + (!enemy.moved ? rules.move : 0);
    if (gap <= reach && !enemy.acted) {
      score -= (unit.hp <= rules.damage ? 2.2 : 0.7) * (enemy.archetype === 'archer' && gap < 2 ? 0.25 : 1);
    }
    if (unit.archetype === 'scout' && gap === 1 && enemies.filter(other => distance(other, unit) === 1).length === 1) score += 0.5;
  }
  return score;
}

function controlValue(state: GameState, side: Team, friends: Unit[], enemies: Unit[]): number {
  if (state.objective.kind !== 'control') return 0;
  const opposing = side === 'blue' ? 'red' : 'blue';
  const enemyHeld = state.objective.points.filter(p => enemies.some(e => e.x === p.x && e.y === p.y)).length;
  const imminent = enemyHeld >= 2;
  let score = 0;
  for (const point of state.objective.points) {
    if (friends.some(u => u.x === point.x && u.y === point.y)) {
      score += 12;
      continue;
    }
    if (friends.length === 0) continue;
    const mobileCandidates = friends.filter(u => !state.objective.points.some(other => other !== point && u.x === other.x && u.y === other.y));
    const nearest = Math.min(...(mobileCandidates.length ? mobileCandidates : friends).map(u => distance(u, point)));
    const enemyOnPoint = enemies.some(u => u.x === point.x && u.y === point.y);
    // Evaluate each point once. Per-unit target switching made vacating a held
    // point look profitable because every ally suddenly acquired an easy goal.
    const central = Math.abs(point.x - (state.map.width - 1) / 2) <= 1;
    const urgency = enemyOnPoint && imminent ? 3.2 + state.objective.scores[opposing] * 0.7 : enemyOnPoint ? 1.8 : central ? 1.5 : 0.6;
    score -= nearest * urgency;
  }
  return score;
}

/** Stable, public-information evaluation. No hidden rolls or information. */
export function evaluatePosition(state: GameState, side: Team): number {
  if (state.winner) return state.winner === side ? 100000 : state.winner === 'draw' ? 0 : -100000;
  const friends = state.units.filter(u => u.alive && u.team === side);
  const enemies = state.units.filter(u => u.alive && u.team !== side);
  let score = (state.objective.scores[side] - state.objective.scores[side === 'blue' ? 'red' : 'blue']) * 14;
  for (const unit of friends) {
    score += unit.hp * 2.8 + 8 + positionalValue(state, unit, friends, enemies);
    if (unit.commander) score += unit.hp * 3;
  }
  for (const unit of enemies) {
    score -= unit.hp * 2.8 + 8 + positionalValue(state, unit, enemies, friends);
    if (unit.commander) score -= unit.hp * 3;
  }
  score += controlValue(state, side, friends, enemies) - controlValue(state, side === 'blue' ? 'red' : 'blue', enemies, friends);
  score += scenarioValue(state)*(side==='blue'?1:-1);
  return score;
}

export function aiCandidates(state: GameState): Command[] {
  if (state.winner) return [];
  const result: Command[] = [];
  const enemies = state.units.filter(u => u.alive && u.team !== state.team);
  for (const unit of state.units) {
    if (!unit.alive || unit.team !== state.team) continue;
    if (!unit.moved) {
      for (const cell of legalMoves(state, unit.id)) result.push({ type: 'move', unitId: unit.id, x: cell.x, y: cell.y });
    }
    if (unit.acted) continue;
    for (const enemy of enemies) {
      for (const type of ['attack', 'ability'] as const) {
        const action: Command = { type, unitId: unit.id, x: enemy.x, y: enemy.y };
        if (previewAction(state, action).valid) result.push(action);
      }
    }
    // Guard and trap placement target empty or friendly cells.
    if (unit.archetype === 'shield' || unit.archetype === 'sword' || unit.archetype === 'engineer' || unit.archetype === 'scout') {
      const cells = unit.archetype === 'shield' || unit.archetype === 'sword' ? [{ x: unit.x, y: unit.y }] : unit.archetype === 'scout'
        ? Array.from({ length: 25 }, (_, i) => ({ x: unit.x + Math.floor(i / 5) - 2, y: unit.y + i % 5 - 2 }))
            .filter(c => Math.max(Math.abs(c.x - unit.x), Math.abs(c.y - unit.y)) === 2)
        : [
          { x: unit.x + 1, y: unit.y }, { x: unit.x - 1, y: unit.y },
          { x: unit.x, y: unit.y + 1 }, { x: unit.x, y: unit.y - 1 },
        ];
      for (const cell of cells) {
        if (cell.x < 0 || cell.y < 0 || cell.x >= state.map.width || cell.y >= state.map.height) continue;
        const action: Command = { type: 'ability', unitId: unit.id, x: cell.x, y: cell.y };
        if (previewAction(state, action).valid) result.push(action);
      }
    }
  }
  result.push({ type: 'endTurn' });
  return result;
}

export function chooseAiCommand(state: GameState, difficulty: Difficulty = 'normal'): Command | null {
  if (state.winner) return null;
  const side = state.team;
  const baseNow = evaluatePosition(state, side);
  return searchAction(state, {
    candidates: aiCandidates,
    apply: (position, action) => applyAction(position, action),
    evaluate: position => {
      if (position.team !== side || position.winner) return evaluatePosition(position, side);
      const now = evaluatePosition(position, side);
      if (position.team !== 'red' || position.objective.kind !== 'control') return now;
      // Project the imminent round score for every candidate. Without this,
      // only endTurn pays the score cost and the AI burns actions to delay it.
      const scores = { ...position.objective.scores };
      for (const team of ['blue', 'red'] as const) {
        const held = position.objective.points.filter(p => position.units.some(u => u.alive && u.team === team && u.x === p.x && u.y === p.y)).length;
        scores[team] = held >= 2 ? scores[team] + 1 : 0;
      }
      if ((scores.blue >= position.objective.target || scores.red >= position.objective.target || position.turn >= 12) && scores.blue !== scores.red) {
        return scores[side] > scores[side === 'blue' ? 'red' : 'blue'] ? 100000 : -100000;
      }
      const own = side === 'blue' ? 'blue' : 'red';
      const foe = own === 'blue' ? 'red' : 'blue';
      const scoreDelta = (scores[own] - scores[foe]) - (position.objective.scores[own] - position.objective.scores[foe]);
      return now + scoreDelta * 14 + 0.03 * (now - baseNow);
    },
    key: action => action.type === 'endTurn' ? 'zz:end' : `${action.unitId}:${action.type}:${action.y.toString().padStart(2, '0')}:${action.x.toString().padStart(2, '0')}`,
    isTerminal: position => !!position.winner,
    isEndTurn: action => action.type === 'endTurn',
  }, difficulty, state.seed + state.turn * 271 + state.history.length);
}
