import type { GameMap, Tile } from './types';

function terrain(x: number, y: number, tutorial: boolean): Tile {
  if (tutorial) {
    const h = x >= 4 && y <= 3 ? 2 : x >= 3 && y <= 5 ? 1 : 0;
    return { x, y, h, terrain: (x === 3 && y === 3) || (x === 4 && y === 4) ? 'stairs' : 'grass' };
  }
  const north = y < 6 && x > 3 && x < 14;
  const south = y > 11 && x > 3 && x < 14;
  const ridge = (x === 7 || x === 10) && y > 5 && y < 13;
  const hill = ((x >= 5 && x <= 6) || (x >= 11 && x <= 12)) && ((y >= 2 && y <= 4) || (y >= 13 && y <= 15));
  const h = hill ? 2 : ridge || north || south ? 1 : 0;
  return { x, y, h, terrain: 'grass' };
}
export function makeMap(id: 'tutorial' | 'highland'): GameMap {
  const tutorial = id === 'tutorial';
  const width = tutorial ? 8 : 18;
  const height = tutorial ? 8 : 18;
  const tiles: Tile[] = [];
  for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) tiles.push(terrain(x, y, tutorial));
  const map: GameMap = { id, name: tutorial ? 'Ступени пепла' : 'Перевал Серой Короны', width, height, tiles };
  const put = (x: number, y: number, patch: Partial<Tile>) => Object.assign(tiles[y * width + x], patch);
  if (tutorial) {
    put(3, 3, { terrain: 'stairs', h: 1 }); put(4, 3, { terrain: 'stairs', h: 2 });
    put(5, 5, { object: 'cover', hp: 2 }); put(4, 1, { object: 'objective' });
    put(6, 4, { object: 'brazier' });
  } else {
    for (let y = 0; y < 18; y++) {
      if (y !== 4 && y !== 9 && y !== 13) { put(8, y, { terrain: 'water', h: 0 }); put(9, y, { terrain: 'water', h: 0 }); }
    }
    for (const y of [4, 9, 13]) { put(8, y, { terrain: 'bridge', h: 1, object: 'fragile', hp: 2 }); put(9, y, { terrain: 'bridge', h: 1, object: 'fragile', hp: 2 }); }
    for (const [x,y] of [[5,5],[12,5],[5,12],[12,12]]) put(x,y,{terrain:'stairs'});
    for (const [x,y] of [[6,8],[11,8],[6,10],[11,10]]) put(x,y,{object:'cover',hp:2});
    for (const [x,y] of [[4,9],[13,9]]) put(x,y,{object:'brazier'});
    for (const [x,y] of [[4,4],[13,4],[4,13],[13,13]]) put(x,y,{object:'trap'});
    for (const [x,y] of [[3,9],[14,9],[8,9],[9,9]]) put(x,y,{object:'objective'});
  }
  return map;
}
