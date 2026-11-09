import assert from 'node:assert/strict';
import {mkdir} from 'node:fs/promises';
import {chromium} from 'playwright';

await mkdir('review/v125/dial',{recursive:true});
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox','--enable-unsafe-swiftshader']});
try {
  const page=await browser.newPage({viewport:{width:1280,height:720}}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  const url=new URL(process.env.TEST_URL||'http://127.0.0.1:4181/');url.searchParams.set('unlock','all');
  await page.goto(url.href,{waitUntil:'networkidle'});
  await page.waitForFunction(()=>window.LR_BRIEFING?.inspect().portraitsReady&&!document.querySelector('#splash')&&!document.querySelector('#start').disabled);
  await page.evaluate(()=>{Cu(false);fu('opening');});
  await page.locator('[data-character="nicolai"]').click();
  await page.evaluate(()=>{window.rings=0;const clip=SA.clip.bind(SA);SA.clip=id=>{if(id==='gdl-ring')window.rings++;return clip(id);};});
  await page.locator('#start').click();
  assert.equal(await page.evaluate(()=>LR_BRIEFING.inspect().phase),'ringing');
  await page.waitForFunction(()=>SA.clips['gdl-ring'].currentTime>.04);
  assert.equal(await page.locator('.briefing-connection').isVisible(),false,'Portrait conversation waits for connection');
  assert.equal(await page.evaluate(()=>SA.musicAudible),false);
  assert.equal(await page.evaluate(()=>[SA.track,...Object.values(SA.musicTracks)].every(t=>t.paused)),true);
  const peak=await page.evaluate(async()=>{
    const analyser=SA.ctx.createAnalyser();analyser.fftSize=1024;SA.fx.connect(analyser);
    const data=new Float32Array(1024);let peak=0;
    try{for(let i=0;i<8;i++){await new Promise(r=>setTimeout(r,25));analyser.getFloatTimeDomainData(data);peak=Math.max(peak,Math.sqrt(data.reduce((sum,n)=>sum+n*n,0)/data.length));}return peak;}
    finally{SA.fx.disconnect(analyser);analyser.disconnect();}
  });
  assert.ok(peak>.002,'The two-recording mix reaches the effects audio graph');
  await page.screenshot({path:'review/v125/dial/ringing.png'});
  await page.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,get:()=>true});document.dispatchEvent(new Event('visibilitychange'));});
  const held=await page.evaluate(()=>({age:LR_BRIEFING.inspect().dialAge,time:SA.clips['gdl-ring'].currentTime}));
  await page.waitForTimeout(250);
  assert.equal(await page.evaluate(()=>LR_BRIEFING.inspect().dialAge),held.age);
  assert.equal(await page.evaluate(()=>SA.clips['gdl-ring'].paused),true);
  assert.ok(Math.abs(await page.evaluate(()=>SA.clips['gdl-ring'].currentTime)-held.time)<.04);
  await page.evaluate(()=>{delete document.hidden;document.dispatchEvent(new Event('visibilitychange'));});
  await page.waitForFunction(time=>SA.clips['gdl-ring'].currentTime>time+.03,held.time);
  assert.equal(await page.evaluate(()=>window.rings),1,'Returning to the tab resumes rather than replaying the ring');
  await page.waitForFunction(()=>LR_BRIEFING.inspect().dialAge>3450);
  assert.equal(await page.locator('.dial-brand').textContent(),'GreteDirectLine');
  const expanded=await page.locator('.dial-suffix').evaluateAll(els=>els.every(el=>parseFloat(getComputedStyle(el).maxWidth)>20&&+getComputedStyle(el).opacity===1));
  assert.equal(expanded,true,'Each GDL letter unfolds into its own word');
  await page.screenshot({path:'review/v125/dial/connected.png'});
  await page.waitForFunction(()=>LR_BRIEFING.inspect().phase==='talk');
  assert.equal(await page.evaluate(()=>SA.clips['gdl-ring'].paused),true);
  assert.equal(await page.evaluate(()=>SA.musicAudible),false);
  assert.doesNotMatch(await page.locator('#briefing-text').textContent(),/06:00/);
  assert.doesNotMatch(await page.locator('.briefing-link').textContent(),/07:00|Rendezvous/i);
  assert.equal(await page.locator('.briefing-link b').textContent(),'06:00');
  await page.locator('.briefing-next').click();
  assert.match(await page.locator('#briefing-text').innerText(),/^Hellandussen, that’s great! Sounds like an easy run/);
  assert.equal(await page.evaluate(()=>LR_BRIEFING.inspect().frames.nicolai),4);
  await page.locator('.dialect-term').hover();
  assert.equal(await page.getByRole('tooltip').textContent(),"Norwegian dialect for 'woah'");
  await page.screenshot({path:'review/v125/dial/translation.png'});
  await page.keyboard.press('Escape');
  assert.equal(await page.locator('.dialect-tooltip').isVisible(),false);
  assert.equal(await page.evaluate(()=>LR_BRIEFING.inspect().beat),1,'Escape dismisses the translation before it skips the call');
  await page.locator('.dialect-term').focus();
  assert.equal(await page.getByRole('tooltip').isVisible(),true,'Keyboard focus reveals the translation');
  await page.keyboard.press('Enter');
  assert.equal(await page.evaluate(()=>LR_BRIEFING.inspect().beat),1,'Translation activation never advances dialogue');
  await page.locator('.briefing-next').click();await page.locator('.briefing-next').click();
  assert.equal(await page.evaluate(()=>LR_BRIEFING.inspect().frames.nicolai),5);
  await page.evaluate(()=>LR_BRIEFING.cancel());

  async function launch(){await page.evaluate(()=>{LR_BRIEFING.cancel();window.callCompletions=0;LR_BRIEFING.launch({character:'nicolai',audio:SA,onComplete:()=>window.callCompletions++});});}
  for(const viewport of [{width:844,height:390},{width:568,height:320},{width:390,height:844}]){
    await page.setViewportSize(viewport);await launch();
    const dial=await page.locator('.briefing-dial').boundingBox();
    assert.ok(dial.x>=0&&dial.y>=0&&dial.x+dial.width<=viewport.width&&dial.y+dial.height<=viewport.height);
    await page.locator('.briefing-next').click();
    assert.equal(await page.evaluate(()=>SA.clips['gdl-ring'].paused),true,'Answering early cancels the ring');
    await page.locator('.briefing-next').click();await page.locator('.dialect-term').click();
    const tip=await page.getByRole('tooltip').boundingBox();
    assert.ok(tip.x>=0&&tip.y>=0&&tip.x+tip.width<=viewport.width&&tip.y+tip.height<=viewport.height,'Translation stays within the mobile screen');
    const next=await page.locator('.briefing-next').boundingBox();
    assert.ok(next.y+next.height<=viewport.height,'Longer first reply leaves the action button visible');
    await page.screenshot({path:`review/v125/dial/translation-${viewport.width}.png`});
    await page.evaluate(()=>LR_BRIEFING.cancel());
  }
  await page.emulateMedia({reducedMotion:'reduce'});await launch();
  assert.equal(await page.locator('.dial-orbit').evaluate(e=>e.style.transform),'none');
  assert.equal(await page.locator('.dial-receiver').evaluate(e=>e.style.transform),'none');
  await page.locator('.briefing-skip').click();
  assert.equal(await page.evaluate(()=>window.callCompletions),1);
  assert.equal(await page.evaluate(()=>SA.clips['gdl-ring'].paused&&SA.musicHolds.size===0),true);
  await page.evaluate(()=>{if(SA.enabled)SA.toggle();});await launch();
  assert.equal(await page.evaluate(()=>SA.clips['gdl-ring'].paused),true,'Mute is respected from the start');
  await page.waitForFunction(()=>LR_BRIEFING.inspect().phase==='talk');
  await page.evaluate(()=>LR_BRIEFING.cancel());await page.waitForTimeout(150);
  assert.equal(await page.evaluate(()=>SA.clips['gdl-ring'].paused&&SA.musicHolds.size===0),true);
  assert.deepEqual(errors,[]);
  console.log('PASS GDL letter expansion, supplied mixed ring, natural/early connection, music isolation, hidden-tab resume, mute/skip/cancel, accessible translation, held reactions and mobile fit.');
} finally {await browser.close();}
