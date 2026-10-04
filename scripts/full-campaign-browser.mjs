import {chromium} from '@playwright/test';
import {readFile,mkdir,writeFile} from 'node:fs/promises';
import {resolve,join} from 'node:path';
import {homedir} from 'node:os';
import {registerHooks} from 'node:module';
registerHooks({resolve(specifier,context,nextResolve){if(specifier.startsWith('.')&&!/\.[cm]?[jt]s$/.test(specifier)){try{return nextResolve(`${specifier}.ts`,context)}catch{}try{return nextResolve(`${specifier}/index.ts`,context)}catch{}}return nextResolve(specifier,context)}});
const {createGame,applyAction,CAMPAIGN_MISSIONS}=await import('../src/engine/index.ts');
const routeName=process.argv[2]??'caravan';if(!['caravan','granary','thaw'].includes(routeName))throw Error('Invalid route');
const language=process.argv[3]??'ru';if(!['ru','en'].includes(language))throw Error('Invalid language');
const missions=routeName==='thaw'?CAMPAIGN_MISSIONS.slice(10):CAMPAIGN_MISSIONS.slice(0,10).filter(m=>!['caravan','granary'].includes(m.id)||m.id===routeName);
let browser;try{browser=await chromium.launch({headless:true})}catch{browser=await chromium.launch({headless:true,executablePath:join(homedir(),'AppData/Local/ms-playwright/chromium_headless_shell-1234/chrome-headless-shell-win64/chrome-headless-shell.exe')})}
const page=await browser.newPage({viewport:{width:1440,height:900}}),errors=[];
page.on('pageerror',error=>errors.push(error.message));
await page.route('**/*',async route=>{const path=new URL(route.request().url()).pathname.replace(/^\/medieval_tactics\//,'/'),name=path==='/'?'index.html':path.slice(1);await route.fulfill({body:await readFile(resolve('dist',name)),contentType:name.endsWith('.js')?'text/javascript':name.endsWith('.css')?'text/css':name.endsWith('.png')?'image/png':name.endsWith('.svg')?'image/svg+xml':'text/html'})});
await page.addInitScript(language=>{localStorage.setItem('ab-language',language);localStorage.setItem('ab-reduce-motion','1');localStorage.setItem('ab-volume','0');localStorage.setItem('ab-speed','1.8')},language);
await mkdir(`workbench/campaign-full-shots/${routeName}`,{recursive:true});
const saved=()=>page.evaluate(()=>JSON.parse(localStorage.getItem('ab-save')));
async function readScene(){for(let i=0;i<30&&await page.locator('.novel').count();i++){if(await page.locator('[data-story-choice]:enabled').count())await page.locator('[data-story-choice="people"]').click();await page.locator('#story-next').click()}if(await page.locator('.novel').count())throw Error('Scene did not finish')}
async function issue(command,game){
  if(command.type==='endTurn'){await page.locator('#end-turn').click();return}
  await page.locator(`[data-unit="${command.unitId}"]`).click();
  if(command.type==='undo'){await page.locator('#undo').click();return}
  if(command.type==='attack'||command.type==='ability')await page.locator(`[data-action="${command.type}"]`).click();
  await page.keyboard.press('Home');const unit=game.units.find(u=>u.id===command.unitId);
  for(let i=0;i<Math.abs(command.x-unit.x);i++)await page.keyboard.press(command.x>unit.x?'ArrowRight':'ArrowLeft');
  for(let i=0;i<Math.abs(command.y-unit.y);i++)await page.keyboard.press(command.y>unit.y?'ArrowDown':'ArrowUp');
  const fragile=command.type==='attack'&&game.map.tiles[command.y*game.map.width+command.x].object==='fragile';
  if(fragile)await page.keyboard.down('Shift');
  try{await page.keyboard.press('Enter')}finally{if(fragile)await page.keyboard.up('Shift')}
}
try{
  await page.goto('http://game.test/');await page.locator('#campaign').click();await page.locator(`[data-campaign-id="${routeName==='thaw'?'thaw':'embers'}"]`).click();
  if(await page.locator('.chapter:disabled').count()!== (routeName==='thaw'?5:9))throw new Error('Initial mission locks wrong');
  await page.screenshot({path:`workbench/campaign-full-shots/${routeName}/campaign-map.png`});
  await page.locator('#campaign-start').click();await readScene();await page.screenshot({path:`workbench/campaign-full-shots/${routeName}/campaign-ford.png`});
  // Restore the first mission through the public Continue flow.
  await page.reload();await page.locator('#continue').click();
  const summaries=[];
  for(const [index,mission]of missions.entries()){
    const replay=JSON.parse(await readFile(`scripts/campaign-replays/${mission.id}.json`,'utf8'));
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
    await page.screenshot({path:`workbench/campaign-full-shots/${routeName}/campaign-${mission.id}-win.png`});
    summaries.push({mission:mission.id,rounds:game.turn,commands:game.history.length,winner:game.winner});
    await page.locator('[data-modal="campaign-story"]').click();await readScene();
    if(index<missions.length-1){if(mission.id==='kiln')await page.locator(`[data-campaign-route="${routeName}"]`).click();const next=CAMPAIGN_MISSIONS.findIndex(m=>m.id===missions[index+1].id);await page.locator(`[data-mission="${next}"]`).click();await page.locator('#campaign-start').click();await readScene();await page.screenshot({path:`workbench/campaign-full-shots/${routeName}/campaign-${missions[index+1].id}.png`})}
  }
  const progress=await page.evaluate(key=>JSON.parse(localStorage.getItem(key)),routeName==='thaw'?'ab-campaign-thaw':'ab-campaign');if(progress.completed.length!==(routeName==='thaw'?6:9)||(routeName!=='thaw'&&progress.route!==routeName))throw new Error('Campaign progress not completed');
  await page.screenshot({path:`workbench/campaign-full-shots/${routeName}/campaign-complete.png`});
  // Real movement onto a visible trap, with actual simulation and visible source.
  const trapGame=createGame({map:'marsh',mode:'ai',mission:'marsh'}),scout=trapGame.units.find(u=>u.team==='blue'&&u.archetype==='scout');
  // Isolated trap/restart fixture: unlock its first-campaign mission explicitly.
  // The six earned Thaw victories above remain in their separate storage.
  if(routeName==='thaw')await page.evaluate(()=>localStorage.setItem('ab-campaign',JSON.stringify({version:2,completed:['ford','watch','steps','gate'],route:null})));
  await page.evaluate(s=>localStorage.setItem('ab-save',JSON.stringify(s)),trapGame);await page.reload();await page.locator('#continue').click();
  const trapCommand={type:'move',unitId:scout.id,x:4,y:6};await issue(trapCommand,trapGame);await page.waitForTimeout(100);await page.screenshot({path:`workbench/campaign-full-shots/${routeName}/damage-trap-source.png`});
  const after=await saved();if(after.units.find(u=>u.id===scout.id).hp!==scout.hp-2)throw new Error('Trap did not deal expected damage');
  await page.locator('#pause').click();await page.locator('[data-modal="restart"]').click();await readScene();if((await saved()).campaignMission!=='marsh'||(await saved()).history.length!==0)throw new Error('Campaign restart wrong');
  const story=await page.evaluate(key=>JSON.parse(localStorage.getItem(key)),routeName==='thaw'?'ab-story-thaw':'ab-story');if(story.seen.filter(id=>!id.endsWith(':defeat')).length!==(routeName==='thaw'?12:18))throw Error('Narrative arc incomplete');
  const report={route:routeName,language,summaries,completed:progress.completed,story,trapDamage:2,errors};await writeFile(`workbench/campaign-full-${routeName}${language==='en'?'-en':''}.json`,JSON.stringify(report,null,2));console.log(JSON.stringify(report));
}finally{await browser.close()}
if(errors.length)process.exitCode=1;
