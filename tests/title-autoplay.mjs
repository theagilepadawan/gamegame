import assert from 'node:assert/strict';
import {chromium} from 'playwright';
const url=process.env.TEST_URL || 'http://127.0.0.1:4181/';
for(const policy of ['no-user-gesture-required','user-gesture-required']) {
  const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH || '/usr/bin/chromium',args:['--no-sandbox','--enable-unsafe-swiftshader',`--autoplay-policy=${policy}`]});
  try {
    const page=await browser.newPage({viewport:{width:1280,height:720},reducedMotion:'reduce'}),errors=[];
    page.on('pageerror',e=>errors.push(e.message));
    await page.goto(url,{waitUntil:'networkidle'});
    // Playwright evaluate/waitForFunction grants a CDP user gesture. Read initial
    // autoplay state through CDP with userGesture:false, so this is a real fresh visit.
    const cdp=await page.context().newCDPSession(page);
    const read=async expression=>(await cdp.send('Runtime.evaluate',{expression,returnByValue:true,userGesture:false})).result.value;
    async function wait(expression) {
      const deadline=Date.now()+20000;
      while(!await read(expression)) { if(Date.now()>deadline)throw Error('Timed out: '+expression); await new Promise(r=>setTimeout(r,100)); }
    }
    await wait("!!window.longRun && !document.querySelector('#splash') && SA.activeMusic==='title'");
    assert.equal(await read('navigator.userActivation.hasBeenActive'),false,'No synthetic activation is used');
    assert.equal(await read('SA.ctx'),null,'A suspended audio graph cannot silence permitted media autoplay');
    if(policy==='no-user-gesture-required') {
      await wait('!SA.musicTracks.title.paused && SA.musicTracks.title.currentTime>.3');
      assert.equal(await read('SA.musicTracks.title.volume'),.72*.72);
      const time=await read('SA.musicTracks.title.currentTime');
      await page.keyboard.press('h');
      await page.waitForFunction(()=>SA.ctx?.state==='running');
      assert.ok(await page.evaluate(()=>SA.musicTracks.title.currentTime)>=time,'Gesture upgrade keeps the original playhead');
    } else {
      await wait('SA.autoplayBlocked');
      // A page-generated keypress is untrusted. It cannot unlock the browser's
      // audio permission, even when dispatched after the game finishes loading.
      const trusted = await read(`(() => {
        const event = new KeyboardEvent('keydown', {key:'h', code:'KeyH', bubbles:true});
        document.body.dispatchEvent(event);
        document.body.dispatchEvent(new KeyboardEvent('keyup', {key:'h', code:'KeyH', bubbles:true}));
        return event.isTrusted;
      })()`);
      await new Promise(resolve => setTimeout(resolve, 250));
      assert.equal(trusted, false);
      assert.equal(await read('navigator.userActivation.hasBeenActive'), false);
      assert.equal(await read('SA.musicTracks.title.paused && SA.autoplayBlocked'), true,
        'Simulated keypress cannot bypass audible-autoplay policy');
      assert.equal(await read("document.querySelector('#sound-state').textContent"),'TAP');
      await page.keyboard.press('h');
      await page.waitForFunction(()=>!SA.musicTracks.title.paused && SA.ctx?.state==='running' && !SA.autoplayBlocked);
      assert.equal(await page.evaluate(()=>SA.enabled),true,'First real keypress starts playback');
    }
    assert.equal(await page.evaluate(()=>SA.musicTracks.title.volume),1,'Web Audio upgrade does not double-attenuate the media');
    assert.equal(await page.locator('#sound-state').textContent(),'ON');
    await page.locator('#sound').click();
    assert.equal(await page.evaluate(()=>!SA.enabled && SA.musicTracks.title.paused),true);
    assert.deepEqual(errors,[]);
    console.log(`PASS title startup: ${policy}, honest control state, continuous playhead and correct gain.`);
  } finally {await browser.close();}
}
