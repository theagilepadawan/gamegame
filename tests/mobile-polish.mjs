import {skipOpeningCall} from './helpers/launch.mjs';
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {mkdir,writeFile} from 'node:fs/promises';
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox','--disable-dev-shm-usage','--enable-unsafe-swiftshader']});
const output='review/v115/mobile';await mkdir(output,{recursive:true});const report=[],errors=[];
const overlap=(a,b)=>a&&b&&a.width>0&&b.width>0&&a.x<b.x+b.width&&a.x+a.width>b.x&&a.y<b.y+b.height&&a.y+a.height>b.y;
try{
 for(const [width,height] of [[568,320],[844,390],[1280,549]]){
  const context=await browser.newContext({viewport:{width,height},hasTouch:true,isMobile:true,deviceScaleFactor:width===844?2:1});
  const page=await context.newPage();page.setDefaultTimeout(60000);page.on('pageerror',e=>errors.push(e.message));
  await page.addInitScript(()=>{localStorage.setItem('lr.chapters.done',JSON.stringify(['opening','midtown']))});
  await page.goto(process.env.TEST_URL||'http://127.0.0.1:4181/',{waitUntil:'networkidle'});
  await page.waitForFunction(()=>window.longRun?.environment.ready&&!document.querySelector('#start').disabled&&!document.querySelector('#splash'));
  const item={width,height,chapters:[]};
  for(const id of ['opening','midtown','park']){
   await page.evaluate(id=>fu(id),id);
   await page.waitForFunction(id=>LR_MENU.state.selected===id,id);
   await page.waitForTimeout(400);
   const button=await page.locator('#start').boundingBox(),intro=await page.locator('#intro').boundingBox(),hud=await page.locator('.hud').boundingBox();
   assert.ok(button.height>=40,'Play remains a large touch target');
   assert.ok(button.y+button.height<=height-16,'Play has real bottom breathing room');
   assert.ok(intro.y>=hud.y+hud.height+7,'Heading clears the brand header');
   assert.ok(button.x>=0&&button.x+button.width<=width,'Play is fully on screen');
   assert.equal(await page.locator('#start').evaluate(n=>{const r=n.getBoundingClientRect();return n.contains(document.elementFromPoint(r.x+r.width/2,r.y+r.height/2))}),true,'Play is not covered');
   item.chapters.push({id,button});
  }
  await page.screenshot({path:`${output}/story-${width}.png`});
  assert.equal(await page.evaluate(()=>longRun.performance.worldHeight),540,'Home framing stays unchanged');
  await page.locator('#start').click(); await skipOpeningCall(page);
  await page.waitForFunction(()=>longRun.state==='playing');
  await page.evaluate(()=>{const next=requestAnimationFrame.bind(window);window.requestAnimationFrame=()=>0;return new Promise(next)});
  // Layout checks deliberately refresh the real mixer-owned page card after
  // freezing rendering; five-second expiry is exercised in story-polish.mjs.
  await page.evaluate(()=>{LR_MUSIC.page('layout-check');SA.play()});
  await page.locator('#now-playing').waitFor({state:'visible'});
  assert.equal(await page.locator('.music-label').innerText(),'NOW PLAYING');
  assert.equal(await page.locator('#now-playing-title').innerText(),'Diversified Ballad');
  item.performance=await page.evaluate(()=>longRun.performance);
  assert.equal(item.performance.worldHeight,504);assert.equal(item.performance.mobileZoom,1.071);
  assert.ok(item.performance.worldWidth>=540);assert.equal(item.performance.physicsHz,120);
  const card=await page.locator('#now-playing').boundingBox();
  assert.ok(card.x>=12&&card.x+card.width<=width-12&&card.y+card.height<height,'Music card fits');
  for(const selector of ['.hud','#touch-jump','#touch-slide','#chapter-strip']){
   const box=await page.locator(selector).boundingBox();assert.ok(!overlap(card,box),`Music card clears ${selector}`);
  }
  assert.ok(await page.locator('.music-record svg').isVisible(),'Crisp record illustration is present');
  assert.ok(await page.locator('#now-playing-title').evaluate(n=>parseFloat(getComputedStyle(n).fontSize))>=12,'Song remains legible');
  await page.evaluate(()=>{vu();});await page.waitForTimeout(450);
  await page.screenshot({path:`${output}/park-music-${width}.png`});
  await page.evaluate(()=>{q.beginContrarian();FD();vu()});
  await page.waitForFunction(()=>SA.activeMusic==='contrarian'&&!SA.musicTracks.contrarian.paused);
  await page.locator('#now-playing').waitFor({state:'visible'});
  assert.equal(await page.locator('#now-playing-title').innerText(),'Good ol’ Company');
  const flippedCard=await page.locator('#now-playing').boundingBox();
  for(const selector of ['#contrarian-label','#touch-jump','#touch-slide']){
   assert.ok(!overlap(flippedCard,await page.locator(selector).boundingBox()),`Contrarian music clears ${selector}`);
  }

  await page.evaluate(()=>{Cu(false);LR_CH.order.forEach(id=>LR_CH.done(id));zA='endless';Eg();Ko('endless',{seed:5143});b='paused';SA.pause();q.autoSpawn=false;q.distance=1800;q.time=5;q.nextX=q.x+100;q.spawn(20);q.y=q.floorY;ir=q.y;Kt=endlessCameraY(q,eA,kA);vu()});
  const sized=await page.evaluate(()=>q.obstacles.filter(o=>o.type!=='gap').map(o=>({type:o.type,w:o.w,h:o.h})));
  assert.ok(sized.length>0&&sized.every(o=>o.w>=98),'Starting props cannot become thin strips');
  await page.screenshot({path:`${output}/endless-${width}.png`});
  item.camera=await page.evaluate(()=>{
   let count=0,minAheadMargin=Infinity,minHeadroom=Infinity;
   for(let seed=0;seed<32;seed++){
    const run=new hi(eA,seed,{mode:'endless',procedural:true});run.autoSpawn=false;
    for(let distance=700;distance<22000;distance+=177){
     run.distance=distance;run.speed=700;run.y=run.floorY;
     const target=endlessCameraY(run,eA,kA),reach=Math.max(0,Math.min(eA-run.x-24,run.speed*.9));
     for(let n=0;n<=16;n++)minAheadMargin=Math.min(minAheadMargin,kA-(run.floorAt(run.x+reach*n/16)+target));
     for(const rise of [0,135,260]){run.y=run.floorY-rise;minHeadroom=Math.min(minHeadroom,run.y+endlessCameraY(run,eA,kA)-114);}
     count++;
    }
   }
   return {count,minAheadMargin,minHeadroom};
  });
  assert.ok(item.camera.minAheadMargin>30,'Descending approach banks remain inside the closer viewport');
  assert.ok(item.camera.minHeadroom>=100,'Double/super-jump poses retain headroom');

  await page.evaluate(()=>Cu(false));assert.equal(await page.evaluate(()=>longRun.performance.worldHeight),540,'Returning home restores framing');
  item.hitch=await page.evaluate(()=>{frameMeter.count=0;frameMeter.index=0;frameMeter.visible=true;Ku(au+400);return longRun.performance});
  assert.equal(item.hitch.fps,2.5,'A visible long frame is counted, not hidden from reported FPS');
  assert.equal(item.hitch.frameP95Ms,400);
  await page.evaluate(()=>{document.dispatchEvent(new Event('visibilitychange'));Ku(au+5000)});
  assert.equal(await page.evaluate(()=>longRun.performance.samples),1,'Returning from a background tab does not contaminate FPS');
  report.push(item);await context.close();
 }
 assert.deepEqual(errors,[]);
 await writeFile(`${output}/report.json`,JSON.stringify(report,null,2));
 console.log('PASS: three touch viewports, every chapter CTA, 7% fixed zoom and home restoration, legible music asset, HUD/control clearance, 120Hz physics and full-width opening props.');
}finally{await browser.close()}
