import { registerHooks } from 'node:module';
import { mkdirSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { chromium } from '@playwright/test';

registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier.startsWith('.') && !/\.[cm]?[jt]s$/.test(specifier)) {
      try { return nextResolve(`${specifier}.ts`, context); } catch {}
      try { return nextResolve(`${specifier}/index.ts`, context); } catch {}
    }
    return nextResolve(specifier, context);
  },
});
const { createGame, PRESETS } = await import('../src/engine/index.ts');
const state = createGame({ map:'highland', mode:'pvp', seed:20261001, blueprintA:PRESETS[1], blueprintB:PRESETS[0] });
const engineer = state.units.find(u=>u.id==='blue-4');
const victim = state.units.find(u=>u.id==='red-2');
engineer.x=7; engineer.y=4;
victim.x=8; victim.y=4;
mkdirSync('workbench/shots',{recursive:true});
let browser;
try { browser=await chromium.launch({headless:true}); }
catch { browser=await chromium.launch({headless:true,executablePath:join(homedir(),'AppData/Local/ms-playwright/chromium_headless_shell-1234/chrome-headless-shell-win64/chrome-headless-shell.exe')}); }
const page=await browser.newPage({viewport:{width:1440,height:900},deviceScaleFactor:1});
const errors=[];
page.on('pageerror',e=>errors.push(e.message));
page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});
await page.goto('http://localhost:5173/',{waitUntil:'networkidle'});
await page.evaluate(s=>localStorage.setItem('ab-save',JSON.stringify(s)),state);
await page.reload({waitUntil:'networkidle'});
await page.getByText('Продолжить').click();
await page.locator('[data-unit="blue-4"]').click();
await page.locator('[data-action="ability"]').click();
const board=page.locator('#board'),box=await board.boundingBox();
const size=Math.min(62,Math.max(39,box.width/(state.map.width*1.7)))*1.14;
const tile=state.map.tiles.find(t=>t.x===8&&t.y===4);
const x=box.x+box.width/2+(8-4)*size*.5;
const y=box.y+box.height*.48+20+(8+4-state.map.width)*size*.24-tile.h*size*.21;
await page.mouse.move(x,y);
await page.screenshot({path:'workbench/shots/07-bridge-preview.png'});
const previewText=await page.locator('#preview-panel').innerText();
await page.mouse.click(x,y);
await page.screenshot({path:'workbench/shots/08-bridge-collapsed.png'});
const saved=JSON.parse(await page.evaluate(()=>localStorage.getItem('ab-save')));
console.log(JSON.stringify({previewText,terrain:saved.map.tiles.find(t=>t.x===8&&t.y===4)?.terrain,victimAlive:saved.units.find(u=>u.id==='red-2')?.alive,errors}));
await browser.close();
if(saved.map.tiles.find(t=>t.x===8&&t.y===4)?.terrain!=='water'||errors.length)process.exitCode=1;
