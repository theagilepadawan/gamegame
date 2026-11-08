import {skipOpeningCall} from './helpers/launch.mjs';
import assert from 'node:assert/strict';
import {chromium} from 'playwright';

const browser = await chromium.launch({executablePath: process.env.CHROMIUM_PATH || '/usr/bin/chromium', args: ['--no-sandbox', '--enable-unsafe-swiftshader', '--autoplay-policy=user-gesture-required']});
const title = 'Why talking to people is a superpower x Mellow Lounge';
const errors = [];
async function open(muted = false) {
  const context = await browser.newContext({viewport: {width: 568, height: 320}, isMobile: true, hasTouch: true, reducedMotion: 'reduce'});
  const page = await context.newPage(); page.on('pageerror', e => errors.push(e.message));
  if (muted) await page.addInitScript(() => localStorage.setItem('nyc.audio', JSON.stringify({music: .72, fx: .75, enabled: false})));
  const url = new URL(process.env.TEST_URL || 'http://127.0.0.1:4181/'); url.searchParams.set('unlock', 'all');
  await page.goto(url.href, {waitUntil: 'networkidle'});
  await page.waitForFunction(() => window.longRun && !document.querySelector('#splash') && !document.querySelector('#start').disabled);
  return {page, context};
}
async function titleAudible(page) {
  await page.waitForFunction(() => SA.activeMusic === 'title' && !SA.musicTracks.title.paused && SA.ctx?.state === 'running');
  assert.equal(await page.evaluate(() => SA.track.paused && SA.musicTracks.contrarian.paused), true, 'Only the title recording plays at home');
}
try {
  const {page, context} = await open();
  await page.locator('[data-district="opening"]').focus();
  await page.keyboard.press('Home'); // The map consumes this key; audio still gets the trusted input.
  await titleAudible(page);
  await page.locator('#now-playing').waitFor({state: 'visible'});
  assert.equal(await page.locator('#now-playing-title').textContent(), title);
  assert.equal(await page.evaluate(() => SA.musicTracks.title.loop), true);
  assert.equal(await page.evaluate(() => SA.musicLevels.title), .72, 'Title track is gently dampened');
  const rect = await page.locator('#now-playing').boundingBox();
  assert.ok(rect.x >= 12 && rect.x + rect.width <= 556 && rect.y >= 0 && rect.y + rect.height <= 320, 'Full title fits the compact screen');
  const button = await page.locator('#start').boundingBox();
  assert.ok(rect.x >= button.x + button.width || rect.y + rect.height <= button.y || rect.y >= button.y + button.height, 'Title card clears Play');
  assert.equal(await page.locator('#now-playing-title').evaluate(n => n.scrollWidth <= n.clientWidth && n.scrollHeight <= n.clientHeight), true, 'Full song name is visible without an ellipsis');
  const before = await page.evaluate(() => SA.musicTracks.title.currentTime);
  await page.locator('#chapter-next').tap();
  await titleAudible(page);
  assert.ok(await page.evaluate(() => SA.musicTracks.title.currentTime) >= before, 'Browsing does not restart the recording');
  await page.locator('#sound').tap();
  assert.equal(await page.evaluate(() => SA.musicTracks.title.paused), true);
  await page.locator('#sound').tap(); await titleAudible(page);
  await page.evaluate(() => SA.volumes(.55, .75));
  await page.waitForFunction(() => Math.abs(SA.music.gain.value - .55) < .01);
  await page.locator('#start').tap(); await skipOpeningCall(page);
  try {
    await page.waitForFunction(() => longRun.state === 'playing' && !SA.track.paused);
  } catch (error) {
    console.error('Chapter audio state', await page.evaluate(() => ({state: longRun.state, scene: SA.scene, active: SA.activeMusic, key: SA.track.__lrKey, paused: SA.track.paused, ready: SA.track.readyState, error: SA.error, context: SA.ctx?.state, hidden: document.hidden, launch: LR_TITLE_LAUNCH.state.active})));
    throw error;
  }
  assert.equal(await page.evaluate(() => SA.musicTracks.title.paused && SA.activeMusic === null && SA.track.__lrKey === 'midtown'), true, 'Chapter soundtrack replaces title music');
  await page.evaluate(() => {q.invincible = 1000; q.beginContrarian();});
  await page.waitForFunction(() => SA.activeMusic === 'contrarian' && !SA.musicTracks.contrarian.paused);
  assert.equal(await page.evaluate(() => SA.track.paused && SA.musicTracks.title.paused), true, 'Contrarian remains exclusive');
  await page.evaluate(() => Cu(false)); await titleAudible(page);
  await page.locator('#now-playing').waitFor({state: 'visible'});
  assert.equal(await page.locator('#now-playing-title').textContent(), title);
  await context.close();

  const muted = await open(true);
  await muted.page.locator('[data-district="opening"]').tap();
  assert.equal(await muted.page.evaluate(() => !SA.enabled && SA.musicTracks.title.paused && SA.track.paused), true, 'Saved mute survives loading and menu input');
  await muted.page.locator('#sound').tap(); await titleAudible(muted.page);
  await muted.context.close();
  assert.deepEqual(errors, []);
  console.log('PASS title recording, exact display name, compact title card, autoplay gesture recovery, gentle gain, looping, mute/slider, chapter/Contrarian exclusivity and return to title.');
} finally { await browser.close(); }
