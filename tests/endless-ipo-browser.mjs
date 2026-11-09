import assert from 'node:assert/strict';
import {mkdir} from 'node:fs/promises';
import {chromium} from 'playwright';
await mkdir('review/v125/ipo',{recursive:true});
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox','--enable-unsafe-swiftshader']});
try {
  for(const viewport of [{width:1280,height:720},{width:568,height:320}]){
    const page=await browser.newPage({viewport}),errors=[];page.on('pageerror',e=>errors.push(e.message));
    const url=new URL(process.env.TEST_URL||'http://127.0.0.1:4181/');url.searchParams.set('unlock','all');
    await page.goto(url.href,{waitUntil:'networkidle'});
    await page.waitForFunction(()=>window.longRun?.environment.ready&&LR_PROPS.ready&&!document.querySelector('#splash'));
    await page.evaluate(()=>{const frame=requestAnimationFrame;window.requestAnimationFrame=()=>0;return new Promise(r=>frame(r));});
    await page.evaluate(()=>{
      LR_CH.order.forEach(id=>LR_CH.done(id));Cu(false);Ko('endless');
      q=new hi(eA,94721,{mode:'endless',procedural:true,ambientJetpacks:true});
      q.time=95;q.distance=LR_ENDLESS_GENERATOR.distanceAtTime(q.time);q.speed=LR_ENDLESS.speed(q.time);q.y=q.floorY;q.nextX=q.x+200;
      LR_ENDLESS_GENERATOR.inspect(q);q.__endlessDirector.nextIPO=0;q.__endlessDirector.nextFlight=q.__endlessDirector.nextContrarian=Infinity;
      q.spawn();q.autoSpawn=false;window.ipoOffer=q.pickups.find(p=>p.flightKind==='ipo');
      b='playing';SA.pause();Kt=T-q.floorY;
      window.ipoFrame=()=>{
        for(let n=0;n<4;n++){
          if(q.endlessIPO){
            const wave=q.priceWaves.find(w=>w.state!=='cleared'&&q.boss.age>=w.telegraphAt);
            const target=wave?wave.safeY+61:q.floorY-140;
            const velocity=Math.max(-195,Math.min(195,(target-q.y)*4.5)),thrust=q.vy>velocity;
            if(thrust&&!q.held)q.jump();else if(!thrust&&q.held)q.release();
          }
          q.step(1/120);FD();
        }
      };
      window.ipoRender=()=>{
        UA=q.time;ir=q.y;$i=0;Kt=T-q.floorY;
        for(const p of ze)p.age+=1/30;ze=ze.filter(p=>p.age<p.life);
        for(const p of bt)p.life-=1/30;bt=bt.filter(p=>p.life>0);
        for(const p of Ht)p.life-=1/30;Ht=Ht.filter(p=>p.life>0);
        $A.update(1/30,q,{id:'opening',reduced:false,quality:1});Vu();vu();
      };
      for(let n=0;n<100&&!q.endlessIPO&&!q.dead;n++)ipoFrame();
      ipoRender();
    });
    assert.equal(await page.evaluate(()=>!!q.endlessIPO&&!q.dead),true,'Collecting the scheduled IPO jetpack starts the boss through normal collisions');
    assert.equal(await page.locator('#chapter-name').textContent(),'IPO HYPE MACHINE');
    assert.equal(await page.evaluate(()=>q.boss.origin.y===q.priceWaves[0].origin.y),true,'Machine muzzle and price paths share world coordinates');
    await page.evaluate(()=>{while(q.boss.age<1.1&&!q.dead)ipoFrame();ipoRender();});
    await page.screenshot({path:`review/v125/ipo/warning-${viewport.width}.png`});
    await page.evaluate(()=>{while(q.boss.age<2.65&&!q.dead)ipoFrame();ipoRender();});
    await page.screenshot({path:`review/v125/ipo/price-tree-${viewport.width}.png`});
    assert.match(await page.locator('#touch-jump').getAttribute('aria-label'),/Hold to climb/);
    const outcome=await page.evaluate(()=>{
      const street=q.distance,score=q.score;
      for(let n=0;n<500&&q.endlessIPO&&!q.dead;n++)ipoFrame();
      const resumed=!q.endlessIPO&&q.distance===street;
      for(let n=0;n<30&&!q.dead;n++)ipoFrame();ipoRender();
      return {dead:q.dead,defeated:q.ipoDefeated,won:q.won,mode:q.mode,resumed,grounded:q.grounded,score:q.score,initialScore:score};
    });
    assert.equal(outcome.dead,false);assert.equal(outcome.defeated,1);assert.equal(outcome.won,false);
    assert.equal(outcome.mode,'endless');assert.equal(outcome.grounded,true);assert.ok(outcome.score>outcome.initialScore);
    await page.screenshot({path:`review/v125/ipo/return-${viewport.width}.png`});
    assert.deepEqual(errors,[]);await page.close();
  }
  console.log('PASS real scheduled pickup → random IPO tree → normal street return, boss HUD/thrust controls and desktop/mobile rendering.');
} finally {await browser.close();}
