import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {model} from './endless-fairness.mjs';
const c=model(await fs.readFile('scripts/engine.js','utf8'),await fs.readFile('scripts/endless.js','utf8'),await fs.readFile('scripts/endless-generator.js','utf8'));
const G=c.LR_ENDLESS_GENERATOR,report={tiers:[],grandRuns:0,bonusLandings:0,normalSections:0};
const elements=new Map(),m=id=>{if(!elements.has(id))elements.set(id,{textContent:''});return elements.get(id);};
const music={track:{paused:true,playbackRate:1},tone(){}},toasts=[];
for(let tier=1;tier<=10;tier++){
 const pace=G.tierPace(tier),at=(pace*315-340)/3,previous=G.difficulty(at-.001),now=G.difficulty(at+.001);
 assert.equal(previous.tier,tier-1);assert.equal(now.tier,tier);
 assert.ok(now.pressure>previous.pressure&&now.skillWeight>previous.skillWeight&&now.landingTime<previous.landingTime,'Every pace tier increases course pressure');
 assert.ok(Math.abs(G.speed(at+60)-G.speed(at)-180)<1e-8,'The street keeps accelerating linearly');
 const q=new c.hi(864,tier,{mode:'endless',procedural:true});q.time=at+.001;q.speed=G.speed(q.time);
 c.LR_ENDLESS.hud(q,(...args)=>toasts.push(args),m,music);
 c.LR_ENDLESS.hud(q,(...args)=>toasts.push(args),m,music);
 c.LR_ENDLESS.regimeToast(q,(...args)=>toasts.push(args),{});
 assert.equal(toasts.length,tier,'Exactly one announcement, independent of the old 32-second art/theme clock');
 assert.match(toasts.at(-1)[0],new RegExp(`LEVEL ${tier+1} .* ${pace.toFixed(1).replace('.','\\.')}×`));
 q.time+=25;q.ipoElapsed=25;q.flight=true;
 assert.equal(c.LR_ENDLESS.level(q),tier,'IPO arena time does not advance street difficulty');
 report.tiers.push({tier:tier+1,pace,time:at,actions:now.actions,landingSeconds:now.landingTime,skillWeight:now.skillWeight});
}
const hit=c.hi.prototype.hit;c.hi.prototype.hit=function(cause){this.qaDamage=true;return hit.call(this,cause);};
for(const character of ['nicolai','trond'])for(const width of [540,960])for(const time of [160,240])for(let seed=1;seed<=16;seed++){
 const q=new c.hi(width,seed,{mode:'endless',character,procedural:true,ambientJetpacks:false});
 q.time=time;q.distance=G.distanceAtTime(time);q.nextX=q.x+500;q.autoSpawn=false;q.spawn(44);q.y=q.floorY;
 const row=G.inspect(q).history.at(-1),initial=q.distance,target=initial+q.nextX-q.x;
 const moves=row.actions.map(a=>({at:initial+500+a.offset,type:a.type}));let stage=0,grand=false,bonus=false;
 const jitter=(seed%3-1)*.03;
 for(let tick=0;tick<1500&&!q.dead&&!q.qaDamage&&(q.distance<target||!q.grounded);tick++){
  const action=moves[stage];
  if(action&&q.grounded&&q.distance>=action.at+q.speed*jitter){q.release();q.jump();stage++;}
  q.step(1/120);
  for(const e of q.events)if(e.type==='superjump')grand=true;q.events=[];
  if(q.platforms.some(p=>p.grandBonus&&p.touched))bonus=true;
 }
 assert.ok(!q.dead&&!q.qaDamage&&q.distance>=target&&q.grounded,`Complete compound route ${character}/${width}/${time}/${seed}`);
 assert.ok(grand&&bonus,`Real grounded 1→2→3 chain reaches the upper shelf ${character}/${width}/${time}/${seed}`);
 report.grandRuns++;report.bonusLandings++;
}
for(let seed=1;seed<=32;seed++){
 const q=new c.hi(864,seed,{mode:'endless',procedural:true,ambientJetpacks:false});
 for(let section=0;section<60;section++){
  q.spawn();const row=G.inspect(q).history.at(-1),family=G.families.find(f=>f.id===row.route);
  if(family){assert.ok((family.minTier||0)<=row.tier);assert.equal(row.tier,G.tierAtTime(row.time));}
  report.normalSections++;
  q.distance=row.end-900;q.nextX=q.x+900;q.obstacles=[];q.platforms=[];q.pickups=[];q.springs=[];q.markers=[];
 }
}
await fs.mkdir('review/v127',{recursive:true});await fs.writeFile('review/v127/difficulty-report.json',JSON.stringify(report,null,2));
console.log('PASS '+JSON.stringify(report));
