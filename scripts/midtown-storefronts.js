/* Original Midtown paintings stay on their approved slow camera. The four
   detailed venues are occasional street-side landmarks, with fixed pavement
   anchors and long ordinary stretches between them. No jump-driven movement. */
(function () {
  "use strict";
  var SOURCE_W = 1024, NATIVE_H = 1536;
  var fixtures = [
    { key: "joju", panel: 0, rect: [232, 876, 566, 335], scale: .22, foot: 1253, kind: "brownstone storefront", depth: "street-side", file: "assets/art-v2/midtown-joju.webp" },
    { key: "omars", panel: 2, rect: [239, 933, 553, 278], scale: .22, foot: 1260, kind: "restaurant frontage", depth: "street-side", file: "assets/art-v2/midtown-omars.webp" },
    { key: "gussy", panel: 3, rect: [208, 847, 691, 335], scale: .25, foot: 1213, kind: "park-side food truck", depth: "curb", contactY: 1181, wheels: [345, 796], file: "assets/art-v2/midtown-gussy.webp" },
    { key: "fifth", panel: 5, rect: [256, 870, 512, 386], scale: .35, foot: 1298, kind: "glass office entrance", depth: "street-side", fullGlassEntrance: true, officeHost: { x: 782, y: 1265, height: 190 }, file: "assets/art-v2/midtown-fifth.webp" }
  ];
  var images = fixtures.map(function (fixture) { var img = new Image(); img.decoding = "async"; img.src = fixture.file; return img; });
  var loaded = function (img) { return img.complete && img.naturalWidth > 0; };
  var truckCutout = null;
  function source(key) {
    var index = typeof key === "number" ? key : fixtures.findIndex(function (fixture) { return fixture.key === key; });
    var img = images[index];
    if (!img || !loaded(img)) return null;
    if (index !== 2) return img;
    if (truckCutout) return truckCutout;
    // Extract the vehicle silhouette from its native atlas. Its old library
    // vignette must not duplicate NYPL already present in the restored painting.
    var canvas = document.createElement("canvas"); canvas.width = SOURCE_W; canvas.height = NATIVE_H;
    var ctx = canvas.getContext("2d");
    ctx.save(); ctx.beginPath();
    ctx.moveTo(283, 850); ctx.lineTo(719, 850); ctx.quadraticCurveTo(725, 850, 725, 858);
    ctx.lineTo(725, 913); ctx.lineTo(810, 913); ctx.lineTo(828, 928); ctx.lineTo(841, 992);
    ctx.lineTo(854, 1018); ctx.lineTo(882, 1038); ctx.quadraticCurveTo(892, 1046, 894, 1064);
    ctx.lineTo(895, 1142); ctx.lineTo(873, 1158);
    ctx.bezierCurveTo(863, 1194, 774, 1195, 758, 1157);
    ctx.lineTo(390, 1157); ctx.bezierCurveTo(372, 1199, 308, 1191, 300, 1154);
    ctx.lineTo(215, 1154); ctx.lineTo(215, 926); ctx.quadraticCurveTo(215, 914, 229, 914);
    ctx.lineTo(283, 914); ctx.closePath(); ctx.clip(); ctx.drawImage(img, 0, 0); ctx.restore();
    // Original complete stone curb, including its alpha edge, grounds the tyres.
    ctx.drawImage(img, 0, 1183, SOURCE_W, 33, 0, 1183, SOURCE_W, 33);
    truckCutout = canvas; return canvas;
  }
  var last = { on: false, scroll: 0, W: 1000, H: 540, items: [] };
  var states = new WeakMap();
  function state() { return window.longRun ? longRun.state : "home"; }
  function placements(distance, W, H) {
    var factor = (H + 16) / 556;
    // The backdrop always travels at .085. Only these occasional, small street
    // objects use a nearer plane, at constant velocity; no zoom or vertical pan.
    // Responsive spacing gives each venue its own moment, including on phones.
    var interval = 11.5, speed = (W + SOURCE_W * .35 * factor + 56) / interval;
    var rate = speed / 320, scroll = Math.max(0, distance) * rate;
    var pavement = -8 + (H + 16) * 723 / 941;
    return { scene: { scroll: scroll, parallaxRate: rate }, scale: factor, items: fixtures.map(function (fixture, index) {
      var scale = fixture.scale * factor, worldLeft = W + speed * (15 + index * interval);
      var left = worldLeft - scroll, top = pavement - fixture.foot * scale, r = fixture.rect;
      var points = [[r[0],r[1]], [r[0]+r[2],r[1]], [r[0]+r[2],r[1]+r[3]], [r[0],r[1]+r[3]]].map(function (p) { return [left+p[0]*scale,top+p[1]*scale]; });
      return { key: fixture.key, panel: fixture.panel, segment: index, tile: fixture.panel, kind: fixture.kind, depth: fixture.depth,
        x: left+(r[0]+r[2]/2)*scale, worldX: worldLeft+(r[0]+r[2]/2)*scale,
        width: r[2]*scale, height: r[3]*scale, quad: points, sourceCrop: r.slice(), scale: scale,
        art: { x: left, y: top, width: SOURCE_W*scale, height: NATIVE_H*scale, footY: pavement },
        renderMode: "native-overlay", fullArchitecture: true, fullGlassEntrance: !!fixture.fullGlassEntrance,
        host: fixture.officeHost ? { x: left+fixture.officeHost.x*scale, y: top+fixture.officeHost.y*scale, height: fixture.officeHost.height*scale } : null,
        contactY: fixture.contactY == null ? null : top+fixture.contactY*scale,
        wheelX: fixture.wheels ? fixture.wheels.map(function (x) { return left+x*scale; }) : null,
        visible: points[1][0]>0 && points[0][0]<W,
        artVisible: left+SOURCE_W*scale>0 && left<W };
    }) };
  }
  function remember(id, distance, W, H) {
    var on = id === "midtown" && state() !== "home";
    last.on = on;
    if (!on) return null;
    var result = placements(distance, W, H);
    last = { on: true, scroll: result.scene.scroll, W: W, H: H, items: result.items };
    return result;
  }
  window.LR_SHOPS = {
    images: images,
    source: source,
    get ready() { return images.every(loaded); },
    pixi: function (env, id, W, H, distance, Sprite, Texture, Rectangle, Container) {
      var result = remember(id, distance, W, H), entry = states.get(env);
      if (!entry && result) {
        entry = { root: new Container(), sprites: [] }; states.set(env, entry);
        env.backgroundLayer.addChild(entry.root);
      }
      if (!entry) return;
      entry.root.visible = !!result;
      if (!result) return;
      env.backgroundLayer.addChild(entry.root);
      result.items.forEach(function (item, index) {
        var sprite = entry.sprites[index];
        if (!loaded(images[index])) return;
        if (!sprite) { sprite = entry.sprites[index] = new Sprite(Texture.from(source(index))); entry.root.addChild(sprite); }
        sprite.visible = item.artVisible;
        if (sprite.visible) { sprite.position.set(item.art.x, item.art.y); sprite.scale.set(item.scale); }
      });
    },
    draw2d: function (ctx, id, distance, W, img, tileW, tileH) {
      var result = remember(id, distance, W, tileH - 16);
      if (!result) return;
      result.items.forEach(function (item, index) {
        if (item.artVisible && loaded(images[index])) ctx.drawImage(source(index),item.art.x,item.art.y,item.art.width,item.art.height);
      });
    },
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
      return { scroll: result.scene.scroll, scale: result.scale, sourceWidth: SOURCE_W, sourceHeight: NATIVE_H,
        nativeWidth: SOURCE_W, nativeHeight: NATIVE_H, renderMode: "native-overlay",
        ready: images.every(loaded), seededJitter: false, items: result.items };
    }
  };
})();
