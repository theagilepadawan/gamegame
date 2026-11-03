/* Authored New York scenery. Each chapter travels through unique paintings;
   the approved opening plates are never mirrored or wrapped back into view.
   Textures stay at their native panel size, including on mobile WebGL. */
(function () {
  "use strict";
  var FEATHER = 64;
  var definitions = {
    opening: {
      width: 1536, height: 1024, rate: 0.145, originalIndex: 1, loopStart: 3,
      names: ["tribeca-approach", "lower-manhattan", "east-river", "south-street-seaport", "battery-waterfront"],
      files: ["assets/scenery/opening-west.webp", "assets/scenery/opening-bridge.webp", "assets/scenery/opening-2.webp", "assets/scenery/opening-3.webp"]
    },
    park: {
      width: 1672, height: 941, rate: 0.085,
      names: ["bow-bridge", "the-ramble", "bethesda-terrace"],
      files: ["assets/scenery/park-1.webp", "assets/scenery/park-2.webp"]
    },
    midtown: {
      width: 1672, height: 941, rate: 0.085,
      names: ["midtown-skyline", "bryant-park", "fifth-avenue"],
      files: ["assets/scenery/midtown-1.webp", "assets/scenery/midtown-2.webp"]
    }
  };
  var images = [], prepared = new WeakMap(), originals = {}, contexts = new WeakMap();
  var loaded = function (img) { return !!(img && (img.complete && img.naturalWidth || img.getContext && img.width && img.height)); };
  Object.keys(definitions).forEach(function (id) {
    var def = definitions[id];
    def.images = def.files.map(function (src) {
      var img = new Image();
      img.decoding = "async";
      img.addEventListener("load", function () { prepare(img); });
      img.src = src;
      images.push(img);
      return img;
    });
  });
  // The final Endless panel has its own right edge: it opens naturally onto
  // Seaport again without cutting an office tower at the loop boundary.
  var endlessBattery = new Image();
  endlessBattery.decoding = "async";
  endlessBattery.addEventListener("load", function () { prepare(endlessBattery); });
  endlessBattery.src = "assets/scenery/opening-battery-loop.webp";
  images.push(endlessBattery);

  // A small left-edge dissolve is prepared once per texture, never per frame.
  // It joins the painted sky/ground without stretching buildings or flipping art.
  function prepare(img) {
    if (!loaded(img)) return null;
    var canvas = prepared.get(img);
    if (canvas) return canvas;
    canvas = document.createElement("canvas");
    canvas.width = img.naturalWidth || img.width; canvas.height = img.naturalHeight || img.height;
    var c = canvas.getContext("2d");
    c.drawImage(img, 0, 0);
    c.globalCompositeOperation = "destination-in";
    var edge = c.createLinearGradient(0, 0, FEATHER, 0);
    edge.addColorStop(0, "rgba(0,0,0,0)");
    edge.addColorStop(1, "rgba(0,0,0,1)");
    c.fillStyle = edge; c.fillRect(0, 0, canvas.width, canvas.height);
    prepared.set(img, canvas);
    return canvas;
  }

  function modeNow() {
    return window.longRun && window.longRun.course && window.longRun.course.mode === "endless" ? "endless" : "chapter";
  }
  function layout(id, distance, W, H, mode) {
    var def = definitions[id] || definitions.opening;
    id = definitions[id] ? id : "opening";
    var height = id === "opening" ? H : H + 16;
    var width = id === "opening" ? 1120 : height * def.width / def.height;
    var overlap = width * FEATHER / def.width, stride = width - overlap;
    var total = def.names.length, stripWidth = width + stride * (total - 1);
    var endless = (mode || modeNow()) === "endless";
    var originalIndex = def.originalIndex || 0, loopStart = def.loopStart || 1;
    var runDistance = Math.max(0, Number(distance) || 0), initialOffset = 0, rate = def.rate;
    var hold = 0, ease = 0, easedDistance = runDistance;
    if (id === "opening") {
      // Frame the exact original One WTC between the brand and central HUD.
      // A brief establishing beat eases into a continuous journey; no landmark
      // is replayed when the player retries, returns home, or runs indefinitely.
      var compactHud = window.innerWidth <= 650;
      var heroFraction = compactHud ? 0.24 : 0.35;
      initialOffset = Math.max(0, stride - (W * heroFraction - width * 200 / def.width));
      // The narrow HUD has one smaller clear opening beside the NBIM logo.
      // Give that composition a little longer before it begins to travel.
      hold = compactHud ? 2400 : 1500; ease = compactHud ? 2000 : 2400;
      var afterHold = Math.max(0, runDistance - hold);
      easedDistance = afterHold < ease ? afterHold * afterHold / (2 * ease) : afterHold - ease / 2;
      if (!endless) rate = Math.max(0, stripWidth - W - initialOffset) / (25920 - hold - ease / 2);
    }
    var travel = initialOffset + easedDistance * rate;
    var scroll = endless ? travel : Math.min(travel, Math.max(0, stripWidth - W));
    var first = Math.max(0, Math.floor((scroll - width) / stride) + 1);
    var last = Math.ceil((scroll + W) / stride), panels = [];
    if (!endless) last = Math.min(last, total - 1);
    for (var index = first; index <= last; index++) {
      // Endless continues through landmark-free neighbourhoods. The approach, skyline
      // and complete bridge belong only to the first journey, never to the repeating tail.
      var sourceIndex = index < total ? index : loopStart + (index - total) % (total - loopStart);
      var x = index * stride - scroll;
      if (x >= W || x + width <= 0) continue;
      panels.push({
        id: id + ":" + def.names[sourceIndex], segment: index, sourceIndex: sourceIndex,
        original: sourceIndex === originalIndex, mirrored: false,
        variant: id === "opening" && endless && sourceIndex === 4 ? "battery-loop" : null, x: x, y: id === "opening" ? 0 : -8,
        width: width, height: height, sourceWidth: def.width, sourceHeight: def.height
      });
    }
    return { id: id, mode: endless ? "endless" : "chapter", width: width, height: height,
      overlap: overlap, stride: stride, scroll: scroll, travel: travel, stripWidth: stripWidth,
      panelCount: total, originalIndex: originalIndex, loopStart: loopStart, initialOffset: initialOffset,
      introHold: hold, introEase: ease, parallaxRate: rate, clamped: scroll < travel, panels: panels };
  }
  function source(id, panel, original) {
    if (original) originals[id] = original;
    var def = definitions[id], originalIndex = def.originalIndex || 0;
    if (panel.original) return loaded(originals[id]) ? (originalIndex ? prepare(originals[id]) : originals[id]) : null;
    var imageIndex = panel.sourceIndex < originalIndex ? panel.sourceIndex : panel.sourceIndex - 1;
    var image = panel.variant === "battery-loop" ? endlessBattery : def.images[imageIndex];
    if (id === "opening" && window.LR_KABIN) image = LR_KABIN.frontage(image, panel.sourceIndex);
    return prepare(image);
  }
  function draw2d(ctx, id, original, distance, W, H, mode) {
    var scene = layout(id, distance, W, H, mode);
    scene.panels.forEach(function (panel) {
      var img = source(id, panel, original);
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
    scene.panels.forEach(function (panel) {
      var img = source("opening", panel, original);
      if (!img) return;
      gl.bindTexture(gl.TEXTURE_2D, texture(gl, state, img));
      var left = panel.x / W * 2 - 1, right = (panel.x + panel.width) / W * 2 - 1;
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([left, 1, 0, 0, right, 1, 1, 0, left, -1, 0, 1, right, -1, 1, 1]), gl.DYNAMIC_DRAW);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    });
    gl.disable(gl.BLEND); gl.disableVertexAttribArray(state.uv);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    return true;
  }

  window.LR_SCENERY = {
    images: images, layout: layout, source: source, draw2d: draw2d, gl: drawGL,
    get ready() { return images.every(loaded); },
    inspect: function (id, distance, W, H, mode) {
      var scene = layout(id, distance, W || 1000, H || 540, mode);
      return Object.assign(scene, { ready: definitions[scene.id].images.every(loaded) && (scene.id !== "opening" || scene.mode !== "endless" || loaded(endlessBattery)),
        loadedPanels: definitions[scene.id].images.filter(loaded).length + (loaded(originals[scene.id]) ? 1 : 0),
        maxSourceWidth: definitions[scene.id].width, originalRepeats: false,
        tailExcludesOriginal: true, mirrored: false });
    }
  };
})();
