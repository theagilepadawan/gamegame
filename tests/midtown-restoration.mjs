import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {mkdir, readFile, writeFile} from 'node:fs/promises';
import {fileURLToPath, pathToFileURL} from 'node:url';
import path from 'node:path';

// This is a restoration test, not a new visual baseline. The oracle is the
// unmodified scenery module from the last approved painted Midtown, 156db81.
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const output = process.env.RESTORATION_OUTPUT || path.join(root, 'review/midtown-v17-restoration');
const url = new URL(process.env.TEST_URL || 'http://127.0.0.1:4181/'); url.searchParams.set('unlock', 'all');
const hash = data => createHash('sha256').update(data).digest('hex');
const fixture = JSON.parse(await readFile(path.join(root, 'tests/fixtures/midtown-approved-156db81.json'), 'utf8'));
const preserved = JSON.parse(await readFile(path.join(root, 'tests/fixtures/midtown-v14-layout.json'), 'utf8'));
let reference = await readFile(path.join(root, 'tests/fixtures/midtown-approved-156db81.js'), 'utf8');
assert.equal(hash(reference), fixture.moduleSha256, 'The approved historical reference module is unmodified');
for (const [file, sha] of Object.entries(fixture.originals)) {
  assert.equal(hash(await readFile(path.join(root, file))), sha, `${file}: original approved painting retained byte-for-byte`);
}
for (const [file, sha] of Object.entries(preserved.locked)) {
  if (file.startsWith('assets/') || file === 'scripts/park-scenery.js') {
    assert.equal(hash(await readFile(path.join(root, file))), sha, `${file}: approved venue/host art and Park implementation preserved`);
  }
}
// Load the reference independently of production URLs, including when testing
// the distributed standalone HTML. Only its public global name is changed.
for (const file of new Set(reference.match(/assets\/[a-zA-Z0-9_./-]+\.webp/g))) {
  reference = reference.replaceAll(file, `data:image/webp;base64,${(await readFile(path.join(root, file))).toString('base64')}`);
}
reference = reference.replace('window.LR_SCENERY =', 'window.QA_APPROVED_MIDTOWN =');
const original = `data:image/webp;base64,${(await readFile(path.join(root, 'assets/original-34.webp'))).toString('base64')}`;
const moduleName = process.env.PLAYWRIGHT_MODULE || 'playwright';
const {chromium} = await import(moduleName.startsWith('/') ? pathToFileURL(moduleName).href : moduleName);
const selection = process.env.RESTORATION_VIEW;
assert.ok(!selection || ['desktop', 'mobile-dpr2', 'canvas'].includes(selection));
await mkdir(output, {recursive: true});
const browser = await chromium.launch({executablePath: process.env.CHROMIUM_PATH || '/usr/bin/chromium', headless: true,
  args: ['--no-sandbox', '--disable-dev-shm-usage', '--enable-unsafe-swiftshader']});
const report = {reference: fixture.reference, url: url.href, lockedPaintings: fixture.originals, pairs: [], motions: [], timelines: [], captures: [],
  visualReviewRequired: ['Original Midtown skyline, warm painting and slow parallax are restored.',
    'Small high-quality venues are naturally grounded, separated, and retain the complete 505 blue glass entrance.',
    'No jump-linked vertical displacement, new panorama, city-water layer or new office-block strip remains.']};

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
  await page.waitForFunction(() => window.longRun && LR_SCENERY.ready && window.NBIMMidtownScenery?.ready && !document.querySelector('#start').disabled && !document.querySelector('#splash'));
  if (!fallback) await page.waitForFunction(() => longRun.environment.ready);
  await page.evaluate(() => {const next = requestAnimationFrame.bind(window); window.requestAnimationFrame = () => 0; return new Promise(resolve => next(resolve));});
  await page.addScriptTag({content: reference});
  await page.evaluate(async src => {window.qaOriginalMidtown = new Image(); qaOriginalMidtown.src = src; await qaOriginalMidtown.decode();}, original);
  await page.waitForFunction(() => QA_APPROVED_MIDTOWN.ready, null, {polling: 100});
  await page.evaluate(() => {
    window.qaPixelPair = function(distance, W, H, mode, view) {
      const expected = document.createElement('canvas'), actual = document.createElement('canvas');
      expected.width = actual.width = W; expected.height = actual.height = H;
      const ec = expected.getContext('2d', {willReadFrequently: true}), ac = actual.getContext('2d', {willReadFrequently: true});
      QA_APPROVED_MIDTOWN.draw2d(ec, 'midtown', qaOriginalMidtown, distance, W, H, mode);
      LR_SCENERY.draw2d(ac, 'midtown', gi.midtown, distance, W, H, mode, view);
      const e = ec.getImageData(0, 0, W, H).data, a = ac.getImageData(0, 0, W, H).data;
      let mismatchedChannels = 0, maxDifference = 0, checksum = 2166136261;
      for (let p = 0; p < e.length; p++) {const d = Math.abs(e[p] - a[p]); if (d) mismatchedChannels++; maxDifference = Math.max(maxDifference, d); checksum = Math.imul(checksum ^ e[p], 16777619);}
      return {distance, W, H, mode, channels: e.length, mismatchedChannels, maxDifference, checksum: checksum >>> 0};
    };
    window.qaLayoutPair = function(distance, W, H, mode, view) {
      const expected = QA_APPROVED_MIDTOWN.layout('midtown', distance, W, H, mode);
      const actual = LR_SCENERY.layout('midtown', distance, W, H, mode, view);
      const keys = ['id', 'mode', 'width', 'height', 'overlap', 'stride', 'scroll', 'travel', 'stripWidth', 'panelCount', 'originalIndex', 'loopStart', 'initialOffset', 'introHold', 'introEase', 'parallaxRate', 'clamped', 'panels'];
      return {expected, actual: Object.fromEntries(keys.map(key => [key, actual[key]])),
        forbidden: (actual.layers || []).filter(p => ['atmosphere', 'skyline', 'landmark', 'water'].includes(p.kind)).map(p => p.kind)};
    };
  });
  return {name, context, page, fallback, errors, failed};
}

async function compareReference(test) {
  const pairs = await test.page.evaluate(() => {
    const pairs = [];
    for (const W of [864, 1168]) for (const mode of ['chapter', 'endless']) for (const distance of [0, 4000, 9000, 13000, 19200, 42000]) {
      pairs.push({pixels: qaPixelPair(distance, W, 540, mode), layout: qaLayoutPair(distance, W, 540, mode)});
    }
    return pairs;
  });
  for (const pair of pairs) {
    assert.equal(pair.pixels.mismatchedChannels, 0, `${JSON.stringify(pair.pixels)}: exact original backdrop pixels restored`);
    assert.deepEqual(pair.layout.actual, pair.layout.expected, 'Original three-panel geometry, feathering and .085 parallax restored');
    assert.deepEqual(pair.layout.forbidden, [], 'No rejected atmosphere, skyline, panorama or water layer');
  }
  report.pairs.push(...pairs.map(p => p.pixels));
  const unaffected = await test.page.evaluate(() => {
    const result = [], canvas = document.createElement('canvas'); canvas.height = 540;
    for (const id of ['opening', 'park']) for (const W of [864, 1168]) for (const distance of [0, 12000, id === 'opening' ? 25920 : 19200]) {
      canvas.width = W; const ctx = canvas.getContext('2d', {willReadFrequently: true});
      LR_SCENERY.draw2d(ctx, id, id === 'park' ? gi.park : Fe, distance, W, 540, 'chapter');
      let hashA = 2166136261, hashB = 5381;
      for (const value of ctx.getImageData(0, 0, W, 540).data) {hashA = Math.imul(hashA ^ value, 16777619); hashB = Math.imul(hashB, 33) ^ value;}
      result.push({id, W, distance, hashA: hashA >>> 0, hashB: hashB >>> 0});
    }
    return result;
  });
  assert.deepEqual(unaffected, preserved.unaffected, 'All 12 Downtown and Central Park backdrop checkpoints stay unchanged');
  report.unaffected = unaffected;
}

async function seek(page, time) {
  await page.evaluate(time => {
    Cu(false); fu('midtown'); Ko('chapter'); b = 'paused'; SA.pause();
    for (let i = 0; i < Math.round(time * 120); i++) {q.invincible = 999; q.floorY = q.floorAt(q.x); q.step(1 / 120);}
    q.flight = false; q.transfer = null; q.contrarian = false; q.pickups = []; q.events = []; q.shield = 0;
    q.forcedBounce = 0; q.flipAge = -1; q.resetJumpChain(); q.floorY = q.floorAt(q.x); q.y = q.floorY;
    q.grounded = true; q.vy = 0; q.support = null; q.airJumpAvailable = true; q.release();
    ir = q.y; Kt = T - q.floorY; $i = 0; UA = q.time; b = 'playing';
    window.qaNow = au; window.qaFrames = []; vu();
  }, time);
}
async function advance(test, count, action) {
  return test.page.evaluate(({count, action, fallback}) => {
    if (action === 'jump') {q.release(); q.jump();}
    if (action === 'flight') {q.beginFlight({kind: 'cruise', duration: 4}); q.jump();}
    if (action === 'coast') q.release();
    for (let i = 0; i < count; i++) {
      q.invincible = 999; Ku(qaNow += 1000 / 60);
      const alpha = b === 'playing' ? $i / (1 / 120) : 1;
      const distance = Math.max(0, q.distance - q.speed * (1 - alpha) / 120);
      const old = QA_APPROVED_MIDTOWN.layout('midtown', distance, eA, kA, 'chapter');
      const view = LR_SCENERY.projection?.('midtown', q, Kt);
      const actual = LR_SCENERY.layout('midtown', distance, eA, kA, 'chapter', view);
      qaFrames.push({time: q.time, distance, y: q.y, camera: Kt, screenGround: q.floorY + Kt, jumpCount: q.jumpCount,
        chain: q.jumpChain, grounded: q.grounded, flight: !!q.flight, expectedScroll: old.scroll, actualScroll: actual.scroll,
        allYFixed: actual.panels.every(p => p.y === -8), layerY: fallback ? 0 : $A.backgroundLayer.y,
        tileError: fallback ? 0 : Math.max(0, ...old.panels.map((p, index) => {
          const tile = $A.tiles[index]; return tile?.group.visible ? Math.max(Math.abs(tile.group.x - p.x), Math.abs(tile.group.y - p.y)) : 999;
        }))});
    }
    return {grounded: q.grounded, chain: q.jumpChain};
  }, {count, action, fallback: test.fallback});
}
async function snapshot(test, label) {
  const state = await test.page.evaluate(() => {
    q.invincible = 0; Vu(); vu();
    const alpha = b === 'playing' ? $i / (1 / 120) : 1;
    const distance = Math.max(0, q.distance - q.speed * (1 - alpha) / 120);
    const view = LR_SCENERY.projection?.('midtown', q, Kt);
    return {pixels: qaPixelPair(distance, Math.ceil(eA), kA, 'chapter', view), layout: qaLayoutPair(distance, eA, kA, 'chapter', view),
      renderer: longRun.renderer, camera: Kt, water: longRun.environment.active.water, error: longRun.environment.error};
  });
  assert.equal(state.pixels.mismatchedChannels, 0, `${label}: actual camera motion leaves approved painting unchanged`);
  assert.deepEqual(state.layout.actual, state.layout.expected);
  assert.equal(state.renderer, test.fallback ? 'district-canvas' : 'pixi-webgl');
  if (!test.fallback) {assert.equal(state.water, 0); assert.equal(state.error, null);}
  const file = `${test.name}-${label}.png`;
  if (process.env.RESTORATION_CAPTURE !== '0') await test.page.locator('#stage').screenshot({path: path.join(output, file)});
  report.captures.push({file, name: test.name, label, camera: state.camera, pixels: state.pixels});
}
async function validateMotion(test, label, predicate) {
  const frames = await test.page.evaluate(() => qaFrames);
  assert.ok(predicate(frames), `${label}: real movement exercised the intended jump/flight`);
  for (const frame of frames) {
    assert.equal(frame.actualScroll, frame.expectedScroll, `${label}: horizontal background motion matches old .085 camera`);
    assert.equal(frame.allYFixed, true, `${label}: no backdrop vertical displacement`);
    assert.equal(frame.layerY, 0, `${label}: background container remains viewport-fixed`);
    assert.ok(frame.tileError < .001, `${label}: actual Pixi tiles follow original painted backdrop (${frame.tileError})`);
  }
  report.motions.push({name: test.name, label, frames});
}
async function timeline(test) {
  const result = await test.page.evaluate(() => {
    Cu(false); fu('midtown'); Ko('chapter'); b = 'paused'; SA.pause();
    const marks = {};
    for (let frame = 0; frame < 80 * 120; frame++) {
      for (const item of LR_SHOPS.inspect(q.distance, eA, kA).items) {
        const xs = item.quad.map(p => p[0]), left = Math.min(...xs), right = Math.max(...xs);
        const entry = marks[item.key] ||= {key: item.key};
        if (!entry.visible && right > 0 && left < eA) entry.visible = {time: q.time, distance: q.distance};
        if (!entry.full && left >= 20 && right <= eA - 20) entry.full = {time: q.time, distance: q.distance};
      }
      q.invincible = 999; q.floorY = q.floorAt(q.x); q.step(1 / 120); if (q.won) break;
    }
    return {W: eA, H: kA, won: q.won, finishTime: q.time, venues: Object.values(marks)};
  });
  assert.equal(result.won, true);
  const venues = result.venues.filter(v => v.full).sort((a, b) => a.full.time - b.full.time);
  assert.deepEqual(venues.map(v => v.key), ['joju', 'omars', 'gussy', 'fifth'], 'Four full venue frontages appear in chapter order');
  assert.ok(venues[0].visible.time >= 12, 'No venue appears at the opening; the city has time to establish');
  for (let i = 1; i < venues.length; i++) assert.ok(venues[i].full.time - venues[i - 1].full.time >= 8, 'Venues remain well spaced along the route');
  assert.ok(venues.at(-1).full.time < result.finishTime - 1, '505 full glazing is visible before the chapter finishes');
  report.timelines.push({name: test.name, ...result});
  if (process.env.RESTORATION_CAPTURE !== '0') for (const venue of venues) {await seek(test.page, venue.full.time); await snapshot(test, `${venue.key}-frontage`);}
}

try {
  const response = await fetch(url); assert.equal(response.status, 200);
  const html = Buffer.from(await response.arrayBuffer()); report.artifact = {bytes: html.length, sha256: hash(html)};
  for (const [name, viewport, fallback, dpr] of [
    ['desktop', {width: 1440, height: 900}, false, 1],
    ['mobile-dpr2', {width: 844, height: 390}, false, 2],
    ['canvas', {width: 1440, height: 900}, true, 1]
  ]) {
    if (selection && name !== selection) continue;
    const test = await open(name, viewport, fallback, dpr);
    console.log(`Loaded ${name}: production renderer and independent 156db81 reference.`);
    if (!report.pairs.length) {await compareReference(test); console.log('PASS: 24 exact old-backdrop pixel/layout pairs and 12 unchanged Downtown/Park checkpoints.');}
    await timeline(test);
    console.log(`PASS ${name}: complete, delayed and separated venue frontages.`);
    await seek(test.page, 9); await snapshot(test, 'grounded');
    await advance(test, 18, 'jump'); await advance(test, 20, 'jump'); await snapshot(test, 'double-apex');
    await advance(test, 45); await snapshot(test, 'double-landing');
    await validateMotion(test, 'double', frames => frames.some(f => f.jumpCount === 2) && frames.some(f => f.grounded));
    await seek(test.page, 25);
    for (let stage = 1; stage <= 3; stage++) {
      assert.equal((await advance(test, 1, 'jump')).chain, stage);
      if (stage === 3) {await advance(test, 30); await snapshot(test, 'triple-apex');}
      let landed = false;
      for (let frame = 0; frame < 100; frame++) if ((await advance(test, 1)).grounded) {landed = true; break;}
      assert.equal(landed, true, `Chain jump ${stage} lands`);
    }
    await validateMotion(test, 'triple', frames => frames.some(f => f.chain === 3 && f.screenGround - 422 > 25));
    await seek(test.page, 18); await advance(test, 65, 'flight'); await snapshot(test, 'jetpack-rise');
    await advance(test, 60, 'coast'); await snapshot(test, 'jetpack-coast');
    await validateMotion(test, 'jetpack', frames => frames.some(f => f.flight && !f.grounded));
    assert.deepEqual(test.errors, []); assert.deepEqual(test.failed, []);
    await test.context.close();
    console.log(`PASS ${name}: exact approved backdrop; fixed vertical camera; old horizontal parallax; spaced complete venues; real double/triple jumps and flight.`);
  }
  await writeFile(path.join(output, 'report.json'), JSON.stringify(report, null, 2));
} finally {await browser.close();}
