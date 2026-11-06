/* Cohesive opaque New York panoramas. Buildings, streets and their venue
   frontages share a single calm camera; the original Park remains untouched. */
(function () {
  "use strict";
  var opening = NBIMFlatScenery.create({ id: "opening", width: 1024, height: 1680, paintedHeight: 1536, overlap: 64, edgeBlend: 16,
    // The IPO advances the chapter clock, so frame the final frontage before
    // the earliest regular story finish rather than the nominal75-second run.
    finishDistance: 24000, maxRate: .15, endlessRate: .105, hold: 1500, ease: 2400, curbTarget: 1304,
    compactCamera: { narrowWidth: 540, wideWidth: 864, ease: 5000, maxRate: .165, curve: .65 },
    joins: [
      {"after": 0, "leftSource": 0, "rightSource": 1, "x": 704, "width": 640, "feather": 32, "filename": "downtown-00.webp", "file": "assets/scenery-v19/joins/downtown-00.webp"},
      {"after": 1, "leftSource": 1, "rightSource": 2, "x": 704, "width": 640, "feather": 32, "filename": "downtown-01.webp", "file": "assets/scenery-v19/joins/downtown-01.webp"},
      {"after": 2, "leftSource": 2, "rightSource": 3, "x": 704, "width": 640, "feather": 32, "filename": "downtown-02.webp", "file": "assets/scenery-v19/joins/downtown-02.webp"},
      {"after": 3, "leftSource": 3, "rightSource": 4, "x": 704, "width": 640, "feather": 32, "filename": "downtown-03.webp", "file": "assets/scenery-v19/joins/downtown-03.webp"},
      {"after": 4, "leftSource": 4, "rightSource": 5, "x": 704, "width": 640, "feather": 32, "filename": "downtown-04.webp", "file": "assets/scenery-v19/joins/downtown-04.webp"},
      {"leftSource": 4, "rightSource": 6, "x": 704, "width": 640, "feather": 32, "filename": "downtown-04-06.webp", "file": "assets/scenery-v19/joins/downtown-04-06.webp"},
      {"after": 5, "leftSource": 5, "rightSource": 6, "x": 704, "width": 640, "feather": 32, "filename": "downtown-05.webp", "file": "assets/scenery-v19/joins/downtown-05.webp"},
      {"after": 6, "leftSource": 6, "rightSource": 7, "x": 704, "width": 640, "feather": 32, "filename": "downtown-06.webp", "file": "assets/scenery-v19/joins/downtown-06.webp"},
      {"after": 7, "leftSource": 7, "rightSource": 8, "x": 704, "width": 640, "feather": 32, "filename": "downtown-07.webp", "file": "assets/scenery-v19/joins/downtown-07.webp"},
      {"after": 8, "leftSource": 8, "rightSource": 9, "x": 704, "width": 640, "feather": 32, "filename": "downtown-08.webp", "file": "assets/scenery-v19/joins/downtown-08.webp"},
      {"after": 9, "leftSource": 9, "rightSource": 10, "x": 704, "width": 640, "feather": 32, "filename": "downtown-09.webp", "file": "assets/scenery-v19/joins/downtown-09.webp"},
      {"leftSource": 10, "rightSource": 4, "x": 704, "width": 640, "feather": 32, "filename": "downtown-10-04.webp", "file": "assets/scenery-v19/joins/downtown-10-04.webp"},
      {"after": 10, "leftSource": 10, "rightSource": 11, "x": 704, "width": 640, "feather": 32, "filename": "downtown-10.webp", "file": "assets/scenery-v19/joins/downtown-10.webp"},
      {"leftSource": 11, "rightSource": 4, "x": 704, "width": 640, "feather": 32, "filename": "downtown-11-04.webp", "file": "assets/scenery-v19/joins/downtown-11-04.webp"}
    ],
    curbYs: [1298, 1298, 1298, 1298, 1298, 1298, 1298, 1308, 1298, 1298, 1298, 1298],
    names: ["historic-street", "world-trade", "wall-street", "brooklyn-bridge", "seaport", "kabin", "tribeca", "booksellers", "ordinary-block", "commerce", "alley", "lei"],
    fileNames: ["downtown-00.webp", "downtown-01.webp", "downtown-02.webp", "downtown-03.webp", "downtown-04.webp", "downtown-05.webp", "downtown-06.webp", "downtown-07.webp", "downtown-08.webp", "downtown-09.webp", "downtown-10.webp", "downtown-11.webp"],
    files: ["assets/scenery-v19/downtown-00.webp", "assets/scenery-v19/downtown-01.webp", "assets/scenery-v19/downtown-02.webp", "assets/scenery-v19/downtown-03.webp", "assets/scenery-v19/downtown-04.webp", "assets/scenery-v19/downtown-05.webp", "assets/scenery-v19/downtown-06.webp", "assets/scenery-v19/downtown-07.webp", "assets/scenery-v19/downtown-08.webp", "assets/scenery-v19/downtown-09.webp", "assets/scenery-v19/downtown-10.webp", "assets/scenery-v19/downtown-11.webp"],
    tailOrder: [4, 6, 7, 8, 9, 10] });
  var scenes = { opening: opening, midtown: NBIMMidtownScenery, park: NBIMParkScenery };
  var images = Object.values(scenes).flatMap(function (scene) { return scene.images; });
  var contexts = new WeakMap(), contextStates = new Set(), activeScene = null;
  var loaded = function (image) { return !!(image && (image.complete && image.naturalWidth || image.getContext && image.width && image.height)); };
  function scene(id) { return scenes[id] || opening; }
  function layout(id, distance, W, H, mode) { return scene(id).layout(id, distance, W, H, mode); }
  function source(id, panel, original) { return scene(id).source(id, panel, original); }
  function draw2d(ctx, id, original, distance, W, H, mode) {
    if (activeScene !== id) releaseExcept(id);
    return scene(id).draw2d(ctx, id, original, distance, W, H, mode);
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
    state = { gl: gl, program: program, buffer: gl.createBuffer(), textures: new Map(), textureCacheLimit: 12,
      pos: gl.getAttribLocation(program, "a_position"), uv: gl.getAttribLocation(program, "a_uv"),
      sampler: gl.getUniformLocation(program, "u_image"), maxTexture: gl.getParameter(gl.MAX_TEXTURE_SIZE) };
    contexts.set(gl, state); contextStates.add(state);
    return state;
  }
  function texture(gl, state, img) {
    var tex = state.textures.get(img);
    if (tex) { state.textures.delete(img); state.textures.set(img, tex); return tex; }
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
    if (activeScene !== "opening") releaseExcept("opening");
    var state = setup(gl), scene = layout("opening", distance, W, H || 540);
    gl.useProgram(state.program); gl.bindBuffer(gl.ARRAY_BUFFER, state.buffer);
    gl.activeTexture(gl.TEXTURE0); gl.uniform1i(state.sampler, 0);
    gl.enableVertexAttribArray(state.pos); gl.enableVertexAttribArray(state.uv);
    gl.vertexAttribPointer(state.pos, 2, gl.FLOAT, false, 16, 0);
    gl.vertexAttribPointer(state.uv, 2, gl.FLOAT, false, 16, 8);
    gl.enable(gl.BLEND); gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    var usedImages = new Set();
    scene.panels.forEach(function (panel) {
      var img = source("opening", panel, original);
      if (!img) return;
      usedImages.add(img);
      gl.bindTexture(gl.TEXTURE_2D, texture(gl, state, img));
      var left = panel.x / W * 2 - 1, right = (panel.x + panel.width) / W * 2 - 1;
      var top = 1 - panel.y / (H || 540) * 2, bottom = 1 - (panel.y + panel.height) / (H || 540) * 2;
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([left, top, 0, 0, right, top, 1, 0, left, bottom, 0, 1, right, bottom, 1, 1]), gl.DYNAMIC_DRAW);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    });
    for (var entry of state.textures) {
      if (state.textures.size <= state.textureCacheLimit) break;
      if (usedImages.has(entry[0])) continue;
      gl.deleteTexture(entry[1]); state.textures.delete(entry[0]);
    }
    gl.disable(gl.BLEND); gl.disableVertexAttribArray(state.uv);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    return true;
  }

  function releaseExcept(id) {
    activeScene = id;
    Object.keys(scenes).forEach(function (key) { if (key !== id && scenes[key].release) scenes[key].release(); });
    if (id !== "opening") contextStates.forEach(function (state) {
      state.textures.forEach(function (texture) { if (!state.gl.isContextLost()) state.gl.deleteTexture(texture); });
      state.textures.clear();
    });
  }
  window.LR_SCENERY = {
    // Retain the legacy authored-scenery flag to suppress procedural cranes.
    layered: true, images: images, layout: layout, source: source, draw2d: draw2d, gl: drawGL, releaseExcept: releaseExcept,
    get ready() { return Object.values(scenes).every(function (scene) { return scene.ready; }); },
    lamps: function () { return []; },
    inspect: function (id, distance, W, H, mode) {
      var result = scene(id).inspect(id, distance, W || 1000, H || 540, mode);
      result.rawTextureCacheCount = 0; result.rawTextureCacheLimit = 12;
      contextStates.forEach(function (state) { result.rawTextureCacheCount += state.textures.size; });
      return result;
    }
  };
})();
