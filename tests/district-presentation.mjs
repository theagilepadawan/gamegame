import assert from 'node:assert/strict';
import {mkdir} from 'node:fs/promises';
import {chromium} from 'playwright';
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox','--enable-unsafe-swiftshader']});
await mkdir('review/v122/districts',{recursive:true});
try{
 const page=await browser.newPage({viewport:{width:1280,height:720}}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.goto(process.env.TEST_URL||'http://127.0.0.1:4181/',{waitUntil:'networkidle'});
 await page.waitForFunction(()=>window.longRun?.environment.ready&&LR_PROPS.ready&&!document.querySelector('#splash'));
 await page.evaluate(()=>{const raf=requestAnimationFrame;window.requestAnimationFrame=()=>0;return new Promise(resolve=>raf(resolve))});
 const fade=await page.evaluate(()=>{
   q=new yo(1000,42,{districtId:'park',ambientJetpacks:false});q.routeResolved=true;q.routeChoice={id:'high'};q.routeResolvedAt=16.2;q.chapterTime=16.35;
   const original=At.pickup,calls=[];At.pickup=(item)=>calls.push({route:item.route,alpha:d.globalAlpha});
   try{
     kD({x:300,y:250,route:'high'},0);kD({x:300,y:390,route:'low'},0);
     q.chapterTime=16.6;kD({x:300,y:390,route:'low'},0);kD({x:300,y:250,route:'high'},0);
   }finally{At.pickup=original}
   return {calls,alpha:d.globalAlpha};
 });
 assert.equal(fade.calls.length,3,'An uncollectible route trail stops drawing after the short fork fade');
 assert.equal(fade.calls[0].alpha,1);assert.ok(Math.abs(fade.calls[1].alpha-.5)<.001);assert.equal(fade.calls[2].alpha,1);assert.equal(fade.alpha,1);
 for(const districtId of ['midtown','park']){
  for(const [name,time,route] of [['upper-route',23.6,'high'],['lower-route',22,'low'],['ledge',40.1,'low']]){
   const info=await page.evaluate(({districtId,time,route})=>{
     LR_CH.order.forEach(id=>LR_CH.done(id));Cu(false);fu(districtId);Ko('chapter');
     q=new yo(eA,42,{districtId,procedural:true,ambientJetpacks:false});
     for(const name of ['obstacles','platforms','pickups','springs','worldItems'])for(const item of q[name])item.x-=time*320;
     q.time=q.chapterTime=time;q.distance=q.chapterDistance=time*320;q.routeResolved=true;q.routeResolvedAt=16.2;q.routeChoice={id:route,label:route==='high'?q.district.highRoute:q.district.lowRoute};
     const support=q.platforms.find(p=>q.onRoute(p)&&q.x>=p.x&&q.x<p.x+p.w);
     q.y=support?.y??q.floorY;q.support=support?.id??null;q.grounded=true;
     b='paused';SA.pause();ir=q.y;Kt=T-q.floorY;$i=0;UA=time;
     $A.update(0,q,{id:districtId,reduced:false,quality:1});Vu();vu();
     return {obstacles:q.obstacles.filter(o=>o.x>0&&o.x<eA).map(o=>({label:o.label,base:o.base,platform:o.platformId})),support:!!support};
   },{districtId,time,route});
   await page.screenshot({path:`review/v122/districts/${districtId}-${name}.png`});
   if(name==='ledge')assert.ok(info.support&&info.obstacles.some(o=>o.platform),'Ledge challenge renders on its supporting platform');
  }
 }
 assert.deepEqual(errors,[]);
 console.log('PASS active route rewards, smooth inactive trail fade, restored drawing state, supported ledge props and both district/route gameplay captures.');
}finally{await browser.close()}
