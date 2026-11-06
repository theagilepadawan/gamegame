import assert from 'node:assert/strict';
import {mkdir, writeFile} from 'node:fs/promises';
import {pathToFileURL} from 'node:url';

const moduleName = process.env.PLAYWRIGHT_MODULE || 'playwright';
const {chromium} = await import(moduleName.startsWith('/') ? pathToFileURL(moduleName).href : moduleName);
const output = process.env.RESPONSIVE_OUTPUT || new URL('../review/v18-qa/responsive/', import.meta.url).pathname;
await mkdir(output, {recursive: true});
const browser = await chromium.launch({executablePath: process.env.CHROMIUM_PATH || '/usr/bin/chromium', headless: true,
  args: ['--no-sandbox', '--disable-dev-shm-usage', '--enable-unsafe-swiftshader']});
const errors = [], report = {viewports: []};
try {
  const page = await browser.newPage({viewport: {width: 900, height: 900}, reducedMotion: 'reduce'});
  page.setDefaultTimeout(60000);
  page.on('pageerror', error => errors.push(error.message));
  const url = new URL(process.env.TEST_URL || 'http://127.0.0.1:4181/'); url.searchParams.set('unlock', 'all');
  await page.goto(url.href, {waitUntil: 'networkidle', timeout: 90000});
  await page.waitForFunction(() => window.longRun && LR_SCENERY.ready && LR_SHOPS.ready && LR_OFFICE_HOST.ready &&
    longRun.environment.ready && !document.querySelector('#start').disabled && !document.querySelector('#splash'));
  await page.evaluate(() => {const next = requestAnimationFrame.bind(window); requestAnimationFrame = () => 0; return new Promise(resolve => next(resolve));});
  report.squareOffice = await page.evaluate(() => {
    Cu(false); fu('midtown'); Ko('chapter'); b = 'paused'; SA.pause();
    const initial = LR_SCENERY.layout('midtown', 0, eA, kA, 'chapter'); let found = null;
    for (let frame = 0; frame < 60 * 120; frame++) {
      q.invincible = 999; q.step(1 / 120);
      if (frame % 6) continue;
      const office = LR_SHOPS.inspect(q.distance, eA, kA).items.find(item => item.key === 'fifth');
      const host = LR_OFFICE_HOST.layout(q.distance, eA, kA);
      const rect = office.rect;
      if (rect.x > 10 && rect.x + rect.width < eA - 10 && host.x + host.height * .25 < eA - 10 && host.x - host.height * .25 > 10) {
        found = {time: q.chapterTime, won: q.won, office, host}; break;
      }
    }
    q.invincible = 0; ir = q.y; Kt = T - q.floorY; $i = 0; UA = q.time;
    $A.update(0, q, {id: 'midtown', reduced: true, quality: 1}); Vu(); vu();
    return {W: eA, H: kA, initial, found, renderer: longRun.renderer};
  });
  assert.equal(report.squareOffice.W, 540);
  assert.ok(report.squareOffice.initial.parallaxRate > 0 && report.squareOffice.initial.parallaxRate <= .12,
    'A narrow window reaches the entrance without accelerating the scenery');
  assert.ok(report.squareOffice.found && report.squareOffice.found.time < 60 && !report.squareOffice.found.won,
    'A real square viewport reaches the whole 505 entrance and host before victory');
  await page.screenshot({path: `${output}/square-office.png`});

  for (const viewport of [{width: 1440, height: 900}, {width: 844, height: 390}, {width: 2520, height: 1080},
    {width: 3200, height: 540}, {width: 3840, height: 648}]) {
    await page.setViewportSize(viewport);
    const expectedWidth = Math.min(viewport.width, viewport.height * 8 / 3);
    await page.waitForFunction(width => Math.abs(document.querySelector('#stage').getBoundingClientRect().width - width) < .1 &&
      Math.abs(eA - width / innerHeight * 540) < .1, expectedWidth);
    const result = await page.evaluate(() => {
      const bounds = document.querySelector('#stage').getBoundingClientRect(), scenes = [], venues = [];
      for (const id of ['opening', 'midtown']) {
        for (const distance of [0, id === 'opening' ? 25920 : 19200]) {
          const scene = LR_SCENERY.layout(id, distance, eA, kA, 'chapter'), panels = scene.panels.filter(panel => panel.kind === 'painting');
          scenes.push({id, distance, covered: panels[0].x <= 0 && panels.at(-1).x + panels.at(-1).width >= eA - .001,
            rate: scene.parallaxRate});
        }
        const items = id === 'midtown' ? LR_SHOPS.inspect(0, eA, kA).items : LR_KABIN.spots(0, eA, kA, 'chapter');
        for (const item of items) venues.push({id, key: item.key, x: item.rect?.x ?? item.quad[0][0]});
      }
      return {viewport: {width: innerWidth, height: innerHeight}, stage: {x: bounds.x, y: bounds.y, width: bounds.width, height: bounds.height},
        W: eA, H: kA, transform: getComputedStyle(document.querySelector('#stage')).transform, scenes, venues};
    });
    assert.ok(Math.abs(result.stage.width - expectedWidth) < .1);
    assert.ok(Math.abs(result.stage.x - (viewport.width - expectedWidth) / 2) < .1);
    assert.equal(result.stage.height, viewport.height); assert.equal(result.transform, 'none');
    assert.ok(result.W <= 1440.01); assert.ok(result.scenes.every(scene => scene.covered && scene.rate > 0 && scene.rate <= .12));
    assert.ok(result.venues.every(venue => venue.x >= result.W), 'No Easter egg frontage is visible at the start, even at the width cap');
    report.viewports.push(result);
  }
  // Request real fullscreen through the production UI function. Fullscreen on
  // the document preserves the stage cap; fullscreen directly on the stage
  // would let the browser's mandatory fullscreen styles override its max width.
  report.fullscreen = await page.evaluate(async () => {
    await qu(); fQ();
    const bounds = document.querySelector('#stage').getBoundingClientRect();
    return {active: document.fullscreenElement?.tagName, innerWidth, innerHeight,
      stage: {x: bounds.x, width: bounds.width, height: bounds.height}, W: eA};
  });
  assert.equal(report.fullscreen.active, 'HTML');
  const fullWidth = Math.min(report.fullscreen.innerWidth, report.fullscreen.innerHeight * 8 / 3);
  assert.ok(Math.abs(report.fullscreen.stage.width - fullWidth) < .1);
  assert.ok(Math.abs(report.fullscreen.stage.x - (report.fullscreen.innerWidth - fullWidth) / 2) < .1);
  await page.evaluate(() => {Cu(false); fu('midtown'); Ko('chapter'); b = 'paused'; SA.pause(); q.invincible = 0; ir = q.y; Kt = T - q.floorY; Vu(); vu();});
  await page.screenshot({path: `${output}/ultrawide-fullscreen.png`});
  assert.deepEqual(errors, []);
  await writeFile(`${output}/report.json`, JSON.stringify(report, null, 2));
  console.log(`PASS: complete square office at ${report.squareOffice.found.time.toFixed(2)}s, centered 8:3 cap, no opening venues and actual fullscreen.`);
} finally {await browser.close();}
