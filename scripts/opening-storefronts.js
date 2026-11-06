/* Detailed Downtown entrances belong to separate complete street paintings.
   This metadata shares the scenery camera; no second sign/door overlay is drawn. */
(function () {
  "use strict";
  var SHOPS = [
    { key: "kabin", panel: 3, rect: [558, 610, 228, 114] },
    { key: "lei", panel: 4, rect: [440, 622, 168, 108] }
  ];
  function spots(distance, W, H, mode) {
    var scene = window.LR_SCENERY && LR_SCENERY.layout("opening", distance || 0, W || 1000, H || 540, mode);
    return SHOPS.map(function (shop) {
      var b = shop.rect, block = scene && scene.blocks.find(function (p) { return p.sourceIndex === shop.panel; });
      var panel = block && { x: block.worldX - scene.scroll, y: 0, width: scene.width, height: scene.height, sourceWidth: 1536, sourceHeight: 1024 };
      var cropTop = 0;
      var box = [b[0], b[1] - cropTop, b[2], b[3]];
      return { key: shop.key, panel: shop.panel, segment: block ? block.segment : null, sourceRect: box, nativeRect: b.slice(), integrated: true,
        fullArchitecture: true, nativeWidth: 1536, nativeHeight: 1024, renderMode: "painted",
        worldX: block ? block.worldX + (b[0] + b[2] / 2) / 1536 * scene.width : null,
        visible: !!panel && panel.x + (box[0] + box[2]) / 1536 * panel.width > 0 && panel.x + box[0] / 1536 * panel.width < (W || 1000), rect: panel ? { x: panel.x + box[0] / panel.sourceWidth * panel.width,
          y: panel.y + box[1] / panel.sourceHeight * panel.height,
          width: box[2] / panel.sourceWidth * panel.width, height: box[3] / panel.sourceHeight * panel.height } : null };
    });
  }
  window.LR_KABIN = { images: [], get ready() { return !!(window.LR_SCENERY && LR_SCENERY.ready); },
    frontage: function (painting) { return painting; }, spots: spots,
    gl: function () {}, draw2d: function () {}, drawScreen: function () {} };
})();
