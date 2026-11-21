import assert from 'node:assert/strict';
import {mkdir, readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import puppeteer from 'puppeteer-core';

const base = new URL('../', import.meta.url);
const source = await readFile(new URL('src/content.ts', base), 'utf8');
const lines = JSON.parse(source.match(/const sonnet18 = (\[[^\n]+\]);/)[1]);
const out = fileURLToPath(new URL('test/out/', base));
await mkdir(out, {recursive:true});
const browser = await puppeteer.launch({executablePath:process.env.DEMO_BROWSER || 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', headless:true, args:['--use-angle=swiftshader','--enable-unsafe-swiftshader','--no-sandbox']});
const context = await browser.createBrowserContext();
const page = await context.newPage();
const errors = [];
page.on('pageerror', e => errors.push(String(e)));
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
const state = () => page.$eval('#mmm-root', e => ({...e.dataset}));
const wait = (fn, ...args) => page.waitForFunction(fn, {timeout:10000}, ...args);
const frame = () => page.evaluate(() => new Promise(r => requestAnimationFrame(() => r())));
let retries = 0;
async function typeChar(char) {
  const before = await state();
  for (let attempt = 0; attempt < 4; attempt++) {
    await sleep(300); await page.keyboard.type(char); await sleep(100);
    const after = await state();
    if (after.buffer !== before.buffer || after.line !== before.line || after.complete !== before.complete) return;
    retries++;
  }
  throw new Error(`Strike ${JSON.stringify(char)} was not accepted after retries`);
}
async function typeLine(text) { for (const c of text) await typeChar(c); }
try {
  await page.setViewport({width:960,height:600});
  await page.goto(process.env.TEST_URL || 'http://127.0.0.1:5215/', {waitUntil:'networkidle0'});
  await wait(() => document.querySelector('#mmm-root')?.dataset.mode === 'paused');
  await page.click('#mmm-resume');
  await wait(() => document.querySelector('#mmm-root').dataset.mode === 'explore');
  await page.keyboard.down('w');
  await wait(() => !document.querySelector('#mmm-sit').disabled);
  await page.keyboard.up('w');
  await page.keyboard.press('e');
  await wait(() => document.querySelector('#mmm-root').dataset.mode === 'desk');
  {
    const before = await state();
    await page.click('#mmm-pause'); await wait(() => document.querySelector('#mmm-root').dataset.mode === 'paused');
    await page.keyboard.press('w'); await page.keyboard.press('Enter'); await frame();
    const paused = await state();
    for (const field of ['buffer','cents','line']) assert.equal(paused[field], before[field], `pause changed ${field}`);
    await page.click('#mmm-resume'); await wait(() => document.querySelector('#mmm-root').dataset.mode === 'desk');
  }
  if (!process.env.VIEWPORT_ONLY) {
  await page.keyboard.press('s'); await page.keyboard.press('h'); await frame();
  assert.equal((await state()).buffer.toLowerCase(), 's', 'second fast strike must be rejected');
  assert.match(await page.$eval('#mmm-feedback', e => e.textContent), /collision.*h.*not printed/i);
  await sleep(300); assert.equal((await state()).buffer.toLowerCase(), 's', 'rejected strike must not replay');
  await typeChar('x'); assert.equal((await state()).buffer.toLowerCase(), 'sx');
  await page.keyboard.press('Backspace'); await frame(); assert.equal((await state()).buffer.toLowerCase(), 's');
  await typeLine(lines[0].slice(1).toLowerCase());
  assert.equal((await state()).buffer.toLowerCase(), lines[0].toLowerCase());
  assert.equal((await state()).line, '0');
  await page.screenshot({path:`${out}/manuscript.png`});
  await page.screenshot({path:`${out}/thumbnail.jpg`, type:'jpeg', quality:85});
  await page.keyboard.press('Enter'); await wait(() => document.querySelector('#mmm-root').dataset.line === '1');
  const earned = Number((await state()).cents); assert(earned >= lines[0].length + 10);
  await page.select('#mmm-work-select', 'sonnet-29'); await frame(); assert.equal((await state()).line, '0');
  await page.select('#mmm-work-select', 'sonnet-18'); await frame(); assert.equal((await state()).line, '1');
  for (let i = 1; i < lines.length; i++) {
    await typeLine(lines[i].toLowerCase());
    if (i === 3) { await page.click('#mmm-arm-buy'); await wait(() => document.querySelector('#mmm-root').dataset.arms === '1'); }
    if (Number((await state()).cents) >= 250 && (await state()).return === 'false') { await page.click('#mmm-return-buy'); await wait(() => document.querySelector('#mmm-root').dataset.return === 'true'); }
    if ((await state()).return === 'false') { assert.equal((await state()).line, String(i)); await page.keyboard.press('Enter'); await wait((next) => document.querySelector('#mmm-root').dataset.line === String(next), i + 1); }
    else if (i < lines.length - 1) assert.equal((await state()).line, String(i+1), 'automatic return advances a correct line');
    console.log(`Completed line ${i + 1}/${lines.length}`);
  }
  assert.equal((await state()).complete, 'true');
  assert.equal((await state()).return, 'true');
  }
  for (const [name,width,height] of [['desktop',960,600],['portrait',390,844],['landscape',844,390]]) {
    await page.setViewport({width,height,hasTouch:name !== 'desktop',isMobile:name !== 'desktop'}); await page.bringToFront(); await frame();
    if ((await state()).mode === 'paused') await page.click('#mmm-resume');
    if ((await state()).mode === 'explore') {
      await page.keyboard.down('w'); await wait(() => !document.querySelector('#mmm-sit').disabled); await page.keyboard.up('w');
      await page.keyboard.press('e'); await wait(() => document.querySelector('#mmm-root').dataset.mode === 'desk');
    }
    const toggle = await page.$('.mmm-desk-input > button');
    if (await toggle.evaluate(e => e.getAttribute('aria-expanded')) === 'false') await toggle.click();
    await frame(); await page.screenshot({path:`${out}/${name}.png`});
    const layout = await page.evaluate(() => ({scroll:document.documentElement.scrollWidth, width:innerWidth, keys:[...document.querySelectorAll('.mmm-keys button')].map(e=>{const r=e.getBoundingClientRect();return {label:e.getAttribute('aria-label'),width:r.width,height:r.height,left:r.left,right:r.right,top:r.top,bottom:r.bottom};})}));
    assert(layout.scroll <= layout.width, `${name}: horizontal overflow ${layout.scroll} > ${layout.width}`);
    assert(layout.keys.every(k=>k.width >= 44 && k.height >= 44), `${name}: keys smaller than 44px: ${JSON.stringify(layout.keys.filter(k=>k.width<44||k.height<44))}`);
    for (const key of await page.$$('.mmm-keys button')) {
      await key.evaluate(e => e.scrollIntoView({block:'nearest', inline:'nearest'}));
      const reachable = await key.evaluate(e => { const r=e.getBoundingClientRect(); const x=r.left+r.width/2, y=r.top+r.height/2; return x>=0 && x<innerWidth && y>=0 && y<innerHeight && document.elementFromPoint(x,y)===e; });
      assert(reachable, `${name}: key ${await key.evaluate(e=>e.getAttribute('aria-label'))} is not reachable`);
    }
    if (name !== 'desktop') {
      for (const selector of ['#mmm-arm-buy','#mmm-return-buy']) {
        const button = await page.$(selector);
        await button.evaluate(e => e.scrollIntoView({block:'nearest'}));
        assert(await button.evaluate(e => {const r=e.getBoundingClientRect(); return r.width >= 44 && r.height >= 44 && r.left >= 0 && r.right <= innerWidth && r.top >= 0 && r.bottom <= innerHeight;}), `${name}: ${selector} is not reachable`);
      }
      await page.select('#mmm-work-select', 'sonnet-29');
      await sleep(300); await page.tap('[aria-label="Type w"]'); await wait(() => document.querySelector('#mmm-root').dataset.buffer.toLowerCase() === 'w');
      await page.tap('[aria-label="Backspace"]'); await wait(() => document.querySelector('#mmm-root').dataset.buffer === '');
    }
    await page.click('#mmm-leave'); await wait(() => document.querySelector('#mmm-root').dataset.mode === 'explore');
    if (name !== 'desktop') for (const label of ['Move forward','Jump','Sit at desk']) assert(await page.$eval(`[aria-label="${label}"]`, e => {const r=e.getBoundingClientRect(); return r.width >= 44 && r.height >= 44 && r.bottom > 0 && r.top < innerHeight;}), `${name}: ${label} unavailable`);
    await page.keyboard.press('e'); await wait(() => document.querySelector('#mmm-root').dataset.mode === 'desk');
  }
  assert.deepEqual(errors, []); console.log(`Desk browser flow and viewport checks passed; ${retries} strike retries.`);
} finally { await context.close(); await browser.close(); }

