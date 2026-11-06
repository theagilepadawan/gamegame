/* Venue details are painted into the same continuous Midtown street. This
   module supplies native facade anchors and the office greeting, never sprites. */
(function () {
  "use strict";
  var fixtures = [
    {key: "joju", panel: 5, rect: [245, 882, 525, 326], kind: "integrated storefront"},
    {key: "omars", panel: 8, rect: [246, 940, 529, 268], kind: "integrated restaurant"},
    {key: "gussy", panel: 11, rect: [215, 846, 680, 338], kind: "integrated food truck", contactY: 1184, wheels: [344, 796]},
    {key: "fifth", panel: 14, rect: [257, 870, 511, 390], kind: "integrated glass entrance", fullGlassEntrance: true,
      officeHost: {x: 789, y: 1265, height: 190}}
  ];
  var last = {on: false, W: 1000, H: 540};
  function placements(distance, W, H) {
    var scene = LR_SCENERY.layout("midtown", distance, W, H, "chapter");
    return {scene: scene, scale: scene.artScale, items: fixtures.map(function (fixture) {
      var block = scene.blocks[fixture.panel], scale = block.nativeScale, origin = block.worldX - scene.scroll;
      var top = scene.worldTransform.y + block.nativeOffsetY * scale;
      var r = fixture.rect, x = origin + r[0] * scale, y = top + r[1] * scale, width = r[2] * scale, height = r[3] * scale;
      return {key: fixture.key, panel: fixture.panel, segment: fixture.panel, tile: fixture.panel, kind: fixture.kind, depth: "continuous painted street",
        x: x + width / 2, worldX: block.worldX + (r[0] + r[2] / 2) * scale,
        width: width, height: height, rect: {x: x, y: y, width: width, height: height},
        quad: [[x, y], [x + width, y], [x + width, y + height], [x, y + height]], sourceCrop: r.slice(), scale: scale, nativeOffsetY: block.nativeOffsetY,
        nativeWidth: block.nativeWidth, nativeHeight: block.paintedHeight,
        renderMode: "painted", integrated: true, fullArchitecture: true, fullGlassEntrance: !!fixture.fullGlassEntrance,
        host: fixture.officeHost ? {x: origin + fixture.officeHost.x * scale, y: top + fixture.officeHost.y * scale, height: fixture.officeHost.height * scale} : null,
        contactY: fixture.contactY == null ? null : top + fixture.contactY * scale,
        wheelX: fixture.wheels ? fixture.wheels.map(function (px) {return origin + px * scale;}) : null,
        visible: x + width > 0 && x < W};
    })};
  }
  function remember(id, distance, W, H) {
    last = {on: id === "midtown" && (!window.longRun || longRun.state !== "home"), W: W, H: H};
  }
  window.LR_SHOPS = {
    images: [], get ready() {return !!(window.LR_SCENERY && LR_SCENERY.ready);},
    pixi: function (env, id, W, H, distance) {remember(id, distance, W, H);},
    draw2d: function (ctx, id, distance, W, image, tileW, tileH) {remember(id, distance, W, tileH - 16);},
    tick: function (run, W, toast) {
      if (!run || run.districtId !== "midtown" || !last.on || run.__told505 || (run.chapterTime || 0) < 2) return;
      var office = placements(run.distance || 0, last.W, last.H).items[3];
      if (office.quad[0][0] >= 20 && office.quad[1][0] <= last.W - 20) {
        run.__told505 = true;
        if (toast) toast("505 FIFTH AVENUE", "Our New York office. 20th floor.", 2.6);
      }
    },
    layout: function (seed, W, H, distance) {return placements(distance || 0, W || 1000, H || 540).items;},
    inspect: function (distance, W, H) {
      var result = placements(distance || 0, W || 1000, H || 540);
      return {scroll: result.scene.scroll, scale: result.scale, sourceWidth: 1024, sourceHeight: 1536,
        nativeWidth: 1024, nativeHeight: 1536, renderMode: "painted", ready: LR_SCENERY.ready, seededJitter: false, items: result.items};
    }
  };
})();
