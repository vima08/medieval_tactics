import {describe,it,expect} from 'vitest';
import {stepCell,stairLowerNeighbour} from '../src/board-cursor';
import {createGame} from '../src/engine';
describe('precise board cursor and connecting slopes',()=>{
  it('moves exactly one logical tile without sprite or height hit testing',()=>{
    const p={x:3,y:3};expect(stepCell(p,'ArrowLeft',8,8)).toEqual({x:2,y:3});expect(stepCell(p,'ArrowRight',8,8)).toEqual({x:4,y:3});expect(stepCell(p,'ArrowUp',8,8)).toEqual({x:3,y:2});expect(stepCell(p,'ArrowDown',8,8)).toEqual({x:3,y:4});
  });
  it('stops at all map edges',()=>{
    expect(stepCell({x:0,y:0},'ArrowLeft',12,9)).toEqual({x:0,y:0});expect(stepCell({x:0,y:0},'ArrowUp',12,9)).toEqual({x:0,y:0});expect(stepCell({x:11,y:8},'ArrowDown',12,9)).toEqual({x:11,y:8});expect(stepCell({x:11,y:8},'ArrowRight',12,9)).toEqual({x:11,y:8});
  });
  it('connects stairs to the closest lower land height with a stable direction',()=>{
    const map=createGame({map:'tutorial',mode:'pvp'}).map,tile=map.tiles[3*8+4];expect(tile.terrain).toBe('stairs');const lower=stairLowerNeighbour(map,tile)!;expect(lower.h).toBe(1);expect(Math.abs(lower.x-tile.x)+Math.abs(lower.y-tile.y)).toBe(1);expect(stairLowerNeighbour(map,tile)).toEqual(lower);
    for(const t of map.tiles)if(t!==tile)t.h=tile.h;expect(stairLowerNeighbour(map,tile)).toBeUndefined();
  });
});
