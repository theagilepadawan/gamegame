import assert from 'node:assert/strict';
import {pathToFileURL} from 'node:url';
const moduleName=process.env.PLAYWRIGHT_MODULE || 'playwright';
const {chromium}=await import(moduleName.startsWith('/') ? pathToFileURL(moduleName).href : moduleName);
import {mkdir,writeFile} from 'node:fs/promises';
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH || '/usr/bin/chromium',headless:true,args:['--no-sandbox','--disable-dev-shm-usage','--enable-unsafe-swiftshader']});
const output=process.env.VISIBILITY_OUTPUT || 'review/v19-qa/visibility-final'; await mkdir(output,{recursive:true});
try {
 const page=await browser.newPage({viewport:{width:1440,height:900},reducedMotion:'reduce'});
 const errors=[];page.on('pageerror',error=>errors.push(error.message));
 const url=new URL(process.env.TEST_URL || 'http://127.0.0.1:4181/release/The-Long-Run-NBIM.html'); url.searchParams.set('unlock','all');
 await page.goto(url.href,{waitUntil:'networkidle',timeout:90000});
 await page.waitForFunction(()=>window.longRun&&LR_SCENERY.ready&&!document.querySelector('#start').disabled&&!document.querySelector('#splash'),{},{timeout:90000});
 await page.evaluate(()=>{const next=requestAnimationFrame.bind(window);requestAnimationFrame=()=>0;return new Promise(resolve=>next(resolve));});
 const reports=[];
 for(const W of [540,600,640,680,720,760,800,864,960,1168,1440]) {
  await page.setViewportSize({width:W,height:540}); await page.waitForFunction(W=>eA===W,W);
  const rows=await page.evaluate(()=>{
   const rows=[];
   for(const district of ['opening','midtown']) {
    Cu(false);fu(district);Ko('chapter');b='paused';SA.pause();const marks={};
    for(let frame=0;frame<82*120;frame++) {
     if(frame%6===0) {
      const items=district==='midtown'?LR_SHOPS.inspect(q.distance,eA,kA).items:LR_KABIN.spots(q.distance,eA,kA,'chapter');
      for(const item of items) {
       const r=item.rect,mark=marks[item.key]||={key:item.key,samples:[]};
       const horizontal=r.x>=20&&r.x+r.width<=eA-20;
       const heights=Array.from({length:17},(_,i)=>q.floorAt(r.x+r.width*i/16)+T-q.floorY);
       const clearance=Math.min(...heights)-r.y-r.height;
       // Native visual bounds of Kabin's complete name sign and double door;
       // the wider production fixture also includes side glazing and planters.
       const scale=r.width/410;
       const core=item.key==='kabin'?{x:r.x+102*scale,y:r.y+5*scale,width:210*scale,height:191*scale}:r;
       const coreHeights=Array.from({length:17},(_,i)=>q.floorAt(core.x+core.width*i/16)+T-q.floorY);
       const coreClearance=Math.min(...coreHeights)-core.y-core.height;
       const coreHorizontal=core.x>=20&&core.x+core.width<=eA-20;
       const areaVisible=heights.reduce((sum,y)=>sum+Math.max(0,Math.min(1,(y-r.y)/r.height)),0)/heights.length;
       mark.samples.push({time:q.time,distance:q.distance,horizontal,clearance,coreClearance,coreHorizontal,areaVisible,rect:r,core,
         grounded:q.grounded,flight:!!q.flight,contrarian:q.contrarian});
      }
     }
     q.invincible=999;q.floorY=q.floorAt(q.x);q.step(1/120);if(q.won||q.dead)break;
    }
    rows.push({district,W:eA,finish:q.time,won:q.won,dead:q.dead,marks:Object.values(marks)});
   }
   return rows;
  });
  reports.push(...rows);
 }
 for(const row of reports) for(const mark of row.marks) {
  const ranges=[];let current=null;
  for(const s of mark.samples) {
   if(s.horizontal&&s.clearance>=2) {
    if(!current) {current={start:s.time,end:s.time,samples:[]};ranges.push(current);}
    current.end=s.time;current.samples.push(s);
   }else current=null;
  }
  mark.intervals=ranges.map(r=>({start:r.start,end:r.end,duration:r.end-r.start}));
  const best=ranges.sort((a,b)=>(b.end-b.start)-(a.end-a.start))[0];
  mark.acceptance=best?{duration:best.end-best.start,...best.samples[Math.floor(best.samples.length/2)]}:null;
 }
 for(const row of reports) for(const mark of row.marks) {
  const ranges=[];let current=null;
  for(const sample of mark.samples) {
   if(sample.coreHorizontal&&sample.coreClearance>=2) {
    if(!current){current={start:sample.time,end:sample.time,samples:[]};ranges.push(current);}
    current.end=sample.time;current.samples.push(sample);
   }else current=null;
  }
  const best=ranges.sort((a,b)=>(b.end-b.start)-(a.end-a.start))[0];
  mark.recognition=best?{duration:best.end-best.start,...best.samples[Math.floor(best.samples.length/2)]}:null;
 }
 await writeFile(`${output}/report.json`,JSON.stringify(reports,null,2));
 for(const row of reports) {assert.equal(row.won,true);assert.equal(row.dead,false);}
 for(const row of reports) for(const mark of row.marks) {
  assert.ok(mark.recognition&&mark.recognition.duration>=2,
   `${row.district} ${mark.key} W${row.W}: complete sign/entrance must remain clear of foreground terrain for at least 2s`);
 }
 await page.setViewportSize({width:1440,height:900});await page.waitForFunction(()=>eA===864);
 for(const row of reports.filter(row=>row.W===864)) for(const mark of row.marks) {
  const sample=mark.acceptance?.duration>=2?mark.acceptance:mark.recognition;
  await page.evaluate(({district,time})=>{
   Cu(false);fu(district);Ko('chapter');b='paused';SA.pause();
   for(let frame=0;frame<Math.round(time*120);frame++){q.invincible=999;q.floorY=q.floorAt(q.x);q.step(1/120);}
   q.flight=false;q.transfer=null;q.contrarian=false;q.invincible=0;q.shield=0;
   q.floorY=q.floorAt(q.x);q.y=q.floorY;q.grounded=true;q.vy=0;q.support=null;
   ir=q.y;Kt=T-q.floorY;$i=0;UA=q.time;b='playing';
   $A.update(0,q,{id:district,reduced:true,quality:1});Vu();vu();
  },{district:row.district,time:sample.time});
  await page.screenshot({path:`${output}/${row.district}-${mark.key}-clear.png`});
 }

 assert.deepEqual(errors,[]);
 for(const row of reports) console.log(`PASS ${row.district} W${row.W}: ${row.marks.map(mark => `${mark.key} ${mark.recognition.duration.toFixed(2)}s clear`).join(', ')}`);
}finally{await browser.close();}
