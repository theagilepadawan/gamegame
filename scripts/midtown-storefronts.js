/* Midtown venues are architectural details, not independent little buildings.
   Each sign occupies an authored facade bay in the painting's pixel coordinates.
   The original windows, doors, trees and parapets stay in front/behind it at the
   correct depth. The food truck is parked on the far curb with tyre contact. */
(function () {
  "use strict";
  var SOURCE_W = 1672, SOURCE_H = 941;
  var load = function (src) { var image = new Image(); image.src = src; return image; };
  var images = {
    fifth: load("assets/original-12.webp"),
    omars: load("assets/original-13.webp"),
    joju: load("assets/original-14.webp"),
    gussy: load("assets/original-15.webp")
  };
  var ready = function (image) { return image && image.complete && image.naturalWidth > 0; };
  // Clockwise quads follow the painted facade's perspective. Crop coordinates
  // select the venue's actual sign/awning; the beautifully painted doors remain.
  var fixtures = [
    { key: "joju", panel: 0, crop: [0, 0, 132, 52],
      quad: [[378, 670], [428, 669], [428, 689], [378, 690]], kind: "fascia", depth: "brick storefront" },
    { key: "omars", panel: 0, crop: [0, 0, 240, 83],
      quad: [[444, 669], [520, 670], [520, 696], [444, 695]], kind: "awning", depth: "stone storefront" },
    { key: "gussy", panel: 1, crop: [0, 0, 250, 144],
      quad: [[1266, 639.61], [1420, 639.61], [1420, 728.31], [1266, 728.31]],
      kind: "vehicle", contactY: 724, wheels: [1294, 1392], depth: "far curb" },
    { key: "fifth", panel: 2, crop: [8, 8, 258, 45],
      quad: [[508, 607], [575, 612], [575, 625], [508, 620]], kind: "lobby plaque", depth: "glass entrance" }
  ];
  var cache = new Map(), pixi = null;
  var last = { on: false, scroll: 0, W: 1000, H: 540, items: [] };
  function state() { return window.longRun ? longRun.state : "home"; }
  function scene(distance, W, H) {
    if (window.LR_SCENERY) return LR_SCENERY.layout("midtown", distance, W, H, "chapter");
    var height = H + 16, width = height * SOURCE_W / SOURCE_H, stride = width - 64 * height / SOURCE_H;
    return { scroll: Math.max(0, distance) * 0.085, stride: stride, width: width, height: height };
  }
  function polygon(ctx, points) {
    ctx.beginPath(); points.forEach(function (point, index) { index ? ctx.lineTo(point[0], point[1]) : ctx.moveTo(point[0], point[1]); }); ctx.closePath();
  }
  function quadImage(ctx, image, crop, points) {
    var x = crop[0], y = crop[1], w = crop[2], h = crop[3];
    // All four mounts are parallelograms: one affine draw keeps the sign sharp
    // without a diagonal seam from separately antialiased triangles.
    ctx.save(); polygon(ctx, points); ctx.clip();
    ctx.transform((points[1][0] - points[0][0]) / w, (points[1][1] - points[0][1]) / w,
      (points[3][0] - points[0][0]) / h, (points[3][1] - points[0][1]) / h, points[0][0], points[0][1]);
    ctx.drawImage(image, x, y, w, h, 0, 0, w, h); ctx.restore();
  }
  function renderFixture(ctx, fixture) {
    var points = fixture.quad, image = images[fixture.key];
    ctx.save();
    if (fixture.kind === "vehicle") {
      // The wheels touch the same far-curb line in every viewport. The soft
      // footprint is behind the tyres; it cannot float below the truck.
      for (var i = 3; i > 0; i--) {
        ctx.fillStyle = "rgba(19,25,25," + (0.07 + (4 - i) * 0.04) + ")";
        ctx.beginPath(); ctx.ellipse(1343, fixture.contactY + 1.1, 63 + i * 2, 1 + i, 0, 0, Math.PI * 2); ctx.fill();
      }
    } else {
      var shadow = points.map(function (p) { return [p[0] + 0.5, p[1] + 1.8]; });
      polygon(ctx, shadow); ctx.fillStyle = "rgba(15,22,25,.48)"; ctx.fill();
    }
    quadImage(ctx, image, fixture.crop, points);
    // Warm reflected sunset light unifies the supplied venue art with the
    // painting, while retaining the signs' exact names and original textures.
    polygon(ctx, points); ctx.clip(); ctx.globalCompositeOperation = "source-atop";
    ctx.fillStyle = fixture.kind === "vehicle" ? "rgba(255,194,99,.07)" : "rgba(255,196,112,.035)";
    ctx.fillRect(0, 0, SOURCE_W, SOURCE_H);
    ctx.restore();
  }
  function overlay(index) {
    var entries = fixtures.filter(function (fixture) { return fixture.panel === index; });
    if (!entries.every(function (fixture) { return ready(images[fixture.key]); })) return null;
    if (cache.has(index)) return cache.get(index);
    var points = entries.flatMap(function (fixture) { return fixture.quad; });
    var left = Math.floor(Math.min.apply(null, points.map(function (p) { return p[0]; }))) - 4;
    var top = Math.floor(Math.min.apply(null, points.map(function (p) { return p[1]; }))) - 4;
    var right = Math.ceil(Math.max.apply(null, points.map(function (p) { return p[0]; }))) + 4;
    var bottom = Math.ceil(Math.max.apply(null, points.map(function (p) { return p[1]; }))) + 4;
    // These are small, tightly cropped textures, not three mostly transparent
    // full-size paintings. Native-pixel mounts remain exact without wasting VRAM.
    var canvas = document.createElement("canvas"); canvas.width = right - left; canvas.height = bottom - top;
    var ctx = canvas.getContext("2d"); ctx.imageSmoothingEnabled = true; ctx.translate(-left, -top);
    entries.forEach(function (fixture) { renderFixture(ctx, fixture); });
    var result = { canvas: canvas, x: left, y: top, width: canvas.width, height: canvas.height };
    cache.set(index, result); return result;
  }
  function placements(distance, W, H) {
    var layout = scene(distance, W, H), scale = (H + 16) / SOURCE_H;
    return { scene: layout, scale: scale, items: fixtures.map(function (fixture) {
      var left = fixture.panel * layout.stride - layout.scroll;
      var points = fixture.quad.map(function (p) { return [left + p[0] * scale, -8 + p[1] * scale]; });
      var x = points.reduce(function (sum, p) { return sum + p[0]; }, 0) / 4;
      return { key: fixture.key, panel: fixture.panel, tile: fixture.panel, kind: fixture.kind, depth: fixture.depth,
        x: x, width: Math.max.apply(null, points.map(function (p) { return p[0]; })) - Math.min.apply(null, points.map(function (p) { return p[0]; })),
        quad: points, sourceQuad: fixture.quad.map(function (p) { return p.slice(); }), sourceCrop: fixture.crop.slice(),
        contactY: fixture.contactY == null ? null : -8 + fixture.contactY * scale,
        wheelX: fixture.wheels ? fixture.wheels.map(function (x) { return left + x * scale; }) : null,
        visible: points[1][0] > 0 && points[0][0] < W };
    }) };
  }
  function remember(distance, W, H) {
    var result = placements(distance, W, H);
    last = { on: true, scroll: result.scene.scroll, W: W, H: H, items: result.items };
    return result;
  }
  window.LR_SHOPS = {
    pixi: function (env, id, W, H, distance, Sprite, Texture, Rect, Container) {
      var on = id === "midtown" && state() !== "home";
      last.on = on;
      if (!pixi && on) {
        pixi = { root: new Container(), sprites: [], textures: [] };
        env.backgroundLayer.addChild(pixi.root);
      }
      if (!pixi) return;
      pixi.root.visible = on;
      if (!on) return;
      // Keep this architectural decal pass above the painted panels and below
      // gameplay/near foliage, with identical transforms to its painted facade.
      var children = env.backgroundLayer.children;
      if (children[children.length - 1] !== pixi.root) env.backgroundLayer.addChild(pixi.root);
      var result = remember(distance, W, H);
      for (var index = 0; index < 3; index++) {
        var img = overlay(index), sprite = pixi.sprites[index];
        if (!img) { if (sprite) sprite.visible = false; continue; }
        if (!sprite) {
          pixi.textures[index] = Texture.from(img.canvas); sprite = pixi.sprites[index] = new Sprite(pixi.textures[index]);
          pixi.root.addChild(sprite);
        }
        var x = index * result.scene.stride - result.scene.scroll;
        sprite.visible = x < W && x + result.scene.width > 0;
        sprite.position.set(x + img.x * result.scale, -8 + img.y * result.scale); sprite.scale.set(result.scale, result.scale);
      }
    },
    draw2d: function (ctx, id, distance, W, img, tileW, tileH) {
      var on = id === "midtown" && state() !== "home"; last.on = on;
      if (!on) return;
      var H = tileH - 16, result = remember(distance, W, H);
      for (var index = 0; index < 3; index++) {
        var image = overlay(index), x = index * result.scene.stride - result.scene.scroll;
        if (image && x < W && x + result.scene.width > 0) ctx.drawImage(image.canvas,
          x + image.x * result.scale, -8 + image.y * result.scale, image.width * result.scale, image.height * result.scale);
      }
    },
    tick: function (q, W, toast) {
      if (!q || q.districtId !== "midtown" || !last.on || q.__told505 || (q.chapterTime || 0) < 2) return;
      var office = last.items.find(function (item) { return item.key === "fifth"; });
      if (office && office.x > last.W * 0.18 && office.x < last.W * 0.82) {
        q.__told505 = true; if (toast) toast("505 FIFTH AVENUE", "Our New York office. 20th floor.", 2.6);
      }
    },
    layout: function (seed, W, H, distance) { return placements(distance || 0, W || 1000, H || 540).items; },
    inspect: function (distance, W, H) {
      var result = placements(distance || 0, W || 1000, H || 540);
      return { scroll: result.scene.scroll, scale: result.scale, sourceWidth: SOURCE_W, sourceHeight: SOURCE_H,
        ready: Object.keys(images).every(function (key) { return ready(images[key]); }), seededJitter: false, items: result.items };
    }
  };
})();
