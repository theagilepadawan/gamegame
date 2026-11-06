import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {mkdir, readFile, writeFile} from 'node:fs/promises';
import {fileURLToPath, pathToFileURL} from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const output = process.env.COHESIVE_OUTPUT || path.join(root, 'review/v18-qa');
const url = new URL(process.env.TEST_URL || 'http://127.0.0.1:4181/'); url.searchParams.set('unlock', 'all');
const fixture = JSON.parse(await readFile(path.join(root, 'tests/fixtures/v18-baseline.json'), 'utf8'));
const hash = data => createHash('sha256').update(data).digest('hex');
for (const [file, expected] of Object.entries({...fixture.assets, ...fixture.modules})) {
  assert.equal(hash(await readFile(path.join(root, file))), expected, `${file}: unaffected production source is preserved`);
}
const engine = await readFile(path.join(root, 'scripts/engine.js'), 'utf8');
for (const segment of fixture.engineSegments) {
  assert.equal(hash(engine.slice(engine.indexOf(segment.start), engine.indexOf(segment.end))), segment.sha256,
    `${segment.name}: original player/boss/terrain simulation and audio behavior are unchanged`);
}
const moduleName = process.env.PLAYWRIGHT_MODULE || 'playwright';
const {chromium} = await import(moduleName.startsWith('/') ? pathToFileURL(moduleName).href : moduleName);
const selection = process.env.COHESIVE_VIEW;
assert.ok(!selection || ['desktop', 'mobile-dpr2', 'canvas'].includes(selection));
await mkdir(output, {recursive: true});
const browser = await chromium.launch({executablePath: process.env.CHROMIUM_PATH || '/usr/bin/chromium', headless: true,
  args: ['--no-sandbox', '--disable-dev-shm-usage', '--enable-unsafe-swiftshader']});
const report = {reference: fixture.reference, url: url.href, unchangedAssets: Object.keys(fixture.assets).length,
  profiles: [], geometry: [], parkPixels: [], motion: [], venues: [], captures: [],
  visualReviewRequired: [
    'Dry continuous streets remain coherent at jump/flight apex; Downtown water stays behind the harbor shoreline.',
    'One WTC appears once in Lower Manhattan; Empire State and Chrysler belong only to Midtown.',
    'Venue fronts are part of the same painted street, without moving bases, transparent islands, duplicate facades or crossed perspective.',
    'Complete 505 blue/cyan glass and office host read at natural architectural scale.',
    'Panorama joins and the anonymous Endless continuation have no severed buildings or water bands.'
  ]};

async function open(name, viewport, fallback, dpr) {
  const context = await browser.newContext({viewport, deviceScaleFactor: dpr, reducedMotion: 'no-preference'});
  const page = await context.newPage(), errors = [], failed = [];
  page.setDefaultTimeout(60000);
  page.on('pageerror', error => errors.push(error.message));
  page.on('response', response => {if (response.status() >= 400) failed.push(`${response.status()} ${response.url()}`);});
  if (fallback) await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function(type, ...args) {return /webgl/i.test(type) ? null : original.call(this, type, ...args);};
  });
  await page.goto(url.href, {waitUntil: 'networkidle', timeout: 90000});
  await page.waitForFunction(() => window.longRun && LR_SCENERY.ready && LR_SHOPS.ready && LR_KABIN.ready && LR_OFFICE_HOST.ready &&
    !document.querySelector('#start').disabled && !document.querySelector('#splash'));
  if (!fallback) await page.waitForFunction(() => longRun.environment.ready);
  await page.evaluate(() => {const next = requestAnimationFrame.bind(window); window.requestAnimationFrame = () => 0; return new Promise(resolve => next(resolve));});
  return {name, page, context, fallback, errors, failed};
}
async function geometry(test) {
  const result = await test.page.evaluate(() => {
    const rows = [], opaque = [], canvas = document.createElement('canvas'); canvas.height = 540;
    for (const id of ['opening', 'midtown']) for (const W of [864, 1168, 1320]) {
      for (const mode of ['chapter', 'endless']) for (const distance of [0, 4000, 10000, 16000, 19200, 25920, 60000, 120000]) {
        rows.push({...LR_SCENERY.inspect(id, distance, W, 540, mode), W});
      }
      for (const distance of [0, 9000, 16000, id === 'opening' ? 25920 : 19200]) {
        canvas.width = W; const ctx = canvas.getContext('2d', {willReadFrequently: true});
        LR_SCENERY.draw2d(ctx, id, id === 'opening' ? Fe : gi.midtown, distance, W, 540, 'chapter');
        const data = ctx.getImageData(0, 0, W, 540).data; let gaps = 0, bottomGaps = 0;
        for (let p = 3; p < data.length; p += 4) if (data[p] < 254) {gaps++; if (Math.floor(p / (W * 4)) > 400) bottomGaps++;}
        opaque.push({id, W, distance, gaps, bottomGaps});
      }
    }
    const park = [];
    for (const W of [864, 1168]) for (const distance of [0, 12000, 19200]) {
      canvas.width = W; const ctx = canvas.getContext('2d', {willReadFrequently: true});
      LR_SCENERY.draw2d(ctx, 'park', gi.park, distance, W, 540, 'chapter');
      let hashA = 2166136261, hashB = 5381;
      for (const value of ctx.getImageData(0, 0, W, 540).data) {hashA = Math.imul(hashA ^ value, 16777619); hashB = Math.imul(hashB, 33) ^ value;}
      park.push({id: 'park', W, distance, hashA: hashA >>> 0, hashB: hashB >>> 0});
    }
    return {rows, opaque, park};
  });
  for (const scene of result.rows) {
    assert.equal(scene.kind, 'panorama'); assert.equal(scene.continuousOpaqueArt, true); assert.equal(scene.ready, true);
    assert.ok(scene.parallaxRate > 0 && scene.parallaxRate <= .12, 'Whole painted city scrolls at a calm bounded rate');
    assert.deepEqual(scene.worldTransform, {scale: scene.artScale, x: -scene.scroll, y: -8});
    assert.equal(scene.panelCount, 2, 'Story uses two complete paintings, not repeated freestanding office blocks');
    assert.ok(scene.panels.length > 0 && scene.panels.length <= 18, 'Visible paintings fit the renderer pool');
    const paintings = scene.panels.filter(panel => panel.kind === 'painting');
    assert.ok(paintings[0].x <= .001 && paintings.at(-1).x + paintings.at(-1).width >= scene.W - .001,
      'All viewport widths and full-course camera positions are covered');
    for (const panel of scene.panels) {
      assert.ok(['painting', 'join'].includes(panel.kind)); assert.equal(panel.y, -8); assert.equal(panel.mirrored, false);
      assert.ok(Math.abs(panel.width / panel.height - panel.sourceWidth / panel.sourceHeight) < 1e-9, 'Native artwork is never stretched');
      assert.ok(Math.abs(panel.x - (panel.worldX - scene.scroll)) < 1e-9, 'Every part of the city shares one camera');
      assert.equal(panel.nativeWidth, panel.kind === 'painting' ? 2172 : 576);
      assert.equal(panel.nativeHeight, scene.id === 'opening' ? 772 : 800);
      assert.equal(panel.paintedHeight, 724, 'Original towers retain their native height above the dry ground extension');
      if (panel.kind === 'join') {
        assert.ok(panel.sourceFilename.endsWith('-join.webp'), 'Join repairs use the reviewed painted transition art');
        continue;
      }
      if (scene.mode === 'chapter') assert.ok(panel.sourceIndex < 2, 'Chapter has no repeating tail');
      if (scene.id === 'opening' && panel.segment >= scene.panelCount) {
        assert.equal(panel.sourceIndex, 2); assert.equal(panel.sourceFilename, 'downtown-tail.webp'); assert.equal(panel.original, false);
      }
      if (scene.id === 'midtown') assert.ok(panel.segment < 2, 'Midtown never recycles its recognizable architecture');
    }
  }
  assert.ok(result.opaque.every(row => row.gaps === 0), `Paintings contain no see-through areas or exposed underlay: ${JSON.stringify(result.opaque.filter(row => row.gaps))}`);
  assert.deepEqual(result.park, fixture.parkPixels, 'Central Park keeps all six exact original backdrop pixel checks');
  report.geometry = result.rows; report.opacity = result.opaque; report.parkPixels = result.park;
  console.log('PASS: coherent opaque panoramas, finite landmarks, calm camera, anonymous Endless tail and unchanged Park pixels.');
}
async function seek(test, district, time) {
  await test.page.evaluate(({district, time}) => {
    Cu(false); fu(district); Ko('chapter'); b = 'paused'; SA.pause();
    for (let frame = 0; frame < Math.round(time * 120); frame++) {q.invincible = 999; q.floorY = q.floorAt(q.x); q.step(1 / 120);}
    q.flight = false; q.transfer = null; q.contrarian = false; q.pickups = []; q.events = []; q.shield = 0;
    q.forcedBounce = 0; q.flipAge = -1; q.resetJumpChain(); q.floorY = q.floorAt(q.x); q.y = q.floorY;
    q.grounded = true; q.vy = 0; q.support = null; q.airJumpAvailable = true; q.release();
    ir = q.y; Kt = T - q.floorY; $i = 0; UA = q.time; b = 'playing'; window.qaNow = au; window.qaMotion = [];
    $A.update(0, q, {id: district, reduced: false, quality: 1}); Vu(); vu();
  }, {district, time});
}
async function capture(test, district, label) {
  const state = await test.page.evaluate(() => {
    q.invincible = 0; Vu(); vu();
    const alpha = b === 'playing' ? $i / (1 / 120) : 1;
    const distance = Math.max(0, q.distance - q.speed * (1 - alpha) / 120), id = q.districtId || 'opening';
    const scene = LR_SCENERY.layout(id, distance, eA, kA, q.mode);
    return {id, scene, cameraY: Kt, renderer: longRun.renderer, water: longRun.environment.active.water, error: longRun.environment.error,
      host: LR_OFFICE_HOST.inspect(), shops: id === 'midtown' ? LR_SHOPS.inspect(distance, eA, kA) : LR_KABIN.spots(distance, eA, kA, q.mode)};
  });
  assert.equal(state.renderer, test.fallback ? district === 'opening' ? 'canvas-fallback' : 'district-canvas' : 'pixi-webgl');
  if (!test.fallback) {assert.equal(state.water, 0); assert.equal(state.error, null);}
  const file = `${test.name}-${district}-${label}.png`;
  if (process.env.COHESIVE_CAPTURE !== '0') await test.page.screenshot({path: path.join(output, file), timeout: 90000});
  report.captures.push({name: test.name, file, label, ...state});
}
async function advance(test, count, action) {
  return test.page.evaluate(({count, action, fallback}) => {
    if (action === 'jump') {q.release(); q.jump();}
    if (action === 'flight') {q.beginFlight({kind: 'cruise', duration: 4}); q.jump();}
    if (action === 'coast') q.release();
    const render = vu;
    try {
      // Keep every real fixed simulation and camera update, rendering selected
      // frames. This avoids hundreds of redundant software-GPU draws in CI.
      vu = () => {};
      for (let frame = 0; frame < count; frame++) {
        q.invincible = 999; Ku(qaNow += 1000 / 60);
        const rendered = qaMotion.length % 12 === 0 || (count >= 12 && frame === count - 1);
        if (rendered) render();
        const alpha = b === 'playing' ? $i / (1 / 120) : 1;
        const distance = Math.max(0, q.distance - q.speed * (1 - alpha) / 120), id = q.districtId || 'opening';
        const scene = LR_SCENERY.layout(id, distance, eA, kA, q.mode);
        const tileError = fallback || id === 'opening' || !rendered ? 0 : Math.max(0, ...scene.panels.map((panel, index) => {
          const tile = $A.tiles[index]; return tile?.group.visible ? Math.max(Math.abs(tile.group.x - panel.x), Math.abs(tile.group.y - panel.y)) : 999;
        }));
        qaMotion.push({id, time: q.time, distance, cameraY: Kt, screenGround: q.floorY + Kt, grounded: q.grounded,
          jumpCount: q.jumpCount, chain: q.jumpChain, flight: !!q.flight, allYFixed: scene.panels.every(panel => panel.y === -8),
          rate: scene.parallaxRate, backgroundLayerY: fallback ? 0 : $A.backgroundLayer.y, rendered, tileError});
      }
    } finally {vu = render;}
    return {grounded: q.grounded, chain: q.jumpChain};
  }, {count, action, fallback: test.fallback});
}
async function motion(test, district) {
  await seek(test, district, 8); await capture(test, district, 'grounded');
  await advance(test, 18, 'jump'); await advance(test, 20, 'jump'); await capture(test, district, 'double-apex');
  await advance(test, 48); await capture(test, district, 'double-landing');
  let frames = await test.page.evaluate(() => qaMotion);
  assert.ok(frames.some(frame => frame.jumpCount === 2), 'Actual double jump was exercised');
  report.motion.push({name: test.name, district, label: 'double', frames});
  if (district === 'midtown') {
    await seek(test, district, 25);
    for (let stage = 1; stage <= 3; stage++) {
      assert.equal((await advance(test, 1, 'jump')).chain, stage, 'Timed grounded jumps build the real triple-jump chain');
      if (stage === 3) {await advance(test, 30); await capture(test, district, 'triple-apex');}
      let landed = false;
      for (let frame = 0; frame < 100; frame += 3) if ((await advance(test, 3)).grounded) {landed = true; break;}
      assert.ok(landed, `Chain jump ${stage} lands`);
    }
    const tripleFrames = await test.page.evaluate(() => qaMotion);
    assert.ok(tripleFrames.some(frame => frame.chain === 3 && frame.screenGround - 422 > 25));
    report.motion.push({name: test.name, district, label: 'triple', frames: tripleFrames});
  }
  await seek(test, district, 18); await advance(test, 65, 'flight'); await capture(test, district, 'jetpack-rise');
  await advance(test, 55, 'coast'); await capture(test, district, 'jetpack-coast');
  frames = await test.page.evaluate(() => qaMotion);
  assert.ok(frames.some(frame => frame.flight && !frame.grounded), 'Actual jetpack flight was exercised');
  report.motion.push({name: test.name, district, label: 'jetpack', frames});
  for (const series of report.motion.filter(series => series.name === test.name && series.district === district)) for (const frame of series.frames) {
    assert.equal(frame.allYFixed, true, `${series.label}: paintings never move vertically with a jump`);
    assert.equal(frame.backgroundLayerY, 0); assert.ok(frame.rate <= .12);
    assert.ok(frame.tileError < .001, `${series.label}: actual Pixi painting tiles share the scenery transform`);
  }
}
async function venueTimeline(test, district) {
  const result = await test.page.evaluate(district => {
    Cu(false); fu(district); Ko('chapter'); b = 'paused'; SA.pause();
    const marks = {}, samples = [], joins = [.8, .5, .2].map(fraction => ({fraction, error: Infinity}));
    for (let frame = 0; frame < 82 * 120; frame++) {
      if (frame % 12 === 0) {
        const scene = LR_SCENERY.layout(district, q.distance, eA, kA, 'chapter');
        const items = district === 'midtown' ? LR_SHOPS.inspect(q.distance, eA, kA).items : LR_KABIN.spots(q.distance, eA, kA, 'chapter');
        for (const join of joins) {const error = Math.abs(scene.stride - scene.scroll - eA * join.fraction); if (error < join.error) Object.assign(join, {error, time: q.time, distance: q.distance});}
        for (const item of items) {
          const rect = item.rect || {x: item.quad[0][0], y: item.quad[0][1], width: item.width, height: item.height};
          const mark = marks[item.key] ||= {key: item.key, worldX: item.worldX, width: rect.width, height: rect.height};
          const sample = {time: q.time, distance: q.distance, rect};
          if (!mark.visible && rect.x + rect.width > 0 && rect.x < eA) mark.visible = sample;
          if (!mark.full && rect.x >= 20 && rect.x + rect.width <= eA - 20) mark.full = sample;
          if (frame % 120 === 0) samples.push({key: item.key, time: q.time, transformError: Math.abs(item.worldX - scene.scroll - (rect.x + rect.width / 2)), renderMode: item.renderMode, fullGlassEntrance: item.fullGlassEntrance});
        }
      }
      q.invincible = 999; q.floorY = q.floorAt(q.x); q.step(1 / 120);
      if (q.won || q.dead) break;
    }
    return {W: eA, H: kA, won: q.won, dead: q.dead, time: q.time, distance: q.distance, marks: Object.values(marks), samples, joins};
  }, district);
  assert.equal(result.dead, false); assert.equal(result.won, true, `${district}: complete real chapter traversal`);
  assert.deepEqual(result.marks.map(mark => mark.key).sort(), (district === 'opening' ? ['kabin', 'lei'] : ['joju', 'omars', 'gussy', 'fifth']).sort());
  for (const mark of result.marks) {
    assert.ok(mark.visible && mark.visible.time > 0, `${mark.key}: no venue at the opening`);
    assert.ok(mark.full && mark.full.time < result.time, `${mark.key}: complete frontage is visible before victory`);
  }
  const ordered = [...result.marks].sort((a, b) => a.worldX - b.worldX);
  for (let i = 1; i < ordered.length; i++) {
    assert.ok(ordered[i].worldX - ordered[i - 1].worldX > (ordered[i].width + ordered[i - 1].width) / 2 + 60,
      'Named venues are separated by ordinary facade space within the shared street');
  }
  for (const sample of result.samples) {
    assert.ok(sample.transformError < .001, 'Venue stays attached to its painting rather than moving on a separate island');
    assert.equal(sample.renderMode, 'painted');
  }
  report.venues.push({name: test.name, district, ...result});
  if (process.env.COHESIVE_CAPTURE !== '0') for (const venue of result.marks) {
    await seek(test, district, Math.min(result.time - .5, venue.full.time + 1));
    await capture(test, district, `${venue.key}-frontage`);
  }
  if (process.env.COHESIVE_CAPTURE !== '0') for (const join of result.joins.filter(join => test.name === 'desktop' || join.fraction === .5)) {
    if (join.error > 5) continue;
    await seek(test, district, join.time); await capture(test, district, `join-${join.fraction}`);
  }
  console.log(`PASS ${test.name} ${district}: same-plane complete venue fronts, delayed reveals and full chapter traversal.`);
}

try {
  for (const [name, viewport, fallback, dpr] of [
    ['desktop', {width: 1440, height: 900}, false, 1], ['mobile-dpr2', {width: 844, height: 390}, false, 2],
    ['canvas', {width: 1440, height: 900}, true, 1]
  ]) {
    if (selection && name !== selection) continue;
    const test = await open(name, viewport, fallback, dpr);
    if (!report.geometry.length) await geometry(test);
    for (const district of ['opening', 'midtown']) {
      await venueTimeline(test, district); await motion(test, district);
      const finish = district === 'opening' ? 74 : 59;
      await seek(test, district, finish); await capture(test, district, 'finish');
    }
    assert.deepEqual(test.errors, []); assert.deepEqual(test.failed, []);
    report.profiles.push({name, renderer: fallback ? 'canvas' : 'pixi', dpr});
    await test.context.close();
    await writeFile(path.join(output, 'report.json'), JSON.stringify(report, null, 2));
    console.log(`PASS ${name}: cohesive city coverage, venue integration, jumps/flight, unchanged gameplay and Park.`);
  }
} finally {await browser.close();}
