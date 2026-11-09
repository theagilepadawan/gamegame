import assert from 'node:assert/strict';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {model,controlSearch} from './endless-fairness.mjs';
const c=model(...await Promise.all(['engine','endless','endless-generator'].map(n=>readFile(`scripts/${n}.js`,'utf8'))));
const hit=c.hi.prototype.hit;c.hi.prototype.hit=function(reason){this.qaDamage=true;return hit.call(this,reason)};
const sections=[[0,10],[10,27],[27,36],[36,54]];
const previous=JSON.parse(await readFile('tests/fixtures/opening-controls-v124.json','utf8').catch(()=> '[]'));
const report=[];await mkdir('review/v124/opening-fairness',{recursive:true});
function fixture(seed,character,start,end){
 const q=new c.hi(1000,seed,{mode:'chapter',character,procedural:true,ambientJetpacks:false});
 const distance=c.ee(start);
 for(const name of ['obstacles','platforms','pickups','springs','markers']){
  for(const h of q[name])h.x-=distance;
  q[name]=q[name].filter(h=>h.x+(h.w||0)>q.x-180&&h.x<q.x+c.ee(end)-distance+180);
 }
 q.time=q.chapterTime=start;q.distance=q.chapterDistance=distance;q.y=q.floorY;q.grounded=true;
 q.pickups=q.pickups.filter(h=>['dividend','opportunity'].includes(h.kind));
 return q;
}
for(const character of ['nicolai','trond'])for(const seed of [42,91827])for(const [start,end]of sections){
 const known=previous.find(r=>r.seed===seed&&r.character===character&&r.start===start);
 const result=known||controlSearch(c,fixture(seed,character,start,end),c.ee(end));
 assert.ok(result.pass,`${character}/${seed}/${start}: ${JSON.stringify(result)}`);
 const q=fixture(seed,character,start,end);
 for(const control of result.controls){
  const input=Number(control);if(input===1&&!q.held)q.jump();else if(input!==1&&q.held)q.release();
  for(let frame=0;frame<12;frame++){
   q.step(1/120,input===2);
   assert.ok(!q.dead&&!q.qaDamage&&q.jumpChain<3&&q.superJumpAge<0,'Real controls, no damage, power-up protection or required triple jump');
  }
 }
 assert.ok(q.distance>=c.ee(end)&&q.grounded);
 report.push({seed,character,start,end,pass:true,controls:result.controls});
 await writeFile('review/v124/opening-fairness/report.json',JSON.stringify(report,null,2)+'\n');
 console.log(`PASS Opening Bell/${character}/${seed}: ${start}–${end}s`);
}
console.log(`PASS ${report.length} collision-free Downtown witnesses through the Opening Bell, bull run, recovery and sell-off.`);
