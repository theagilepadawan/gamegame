/* An occasional, seeded IPO encounter. The street waits while the runner
   reads the price action, then returns at the same position and pace. */
(function () {
  "use strict";
  function random(seed) {
    let state=seed>>>0;
    return () => {state=state+1831565813>>>0;let t=state;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return ((t^t>>>14)>>>0)/4294967296;};
  }
  function plan(width,player,seed,round=1,ground=422) {
    const rng=random(seed), between=(a,b)=>a+(b-a)*rng(), integer=(a,b)=>Math.floor(between(a,b+1));
    const pressure=Math.min(1,Math.max(0,round-1)/4), offset=ground-422;
    const origin={x:Math.max(player+190,width-250),y:238+offset}, left=player-120, span=origin.x-left;
    const point=(u,y)=>({x:origin.x-span*u,y:y+offset,u});
    const names=["GUIDANCE SHOCK","MOMENTUM SPIKE","FOMO FORK","LIQUIDITY WHIPSAW","FLASH REPRICING"];
    const waves=[];let previous=350, warningAt=between(.70,.95);
    for(let n=0;n<3;n++) {
      const candidates=Array.from({length:12},()=>between(190,308)).filter(y=>Math.abs(y-previous)>42&&Math.abs(y-previous)<165);
      const safeY=candidates.length?candidates[integer(0,candidates.length-1)]:(previous>249?202:298);
      const safeHalf=between(82,87)-pressure*4, top=safeY-safeHalf-12, bottom=safeY+safeHalf+12;
      const split=between(.29,.35), joint=point(between(.12,.18),between(218,258));
      const upper=point(split,Math.max(66,top-between(3,15))),lower=point(split,Math.min(430,bottom+between(3,15)));
      const paths=[],add=(id,parentId,color,points)=>paths.push({id,parentId,color,points,radius:4.5,livePoints:[],headPoint:null,active:false});
      add("trunk",null,safeY<250?"up":"down",[point(0,238),point(.065,between(220,252)),joint]);
      add("upper","trunk","up",[joint,point((joint.u+split)/2,Math.min(top,between(130,210))),upper]);
      add("lower","trunk","down",[joint,point((joint.u+split)/2,Math.max(bottom,between(280,370))),lower]);
      for(const [side,start,lo,hi] of [["upper",upper,64,Math.max(70,top)],["lower",lower,Math.min(424,bottom),430]]) {
        const branches=integer(2,pressure>.5?4:3);
        for(let branch=0;branch<branches;branch++) {
          const knots=integer(4,8),points=[start];let y=between(lo,hi);
          for(let k=1;k<=knots;k++) {
            const u=k===knots?1:split+(1-split)*(k+between(-.24,.24))/knots;
            y=Math.max(lo,Math.min(hi,y+between(-.65,.65)*(hi-lo)));
            points.push(point(u,y));
          }
          add(`${side}-${branch}`,side,side==="upper"?"up":"down",points);
        }
      }
      const warning=between(.98,1.16)-pressure*.1, fireAt=warningAt+warning;
      const travelDuration=between(1.36,1.57)-pressure*.12,tailLength=between(.13,.21);
      const clearAt=fireAt+travelDuration*(1+tailLength),name=names.splice(integer(0,names.length-1),1)[0];
      waves.push({index:n+1,attackName:name,cue:safeY<previous?"CLIMB":"DROP",safeY:safeY+offset,safeHalf,origin:{...origin},paths,
        telegraphAt:warningAt,fireAt,travelDuration,tailLength,clearAt,state:"waiting",warning:0,age:0,travel:0,clearAge:0,hit:false});
      previous=safeY;warningAt=clearAt+between(.10,.26);
    }
    return waves;
  }
  function start(q,offer={}) {
    if(q.mode!=="endless"||!q.procedural||q.flight||q.flightLanding>0||q.contrarian||q.transfer||q.dead)return false;
    const ground=q.floorY, count=(q.ipoEncounters||0)+1;
    const seed=(offer.seed??(q.seed^Math.imul(count,2654435761)^0x49504f35))>>>0;
    const saved={};for(const key of ["obstacles","platforms","pickups","springs","markers"])saved[key]=q[key];
    q.endlessIPO={ground,saved,seed,startedAt:q.time};q.ipoEncounters=count;
    q.priceWaves=plan(q.width,q.x,seed,count,ground);q.bossProgress=0;
    q.boss={id:"ipo-hype",name:"IPO HYPE MACHINE",health:3,maxHealth:3,stage:"intro",attackIndex:0,attackName:"",cue:"READ THE CHART",age:0,flash:0,defeatAge:0,telegraph:0,origin:{...q.priceWaves[0].origin},muzzleY:ground-184,muzzleFlash:0};
    q.resetJumpChain();q.flightKind="ipo";q.flightDuration=q.priceWaves.at(-1).clearAt+2.1;
    q.flight=true;q.flightAge=0;q.flightLaunch=.65;q.grounded=false;q.sliding=false;q.slideRecoverAge=-1;q.flipAge=-1;q.support=null;q.buffer=0;q.held=false;q.vy=-210;
    q.emit("jetpack",{kind:"ipo",duration:q.flightDuration});return true;
  }
  function finish(q) {
    const encounter=q.endlessIPO;if(!encounter)return;
    const elapsed=q.time-encounter.startedAt;
    // Freeze suspended street animations as well as its physical position.
    for(const h of encounter.saved.obstacles)if(h.guidance)h.guidance={...h.guidance,phase:h.guidance.phase-elapsed*Math.PI*2/h.guidance.period};
    for(const p of encounter.saved.platforms){if(p.collapseAt)p.collapseAt+=elapsed;if(p.kind==="crane")p.phase-=elapsed*p.frequency;}
    q.endFlight();for(const [key,value] of Object.entries(encounter.saved))q[key]=value;
    q.endlessIPO=null;q.boss=null;q.ipoDefeated=(q.ipoDefeated||0)+1;
  }
  function step(q,dt) {
    if(!q.endlessIPO||q.dead)return;
    const before=q.bodyBox();q.time+=dt;q.ipoElapsed=(q.ipoElapsed||0)+dt;
    q.research=Math.max(0,q.research-dt);q.conviction=Math.max(0,q.conviction-dt);q.invincible=Math.max(0,q.invincible-dt);
    q.stepFlight(dt);q.updateBoss(dt,before,q.bodyBox());
    if(!q.dead&&q.boss?.stage==="defeated"&&q.boss.defeatAge>=2.1)finish(q);
  }
  function resize(q,delta) {
    if(!q.endlessIPO)return;
    // Reframe the same forecast around the player. Keeping its normalized
    // arrival point preserves dodge timing even if the window becomes narrow.
    const previousPlayer=q.x-delta, origin=Math.max(q.x+190,q.width-250);
    const scale=(origin-q.x)/(q.boss.origin.x-previousPlayer);
    const points=new Set();
    for(const wave of q.priceWaves){wave.origin.x=origin;for(const p of wave.paths)for(const pt of [...p.points,...p.livePoints,p.headPoint])if(pt)points.add(pt);}
    for(const pt of points)pt.x=q.x+(pt.x-previousPlayer)*scale;
    q.boss.origin.x=origin;
  }
  window.LR_ENDLESS_IPO={plan,start,step,resize};
})();
