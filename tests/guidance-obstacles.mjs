import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {model} from './endless-fairness.mjs';
import vm from 'node:vm';
const [engine,endless,generator]=await Promise.all(['engine','endless','endless-generator'].map(n=>readFile(new URL(`../scripts/${n}.js`,import.meta.url),'utf8')));
const context=model(engine,endless,generator);
vm.runInContext(engine.slice(engine.indexOf('var ye = 320'),engine.indexOf('var wo = class')),context);
let traversals=0;
for(const character of ['nicolai','trond'])for(const seed of [1,42,91827]){
  const park=new context.yo(960,seed,{districtId:'park',character,procedural:true});
  const trees=park.worldItems.filter(i=>i.kind==='tree');
  assert.equal(trees.length,6,'Six deliberate groves, not an evenly stamped row');
  for(const tree of trees){
    for(const hazard of park.obstacles)assert.ok(tree.x+112<hazard.x||tree.x-112>hazard.x+hazard.w,'Canopy does not obscure obstacle silhouette');
  }
  const sample=new context.yo(960,seed,{districtId:'midtown',character,procedural:true});
  assert.equal(sample.obstacles.filter(o=>o.guidance).length,2,'Two occasional moving hazards');
  for(const target of sample.obstacles.filter(o=>o.guidance))for(let phase=0;phase<12;phase++){
    const q=new context.yo(960,seed,{districtId:'midtown',character,procedural:true});
    const obstacle=q.obstacles.find(o=>o.guidance?.phase===target.guidance.phase);
    // Approach the real authored slope at every phase; only unrelated course
    // objects are removed. No invincibility, shield or collision bypass.
    q.distance=q.chapterDistance=obstacle.x-q.x-250;
    for(const o of q.obstacles)o.x-=q.distance;
    q.obstacles=[obstacle];q.platforms=[];q.pickups=[];q.worldItems=[];
    q.time=phase*obstacle.guidance.period/12;q.chapterTime=34;
    q.y=q.floorAt(q.x);q.grounded=true;
    let min=Infinity,max=-Infinity;
    for(let frame=0;frame<200;frame++){
      q.step(1/120,true);
      min=Math.min(min,obstacle.base);max=Math.max(max,obstacle.base);
      assert.equal(q.dead,false,`${character}/${seed}/phase${phase}: sliding is always a safe response`);
      assert.ok(obstacle.base>=obstacle.guidance.base-38.001&&obstacle.base<=obstacle.guidance.base+6.001);
    }
    assert.ok(max-min>10,'Physical obstacle actually travels');traversals++;
  }
  for(const raised of [false,true]) {
    const q=new context.yo(960,seed,{districtId:'midtown',character,procedural:true});
    const obstacle=q.obstacles.find(o=>o.guidance);
    q.distance=q.chapterDistance=obstacle.x-q.x+obstacle.w/2;
    obstacle.x-=q.distance;q.obstacles=[obstacle];q.platforms=[];q.pickups=[];q.worldItems=[];
    const angle=raised?Math.PI*1.5:Math.PI*.5;
    q.time=(angle-obstacle.guidance.phase)*obstacle.guidance.period/(Math.PI*2)-1/120;
    q.chapterTime=34;q.y=q.floorAt(q.x);q.grounded=true;
    q.step(1/120,false);
    assert.equal(q.dead,!raised,'Standing collision follows the board: low hits, fully raised clears');
  }
}
console.log(`PASS ${traversals} real collision-enabled moving-guidance slide traversals across both runners, seeds and all twelve phases; Park grove clearance.`);
