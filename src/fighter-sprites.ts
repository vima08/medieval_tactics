import type { Archetype, GameState, Unit } from './engine/types';

const rows:Record<Archetype,number>={sword:0,archer:1,spear:2,shield:3,scout:4,engineer:5};
type Effect={at:number;kind:'attack'|'hit'|'death';left:boolean};
const effects=new Map<string,Effect[]>();
const facing=new Map<string,boolean>();
const sheet=new Image();
type SpriteRect={x:number;y:number;width:number;height:number;anchor:number;image:HTMLCanvasElement};
const frames:SpriteRect[][]=[];
let ready=false;
sheet.onload=()=>{
  // Generated figures deviate from the requested grid. Isolate complete
  // connected silhouettes so neighboring heads/weapons never enter a frame.
  const c=document.createElement('canvas');c.width=sheet.width;c.height=sheet.height;
  const g=c.getContext('2d')!;g.drawImage(sheet,0,0);
  const pixels=g.getImageData(0,0,c.width,c.height).data;
  const visited=new Uint32Array(c.width*c.height),queue=new Int32Array(visited.length);
  const components:{x:number;y:number;width:number;height:number;area:number;label:number}[]=[];
  let label=0;
  for(let start=0;start<visited.length;start++){
    if(visited[start]||pixels[start*4+3]<16)continue;
    label++;let head=0,tail=1,minX=c.width,minY=c.height,maxX=0,maxY=0;queue[0]=start;visited[start]=label;
    while(head<tail){const index=queue[head++],x=index%c.width,y=Math.floor(index/c.width);
      minX=Math.min(minX,x);maxX=Math.max(maxX,x);minY=Math.min(minY,y);maxY=Math.max(maxY,y);
      for(const next of [x>0?index-1:-1,x<c.width-1?index+1:-1,y>0?index-c.width:-1,y<c.height-1?index+c.width:-1]){
        if(next>=0&&!visited[next]&&pixels[next*4+3]>=16){visited[next]=label;queue[tail++]=next}
      }
    }
    if(tail>2500)components.push({x:minX,y:minY,width:maxX-minX+1,height:maxY-minY+1,area:tail,label});
  }
  const centers=[128,378,618,870,1118,1385];
  for(let row=0;row<6;row++)frames[row]=[];
  for(const b of components.sort((a,b)=>b.area-a.area)){
    const cy=b.y+b.height/2,row=centers.reduce((best,value,i)=>Math.abs(cy-value)<Math.abs(cy-centers[best])?i:best,0);
    const col=Math.min(3,Math.floor((b.x+b.width/2)/256));if(frames[row][col])continue;
    const x=Math.max(0,b.x-1),y=Math.max(0,b.y-1);
    const width=Math.min(c.width-x,b.width+2),height=Math.min(c.height-y,b.height+2);
    const image=document.createElement('canvas');image.width=width;image.height=height;
    const context=image.getContext('2d')!,out=context.createImageData(width,height);
    for(let yy=0;yy<height;yy++)for(let xx=0;xx<width;xx++){
      const index=(y+yy)*c.width+x+xx;
      const edge=pixels[index*4+3]<16&&[index-1,index+1,index-c.width,index+c.width].some(i=>visited[i]===b.label);
      if(visited[index]===b.label||edge)out.data.set(pixels.subarray(index*4,index*4+4),(yy*width+xx)*4);
    }
    context.putImageData(out,0,0);
    frames[row][col]={x,y,width,height,anchor:col*256+128,image};
  }
  ready=frames.every(row=>[0,1,2,3].every(col=>!!row[col]));
};
sheet.src=`${import.meta.env.BASE_URL}sprites/fighters-v2.png`;
export const spriteAssetsReady=()=>ready;

export function resetSpriteAnimations(){effects.clear();facing.clear()}
export function recordSpriteCommand(before:GameState,after:GameState){
  const now=performance.now(),command=after.history.at(-1);
  const add=(id:string,e:Effect)=>effects.set(id,[...(effects.get(id)??[]).filter(v=>now-v.at<700),e]);
  if(command&&'unitId'in command){const u=before.units.find(v=>v.id===command.unitId);
    if(u&&'x'in command){const dx=command.x-u.x,dy=command.y-u.y;
      if(dx!==dy)facing.set(u.id,dx-dy<0);
    }
    if(u&&(command.type==='attack'||command.type==='ability'&&u.archetype!=='shield'&&u.archetype!=='scout'))add(u.id,{at:now,kind:'attack',left:facing.get(u.id)??u.team==='red'});
  }
  for(const old of before.units){const u=after.units.find(v=>v.id===old.id);if(u&&u.hp<old.hp)
    add(u.id,{at:now,kind:u.alive?'hit':'death',left:facing.get(u.id)??u.team==='red'});
  }
}
export function spriteDeathVisible(id:string){return(effects.get(id)??[]).some(e=>e.kind==='death'&&performance.now()-e.at<480)}
export function drawFighterSprite(ctx:CanvasRenderingContext2D,u:Unit,p:{x:number;y:number},size:number,moving:boolean,speed:number,reduced:boolean){
  if(!ready)return false;
  const now=performance.now(),events=(effects.get(u.id)??[]).filter(e=>now-e.at<700);
  if(events.length)effects.set(u.id,events);else effects.delete(u.id);
  const attack=[...events].reverse().find(e=>e.kind==='attack'&&now-e.at<420/speed);
  const hit=[...events].reverse().find(e=>e.kind==='hit'&&now-e.at<260/speed);
  const death=[...events].reverse().find(e=>e.kind==='death');
  const frame=reduced?0:attack?3:moving?1+Math.floor(now*speed/135)%2:0;
  const row=rows[u.archetype],scale=size*1.1/256;
  const left=facing.get(u.id)??u.team==='red';
  ctx.save();ctx.translate(p.x,p.y+size*.11);
  if(left)ctx.scale(-1,1);
  if(!reduced&&attack){const t=(now-attack.at)*speed/420;ctx.translate(Math.sin(t*Math.PI)*size*.055,0)}
  if(death){const t=Math.min(1,(now-death.at)/480);ctx.globalAlpha=1-t;if(!reduced)ctx.rotate(t*.55)}
  else if(u.acted)ctx.globalAlpha=.72;
  if(hit&&!reduced)ctx.filter='brightness(1.9)';
  ctx.imageSmoothingEnabled=true;
  const rect=frames[row][frame];
  ctx.drawImage(rect.image,(rect.x-rect.anchor)*scale,-rect.height*scale,rect.width*scale,rect.height*scale);
  ctx.restore();return true;
}
