/* Downtown's complete painted streets from the supplied HTML reference.
   Keep sky, buildings, lamps and pavement on the same slow camera. There is
   deliberately no full-screen river underneath detached building cutouts. */
(function () {
  "use strict";
  const WIDTH = 1536, HEIGHT = 1024, FEATHER = 64;
  const names = ["tribeca-approach", "lower-manhattan", "east-river", "south-street-seaport", "battery-waterfront"];
  const paths = [
    "assets/scenery/opening-west.webp",
    "assets/downtown-v112/lower-manhattan.webp",
    "assets/scenery/opening-bridge.webp",
    "assets/scenery/opening-2.webp",
    "assets/scenery/opening-3.webp",
    "assets/scenery/opening-battery-loop.webp"
  ];
  const images = paths.map(path => { const img = new Image(); img.decoding = "async"; img.src = path; return img; });
  const loaded = img => !!(img?.complete && img.naturalWidth);
  const prepared = new Map();
  // Native foreground silhouettes must remain in front of the replacement
  // shop bay. In particular, never leave a lamppost's foot with its stem erased.
  const foreground = {
    3: [
      [[758,580],[766,580],[776,590],[774,611],[769,622],[769,717],[783,734],[783,742],[748,742],[748,734],[760,717],[760,622],[755,612],[752,591]],
      [[606,692],[620,704],[616,711],[616,744],[591,744],[594,711],[590,704]],
      [[778,610],[788,614],[786,629],[802,630],[802,650],[792,657],[802,677],[787,680],[776,694],[765,688],[752,696],[738,688],[745,679],[731,672],[744,655],[740,645],[753,640],[759,625],[775,630]]
    ],
    4: [
      [[477,590],[483,590],[491,602],[486,621],[484,630],[484,721],[494,735],[494,750],[467,750],[466,739],[475,721],[477,630],[472,623],[467,603]],
      [[584,609],[592,613],[594,620],[591,634],[589,643],[590,724],[595,730],[595,746],[581,746],[581,730],[586,724],[585,643],[581,634],[578,620]]
    ]
  };
  function layout(id, distance, W, H, mode) {
    const width = 1120, height = H, overlap = width * FEATHER / WIDTH, stride = width - overlap;
    const total = names.length, stripWidth = width + stride * (total - 1);
    const endless = (mode || window.longRun?.course?.mode) === "endless";
    const compact = window.innerWidth <= 650, heroFraction = compact ? .24 : .35;
    const initialOffset = Math.max(0, stride - (W * heroFraction - width * 200 / WIDTH));
    const hold = compact ? 2400 : 1500, ease = compact ? 2000 : 2400;
    const afterHold = Math.max(0, (Number(distance) || 0) - hold);
    const eased = afterHold < ease ? afterHold * afterHold / (2 * ease) : afterHold - ease / 2;
    const rate = endless ? .145 : Math.max(0, stripWidth - W - initialOffset) / (25920 - hold - ease / 2);
    const travel = initialOffset + eased * rate;
    const scroll = endless ? travel : Math.min(travel, Math.max(0, stripWidth - W));
    const first = Math.max(0, Math.floor((scroll - width) / stride) + 1);
    const last = Math.min(Math.ceil((scroll + W) / stride), endless ? Infinity : total - 1);
    const panels = [];
    for (let index = first; index <= last; index++) {
      const sourceIndex = index < total ? index : 3 + (index - total) % 2;
      const x = index * stride - scroll;
      if (x >= W || x + width <= 0) continue;
      panels.push({id:"opening:" + names[sourceIndex], kind:"painting", segment:index, sourceIndex,
        original:sourceIndex === 1, mirrored:false, variant:endless && sourceIndex === 4 ? "battery-loop" : null,
        venues:index < total, x, y:0, width, height, sourceWidth:WIDTH, sourceHeight:HEIGHT});
    }
    return {id:"opening",mode:endless ? "endless" : "chapter",width,height,overlap,stride,scroll,travel,stripWidth,
      panelCount:total,sourceCount:total,originalIndex:1,loopStart:3,loopSourceIndices:[3,4],initialOffset,
      introHold:hold,introEase:ease,parallaxRate:rate,clamped:scroll < travel,authoredLayers:false,
      blocks:names.map((name,segment)=>({id:"opening:"+name,sourceIndex:segment,segment,worldX:segment*stride,width})),
      panels,layers:panels};
  }
  function source(id, panel) {
    const index = panel.variant === "battery-loop" ? 5 : panel.sourceIndex;
    // Preserve native storefront detail on Retina screens, without enlarging
    // every painting or rebuilding a texture each frame. Its camera is unchanged.
    const detailScale = panel.venues && panel.sourceIndex === 3 ? Math.min(2, window.devicePixelRatio || 1) : 1;
    const img = images[index], key = index + ":" + panel.venues + ":" + detailScale;
    if (!loaded(img) || !window.LR_VENUE_DETAILS?.ready) return null;
    if (prepared.has(key)) return prepared.get(key);
    const canvas = document.createElement("canvas"); canvas.width = WIDTH * detailScale; canvas.height = HEIGHT * detailScale;
    const ctx = canvas.getContext("2d"); ctx.scale(detailScale,detailScale); ctx.drawImage(img,0,0);
    if (panel.venues) {
      LR_VENUE_DETAILS.paint(ctx,"opening",panel.sourceIndex,0);
      for (const outline of foreground[panel.sourceIndex] || []) {
        ctx.save(); ctx.beginPath();
        outline.forEach(([x,y],i)=>i ? ctx.lineTo(x,y) : ctx.moveTo(x,y));
        ctx.closePath(); ctx.clip(); ctx.drawImage(img,0,0); ctx.restore();
      }
    }
    // Same narrow overlap as the actual uploaded street paintings. Cache the
    // native texture; never repaint or scale an intermediate canvas each frame.
    ctx.globalCompositeOperation = "destination-in";
    const edge = ctx.createLinearGradient(0,0,FEATHER,0);
    edge.addColorStop(0,"rgba(0,0,0,0)"); edge.addColorStop(1,"rgba(0,0,0,1)");
    ctx.fillStyle = edge; ctx.fillRect(0,0,WIDTH,HEIGHT);
    prepared.set(key,canvas); return canvas;
  }
  window.NBIMDowntownScenery = {
    images,layout,source,
    get ready() { return images.every(loaded) && !!window.LR_VENUE_DETAILS?.ready; },
    inspect(id,distance,W,H,mode) {
      return Object.assign(layout(id,distance,W || 1000,H || 540,mode),{
        ready:this.ready,loadedPanels:images.filter(loaded).length,maxSourceWidth:WIDTH,nativeHeight:HEIGHT,
        commonAtmosphere:false,continuousPaintings:true,originalRepeats:false,tailExcludesOriginal:true,mirrored:false
      });
    }
  };
})();
