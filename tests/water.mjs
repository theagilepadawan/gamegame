import assert from 'node:assert/strict';
import {mkdir, writeFile} from 'node:fs/promises';
import {pathToFileURL} from 'node:url';

const moduleName = process.env.PLAYWRIGHT_MODULE || 'playwright';
const {chromium} = await import(moduleName.startsWith('/') ? pathToFileURL(moduleName).href : moduleName);
const browser = await chromium.launch({executablePath: process.env.CHROMIUM_PATH || '/usr/bin/chromium', headless: true,
  args: ['--no-sandbox', '--disable-dev-shm-usage', '--enable-unsafe-swiftshader']});
const url = new URL(process.env.TEST_URL || 'http://127.0.0.1:4181/'); url.searchParams.set('unlock', 'all');
const output = process.env.WATER_OUTPUT || new URL('../review/water/', import.meta.url).pathname;
await mkdir(output, {recursive: true});
const results = [];
async function pixelsDiffer(page, a, b) {
  return page.evaluate(async ([a, b]) => {
    async function decode(base64) {
      const image = new Image(); image.src = 'data:image/png;base64,' + base64; await image.decode();
      const canvas = document.createElement('canvas'); canvas.width = image.naturalWidth; canvas.height = image.naturalHeight;
      const context = canvas.getContext('2d'); context.drawImage(image, 0, 0);
      return context.getImageData(0, 0, canvas.width, canvas.height).data;
    }
    const first = await decode(a), second = await decode(b); let changed = 0, maximum = 0, total = 0;
    for (let i = 0; i < first.length; i += 4) {
      const delta = Math.max(Math.abs(first[i] - second[i]), Math.abs(first[i + 1] - second[i + 1]), Math.abs(first[i + 2] - second[i + 2]));
      if (delta > 1) changed++; maximum = Math.max(maximum, delta); total += delta;
    }
    return {changed, maximum, meanDelta: total / (first.length / 4)};
  }, [a.toString('base64'), b.toString('base64')]);
}
async function check(fallback) {
  const label = fallback ? 'canvas' : 'pixi';
  const context = await browser.newContext({viewport: {width: 1000, height: 600}, deviceScaleFactor: 1, reducedMotion: 'no-preference'});
  const page = await context.newPage(), errors = [], failed = [];
  page.setDefaultTimeout(60000);
  page.on('pageerror', error => errors.push(error.message));
  page.on('response', response => {if (response.status() >= 400) failed.push(response.url());});
  if (fallback) await page.addInitScript(() => {
    const native = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function(type, ...args) {return /webgl/i.test(type) ? null : native.call(this, type, ...args);};
  });
  await page.goto(url.href, {waitUntil: 'networkidle', timeout: 60000});
  await page.waitForFunction(() => window.longRun && LR_SCENERY.ready && !document.querySelector('#start').disabled && !document.querySelector('#splash'));
  if (!fallback) await page.waitForFunction(() => longRun.environment.ready);
  // Stop the autonomous frame scheduler after initialization. Manual frames use
  // the real game renderer at an unchanged camera, so only the water's clock
  // advances. This avoids mistaking moving runners/leaves for lake animation.
  await page.evaluate(() => {b = 'paused'; window.requestAnimationFrame = () => 0;});
  await page.waitForTimeout(100);
  await page.evaluate(() => {
    Cu(false); fu('park'); Ko('chapter'); b = 'paused'; SA.pause();
    q.distance = 6000; q.chapterDistance = 6000; q.y = q.floorY; q.grounded = true; ir = q.y; Kt = T - q.floorY; $i = 0;
    window.__waterClock = 10000;
    Object.defineProperty(performance, 'now', {configurable: true, value: () => window.__waterClock});
  });
  async function frame(name, time, paused = false) {
    const state = await page.evaluate(({time, paused}) => {
      __waterClock = time; b = paused ? 'paused' : 'playing'; vu();
      const layer = LR_SCENERY.layout('park', q.distance, eA, kA, 'chapter').layers.find(layer => layer.kind === 'water');
      return {renderer: longRun.renderer, state: longRun.state, layer: layer || null, environment: longRun.environment};
    }, {time, paused});
    const water = await page.screenshot({path: `${output}/${label}-${name}-water.png`, clip: {x: 0, y: 384, width: 1000, height: 80}});
    const bank = await page.screenshot({clip: {x: 350, y: 180, width: 300, height: 100}});
    return {water, bank, state};
  }
  const first = await frame('normal-a', 10000), second = await frame('normal-b', 11500);
  assert.equal(first.state.renderer, fallback ? 'district-canvas' : 'pixi-webgl');
  assert.ok(first.state.layer, 'Normal motion includes the water surface');
  const motion = await pixelsDiffer(page, first.water, second.water), fixedBank = await pixelsDiffer(page, first.bank, second.bank);
  assert.ok(motion.changed > 30 && motion.maximum >= 3, `${label}: rendered lake pixels visibly change between frames`);
  assert.equal(fixedBank.changed, 0, `${label}: the painted bank and architecture stay still`);
  const pausedA = await frame('paused-a', 13000, true), pausedB = await frame('paused-b', 16000, true);
  const paused = await pixelsDiffer(page, pausedA.water, pausedB.water);
  assert.equal(paused.changed, 0, `${label}: pause freezes the rendered lake`);
  await page.emulateMedia({reducedMotion: 'reduce'});
  const reducedA = await frame('reduced-a', 18000), reducedB = await frame('reduced-b', 21000);
  assert.equal(reducedA.state.layer, null, 'Reduced motion omits the animated water layer');
  const reduced = await pixelsDiffer(page, reducedA.water, reducedB.water);
  assert.equal(reduced.changed, 0, `${label}: reduced-motion lake pixels remain still`);
  assert.deepEqual(errors, []); assert.deepEqual(failed, []);
  results.push({renderer: label, motion, fixedBank, paused, reduced});
  await context.close();
  console.log(`PASS water ${label}: ${motion.changed} changed rendered lake pixels, stable bank, frozen pause and reduced motion.`);
}
try {await check(false); await check(true); await writeFile(`${output}/report.json`, JSON.stringify(results, null, 2));}
finally {await browser.close();}
