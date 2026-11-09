import assert from 'node:assert/strict';
import {mkdir, writeFile, readFile} from 'node:fs/promises';
import {pathToFileURL} from 'node:url';

const moduleName = process.env.PLAYWRIGHT_MODULE || 'playwright';
const {chromium} = await import(moduleName.startsWith('/') ? pathToFileURL(moduleName).href : moduleName);
const browser = await chromium.launch({executablePath: process.env.CHROMIUM_PATH || '/usr/bin/chromium',
  args: ['--no-sandbox', '--disable-dev-shm-usage', '--enable-unsafe-swiftshader']});
const output = process.env.PROPS_OUTPUT || new URL('../review/v124/props/', import.meta.url).pathname;
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

    const canvas=document.createElement('canvas');canvas.width=560;canvas.height=300;
    const context=canvas.getContext('2d'),props=new Po(context);
    function pixels(draw){
      context.setTransform(1,0,0,1,0,0);context.clearRect(0,0,canvas.width,canvas.height);draw();
      const bytes=context.getImageData(0,0,canvas.width,canvas.height).data;
      let hash=2166136261,visible=0;
      for(const n of bytes)hash=Math.imul(hash^n,16777619);
      for(let n=3;n<bytes.length;n+=4)if(bytes[n])visible++;
      return {hash:hash>>>0,visible};
    }
    result.registration=LR_PROPS.registration;
    result.faces=[];
    const labels={opening:['DEBT SPIRAL','FOMO','PRICED FOR PERFECTION','RED TAPE'],
      midtown:['FEE ON FEES','CAPEX CREEP','MOVING GUIDANCE','ONE MORE COMMITTEE'],
      park:['BENCHMARK','BAGHOLDER','HAIRCUT','FEE CREEP']};
    for(const district of ['opening','midtown','park'])for(let index=0;index<4;index++){
      const h={x:120,w:index<2?100:154,h:62,base:280,type:index<2?'low':'high',artDistrict:district,artVariant:index,label:labels[district][index]};
      LR_HAZARDS.proportions(h);
      if(index===2)LR_HAZARDS.moving(h,{seed:42,x:0,distance:0},4,30);
      const snapshot=JSON.stringify(h),drawState={alpha:.75,transform:[1,0,0,1,0,0]},text=[];
      context.globalAlpha=drawState.alpha;
      const fillText=context.fillText.bind(context);
      context.fillText=function(value,x,y,...rest){text.push({value,font:this.font,x,y,width:this.measureText(value).width,squashed:rest.length>0});return fillText(value,x,y,...rest)};
      const rendered=pixels(()=>LR_PROPS.hazard(context,h,h.x,h.base,district,{floorAt:()=>280}));
      context.fillText=fillText;
      const top=h.base-(h.type==='high'?96+h.h:h.h);
      const alpha=context.getImageData(Math.round(h.x+h.w*.5),Math.round(top+h.h*.5),1,1).data[3];
      const kind=LR_PROPS.variant(h);const after=LR_PROPS.variant({...h,x:900});
      result.faces.push({district,index,kind,after,alpha,unchanged:JSON.stringify(h)===snapshot,rendered,text,
        drawState:{alpha:context.globalAlpha,transform:Array.from(context.getTransform().toFloat64Array()).filter((v,i)=>[0,1,4,5,12,13].includes(i))},
        scale:[h.w/LR_PROPS.registration[district][index].body[2],h.h/LR_PROPS.registration[district][index].body[3]]});
      context.globalAlpha=1;
    }
    const pickups = ['dividend', 'opportunity', 'research', 'conviction', 'diversification', 'jetpack', 'contrarian']
      .map((kind, index) => Object.freeze({kind, x: 40 + index * 75, y: 75}));
    const drawPickups = (time, reduced) => pickups.forEach(item => props.pickup(item, 0, time, reduced));
    result.motion = {stillA: pixels(() => drawPickups(.1, true)), stillB: pixels(() => drawPickups(2.1, true)),
      movingA: pixels(() => drawPickups(.1, false)), movingB: pixels(() => drawPickups(2.1, false))};
    return result;
  });
  assert.equal(report.images.length, 7);
  assert.ok(report.images.every(image => image.width >= 250 && image.height >= 250), 'Every native painted object is decoded at least 250px across, well above its gameplay size');
  for (const outcome of report.outcomes.slice(0, 4)) {
    assert.equal(outcome.dead, ['walk', 'stand'].includes(outcome.action), `${outcome.type}/${outcome.action}: collision outcome`);
    if (!outcome.dead) assert.equal(outcome.cleared, 1);
  }
  for (const outcome of report.outcomes.slice(4)) {assert.equal(outcome.collected, 1); assert.equal(outcome.event.kind, outcome.kind);}
  assert.equal(report.outcomes[4].event.value, 10); assert.equal(report.outcomes[5].event.value, 75);
  assert.ok(report.outcomes[6].research > 8); assert.ok(report.outcomes[7].conviction > 7); assert.equal(report.outcomes[7].event.value, 40);
  assert.equal(report.spring.used, true); assert.equal(report.spring.grounded, false); assert.ok(report.spring.vy < 0); assert.equal(report.spring.event.type, 'spring');
  const manifest=JSON.parse(await readFile('assets/obstacles-v124/manifest.json','utf8'));
  for(const [district,set]of Object.entries(manifest.sets))assert.deepEqual(report.registration[district==='downtown'?'opening':district],set.sprites,'Native source, physical body, plaque and anchor registrations match production metadata');
  for(const face of report.faces){
    assert.equal(face.kind,face.after,'Variant stays stable as the course scrolls');
    assert.equal(face.unchanged,true,'Rendering never mutates physics or motion');
    assert.ok(face.alpha>180,`${face.kind}: physical centre has solid painted art`);
    assert.ok(Math.abs(face.scale[0]-face.scale[1])<1e-9,'Native proportions are preserved');
    assert.equal(face.drawState.alpha,.75,'Drawing preserves route fade');
    assert.deepEqual(face.drawState.transform,[1,0,0,1,0,0]);
    assert.ok(face.rendered.visible>1000);
    for(const line of face.text){assert.equal(line.squashed,false,'Live lettering is never compressed horizontally');assert.ok(parseFloat(line.font.match(/[\d.]+px/)[0])>=6.5,'Plaque text remains readable at native game size');}
  }
  assert.equal(new Set(report.faces.map(f=>f.kind)).size,12,'All twelve distinct painted objects render');
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
  console.log('PASS: painted prop readiness, real collision/jump/slide and reward events, spring launch, all twelve native district objects, uniform proportions and plaque registration, reduced/normal motion and DPR2 gameplay captures.');
} finally {await browser.close();}
