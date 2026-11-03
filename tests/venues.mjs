import assert from 'node:assert/strict';
import {mkdir, writeFile} from 'node:fs/promises';
import {pathToFileURL} from 'node:url';

const moduleName = process.env.PLAYWRIGHT_MODULE || 'playwright';
const {chromium} = await import(moduleName.startsWith('/') ? pathToFileURL(moduleName).href : moduleName);
const url = new URL(process.env.TEST_URL || 'http://127.0.0.1:4181/'); url.searchParams.set('unlock', 'all');
const output = process.env.VENUES_OUTPUT || new URL('../review/venues-v2/', import.meta.url).pathname;
await mkdir(output, {recursive: true});
const browser = await chromium.launch({executablePath: process.env.CHROMIUM_PATH || '/usr/bin/chromium', headless: true,
  args: ['--no-sandbox', '--disable-dev-shm-usage', '--enable-unsafe-swiftshader']});
const reports = [];
async function capture(name, viewport, fallback = false, deviceScaleFactor = 1) {
  const context = await browser.newContext({viewport, deviceScaleFactor, reducedMotion: 'reduce'});
  const page = await context.newPage(), errors = [], failed = [];
  page.setDefaultTimeout(45000);
  page.on('pageerror', error => errors.push(error.message));
  page.on('response', response => {if (response.status() >= 400) failed.push(response.url());});
  if (fallback) await page.addInitScript(() => {
    const native = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function(type, ...args) {return /webgl/i.test(type) ? null : native.call(this, type, ...args);};
  });
  await page.goto(url.href, {waitUntil: 'networkidle', timeout: 60000});
  await page.waitForFunction(() => window.longRun && window.LR_SHOPS?.inspect(0).ready && LR_SCENERY.ready && !document.querySelector('#start').disabled && !document.querySelector('#splash'));
  if (!fallback) await page.waitForFunction(() => longRun.environment.ready);
  const checks = await page.evaluate(() => {
    const fixedA = LR_SHOPS.layout(1, 1000, 540, 6000), fixedB = LR_SHOPS.layout(987654, 1000, 540, 6000);
    const finishDistance = Oo.midtown.duration * ye;
    const greetingFrames = [];
    for (const width of [864, 960, 1168, 1320]) {
      let distance = null;
      for (let d = 1000; d < finishDistance; d += 100) {
        const office = LR_SHOPS.inspect(d, width, 540).items.find(i => i.key === 'fifth');
        if (office.quad[0][0] >= 20 && office.quad[1][0] <= width - 20) {distance = d; break;}
      }
      greetingFrames.push({width, distance});
    }
    return {fixedA, fixedB, finishDistance, greetingFrames, scales: [540, 720].map(height => LR_SHOPS.inspect(6000, 1000, height))};
  });
  assert.deepEqual(checks.fixedA, checks.fixedB, 'Venue positions are stable across seeds');
  assert.deepEqual(checks.fixedA.map(i => i.key).sort(), ['fifth', 'gussy', 'joju', 'omars']);
  assert.equal(new Set(checks.fixedA.map(i => i.panel)).size, 4, 'All four retained venues occupy distinct positions');
  for (const frame of checks.greetingFrames) assert.ok(frame.distance && frame.distance < checks.finishDistance, `Full 505 entrance arrives before victory at width ${frame.width}`);
  const [normal, large] = checks.scales;
  assert.ok(normal.nativeWidth >= 1024 && normal.nativeHeight >= 1536);
  const ordered = [...normal.items].sort((a, b) => a.worldX - b.worldX);
  for (let i = 1; i < ordered.length; i++) {
    const gap = ordered[i].worldX - ordered[i - 1].worldX - (ordered[i].width + ordered[i - 1].width) / 2;
    assert.ok(gap > 140, 'Complete facades have a natural stretch of intervening streetscape');
  }
  for (const item of normal.items) {
    const resized = large.items.find(i => i.key === item.key);
    assert.ok(Math.abs(item.width / normal.scale - resized.width / large.scale) < 1e-9);
    assert.equal(item.renderMode, 'native-overlay'); assert.equal(item.fullArchitecture, true);
    assert.ok(Math.abs(item.art.width / item.art.height - 1024 / 1536) < 1e-9, 'Full native architecture keeps its original proportions');
    assert.ok(Math.abs(item.art.footY - (-8 + 556 * 723 / 941)) < 1e-9, 'All venue curbs share the restored painted pavement anchor');
    assert.ok(item.sourceCrop[2] > 500 && item.sourceCrop[3] > 250, 'Native venue detail includes complete architecture, not a small sign crop');
    if (item.key === 'fifth') {
      assert.equal(item.kind, 'glass office entrance'); assert.equal(item.fullGlassEntrance, true);
      assert.ok(item.sourceCrop[3] / item.sourceCrop[2] > .5, '505 retains its tall glass-door entrance proportions');
    }
  }
  for (const venue of ['joju', 'omars', 'gussy', 'fifth']) {
    const info = await page.evaluate(venue => {
      Cu(false); fu('midtown'); Ko('chapter'); b = 'paused'; SA.pause();
      // Find a frame with the complete venue inside the real game viewport.
      let distance = null;
      for (let d = 0; d < Oo.midtown.duration * ye; d += 50) {
        const item = LR_SHOPS.inspect(d, eA, kA).items.find(i => i.key === venue);
        if (item.quad[0][0] >= 20 && item.quad[1][0] <= eA - 20) {distance = d; break;}
      }
      if (distance === null) return {missing: venue};
      q.distance = distance; q.chapterDistance = distance; q.chapterTime = Math.max(3, distance / ye);
      q.floorY = q.floorAt(q.x); q.y = q.floorY; q.grounded = true; ir = q.y; Kt = T - q.floorY; $i = 0;
      $A.update(0, q, {id: 'midtown', reduced: true, quality: 1}); Vu(); vu();
      const greeting = [];
      if (venue === 'fifth') {
        const early = {districtId: 'midtown', chapterTime: 5, distance: 0};
        LR_SHOPS.tick(early, eA, (...args) => greeting.push(args));
        if (greeting.length) return {missing: 'office greeting used stale camera metadata after retry'};
        const visitor = {districtId: 'midtown', chapterTime: 55, distance};
        LR_SHOPS.tick(visitor, eA, (...args) => greeting.push(args)); LR_SHOPS.tick(visitor, eA, (...args) => greeting.push(args));
      }
      return {venue, distance, renderer: longRun.renderer, environment: longRun.environment, greeting,
        venues: LR_SHOPS.inspect(distance, eA, kA), W: eA, H: kA, dpr: devicePixelRatio};
    }, venue);
    assert.equal(info.missing, undefined, `${venue} must be fully visible before the finish`);
    assert.equal(info.renderer, fallback ? 'district-canvas' : 'pixi-webgl');
    if (!fallback) assert.equal(info.environment.error, null);
    if (venue === 'fifth') {assert.equal(info.greeting.length, 1); assert.equal(info.greeting[0][0], '505 FIFTH AVENUE');}
    const item = info.venues.items.find(item => item.key === venue);
    assert.equal(item.visible, true);
    if (venue === 'gussy') {
      assert.ok(Math.abs(item.contactY - item.quad[2][1]) < 2, 'Both truck tyres meet the authored curb');
      assert.ok(item.wheelX.every(x => x > item.quad[0][0] && x < item.quad[1][0]));
    }
    assert.equal(info.dpr, deviceScaleFactor);
    await page.screenshot({path: `${output}/${name}-${venue}.png`});
    reports.push({name, ...info});
  }
  assert.deepEqual(errors, []); assert.deepEqual(failed, []); await context.close();
  console.log(`PASS venues ${name}: separate blocks, native full frontages, complete 505 entrance before victory, tyre contact and once-only greeting.`);
}
try {
  await capture('desktop', {width: 1440, height: 900});
  await capture('mobile-dpr2', {width: 844, height: 390}, false, 2);
  await capture('canvas', {width: 1440, height: 900}, true);
  await writeFile(`${output}/report.json`, JSON.stringify(reports, null, 2));
} finally {await browser.close();}
