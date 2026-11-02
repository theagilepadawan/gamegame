import assert from 'node:assert/strict';
import {mkdir, writeFile} from 'node:fs/promises';
import {pathToFileURL} from 'node:url';

const moduleName = process.env.PLAYWRIGHT_MODULE || 'playwright';
const {chromium} = await import(moduleName.startsWith('/') ? pathToFileURL(moduleName).href : moduleName);
const browser = await chromium.launch({executablePath: process.env.CHROMIUM_PATH || '/usr/bin/chromium',
  args: ['--no-sandbox', '--disable-dev-shm-usage', '--enable-unsafe-swiftshader']});
const output = process.env.PROPS_OUTPUT || new URL('../review/props-v14/smoke/', import.meta.url).pathname;
await mkdir(output, {recursive: true});
const errors = [], failed = [];
try {
  const page = await browser.newPage({viewport: {width: 844, height: 390}, deviceScaleFactor: 2, reducedMotion: 'no-preference'});
  page.setDefaultTimeout(60000);
  page.on('pageerror', error => errors.push(error.message));
  page.on('response', response => {if (response.status() >= 400) failed.push(`${response.status()} ${response.url()}`);});
  await page.goto(process.env.TEST_URL || 'http://127.0.0.1:4181/', {waitUntil: 'networkidle'});
  await page.waitForFunction(() => window.longRun && window.LR_PROPS?.ready && longRun.environment.ready && !document.querySelector('#start').disabled && !document.querySelector('#splash'));
  const report = await page.evaluate(() => {
    Cu(false); Ko('endless'); b = 'paused'; SA.pause();
    const result = {images: LR_PROPS.images.map(image => ({width: image.naturalWidth, height: image.naturalHeight})), outcomes: []};
    const make = () => {const run = new hi(1000, 123456, {mode: 'endless', procedural: false}); run.autoSpawn = false; return run;};
    for (const [type, action] of [['low', 'walk'], ['low', 'jump'], ['high', 'stand'], ['high', 'slide']]) {
      const run = make(); run.hazard(type, run.x + (type === 'low' ? 110 : 140), type === 'high' ? 110 : 60);
      if (action === 'jump') run.jump();
      for (let frame = 0; frame < 120; frame++) run.step(1 / 120, action === 'slide');
      result.outcomes.push({type, action, dead: run.dead, cleared: run.cleared});
    }
    for (const kind of ['dividend', 'opportunity', 'research', 'conviction']) {
      const run = make(); run.pickups.push({x: run.x + 60, y: T - 65, kind, taken: false});
      for (let frame = 0; frame < 60; frame++) run.step(1 / 120, false);
      result.outcomes.push({kind, collected: run.collected, research: run.research, conviction: run.conviction,
        event: run.events.find(event => event.type === 'pickup')});
    }
    const springRun = make(); springRun.springs.push({x: springRun.x + 20, y: T, w: 80, used: false});
    for (let frame = 0; frame < 20; frame++) springRun.step(1 / 120, false);
    result.spring = {used: springRun.springs[0].used, grounded: springRun.grounded, vy: springRun.vy,
      event: springRun.events.find(event => event.type === 'spring')};

    // Paint through the actual engine classes, including fallback paths. These
    // comparisons protect Park's approved obstacles and motion accessibility.
    const canvas = document.createElement('canvas'); canvas.width = 560; canvas.height = 240;
    const context = canvas.getContext('2d'), props = new Po(context), district = new wo(context, er);
    function pixels(draw) {
      context.setTransform(1, 0, 0, 1, 0, 0); context.clearRect(0, 0, canvas.width, canvas.height); draw();
      const bytes = context.getImageData(0, 0, canvas.width, canvas.height).data;
      let hash = 2166136261, visible = 0;
      for (let i = 0; i < bytes.length; i++) hash = Math.imul(hash ^ bytes[i], 16777619);
      for (let i = 3; i < bytes.length; i += 4) if (bytes[i]) visible++;
      return {hash: hash >>> 0, visible};
    }
    const obstacle = Object.freeze({x: 30, type: 'low', w: 58, h: 54, base: 220, label: 'ROAD WORKS'});
    const overhead = Object.freeze({x: 160, type: 'high', w: 112, h: 85, base: 220, label: 'STEEL DELIVERY'});
    const run = {districtId: 'park', floorAt: () => 220};
    const paintObstacles = () => {district.obstacle(obstacle, run, 560, 0, true); district.obstacle(overhead, run, 560, 0, true);};
    const enabledPark = pixels(paintObstacles), activeArt = window.LR_PROPS;
    window.LR_PROPS = null;
    const originalPark = pixels(paintObstacles);
    window.LR_PROPS = activeArt;
    run.districtId = 'midtown';
    const upgradedMidtown = pixels(paintObstacles);
    window.LR_PROPS = null;
    const originalMidtown = pixels(paintObstacles);
    window.LR_PROPS = activeArt;
    result.obstacles = {enabledPark, originalPark, upgradedMidtown, originalMidtown};
    const pickups = ['dividend', 'opportunity', 'research', 'conviction', 'diversification', 'jetpack', 'contrarian']
      .map((kind, index) => Object.freeze({kind, x: 40 + index * 75, y: 75}));
    const drawPickups = (time, reduced) => pickups.forEach(item => props.pickup(item, 0, time, reduced));
    result.motion = {stillA: pixels(() => drawPickups(.1, true)), stillB: pixels(() => drawPickups(2.1, true)),
      movingA: pixels(() => drawPickups(.1, false)), movingB: pixels(() => drawPickups(2.1, false))};
    return result;
  });
  assert.equal(report.images.length, 6);
  assert.ok(report.images.every(image => image.width >= 300 && image.height >= 300), 'Every native painted object is decoded');
  for (const outcome of report.outcomes.slice(0, 4)) {
    assert.equal(outcome.dead, ['walk', 'stand'].includes(outcome.action), `${outcome.type}/${outcome.action}: collision outcome`);
    if (!outcome.dead) assert.equal(outcome.cleared, 1);
  }
  for (const outcome of report.outcomes.slice(4)) {assert.equal(outcome.collected, 1); assert.equal(outcome.event.kind, outcome.kind);}
  assert.equal(report.outcomes[4].event.value, 10); assert.equal(report.outcomes[5].event.value, 75);
  assert.ok(report.outcomes[6].research > 8); assert.ok(report.outcomes[7].conviction > 7); assert.equal(report.outcomes[7].event.value, 40);
  assert.equal(report.spring.used, true); assert.equal(report.spring.grounded, false); assert.ok(report.spring.vy < 0); assert.equal(report.spring.event.type, 'spring');
  assert.deepEqual(report.obstacles.enabledPark, report.obstacles.originalPark, 'Park bench and branch pixels remain unchanged');
  assert.notEqual(report.obstacles.upgradedMidtown.hash, report.obstacles.originalMidtown.hash, 'Midtown uses the painted obstacle render path');
  assert.deepEqual(report.motion.stillA, report.motion.stillB, 'Reduced motion keeps every pickup still');
  assert.notEqual(report.motion.movingA.hash, report.motion.movingB.hash, 'Normal motion animates the painted pickups');

  for (const action of ['jump', 'slide']) {
    const frame = await page.evaluate(action => {
      q = new hi(eA, 123456, {mode: 'endless', procedural: false}); q.autoSpawn = false;
      q.hazard(action === 'jump' ? 'low' : 'high', q.x + (action === 'jump' ? 110 : 60), action === 'jump' ? 60 : 110);
      q.pickups.push({kind: 'research', x: q.x + 230, y: T - 55}, {kind: 'conviction', x: q.x + 340, y: T - 55});
      if (action === 'jump') q.jump();
      for (let i = 0; i < (action === 'jump' ? 34 : 20); i++) q.step(1 / 120, action === 'slide');
      ir = q.y; Kt = 0; $i = 0; UA = 1.7;
      $A.update(0, q, {id: 'opening', reduced: false, quality: 1}); vu();
      return {action, dead: q.dead, grounded: q.grounded, sliding: q.sliding, y: q.y, body: q.bodyBox(), obstacle: q.obstacles[0]};
    }, action);
    assert.equal(frame.dead, false);
    await page.screenshot({path: `${output}/phone-${action}-dpr2.png`});
    (report.frames ||= []).push(frame);
  }
  assert.deepEqual(errors, []); assert.deepEqual(failed, []);
  await writeFile(`${output}/report.json`, JSON.stringify(report, null, 2));
  console.log('PASS: painted prop readiness, real collision/jump/slide and reward events, spring launch, unchanged Park obstacles, reduced/normal motion and DPR2 gameplay captures.');
} finally {await browser.close();}
