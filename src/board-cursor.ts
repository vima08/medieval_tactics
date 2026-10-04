import type {GameMap,Tile} from './engine/types';
export type Cell={x:number;y:number};
export function stepCell(cell:Cell,key:string,width:number,height:number):Cell{
  const delta:Record<string,Cell>={ArrowLeft:{x:-1,y:0},ArrowRight:{x:1,y:0},ArrowUp:{x:0,y:-1},ArrowDown:{x:0,y:1}};
  const d=delta[key]??{x:0,y:0};return{x:Math.max(0,Math.min(width-1,cell.x+d.x)),y:Math.max(0,Math.min(height-1,cell.y+d.y))};
}
/** Connect stairs to an actual neighbouring lower edge, with a stable tie break. */
export function stairLowerNeighbour(map:GameMap,tile:Tile):Tile|undefined{
  return [[0,1],[1,0],[0,-1],[-1,0]].map(([dx,dy])=>map.tiles.find(t=>t.x===tile.x+dx&&t.y===tile.y+dy))
    .filter((t):t is Tile=>!!t&&t.terrain!=='water'&&t.h<tile.h)
    .sort((a,b)=>b.h-a.h)[0];
}
