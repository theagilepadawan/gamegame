import assert from 'node:assert/strict';
import {mkdir} from 'node:fs/promises';
import {chromium} from 'playwright';
const proof=process.env.FINISH_PROOF_DIR || 'review/v118/finish';
await mkdir(proof,{recursive:true});
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH || '/usr/bin/chromium',args:['--no-sandbox','--enable-unsafe-swiftshader']});
const errors=[];
try {
  const context=await browser.newContext({viewport:{width:568,height:320},hasTouch:true,isMobile:true,deviceScaleFactor:2});
  const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
  const url=new URL(process.env.TEST_URL || 'http://127.0.0.1:4181/');url.searchParams.set('unlock','all');
  await page.goto(url.href,{waitUntil:'networkidle'});
  await page.waitForFunction(()=>window.longRun?.environment.ready && !document.querySelector('#splash') && !document.querySelector('#start').disabled);
  await page.clock.install();await page.clock.pauseAt(new Date(Date.now()+100));
  for(const id of ['opening','midtown','park']) {
    const placement=await page.evaluate(id=>{
      Cu(false);fu(id);Ko('chapter');
      q.chapterTime=id==='opening'?75:60;q.chapterDistance=q.distance=id==='opening'?ee(75):ye*60;
      q.obstacles=[];q.pickups=[];q.platforms=[];q.worldItems=[];q.y=q.floorY;q.grounded=true;q.shield=false;
      q.won=true;LR_FINISH.begin(q);ni=LR_FINISH.duration(q)*.64;Kt=0;ir=q.y;Vu();vu();
      const gate=LR_FINISH.inspect(q),actor=LR_FINISH.actor(q,ni);
      return {gate,actor,width:eA,height:kA,pixi:longRun.environment.compositing};
    },id);
    assert.equal(placement.gate.ready,true);
    assert.equal(placement.pixi,true,'The existing Pixi compositor renders the entrance on touch screens');
    assert.ok(placement.gate.threshold>placement.width*.6 && placement.gate.pier<placement.width && placement.gate.pier>placement.width*.7,'Doorway and near pier remain visible on the far right of the touch viewport');
    assert.ok(placement.actor.y<placement.height-55,'Grounding clears touch controls');
    if(id==='midtown') assert.ok(placement.gate.hostX>placement.width*.9 && placement.gate.hostX<placement.width-40,'The office host is grounded at the far right of 505');
    await page.screenshot({path:`${proof}/${id}-mobile-pixi.png`});
    await page.evaluate(()=>vu(true));
    assert.equal(await page.evaluate(()=>uo),false,'Canvas fallback is exercised');
    const visible=await page.evaluate(()=>{
      const gate=LR_FINISH.inspect(q),scale=ht.width/eA;
      return d.getImageData(Math.floor((gate.pier+30)*scale),Math.floor((gate.floor-50)*scale),1,1).data[3];
    });
    assert.ok(visible>245,'Foreground stone is opaque in the Canvas fallback');
    if(id==='park')await page.screenshot({path:`${proof}/park-mobile-canvas.png`});
  }
  assert.deepEqual(errors,[]);
  console.log('PASS all three entrances at 568×320 touch / DPR2, grounded placement, doorway fit, existing Pixi compositor and Canvas fallback.');
} finally {await browser.close();}
