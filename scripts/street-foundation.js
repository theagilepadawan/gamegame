/* Dry masonry from the approved v1.6 city terrain. It is a world-space
   material, clipped to actual solid banks, never a second background plane. */
(function () {
  "use strict";
  var image = new Image(), patterns = new WeakMap();
  image.decoding = "async";
  image.src = "assets/street-foundation-v20/stone-foundation.webp";

  function ready() { return image.complete && image.naturalWidth > 0; }
  function draw2d(ctx, options) {
    var opts = options || {}, district = opts.district;
    if ((district !== "opening" && district !== "midtown") || !ready()) return false;
    var W = Number(opts.W), floorAt = opts.floorAt;
    if (!(W > 0) || typeof floorAt !== "function") return false;
    var pattern = patterns.get(ctx);
    if (!pattern) {
      pattern = ctx.createPattern(image, "repeat");
      if (!pattern || !pattern.setTransform) return false;
      patterns.set(ctx, pattern);
    }
    // Reuse the engine's exact bank vertices when available; the same clipped
    // intervals keep an Endless gap completely open through the material.
    var solids = opts.solids || opts.gaps && opts.gaps.solids || [[-48, W + 48]];
    var banks = opts.banks || solids.map(function (interval) {
      var left = interval[0], right = interval[1], points = [[left, floorAt(left)]];
      for (var x = left + 16; x < right; x += 16) points.push([x, floorAt(x)]);
      points.push([right, floorAt(right)]);
      return points;
    });
    var top = Infinity, bottom = -Infinity;
    banks.forEach(function (bank) { bank.forEach(function (point) {
      if (Number.isFinite(point[1])) { top = Math.min(top, point[1]); bottom = Math.max(bottom, point[1]); }
    }); });
    if (!Number.isFinite(top)) return false;
    bottom = Number.isFinite(opts.bottom) ? opts.bottom : bottom + 800;
    var terrain = new Path2D();
    banks.forEach(function (bank) {
      if (bank.length < 2 || bank.some(function (point) { return !Number.isFinite(point[0]) || !Number.isFinite(point[1]); })) return;
      terrain.moveTo(bank[0][0], bottom);
      bank.forEach(function (point) { terrain.lineTo(point[0], point[1]); });
      terrain.lineTo(bank[bank.length - 1][0], bottom); terrain.closePath();
    });
    var distance = Number(opts.distance == null ? opts.scroll : opts.distance) || 0;
    var tileSize = 320, scale = tileSize / image.naturalWidth;
    var offset = (distance % tileSize + tileSize) % tileSize;
    pattern.setTransform(new DOMMatrix([scale, 0, 0, scale, -offset, 0]));
    ctx.save();
    ctx.clip(terrain);
    ctx.fillStyle = pattern; ctx.fillRect(-48, top, W + 96, bottom - top);
    var shade = ctx.createLinearGradient(0, top, 0, top + 390);
    shade.addColorStop(0, "#29251e26"); shade.addColorStop(.09, "#29251e4d");
    shade.addColorStop(.6, "#1b1b19a8"); shade.addColorStop(1, "#171918d9");
    ctx.fillStyle = shade; ctx.fillRect(-48, top, W + 96, bottom - top);
    ctx.restore();
    return true;
  }
  window.LR_STREET_FOUNDATION = {
    image: image, images: [image], draw2d: draw2d,
    get ready() { return ready(); },
    inspect: function () { return { ready: ready(), nativeWidth: image.naturalWidth, nativeHeight: image.naturalHeight,
      repeatUnits: 320, reference: "a551054 / v1.6.0", districts: ["opening", "midtown"] }; }
  };
})();
