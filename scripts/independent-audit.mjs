import {chromium} from '@playwright/test';
import {readFile,mkdir,writeFile} from 'node:fs/promises';
import {resolve,join} from 'node:path';
import {homedir} from 'node:os';
import {registerHooks} from 'node:module';
registerHooks({resolve(s,c,next){if(s.startsWith('.')&&!/\.[cm]?[jt]s$/.test(s)){try{return next(s+'.ts',c)}catch{}try{return next(s+'/index.ts',c)}catch{}}return next(s,c)}});
const {legalMoves,createGame,previewAction}=await import('../src/engine/index.ts');
const {chooseAiCommand}=await import('../src/ai/index.ts');
let browser;try{browser=await chromium.launch({headless:true})}catch{browser=await chromium.launch({headless:true,executablePath:join(homedir(),'AppData/Local/ms-playwright/chromium_headless_shell-1234/chrome-headless-shell-win64/chrome-headless-shell.exe')})}
const out='workbench/audit-shots';await mkdir(out,{recursive:true});
const page=await browser.newPage({viewport:{width:1440,height:900}}),record={errors:[],checks:[]};
page.on('pageerror',e=>record.errors.push(e.message));page.on('console',m=>{if(m.type()==='error'||m.type()==='warning')record.errors.push(m.text())});
await page.route('**/*',async r=>{const name=new URL(r.request().url()).pathname.slice(1)||'index.html';try{await r.fulfill({body:await readFile(resolve('dist',name)),contentType:name.endsWith('.js')?'text/javascript':name.endsWith('.css')?'text/css':name.endsWith('.png')?'image/png':name.endsWith('.svg')?'image/svg+xml':'text/html'})}catch{record.errors.push('missing '+name);await r.fulfill({status:404,body:'missing'})}});
await page.addInitScript(()=>{localStorage.setItem('ab-volume','0')});
const saved=()=>page.evaluate(()=>JSON.parse(localStorage.getItem('ab-save')));
async function shot(n){await page.screenshot({path:`${out}/${n}.png`});record.checks.push({name:n,text:await page.locator('body').innerText(),state:await saved()})}
async function hover(g,x,y){const b=await page.locator('#board').boundingBox(),w=g.map.width,h=g.map.height,z=w>=16?1.14:w<=9?1.6:1.35,s=Math.min(62,Math.max(39,b.width/(w*1.7)))*z,t=g.map.tiles[y*w+x];const px=b.x+b.width/2+(x-y-(w-h)/2)*s*.5,py=b.y+b.height*.48+(w>=16?20:5)+(x+y-(w+h)/2)*s*.24-t.h*s*.21;for(const [dx,dy] of [[0,-.5],[0,-.6],[0,0],[-.38,0],[.38,0],[0,-.18],[0,.18]]){const p={x:px+dx*s,y:py+dy*s};await page.mouse.move(p.x,p.y);if(await page.evaluate(()=>document.querySelector('#help strong')?.textContent)===`${x+1}:${y+1}`)return p}throw Error(`Cannot hover ${x}:${y}`)}
async function load(g){await page.evaluate(s=>localStorage.setItem('ab-save',JSON.stringify(s)),g);await page.reload();await page.locator('#continue').click();await page.waitForTimeout(400)}
try{
if(process.argv.includes('--pause')){
await page.goto('http://game.test/');await load(createGame({map:'watch',mode:'ai',mission:'watch'}));await page.keyboard.press('Enter');await page.keyboard.press('Escape');await page.waitForTimeout(800);await shot('33-pause-ai-before-start');await page.keyboard.press('Escape');await page.waitForTimeout(1600);await shot('34-resume-stuck-red');record.done=true;
}else if(process.argv.includes('--lifecycle')){
await page.goto('http://game.test/');await load(createGame({map:'highland',mode:'ai',objective:'control'}));await page.keyboard.press('Enter');await page.waitForTimeout(300);await page.keyboard.press('Escape');await shot('35-active-ai-pause');await page.waitForTimeout(1600);await shot('36-ai-pause-mutates');if(await page.locator('[data-modal="menu"]').count()){await page.locator('[data-modal="menu"]').click();await shot('37-ai-menu');await page.waitForTimeout(3500);await shot('38-ai-menu-after-delay')}record.done=true;
}else{
await page.goto('http://game.test/');await page.waitForTimeout(450);await shot('01-menu');
await page.locator('#campaign').click();await shot('02-campaign');await page.locator('#campaign-start').click();await page.waitForTimeout(450);await shot('03-ford-start');
let g=await saved(),u=g.units.find(v=>v.team==='blue');await page.locator(`[data-unit="${u.id}"]`).click();const m=legalMoves(g,u.id).find(v=>v.x!==u.x||v.y!==u.y);const p=await hover(g,m.x,m.y);await shot('04-first-move-preview');await page.mouse.click(p.x,p.y);await page.waitForTimeout(150);await shot('05-first-move-150ms');await page.waitForTimeout(1100);await shot('06-first-move-settled');
g=await saved();const inaccessible=g.map.tiles.find(t=>!g.units.some(v=>v.alive&&v.x===t.x&&v.y===t.y)&&t.terrain==='grass');await hover(g,inaccessible.x,inaccessible.y);await shot('07-second-move-rejection');
await page.keyboard.press('Tab');await shot('08-tab-selection');await page.keyboard.press('Shift+Tab');await shot('09-shift-tab-selection');await page.keyboard.press('2');await shot('10-key-ability');
await page.reload();await page.locator('#continue').click();await page.waitForTimeout(300);await shot('11-restored-save');await page.locator(`[data-unit="${u.id}"]`).click();await page.locator('#undo').click();await page.waitForTimeout(600);await shot('12-undo-after-restore');
// Inspect chapter 2 independently through its ordinary saved-match flow.
await load(createGame({map:'watch',mode:'ai',mission:'watch'}));await shot('13-ridge-start');
g=await saved();for(const unit of g.units.filter(v=>v.team==='blue')){await page.locator(`[data-unit="${unit.id}"]`).click();const enemy=g.units.find(v=>v.team==='red'&&v.alive);await hover(g,enemy.x,enemy.y);await shot(`14-ridge-${unit.archetype}-attack`)}
await page.locator('#end-turn').click();await page.waitForFunction(()=>{const s=JSON.parse(localStorage.getItem('ab-save'));return s.team==='blue'||s.winner},{timeout:30000});await shot('15-ridge-ai-round');
// A controlled public-save fixture verifies ability-first then movement with no casualty.
g=createGame({map:'tutorial',mode:'pvp',objective:'elimination'});g.map.tiles.forEach(t=>{t.h=0;t.terrain='grass';delete t.object;delete t.hp});g.units.forEach(v=>v.alive=false);u=g.units.find(v=>v.team==='blue'&&v.archetype==='spear');Object.assign(u,{alive:true,x:3,y:3,acted:false,moved:false});const enemy=g.units.find(v=>v.team==='red');Object.assign(enemy,{alive:true,x:7,y:7});await load(g);await page.locator(`[data-unit="${u.id}"]`).click();await shot('16-controlled-before');await page.keyboard.press('2');const self=await hover(g,u.x,u.y);await page.mouse.click(self.x,self.y);await page.waitForTimeout(700);await shot('17-controlled-self-ability');
// Narrow desktop scene, same running field.
await page.setViewportSize({width:1024,height:768});await page.waitForTimeout(200);await shot('18-narrow-battle');
await page.setViewportSize({width:1440,height:900});await page.reload();await page.locator('#skirmish').click();await shot('19-roster');await page.locator('#start').click();await page.waitForTimeout(450);await shot('20-skirmish-field');
// Interrupt the opponent through the visible public turn control.
await page.locator('#end-turn').click();await shot('21-ai-turn-before-enter');await page.keyboard.press('Enter');await page.waitForTimeout(1200);await shot('22-ai-turn-skipped');
// Test advertised movement after a basic first attack, and effective damage stats.
g=createGame({map:'tutorial',mode:'pvp',objective:'elimination'});g.map.tiles.forEach(t=>{t.h=0;t.terrain='grass';delete t.object;delete t.hp});g.units.forEach(v=>v.alive=false);u=g.units.find(v=>v.team==='blue'&&v.archetype==='sword');Object.assign(u,{alive:true,x:3,y:3,acted:false,moved:false,commander:false});const e2=g.units.find(v=>v.team==='red'&&v.archetype==='sword');Object.assign(e2,{alive:true,x:4,y:3,commander:false});await load(g);await page.locator(`[data-unit="${u.id}"]`).click();const attack=await hover(g,e2.x,e2.y);await shot('23-duelist-preview');await page.mouse.click(attack.x,attack.y);await page.waitForTimeout(650);await shot('24-attack-settled');g=await saved();const move=legalMoves(g,u.id).find(v=>v.x!==u.x||v.y!==u.y);if(move){const pos=await hover(g,move.x,move.y);await shot('25-move-after-attack-preview');await page.mouse.click(pos.x,pos.y);await page.waitForTimeout(800);await shot('26-move-after-attack-settled')}
// Default large map on a smaller common desktop viewport.
await load(createGame({map:'highland',mode:'ai',objective:'control'}));await page.setViewportSize({width:1024,height:768});await page.waitForTimeout(200);await shot('27-highland-narrow');
await page.setViewportSize({width:1440,height:900});
await load(createGame({map:'watch',mode:'ai',mission:'watch'}));g=await saved();u=g.units.find(v=>v.archetype==='archer'&&v.team==='blue');await page.locator(`[data-unit="${u.id}"]`).click();await page.keyboard.press('2');const aimTarget=g.units.find(v=>v.team==='red');const aimPos=await hover(g,aimTarget.x,aimTarget.y);await shot('28-aim-preview');await page.mouse.click(aimPos.x,aimPos.y);await page.waitForTimeout(500);g=await saved();await hover(g,2,3);await shot('29-aim-movement-rejection');
await page.setViewportSize({width:640,height:800});await page.waitForTimeout(200);await shot('30-mobile-missing-goal-preview');await page.setViewportSize({width:1440,height:900});
// Complete first chapters through public UI actions without reading stored replays.
await load(createGame({map:'ford',mode:'ai',mission:'ford'}));
for(const mission of ['ford','watch']){
 for(let n=0;n<80;n++){
  g=await saved();if(g.winner)break;const cmd=chooseAiCommand(g,'normal');if(!cmd||cmd.type==='endTurn'){await page.locator('#end-turn').click();await page.waitForFunction(()=>{const s=JSON.parse(localStorage.getItem('ab-save'));return s.team==='blue'||!!s.winner},{timeout:30000});continue}
  await page.locator(`[data-unit="${cmd.unitId}"]`).click();if(cmd.type==='ability')await page.locator('[data-action="ability"]').click();const pos=await hover(g,cmd.x,cmd.y);await page.mouse.click(pos.x,pos.y);await page.waitForTimeout(200);const after=await saved();if(after.history.length===g.history.length)throw Error('Chapter UI did not execute '+JSON.stringify(cmd));
 }
 await page.locator('[data-modal="campaign"]').waitFor();await shot(`31-${mission}-completed`);record.checks.push({name:`${mission}-progress`,progress:await page.evaluate(()=>JSON.parse(localStorage.getItem('ab-campaign')))});
 if(mission==='ford'){await page.locator('[data-modal="campaign-next"]').click();await page.waitForTimeout(300);await shot('32-chapter-two-unlocked')}
}
record.done=true;
}
}catch(e){record.failure=e.stack;console.error(e.stack)}finally{await writeFile('workbench/audit-shots/results.json',JSON.stringify(record,null,2));await browser.close()}
console.log(JSON.stringify({done:record.done,failure:record.failure,errors:record.errors,shots:record.checks.map(c=>c.name)}));

