import {skipOpeningCall} from './helpers/launch.mjs';
import assert from 'node:assert/strict';
import {mkdir} from 'node:fs/promises';
import {chromium} from 'playwright';

// Exercise the real result -> Main menu flow that used to leave the picker
// showing question marks even though the saved runner was already unlocked.
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox','--disable-dev-shm-usage','--enable-unsafe-swiftshader']});
const url=new URL(process.env.TEST_URL||'http://127.0.0.1:4181/');url.searchParams.delete('unlock');
const errors=[];
await mkdir('review/v116/unlock',{recursive:true});
try {
 for(const [name,viewport,reducedMotion] of [['desktop',{width:1280,height:800},'no-preference'],['phone',{width:568,height:320},'reduce']]) {
  const context=await browser.newContext({viewport,reducedMotion,hasTouch:name==='phone',isMobile:name==='phone'});
  const page=await context.newPage();page.setDefaultTimeout(60000);
  page.on('pageerror',e=>errors.push(e.message));
  await page.goto(url.href,{waitUntil:'networkidle'});
  await page.waitForFunction(()=>window.longRun&&LR_MENU&&!document.querySelector('#start').disabled&&!document.querySelector('#splash'));
  await page.locator('[data-character="trond"]').click();
  assert.equal(await page.evaluate(()=>LR_RUN.previewing()),true);
  assert.equal(await page.locator('#character-name').innerText(),'???');
  await page.locator('[data-character="nicolai"]').click();
  await page.evaluate(()=>{LR_CH.done('opening');LR_CH.done('midtown');fu('park');Ko('chapter');q.won=true;q.dead=false;qQ()});
  await page.locator('.lr-unlock').waitFor({state:'visible'});
  assert.equal(await page.evaluate(()=>LR_RUN.unlocked()),true);
  assert.equal(await page.locator('[data-character="trond"]').innerText(),'Trond','Picker updates at unlock, without another click or reload');
  assert.equal(await page.locator('[data-character="trond"] .qm').count(),0);
  assert.equal(await page.locator('.lr-unlock strong').innerText(),'Trond');
  if(reducedMotion==='reduce') assert.equal(await page.locator('.lr-unlock').evaluate(el=>getComputedStyle(el).animationName),'none');
  await page.waitForTimeout(800);
  const card=await page.locator('.lr-unlock').boundingBox();
  assert.ok(card.height>0&&card.width>0&&card.x>=0&&card.x+card.width<=viewport.width,'Reveal fits the screen');
  await page.screenshot({path:`review/v116/unlock/${name}-reveal.png`});
  await page.locator('#home').click();
  await page.waitForFunction(()=>longRun.state==='home');
  assert.equal(await page.locator('[data-character="trond"]').innerText(),'Trond');
  assert.equal(await page.locator('[data-character="trond"]').evaluate(el=>el.classList.contains('is-locked')),false);
  assert.equal(await page.locator('[data-character="trond"]').evaluate(el=>el.classList.contains('is-new')),true);
  assert.equal(await page.locator('#character-name').innerText(),'Nicolai','Unlock does not silently switch the chosen runner');
  await page.locator('[data-character="trond"]').click();
  await page.waitForFunction(()=>LR_MENU.state.runner==='trond');
  assert.equal(await page.locator('#character-name').innerText(),'Trond');
  assert.equal(await page.evaluate(()=>LR_RUN.previewing()),false);
  assert.equal(await page.locator('#stage').getAttribute('data-runner'),'trond');
  assert.equal(await page.locator('#start').isEnabled(),true);
  assert.equal(await page.locator('[data-character="trond"]').evaluate(el=>el.classList.contains('is-new')),false);
  await page.reload({waitUntil:'networkidle'});
  await page.waitForFunction(()=>window.longRun&&LR_MENU&&!document.querySelector('#start').disabled&&!document.querySelector('#splash'));
  assert.equal(await page.evaluate(()=>longRun.character),'trond');
  assert.equal(await page.locator('[data-character="trond"]').innerText(),'Trond');
  assert.equal(await page.locator('#character-name').innerText(),'Trond');
  await page.locator('#start').click(); await skipOpeningCall(page);
  await page.waitForFunction(()=>longRun.state==='playing');
  assert.equal(await page.evaluate(()=>q.character),'trond');
  await page.evaluate(()=>{q.won=true;q.dead=false;qQ()});
  assert.equal(await page.locator('.lr-unlock').count(),0,'Replay does not repeat the first-unlock card');
  await context.close();
 }
 assert.deepEqual(errors,[]);
 console.log('PASS: actual final-chapter unlock updates the picker, reveals Trond, returns home with the correct identity, persists through reload and does not repeat; desktop, compact touch and reduced motion.');
} finally {await browser.close()}
