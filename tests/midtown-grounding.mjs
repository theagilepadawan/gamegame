import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {mkdir, writeFile} from 'node:fs/promises';
import {pathToFileURL} from 'node:url';

const moduleName = process.env.PLAYWRIGHT_MODULE || 'playwright';
const {chromium} = await import(moduleName.startsWith('/') ? pathToFileURL(moduleName).href : moduleName);
const url = new URL(process.env.TEST_URL || 'http://127.0.0.1:4181/'); url.searchParams.set('unlock', 'all');
const output = process.env.GROUNDING_OUTPUT || new URL('../review/midtown-v16-qa/after/', import.meta.url).pathname;
await mkdir(output, {recursive: true});
const browser = await chromium.launch({executablePath: process.env.CHROMIUM_PATH || '/usr/bin/chromium', headless: true,
  args: ['--no-sandbox', '--disable-dev-shm-usage', '--enable-unsafe-swiftshader']});
assert.ok(!process.env.GROUNDING_VIEW || ['desktop', 'mobile-dpr2', 'canvas'].includes(process.env.GROUNDING_VIEW), 'Known grounding viewport');
assert.ok(!process.env.GROUNDING_CASE || ['landmark', 'double', 'triple', 'office', 'flight'].includes(process.env.GROUNDING_CASE), 'Known grounding case');
const report = {url: url.href, selection: {view: process.env.GROUNDING_VIEW || null, case: process.env.GROUNDING_CASE || null}, motion: [], screenshots: [], visualReviewRequired: [
  'No still reflective water band appears between the city curb and the moving playable street.',
  'The street foundation reads as dry masonry/subgrade at jump apex, slope, descent and landing.',
  'The full Empire State silhouette reads as a unique landmark above ordinary offices.',
  '505 blue glass, host feet and all venue artwork follow one shared near-scene camera projection.'
]};
async function open(name, viewport, fallback, dpr) {
  const context = await browser.newContext({viewport, deviceScaleFactor: dpr, reducedMotion: 'no-preference'});
  const page = await context.newPage(), errors = [], failed = [];
  page.setDefaultTimeout(60000);
  page.on('pageerror', error => errors.push(error.message));
  page.on('response', response => {if (response.status() >= 400) failed.push(response.url());});
  if (fallback) await page.addInitScript(() => {
    const native = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function(type, ...args) {return /webgl/i.test(type) ? null : native.call(this, type, ...args);};
  });
  await page.goto(url.href, {waitUntil: 'networkidle', timeout: 90000});
  await page.waitForFunction(() => window.longRun && LR_SCENERY.ready && !document.querySelector('#start').disabled && !document.querySelector('#splash'));
  if (!fallback) await page.waitForFunction(() => longRun.environment.ready);
  // Stop scheduling only. Every frame below still runs the actual production
  // Ku -> physics, event handling, camera easing and renderer path.
  await page.evaluate(() => {const next = requestAnimationFrame.bind(window); window.requestAnimationFrame = () => 0; return new Promise(resolve => next(resolve));});
  return {name, context, page, errors, failed, fallback};
}
async function seek(page, time) {
  await page.evaluate(time => {
    Cu(false); fu('midtown'); Ko('chapter'); b = 'paused'; SA.pause();
    for (let i = 0; i < Math.round(time * 120); i++) {q.invincible = 999; q.floorY = q.floorAt(q.x); q.step(1 / 120);}
    // Establish a safe grounded start at the requested real route position.
    // Physics, terrain, platforms and the camera run unmodified after this.
    q.flight = false; q.transfer = null; q.contrarian = false; q.pickups = []; q.events = []; q.shield = 0;
    q.forcedBounce = 0; q.flipAge = -1; q.resetJumpChain(); q.floorY = q.floorAt(q.x); q.y = q.floorY;
    q.grounded = true; q.vy = 0; q.support = null; q.airJumpAvailable = true; q.release();
    ir = q.y; Kt = T - q.floorY; $i = 0; UA = q.time; b = 'playing';
    window.qaNow = au; window.qaFrame = 0; window.qaMotion = [];
  }, time);
}
async function advance(page, count, action = null) {
  return page.evaluate(({count, action}) => {
    if (action === 'jump') {q.release(); q.jump();}
    if (action === 'flight') {q.beginFlight({kind: 'cruise', duration: 4}); q.jump();}
    if (action === 'coast') q.release();
    for (let i = 0; i < count; i++) {
      q.invincible = 999; Ku(qaNow += 1000 / 60); qaFrame++;
      qaMotion.push({frame: qaFrame, y: q.y, ground: q.floorY, camera: Kt, screenGround: q.floorY + Kt,
        grounded: q.grounded, jumpChain: q.jumpChain, jumpCount: q.jumpCount, flight: !!q.flight});
    }
    return {grounded: q.grounded, vy: q.vy, chain: q.jumpChain, time: q.time};
  }, {count, action});
}
async function snapshot(test, label) {
  const state = await test.page.evaluate(fallback => {
    q.invincible = 0; Vu(); vu();
    const view = LR_SCENERY.projection('midtown', q, Kt);
    const interpolation = b === 'playing' ? $i / (1 / 120) : 1;
    const renderDistance = Math.max(0, q.distance - q.speed * (1 - interpolation) / 120);
    const base = LR_SCENERY.layout('midtown', renderDistance, eA, kA, 'chapter');
    const projected = LR_SCENERY.layout('midtown', renderDistance, eA, kA, 'chapter', view);
    const baseVenues = LR_SHOPS.inspect(renderDistance, eA, kA).items;
    const renderedVenues = LR_SHOPS.inspect(renderDistance, eA, kA, view).items;
    const baseHost = LR_OFFICE_HOST.layout(renderDistance, eA, kA), renderedHost = LR_OFFICE_HOST.inspect();
    const canvas = document.createElement('canvas'); canvas.width = Math.ceil(eA); canvas.height = Math.ceil(kA);
    const ctx = canvas.getContext('2d', {willReadFrequently: true});
    LR_SCENERY.draw2d(ctx, 'midtown', gi.midtown, renderDistance, eA, kA, 'chapter', view);
    const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    let uncovered = 0, sampled = 0;
    for (let y = Math.ceil(kA * .72); y < kA; y += 5) for (let x = 2; x < eA; x += 7) {
      uncovered += pixels[(y * canvas.width + x) * 4 + 3] !== 255 ? 1 : 0; sampled++;
    }
    // Render actual terrain in isolation. Sampling the material away from the
    // curb detects the old cyan/blue fill that read as water below the street.
    const terrain = document.createElement('canvas'); terrain.width = Math.ceil(eA); terrain.height = Math.ceil(kA);
    const tc = terrain.getContext('2d', {willReadFrequently: true});
    const art = Object.create(Object.getPrototypeOf(ut)); art.c = tc;
    tc.translate(0, Kt); art.terrain(q, eA, UA, true);
    let blueExcess = 0, materialSamples = 0, transparentMaterial = 0;
    for (let x = 40; x < eA - 40; x += 37) for (const depth of [55, 85, 115]) {
      const y = Math.round(q.floorAt(x) + Kt + depth); if (y >= kA - 5 || y < 0) continue;
      const c = tc.getImageData(x, y, 1, 1).data;
      blueExcess += c[2] - c[0]; transparentMaterial += c[3] !== 255 ? 1 : 0; materialSamples++;
    }
    const near = projected.layers.filter(p => p.kind === 'architecture' || p.kind === 'tree' || p.kind === 'landmark').map(p => {
      const original = base.layers.find(old => old.id === p.id);
      return {id: p.id, dy: p.y - original.y};
    });
    const landmark = projected.landmark;
    const crownOcclusions = [];
    if (landmark) for (const [name, tip] of [['Empire State', landmark.empireTip], ['Chrysler', landmark.chryslerTip]]) {
      for (const panel of projected.layers.filter(p => p.kind === 'architecture' || p.kind === 'tree')) {
        const image = LR_SCENERY.source('midtown', panel);
        const sample = document.createElement('canvas'); sample.width = image.width || image.naturalWidth; sample.height = image.height || image.naturalHeight;
        const pc = sample.getContext('2d', {willReadFrequently: true}); pc.drawImage(image, 0, 0);
        for (const dy of [10, 35, 75]) {
          const x = (tip[0] - panel.x) / panel.width * sample.width, y = (tip[1] + dy - panel.y) / panel.height * sample.height;
          if (x >= 0 && y >= 0 && x < sample.width && y < sample.height && pc.getImageData(Math.floor(x), Math.floor(y), 1, 1).data[3] > 224) crownOcclusions.push({name, panel: panel.id, dy});
        }
      }
    }
    const actualTiles = fallback ? [] : projected.layers.map((p, i) => ({id: p.id, expectedY: p.y, actualY: $A.tiles[i]?.group.y}));
    return {frame: qaFrame, time: q.time, distance: q.distance, renderDistance, y: q.y, camera: Kt, floor: q.floorY,
      screenGround: q.floorY + Kt, expectedOffset: q.floorY + Kt - T, grounded: q.grounded, jumpCount: q.jumpCount,
      jumpChain: q.jumpChain, flight: !!q.flight, renderer: longRun.renderer, W: eA, H: kA, view, near,
      actualTiles, landmark, crownOcclusions, baseVenues, renderedVenues, baseHost, renderedHost, uncovered, sampled,
      averageBlueExcess: blueExcess / materialSamples, materialSamples, transparentMaterial,
      water: longRun.environment.active.water, error: longRun.environment.error};
  }, test.fallback);
  assert.equal(state.renderer, test.fallback ? 'district-canvas' : 'pixi-webgl');
  assert.ok(Math.abs(state.view.streetOffset - state.expectedOffset) < 1e-6, `${label}: street follows screen-ground camera lift, not raw hill compensation`);
  for (const panel of state.near) assert.ok(Math.abs(panel.dy - state.expectedOffset) < 1e-6, `${label}: ${panel.id} follows the near camera exactly once`);
  for (const tile of state.actualTiles) assert.ok(Math.abs(tile.actualY - tile.expectedY) < 1e-6, `${label}: actual Pixi tile ${tile.id} consumes projected position`);
  for (let i = 0; i < state.baseVenues.length; i++) {
    const a = state.baseVenues[i], z = state.renderedVenues[i];
    assert.equal(a.x, z.x); assert.equal(a.width, z.width); assert.equal(a.segment, z.segment);
    for (let j = 0; j < a.quad.length; j++) assert.ok(Math.abs(z.quad[j][1] - a.quad[j][1] - state.expectedOffset) < 1e-6, `${label}: ${a.key} glazing follows its building`);
  }
  if (state.renderedHost.visible) assert.ok(Math.abs(state.renderedHost.y - state.baseHost.y - state.expectedOffset) < 1e-6, `${label}: host feet share the projected office anchor`);
  if (label === 'landmark-vista') {
    assert.ok(state.landmark && state.landmark.width > state.H * 1.5, 'Landmarks occupy a wide native panorama, not a portrait block');
    for (const [name, tip] of [['Empire State', state.landmark.empireTip], ['Chrysler', state.landmark.chryslerTip]]) {
      assert.ok(tip[0] > 35 && tip[0] < state.W - 35 && tip[1] > 55 && tip[1] < state.H * .6, `${name}: complete crown is inside the readable vista`);
    }
    assert.deepEqual(state.crownOcclusions, [], 'Foreground office blocks do not obscure the landmark crowns at their main reveal');
  }
  assert.equal(state.uncovered, 0, `${label}: city ground covers every sampled lower-viewport pixel during camera motion`);
  assert.equal(state.transparentMaterial, 0, `${label}: physical street foundation remains opaque`);
  assert.ok(state.materialSamples > 4, `${label}: actual visible foundation was sampled`);
  assert.ok(state.averageBlueExcess < 8, `${label}: dry neutral street foundation replaces the former blue water-like fill (${state.averageBlueExcess.toFixed(2)})`);
  if (!test.fallback) {assert.equal(state.water, 0); assert.equal(state.error, null);}
  const file = `${test.name}-${label}.png`;
  if (process.env.GROUNDING_CAPTURE !== '0') await test.page.locator('#stage').screenshot({path: `${output}/${file}`});
  report.screenshots.push({file, label, name: test.name, ...state});
}
async function doubleJump(test, time, name) {
  await seek(test.page, time); await snapshot(test, `${name}-grounded`);
  await advance(test.page, 18, 'jump'); await advance(test.page, 20, 'jump'); await snapshot(test, `${name}-apex`);
  await advance(test.page, 32); await snapshot(test, `${name}-landing`);
  const motion = await test.page.evaluate(() => qaMotion);
  assert.ok(motion.some(s => s.jumpCount === 2), 'The actual air-jump launched');
  assert.ok(motion.some(s => s.grounded), 'The actual jump returned to ground');
  report.motion.push({name: test.name, action: name, frames: motion});
}
async function tripleJump(test) {
  await seek(test.page, 25);
  for (let stage = 1; stage <= 3; stage++) {
    await advance(test.page, 1, 'jump');
    const launched = await test.page.evaluate(() => q.jumpChain);
    assert.equal(launched, stage, `Timed ground jump ${stage} launched through real input`);
    if (stage === 3) {await advance(test.page, 30); await snapshot(test, 'triple-apex');}
    let landed = false;
    for (let frame = 0; frame < 100; frame++) {if ((await advance(test.page, 1)).grounded) {landed = true; break;}}
    assert.ok(landed, `Timed ground jump ${stage} lands`);
  }
  await snapshot(test, 'triple-landing');
  const motion = await test.page.evaluate(() => qaMotion);
  assert.ok(motion.some(s => s.jumpChain === 3 && s.screenGround - 422 > 25), 'Grand jump exercises a substantial real camera lift');
  report.motion.push({name: test.name, action: 'triple', frames: motion});
}
try {
  // Fetch provenance outside the browser inspector: its response cache can
  // evict this 40 MB standalone before page.goto's network-idle wait completes.
  const response = await fetch(url); assert.equal(response.status, 200);
  const html = Buffer.from(await response.arrayBuffer());
  report.artifact = {bytes: html.length, sha256: createHash('sha256').update(html).digest('hex'), embeddedDataAssets: new Set(html.toString().match(/data:[^;,\s]+;base64,[A-Za-z0-9+/=]+/g) || []).size};
  console.log(`Artifact: ${report.artifact.bytes} bytes; SHA-256 ${report.artifact.sha256}; ${report.artifact.embeddedDataAssets} unique embedded data assets.`);
  for (const [name, viewport, fallback, dpr] of [
    ['desktop', {width: 1440, height: 900}, false, 1],
    ['mobile-dpr2', {width: 844, height: 390}, false, 2],
    ['canvas', {width: 1440, height: 900}, true, 1]
  ]) {
    if (process.env.GROUNDING_VIEW && process.env.GROUNDING_VIEW !== name) continue;
    const test = await open(name, viewport, fallback, dpr);
    const selected = process.env.GROUNDING_CASE;
    if (!selected || selected === 'landmark') {await seek(test.page, 12); await snapshot(test, 'landmark-vista');}
    if (!selected || selected === 'double') await doubleJump(test, 9, 'slope-jump');
    if (!selected || selected === 'triple') await tripleJump(test);
    if (!selected || selected === 'office') await doubleJump(test, 54, 'office-jump');
    if (!selected || selected === 'flight') {
      await seek(test.page, 18); await advance(test.page, 65, 'flight'); await snapshot(test, 'jetpack-rise');
      await advance(test.page, 60, 'coast'); await snapshot(test, 'jetpack-coast');
    }
    assert.deepEqual(test.errors, []); assert.deepEqual(test.failed, []);
    await test.context.close();
    console.log(`PASS Midtown grounding ${name}${selected ? ' / ' + selected : ''}: ${selected ? 'selected capture checks' : 'landmark vista, real double/triple jumps and jetpack'}, projected architecture/venues/host, opaque dry ground, renderer composition.`);
  }
  await writeFile(`${output}/report.json`, JSON.stringify(report, null, 2));
} finally {await browser.close();}
