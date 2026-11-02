import assert from 'node:assert/strict';
import {mkdir, readFile, writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {fileURLToPath, pathToFileURL} from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const fixturePath = path.join(root, 'tests/fixtures/midtown-v14-layout.json');
const baselineMode = process.env.MIDTOWN_CAPTURE_BASELINE === '1';
const output = process.env.MIDTOWN_OUTPUT || path.join(root, 'review/midtown-v15', baselineMode ? 'before' : 'after');
const url = new URL(process.env.TEST_URL || 'http://127.0.0.1:4181/'); url.searchParams.set('unlock', 'all');
const moduleName = process.env.PLAYWRIGHT_MODULE || 'playwright';
const {chromium} = await import(moduleName.startsWith('/') ? pathToFileURL(moduleName).href : moduleName);
const hash = data => createHash('sha256').update(data).digest('hex');
const lockedFiles = [
  'assets/art-v2/midtown-joju.webp', 'assets/art-v2/midtown-omars.webp',
  'assets/art-v2/midtown-gussy.webp', 'assets/art-v2/midtown-fifth.webp',
  'assets/office-host-v14/host.webp', 'scripts/midtown-storefronts.js',
  'scripts/office-host.js', 'scripts/park-scenery.js', 'scripts/engine.js'
];
const locked = Object.fromEntries(await Promise.all(lockedFiles.map(async file => [file, hash(await readFile(path.join(root, file)))])));
const fixture = baselineMode ? {reference: 'a45b2399415a6c818212aaca7c9a3a4e09268bed', locked, geometry: null, unaffected: null, timelines: {}} : JSON.parse(await readFile(fixturePath, 'utf8'));
if (!baselineMode) assert.deepEqual(locked, fixture.locked, 'Venue artwork, host, game mechanics and Park implementation stay unchanged');
for (const item of JSON.parse(await readFile(path.join(root, 'assets-manifest.json'), 'utf8'))) {
  assert.equal(hash(await readFile(path.join(root, item.path))), item.sha256, `${item.path}: original source preserved`);
}
await mkdir(output, {recursive: true});
const browser = await chromium.launch({executablePath: process.env.CHROMIUM_PATH || '/usr/bin/chromium', headless: true,
  args: ['--no-sandbox', '--disable-dev-shm-usage', '--enable-unsafe-swiftshader']});
const report = {reference: fixture.reference, captures: [], timelines: [], visualReviewRequired: [
  'Warm layered Midtown office depth returns, without duplicate landmark silhouettes.',
  'New building silhouettes and curb contact look natural at every ordinary-street join.',
  'All four venues keep clear full frontages; 505 retains blue/cyan lighting and its grounded host.'
]};
async function open(viewport, deviceScaleFactor) {
  const context = await browser.newContext({viewport, deviceScaleFactor, reducedMotion: 'reduce'});
  const page = await context.newPage(), errors = [], failed = [];
  page.setDefaultTimeout(60000); page.on('pageerror', error => errors.push(error.message));
  page.on('response', response => {if (response.status() >= 400) failed.push(response.url());});
  await page.goto(url.href, {waitUntil: 'networkidle', timeout: 90000});
  await page.waitForFunction(() => window.longRun && LR_SCENERY.ready && longRun.environment.ready && !document.querySelector('#start').disabled && !document.querySelector('#splash'));
  await page.evaluate(() => {const next = requestAnimationFrame.bind(window); window.requestAnimationFrame = () => 0; return new Promise(resolve => next(resolve));});
  return {context, page, errors, failed};
}
async function contracts(page) {
  return page.evaluate(() => {
    const geometry = [];
    for (const W of [864, 960, 1168, 1320]) for (const distance of [...Array.from({length: 20}, (_, i) => i * 1000), 19200]) {
      const scene = LR_SCENERY.layout('midtown', distance, W, 540, 'chapter');
      geometry.push({W, distance, width: scene.width, height: scene.height, stride: scene.stride,
        scroll: scene.scroll, travel: scene.travel, stripWidth: scene.stripWidth, panelCount: scene.panelCount,
        introHold: scene.introHold, introEase: scene.introEase, parallaxRate: scene.parallaxRate,
        venues: LR_SHOPS.inspect(distance, W, 540).items});
    }
    const unaffected = [], canvas = document.createElement('canvas'); canvas.height = 540;
    for (const id of ['opening', 'park']) for (const W of [864, 1168]) for (const distance of [0, 12000, id === 'opening' ? 25920 : 19200]) {
      canvas.width = W; const ctx = canvas.getContext('2d', {willReadFrequently: true});
      LR_SCENERY.draw2d(ctx, id, id === 'park' ? gi.park : Fe, distance, W, 540, 'chapter');
      const pixels = ctx.getImageData(0, 0, W, 540).data;
      let hashA = 2166136261, hashB = 5381;
      for (const value of pixels) {hashA = Math.imul(hashA ^ value, 16777619); hashB = Math.imul(hashB, 33) ^ value;}
      unaffected.push({id, W, distance, hashA: hashA >>> 0, hashB: hashB >>> 0});
    }
    return {geometry, unaffected};
  });
}
async function timeline(page) {
  return page.evaluate(() => {
    Cu(false); fu('midtown'); Ko('chapter'); b = 'paused'; SA.pause(); q.invincible = 10000;
    const marks = {}, frames = [{label: 'start', time: 0, distance: 0}];
    for (let frame = 0; frame < 80 * 120; frame++) {
      const items = LR_SHOPS.inspect(q.distance, eA, kA).items;
      for (const item of items) {
        const entry = marks[item.key] ||= {key: item.key};
        if (!entry.full && item.quad[0][0] >= 20 && item.quad[1][0] <= eA - 20) entry.full = {time: q.time, distance: q.distance};
        if (!entry.hero && item.x <= q.x) entry.hero = {time: q.time, distance: q.distance};
      }
      for (const time of [15, 28, 39, 50, 55.75]) if (frame === Math.round(time * 120)) frames.push({label: `time-${time}`, time: q.time, distance: q.distance});
      q.invincible = 10000; q.floorY = q.floorAt(q.x); q.step(1 / 120);
      if (q.won) break;
    }
    for (const entry of Object.values(marks)) frames.push({label: `${entry.key}-frontage`, ...entry.full});
    return {W: eA, H: kA, heroX: q.x, finishTime: q.time, won: q.won, venues: Object.values(marks), frames};
  });
}
async function render(page, frame) {
  return page.evaluate(frame => {
    Cu(false); fu('midtown'); Ko('chapter'); b = 'paused'; SA.pause();
    for (let i = 0; i < Math.round(frame.time * 120); i++) {q.invincible = 10000; q.floorY = q.floorAt(q.x); q.step(1 / 120);}
    q.floorY = q.floorAt(q.x); q.y = q.floorY; q.grounded = true; ir = q.y; Kt = T - q.floorY; $i = 0;
    $A.update(0, q, {id: 'midtown', reduced: true, quality: 1}); Vu(); vu();
    return {renderer: longRun.renderer, environment: longRun.environment.error, distance: q.distance, time: q.time};
  }, frame);
}
async function artCheck(page) {
  const sources = await Promise.all(['glass-canyon', 'limestone-cafe', 'construction-corner'].map(async (name, i) => ({name, index: i + 6,
    src: 'data:image/webp;base64,' + (await readFile(path.join(root, `assets/midtown-v15/${name}.webp`))).toString('base64')})));
  sources.push({name: 'atmosphere', kind: 'atmosphere', src: 'data:image/webp;base64,' + (await readFile(path.join(root, 'assets/midtown-v15/atmosphere.webp'))).toString('base64')});
  return page.evaluate(async sources => {
    function checksum(data) {let h = 2166136261; for (const x of data) h = Math.imul(h ^ x, 16777619); return h >>> 0;}
    const scene = LR_SCENERY.layout('midtown', 0, 1000, 540, 'chapter'), result = [];
    for (const item of sources) {
      const image = new Image(); image.src = item.src; await image.decode();
      if (item.kind === 'atmosphere') {
        const canvas = document.createElement('canvas'); canvas.width = image.naturalWidth; canvas.height = image.naturalHeight;
        const ctx = canvas.getContext('2d', {willReadFrequently: true}); ctx.drawImage(image, 0, 0);
        const expected = checksum(ctx.getImageData(0, 0, canvas.width, canvas.height).data);
        const actual = LR_SCENERY.source('midtown', {kind: 'atmosphere'});
        ctx.clearRect(0, 0, canvas.width, canvas.height); ctx.drawImage(actual, 0, 0);
        result.push({name: item.name, kind: item.kind, width: actual.naturalWidth || actual.width, height: actual.naturalHeight || actual.height,
          unchangedNativeCrop: expected === checksum(ctx.getImageData(0, 0, canvas.width, canvas.height).data)});
        continue;
      }
      const canvas = document.createElement('canvas'); canvas.width = 1024; canvas.height = 1430;
      const ctx = canvas.getContext('2d', {willReadFrequently: true}), cropTop = scene.cropTops[item.index];
      ctx.drawImage(image, 0, cropTop, 1024, 1430, 0, 0, 1024, 1430);
      const expected = ctx.getImageData(0, 0, 1024, 1430).data;
      const source = LR_SCENERY.source('midtown', {kind: 'architecture', sourceIndex: item.index, cropTop});
      const actual = source.getContext('2d').getImageData(0, 0, 1024, 1430).data;
      let clear = 0, solid = 0, edgeRun = 0;
      for (let p = 3; p < actual.length; p += 4) {if (actual[p] === 0) clear++; if (actual[p] >= 250) solid++;}
      for (const x of [0, 1023]) {let run = 0; for (let y = 0; y < 650; y++) {run = actual[(y * 1024 + x) * 4 + 3] >= 250 ? run + 1 : 0; edgeRun = Math.max(edgeRun, run);}}
      result.push({name: item.name, width: image.naturalWidth, height: image.naturalHeight, cropTop, unchangedNativeCrop: checksum(expected) === checksum(actual), clear, solid, edgeRun});
    }
    return result;
  }, sources);
}
try {
  for (const [name, viewport, dpr] of [['desktop', {width: 1440, height: 900}, 1], ['mobile-dpr2', {width: 844, height: 390}, 2]]) {
    const {context, page, errors, failed} = await open(viewport, dpr);
    if (name === 'desktop') {
      const current = await contracts(page);
      if (baselineMode) Object.assign(fixture, current);
      else {assert.deepEqual(current.geometry, fixture.geometry, 'All 84 camera/venue/host projections match approved v1.4'); assert.deepEqual(current.unaffected, fixture.unaffected, 'Downtown and Park pixels are unchanged at all 12 checkpoints');}
    }
    const current = await timeline(page);
    assert.equal(current.won, true);
    if (baselineMode) fixture.timelines[name] = current;
    else assert.deepEqual(current, fixture.timelines[name], `${name}: venue full-frontage and runner-crossing timings are unchanged`);
    report.timelines.push({name, ...current});
    if (baselineMode) {
      await mkdir(path.dirname(fixturePath), {recursive: true}); await writeFile(fixturePath, JSON.stringify(fixture, null, 2));
      if (name === 'mobile-dpr2') console.log('BASELINE CONTRACTS SAVED: root can change scenery now; remaining before captures use this already-loaded v1.4 page.');
    }
    if (!baselineMode && name === 'desktop') {
      report.native = await artCheck(page);
      for (const art of report.native) {
        assert.equal(art.width, art.kind === 'atmosphere' ? 1536 : 1024); assert.equal(art.height, art.kind === 'atmosphere' ? 1024 : 1536);
        assert.equal(art.unchangedNativeCrop, true, `${art.name}: renderer uses the current native artwork`);
        if (art.kind !== 'atmosphere') {assert.ok(art.clear > 50000 && art.solid > 100000); assert.ok(art.edgeRun < 32, `${art.name}: no severed upper silhouette`);}
      }
    }
    for (const frame of process.env.MIDTOWN_CAPTURE === '0' ? [] : current.frames) {
      const rendered = await render(page, frame);
      assert.equal(rendered.renderer, 'pixi-webgl'); assert.equal(rendered.environment, null);
      const file = `${name}-${frame.label}.png`; await page.screenshot({path: path.join(output, file)});
      report.captures.push({file, name, ...frame, rendered});
    }
    assert.deepEqual(errors, []); assert.deepEqual(failed, []); await context.close();
  }
  await writeFile(path.join(output, 'report.json'), JSON.stringify(report, null, 2));
  console.log(baselineMode ? 'PASS: v1.4 baseline recorded.' : 'PASS: exact venue placement/timing, unchanged Downtown/Park pixels, original assets, native Midtown art and desktop/mobile captures.');
} finally {await browser.close();}
