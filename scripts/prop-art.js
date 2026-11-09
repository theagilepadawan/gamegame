/* Warm, readable props based on the earlier game’s original silhouettes.
   Native painted atlases, registered physical faces and live plaque typography.
   Motion and collision share the simulation; rendering never advances either. */
(function () {
  "use strict";
  const paths = {
    dividend: "assets/props-v18/dividend.webp",
    opportunity: "assets/props-v18/opportunity.webp",
    research: "assets/props-v18/research.webp",
    conviction: "assets/props-v18/conviction.webp",
    opening: "assets/obstacles-v124/downtown.webp",
    midtown: "assets/obstacles-v124/midtown.webp",
    park: "assets/obstacles-v124/park.webp"
  };
  const art = Object.fromEntries(Object.entries(paths).map(([key, path]) => {
    const image = new Image(); image.src = path; return [key, image];
  }));
  const loaded = image => image && image.complete && image.naturalWidth > 0;
  // Rectangles are native pixels, not a regular grid. Keep the painter's
  // silhouettes and extra decorative space without stretching the bodies.
  const registration = {"opening":[{"key":"ledger","source":[28,41,711,441],"body":[38,43,699,437],"plaque":[192,319,379,124],"ink":"dark"},{"key":"valuation","source":[789,35,708,447],"body":[794,39,701,441],"plaque":[960,290,389,91],"ink":"light"},{"key":"market-board","source":[9,527,726,444],"body":[12,582,721,387],"plaque":[105,635,536,108],"ink":"dark","anchors":[[156,551],[594,551]]},{"key":"exchange-clock","source":[765,545,771,422],"body":[770,611,763,354],"plaque":[1080,713,371,163],"ink":"light","anchors":[[903,572],[1398,572]]}],"midtown":[{"key":"invoice-cart","source":[53,7,604,516],"body":[150,54,501,466],"plaque":[177,290,426,98],"ink":"dark"},{"key":"budget-chest","source":[778,45,739,448],"body":[784,170,730,320],"plaque":[893,243,403,76],"ink":"light"},{"key":"forecast-lift","source":[13,566,734,427],"body":[18,643,726,347],"plaque":[194,720,439,133],"ink":"light","anchors":[[149,593],[613,593]]},{"key":"agenda-clock","source":[773,568,749,424],"body":[778,616,742,374],"plaque":[1006,704,452,187],"ink":"light","anchors":[[1046,603],[1433,589]]}],"park":[{"key":"benchmark-bench","source":[18,89,837,435],"body":[48,112,780,410],"plaque":[246,145,391,75],"ink":"dark"},{"key":"bagholder-seat","source":[943,87,553,436],"body":[964,93,529,428],"plaque":[1086,107,270,51],"ink":"dark"},{"key":"autumn-bough","source":[11,617,809,300],"body":[64,752,713,156],"plaque":[249,780,330,63],"ink":"dark"},{"key":"ivy-planter","source":[836,624,693,290],"body":[847,748,679,164],"plaque":[987,801,383,50],"ink":"dark","anchors":[[924,657],[1437,657]]}]};
  function style(item, place) {
    const district = window.LR_HAZARDS?.district(item, place) || place || "opening";
    const index = item.artVariant ?? window.LR_HAZARDS?.variant(item, district) ?? (item.type === "high" ? 2 : 0);
    return {district, sprite: registration[district][index], index};
  }
  function variant(item, place) { return style(item, place).sprite.key; }
  function box(c, x, y, w, h, color, radius = 0) {
    c.fillStyle = color; c.beginPath(); c.roundRect(x, y, w, h, radius); c.fill();
  }
  function line(c, x, y, x2, y2, color, width = 1) {
    c.beginPath(); c.moveTo(x, y); c.lineTo(x2, y2); c.strokeStyle = color; c.lineWidth = width; c.stroke();
  }
  function gradient(c, x, y, w, h, colors) {
    const fill = c.createLinearGradient(x, y, x + w, y + h);
    colors.forEach((color, i) => fill.addColorStop(i / (colors.length - 1), color)); return fill;
  }
  function text(c, label, x, y, size, width, color, weight = 700) {
    c.font = `${weight} ${size}px Arial,sans-serif`;
    const measured = c.measureText(label).width;
    if (measured > width) c.font = `${weight} ${Math.max(3, size * width / measured)}px Arial,sans-serif`;
    c.textAlign = "center"; c.textBaseline = "middle"; c.fillStyle = color; c.fillText(label, x, y, width);
  }
  function bolt(c, x, y, r = 1.5) {
    c.beginPath(); c.arc(x, y, r + .7, 0, Math.PI * 2); c.fillStyle = "#071c26"; c.fill();
    c.beginPath(); c.arc(x, y - .3, r, 0, Math.PI * 2); c.fillStyle = "#d3ba85"; c.fill();
    line(c, x - r * .6, y, x + r * .6, y, "#625b4b", .6);
  }
  function arrow(c, x, y, direction, color, size = 8) {
    c.save(); c.translate(x, y); c.rotate(direction * Math.PI / 4);
    c.beginPath(); c.moveTo(-size, 0); c.lineTo(size, 0); c.moveTo(size * .25, -size * .75);
    c.lineTo(size, 0); c.lineTo(size * .25, size * .75); c.strokeStyle = color;
    c.lineWidth = 2; c.lineCap = "round"; c.lineJoin = "round"; c.stroke(); c.restore();
  }
  function pickup(c, item, offset, time, reduced) {
    const image = art[item.kind];
    if (!loaded(image) || !["dividend", "opportunity", "research", "conviction"].includes(item.kind)) return false;
    const sizes = {dividend: [23, 23], opportunity: [32, 36], research: [49, 50], conviction: [54, 52]};
    const [w, h] = sizes[item.kind], x = item.x + offset;
    const y = item.y + (reduced ? 0 : Math.sin(time * 2.5 + item.x * .003) * 1.5);
    c.save(); c.translate(x, y);
    // Keep the coin visible throughout its turn; there is no change to collection radius.
    if (item.kind === "dividend") c.scale(reduced ? 1 : .55 + .45 * Math.abs(Math.cos(time * 1.7 + item.x * .01)), 1);
    if (item.kind === "research") c.rotate(reduced ? 0 : Math.sin(time * .8) * .025);
    c.drawImage(image, -w / 2, -h / 2, w, h);
    if (!reduced && item.kind !== "dividend") {
      const glint = Math.max(0, Math.sin(time * 1.3 + item.x * .01)) ** 12;
      c.globalAlpha *= glint;
      line(c, -w * .25 - 3, -h * .31, -w * .25 + 3, -h * .31, "#fff7d2", 1);
      line(c, -w * .25, -h * .31 - 3, -w * .25, -h * .31 + 3, "#fff7d2", 1);
    }
    c.restore(); return true;
  }
  function plaque(c, label, x, y, w, h, ink) {
    const color = ink === "dark" ? "#fff0cb" : "#233b41";
    const words = label.split(" ");
    let rows = [label], size = Math.min(12, h * .76);
    c.font = `700 ${size}px Arial,sans-serif`;
    if (c.measureText(label).width > w && words.length > 1 && h >= 14) {
      // Balance words across two lines instead of compressing their width.
      let best = Infinity;
      for (let cut = 1; cut < words.length; cut++) {
        const pair = [words.slice(0,cut).join(" "),words.slice(cut).join(" ")];
        const max = Math.max(...pair.map(t=>c.measureText(t).width));
        if(max<best){best=max;rows=pair;}
      }
      size = Math.min(11.5, h / 2.35);
    }
    c.font = `700 ${size}px Arial,sans-serif`;
    size *= Math.min(1, w / Math.max(...rows.map(t=>c.measureText(t).width)));
    c.font = `700 ${size}px Arial,sans-serif`;
    c.textAlign="center";c.textBaseline="middle";c.fillStyle=color;
    const pitch=size*1.16;
    rows.forEach((row,i)=>c.fillText(row,x+w/2,y+h/2+(i-(rows.length-1)/2)*pitch+.2));
  }
  function support(c,item,x,base,top,place,run,index,sprite) {
    const w=item.w, mount=item.mountBase??item.guidance?.base??base;
    const travel=item.guidance?.travel??0, park=place==="park", bough=park&&index===2;
    const lintel=mount-96-item.h-travel-(bough?34:27);
    const feet=[x+7,x+w-7];
    for(let side=0;side<2;side++) {
      const foot=feet[side];
      const floor=item.platformId?mount:run?.floorAt(item.x+(foot-x))??item.groundEnds?.[side]??mount;
      if(bough) {
        // A bough grows out from one rooted trunk. Its joint flexes with the
        // collision body's motion; it is not propped on a pair of stilts.
        if(side===0)continue;
        const root=foot+9,join=top+item.h*.42;
        c.beginPath();c.moveTo(root-15,floor);c.quadraticCurveTo(root-4,floor-12,root-5,floor-38);
        c.bezierCurveTo(root-10,floor-75,foot+4,join+24,foot-9,join+4);
        c.lineTo(foot+4,join-5);c.bezierCurveTo(foot+21,join+24,root+5,floor-61,root+7,floor-27);
        c.quadraticCurveTo(root+8,floor-9,root+18,floor);c.closePath();
        c.fillStyle=gradient(c,root-15,floor,32,0,["#493e2c","#997147","#624c32"]);c.fill();
        c.strokeStyle="#3e3929";c.lineWidth=1.2;c.stroke();
        for(const dx of [-4,1,5]){
          c.beginPath();c.moveTo(root+dx,floor-5);c.bezierCurveTo(root+dx-4,floor-42,foot+dx+8,join+38,foot+dx-1,join+16);
          c.strokeStyle=dx===1?"#c49a626e":"#443d2b99";c.lineWidth=dx===1?1.8:1;c.stroke();
        }
        c.beginPath();c.ellipse(root+1,floor-42,3,6,-.2,0,Math.PI*2);c.strokeStyle="#51412b";c.lineWidth=1;c.stroke();
        c.fillStyle="#344b2e";c.beginPath();c.ellipse(root,floor+1,18,2,0,0,Math.PI*2);c.fill();
      } else {
        line(c,foot,lintel,foot,floor,park?"#4a5037":"#153640",park?6:5);
        line(c,foot-1,lintel+2,foot-1,floor-2,park?"#bb9e6b":"#b4b897",1.2);
        box(c,foot-6,floor-3,12,3,park?"#45533a":"#385453",1);
        bolt(c,foot,lintel+3,1.5);
      }
    }
    if(!bough) {
      box(c,x+3,lintel-3,w-6,6,park?"#665d3d":"#203e45",2);
      line(c,x+5,lintel-2,x+w-5,lintel-2,park?"#cfac70":"#d9b66f",1);
      const [bx,by,bw,bh]=sprite.body;
      for(const [ax,ay] of sprite.anchors||[]) {
        const hook=x+(ax-bx)*w/bw,eye=top+(ay-by)*item.h/bh;
        line(c,hook,lintel,hook,eye,park?"#c2ae7b":"#9baca2",1.8);
        if(item.guidance)box(c,hook-2.5,eye-5,5,4,park?"#9d8653":"#caab70",1);
      }
    }
  }
  function hazard(c, item, x, base, district, run) {
    if (item.type === "gap") return false;
    const {district:place,sprite,index}=style(item,district),image=art[place];
    if(!loaded(image))return false;
    const high=item.type==="high",w=item.w,h=item.h;
    const [sx,sy,sw,sh]=sprite.source,[bx,by,bw,bh]=sprite.body,[px,py,pw,ph]=sprite.plaque;
    const scaleX=w/bw,scaleY=h/bh;
    c.save();
    if(!high&&item.groundSlope){
      c.translate(x+w/2,base);c.transform(1,item.groundSlope,0,1,0,0);x=-w/2;base=0;
    }
    const top=base-(high?96+h:h);
    if(high)support(c,item,x,base,top,place,run,index,sprite);
    else {
      c.save();c.globalAlpha*=.35;c.fillStyle="#142b28";c.beginPath();
      c.ellipse(x+w/2,base+.5,w*.5,2.2,0,0,Math.PI*2);c.fill();c.restore();
    }
    c.imageSmoothingEnabled=true;c.imageSmoothingQuality="high";
    c.drawImage(image,sx,sy,sw,sh,x+(sx-bx)*scaleX,top+(sy-by)*scaleY,sw*scaleX,sh*scaleY);
    plaque(c,item.label||(high?"HIDDEN RISK":"FEE ON FEES"),x+(px-bx)*scaleX,
      top+(py-by)*scaleY,pw*scaleX,ph*scaleY,sprite.ink);
    c.restore();return true;
  }
  function benchmark(c, x, y, w, h, label = "BENCHMARK") {
    const pw = Math.min(28, w * .31), ph = Math.max(5, h * .105), px = x + w * .53, py = y + h * .22;
    box(c, px - pw / 2, py - ph / 2, pw, ph, "#2a3027", 1);
    box(c, px - pw / 2 + .6, py - ph / 2 + .6, pw - 1.2, ph - 1.2, "#c1a668", .7);
    text(c, label, px, py, 4.2, pw - 3, "#283d35", 700);
  }
  function rest(c,item,run) {
    // A small, set-back seat in the finish approach. It is scenery only:
    // patient holding belongs here, never in the collision vocabulary.
    const w=88,mid=item.x+w/2,base=run.floorAt(mid),slope=(run.floorAt(item.x+w)-run.floorAt(item.x))/w;
    const bench={type:"low",w,h:w*410/780,artDistrict:"park",artVariant:0,label:"SIT & HOLD"};
    c.save();c.translate(mid,base);c.transform(1,slope,0,1,0,0);c.globalAlpha*=.78;
    box(c,-w/2-6,-12,w+12,12,gradient(c,0,-12,0,12,["#b1a783","#68765a"]),1);
    line(c,-w/2-6,-12,w/2+6,-12,"#d3c49a",1);
    hazard(c,bench,-w/2,-12,"park");c.restore();return true;
  }
  function branchPlaque(c, label, x, y, w) {
    if (!label) return;
    const pw = Math.min(72, w * .67), px = x + w * .53, py = y + 40;
    for (const dx of [-pw * .35, pw * .35]) line(c, px + dx, py - 13, px + dx, py - 3, "#c6b98c", 1);
    box(c, px - pw / 2 + 1, py - 6, pw, 14, "#142e2866", 2);
    box(c, px - pw / 2, py - 7, pw, 14, "#a38b57", 2);
    box(c, px - pw / 2 + 1, py - 6, pw - 2, 12, "#294b3b", 1);
    text(c, label, px, py, 7, pw - 8, "#f0dfac");
  }
  function sign(c, item, run, floor, angle) {
    const park = run.districtId === "park", fork = item.role === "fork" || item.route === "fork";
    const rows = fork ? [
      {label: park ? "CANOPY WALK" : "HIGH CONVICTION", sub: "UPPER ROUTE", y: -168, direction: -1, color: "#e9ce91"},
      {label: park ? "LAKESIDE PATH" : "STREET LEVEL", sub: "LOWER ROUTE", y: -124, direction: 0, color: "#b7d5b4"}
    ] : [{label: item.label || (park ? "THE LONG VIEW" : "WORK IN PROGRESS"),
      sub: item.role === "rejoin" ? "ONWARD, TOGETHER" : park ? "LET IT COMPOUND" : "GROWTH TAKES WORK", y: -148, direction: 0, color: "#e9ce91"}];
    c.save(); c.translate(item.x, floor); c.rotate(angle);
    box(c, -5, -5, 10, 5, "#35483d", 1.5);
    box(c, -3, -179, 6, 176, gradient(c, -3, -179, 6, 0, ["#4a604f", "#939c7e", "#3d584d"]), 1.5);
    box(c, -4, -181, 8, 4, "#9b9e7d", 1.3);
    for (const row of rows) {
      const w = fork ? 153 : 145, left = -w / 2, y = row.y, h = 35;
      box(c, left + 1.5, y + 2, w, h, "#10262966", 3);
      box(c, left, y, w, h, gradient(c, left, y, w * .2, h, park ? ["#6c7950", "#4b5d43"] : ["#b1936b", "#6b6653"]), 3);
      box(c, left + 1.2, y + 1.2, w - 2.4, h - 2.4,
        gradient(c, left, y, w * .2, h, park ? ["#395846", "#24483b"] : ["#315563", "#213e49"]), 2);
      line(c, left + 4, y + 2, -left - 4, y + 2, "#efdaa777", .8);
      bolt(c, left + 5, y + h / 2, 1); bolt(c, -left - 5, y + h / 2, 1);
      arrow(c, left + 18, y + h / 2, row.direction, row.color, 5.5);
      text(c, row.label, 10, y + 12.5, 8.6, w - 43, "#f8e8c4");
      text(c, row.sub, 10, y + 24.5, 6.2, w - 43, row.color, 600);
    }
    c.restore(); return true;
  }
  function spring(c, item, offset) {
    const x = item.x + offset, y = item.y, w = item.w;
    c.save();
    box(c, x, y - 13, w, 13, "#244a40", 2.5);
    box(c, x + 1, y - 12, w - 2, 10,
      gradient(c, x, y - 12, 0, 10, ["#73a58b", "#477d68", "#315849"]), 2);
    line(c, x + 1, y - 13, x + w - 1, y - 13, "#c7e8aa", 1.8);
    line(c, x + 2, y - 2, x + w - 2, y - 2, "#183a35", 1.4);
    bolt(c, x + 4.5, y - 6.5, .8); bolt(c, x + w - 4.5, y - 6.5, .8);
    for (let i = 1; i <= 3; i++) {
      const center = x + w * i / 4;
      line(c, center - 3, y - 5, center, y - 8, "#d7ebbd", 1.2);
      line(c, center, y - 8, center + 3, y - 5, "#d7ebbd", 1.2);
    }
    if (!item.used) arrow(c, x + w / 2, y - 26, -2, "#d6e8af", 6.5);
    c.restore(); return true;
  }
  window.LR_PROPS = {images: Object.values(art), get ready() {return Object.values(art).every(loaded);},
    pickup, hazard, sign, spring, benchmark, branchPlaque, rest, variant, registration, version: 1240};
})();
