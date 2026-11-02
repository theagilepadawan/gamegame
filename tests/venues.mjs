import assert from 'node:assert/strict';
import {mkdir} from 'node:fs/promises';
import {pathToFileURL} from 'node:url';

const moduleName = process.env.PLAYWRIGHT_MODULE || 'playwright';
const {chromium} = await import(moduleName.startsWith('/') ? pathToFileURL(moduleName).href : moduleName);
const url = new URL(process.env.TEST_URL || 'http://127.0.0.1:4181/');
url.searchParams.set('unlock', 'all');
const output = process.env.VENUES_OUTPUT || new URL('../review/venues/', import.meta.url).pathname;
await mkdir(output, {recursive: true});
const browser = await chromium.launch({executablePath: process.env.CHROMIUM_PATH || '/usr/bin/chromium', headless: true,
  args: ['--no-sandbox', '--disable-dev-shm-usage', '--enable-unsafe-swiftshader']});
async function capture(name, viewport, fallback = false) {
  const context = await browser.newContext({viewport, reducedMotion: 'reduce'});
  const page = await context.newPage(), errors = [], failed = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('response', response => { if (response.status() >= 400) failed.push(response.url()); });
  if (fallback) await page.addInitScript(() => {
    const native = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function(type, ...args) {
      return /webgl/i.test(type) ? null : native.call(this, type, ...args);
    };
  });
  await page.goto(url.href, {waitUntil: 'networkidle'});
  await page.waitForFunction(() => window.longRun && window.LR_SHOPS?.inspect(0).ready && LR_SCENERY.ready &&
    !document.querySelector('#start').disabled && !document.querySelector('#splash'), null, {timeout: 60000});
  if (!fallback) await page.waitForFunction(() => longRun.environment.ready, null, {timeout: 30000});
  const checks = await page.evaluate(() => {
    const fixedA = LR_SHOPS.layout(1, 1000, 540, 6000);
    const fixedB = LR_SHOPS.layout(987654, 1000, 540, 6000);
    const greetingFrames = [];
    // The office must enter the announcement zone before the real chapter ends,
    // including narrow and wide gameplay coordinate spaces.
    for (const width of [864, 960, 1168, 1320]) {
      let distance = null;
      for (let d = 1000; d <= 19000; d += 100) {
        const office = LR_SHOPS.inspect(d, width, 540).items.find(i => i.key === 'fifth');
        if (office.x > width * .18 && office.x < width * .82) {distance = d; break;}
      }
      greetingFrames.push({width, distance});
    }
    return {fixedA, fixedB, greetingFrames, scales: [540, 720].map(height => LR_SHOPS.inspect(6000, 1000, height))};
  });
  assert.deepEqual(checks.fixedA, checks.fixedB, 'Venue mounts must not jump between facades with a new seed');
  assert.deepEqual(checks.fixedA.map(i => i.key).sort(), ['fifth', 'gussy', 'joju', 'omars']);
  for (const frame of checks.greetingFrames) assert.ok(frame.distance && frame.distance < 19200, `505 greeting reachable at width ${frame.width}`);
  const [normal, large] = checks.scales;
  for (const item of normal.items) {
    const resized = large.items.find(i => i.key === item.key);
    assert.ok(Math.abs(item.width / normal.scale - resized.width / large.scale) < 1e-9, 'Venue scales with its painted facade');
    if (item.key === 'joju' || item.key === 'omars') assert.equal(item.panel, 0, 'Restaurants belong to actual storefronts, not the park garden');
    if (item.key === 'fifth') {
      assert.equal(item.kind, 'lobby plaque');
      assert.ok(item.sourceCrop[3] < 50, 'Retain the painted glass lobby; only mount the supplied sign');
      const slope = (item.sourceQuad[1][1] - item.sourceQuad[0][1]) / (item.sourceQuad[1][0] - item.sourceQuad[0][0]);
      assert.ok(slope > .06 && slope < .09, '505 follows the entrance transom perspective');
    }
  }
  for (const [label, distance] of [['frontages', 0], ['truck', 14000], ['office', 18000]]) {
    const info = await page.evaluate(distance => {
      // Freeze a real chapter frame; no product test controls are added.
      Cu(false); fu('midtown'); Ko('chapter'); b = 'paused'; SA.pause();
      q.distance = distance; q.chapterDistance = distance; q.chapterTime = distance / 320;
      q.floorY = q.floorAt(q.x); q.y = q.floorY; q.grounded = true; ir = q.y; Kt = T - q.floorY; $i = 0;
      $A.update(0, q, {id: 'midtown', reduced: true, quality: 1}); Vu(); vu();
      const greeting = [];
      if (distance === 18000) {
        const visitor = {districtId: 'midtown', chapterTime: 55};
        LR_SHOPS.tick(visitor, eA, (...args) => greeting.push(args));
        LR_SHOPS.tick(visitor, eA, (...args) => greeting.push(args));
      }
      return {renderer: longRun.renderer, environment: longRun.environment, greeting,
        venues: LR_SHOPS.inspect(distance, eA, kA), W: eA, H: kA};
    }, distance);
    assert.equal(info.renderer, fallback ? 'district-canvas' : 'pixi-webgl');
    if (!fallback) assert.equal(info.environment.error, null);
    if (distance === 18000) {
      assert.equal(info.greeting.length, 1, '505 announces exactly once when it enters view');
      assert.equal(info.greeting[0][0], '505 FIFTH AVENUE');
    }
    if (distance === 14000) {
      const truck = info.venues.items.find(i => i.key === 'gussy');
      assert.equal(truck.visible, true);
      assert.ok(truck.contactY < 422 && truck.contactY > 415, 'Tyres meet the painted far curb above the foreground platform');
    }
    await page.locator('#stage').screenshot({path: `${output}/${name}-${label}.png`});
  }
  assert.deepEqual(errors, []);
  assert.deepEqual(failed, []);
  await context.close();
  console.log(`PASS venues ${name}: architectural mounts, fixed perspective/scale, curb contact and one-time 505 greeting.`);
}
try {
  await capture('desktop', {width: 1440, height: 900});
  await capture('mobile', {width: 844, height: 390});
  await capture('canvas', {width: 1440, height: 900}, true);
} finally {await browser.close();}
