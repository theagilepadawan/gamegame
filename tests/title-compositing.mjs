import assert from 'node:assert/strict';
import {mkdir, writeFile} from 'node:fs/promises';
import {chromium} from 'playwright';

const browser = await chromium.launch({executablePath: process.env.CHROMIUM_PATH || '/usr/bin/chromium', args: ['--no-sandbox','--enable-unsafe-swiftshader']});
const results = [], errors = [];
try {
  const page = await browser.newPage({viewport:{width:1280,height:720},reducedMotion:'reduce',deviceScaleFactor:2});
  page.on('pageerror', error => errors.push(error.message));
  const url = new URL(process.env.TEST_URL || 'http://127.0.0.1:4181/'); url.searchParams.set('unlock','all');
  await page.goto(url.href,{waitUntil:'networkidle'});
  await page.waitForFunction(()=>window.LR_TITLE_LAUNCH&&!document.querySelector('#splash')&&!document.querySelector('#start').disabled);
  await page.emulateMedia({reducedMotion:'no-preference'});
  // Freeze only rendering, to inspect every pose at an exact age. The normal
  // input/launch lifecycle is independently exercised by map-launch.mjs.
  await page.evaluate(()=>{const next=requestAnimationFrame;window.requestAnimationFrame=()=>0;return new Promise(resolve=>next(resolve));});
  for (const runner of ['nicolai','trond']) {
    await page.locator(`[data-character="${runner}"]`).click();
    const result = await page.evaluate(async runner => {
      const atlas=new Image();atlas.src=si.src;await atlas.decode();
      const c=document.createElement('canvas');c.width=c.height=512;
      const g=c.getContext('2d',{willReadFrequently:true});
      g.drawImage(atlas,1024,512,512,512,0,0,512,512);
      const original=g.getImageData(0,0,512,512).data;
      const real=performance.now.bind(performance), start=real();
      let outsideChanges=0,opaqueJacketHoles=0,firstFrameChanges=0,armChanges=0;
      const cold=[],cached=[];
      LR_TITLE_LAUNCH.launch(()=>{});
      try {
        for(let frame=0;frame<=44;frame++) {
          performance.now=()=>start+100+frame*740/44;
          g.clearRect(0,0,512,512);
          const before=real(); LR_TITLE_LAUNCH.draw(g,atlas,runner,256,460,1); cold.push(real()-before);
          const pixels=g.getImageData(0,0,512,512).data;
          for(let y=0;y<512;y++)for(let x=0;x<512;x++) {
            const k=(y*512+x)*4;
            if(x<164||x>=286||y<136||y>=248)
              for(let channel=0;channel<4;channel++)outsideChanges+=pixels[k+channel]!==original[k+channel];
            if(x>=200&&x<270&&y>=148&&y<226&&original[k+3]===255&&pixels[k+3]<255)opaqueJacketHoles++;
            if(frame===0)for(let channel=0;channel<4;channel++)firstFrameChanges+=pixels[k+channel]!==original[k+channel];
            if(frame===44&&x>=220&&x<275&&y>=140&&y<220)armChanges+=pixels[k]!==original[k];
          }
        }
        for(let repeat=0;repeat<5;repeat++)for(let frame=0;frame<=44;frame++) {
          performance.now=()=>start+100+frame*740/44;
          g.clearRect(0,0,512,512);
          const before=real(); LR_TITLE_LAUNCH.draw(g,atlas,runner,256,460,1);cached.push(real()-before);
        }
      } finally { performance.now=real; LR_TITLE_LAUNCH.cancel(); }
      const percentile=(values,p)=>[...values].sort((a,b)=>a-b)[Math.floor((values.length-1)*p)];
      return {runner,poses:45,outsideChanges,opaqueJacketHoles,firstFrameChanges,armChanges,
        coldMedianMs:percentile(cold,.5),coldMaxMs:Math.max(...cold),cachedMedianMs:percentile(cached,.5),cachedP95Ms:percentile(cached,.95)};
    },runner);
    assert.equal(result.firstFrameChanges,0,'The gesture begins on the exact approved idle');
    assert.equal(result.outsideChanges,0,'Every pose retains the exact face, silhouette outside the arm, trousers and shoes');
    assert.equal(result.opaqueJacketHoles,0,'No transparent seam opens inside either jacket at any intermediate pose');
    assert.ok(result.armChanges>300,'The final pose contains a visible, substantial arm gesture');
    results.push(result);
  }
  assert.deepEqual(errors,[]);
  await mkdir('review/v123',{recursive:true});
  await writeFile('review/v123/title-compositing.json',JSON.stringify({results,errors},null,2)+'\n');
  console.log('PASS 90 title poses: exact first idle, unchanged face/body outside the arm, solid jacket interiors, visible held gestures. '+JSON.stringify(results));
} finally {await browser.close();}
