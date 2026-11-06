/* Midtown venues belong to complete authored city blocks. This module describes
   their positions and keeps the 505 greeting in sync with the scenery camera. */
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
        fullGlassEntrance:fixture.key==="fifth",
        host:fixture.key==="fifth"?{x:left+657*scale,y:-8+711*scale,height:70*scale}:null,
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
      // A retry or exact camera seek can precede the next renderer update.
      // Use the current run distance so cached late-course metadata cannot
      // announce the office during a fresh Midtown opening.
      var items = placements(q.distance || 0, last.W, last.H).items;
      var office = items.find(function (item) { return item.key === "fifth"; });
      // Announce once the full entrance is visible. On wide displays the finite
      // course can stop before the entrance center reaches the middle of view.
      if (office && office.quad[0][0] >= 20 && office.quad[1][0] <= last.W - 20) {
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
