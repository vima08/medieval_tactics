type Point={x:number;y:number};
type Finger=Point&{start:Point;dragged:boolean};
export type TouchCallbacks={
  activate:()=>void;
  tap:(point:Point)=>void;
  gesture:()=>void;
  pan:(dx:number,dy:number)=>void;
  zoom:(ratio:number,center:Point)=>void;
};

/** Pointer events keep native page scrolling outside the board. */
export function bindTouchControls(canvas:HTMLCanvasElement,callbacks:TouchCallbacks){
  const fingers=new Map<number,Finger>();
  const position=(e:PointerEvent):Point=>{const r=canvas.getBoundingClientRect();return{x:e.clientX-r.left,y:e.clientY-r.top}};
  const pair=()=>{const [a,b]=[...fingers.values()];return a&&b?{center:{x:(a.x+b.x)/2,y:(a.y+b.y)/2},distance:Math.hypot(a.x-b.x,a.y-b.y)}:null};
  canvas.addEventListener('pointerdown',e=>{
    if(e.pointerType!=='touch'&&e.pointerType!=='pen')return;
    e.preventDefault();callbacks.activate();
    const p=position(e);fingers.set(e.pointerId,{...p,start:p,dragged:false});canvas.setPointerCapture(e.pointerId);
    if(fingers.size>1){for(const f of fingers.values())f.dragged=true;callbacks.gesture()}
  });
  canvas.addEventListener('pointermove',e=>{
    const f=fingers.get(e.pointerId);if(!f)return;e.preventDefault();
    const before=pair(),p=position(e),old={x:f.x,y:f.y};f.x=p.x;f.y=p.y;
    if(before){const after=pair()!;callbacks.pan(after.center.x-before.center.x,after.center.y-before.center.y);if(before.distance>8&&after.distance>8)callbacks.zoom(after.distance/before.distance,after.center);return}
    if(!f.dragged&&Math.hypot(p.x-f.start.x,p.y-f.start.y)>9){f.dragged=true;callbacks.gesture();callbacks.pan(p.x-f.start.x,p.y-f.start.y)}
    else if(f.dragged)callbacks.pan(p.x-old.x,p.y-old.y);
  });
  const finish=(e:PointerEvent,cancelled=false)=>{
    const f=fingers.get(e.pointerId);if(!f)return;e.preventDefault();fingers.delete(e.pointerId);
    if(canvas.hasPointerCapture(e.pointerId))canvas.releasePointerCapture(e.pointerId);
    if(!cancelled&&!f.dragged&&Math.hypot(position(e).x-f.start.x,position(e).y-f.start.y)<=9)callbacks.tap(position(e));
  };
  canvas.addEventListener('pointerup',e=>finish(e));
  canvas.addEventListener('pointercancel',e=>{callbacks.gesture();finish(e,true)});
  canvas.addEventListener('lostpointercapture',e=>{if(fingers.has(e.pointerId)){fingers.delete(e.pointerId);callbacks.gesture()}});
}
