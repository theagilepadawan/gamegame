/* Venue details are painted into the same continuous Midtown street. This
   module supplies native facade anchors and the office greeting, never sprites. */
(function () {
  "use strict";
  var fixtures = [
    {key: "joju", rect: [324, 477, 245, 130], kind: "integrated storefront"},
    {key: "omars", rect: [740, 473, 279, 134], kind: "integrated restaurant"},
    {key: "gussy", rect: [1153, 472, 316, 140], kind: "integrated food truck", contactY: 611, wheels: [1215, 1417]},
    {key: "fifth", rect: [1728, 408, 258, 199], kind: "integrated glass entrance", fullGlassEntrance: true,
      officeHost: {x: 2010, y: 609, height: 98}}
  ];
  var last = {on: false, W: 1000, H: 540};
  function placements(distance, W, H) {
    var scene = LR_SCENERY.layout("midtown", distance, W, H, "chapter");
    var block = scene.blocks[1], scale = scene.artScale, origin = block.worldX - scene.scroll, top = scene.worldTransform.y;
    return {scene: scene, scale: scale, items: fixtures.map(function (fixture) {
      var r = fixture.rect, x = origin + r[0] * scale, y = top + r[1] * scale, width = r[2] * scale, height = r[3] * scale;
      return {key: fixture.key, panel: 1, segment: 1, tile: 1, kind: fixture.kind, depth: "continuous painted street",
        x: x + width / 2, worldX: block.worldX + (r[0] + r[2] / 2) * scale,
        width: width, height: height, rect: {x: x, y: y, width: width, height: height},
        quad: [[x, y], [x + width, y], [x + width, y + height], [x, y + height]], sourceCrop: r.slice(), scale: scale,
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
      return {scroll: result.scene.scroll, scale: result.scale, sourceWidth: 2172, sourceHeight: 724,
        nativeWidth: 2172, nativeHeight: 724, renderMode: "painted", ready: LR_SCENERY.ready, seededJitter: false, items: result.items};
    }
  };
})();
