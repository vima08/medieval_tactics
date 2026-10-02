import {chromium} from '@playwright/test';
import {readFile,mkdir,writeFile} from 'node:fs/promises';
import {resolve,join} from 'node:path';
import {homedir} from 'node:os';
import {registerHooks} from 'node:module';
import assert from 'node:assert/strict';

registerHooks({resolve(s,c,next){if(s.startsWith('.')&&!/\.[cm]?[jt]s$/.test(s)){try{return next(s+'.ts',c)}catch{}try{return next(s+'/index.ts',c)}catch{}}return next(s,c)}});
const {createGame,previewAction,applyAction,getUnitRules,damageEvents}=await import('../src/engine/index.ts');
const output='workbench/environment-shots',results={assets:[],scenes:[],actions:[],errors:[],requestFailures:[]};
await mkdir(output,{recursive:true});
let browser;
try{browser=await chromium.launch({headless:true})}catch{browser=await chromium.launch({headless:true,executablePath:join(homedir(),'AppData/Local/ms-playwright/chromium_headless_shell-1234/chrome-headless-shell-win64/chrome-headless-shell.exe')})}
const page=await browser.newPage({viewport:{width:1440,height:900}});
page.on('pageerror',e=>results.errors.push(e.message));
page.on('requestfailed',r=>results.requestFailures.push({url:r.url(),error:r.failure()?.errorText}));
const mime=name=>name.endsWith('.js')?'text/javascript':name.endsWith('.css')?'text/css':name.endsWith('.png')?'image/png':name.endsWith('.svg')?'image/svg+xml':name.endsWith('.woff2')?'font/woff2':'text/html';
await page.route('**/*',async route=>{
  const url=new URL(route.request().url());
  if(url.hostname!=='game.test'){await route.abort();return}
  const name=decodeURIComponent(url.pathname.slice(1))||'index.html';
  try{await route.fulfill({body:await readFile(resolve('dist',name)),contentType:mime(name)})}
  catch(e){results.requestFailures.push({url:url.href,error:e.message});await route.fulfill({status:404,body:'Missing built asset'})}
});
await page.addInitScript(()=>{localStorage.setItem('ab-volume','0');localStorage.setItem('ab-speed','1.8');localStorage.setItem('ab-reduce-motion','1')});
const saved=()=>page.evaluate(()=>JSON.parse(localStorage.getItem('ab-save')));
async function load(game){
  await page.evaluate(s=>localStorage.setItem('ab-save',JSON.stringify(s)),game);
  await page.reload();await page.locator('#continue').click();await page.locator('#board').waitFor();await page.waitForTimeout(300);
}
async function shot(name){await page.screenshot({path:`${output}/${name}.png`})}
async function hover(game,x,y){
  const box=await page.locator('#board').boundingBox(),w=game.map.width,h=game.map.height,zoom=w>=16?1.14:w<=9?1.6:1.35;
  const s=Math.min(62,Math.max(39,box.width/(w*1.7)))*zoom,t=game.map.tiles[y*w+x];
  const px=box.x+box.width/2+(x-y-(w-h)/2)*s*.5,py=box.y+box.height*.48+(w>=16?20:5)+(x+y-(w+h)/2)*s*.24-t.h*s*.21;
  const occupied=game.units.some(u=>u.alive&&u.x===x&&u.y===y);
  const offsets=occupied?[[0,-.5],[0,-.6],[0,0]]:[[0,0],[-.38,0],[.38,0],[0,-.18],[0,.18],[0,-.4]];
  for(const [dx,dy] of offsets){
    const target={x:px+dx*s,y:py+dy*s};await page.mouse.move(target.x,target.y);
    if(await page.locator('#help strong').first().textContent()===`${x+1}:${y+1}`)return target;
  }
  throw Error(`Cannot hover cell ${x},${y}`);
}
async function issue(game,command,name){
  const preview=previewAction(game,command);assert.equal(preview.valid,true,JSON.stringify(preview));
  await page.locator(`[data-unit="${command.unitId}"]`).click();
  if(command.type==='ability')await page.locator('[data-action="ability"]').click();
  const pos=await hover(game,command.x,command.y);
  const help=await page.locator('#help').innerText(),forecast=await page.locator('#preview-panel').innerText();
  await shot(`${name}-preview`);
  await page.mouse.click(pos.x,pos.y);await page.waitForTimeout(100);
  const actual=await saved(),expected=JSON.parse(JSON.stringify(applyAction(game,command)));
  for(const field of ['map','units','history','log','team','winner'])assert.deepEqual(actual[field],expected[field],`${name}: saved ${field} differs from applyAction`);
  await shot(`${name}-after`);
  const events=damageEvents(game,actual,command);
  results.actions.push({name,command,preview,help,forecast,savedMatchesEngine:true,damageEvents:events,log:actual.log.slice(-1)});
  return actual;
}
function stage(){
  const game=createGame({map:'tutorial',mode:'pvp',objective:'elimination'});
  game.map.tiles.forEach(t=>{t.h=0;t.terrain='grass';delete t.object;delete t.hp});
  game.units.forEach(u=>u.alive=false);
  const engineer=game.units.find(u=>u.id==='blue-1'),scout=game.units.find(u=>u.id==='blue-2'),enemy=game.units.find(u=>u.id==='red-1');
  Object.assign(engineer,{alive:true,archetype:'engineer',variant:'',modifier:undefined,artifact:undefined,x:3,y:3,commander:false,moved:false,acted:false});engineer.hp=engineer.maxHp=getUnitRules(engineer).hp;
  Object.assign(scout,{alive:true,archetype:'scout',variant:'',modifier:undefined,artifact:undefined,x:4,y:4,commander:false,moved:false,acted:false});scout.hp=scout.maxHp=getUnitRules(scout).hp;
  Object.assign(enemy,{alive:true,x:7,y:7,commander:false});
  return {game,engineer,scout};
}
try{
  await page.goto('http://game.test/');
  for(const name of ['brazier','torch','rock','trap','bridge','banner','rubble','stairs']){
    const asset=await page.evaluate(async name=>{
      const image=new Image();image.src=`/sprites/environment/${name}-v1.png`;await image.decode();
      const canvas=document.createElement('canvas');canvas.width=image.naturalWidth;canvas.height=image.naturalHeight;
      const ctx=canvas.getContext('2d');ctx.drawImage(image,0,0);const data=ctx.getImageData(0,0,canvas.width,canvas.height).data;
      let content=0;for(let i=3;i<data.length;i+=4)if(data[i]>0)content++;
      const alpha=(x,y)=>data[(y*canvas.width+x)*4+3];
      return{name,width:canvas.width,height:canvas.height,corners:[alpha(0,0),alpha(canvas.width-1,0),alpha(0,canvas.height-1),alpha(canvas.width-1,canvas.height-1)],content};
    },name);
    assert(asset.width>0&&asset.height>0&&asset.content>0,`Empty ${name}`);assert(asset.corners.every(a=>a===0),`Opaque corner in ${name}`);results.assets.push(asset);
  }
  for(const map of ['highland','kiln','gate','marsh']){
    const game=createGame(map==='highland'?{map,mode:'pvp',objective:'control'}:{map,mode:'ai',mission:map});
    await load(game);await shot(map);
    if(map==='highland'){await page.keyboard.down('h');await page.waitForTimeout(80);await shot('highland-all-heights');await page.keyboard.up('h')}
    results.scenes.push({map,width:game.map.width,height:game.map.height,objects:game.map.tiles.filter(t=>t.object).map(t=>({x:t.x,y:t.y,object:t.object}))});
  }
  // This public saved game creates a clean field gallery, while using the ordinary renderer.
  const gallery=stage().game;
  Object.assign(gallery.objective,{kind:'control',points:[{x:4,y:4}],target:2});
  const objects=[{name:'brazier',x:2,y:2,object:'brazier'},{name:'torch',x:4,y:5,object:'brazier'},{name:'rock',x:4,y:2,object:'cover',hp:2},{name:'trap',x:6,y:2,object:'trap'},{name:'bridge',x:2,y:4,object:'fragile',terrain:'bridge',hp:2},{name:'banner',x:4,y:4,object:'objective'},{name:'rubble',x:6,y:4,terrain:'rubble'},{name:'stairs',x:2,y:6,terrain:'stairs',h:1}];
  gallery.units.filter(u=>u.alive&&u.team==='blue').forEach((u,i)=>{u.x=i;u.y=7});
  for(const item of objects)Object.assign(gallery.map.tiles[item.y*8+item.x],Object.fromEntries(Object.entries(item).filter(([key])=>key!=='name')));
  await load(gallery);await shot('environment-gallery');
  for(const item of objects){await hover(gallery,item.x,item.y);await shot(`object-${item.name}`)}
  let staged=stage();Object.assign(staged.game.map.tiles[3*8+4],{terrain:'bridge',object:'fragile',hp:2,h:0});
  await load(staged.game);let after=await issue(staged.game,{type:'ability',unitId:staged.engineer.id,x:4,y:3},'bridge-demolition');
  assert.equal(after.map.tiles[3*8+4].terrain,'water');assert.equal(after.map.tiles[3*8+4].object,undefined);
  staged=stage();Object.assign(staged.game.map.tiles[3*8+4],{object:'cover',hp:1});
  await load(staged.game);after=await issue(staged.game,{type:'attack',unitId:staged.engineer.id,x:4,y:3},'cover-destruction');
  assert.equal(after.map.tiles[3*8+4].terrain,'rubble');assert.equal(after.map.tiles[3*8+4].object,undefined);
  staged=stage();await load(staged.game);after=await issue(staged.game,{type:'ability',unitId:staged.engineer.id,x:4,y:3},'trap-placement');assert.equal(after.map.tiles[3*8+4].object,'trap');
  after=await issue(after,{type:'move',unitId:staged.scout.id,x:4,y:3},'trap-trigger');
  assert.equal(after.units.find(u=>u.id===staged.scout.id).hp,staged.scout.hp-2);assert.equal(after.map.tiles[3*8+4].object,undefined);
  const trap=results.actions.at(-1);assert.match(trap.help,/ловушка/i);assert.match(trap.forecast,/Опасность 2/);assert.equal(trap.damageEvents[0].source,'Ловушка');assert.match(trap.log[0].message,/ловушка/i);
  staged=stage();Object.assign(staged.game.map.tiles[3*8+4],{object:'brazier'});await load(staged.game);
  after=await issue(staged.game,{type:'move',unitId:staged.scout.id,x:4,y:3},'brazier-damage');
  assert.equal(after.units.find(u=>u.id===staged.scout.id).hp,staged.scout.hp-1);assert.equal(results.actions.at(-1).damageEvents[0].source,'Костёр');
  assert.equal(results.errors.length,0,'Browser page errors');
  assert.equal(results.requestFailures.filter(r=>r.url.startsWith('http://game.test/')).length,0,'Built asset request failed');
  results.passed=true;
}catch(error){results.passed=false;results.failure=error.stack;process.exitCode=1}
finally{await writeFile('workbench/environment-browser-results.json',JSON.stringify(results,null,2));await browser.close()}
console.log(JSON.stringify(results));
