import {chromium} from '@playwright/test';
import {readFile,mkdir} from 'node:fs/promises';
import {resolve,join} from 'node:path';
import {homedir} from 'node:os';
import {registerHooks} from 'node:module';
registerHooks({resolve(specifier,context,nextResolve){if(specifier.startsWith('.')&&!/\.[cm]?[jt]s$/.test(specifier)){try{return nextResolve(`${specifier}.ts`,context)}catch{}try{return nextResolve(`${specifier}/index.ts`,context)}catch{}}return nextResolve(specifier,context)}});
const {createGame,applyAction,CAMPAIGN_MISSIONS}=await import('../src/engine/index.ts');
let browser;try{browser=await chromium.launch({headless:true})}catch{browser=await chromium.launch({headless:true,executablePath:join(homedir(),'AppData/Local/ms-playwright/chromium_headless_shell-1234/chrome-headless-shell-win64/chrome-headless-shell.exe')})}
const page=await browser.newPage({viewport:{width:1440,height:900}}),errors=[];
page.on('pageerror',error=>errors.push(error.message));
await page.route('**/*',async route=>{const path=new URL(route.request().url()).pathname,name=path==='/'?'index.html':path.slice(1);await route.fulfill({body:await readFile(resolve('dist',name)),contentType:name.endsWith('.js')?'text/javascript':name.endsWith('.css')?'text/css':'text/html'})});
await page.addInitScript(()=>{localStorage.setItem('ab-reduce-motion','1');localStorage.setItem('ab-volume','0');localStorage.setItem('ab-speed','1.8')});
await mkdir('workbench/shots',{recursive:true});
const saved=()=>page.evaluate(()=>JSON.parse(localStorage.getItem('ab-save')));
async function issue(command,game){
  if(command.type==='endTurn'){await page.locator('#end-turn').click();return}
  await page.locator(`[data-unit="${command.unitId}"]`).click();
  if(command.type==='undo'){await page.locator('#undo').click();return}
  if(command.type==='attack'||command.type==='ability')await page.locator(`[data-action="${command.type}"]`).click();
  const box=await page.locator('#board').boundingBox(),w=game.map.width,h=game.map.height,zoom=w>=16?1.14:w<=9?1.6:1.35;
  const size=Math.min(62,Math.max(39,box.width/(w*1.7)))*zoom,tile=game.map.tiles[command.y*w+command.x];
  const target=game.units.find(u=>u.alive&&u.x===command.x&&u.y===command.y);
  const x=box.x+box.width/2+(command.x-command.y-(w-h)/2)*size*.5,y=box.y+box.height*.48+(w>=16?20:5)+(command.x+command.y-(w+h)/2)*size*.24-tile.h*size*.21;
  const offsets=target?[[0,-.5],[0,-.6],[0,0],[-.22,-.5],[.22,-.5],[0,-.68],[-.25,-.65],[.25,-.65],[-.25,.12],[.25,.12]]:[[0,0],[-.38,0],[.38,0],[0,-.18],[0,.18],[-.47,0],[.47,0],[-.2,.14],[.2,.14],[0,.24]];
  for(const [dx,dy]of offsets){await page.mouse.move(x+dx*size,y+dy*size);const coordinate=await page.locator('#help strong').first().textContent();if(coordinate===`${command.x+1}:${command.y+1}`){await page.mouse.click(x+dx*size,y+dy*size);return}}
  await page.keyboard.down('Alt');
  try{for(const [dx,dy]of [[0,0],[-.38,0],[.38,0],[0,-.18],[0,.18]]){await page.mouse.move(x+dx*size,y+dy*size);const coordinate=await page.locator('#help strong').first().textContent();if(coordinate===`${command.x+1}:${command.y+1}`){await page.mouse.click(x+dx*size,y+dy*size);return}}}finally{await page.keyboard.up('Alt')}
  await page.screenshot({path:'workbench/shots/campaign-picking-failure.png'});throw new Error(`Cannot target visible cell ${command.x}:${command.y} command=${JSON.stringify(command)} mission=${game.campaignMission} history=${game.history.length}`);
}
try{
  await page.goto('http://game.test/');await page.locator('#campaign').click();
  if(await page.locator('.chapter:disabled').count()!==5)throw new Error('Initial mission locks wrong');
  await page.screenshot({path:'workbench/shots/campaign-map.png'});
  await page.locator('#campaign-start').click();await page.screenshot({path:'workbench/shots/campaign-ford.png'});
  // Restore the first mission through the public Continue flow.
  await page.reload();await page.locator('#continue').click();
  const summaries=[];
  for(const [index,mission]of CAMPAIGN_MISSIONS.entries()){
    const replay=JSON.parse(await readFile(`workbench/current-campaign-replays/${mission.id}.json`,'utf8'));
    let game=await saved();if(game.campaignMission!==mission.id)throw new Error('Wrong mission transition');
    for(let i=0;i<replay.commands.length;i++){
      const command=replay.commands[i];if(game.team!=='blue')throw new Error('Unexpected replay order');
      await issue(command,game);game=applyAction(game,command);
      if(command.type==='endTurn'){
        while(game.team==='red'&&!game.winner){const red=replay.commands[++i];if(!red)throw new Error('Missing enemy commands');game=applyAction(game,red)}
        await page.waitForFunction(()=>{const s=JSON.parse(localStorage.getItem('ab-save'));return s.team==='blue'||!!s.winner},{timeout:30000});
      }
      const actual=await saved();if(JSON.stringify(actual.units)!==JSON.stringify(game.units)||JSON.stringify(actual.history)!==JSON.stringify(game.history))throw new Error(`UI and replay diverged: ${mission.id} ${i} ${JSON.stringify(command)} actual=${JSON.stringify({units:actual.units,history:actual.history})} expected=${JSON.stringify({units:game.units,history:game.history})}`);
    }
    if(game.winner!=='blue')throw new Error(`No campaign win: ${mission.id}`);
    await page.locator('[data-modal="campaign"]').waitFor();
    await page.screenshot({path:`workbench/shots/campaign-${mission.id}-win.png`});
    summaries.push({mission:mission.id,rounds:game.turn,commands:game.history.length,winner:game.winner});
    if(index<CAMPAIGN_MISSIONS.length-1){await page.locator('[data-modal="campaign-next"]').click();if(await page.locator('#campaign-start').count())await page.locator('#campaign-start').click();await page.screenshot({path:`workbench/shots/campaign-${CAMPAIGN_MISSIONS[index+1].id}.png`})}
  }
  const progress=await page.evaluate(()=>JSON.parse(localStorage.getItem('ab-campaign')));if(progress.completed.length!==6)throw new Error('Campaign progress not completed');
  await page.locator('[data-modal="campaign"]').click();await page.screenshot({path:'workbench/shots/campaign-complete.png'});
  // Real movement onto a visible trap, with actual simulation and visible source.
  const trapGame=createGame({map:'marsh',mode:'ai',mission:'marsh'}),scout=trapGame.units.find(u=>u.team==='blue'&&u.archetype==='scout');
  await page.evaluate(s=>localStorage.setItem('ab-save',JSON.stringify(s)),trapGame);await page.reload();await page.locator('#continue').click();
  const trapCommand={type:'move',unitId:scout.id,x:4,y:6};await issue(trapCommand,trapGame);await page.waitForTimeout(100);await page.screenshot({path:'workbench/shots/damage-trap-source.png'});
  const after=await saved();if(after.units.find(u=>u.id===scout.id).hp!==scout.hp-2)throw new Error('Trap did not deal expected damage');
  await page.locator('#pause').click();await page.locator('[data-modal="restart"]').click();if((await saved()).campaignMission!=='marsh'||(await saved()).history.length!==0)throw new Error('Campaign restart wrong');
  console.log(JSON.stringify({summaries,completed:progress.completed,trapDamage:2,errors}));
}finally{await browser.close()}
if(errors.length)process.exitCode=1;
