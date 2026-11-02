import assert from 'node:assert/strict';
import {mkdir, writeFile} from 'node:fs/promises';
import {pathToFileURL} from 'node:url';

const moduleName=process.env.PLAYWRIGHT_MODULE||'playwright';
const {chromium}=await import(moduleName.startsWith('/')?pathToFileURL(moduleName).href:moduleName);
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',headless:true,args:['--no-sandbox','--disable-dev-shm-usage','--enable-unsafe-swiftshader']});
const output=process.env.GAP_OUTPUT||new URL('../review/gaps/',import.meta.url).pathname;
await mkdir(output,{recursive:true});
const url=process.env.TEST_URL||'http://127.0.0.1:4181/';
async function open(viewport,fallback=false){
  const context=await browser.newContext({viewport,reducedMotion:'reduce'});
  const page=await context.newPage(),errors=[];
  page.on('pageerror',error=>errors.push(error.message));
  if(fallback)await page.addInitScript(()=>{
    const getContext=HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext=function(type,...args){return /webgl/i.test(type)?null:getContext.call(this,type,...args);};
  });
  await page.goto(url,{waitUntil:'networkidle',timeout:45000});
  await page.waitForFunction(()=>window.longRun&&window.LR_GAPS&&!document.querySelector('#start').disabled&&!document.querySelector('#splash'),null,{timeout:30000});
  if(!fallback)await page.waitForFunction(()=>longRun.environment.ready);
  return {context,page,errors};
}
async function capture(page,name,fixture){
  const state=await page.evaluate(({fixture,name})=>{
    Cu(false);Ko('endless');b='paused';SA.pause();
    q.seed=fixture.seed;q.terrainProfile=Yo(fixture.seed,{districtId:'endless',ground:T});
    q.distance=fixture.distance;q.time=20;q.autoSpawn=false;q.pickups=[];q.platforms=[];q.markers=[];q.springs=[];
    q.obstacles=(fixture.gaps||[{x:495,w:260}]).map(gap=>({...gap,type:'gap',base:q.floorAt(gap.x),h:85,theme:0,passed:false}));
    if(name.startsWith('wide'))for(let i=0;i<4;i++)q.platforms.push({id:i+1,x:360+i*245,w:170,y:q.floorAt(360+i*245)-100,prevY:q.floorAt(360+i*245)-100,kind:'crumble',active:true});
    q.y=q.floorY;q.grounded=true;ir=q.y;Kt=T-q.floorY;$i=0;
    $A.update(1/60,q,{id:'opening',reduced:false,quality:1});vu();
    return {name,width:eA,renderer:longRun.renderer,layout:LR_GAPS.layout(q.obstacles,eA),bankHeights:q.obstacles.map(gap=>[q.floorAt(gap.x),q.floorAt(gap.x+gap.w)])};
  },{fixture,name});
  await page.locator('#stage').screenshot({path:`${output}/${name}.png`});
  return state;
}
try{
  const desktop=await open({width:1440,height:900});
  const {page}=desktop;
  const cases=await page.evaluate(()=>{
    const out={};
    for(const seed of [0x12345678,0x0badf00d,42,105,0xdeadbeef]){
      const profile=Yo(seed,{districtId:'endless',ground:T});
      for(let center=1700;center<60000;center+=40){
        const l=profile.at(center-130),c=profile.at(center),r=profile.at(center+130);
        const name=r-l < -32?'uphill':r-l>32?'downhill':c<Math.min(l,r)-1.5?'crest':c>Math.max(l,r)+1.5?'valley':null;
        if(name&&!out[name])out[name]={seed,center,distance:center-375};
      }
    }
    return out;
  });
  assert.deepEqual(Object.keys(cases).sort(),['crest','downhill','uphill','valley']);
  const wideCases={
    'wide-crest':{...cases.crest,distance:cases.crest.center-640,gaps:[{x:290,w:1200}]},
    'wide-valley':{...cases.valley,distance:cases.valley.center-640,gaps:[{x:290,w:1200}]},
  };

  const physics=await page.evaluate(cases=>{
    const fresh=(seed=0x12345678)=>{
      const run=new hi(1000,seed,{mode:'endless',procedural:true});
      run.autoSpawn=false;run.pickups=[];run.platforms=[];run.springs=[];run.markers=[];run.obstacles=[];
      return run;
    };
    const samples=[];
    // Actual physics step on both banks and in the opening. The 8px allowance
    // models feet overhanging a bank, not a hidden collision strip in the hole.
    for(const offset of [0,7,9,130,251,253,260]){
      const run=fresh(),dt=1/120,travel=LR_ENDLESS.speed(dt)*dt;
      run.obstacles=[{type:'gap',x:run.x-offset+travel,w:260}];
      run.step(dt);
      samples.push({offset,grounded:run.grounded,y:run.y,floor:run.floorY});
    }
    const joined=fresh(),dt=1/120,travel=LR_ENDLESS.speed(dt)*dt;
    joined.obstacles=[{type:'gap',x:joined.x-130+travel,w:130},{type:'gap',x:joined.x+travel,w:130}];
    joined.step(dt);
    const island=fresh();
    island.obstacles=[{type:'gap',x:island.x-165+travel,w:130},{type:'gap',x:island.x+35+travel,w:130}];
    island.step(dt);
    const jumps=[];
    for(const [name,fixture] of Object.entries(cases)){
      const run=fresh(fixture.seed);run.distance=fixture.center-156;run.y=run.floorY;
      run.obstacles=[{type:'gap',x:run.x+26,w:260}];run.jump();
      let crossed=false,landed=false,airborne=false;
      for(let frame=0;frame<240;frame++){
        if(frame===36){run.release();run.jump();}
        run.step(1/120);airborne ||= !run.grounded;
        crossed ||= run.obstacles[0].x+run.obstacles[0].w<run.x-8;
        if(crossed&&run.grounded){landed=true;break;}
        if(run.dead)break;
      }
      jumps.push({name,crossed,landed,airborne,dead:run.dead,y:run.y,floor:run.floorY});
    }
    return {samples,joinedGrounded:joined.grounded,islandGrounded:island.grounded,jumps};
  },cases);
  for(const sample of physics.samples)assert.equal(sample.grounded,sample.offset<=8||sample.offset>=252,`Foot contact at ${sample.offset}`);
  assert.equal(physics.joinedGrounded,false,'Touching gaps cannot form an invisible landing');
  assert.equal(physics.islandGrounded,true,'A real bank between nearby holes remains solid');
  for(const jump of physics.jumps){assert.equal(jump.dead,false,jump.name);assert.equal(jump.crossed&&jump.landed&&jump.airborne,true,jump.name);assert.ok(Math.abs(jump.y-jump.floor)<0.001);}

  const pixels=await page.evaluate(cases=>{
    const reports=[];
    for(const [name,fixture] of Object.entries(cases)){
      const profile=Yo(fixture.seed,{districtId:'endless',ground:T});
      const floor=x=>profile.at(fixture.distance+x-250);
      const gap={type:'gap',...(fixture.gaps?.[0]||{x:495,w:260})},left=gap.x,right=gap.x+gap.w;
      const canvas=document.createElement('canvas');canvas.width=Math.max(1000,right+40);canvas.height=1000;
      const ctx=canvas.getContext('2d');ctx.fillStyle='#fff';ctx.fillRect(0,0,canvas.width,1000);
      // The white backing represents a bright painted road behind the chasm.
      const art=Object.create(Object.getPrototypeOf(At));art.c=ctx;
      art.terrain(canvas.width,floor,fixture.distance,0,'',[gap],0);
      let brightestRim=0,brightestDepth=0,curbColor=0;
      for(let x=left+15;x<=right-15;x+=10){
        const y=Math.ceil(floor(left)+(floor(right)-floor(left))*(x-left)/gap.w)+2;
        const color=ctx.getImageData(x,y,1,1).data;
        brightestRim=Math.max(brightestRim,...color.slice(0,3));
        // The former hill/valley inside the opening must not retain its green
        // curb or blue-green fill, even where it rises above the two banks.
        for(let offset=-2;offset<=3;offset++){
          const oldSurface=ctx.getImageData(x,Math.round(floor(x))+offset,1,1).data;
          curbColor=Math.max(curbColor,oldSurface[1]-oldSurface[0]);
        }
        for(let deep=Math.ceil(Math.max(floor(left),floor(right))+110);deep<990;deep+=37){
          const pixel=ctx.getImageData(x,deep,1,1).data;
          brightestDepth=Math.max(brightestDepth,...pixel.slice(0,3));
        }
      }
      reports.push({name,brightestRim,brightestDepth,curbColor});
    }
    return reports;
  },{...cases,...wideCases});
  for(const pixelsOfGap of pixels){
    assert.ok(pixelsOfGap.brightestRim<65,`${pixelsOfGap.name}: no curb crosses gap; rear road is occluded`);
    assert.ok(pixelsOfGap.brightestDepth<=12,`${pixelsOfGap.name}: gap has no visible bottom or remaining terrain`);
    assert.ok(pixelsOfGap.curbColor<10,`${pixelsOfGap.name}: removed internal terrain has no curb or fill`);
  }
  console.log('PASS: real bank contact, continuous voids, adjacent-hole support, joined-hole physics, and jump/landing on four seeded slopes.');

  const captures=[];
  for(const [name,fixture] of Object.entries(cases))captures.push(await capture(page,name,fixture));
  captures.push(await capture(page,'adjacent',{...cases.crest,gaps:[{x:390,w:150},{x:620,w:150}]}));
  for(const [name,fixture] of Object.entries(wideCases))captures.push(await capture(page,name,fixture));
  assert.deepEqual(desktop.errors,[]);await desktop.context.close();

  const mobile=await open({width:844,height:390});
  captures.push(await capture(mobile.page,'uphill-mobile',cases.uphill));
  captures.push(await capture(mobile.page,'adjacent-mobile',{...cases.valley,gaps:[{x:390,w:150},{x:620,w:150}]}));
  assert.deepEqual(mobile.errors,[]);await mobile.context.close();
  const fallback=await open({width:1440,height:900},true);
  captures.push(await capture(fallback.page,'downhill-canvas',cases.downhill));
  assert.deepEqual(fallback.errors,[]);await fallback.context.close();
  await writeFile(`${output}/report.json`,JSON.stringify({cases,physics,pixels,captures},null,2));
  console.log('PASS: full-depth gap captures on desktop/mobile and Canvas fallback, with no browser exceptions.');
}finally{await browser.close();}
