import assert from 'node:assert/strict';
import {mkdir,readFile,writeFile} from 'node:fs/promises';
import {chromium} from 'playwright';
const witnesses=JSON.parse(await readFile('tests/fixtures/endless-controls-v127.json','utf8')).physics.filter(p=>p.route>=41);
assert.equal(witnesses.length,8);
await mkdir('review/v127/browser',{recursive:true});const report=[];
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox','--enable-unsafe-swiftshader']});
try{
 for(const viewport of [{width:1280,height:720},{width:568,height:320}]){
  const page=await browser.newPage({viewport,hasTouch:viewport.width<600,isMobile:viewport.width<600}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  const url=new URL(process.env.TEST_URL||'http://127.0.0.1:4181/');url.searchParams.set('unlock','all');
  await page.goto(url.href,{waitUntil:'networkidle'});
  await page.waitForFunction(()=>window.longRun?.environment.ready&&LR_PROPS.ready&&!document.querySelector('#splash'));
  await page.evaluate(()=>{const frame=requestAnimationFrame;window.requestAnimationFrame=()=>0;return new Promise(r=>frame(r));});
  await page.evaluate(()=>{
   window.skillSetup=({character,seed,time,route})=>{
    LR_CH.order.forEach(id=>LR_CH.done(id));Cu(false);PA=character;Ko('endless');
    q=new hi(eA,seed,{mode:'endless',character,procedural:true,ambientJetpacks:false});
    q.time=time;q.distance=LR_ENDLESS_GENERATOR.distanceAtTime(time);q.nextX=q.x+500;q.autoSpawn=false;q.spawn(route);q.y=q.floorY;
    const hit=q.hit.bind(q);q.qaDamage=0;q.hit=cause=>{q.qaDamage++;hit(cause);};
    window.skillTarget=q.distance+q.nextX-q.x;window.skillMoves=LR_ENDLESS_GENERATOR.inspect(q).history.at(-1).actions.map(a=>({at:q.distance+500+a.offset}));
    window.skillStage=0;window.didGrand=false;window.touchedBonus=false;b='playing';SA.pause();Kt=endlessCameraY(q,eA,kA);bt=[];ze=[];Ht=[];
   };
   window.skillTick=slide=>{
    q.step(1/120,slide);if(q.events.some(e=>e.type==='superjump'))didGrand=true;
    if(q.platforms.some(p=>p.grandBonus&&p.touched))touchedBonus=true;
    FD();Kt+=(endlessCameraY(q,eA,kA)-Kt)*(1-Math.exp(-8/120));
   };
   window.skillInput=input=>{
    input=Number(input);if(input===1&&!q.held)q.jump();else if(input!==1&&q.held)q.release();
    for(let tick=0;tick<12;tick++)skillTick(input===2);
   };
   window.grandTick=()=>{
    const action=skillMoves[skillStage];if(action&&q.grounded&&q.distance>=action.at){q.release();q.jump();skillStage++;}skillTick(false);
   };
   window.skillRender=()=>{UA=q.time;ir=q.y;$i=0;ze=[];bt=[];Ht=[];$A.update(1/30,q,{id:'opening',reduced:false,quality:1});Vu();vu();};
  });
  for(const character of ['nicolai','trond'])for(const witness of witnesses){
   await page.evaluate(data=>skillSetup(data),{character,seed:witness.seed,time:witness.time,route:witness.route});
   const shot=await page.evaluate(({controls,route})=>{
    for(let i=0;i<controls.length;i++){
     skillInput(controls[i]);
     const inside=q.obstacles.some(h=>h.skill&&h.x<q.x&&h.x+h.w>q.x);
     if(inside&&(route===42?q.jumpCount===2&&q.flipAge>.03:q.grounded&&q.support!==null)){
      skillRender();return {at:i+1,captured:true};
     }
    }skillRender();return {at:controls.length,captured:false};
   },{controls:witness.controls,route:witness.route});
   if(character==='nicolai'&&witness.time===240&&[41,42,43].includes(witness.route))
    await page.screenshot({path:`review/v127/browser/${witness.family}-${viewport.width}.png`});
   const result=await page.evaluate(({controls,at})=>{
    for(let i=at;i<controls.length;i++)skillInput(controls[i]);skillRender();
    return {dead:q.dead,damage:q.qaDamage,finished:q.distance>=skillTarget&&q.grounded,level:LR_ENDLESS.level(q)+1};
   },{controls:witness.controls,at:shot.at});
   assert.equal(result.dead,false,`${character}/${viewport.width}/${witness.family}/${witness.time}`);assert.equal(result.damage,0);assert.equal(result.finished,true);
   report.push({character,width:viewport.width,family:witness.family,time:witness.time,...result});
  }
  for(const character of ['nicolai','trond']){
   await page.evaluate(character=>skillSetup({character,seed:11,time:160,route:44}),character);
   await page.evaluate(()=>{for(let i=0;i<1000&&!q.dead;i++){grandTick();if(didGrand&&q.superJumpAge>.22){skillRender();return;}}});
   if(character==='nicolai')await page.screenshot({path:`review/v127/browser/grand-jump-${viewport.width}.png`});
   const result=await page.evaluate(()=>{
    for(let i=0;i<1500&&!q.dead&&(q.distance<skillTarget||!q.grounded);i++)grandTick();skillRender();
    return {dead:q.dead,damage:q.qaDamage,grand:didGrand,bonus:touchedBonus,finished:q.distance>=skillTarget&&q.grounded};
   });
   assert.deepEqual(result,{dead:false,damage:0,grand:true,bonus:true,finished:true});
  }
  for(let tier=1;tier<=4;tier++){
   const result=await page.evaluate(tier=>{
    skillSetup({character:'nicolai',seed:42,time:0,route:20});q.obstacles=[];q.platforms=[];q.pickups=[];q.springs=[];
    q.time=(LR_ENDLESS_GENERATOR.tierPace(tier)*315-340)/3-.05;q.distance=LR_ENDLESS_GENERATOR.distanceAtTime(q.time);q.y=q.floorY;
    q.__lr={close:0,bestStreak:0,maxSpeed:0,pops:[],lastLevel:tier-1,announcedLevel:tier-1,bestDist:0,toastAt:-9};
    q.speed=LR_ENDLESS.speedAt(q,q.time);Vu();const before=LR_ENDLESS.level(q);
    for(let i=0;i<18;i++)skillTick(false);skillRender();
    return {before,after:LR_ENDLESS.level(q),message:document.querySelector('#event').textContent};
   },tier);
   assert.equal(result.before,tier-1);assert.equal(result.after,tier);assert.match(result.message,new RegExp(`LEVEL ${tier+1}`));
   if(tier===2)await page.screenshot({path:`review/v127/browser/level-up-${viewport.width}.png`});
  }
  assert.deepEqual(errors,[]);await page.close();
 }
 await writeFile('review/v127/browser/report.json',JSON.stringify({traversals:report,grandRoutes:4,boundaries:8},null,2));
 console.log('PASS 32 skill-crossing traversals, four real triple-jump bonus routes and eight pace-level transitions; both runners, desktop and touch/mobile, zero damage/errors.');
}finally{await browser.close();}
