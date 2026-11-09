import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {model} from './endless-fairness.mjs';
const c=model(await fs.readFile('scripts/engine.js','utf8'),await fs.readFile('scripts/endless.js','utf8'),await fs.readFile('scripts/endless-generator.js','utf8'));
const G=c.LR_ENDLESS_GENERATOR,IPO=c.LR_ENDLESS_IPO;
const hash=x=>createHash('sha256').update(JSON.stringify(x)).digest('hex');
const shapes=new Set(),lengths=new Set(),lanes=new Set(),periods=new Set(),report=[];
for(const t of [60,120,180,600]) assert.equal(G.speed(t+30)-G.speed(t),90,'Constant street acceleration');
assert.equal(G.speed(0),340);
{
  const q=new c.hi(1280,42,{mode:'endless',procedural:true});
  q.beginFlight({kind:'ipo',seed:42});
  const points=[...new Set(q.priceWaves.flatMap(w=>w.paths.flatMap(p=>p.points)))];
  const original=points.map(p=>p.x),origin=q.boss.origin.x,player=q.x;
  const forecast=q.priceWaves.map(w=>[w.safeY,w.fireAt,w.clearAt]);
  q.resize(540);
  const scale=(q.boss.origin.x-q.x)/(origin-player);
  points.forEach((p,i)=>assert.equal(p.x,q.x+(original[i]-player)*scale,'Shared branch junctions are reframed exactly once'));
  assert.ok(q.boss.origin.x>q.x&&q.boss.origin.x<q.width-150,'The machine stays visible after a narrow resize');
  assert.deepEqual(q.priceWaves.map(w=>[w.safeY,w.fireAt,w.clearAt]),forecast,'Resize never rerolls a displayed forecast');
  q.resize(1280);
  points.forEach((p,i)=>assert.ok(Math.abs(p.x-original[i])<1e-8,'Widening restores the same chart geometry'));
}
for(let seed=0;seed<128;seed++){
  const waves=IPO.plan(1000,250,seed,3);
  assert.equal(hash(waves),hash(IPO.plan(1000,250,seed,3)),'Same encounter seed reproduces its visible forecast');
  assert.equal(new Set(waves.map(w=>w.attackName)).size,3);
  shapes.add(hash(waves));
  for(const w of waves){
    lengths.add(w.paths.length);lanes.add(w.safeY.toFixed(1));periods.add((w.fireAt-w.telegraphAt).toFixed(3));
    assert.ok(w.fireAt-w.telegraphAt>=.85,'Every attack has a readable warning');
    for(const p of w.paths)for(const [i,pt] of p.points.entries()){
      if(i)assert.ok(pt.u>p.points[i-1].u,'Price graph only moves forward');
      if(pt.u>=.36)assert.ok(pt.y<=w.safeY-w.safeHalf-8||pt.y>=w.safeY+w.safeHalf+8,'Every later branch respects the advertised escape lane');
    }
  }
}
assert.equal(shapes.size,128);assert.ok(lengths.size>=3&&lanes.size>250&&periods.size>100);
for(const width of [540,1280])for(const character of ['nicolai','trond'])for(const round of [1,5])for(let seed=0;seed<16;seed++){
  const q=new c.hi(width,seed,{mode:'endless',character,procedural:true,ambientJetpacks:true});
  q.time=90;q.distance=G.distanceAtTime(90);q.nextX=q.x+900;q.y=q.floorY;q.speed=G.speed(90);q.ipoEncounters=round-1;
  const distance=q.distance,next=q.nextX,chapter=q.chapterTime,score=q.score;
  q.beginFlight({kind:'ipo',seed});assert.ok(q.endlessIPO);
  let damage=false;const hit=q.hit;q.hit=function(reason){damage=reason;return hit.call(this,reason)};
  let ticks=0;
  while(q.endlessIPO&&!q.dead&&ticks++<2400){
    // React only to a forecast already shown to the player, using ordinary
    // hold/release controls, with no shield or invulnerability.
    const wave=q.priceWaves.find(w=>w.state!=='cleared'&&q.boss.age>=w.telegraphAt);
    const target=wave?wave.safeY+61:q.floorY-140;
    const velocity=Math.max(-195,Math.min(195,(target-q.y)*4.5));
    const thrust=q.vy>velocity;
    if(thrust&&!q.held)q.jump();else if(!thrust&&q.held)q.release();
    q.step(1/120);
  }
  assert.equal(damage,false,`${width}/${character}/round${round}/seed${seed}: ${damage}`);
  assert.equal(q.dead,false);assert.equal(q.ipoDefeated,1);assert.equal(q.bossProgress,3);
  assert.equal(q.distance,distance,'The street cannot run past the player during the boss');
  assert.equal(q.nextX,next);assert.equal(q.chapterTime,chapter,'An Endless boss cannot trigger Story progression');
  assert.equal(q.score-score,950,'The normal leaderboard score receives exactly three wave rewards and one boss reward');
  assert.ok(Math.abs(c.LR_ENDLESS.speedAt(q,q.time)-G.speed(90))<.00001,'Returning pace matches the suspended street');
  for(let i=0;i<100;i++)q.step(1/120);
  assert.equal(q.dead,false);assert.equal(q.flightLanding,0);assert.equal(q.grounded,true);
  report.push({width,character,round,seed,seconds:ticks/120});
}
// The normal scheduler must offer repeated IPOs with independent attack seeds.
const encounterSeeds=new Set();let offers=0;
for(let seed=0;seed<12;seed++){
  const q=new c.hi(1000,seed,{mode:'endless',procedural:true,ambientJetpacks:true});let prior=-100;
  for(let section=0;section<100;section++){
    G.generate(q);const record=G.inspect(q).history.at(-1);
    if(record.event==='ipo'){
      assert.ok(record.time>=76&&record.time-prior>=92);prior=record.time;offers++;
      const offer=q.pickups.find(p=>p.flightKind==='ipo');assert.ok(offer);encounterSeeds.add(offer.encounterSeed);
    }
    q.distance=record.end-900;q.nextX=q.x+900;q.time=record.time;
    q.obstacles=[];q.platforms=[];q.pickups=[];q.springs=[];q.markers=[];
  }
}
assert.ok(offers>30);assert.equal(encounterSeeds.size,offers);
await fs.mkdir('review/v126/ipo',{recursive:true});
await fs.writeFile('review/v126/ipo/model-report.json',JSON.stringify({shapes:shapes.size,branchCounts:[...lengths],lanes:lanes.size,warningPeriods:periods.size,offers,encounterSeeds:encounterSeeds.size,physics:report},null,2));
console.log(`PASS ${report.length} damage-free real-control IPO fights and landings; ${shapes.size} distinct attack trees; ${offers} recurring independent encounter seeds; preserved street/progression and exact score awards.`);
