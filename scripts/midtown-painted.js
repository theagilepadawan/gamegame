/* Restore the original warm Midtown compositions. Lossless masters and a
   1.25x composite retain crisp native venue detail without changing the camera. */
(function () {
  "use strict";
  const WIDTH=1672, HEIGHT=941, FEATHER=64, COMPOSITE_SCALE=1.25;
  const names=["golden-skyline","restaurant-street","bryant-park","fifth-avenue"];
  const images=["assets/midtown-v113/skyline.webp","assets/midtown-v113/restaurant-street.webp",
    "assets/midtown-v113/bryant-park.webp","assets/midtown-v113/fifth-avenue.webp"].map(path=>{
      const image=new Image();image.decoding="async";image.src=path;return image;
    });
  const prepared=new Map();
  const loaded=image=>!!(image.complete&&image.naturalWidth);
  function layout(id,distance,W,H,mode) {
    W=W||1000;H=H||540;
    const height=H+16,width=height*WIDTH/HEIGHT,overlap=height*FEATHER/HEIGHT,stride=width-overlap;
    const endless=(mode||window.longRun?.course?.mode)==="endless";
    // Keep the opening clear on wide phones. A narrow portrait viewport needs
    // a little more horizontal travel to reach the final painted block.
    // There is still only one slow camera plane, never jump-follow or zoom.
    const hold=1200+Math.max(0,W-864)/.14,ease=800;
    const finalFacadeRight=3*stride+614*height/HEIGHT;
    const rate=endless?.14:Math.max(.14,(finalFacadeRight+64-W)/(18880-hold-ease/2));
    const after=Math.max(0,(Number(distance)||0)-hold);
    const eased=after<ease?after*after/(2*ease):after-ease/2,travel=eased*rate;
    const stripWidth=width+stride*3,scroll=endless?travel:Math.min(travel,Math.max(0,stripWidth-W));
    const first=Math.max(0,Math.floor((scroll-width)/stride)+1),last=Math.min(Math.ceil((scroll+W)/stride),endless?Infinity:3);
    const panels=[];
    for(let segment=first;segment<=last;segment++) {
      const sourceIndex=segment<4?segment:1+(segment-4)%3,x=segment*stride-scroll;
      if(x>=W||x+width<=0)continue;
      panels.push({id:"midtown:"+names[sourceIndex],kind:"painting",segment,sourceIndex,
        original:sourceIndex===0,mirrored:false,venues:segment<4,x,y:-8,width,height,
        sourceWidth:WIDTH,sourceHeight:HEIGHT,nativeWidth:Math.round(WIDTH*COMPOSITE_SCALE),nativeHeight:Math.round(HEIGHT*COMPOSITE_SCALE)});
    }
    return {id:"midtown",mode:endless?"endless":"chapter",width,height,stride,overlap,scroll,travel,stripWidth,
      sourceCount:4,panelCount:4,originalIndex:0,loopStart:1,loopSourceIndices:[1,2,3],introHold:hold,
      introEase:ease,parallaxRate:rate,clamped:travel>scroll,streetOffset:0,skylineOffset:0,
      authoredLayers:false,continuousPaintings:true,commonAtmosphere:false,
      blocks:names.map((name,segment)=>({id:"midtown:"+name,segment,sourceIndex:segment,worldX:segment*stride,width})),
      panels,layers:panels};
  }
  function polygon(ctx,points) {ctx.beginPath();points.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.closePath();}
  function front(ctx,entry) {
    const [x,y,w,h]=entry.rect;
    ctx.save();
    if(entry.key==="gussy") {
      // Clip the existing truck pixels, including both full tyres and its sign.
      // The old rectangular park vignette and paving must not become an island.
      ctx.translate(x,y);ctx.scale(w/680,h/338);
      polygon(ctx,[[0,63],[63,63],[66,10],[69,3],[502,3],[508,8],[510,60],[586,62],[598,71],[622,108],[647,178],[653,190],[668,199],[674,224],[677,280],[668,303],[621,309],[606,330],[588,338],[565,337],[543,328],[532,306],[181,307],[168,328],[145,338],[120,337],[96,328],[85,309],[7,306],[0,297]]);
      ctx.clip();ctx.drawImage(entry.image,0,0);ctx.restore();return;
    }
    ctx.filter="brightness(.96) saturate(.94)";
    ctx.drawImage(entry.image,x,y,w,h);ctx.restore();
    // A shallow reveal belongs to the host façade; it is not a separate plinth.
    ctx.save();ctx.strokeStyle="rgba(29,26,21,.55)";ctx.lineWidth=1.2;ctx.strokeRect(x-.5,y-.5,w+1,h+1);ctx.restore();
  }
  function source(id,panel) {
    const image=images[panel.sourceIndex],key=panel.sourceIndex+":"+panel.venues;
    if(!loaded(image)||!LR_VENUE_DETAILS.ready)return null;
    if(prepared.has(key))return prepared.get(key);
    const canvas=document.createElement("canvas");canvas.width=Math.round(WIDTH*COMPOSITE_SCALE);canvas.height=Math.round(HEIGHT*COMPOSITE_SCALE);
    const ctx=canvas.getContext("2d");ctx.imageSmoothingQuality="high";
    ctx.scale(canvas.width/WIDTH,canvas.height/HEIGHT);ctx.drawImage(image,0,0,WIDTH,HEIGHT);
    if(panel.venues)for(const entry of LR_VENUE_DETAILS.entries("midtown").filter(e=>e.panel===panel.sourceIndex))front(ctx,entry);
    if(panel.segment!==0) {
      ctx.globalCompositeOperation="destination-in";
      const fade=ctx.createLinearGradient(0,0,FEATHER,0);fade.addColorStop(0,"transparent");fade.addColorStop(1,"#fff");
      ctx.fillStyle=fade;ctx.fillRect(0,0,WIDTH,HEIGHT);
    }
    prepared.set(key,canvas);return canvas;
  }
  window.NBIMMidtownScenery={images,layout,source,
    get ready(){return images.every(loaded)&&LR_VENUE_DETAILS.ready;},
    inspect(id,distance,W,H,mode){return Object.assign(layout(id,distance,W,H,mode),{
      ready:this.ready,loadedPanels:images.filter(loaded).length,sourceWidth:WIDTH,sourceHeight:HEIGHT,
      compositeWidth:Math.round(WIDTH*COMPOSITE_SCALE),compositeHeight:Math.round(HEIGHT*COMPOSITE_SCALE),
      originalRepeats:false,tailExcludesOriginal:true,mirrored:false});}
  };
})();
