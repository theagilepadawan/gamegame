import assert from 'node:assert/strict';
import {mkdir, writeFile} from 'node:fs/promises';
import {chromium} from 'playwright';
import {skipOpeningCall} from './helpers/launch.mjs';

const browser = await chromium.launch({executablePath: process.env.CHROMIUM_PATH || '/usr/bin/chromium',
  args: ['--no-sandbox', '--enable-unsafe-swiftshader', '--autoplay-policy=user-gesture-required']});
const errors = [];
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
await mkdir('review/v1191', {recursive: true});

async function open(settings, viewport = {width: 568, height: 320}) {
  const touch = viewport.width < 1000;
  const context = await browser.newContext({viewport, hasTouch: touch, isMobile: touch, reducedMotion: 'reduce'});
  const page = await context.newPage();
  page.on('pageerror', error => errors.push(error.message));
  if (settings) await page.addInitScript(value => localStorage.setItem('nyc.audio', JSON.stringify(value)), settings);
  await page.goto(process.env.TEST_URL || 'http://127.0.0.1:4181/', {waitUntil: 'networkidle'});
  const cdp = await context.newCDPSession(page);
  // Playwright evaluate/waitForFunction supplies userGesture:true. That hid the
  // first-touch bug in earlier coverage. All inspection here avoids activation.
  const read = async expression => {
    const result = await cdp.send('Runtime.evaluate', {expression, returnByValue: true, userGesture: false, awaitPromise: true});
    if (result.exceptionDetails) throw Error(result.exceptionDetails.text);
    return result.result.value;
  };
  const wait = async expression => {
    const deadline = Date.now() + 20000;
    while (!await read(expression)) {
      if (Date.now() > deadline) throw Error('Timed out: ' + expression);
      await delay(80);
    }
  };
  const box = selector => read(`document.querySelector(${JSON.stringify(selector)}).getBoundingClientRect().toJSON()`);
  const tap = async selector => {
    const rect = await box(selector);
    await page.touchscreen.tap(rect.x + rect.width / 2, rect.y + rect.height / 2);
  };
  const screenshot = async file => {
    // Playwright's screenshot setup and locator geometry also activate the page.
    const {data} = await cdp.send('Page.captureScreenshot', {format: 'png'});
    await writeFile(file, Buffer.from(data, 'base64'));
  };
  await wait("!!window.longRun && !document.querySelector('#splash') && !document.querySelector('#start-music').hidden");
  assert.equal(await read('navigator.userActivation.hasBeenActive'), false, 'Fresh page has no synthetic user activation');
  assert.equal(await read('SA.musicTracks.title.paused'), true);
  return {context, page, read, wait, box, tap, screenshot};
}

async function audible({read, wait}) {
  await wait("SA.musicAudible && SA.ctx?.state === 'running' && !!SA.musicSources.title && !SA.autoplayBlocked && SA.musicTracks.title.currentTime > .15");
  // Sample after all mixer gains and the compressor, not merely the media clock.
  const peakRms = await read(`(async () => {
    const analyser = SA.ctx.createAnalyser(); analyser.fftSize = 2048;
    SA.limiter.connect(analyser);
    const data = new Float32Array(analyser.fftSize); let peak = 0;
    try {
      for (let i = 0; i < 8; i++) {
        await new Promise(resolve => setTimeout(resolve, 70));
        analyser.getFloatTimeDomainData(data);
        peak = Math.max(peak, Math.sqrt(data.reduce((sum, sample) => sum + sample * sample, 0) / data.length));
      }
      return peak;
    } finally { SA.limiter.disconnect(analyser); analyser.disconnect(); }
  })()`);
  assert.ok(peakRms > .001, `Music signal reaches the output graph (RMS ${peakRms})`);
  assert.equal(await read("document.querySelector('#start-music').hidden"), true);
  assert.equal(await read("document.querySelector('#sound-state').textContent"), 'ON');
  assert.equal(await read('SA.track.paused && SA.musicTracks.contrarian.paused'), true);
}

try {
  for (const target of ['background', 'prompt', 'sound', 'map']) {
    const session = await open(), {context, page, read, wait, box, tap, screenshot} = session;
    assert.equal(await read("document.querySelector('#sound-state').textContent"), 'TAP');
    if (target === 'background') {
      const card = await box('#start-music');
      const play = await box('#start');
      assert.ok(card.x >= 0 && card.y >= 0 && card.x + card.width <= 568 && card.y + card.height <= 320);
      assert.ok(card.x >= play.x + play.width || card.y + card.height <= play.y || card.y >= play.y + play.height,
        'Audio action clears the chapter Play button on a compact phone');
      await screenshot('review/v1191/music-prompt-mobile.png');
      assert.equal(await read('navigator.userActivation.hasBeenActive'), false, 'Layout inspection did not activate audio');
      await page.touchscreen.tap(280, 80);
    } else {
      await tap(target === 'prompt' ? '#start-music' : target === 'sound' ? '#sound' : '[data-district="opening"]');
    }
    await audible(session);
    if (target === 'background') {
      const before = await read('SA.musicTracks.title.currentTime');
      await read('SA.ctx.suspend()');
      await wait("SA.autoplayBlocked && !document.querySelector('#start-music').hidden");
      assert.equal(await read('SA.musicAudible'), false, 'Suspended audio is never reported as audible');
      assert.equal(await read("document.querySelector('#now-playing').hidden"), true);
      await page.touchscreen.tap(280, 80);
      await audible(session);
      assert.ok(await read('SA.musicTracks.title.currentTime') >= before, 'Resuming audio preserves the playhead');
    }
    await context.close();
    console.log(`PASS first touch on ${target}: real output signal, one gesture, honest state.`);
  }
  for (const settings of [{enabled: false, music: .72, fx: .75}, {enabled: true, music: 0, fx: .75}]) {
    const session = await open(settings), {context, page, read, tap} = session;
    await page.touchscreen.tap(280, 80);
    await delay(250);
    assert.equal(await read('SA.musicAudible'), false, 'Ordinary touch respects saved mute/zero volume');
    assert.equal(await read('SA.enabled'), settings.enabled);
    assert.equal(await read('SA.musicVolume'), settings.music);
    await tap('#start-music');
    await audible(session);
    assert.equal(await read("JSON.parse(localStorage.getItem('nyc.audio')).enabled"), true);
    await context.close();
  }
  const desktop = await open(undefined, {width: 1280, height: 720});
  await desktop.screenshot('review/v1191/music-prompt-desktop.png');
  assert.equal(await desktop.read('navigator.userActivation.hasBeenActive'), false);
  await desktop.page.mouse.click(680, 100);
  await audible(desktop);
  // The user's desktop return-to-menu case: audio is already unlocked by Play.
  await desktop.wait('_i');
  await desktop.page.locator('#start').click();
  await skipOpeningCall(desktop.page);
  await desktop.wait("longRun.state === 'playing' && !SA.track.paused && SA.musicTracks.title.paused");
  await desktop.read('Cu(false)');
  await audible(desktop);
  await desktop.context.close();
  assert.deepEqual(errors, []);
  console.log('PASS saved mute, zero volume, explicit music opt-in, compact layout, desktop first click and automatic return from a level.');
} finally { await browser.close(); }
