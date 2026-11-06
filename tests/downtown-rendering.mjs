import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
import {chromium} from 'playwright';
await mkdir('review/v112-qa/motion',{recursive:true});
const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox','--disable-dev-shm-usage','--enable-unsafe-swiftshader']});
const report=[];
try {
 for(const [profile,viewport,dpr,fallback,runner] of [['desktop',{width:1440,height:900},1,false,'nicolai'],['phone',{width:844,height:390},2,false,'trond'],['canvas',{width:1440,height:900},1,true,'nicolai']]){
  const context=await browser.newContext({viewport,deviceScaleFactor:dpr,reducedMotion:'no-preference'});
  const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
  if(fallback)await page.addInitScript(()=>{const original=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(type,...args){return /webgl/i.test(type)?null:original.call(this,type,...args)};});
  await page.goto((process.env.TEST_URL||'http://127.0.0.1:4181/')+'?unlock=all',{waitUntil:'networkidle',timeout:90000});
  await page.waitForFunction(()=>window.longRun&&LR_SCENERY.ready&&!document.querySelector('#splash'),null,{timeout:90000});
  if(!fallback)await page.waitForFunction(()=>longRun.environment.ready);
  await page.locator(`[data-character="${runner}"]`).click();
  await page.evaluate(()=>{window.requestAnimationFrame=()=>0});
  for(const [time,action]of [[0,'ground'],[20,'double'],[36,'ground'],[52,'flight'],[56,'ground'],[66,'ground']]){
   const state=await page.evaluate(({time,action})=>{
    Cu(false);fu('opening');Ko('chapter');b='paused';SA.pause();
    for(let f=0;f<time*120;f++){q.invincible=999;q.floorY=q.floorAt(q.x);q.step(1/120)}
    q.flight=false;q.transfer=null;q.contrarian=false;q.shield=0;q.forcedBounce=0;q.flipAge=-1;q.resetJumpChain();q.floorY=q.floorAt(q.x);q.y=q.floorY;q.grounded=true;q.vy=0;q.support=null;q.airJumpAvailable=true;q.release();
    ir=q.y;Kt=T-q.floorY;$i=0;UA=q.time;b='playing';let clock=au;
    if(action==='double'){q.release();q.jump();for(let f=0;f<18;f++){q.invincible=999;Ku(clock+=1000/60)}q.release();q.jump();for(let f=0;f<23;f++){q.invincible=999;Ku(clock+=1000/60)}}
    if(action==='flight'){q.beginFlight({kind:'cruise',duration:4});q.jump();for(let f=0;f<40;f++){q.invincible=999;Ku(clock+=1000/60)}}
    q.invincible=0;Vu();vu();
    const scene=LR_SCENERY.inspect('opening',q.distance,eA,kA,'chapter');
    return {time,distance:q.distance,camera:Kt,renderer:longRun.renderer,grounded:q.grounded,flight:!!q.flight,water:longRun.environment?.counts?.water||0,
     kinds:scene.layers.map(p=>p.kind),native:scene.panels.map(p=>[p.sourceWidth,p.sourceHeight]),shops:LR_KABIN.spots(q.distance,eA,kA,'chapter')};
   },{time,action});
   assert.ok(state.kinds.every(kind=>kind==='painting'));
   assert.ok(state.native.every(([w,h])=>w===1536&&h===1024));
   if(action==='double')assert.equal(state.grounded,false,'Double jump actually leaves the terrain');
   if(action==='flight')assert.equal(state.flight,true,'Jetpack is actually active');
   await page.screenshot({path:`review/v112-qa/motion/${profile}-${time}-${action}.png`});
   report.push({profile,runner,action,...state});
  }
  assert.deepEqual(errors,[]);await context.close();
 }
 await writeFile('review/v112-qa/downtown-motion.json',JSON.stringify(report,null,2));
 console.log(`PASS Downtown rendering: ${report.length} actual gameplay states, desktop/phone DPR2/Canvas, both runners, real double-jump and jetpack.`);
}finally{await browser.close()}
