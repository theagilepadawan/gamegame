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
    var tailOrder = (config.tailOrder || (tailIndex === null ? [] : [tailIndex])).slice();
    var images = paths.map(function (path) { var image = new Image(); image.decoding = "async"; image.src = path; return image; });
    var joins = (config.joins || []).map(function (join) {
      var image = new Image(); image.decoding = "async"; image.src = join.file;
      var left = Number.isInteger(join.leftSource) ? join.leftSource : join.after;
      var right = Number.isInteger(join.rightSource) ? join.rightSource : left + 1;
      return Object.assign({}, join, { image: image, leftSource: left, rightSource: right });
    });
    var allImages = images.concat(joins.map(function (join) { return join.image; }));
    var prepared = new Map(), SOURCE_CACHE_LIMIT = 12;
    function modeNow() { return window.longRun && longRun.course && longRun.course.mode === "endless" ? "endless" : "chapter"; }
    // Logical art units describe composition, while every cached raster keeps
    // its actual native pixels. Different delivered resolutions change sampling,
    // never the architectural proportions or the single shared camera.
    function metrics(index) {
      var image = images[index], nativeWidth = loaded(image) ? image.naturalWidth : width;
      var nativePaintedHeight = loaded(image) ? image.naturalHeight : paintedHeight;
      var pixelRatio = nativePaintedHeight / paintedHeight;
      var curbY = (config.curbYs || [])[index], offsetUnits = Number.isFinite(curbY) ? (config.curbTarget || 1304) - curbY : 0;
      if (paintedHeight + Math.max(0, offsetUnits) > height) throw new Error("Scenery curb requires more native padding: " + config.id + " tile " + index);
      var nativeOffsetY = Math.round(offsetUnits * pixelRatio), alignmentY = Math.min(0, nativeOffsetY);
      return { nativeWidth: nativeWidth, paintedHeight: nativePaintedHeight, pixelRatio: pixelRatio,
        nativeOffsetY: nativeOffsetY, sourceOffsetY: Math.max(0, nativeOffsetY), alignmentY: alignmentY, coordinateOffsetY: offsetUnits,
        nativeHeight: Math.ceil(height * pixelRatio) - alignmentY, unitWidth: nativeWidth / pixelRatio };
    }
    function layout(id, distance, W, H, mode) {
      W = W || 1000; H = H || 540;
      var drawHeight = H + 16, scale = drawHeight / height, overlap = overlapNative * scale;
      var measures = images.map(function (_, index) { return metrics(index); }), starts = [], stripUnits = 0;
      for (var item = 0; item < count; item++) {
        starts.push(stripUnits); stripUnits += measures[item].unitWidth - (item < count - 1 ? overlapNative : 0);
      }
      var stripWidth = stripUnits * scale;
      var endless = (mode || modeNow()) === "endless", repeatsTail = endless && tailOrder.length > 0;
      var runDistance = Math.max(0, Number(distance) || 0), hold = config.hold || 0, ease = config.ease || 0;
      var maxRate = config.maxRate || .12, compactBlend = 0, compact = config.compactCamera;
      if (!repeatsTail && compact) {
        // Compact screens need a longer opening ease so complete entrances
        // reach the clear stretch of road. Larger views retain their framing.
        compactBlend = Math.pow(Math.max(0, Math.min(1, (compact.wideWidth - W) / (compact.wideWidth - compact.narrowWidth))), compact.curve);
        ease += (compact.ease - ease) * compactBlend;
        maxRate += (compact.maxRate - maxRate) * compactBlend;
      }
      // Ultra-wide views reveal more street at once. Give their opening a
      // gentler approach so a venue still arrives as a discovery, then spend
      // the remaining course distance traversing the complete native strip.
      var wideBlend = Math.max(0, Math.min(1, (W - 1168) / (1440 - 1168)));
      if (!repeatsTail) hold += 2000 * wideBlend;
      // Start moving with the runner immediately. Integrating a gentle rise
      // from half to full parallax retains the late-course venue timings.
      var initialVelocity = repeatsTail ? .5 : .5 - .45 * wideBlend;
      var cameraDebt = hold + ease / 2, ramp = 2 * cameraDebt / (1 - initialVelocity);
      var easedDistance = ramp && runDistance < ramp
        ? runDistance * initialVelocity + (1 - initialVelocity) * runDistance * runDistance / (2 * ramp)
        : runDistance - cameraDebt;
      var initialOffset = 0;
      if (Number.isFinite(config.heroX)) {
        var heroFraction = window.innerWidth <= 650 ? .24 : .35;
        initialOffset = Math.max(0, config.heroX * scale - W * heroFraction);
      }
      var duration = Math.max(1, config.finishDistance - hold - ease / 2);
      // Bound responsive framing to the configured camera cap while preserving
      // the existing chapter duration and player simulation.
      if (!repeatsTail) initialOffset = Math.max(initialOffset, stripWidth - W - maxRate * duration);
      var available = Math.max(0, stripWidth - W - initialOffset);
      var rate = repeatsTail ? (config.endlessRate || .085) : Math.min(maxRate, available / duration);
      var travel = initialOffset + Math.max(0, easedDistance) * rate;
      var scroll = repeatsTail ? travel : Math.min(travel, Math.max(0, stripWidth - W));
      var panels = [], blocks = [], segments = [];
      function append(sourceIndex, segment, startUnits) {
        var measure = measures[sourceIndex], nativeScale = scale / measure.pixelRatio;
        var worldX = startUnits * scale, drawWidth = measure.nativeWidth * nativeScale;
        segments.push({ sourceIndex: sourceIndex, segment: segment, startUnits: startUnits });
        if (segment < count) blocks.push({ sourceIndex: sourceIndex, sourceFilename: config.fileNames[sourceIndex], segment: segment,
          worldX: worldX, width: drawWidth, height: measure.nativeHeight * nativeScale,
          nativeWidth: measure.nativeWidth, nativeHeight: measure.nativeHeight, paintedHeight: measure.paintedHeight,
          pixelRatio: measure.pixelRatio, nativeScale: nativeScale, nativeOffsetY: measure.nativeOffsetY, sourceOffsetY: measure.sourceOffsetY, alignmentY: measure.alignmentY });
        if (worldX - scroll >= W || worldX - scroll + drawWidth <= 0) return;
        var chunks = measure.nativeWidth > TILE_LIMIT ? Math.ceil(measure.nativeWidth / TILE_WIDTH) : 1;
        for (var chunk = 0; chunk < chunks; chunk++) {
          var sourceX = chunks === 1 ? 0 : Math.max(0, chunk * TILE_WIDTH - (chunk ? 2 : 0));
          var sourceWidth = chunks === 1 ? measure.nativeWidth : Math.min(measure.nativeWidth - sourceX, TILE_WIDTH + (chunk ? 2 : 0));
          var tileX = worldX + sourceX * nativeScale - scroll, tileWidth = sourceWidth * nativeScale;
          if (tileX >= W || tileX + tileWidth <= 0) continue;
          panels.push({ id: config.id + ":" + (config.names[sourceIndex] || "ordinary-street") + ":" + segment + ":" + chunk,
            kind: "painting", segment: segment, sourceIndex: sourceIndex, sourceFilename: config.fileNames[sourceIndex], original: sourceIndex === 0, mirrored: false,
            x: tileX, y: -8 + measure.alignmentY * nativeScale, width: tileWidth, height: measure.nativeHeight * nativeScale,
            sourceX: sourceX, sourceWidth: sourceWidth, sourceHeight: measure.nativeHeight,
            nativeWidth: measure.nativeWidth, nativeHeight: measure.nativeHeight, paintedHeight: measure.paintedHeight,
            pixelRatio: measure.pixelRatio, nativeScale: nativeScale, nativeOffsetY: measure.nativeOffsetY, sourceOffsetY: measure.sourceOffsetY, alignmentY: measure.alignmentY, feather: segment > 0,
            overlapPixels: overlapNative * measure.pixelRatio, edgeBlendPixels: (config.edgeBlend || 16) * measure.pixelRatio,
            worldX: worldX + sourceX * nativeScale, chunk: chunk });
        }
      }
      for (var index = 0; index < count; index++) append(index, index, starts[index]);
      if (repeatsTail) {
        var tailStart = stripUnits - overlapNative, tailCycle = tailOrder.reduce(function (sum, sourceIndex) { return sum + measures[sourceIndex].unitWidth - overlapNative; }, 0);
        var widestTail = Math.max.apply(null, tailOrder.map(function (sourceIndex) { return measures[sourceIndex].unitWidth; }));
        var firstCycle = Math.max(0, Math.floor((scroll / scale - tailStart - widestTail) / tailCycle));
        var lastCycle = Math.max(firstCycle, Math.ceil(((scroll + W) / scale - tailStart) / tailCycle));
        for (var cycle = firstCycle; cycle <= lastCycle; cycle++) {
          var within = 0;
          tailOrder.forEach(function (sourceIndex, position) {
            append(sourceIndex, count + cycle * tailOrder.length + position, tailStart + cycle * tailCycle + within);
            within += measures[sourceIndex].unitWidth - overlapNative;
          });
        }
      }
      // Repairs are matched to the actual adjacent source pair. The anonymous
      // continuation can reuse ordinary-street joins, never a venue-side join.
      for (var pair = 0; pair < segments.length - 1; pair++) {
        var left = segments[pair], right = segments[pair + 1];
        if (right.segment !== left.segment + 1) continue;
        joins.forEach(function (join, joinIndex) {
          if (join.leftSource !== left.sourceIndex || join.rightSource !== right.sourceIndex) return;
          var x = (left.startUnits + join.x) * scale - scroll;
          if (x >= W || x + join.width * scale <= 0) return;
          var nativePainted = loaded(join.image) ? join.image.naturalHeight : paintedHeight;
          var ratio = nativePainted / paintedHeight, nativeWidth = loaded(join.image) ? join.image.naturalWidth : Math.round(join.width * ratio);
          var nativeHeight = Math.ceil(height * ratio), nativeScale = scale / ratio;
          panels.push({ id: config.id + ":join:" + joinIndex + ":" + left.segment, kind: "join", joinIndex: joinIndex,
            segment: left.segment, sourceIndex: left.sourceIndex, rightSourceIndex: right.sourceIndex, sourceFilename: join.filename,
            original: false, mirrored: false, x: x, y: -8, width: nativeWidth * nativeScale, height: nativeHeight * nativeScale,
            sourceX: 0, sourceWidth: nativeWidth, sourceHeight: nativeHeight, nativeWidth: nativeWidth,
            nativeHeight: nativeHeight, paintedHeight: nativePainted, pixelRatio: ratio, nativeScale: nativeScale,
            nativeOffsetY: 0, sourceOffsetY: 0, alignmentY: 0, feather: false, edgeFeather: (join.feather || 24) * ratio,
            skyEdgeFeather: (join.skyFeather || join.feather || 24) * ratio, skyFeatherHeight: (join.skyFeatherHeight || 240) * ratio,
            worldX: (left.startUnits + join.x) * scale, chunk: 0 });
        });
      }
      return { id: config.id, mode: endless ? "endless" : "chapter", kind: "panorama", authoredLayers: true,
        width: blocks[0].width, height: drawHeight, overlap: overlap, stride: blocks[0].width - overlap,
        scroll: scroll, travel: travel, stripWidth: stripWidth, stripNativeWidth: stripUnits,
        panelCount: count, sourceCount: paths.length, originalIndex: 0, loopStart: count,
        initialOffset: initialOffset, introHold: hold, introEase: ease, compactCameraBlend: compactBlend, parallaxRate: rate, maxParallaxRate: maxRate, clamped: scroll < travel,
        artScale: scale, nativeWidth: width, nativeHeight: height, paintedHeight: paintedHeight,
        worldTransform: { scale: scale, x: -scroll, y: -8 }, blocks: blocks, panels: panels,
        repeatSourceIndex: repeatsTail && tailOrder.length === 1 ? tailOrder[0] : null,
        repeatSourceIndices: repeatsTail ? tailOrder.slice() : [], continuousOpaqueArt: true };
    }
    function extendSky(canvas, ctx, image, sourceX, sourceWidth, offset, padding, ratio) {
      if (offset <= 0) return;
      // Continue the source's own cloud texture and any edge architecture into
      // the short alignment pad. Reflection keeps a continuous pixel boundary;
      // the original painting below remains untouched at its native resolution.
      ctx.save(); ctx.translate(0, offset); ctx.scale(1, -1);
      ctx.drawImage(image, sourceX, 0, sourceWidth, offset, 0, 0, sourceWidth, offset);
      ctx.restore();
      if (!padding) return;
      // A reviewed sky-only sample prevents a distant rooftop from reflecting
      // into this added padding. Native artwork and its boundary stay intact.
      var patchWidth = Math.round(padding.width * ratio), patch = document.createElement("canvas");
      patch.width = patchWidth; patch.height = offset;
      var pc = patch.getContext("2d"), feather = Math.round(padding.feather * ratio);
      pc.translate(0, offset); pc.scale(1, -1);
      pc.drawImage(image, Math.round(padding.sourceX * ratio), 0, patchWidth, offset, 0, 0, patchWidth, offset);
      pc.setTransform(1, 0, 0, 1, 0, 0); pc.globalCompositeOperation = "destination-in";
      var edge = pc.createLinearGradient(0, 0, patchWidth, 0);
      edge.addColorStop(0, "rgba(0,0,0,0)"); edge.addColorStop(feather / patchWidth, "rgba(0,0,0,1)");
      edge.addColorStop(1 - feather / patchWidth, "rgba(0,0,0,1)"); edge.addColorStop(1, "rgba(0,0,0,0)");
      pc.fillStyle = edge; pc.fillRect(0, 0, patchWidth, offset);
      var boundary = pc.createLinearGradient(0, Math.max(0, offset - feather), 0, offset);
      boundary.addColorStop(0, "rgba(0,0,0,1)"); boundary.addColorStop(1, "rgba(0,0,0,0)");
      pc.fillStyle = boundary; pc.fillRect(0, 0, patchWidth, offset);
      ctx.drawImage(patch, Math.round(padding.destinationX * ratio) - sourceX, 0);
    }
    function extendGround(canvas, ctx, groundImage, nativePaintedHeight, nativeOffsetY) {
      var paintedHeight = nativePaintedHeight + nativeOffsetY, height = canvas.height;
      if (height <= paintedHeight) return;
      // Preserve the complete native painting. Only the added canvas footer
      // receives a broad patch of its own dry asphalt, with no stretched rows.
      var extra = height - paintedHeight, sampleHeight = Math.min(96, paintedHeight);
      // Repair paintings can include manholes at their center. Their footer
      // samples the clean central asphalt of the full base painting instead.
      var groundSource = loaded(groundImage) ? groundImage : canvas;
      var groundWidth = groundSource.naturalWidth || groundSource.width;
      var groundHeight = groundSource.naturalHeight || nativePaintedHeight;
      var sampleX = Math.round(groundWidth * .147), sampleWidth = Math.round(groundWidth * .706);
      var texture = document.createElement("canvas"); texture.width = sampleWidth; texture.height = sampleHeight;
      var tc = texture.getContext("2d");
      tc.drawImage(groundSource, sampleX, groundHeight - sampleHeight,
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
      var sourceX = panel.sourceX || 0, sourceWidth = panel.sourceWidth || image.naturalWidth;
      var nativeHeight = panel.nativeHeight, nativePaintedHeight = panel.paintedHeight, nativeOffsetY = panel.sourceOffsetY || 0;
      if (!repair && nativeHeight === nativePaintedHeight && !panel.feather && sourceX === 0 && sourceWidth === image.naturalWidth) return image;
      var key = (repair ? "join:" + panel.joinIndex : "tile:" + panel.sourceIndex) + ":" + sourceX + ":" + sourceWidth + ":" + nativeHeight + ":" + nativeOffsetY + ":" + !!panel.feather;
      if (prepared.has(key)) {
        var cached = prepared.get(key); prepared.delete(key); prepared.set(key, cached); return cached;
      }
      var canvas = document.createElement("canvas"); canvas.width = sourceWidth; canvas.height = nativeHeight;
      var ctx = canvas.getContext("2d");
      // This is a native-size copy, including high-detail tiles and join art.
      // Only new dry ground rows are generated below the original painting.
      extendSky(canvas, ctx, image, sourceX, sourceWidth, nativeOffsetY, !repair && (config.skyPadding || {})[panel.sourceIndex], panel.pixelRatio);
      ctx.drawImage(image, sourceX, 0, sourceWidth, nativePaintedHeight, 0, nativeOffsetY, sourceWidth, nativePaintedHeight);
      extendGround(canvas, ctx, images[panel.sourceIndex], nativePaintedHeight, nativeOffsetY);
      if (repair) {
        var feather = Math.min(panel.edgeFeather || 24, sourceWidth / 4);
        var skyFeather = Math.min(panel.skyEdgeFeather || feather, sourceWidth / 4);
        var mask = document.createElement("canvas"); mask.width = sourceWidth; mask.height = nativeHeight;
        var mc = mask.getContext("2d");
        function fillEdge(amount, y, rows) {
          var edge = mc.createLinearGradient(0, 0, sourceWidth, 0);
          edge.addColorStop(0, "rgba(0,0,0,0)"); edge.addColorStop(amount / sourceWidth, "rgba(0,0,0,1)");
          edge.addColorStop(1 - amount / sourceWidth, "rgba(0,0,0,1)"); edge.addColorStop(1, "rgba(0,0,0,0)");
          mc.fillStyle = edge; mc.fillRect(0, y, sourceWidth, rows);
        }
        var skyHeight = skyFeather > feather ? Math.min(nativeHeight, Math.ceil(panel.skyFeatherHeight || 240)) : 0;
        // Only reviewed open-sky joins receive this wider upper blend. It
        // tapers to the narrow architectural edge before the lower facade.
        for (var row = 0; row < skyHeight; row++) {
          var t = row / skyHeight, smooth = t * t * (3 - 2 * t);
          fillEdge(feather + (skyFeather - feather) * (1 - smooth), row, 1);
        }
        fillEdge(feather, skyHeight, nativeHeight - skyHeight);
        ctx.globalCompositeOperation = "destination-in"; ctx.drawImage(mask, 0, 0);
      } else if (panel.feather && sourceX < panel.overlapPixels) {
        ctx.globalCompositeOperation = "destination-in";
        var overlap = panel.overlapPixels, blend = Math.min(overlap, panel.edgeBlendPixels);
        // Finish the narrow blend four native units before the old plate ends.
        // This opaque overlap covers fractional Canvas/GPU rasterization edges
        // without widening the blend across architectural details.
        var fadeEnd = overlap - Math.min(overlap / 4, 4 * panel.pixelRatio);
        var fade = ctx.createLinearGradient(fadeEnd - blend - sourceX, 0, fadeEnd - sourceX, 0);
        fade.addColorStop(0, "rgba(0,0,0,0)"); fade.addColorStop(1, "rgba(0,0,0,1)");
        ctx.fillStyle = fade; ctx.fillRect(0, 0, sourceWidth, nativeHeight);
      }
      prepared.set(key, canvas);
      while (prepared.size > SOURCE_CACHE_LIMIT) prepared.delete(prepared.keys().next().value);
      return canvas;
    }
    function draw2d(ctx, id, original, distance, W, H, mode) {
      layout(id, distance, W, H, mode).panels.forEach(function (panel) {
        var image = source(id, panel);
        if (image) ctx.drawImage(image, panel.x, panel.y, panel.width, panel.height);
      });
      return true;
    }
    return { images: allImages, layout: layout, source: source, draw2d: draw2d,
      release: function () { prepared.clear(); },
      get ready() { return allImages.every(loaded); },
      inspect: function (id, distance, W, H, mode) {
        return Object.assign(layout(id, distance, W, H, mode), { ready: allImages.every(loaded), loadedPanels: images.filter(loaded).length, loadedJoins: joins.filter(function (join) { return loaded(join.image); }).length,
          maxSourceWidth: Math.min(width, width > TILE_LIMIT ? TILE_WIDTH + 2 : width),
          cachedSourceCount: prepared.size, sourceCacheLimit: SOURCE_CACHE_LIMIT,
          originalRepeats: false, tailExcludesOriginal: true, mirrored: false, architectureFeather: overlapNative });
      }
    };
  }
  window.NBIMFlatScenery = { create: create };
  window.NBIMMidtownScenery = create({ id: "midtown", width: 1024, height: 1750, paintedHeight: 1536, overlap: 64, edgeBlend: 16,
    finishDistance: 19200, maxRate: .25, hold: 1000, ease: 1000, curbTarget: 1304,
    joins: [
      {"after": 0, "leftSource": 0, "rightSource": 1, "x": 704, "width": 640, "feather": 32, "filename": "midtown-00.webp", "file": "assets/scenery-v19/joins/midtown-00.webp"},
      {"after": 1, "leftSource": 1, "rightSource": 2, "x": 704, "width": 640, "feather": 32, "skyFeather": 96, "skyFeatherHeight": 240, "filename": "midtown-01.webp", "file": "assets/scenery-v19/joins/midtown-01.webp"},
      {"after": 2, "leftSource": 2, "rightSource": 3, "x": 704, "width": 640, "feather": 32, "filename": "midtown-02.webp", "file": "assets/scenery-v19/joins/midtown-02.webp"},
      {"after": 3, "leftSource": 3, "rightSource": 4, "x": 704, "width": 640, "feather": 32, "filename": "midtown-03.webp", "file": "assets/scenery-v19/joins/midtown-03.webp"},
      {"after": 4, "leftSource": 4, "rightSource": 5, "x": 704, "width": 640, "feather": 32, "filename": "midtown-04.webp", "file": "assets/scenery-v19/joins/midtown-04.webp"},
      {"after": 5, "leftSource": 5, "rightSource": 6, "x": 800, "width": 544, "feather": 32, "filename": "midtown-05.webp", "file": "assets/scenery-v19/joins/midtown-05.webp"},
      {"after": 6, "leftSource": 6, "rightSource": 7, "x": 704, "width": 640, "feather": 32, "filename": "midtown-06.webp", "file": "assets/scenery-v19/joins/midtown-06.webp"},
      {"after": 7, "leftSource": 7, "rightSource": 8, "x": 672, "width": 512, "feather": 32, "filename": "midtown-07.webp", "file": "assets/scenery-v19/joins/midtown-07.webp"},
      {"after": 8, "leftSource": 8, "rightSource": 9, "x": 800, "width": 544, "feather": 32, "filename": "midtown-08.webp", "file": "assets/scenery-v19/joins/midtown-08.webp"},
      {"after": 9, "leftSource": 9, "rightSource": 10, "x": 704, "width": 640, "feather": 32, "filename": "midtown-09.webp", "file": "assets/scenery-v19/joins/midtown-09.webp"},
      {"after": 10, "leftSource": 10, "rightSource": 11, "x": 663, "width": 512, "feather": 32, "filename": "midtown-10.webp", "file": "assets/scenery-v19/joins/midtown-10.webp"},
      {"after": 11, "leftSource": 11, "rightSource": 12, "x": 912, "width": 512, "feather": 32, "filename": "midtown-11.webp", "file": "assets/scenery-v19/joins/midtown-11.webp"},
      {"after": 12, "leftSource": 12, "rightSource": 13, "x": 704, "width": 640, "feather": 32, "filename": "midtown-12.webp", "file": "assets/scenery-v19/joins/midtown-12.webp"},
      {"after": 13, "leftSource": 13, "rightSource": 14, "x": 704, "width": 512, "feather": 32, "filename": "midtown-13.webp", "file": "assets/scenery-v19/joins/midtown-13.webp"},
      {"after": 14, "leftSource": 14, "rightSource": 15, "x": 800, "width": 544, "feather": 32, "filename": "midtown-14.webp", "file": "assets/scenery-v19/joins/midtown-14.webp"}
    ],
    skyPadding: { 11: { sourceX: 256, destinationX: 160, width: 128, feather: 16 } },
    curbYs: [1322, 1304, 1305, 1305, 1305, 1264, 1319, 1305, 1279, 1305, 1305, 1216, 1327, 1318, 1304, 1304],
    names: ["terracotta-offices", "chrysler", "empire-state", "bryant-park-library", "cast-iron-street", "joju", "glass-offices", "brick-cafe-street", "omars", "art-deco-clock", "brownstone-bay-windows", "gussy", "honey-brick-offices", "copper-glass-offices", "fifth", "limestone-courtyard"],
    fileNames: ["midtown-00.webp", "midtown-01.webp", "midtown-02.webp", "midtown-03.webp", "midtown-04.webp", "midtown-05.webp", "midtown-06.webp", "midtown-07.webp", "midtown-08.webp", "midtown-09.webp", "midtown-10.webp", "midtown-11.webp", "midtown-12.webp", "midtown-13.webp", "midtown-14.webp", "midtown-15.webp"],
    files: ["assets/scenery-v19/midtown-00.webp", "assets/scenery-v19/midtown-01.webp", "assets/scenery-v19/midtown-02.webp", "assets/scenery-v19/midtown-03.webp", "assets/scenery-v19/midtown-04.webp", "assets/scenery-v19/midtown-05.webp", "assets/scenery-v19/midtown-06.webp", "assets/scenery-v19/midtown-07.webp", "assets/scenery-v19/midtown-08.webp", "assets/scenery-v19/midtown-09.webp", "assets/scenery-v19/midtown-10.webp", "assets/scenery-v19/midtown-11.webp", "assets/scenery-v19/midtown-12.webp", "assets/scenery-v19/midtown-13.webp", "assets/scenery-v19/midtown-14.webp", "assets/scenery-v19/midtown-15.webp"] });
})();
