import assert from 'node:assert/strict';
import {mkdir, writeFile} from 'node:fs/promises';
import {pathToFileURL} from 'node:url';

const moduleName = process.env.PLAYWRIGHT_MODULE || 'playwright';
const {chromium} = await import(moduleName.startsWith('/') ? pathToFileURL(moduleName).href : moduleName);
const url = new URL(process.env.TEST_URL || 'http://127.0.0.1:4181/'); url.searchParams.set('unlock', 'all');
const output = process.env.OFFICE_HOST_OUTPUT || new URL('../review/office-host-v18/', import.meta.url).pathname;
await mkdir(output, {recursive: true});
const browser = await chromium.launch({executablePath: process.env.CHROMIUM_PATH || '/usr/bin/chromium', headless: true,
  args: ['--no-sandbox', '--disable-dev-shm-usage', '--enable-unsafe-swiftshader']});
const reports = [];
async function capture(name, viewport, fallback = false, deviceScaleFactor = 1) {
  const context = await browser.newContext({viewport, deviceScaleFactor, reducedMotion: 'reduce'});
  const page = await context.newPage(), errors = [], failed = [];
  page.setDefaultTimeout(60000);
  page.on('pageerror', error => errors.push(error.message));
  page.on('response', response => {if (response.status() >= 400) failed.push(response.url());});
  if (fallback) await page.addInitScript(() => {
    const native = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function(type, ...args) {return /webgl/i.test(type) ? null : native.call(this, type, ...args);};
  });
  await page.goto(url.href, {waitUntil: 'networkidle', timeout: 90000});
  await page.waitForFunction(() => window.longRun && window.LR_OFFICE_HOST?.ready && LR_SCENERY.ready && LR_SHOPS.ready && !document.querySelector('#start').disabled && !document.querySelector('#splash'));
  if (!fallback) await page.waitForFunction(() => longRun.environment.ready);
  await page.evaluate(() => {const next = requestAnimationFrame.bind(window); window.requestAnimationFrame = () => 0; return new Promise(resolve => next(resolve));});
  const report = await page.evaluate(fallback => {
    const initial = LR_OFFICE_HOST.inspect();
    Cu(false); fu('midtown'); Ko('chapter'); b = 'paused'; SA.pause();
    const opening = LR_OFFICE_HOST.layout(0, eA, kA);
    const samples = []; let found = false;
    // Advance the real chapter, including authored props, slopes and pickups.
    // Invulnerability permits QA traversal without changing route geometry.
    for (let frame = 0; frame < 3595; frame++) {
      q.invincible = 999; q.floorY = q.floorAt(q.x); q.step(1 / 60);
      if (!fallback) $A.update(1 / 60, q, {id: 'midtown', reduced: true, quality: 1});
      if (frame % 15 !== 0 || q.chapterTime < 10) continue;
      ir = q.y; Kt = T - q.floorY; $i = 0;
      const host = LR_OFFICE_HOST.layout(q.distance, eA, kA);
      const terrain = q.floorAt(host.x) + Kt;
      samples.push({time: q.chapterTime, x: host.x, y: host.y, height: host.height, terrain});
      if (host.x > host.height * .5 && host.x < eA - host.height * .5 && terrain > host.y + 5) {
        found = true; break;
      }
    }
    Vu(); vu();
    const current = LR_OFFICE_HOST.inspect(), office = LR_SHOPS.inspect(q.distance, eA, kA).items.find(item => item.key === 'fifth');
    const pausedA = LR_OFFICE_HOST.inspect(); vu(); vu(); const pausedB = LR_OFFICE_HOST.inspect();
    // Test the isolated host layer at the actual route camera. Unmoving head,
    // torso and feet must remain pixel-identical during the wrist gesture.
    const canvas = document.createElement('canvas'); canvas.width = Math.ceil(eA); canvas.height = Math.ceil(kA);
    const ctx = canvas.getContext('2d'), run = {floorAt: () => 10000};
    function hashRegion(x, y, width, height) {
      const data = ctx.getImageData(Math.round(x), Math.round(y), Math.round(width), Math.round(height)).data;
      let hash = 2166136261; for (const value of data) {hash ^= value; hash = Math.imul(hash, 16777619);} return hash >>> 0;
    }
    function hostFrame(time, reduced = false) {
      ctx.clearRect(0, 0, eA, kA);
      LR_OFFICE_HOST.draw2d(ctx, 'midtown', q.distance, eA, kA, time, reduced, run, 0);
      const p = LR_OFFICE_HOST.inspect(), h = p.height;
      return {pose: p,
        body: hashRegion(p.x - h * .16, p.y - h * .97, h * .27, h * .95),
        feet: hashRegion(p.x - h * .2, p.y - h * .08, h * .4, h * .09),
        all: hashRegion(p.x - h * .2, p.y - h, h * .48, h * 1.02)};
    }
    const still = hostFrame(10), wave = hostFrame(10.6), settled = hostFrame(13), reduced = hostFrame(10.6, true);
    // Restore actual renderer state for the evidence frame.
    vu();
    return {found, initial, opening, samples, current, office, pausedA, pausedB, still, wave, settled, reduced,
      renderer: longRun.renderer, time: q.chapterTime, W: eA, H: kA, dpr: devicePixelRatio};
  }, fallback);
  assert.equal(report.initial.ready, true);
  assert.equal(report.initial.visible, false, 'Host is hidden on the main menu');
  assert.equal(report.opening.visible, false, 'Office host is not present at the chapter start');
  assert.equal(report.found, true, 'Full host and grounded shoes are visible before the real chapter finishes');
  assert.equal(report.renderer, fallback ? 'district-canvas' : 'pixi-webgl');
  assert.equal(report.current.visible, true);
  assert.equal(report.current.y, report.office.host.y, 'Feet remain on authored office pavement');
  assert.equal(report.current.x, report.office.host.x);
  assert.ok(report.current.x > report.office.quad[1][0], 'Host stands beside, not over, the two revolving doors');
  assert.ok(report.current.height / report.office.height > .45 && report.current.height / report.office.height < .55, 'Host uses architectural adult scale');
  assert.deepEqual(report.pausedA, report.pausedB, 'Pause keeps the gesture and feet still');
  assert.equal(report.still.body, report.wave.body, 'Head and body pixels do not sway between greeting poses');
  assert.equal(report.still.feet, report.wave.feet, 'Greeting never moves the shoes');
  assert.notEqual(report.still.all, report.wave.all, 'Greeting moves the wrist');
  assert.equal(report.still.all, report.settled.all, 'One greeting returns cleanly to the original pose');
  assert.equal(report.still.all, report.reduced.all, 'Reduced motion holds the original pose');
  assert.equal(report.dpr, deviceScaleFactor);
  await page.screenshot({path: `${output}/${name}-office.png`, timeout: 90000});
  const hidden = await page.evaluate(() => {
    Cu(false); fu('park'); Ko('chapter'); b = 'paused'; SA.pause(); Vu(); vu();
    const park = LR_OFFICE_HOST.inspect(); Cu(false); vu();
    return {park, home: LR_OFFICE_HOST.inspect()};
  });
  assert.equal(hidden.park.visible, false); assert.equal(hidden.home.visible, false);
  assert.deepEqual(errors, []); assert.deepEqual(failed, []);
  reports.push({name, ...report, hidden}); await context.close();
  console.log(`PASS office host ${name}: late chapter, grounded scale, stable head/feet, once-only wrist greeting, reduced motion and pause.`);
}
try {
  await capture('desktop', {width: 1440, height: 900});
  await capture('mobile-dpr2', {width: 844, height: 390}, false, 2);
  await capture('canvas', {width: 1440, height: 900}, true);
  await writeFile(`${output}/report.json`, JSON.stringify(reports, null, 2));
} finally {await browser.close();}
