import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
import {pathToFileURL} from 'node:url';
const modulePath=process.env.PLAYWRIGHT_MODULE||'playwright';
const {chromium}=await import(modulePath.startsWith('/')?pathToFileURL(modulePath).href:modulePath);

const url=new URL(process.env.TEST_URL||'http://127.0.0.1:4181');
url.searchParams.set('unlock','all');
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',headless:true,args:['--no-sandbox','--disable-dev-shm-usage','--enable-unsafe-swiftshader']});
const output=new URL('../review/downtown/',import.meta.url).pathname;
await mkdir(output,{recursive:true});
const errors=[],records=[];
try{
  const page=await browser.newPage({viewport:{width:1440,height:900},reducedMotion:'reduce'});
  page.setDefaultTimeout(45000);
  page.on('pageerror',error=>errors.push(error.message));
  await page.goto(url.href,{waitUntil:'networkidle',timeout:60000});
  await page.waitForFunction(()=>window.longRun&&LR_SCENERY.ready&&LR_KABIN.ready&&!document.querySelector('#start').disabled&&!document.querySelector('#splash'));
  for(const viewport of [{width:1440,height:900},{width:844,height:390},{width:568,height:320}]){
    await page.setViewportSize(viewport);
    const record=await page.evaluate(()=>{
      Cu(false);fu('park');UA+=180;
      let distance;
      const draw=LR_SCENERY.gl;
      LR_SCENERY.gl=function(gl,original,D,W,H){distance=D;return draw(gl,original,D,W,H);};
      vu();LR_SCENERY.gl=draw;
      const home={distance,location:document.querySelector('#stage').dataset.location,label:document.querySelector('#district').textContent};
      fu('opening');Ko('chapter');b='paused';SA.pause();q.invincible=10000;
      let dynamicCalls=0, dynamic=nt?.dynamic;
      if(nt)nt.dynamic=function(...args){dynamicCalls++;return dynamic.apply(this,args);};
      const sample=()=>{
        vu();
        const scene=LR_SCENERY.inspect('opening',q.distance,eA,kA,'chapter');
        const panel=scene.panels.find(p=>p.original),scale=innerWidth/eA;
        const brand=document.querySelector('.brand').getBoundingClientRect(),hud=document.querySelector('#live-hud').getBoundingClientRect();
        return {distance:q.distance,heroX:panel?(panel.x+200/1536*panel.width)*scale:null,
          brandRight:brand.right,hudLeft:hud.left,hudRight:hud.right,scroll:scene.scroll};
      };
      const start=sample();
      for(let i=0;i<8*120;i++)q.step(1/120,false);
      Kt=T-q.floorY;ir=q.y;const eight=sample();
      const firstRetry=start.scroll;
      Cu(false);fu('opening');Ko('chapter');b='paused';SA.pause();
      const retry=sample();if(nt&&dynamic)nt.dynamic=dynamic;
      return {viewport:{width:innerWidth,height:innerHeight},home,start,eight,retry,dynamicCalls,firstRetry};
    });
    assert.equal(record.home.distance,0,'Home cannot drift past the skyline while browsing');
    assert.equal(record.home.location,'opening','Map selection must not reveal another district painting');
    assert.equal(record.home.label,'NEW YORK');
    assert.ok(record.start.heroX>record.start.brandRight+8,'One WTC spire clears the brand at start');
    assert.ok(record.start.heroX<record.start.hudLeft-8||record.start.heroX>record.start.hudRight+8,'One WTC spire clears the central HUD at start');
    assert.ok(record.eight.heroX>record.eight.brandRight+8,'One WTC still clears the brand at8seconds');
    assert.ok(record.eight.heroX<record.eight.hudLeft-8||record.eight.heroX>record.eight.hudRight+8,'One WTC still clears the HUD at8seconds');
    assert.equal(record.retry.scroll,record.firstRetry,'Retry restores the same establishing composition');
    assert.equal(record.dynamicCalls,0,'No unsupported train/car geometry overlays the painted city');
    records.push(record);
    await page.locator('#stage').screenshot({path:`${output}/hero-${viewport.width}.png`});
  }
  const frontage=await page.evaluate(()=>{
    const painting=LR_SCENERY.images[2],composed=LR_KABIN.frontage(painting,3);
    const raw=document.createElement('canvas');raw.width=painting.naturalWidth;raw.height=painting.naturalHeight;
    const c=raw.getContext('2d');c.drawImage(painting,0,0);
    const original=c.getImageData(0,0,raw.width,raw.height).data;
    const final=composed.getContext('2d').getImageData(0,0,raw.width,raw.height).data;
    const spots=LR_KABIN.spots(),changed=spots.map(()=>0);let outside=0;
    for(let y=0;y<raw.height;y++)for(let x=0;x<raw.width;x++){
      const i=(y*raw.width+x)*4;if(original[i]===final[i]&&original[i+1]===final[i+1]&&original[i+2]===final[i+2]&&original[i+3]===final[i+3])continue;
      const b=spots.findIndex(s=>x>=s.sourceRect[0]&&x<s.sourceRect[0]+s.sourceRect[2]&&y>=s.sourceRect[1]&&y<s.sourceRect[1]+s.sourceRect[3]);
      if(b<0)outside++;else changed[b]++;
    }
    return {outside,changed};
  });
  assert.equal(frontage.outside,0,'Venue composition must not alter surrounding architecture');
  assert.ok(frontage.changed.every(n=>n>5000),'Both named venues are actually present in their facade bays');
  const route=await page.evaluate(()=>{
    const story=LR_SCENERY.inspect('opening',25920,1000,540,'chapter');
    const tail=[];for(let d=50000;d<120000;d+=500)tail.push(...LR_SCENERY.layout('opening',d,1000,540,'endless').panels);
    return {lastVisible:story.panels.some(p=>p.sourceIndex===4),end:story.scroll,max:story.stripWidth-1000,storyUsesOriginalBattery:story.panels.filter(p=>p.sourceIndex===4).every(p=>!p.variant),
      tailVariant:tail.filter(p=>p.sourceIndex===4).every(p=>p.variant==='battery-loop'),tail:[...new Set(tail.map(p=>p.sourceIndex))]};
  });
  assert.equal(route.lastVisible,true,'Battery is reached within the normal Story course');
  assert.ok(Math.abs(route.end-route.max)<.01);
  assert.deepEqual(route.tail.sort(),[3,4],'Endless never reintroduces the partial bridge or skyline');
  assert.equal(route.storyUsesOriginalBattery,true);assert.equal(route.tailVariant,true);
  const events=await page.evaluate(()=>{
    Cu(false);fu('opening');Ko('chapter');b='paused';SA.pause();q.invincible=10000;
    q.distance=ee(31);q.chapterDistance=q.distance;q.chapterTime=31;q.time=31;
    const camera=()=>LR_SCENERY.layout('opening',q.distance,eA,kA,'chapter').scroll;
    let last=camera(),backwards=0;
    const track=()=>{const now=camera();if(now<last-1e-6)backwards++;last=now;};
    q.beginContrarian();
    for(let i=0;i<15*120;i++){q.step(1/120,false);track();}
    const leftContrarian=!q.contrarian;
    const beforeFlight=camera();q.beginFlight();const afterFlight=camera();
    // Hold the boss for an extra15seconds using its existing progress model.
    for(let i=0;i<15*120;i++){q.bossProgress=0;q.step(1/120,false);track();}
    return {backwards,leftContrarian,beforeFlight,afterFlight,scroll:last};
  });
  assert.equal(events.backwards,0,'Contrarian transitions and extended boss waits never rewind the scenery');
  assert.equal(events.leftContrarian,true);
  assert.equal(events.beforeFlight,events.afterFlight,'Entering the boss does not jump the camera');
  assert.deepEqual(errors,[]);
  await writeFile(`${output}/checks.json`,JSON.stringify({records,frontage,route,events},null,2));
  console.log('PASS: One WTC framing after idle/retry and8seconds, spoiler-free home scene, no floating legacy traffic, architecture-only venue composition, full Story coverage and bridge-free Endless tail.');
}finally{await browser.close();}
