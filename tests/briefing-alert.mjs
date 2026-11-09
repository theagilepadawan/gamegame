import assert from 'node:assert/strict';
import {mkdir} from 'node:fs/promises';
import {chromium} from 'playwright';

const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox','--enable-unsafe-swiftshader']});
await mkdir('review/v125/alert',{recursive:true});
try {
  const page=await browser.newPage({viewport:{width:1280,height:720}}),errors=[];
  page.on('pageerror',error=>errors.push(error.message));
  const url=new URL(process.env.TEST_URL||'http://127.0.0.1:4181/');url.searchParams.set('unlock','all');
  await page.goto(url.href,{waitUntil:'networkidle'});
  await page.waitForFunction(()=>window.LR_BRIEFING?.inspect().portraitsReady&&LR_BRIEFING.inspect().reactionReady&&!document.querySelector('#splash')&&!document.querySelector('#start').disabled);
  await page.evaluate(()=>{Cu(false);fu('opening');});await page.locator('[data-character="nicolai"]').click();
  await page.evaluate(()=>{
    window.alertCalls=0;const original=SA.clip.bind(SA);
    SA.clip=id=>{if(id==='mission-alert')window.alertCalls++;return original(id);};
  });
  function portraitHashes(){
    const ctx=document.querySelector('[data-person="nicolai"] canvas').getContext('2d');
    const hash=(x,y,w,h)=>{let n=2166136261;for(const v of ctx.getImageData(x,y,w,h).data)n=Math.imul(n^v,16777619);return n>>>0};
    return {hair:hash(130,0,260,120),jacket:hash(0,400,512,112),face:hash(140,140,220,190)};
  }
  await page.locator('#start').click();
  await page.waitForFunction(()=>LR_BRIEFING.inspect().phase==='talk');
  assert.equal(await page.evaluate(()=>window.alertCalls),0,'Grete’s first line does not trigger a premature reaction');
  assert.equal(await page.locator('.briefing-alert').isVisible(),false);
  assert.equal(await page.locator('.briefing-link b').textContent(),'06:00');
  assert.equal(await page.locator('.briefing-unknown').textContent(),'???');
  assert.equal(await page.evaluate(()=>SA.musicAudible),false);
  assert.equal(await page.evaluate(()=>[SA.track,...Object.values(SA.musicTracks)].every(t=>t.paused)),true,'Music is stopped throughout comms, not just ducked');
  const neutral=await page.evaluate(portraitHashes);
  await page.locator('.briefing-next').click();
  const surprise=await page.evaluate(portraitHashes);
  assert.equal(neutral.hair,surprise.hair);assert.equal(neutral.jacket,surprise.jacket);assert.notEqual(neutral.face,surprise.face);
  assert.equal(await page.evaluate(()=>LR_BRIEFING.inspect().frames.nicolai),4,'The first reply starts with a surprised expression');
  await page.waitForFunction(()=>LR_BRIEFING.inspect().alertAge>100&&SA.clips['mission-alert'].currentTime>.03);
  assert.equal(await page.evaluate(()=>window.alertCalls),1);
  assert.equal(await page.evaluate(()=>SA.activeClip===SA.clips['mission-alert']&&SA.ducked),true);
  const duration=await page.evaluate(()=>SA.clips['mission-alert'].duration);
  assert.ok(duration>1.5&&duration<1.7,'Only the silent lead-in is removed for synchronized playback');
  const peak=await page.evaluate(async()=>{
    const analyser=SA.ctx.createAnalyser();analyser.fftSize=1024;SA.fx.connect(analyser);
    const samples=new Float32Array(1024);let peak=0;
    try {for(let i=0;i<6;i++){await new Promise(r=>setTimeout(r,25));analyser.getFloatTimeDomainData(samples);peak=Math.max(peak,Math.sqrt(samples.reduce((s,v)=>s+v*v,0)/samples.length));}return peak;}
    finally{SA.fx.disconnect(analyser);analyser.disconnect();}
  });
  assert.ok(peak>.001,'The supplied cue reaches the effects audio graph');
  await page.screenshot({path:'review/v125/alert/desktop.png'});
  await page.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,get:()=>true});document.dispatchEvent(new Event('visibilitychange'));});
  const held=await page.evaluate(()=>({age:LR_BRIEFING.inspect().alertAge,time:SA.clips['mission-alert'].currentTime}));
  await page.waitForTimeout(250);
  assert.equal(await page.evaluate(()=>SA.clips['mission-alert'].paused),true);
  assert.equal(await page.evaluate(()=>LR_BRIEFING.inspect().alertAge),held.age);
  assert.ok(Math.abs(await page.evaluate(()=>SA.clips['mission-alert'].currentTime)-held.time)<.04);
  await page.evaluate(()=>{delete document.hidden;document.dispatchEvent(new Event('visibilitychange'));});
  await page.waitForFunction(time=>SA.clips['mission-alert'].currentTime>time+.05,held.time);
  assert.equal(await page.evaluate(()=>window.alertCalls),1,'Visibility resumes the same cue without replay');
  await page.waitForTimeout(2300);
  assert.equal(await page.locator('.briefing-alert').isVisible(),true,'The mark stays until the reader advances');
  assert.equal(await page.evaluate(()=>LR_BRIEFING.inspect().frames.nicolai),4,'Surprise stays for the whole first reply');
  const settled=await page.evaluate(portraitHashes);
  assert.equal(neutral.hair,settled.hair);assert.equal(neutral.jacket,settled.jacket);assert.equal(surprise.face,settled.face);
  await page.locator('.briefing-next').click();assert.equal(await page.evaluate(()=>window.alertCalls),1);
  assert.equal(await page.locator('.briefing-alert').isVisible(),false,'Next dialogue removes the mark immediately');
  await page.locator('.briefing-next').click();
  assert.equal(await page.evaluate(()=>LR_BRIEFING.inspect().frames.nicolai),5,'The final answer uses the smile drawing');
  assert.equal(await page.evaluate(()=>SA.musicAudible),false,'Music remains stopped on the last line');
  await page.screenshot({path:'review/v125/alert/smile.png'});
  await page.locator('.briefing-skip').click();
  assert.equal(await page.evaluate(()=>SA.clips['mission-alert'].paused&&!SA.ducked),true,'Leaving the call stops the effect and restores music');
  await page.evaluate(()=>Cu(false));
  async function launch() {await page.evaluate(()=>{LR_BRIEFING.cancel();LR_BRIEFING.launch({character:'nicolai',audio:SA,onComplete:()=>{}});document.querySelector('.briefing-next').click();});}
  await launch();await page.locator('.briefing-next').click();
  assert.equal(await page.evaluate(()=>LR_BRIEFING.inspect().alertPlayed),true,'A quick reader still gets one reaction on Nicolai’s first reply');
  const once=await page.evaluate(()=>window.alertCalls);await page.locator('.briefing-next').click();
  assert.equal(await page.evaluate(()=>window.alertCalls),once);
  await page.evaluate(()=>LR_BRIEFING.cancel());await page.waitForTimeout(950);
  assert.equal(await page.evaluate(()=>SA.musicHolds.size),0,'Cancellation releases the music hold');
  assert.equal(await page.evaluate(()=>window.alertCalls),once,'No delayed sound after cancellation');
  await page.evaluate(()=>{if(SA.enabled)SA.toggle();});await launch();await page.locator('.briefing-next').click();
  await page.waitForFunction(()=>LR_BRIEFING.inspect().alertAge>100);
  assert.equal(await page.evaluate(()=>SA.clips['mission-alert'].paused&&!SA.enabled),true,'Saved mute still allows the visual reaction');
  await page.evaluate(()=>LR_BRIEFING.cancel());await page.evaluate(()=>SA.toggle());
  for(const viewport of [{width:844,height:390},{width:568,height:320},{width:390,height:844}]) {
    await page.setViewportSize(viewport);await launch();await page.locator('.briefing-next').click();await page.waitForFunction(()=>LR_BRIEFING.inspect().alertAge>200);
    const icon=await page.locator('.briefing-alert').boundingBox(), portrait=await page.locator('[data-person="nicolai"] canvas').boundingBox(), heading=await page.locator('.briefing-heading').boundingBox();
    assert.ok(icon.x>=0&&icon.y>=heading.y+heading.height&&icon.x+icon.width<=viewport.width&&icon.y+icon.height<=portrait.y+2,'Reaction stays above his head, clear of the header');
    if(viewport.width===568)await page.screenshot({path:'review/v125/alert/mobile.png'});
    await page.evaluate(()=>LR_BRIEFING.cancel());
  }
  await page.emulateMedia({reducedMotion:'reduce'});await launch();await page.locator('.briefing-next').click();await page.waitForFunction(()=>LR_BRIEFING.inspect().alertAge>100);
  const motion=await page.locator('.briefing-alert').evaluate(el=>{const m=new DOMMatrix(getComputedStyle(el).transform);return [m.a,m.d,m.f];});
  assert.deepEqual(motion,[1,1,0],'Reduced motion keeps the mark still');
  await page.evaluate(()=>LR_BRIEFING.cancel());assert.deepEqual(errors,[]);
  console.log('PASS one styled reaction and real supplied audio; quick advance, mute, visibility, cancellation, compact layouts and reduced motion.');
} finally {await browser.close();}
