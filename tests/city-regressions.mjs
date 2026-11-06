import assert from 'node:assert/strict';
import {readFile, mkdir, writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {chromium} from 'playwright';

// Repository snapshot a551054 is a regression oracle for the unchanged
// Midtown composition, NOT the user's uploaded Downtown visual reference.
const reference = await readFile(new URL('./fixtures/v16-scenery-reference.js', import.meta.url), 'utf8');
let embeddedReference = reference;
for (const path of new Set(reference.match(/assets\/[A-Za-z0-9_./-]+\.webp/g))) {
  // Downtown is outside this regression oracle; avoid shipping its rejected
  // images merely to initialize the independent Midtown fixture.
  const needed = path.includes('/downtown-') ? 'assets/original-25.webp' : path;
  embeddedReference = embeddedReference.split(path).join('data:image/webp;base64,' + (await readFile(new URL('../' + needed, import.meta.url))).toString('base64'));
}
const pinned = JSON.parse(await readFile(new URL('./fixtures/v16-renderer-hashes.json', import.meta.url)));
const engine = await readFile(new URL('../scripts/engine.js', import.meta.url), 'utf8');
const sha = data => createHash('sha256').update(data).digest('hex');
for (const [name, item] of Object.entries(pinned)) {
  const start = engine.indexOf(item.start, engine.indexOf(item.class));
  const end = engine.indexOf(item.end, start);
  assert.equal(sha(engine.slice(start, end)), item.sha256, `${name}: pinned engine function unchanged`);
}
const manifest = JSON.parse(await readFile(new URL('../assets/venue-details-v111/manifest.json', import.meta.url)));
for (const item of manifest) assert.equal(sha(await readFile(new URL('../' + item.path, import.meta.url))), item.sha256);
const browser = await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox','--disable-dev-shm-usage','--enable-unsafe-swiftshader']});
const report = {reference:'a551054 repository snapshot / Midtown only', renderers:Object.keys(pinned), profiles:[]};
try {
  for (const viewport of [{width:1440,height:900},{width:844,height:390},{width:390,height:844}]) {
    const page = await browser.newPage({viewport, reducedMotion:'reduce'}), errors=[];
    page.on('pageerror', e=>errors.push(e.message));
    await page.goto(process.env.TEST_URL || 'http://127.0.0.1:4181/', {waitUntil:'networkidle',timeout:90000});
    await page.waitForFunction(()=>window.LR_SCENERY?.ready && window.longRun?.environment.ready && !document.querySelector('#splash'),null,{timeout:90000});
    await page.evaluate(()=>{window.requestAnimationFrame=()=>0; window.actualScene=LR_SCENERY;});
    await page.addScriptTag({content:embeddedReference});
    await page.waitForFunction(()=>LR_SCENERY.ready);
    const result = await page.evaluate(()=>{
      const before=LR_SCENERY, after=window.actualScene; window.LR_SCENERY=after;
      let layouts=0, projection=0;
      for (const id of ['midtown']) for (const mode of ['chapter','endless'])
        for (const width of [540,864,1168,1440]) for (const distance of [0,600,1500,3600,7000,11000,17000,19500,25920,58000,180000])
          for (const offset of [0,28,55,-20]) {
            const view={streetOffset:offset,skylineOffset:offset*.18};
            if(JSON.stringify(before.layout(id,distance,width,540,mode,view))!==JSON.stringify(after.layout(id,distance,width,540,mode,view))) throw Error('Reference layout differs');
            layouts++;
          }
      for (const id of ['opening','midtown','park']) for (const floorY of [342,422,512]) for (const camera of [-90,0,55]) {
        if(JSON.stringify(before.projection(id,{floorY},camera))!==JSON.stringify(after.projection(id,{floorY},camera))) throw Error('Reference projection differs'); projection++;
      }
      const details=LR_VENUE_DETAILS.inspect(), pixels=[];
      for(const id of ['midtown']) {
        const seen=new Set();
        for(let distance=0;distance<=26000;distance+=300) for(const panel of after.layout(id,distance,864,540,'chapter').layers) {
          const key=panel.kind+':'+panel.sourceIndex;
          if(seen.has(key))continue;seen.add(key);
          const a=before.source(id,panel), b=after.source(id,panel);if(!a||!b)throw Error('Missing source');
          const w=a.width||a.naturalWidth,h=a.height||a.naturalHeight;
          const canvas=document.createElement('canvas');canvas.width=w;canvas.height=h;
          const ctx=canvas.getContext('2d',{willReadFrequently:true});
          ctx.drawImage(a,0,0); const old=new Uint32Array(ctx.getImageData(0,0,w,h).data.buffer);
          ctx.clearRect(0,0,w,h);ctx.drawImage(b,0,0);const now=new Uint32Array(ctx.getImageData(0,0,w,h).data.buffer);
          const detail=panel.kind==='architecture'?details.find(d=>d.id===id&&d.panel===panel.sourceIndex):null;
          let different=0,outside=0;
          for(let p=0;p<old.length;p++)if(old[p]!==now[p]){
            different++;const x=p%w,y=Math.floor(p/w),r=detail?.rect;
            if(!r||x<r[0]||x>=r[0]+r[2]||y<r[1]-panel.cropTop||y>=r[1]-panel.cropTop+r[3])outside++;
          }
          pixels.push({id,key,w,h,different,outside,venue:detail?.key||null});
        }
      }
      const assets=after.images.map(i=>({w:i.naturalWidth,h:i.naturalHeight}));
      return {layouts,projection,pixels,assets:assets.length,decodedBytes:assets.reduce((n,i)=>n+i.w*i.h*4,0),retired:!!(window.LR_CITY_VISTAS||window.LR_STREET_LIFE||window.LR_STREET_FOUNDATION)};
    });
    assert.equal(result.retired,false,'Replacement panoramas, traffic and material module are absent');
    for(const image of result.pixels) {assert.equal(image.outside,0,`${image.id}/${image.key}: every pixel outside venue detail matches the Midtown snapshot`);if(image.venue)assert.ok(image.different>10000,`${image.venue}: current native frontage is present`);}
    assert.equal(result.pixels.filter(p=>p.venue).length,4,'All four current Midtown venue fronts retained');
    assert.deepEqual(errors,[]);report.profiles.push({viewport,...result}); await page.close();
  }
  await mkdir('review/v112-qa',{recursive:true});await writeFile('review/v112-qa/reference.json',JSON.stringify(report,null,2));
  console.log(`PASS unchanged Midtown: ${report.profiles.reduce((n,p)=>n+p.layouts,0)} layouts, all non-venue pixels identical, four native frontage updates, ${report.renderers.length} renderer/camera functions unchanged.`);
} finally {await browser.close();}
