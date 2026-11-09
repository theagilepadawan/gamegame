import assert from 'node:assert/strict';
import {readFile,mkdir,writeFile} from 'node:fs/promises';
import {model} from './endless-fairness.mjs';
const c=model(await readFile('scripts/engine.js','utf8'),await readFile('scripts/endless.js','utf8'),await readFile('scripts/endless-generator.js','utf8'));
const G=c.LR_ENDLESS_GENERATOR,report={slides:0,standingBlocked:0,jumpsBlocked:0,seeds:16,characters:['nicolai','trond'],times:[15,90,240]};
const hit=c.hi.prototype.hit;c.hi.prototype.hit=function(cause){this.qaDamage=true;return hit.call(this,cause);};
for(const character of report.characters)for(const time of report.times)for(let seed=1;seed<=report.seeds;seed++){
 function setup(){
  const q=new c.hi(seed%2?540:960,seed,{mode:'endless',character,procedural:true,ambientJetpacks:false});
  q.time=time;q.distance=G.distanceAtTime(time);q.nextX=q.x+500;q.autoSpawn=false;q.spawn(37);
  const h=q.obstacles.find(o=>o.requiredAction==='slide');assert.ok(h);
  const advance=h.x-q.x-G.speed(time)*.8;
  q.distance+=advance;h.x-=advance;q.obstacles=[h];q.pickups=[];q.platforms=[];q.springs=[];q.markers=[];
  q.y=q.floorY;q.grounded=true;return {q,h};
 }
 for(const input of ['slide','stand','double-jump']){
  const {q,h}=setup();let airJumped=false;
  for(let tick=0;tick<480&&!q.dead&&!q.qaDamage&&h.x+h.w>q.x-25;tick++){
   if(input==='double-jump'){
    const lead=(h.x-q.x)/G.speed(q.time);
    if(q.grounded&&lead<.43)q.jump();
    else if(!q.grounded&&!airJumped&&q.vy>-40){q.release();q.jump();airJumped=true;}
   }
   q.step(1/120,input==='slide');
  }
  if(input==='slide'){
   assert.ok(!q.dead&&!q.qaDamage&&h.x+h.w<q.x-25,`Slide clears ${character}/${seed}/${time}, including changing slopes`);report.slides++;
  }else{
   assert.ok(q.dead||q.qaDamage,`The visible low ceiling requires crouching: ${input}/${character}/${seed}/${time}`);
   report[input==='stand'?'standingBlocked':'jumpsBlocked']++;
  }
 }
}
// Challenge sections are ordinary deterministic course choices, with recovery
// between packets; they do not silently replace the Story course generator.
for(const seed of [7,42,91827]){
 const q=new c.hi(960,seed,{mode:'endless',procedural:true,ambientJetpacks:false});const seen=new Set();
 for(let n=0;n<30;n++){
  q.spawn();const row=G.inspect(q).history.at(-1);if(row.route>=37)seen.add(row.route);
  q.distance=row.end-900;q.nextX=q.x+900;q.obstacles=[];q.platforms=[];q.pickups=[];q.springs=[];q.markers=[];
 }
 assert.ok(seen.size>=3,'Normal runs mix several challenge types, not a single repeated gauntlet');
}
await mkdir('review/v126',{recursive:true});await writeFile('review/v126/challenges-model.json',JSON.stringify(report,null,2));
console.log('PASS mandatory slide passages: '+JSON.stringify(report));
