import { chromium } from '@playwright/test';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { createServer } from 'node:http';
import { resolve, extname, join } from 'node:path';
import { homedir } from 'node:os';
import { registerHooks } from 'node:module';
import { pathToFileURL } from 'node:url';

mkdirSync('workbench/october-review', { recursive: true });
const stamp = new Date().toISOString();
const snapshot = readFileSync('src/ai/index.ts', 'utf8').replaceAll("'../engine/catalog'", "'../../src/engine/catalog'").replaceAll("'../engine'", "'../../src/engine'").replaceAll("'../engine/types'", "'../../src/engine/types'").replaceAll("'./search'", "'../../src/ai/search'");
if (!existsSync('workbench/october-review/baseline-ai.ts')) writeFileSync('workbench/october-review/baseline-ai.ts', snapshot);
registerHooks({ resolve(specifier, context, next) {
  try { return next(specifier, context); } catch (e) {
    if (specifier.startsWith('.') && context.parentURL) {
      for (const suffix of ['.ts', '/index.ts']) try { return next(new URL(specifier + suffix, context.parentURL).href, context); } catch {}
    }
    throw e;
  }
} });
const updated = process.argv.includes('--updated');
const { chooseAiCommand } = await import(pathToFileURL(resolve(updated ? 'src/ai/index.ts' : 'workbench/october-review/baseline-ai.ts')).href);
const { createGame, applyAction, previewAction } = await import(pathToFileURL(resolve('src/engine/index.ts')).href);
const aiTrials = [];
for (const difficulty of ['easy', 'normal', 'hard']) {
  let hazardous = 0, placements = 0;
  const traces = [];
  for (let seed = 1; seed <= 8; seed++) {
    let state = createGame({ map: 'tutorial', mode: 'ai', seed });
    state.map.width = 9; state.map.height = 7;
    state.map.tiles = Array.from({ length: 63 }, (_, i) => ({ x: i % 9, y: Math.floor(i / 9), h: 0, terrain: 'grass' }));
    state.objective.kind = 'elimination';
    state.team = 'red';
    const red = state.units.filter(u => u.team === 'red'), blue = state.units.filter(u => u.team === 'blue');
    Object.assign(red[0], { x: 6, y: 3, archetype: 'engineer', variant: 'sapper', hp: 5, maxHp: 5 });
    Object.assign(red[1], { x: 5, y: 2, archetype: 'sword', variant: 'duelist', hp: 6, maxHp: 6 });
    Object.assign(red[2], { x: 7, y: 4, archetype: 'spear', variant: 'raider', hp: 5, maxHp: 5 });
    blue.forEach((u, i) => Object.assign(u, { x: 1, y: 2 + i }));
    // This opening trap is a legal placement by the allied engineer.
    const placement = { type: 'ability', unitId: red[0].id, x: 5, y: 3 };
    if (!previewAction(state, placement).valid) throw Error('Fixture trap placement illegal');
    state = applyAction(state, placement); placements++;
    for (let n = 0; n < 12 && state.team === 'red' && !state.winner; n++) {
      const command = chooseAiCommand(state, difficulty); if (!command) break;
      const p = previewAction(state, command);
      if ((p.hazardDamage ?? 0) > 0) { hazardous++; traces.push({ seed, command, hazardDamage: p.hazardDamage }); }
      state = applyAction(state, command);
    }
  }
  aiTrials.push({ difficulty, placements, hazardous, traces });
}
if (process.argv.includes('--selfplay')) {
  const games = [];
  const roster = { name: 'Trap review', units: [{ archetype: 'engineer', variant: 'sapper' }, { archetype: 'sword', variant: 'duelist' }, { archetype: 'scout', variant: 'runner' }] };
  for (const difficulty of ['easy', 'normal', 'hard']) for (const seed of [31, 32]) {
    let state = createGame({ map: 'tutorial', mode: 'pvp', seed, objective: 'elimination', blueprintA: roster, blueprintB: roster });
    const traps = [], friendlyHazards = [];
    for (let step = 0; step < 240 && !state.winner; step++) {
      const command = chooseAiCommand(state, difficulty); if (!command) break;
      const p = previewAction(state, command), tile = 'x' in command ? state.map.tiles.find(t => t.x === command.x && t.y === command.y) : null;
      if ((p.hazardDamage ?? 0) > 0 && tile?.object === 'trap') friendlyHazards.push({ command, step, team: state.team, hazardDamage: p.hazardDamage, trapPlacedByAI: traps.findLast(t => t.x === tile.x && t.y === tile.y) ?? null });
      const before = state; state = applyAction(state, command);
      if (command.type === 'ability' && before.units.find(u => u.id === command.unitId)?.archetype === 'engineer' && state.map.tiles.find(t => t.x === command.x && t.y === command.y)?.object === 'trap') traps.push({ x: command.x, y: command.y, team: before.team, unit: command.unitId, step });
    }
    games.push({ difficulty, seed, winner: state.winner, turn: state.turn, commands: state.history.length, traps, friendlyHazards });
    console.log(JSON.stringify(games.at(-1)));
  }
  writeFileSync('workbench/october-review/baseline-selfplay.json', JSON.stringify({ stamp, games }, null, 2));
  process.exit(0);
}
const html = readFileSync('dist/index.html', 'utf8');
const server = createServer((req, res) => {
  const pathname = decodeURIComponent(new URL(req.url, 'http://local').pathname).replace(/^\/medieval_tactics/, '');
  const file = resolve('dist', '.' + (pathname === '/' ? '/index.html' : pathname));
  if (!file.startsWith(resolve('dist')) || !existsSync(file)) { res.writeHead(404); res.end(); return; }
  res.setHeader('Content-Type', ({ '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.svg': 'image/svg+xml' })[extname(file)] ?? 'application/octet-stream');
  res.end(readFileSync(file));
});
await new Promise(r => server.listen(0, '127.0.0.1', r));
const browser = await chromium.launch({ headless: true, executablePath: join(homedir(), 'AppData/Local/ms-playwright/chromium_headless_shell-1234/chrome-headless-shell-win64/chrome-headless-shell.exe') });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const errors = []; page.on('pageerror', e => errors.push(e.message));
await page.addInitScript(() => {
  const request = window.requestAnimationFrame.bind(window), cancel = window.cancelAnimationFrame.bind(window), active = new Set();
  window.__rafReview = { active, max: 0, scheduled: 0, fired: 0 };
  window.requestAnimationFrame = callback => {
    let id; id = request(time => { active.delete(id); window.__rafReview.fired++; callback(time); });
    active.add(id); window.__rafReview.scheduled++; window.__rafReview.max = Math.max(window.__rafReview.max, active.size); return id;
  };
  window.cancelAnimationFrame = id => { active.delete(id); cancel(id); };
  localStorage.setItem('ab-music-volume', '0'); localStorage.setItem('ab-volume', '0');
});
await page.goto(`http://127.0.0.1:${server.address().port}/medieval_tactics/`);
await page.locator('#tutorial').click(); await page.waitForTimeout(350);
const count = () => page.evaluate(() => ({ active: window.__rafReview.active.size, max: window.__rafReview.max, scheduled: window.__rafReview.scheduled, fired: window.__rafReview.fired }));
const rafSamples = [{ phase: 'initial', ...await count() }];
for (let i = 1; i <= 5; i++) {
  await page.locator('#pause').click(); await page.locator('[data-modal="settings"]').click(); await page.locator('[data-modal="pause"]').click(); await page.locator('[data-modal="resume"]').click();
  await page.waitForTimeout(180); rafSamples.push({ phase: `pause-settings-resume-${i}`, ...await count() });
}
let keyboard, stability;
if (updated) {
  await page.locator('[data-unit="blue-1"]').click();
  const before = await page.evaluate(() => localStorage.getItem('ab-save'));
  await page.keyboard.press('ArrowRight');
  const help = await page.locator('#help').innerText(), preview = await page.locator('#preview-panel').innerText();
  const aimed = await page.evaluate(() => localStorage.getItem('ab-save'));
  if (aimed !== before || !help.startsWith('3:3') || !preview.includes('Стоимость')) throw Error('Read-only cell keyboard aim mismatch: ' + help + ' / ' + preview);
  await page.screenshot({ path: 'workbench/october-review/updated-keyboard-aim.png' });
  const hashes = [];
  for (let sample = 0; sample < 12; sample++) {
    hashes.push(await page.evaluate(() => {
      const canvas = document.querySelector('#board'), state = JSON.parse(localStorage.getItem('ab-save')), s = Math.min(62, Math.max(39, canvas.clientWidth / (state.map.width * 1.7))) * 1.6;
      const x = canvas.clientWidth / 2 + (2 - 2 - (state.map.width - state.map.height) / 2) * s * .5;
      const y = canvas.clientHeight * .48 + 5 + (4 - (state.map.width + state.map.height) / 2) * s * .24;
      return Array.from(canvas.getContext('2d').getImageData(Math.round(x + 28), Math.round(y + 2), 8, 5).data).join(',');
    }));
    await page.waitForTimeout(100);
  }
  stability = { region: '8 × 5 px, empty targeted cell (2,2), away from sprites / fire / water', samples: hashes.length, uniquePixelStates: new Set(hashes).size };
  await page.keyboard.press('Enter');
  const after = await page.evaluate(() => JSON.parse(localStorage.getItem('ab-save'))), original = JSON.parse(before);
  const u = after.units.find(v => v.id === 'blue-1');
  if (u.x !== 2 || u.y !== 2 || after.history.length !== original.history.length + 1 || after.team !== 'blue') throw Error('Keyboard Enter failed to move exactly once');
  await page.keyboard.press('u');
  const undone = await page.evaluate(() => JSON.parse(localStorage.getItem('ab-save')));
  if (undone.units.find(v => v.id === 'blue-1').x !== 1) throw Error('Keyboard move undo failed');
  keyboard = { help, preview, hoverReadOnly: aimed === before, confirmed: { x: u.x, y: u.y, historyDelta: after.history.length - original.history.length }, undo: true };
  await page.screenshot({ path: 'workbench/october-review/updated-tutorial-stairs.png' });
}
await page.screenshot({ path: `workbench/october-review/${updated ? 'updated' : 'baseline'}-tutorial.png` });
const result = { stamp, artifact: html.match(/index-[\w-]+\.js/)?.[0], aiTrials, rafSamples, keyboard, stability, errors, limitation: 'RAF queue measures duplicate rendering chains; no claim of pixel flicker without frame recording. AI fixture is a legal engineered trap opening on a constructed flat map.' };
writeFileSync(`workbench/october-review/${updated ? 'updated' : 'baseline'}.json`, JSON.stringify(result, null, 2));
console.log(JSON.stringify(result));
await browser.close(); await new Promise(r => server.close(r));
