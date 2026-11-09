import assert from 'node:assert/strict';
import {mkdir} from 'node:fs/promises';
import {chromium} from 'playwright';
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH || '/usr/bin/chromium',args:['--no-sandbox','--enable-unsafe-swiftshader']});
await mkdir('review/v120/film',{recursive:true});
try {
  const page=await browser.newPage({viewport:{width:1280,height:720},reducedMotion:'reduce'}), errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  const url=new URL(process.env.TEST_URL || 'http://127.0.0.1:4181/');url.searchParams.set('unlock','all');
  await page.goto(url.href,{waitUntil:'networkidle'});
  await page.waitForFunction(()=>window.LR_CINEMA && !document.querySelector('#splash') && !document.querySelector('#start').disabled);
  await page.keyboard.press('h');
  async function win() {
    await page.evaluate(()=>{Cu(false);fu('midtown');});
    await page.waitForFunction(()=>_i);
    await page.evaluate(()=>{
      Ko('chapter');q.chapterTime=59.999;q.chapterDistance=q.distance=60*320;
      q.y=q.floorY;q.grounded=true;q.flight=false;q.flightLanding=0;q.invincible=999;
      q.step(1/120);FD();ni=LR_FINISH.duration(q)-.005;
    });
    await page.waitForFunction(()=>longRun.state==='over');
    assert.equal(await page.locator('#results').isVisible(),true,'Winning immediately shows results');
    assert.equal(await page.evaluate(()=>LR_CINEMA.inspect().active),false,'Winning alone never plays the film');
    assert.equal(await page.evaluate(()=>LR_CH.completed('midtown')),true);
    assert.equal(await page.locator('#results').getAttribute('data-primary'),'next-chapter');
    assert.equal(await page.evaluate(()=>document.activeElement.id),'next-chapter');
  }
  async function startFilm() {
    await win();
    await page.locator('#next-chapter').click();
    await page.waitForFunction(()=>longRun.state==='cutscene' && LR_CINEMA.inspect().width===1280);
    assert.equal(await page.locator('#results').isVisible(),false);
  }
  await startFilm();
  const initial=await page.evaluate(()=>({film:LR_CINEMA.inspect(),ducked:SA.ducked,active:SA.activeMusic,
    othersPaused:SA.track.paused&&SA.musicTracks.title.paused&&SA.musicTracks.contrarian.paused,
    scene:SA.scene,muted:document.querySelector('#chapter-video').muted}));
  assert.equal(initial.film.height,530,'Encoded black band remains cropped');
  assert.ok(initial.film.duration>4 && initial.film.duration<4.1);
  assert.equal(initial.scene,'cutscene');assert.equal(initial.active,'gift');assert.equal(initial.ducked,false);
  assert.equal(initial.othersPaused,true,'Piano replaces the chapter song');assert.equal(initial.muted,true);
  await page.waitForFunction(()=>LR_CINEMA.inspect().time>.5 && SA.musicTracks.gift.currentTime>.2);
  const peakRms=await page.evaluate(async()=>{
    const analyser=SA.ctx.createAnalyser();analyser.fftSize=1024;SA.limiter.connect(analyser);
    let peak=0;const samples=new Float32Array(analyser.fftSize);
    try {
      for(let i=0;i<8;i++){
        await new Promise(resolve=>setTimeout(resolve,30));analyser.getFloatTimeDomainData(samples);
        peak=Math.max(peak,Math.sqrt(samples.reduce((total,value)=>total+value*value,0)/samples.length));
      }
      return peak;
    } finally {SA.limiter.disconnect(analyser);analyser.disconnect();}
  });
  assert.ok(peakRms>.0002,`Gift piano reaches the audio output graph (RMS ${peakRms})`);
  await page.screenshot({path:'review/v120/film/desktop.png'});
  await page.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,get:()=>true});document.dispatchEvent(new Event('visibilitychange'));});
  const paused=await page.evaluate(()=>({t:LR_CINEMA.inspect().time,v:document.querySelector('#chapter-video').paused,a:SA.musicTracks.gift.paused}));
  assert.equal(paused.v,true);assert.equal(paused.a,true);
  await page.waitForTimeout(350);
  assert.ok(Math.abs(await page.evaluate(()=>LR_CINEMA.inspect().time)-paused.t)<.05);
  await page.evaluate(()=>{delete document.hidden;document.dispatchEvent(new Event('visibilitychange'));});
  await page.waitForFunction(()=>longRun.state==='playing' && q.districtId==='park',null,{timeout:10000});
  assert.equal(await page.evaluate(()=>LR_CINEMA.inspect().reason),'ended','Actual video end starts Central Park');
  assert.equal(await page.evaluate(()=>SA.activeMusic===null && SA.musicTracks.gift.paused && LR_CH.track(SA)==='park'),true);
  assert.equal(await page.evaluate(()=>SA.ducked),false);
  // Choosing Park from the map, even after a Midtown win, must bypass the film.
  await page.evaluate(()=>{Cu(false);fu('park');});await page.waitForFunction(()=>_i);
  await page.locator('#start').click();
  await page.waitForFunction(()=>longRun.state==='playing' && q.districtId==='park');
  assert.equal(await page.evaluate(()=>LR_CINEMA.inspect().active),false);
  assert.equal(await page.locator('#chapter-film').isVisible(),false);
  await page.setViewportSize({width:844,height:390});await startFilm();
  const box=await page.locator('#chapter-video').boundingBox();
  assert.ok(box.x>=0 && box.y>=0 && box.x+box.width<=844 && box.y+box.height<=390);
  await page.screenshot({path:'review/v120/film/mobile.png'});
  await page.keyboard.press('Escape');
  assert.equal(await page.evaluate(()=>longRun.state==='playing' && q.districtId==='park'),true);
  assert.equal(await page.evaluate(()=>LR_CINEMA.inspect().reason),'skipped');
  await startFilm();await page.evaluate(()=>Cu(false));
  await page.evaluate(()=>document.querySelector('#chapter-video').dispatchEvent(new Event('ended')));
  assert.equal(await page.evaluate(()=>longRun.state),'home','Stale ending cannot launch a course after leaving');
  await page.evaluate(()=>{
    const v=document.querySelector('#chapter-video'),native=v.play.bind(v);let calls=0;
    window.restoreFilmPlay=()=>{delete v.play;};
    v.play=()=>++calls===1?new Promise(resolve=>{window.resolveOldFilmPlay=resolve;}):native();
  });
  await startFilm();await page.evaluate(()=>Cu(false));await startFilm();
  await page.waitForFunction(()=>!document.querySelector('#chapter-video').paused && LR_CINEMA.inspect().time>.05);
  await page.evaluate(()=>window.resolveOldFilmPlay());await page.waitForTimeout(80);
  assert.equal(await page.evaluate(()=>document.querySelector('#chapter-video').paused),false,'Old play completion cannot pause a newer screening');
  await page.evaluate(()=>window.restoreFilmPlay());await page.locator('.film-skip').click();
  // Mute also governs the new cue; skipping it must not unmute the Park song.
  await win();await page.evaluate(()=>{if(SA.enabled)SA.toggle();});
  await page.locator('#next-chapter').click();
  assert.equal(await page.evaluate(()=>SA.musicTracks.gift.paused && !SA.enabled),true);
  await page.locator('.film-skip').click();
  assert.equal(await page.evaluate(()=>!SA.enabled && SA.track.paused && q.districtId==='park'),true);
  await page.evaluate(()=>SA.toggle());
  await startFilm();await page.evaluate(()=>document.querySelector('#chapter-video').dispatchEvent(new Event('error')));
  assert.equal(await page.evaluate(()=>longRun.state==='playing' && q.districtId==='park'),true,'Decoder failure cannot trap the player');
  assert.equal(await page.evaluate(()=>LR_CINEMA.inspect().reason),'unavailable');
  const exclusions=await page.evaluate(()=>['opening','park','midtown'].flatMap(id=>[
    LR_CINEMA.eligible({mode:'chapter',districtId:id,won:false},'park'),
    LR_CINEMA.eligible({mode:'endless',districtId:id,won:true},'park'),
    LR_CINEMA.eligible({mode:'chapter',districtId:id,won:true},undefined)]));
  assert.ok(exclusions.every(x=>!x));
  assert.deepEqual(errors,[]);
  console.log('PASS results first; film only on Midtown Next → Park; exclusive piano, actual ended → Park, direct Park exclusion, mute, hidden-tab pause, mobile fit, Skip, cancellation and decoder failure.');
} finally {await browser.close();}
