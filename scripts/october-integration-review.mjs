import {chromium} from '@playwright/test';
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {resolve,join} from 'node:path';
import {homedir} from 'node:os';
import {registerHooks} from 'node:module';
registerHooks({resolve(specifier,context,next){if(specifier.startsWith('.')&&!/\.[cm]?[jt]s$/.test(specifier)){for(const suffix of ['.ts','/index.ts'])try{return next(specifier+suffix,context)}catch{}}return next(specifier,context)}});
const {createGame}=await import('../src/engine/index.ts');
const {STORY_MISSIONS,storyScene}=await import('../src/story-data.ts');
mkdirSync('workbench/october-review',{recursive:true});
const browser=await chromium.launch({headless:true,executablePath:join(homedir(),'AppData/Local/ms-playwright/chromium_headless_shell-1234/chrome-headless-shell-win64/chrome-headless-shell.exe')});
const errors=[],checks=[];
async function makePage(viewport={width:1440,height:900},hasTouch=false){
 const page=await browser.newPage({viewport,hasTouch});page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/*',route=>{const path=new URL(route.request().url()).pathname.replace(/^\/medieval_tactics\//,'/'),name=path==='/'?'index.html':path.slice(1);try{return route.fulfill({body:readFileSync(resolve('dist',name)),contentType:name.endsWith('.js')?'text/javascript':name.endsWith('.css')?'text/css':name.endsWith('.png')?'image/png':name.endsWith('.svg')?'image/svg+xml':'text/html'})}catch(e){errors.push('Asset missing: '+name);return route.abort()}});
 await page.goto('http://game.test/');return page;
}
const page=await makePage();
const embers=JSON.stringify(createGame({map:'watch',mission:'watch',mode:'ai',seed:1})),thaw=JSON.stringify(createGame({map:'thaw_dike',mission:'thaw_dike',mode:'ai',seed:1}));
const firstProgress=JSON.stringify({version:2,completed:['ford'],route:null}),secondProgress=JSON.stringify({version:2,completed:[],route:null,campaignId:'thaw'});
const firstStory=JSON.stringify({version:1,seen:['ford:intro'],choices:{signal:'orders'},cursor:null}),secondStory=JSON.stringify({version:1,seen:[],choices:{},cursor:null});
await page.evaluate(data=>{localStorage.clear();for(const [key,value]of Object.entries(data))localStorage.setItem(key,value)}, {'ab-battle-embers':embers,'ab-battle-thaw':thaw,'ab-save':embers,'ab-campaign':firstProgress,'ab-campaign-thaw':secondProgress,'ab-story':firstStory,'ab-story-thaw':secondStory,'ab-volume':'0','ab-music-volume':'0'});
await page.reload();await page.locator('#campaign').click();
if(await page.locator('[data-resume-campaign]').count()!==2)throw Error('Two campaign resume buttons missing');
await page.screenshot({path:'workbench/october-review/final-campaign-selector-ru.png'});
for(const [id,expected]of [['thaw',thaw],['embers',embers]]){
 await page.locator(`[data-resume-campaign="${id}"]`).click();
 const actual=await page.evaluate(()=>localStorage.getItem('ab-save'));if(actual!==expected)throw Error(id+' resume altered serialized state');
 await page.locator('#pause').click();await page.locator('[data-modal="settings"]').click();await page.locator('[data-language-select]').selectOption(id==='thaw'?'en':'ru');
 if(await page.evaluate(()=>localStorage.getItem('ab-save'))!==expected)throw Error('Language switch mutated battle');
 await page.locator('[data-modal="pause"]').click();await page.locator('[data-modal="menu"]').click();await page.locator('#campaign').click();
 checks.push({check:'exact serialized campaign resume + settings language',campaign:id,pass:true});
}
await page.locator('[data-campaign-id="thaw"]').click();await page.locator('[data-action="campaign-new"]').click();await page.locator('[data-action="campaign-new-confirm"]').click();
const afterReset=await page.evaluate(()=>Object.fromEntries(['ab-campaign','ab-story','ab-battle-embers','ab-battle-thaw','ab-story-thaw','ab-campaign-thaw'].map(k=>[k,localStorage.getItem(k)])));
if(afterReset['ab-campaign']!==firstProgress||afterReset['ab-story']!==firstStory||afterReset['ab-battle-embers']!==embers||afterReset['ab-battle-thaw']!==null||afterReset['ab-story-thaw']!==null)throw Error('Reset crossed campaign boundary');
checks.push({check:'second reset preserves first campaign/story/battle',pass:true});
await page.locator('#campaign-start').click();await page.locator('#story-next').click();
if(await page.evaluate(()=>localStorage.getItem('ab-story'))!==firstStory)throw Error('Second story advancement changed first story');
checks.push({check:'second story advancement isolated',pass:true});
await page.screenshot({path:'workbench/october-review/final-thaw-novel-ru.png'});
let shells=0;
for(const language of ['ru','en'])for(const mission of STORY_MISSIONS)for(const phase of ['intro','outro','defeat']){
 const id=mission.startsWith('thaw_')?'thaw':'embers',key=id==='thaw'?'ab-story-thaw':'ab-story';
 await page.evaluate(({language,id,key,mission,phase})=>{localStorage.setItem('ab-language',language);localStorage.setItem('ab-active-campaign',id);const route=mission==='granary'?'granary':'caravan';localStorage.setItem(id==='thaw'?'ab-campaign-thaw':'ab-campaign',JSON.stringify({version:2,completed:id==='thaw'?['thaw_dike','thaw_mill','thaw_bells','thaw_ferry','thaw_quarry','thaw_sluice']:['ford','watch','steps','gate','marsh','kiln',route,'evacuation','summit'],route:id==='thaw'?null:route,...(id==='thaw'?{campaignId:'thaw'}:{})}));localStorage.setItem(key,JSON.stringify({version:1,seen:[],choices:{signal:'orders',route},cursor:{mission,phase,index:0,destination:'campaign'}}))},{language,id,key,mission,phase});
 await page.reload();await page.locator('#continue-story').click();await page.waitForTimeout(10);
 if(!await page.locator('.novel-line').count()){writeFileSync('workbench/october-review/integration-failed.json',JSON.stringify({mission,phase,language,shells,errors,html:await page.locator('#app').innerHTML()},null,2));throw Error('Novel did not open '+mission+' '+phase+' '+language)}
 const text=await page.locator('.novel-line').innerText();if(text!==storyScene(mission,phase,{signal:'orders',route:mission==='granary'?'granary':'caravan'},language).lines[0].text)throw Error('Wrong authored dialogue '+mission+' '+phase+' '+language);
 if(language==='en'&&/[а-яё]/i.test(await page.locator('.novel').innerText()))throw Error('Russian novel UI leak '+mission+' '+phase);
 shells++;if(shells%16===0)console.log('Novel shells checked:',shells);
}
checks.push({check:'all 48 scene shells in RU and EN',count:shells,pass:true});
await page.locator('#story-menu').click();await page.locator('#campaign').click();
await page.screenshot({path:'workbench/october-review/final-campaign-selector-en.png'});
const englishSelector=await page.locator('#app').innerText();if(/[а-яё]/i.test(englishSelector))throw Error('Russian selector leak');
for(const viewport of [{width:768,height:1024},{width:1024,height:768}]){
 const tablet=await makePage(viewport,true);
 await tablet.evaluate(()=>{localStorage.setItem('ab-language','en');localStorage.setItem('ab-volume','0');localStorage.setItem('ab-music-volume','0')});await tablet.reload();await tablet.locator('#campaign').click();
 await tablet.locator('[data-campaign-id="thaw"]').click();await tablet.locator('#campaign-start').click();
 await tablet.screenshot({path:`workbench/october-review/final-tablet-${viewport.width}-novel.png`});
 const bounds=await tablet.locator('#story-next').boundingBox();if(!bounds||bounds.x<0||bounds.y<0||bounds.x+bounds.width>viewport.width+1||bounds.y+bounds.height>viewport.height+1)throw Error('Tablet novel next clipped');
 const overflow=await tablet.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1);if(overflow)throw Error('Tablet horizontal overflow');
 await tablet.locator('#story-next').click();checks.push({check:'tablet second-campaign novel action visible',viewport,pass:true});await tablet.close();
}
await page.locator('#campaign-menu').click();await page.locator('#tutorial').click();await page.locator('[data-unit="blue-1"]').click();await page.keyboard.press('Home');await page.keyboard.press('ArrowRight');
await page.screenshot({path:'workbench/october-review/final-cursor-no-badge.png'});
const result={timestamp:new Date().toISOString(),artifact:readFileSync('dist/index.html','utf8').match(/index-[\w-]+\.js/)?.[0],checks,errors,limitations:'Initial battle states and novel cursors are explicitly injected legal fixtures; actual resume/reset/settings/story advancement are UI actions. No full campaign completion claimed here.'};
writeFileSync('workbench/october-review/final-integration.json',JSON.stringify(result,null,2));console.log(JSON.stringify(result));
await browser.close();if(errors.length)process.exitCode=1;
