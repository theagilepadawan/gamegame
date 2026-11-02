import assert from 'node:assert/strict';
import {mkdir, writeFile} from 'node:fs/promises';
import {pathToFileURL} from 'node:url';

const moduleName = process.env.PLAYWRIGHT_MODULE || 'playwright';
const {chromium} = await import(moduleName.startsWith('/') ? pathToFileURL(moduleName).href : moduleName);
const browser = await chromium.launch({executablePath: process.env.CHROMIUM_PATH || '/usr/bin/chromium', headless: true,
  args: ['--no-sandbox', '--disable-dev-shm-usage', '--enable-unsafe-swiftshader']});
const url = new URL(process.env.TEST_URL || 'http://127.0.0.1:4181/'); url.searchParams.set('unlock', 'all');
const output = process.env.ART_OUTPUT || new URL('../review/art-direction/', import.meta.url).pathname;
await mkdir(output, {recursive: true});
const report = {native: [], captures: [], motion: [], reviewRequired: [
  'Downtown: One WTC and one complete Brooklyn Bridge; no Empire State or Chrysler silhouettes.',
  'All joins: continuous horizon, sky, water and paving; complete architecture and natural occlusion.',
  'Venue identity: legible names, complete facades and recognisable 505 glass entrance.',
  'Native detail: architecture, window mullions, masonry and foliage remain detailed at DPR2.'
]};
const errors = [], failures = [];
async function open(viewport, deviceScaleFactor = 1) {
  const context = await browser.newContext({viewport, deviceScaleFactor, reducedMotion: 'reduce'});
  const page = await context.newPage(); page.setDefaultTimeout(60000);
  page.on('pageerror', error => errors.push(error.message));
  page.on('response', response => {if (response.status() >= 400) failures.push(`${response.status()} ${response.url()}`);});
  await page.goto(url.href, {waitUntil: 'networkidle'});
  await page.waitForFunction(() => window.longRun && LR_SCENERY.ready && longRun.environment.ready && !document.querySelector('#start').disabled && !document.querySelector('#splash'));
  // Every frame below explicitly updates and renders the engine. Stop the
  // ambient loop so it cannot overwrite background-only captures mid-shot.
  await page.evaluate(() => {
    const nextFrame = window.requestAnimationFrame.bind(window);
    window.requestAnimationFrame = () => 0;
    return new Promise(resolve => nextFrame(resolve));
  });
  return {context, page};
}
async function render(page, district, distance) {
  return page.evaluate(({district, distance}) => {
    Cu(false); fu(district); Ko('chapter'); b = 'paused'; SA.pause();
    q.distance = distance; q.chapterDistance = distance;
    q.floorY = q.floorAt(q.x); q.y = q.floorY; q.grounded = true; ir = q.y; Kt = T - q.floorY; $i = 0;
    $A.update(0, q, {id: district, reduced: true, quality: 1}); vu();
    return {district, distance, renderer: longRun.renderer, scene: LR_SCENERY.inspect(district, distance, eA, kA, 'chapter')};
  }, {district, distance});
}
async function capture(page, name, info) {
  const pixels = await page.screenshot({path: `${output}/${name}.png`});
  const dpr = await page.evaluate(() => devicePixelRatio), viewport = page.viewportSize();
  assert.equal(pixels.readUInt32BE(16), viewport.width * dpr, 'Capture retains the full device pixel width');
  assert.equal(pixels.readUInt32BE(20), viewport.height * dpr, 'Capture retains the full device pixel height');
  report.captures.push({name, dpr, ...info});
}
async function captureScenery(page, name, info) {
  // Render the same live Pixi background without the foreground terrain. A
  // steep gameplay slope can hide the bridge entirely in the whole-game frame.
  const visibility = await page.evaluate(() => {
    const previous = $A.stage.children.map(child => child.visible);
    for (const child of $A.stage.children) if (child !== $A.backgroundLayer && child !== $A.gradeSprite) child.visible = false;
    document.querySelector('#game').style.visibility = 'hidden';
    document.querySelector('.hud').style.visibility = 'hidden';
    $A.renderer.render({container: $A.stage});
    return previous;
  });
  try {await capture(page, `${name}-scenery`, {...info, captureMode: 'live-background-only'});}
  finally {
    await page.evaluate(previous => {
      $A.stage.children.forEach((child, index) => {child.visible = previous[index];});
      document.querySelector('#game').style.visibility = '';
      document.querySelector('.hud').style.visibility = '';
      vu();
    }, visibility);
  }
}
try {
  const desktop = await open({width: 1440, height: 900});
  const {page} = desktop;
  // Compare actual decoded artwork with renderer crops. Dimension metadata
  // alone cannot detect upscaling or a new edge fade. Sparse samples include
  // the old feather region as well as the full height and interior details.
  report.native = await page.evaluate(() => {
    const records = [], seen = new Set(), signatures = new Map();
    function signature(canvas) {
      const ctx = canvas.getContext('2d'), samples = [];
      for (const y of [20, 180, 400, 700, 1000, 1200, 1400]) for (const x of [0, 8, 24, 40, 63, 128, 256, 512, 768, 1000]) samples.push(...ctx.getImageData(x, y, 1, 1).data);
      return samples.join(',');
    }
    function rawSignatures(top) {
      if (signatures.has(top)) return signatures.get(top);
      const result = new Set();
      for (const image of LR_SCENERY.images.filter(i => i.naturalWidth === 1024 && i.naturalHeight >= 1536)) {
        const canvas = document.createElement('canvas'); canvas.width = 1024; canvas.height = 1430;
        canvas.getContext('2d').drawImage(image, 0, top, 1024, 1430, 0, 0, 1024, 1430); result.add(signature(canvas));
      }
      signatures.set(top, result); return result;
    }
    for (const district of ['opening', 'midtown']) for (let distance = 0; distance <= 30000; distance += 500) {
      for (const panel of LR_SCENERY.layout(district, distance, 1000, 540, 'chapter').panels) {
        if (seen.has(panel.id)) continue; seen.add(panel.id);
        const source = LR_SCENERY.source(district, panel), data = source.getContext('2d').getImageData(0, 0, source.width, source.height).data;
        let clear = 0, opaque = 0, unmaskedEdgeRun = 0;
        for (let i = 3; i < data.length; i += 4 * 31) {if (data[i] === 0) clear++; if (data[i] >= 250) opaque++;}
        // Tall opaque strips exactly on a source boundary are severed foliage
        // or architecture. The short street trees cannot conceal these upper
        // silhouettes; transparency elsewhere in the image is not sufficient.
        for (const x of [0, source.width - 1]) {
          let run = 0;
          for (let y = 0; y < 650; y++) {
            run = data[(y * source.width + x) * 4 + 3] >= 250 ? run + 1 : 0;
            unmaskedEdgeRun = Math.max(unmaskedEdgeRun, run);
          }
        }
        records.push({id: panel.id, width: source.width, height: source.height,
          unchangedNativeCrop: rawSignatures(panel.cropTop).has(signature(source)), clearSamples: clear, opaqueSamples: opaque, unmaskedEdgeRun});
      }
    }
    return records;
  });
  for (const asset of report.native) {
    assert.equal(asset.width, 1024); assert.equal(asset.height, 1430);
    assert.equal(asset.unchangedNativeCrop, true, `${asset.id}: native pixels remain unchanged by scaling or feathering`);
    assert.ok(asset.clearSamples > 100 && asset.opaqueSamples > 100, `${asset.id}: architecture is a separated silhouette, not an opaque scene rectangle`);
    if (!asset.id.startsWith('park:')) assert.ok(asset.unmaskedEdgeRun < 32,
      `${asset.id}: an upper silhouette is cut straight along the image boundary (${asset.unmaskedEdgeRun} native pixels)`);
  }
  console.log(`[art-layers] ${report.native.length} native crops and alpha silhouettes passed`);
  for (const district of ['opening', 'midtown', 'park']) {
    const route = await page.evaluate(district => {
      const finishDistance = district === 'opening' ? 25920 : Oo[district].duration * ye;
      const start = LR_SCENERY.layout(district, 0, eA, kA, 'chapter');
      const finish = LR_SCENERY.layout(district, finishDistance, eA, kA, 'chapter'), joins = [];
      for (let boundary = 1; boundary < start.panelCount; boundary++) {
        const target = boundary * start.stride - eA / 2;
        if (target <= start.scroll || target >= finish.scroll) continue;
        let low = 0, high = finishDistance;
        for (let i = 0; i < 35; i++) {
          const mid = (low + high) / 2;
          if (LR_SCENERY.layout(district, mid, eA, kA, 'chapter').scroll < target) low = mid; else high = mid;
        }
        joins.push({boundary, distance: (low + high) / 2});
      }
      return {finishDistance, finish, width: eA, joins};
    }, district);
    if (district === 'park') {
      assert.equal(route.finish.panelCount, 3, 'Park retains the approved Bow Bridge, Ramble and Bethesda paintings');
      assert.equal(route.finish.parallaxRate, .085, 'Park retains the approved camera speed');
      assert.equal(route.finish.authoredLayers, undefined, 'Park uses the approved full paintings');
    } else assert.ok(Math.abs(route.finish.scroll - (route.finish.stripWidth - route.width)) < .01,
      `${district}: the complete authored route is reached before victory`);
    await capture(page, `${district}-start`, await render(page, district, 0));
    for (const join of route.joins) {
      const info = await render(page, district, join.distance);
      await capture(page, `${district}-join-${join.boundary}`, info);
      await captureScenery(page, `${district}-join-${join.boundary}`, info);
    }
    await capture(page, `${district}-finish`, await render(page, district, route.finishDistance));
    const desired = district === 'opening' ? 6 : 3, center = route.joins.find(join => join.boundary === desired) || route.joins[0];
    assert.ok(center, `${district}: a moving architectural join is captured`);
    const sequence = [];
    for (const offset of [-1000, -500, 0, 500, 1000]) {
      const info = await render(page, district, Math.max(0, center.distance + offset));
      sequence.push({district, offset, scroll: info.scene.scroll, atmosphere: info.scene.layers?.[0] || null});
      await capture(page, `${district}-motion-${offset + 1000}`, info);
    }
    for (let i = 1; i < sequence.length; i++) {
      assert.ok(sequence[i].scroll > sequence[i - 1].scroll, 'Join frames advance through the real scenery camera');
      if (district === 'park') continue;
      assert.equal(sequence[i].atmosphere.kind, 'atmosphere');
      assert.equal(sequence[i].atmosphere.width, sequence[0].atmosphere.width);
      assert.equal(sequence[i].atmosphere.y, sequence[0].atmosphere.y);
      assert.ok(sequence[i].atmosphere.x <= sequence[i - 1].atmosphere.x, 'The single continuous plane drifts smoothly without tile resets');
    }
    report.motion.push(...sequence);
    console.log(`[art-layers] ${district} joins and moving frames captured`);
  }
  await desktop.context.close();
  const highDensity = await open({width: 844, height: 390}, 2);
  for (const [district, distance] of [['opening', 12000], ['midtown', 18500], ['park', 12000]]) {
    await capture(highDensity.page, `${district}-dpr2`, await render(highDensity.page, district, distance));
  }
  await highDensity.context.close();
  assert.deepEqual(errors, []); assert.deepEqual(failures, []);
  await writeFile(`${output}/report.json`, JSON.stringify(report, null, 2));
  console.log(`PASS: ${report.native.length} native architectural crops, separated alpha silhouettes, complete chapter coverage, every reachable join, moving join sequences, and DPR2 captures. Captures still require visual review.`);
} finally {await browser.close();}
