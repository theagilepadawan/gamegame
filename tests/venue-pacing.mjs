import assert from 'node:assert/strict';
import {mkdir, readFile, writeFile} from 'node:fs/promises';
import {createServer} from 'node:http';
import {basename} from 'node:path';
import {pathToFileURL} from 'node:url';
const moduleName = process.env.PLAYWRIGHT_MODULE || 'playwright';
const {chromium} = await import(moduleName.startsWith('/') ? pathToFileURL(moduleName).href : moduleName);
const url = new URL(process.env.TEST_URL || 'http://127.0.0.1:4181/'); url.searchParams.set('unlock', 'all');
const output = process.env.PACING_OUTPUT || new URL('../review/venue-pacing/', import.meta.url).pathname;
await mkdir(output, {recursive: true});
const browser = await chromium.launch({executablePath: process.env.CHROMIUM_PATH || '/usr/bin/chromium', headless: true,
  args: ['--no-sandbox', '--disable-dev-shm-usage', '--enable-unsafe-swiftshader']});
const reports = [], gallery = [];
async function capture(name, viewport, deviceScaleFactor = 1) {
  const context = await browser.newContext({viewport, deviceScaleFactor, reducedMotion: 'reduce'});
  const page = await context.newPage(), errors = [];
  page.setDefaultTimeout(60000); page.on('pageerror', error => errors.push(error.message));
  await page.goto(url.href, {waitUntil: 'networkidle', timeout: 60000});
  await page.waitForFunction(() => window.longRun && LR_SCENERY.ready && !document.querySelector('#start').disabled && !document.querySelector('#splash') && longRun.environment.ready);
  // Freeze animation callbacks after real startup; explicit renderer calls
  // below preserve the exact production composition without a competing RAF.
  await page.evaluate(() => { window.requestAnimationFrame = () => 0; });
  const result = await page.evaluate(() => {
    const records = [];
    for (const district of ['opening', 'midtown']) {
      Cu(false); fu(district); Ko('chapter'); b = 'paused'; SA.pause(); q.invincible = 10000;
      const W = eA, H = kA, heroX = q.x, start = LR_SCENERY.inspect(district, 0, W, H, 'chapter');
      const marks = {}, samples = [], simultaneous = [];
      const mask = document.createElement('canvas'); mask.width = Math.ceil(W); mask.height = H;
      const ctx = mask.getContext('2d', {willReadFrequently: true});
      // Isolate native venue pixels, then erase every later scenery layer and
      // the actual terrain above them. A slot entering view is not proof that
      // any pixel of its architecture or frontage is visible.
      function hasVisiblePixel(scene, panel, rect) {
        ctx.clearRect(0, 0, mask.width, H); ctx.globalCompositeOperation = 'source-over';
        ctx.save();
        if (rect) {ctx.beginPath(); ctx.rect(rect.x, rect.y, rect.width, rect.height); ctx.clip();}
        ctx.drawImage(LR_SCENERY.source(district, panel), panel.x, panel.y, panel.width, panel.height); ctx.restore();
        ctx.globalCompositeOperation = 'destination-out';
        for (const layer of scene.layers.slice(scene.layers.indexOf(panel) + 1)) {
          const source = LR_SCENERY.source(district, layer);
          if (source) ctx.drawImage(source, layer.x, layer.y, layer.width, layer.height);
        }
        ctx.globalCompositeOperation = 'source-over';
        const left = Math.max(0, Math.floor(rect ? rect.x : panel.x));
        const right = Math.min(mask.width, Math.ceil(rect ? rect.x + rect.width : panel.x + panel.width));
        if (right <= left) return false;
        const pixels = ctx.getImageData(left, 0, right - left, H).data;
        for (let x = left; x < right; x++) {
          const ground = Math.min(H, Math.floor(q.floorAt(x) + T - q.floorY));
          for (let y = 0; y < ground; y++) if (pixels[(y * (right - left) + x - left) * 4 + 3] >= 32) return true;
        }
        return false;
      }
      for (let frame = 0; frame < 80 * 120; frame++) {
        if (frame % 4 === 0) {
          const scene = LR_SCENERY.layout(district, q.distance, W, H, 'chapter');
          const items = district === 'opening' ? LR_KABIN.spots(q.distance, W, H, 'chapter') : LR_SHOPS.inspect(q.distance, W, H).items;
          const visible = items.filter(item => item.visible).map(item => item.key);
          if (visible.length > 1) simultaneous.push({time: q.time, visible});
          const sample = {time: q.time, distance: q.distance, scroll: scene.scroll}; samples.push(sample);
          for (const item of items) {
            const mark = marks[item.key] ||= {key: item.key, segment: item.segment, worldX: item.worldX, sourceRect: item.nativeRect || item.sourceCrop};
            const panel = scene.panels.find(p => p.sourceIndex === item.panel);
            const rect = item.rect || {x: item.quad[0][0], y: item.quad[0][1], width: item.width, height: item.height};
            if (panel && !mark.firstPixel && hasVisiblePixel(scene, panel)) mark.firstPixel = {...sample};
            if (item.visible && !mark.frontagePixel && hasVisiblePixel(scene, panel, rect)) mark.frontagePixel = {...sample};
            if (item.visible) mark.lastFrontage = {...sample};
            if (!mark.fullyVisible && rect.x >= 20 && rect.x + rect.width <= W - 20) mark.fullyVisible = {...sample};
            if (!mark.heroCenter && item.worldX - scene.scroll <= heroX) mark.heroCenter = {...sample};
          }
        }
        q.step(1 / 120, false);
        if (q.won || q.dead) break;
      }
      const venues = Object.values(marks), gaps = venues.slice(1).map((venue, i) => ({from: venues[i].key, to: venue.key,
        ordinaryBlocks: venue.segment - venues[i].segment - 1,
        emptyScreenSeconds: venue.frontagePixel.time - venues[i].lastFrontage.time,
        revealInterval: venue.frontagePixel.time - venues[i].frontagePixel.time}));
      const transitions = [];
      for (let boundary = 1; boundary < start.panelCount; boundary++) {
        const target = boundary * start.stride - W / 2;
        const sample = samples.find(sample => sample.scroll >= target);
        if (target > start.scroll && sample) transitions.push({boundary, ...sample});
      }
      records.push({district, viewport: {width: innerWidth, height: innerHeight}, W, H, heroX, initialScroll: start.scroll,
        finishTime: q.time, finishDistance: q.distance, won: q.won, dead: q.dead, venues, gaps, simultaneous, transitions,
        fifteenSeconds: samples.find(sample => sample.time >= 15)});
    }
    return records;
  });
  for (const record of result) {
    assert.ok(Math.abs(record.W - record.viewport.width / record.viewport.height * record.H) < 1e-8, 'Timing uses the actual responsive game viewport');
    assert.equal(record.dead, false, 'Timing samples run through the real chapter stepper');
    assert.equal(record.won, true, 'Capture uses a complete actual run, including its real finish distance');
    assert.deepEqual(record.simultaneous, [], 'Two named frontages never share the viewport');
    assert.ok(record.venues[0].firstPixel.time >= 15, `${name}/${record.district}: no venue artwork in the first fifteen seconds`);
    for (const venue of record.venues) {
      assert.ok(venue.firstPixel.time <= venue.frontagePixel.time, 'Native architecture enters no later than its frontage');
      assert.ok(venue.fullyVisible.time < record.finishTime, `${venue.key}: full frontage is visible before victory`);
      assert.ok(venue.heroCenter && venue.heroCenter.time < record.finishTime, `${venue.key}: its center reaches the actual runner before victory`);
    }
    for (const gap of record.gaps) {
      assert.ok(gap.ordinaryBlocks >= 3, 'At least three complete ordinary blocks separate named frontages');
      assert.ok(gap.emptyScreenSeconds > .5, 'There is a visible interval containing ordinary scenery only');
      assert.ok(gap.revealInterval >= 9, 'Venues arrive as separate moments in the run');
    }
    const frames = [
      {label: 'start', time: 0, distance: 0},
      {label: '15-seconds-ordinary-streets', ...record.fifteenSeconds},
      ...record.venues.flatMap(venue => [
        {label: `${venue.key}-first-native-pixel`, ...venue.firstPixel},
        {label: `${venue.key}-full-frontage`, ...venue.fullyVisible},
        {label: `${venue.key}-hero-center`, ...venue.heroCenter}
      ]),
      ...(name === 'desktop' ? record.transitions.map(transition => ({label: `join-${String(transition.boundary).padStart(2, '0')}`, ...transition})) : [])
    ];
    for (const frame of process.env.PACING_CAPTURE === '0' ? [] : frames) {
      const rendered = await page.evaluate(({district, frame}) => {
        Cu(false); fu(district); Ko('chapter'); b = 'paused'; SA.pause();
        q.distance = frame.distance; q.chapterDistance = frame.distance; q.chapterTime = frame.time; q.time = frame.time;
        q.floorY = q.floorAt(q.x); q.y = q.floorY; q.grounded = true; ir = q.y; Kt = T - q.floorY; $i = 0;
        $A.update(0, q, {id: district, reduced: true, quality: 1}); Vu(); vu();
        return {renderer: longRun.renderer, error: longRun.environment.error};
      }, {district: record.district, frame});
      assert.equal(rendered.renderer, 'pixi-webgl'); assert.equal(rendered.error, null);
      const file = `${name}-${record.district}-${frame.label}.png`;
      await page.screenshot({path: `${output}/${file}`});
      gallery.push({file, name, district: record.district, label: frame.label, time: Number(frame.time.toFixed(2))});
    }
    reports.push({name, ...record});
    console.log(`[venue-pacing] ${name} ${record.district}: ${record.venues.map(v => `${v.key} native ${v.firstPixel.time.toFixed(2)}s, frontage ${v.frontagePixel.time.toFixed(2)}s, hero ${v.heroCenter.time.toFixed(2)}s`).join('; ')}`);
  }
  assert.deepEqual(errors, []); await context.close();
}
try {
  await capture('desktop', {width: 1440, height: 900});
  await capture('mobile-dpr2', {width: 844, height: 390}, 2);
  await capture('compact', {width: 568, height: 320});
  await writeFile(`${output}/report.json`, JSON.stringify(reports, null, 2));
  const html = `<!doctype html><html><meta charset="utf-8"><title>Venue route pacing review</title><style>body{margin:0;padding:16px;background:#101a28;color:#fff;font:14px sans-serif}h1{font-size:20px}.grid{display:grid;grid-template-columns:repeat(3,1fr);gap:12px}figure{margin:0}img{display:block;width:100%;height:auto}figcaption{padding:6px 0}</style><h1>Actual route frames · first native pixels, full frontages and runner-center crossings</h1><div class="grid">${gallery.map(item => `<figure><img src="${item.file}"><figcaption>${item.name} / ${item.district} / ${item.label} · ${item.time}s</figcaption></figure>`).join('')}</div></html>`;
  if (gallery.length) {
    await writeFile(`${output}/index.html`, html);
    const server = createServer(async (req, res) => {
      try {
        const file = basename(new URL(req.url, 'http://localhost').pathname);
        const data = await readFile(`${output}/${file}`);
        res.writeHead(200, {'Content-Type': file.endsWith('.png') ? 'image/png' : 'text/html'}); res.end(data);
      } catch { res.writeHead(404); res.end(); }
    });
    await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
    try {
      const sheet = await browser.newPage({viewport: {width: 1440, height: 900}});
      await sheet.goto(`http://127.0.0.1:${server.address().port}/index.html`, {waitUntil: 'load'});
      await sheet.screenshot({path: `${output}/contact-sheet.png`, fullPage: true});
      await sheet.close();
    } finally { await new Promise(resolve => server.close(resolve)); }
  }
  console.log('PASS: actual chapter starts, alpha-tested native/frontage reveal, runner-center timing, ordinary blocks between venues, no simultaneous named frontages, complete entrances before victory.');
} finally {await browser.close();}
