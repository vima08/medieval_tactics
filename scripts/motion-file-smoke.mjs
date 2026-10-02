import { chromium } from '@playwright/test';
import { resolve } from 'node:path';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { readFile } from 'node:fs/promises';
import { mkdir } from 'node:fs/promises';
import { registerHooks } from 'node:module';

registerHooks({resolve(specifier, context, nextResolve) {
  if (specifier.startsWith('.') && !/\.[cm]?[jt]s$/.test(specifier)) {
    try { return nextResolve(`${specifier}.ts`, context); } catch {}
    try { return nextResolve(`${specifier}/index.ts`, context); } catch {}
  }
  return nextResolve(specifier, context);
}});

const {createGame, legalMoves} = await import('../src/engine/index.ts');
const state = createGame({map:'tutorial', mode:'ai', seed:20260930});
const unit = state.units.find(u => u.id === 'blue-1');
const cell = legalMoves(state, unit.id).find(c => c.path.length >= 3);
if (!cell) throw new Error('No multi-step tutorial move');

let browser;
try { browser = await chromium.launch({headless:true}); }
catch { browser = await chromium.launch({headless:true, executablePath:join(homedir(),'AppData/Local/ms-playwright/chromium_headless_shell-1234/chrome-headless-shell-win64/chrome-headless-shell.exe')}); }
try {
  const page = await browser.newPage({viewport:{width:1440,height:900}});
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.route('**/*', async route => {
    const pathname = new URL(route.request().url()).pathname;
    const name = pathname === '/' ? 'index.html' : pathname.slice(1);
    const contentType = name.endsWith('.js') ? 'text/javascript' : name.endsWith('.css') ? 'text/css' : 'text/html';
    await route.fulfill({body:await readFile(resolve('dist',name)), contentType});
  });
  await page.goto('http://game.test/');
  await page.getByText('Обучение · 5 минут').click();
  await page.locator('[data-unit="blue-1"]').click();
  const box = await page.locator('#board').boundingBox();
  const tile = state.map.tiles.find(t => t.x === cell.x && t.y === cell.y);
  const size = Math.min(62, Math.max(39, box.width / (state.map.width * 1.7))) * 1.6;
  const x = box.x + box.width / 2 + (cell.x - cell.y) * size * .5;
  const y = box.y + box.height * .48 + 5 + (cell.x + cell.y - state.map.width) * size * .24 - tile.h * size * .21;
  await mkdir('workbench/frames',{recursive:true});
  await page.mouse.click(x, y);
  await page.waitForTimeout(70);
  await page.locator('#board').screenshot({path:'workbench/frames/route-early.png'});
  await page.waitForTimeout(220);
  await page.locator('#board').screenshot({path:'workbench/frames/route-middle.png'});
  await page.waitForTimeout(390);
  await page.locator('#board').screenshot({path:'workbench/frames/route-end.png'});
  const saved = JSON.parse(await page.evaluate(() => localStorage.getItem('ab-save')));
  const actual = saved.units.find(u => u.id === unit.id);
  if (actual.x !== cell.x || actual.y !== cell.y || errors.length) throw new Error(JSON.stringify({actual, cell, errors}));
  console.log(JSON.stringify({steps:cell.path.length, destination:[actual.x,actual.y], errors}));
} finally {
  await browser.close();
}
