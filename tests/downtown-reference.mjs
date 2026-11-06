import assert from 'node:assert/strict';
import {readFile, mkdir, writeFile} from 'node:fs/promises';
import {chromium} from 'playwright';

// This fixture came from the user's actual HTML, not an inferred Git version.
let reference = await readFile(new URL('./fixtures/uploaded-painted-scenery.js', import.meta.url), 'utf8');
for (const path of new Set(reference.match(/assets\/[A-Za-z0-9_./-]+\.webp/g))) {
  // The fixture's unrelated Midtown image loads are not part of this oracle.
  const needed = path.includes('/midtown-') ? 'assets/original-25.webp' : path;
  reference = reference.split(path).join('data:image/webp;base64,' + (await readFile(new URL('../'+needed,import.meta.url))).toString('base64'));
}
const hero = 'data:image/webp;base64,' + (await readFile(new URL('../assets/original-32.webp',import.meta.url))).toString('base64');
const browser = await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox','--disable-dev-shm-usage','--enable-unsafe-swiftshader']});
const report = {referenceSHA256:'9fd060927fc13512f82b18c86e9edc8cf19de59357f5874169d9e8644b263488',profiles:[]};
try {
  for (const viewport of [{width:1440,height:900},{width:844,height:390},{width:390,height:844}]) {
    const page = await browser.newPage({viewport,reducedMotion:'reduce'}), errors=[];
    page.on('pageerror',error=>errors.push(error.message));
    await page.goto(process.env.TEST_URL || 'http://127.0.0.1:4181/',{waitUntil:'networkidle',timeout:90000});
    await page.waitForFunction(()=>window.LR_SCENERY?.ready&&window.longRun?.environment.ready&&!document.querySelector('#splash'),null,{timeout:90000});
    await page.evaluate(()=>{window.requestAnimationFrame=()=>0;window.currentScenery=LR_SCENERY;});
    await page.addScriptTag({content:reference});
    await page.waitForFunction(()=>LR_SCENERY.ready);
    const result = await page.evaluate(async hero=>{
      const old=LR_SCENERY,now=window.currentScenery;window.LR_SCENERY=now;
      const original=new Image();original.src=hero;await original.decode();
      const scalar=['width','height','overlap','stride','scroll','travel','stripWidth','panelCount','originalIndex','loopStart','initialOffset','introHold','introEase','parallaxRate','clamped'];
      const panelKeys=['segment','sourceIndex','original','mirrored','variant','x','y','width','height','sourceWidth','sourceHeight'];
      const select=(v,keys)=>Object.fromEntries(keys.map(key=>[key,v[key]]));
      let layouts=0;
      for(const mode of ['chapter','endless'])for(const W of [540,864,1168,1440])for(const distance of [0,600,1500,3600,7000,11000,17000,19500,25920,58000,180000]) {
        const a=old.layout('opening',distance,W,540,mode),b=now.layout('opening',distance,W,540,mode);
        if(JSON.stringify(select(a,scalar))!==JSON.stringify(select(b,scalar)))throw Error('Uploaded reference camera differs');
        if(JSON.stringify(a.panels.map(p=>select(p,panelKeys)))!==JSON.stringify(b.panels.map(p=>select(p,panelKeys))))throw Error('Uploaded reference painting placement differs');
        if(b.layers.some(p=>p.kind!=='painting'))throw Error('Detached water/architecture layer reintroduced');
        if(mode==='endless'&&distance>58000&&b.panels.some(p=>p.original||p.venues))throw Error('Landmarks or Easter eggs repeat in Endless');
        layouts++;
      }
      const pixels=[],details=LR_VENUE_DETAILS.inspect().filter(d=>d.id==='opening');
      for(const sourceIndex of [0,2,3,4])for(const variant of sourceIndex===4?[null,'battery-loop']:[null]) {
        const panel={sourceIndex,original:false,segment:sourceIndex,venues:true,variant};
        const a=old.source('opening',panel,original),b=now.source('opening',panel);
        const canvas=document.createElement('canvas');canvas.width=1536;canvas.height=1024;
        const ctx=canvas.getContext('2d',{willReadFrequently:true});ctx.drawImage(a,0,0);
        const before=new Uint32Array(ctx.getImageData(0,0,1536,1024).data.buffer);
        ctx.clearRect(0,0,1536,1024);ctx.drawImage(b,0,0);
        const after=new Uint32Array(ctx.getImageData(0,0,1536,1024).data.buffer);
        const rect=details.find(d=>d.panel===sourceIndex)?.rect;let different=0,outside=0;
        for(let p=0;p<before.length;p++)if(before[p]!==after[p]) {
          different++;const x=p%1536,y=Math.floor(p/1536);
          if(!rect||x<rect[0]||x>=rect[0]+rect[2]||y<rect[1]||y>=rect[1]+rect[3])outside++;
        }
        pixels.push({sourceIndex,variant,different,outside});
      }
      const coverage=[];
      const canvas=document.createElement('canvas');canvas.width=864;canvas.height=540;
      const ctx=canvas.getContext('2d',{willReadFrequently:true});
      for(const mode of ['chapter','endless'])for(const distance of [0,4000,8000,12000,16000,20000,25920,58000,180000]) {
        ctx.clearRect(0,0,864,540);now.draw2d(ctx,'opening',original,distance,864,540,mode);
        const data=ctx.getImageData(0,0,864,540).data;let holes=0;
        for(let p=3;p<data.length;p+=4)if(data[p]<254)holes++;
        coverage.push({mode,distance,holes});
      }
      const appearances=details.map(d=>{
        let start=null,end=null,firstFull=null,lastFull=null,worldX=null;
        for(let distance=0;distance<=25920;distance+=20) {
          const spot=LR_KABIN.spots(distance,864,540,'chapter').find(p=>p.key===d.key);
          if(spot.visible){start??=distance;end=distance;}
          if(spot.rect.x>=0&&spot.rect.x+spot.rect.width<=864){firstFull??=distance;lastFull=distance;}
          worldX=spot.worldX;
        }
        return {key:d.key,start,end,firstFull,lastFull,worldX};
      });
      return {layouts,pixels,coverage,appearances,sourceCount:NBIMDowntownScenery.images.length,
        sources:NBIMDowntownScenery.images.map(img=>[img.naturalWidth,img.naturalHeight]),
        forbidden:now.images.some(img=>/downtown-atmosphere|downtown-waterfront|downtown-bridge-wide/.test(img.src))};
    },hero);
    assert.equal(result.forbidden,false,'No global Downtown river or cutout architecture is loaded');
    assert.ok(result.sources.every(([w,h])=>w===1536&&h===1024),'Every painted source retains native resolution');
    for(const p of result.pixels)assert.equal(p.outside,0,`Painting ${p.sourceIndex}: native reference pixels outside venue unchanged`);
    assert.ok(result.pixels.filter(p=>p.different>0).length>=2,'Current detailed venue fronts are present');
    for(const c of result.coverage)assert.equal(c.holes,0,'No holes between complete painted streets');
    assert.ok(result.appearances.every(a=>a.start>10000),'Neither Easter egg appears at the start');
    assert.ok(result.appearances[1].firstFull>result.appearances[0].lastFull,'The two venue entrances have separate viewing windows');
    assert.ok(result.appearances[1].worldX-result.appearances[0].worldX>864,'Entrances are more than one normal viewport apart');
    assert.deepEqual(errors,[]);report.profiles.push({viewport,...result});await page.close();
  }
  await mkdir('review/v112-qa',{recursive:true});await writeFile('review/v112-qa/downtown-reference.json',JSON.stringify(report,null,2));
  console.log(`PASS Downtown: ${report.profiles.reduce((n,p)=>n+p.layouts,0)} reference camera/layout comparisons; unchanged native street paintings outside detailed shops; opaque coverage; separated late Easter eggs.`);
} finally {await browser.close();}
