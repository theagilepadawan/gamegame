/* Downtown venues occupy real bays in the opaque Seaport street painting. */
(function () {
  "use strict";
  var fixtures = [
    {key: "kabin", rect: [502, 450, 208, 130]},
    {key: "lei", rect: [1547, 435, 223, 146]}
  ];
  function spots(distance, W, H, mode) {
    W = W || 1000; H = H || 540;
    var scene = LR_SCENERY.layout("opening", distance || 0, W, H, mode);
    var block = scene.blocks[1], scale = scene.artScale, left = block.worldX - scene.scroll;
    return fixtures.map(function (fixture) {
      var r = fixture.rect, x = left + r[0] * scale, y = scene.worldTransform.y + r[1] * scale;
      return {key: fixture.key, panel: 1, segment: 1, sourceRect: r.slice(), nativeRect: r.slice(), integrated: true,
        fullArchitecture: true, nativeWidth: 2172, nativeHeight: 724, renderMode: "painted",
        worldX: block.worldX + (r[0] + r[2] / 2) * scale,
        visible: x + r[2] * scale > 0 && x < W,
        rect: {x: x, y: y, width: r[2] * scale, height: r[3] * scale}};
    });
  }
  window.LR_KABIN = {images: [], get ready() {return !!(window.LR_SCENERY && LR_SCENERY.ready);},
    frontage: function (painting) {return painting;}, spots: spots,
    gl: function () {}, draw2d: function () {}, drawScreen: function () {}};
})();
