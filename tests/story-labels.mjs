import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import vm from 'node:vm';
import {model} from './endless-fairness.mjs';
const source=await fs.readFile('scripts/engine.js','utf8');
const c=model(source,await fs.readFile('scripts/endless.js','utf8'),await fs.readFile('scripts/endless-generator.js','utf8'));
vm.runInContext(source.slice(source.indexOf('var ye = 320'),source.indexOf('var wo = class')),c);
const story=c.LR_HAZARDS.story;
const build=(id,seed,character,ambientJetpacks)=>id==='opening'?new c.hi(1000,seed,{mode:'chapter',character,procedural:true,ambientJetpacks}):new c.yo(1000,seed,{districtId:id,character,procedural:true,ambientJetpacks});
const geometry=q=>JSON.parse(JSON.stringify(q.obstacles.map(({label,...o})=>o)));
let runs=0;
for(const id of ['opening','midtown','park'])for(const character of ['nicolai','trond'])for(let seed=0;seed<32;seed++)for(const flight of [false,true]){
  c.LR_HAZARDS.story=story;const q=build(id,seed,character,flight);
  const labels=q.obstacles.filter(h=>h.type!=='gap').map(h=>h.label);
  assert.equal(new Set(labels).size,labels.length,`${id}: every authored obstacle has a unique caption across both routes`);
  assert.ok(labels.every(label=>c.LR_HAZARDS.lines[label]),'Every caption has an authored finance punchline');
  c.LR_HAZARDS.story=h=>h;const unchanged=build(id,seed,character,flight);
  assert.deepEqual(geometry(q),geometry(unchanged),'Caption assignment cannot alter art registration, size, position, support or motion');
  assert.deepEqual(JSON.parse(JSON.stringify(q.pickups)),JSON.parse(JSON.stringify(unchanged.pickups)),'Rewards are preserved');
  c.LR_HAZARDS.story=story;q.beginContrarian();
  assert.equal(new Set(q.storyLabels).size,q.storyLabels.length,'The later Contrarian event cannot repeat earlier Story captions');
  runs++;
}
console.log(`PASS ${runs} Story courses: unique captions including Contrarian, authored punchlines and identical physical geometry/rewards.`);
