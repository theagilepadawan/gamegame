/* Continuous opaque city paintings. Native coordinates are shared by scenery,
   embedded venue details and the office host; jumps never move this camera. */
(function () {
  "use strict";
  var TILE_LIMIT = 4096, TILE_WIDTH = 2048;
  var loaded = function (image) { return !!(image && (image.complete && image.naturalWidth || image.getContext && image.width && image.height)); };

  function create(config) {
    var width = config.width, height = config.height, paintedHeight = config.paintedHeight || height, overlapNative = config.overlap == null ? 64 : config.overlap;
    var count = config.files.length, tailIndex = config.tailFile ? count : null;
    var paths = config.files.concat(config.tailFile ? [config.tailFile] : []);
    var images = paths.map(function (path) { var image = new Image(); image.decoding = "async"; image.src = path; return image; });
    var joins = (config.joins || []).map(function (join) {
      var image = new Image(); image.decoding = "async"; image.src = join.file;
      return Object.assign({}, join, { image: image });
    });
    var allImages = images.concat(joins.map(function (join) { return join.image; }));
    var prepared = new WeakMap();
    function modeNow() { return window.longRun && longRun.course && longRun.course.mode === "endless" ? "endless" : "chapter"; }
    function layout(id, distance, W, H, mode) {
      W = W || 1000; H = H || 540;
      var drawHeight = H + 16, scale = drawHeight / height, drawWidth = width * scale;
      var overlap = overlapNative * scale, stride = drawWidth - overlap;
      var stripWidth = drawWidth + (count - 1) * stride;
      var endless = (mode || modeNow()) === "endless", repeatsTail = endless && tailIndex !== null;
      var runDistance = Math.max(0, Number(distance) || 0);
      var hold = config.hold || 0, ease = config.ease || 0;
      var afterHold = Math.max(0, runDistance - hold);
      var easedDistance = ease && afterHold < ease ? afterHold * afterHold / (2 * ease) : afterHold - ease / 2;
      var initialOffset = 0;
      // Art-directed framing can be supplied in native pixels once the finished
      // landmark position is known. Ordinary chapter starts retain the full art.
      if (Number.isFinite(config.heroX)) {
        var heroFraction = window.innerWidth <= 650 ? .24 : .35;
        initialOffset = Math.max(0, config.heroX * scale - W * heroFraction);
      }
      var duration = Math.max(1, config.finishDistance - hold - ease / 2);
      // Narrow desktop windows still reach the final entrance at the same calm
      // speed. Frame slightly farther into the opening instead of accelerating.
      if (!repeatsTail) initialOffset = Math.max(initialOffset, stripWidth - W - (config.maxRate || .12) * duration);
      var available = Math.max(0, stripWidth - W - initialOffset);
      var rate = repeatsTail ? (config.endlessRate || .085) : Math.min(config.maxRate || .12, available / duration);
      var travel = initialOffset + Math.max(0, easedDistance) * rate;
      var scroll = repeatsTail ? travel : Math.min(travel, Math.max(0, stripWidth - W));
      var first = Math.max(0, Math.floor((scroll - drawWidth) / stride) + 1);
      var last = Math.ceil((scroll + W) / stride);
      if (!repeatsTail) last = Math.min(last, count - 1);
      var panels = [], blocks = [];
      for (var block = 0; block < count; block++) blocks.push({ sourceIndex: block, sourceFilename: config.fileNames[block], segment: block, worldX: block * stride,
        width: drawWidth, height: drawHeight, nativeWidth: width, nativeHeight: height, paintedHeight: paintedHeight });
      for (var index = first; index <= last; index++) {
        var sourceIndex = index < count ? index : tailIndex;
        if (sourceIndex === null) continue;
        var x = index * stride - scroll;
        if (x >= W || x + drawWidth <= 0) continue;
        var chunks = width > TILE_LIMIT ? Math.ceil(width / TILE_WIDTH) : 1;
        for (var chunk = 0; chunk < chunks; chunk++) {
          // Two shared source pixels keep linear-filtered GPU texture boundaries
          // continuous. Both chunks sample the same logical native painting.
          var sourceX = chunks === 1 ? 0 : Math.max(0, chunk * TILE_WIDTH - (chunk ? 2 : 0));
          var sourceWidth = chunks === 1 ? width : Math.min(width - sourceX, TILE_WIDTH + (chunk ? 2 : 0));
          var tileX = x + sourceX * scale, tileWidth = sourceWidth * scale;
          if (tileX >= W || tileX + tileWidth <= 0) continue;
          panels.push({ id: config.id + ":" + (config.names[sourceIndex] || "ordinary-street") + ":" + index + ":" + chunk,
            kind: "painting", segment: index, sourceIndex: sourceIndex, sourceFilename: config.fileNames[sourceIndex], original: sourceIndex === 0, mirrored: false,
            x: tileX, y: -8, width: tileWidth, height: drawHeight,
            sourceX: sourceX, sourceWidth: sourceWidth, sourceHeight: height,
            nativeWidth: width, nativeHeight: height, paintedHeight: paintedHeight, feather: index > 0,
            worldX: index * stride + sourceX * scale, chunk: chunk });
        }
      }
      // A repair painting spans an authored join in the same native plane.
      // It has no independent camera, and it never creates a new street island.
      joins.forEach(function (join, joinIndex) {
        if (join.after >= count - 1 && !repeatsTail) return;
        var x = (join.after * (width - overlapNative) + join.x) * scale - scroll;
        if (x >= W || x + join.width * scale <= 0) return;
        panels.push({ id: config.id + ":join:" + joinIndex, kind: "join", joinIndex: joinIndex,
          segment: join.after, sourceIndex: join.after, sourceFilename: join.filename,
          original: false, mirrored: false, x: x, y: -8, width: join.width * scale, height: drawHeight,
          sourceX: 0, sourceWidth: join.width, sourceHeight: height, nativeWidth: join.width,
          nativeHeight: height, paintedHeight: paintedHeight, feather: false, edgeFeather: join.feather || 24,
          worldX: (join.after * (width - overlapNative) + join.x) * scale, chunk: 0 });
      });
      return { id: config.id, mode: endless ? "endless" : "chapter", kind: "panorama", authoredLayers: true,
        width: drawWidth, height: drawHeight, overlap: overlap, stride: stride, scroll: scroll, travel: travel,
        stripWidth: stripWidth, panelCount: count, sourceCount: paths.length, originalIndex: 0, loopStart: count,
        initialOffset: initialOffset, introHold: hold, introEase: ease, parallaxRate: rate, clamped: scroll < travel,
        artScale: scale, nativeWidth: width, nativeHeight: height, paintedHeight: paintedHeight,
        worldTransform: { scale: scale, x: -scroll, y: -8 }, blocks: blocks, panels: panels,
        repeatSourceIndex: repeatsTail ? tailIndex : null, continuousOpaqueArt: true };
    }
    function extendGround(canvas, ctx, groundImage) {
      if (height <= paintedHeight) return;
      // Preserve the complete native painting. Only the added canvas footer
      // receives a broad patch of its own dry asphalt, with no stretched rows.
      var extra = height - paintedHeight, sampleHeight = Math.min(96, paintedHeight);
      // Repair paintings can include manholes at their center. Their footer
      // samples the clean central asphalt of the full base painting instead.
      var groundSource = loaded(groundImage) ? groundImage : canvas;
      var groundWidth = groundSource.naturalWidth || groundSource.width;
      var sampleX = Math.round(groundWidth * .147), sampleWidth = Math.round(groundWidth * .706);
      var texture = document.createElement("canvas"); texture.width = sampleWidth; texture.height = sampleHeight;
      var tc = texture.getContext("2d");
      tc.drawImage(groundSource, sampleX, paintedHeight - sampleHeight,
        sampleWidth, sampleHeight, 0, 0, sampleWidth, sampleHeight);
      var row = tc.getImageData(0, sampleHeight - 16, sampleWidth, 16).data;
      var r = 0, g = 0, b = 0, samples = 0;
      for (var index = 0; index < row.length; index += 32) {
        if (row[index + 3] < 250) continue;
        r += row[index]; g += row[index + 1]; b += row[index + 2]; samples++;
      }
      var color = samples ? Math.round(r / samples) + "," + Math.round(g / samples) + "," + Math.round(b / samples) : "55,52,47";
      // Start opaque, then place the wide texture rather than extruding individual
      // bottom pixels into conspicuous vertical columns.
      ctx.fillStyle = "rgb(" + color + ")"; ctx.fillRect(0, paintedHeight, canvas.width, extra);
      ctx.drawImage(texture, 0, 0, sampleWidth, sampleHeight, 0, paintedHeight, canvas.width, extra);
      var matte = ctx.createLinearGradient(0, paintedHeight, 0, height);
      matte.addColorStop(0, "rgba(" + color + ",.08)"); matte.addColorStop(1, "rgba(" + color + ",.22)");
      ctx.fillStyle = matte; ctx.fillRect(0, paintedHeight, canvas.width, extra);
      // A six-native-pixel fade matches the exact painted boundary without
      // extending its columns down the footer. All original rows stay untouched.
      var edge = document.createElement("canvas"); edge.width = canvas.width; edge.height = 6;
      var ec = edge.getContext("2d"); ec.imageSmoothingEnabled = false;
      ec.drawImage(canvas, 0, paintedHeight - 1, canvas.width, 1, 0, 0, canvas.width, 6);
      ec.globalCompositeOperation = "destination-in";
      var fade = ec.createLinearGradient(0, 0, 0, 6); fade.addColorStop(0, "rgba(0,0,0,1)"); fade.addColorStop(1, "rgba(0,0,0,0)");
      ec.fillStyle = fade; ec.fillRect(0, 0, edge.width, 6); ctx.drawImage(edge, 0, paintedHeight);
    }
    function source(id, panel) {
      var repair = panel.kind === "join", image = repair ? joins[panel.joinIndex].image : images[panel.sourceIndex];
      if (!loaded(image)) return null;
      var sourceX = panel.sourceX || 0, sourceWidth = panel.sourceWidth || width;
      if (!repair && height === paintedHeight && !panel.feather && sourceX === 0 && sourceWidth === width) return image;
      var cache = prepared.get(image);
      if (!cache) { cache = new Map(); prepared.set(image, cache); }
      var key = sourceX + ":" + sourceWidth + ":" + !!panel.feather + ":" + !!repair;
      if (cache.has(key)) return cache.get(key);
      var canvas = document.createElement("canvas"); canvas.width = sourceWidth; canvas.height = height;
      var ctx = canvas.getContext("2d");
      if (repair) ctx.drawImage(image, 0, 0, image.naturalWidth, image.naturalHeight, 0, 0, sourceWidth, paintedHeight);
      else ctx.drawImage(image, sourceX, 0, sourceWidth, paintedHeight, 0, 0, sourceWidth, paintedHeight);
      extendGround(canvas, ctx, images[panel.sourceIndex]);
      if (repair) {
        ctx.globalCompositeOperation = "destination-in";
        var feather = Math.min(panel.edgeFeather || 24, sourceWidth / 4);
        var edge = ctx.createLinearGradient(0, 0, sourceWidth, 0);
        edge.addColorStop(0, "rgba(0,0,0,0)"); edge.addColorStop(feather / sourceWidth, "rgba(0,0,0,1)");
        edge.addColorStop(1 - feather / sourceWidth, "rgba(0,0,0,1)"); edge.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = edge; ctx.fillRect(0, 0, sourceWidth, height);
      } else if (panel.feather && sourceX < overlapNative) {
        ctx.globalCompositeOperation = "destination-in";
        var fade = ctx.createLinearGradient(-sourceX, 0, overlapNative - sourceX, 0);
        fade.addColorStop(0, "rgba(0,0,0,0)"); fade.addColorStop(1, "rgba(0,0,0,1)");
        ctx.fillStyle = fade; ctx.fillRect(0, 0, sourceWidth, height);
      }
      cache.set(key, canvas); return canvas;
    }
    function draw2d(ctx, id, original, distance, W, H, mode) {
      layout(id, distance, W, H, mode).panels.forEach(function (panel) {
        var image = source(id, panel);
        if (image) ctx.drawImage(image, panel.x, panel.y, panel.width, panel.height);
      });
      return true;
    }
    return { images: allImages, layout: layout, source: source, draw2d: draw2d,
      get ready() { return allImages.every(loaded); },
      inspect: function (id, distance, W, H, mode) {
        return Object.assign(layout(id, distance, W, H, mode), { ready: allImages.every(loaded), loadedPanels: images.filter(loaded).length, loadedJoins: joins.filter(function (join) { return loaded(join.image); }).length,
          maxSourceWidth: Math.min(width, width > TILE_LIMIT ? TILE_WIDTH + 2 : width),
          originalRepeats: false, tailExcludesOriginal: true, mirrored: false, architectureFeather: overlapNative });
      }
    };
  }
  window.NBIMFlatScenery = { create: create };
  window.NBIMMidtownScenery = create({ id: "midtown", width: 2172, height: 800, paintedHeight: 724, overlap: 64,
    finishDistance: 19200, maxRate: .12,
    joins: [{ after: 0, x: 1852, width: 576, feather: 48, filename: "midtown-join.webp", file: "assets/scenery-v18/midtown-join.webp" }],
    names: ["midtown-skyline", "fifth-avenue-street"],
    fileNames: ["midtown-main.webp", "midtown-street.webp"],
    files: ["assets/scenery-v18/midtown-main.webp", "assets/scenery-v18/midtown-street.webp"] });
})();
