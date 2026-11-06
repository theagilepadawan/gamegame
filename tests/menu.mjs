import assert from 'node:assert/strict';

// Run against the source preview or a served standalone HTML:
// TEST_URL=http://127.0.0.1:4181/ node tests/menu.mjs
// PLAYWRIGHT_MODULE=/path/to/playwright/index.mjs is also supported.
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
const baseURL = new URL(process.env.TEST_URL || 'http://127.0.0.1:4181/');
baseURL.searchParams.delete('unlock');
const demoURL = new URL(baseURL);
demoURL.searchParams.set('unlock', 'all');
const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || '/usr/bin/chromium',
  headless: true,
  args: ['--no-sandbox'],
});
const errors = [];
const checks = [];
function pass(name) { checks.push(name); console.log(`PASS ${name}`); }
async function open(viewport, { demo = false, touch = false, pad = false } = {}) {
  const context = await browser.newContext({
    viewport,
    reducedMotion: 'reduce',
    hasTouch: touch,
    isMobile: touch,
  });
  const page = await context.newPage();
  if (pad) await page.addInitScript(() => {
    window.__mapPadActive = false;
    window.__mapPadDirection = 0;
    window.__mapPadDpad = 0;
    window.__mapPadButton = false;
    Object.defineProperty(navigator, 'getGamepads', { value: () => window.__mapPadActive ? [{
      axes: [window.__mapPadDirection, 0],
      buttons: Array.from({length: 16}, (_, i) => ({pressed: (i === 0 && window.__mapPadButton) || (i === 14 && window.__mapPadDpad < 0) || (i === 15 && window.__mapPadDpad > 0)}))
    }] : [] });
  });
  page.on('pageerror', error => errors.push(error.message));
  await page.goto(String(demo ? demoURL : baseURL), { waitUntil: 'load' });
  await page.waitForFunction(() => window.LR_MENU && window.longRun && !document.querySelector('#start').disabled, null, { timeout: 60000 });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForFunction(() => {
    const splash = document.querySelector('#splash');
    return !splash || splash.hidden || getComputedStyle(splash).pointerEvents === 'none' || getComputedStyle(splash).display === 'none';
  });
  return { context, page };
}
async function inBounds(page, label) {
  const layout = await page.evaluate(() => {
    const rect = selector => {
      const r = document.querySelector(selector).getBoundingClientRect();
      return { x: r.x, y: r.y, right: r.right, bottom: r.bottom, width: r.width, height: r.height };
    };
    return { width: innerWidth, height: innerHeight, documentWidth: document.documentElement.scrollWidth, start: rect('#start'), rail: rect('#district-picker'), status: document.querySelector('#load-status').offsetParent ? rect('#load-status') : null };
  });
  assert(layout.documentWidth <= layout.width, `${label}: no horizontal page overflow`);
  assert(layout.start.width > 100 && layout.start.height >= 30, `${label}: usable start button`);
  for (const [name, rect] of Object.entries({ start: layout.start, rail: layout.rail, ...(layout.status ? {status: layout.status} : {}) })) {
    assert(rect.x >= -1 && rect.y >= -1 && rect.right <= layout.width + 1 && rect.bottom <= layout.height + 1, `${label}: ${name} stays inside viewport`);
  }
}
async function stillHome(page) {
  await page.evaluate(() => new Promise(resolve => requestAnimationFrame(resolve)));
  assert.equal(await page.evaluate(() => longRun.state), 'home', 'chapter navigation must not start a run');
}
try {
  // Each browser context has empty storage, so these are genuine fresh-profile
  // locks, independent of completed chapters in a developer's own browser.
  const desktop = await open({ width: 1440, height: 900 });
  const page = desktop.page;
  assert.equal(await page.locator('[data-district="opening"]').getAttribute('aria-disabled'), 'false');
  assert.equal(await page.locator('[data-district="midtown"]').getAttribute('aria-disabled'), 'true');
  assert.equal(await page.locator('[data-district="park"]').getAttribute('aria-disabled'), 'true');
  assert.equal(await page.locator('#chapter-prev').isDisabled(), true);
  assert.equal(await page.locator('#chapter-browser img').count(), 0, 'The chapter map never shows gameplay preview images');
  assert.equal(await page.locator('#map-route').count(), 1, 'Destinations are joined by an illustrated route');
  assert.equal((await page.locator('.journey-kicker').innerText()).trim(), 'NEW YORK');
  assert.doesNotMatch(await page.locator('#chapter-browser').innerText(), /world\s*#?\s*1/i, 'Single-city chapter map has no redundant world designation');
  await inBounds(page, 'desktop');
  await page.emulateMedia({reducedMotion: 'no-preference'});
  const targetCenter = await page.locator('[data-district="midtown"]').evaluate(el => {
    const box = el.getBoundingClientRect(); return box.x + box.width / 2 + document.querySelector('#district-picker').scrollLeft;
  });
  await page.locator('#chapter-next').click();
  await page.waitForFunction(() => LR_MENU.state.browsing === 'midtown');
  assert.match(await page.locator('#load-status').innerText(), /Finish Opening Bell/);
  const centers = await page.evaluate(async () => {
    const values = [], node = document.querySelector('[data-district="midtown"]'), rail = document.querySelector('#district-picker');
    for (let i = 0; i < 12; i++) {
      await new Promise(resolve => requestAnimationFrame(resolve));
      const box = node.getBoundingClientRect(); values.push(box.x + box.width / 2 + rail.scrollLeft);
    }
    return values;
  });
  assert(centers.every(x => Math.abs(x - targetCenter) < 1), 'Locked destination stays anchored during its refusal animation');
  await page.emulateMedia({reducedMotion: 'reduce'});
  assert.equal(await page.evaluate(() => LR_MENU.state.selected), 'opening');
  assert.match(await page.locator('#start-label').innerText(), /Opening Bell/);
  await stillHome(page);
  pass('Fresh-profile locks preserve the selected playable chapter and explain the next unlock');

  await page.locator('[data-district="midtown"]').focus();
  await page.keyboard.press('Enter');
  await stillHome(page);
  await page.keyboard.press('Space');
  await stillHome(page);
  await page.keyboard.press('ArrowRight');
  await page.waitForFunction(() => LR_MENU.state.browsing === 'park');
  assert.equal(await page.evaluate(() => LR_MENU.state.selected), 'opening');
  assert.equal(await page.locator('#chapter-next').isDisabled(), true);
  await stillHome(page);
  await page.keyboard.press('Home');
  await page.waitForFunction(() => LR_MENU.state.browsing === 'opening');
  pass('Arrow, Home, Enter and Space operate the chapter menu without starting a run');

  assert.equal(await page.locator('#chapter-browser').isVisible(), true);
  assert.equal(await page.locator('.world-picker').isVisible(), false);
  assert.equal(await page.locator('#new-world').isDisabled(), true);
  await page.evaluate(() => { LR_CH.order.forEach(id => LR_CH.done(id)); LR_CH.paint(); });
  await page.locator('[data-mode="endless"]').click();
  await page.waitForFunction(() => LR_MENU.state.mode === 'endless');
  assert.equal(await page.locator('#chapter-browser').isVisible(), false);
  assert.equal(await page.locator('.world-picker').isVisible(), true);
  assert.equal(await page.locator('#new-world').isDisabled(), false);
  await page.locator('[data-mode="chapter"]').click();
  await page.waitForFunction(() => LR_MENU.state.mode === 'story');
  assert.equal(await page.locator('#chapter-browser').isVisible(), true);
  assert.equal(await page.locator('.world-picker').isVisible(), false);
  assert.equal(await page.evaluate(() => LR_MENU.state.selected), 'opening');
  await inBounds(page, 'desktop after mode switch');
  pass('Story shows the chapter map; only Endless shows enabled world controls');
  await desktop.context.close();

  const small = await open({ width: 568, height: 320 }, { demo: true, touch: true, pad: true });
  const mobile = small.page;
  await inBounds(mobile, '568×320 landscape');
  assert.equal(await mobile.locator('[data-district="park"]').getAttribute('aria-disabled'), 'false');
  const rail = await mobile.locator('#district-picker').boundingBox();
  const client = await small.context.newCDPSession(mobile);
  const x = rail.x + rail.width - 35;
  const y = rail.y + Math.min(35, rail.height / 2);
  await client.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y }] });
  for (let i = 1; i <= 8; i++) {
    await client.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: x - i * 28, y }] });
    await mobile.waitForTimeout(15);
  }
  await client.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await mobile.waitForFunction(() => LR_MENU.state.selected === 'park');
  assert.match(await mobile.locator('#start-label').innerText(), /Central Park/);
  await stillHome(mobile);
  await inBounds(mobile, '568×320 after swipe');
  pass('Real touch swipe selects the final unlocked card without accidentally starting');

  await mobile.locator('[data-district="park"]').focus();
  await mobile.keyboard.press('Home');
  await mobile.waitForFunction(() => LR_MENU.state.selected === 'opening');
  await mobile.keyboard.press('ArrowRight');
  await mobile.waitForFunction(() => LR_MENU.state.selected === 'midtown');
  await mobile.keyboard.press('Enter');
  await mobile.keyboard.press('Space');
  await stillHome(mobile);
  await mobile.waitForFunction(() => document.querySelector('#stage').dataset.location === 'opening');
  const pin = await mobile.locator('.map-player').boundingBox();
  const destination = await mobile.locator('[data-district="midtown"]').boundingBox();
  assert(Math.abs(pin.x + pin.width / 2 - destination.x - destination.width / 2) < 2, 'Player pin follows the selected destination');
  await mobile.evaluate(() => { LR_CH.order.forEach(id => LR_CH.done(id)); LR_CH.paint(); });
  await mobile.locator('[data-mode="endless"]').click();
  await mobile.waitForFunction(() => LR_MENU.state.mode === 'endless');
  const start = await mobile.locator('#start').boundingBox();
  assert(start && start.y >= 0 && start.y + start.height <= 320, 'Endless CTA stays in bounds on the small screen');
  await mobile.locator('[data-mode="chapter"]').click();
  await mobile.waitForFunction(() => LR_MENU.state.mode === 'story');
  assert.equal(await mobile.evaluate(() => LR_MENU.state.selected), 'midtown');
  await inBounds(mobile, '568×320 returning to Story');
  pass('Small layout keeps the CTA reachable, moves the player pin, and never previews chapter scenery');
  await mobile.evaluate(() => { window.__mapPadActive = true; window.__mapPadDpad = 1; dispatchEvent(new Event('gamepadconnected')); });
  await mobile.waitForFunction(() => LR_MENU.state.selected === 'park');
  await stillHome(mobile);
  await mobile.evaluate(() => { window.__mapPadDpad = 0; });
  await mobile.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
  await mobile.evaluate(() => { window.__mapPadDirection = -1; });
  await mobile.waitForFunction(() => LR_MENU.state.selected === 'midtown');
  await stillHome(mobile);
  await mobile.evaluate(() => { window.__mapPadDirection = 0; window.__mapPadButton = true; });
  await mobile.waitForFunction(() => longRun.state === 'playing' && longRun.snapshot.districtId === 'midtown');
  pass('Controller horizontal input navigates the map and A starts the selected chapter');
  await small.context.close();
  assert.deepEqual(errors, [], 'no browser exceptions during menu interactions');
  pass('No browser exceptions');
  console.log(JSON.stringify({ passed: checks.length, url: String(baseURL), checks }, null, 2));
} finally {
  await browser.close();
}
