/* Cohesive opaque New York panoramas. Buildings, streets and their venue
   frontages share a single calm camera; the original Park remains untouched. */
(function () {
  "use strict";
  var opening = NBIMFlatScenery.create({ id: "opening", width: 2172, height: 772, paintedHeight: 724, overlap: 64,
    finishDistance: 25920, maxRate: .12, endlessRate: .085, hold: 1500, ease: 2400,
    joins: [
      { after: 0, x: 1852, width: 576, feather: 48, filename: "downtown-join.webp", file: "assets/scenery-v18/downtown-join.webp" },
      { after: 1, x: 1852, width: 576, feather: 48, filename: "downtown-tail-join.webp", file: "assets/scenery-v18/downtown-tail-join.webp" }
    ],
    names: ["lower-manhattan", "seaport-street", "ordinary-street"],
    fileNames: ["downtown-main.webp", "downtown-street.webp", "downtown-tail.webp"],
    files: ["assets/scenery-v18/downtown-main.webp", "assets/scenery-v18/downtown-street.webp"],
    tailFile: "assets/scenery-v18/downtown-tail.webp" });
  var scenes = { opening: opening, midtown: NBIMMidtownScenery, park: NBIMParkScenery };
  var images = Object.values(scenes).flatMap(function (scene) { return scene.images; });
  var contexts = new WeakMap();
  var loaded = function (image) { return !!(image && (image.complete && image.naturalWidth || image.getContext && image.width && image.height)); };
  function scene(id) { return scenes[id] || opening; }
  function layout(id, distance, W, H, mode) { return scene(id).layout(id, distance, W, H, mode); }
  function source(id, panel, original) { return scene(id).source(id, panel, original); }
  function draw2d(ctx, id, original, distance, W, H, mode) { return scene(id).draw2d(ctx, id, original, distance, W, H, mode); }
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
      var top = 1 - panel.y / (H || 540) * 2, bottom = 1 - (panel.y + panel.height) / (H || 540) * 2;
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([left, top, 0, 0, right, top, 1, 0, left, bottom, 0, 1, right, bottom, 1, 1]), gl.DYNAMIC_DRAW);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    });
    gl.disable(gl.BLEND); gl.disableVertexAttribArray(state.uv);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    return true;
  }

  window.LR_SCENERY = {
    // Retain the legacy authored-scenery flag to suppress procedural cranes.
    layered: true, images: images, layout: layout, source: source, draw2d: draw2d, gl: drawGL,
    get ready() { return Object.values(scenes).every(function (scene) { return scene.ready; }); },
    lamps: function () { return []; },
    inspect: function (id, distance, W, H, mode) { return scene(id).inspect(id, distance, W || 1000, H || 540, mode); }
  };
})();
