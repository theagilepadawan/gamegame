import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {model} from './endless-fairness.mjs';
import vm from 'node:vm';
const [engine,endless,generator]=await Promise.all(['engine','endless','endless-generator'].map(n=>readFile(new URL(`../scripts/${n}.js`,import.meta.url),'utf8')));
const c=model(engine,endless,generator);
vm.runInContext(engine.slice(engine.indexOf('var ye = 320'),engine.indexOf('var wo = class')),c);
let traversals=0;const counts={};
const make=(district,character,seed)=>district==='opening'?new c.hi(960,seed,{mode:'chapter',character,procedural:true,ambientJetpacks:false}):new c.yo(960,seed,{districtId:district,character,procedural:true,ambientJetpacks:false});
function approach(q,phase,distance=250){
 const h=q.obstacles.find(o=>o.guidance?.phase===phase),support=q.platforms.find(p=>p.id===h.platformId);
 q.distance=q.chapterDistance=h.x-q.x-distance;
 for(const list of ['obstacles','platforms','pickups','springs','worldItems'])for(const o of q[list]||[])o.x-=q.distance;
 q.obstacles=[h];q.platforms=support?[support]:[];q.pickups=[];q.springs=[];q.worldItems=[];
 q.routeResolved=true;q.routeChoice={id:h.route||'low'};q.routeResolvedAt=16.2;
 q.chapterTime=34;q.y=support?.y??q.floorAt(q.x);q.support=support?.id??null;q.grounded=true;
 return h;
}
for(const district of ['opening','midtown','park'])for(const character of ['nicolai','trond'])for(const seed of [1,42,91827]){
 const sample=make(district,character,seed),moving=sample.obstacles.filter(o=>o.guidance);
 counts[district]=moving.length;
 assert.equal(moving.length,{opening:3,midtown:6,park:5}[district]);
 assert.ok(new Set(moving.map(o=>o.guidance.period)).size>=3,'Visible differences in pace');
 for(const target of moving)for(let phase=0;phase<12;phase++){
  const q=make(district,character,seed),h=approach(q,target.guidance.phase);
  q.time=phase*h.guidance.period/12;
  let min=Infinity,max=-Infinity;
  for(let frame=0;frame<210;frame++){
   q.step(1/120,true);
   min=Math.min(min,h.base);max=Math.max(max,h.base);
   assert.equal(q.dead,false,`${district}/${character}/${seed}/${target.label}/phase${phase}: slide stays safe`);
   assert.ok(h.base>=h.mountBase-h.guidance.travel-.001&&h.base<=h.mountBase+.001,'Never below the safe clearance');
  }
  assert.ok(max-min>4,'The collision body actually moves');traversals++;
 }
 for(const raised of [false,true]) {
  const q=make(district,character,seed),h=approach(q,moving[0].guidance.phase,-moving[0].w/2);
  const angle=raised?Math.PI*1.5:Math.PI*.5;
  q.time=(angle-h.guidance.phase)*h.guidance.period/(Math.PI*2)-1/120;
  q.step(1/120,false);
  assert.equal(q.dead,!raised,`${district}: standing collision follows raised/lowered board`);
 }
 if(district==='park')for(const tree of sample.worldItems.filter(i=>i.kind==='tree'))for(const h of sample.obstacles)
  assert.ok(tree.x+112<h.x||tree.x-112>h.x+h.w,'Groves leave the obstacles readable');
}
// Production Endless uses the same motion model, with a separate deterministic
// stream: challenge timing changes, terrain/pickup generation do not.
const periods=new Set();let generated=0;
for(const seed of [1,42,91827]){
 const q=new c.hi(960,seed,{mode:'endless',procedural:true,ambientJetpacks:false});
 for(const time of [15,70,150,240]){
  q.time=time;q.distance=c.LR_ENDLESS_GENERATOR.distanceAtTime(time);q.obstacles=[];q.pickups=[];q.platforms=[];
  q.nextX=q.x+400;
  for(let section=0;section<8;section++)q.spawn(section%2?27:20);
  for(const h of q.obstacles.filter(o=>o.guidance)){
   assert.ok(h.guidance.period>=2.6&&h.guidance.period<=5.2);periods.add(h.guidance.period.toFixed(2));generated++;
  }
 }
}
assert.ok(generated>10&&periods.size>8,`Endless motion variety: ${generated}/${periods.size}`);
console.log(`PASS ${traversals} collision-enabled traversals; Story movers ${JSON.stringify(counts)}; ${generated} Endless movers with ${periods.size} periods.`);
