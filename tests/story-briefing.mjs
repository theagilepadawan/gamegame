import assert from 'node:assert/strict';
import {mkdir} from 'node:fs/promises';
import {chromium} from 'playwright';

const base = process.env.TEST_URL || 'http://127.0.0.1:4181/';
const browser = await chromium.launch({executablePath: process.env.CHROMIUM_PATH || '/usr/bin/chromium', args: ['--no-sandbox', '--enable-unsafe-swiftshader']});
await mkdir('review/v121/briefing', {recursive:true});
try {
  const page = await browser.newPage({viewport:{width:1280,height:720}, reducedMotion:'reduce'}), errors=[];
  page.on('pageerror', error => errors.push(error.message));
  const url = new URL(base); url.searchParams.set('unlock','all');
  await page.goto(url.href, {waitUntil:'networkidle'});
  await page.waitForFunction(() => window.LR_BRIEFING && !document.querySelector('#splash') && !document.querySelector('#start').disabled);
  await page.waitForFunction(() => LR_BRIEFING.inspect().portraitsReady);
  await page.evaluate(() => { Cu(false); fu('opening'); });
  await page.locator('[data-character="nicolai"]').click();
  await page.emulateMedia({reducedMotion:'no-preference'});
  await page.clock.install(); await page.clock.pauseAt(new Date(Date.now()+100));
  async function launch() {
    return page.evaluate(() => {
      LR_BRIEFING.cancel(); window.briefingCompletions=0;
      return LR_BRIEFING.launch({character:'nicolai', onComplete:()=>window.briefingCompletions++});
    });
  }
  function imageRegions(person='grete') {
    const c=document.querySelector(`[data-person="${person}"] canvas`).getContext('2d');
    function hash(x,y,w,h) {
      let hsh=2166136261;
      for (const n of c.getImageData(x,y,w,h).data) hsh=Math.imul(hsh^n,16777619);
      return hsh>>>0;
    }
    return {all:hash(0,0,512,512), hair:person==='nicolai'?hash(130,0,260,130):hash(0,0,200,390), shoulders:hash(0,400,512,112)};
  }
  assert.equal(await launch(), true);
  await page.clock.runFor(32);
  const portrait=await page.locator('[data-person="grete"] canvas').boundingBox();
  assert.ok(portrait.height>180,'Portrait has its own in-flow layout, isolated from global game canvases');
  const before=await page.evaluate(imageRegions);
  await page.clock.runFor(165);
  assert.equal(await page.evaluate(()=>LR_BRIEFING.inspect().frames.grete),1);
  const speaking=await page.evaluate(imageRegions);
  assert.equal(before.hair,speaking.hair,'Speaking never shifts the hair/head outline');
  assert.equal(before.shoulders,speaking.shoulders,'Speaking never shifts the body');
  assert.notEqual(before.all,speaking.all,'Registered mouth patch animates');
  await page.screenshot({path:'review/v121/briefing/desktop.png'});
  const at=await page.evaluate(()=>LR_BRIEFING.inspect().clock);
  console.log('Briefing: checking blink timing.');
  await page.clock.runFor(4120-at);
  console.log('Briefing: checking visibility and keyboard lifecycle.');
  assert.equal(await page.evaluate(()=>LR_BRIEFING.inspect().frames.grete),2,'A brief blink stays local to the eye region');
  const blink=await page.evaluate(imageRegions);
  assert.equal(before.hair,blink.hair); assert.equal(before.shoulders,blink.shoulders);
  await page.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,get:()=>true});document.dispatchEvent(new Event('visibilitychange'));});
  const held=await page.evaluate(()=>LR_BRIEFING.inspect());
  await page.clock.runFor(2400);
  assert.deepEqual(await page.evaluate(()=>LR_BRIEFING.inspect()),held,'Hidden tab freezes both expression and reading clocks');
  await page.evaluate(()=>{delete document.hidden;document.dispatchEvent(new Event('visibilitychange'));});
  await page.clock.runFor(80);
  assert.ok(await page.evaluate(()=>LR_BRIEFING.inspect().clock)>held.clock);
  const selection=await page.evaluate(()=>at);
  await page.keyboard.press('ArrowRight');
  assert.equal(await page.evaluate(()=>LR_BRIEFING.inspect().beat),1);
  assert.equal(await page.evaluate(()=>at),selection,'Right arrow advances only the call, not the map');
  assert.equal(await page.locator('#briefing-speaker').textContent(),'Nicolai');
  await page.clock.runFor(32);
  const nicolai=await page.evaluate(imageRegions,'nicolai');
  await page.screenshot({path:'review/v121/briefing/nicolai-listening.png'});
  await page.clock.runFor(165);
  assert.equal(await page.evaluate(()=>LR_BRIEFING.inspect().frames.nicolai),1);
  const nicolaiSpeaking=await page.evaluate(imageRegions,'nicolai');
  assert.equal(nicolai.hair,nicolaiSpeaking.hair,'Nicolai’s refined hairline stays fixed during speech');
  assert.equal(nicolai.shoulders,nicolaiSpeaking.shoulders,'The approved outfit stays fixed');
  assert.notEqual(nicolai.all,nicolaiSpeaking.all,'Nicolai has a local speaking expression');
  await page.screenshot({path:'review/v121/briefing/nicolai-speaking.png'});
  await page.clock.runFor(7850-await page.evaluate(()=>LR_BRIEFING.inspect().clock));
  assert.equal(await page.evaluate(()=>LR_BRIEFING.inspect().frames.nicolai),2);
  const nicolaiBlink=await page.evaluate(imageRegions,'nicolai');
  assert.equal(nicolai.hair,nicolaiBlink.hair);assert.equal(nicolai.shoulders,nicolaiBlink.shoulders);
  assert.notEqual(nicolai.all,nicolaiBlink.all,'Nicolai blinks without changing his facial outline');
  await page.screenshot({path:'review/v121/briefing/nicolai-blink.png'});
  for(let i=0;i<4;i++) await page.locator('.briefing-next').click();
  assert.equal(await page.locator('.briefing-next').textContent(),'Let’s go →');
  await page.locator('.briefing-next').click();
  assert.equal(await page.evaluate(()=>window.briefingCompletions),1);
  assert.equal(await page.evaluate(()=>LR_BRIEFING.inspect().reason),'complete');
  assert.equal(await page.evaluate(()=>LR_BRIEFING.inspect().active),false);
  // Escape must work despite the game's own global key handlers.
  await launch(); await page.keyboard.press('Escape');
  assert.equal(await page.evaluate(()=>window.briefingCompletions),1);
  assert.equal(await page.evaluate(()=>LR_BRIEFING.inspect().reason),'skipped');
  await launch(); await page.evaluate(()=>window.dispatchEvent(new Event('pagehide')));
  assert.equal(await page.evaluate(()=>window.briefingCompletions),0);
  assert.equal(await page.evaluate(()=>LR_BRIEFING.inspect().active),false);
  await launch(); await page.evaluate(()=>LR_BRIEFING.cancel());
  assert.equal(await page.evaluate(()=>window.briefingCompletions),0,'Cancel never starts the course');
  assert.equal(await page.evaluate(()=>LR_BRIEFING.launch({character:'trond',onComplete:()=>{}})),false,'Nicolai’s conversation does not replace Trond’s launch');
  console.log('Briefing: checking compact layouts.');
  // Full dialogue and actions fit the smallest supported landscape screen.
  for(const viewport of [{width:844,height:390},{width:568,height:320},{width:390,height:844}]) {
    await page.setViewportSize(viewport); await page.clock.runFor(32); await launch();
    for(let beat=0;beat<6;beat++) {
      for(const selector of ['.briefing-heading','.briefing-connection','.briefing-dialogue','.briefing-next','.briefing-skip']) {
        const box=await page.locator(selector).boundingBox();
        assert.ok(box.x>=0 && box.y>=0 && box.x+box.width<=viewport.width+1 && box.y+box.height<=viewport.height+1,`${selector} fits ${viewport.width}×${viewport.height} at beat ${beat}`);
      }
      if(beat===4)await page.screenshot({path:`review/v121/briefing/${viewport.width}x${viewport.height}.png`});
      await page.locator('.briefing-next').click();
    }
  }
  console.log('Briefing: checking reduced motion and actual Play flow.');
  await page.emulateMedia({reducedMotion:'reduce'}); await launch(); await page.clock.runFor(4400);
  assert.deepEqual(await page.evaluate(()=>LR_BRIEFING.inspect().frames),{grete:0,nicolai:0},'Reduced motion keeps both portraits still');
  await page.keyboard.press('Escape');
  await page.setViewportSize({width:1280,height:720});
  await page.emulateMedia({reducedMotion:'no-preference'});
  await page.evaluate(()=>{Cu(false);fu('opening');});
  await page.clock.runFor(32);
  await page.locator('#start').click();
  assert.equal(await page.evaluate(()=>LR_BRIEFING.inspect().active),true,'Actual Play opens the call first');
  assert.equal(await page.evaluate(()=>LR_TITLE_LAUNCH.state.active),false,'Thumbs-up waits until the conversation ends');
  for(let i=0;i<6;i++)await page.locator('.briefing-next').click();
  assert.equal(await page.evaluate(()=>LR_TITLE_LAUNCH.state.active),true,'Accepting the mission starts the existing large character gesture');
  assert.equal(await page.evaluate(()=>longRun.state),'home');
  await page.clock.runFor(2100);
  assert.equal(await page.evaluate(()=>longRun.state),'playing');
  assert.equal(await page.evaluate(()=>q.districtId||'opening'),'opening');
  assert.deepEqual(errors,[]);
  console.log('PASS six-beat briefing, portrait mouth/blink with fixed head/body, map-safe keyboard, once-only completion, Skip/Escape, cancellation/pagehide, hidden-tab pause, reduced motion, desktop/compact/portrait fit and actual Play → call → title gesture → course.');
} finally { await browser.close(); }
