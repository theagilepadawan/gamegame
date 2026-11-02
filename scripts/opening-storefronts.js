/* Complete downtown entrances are painted into separate native-detail blocks.
   This metadata shares the scenery camera; no second sign/door overlay is drawn. */
(function () {
  "use strict";
  var SHOPS = [
    { key: "kabin", panel: 3, rect: [310, 903, 410, 235] },
    { key: "lei", panel: 8, rect: [288, 836, 444, 344] }
  ];
  function spots(distance, W, H, mode) {
    var scene = window.LR_SCENERY && LR_SCENERY.layout("opening", distance || 0, W || 1000, H || 540, mode);
    return SHOPS.map(function (shop) {
      var b = shop.rect, panel = scene && scene.panels.find(function (p) { return p.sourceIndex === shop.panel; });
      var cropTop = scene ? scene.cropTops[shop.panel] : 57;
      var box = [b[0], b[1] - cropTop, b[2], b[3]];
      return { key: shop.key, panel: shop.panel, sourceRect: box, nativeRect: b.slice(), integrated: true,
        fullArchitecture: true, nativeWidth: 1024, nativeHeight: 1536, renderMode: "painted",
        worldX: scene ? shop.panel * scene.stride + (b[0] + b[2] / 2) / 1024 * scene.width : null,
        visible: !!panel, rect: panel ? { x: panel.x + box[0] / panel.sourceWidth * panel.width,
          y: panel.y + box[1] / panel.sourceHeight * panel.height,
          width: box[2] / panel.sourceWidth * panel.width, height: box[3] / panel.sourceHeight * panel.height } : null };
    });
  }
  window.LR_KABIN = { images: [], get ready() { return !!(window.LR_SCENERY && LR_SCENERY.ready); },
    frontage: function (painting) { return painting; }, spots: spots,
    gl: function () {}, draw2d: function () {}, drawScreen: function () {} };
})();
