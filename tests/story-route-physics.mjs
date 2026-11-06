import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {model} from './endless-fairness.mjs';
import vm from 'node:vm';
const engine=await readFile('scripts/engine.js','utf8');
const c=model(engine,await readFile('scripts/endless.js','utf8'),await readFile('scripts/endless-generator.js','utf8'));
vm.runInContext(engine.slice(engine.indexOf('var ye = 320'),engine.indexOf('var wo = class')),c);
let checks=0;
for(const districtId of ['midtown','park'])for(const character of ['nicolai','trond'])for(const selected of ['low','high']){
 function fixture(){const q=new c.yo(1000,42,{mode:'chapter',districtId,character,procedural:false,ambientJetpacks:false});q.chapterTime=17;q.routeResolved=true;q.routeChoice={id:selected,label:'test'};q.obstacles=[];q.platforms=[];q.pickups=[];q.springs=[];q.worldItems=[];q.y=q.floorY;return q}
 const other=selected==='low'?'high':'low';
 for(const matching of [false,true]){
  const q=fixture(),o=q.hazard('low',q.x-25,70,q.floorY);o.route=matching?selected:other;
  q.step(1/120);assert.equal(q.dead,matching,'Only the selected route obstacle participates in collisions');
  assert.ok(q.obstacles.includes(o),'Both obstacles remain available to render');checks++;
  const r=fixture(),p=r.platform(r.x-30,r.floorY-100,160,'roof',{route:matching?selected:other});
  r.y=p.y-1;r.grounded=false;r.vy=400;r.step(1/120);
  assert.equal(r.support===p.id,matching,'Unchosen bridge cannot catch a jump on the selected path');
  assert.ok(r.platforms.includes(p),'Both platforms remain available to render');checks++;
 }
}
console.log(`PASS: ${checks} actual physics probes, both runners/districts/routes: scenery retained, authored collision paths preserved.`);
