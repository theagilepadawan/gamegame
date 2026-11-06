import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { chromium } from 'playwright';

// TEST_URL also accepts the standalone release. Proof stays outside shipped assets.
const url = new URL(process.env.TEST_URL || 'http://127.0.0.1:4181/');
const proof = process.env.MAP_PROOF_DIR || 'review/v20-map-characters';
await fs.mkdir(proof, { recursive: true });
const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || '/usr/bin/chromium',
  headless: true, args: ['--no-sandbox'],
});
const errors = [];
async function open(viewport, demo = true, touch = false) {
  const context = await browser.newContext({viewport, hasTouch: touch, isMobile: touch, reducedMotion: 'reduce'});
  const page = await context.newPage();
  page.on('pageerror', e => errors.push(e.message));
  const address = new URL(url); address.searchParams.delete('unlock');
  if (demo) address.searchParams.set('unlock', 'all');
  await page.goto(String(address), {waitUntil: 'load'});
  await page.waitForFunction(() => window.LR_MENU && window.longRun && !document.querySelector('#start').disabled, null, {timeout: 60000});
  await page.waitForFunction(() => {
    const s = document.querySelector('#splash');
    return !s || s.hidden || getComputedStyle(s).pointerEvents === 'none' || getComputedStyle(s).display === 'none';
  });
  await page.evaluate(() => document.fonts.ready);
  return {page, context};
}
async function settled(page, chapter, runner) {
  await page.waitForFunction(({chapter, runner}) => LR_MENU.state.selected === chapter && LR_MENU.state.runner === runner && !LR_MENU.state.moving, {chapter, runner});
  await page.evaluate(async () => {
    const url = getComputedStyle(document.querySelector('.map-player-figure')).backgroundImage.slice(5, -2);
    const image = new Image(); image.src = url; await image.decode();
  });
  const result = await page.evaluate(() => {
    const marker = document.querySelector('.map-player');
    const node = document.querySelector('[data-district].selected');
    const m = marker.getBoundingClientRect(), n = node.getBoundingClientRect();
    const rail = document.querySelector('#district-picker').getBoundingClientRect();
    return {
      centered: Math.abs(m.x + m.width / 2 - n.x - n.width / 2) < 1,
      topInside: m.y >= rail.y, width: m.width,
      pose: getComputedStyle(marker.querySelector('.map-player-figure')).backgroundPositionX,
      pointerEvents: getComputedStyle(marker).pointerEvents,
      state: longRun.state,
    };
  });
  assert(result.centered, 'runner is registered to the selected destination');
  assert(result.topInside, 'runner head stays inside the map');
  assert.equal(result.pose, '0%', 'arrival returns to the idle artwork');
  assert.equal(result.pointerEvents, 'none', 'decorative runner never blocks map controls');
  assert.equal(result.state, 'home', 'map input does not start a run');
}
async function snap(page, name) {
  const clip = await page.locator('#chapter-browser').boundingBox();
  await page.screenshot({path: `${proof}/${name}.png`, clip});
}
try {
  const desktop = await open({width: 1440, height: 900});
  const p = desktop.page;
  await settled(p, 'opening', 'nicolai');
  await snap(p, 'desktop-nicolai-opening');
  await p.locator('#chapter-next').click();
  await settled(p, 'midtown', 'nicolai');
  await snap(p, 'desktop-nicolai-midtown');
  await p.locator('[data-character="trond"]').click();
  await settled(p, 'midtown', 'trond');
  await snap(p, 'desktop-trond-midtown');
  await p.screenshot({path: `${proof}/desktop-trond-full.png`});

  await p.emulateMedia({reducedMotion: 'no-preference'});
  // Advance the real browser animation in known intervals. Concurrent software
  // rendering can otherwise skip an entire short transition between two RAFs.
  await p.clock.install();
  await p.clock.pauseAt(new Date(Date.now() + 100));
  await p.evaluate(() => LR_MENU.focusChapter('park'));
  const travel = [];
  for (let i = 0; i < 5; i++) {
    await p.clock.runFor(80);
    travel.push(await p.evaluate(() => {
      const marker = document.querySelector('.map-player');
      return {time: performance.now(), left: parseFloat(marker.style.left), top: parseFloat(marker.style.top), moving: LR_MENU.state.moving, pose: marker.lastElementChild.style.backgroundPositionX};
    }));
    if (i === 2) await snap(p, 'desktop-trond-travelling');
  }
  await fs.writeFile(`${proof}/route-frames.json`, JSON.stringify(travel, null, 2));
  assert(travel.some(f => f.moving), 'course change uses the run animation');
  assert(new Set(travel.filter(f => f.moving).map(f => f.pose)).size > 1, 'travel advances native run frames');
  assert(travel.some(f => f.left > 49 && f.left < 83), 'runner visibly travels between destinations');
  await p.clock.runFor(700);
  await settled(p, 'park', 'trond');
  await snap(p, 'desktop-trond-park');
  await p.locator('[data-district="park"]').focus();
  await p.keyboard.press('ArrowLeft');
  await p.clock.runFor(700);
  await settled(p, 'midtown', 'trond');
  assert.equal(await p.locator('.map-player').getAttribute('data-facing'), 'left', 'return trip faces the direction of travel');
  const stable = await p.locator('.map-player').boundingBox();
  await p.waitForTimeout(250);
  assert.deepEqual(await p.locator('.map-player').boundingBox(), stable, 'idle is stable without repeated bobbing');
  await p.evaluate(() => LR_MENU.focusChapter('park'));
  await p.clock.runFor(32);
  await p.emulateMedia({reducedMotion: 'reduce'});
  await p.clock.runFor(32);
  await settled(p, 'park', 'trond');
  await p.clock.resume();
  await p.evaluate(() => {LR_CH.order.forEach(id => LR_CH.done(id)); LR_CH.paint();});
  await p.locator('[data-mode="endless"]').click();
  await p.locator('#chapter-browser').waitFor({state: 'hidden'});
  assert.equal(await p.locator('#chapter-browser').isVisible(), false);
  await p.locator('[data-mode="chapter"]').click();
  await p.locator('#chapter-browser').waitFor({state: 'visible'});
  await settled(p, 'park', 'trond');
  console.log('PASS desktop identity, native run frames, route travel, return facing, stable idle, live reduced motion and mode return');
  await desktop.context.close();

  const mobile = await open({width: 568, height: 320}, true, true);
  const m = mobile.page;
  await settled(m, 'opening', 'nicolai');
  await snap(m, 'mobile-nicolai-opening');
  await m.locator('#chapter-next').tap();
  await settled(m, 'midtown', 'nicolai');
  await snap(m, 'mobile-nicolai-midtown');
  await m.locator('[data-character="trond"]').tap();
  await settled(m, 'midtown', 'trond');
  await snap(m, 'mobile-trond-midtown');
  await m.locator('#chapter-next').tap();
  await settled(m, 'park', 'trond');
  await snap(m, 'mobile-trond-park');
  await m.screenshot({path: `${proof}/mobile-trond-full.png`});
  console.log('PASS both miniatures and all destinations fit the compact touch layout');
  await mobile.context.close();

  const fresh = await open({width: 1280, height: 800}, false);
  await fresh.page.locator('[data-character="trond"]').click();
  await fresh.page.waitForFunction(() => LR_RUN.previewing());
  await settled(fresh.page, 'opening', 'nicolai');
  await fresh.page.locator('#chapter-next').click();
  await settled(fresh.page, 'opening', 'nicolai');
  assert.equal(await fresh.page.evaluate(() => longRun.character), 'nicolai');
  console.log('PASS locked runner previews and locked chapters preserve the playable map marker');
  await fresh.context.close();
  assert.deepEqual(errors, [], 'no browser runtime errors');
} finally { await browser.close(); }
