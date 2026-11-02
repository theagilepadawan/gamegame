/* Midtown's local venues follow the authored neighbourhood paintings: the opening
   street, Bryant Park and Fifth Avenue. Each appears once, with a small seeded
   variation inside its own frontage. The 505 office greeting is retained. */
(function () {
  "use strict";
  var RATE = 0.085;                     // the Midtown painting's parallax
  var WALL_Y = 686, KERB = 715, ROAD = 723; // painting rows: parapet overlay top, shop base, truck wheels
  var META = {"omars":{"w":60.0,"h":36.0,"ax":30.0,"ay":34.91},"joju":{"w":33.0,"h":38.5,"ax":16.5,"ay":37.4},"fifth":{"w":68.75,"h":44.0,"ax":34.38,"ay":42.24},"gussy":{"w":62.5,"h":36.0,"ax":31.25,"ay":34.8}};                  // backdrop sprite sizes and anchors, world units
  var load = function (src) { var i = new Image(); i.src = src; return i; };
  var IMG = { fifth: load("assets/original-12.webp"), omars: load("assets/original-13.webp"), joju: load("assets/original-14.webp"), gussy: load("assets/original-15.webp") };
  var WALL = load("assets/original-16.webp");
  var ok = function (i) { return i.complete && i.naturalWidth > 0; };
  // Source-pixel anchors are specific to these three paintings; no mirrored tiles.
  var SLOTS = [
    { key: "omars", tile: 0, x0: 394, x1: 470, base: KERB, wall: true },
    { key: "joju", tile: 1, x0: 258, x1: 314, base: KERB, wall: false },
    { key: "fifth", tile: 2, x0: 454, x1: 520, base: KERB, wall: false },
    { key: "gussy", tile: 1, x0: 1220, x1: 1335, base: ROAD, wall: false }
  ];
  var state = function () { return window.longRun ? window.longRun.state : "home"; };
  var seedNow = function () { return window.longRun && window.longRun.seed || 0; };

  function rng(a) {
    a >>>= 0;
    return function () { a = (a + 0x6D2B79F5) >>> 0; var t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  }
  function worldX(tile, px, tileW, g) { return tile * (tileW - 64 * g) + px * g; }
  var cache = { key: "", items: [] };
  function street(seed, tileW, g) {
    var key = seed + "|" + tileW.toFixed(2);
    if (cache.key !== key) {
      var r = rng((seed ^ 0x9E3779B1) >>> 0);
      cache = { key: key, items: SLOTS.map(function (slot) {
        var px = slot.x0 + r() * (slot.x1 - slot.x0);
        return { key: slot.key, px: px, tile: slot.tile,
          x: worldX(slot.tile, px, tileW, g), base: slot.base, wall: slot.wall };
      }) };
    }
    return cache.items;
  }
  function sceneScroll(dist, W, H) {
    return window.LR_SCENERY ? LR_SCENERY.layout("midtown", dist, W, H).scroll : dist * RATE;
  }
  // the parapet in front of a shop: the painting's own wall pixels, a little wider than the shop
  function wallSpan(it, g) {
    var m = META[it.key], half = m.w / g / 2 + 6;
    var x0 = Math.max(0, Math.floor(it.px - half)), x1 = Math.min(WALL.naturalWidth || 1672, Math.ceil(it.px + half));
    return { x0: x0, w: x1 - x0 };
  }
  function tileOrigin(tile, tileW, scroll) { return { t0: tile * (tileW - 64 * tileW / 1672) - scroll, m: false }; }

  var last = { scroll: 0, W: 960, items: [], on: false };
  var px = null;
  window.LR_SHOPS = {
    // Pixi environment: at the top of drawBackground, every frame
    pixi: function (env, id, W, H, dist, Sprite, Texture, Rect, Container) {
      var on = id === "midtown" && state() !== "home";
      last.on = on;
      if (!px && on) {
        px = { root: new Container(), shops: new Container(), walls: new Container(), trucks: new Container(), pool: { shops: [], walls: [], trucks: [] }, wallTex: null, frames: {}, tex: {} };
        px.root.addChild(px.shops, px.walls, px.trucks);
        env.backgroundLayer.addChild(px.root);
      }
      if (!px) return;
      px.root.visible = on;
      if (!on) return;
      var bg = env.backgroundTextures && env.backgroundTextures.midtown; if (!bg) return;
      var kids = env.backgroundLayer.children;
      if (kids[kids.length - 1] !== px.root) env.backgroundLayer.addChild(px.root);
      var tileH = H + 16, g = tileH / bg.height, tileW = bg.width * g, scroll = sceneScroll(dist, W, H);
      var items = street(seedNow(), tileW, g, scroll, W);
      last.scroll = scroll; last.W = W; last.items = items;
      if (!px.wallTex && ok(WALL)) px.wallTex = Texture.from(WALL);
      var n = { shops: 0, walls: 0, trucks: 0 };
      var get = function (kind, layer) {
        var p = px.pool[kind], s = p[n[kind]];
        if (!s) { s = new Sprite(); p.push(s); layer.addChild(s); }
        n[kind]++; s.visible = true; return s;
      };
      items.forEach(function (it) {
        var m = META[it.key], sx = it.x - scroll;
        if (sx + m.w < -20 || sx - m.w > W + 20 || !ok(IMG[it.key])) return;
        var s = get(it.key === "gussy" ? "trucks" : "shops", it.key === "gussy" ? px.trucks : px.shops);
        if (s.__key !== it.key) { s.texture = px.tex[it.key] || (px.tex[it.key] = Texture.from(IMG[it.key])); s.__key = it.key; }
        s.anchor.set(m.ax / m.w, m.ay / m.h);
        s.position.set(sx, it.base * g - 8); s.width = m.w; s.height = m.h;
        if (it.wall && px.wallTex) {
          var sp = wallSpan(it, g), fk = sp.x0 + ":" + sp.w;
          var tex = px.frames[fk] || (px.frames[fk] = new Texture({ source: px.wallTex.source, frame: new Rect(sp.x0, 0, sp.w, px.wallTex.height) }));
          var o = tileOrigin(it.tile, tileW, scroll), w = get("walls", px.walls);
          w.texture = tex; w.anchor.set(0, 0);
          w.position.set(o.m ? o.t0 + tileW - sp.x0 * g : o.t0 + sp.x0 * g, WALL_Y * g - 8);
          w.scale.set(o.m ? -g : g, g);
        }
      });
      ["shops", "walls", "trucks"].forEach(function (k) { var p = px.pool[k]; for (var i = n[k]; i < p.length; i++) p[i].visible = false; });
    },
    // 2D fallback: inside the district background, right after the painting tiles
    draw2d: function (ctx, id, dist, W, img, tileW, tileH) {
      var on = id === "midtown" && state() !== "home";
      last.on = on;
      if (!on || !img || !img.naturalHeight) return;
      var g = tileH / img.naturalHeight, scroll = sceneScroll(dist, W, tileH - 16);
      var items = street(seedNow(), tileW, g, scroll, W);
      last.scroll = scroll; last.W = W; last.items = items;
      var vis = items.filter(function (it) { var m = META[it.key], sx = it.x - scroll; return sx + m.w > -20 && sx - m.w < W + 20 && ok(IMG[it.key]); });
      var draw = function (it) { var m = META[it.key]; ctx.drawImage(IMG[it.key], it.x - scroll - m.ax, it.base * g - 8 - m.ay, m.w, m.h); };
      vis.forEach(function (it) { if (it.key !== "gussy") draw(it); });
      if (ok(WALL)) vis.forEach(function (it) {
        if (!it.wall) return;
        var sp = wallSpan(it, g), o = tileOrigin(it.tile, tileW, scroll), y = WALL_Y * g - 8, h = WALL.naturalHeight;
        ctx.save();
        if (o.m) { ctx.translate(o.t0 + tileW - sp.x0 * g, 0); ctx.scale(-1, 1); ctx.drawImage(WALL, sp.x0, 0, sp.w, h, 0, y, sp.w * g, h * g); }
        else ctx.drawImage(WALL, sp.x0, 0, sp.w, h, o.t0 + sp.x0 * g, y, sp.w * g, h * g);
        ctx.restore();
      });
      vis.forEach(function (it) { if (it.key === "gussy") draw(it); });
    },
    // gameplay draw: the 505 says hello once, when it is well in view
    tick: function (q, W, toast) {
      if (!q || q.districtId !== "midtown" || !last.on || q.__told505 || (q.chapterTime || 0) < 2) return;
      for (var i = 0; i < last.items.length; i++) {
        var it = last.items[i]; if (it.key !== "fifth") continue;
        var sx = it.x - last.scroll;
        if (sx > last.W * 0.18 && sx < last.W * 0.82) { q.__told505 = true; toast && toast("505 FIFTH AVENUE", "Our New York office. 20th floor.", 2.6); }
        return;
      }
    },
    // for tests: where everything is on this world's street
    layout: function (seed, W) { var g = 556 / 941, tileW = 1672 * g; return street(seed >>> 0, tileW, g, 0, W || 2600).map(function (it) { return { key: it.key, x: Math.round(it.x), tile: it.tile }; }); }
  };
})();
