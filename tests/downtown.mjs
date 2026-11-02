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
        return {distance:q.distance,heroX:panel?(panel.x+441/1024*panel.width)*scale:null,
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
    const visits={};
    for(let distance=0;distance<=25920;distance+=100){
      const scene=LR_SCENERY.layout('opening',distance,1000,540,'chapter');
      for(const panel of scene.panels){
        if(/:(kabin|lei)$/.test(panel.id))visits[panel.id.split(':')[1]]={panel:panel.sourceIndex,worldX:panel.segment*scene.stride,width:panel.width};
      }
    }
    return visits;
  });
  assert.deepEqual(Object.keys(frontage).sort(),['kabin','lei']);
  assert.notEqual(frontage.kabin.panel,frontage.lei.panel,'Kabin and LEI occupy separate city blocks');
  assert.ok(frontage.lei.worldX-frontage.kabin.worldX>1000,'Downtown venues are more than a gameplay viewport apart');
  const route=await page.evaluate(()=>{
    const story=LR_SCENERY.inspect('opening',25920,1000,540,'chapter');
    const tail=[];for(let d=50000;d<120000;d+=500)tail.push(...LR_SCENERY.layout('opening',d,1000,540,'endless').panels);
    return {lastVisible:story.panels.some(p=>p.sourceIndex===story.panelCount-1),end:story.scroll,max:story.stripWidth-1000,
      tail:[...new Set(tail.map(p=>p.id))],tailIndices:[...new Set(tail.map(p=>p.sourceIndex))],loopStart:story.loopStart};
  });
  assert.equal(route.lastVisible,true,'The final waterfront is reached within the normal Story course');
  assert.ok(Math.abs(route.end-route.max)<.01);
  assert.ok(route.tailIndices.every(index=>index>=route.loopStart));
  assert.equal(route.tail.some(id=>/lower-manhattan|brooklyn-bridge|kabin|lei/.test(id)),false,'Endless repeats only anonymous city/waterfront blocks');
  const bridgeViews=[];
  for(const viewport of [{width:1440,height:900},{width:844,height:390},{width:568,height:320}]){
    await page.setViewportSize(viewport);
    const view=await page.evaluate(()=>{
      Cu(false);fu('opening');Ko('chapter');b='paused';SA.pause();
      let best=null;
      for(let distance=7000;distance<24000;distance+=25){
        q.distance=distance;q.chapterDistance=distance;
        const scene=LR_SCENERY.layout('opening',distance,eA,kA,'chapter');
        const bridge=scene.layers.find(layer=>layer.kind==='bridge');
        if(!bridge)continue;
        const left=bridge.x+bridge.width*.08,right=bridge.x+bridge.width*.92;
        if(left<16||right>eA-16)continue;
        const base=bridge.y+bridge.height*593/724,camera=T-q.floorY;
        const clearance=Math.min(...Array.from({length:33},(_,i)=>q.floorAt(left+(right-left)*i/32)+camera-base));
        if(!best||clearance>best.clearance)best={distance,clearance,bridge};
      }
      if(!best)return null;
      q.distance=best.distance;q.chapterDistance=best.distance;q.y=q.floorY;q.grounded=true;ir=q.y;Kt=T-q.floorY;$i=0;
      $A.update(0,q,{id:'opening',reduced:true,quality:1});vu();
      const image=LR_SCENERY.source('opening',best.bridge);
      return {...best,viewport:{width:innerWidth,height:innerHeight},nativeWidth:image.naturalWidth,nativeHeight:image.naturalHeight};
    });
    assert.ok(view&&view.clearance>20,`Both bridge towers and main span are readable above normal terrain at width ${viewport.width}`);
    assert.ok(view.nativeWidth>=2000&&view.nativeHeight>=700,'Complete bridge retains native panoramic detail');
    bridgeViews.push(view);
    await page.screenshot({path:`${output}/bridge-readable-${viewport.width}.png`});
  }
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
  await writeFile(`${output}/checks.json`,JSON.stringify({records,frontage,route,bridgeViews,events},null,2));
  console.log('PASS: One WTC framing after idle/retry and8seconds, spoiler-free home scene, no floating legacy traffic, architecture-only venue composition, full Story coverage and bridge-free Endless tail.');
}finally{await browser.close();}
