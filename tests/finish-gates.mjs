import assert from 'node:assert/strict';
import {mkdir} from 'node:fs/promises';
import {chromium} from 'playwright';

const proof=process.env.FINISH_PROOF_DIR || 'review/v120/finish';
await mkdir(proof,{recursive:true});
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH || '/usr/bin/chromium',args:['--no-sandbox','--enable-unsafe-swiftshader']});
const errors=[];
try {
  const page=await browser.newPage({viewport:{width:1280,height:720},reducedMotion:'reduce'});
  page.on('pageerror',e=>errors.push(e.message));
  const url=new URL(process.env.TEST_URL || 'http://127.0.0.1:4181/'); url.searchParams.set('unlock','all');
  await page.goto(url.href,{waitUntil:'networkidle'});
  await page.waitForFunction(()=>window.LR_FINISH && !document.querySelector('#splash') && !document.querySelector('#start').disabled);
  await page.emulateMedia({reducedMotion:'no-preference'});
  await page.clock.install(); await page.clock.pauseAt(new Date(Date.now()+100));
  async function approach(id,runner,airborne) {
    if(await page.evaluate(()=>!!window.LongRunReveal?.active)) {
      await page.evaluate(()=>document.querySelector('.hr-done').click()); await page.clock.runFor(450);
    }
    await page.evaluate(()=>Cu(false));
    await page.locator(`[data-character="${runner}"]`).click();
    await page.evaluate(id=>LR_MENU.focusChapter(id),id); await page.clock.runFor(32);
    await page.evaluate(({id,airborne})=>{
      Ko('chapter');
      // Move the existing authored world to its final second, then use actual
      // model physics/events to cross the line. No forced won flag.
      const target=(id==='opening'?Ri:60)-1;
      const distance=id==='opening'?ee(target):ye*target, delta=distance-q.chapterDistance;
      for(const list of [q.obstacles,q.platforms,q.pickups,q.springs,q.worldItems||[]])for(const o of list)o.x-=delta;
      q.chapterTime=target; q.chapterDistance=q.distance=distance;
      q.jetpackCollected=true; q.bossProgress=3; q.flight=false; q.flightLanding=0;
      q.y=q.floorY; q.grounded=true; q.support=null; q.shield=false; ir=q.y; Kt=0;
      for(let i=0;i<112;i++){q.step(1/120);FD();}
      if(airborne){q.y=q.floorY-140;q.vy=-420;q.grounded=false;}
      vu();
    },{id,airborne});
  }
  for(const id of ['opening','midtown','park'])for(const runner of ['nicolai','trond']) {
    await approach(id,runner,runner==='trond');
    const pre=await page.evaluate(()=>({won:q.won,gate:LR_FINISH.inspect(q)}));
    assert.equal(pre.won,false,'Approach does not prematurely complete the chapter');
    assert.equal(pre.gate.ready,true);
    assert.ok(pre.gate.threshold>600,'Doorway waits on the far right of the desktop course');
    await page.evaluate(()=>{for(let i=0;i<12&&!q.won;i++){q.step(1/120);FD();}ni=0;vu();});
    const sequence=await page.evaluate(()=>{
      const gate=LR_FINISH.inspect(q),duration=LR_FINISH.duration(q);
      return {won:q.won,gate,duration,frames:[0,.6,1.3,duration-.05].map(t=>LR_FINISH.actor(q,t))};
    });
    assert.equal(sequence.won,true,`${id}/${runner}: actual completion event starts the entrance`);
    assert.equal(sequence.gate.active,true);
    const [start,inside,near,hidden]=sequence.frames;
    assert.ok(start.x<inside.x && inside.x<near.x && near.x<hidden.x,'Run-in advances monotonically');
    assert.ok(hidden.x>sequence.gate.pier+55,'Runner reaches behind the near pier');
    assert.equal(hidden.y,sequence.gate.interiorFloor,'Runner finishes on the entrance interior floor plane');
    assert.equal(start.action,runner==='trond'?'jump':'run','An airborne finish continues its existing trajectory');
    for(const frame of sequence.frames) if(frame.action==='jump'||frame.action==='fall') {
      assert.ok(frame.x+25<=sequence.gate.threshold,'The runner lands outside the entrance, without jumping through its lintel');
    }
    // A real foreground occlusion probe, at runner height and inside the pier.
    const occlusion=await page.evaluate(()=>{
      const canvas=document.createElement('canvas');canvas.width=1200;canvas.height=600;
      const c=canvas.getContext('2d'),g=LR_FINISH.inspect(q),x=Math.ceil(g.pier+35),y=g.floor-55;
      LR_FINISH.back(c,q,1200);const back=Array.from(c.getImageData(x,y,1,1).data);
      c.fillStyle='#ff00ff';c.fillRect(x-4,y-4,8,8);LR_FINISH.front(c,q,1200);
      return {back,front:Array.from(c.getImageData(x,y,1,1).data)};
    });
    assert.ok(occlusion.front.every((v,i)=>Math.abs(v-occlusion.back[i])<5),'Stone pier hides the runner, rather than fading the whole character');
    if(runner==='nicolai') {
      await page.evaluate(()=>{ni=LR_FINISH.duration(q)*.64;Vu();vu();});
      await page.screenshot({path:`${proof}/${id}-enter.png`});
    }
    await page.evaluate(()=>{ni=.5;sr();}); await page.clock.fastForward(1200);
    assert.equal(await page.evaluate(()=>ni),.5,'Pausing freezes the finish sequence');
    await page.evaluate(()=>{CQ();ni=LR_FINISH.duration(q)-.01;}); await page.clock.runFor(48);
    assert.equal(await page.evaluate(()=>longRun.state),'over','Results immediately follow the run-in');
    assert.equal(await page.evaluate(()=>LR_CINEMA.inspect().active),false,'The gift film waits for Next: Central Park');
    assert.equal(await page.evaluate(id=>LR_CH.completed(id),id),true,'Chapter completion remains persistent');
    if(id!=='park') assert.equal(await page.locator('#results').getAttribute('data-primary'),'next-chapter','Next chapter remains the default action');
  }
  // Boss completion is still mandatory even when the ending time has elapsed.
  const boss=await page.evaluate(()=>{const r=new hi(960,42,{mode:'chapter',procedural:true});r.chapterTime=75;r.chapterDistance=ee(75);r.jetpackCollected=true;r.bossProgress=2;r.y=r.floorY;r.step(1/120);return r.won;});
  assert.equal(boss,false,'New exit cannot bypass the IPO boss');
  await page.emulateMedia({reducedMotion:'reduce'});
  await approach('park','nicolai',false);
  await page.evaluate(()=>{for(let i=0;i<12&&!q.won;i++){q.step(1/120);FD();}});
  assert.equal(await page.evaluate(()=>LR_FINISH.actor(q,.4).action),'idle','Reduced motion skips the decorative run-in');
  assert.equal(await page.evaluate(()=>LR_FINISH.duration(q)),.7);
  await page.evaluate(()=>{Cu(false);LR_CH.order.forEach(id=>LR_CH.done(id));Ko('endless');});
  assert.equal(await page.evaluate(()=>LR_FINISH.inspect(q)),null,'Endless has no chapter entrance');
  assert.deepEqual(errors,[]);
  console.log('PASS three real chapter completions × both runners; airborne arrival, grounded thresholds, foreground occlusion, pause/resume, progression, boss requirement, reduced motion and Endless exclusion.');
} finally {await browser.close();}
