import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
import {chromium} from 'playwright';
const url=new URL(process.env.TEST_URL || 'http://127.0.0.1:4181/');url.searchParams.set('unlock','all');
const output=process.env.OFFICE_HOST_OUTPUT || 'review/v119/office';await mkdir(output,{recursive:true});
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH || '/usr/bin/chromium',args:['--no-sandbox','--enable-unsafe-swiftshader']});
const reports=[];
try {
 for(const [name,viewport,fallback,dpr] of [['desktop',{width:1440,height:900},false,1],['mobile',{width:844,height:390},false,2],['canvas',{width:1440,height:900},true,1]]) {
  const page=await browser.newPage({viewport,deviceScaleFactor:dpr,reducedMotion:'reduce'}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  if(fallback)await page.addInitScript(()=>{const native=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(type,...args){return /webgl/i.test(type)?null:native.call(this,type,...args);};});
  await page.goto(url.href,{waitUntil:'networkidle'});
  await page.waitForFunction(()=>window.LR_OFFICE_HOST?.ready && LR_SCENERY.ready && !document.querySelector('#splash') && !document.querySelector('#start').disabled);
  if(!fallback)await page.waitForFunction(()=>longRun.environment.ready);
  await page.evaluate(()=>{const next=requestAnimationFrame.bind(window);window.requestAnimationFrame=()=>0;return new Promise(r=>next(r));});
  const report=await page.evaluate(()=>{
    Cu(false);fu('midtown');Ko('chapter');b='paused';SA.pause();
    const opening=LR_FINISH.inspect(q),background=LR_OFFICE_HOST.layout(19200,eA,kA);
    const venues=LR_SHOPS.inspect(19200,eA,kA).items.map(x=>x.key);
    q.chapterTime=60;q.chapterDistance=q.distance=19200;q.obstacles=[];q.pickups=[];q.platforms=[];q.worldItems=[];
    q.flight=false;q.flightLanding=0;q.invincible=999;q.shield=false;q.y=q.floorY;q.grounded=true;q.step(1/120);FD();
    Kt=T-q.floorY;ir=q.y;Vu();vu();
    const gate=LR_FINISH.inspect(q),host={x:gate.hostX,y:gate.floor,height:128,visible:true,fullyVisible:true};
    const canvas=document.createElement('canvas');canvas.width=Math.ceil(eA);canvas.height=Math.ceil(kA);
    const ctx=canvas.getContext('2d'),run={};
    function hash(x,y,w,h){const data=ctx.getImageData(Math.round(x),Math.round(y),Math.round(w),Math.round(h)).data;let v=2166136261;for(const n of data){v^=n;v=Math.imul(v,16777619);}return v>>>0;}
    function frame(time,reduced=false){ctx.clearRect(0,0,eA,kA);LR_OFFICE_HOST.drawEntrance(ctx,host,time,reduced,run);const h=host.height;return {body:hash(host.x-h*.16,host.y-h*.97,h*.27,h*.95),feet:hash(host.x-h*.2,host.y-h*.08,h*.4,h*.09),all:hash(host.x-h*.2,host.y-h,h*.48,h*1.02)};}
    const still=frame(10),wave=frame(10.6),paused=frame(10.6),settled=frame(13),reduced=frame(10.6,true);
    vu();return {opening,background,venues,gate,host,still,wave,paused,settled,reduced,W:eA,H:kA,renderer:longRun.renderer};
  });
  assert.ok(report.opening.hostX>report.W,'Woman arrives at the end, never at the start');
  assert.equal(report.background,null,'No duplicate background office or host');
  assert.deepEqual(report.venues,['joju','omars','gussy'],'All other integrated venues remain');
  assert.equal(report.gate.ready,true);assert.ok(report.host.x>report.W*.9 && report.host.x<report.W-40);
  assert.equal(report.host.y,report.gate.floor,'Host shoes are anchored on the foreground office pavement');
  assert.equal(report.still.body,report.wave.body);assert.equal(report.still.feet,report.wave.feet);
  assert.notEqual(report.still.all,report.wave.all,'Only the wrist greets');
  assert.deepEqual(report.wave,report.paused);assert.deepEqual(report.still,report.settled);assert.deepEqual(report.still,report.reduced);
  assert.equal(report.renderer,fallback?'district-canvas':'pixi-webgl');
  await page.screenshot({path:`${output}/${name}.png`});
  assert.deepEqual(errors,[]);reports.push({name,...report});await page.close();
  console.log(`PASS ${name}: sole foreground 505 host, correct far-right grounding, stable head/body/feet, once-only wrist greeting, pause and reduced motion.`);
 }
 await writeFile(`${output}/report.json`,JSON.stringify(reports,null,2));
}finally{await browser.close();}
