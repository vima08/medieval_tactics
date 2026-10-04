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
export function makeMap(id: GameMap['id']): GameMap {
  if(id.startsWith('thaw_'))return thawMap(id);
  if (id !== 'tutorial' && id !== 'highland') return campaignMap(id);
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

function thawMap(id:GameMap['id']):GameMap{
  const specs:Record<string,[string,number,number]>={thaw_dike:['Глиняная дамба',12,9],thaw_mill:['Мельничный рукав',14,10],thaw_bells:['Три колокола',13,11],thaw_ferry:['Паромная ночь',14,10],thaw_quarry:['Камень для воды',12,10],thaw_sluice:['Верхний затвор',15,12]};
  const [name,width,height]=specs[id];const tiles:Tile[]=[];
  for(let y=0;y<height;y++)for(let x=0;x<width;x++)tiles.push({x,y,h:0,terrain:'grass'});
  const put=(x:number,y:number,p:Partial<Tile>)=>Object.assign(tiles[y*width+x],p);
  if(id==='thaw_dike'){
    for(let x=0;x<width;x++)put(x,0,{terrain:'water'});
    for(let x=2;x<=8;x++)put(x,2,{h:1,terrain:'stone'});
    put(2,2,{terrain:'stairs'});put(8,2,{terrain:'stairs'});put(3,4,{object:'objective'});
    put(5,4,{object:'cover',hp:2});put(5,6,{object:'cover',hp:2});put(7,5,{terrain:'rubble'});put(9,7,{object:'brazier'});
  }else if(id==='thaw_mill'){
    for(let y=0;y<height;y++)if(y!==3&&y!==7){put(6,y,{terrain:'water'});put(7,y,{terrain:'water'});}
    for(const y of[3,7])for(const x of[6,7])put(x,y,{terrain:'bridge',object:'fragile',hp:2});
    for(let x=9;x<=12;x++)for(let y=1;y<=3;y++)put(x,y,{h:1,terrain:'stone'});
    put(9,3,{terrain:'stairs'});put(12,3,{object:'objective'});put(12,7,{object:'objective'});put(8,5,{object:'cover',hp:2});put(4,6,{object:'brazier'});
  }else if(id==='thaw_bells'){
    for(const [x,y]of[[4,3],[6,5],[8,7]]){put(x,y,{object:'objective',h:1,terrain:'stairs'});put(x,y-1,{h:1,terrain:'stone'});}
    for(let y=0;y<height;y++)if(y!==3&&y!==5&&y!==7)put(6,y,{terrain:'water'});
    put(6,3,{terrain:'bridge'});put(6,7,{terrain:'bridge'});put(5,8,{object:'cover',hp:2});put(7,2,{object:'cover',hp:2});
  }else if(id==='thaw_ferry'){
    for(let y=0;y<height;y++)if(y!==2&&y!==7)put(7,y,{terrain:'water'});
    put(7,2,{terrain:'bridge',object:'fragile',hp:2});put(7,7,{terrain:'stone'});
    for(let x=9;x<=11;x++)put(x,4,{h:1,terrain:'stone'});put(9,4,{terrain:'stairs'});put(11,4,{terrain:'stairs'});
    put(13,2,{object:'objective'});put(13,7,{object:'objective'});put(9,6,{object:'cover',hp:2});put(5,3,{object:'brazier'});
  }else if(id==='thaw_quarry'){
    for(let x=4;x<=9;x++)for(let y=2;y<=6;y++)put(x,y,{h:x>=7?2:1,terrain:'stone'});
    put(4,3,{terrain:'stairs'});put(4,6,{terrain:'stairs'});put(7,3,{terrain:'stairs'});put(7,6,{terrain:'stairs'});
    put(5,4,{object:'cover',hp:2});put(8,4,{object:'cover',hp:2});put(6,7,{terrain:'rubble'});put(9,8,{object:'brazier'});
  }else{
    for(let y=0;y<height;y++)if(y!==3&&y!==8)put(7,y,{terrain:'water'});
    put(7,3,{terrain:'bridge',object:'fragile',hp:2});put(7,8,{terrain:'bridge'});
    for(let x=9;x<=13;x++)for(let y=2;y<=8;y++)put(x,y,{h:x>=11?2:1,terrain:'stone'});
    for(const y of[3,8]){put(9,y,{terrain:'stairs'});put(11,y,{terrain:'stairs'});}
    put(10,5,{object:'cover',hp:2});put(5,6,{object:'cover',hp:2});put(12,6,{object:'brazier'});
  }
  return{id,name,width,height,tiles};
}

/** Small authored dioramas: each has a fast central contact and a safer flank. */
function campaignMap(id: GameMap['id']): GameMap {
  const specs: Record<string, { name: string; width: number; height: number }> = {
    ford: { name: 'Зольный брод', width: 8, height: 7 },
    watch: { name: 'Сторожевая терраса', width: 9, height: 8 },
    steps: { name: 'Копейные ступени', width: 10, height: 8 },
    gate: { name: 'Ворота дозора', width: 10, height: 9 },
    marsh: { name: 'Тропа в тростниках', width: 11, height: 9 },
    kiln: { name: 'Последняя печь', width: 12, height: 10 },
    caravan: { name: 'Караванное ущелье', width: 12, height: 9 },
    granary: { name: 'Ночной амбар', width: 11, height: 9 },
    evacuation: { name: 'Последние лодки', width: 11, height: 9 },
    summit: { name: 'Вершина Серой Короны', width: 12, height: 10 },
  };
  const spec = specs[id];
  if (!spec) throw new Error(`Неизвестная карта: ${id}`);
  const { width, height, name } = spec;
  const tiles: Tile[] = [];
  for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) tiles.push({ x, y, h: 0, terrain: 'grass' });
  const put = (x: number, y: number, patch: Partial<Tile>) => Object.assign(tiles[y * width + x], patch);
  if (id === 'ford') {
    for (let y = 0; y < height; y++) if (y !== 3 && y !== 5) put(4, y, { terrain: 'water' });
    put(4, 3, { terrain: 'bridge' }); put(4, 5, { terrain: 'stone' });
    for (const [x,y] of [[2,1],[2,2],[3,1],[3,2]]) put(x,y,{h:1});
    put(3,2,{terrain:'stairs'}); put(6,1,{object:'cover',hp:2});
  } else if (id === 'watch') {
    for (let y=1;y<=4;y++) for(let x=2;x<=4;x++) put(x,y,{h:2,terrain:'stone'});
    put(2,4,{terrain:'stairs'}); put(4,4,{terrain:'stairs'});
    put(5,2,{object:'cover',hp:2}); put(5,3,{object:'cover',hp:2});
    put(7,6,{object:'brazier'});
  } else if (id === 'steps') {
    for(let x=3;x<=6;x++) {put(x,2,{h:1,terrain:'stone'});put(x,3,{h:1,terrain:'stone'});}
    put(3,3,{terrain:'stairs'}); put(6,3,{terrain:'stairs'});
    for(const [x,y] of [[4,1],[4,4],[5,1],[5,4]]) put(x,y,{object:'cover',hp:2});
    put(5,6,{object:'brazier'});
  } else if (id === 'gate') {
    for(let y=0;y<height;y++) if(y!==3 && y!==4 && y!==7) put(5,y,{h:1,object:'cover',hp:2,terrain:'stone'});
    for(let x=6;x<=8;x++) for(let y=2;y<=5;y++) put(x,y,{h:1,terrain:'stone'});
    put(6,3,{terrain:'stairs'}); put(6,4,{terrain:'stairs'});
    put(3,4,{object:'objective'}); put(7,4,{object:'objective'});
  } else if (id === 'marsh') {
    for(let x=4;x<=6;x++) for(let y=0;y<height;y++) if(y!==2 && y!==6) put(x,y,{terrain:'water'});
    for(let x=4;x<=6;x++) {put(x,2,{terrain:'bridge'});put(x,6,{terrain:'stone'});}
    for(let x=7;x<=9;x++) for(let y=1;y<=3;y++) put(x,y,{h:1});
    put(7,2,{terrain:'stairs'}); put(8,4,{object:'cover',hp:2});
    put(4,6,{object:'trap'}); put(8,6,{object:'brazier'});
  } else if (id === 'kiln') {
    for(let y=0;y<height;y++) if(y!==3 && y!==7) {put(5,y,{terrain:'water'});put(6,y,{terrain:'water'});}
    for(const y of [3,7]) for(const x of [5,6]) put(x,y,{h:1,terrain:'bridge',object:'fragile',hp:2});
    for(let x=2;x<=4;x++) for(let y=1;y<=4;y++) put(x,y,{h:1,terrain:'stone'});
    for(let x=7;x<=9;x++) for(let y=5;y<=8;y++) put(x,y,{h:1,terrain:'stone'});
    put(2,4,{terrain:'stairs'}); put(4,3,{terrain:'stairs'}); put(7,7,{terrain:'stairs'}); put(9,5,{terrain:'stairs'});
    put(4,3,{object:'objective'}); put(7,7,{object:'objective'});
    put(8,3,{object:'cover',hp:2}); put(3,7,{object:'cover',hp:2});
    put(7,3,{object:'trap'}); put(8,6,{object:'brazier'});
  } else if(id==='caravan') {
    for(let y=0;y<height;y++) if(y!==3&&y!==7) put(5,y,{terrain:'water'});
    put(5,3,{terrain:'bridge',object:'fragile',hp:2});put(5,7,{terrain:'stone'});
    for(let x=7;x<=10;x++) put(x,1,{h:1,terrain:'stone'});
    put(7,2,{terrain:'stairs',h:1});put(7,5,{object:'cover',hp:2});put(6,3,{object:'trap'});
    put(11,3,{object:'objective'});put(11,7,{object:'objective'});
  } else if(id==='granary') {
    for(let y=0;y<height;y++) if(y!==3&&y!==5&&y!==7) put(5,y,{terrain:'stone',object:'cover',hp:2});
    for(let x=1;x<=3;x++) put(x,1,{h:1,terrain:'stone'});
    put(2,2,{h:1,terrain:'stairs'});put(2,4,{object:'objective'});put(6,6,{object:'brazier'});put(5,7,{terrain:'rubble'});
  } else if(id==='evacuation') {
    for(let y=0;y<height;y++) if(y!==2&&y!==6) put(5,y,{terrain:'water'});
    put(5,2,{terrain:'bridge',object:'fragile',hp:2});put(5,6,{terrain:'stone'});
    put(6,2,{object:'trap'});put(7,4,{object:'cover',hp:2});put(8,3,{object:'brazier'});
    for(let y=0;y<height;y++) if(y!==2&&y!==6) put(10,y,{terrain:'water'});
    put(10,2,{terrain:'bridge',object:'objective'});put(10,6,{terrain:'bridge',object:'objective'});
  } else if(id==='summit') {
    for(let x=7;x<=10;x++) for(let y=1;y<=7;y++) put(x,y,{h:2,terrain:'stone'});
    for(let y=2;y<=7;y++) put(6,y,{h:1,terrain:'stairs'});
    put(7,4,{terrain:'stairs'});put(7,7,{terrain:'stairs'});put(8,5,{object:'cover',hp:2});
    for(let x=4;x<=8;x++) put(x,8,{terrain:'water'});
    put(6,8,{terrain:'bridge',h:1,object:'fragile',hp:2});put(5,5,{object:'brazier'});put(4,6,{object:'trap'});
  }
  return { id, name, width, height, tiles };
}
