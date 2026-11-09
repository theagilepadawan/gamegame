import assert from 'node:assert/strict';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import vm from 'node:vm';
import {model} from './endless-fairness.mjs';
const engine=await readFile('scripts/engine.js','utf8');
const c=model(engine,await readFile('scripts/endless.js','utf8'),await readFile('scripts/endless-generator.js','utf8'));
vm.runInContext(engine.slice(engine.indexOf('var ye = 320'),engine.indexOf('var wo = class')),c);
const originalHit=c.hi.prototype.hit;
c.hi.prototype.hit=function(reason){this.qaDamage=true;return originalHit.call(this,reason)};
const report=[];
function fixture(districtId,character,seed,section){
  const q=new c.yo(1000,seed,{districtId,character,procedural:true,ambientJetpacks:false});
  const shift=section.start*320;
  for(const name of ['obstacles','platforms','pickups','springs','worldItems']) {
    for(const item of q[name])item.x-=shift;
    q[name]=q[name].filter(item=>item.x+(item.w||0)>q.x-150&&item.x<q.x+(section.end-section.start)*320+100);
  }
  q.chapterTime=q.time=section.start;q.chapterDistance=q.distance=shift;q.y=q.floorY;
  q.worldItems=[]; // Ambient birds/sign reactions do not participate in physics.
  // Decline optional shields and magnets: neither may mask damage or reachability.
  q.pickups=q.pickups.filter(p=>['dividend','opportunity'].includes(p.kind));
  if(section.start>17){q.routeResolved=true;q.routeChoice={id:'low'};q.routeResolvedAt=16.2;}
  if(section.goal){
    const p=q.platforms.find(p=>p.setPiece&&Math.abs(p.x-(q.x+(39.95-section.start)*320))<2);
    const bench=q.obstacles.find(o=>o.platformId===p.id&&o.type==='low');
    const coins=q.pickups.filter(coin=>coin.platformId===p.id).sort((a,b)=>Math.abs(a.x-bench.x)-Math.abs(b.x-bench.x));
    assert.ok(coins.length&&coins[0].y<p.y-80,'Ledge reward follows the jump over the obstacle');
    coins[0].qaGoal=true;q.qaGoalX=coins[0].x;
  }
  return q;
}
function copy(q){
  const n=Object.assign(Object.create(Object.getPrototypeOf(q)),q);
  for(const name of ['obstacles','platforms','pickups','springs','worldItems'])n[name]=q[name].map(item=>({...item}));
  n.setPiece={...q.setPiece};n.routeChoice=q.routeChoice?{...q.routeChoice}:null;n.events=[];return n;
}
function advance(q,input){
  if(input===1&&!q.held)q.jump();else if(input!==1&&q.held)q.release();
  for(let i=0;i<12&&!q.dead&&!q.qaDamage;i++){
    const target=q.pickups.find(p=>p.qaGoal);
    q.step(1/120,input===2);
    if(target?.taken)q.qaCollected=true;
    if(q.jumpChain>=3||q.superJumpAge>=0)q.qaThirdJump=true;
  }
}
function key(q){return [q.grounded,q.support,Math.round(q.y/6),Math.round(q.vy/45),q.held,q.airJumpAvailable,q.jumpChain,q.chainWindow>0,q.jumpCount,q.sliding,q.qaCollected,
  q.platforms.map(p=>p.collapseAt?Math.round((p.collapseAt-q.time)*10):'').join(',')].join('|')}
function search(initial,section){
  let beam=[{q:initial,controls:''}];
  const max=Math.ceil((section.end-section.start+.8)*10);
  for(let step=0;step<max;step++){
    const seen=new Map();
    for(const prev of beam)for(const input of [0,1,2]){
      const q=copy(prev.q);advance(q,input);
      if(q.dead||q.qaDamage||q.qaThirdJump)continue;
      if(section.route&&q.routeResolved&&q.routeChoice.id!==section.route)continue;
      if(section.goal&&!q.qaCollected&&q.qaGoalX-(q.time-section.start)*320<q.x-55)continue;
      const controls=prev.controls+input;
      if(q.time>=section.end&&q.grounded&&(!section.goal||q.qaCollected))return {pass:true,controls};
      const preferredHigh=section.route==='high'&&q.chapterTime>14.1&&q.chapterTime<16.3;
      const goal=q.pickups.find(p=>p.qaGoal);
      const goalSoon=goal&&!q.qaCollected&&goal.x<q.x+900;
      const score=goalSoon?Math.abs(q.y-(goal.y+65))*.35+(q.support?0:8):preferredHigh?Math.abs(q.y-(q.floorY-92))*.3+(q.support?0:15):(q.grounded?0:30)+Math.abs(q.y-q.floorY)*.018+(input===2?1:0);
      const k=key(q);if(!seen.has(k)||score<seen.get(k).score)seen.set(k,{q,controls,score});
    }
    beam=[...seen.values()].sort((a,b)=>a.score-b.score).slice(0,110);
    if(!beam.length)return {pass:false,failedAt:initial.time+step*.1};
  }
  return {pass:false,timeout:true};
}
const sections=[{name:'opening',start:0,end:13.5},{name:'upper fork',start:13.5,end:30.3,route:'high'},
  {name:'lower fork',start:13.5,end:30.3,route:'low'},{name:'jump-slide cadence',start:31,end:37.8},
  {name:'ledge reward',start:37.3,end:47.5,goal:true},{name:'final street',start:48,end:59.5}];
await mkdir('review/v122/fairness',{recursive:true});
const previous=process.env.DISTRICT_SEARCH==='1'?[]:JSON.parse(await readFile('tests/fixtures/district-controls-v122.json','utf8').catch(()=> '[]'));
for(const districtId of ['midtown','park'])for(const character of ['nicolai','trond'])for(const seed of [42,91827]){
  const all=new c.yo(1000,seed,{districtId,character,procedural:true,ambientJetpacks:false});
  for(const h of all.obstacles){
    const deck=all.platforms.find(p=>(!p.route||p.route===h.route)&&h.x<p.x+p.w&&h.x+h.w>p.x&&h.base>p.y+10&&h.base-p.y<140);
    assert.equal(deck,undefined,'No ground obstacle underneath a low active deck');
    if(h.route)for(const other of all.obstacles.filter(o=>o.route&&o.route!==h.route))assert.ok(Math.abs(h.x-other.x)>300,'Fork challenges have over 300px of horizontal separation');
  }
  for(const section of sections){
    const initial=fixture(districtId,character,seed,section),known=previous.find(r=>r.districtId===districtId&&r.character===character&&r.seed===seed&&r.section===section.name&&r.pass);
    const result=known?{pass:true,controls:known.controls}:search(initial,section);
    const record={districtId,character,seed,section:section.name,...result};report.push(record);
    await writeFile('review/v122/fairness/report.json',JSON.stringify(report,null,2));
    assert.ok(result.pass,`No safe control witness: ${JSON.stringify(record)}`);
    const replay=fixture(districtId,character,seed,section);
    for(const input of result.controls)advance(replay,Number(input));
    assert.ok(!replay.dead&&!replay.qaDamage&&!replay.qaThirdJump&&replay.grounded&&replay.time>=section.end,'Recorded controls replay through unchanged 120Hz game physics');
    if(section.route)assert.equal(replay.routeChoice.id,section.route);
    if(section.goal)assert.equal(replay.qaCollected,true,'The ledge reward is collected by contact, without magnet or shield');
    console.log(`PASS ${districtId}/${character}/${seed}: ${section.name}`);
  }
}
// A collapsing support must carry its obstacle and coins with it, and stop
// colliding as a suspended invisible wall once the deck has gone.
for(const character of ['nicolai','trond']){
  const q=new c.yo(1000,42,{districtId:'midtown',character,procedural:true,ambientJetpacks:false});
  const h=q.obstacles.find(o=>o.platformId&&o.label==='SUNK COST'),p=q.platforms.find(p=>p.id===h.platformId);
  q.time=1;p.collapseAt=.5;h.x=q.x-20;p.x=q.x-80;q.y=p.y;q.grounded=false;q.vy=0;
  const coin=q.pickups.find(coin=>coin.platformId===p.id),offset=coin.offsetY;
  q.step(1/120);
  assert.equal(p.active,false);assert.equal(h.active,false);assert.equal(h.base,p.y);assert.equal(coin.y,p.y+offset);
  assert.ok(!q.dead&&!q.qaDamage,'Collapsed deck leaves no invisible prop collision');
}
console.log(`PASS ${report.length} replayed collision-free control witnesses, both routes/runners/districts, two terrain seeds, ledge rewards without power-ups or triple jumps.`);
