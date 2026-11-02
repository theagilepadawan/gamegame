import assert from 'node:assert/strict';
import {mkdir, writeFile} from 'node:fs/promises';
import {pathToFileURL} from 'node:url';

const modulePath = process.env.PLAYWRIGHT_MODULE || 'playwright';
const {chromium} = await import(modulePath.startsWith('/') ? pathToFileURL(modulePath).href : modulePath);
const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || '/usr/bin/chromium', headless: true,
  args: ['--no-sandbox', '--disable-dev-shm-usage', '--enable-unsafe-swiftshader'],
});
const base = new URL(process.env.TEST_URL || 'http://127.0.0.1:4181');
base.searchParams.set('unlock', 'all');
const output = process.env.SCENERY_OUTPUT || new URL('../review/scenery/', import.meta.url).pathname;
await mkdir(output, {recursive: true});
const report = [];
async function open(viewport, fallback = false) {
  const context = await browser.newContext({viewport, reducedMotion: 'reduce'});
  const page = await context.newPage(), errors = [], failures = [];
  page.setDefaultTimeout(25000);
  page.on('pageerror', error => errors.push(error.message));
  page.on('response', response => { if (response.status() >= 400) failures.push(`${response.status()} ${response.url()}`); });
  if (fallback) await page.addInitScript(() => {
    const native = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function(type, ...args) {
      if (/webgl/i.test(type)) return null;
      return native.call(this, type, ...args);
    };
  });
  await page.goto(base.href, {waitUntil: 'networkidle', timeout: 45000});
  await page.waitForFunction(() => window.longRun && window.LR_SCENERY?.ready && !document.querySelector('#start').disabled && !document.querySelector('#splash'));
  if (!fallback) await page.waitForFunction(() => longRun.environment.ready);
  return {page, context, errors, failures};
}
async function scene(page, district, distance, renderer) {
  return page.evaluate(({district, distance, renderer}) => {
    // Freeze a real run at an exact camera location. No production test hooks.
    Cu(false); fu(district); Ko('chapter'); b = 'paused'; SA.pause();
    q.distance = distance; q.chapterDistance = distance;
    q.floorY = q.floorAt(q.x); q.y = q.floorY; q.grounded = true; ir = q.y;
    Kt = T - q.floorY; $i = 0;
    if (renderer === 'webgl') $A.ready = false;
    $A.update(0, q, {id: district, reduced: true, quality: 1});
    vu();
    return {district, distance, renderer: longRun.renderer, environment: longRun.environment,
      scene: LR_SCENERY.inspect(district, distance, eA, kA, 'chapter')};
  }, {district, distance, renderer});
}
try {
  const desktop = await open({width: 1440, height: 900});
  const {page} = desktop;
  const geometry = await page.evaluate(() => {
    const records = [];
    for (const district of ['opening', 'midtown', 'park']) {
      for (const width of [1000, 1320]) {
        for (const mode of ['chapter', 'endless']) {
          for (let distance = 0; distance <= 120000; distance += 1000) {
            records.push({...LR_SCENERY.inspect(district, distance, width, 540, mode), viewportWidth: width});
          }
        }
      }
    }
    return records;
  });
  for (const s of geometry) {
    assert.equal(s.ready, true);
    assert.equal(s.panelCount, s.id === 'opening' ? 4 : 3);
    assert.equal(s.maxSourceWidth <= 1672, true, 'Textures stay within mobile limits');
    assert.ok(s.panels.length > 0, 'Every camera location has a background');
    assert.ok(s.panels[0].x <= 0.001, 'Left edge remains covered');
    const last = s.panels.at(-1);
    assert.ok(last.x + last.width >= s.viewportWidth - 0.001, 'Right edge remains covered');
    assert.equal(s.panels.filter(p => p.original).length <= 1, true);
    assert.equal(s.panels.some(p => p.mirrored), false);
    for (const panel of s.panels) {
      assert.equal(panel.original, panel.sourceIndex === 0);
      if (s.mode === 'chapter') assert.equal(panel.segment, panel.sourceIndex, 'Story never wraps a plate');
      if (panel.segment >= s.panelCount) assert.ok(panel.sourceIndex > 0, 'Endless never repeats the original skyline');
    }
  }
  console.log('[scenery] finite Story and landmark-free Endless geometry passed');
  // Exact beginning, first join, and late-course frames exercise the real Pixi
  // composition and its original/extension textures, not a detached preview.
  for (const district of ['opening', 'midtown', 'park']) {
    const locations = district === 'opening' ? [0, 6500, 25000] : [0, 6000, 19000];
    for (let i = 0; i < locations.length; i++) {
      const snapshot = await scene(page, district, locations[i]);
      assert.equal(snapshot.renderer, 'pixi-webgl');
      assert.equal(snapshot.environment.error, null);
      report.push(snapshot);
      await page.locator('#stage').screenshot({path: `${output}/${district}-${i}-desktop.png`});
    }
  }
  const openingGL = await scene(page, 'opening', 6500, 'webgl');
  assert.equal(openingGL.renderer, 'webgl');
  await page.locator('#stage').screenshot({path: `${output}/opening-webgl.png`});
  assert.deepEqual(desktop.errors, []);
  assert.deepEqual(desktop.failures, []);
  await desktop.context.close();

  const mobile = await open({width: 844, height: 390});
  for (const district of ['opening', 'midtown', 'park']) {
    const snapshot = await scene(mobile.page, district, 6000);
    assert.equal(snapshot.renderer, 'pixi-webgl');
    report.push(snapshot);
    await mobile.page.locator('#stage').screenshot({path: `${output}/${district}-mobile.png`});
  }
  assert.deepEqual(mobile.errors, []);
  assert.deepEqual(mobile.failures, []);
  await mobile.context.close();

  const fallback = await open({width: 1440, height: 900}, true);
  for (const district of ['opening', 'midtown', 'park']) {
    const snapshot = await scene(fallback.page, district, 6500);
    assert.equal(snapshot.renderer, district === 'opening' ? 'canvas-fallback' : 'district-canvas');
    report.push(snapshot);
    await fallback.page.locator('#stage').screenshot({path: `${output}/${district}-canvas.png`});
  }
  assert.deepEqual(fallback.errors, []);
  assert.deepEqual(fallback.failures, []);
  await fallback.context.close();
  await writeFile(`${output}/report.json`, JSON.stringify(report, null, 2));
  console.log('PASS: unique Story panels, no mirrored landmarks, Endless continuation, complete assets, Pixi/WebGL/Canvas paths, desktop and mobile scene captures.');
} finally {
  await browser.close();
}
