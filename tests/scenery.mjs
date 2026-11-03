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
  const context = await browser.newContext({viewport, deviceScaleFactor: viewport.width === 844 ? 2 : 1, reducedMotion: 'reduce'});
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
async function captureStage(page, path) {
  // The stage fills the viewport. Assert that contract before taking the same
  // pixels with a viewport capture: element screenshots add RAF-based stability
  // and scroll checks that can time out under software-WebGL rendering load.
  const frame = await page.locator('#stage').evaluate(element => {
    const rect = element.getBoundingClientRect(), style = getComputedStyle(element);
    return {bounds: {x: rect.x, y: rect.y, width: rect.width, height: rect.height},
      position: style.position, transform: style.transform, animation: style.animationName};
  });
  const viewport = page.viewportSize();
  assert.equal(frame.position, 'fixed', 'Stage remains fixed to the viewport');
  assert.equal(frame.transform, 'none', 'Paused reduced-motion stage does not move');
  assert.equal(frame.animation, 'none', 'Paused reduced-motion stage has no active CSS animation');
  assert.deepEqual(frame.bounds, {x: 0, y: 0, width: viewport.width, height: viewport.height},
    'Viewport screenshot is exactly the stage, without clipping or extra page content');
  await page.screenshot({path});
}
try {
  const desktop = await open({width: 1440, height: 900});
  const {page} = desktop;
  const geometry = await page.evaluate(() => {
    const records = [];
    for (const district of ['opening']) {
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
    assert.ok(s.panelCount >= 6, 'Every chapter has a developed route');
    assert.equal(s.authoredLayers, true);
    assert.equal(s.commonAtmosphere, true);
    assert.equal(s.architectureFeather, 0, 'Architecture must not fade across another painting');
    assert.equal(s.overlap, 0);
    assert.ok(s.nativeHeight >= 1536, 'Artwork retains its newly authored native detail');
    assert.ok(s.layers.length <= 18, 'All visible layers fit the renderer pool');
    const atmosphere = s.layers.filter(layer => layer.kind === 'atmosphere');
    assert.equal(atmosphere.length, 1);
    assert.ok(atmosphere[0].x <= 0, 'Continuous atmosphere covers the left edge');
    assert.ok(atmosphere[0].x + atmosphere[0].width >= s.viewportWidth, 'Continuous atmosphere covers the right edge');
    assert.ok(atmosphere[0].height >= 540);
    const bridges = s.layers.filter(layer => layer.kind === 'bridge');
    assert.ok(bridges.length <= 1, 'Only one complete Brooklyn Bridge is drawn');
    if (s.id !== 'opening' || (s.mode === 'endless' && s.scroll > s.stripWidth)) {
      assert.equal(bridges.length, 0, 'Brooklyn Bridge never reappears in another district or the Endless tail');
    }
    for (const bridge of bridges) {
      assert.ok(bridge.nativeWidth >= 2000 && bridge.nativeHeight >= 700);
      assert.ok(bridge.width > s.width * 2, 'The landmark spans multiple foreground blocks');
    }
    assert.equal(s.layers.some(layer => layer.kind === 'landmark'), false, 'Midtown panorama never leaks into Downtown');
    assert.ok(s.panels.length > 0, 'Every camera location has a background');
    assert.ok((s.panels[0].slotX ?? s.panels[0].x) <= 0.001, 'Logical route slots cover the left edge; atmosphere fills alpha margins');
    const last = s.panels.at(-1);
    assert.ok((last.slotX ?? last.x) + (last.slotWidth ?? last.width) >= s.viewportWidth - 0.001, 'Logical route slots cover the right edge; atmosphere fills alpha margins');
    assert.equal(s.panels.filter(p => p.original).length <= 1, true);
    assert.equal(s.panels.some(p => p.mirrored), false);
    for (const panel of s.panels) {
      assert.equal(panel.original, panel.sourceIndex === s.originalIndex);
      if (s.mode === 'chapter') assert.equal(panel.sourceIndex, s.blocks[panel.segment].sourceIndex, 'Story follows its authored block composition');
      if (panel.segment >= s.panelCount) assert.ok(s.loopSourceIndices.includes(panel.sourceIndex), 'Endless only repeats anonymous tail blocks');
    }
  }
  const legacy = await page.evaluate(() => {
    const records = [];
    for (const district of ['park', 'midtown']) for (const width of [1000, 1320]) {
      for (const mode of ['chapter', 'endless']) for (const distance of [0, 6000, 19000, 120000]) {
        records.push({...LR_SCENERY.inspect(district, distance, width, 540, mode), viewportWidth: width});
      }
    }
    return records;
  });
  for (const scene of legacy) {
    assert.equal(scene.panelCount, 3, `${scene.id} delegates to its three original paintings`);
    assert.equal(scene.maxSourceWidth, 1672);
    assert.equal(scene.parallaxRate, .085, 'The original calm camera remains unchanged');
    assert.ok(Math.abs(scene.overlap - scene.width * 64 / 1672) < 1e-9);
    assert.equal(scene.layers, undefined, 'Legacy paintings are not replaced by foreground architecture');
    assert.ok(scene.panels.length > 0);
    assert.ok(scene.panels[0].x <= .001);
    assert.ok(scene.panels.at(-1).x + scene.panels.at(-1).width >= scene.viewportWidth - .001);
    for (const panel of scene.panels) {
      assert.equal(panel.y, -8, 'Backdrop has a fixed vertical anchor');
      assert.equal(panel.sourceWidth, 1672); assert.equal(panel.sourceHeight, 941);
      assert.equal(panel.mirrored, false);
      if (scene.mode === 'chapter') assert.equal(panel.segment, panel.sourceIndex);
    }
    if (scene.scroll > scene.stripWidth) assert.ok(scene.panels.every(panel => !panel.original), 'Endless tail excludes the original landmark');
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
      await captureStage(page, `${output}/${district}-${i}-desktop.png`);
    }
  }
  const openingGL = await scene(page, 'opening', 6500, 'webgl');
  assert.equal(openingGL.renderer, 'webgl');
  await captureStage(page, `${output}/opening-webgl.png`);
  assert.deepEqual(desktop.errors, []);
  assert.deepEqual(desktop.failures, []);
  await desktop.context.close();

  const mobile = await open({width: 844, height: 390});
  for (const district of ['opening', 'midtown', 'park']) {
    const snapshot = await scene(mobile.page, district, 6000);
    assert.equal(snapshot.renderer, 'pixi-webgl');
    report.push(snapshot);
    assert.equal(await mobile.page.evaluate(() => devicePixelRatio), 2);
    await captureStage(mobile.page, `${output}/${district}-mobile-dpr2.png`);
  }
  assert.deepEqual(mobile.errors, []);
  assert.deepEqual(mobile.failures, []);
  await mobile.context.close();

  const fallback = await open({width: 1440, height: 900}, true);
  for (const district of ['opening', 'midtown', 'park']) {
    const snapshot = await scene(fallback.page, district, 6500);
    assert.equal(snapshot.renderer, district === 'opening' ? 'canvas-fallback' : 'district-canvas');
    report.push(snapshot);
    await captureStage(fallback.page, `${output}/${district}-canvas.png`);
  }
  assert.deepEqual(fallback.errors, []);
  assert.deepEqual(fallback.failures, []);
  await fallback.context.close();
  await writeFile(`${output}/report.json`, JSON.stringify(report, null, 2));
  console.log('PASS: unique Story panels, no mirrored landmarks, Endless continuation, complete assets, Pixi/WebGL/Canvas paths, desktop and mobile scene captures.');
} finally {
  await browser.close();
}
