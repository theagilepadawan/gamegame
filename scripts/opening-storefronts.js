/* Storefronts set into the downtown street front of the Opening Bell backdrop:
   Kabin, the little glass pavilion (in place of the red-awning shop in the beige walk-up), and LEI,
   the striped-awning bar (at the foot of the glass tower further along the street).
   They scroll with the backdrop painting (same parallax, same authored neighbourhoods) so they read as part of the city,
   and each turns up once per run: Kabin through the middle of the run, LEI over the summit.
   Drawn inside the city renderer each frame (window.LR_KABIN.gl / draw2d / drawScreen). */
(function () {
  "use strict";
  var load = function (src) { var i = new Image(); i.src = src; return i; };
  var TILE = 1120, RATE = 0.000105;  // the backdrop shader: one painting = 1120 units, scrolls RATE per unit run
  var BASE = 407;                    // the sidewalk line
  // P locates each venue on the new unmirrored East River and Seaport paintings.
  // The 64-source-pixel overlap is shared with LR_SCENERY.
  var SHOPS = [
    { key: "kabin", city: load("assets/original-10.webp"), home: null, S: 0.54, bw: 168, bh: 150, ax: 84, ay: 140, P: (TILE - 64 * TILE / 1536 + 1220 * TILE / 1536) / TILE },
    { key: "lei", city: load("assets/original-11.webp"), home: null, S: 0.5, bw: 156, bh: 150, ax: 78, ay: 142, P: (2 * (TILE - 64 * TILE / 1536) + 830 * TILE / 1536) / TILE }
  ];
  SHOPS.forEach(function (s) { s.W = s.bw * s.S; s.H = s.bh * s.S; s.AX = s.ax * s.S; s.AY = s.ay * s.S; if (!s.home) s.home = s.city; });
  var ok = function (i) { return i && i.complete && i.naturalWidth > 0; };
  var playing = function () { return (window.longRun ? window.longRun.state : "home") !== "home"; };
  var VS = "attribute vec2 a_pos;attribute vec2 a_uv;varying vec2 v_uv;uniform float u_depth;void main(){v_uv=a_uv;gl_Position=vec4(a_pos,u_depth,1.);}";
  // same .88 the backdrop shader applies to the painting, so the fronts sit in the same light
  var FS = "precision mediump float;varying vec2 v_uv;uniform sampler2D u_tex;void main(){vec4 c=texture2D(u_tex,v_uv);if(c.a<.02)discard;gl_FragColor=vec4(c.rgb*.88,c.a);}";
  var glState = null;
  function glSetup(gl) {
    if (glState && glState.gl === gl) return glState;
    var sh = function (type, src) { var s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); return s; };
    var prog = gl.createProgram(); gl.attachShader(prog, sh(gl.VERTEX_SHADER, VS)); gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FS)); gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return null;
    glState = { gl: gl, prog: prog, buf: gl.createBuffer(), tex: {},
      pos: gl.getAttribLocation(prog, "a_pos"), uv: gl.getAttribLocation(prog, "a_uv"), depth: gl.getUniformLocation(prog, "u_depth"), utex: gl.getUniformLocation(prog, "u_tex") };
    return glState;
  }
  function texture(gl, g, s) {
    var t = g.tex[s.key];
    if (t) return t;
    t = g.tex[s.key] = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, t);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, s.city);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    return t;
  }
  var xAt = function (s, scroll, W, H) {
    var offset = window.LR_SCENERY ? LR_SCENERY.layout("opening", scroll, W, H || 540).scroll : scroll * RATE * TILE;
    return s.P * TILE - offset;
  };
  var inView = function (s, x, w) { return x + s.W > -10 && x - s.W < w + 10; };
  window.LR_KABIN = {
    // Drawn inside the WebGL city, after the painting and before the street traffic, at a depth on the
    // building line: cars and people on the street pass in front, the elevated train far behind.
    gl: function (gl, scroll, worldW, worldH) {
      if (!playing()) return;
      var g = null;
      SHOPS.forEach(function (s) {
        var x = xAt(s, scroll, worldW, typeof worldH === "number" ? worldH : 540);
        if (!ok(s.city) || !inView(s, x, worldW)) return;
        g = g || glSetup(gl); if (!g) return;
        gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, texture(gl, g, s));
        var l = x - s.AX, r = l + s.W, t = BASE - s.AY, b = t + s.H;
        var nx = function (v) { return (v / worldW) * 2 - 1; }, ny = function (v) { return 1 - (v / worldH) * 2; };
        gl.useProgram(g.prog);
        gl.bindBuffer(gl.ARRAY_BUFFER, g.buf);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([nx(l), ny(t), 0, 0, nx(r), ny(t), 1, 0, nx(l), ny(b), 0, 1, nx(r), ny(b), 1, 1]), gl.DYNAMIC_DRAW);
        gl.enableVertexAttribArray(g.pos); gl.vertexAttribPointer(g.pos, 2, gl.FLOAT, false, 16, 0);
        gl.enableVertexAttribArray(g.uv); gl.vertexAttribPointer(g.uv, 2, gl.FLOAT, false, 16, 8);
        gl.uniform1i(g.utex, 0);
        gl.uniform1f(g.depth, 40 / 130); // the city shader's depth, (30 - z) / 130, for z = -10
        gl.enable(gl.BLEND); gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        gl.disable(gl.BLEND);
        gl.disableVertexAttribArray(g.uv);
      });
    },
    // the 2D fallback city (no WebGL)
    draw2d: function (ctx, scroll, worldW) {
      if (!playing()) return;
      SHOPS.forEach(function (s) {
        var x = xAt(s, scroll, worldW, typeof worldH === "number" ? worldH : 540);
        if (ok(s.city) && inView(s, x, worldW)) ctx.drawImage(s.city, x - s.AX, BASE - s.AY, s.W, s.H);
      });
    },
    // for the end-of-chapter reveal, which redraws the city in screen pixels (k px per world unit)
    drawScreen: function (ctx, sc, k, screenW) {
      SHOPS.forEach(function (s) {
        var x = xAt(s, sc / RATE, screenW / k, 540) * k;
        if (!ok(s.home) || x + s.W * k < -10 || x - s.W * k > screenW + 10) return;
        ctx.drawImage(s.home, x - s.AX * k, (BASE - s.AY) * k, s.W * k, s.H * k);
      });
    },
    // for tests: where each one sits on the backdrop
    spots: function () { return SHOPS.map(function (s) { return { key: s.key, P: s.P, W: s.W, H: s.H }; }); }
  };
})();
