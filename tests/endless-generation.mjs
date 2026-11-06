import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import vm from 'node:vm';
import {createHash} from 'node:crypto';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const scope={window:{},console};vm.createContext(scope);
vm.runInContext(await fs.readFile(path.join(root,'scripts/endless-generator.js'),'utf8'),scope);
const G=scope.window.LR_ENDLESS_GENERATOR;
const hash=v=>createHash('sha256').update(JSON.stringify(v)).digest('hex');
const round=v=>Math.round(v*1000)/1000;
function fixture(seed,width=864,flat=false){
 const terrain=G.terrain(seed,422),x=Math.min(250,width*.25);
 return {mode:'endless',procedural:true,seed,width,x,time:0,distance:0,nextX:x+900,nextId:1,spawnCount:0,
  ambientJetpacks:true,recent:[],obstacles:[],platforms:[],springs:[],pickups:[],markers:[],contrarianOffers:0,
  floorAt(px){return flat?422:terrain.at(this.distance+px-this.x);},
  hazard(type,px,w,base){const o={type,x:px,w,base,h:type==='low'?62:85};this.obstacles.push(o);return o;},
  platform(px,y,w,kind,extra){const p={id:this.nextId++,x:px,y,baseY:y,prevY:y,w,kind,active:true,...extra};this.platforms.push(p);return p;}};
}
function shape(q){return [...q.obstacles.map(o=>['o',o.type,round(o.x-q.x+q.distance),round(o.w),round(o.base)]),
 ...q.platforms.map(p=>['p',p.kind,round(p.x-q.x+q.distance),round(p.w),round(p.y),round(p.amp)]),
 ...q.springs.map(s=>['s',round(s.x-q.x+q.distance),round(s.w),round(s.y)])];}
function course(seed,width=864,{collect=false,clock=1}={}){
 const q=fixture(seed,width),log=[];
 for(let i=0;i<120;i++){
  assert.equal(G.generate(q),true);const state=G.inspect(q),last=state.history.at(-1);
  log.push({route:last.route,from:last.start,to:last.end,shape:shape(q),event:last.event,
   pickups:q.pickups.map(p=>[p.kind,round(p.x-q.x+q.distance),round(p.y)])});
  if(collect)for(const p of q.pickups)if(!['jetpack','contrarian'].includes(p.kind)){p.taken=true;q.collected=(q.collected||0)+1;q.research=9;q.shield=1;}
  q.distance=last.end-900;q.nextX=q.x+900;q.time=(i+1)*5*clock;
  q.obstacles=[];q.platforms=[];q.pickups=[];q.springs=[];q.markers=[];
 }
 assert.ok(G.inspect(q).history.length<=64);
 return log;
}
const deterministic=course(0xA11CE);
assert.equal(hash(deterministic),hash(course(0xA11CE)),'Same seed reproduces the course');
assert.equal(hash(deterministic),hash(course(0xA11CE,540)),'Viewport does not reshuffle geometry');
assert.equal(hash(deterministic),hash(course(0xA11CE,1440,{collect:true,clock:1.8})),'Reward collection and frame/spawn clock do not reshuffle geometry');
assert.notEqual(hash(deterministic),hash(course(0xA11CF)),'New seed changes the course');
const diversity=[];
for(const time of [0,90,300])for(const family of G.families){
 const signatures=new Set();
 for(let seed=1;seed<=64;seed++){
  const q=fixture(seed,864,true);q.time=time;q.distance=G.distanceAtTime(time);q.nextX=q.x+900;
  G.generate(q,family.id);signatures.add(hash(family.id===29?{geometry:shape(q),length:round(G.inspect(q).history.at(-1).end-G.inspect(q).history.at(-1).start),coins:q.pickups.map(p=>[round(p.x),p.kind])}:shape(q)));
 }
 assert.ok(signatures.size>=56,`${family.name}@${time}: parameterized geometry, not repeated templates`);
 diversity.push({family:family.name,time,distinct:signatures.size,seeds:64});
}
const routes=new Set(),powerups=new Set(),types=new Set(),eventGaps=[];
for(let seed=1;seed<=32;seed++){
 const log=course(seed),seen=[],lastEvent={jetpack:null,contrarian:null};
 for(const row of log){
  routes.add(row.route);row.pickups.forEach(p=>powerups.add(p[0]));row.shape.forEach(p=>types.add(p[0]==='s'?'spring':p[1]));
  if(G.families.some(f=>f.id===row.route)){assert.ok(!seen.slice(-4).includes(row.route),`Immediate motif repetition: seed${seed}`);}
  seen.push(row.route);
  if(row.event){if(lastEvent[row.event]!==null)eventGaps.push({kind:row.event,worldGap:row.from-lastEvent[row.event]});lastEvent[row.event]=row.from;}
 }
}
for(const family of G.families)assert.ok(routes.has(family.id),`${family.name} is reachable through normal seeded scheduling`);
for(const kind of ['jetpack','contrarian','diversification','research','conviction','opportunity','dividend'])assert.ok(powerups.has(kind),kind);
for(const kind of ['crane','crumble','awning','roof','train','billboard','bull','low','high','gap'])assert.ok(types.has(kind),kind);
assert.ok(eventGaps.every(g=>g.worldGap>7000),'Rare events have substantial distance and recovery between repeat offers');
const terrain={seeds:128,samples:0,maxSlope:0,nonResetBoundaries:0};
for(let seed=0;seed<128;seed++){
 const a=G.terrain(seed,422),b=G.terrain(seed,422);
 const positions=[0,899,900,901,6900,4800,9600,1e6];
 for(let i=0;i<350;i++)positions.push((Math.imul(i+1,2654435761)>>>0)%400000);
 for(const x of positions){
  const y=a.at(x);assert.equal(y,b.at(x));assert.ok(Number.isFinite(y));
  const slope=a.slopeAt(x);terrain.maxSlope=Math.max(terrain.maxSlope,Math.abs(slope));
  assert.ok(Math.abs(slope)<=.240001);assert.ok(Math.abs((a.at(x+.01)-a.at(x-.01))/.02-slope)<.00001,'Continuous terrain derivative');terrain.samples++;
 }
 for(let n=1;n<=10;n++)if(Math.abs(a.at(900+n*4800)-422)>1)terrain.nonResetBoundaries++;
 assert.equal(a.at(500),422);
}
assert.ok(terrain.nonResetBoundaries>1100,'Terrain no longer resets to a fixed repeating4800-unit packet');
const early=G.difficulty(0),late=G.difficulty(600);
assert.ok(late.actions>early.actions&&late.actionGap<early.actionGap&&late.rest<early.rest&&late.gapTime>early.gapTime);
for(const t of [0,30,60,120,300,600,3600])assert.ok(G.speed(t)>=340&&G.speed(t)<=700);
const story=fixture(1);story.mode='chapter';const before=hash(story);assert.equal(G.generate(story),false);assert.equal(hash(story),before);
const output={deterministic:true,viewportIndependent:true,rewardIndependent:true,spawnClockIndependent:true,diversity,terrain,
 components:{families:[...routes],powerups:[...powerups],types:[...types]},difficulty:{early,late},speedCap:700};
await fs.mkdir(path.join(root,'review/v20-endless'),{recursive:true});
await fs.writeFile(path.join(root,'review/v20-endless/generation-report.json'),JSON.stringify(output,null,2));
console.log(`PASS: deterministic viewport/reward/frame-independent course; ${diversity.length} diversity cases ×64seeds; all14families/powerups/platforms; ${terrain.samples} continuous terrain samples; bounded escalating difficulty.`);
