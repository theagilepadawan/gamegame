/* Midtown venues belong to complete authored city blocks. This module describes
   their positions. The 505 office is exclusively the foreground chapter exit. */
(function () {
  "use strict";
  var SOURCE_W=1672,SOURCE_H=941,NATIVE_H=941;
  var last={on:false,scroll:0,W:1000,H:540,items:[]};
  function state(){return window.longRun?longRun.state:"home";}
  function placements(distance,W,H) {
    var layout=LR_SCENERY.layout("midtown",distance,W,H,"chapter"),scale=layout.height/SOURCE_H;
    return {scene:layout,scale:scale,items:LR_VENUE_DETAILS.entries("midtown").map(function(fixture){
      var block=layout.blocks.find(p=>p.sourceIndex===fixture.panel),r=fixture.rect;
      var worldLeft=block.worldX,left=worldLeft-layout.scroll;
      var source=[[r[0],r[1]],[r[0]+r[2],r[1]],[r[0]+r[2],r[1]+r[3]],[r[0],r[1]+r[3]]];
      var points=source.map(p=>[left+p[0]*scale,-8+p[1]*scale]);
      return {key:fixture.key,panel:fixture.panel,segment:block.segment,tile:fixture.panel,
        kind:fixture.key==="gussy"?"integrated vehicle":"integrated frontage",depth:"original painted street",
        x:left+(r[0]+r[2]/2)*scale,worldX:worldLeft+(r[0]+r[2]/2)*scale,width:r[2]*scale,height:r[3]*scale,
        quad:points,sourceQuad:source,sourceCrop:r.slice(),cropTop:0,renderMode:"painted",fullArchitecture:true,
        fullGlassEntrance:false, host:null,
        contactY:fixture.key==="gussy"?-8+(r[1]+r[3])*scale:null,
        wheelX:fixture.key==="gussy"?[130,581].map(x=>left+(r[0]+x/680*r[2])*scale):null,
        visible:points[1][0]>0&&points[0][0]<W};
    })};
  }
  function remember(id, distance, W, H, view) {
    var on = id === "midtown" && state() !== "home";
    last.on = on;
    if (!on) return;
    var result = placements(distance, W, H, view);
    last = { on: true, scroll: result.scene.scroll, W: W, H: H, items: result.items };
  }
  window.LR_SHOPS = {
    // The venue pixels already belong to the scenery. Both renderer hooks only
    // update shared metadata, avoiding a second layer over the glass entrance.
    pixi: function (env, id, W, H, distance, Sprite, Texture, Rectangle, Container, view) { remember(id, distance, W, H, view); },
    draw2d: function (ctx, id, distance, W, img, tileW, tileH, view) { remember(id, distance, W, tileH - 16, view); },
    tick: function (q, W, toast) {
      if (!q || q.districtId !== "midtown" || !last.on || q.__told505 || (q.chapterTime || 0) < 2) return;
      var office = window.LR_FINISH?.inspect(q);
      // Only greet at the actual office entrance at the end of the course.
      if (office?.ready && office.hostX > 45 && office.hostX < W - 40) {
        q.__told505 = true;
        if (toast) toast("505 FIFTH AVENUE", "Our New York office. 20th floor.", 2.6);
      }
    },
    layout: function (seed, W, H, distance, view) { return placements(distance || 0, W || 1000, H || 540, view).items; },
    inspect: function (distance, W, H, view) {
      var result = placements(distance || 0, W || 1000, H || 540, view);
      return { scroll: result.scene.scroll, scale: result.scale, sourceWidth: SOURCE_W, sourceHeight: SOURCE_H,
        nativeWidth: 2090, nativeHeight: 1176, renderMode: "painted",
        ready: !!(window.LR_SCENERY && LR_SCENERY.ready), seededJitter: false, items: result.items };
    }
  };
})();
