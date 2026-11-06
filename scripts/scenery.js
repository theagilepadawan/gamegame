/* Complete painted streets share one calm camera. Terrain/jump motion never
   moves or scales Midtown's background or its embedded venue fronts. */
(function () {
  "use strict";
  var images = [...NBIMParkScenery.images, ...NBIMDowntownScenery.images,
    ...NBIMMidtownScenery.images, ...LR_VENUE_DETAILS.images];
  var contexts = new WeakMap();
  var loaded = img => !!(img && (img.complete && img.naturalWidth || img.getContext && img.width && img.height));
  var foundationImage = new Image(); foundationImage.src = "assets/midtown-v16/stone-foundation.webp";
  images.push(foundationImage);
  function composer(id) { return id === "park" ? NBIMParkScenery : id === "midtown" ? NBIMMidtownScenery : NBIMDowntownScenery; }
  function layout(id, distance, W, H, mode) { return composer(id).layout(id,distance,W,H,mode); }
  function source(id, panel, original) { return composer(id).source(id,panel,original); }
  function projection() { return {streetOffset:0,skylineOffset:0}; }
  function draw2d(ctx,id,original,distance,W,H,mode) {
    const scene = layout(id,distance,W,H,mode);
    for (const panel of scene.layers || scene.panels) {
      const img = source(id,panel,original);
      if (img) ctx.drawImage(img,panel.x,panel.y,panel.width,panel.height);
    }
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
    layered:true, images, layout, source, draw2d, gl:drawGL, projection, foundationImage,
    get ready() { return images.every(loaded); }, lamps:()=>[],
    inspect(id,distance,W,H,mode) { return composer(id).inspect(id,distance,W,H,mode); }
  };
})();
