/* Downtown venues occupy real bays in the opaque Seaport street painting. */
(function () {
  "use strict";
  var fixtures = [
    {key: "kabin", panel: 5, rect: [307, 1068, 410, 205]},
    {key: "lei", panel: 11, rect: [293, 974, 452, 290]}
  ];
  function spots(distance, W, H, mode) {
    W = W || 1000; H = H || 540;
    var scene = LR_SCENERY.layout("opening", distance || 0, W, H, mode);
    return fixtures.map(function (fixture) {
      var block = scene.blocks[fixture.panel], scale = block.nativeScale, left = block.worldX - scene.scroll;
      var r = fixture.rect, x = left + r[0] * scale, y = scene.worldTransform.y + (r[1] + block.nativeOffsetY) * scale;
      return {key: fixture.key, panel: fixture.panel, segment: fixture.panel, sourceRect: r.slice(), nativeRect: r.slice(), integrated: true,
        fullArchitecture: true, nativeWidth: block.nativeWidth, nativeHeight: block.paintedHeight, nativeOffsetY: block.nativeOffsetY, renderMode: "painted",
        worldX: block.worldX + (r[0] + r[2] / 2) * scale,
        visible: x + r[2] * scale > 0 && x < W,
        rect: {x: x, y: y, width: r[2] * scale, height: r[3] * scale}};
    });
  }
  window.LR_KABIN = {images: [], get ready() {return !!(window.LR_SCENERY && LR_SCENERY.ready);},
    frontage: function (painting) {return painting;}, spots: spots,
    gl: function () {}, draw2d: function () {}, drawScreen: function () {}};
})();
