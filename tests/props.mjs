import assert from 'node:assert/strict';
import {mkdir, writeFile} from 'node:fs/promises';
import {pathToFileURL} from 'node:url';

const moduleName = process.env.PLAYWRIGHT_MODULE || 'playwright';
const {chromium} = await import(moduleName.startsWith('/') ? pathToFileURL(moduleName).href : moduleName);
const browser = await chromium.launch({executablePath: process.env.CHROMIUM_PATH || '/usr/bin/chromium',
  args: ['--no-sandbox', '--disable-dev-shm-usage', '--enable-unsafe-swiftshader']});
const output = process.env.PROPS_OUTPUT || new URL('../review/v113-qa/props/', import.meta.url).pathname;
await mkdir(output, {recursive: true});
const errors = [], failed = [];
try {
  const page = await browser.newPage({viewport: {width: 844, height: 390}, deviceScaleFactor: 2, reducedMotion: 'no-preference'});
  page.setDefaultTimeout(60000);
  page.on('pageerror', error => errors.push(error.message));
  page.on('response', response => {if (response.status() >= 400) failed.push(`${response.status()} ${response.url()}`);});
  await page.goto(process.env.TEST_URL || 'http://127.0.0.1:4181/', {waitUntil: 'networkidle'});
  await page.waitForFunction(() => window.longRun && window.LR_PROPS?.ready && longRun.environment.ready && !document.querySelector('#start').disabled && !document.querySelector('#splash'));
  await page.evaluate(() => {const next = requestAnimationFrame.bind(window); window.requestAnimationFrame = () => 0; return new Promise(resolve => next(resolve));});
  const report = await page.evaluate(() => {
    LR_CH.order.forEach(id => LR_CH.done(id)); Cu(false); Ko('endless'); b = 'paused'; SA.pause();
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
    const withoutPlaque = {...activeArt,benchmark:()=>{}};
    window.LR_PROPS = withoutPlaque;
    const unchangedPark = pixels(paintObstacles);
    window.LR_PROPS = null;
    const originalPark = pixels(paintObstacles);
    window.LR_PROPS = activeArt;
    run.districtId = 'midtown';
    const upgradedMidtown = pixels(paintObstacles);
    window.LR_PROPS = null;
    const originalMidtown = pixels(paintObstacles);
    window.LR_PROPS = activeArt;
    result.obstacles = {enabledPark, unchangedPark, originalPark, upgradedMidtown, originalMidtown};
    const artFaces = [];
    const samples=[{type:'low',label:'ROAD WORKS',w:60,h:54},{type:'low',label:'MARGIN CALL',w:60,h:54},{type:'high',w:112,h:85},{type:'high',w:112,h:85,guidance:{base:220}}];
    for(const item of samples) {
      const x=120,base=220,top=item.type==='high'?base-181:base-item.h;
      const original=JSON.stringify(item);
      pixels(()=>LR_PROPS.hazard(context,item,x,base,'midtown',{floorAt:()=>base}));
      const alpha=(x,y)=>context.getImageData(Math.round(x),Math.round(y),1,1).data[3];
      const face=[];
      // The restored barrier has separate feet below its solid body. Check its
      // body and both feet, and keep the full lower-edge check for slide boards.
      const rows = item.type === 'high' ? [.15,.5,.92] : [.15,.5,.75];
      for(const fx of [.1,.3,.5,.7,.9])for(const fy of rows)face.push(alpha(x+item.w*fx,top+(item.type==='high'?85:item.h)*fy));
      if(item.type === 'low')for(const fx of [.15,.72])face.push(alpha(x+item.w*fx,base-item.h*.08));
      const before=LR_PROPS.variant(item);item.x=900;const after=LR_PROPS.variant(item);delete item.x;
      artFaces.push({kind:before,after,face,unchanged:JSON.stringify(item)===original});
    }
    result.faces=artFaces;
    const pickups = ['dividend', 'opportunity', 'research', 'conviction', 'diversification', 'jetpack', 'contrarian']
      .map((kind, index) => Object.freeze({kind, x: 40 + index * 75, y: 75}));
    const drawPickups = (time, reduced) => pickups.forEach(item => props.pickup(item, 0, time, reduced));
    result.motion = {stillA: pixels(() => drawPickups(.1, true)), stillB: pixels(() => drawPickups(2.1, true)),
      movingA: pixels(() => drawPickups(.1, false)), movingB: pixels(() => drawPickups(2.1, false))};
    return result;
  });
  assert.equal(report.images.length, 6);
  assert.ok(report.images.every(image => image.width >= 250 && image.height >= 250), 'Every native painted object is decoded at least 250px across, well above its gameplay size');
  for (const outcome of report.outcomes.slice(0, 4)) {
    assert.equal(outcome.dead, ['walk', 'stand'].includes(outcome.action), `${outcome.type}/${outcome.action}: collision outcome`);
    if (!outcome.dead) assert.equal(outcome.cleared, 1);
  }
  for (const outcome of report.outcomes.slice(4)) {assert.equal(outcome.collected, 1); assert.equal(outcome.event.kind, outcome.kind);}
  assert.equal(report.outcomes[4].event.value, 10); assert.equal(report.outcomes[5].event.value, 75);
  assert.ok(report.outcomes[6].research > 8); assert.ok(report.outcomes[7].conviction > 7); assert.equal(report.outcomes[7].event.value, 40);
  assert.equal(report.spring.used, true); assert.equal(report.spring.grounded, false); assert.ok(report.spring.vy < 0); assert.equal(report.spring.event.type, 'spring');
  assert.deepEqual(report.obstacles.unchangedPark, report.obstacles.originalPark, 'Park bench, branch and paving remain identical outside the small plaque');
  assert.notEqual(report.obstacles.enabledPark.hash,report.obstacles.unchangedPark.hash,'Small Benchmark plaque appears on the original bench');
  assert.notEqual(report.obstacles.upgradedMidtown.hash, report.obstacles.originalMidtown.hash, 'Midtown uses the painted obstacle render path');
  for(const face of report.faces){assert.equal(face.kind,face.after,'Variant is stable as the obstacle moves');assert.equal(face.unchanged,true,'Rendering does not mutate collision data');assert.ok(face.face.every(a=>a>240),`${face.kind}: solid body and support feet remain visible at their physical bounds`);}
  assert.deepEqual([...new Set(report.faces.map(f=>f.kind))],['cabinet','overhead'],'Restored barrier and market-board art exercised, including the moving hoist');
  assert.deepEqual(report.motion.stillA, report.motion.stillB, 'Reduced motion keeps every pickup still');
  assert.notEqual(report.motion.movingA.hash, report.motion.movingB.hash, 'Normal motion animates the painted pickups');

  for (const action of ['jump', 'slide']) {
    const frame = await page.evaluate(action => {
      q = new hi(eA, 123456, {mode: 'endless', procedural: false}); q.autoSpawn = false;
      q.hazard(action === 'jump' ? 'low' : 'high', q.x + (action === 'jump' ? 110 : 60), action === 'jump' ? 60 : 110);
      q.pickups.push({kind: 'research', x: q.x + 230, y: T - 55}, {kind: 'conviction', x: q.x + 340, y: T - 55});
      if (action === 'jump') q.jump();
      for (let i = 0; i < (action === 'jump' ? 34 : 20); i++) q.step(1 / 120, action === 'slide');
      b = 'paused'; ir = q.y; Kt = T - q.floorY; $i = 0; UA = 1.7;
      $A.update(0, q, {id: 'opening', reduced: false, quality: 1}); Vu(); vu();
      return {action, dead: q.dead, grounded: q.grounded, sliding: q.sliding, y: q.y, body: q.bodyBox(), obstacle: q.obstacles[0]};
    }, action);
    assert.equal(frame.dead, false);
    await page.screenshot({path: `${output}/phone-${action}-dpr2.png`});
    (report.frames ||= []).push(frame);
  }
  assert.deepEqual(errors, []); assert.deepEqual(failed, []);
  await writeFile(`${output}/report.json`, JSON.stringify(report, null, 2));
  console.log('PASS: painted prop readiness, real collision/jump/slide and reward events, spring launch, original Park geometry plus Benchmark plaque, reduced/normal motion and DPR2 gameplay captures.');
} finally {await browser.close();}
