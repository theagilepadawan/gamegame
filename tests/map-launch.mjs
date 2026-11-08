import {skipOpeningCall} from './helpers/launch.mjs';
import assert from 'node:assert/strict';
import {mkdir} from 'node:fs/promises';
import {chromium} from 'playwright';

const proof = process.env.MAP_PROOF_DIR || 'review/v118/launch';
await mkdir(proof, {recursive: true});
const browser = await chromium.launch({executablePath: process.env.CHROMIUM_PATH || '/usr/bin/chromium', args: ['--no-sandbox', '--enable-unsafe-swiftshader']});
const errors = [];
try {
  const page = await browser.newPage({viewport: {width: 1440, height: 900}, reducedMotion: 'reduce'});
  page.on('pageerror', error => errors.push(error.message));
  const url = new URL(process.env.TEST_URL || 'http://127.0.0.1:4181/'); url.searchParams.set('unlock', 'all');
  await page.goto(url.href, {waitUntil: 'networkidle'});
  await page.waitForFunction(() => window.LR_MENU && window.LR_TITLE_LAUNCH && !document.querySelector('#splash') && !document.querySelector('#start').disabled);
  await page.emulateMedia({reducedMotion: 'no-preference'});
  await page.clock.install(); await page.clock.pauseAt(new Date(Date.now() + 100));

  for (const [runner, chapter] of [['nicolai', 'midtown'], ['trond', 'park']]) {
    await page.locator(`[data-character="${runner}"]`).click();
    await page.evaluate(chapter => LR_MENU.focusChapter(chapter), chapter);
    await page.clock.runFor(32); await page.clock.fastForward(1800);
    assert.equal(await page.evaluate(() => longRun.state), 'home', 'Browsing never launches a course');
    assert.equal(await page.locator('.map-player').getAttribute('data-motion'), 'idle', 'Browsing never gives a thumbs-up');
    const before = await page.locator('.map-player').boundingBox();
    await page.locator('#start').click(); await skipOpeningCall(page);
    assert.equal(await page.evaluate(() => LR_TITLE_LAUNCH.state.active), true);
    await page.clock.runFor(700);
    assert.equal(await page.locator('.map-player').getAttribute('data-motion'), 'idle', 'Map keeps its normal idle during the title gesture');
    assert.deepEqual(await page.locator('.map-player').boundingBox(), before, 'Map registration does not change on Play');
    const retained = await page.evaluate(() => {
      const baseline=document.createElement('canvas'), gesture=document.createElement('canvas');
      baseline.width=baseline.height=gesture.width=gesture.height=512;
      const a=baseline.getContext('2d'), c=gesture.getContext('2d');
      a.drawImage(si,1024,512,512,512,0,0,512,512);
      LR_TITLE_LAUNCH.draw(c,si,PA,256,460,1);
      function changed(x,y,w,h) { const original=a.getImageData(x,y,w,h).data, next=c.getImageData(x,y,w,h).data; return original.reduce((n,v,i)=>n+(v!==next[i]?1:0),0); }
      return {head:changed(192,30,130,105),legs:changed(170,280,180,190),arm:changed(180,150,100,80)};
    });
    assert.equal(retained.head,0,'Exact approved title face is preserved');
    assert.equal(retained.legs,0,'Exact original trousers and chapter-specific shoes are preserved');
    assert.ok(retained.arm>100,'The large title character visibly raises their own arm');
    await page.screenshot({path: `${proof}/${runner}-title-thumbs-up.png`});
    await page.evaluate(() => {document.querySelector('#start').click(); document.querySelector('#start').click();});
    await page.clock.fastForward(1150);
    assert.equal(await page.evaluate(() => longRun.state), 'home', 'Thumb is held for about two seconds');
    assert.ok(await page.evaluate(() => LR_TITLE_LAUNCH.state.age >= 1800), 'Thumb remains held until the level starts');
    await page.clock.fastForward(200);
    assert.equal(await page.evaluate(() => longRun.state), 'playing', 'The confirmed chapter starts automatically');
    assert.equal(await page.evaluate(() => q.districtId), chapter);
    assert.equal(await page.evaluate(() => q.character), runner);
    assert.equal(await page.evaluate(() => LR_TITLE_LAUNCH.state.active), false);
    assert.equal(await page.locator('#start').getAttribute('aria-busy'), null);
    await page.evaluate(() => Cu(false)); await page.clock.runFor(32);
  }

  await page.locator('#start').click(); await skipOpeningCall(page); await page.clock.runFor(350);
  await page.keyboard.press('Escape'); await page.clock.fastForward(2400);
  assert.equal(await page.evaluate(() => longRun.state), 'home', 'Escape cancels a pending launch');
  assert.equal(await page.evaluate(() => LR_TITLE_LAUNCH.state.active), false);

  await page.locator('#start').click(); await skipOpeningCall(page); await page.clock.runFor(350);
  await page.evaluate(() => LR_MENU.focusChapter('opening'));
  await page.clock.runFor(32); await page.clock.fastForward(3000);
  assert.equal(await page.evaluate(() => longRun.state), 'home', 'Retargeting cancels the previous launch');
  assert.equal(await page.evaluate(() => LR_MENU.state.selected), 'opening');

  await page.locator('#start').click(); await skipOpeningCall(page); await page.clock.runFor(350);
  await page.locator('[data-character="nicolai"]').click();
  await page.clock.runFor(32); await page.clock.fastForward(2400);
  assert.equal(await page.evaluate(() => longRun.state), 'home', 'Switching runner cancels the pending launch');
  assert.equal(await page.evaluate(() => LR_MENU.state.runner), 'nicolai');

  await page.locator('#start').click(); await skipOpeningCall(page); await page.clock.runFor(100);
  await page.locator('#mix').click(); await page.clock.runFor(32);
  await page.clock.fastForward(2400);
  assert.equal(await page.evaluate(() => longRun.state), 'home', 'Opening the mixer cancels the countdown');
  assert.equal(await page.evaluate(() => LR_TITLE_LAUNCH.state.active), false);
  await page.locator('#audio-done').click();

  await page.locator('#start').click(); await skipOpeningCall(page); await page.clock.runFor(100);
  await page.evaluate(() => {
    Object.defineProperty(document, 'hidden', {configurable: true, value: true});
    document.dispatchEvent(new Event('visibilitychange'));
  });
  await page.clock.fastForward(2400);
  assert.equal(await page.evaluate(() => longRun.state), 'home', 'A hidden tab never launches a run');
  assert.equal(await page.evaluate(() => LR_TITLE_LAUNCH.state.active), false);
  await page.evaluate(() => {delete document.hidden; document.dispatchEvent(new Event('visibilitychange'));});

  await page.evaluate(() => {LR_CH.order.forEach(id => LR_CH.done(id)); LR_CH.paint();});
  await page.locator('#start').click(); await skipOpeningCall(page); await page.clock.runFor(100);
  await page.locator('[data-mode="endless"]').click(); await page.clock.runFor(32);
  await page.clock.fastForward(2400);
  assert.equal(await page.evaluate(() => longRun.state), 'home', 'Changing mode cancels the Story launch');
  await page.locator('#start').click(); await skipOpeningCall(page);
  assert.equal(await page.evaluate(() => longRun.state), 'playing', 'Endless starts directly without the chapter gesture');
  await page.evaluate(() => Cu(false));
  await page.locator('[data-mode="chapter"]').click(); await page.clock.runFor(32);

  await page.locator('#start').click(); await skipOpeningCall(page); await page.clock.runFor(100);
  await page.emulateMedia({reducedMotion: 'reduce'}); await page.clock.runFor(32);
  assert.equal(await page.evaluate(() => longRun.state), 'playing', 'Live reduced motion completes the confirmed launch without delay');
  await page.evaluate(() => Cu(false)); await page.clock.runFor(32);
  await page.locator('#start').click(); await skipOpeningCall(page);
  assert.equal(await page.evaluate(() => longRun.state), 'playing', 'Reduced motion starts directly');
  await page.close();

  const phone = await browser.newContext({viewport: {width: 568, height: 320}, hasTouch: true, isMobile: true, reducedMotion: 'reduce'});
  const mobile = await phone.newPage(); mobile.on('pageerror', error => errors.push(error.message));
  await mobile.goto(url.href, {waitUntil: 'networkidle'});
  await mobile.waitForFunction(() => window.LR_MENU && window.LR_TITLE_LAUNCH && !document.querySelector('#splash') && !document.querySelector('#start').disabled);
  await mobile.locator('[data-character="trond"]').tap();
  await mobile.evaluate(() => LR_MENU.focusChapter('park'));
  await mobile.waitForFunction(() => LR_MENU.state.selected === 'park' && !LR_MENU.state.moving);
  await mobile.emulateMedia({reducedMotion: 'no-preference'});
  await mobile.clock.install(); await mobile.clock.pauseAt(new Date(Date.now() + 100));
  await mobile.locator('#start').tap(); await skipOpeningCall(mobile); await mobile.clock.runFor(700);
  assert.equal(await mobile.locator('.map-player').getAttribute('data-motion'), 'idle');
  assert.equal(await mobile.evaluate(() => LR_TITLE_LAUNCH.state.active),true);
  const marker = await mobile.locator('.map-player').boundingBox(), rail = await mobile.locator('#district-picker').boundingBox();
  assert.ok(marker.y >= rail.y && marker.x >= rail.x && marker.x + marker.width <= rail.x + rail.width, 'Unchanged map runner fits the tightest touch map');
  await mobile.screenshot({path: `${proof}/mobile-launch.png`});
  await mobile.clock.fastForward(1800);
  assert.equal(await mobile.evaluate(() => longRun.state), 'playing', 'Touch confirmation launches after its gesture');
  await phone.close();
  assert.deepEqual(errors, []);
  console.log('PASS both title arm sequences, exact original faces/legs, unchanged map, two-second hold, automatic start, repeated input, Escape, retargeting, runner/mode changes, dialogs, hidden tabs, Endless and reduced motion.');
} finally { await browser.close(); }
