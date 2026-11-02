/* Downtown venues belong to real ground-floor bays in the Seaport painting.
   Their source-pixel placements are composed once with the architecture, so
   skyline parallax, camera holds, Canvas, WebGL and the history reveal all use
   exactly the same facade. No independent street-level sprites or giant signs. */
(function () {
  "use strict";
  var load = function (src) { var image = new Image(); image.src = src; return image; };
  var SHOPS = [
    { key: "kabin", image: load("assets/original-10.webp"), panel: 3,
      crop: [40, 102, 750, 606], bay: [813, 610, 130, 105] },
    { key: "lei", image: load("assets/original-11.webp"), panel: 3,
      crop: [38, 77, 704, 640], bay: [1019, 607, 132, 120] }
  ];
  var composed = new WeakMap();
  function ready() { return SHOPS.every(function (shop) { return shop.image.complete && shop.image.naturalWidth; }); }
  function frontage(painting, sourceIndex) {
    if (sourceIndex !== 3 || !ready() || !painting.complete || !painting.naturalWidth) return painting;
    var canvas = composed.get(painting);
    if (canvas) return canvas;
    canvas = document.createElement("canvas");
    canvas.width = painting.naturalWidth; canvas.height = painting.naturalHeight;
    var ctx = canvas.getContext("2d");
    ctx.drawImage(painting, 0, 0);
    SHOPS.forEach(function (shop) {
      var b = shop.bay, c = shop.crop;
      ctx.save();
      // The brick/reveal at each side, the cornice above and the existing
      // threshold below remain part of the original building.
      ctx.beginPath(); ctx.rect(b[0], b[1], b[2], b[3]); ctx.clip();
      ctx.fillStyle = "#121b23"; ctx.fillRect(b[0], b[1], b[2], b[3]);
      ctx.filter = "saturate(.83) brightness(.84)";
      ctx.drawImage(shop.image, c[0], c[1], c[2], c[3], b[0], b[1], b[2], b[3]);
      ctx.filter = "none";
      var recess = ctx.createLinearGradient(b[0], 0, b[0] + b[2], 0);
      recess.addColorStop(0, "rgba(9,15,23,.38)"); recess.addColorStop(.055, "rgba(9,15,23,0)");
      recess.addColorStop(.945, "rgba(9,15,23,0)"); recess.addColorStop(1, "rgba(9,15,23,.38)");
      ctx.fillStyle = recess; ctx.fillRect(b[0], b[1], b[2], b[3]);
      ctx.restore();
    });
    // The existing plane-tree canopy sits in front of the awning's left
    // corner. Restore that small foreground silhouette instead of covering it.
    ctx.save(); ctx.beginPath();
    ctx.moveTo(1017, 607); ctx.lineTo(1040, 607); ctx.lineTo(1039, 615); ctx.lineTo(1030, 621);
    ctx.lineTo(1028, 636); ctx.lineTo(1018, 642); ctx.closePath(); ctx.clip();
    ctx.drawImage(painting, 0, 0); ctx.restore();
    composed.set(painting, canvas);
    return canvas;
  }
  function spots(distance, W, H, mode) {
    var scene = window.LR_SCENERY && LR_SCENERY.layout("opening", distance || 0, W || 1000, H || 540, mode);
    return SHOPS.map(function (shop) {
      var b = shop.bay, panel = scene && scene.panels.find(function (p) { return p.sourceIndex === shop.panel; });
      return { key: shop.key, panel: shop.panel, sourceRect: b.slice(), integrated: true,
        visible: !!panel, rect: panel ? { x: panel.x + b[0] / panel.sourceWidth * panel.width,
          y: b[1] / panel.sourceHeight * panel.height, width: b[2] / panel.sourceWidth * panel.width,
          height: b[3] / panel.sourceHeight * panel.height } : null };
    });
  }
  window.LR_KABIN = { images: SHOPS.map(function (s) { return s.image; }), get ready() { return ready(); },
    frontage: frontage, spots: spots,
    // Retained hooks for the bundled city/reveal code; frontage is already in
    // the panel texture, so a second overlay must never be painted here.
    gl: function () {}, draw2d: function () {}, drawScreen: function () {} };
})();
