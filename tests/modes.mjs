import {skipOpeningCall} from './helpers/launch.mjs';
import assert from 'node:assert/strict';
import {pathToFileURL} from 'node:url';

const playwrightPath = process.env.PLAYWRIGHT_MODULE || 'playwright';
const {chromium} = await import(playwrightPath.startsWith('/') ? pathToFileURL(playwrightPath).href : playwrightPath);
const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || '/usr/bin/chromium',
  headless: true,
  args: ['--no-sandbox', '--disable-dev-shm-usage', '--enable-unsafe-swiftshader'],
});
const context = await browser.newContext({viewport: {width: 1440, height: 900}, reducedMotion: 'reduce'});
const page = await context.newPage();
page.setDefaultTimeout(15000);
page.setDefaultNavigationTimeout(30000);
const progress = text => console.log('[modes]', text);
const errors = [];
page.on('pageerror', error => errors.push(error.message));
await page.addInitScript(() => {
  // Feed the real gamepad polling loop; no production test controls are added.
  window.__testPadDown = false;
  Object.defineProperty(navigator, 'getGamepads', {value: () => [{
    axes: [0, 0], buttons: Array.from({length: 16}, (_, index) => ({pressed: index === 0 && window.__testPadDown})),
  }]});
});
const visible = selector => page.locator(selector).isVisible();
const state = () => page.evaluate(() => window.longRun.state);
const waitPlaying = district => page.waitForFunction(id => longRun.state === 'playing' && (!id || longRun.snapshot.districtId === id), district);
async function finish(won) {
  await page.evaluate(win => {
    // Exercise actual results/unlock/reveal code with an otherwise valid live model.
    q.won = win;
    q.dead = !win;
    q.cause = 'Test finish';
    q.bonus += 1500;
    qQ();
  }, won);
  await page.waitForFunction(() => longRun.state === 'over');
}
async function resultReady(primary) {
  await page.waitForFunction(id => {
    const r = document.querySelector('#results');
    return !r.inert && r.dataset.primary === id && document.activeElement.id === id;
  }, primary);
  assert.equal(await page.locator('.result-actions > button').first().getAttribute('id'), primary);
  assert.equal(await page.locator(`#${primary}`).evaluate(button => button.classList.contains('primary')), true);
}
async function gamepadPress() {
  await page.evaluate(() => { window.__testPadDown = true; dispatchEvent(new Event('gamepadconnected')); });
  await page.waitForFunction(() => longRun.state === 'playing');
  await page.evaluate(() => { window.__testPadDown = false; });
}
try {
  progress('loading');
  await page.goto(process.env.TEST_URL || 'http://127.0.0.1:4181', {waitUntil: 'networkidle'});
  await page.waitForFunction(() => window.longRun && !document.querySelector('#start').disabled && !document.querySelector('#splash'));
  assert.deepEqual(await page.locator('[data-mode]').evaluateAll(buttons => buttons.map(b => b.dataset.mode)), ['chapter', 'endless']);
  assert.deepEqual(await page.evaluate(() => LongRunBoard.boards.map(board => board.id)), ['endless']);
  assert.equal(await page.locator('#contrarian-preview').count(), 0);
  assert.equal(await visible('.world-picker'), false);
  assert.equal(await page.locator('#new-world').isEnabled(), false);

  progress('home ready');
  // Fresh profiles cannot select or start Endless through UI or the start API.
  assert.equal(await page.evaluate(() => LR_CH.endlessUnlocked()), false);
  await page.locator('[data-mode="endless"]').click({force:true});
  assert.equal(await visible('.world-picker'), false);
  assert.equal(await visible('#home-hi'), false);
  await page.evaluate(() => Ko('endless'));
  assert.equal(await state(), 'home');
  assert.match(await page.locator('#load-status').innerText(), /Finish all three/);
  // Preserve a previous seed independently of the fixed Story journey.
  const endlessSeed = 0x0BADF00D;
  await page.evaluate(seed => {qe = seed;}, endlessSeed);
  await page.locator('#start').click(); await skipOpeningCall(page);
  await waitPlaying('opening');
  const story = await page.evaluate(() => ({seed: q.seed, terrain: longRun.snapshot.terrainSamples, crest: q.pickups.some(p => p.kind === 'contrarian')}));
  assert.equal(story.crest, true);
  assert.notEqual(story.seed, endlessSeed);
  assert.equal(await visible('#live-hud'), false);
  progress('finishing loss');
  await finish(false);
  await resultReady('restart');
  assert.equal(await visible('.report-numbers'), false);
  assert.equal(await page.evaluate(() => localStorage.getItem('nyc.opening-bell.best')), null);
  assert.equal(await page.locator('#board-strip:not([hidden])').count(), 0);
  assert.equal(await visible('#new-run'), false);
  assert.equal(await visible('#result-seed'), false);
  assert.match(await page.locator('#home').innerText(), /Main menu/);
  await page.keyboard.press('Enter');
  await waitPlaying('opening');
  assert.deepEqual(await page.evaluate(() => ({seed: q.seed, terrain: longRun.snapshot.terrainSamples})), {seed: story.seed, terrain: story.terrain});

  progress('finishing chapter');
  await finish(true);
  await page.waitForFunction(() => LongRunReveal.active);
  assert.equal(await page.locator('#results').evaluate(r => r.inert), true);
  progress('history reveal active');
  await page.locator('.hr-done').waitFor({state: 'visible'});
  await page.locator('.hr-done').click();
  await page.waitForFunction(() => !LongRunReveal.active);
  await resultReady('next-chapter');
  assert.equal(await page.evaluate(() => LR_CH.unlocked('midtown')), true);
  assert.equal(await page.evaluate(() => LR_CH.endlessUnlocked()), false);
  await page.keyboard.press('Enter');
  await waitPlaying('midtown');
  assert.equal(await page.evaluate(() => qe), endlessSeed);
  assert.equal(await page.evaluate(() => q.seed), story.seed);

  progress('finishing chapter');
  await finish(true);
  await resultReady('next-chapter');
  progress('gamepad next chapter');
  await gamepadPress();
  await waitPlaying('park');
  assert.equal(await page.evaluate(() => qe), endlessSeed);
  progress('finishing chapter');
  await finish(true);
  await resultReady('home');
  assert.equal(await visible('#next-chapter'), false);
  assert.equal(await page.evaluate(() => LR_RUN.unlocked()), true);
  assert.equal(await page.evaluate(() => LR_CH.endlessUnlocked()), true);
  assert.deepEqual(await page.evaluate(() => ['nyc.opening-bell.best','nyc.district.midtown.best','nyc.district.park.best'].map(k=>localStorage.getItem(k))), [null,null,null]);
  await page.keyboard.press('Enter');
  await page.waitForFunction(() => longRun.state === 'home');
  assert.equal(await visible('.world-picker'), false);
  assert.equal(await page.evaluate(() => qe), endlessSeed);

  await page.locator('[data-mode="endless"]').click();
  assert.equal(await visible('.world-picker'), true);
  assert.equal(await page.locator('#new-world').isEnabled(), true);
  await page.locator('#world-seed').click();
  await page.locator('#seed-input').fill('0BADF00D');
  await page.locator('#seed-input').press('Enter');
  assert.equal(await page.locator('#seed-code').innerText(), '0BADF00D');
  await page.locator('#start').click(); await skipOpeningCall(page);
  await waitPlaying();
  assert.equal(await page.evaluate(() => q.mode), 'endless');
  assert.equal(await page.evaluate(() => q.seed), endlessSeed);
  progress('finishing loss');
  await finish(false);
  await resultReady('restart');
  assert.equal(await visible('#new-run'), true);
  assert.equal(await visible('#result-seed'), true);
  assert.match(await page.locator('#result-seed').innerText(), /0BADF00D/);
  await page.keyboard.press('Enter');
  await waitPlaying();
  assert.equal(await page.evaluate(() => q.seed), endlessSeed);
  progress('finishing loss');
  await finish(false);
  await resultReady('restart');
  await page.locator('#new-run').click();
  await waitPlaying();
  assert.notEqual(await page.evaluate(() => q.seed), endlessSeed);
  assert.equal(await page.evaluate(() => q.seed === qe), true);
  assert.deepEqual(errors, []);
  console.log('PASS: Story/Endless UI, stable Story courses, preserved Endless seed, history reveal, keyboard/gamepad chapter defaults, final unlock, retries and new worlds.');
} finally {
  await context.close();
  await browser.close();
}
