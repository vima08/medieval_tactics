import {chromium} from '@playwright/test';
import {homedir} from 'node:os';
import {join} from 'node:path';
import {mkdirSync} from 'node:fs';
mkdirSync('workbench/shots',{recursive:true});
let browser;
try{browser=await chromium.launch({headless:true})}
catch{browser=await chromium.launch({headless:true,executablePath:join(homedir(),'AppData/Local/ms-playwright/chromium_headless_shell-1234/chrome-headless-shell-win64/chrome-headless-shell.exe')})}
const page=await browser.newPage({viewport:{width:1440,height:900}});
const errors=[];
page.on('pageerror',e=>errors.push(e.message));
await page.goto('http://localhost:5173/',{waitUntil:'networkidle'});
await page.getByText('Локальный PvP').click();
await page.locator('#start-top').click();
if(!await page.getByText('сторона ржавчины').count())throw new Error('Second roster not shown');
await page.locator('#start-top').click();
await page.locator('#end-turn').click();
const turn=await page.locator('.turn-pill').first().innerText();
await page.screenshot({path:'workbench/shots/09-hotseat-red-turn.png'});
console.log(JSON.stringify({turn,errors}));
await browser.close();
if(!turn.includes('Ржавчина')||errors.length)process.exitCode=1;
