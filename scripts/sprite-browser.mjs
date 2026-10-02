import {chromium} from '@playwright/test';
import {readFile,mkdir,writeFile} from 'node:fs/promises';
import {resolve,join} from 'node:path';
import {homedir} from 'node:os';
import {registerHooks} from 'node:module';
registerHooks({resolve(s,c,next){if(s.startsWith('.')&&!/\.[cm]?[jt]s$/.test(s)){try{return next(s+'.ts',c)}catch{}try{return next(s+'/index.ts',c)}catch{}}return next(s,c)}});
const {createGame,previewAction,applyAction,getUnitRules}=await import('../src/engine/index.ts');
let browser;try{browser=await chromium.launch({headless:true})}catch{browser=await chromium.launch({headless:true,executablePath:join(homedir(),'AppData/Local/ms-playwright/chromium_headless_shell-1234/chrome-headless-shell-win64/chrome-headless-shell.exe')})}
const page=await browser.newPage({viewport:{width:1440,height:900}}),errors=[];
page.on('pageerror',e=>errors.push(e.message));
await page.route('**/*',async route=>{const name=new URL(route.request().url()).pathname.slice(1)||'index.html';await route.fulfill({body:await readFile(resolve('dist',name)),contentType:name.endsWith('.js')?'text/javascript':name.endsWith('.css')?'text/css':name.endsWith('.png')?'image/png':'text/html'})});
await page.addInitScript(()=>{localStorage.setItem('ab-volume','0');localStorage.setItem('ab-speed','0.65');localStorage.setItem('ab-reduce-motion','0')});
await mkdir('workbench/sprite-frames',{recursive:true});
const classes=['sword','archer','spear','shield','scout','engineer'],results=[];
async function load(game){await page.evaluate(s=>localStorage.setItem('ab-save',JSON.stringify(s)),game);await page.reload();await page.locator('#continue').click();await page.waitForTimeout(250);await page.locator('[data-unit="blue-1"]').click()}
async function cell(x,y){const box=await page.locator('#board').boundingBox(),s=Math.min(62,Math.max(39,box.width/(8*1.7)))*1.6;return{x:box.x+box.width/2+(x-y)*s*.5,y:box.y+box.height*.48+5+(x+y-8)*s*.24,s}}
async function clickCell(x,y,unit=false){const p=await cell(x,y);for(const [dx,dy]of(unit?[[0,-.5],[0,-.6],[0,0]]:[[0,0],[-.38,0],[.38,0]])){await page.mouse.move(p.x+dx*p.s,p.y+dy*p.s);if(await page.locator('#help strong').first().textContent()===`${x+1}:${y+1}`){await page.mouse.click(p.x+dx*p.s,p.y+dy*p.s);return}}throw Error('Cannot pick cell')}
try{
 await page.goto('http://game.test/');
 const alpha=await page.evaluate(async()=>{const im=new Image();im.src='/sprites/fighters-v2.png';await im.decode();const c=document.createElement('canvas');c.width=im.width;c.height=im.height;const g=c.getContext('2d');g.drawImage(im,0,0);const d=g.getImageData(0,0,c.width,c.height).data;return{width:im.width,height:im.height,corner:d[3],opaque:[...d].filter((v,i)=>i%4===3&&v>200).length}});
 if(alpha.width!==1024||alpha.height!==1536||alpha.corner!==0||alpha.opaque<100000)throw Error('Invalid sprite atlas alpha');
 for(const archetype of classes){
  const game=createGame({map:'tutorial',mode:'pvp',objective:'elimination'});
  game.map.tiles.forEach(t=>{t.h=0;t.terrain='grass';delete t.object});game.units.forEach(u=>u.alive=false);
  const u=game.units.find(u=>u.id==='blue-1'),enemy=game.units.find(u=>u.id==='red-1'),backup=game.units.find(u=>u.id==='red-2');
  Object.assign(u,{archetype,variant:'',modifier:undefined,artifact:undefined,alive:true,x:archetype==='archer'?1:3,y:3,commander:false});u.hp=u.maxHp=getUnitRules(u).hp;
  Object.assign(enemy,{alive:true,x:4,y:3,hp:7,maxHp:7,archetype:'sword',variant:'',commander:false});Object.assign(backup,{alive:true,x:7,y:7});
  await load(game);await page.screenshot({path:`workbench/sprite-frames/${archetype}-idle.png`});
  const attack={type:'attack',unitId:u.id,x:4,y:3};if(!previewAction(game,attack).valid)throw Error('Invalid staged attack');
  await clickCell(4,3,true);await page.waitForTimeout(85);await page.screenshot({path:`workbench/sprite-frames/${archetype}-attack.png`});
  const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('ab-save')));if(saved.units.find(v=>v.id===enemy.id).hp!==applyAction(game,attack).units.find(v=>v.id===enemy.id).hp)throw Error('Attack mismatch');
  await load(game);await clickCell(u.x,5);await page.waitForTimeout(85);await page.screenshot({path:`workbench/sprite-frames/${archetype}-walk-a.png`});await page.waitForTimeout(210);await page.screenshot({path:`workbench/sprite-frames/${archetype}-walk-b.png`});await page.waitForTimeout(450);
  const moved=await page.evaluate(()=>JSON.parse(localStorage.getItem('ab-save')));if(moved.units.find(v=>v.id===u.id).y!==5)throw Error('Move mismatch');
  results.push({archetype,attack:true,move:true});
 }
 // A lethal hit must leave a visible fading figure and exact source label.
 const death=createGame({map:'tutorial',mode:'pvp',objective:'elimination'});death.map.tiles.forEach(t=>{t.h=0;t.terrain='grass';delete t.object});death.units.forEach(u=>u.alive=false);
 Object.assign(death.units[0],{alive:true,archetype:'sword',variant:'',x:3,y:3});Object.assign(death.units.find(u=>u.id==='red-1'),{alive:true,x:4,y:3,hp:1});Object.assign(death.units.find(u=>u.id==='red-2'),{alive:true,x:7,y:7});
 await load(death);await clickCell(4,3,true);await page.waitForTimeout(110);await page.screenshot({path:'workbench/sprite-frames/lethal-hit.png'});
 const report={alpha,results,errors};await writeFile('workbench/sprite-browser-results.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report));if(errors.length)throw Error('Browser errors');
}finally{await browser.close()}
