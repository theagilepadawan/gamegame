import assert from 'node:assert/strict';
import {mkdir} from 'node:fs/promises';
import {chromium} from 'playwright';

const proof = process.env.MAP_PROOF_DIR || 'review/v117/map';
await mkdir(proof, {recursive: true});
const browser = await chromium.launch({executablePath: process.env.CHROMIUM_PATH || '/usr/bin/chromium', args: ['--no-sandbox', '--enable-unsafe-swiftshader']});
const errors = [];
try {
  const page = await browser.newPage({viewport: {width: 1440, height: 900}, reducedMotion: 'reduce'});
  page.on('pageerror', error => errors.push(error.message));
  const url = new URL(process.env.TEST_URL || 'http://127.0.0.1:4181/'); url.searchParams.set('unlock', 'all');
  await page.goto(url.href, {waitUntil: 'networkidle'});
  await page.waitForFunction(() => window.LR_MENU && !document.querySelector('#splash') && !document.querySelector('#start').disabled);
  await page.emulateMedia({reducedMotion: 'no-preference'});
  await page.clock.install(); await page.clock.pauseAt(new Date(Date.now() + 100));

  for (const [runner, chapter] of [['nicolai', 'midtown'], ['trond', 'park']]) {
    await page.locator(`[data-character="${runner}"]`).click();
    await page.evaluate(chapter => LR_MENU.focusChapter(chapter), chapter);
    await page.clock.runFor(32); await page.clock.fastForward(1800);
    assert.equal(await page.evaluate(() => longRun.state), 'home', 'Browsing never launches a course');
    assert.equal(await page.locator('.map-player').getAttribute('data-motion'), 'idle', 'Browsing never gives a thumbs-up');
    const before = await page.locator('.map-player').boundingBox();
    await page.locator('#start').click();
    assert.equal(await page.evaluate(() => LR_MENU.state.launching), true);
    await page.clock.runFor(350);
    assert.equal(await page.locator('.map-player').getAttribute('data-motion'), 'thumbs-up');
    assert.equal(await page.locator('.map-player-figure').evaluate(el => el.style.backgroundPositionX), '100%');
    assert.deepEqual(await page.locator('.map-player').boundingBox(), before, 'Gesture keeps its feet and body registration');
    const art = await page.locator('.map-player-figure').evaluate(async el => {
      const image = new Image(); image.src = getComputedStyle(el).backgroundImage.slice(5, -2); await image.decode();
      return [image.naturalWidth, image.naturalHeight];
    });
    assert.deepEqual(art, [1152, 420], 'Three registered native gesture frames decode');
    await page.screenshot({path: `${proof}/${runner}-thumbs-up.png`, clip: await page.locator('#chapter-browser').boundingBox()});
    await page.evaluate(() => {document.querySelector('#start').click(); document.querySelector('#start').click();});
    await page.clock.fastForward(1500);
    assert.equal(await page.evaluate(() => longRun.state), 'home', 'Thumb is held for about two seconds');
    assert.equal(await page.locator('.map-player-figure').evaluate(el => el.style.backgroundPositionX), '100%', 'No arm-lowering pose');
    await page.clock.fastForward(200);
    assert.equal(await page.evaluate(() => longRun.state), 'playing', 'The confirmed chapter starts automatically');
    assert.equal(await page.evaluate(() => q.districtId), chapter);
    assert.equal(await page.evaluate(() => q.character), runner);
    assert.equal(await page.evaluate(() => LR_MENU.state.launching), false);
    assert.equal(await page.locator('#start').getAttribute('aria-busy'), null);
    await page.evaluate(() => Cu(false)); await page.clock.runFor(32);
  }

  await page.locator('#start').click(); await page.clock.runFor(350);
  await page.keyboard.press('Escape'); await page.clock.fastForward(2400);
  assert.equal(await page.evaluate(() => longRun.state), 'home', 'Escape cancels a pending launch');
  assert.equal(await page.evaluate(() => LR_MENU.state.launching), false);

  await page.locator('#start').click(); await page.clock.runFor(350);
  await page.evaluate(() => LR_MENU.focusChapter('opening'));
  await page.clock.runFor(32); await page.clock.fastForward(3000);
  assert.equal(await page.evaluate(() => longRun.state), 'home', 'Retargeting cancels the previous launch');
  assert.equal(await page.evaluate(() => LR_MENU.state.selected), 'opening');

  await page.locator('#start').click(); await page.clock.runFor(350);
  await page.locator('[data-character="nicolai"]').click();
  await page.clock.runFor(32); await page.clock.fastForward(2400);
  assert.equal(await page.evaluate(() => longRun.state), 'home', 'Switching runner cancels the pending launch');
  assert.equal(await page.evaluate(() => LR_MENU.state.runner), 'nicolai');

  await page.locator('#start').click(); await page.clock.runFor(100);
  await page.locator('#mix').click(); await page.clock.runFor(32);
  await page.clock.fastForward(2400);
  assert.equal(await page.evaluate(() => longRun.state), 'home', 'Opening the mixer cancels the countdown');
  assert.equal(await page.evaluate(() => LR_MENU.state.launching), false);
  await page.locator('#audio-done').click();

  await page.locator('#start').click(); await page.clock.runFor(100);
  await page.evaluate(() => {
    Object.defineProperty(document, 'hidden', {configurable: true, value: true});
    document.dispatchEvent(new Event('visibilitychange'));
  });
  await page.clock.fastForward(2400);
  assert.equal(await page.evaluate(() => longRun.state), 'home', 'A hidden tab never launches a run');
  assert.equal(await page.evaluate(() => LR_MENU.state.launching), false);
  await page.evaluate(() => {delete document.hidden; document.dispatchEvent(new Event('visibilitychange'));});

  await page.evaluate(() => {LR_CH.order.forEach(id => LR_CH.done(id)); LR_CH.paint();});
  await page.locator('#start').click(); await page.clock.runFor(100);
  await page.locator('[data-mode="endless"]').click(); await page.clock.runFor(32);
  await page.clock.fastForward(2400);
  assert.equal(await page.evaluate(() => longRun.state), 'home', 'Changing mode cancels the Story launch');
  await page.locator('#start').click();
  assert.equal(await page.evaluate(() => longRun.state), 'playing', 'Endless starts directly without the chapter gesture');
  await page.evaluate(() => Cu(false));
  await page.locator('[data-mode="chapter"]').click(); await page.clock.runFor(32);

  await page.locator('#start').click(); await page.clock.runFor(100);
  await page.emulateMedia({reducedMotion: 'reduce'}); await page.clock.runFor(32);
  assert.equal(await page.evaluate(() => longRun.state), 'playing', 'Live reduced motion completes the confirmed launch without delay');
  await page.evaluate(() => Cu(false)); await page.clock.runFor(32);
  await page.locator('#start').click();
  assert.equal(await page.evaluate(() => longRun.state), 'playing', 'Reduced motion starts directly');
  await page.close();

  const phone = await browser.newContext({viewport: {width: 568, height: 320}, hasTouch: true, isMobile: true, reducedMotion: 'reduce'});
  const mobile = await phone.newPage(); mobile.on('pageerror', error => errors.push(error.message));
  await mobile.goto(url.href, {waitUntil: 'networkidle'});
  await mobile.waitForFunction(() => window.LR_MENU && !document.querySelector('#splash') && !document.querySelector('#start').disabled);
  await mobile.locator('[data-character="trond"]').tap();
  await mobile.evaluate(() => LR_MENU.focusChapter('park'));
  await mobile.waitForFunction(() => LR_MENU.state.selected === 'park' && !LR_MENU.state.moving);
  await mobile.emulateMedia({reducedMotion: 'no-preference'});
  await mobile.clock.install(); await mobile.clock.pauseAt(new Date(Date.now() + 100));
  await mobile.locator('#start').tap(); await mobile.clock.runFor(350);
  assert.equal(await mobile.locator('.map-player').getAttribute('data-motion'), 'thumbs-up');
  const marker = await mobile.locator('.map-player').boundingBox(), rail = await mobile.locator('#district-picker').boundingBox();
  assert.ok(marker.y >= rail.y && marker.x >= rail.x && marker.x + marker.width <= rail.x + rail.width, 'Larger thumbs-up fits the tightest touch map');
  await mobile.screenshot({path: `${proof}/mobile-launch.png`});
  await mobile.clock.fastForward(1800);
  assert.equal(await mobile.evaluate(() => longRun.state), 'playing', 'Touch confirmation launches after its gesture');
  await phone.close();
  assert.deepEqual(errors, []);
  console.log('PASS both native thumbs-up sequences, two-second hold, automatic start, repeated input, Escape, retargeting, runner/mode changes, dialogs, hidden tabs, Endless and reduced motion.');
} finally { await browser.close(); }
