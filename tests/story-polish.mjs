import {skipOpeningCall} from './helpers/launch.mjs';
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {mkdir} from 'node:fs/promises';
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox','--disable-dev-shm-usage','--enable-unsafe-swiftshader']});
const url=process.env.TEST_URL||'http://127.0.0.1:4181/';
const errors=[];
try{
 const page=await browser.newPage({viewport:{width:1440,height:900},reducedMotion:'reduce'});
 page.on('pageerror',e=>errors.push(e.message));
 await page.goto(url,{waitUntil:'networkidle'});
 await page.waitForFunction(()=>window.longRun&&!document.querySelector('#start').disabled&&!document.querySelector('#splash'));
 // Malformed and partial saves must not open Endless; old Story records survive.
 const saves=await page.evaluate(()=>{
  const values=['null','{}','"park"','["park"]','["opening","midtown"]'];
  return values.map(value=>{localStorage.setItem('lr.chapters.done',value);return LR_CH.endlessUnlocked()});
 });assert.deepEqual(saves,[false,false,false,false,false]);
 await page.evaluate(()=>{localStorage.removeItem('lr.chapters.done');localStorage.setItem('nyc.opening-bell.best','1234')});
 await page.locator('#start').click(); await skipOpeningCall(page);
 await page.waitForFunction(()=>longRun.state==='playing');
 // Stop the visual clock while exercising the real soundtrack and DOM events.
 await page.evaluate(()=>{const next=requestAnimationFrame.bind(window);window.requestAnimationFrame=()=>0;return new Promise(next)});
 await page.locator('#now-playing').waitFor({state:'visible'});
 assert.equal(await page.locator('#now-playing-title').innerText(),'Downtown Good Company');
 await page.waitForTimeout(5150);
 assert.equal(await page.locator('#now-playing').isVisible(),false,'Title disappears after five seconds');
 await page.evaluate(()=>{SA.startMusic('contrarian')});
 await page.waitForFunction(()=>!SA.musicTracks.contrarian.paused);
 await page.locator('#now-playing').waitFor({state:'visible'});
 assert.equal(await page.locator('#now-playing-title').innerText(),'Good ol’ Company');
 assert.equal(await page.evaluate(()=>SA.track.paused),true,'Event music remains exclusive');
 await page.evaluate(()=>SA.endMusic());
 await page.waitForFunction(()=>!SA.track.paused);
 assert.equal(await page.locator('#now-playing-title').innerText(),'Downtown Good Company');
 await page.evaluate(()=>{SA.toggle()});
 assert.equal(await page.locator('#now-playing').isVisible(),false);
 await page.evaluate(()=>{q.won=false;q.dead=true;qQ()});
 assert.equal(await page.locator('#now-playing').isVisible(),false,'Muted results cannot advertise inaudible music');
 assert.equal(await page.evaluate(()=>localStorage.getItem('nyc.opening-bell.best')),'1234','Historical Story record retained without new writes');
 assert.equal(await page.locator('.report-numbers').isVisible(),false);
 assert.doesNotMatch(await page.locator('#results').innerText(),/TOTAL RETURN|PERSONAL BEST|GOLD RETURN|Post score/);
 await page.evaluate(()=>SA.toggle());
 await page.locator('#now-playing').waitFor({state:'visible'});
 // Switching chapters should display the actual new chapter recording, too.
 for(const id of ['midtown','park']){
  await page.evaluate(id=>{LR_CH.order.forEach(k=>LR_CH.done(k));Cu(false);fu(id);Ko()},id);
  await page.waitForFunction(id=>SA.track.__lrKey===id&&!SA.track.paused,id);
  await page.waitForFunction(()=>!document.querySelector('#now-playing').hidden);
  assert.equal(await page.locator('#now-playing-title').innerText(),id==='midtown'?'Good Company Never Dies':'Diversified Ballad');
 }
 // A pending Endless rank response must not resurrect score entry in Story.
 await page.evaluate(async()=>{
  const rank=LongRunBoard.store.rank;let resolve;
  LongRunBoard.store.rank=()=>new Promise(done=>{resolve=done});
  LongRunBoard.onResults({mode:'endless',procedural:true,score:100});
  LongRunBoard.onResults({mode:'chapter',score:100});resolve({rank:1,total:0});
  await Promise.resolve();LongRunBoard.store.rank=rank;
 });
 assert.equal(await page.locator('#board-strip').evaluate(el=>el.hidden),true);
 // A developer-open chapter cannot accidentally unlock Endless on a partial save.
 await page.evaluate(()=>{localStorage.setItem('lr.chapters.done',JSON.stringify(['midtown','park']));q.won=true;qQ()});
 assert.match(await page.locator('#result-detail').innerText(),/Finish every Story chapter/);
 assert.equal(await page.evaluate(()=>LR_CH.endlessUnlocked()),false);
 // Both routes remain physically present after choosing the upper route.
 const routes=await page.evaluate(()=>{
  return ['midtown','park'].map(id=>{
   const run=new yo(1000,STORY_SEED,{districtId:id,procedural:true});
   const before={obstacles:run.obstacles.slice(),platforms:run.platforms.slice(),pickups:run.pickups.slice()};
   const entry=run.platforms.find(p=>p.entry);run.support=entry.id;run.grounded=true;run.chapterTime=16.3;
   run.resolveRoute();
   return {id,route:run.routeChoice.id,obstacles:before.obstacles.every(o=>run.obstacles.includes(o)),platforms:before.platforms.every(p=>run.platforms.includes(p)),pickups:before.pickups.every(p=>run.pickups.includes(p))};
  });
 });for(const row of routes){assert.equal(row.route,'high');assert.ok(row.obstacles&&row.platforms&&row.pickups,`${row.id}: lower props must not disappear`)}
 await page.evaluate(()=>{Cu(false);localStorage.setItem('lr.chapters.done',JSON.stringify(['opening','midtown','park']))});
 await page.reload({waitUntil:'networkidle'});
 await page.waitForFunction(()=>window.longRun&&!document.querySelector('#start').disabled&&!document.querySelector('#splash'));
 assert.equal(await page.evaluate(()=>LR_CH.endlessUnlocked()),true,'Unlock survives reload');
 assert.equal(await page.locator('[data-mode="endless"]').getAttribute('aria-disabled'),'false');
 await page.locator('[data-mode="endless"]').click();
 assert.equal(await page.locator('#home-hi').isVisible(),true);
 await mkdir('review/v114',{recursive:true});
 await page.screenshot({path:'review/v114/endless-unlocked.png'});
 assert.deepEqual(errors,[]);
 console.log('PASS: Story without scores or new records; protected saves and persistent Endless unlock; five-second real-track titles, exclusive Contrarian audio and mute handling; no route props removed.');
}finally{await browser.close()}
