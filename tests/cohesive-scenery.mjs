import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {mkdir, readFile, writeFile} from 'node:fs/promises';
import {fileURLToPath, pathToFileURL} from 'node:url';
import path from 'node:path';
import {model, storyState} from './endless-fairness.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const output = process.env.COHESIVE_OUTPUT || path.join(root, 'review/v19-qa');
const url = new URL(process.env.TEST_URL || 'http://127.0.0.1:4181/'); url.searchParams.set('unlock', 'all');
const fixture = JSON.parse(await readFile(path.join(root, 'tests/fixtures/v18-baseline.json'), 'utf8'));
const retained = JSON.parse(await readFile(path.join(root, 'tests/fixtures/v19-preservation.json'), 'utf8'));
const storyBaseline = JSON.parse(await readFile(path.join(root, 'tests/fixtures/endless-story-preservation-v19.json'), 'utf8'));
const hash = data => createHash('sha256').update(data).digest('hex');
// The Endless director intentionally changes its wrapper and three dispatch
// points in the model. Keep all other module/asset guards and pin unchanged
// physics/audio ranges separately from the renderer and Endless integration.
const unchangedModules = Object.fromEntries(Object.entries(fixture.modules).filter(([file]) => file !== 'scripts/endless.js'));
for (const [file, expected] of Object.entries({...fixture.assets, ...unchangedModules, ...retained.unchangedProps})) {
  assert.equal(hash(await readFile(path.join(root, file))), expected, `${file}: unaffected production source is preserved`);
}
const engine = await readFile(path.join(root, 'scripts/engine.js'), 'utf8');
for (const segment of storyBaseline.sourceRanges) {
  const from = engine.indexOf(segment.start), to = engine.indexOf(segment.end, from + segment.start.length);
  assert.ok(from >= 0 && to > from, `${segment.name}: preserved source boundaries exist`);
  assert.equal(hash(engine.slice(from, to)), segment.sha256, `${segment.name}: original v19 implementation is unchanged`);
}
const storyModel = model(engine, await readFile(path.join(root, 'scripts/endless.js'), 'utf8'),
  await readFile(path.join(root, 'scripts/endless-generator.js'), 'utf8'));
for (const sample of storyBaseline.cases) {
  assert.equal(storyState(storyModel, sample.seed, sample.width, sample.character), sample.sha256,
    `Story model remains unchanged for ${sample.character}, width ${sample.width}, seed ${sample.seed}`);
}
console.log(`PASS preservation: ${Object.keys(fixture.assets).length} original assets, ${Object.keys(unchangedModules).length} modules, ${storyBaseline.sourceRanges.length} physics/audio ranges and ${storyBaseline.cases.length} Story snapshots.`);
if (process.env.COHESIVE_PRESERVATION_ONLY === '1') process.exit(0);
const moduleName = process.env.PLAYWRIGHT_MODULE || 'playwright';
const {chromium} = await import(moduleName.startsWith('/') ? pathToFileURL(moduleName).href : moduleName);
const selection = process.env.COHESIVE_VIEW;
assert.ok(!selection || ['desktop', 'compact', 'mobile-dpr2', 'canvas', 'detail-1080', 'detail-1080-dpr2'].includes(selection));
await mkdir(output, {recursive: true});
const browser = await chromium.launch({executablePath: process.env.CHROMIUM_PATH || '/usr/bin/chromium', headless: true,
  args: ['--no-sandbox', '--disable-dev-shm-usage', '--enable-unsafe-swiftshader']});
const report = {reference: fixture.reference, url: url.href, unchangedAssets: Object.keys(fixture.assets).length,
  profiles: [], geometry: [], parkPixels: [], motion: [], venues: [], captures: [], nativeDetail: [], cacheReuse: [],
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
  if (!fallback) await page.addInitScript(() => {
    window.qaTextureUploads = [];
    for (const name of ['WebGLRenderingContext', 'WebGL2RenderingContext']) {
      const proto = window[name]?.prototype;
      if (!proto) continue;
      const original = proto.texImage2D;
      proto.texImage2D = function(...args) {
        const input = args.length === 6 ? args[5] : null;
        const width = input?.naturalWidth || input?.width || (args.length >= 9 ? args[3] : 0);
        const height = input?.naturalHeight || input?.height || (args.length >= 9 ? args[4] : 0);
        if (width >= 1000 && height >= 1000) window.qaTextureUploads.push({context: this.canvas?.id || '', width, height});
        return original.apply(this, args);
      };
    }
  });
  if (fallback) await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function(type, ...args) {return /webgl/i.test(type) ? null : original.call(this, type, ...args);};
  });
  await page.goto(url.href, {waitUntil: 'networkidle', timeout: 90000});
  await page.waitForFunction(() => window.longRun && LR_SCENERY.ready && LR_SHOPS.ready && LR_KABIN.ready && LR_OFFICE_HOST.ready &&
    !document.querySelector('#start').disabled && !document.querySelector('#splash'));
  if (!fallback) await page.waitForFunction(() => longRun.environment.ready);
  await page.evaluate(() => {const next = requestAnimationFrame.bind(window); window.requestAnimationFrame = () => 0; window.qaPanelAnchors = {}; return new Promise(resolve => next(resolve));});
  return {name, page, context, fallback, errors, failed};
}
async function geometry(test) {
  const result = await test.page.evaluate(() => {
    const rows = [], opaque = [], canvas = document.createElement('canvas'); canvas.height = 540;
    for (const id of ['opening', 'midtown']) for (const W of [540, 864, 960, 1168, 1320, 1440]) {
      for (const mode of ['chapter', 'endless']) for (const distance of [0, 4000, 10000, 16000, 19200, 25920, 60000, 120000, 1000000]) {
        rows.push({...LR_SCENERY.inspect(id, distance, W, 540, mode), W});
      }
      const samples = [0, 9000, 16000, id === 'opening' ? 25920 : 19200].map(distance => ({distance, mode: 'chapter'}));
      if (id === 'opening') samples.push(...[60000, 120000, 1000000].map(distance => ({distance, mode: 'endless'})));
      for (const {distance, mode} of samples) {
        canvas.width = W; const ctx = canvas.getContext('2d', {willReadFrequently: true});
        LR_SCENERY.draw2d(ctx, id, id === 'opening' ? Fe : gi.midtown, distance, W, 540, mode);
        const data = ctx.getImageData(0, 0, W, 540).data; let gaps = 0, bottomGaps = 0;
        for (let p = 3; p < data.length; p += 4) if (data[p] < 254) {gaps++; if (Math.floor(p / (W * 4)) > 400) bottomGaps++;}
        opaque.push({id, W, distance, mode, gaps, bottomGaps});
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
    const starts = ['opening', 'midtown'].flatMap(id => [540, 864, 1440].map(W => {
      const first = LR_SCENERY.layout(id, 0, W, 540, 'chapter');
      const next = LR_SCENERY.layout(id, 1, W, 540, 'chapter');
      return {id, W, first: first.scroll, next: next.scroll};
    }));
    const venueAnchors = [0, 4000, 9000, 16000].map(distance => {
      const scene = LR_SCENERY.layout('midtown', distance, 864, 540, 'chapter');
      return {distance, anchors: scene.blocks.filter(block => [5,8,11,14].includes(block.sourceIndex))};
    });
    return {rows, opaque, park, starts, venueAnchors};
  });
  const nativeAnchors = new Map();
  for (const scene of result.rows) {
    assert.equal(scene.kind, 'panorama'); assert.equal(scene.continuousOpaqueArt, true); assert.equal(scene.ready, true);
    assert.ok(scene.parallaxRate > 0 && scene.parallaxRate <= (scene.id === 'midtown' ? .25 : scene.W < 864 && scene.mode === 'chapter' ? .165 : .15), 'A single bounded camera moves the complete street');
    assert.deepEqual(scene.worldTransform, {scale: scene.artScale, x: -scene.scroll, y: -8});
    assert.equal(scene.panelCount, scene.id === 'midtown' ? 16 : 12, 'Story has enough native street blocks to separate its venues');
    assert.ok(scene.panels.length > 0 && scene.panels.length <= 18, 'Visible paintings fit the renderer pool');
    assert.ok(scene.cachedSourceCount <= scene.sourceCacheLimit && scene.sourceCacheLimit <= 12, 'Native bitmap cache stays bounded');
    const paintings = scene.panels.filter(panel => panel.kind === 'painting');
    const atmosphere = scene.panels.find(panel => panel.vistaSource === 'atmosphere');
    assert.ok(atmosphere ? atmosphere.x <= .001 && atmosphere.x + atmosphere.width >= scene.W - .001 :
      paintings.length && paintings[0].x <= .001 && paintings.at(-1).x + paintings.at(-1).width >= scene.W - .001,
      'All viewport widths and full-course camera positions are covered');
    if (scene.id === 'midtown') {
      assert.equal(scene.cityVistas, true, 'The actual v1.6 spatial composition is integrated');
      assert.deepEqual(scene.retainedVenueSources, [5,8,11,14]);
      assert.ok(scene.panels.filter(panel => panel.vistaSource === 'landmarks').length <= 1, 'The landmark panorama occurs once');
      assert.ok(paintings.every(panel => panel.sourceIndex >= 4), 'The former Empire/Chrysler panels never duplicate the restored landmarks');
    }
    if (scene.id === 'opening' && scene.mode === 'endless') {
      assert.deepEqual(scene.repeatSourceIndices, [4, 6, 7, 8, 9, 10], 'Endless uses six ordinary blocks, never venues or hero landmarks');
      assert.equal(new Set(paintings.map(panel => panel.sourceIndex)).size, paintings.length, 'One viewport never repeats the same background building');
    }
    for (const panel of scene.panels) {
      assert.ok(['painting', 'join', 'city-vista'].includes(panel.kind)); assert.equal(panel.mirrored, false);
      const anchorKey = `${scene.id}:${panel.kind}:${panel.sourceFilename}`;
      if (!nativeAnchors.has(anchorKey)) nativeAnchors.set(anchorKey, panel.y);
      assert.equal(panel.y, nativeAnchors.get(anchorKey), 'Native curb registration is fixed across camera positions and viewport widths');
      if (panel.kind === 'city-vista') {
        assert.equal(scene.id, 'midtown');
        assert.ok(['atmosphere','landmarks','glass','library','tree'].includes(panel.vistaSource));
        assert.ok(panel.sourceWidth >= 1024 && panel.paintedHeight >= 1024, 'Restored art retains its real original resolution');
        assert.equal(panel.sourceOffsetY, 0);
        if (!panel.viewportAtmosphere) assert.ok(Math.abs(panel.width / panel.height - panel.sourceWidth / panel.sourceHeight) < 1e-9,
          'Foreground architecture and landmarks retain their native proportions');
        if (panel.vistaSource === 'landmarks') assert.ok(Math.abs(panel.x - (panel.worldX - scene.scroll * .82)) < 1e-9,
          'The one distant landmark panorama moves at its authored depth');
        if (panel.viewportAtmosphere) assert.ok(panel.y + panel.height >= 540, 'Dry atmosphere covers the whole frame, including the lower road pad');
        continue;
      }
      assert.ok(Math.abs(panel.width / panel.height - panel.sourceWidth / panel.sourceHeight) < 1e-9, 'Native artwork is never stretched');
      assert.ok(Math.abs(panel.x - (panel.worldX - scene.scroll)) < 1e-9, 'Every part of the near city shares one camera');
      if (panel.kind === 'painting') assert.equal(panel.nativeWidth, 1024);
      assert.ok(panel.nativeHeight >= 1680);
      assert.ok(panel.sourceOffsetY >= 0 && panel.sourceOffsetY + panel.paintedHeight <= panel.nativeHeight,
        'Vertical alignment keeps every original painted row inside the bitmap');
      if (panel.kind === 'painting') assert.equal(panel.paintedHeight, 1536, 'Full native painted detail survives above the dry ground extension');
      else assert.ok(panel.paintedHeight >= 1536, 'Join repairs do not reintroduce low-resolution strips');
      if (panel.kind === 'join') {
        assert.ok(Number.isInteger(panel.joinIndex) && panel.joinIndex >= 0, 'A native repair references its own decoded source');
        continue;
      }
      if (scene.mode === 'chapter') assert.ok(panel.sourceIndex < scene.panelCount, 'Chapter has no repeating tail');
      if (scene.id === 'opening' && panel.segment >= scene.panelCount) {
        assert.ok([4, 6, 7, 8, 9, 10].includes(panel.sourceIndex), 'Only ordinary street blocks continue in Endless');
        assert.equal(panel.original, false);
      }
      if (scene.id === 'midtown') assert.ok(panel.segment < scene.panelCount, 'Midtown never recycles its recognizable architecture');
    }
  }
  assert.ok(result.opaque.every(row => row.gaps === 0), `Paintings contain no see-through areas or exposed underlay: ${JSON.stringify(result.opaque.filter(row => row.gaps))}`);
  for (const start of result.starts) assert.ok(start.next > start.first, `${start.id}/${start.W}: the camera moves from the first running step`);
  const fixedVenues = result.venueAnchors[0].anchors;
  assert.deepEqual(fixedVenues.map(block => block.sourceIndex), [5,8,11,14]);
  for (const sample of result.venueAnchors) assert.deepEqual(sample.anchors, fixedVenues, 'Current venue frontages keep their native anchor metadata through the restored vistas');
  assert.deepEqual(result.park, fixture.parkPixels, 'Central Park keeps all six exact original backdrop pixel checks');
  report.geometry = result.rows; report.opacity = result.opaque; report.parkPixels = result.park;
  console.log('PASS: coherent opaque panoramas, finite landmarks, calm camera, anonymous Endless tail and unchanged Park pixels.');
}
async function nativeResolution(test) {
  const rows = [];
  for (const [district, time] of [['opening', 30], ['midtown', 8], ['midtown', 35]]) {
    await seek(test, district, time);
    const result = await test.page.evaluate(({district, fallback}) => {
      const stage = document.querySelector('#stage').getBoundingClientRect();
      const distance = Math.max(0, q.distance - q.speed / 120);
      const scene = LR_SCENERY.layout(district, distance, eA, kA, 'chapter');
      const allOriginals = district === 'midtown' ? NBIMMidtownScenery.images : LR_SCENERY.images;
      const originals = allOriginals.slice(0, scene.sourceCount);
      const decoded = originals.map(image => ({width: image.naturalWidth, height: image.naturalHeight}));
      const sourceRows = [];
      for (const panel of scene.panels) {
        const bitmap = LR_SCENERY.source(district, panel);
        const original = panel.kind === 'city-vista' ? LR_CITY_VISTAS.sourceImage(panel.vistaSource) : panel.kind === 'join' ? allOriginals[scene.sourceCount + panel.joinIndex] : originals[panel.sourceIndex];
        const reference = document.createElement('canvas'); reference.width = original.naturalWidth; reference.height = original.naturalHeight;
        const ctx = reference.getContext('2d', {willReadFrequently: true}); ctx.drawImage(original, 0, 0);
        let actual;
        if (bitmap.getContext) actual = bitmap.getContext('2d', {willReadFrequently: true});
        else { const native = document.createElement('canvas'); native.width = bitmap.naturalWidth; native.height = bitmap.naturalHeight;
          actual = native.getContext('2d', {willReadFrequently:true}); actual.drawImage(bitmap, 0, 0); }
        let mismatches = 0, compared = 0;
        // Three detailed interior patches avoid the intentional64px edge feather.
        // Exact pixels catch a hidden resize even if a later canvas is enlarged.
        for (const [x, y] of [[96, 160], [Math.floor(original.naturalWidth / 2) - 64, Math.floor(original.naturalHeight / 2) - 64], [original.naturalWidth - 224, original.naturalHeight - 376]]) {
          const expected = ctx.getImageData(x, y, 128, 128).data;
          const obtained = actual.getImageData(x, y + panel.sourceOffsetY, 128, 128).data;
          for (let i = 0; i < expected.length; i++) {compared++; if (expected[i] !== obtained[i]) mismatches++;}
        }
        const physicalScale = stage.height / kA * EQ;
        const physicalPixelsPerSourcePixel = panel.width / bitmap.width * physicalScale;
        sourceRows.push({kind: panel.kind, vistaSource: panel.vistaSource, sourceIndex: panel.sourceIndex, filename: panel.sourceFilename,
          decoded: {width: original.naturalWidth, height: original.naturalHeight},
          cached: {width: bitmap.width, height: bitmap.height}, expectedCache: {width: panel.sourceWidth, height: panel.nativeHeight},
          sourceOffsetY: panel.sourceOffsetY, mismatches, compared,
          physicalPixelsPerSourcePixel, nativePixelsPerPhysicalPixel: 1 / physicalPixelsPerSourcePixel,
          improvementOverV18: (556 / (district === 'midtown' ? 800 : 772) * physicalScale) / physicalPixelsPerSourcePixel});
      }
      const gpu = fallback || district === 'opening' ? [] : scene.panels.map((panel, i) => {
        const tile = $A.tiles[i]; return {kind: panel.kind, visible: tile.group.visible,
          width: tile.sprite.texture.width, height: tile.sprite.texture.height,
          sourceWidth: tile.sprite.texture.source.width, sourceHeight: tile.sprite.texture.source.height,
          expectedWidth: panel.sourceWidth, expectedHeight: panel.nativeHeight};
      });
      return {district, decoded, sourceRows, gpu, viewport: {width: innerWidth, height: innerHeight},
        devicePixelRatio, EQ, canvas: {width: ht.width, height: ht.height},
        rendererCanvas: fallback ? null : {width: $A.renderer.canvas.width, height: $A.renderer.canvas.height},
        uploads: (window.qaTextureUploads || []).filter(upload => upload.width === 1024 && upload.height >= 1680),
        nativeUploads: window.qaTextureUploads || [],
        maximumTexture: fallback ? null : $A.renderer.gl.getParameter($A.renderer.gl.MAX_TEXTURE_SIZE)};
    }, {district, fallback: test.fallback});
    assert.ok(result.decoded.length >= (district === 'midtown' ? 16 : 12));
    assert.ok(result.decoded.every(image => image.width === 1024 && image.height === 1536), 'Every city plate is real native portrait artwork');
    assert.ok(result.sourceRows.length > 0);
    for (const image of result.sourceRows) {
      assert.deepEqual(image.cached, image.expectedCache, 'The renderer keeps native bitmap dimensions through alignment');
      assert.equal(image.cached.width, image.decoded.width);
      assert.ok(image.cached.height >= (image.kind === 'city-vista' ? image.decoded.height : 1680));
      if (image.kind === 'painting') assert.equal(image.cached.width, 1024);
      assert.ok(image.sourceOffsetY + image.decoded.height <= image.cached.height, 'All original rows survive registration');
      assert.equal(image.mismatches, 0, `${image.filename}: native detail must survive caching without resampling`);
      if (image.kind !== 'city-vista') assert.ok(image.improvementOverV18 >= 2.05, 'Current native plates retain their more-than2× sampling improvement');
      else if (image.vistaSource === 'landmarks') {
        assert.deepEqual(image.decoded, {width:1536,height:1024}, 'The approved wide landmark source reaches the renderer at its full original resolution');
        assert.ok(image.improvementOverV18 >= 1.45, 'The broad original vista retains its measured native sampling density');
      } else if (image.vistaSource !== 'atmosphere') assert.ok(image.improvementOverV18 >= 2.05,
        'Restored native foreground cutouts retain the same dense sampling as current venue fronts');
    }
    for (const texture of result.gpu) {
      assert.equal(texture.visible, true);
      assert.deepEqual([texture.width, texture.height, texture.sourceWidth, texture.sourceHeight],
        [texture.expectedWidth, texture.expectedHeight, texture.expectedWidth, texture.expectedHeight], 'Pixi uploads native art, not a logical-sized thumbnail');
      if (texture.kind === 'city-vista') assert.ok(result.nativeUploads.some(upload =>
        upload.width === texture.expectedWidth && upload.height === texture.expectedHeight),
      'Instrumented WebGL calls upload the restored vista at its complete native dimensions');
    }
    if (!test.fallback) {
      assert.deepEqual(result.rendererCanvas, result.canvas);
      assert.ok(result.uploads.length > 0, 'Actual WebGL uploads include the full native scenery bitmap');
    }
    if (test.name.startsWith('detail-1080')) {
      const expectedDpr = test.name.endsWith('dpr2') ? 2 : 1;
      assert.equal(result.EQ, expectedDpr, 'Resolution evidence uses the requested physical framebuffer');
      assert.deepEqual(result.canvas, {width: 1920 * expectedDpr, height: 1080 * expectedDpr});
    }
    rows.push(result);
    if (test.name.startsWith('detail-1080')) await capture(test, district, 'native-detail');
  }
  report.nativeDetail.push({name: test.name, rows});
  console.log(`PASS ${test.name}: native decoded pixels, cached bitmaps, physical sampling and GPU texture dimensions.`);
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
        for (const panel of scene.panels) {const key = `${id}:${panel.kind}:${panel.sourceFilename}`; if (!(key in qaPanelAnchors)) qaPanelAnchors[key] = panel.y;}
        qaMotion.push({id, W: eA, time: q.time, distance, cameraY: Kt, screenGround: q.floorY + Kt, grounded: q.grounded,
          jumpCount: q.jumpCount, chain: q.jumpChain, flight: !!q.flight,
          allYFixed: scene.panels.every(panel => panel.y === qaPanelAnchors[`${id}:${panel.kind}:${panel.sourceFilename}`]),
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
    assert.equal(frame.backgroundLayerY, 0); assert.ok(frame.rate <= (district === 'midtown' ? .25 : frame.W < 864 ? .165 : .15));
    assert.ok(frame.tileError < .001, `${series.label}: actual Pixi painting tiles share the scenery transform`);
  }
}
async function venueTimeline(test, district) {
  const result = await test.page.evaluate(({district, fallback}) => {
    Cu(false); fu(district); Ko('chapter'); b = 'paused'; SA.pause();
    const initial = LR_SCENERY.layout(district, 0, eA, kA, 'chapter');
    const marks = {}, samples = [], occupancy = [], wideOccupancy = [], wideMarks = {}, cacheSamples = [];
    const joins = initial.blocks.slice(1).map(block => ({boundary: block.segment, worldX: block.worldX, error: Infinity}));
    for (let frame = 0; frame < 82 * 120; frame++) {
      if (frame % 360 === 0) {
        ir = q.y; Kt = T - q.floorY; $i = 0; UA = q.time;
        $A.update(0, q, {id: district, reduced: true, quality: 1}); Vu(); vu();
        const cache = LR_SCENERY.inspect(district, q.distance, eA, kA, 'chapter');
        cacheSamples.push({time: q.time, cpu: cache.cachedSourceCount, cpuLimit: cache.sourceCacheLimit,
          raw: cache.rawTextureCacheCount, rawLimit: cache.rawTextureCacheLimit,
          pixi: fallback ? 0 : ($A.sceneryTextures?.size || 0)});
      }
      if (frame % 12 === 0) {
        const scene = LR_SCENERY.layout(district, q.distance, eA, kA, 'chapter');
        const items = district === 'midtown' ? LR_SHOPS.inspect(q.distance, eA, kA).items : LR_KABIN.spots(q.distance, eA, kA, 'chapter');
        for (const join of joins) {const error = Math.abs(join.worldX - scene.scroll - eA / 2); if (error < join.error) Object.assign(join, {error, time: q.time, distance: q.distance});}
        const rectangles = items.map(item => ({key: item.key, ...(item.rect || {x: item.quad[0][0], y: item.quad[0][1], width: item.width, height: item.height})}));
        occupancy.push({time: q.time,
          visible: rectangles.filter(rect => rect.x < eA && rect.x + rect.width > 0).map(rect => rect.key),
          fullyVisible: rectangles.filter(rect => rect.x >= 0 && rect.x + rect.width <= eA).map(rect => rect.key)});
        const wideItems = district === 'midtown' ? LR_SHOPS.inspect(q.distance, 1440, kA).items : LR_KABIN.spots(q.distance, 1440, kA, 'chapter');
        const wideRects = wideItems.map(item => ({key: item.key, ...item.rect}));
        wideOccupancy.push({time: q.time, visible: wideRects.filter(rect => rect.x < 1440 && rect.x + rect.width > 0).map(rect => rect.key)});
        for (const rect of wideRects) {
          const mark = wideMarks[rect.key] ||= {key: rect.key};
          if (mark.entry === undefined && rect.x < 1440 && rect.x + rect.width > 0) mark.entry = q.time;
          if (mark.full === undefined && rect.x >= 20 && rect.x + rect.width <= 1420) mark.full = q.time;
        }
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
    return {W: eA, H: kA, won: q.won, dead: q.dead, time: q.time, distance: q.distance, marks: Object.values(marks), samples, joins, occupancy, wideOccupancy, wideMarks: Object.values(wideMarks), cacheSamples};
  }, {district, fallback: test.fallback});
  await writeFile(path.join(output, `${test.name}-${district}-timeline.json`), JSON.stringify(result, null, 2));
  assert.equal(result.dead, false); assert.equal(result.won, true, `${district}: complete real chapter traversal`);
  assert.deepEqual(result.marks.map(mark => mark.key).sort(), (district === 'opening' ? ['kabin', 'lei'] : ['joju', 'omars', 'gussy', 'fifth']).sort());
  for (const mark of result.marks) {
    assert.ok(mark.visible && mark.visible.time >= 8, `${mark.key}: the Easter egg arrives after an ordinary opening stretch`);
    assert.ok(mark.full && mark.full.time < result.time, `${mark.key}: complete frontage is visible before victory`);
  }
  const ordered = [...result.marks].sort((a, b) => a.worldX - b.worldX);
  for (let i = 1; i < ordered.length; i++) {
    const centers = ordered[i].worldX - ordered[i - 1].worldX;
    const ordinaryStreet = centers - (ordered[i].width + ordered[i - 1].width) / 2;
    assert.ok(centers >= (district === 'midtown' ? 900 : 1800), 'Easter eggs occupy distinct parts of the course');
    assert.ok(ordinaryStreet >= (district === 'midtown' ? 650 : 1600), 'Long stretches of ordinary street separate the complete venue facades');
  }
  for (const occupancy of result.occupancy) {
    assert.ok(occupancy.visible.length <= (district === 'opening' ? 1 : 2), 'Downtown never shows both venues; Midtown never clusters three');
    if (district === 'midtown' && result.W <= 960) assert.ok(occupancy.fullyVisible.length <= 1, 'Standard desktop views never contain two complete venues together');
  }
  assert.ok(result.wideOccupancy.every(row => row.visible.length <= (district === 'opening' ? 1 : 2)), 'At the widest supported view there is still no cluster of Easter eggs');
  for (const mark of result.wideMarks) {
    assert.ok(mark.entry >= 8, `${mark.key}: even the widest view starts with an ordinary street`);
    assert.ok(mark.full < result.time, `${mark.key}: widest view reaches the entire frontage before victory`);
  }
  assert.ok(result.cacheSamples.length >= 20, 'The renderer traverses the complete course, not just the opening cache');
  for (const cache of result.cacheSamples) {
    assert.ok(cache.cpu <= cache.cpuLimit && cache.cpuLimit <= 12, 'Native CPU cache is bounded during full-course rendering');
    assert.ok(cache.raw <= cache.rawLimit && cache.rawLimit <= 12, 'Opening WebGL cache is bounded during full-course rendering');
    assert.ok(cache.pixi <= 12, 'Pixi native textures do not accumulate through the city');
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
  if (process.env.COHESIVE_CAPTURE !== '0') for (const join of result.joins.filter(join => test.name === 'desktop' || join.boundary === Math.floor(result.joins.length / 2) || join.boundary === result.joins.length)) {
    if (join.error > result.W / 2 - 40) continue;
    await seek(test, district, Math.min(result.time - .25, join.time)); await capture(test, district, `join-${join.boundary}`);
  }
  console.log(`PASS ${test.name} ${district}: same-plane complete venue fronts, delayed reveals and full chapter traversal.`);
}
async function cacheReuse(test) {
  const rows = await test.page.evaluate(fallback => {
    const rows = [];
    for (const district of ['park', 'opening', 'opening', 'midtown', 'park', 'midtown']) {
      Cu(false); fu(district); Ko('chapter'); b = 'paused'; SA.pause();
      q.invincible = 0; ir = q.y; Kt = T - q.floorY; $i = 0; UA = q.time;
      $A.update(0, q, {id: district, reduced: true, quality: 1}); Vu(); vu();
      const caches = ['opening', 'midtown'].map(id => ({id, ...LR_SCENERY.inspect(id, 0, eA, kA, 'chapter')}));
      const textures = fallback || district === 'opening' ? [] : $A.tiles.filter(tile => tile.group.visible).map(tile => ({
        destroyed: !!tile.sprite.texture.destroyed || !tile.sprite.texture.source || !!tile.sprite.texture.source.destroyed,
        width: tile.sprite.texture.width, height: tile.sprite.texture.height}));
      rows.push({district, caches: caches.map(cache => ({id: cache.id, cpu: cache.cachedSourceCount, raw: cache.rawTextureCacheCount})), textures,
        renderer: longRun.renderer, error: longRun.environment.error});
    }
    Cu(false); fu('opening'); Ko('chapter'); b = 'paused'; SA.pause();
    for (const phase of ['contrarian', 'recovered']) {
      if (phase === 'contrarian') q.beginContrarian(); else q.endContrarian();
      for (let frame = 0; frame < 120; frame++) {q.invincible = 999; q.step(1 / 120);}
      ir = q.y; Kt = T - q.floorY; $i = 0; UA = q.time;
      $A.update(0, q, {id: 'opening', reduced: true, quality: 1}); Vu(); vu();
      const caches = ['opening', 'midtown'].map(id => ({id, ...LR_SCENERY.inspect(id, q.distance, eA, kA, 'chapter')}));
      rows.push({district: 'opening', phase, contrarian: q.contrarian, textures: [],
        caches: caches.map(cache => ({id: cache.id, cpu: cache.cachedSourceCount, raw: cache.rawTextureCacheCount})),
        renderer: longRun.renderer, error: longRun.environment.error});
    }
    return rows;
  }, test.fallback);
  for (const row of rows) {
    if (row.phase) assert.equal(row.contrarian, row.phase === 'contrarian', 'Real Contrarian entry and recovery render with the native cache');
    for (const cache of row.caches) {
      assert.ok(cache.cpu <= 12 && cache.raw <= 12);
      if (cache.id !== row.district) assert.equal(cache.cpu, 0, 'Leaving a district releases its native bitmap cache');
      if (row.district !== 'opening') assert.equal(cache.raw, 0, 'Leaving Downtown releases its raw WebGL textures');
    }
    assert.ok(row.textures.every(texture => !texture.destroyed && texture.width > 0 && texture.height > 0), 'Chapter re-entry never reuses a destroyed texture');
    if (!test.fallback) assert.equal(row.error, null);
  }
  report.cacheReuse.push({name: test.name, rows});
}

try {
  for (const [name, viewport, fallback, dpr] of [
    ['desktop', {width: 1440, height: 900}, false, 1], ['compact', {width: 900, height: 900}, false, 1], ['mobile-dpr2', {width: 844, height: 390}, false, 2],
    ['canvas', {width: 1440, height: 900}, true, 1],
    ['detail-1080', {width: 1920, height: 1080}, false, 1], ['detail-1080-dpr2', {width: 1920, height: 1080}, false, 2]
  ]) {
    if (selection && name !== selection) continue;
    const test = await open(name, viewport, fallback, dpr);
    if (!report.geometry.length) await geometry(test);
    await nativeResolution(test);
    for (const district of (name.startsWith('detail-1080') ? [] : ['opening', 'midtown'])) {
      await venueTimeline(test, district); await motion(test, district);
      const finish = district === 'opening' ? 74 : 59;
      await seek(test, district, finish); await capture(test, district, 'finish');
    }
    if (!name.startsWith('detail-1080')) await cacheReuse(test);
    assert.deepEqual(test.errors, []); assert.deepEqual(test.failed, []);
    report.profiles.push({name, renderer: fallback ? 'canvas' : 'pixi', dpr});
    await test.context.close();
    await writeFile(path.join(output, 'report.json'), JSON.stringify(report, null, 2));
    console.log(`PASS ${name}: cohesive city coverage, venue integration, jumps/flight, unchanged gameplay and Park.`);
  }
} finally {await browser.close();}
