/* Midtown venues belong to complete authored city blocks. This module describes
   their positions and keeps the 505 greeting in sync with the scenery camera. */
(function () {
  "use strict";
  var SOURCE_W = 1024, SOURCE_H = 1430, NATIVE_H = 1536;
  var cropTops = [78, 45, 78, 40, 47, 128];
  // Bounds include the full recognizable frontage in native artwork coordinates:
  // doors, glazing, awnings, and the food truck's complete silhouette.
  var fixtures = [
    { key: "joju", panel: 0, rect: [232, 876, 566, 335], kind: "integrated storefront", depth: "brownstone ground floor" },
    { key: "omars", panel: 2, rect: [239, 933, 553, 278], kind: "integrated restaurant", depth: "limestone ground floor" },
    { key: "gussy", panel: 3, rect: [208, 847, 691, 335], kind: "integrated vehicle", depth: "park-side curb", contactY: 1181, wheels: [345, 796] },
    { key: "fifth", panel: 5, rect: [256, 870, 512, 386], kind: "integrated entrance", depth: "complete glass office entrance", fullGlassEntrance: true, officeHost: { x: 782, y: 1265, height: 190 } }
  ];
  var last = { on: false, scroll: 0, W: 1000, H: 540, items: [] };
  function state() { return window.longRun ? longRun.state : "home"; }
  function scene(distance, W, H, view) {
    if (window.LR_SCENERY) return LR_SCENERY.layout("midtown", distance, W, H, "chapter", view);
    var height = H + 16, width = height * SOURCE_W / SOURCE_H;
    return { scroll: Math.max(0, distance) * .085, stride: width, width: width, height: height, cropTops: cropTops };
  }
  function placements(distance, W, H, view) {
    var layout = scene(distance, W, H, view), scale = layout.height / SOURCE_H;
    // Default inspection retains authored geometry. Rendering supplies the
    // same view as the architecture so bounds, tyres and host move together.
    var streetOffset = view && Number.isFinite(view.streetOffset) ? view.streetOffset : 0;
    return { scene: layout, scale: scale, items: fixtures.map(function (fixture) {
      var cropTop = (layout.cropTops || cropTops)[fixture.panel];
      var block = layout.blocks && layout.blocks.find(function (p) { return p.sourceIndex === fixture.panel; });
      var worldLeft = block ? block.worldX : fixture.panel * layout.stride;
      var left = worldLeft - layout.scroll, r = fixture.rect;
      var source = [[r[0], r[1] - cropTop], [r[0] + r[2], r[1] - cropTop],
        [r[0] + r[2], r[1] + r[3] - cropTop], [r[0], r[1] + r[3] - cropTop]];
      var points = source.map(function (p) { return [left + p[0] * scale, -8 + p[1] * scale + streetOffset]; });
      return { key: fixture.key, panel: fixture.panel, segment: block ? block.segment : fixture.panel, tile: fixture.panel, kind: fixture.kind, depth: fixture.depth,
        x: left + (r[0] + r[2] / 2) * scale, worldX: worldLeft + (r[0] + r[2] / 2) * scale,
        width: r[2] * scale, height: r[3] * scale, quad: points, sourceQuad: source, sourceCrop: fixture.rect.slice(),
        cropTop: cropTop, renderMode: "painted", fullArchitecture: true, fullGlassEntrance: !!fixture.fullGlassEntrance,
        host: fixture.officeHost ? { x: left + fixture.officeHost.x * scale, y: -8 + (fixture.officeHost.y - cropTop) * scale + streetOffset, height: fixture.officeHost.height * scale } : null,
        contactY: fixture.contactY == null ? null : -8 + (fixture.contactY - cropTop) * scale + streetOffset,
        wheelX: fixture.wheels ? fixture.wheels.map(function (x) { return left + x * scale; }) : null,
        visible: points[1][0] > 0 && points[0][0] < W };
    }) };
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
        nativeWidth: SOURCE_W, nativeHeight: NATIVE_H, renderMode: "painted",
        ready: !!(window.LR_SCENERY && LR_SCENERY.ready), seededJitter: false, items: result.items };
    }
  };
})();
