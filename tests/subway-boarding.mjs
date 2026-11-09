import assert from 'node:assert/strict';
import {mkdir} from 'node:fs/promises';
import {chromium} from 'playwright';

const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox','--enable-unsafe-swiftshader']});
await mkdir('review/v121/boarding',{recursive:true});
try {
  const page=await browser.newPage({viewport:{width:1280,height:720},reducedMotion:'no-preference'}), errors=[];
  page.on('pageerror',error=>errors.push(error.message));
  const url=new URL(process.env.TEST_URL||'http://127.0.0.1:4181/');url.searchParams.set('unlock','all');
  await page.goto(url.href,{waitUntil:'networkidle'});
  await page.waitForFunction(()=>window.longRun?.environment.ready&&!document.querySelector('#splash')&&!document.querySelector('#start').disabled);
  await page.clock.install();await page.clock.pauseAt(new Date(Date.now()+100));
  async function enter(airborne=false) {
    await page.evaluate(()=>{Cu(false);fu('opening');});
    await page.locator('[data-character="nicolai"]').click();
    await page.evaluate(airborne=>{
      Ko('chapter');q.chapterTime=75;q.chapterDistance=q.distance=ee(75);
      q.obstacles=[];q.pickups=[];q.platforms=[];q.worldItems=[];q.flight=false;q.flightLanding=0;q.shield=false;
      q.y=q.floorY-(airborne?140:0);q.vy=airborne?-420:0;q.grounded=!airborne;q.won=true;mD();
    },airborne);
    await page.waitForFunction(()=>LR_FINISH.inspect(q).walkReady);
    return page.evaluate(()=>{
      const gate=LR_FINISH.inspect(q),at=t=>LR_FINISH.actor(q,t);
      const running=at(Math.max(.01,gate.turnAt-.8)),runLater=at(Math.max(.01,gate.turnAt-.8)+.02);
      const walking=at(gate.walkAt+.5),walkLater=at(gate.walkAt+.52);
      return {gate,running,walking,runSpeed:(runLater.x-running.x)/.02,walkSpeed:Math.hypot(walkLater.x-walking.x,walkLater.y-walking.y)/.02,
        beforeDoor:at(gate.turnAt-.23),atDoor:at(gate.walkAt),end:at(gate.duration-.05),
        path:Array.from({length:121},(_,i)=>at(gate.duration*i/120))};
    });
  }
  const scene=await enter();
  assert.equal(scene.gate.boarding,true);assert.equal(scene.running.action,'run');
  assert.equal(scene.beforeDoor.action,'run');assert.ok(scene.beforeDoor.x<scene.gate.threshold);
  assert.equal(scene.walking.action,'walk');assert.ok(scene.walking.x>=scene.gate.threshold);
  assert.ok(scene.runSpeed>300&&scene.walkSpeed<scene.runSpeed*.15&&scene.walkSpeed>10,'The normal run becomes a slow walk into depth');
  for(let i=1;i<scene.path.length;i++) assert.ok(scene.path[i].x>=scene.path[i-1].x,'No reverse movement or endpoint snap');
  assert.ok(scene.end.x>scene.gate.threshold+20&&scene.end.x<scene.gate.pier-65,'He finishes in the clear left half of the doorway');
  assert.ok(scene.end.x-scene.atDoor.x<6,'The rear-view steps head into depth, without crossing the central pole');
  assert.equal(scene.end.y,scene.gate.boardingFloor);
  assert.ok(scene.atDoor.y-scene.end.y>25,'Feet recede along the carriage floor');
  assert.equal(scene.end.scale,.86,'Only the boarding depth changes perspective');
  assert.ok(scene.path.filter(p=>p.phase==='inside').every(p=>p.frame>=4&&p.frame<=11),'Inside steps exclusively use the rear-view poses');
  assert.deepEqual([...new Set(scene.path.filter(p=>p.phase==='turn').map(p=>p.frame))],[0,1,2,3],'All four turn keyframes lead into the rear walk');
  const poses=await page.evaluate(()=>{
    const c=document.createElement('canvas');c.width=c.height=512;const ctx=c.getContext('2d');
    return Array.from({length:12},(_,f)=>{
      ctx.clearRect(0,0,512,512);LR_FINISH.drawWalk(ctx,'nicolai',256,474,f,1/.84);
      const data=ctx.getImageData(0,0,512,512).data;let hash=2166136261;
      for(const v of data)hash=Math.imul(hash^v,16777619);
      return hash>>>0;
    });
  });
  assert.equal(new Set(poses).size,12,'All twelve turn and rear-view walking keyframes render');
  const pole=await page.evaluate(()=>{
    const c=document.createElement('canvas');c.width=1280;c.height=720;const ctx=c.getContext('2d'),g=LR_FINISH.inspect(q);
    const x=Math.round(g.left+1305*.48),y=Math.round(g.floor+(620-750)*.48);
    LR_FINISH.back(ctx,q,1280);const expected=Array.from(ctx.getImageData(x,y,1,1).data);
    ctx.fillStyle='#ff00ff';ctx.fillRect(x-2,y-2,5,5);LR_FINISH.front(ctx,q,1280,g.walkAt+1.4);
    return {expected,actual:Array.from(ctx.getImageData(x,y,1,1).data)};
  });
  assert.ok(pole.actual.every((v,i)=>Math.abs(v-pole.expected[i])<5),'The original brass pole occludes the passenger inside the carriage');
  for(const [name,age] of [['run',scene.gate.turnAt-.5],['door',scene.gate.turnAt+.2],['step',scene.gate.walkAt+.65],['inside',scene.gate.walkAt+1.9]]) {
    await page.evaluate(age=>{ni=age;Kt=0;ir=q.y;Vu();vu();},age);
    await page.screenshot({path:`review/v121/boarding/${name}.png`});
  }
  await page.evaluate(()=>{ni=LR_FINISH.inspect(q).walkAt+.4;sr();});
  const held=await page.evaluate(()=>ni);await page.clock.runFor(450);
  assert.equal(await page.evaluate(()=>ni),held,'Pause freezes the walking phase');
  await page.evaluate(()=>CQ());
  const airborne=await enter(true);
  const landing=await page.evaluate(()=>{
    const t=LR_FINISH.inspect(q).landAt;return [LR_FINISH.actor(q,t-.0001),LR_FINISH.actor(q,t+.0001)];
  });
  assert.ok(landing[0].x<airborne.gate.threshold&&landing[1].x<airborne.gate.threshold,'Airborne arrivals land outside the door');
  assert.ok(Math.abs(landing[0].y-landing[1].y)<1,'Feet meet the descending apron without a vertical snap');
  await page.emulateMedia({reducedMotion:'reduce'});
  assert.equal(await page.evaluate(()=>LR_FINISH.actor(q,.4).action),'idle');
  assert.equal(await page.evaluate(()=>LR_FINISH.duration(q)),.7);
  assert.deepEqual(errors,[]);
  console.log('PASS normal run → four-frame turn → eight rear-view walking poses, receding floor/perspective, real handrail occlusion, pause and airborne/reduced-motion arrivals.');
} finally {await browser.close();}
