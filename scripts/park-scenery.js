/* Approved Central Park paintings and camera from 156db816f0a43420b87864f5c61fde7878344035.
   Keep the original Bow Bridge, Ramble and Bethesda composition unchanged. */
(function () {
  "use strict";
  var FEATHER = 64, WIDTH = 1672, HEIGHT = 941, RATE = 0.085;
  var names = ["bow-bridge", "the-ramble", "bethesda-terrace"];
  var prepared = new WeakMap(), originalImage = null;
  var loaded = function (img) { return !!(img && (img.complete && img.naturalWidth || img.getContext && img.width && img.height)); };
  var images = ["assets/scenery/park-1.webp", "assets/scenery/park-2.webp"].map(function (path) {
    var img = new Image();
    img.decoding = "async";
    img.addEventListener("load", function () { prepare(img); });
    img.src = path;
    return img;
  });
  function prepare(img) {
    if (!loaded(img)) return null;
    var canvas = prepared.get(img);
    if (canvas) return canvas;
    canvas = document.createElement("canvas");
    canvas.width = img.naturalWidth || img.width;
    canvas.height = img.naturalHeight || img.height;
    var c = canvas.getContext("2d");
    c.drawImage(img, 0, 0);
    c.globalCompositeOperation = "destination-in";
    var edge = c.createLinearGradient(0, 0, FEATHER, 0);
    edge.addColorStop(0, "rgba(0,0,0,0)");
    edge.addColorStop(1, "rgba(0,0,0,1)");
    c.fillStyle = edge;
    c.fillRect(0, 0, canvas.width, canvas.height);
    prepared.set(img, canvas);
    return canvas;
  }
  function modeNow() {
    return window.longRun && window.longRun.course && window.longRun.course.mode === "endless" ? "endless" : "chapter";
  }
  function layout(id, distance, W, H, mode) {
    var height = H + 16, width = height * WIDTH / HEIGHT;
    var overlap = width * FEATHER / WIDTH, stride = width - overlap;
    var total = names.length, stripWidth = width + stride * (total - 1);
    var endless = (mode || modeNow()) === "endless";
    var travel = Math.max(0, Number(distance) || 0) * RATE;
    var scroll = endless ? travel : Math.min(travel, Math.max(0, stripWidth - W));
    var first = Math.max(0, Math.floor((scroll - width) / stride) + 1);
    var last = Math.ceil((scroll + W) / stride), panels = [];
    if (!endless) last = Math.min(last, total - 1);
    for (var index = first; index <= last; index++) {
      var sourceIndex = index < total ? index : 1 + (index - total) % (total - 1);
      var x = index * stride - scroll;
      if (x >= W || x + width <= 0) continue;
      panels.push({
        id: "park:" + names[sourceIndex], segment: index, sourceIndex: sourceIndex,
        original: sourceIndex === 0, mirrored: false, variant: null,
        x: x, y: -8, width: width, height: height, sourceWidth: WIDTH, sourceHeight: HEIGHT
      });
    }
    return { id: "park", mode: endless ? "endless" : "chapter", width: width, height: height,
      overlap: overlap, stride: stride, scroll: scroll, travel: travel, stripWidth: stripWidth,
      panelCount: total, originalIndex: 0, loopStart: 1, initialOffset: 0,
      introHold: 0, introEase: 0, parallaxRate: RATE, clamped: scroll < travel, panels: panels };
  }
  function source(id, panel, original) {
    if (original) originalImage = original;
    if (panel.original) return loaded(originalImage) ? originalImage : null;
    return prepare(images[panel.sourceIndex - 1]);
  }
  function draw2d(ctx, id, original, distance, W, H, mode) {
    layout(id, distance, W, H, mode).panels.forEach(function (panel) {
      var img = source(id, panel, original);
      if (img) ctx.drawImage(img, panel.x, panel.y, panel.width, panel.height);
    });
    return true;
  }
  window.NBIMParkScenery = {
    images: images, layout: layout, source: source, draw2d: draw2d,
    get ready() { return images.every(loaded); },
    inspect: function (id, distance, W, H, mode) {
      return Object.assign(layout(id, distance, W || 1000, H || 540, mode), {
        ready: images.every(loaded), loadedPanels: images.filter(loaded).length + (loaded(originalImage) ? 1 : 0),
        maxSourceWidth: WIDTH, originalRepeats: false, tailExcludesOriginal: true, mirrored: false
      });
    }
  };
})();
