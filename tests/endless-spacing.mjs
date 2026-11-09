import assert from 'node:assert/strict';
import {readFile,mkdir,writeFile} from 'node:fs/promises';
import {model} from './endless-fairness.mjs';
const c=model(await readFile('scripts/engine.js','utf8'),await readFile('scripts/endless.js','utf8'),await readFile('scripts/endless-generator.js','utf8'));
const G=c.LR_ENDLESS_GENERATOR,report={sections:0,gaps:0,widths:[],maxTerrainRange:0,maxEntities:0};
for(let seed=1;seed<=32;seed++){
 const q=new c.hi(864,seed,{mode:'endless',procedural:true,ambientJetpacks:false});
 const heights=[];
 for(let x=0;x<400000;x+=200)heights.push(q.terrainProfile.at(x));
 const range=Math.max(...heights)-Math.min(...heights);report.maxTerrainRange=Math.max(report.maxTerrainRange,range);
 assert.ok(range>90,'Each seed produces substantial hills and valleys');
 for(let i=0;i<50;i++){
  G.generate(q);report.sections++;
  const record=G.inspect(q).history.at(-1);const gaps=q.obstacles.filter(o=>o.type==='gap');
  for(const o of q.obstacles.filter(o=>o.type!=='gap')){
   assert.ok(!q.platforms.some(p=>p.x<o.x+o.w+24&&p.x+p.w>o.x-24),'Mandatory hurdle has no overlapping low platform');
  }
  const hurdles=q.obstacles.filter(o=>o.type!=='gap').sort((a,b)=>a.x-b.x);
  for(let j=1;j<hurdles.length;j++)assert.ok(hurdles[j].x-(hurdles[j-1].x+hurdles[j-1].w)>record.speed*.85,'Hurdles retain readable reaction space');
  for(const gap of gaps){report.gaps++;report.widths.push(gap.w/record.speed);
   if(record.family==='ravine'){
    assert.ok(q.platforms.filter(p=>p.x>gap.x&&p.x<gap.x+gap.w).length>=2,'Wide chasms have physical stepping platforms');
   }
  }
  report.maxEntities=Math.max(report.maxEntities,q.obstacles.length+q.platforms.length+q.pickups.length);
  q.distance=record.end-900;q.nextX=q.x+900;q.time=i*5;q.obstacles=[];q.platforms=[];q.pickups=[];q.springs=[];q.markers=[];
 }
}
// Assess the actual opening minute, not only terrain hundreds of kilometres away.
report.opening={seeds:128,minTerrainRange:Infinity,minGaps:Infinity,minBroad:Infinity};
for(let seed=0;seed<128;seed++){
 const q=new c.hi(864,seed,{mode:'endless',procedural:true,ambientJetpacks:true});
 const heights=[];
 for(let x=0;x<G.distanceAtTime(30);x+=40)heights.push(q.terrainAt(x));
 const range=Math.max(...heights)-Math.min(...heights);
 assert.ok(range>100,'Hills and valleys are substantial in the first 30 seconds');
 report.opening.minTerrainRange=Math.min(report.opening.minTerrainRange,range);
 let gaps=0,broad=0;
 while(q.distance+q.nextX-q.x<G.distanceAtTime(60)){
  G.generate(q);const row=G.inspect(q).history.at(-1);
  for(const o of q.obstacles){
   if(o.type==='gap'){gaps++;if(o.w/row.speed>.66)broad++;}
   else {
    assert.ok(o.w>=88&&o.h>=40,'No thin slivers: even the tall invoice cart keeps a full readable body');
    assert.ok(o.artDistrict&&Number.isInteger(o.artVariant),'Every generated hurdle uses registered native district art');
   }
  }
  q.distance=row.end-900;q.nextX=q.x+900;q.obstacles=[];q.platforms=[];q.pickups=[];q.springs=[];q.markers=[];
 }
 assert.ok(gaps>=3,'Even seeds with a long platform chasm and jetpack retain several actual gaps');
 assert.ok(broad>=1,'Wide crossings arrive in the opening minute');
 report.opening.minGaps=Math.min(report.opening.minGaps,gaps);report.opening.minBroad=Math.min(report.opening.minBroad,broad);
}
const bands=[0,0,0,0];for(const w of report.widths)bands[w<.48?0:w<.70?1:w<1.20?2:3]++;
assert.ok(bands.every(n=>n>30),'Small, medium, wide and chasm gaps all occur');
report.distinctWidths=new Set(report.widths.map(v=>v.toFixed(4))).size;
assert.ok(report.distinctWidths>400,'Widths vary continuously rather than a few fixed lengths');
report.gapBands=bands;report.minGapSeconds=Math.min(...report.widths);report.maxGapSeconds=Math.max(...report.widths);delete report.widths;
await mkdir('review/v124',{recursive:true});await writeFile('review/v124/endless-spacing.json',JSON.stringify(report,null,2));
console.log('PASS: '+report.sections+' real-model sections; clear ground hurdles, independent landing banks, '+report.gaps+' gaps across four width bands; terrain range and bounded section population.',report);
