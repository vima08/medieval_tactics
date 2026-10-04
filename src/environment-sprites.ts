import type { Tile } from './engine/types';

export type PropSprite='brazier'|'torch'|'rock'|'trap'|'bridge'|'banner'|'rubble'|'stairs';
type Sprite={image:HTMLImageElement;x:number;y:number;width:number;height:number};
const sprites=new Map<PropSprite,Sprite>();
const specs:Record<PropSprite,{width:number;height:number;bottom:number}>={
  brazier:{width:.46,height:.54,bottom:.12},torch:{width:.32,height:.67,bottom:.10},
  rock:{width:.77,height:.52,bottom:.15},trap:{width:.58,height:.34,bottom:.16},
  bridge:{width:.98,height:.56,bottom:.27},banner:{width:.49,height:.86,bottom:.13},
  rubble:{width:.79,height:.29,bottom:.15},stairs:{width:.94,height:.52,bottom:.24},
};
for(const key of Object.keys(specs) as PropSprite[]){
  const image=new Image();image.onload=()=>{
    const canvas=document.createElement('canvas');canvas.width=image.width;canvas.height=image.height;
    const ctx=canvas.getContext('2d')!;ctx.drawImage(image,0,0);
    const data=ctx.getImageData(0,0,canvas.width,canvas.height).data;
    let left=image.width,top=image.height,right=0,bottom=0;
    for(let y=0;y<image.height;y++)for(let x=0;x<image.width;x++)if(data[(y*image.width+x)*4+3]>32){
      left=Math.min(left,x);top=Math.min(top,y);right=Math.max(right,x);bottom=Math.max(bottom,y);
    }
    if(right<=left||bottom<=top)return;
    sprites.set(key,{image,x:left,y:top,width:right-left+1,height:bottom-top+1});
  };
  image.src=`${import.meta.env.BASE_URL}sprites/environment/${key}-v1.png`;
}

/** Return false while loading so the existing drawing remains a usable fallback. */
export function drawPropSprite(ctx:CanvasRenderingContext2D,key:PropSprite,p:{x:number;y:number},size:number,opacity=1){
  const sprite=sprites.get(key);if(!sprite)return false;
  const spec=specs[key],scale=Math.min(size*spec.width/sprite.width,size*spec.height/sprite.height);
  const width=sprite.width*scale,height=sprite.height*scale;
  ctx.save();ctx.globalAlpha=opacity;ctx.imageSmoothingEnabled=true;
  ctx.drawImage(sprite.image,sprite.x,sprite.y,sprite.width,sprite.height,p.x-width/2,p.y+size*spec.bottom-height,width,height);
  ctx.restore();return true;
}

export function terrainSprite(tile:Tile):PropSprite|undefined{
  if(tile.terrain==='bridge')return 'bridge';
  // Stairs are drawn as terrain connecting two real heights, never as a prop on top.
  if(tile.terrain==='rubble')return 'rubble';
  return undefined;
}
