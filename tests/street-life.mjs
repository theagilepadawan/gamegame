import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import vm from 'node:vm';
import path from 'node:path';
import {fileURLToPath, pathToFileURL} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const source=await fs.readFile(path.join(root,'scripts/street-life.js'),'utf8');
const noRandom=Object.create(Math);noRandom.random=()=>{throw new Error('Decorative traffic must not consume a mutable random stream');};
const sandbox={window:{},Math:noRandom};vm.runInNewContext(source,sandbox);
const street=sandbox.window.LR_STREET_LIFE;
const normalize=value=>JSON.parse(JSON.stringify(value));
const base={district:'midtown',W:1440,H:540,distance:9000,time:28,seed:123,rearCurb:386,frontCurb:422};
let checks=0,maxVisible=0;
const appearances=new Set();
for(const seed of Array.from({length:32},(_,i)=>i*91437+77)) {
  for(const W of [540,864,960,1440]) for(const distance of [0,100,3500,15000,100000,1000000,100000000]) {
    const view={...base,seed,W,distance,time:distance/330};
    const saved=JSON.stringify(view),a=street.layout(view),b=street.layout(view);
    assert.deepEqual(normalize(a),normalize(b));
    assert.equal(JSON.stringify(view),saved,'Traffic does not mutate caller state');
    assert.ok(a.cars.length<=9,'Traffic density is bounded even at extreme world distances');
    maxVisible=Math.max(maxVisible,a.cars.length);
    for(const car of a.cars) {
      assert.ok(car.contactBounds.top>=view.rearCurb+.49,'Wheel contacts stay on the actual road');
      assert.ok(car.contactBounds.bottom<=view.frontCurb-.49,'Contact shadows stay behind the front curb');
      assert.equal(car.height,car.lane==='near'?38:28,'Road depth does not shrink vehicle bodies into toys');
      assert.ok(Number.isFinite(car.x+car.y+car.angle+car.wheelAngle));
      appearances.add(`${car.body}:${car.palette}:${car.variant}`);
    }
    for(const lane of ['far','near']) {
      const cars=a.cars.filter(c=>c.lane===lane).sort((a,b)=>a.x-b.x);
      for(let i=1;i<cars.length;i++) assert.ok(cars[i].bounds.left-cars[i-1].bounds.right>=180,'Same-lane cars preserve generous headway');
    }
    checks++;
  }
}
assert.ok(appearances.size>=9,'Street traffic has seed-based appearance variation');
assert.notDeepEqual(normalize(street.layout(base)),normalize(street.layout({...base,seed:987654})));
assert.deepEqual(normalize(street.layout({...base,reduced:true,time:0})),normalize(street.layout({...base,reduced:true,time:9000})),'Reduced motion stops independent travel and wheel animation');
const a=street.layout(base),b=street.layout({...base,distance:base.distance+4});
for(const car of a.cars) {
  const next=b.cars.find(other=>other.id===car.id);if(!next)continue;
  assert.ok(Math.abs(next.x-car.x+4*car.parallax)<1e-8,'Near/far parallax follows distance continuously');
  assert.equal(next.y,car.y,'Horizontal travel does not wobble car height');
}
const later=street.layout({...base,time:base.time+.1});
for(const car of a.cars) {
  const next=later.cars.find(other=>other.id===car.id);if(!next)continue;
  assert.ok(Math.abs(next.x-car.x-.1*car.speed)<1e-8,'Time moves cars steadily in their own lanes');
}
for(const view of [{...base,district:'park'},{...base,enabled:false},{...base,frontCurb:390},{...base,W:Infinity}]) assert.equal(street.layout(view).cars.length,0);
const curved={...base,rearCurb:x=>386+Math.sin(x/300)*2,frontCurb:x=>422+Math.sin(x/300)*2};
assert.ok(street.layout(curved).cars.length>0,'A gently curving road remains usable');
for(const car of street.layout(curved).cars) for(const p of car.contactBounds.points) assert.ok(p.y>=curved.rearCurb(p.x)+.49&&p.y<=curved.frontCurb(p.x)-.49);
// Production 1750px framing leaves a 15.7px road strip at H540. Only
// contact/shadow depth needs to fit it; the near body retains its full size.
const narrow={...base,rearCurb:-8+1304*(540+16)/1750};
let narrowCars=0;
for(let seed=0;seed<32;seed++)for(const distance of [0,3300,6600,9000,25000]) {
  const frame=street.layout({...narrow,seed,distance});
  for(const car of frame.cars) {
    narrowCars++;
    assert.equal(car.lane,'near','Roads under 24px use a single passing lane');
    assert.equal(car.height,38,'Narrow roads preserve proper vehicle scale');
    assert.ok(car.contactBounds.top>=narrow.rearCurb+.49);
    assert.ok(car.contactBounds.bottom<=narrow.frontCurb-.49);
  }
}
assert.ok(narrowCars>100,'1750px production framing retains visible traffic');

const moduleName=process.env.PLAYWRIGHT_MODULE||'playwright';
const {chromium}=await import(moduleName.startsWith('/')?pathToFileURL(moduleName).href:moduleName);
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
try {
  const page=await browser.newPage();
  await page.setContent('<canvas width="1440" height="540"></canvas>');
  await page.addScriptTag({content:source});
  const pixels=await page.evaluate(base=>{
    const canvas=document.querySelector('canvas'),c=canvas.getContext('2d',{willReadFrequently:true});
    function frame(view){c.setTransform(1,0,0,1,0,0);c.clearRect(0,0,1440,540);const scene=LR_STREET_LIFE.draw2d(c,view);const data=c.getImageData(0,0,1440,540).data;let hash=2166136261,visible=0,outside=0;for(let i=0;i<data.length;i++)hash=Math.imul(hash^data[i],16777619);for(let i=3;i<data.length;i+=4){if(data[i]){visible++;const y=Math.floor(i/(1440*4));if(y<340||y>=422)outside++;}}return{hash:hash>>>0,visible,outside,cars:scene.cars.length};}
    const first=frame(base),paused=frame(base),moving=frame({...base,time:base.time+.25});
    const reducedA=frame({...base,reduced:true,time:0}),reducedB=frame({...base,reduced:true,time:100});
    const texture=document.createElement('canvas'),returned=LR_STREET_LIFE.renderCanvas(texture,base,2);
    const textureSize=[texture.width,texture.height],sameTexture=returned===texture;
    for(let seed=0;seed<80;seed++)frame({...base,seed});
    const cacheSize=LR_STREET_LIFE.cachedBodies;
    LR_STREET_LIFE.release();
    return{first,paused,moving,reducedA,reducedB,textureSize,sameTexture,cacheSize,cacheCleared:LR_STREET_LIFE.cachedBodies===0};
  },base);
  assert.ok(pixels.first.visible>300,'Detailed cars produce visible pixels');
  assert.equal(pixels.first.outside,0,'Traffic never paints beyond its body height or front curb');
  assert.deepEqual(pixels.first,pixels.paused,'Pause preserves the exact rendered image');
  assert.notEqual(pixels.first.hash,pixels.moving.hash,'Independent travel is visible');
  assert.deepEqual(pixels.reducedA,pixels.reducedB,'Reduced-motion pixels remain identical over time');
  assert.deepEqual(pixels.textureSize,[2880,1080]);assert.ok(pixels.sameTexture);
  assert.ok(pixels.cacheSize<=16&&pixels.cacheCleared);
  console.log(JSON.stringify({passed:true,layoutCases:checks,narrowRoadCases:160,narrowCars,maxVisible,appearances:appearances.size,pixels},null,2));
} finally {await browser.close();}
