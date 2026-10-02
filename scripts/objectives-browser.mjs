import { chromium } from '@playwright/test';
import { readFileSync, mkdirSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';

mkdirSync('workbench/shots', { recursive: true });
let browser;
try { browser = await chromium.launch({ headless: true }); }
catch { browser = await chromium.launch({ headless: true, executablePath: join(homedir(), 'AppData/Local/ms-playwright/chromium_headless_shell-1234/chrome-headless-shell-win64/chrome-headless-shell.exe') }); }
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const errors = [];
page.on('pageerror', error => errors.push(error.message));
page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
for (const kind of ['commander', 'elimination', 'control']) {
  await page.locator('#skirmish').click();
  if (kind === 'commander') await page.screenshot({ path: 'workbench/shots/objective-setup.png' });
  await page.locator('#match-objective').selectOption(kind);
  await page.locator('#start-top').click();
  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('ab-save')));
  if (saved.objective.kind !== kind || saved.initial.objective !== kind) throw new Error(`Objective not saved: ${kind}`);
  await page.screenshot({ path: `workbench/shots/objective-${kind}.png` });
  await page.locator('#pause').click();
  await page.locator('[data-modal="menu"]').click();
}
await page.locator('#hotseat').click();
await page.locator('#match-objective').selectOption('commander');
await page.locator('#start-top').click();
if (!await page.locator('#match-objective').isDisabled()) throw new Error('Second PvP roster can change the shared objective');
await page.locator('#start-top').click();
const pvp = await page.evaluate(() => JSON.parse(localStorage.getItem('ab-save')));
if (pvp.mode !== 'pvp' || pvp.objective.kind !== 'commander') throw new Error('PvP objective mismatch');
await page.locator('#pause').click();
await page.locator('[data-modal="menu"]').click();
const replay = JSON.parse(readFileSync('workbench/round2-replays/default-nn.json', 'utf8'));
await page.evaluate(data => localStorage.setItem('ab-last-replay', JSON.stringify({ initial: data.initial, history: data.commands })), replay);
await page.reload({ waitUntil: 'networkidle' });
await page.locator('#watch-replay').click();
for (let i = 0; i < 24; i++) await page.locator('#replay-next').click();
await page.waitForTimeout(100);
await page.screenshot({ path: 'workbench/shots/damage-number-replay.png' });
const result = { errors, objectiveModes: 3, replayStep: await page.locator('.top-actions .turn-pill').textContent() };
console.log(JSON.stringify(result));
await browser.close();
if (errors.length) process.exitCode = 1;
