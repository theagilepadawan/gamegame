import assert from 'node:assert/strict';
import {readFile,mkdir,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {chromium} from 'playwright';

// These are the original lossless painted masters, recovered independently of
// the rejected a551054 architecture/river composition. Pin their encoded assets
// and every current venue crop so another art pass cannot silently replace them.
const native = {
  'skyline':'6a4384b69c3aa72d9e191653b73f8c6cec7ee0e1ec54cfc71baf8fa52168390a',
  'bryant-park':'753defd0f7c67ef7203d3add5aaf4961e15db81da0a283d3aa4abd1f2cff9744',
  'fifth-avenue':'9992392426f6cc8ee4da316bb51c87cb459daec5569911d6e02daec4d677b0e7'
};
const sha=data=>createHash('sha256').update(data).digest('hex');
for(const [name,hash] of Object.entries(native)) assert.equal(sha(await readFile(new URL(`../assets/midtown-v113/${name}.webp`,import.meta.url))),hash,`${name}: lossless original painting preserved`);
const pinned=JSON.parse(await readFile(new URL('./fixtures/v16-renderer-hashes.json',import.meta.url)));
const engine=await readFile(new URL('../scripts/engine.js',import.meta.url),'utf8');
for(const [name,item] of Object.entries(pinned)) {
 const start=engine.indexOf(item.start,engine.indexOf(item.class)),end=engine.indexOf(item.end,start);
 assert.equal(sha(engine.slice(start,end)),item.sha256,`${name}: approved renderer baseline (${item.revision || "original painted-city behavior"})`);
}
const manifest=JSON.parse(await readFile(new URL('../assets/venue-details-v111/manifest.json',import.meta.url)));
for(const item of manifest)assert.equal(sha(await readFile(new URL('../'+item.path,import.meta.url))),item.sha256);
const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox','--disable-dev-shm-usage','--enable-unsafe-swiftshader']});
const report={reference:'Original warm Midtown lossless paintings / current six native venue crops',profiles:[]};
try {
 for(const viewport of [{width:1440,height:900},{width:844,height:390},{width:390,height:844}]) {
  const page=await browser.newPage({viewport,reducedMotion:'reduce'}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  const address=new URL(process.env.TEST_URL||'http://127.0.0.1:4181/');address.searchParams.set('unlock','all');
  await page.goto(address.href,{waitUntil:'networkidle',timeout:90000});
  await page.waitForFunction(()=>window.LR_SCENERY?.ready&&window.longRun?.environment.ready&&!document.querySelector('#splash'),null,{timeout:90000});
  await page.evaluate(()=>{window.requestAnimationFrame=()=>0;});
  const result=await page.evaluate(()=>{
   const fail=message=>{throw Error(message);};let layouts=0,coverageSamples=0;
   for(const mode of ['chapter','endless'])for(const W of [540,864,1168,1440])for(const distance of [0,600,1500,3600,7000,11000,17000,19500,25920,58000,180000]) {
    const a=LR_SCENERY.layout('midtown',distance,W,540,mode);
    if(a.sourceCount!==4||a.commonAtmosphere||!a.continuousPaintings)fail('Expected four complete warm paintings, no global atmosphere');
    for(const floorY of [342,422,512])for(const camera of [-90,0,55]) {
     const projection=LR_SCENERY.projection('midtown',{floorY},camera),b=LR_SCENERY.layout('midtown',distance,W,540,mode,projection);
     if(projection.streetOffset!==0||projection.skylineOffset!==0||JSON.stringify(a)!==JSON.stringify(b))fail('Jump camera altered the painted backdrop');layouts++;
    }
    const canvas=document.createElement('canvas');canvas.width=W;canvas.height=540;
    const ctx=canvas.getContext('2d',{willReadFrequently:true});
    LR_SCENERY.draw2d(ctx,'midtown',null,distance,W,540,mode);
    for(let y=10;y<540;y+=47)for(let x=0;x<W;x+=41){if(ctx.getImageData(x,y,1,1).data[3]!==255)fail(`Uncovered painting seam at ${distance}/${x}/${y}`);coverageSamples++;}
    for(const p of a.layers){
     if(p.y!==-8||p.kind!=='painting')fail('Detached/moving architecture returned');
     const src=LR_SCENERY.source('midtown',p);if(src.width!==2090||src.height!==1176)fail('Venue composite lost native detail');
     if(p.segment>=4&&(p.sourceIndex===0||p.venues))fail('Endless repeats a skyline landmark or named venue');
    }
   }
   const initial=LR_SHOPS.inspect(0,eA,kA).items;
   if(initial.some(i=>i.visible))fail('Easter eggs appear at the start');
   Cu(false);fu('midtown');Ko('chapter');b='paused';SA.pause();
   if(q.districtId!=='midtown'||q.chapterTime!==0)fail('Expected a fresh, unlocked Midtown chapter');
   const reveals={},centers={};
   for(let frame=0;frame<3595;frame++) {
    q.invincible=999;q.floorY=q.floorAt(q.x);q.step(1/60);
    if(frame%15)continue;
    for(const item of LR_SHOPS.inspect(q.distance,eA,kA).items){
     if(item.visible&&reveals[item.key]===undefined)reveals[item.key]=q.chapterTime;
      if(item.quad[0][0]>=10&&item.quad[1][0]<=eA-10&&centers[item.key]===undefined)centers[item.key]=q.chapterTime;
    }
   }
   for(const key of ['joju','omars','gussy','fifth'])if(reveals[key]===undefined||centers[key]===undefined)fail(`Venue missing before chapter finish: ${key}`);
   const items=LR_SHOPS.inspect(q.distance,eA,kA).items;
   for(let i=1;i<items.length;i++)if(items[i].worldX-items[i-1].worldX<450)fail('Venues crowded together');
   if(reveals.joju<12)fail('Restaurant arrives too early');
   const office=items.find(i=>i.key==='fifth');if(!office.fullGlassEntrance)fail('Full 505 glazing missing');
   const assets=LR_SCENERY.images.map(i=>({w:i.naturalWidth,h:i.naturalHeight}));
   return {layouts,coverageSamples,reveals,fullyVisible:centers,assets:assets.length,decodedBytes:assets.reduce((n,i)=>n+i.w*i.h*4,0),retired:!!(window.LR_CITY_VISTAS||window.LR_STREET_LIFE||window.LR_STREET_FOUNDATION)};
  });
  assert.equal(result.retired,false);assert.deepEqual(errors,[]);report.profiles.push({viewport,...result});await page.close();
 }
 await mkdir('review/v113-qa',{recursive:true});await writeFile('review/v113-qa/reference.json',JSON.stringify(report,null,2));
 console.log(`PASS warm Midtown: ${report.profiles.reduce((n,p)=>n+p.layouts,0)} fixed-camera layouts, opaque seams, late/spaced venues, full 505, original lossless paintings and unchanged curb/physics.`);
}finally{await browser.close();}
