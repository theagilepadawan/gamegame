import assert from 'node:assert/strict';
import {mkdir,readFile,writeFile} from 'node:fs/promises';
import {chromium} from 'playwright';
const witnesses=JSON.parse(await readFile('tests/fixtures/endless-controls-v127.json','utf8')).physics.filter(p=>p.route>=37&&p.route<=40);
assert.equal(witnesses.length,8,'Four challenge families at early and late pace');
await mkdir('review/v127/slide-challenges',{recursive:true});
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox','--enable-unsafe-swiftshader']});
const report=[];
try{
 for(const viewport of [{width:1280,height:720},{width:568,height:320}]){
  const page=await browser.newPage({viewport,hasTouch:viewport.width<600,isMobile:viewport.width<600}),errors=[];page.on('pageerror',e=>errors.push(e.message));
  const url=new URL(process.env.TEST_URL||'http://127.0.0.1:4181/');url.searchParams.set('unlock','all');
  await page.goto(url.href,{waitUntil:'networkidle'});
  await page.waitForFunction(()=>window.longRun?.environment.ready&&LR_PROPS.ready&&!document.querySelector('#splash'));
  await page.evaluate(()=>{const frame=requestAnimationFrame;window.requestAnimationFrame=()=>0;return new Promise(r=>frame(r));});
  for(const character of ['nicolai','trond'])for(const witness of witnesses){
   await page.evaluate(({character,witness})=>{
    LR_CH.order.forEach(id=>LR_CH.done(id));Cu(false);PA=character;Ko('endless');
    q=new hi(eA,witness.seed,{mode:'endless',character,procedural:true,ambientJetpacks:false});
    q.time=witness.time;q.distance=LR_ENDLESS_GENERATOR.distanceAtTime(q.time);q.nextX=q.x+500;q.autoSpawn=false;
    q.spawn(witness.route);q.y=q.floorY;q.qaDamage=0;
    const hit=q.hit.bind(q);q.hit=cause=>{q.qaDamage++;hit(cause);};
    window.challengeTarget=q.distance+q.nextX-q.x;b='playing';SA.pause();
    window.challengeStep=control=>{
     const input=Number(control);
     if(input===1&&!q.held)q.jump();else if(input!==1&&q.held)q.release();
     for(let tick=0;tick<12;tick++){q.step(1/120,input===2);FD();}
    };
    window.challengeRender=()=>{
     UA=q.time;ir=q.y;$i=0;Kt=T-q.floorY;
     ze=[];bt=[];Ht=[];$A.update(1/30,q,{id:'opening',reduced:false,quality:1});Vu();vu();
    };
   },{character,witness});
   // Capture an actual, collision-enabled slide from the witness, then finish
   // the same run. No invincibility, teleports or geometry changes are used.
   const captured=await page.evaluate(controls=>{
    let at=0;
    for(;at<controls.length;at++){
     challengeStep(controls[at]);
     if(q.sliding&&q.obstacles.some(h=>h.requiredAction==='slide'&&h.x<q.x+8&&h.x+h.w>q.x+30)){
      challengeRender();return {at:at+1,captured:true};
     }
    }challengeRender();return {at,captured:false};
   },witness.controls);
   if(captured.captured&&witness.route===37&&witness.time===0)
    await page.screenshot({path:`review/v127/slide-challenges/${character}-slide-${viewport.width}.png`});
   const result=await page.evaluate(({controls,at})=>{
    for(let i=at;i<controls.length;i++)challengeStep(controls[i]);challengeRender();
    return {dead:q.dead,damage:q.qaDamage,finished:q.distance>=challengeTarget&&q.grounded,pace:q.speed,thirdJump:q.jumpChain>=3};
   },{controls:witness.controls,at:captured.at});
   assert.equal(result.dead,false,`${character}/${viewport.width}/${witness.family}/${witness.time}`);
   assert.equal(result.damage,0);assert.equal(result.finished,true);assert.equal(result.thirdJump,false);
   if(witness.route!==38)assert.equal(captured.captured,true,'Slide patterns actually crouch under the visible ceiling');
   report.push({viewport:viewport.width,character,family:witness.family,time:witness.time,...result});
  }
  assert.deepEqual(errors,[]);await page.close();
 }
 await writeFile('review/v127/slide-challenges/browser-report.json',JSON.stringify(report,null,2));
 console.log(`PASS ${report.length} real browser challenge traversals: both runners, desktop/compact, early/late pace, actual slides, no damage or forced grand jump.`);
}finally{await browser.close();}
