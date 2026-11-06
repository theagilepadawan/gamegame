import assert from 'node:assert/strict';
import {readFile,mkdir,writeFile} from 'node:fs/promises';
import {model,controlSearch} from './endless-fairness.mjs';
const c=model(await readFile('scripts/engine.js','utf8'),await readFile('scripts/endless.js','utf8'),await readFile('scripts/endless-generator.js','utf8'));
const G=c.LR_ENDLESS_GENERATOR;
const hit=c.hi.prototype.hit;c.hi.prototype.hit=function(cause){this.qaDamage=(this.qaDamage||0)+1;return hit.call(this,cause)};
const cases=[[23,600,12,'nicolai'],[23,600,31,'trond'],[34,600,27,'nicolai'],[35,600,4,'trond'],[35,90,11,'nicolai'],[27,600,9,'trond'],[28,600,43,'nicolai'],[21,240,28,'trond']];
const report=[];
for(const [route,time,seed,character] of cases){
 function fixture(){const q=new c.hi(540,seed,{mode:'endless',procedural:true,character,ambientJetpacks:false});q.time=time;q.distance=G.distanceAtTime(time);q.nextX=q.x+500;q.autoSpawn=false;q.spawn(route);q.y=q.floorY;return q}
 const q=fixture(),target=q.distance+q.nextX-q.x;
 const result=controlSearch(c,q,target);report.push({route,time,seed,character,...result});
 await mkdir('review/v115',{recursive:true});await writeFile('review/v115/endless-traversal.json',JSON.stringify(report,null,2));
 assert.ok(result.pass,`No control path for ${JSON.stringify(report.at(-1))}`);
 if([23,34,35].includes(route)){const idle=fixture();for(let f=0;f<3600&&!idle.dead&&!idle.qaDamage&&idle.distance<target;f++)idle.step(1/120,false);assert.ok(idle.dead||idle.qaDamage,'Gap really requires player input')}
 console.log(`PASS: ${character}, route ${route}, seed ${seed}, ${time}s, compact viewport, no damage or super-jump.`);
}
