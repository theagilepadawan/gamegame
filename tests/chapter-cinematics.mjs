import assert from 'node:assert/strict';
import {mkdir} from 'node:fs/promises';
import {chromium} from 'playwright';
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH || '/usr/bin/chromium',args:['--no-sandbox','--enable-unsafe-swiftshader']});
await mkdir('review/v119/film',{recursive:true});
try {
  const page=await browser.newPage({viewport:{width:1280,height:720},reducedMotion:'reduce'}), errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  const url=new URL(process.env.TEST_URL || 'http://127.0.0.1:4181/');url.searchParams.set('unlock','all');
  await page.goto(url.href,{waitUntil:'networkidle'});
  await page.waitForFunction(()=>window.LR_CINEMA && !document.querySelector('#splash') && !document.querySelector('#start').disabled);
  await page.keyboard.press('h');
  async function win() {
    await page.evaluate(()=>{
      Cu(false);fu('midtown');Ko('chapter');
      q.chapterTime=59.999;q.chapterDistance=q.distance=60*320;q.y=q.floorY;q.grounded=true;
      q.flight=false;q.flightLanding=0;q.invincible=999;
      q.step(1/120);FD();ni=LR_FINISH.duration(q)-.005;
    });
    await page.waitForFunction(()=>longRun.state==='cutscene');
    assert.equal(await page.locator('#results').isVisible(),false,'Summary waits for the scene');
    await page.waitForFunction(()=>LR_CINEMA.inspect().width===1280);
  }
  await win();
  const initial=await page.evaluate(()=>({film:LR_CINEMA.inspect(),ducked:SA.ducked,track:LR_CH.track(SA),scene:SA.scene,muted:document.querySelector('#chapter-video').muted}));
  assert.equal(initial.film.height,530,'The black source band is actually cropped out of the video');
  assert.ok(initial.film.duration>4 && initial.film.duration<4.1);
  assert.equal(initial.scene,'cutscene');assert.equal(initial.track,'midtown');assert.equal(initial.ducked,true);assert.equal(initial.muted,true);
  await page.waitForFunction(()=>LR_CINEMA.inspect().time>.5);
  await page.screenshot({path:'review/v119/film/desktop.png'});
  // Verify a hidden tab pauses both media clocks and does not skip the gift.
  await page.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,get:()=>true});document.dispatchEvent(new Event('visibilitychange'));});
  const paused=await page.evaluate(()=>({t:LR_CINEMA.inspect().time,v:document.querySelector('#chapter-video').paused,a:SA.track.paused}));
  assert.equal(paused.v,true);assert.equal(paused.a,true);
  await page.waitForTimeout(350);
  assert.ok(Math.abs(await page.evaluate(()=>LR_CINEMA.inspect().time)-paused.t)<.05);
  await page.evaluate(()=>{delete document.hidden;document.dispatchEvent(new Event('visibilitychange'));});
  await page.waitForFunction(()=>longRun.state==='over',null,{timeout:10000});
  assert.equal(await page.evaluate(()=>LR_CINEMA.inspect().reason),'ended','Actual decoded video ending opens the summary');
  assert.equal(await page.locator('#results').getAttribute('data-primary'),'next-chapter');
  assert.equal(await page.evaluate(()=>SA.ducked),false);
  assert.equal(await page.evaluate(()=>document.activeElement.id),'next-chapter');
  await page.locator('#next-chapter').click();
  assert.equal(await page.evaluate(()=>q.districtId),'park');
  assert.equal(await page.evaluate(()=>LR_CINEMA.inspect().active),false);
  // Real compact-screen playback and keyboard skip retain the full crop.
  await page.setViewportSize({width:844,height:390});await win();
  const box=await page.locator('#chapter-video').boundingBox();
  assert.ok(box.x>=0 && box.y>=0 && box.x+box.width<=844 && box.y+box.height<=390);
  await page.screenshot({path:'review/v119/film/mobile.png'});
  await page.keyboard.press('Escape');
  assert.equal(await page.evaluate(()=>longRun.state),'over');
  assert.equal(await page.evaluate(()=>LR_CINEMA.inspect().reason),'skipped');
  await win();await page.evaluate(()=>Cu(false));
  await page.evaluate(()=>document.querySelector('#chapter-video').dispatchEvent(new Event('ended')));
  assert.equal(await page.evaluate(()=>longRun.state),'home','A stale ending cannot open a summary after leaving');
  // A cancelled media play promise may resolve during a later screening.
  await page.evaluate(()=>{
    const v=document.querySelector('#chapter-video'),native=v.play.bind(v);let calls=0;
    window.restoreFilmPlay=()=>{delete v.play;};
    v.play=()=>++calls===1?new Promise(resolve=>{window.resolveOldFilmPlay=resolve;}):native();
  });
  await win();await page.evaluate(()=>Cu(false));await win();
  await page.waitForFunction(()=>!document.querySelector('#chapter-video').paused && LR_CINEMA.inspect().time>.05);
  await page.evaluate(()=>window.resolveOldFilmPlay());await page.waitForTimeout(80);
  assert.equal(await page.evaluate(()=>document.querySelector('#chapter-video').paused),false,'Old play completion cannot pause the newer screening');
  await page.evaluate(()=>window.restoreFilmPlay());await page.locator('.film-skip').click();
  await win();await page.evaluate(()=>document.querySelector('#chapter-video').dispatchEvent(new Event('error')));
  assert.equal(await page.evaluate(()=>longRun.state),'over','Decoder failure cannot trap the player');
  assert.equal(await page.evaluate(()=>LR_CINEMA.inspect().reason),'unavailable');
  const exclusions=await page.evaluate(()=>['opening','park','midtown'].map(id=>[LR_CINEMA.eligible({mode:'chapter',districtId:id,won:false}),LR_CINEMA.eligible({mode:'endless',districtId:id,won:true})]));
  assert.ok(exclusions.flat().every(x=>!x));
  assert.deepEqual(errors,[]);
  console.log('PASS cropped 1280×530 film, real ended event, transition ordering, music ducking, hidden tab pause/resume, mobile fit, Skip, cancellation, decoder failure, next chapter and Story-only eligibility.');
} finally {await browser.close();}
