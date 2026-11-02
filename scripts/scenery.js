/* Native architectural layers share one continuous atmosphere and ground plane.
   No sky/road tiles, mirrored landmarks, or translucent architectural seams. */
(function () {
  "use strict";
  var SOURCE_W = 1024, SOURCE_H = 1430;
  var definitions = {
    opening: {
      originalIndex: 1, loopStart: 12, heroX: 441, backdropScale: 568 / 540,
      route: [0, 1, 2, 0, 2, 3, 4, 5, 6, 7, 8, 5, 9, 10], bridgeBlock: 8,
      backdrop: "assets/art-v2/downtown-atmosphere.webp",
      names: ["tribeca-approach", "lower-manhattan", "tribeca-block", "kabin", "wall-street", "seaport-street", "brooklyn-bridge", "east-river", "lei", "seaport-block", "battery-waterfront"],
      files: ["assets/art-v2/downtown-tribeca.webp", "assets/art-v2/downtown-wtc.webp", "assets/art-v2/downtown-block.webp", "assets/art-v2/downtown-kabin.webp", "assets/art-v2/downtown-wallstreet.webp", "assets/art-v2/downtown-seaport.webp", "assets/art-v2/downtown-waterfront.webp", "assets/art-v2/downtown-waterfront.webp", "assets/art-v2/downtown-lei.webp", "assets/art-v2/downtown-block.webp", "assets/art-v2/downtown-waterfront.webp"],
      cropTops: [128, 38, 24, -5, 137, 77, 5, 4, 66, 24, 4]
    },
    midtown: {
      originalIndex: 4, loopStart: 21, backdropScale: 1,
      // Every entry is a complete native-size block. Anonymous streets can
      // recur; venues and the Midtown skyline occur exactly once.
      route: [1, 6, 7, 1, 4, 6, 1, 7, 0, 7, 6, 1, 2, 6, 1, 7, 3, 1, 7, 6, 5, 6, 1],
      backdrop: "assets/art-v2/midtown-atmosphere.webp",
      names: ["joju", "bryant-garden", "omars", "gussy", "midtown-skyline", "fifth-avenue", "residential-block", "cast-iron-block"],
      files: ["assets/art-v2/midtown-joju.webp", "assets/art-v2/midtown-garden.webp", "assets/art-v2/midtown-omars.webp", "assets/art-v2/midtown-gussy.webp", "assets/art-v2/midtown-skyline.webp", "assets/art-v2/midtown-fifth.webp", "assets/art-v2/downtown-block.webp", "assets/art-v2/downtown-tribeca.webp"],
      cropTops: [78, 45, 78, 40, 47, 128, 24, 128]
    }
  };
  var images = window.NBIMParkScenery ? NBIMParkScenery.images.slice() : [], byPath = new Map(), prepared = new WeakMap(), contexts = new WeakMap();
  var loaded = function (img) { return !!(img && (img.complete && img.naturalWidth || img.getContext && img.width && img.height)); };
  function load(path) {
    if (byPath.has(path)) return byPath.get(path);
    var img = new Image(); img.decoding = "async"; img.src = path;
    byPath.set(path, img); images.push(img); return img;
  }
  Object.keys(definitions).forEach(function (id) {
    var def = definitions[id]; def.images = def.files.map(load); def.background = load(def.backdrop);
  });
  var joinTree = load("assets/art-v2/city-plane-tree.webp");
  var bridge = load("assets/art-v2/downtown-bridge-wide.webp");
  function modeNow() {
    return window.longRun && window.longRun.course && window.longRun.course.mode === "endless" ? "endless" : "chapter";
  }
  function layout(id, distance, W, H, mode) {
    if (id === "park" && window.NBIMParkScenery) return NBIMParkScenery.layout(id, distance, W, H, mode);
    id = definitions[id] ? id : "opening";
    var def = definitions[id], height = id === "opening" ? H : H + 16;
    var width = height * SOURCE_W / SOURCE_H, stride = width;
    var total = def.route.length, stripWidth = stride * total;
    var endless = (mode || modeNow()) === "endless";
    var runDistance = Math.max(0, Number(distance) || 0), initialOffset = 0;
    var hold = 0, ease = 0, easedDistance = runDistance;
    if (id === "opening") {
      var compactHud = window.innerWidth <= 650;
      var heroFraction = compactHud ? .24 : .35;
      initialOffset = Math.max(0, stride + width * def.heroX / SOURCE_W - W * heroFraction);
      hold = compactHud ? 2400 : 1500; ease = compactHud ? 2000 : 2400;
      var afterHold = Math.max(0, runDistance - hold);
      easedDistance = afterHold < ease ? afterHold * afterHold / (2 * ease) : afterHold - ease / 2;
    }
    if (id === "midtown") {
      // Ordinary blocks establish Midtown before the first venue. This modest
      // pause leaves the world composition, rather than image scaling, in
      // charge of separation between later frontages.
      hold = 1000;
      easedDistance = Math.max(0, runDistance - hold);
    }
    var finishDistance = id === "opening" ? 25920 : 19200;
    var rate = endless ? .145 : Math.max(0, stripWidth - W - initialOffset) / (finishDistance - hold - ease / 2);
    var travel = initialOffset + easedDistance * rate;
    var scroll = endless ? travel : Math.min(travel, Math.max(0, stripWidth - W));
    var first = Math.max(0, Math.floor(scroll / stride)), last = Math.ceil((scroll + W) / stride);
    if (!endless) last = Math.min(last, total - 1);
    var panels = [], y = id === "opening" ? 0 : -8;
    for (var index = first; index <= last; index++) {
      var routeIndex = index < total ? index : def.loopStart + (index - total) % (total - def.loopStart);
      var sourceIndex = def.route[routeIndex];
      var x = index * stride - scroll;
      if (x >= W || x + width <= 0) continue;
      panels.push({ id: id + ":" + def.names[sourceIndex], kind: "architecture", segment: index, routeIndex: routeIndex, sourceIndex: sourceIndex,
        original: sourceIndex === def.originalIndex, mirrored: false, variant: null,
        x: x, y: y, width: width, height: height, sourceWidth: SOURCE_W, sourceHeight: SOURCE_H,
        nativeWidth: SOURCE_W, nativeHeight: 1536, cropTop: def.cropTops[sourceIndex] });
    }
    var atmosphereDrift = Math.min(scroll * .025, W * .18);
    var layers = [{ id: id + ":atmosphere", kind: "atmosphere", sourceIndex: -1, original: false,
      x: -atmosphereDrift, y: 0, width: W * 1.18, height: H * def.backdropScale }];
    if (id === "opening") {
      var bridgeWidth = stride * 2.35, bridgeHeight = bridgeWidth * 724 / 2171;
      var bridgeX = stride * def.bridgeBlock - scroll - bridgeWidth / 2;
      if (bridgeX < W && bridgeX + bridgeWidth > 0) layers.push({ id: "opening:complete-brooklyn-bridge",
        kind: "bridge", sourceIndex: 6, original: false, x: bridgeX, y: H * .61 - bridgeHeight * 593 / 724,
        width: bridgeWidth, height: bridgeHeight, nativeWidth: 2171, nativeHeight: 724 });
    }
    layers = layers.concat(panels);
    // Complete foreground trees overlap the ends of architectural groups. Their
    // organic, opaque foliage is a physical occluder; building pixels never fade.
    if (id !== "park") {
      var rootY = H * .824;
      for (var boundary = Math.max(0, first); boundary <= last + 1; boundary++) {
        var treeHeight = H * [.43, .39, .46, .41][boundary % 4], treeWidth = treeHeight * 2 / 3;
        var treeX = boundary * stride - scroll;
        if (treeX < -treeWidth / 2 || treeX > W + treeWidth / 2) continue;
        layers.push({ id: id + ":tree:" + boundary, kind: "tree", sourceIndex: -2, original: false,
          x: treeX - treeWidth / 2, y: rootY - treeHeight * 1450 / 1536, width: treeWidth, height: treeHeight });
      }
    }
    return { id: id, mode: endless ? "endless" : "chapter", width: width, height: height,
      overlap: 0, stride: stride, scroll: scroll, travel: travel, stripWidth: stripWidth,
      blocks: def.route.map(function (sourceIndex, segment) {
        return { id: id + ":" + def.names[sourceIndex], sourceIndex: sourceIndex, segment: segment, worldX: segment * stride, width: width };
      }),
      sourceCount: def.names.length, loopSourceIndices: def.route.slice(def.loopStart),
      panelCount: total, originalIndex: def.originalIndex, loopStart: def.loopStart, initialOffset: initialOffset,
      introHold: hold, introEase: ease, parallaxRate: rate, clamped: scroll < travel,
      cropTops: def.cropTops.slice(), authoredLayers: true, panels: panels, layers: layers };
  }
  function source(id, panel, original) {
    if (id === "park" && window.NBIMParkScenery) return NBIMParkScenery.source(id, panel, original);
    var def = definitions[id];
    if (panel.kind === "atmosphere") return loaded(def.background) ? def.background : null;
    if (panel.kind === "tree") return loaded(joinTree) ? joinTree : null;
    if (panel.kind === "bridge") return loaded(bridge) ? bridge : null;
    var img = def.images[panel.sourceIndex];
    if (!loaded(img)) return null;
    var crops = prepared.get(img);
    if (!crops) { crops = new Map(); prepared.set(img, crops); }
    var top = panel.cropTop || 0;
    if (crops.has(top)) return crops.get(top);
    // A small camera trim aligns the authored curb; native image samples are
    // copied 1:1, with no enlargement or additional feathering.
    var canvas = document.createElement("canvas"); canvas.width = SOURCE_W; canvas.height = SOURCE_H;
    canvas.getContext("2d").drawImage(img, 0, top, SOURCE_W, SOURCE_H, 0, 0, SOURCE_W, SOURCE_H);
    crops.set(top, canvas); return canvas;
  }
  function draw2d(ctx, id, original, distance, W, H, mode) {
    if (id === "park" && window.NBIMParkScenery) return NBIMParkScenery.draw2d(ctx, id, original, distance, W, H, mode);
    var scene = layout(id, distance, W, H, mode);
    scene.layers.forEach(function (panel) {
      var img = source(id, panel);
      if (img) ctx.drawImage(img, panel.x, panel.y, panel.width, panel.height);
    });
    return true;
  }
  function shader(gl, type, text) {
    var s = gl.createShader(type); gl.shaderSource(s, text); gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error("Scenery shader unavailable");
    return s;
  }
  function setup(gl) {
    var state = contexts.get(gl);
    if (state) return state;
    var program = gl.createProgram();
    gl.attachShader(program, shader(gl, gl.VERTEX_SHADER, "attribute vec2 a_position;attribute vec2 a_uv;varying vec2 v_uv;void main(){v_uv=a_uv;gl_Position=vec4(a_position,0.,1.);}"));
    gl.attachShader(program, shader(gl, gl.FRAGMENT_SHADER, "precision mediump float;varying vec2 v_uv;uniform sampler2D u_image;void main(){vec4 c=texture2D(u_image,v_uv);gl_FragColor=vec4(c.rgb*.88,c.a);}"));
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error("Scenery program unavailable");
    state = { program: program, buffer: gl.createBuffer(), textures: new WeakMap(),
      pos: gl.getAttribLocation(program, "a_position"), uv: gl.getAttribLocation(program, "a_uv"),
      sampler: gl.getUniformLocation(program, "u_image"), maxTexture: gl.getParameter(gl.MAX_TEXTURE_SIZE) };
    contexts.set(gl, state);
    return state;
  }
  function texture(gl, state, img) {
    var tex = state.textures.get(img);
    if (tex) return tex;
    var upload = img, width = img.naturalWidth || img.width, height = img.naturalHeight || img.height;
    if (Math.max(width, height) > state.maxTexture) {
      upload = document.createElement("canvas");
      var scale = state.maxTexture / Math.max(width, height);
      upload.width = Math.floor(width * scale); upload.height = Math.floor(height * scale);
      upload.getContext("2d").drawImage(img, 0, 0, upload.width, upload.height);
    }
    tex = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, upload);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    state.textures.set(img, tex);
    return tex;
  }
  function drawGL(gl, original, distance, W, H) {
    if (!loaded(original)) return false;
    var state = setup(gl), scene = layout("opening", distance, W, H || 540);
    gl.useProgram(state.program); gl.bindBuffer(gl.ARRAY_BUFFER, state.buffer);
    gl.activeTexture(gl.TEXTURE0); gl.uniform1i(state.sampler, 0);
    gl.enableVertexAttribArray(state.pos); gl.enableVertexAttribArray(state.uv);
    gl.vertexAttribPointer(state.pos, 2, gl.FLOAT, false, 16, 0);
    gl.vertexAttribPointer(state.uv, 2, gl.FLOAT, false, 16, 8);
    gl.enable(gl.BLEND); gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    scene.layers.forEach(function (panel) {
      var img = source("opening", panel, original);
      if (!img) return;
      gl.bindTexture(gl.TEXTURE_2D, texture(gl, state, img));
      var left = panel.x / W * 2 - 1, right = (panel.x + panel.width) / W * 2 - 1;
      var top = 1 - panel.y / (H || 540) * 2, bottom = 1 - (panel.y + panel.height) / (H || 540) * 2;
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([left, top, 0, 0, right, top, 1, 0, left, bottom, 0, 1, right, bottom, 1, 1]), gl.DYNAMIC_DRAW);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    });
    gl.disable(gl.BLEND); gl.disableVertexAttribArray(state.uv);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    return true;
  }

  window.LR_SCENERY = {
    layered: true, images: images, layout: layout, source: source, draw2d: draw2d, gl: drawGL,
    get ready() { return images.every(loaded) && (!window.NBIMParkScenery || NBIMParkScenery.ready); },
    lamps: function () { return []; },
    inspect: function (id, distance, W, H, mode) {
      if (id === "park" && window.NBIMParkScenery) return NBIMParkScenery.inspect(id, distance, W, H, mode);
      var scene = layout(id, distance, W || 1000, H || 540, mode), def = definitions[scene.id];
      return Object.assign(scene, { ready: def.images.every(loaded) && loaded(def.background) && loaded(joinTree) && (scene.id !== "opening" || loaded(bridge)),
        loadedPanels: def.images.filter(loaded).length, maxSourceWidth: scene.id === "opening" ? 2171 : 1536, nativeHeight: 1536,
        landmarkSourceSize: scene.id === "opening" ? [2171, 724] : null,
        effectiveSourceHeight: SOURCE_H, commonAtmosphere: true, architectureFeather: 0,
        originalRepeats: false, tailExcludesOriginal: true, mirrored: false });
    }
  };
})();
