/* NBIM logo animation, from the Tech Day New York app (phone home, v47).
   The N assembles from points of light, the two pillars wipe in (the left upwards, the right downwards), a Sea
   streak runs down the cut between them, and then a soft glint passes every few seconds. Grab the N and pull,
   and it wobbles like jelly and settles back. No libraries, no network, no assets: one canvas and two SVG halves.

   Use:
     <div id="logo" style="width:100vw;height:100vh"></div>
     <script src="nbim-logo.js"><\/script>
     <script>const logo = NBIMLogo.create(document.getElementById("logo"), { theme: "dark" });<\/script>

   Options (all optional):
     theme        "dark" (white N, for Midnight) or "light" (Midnight N). Default "dark"
     size         the N's height in px. Default: 38% of the box height (48 to 560 px)
     autoplay     play the intro at once. Default true
     glintEvery   ms between glints once settled; 0 for none. Default 7000
     jelly        let the viewer grab and wobble the N. Default true
     seed         a number for the same particle layout every time (for recordings). Default random
     ignoreReducedMotion  animate even when the viewer prefers reduced motion. Default false
   API: replay(), glint(), setTheme("dark" | "light"), renderAt(ms) (draw one exact frame, for recordings), destroy().
   Timing: points 0 to 2.6 s, pillars wipe 2.05 to 2.6 s, streak 2.3 to 3.1 s, settled at 3.15 s. */
(function (global) {
  "use strict";

  // the N in its own units (x 120 to 373.33, y 120 to 360): two pillars with the 37.9° cut
  const POLYS = [
    [[120, 120], [120, 360], [240, 360], [240, 240], [146.66, 120]],
    [[373.33, 360], [373.33, 120], [253.33, 120], [253.33, 240], [346.67, 360]],
  ];
  const P_L = "120 120 120 360 240 360 240 240 146.66 120 120 120";
  const P_R = "373.33 360 373.33 120 253.33 120 253.33 240 346.67 360 373.33 360";
  // NBIM colours: Midnight #001538, Polar #C3E9EE, Sea #4EC2E2, Sea dark #0A5877, Sky #F5F2EB
  const THEMES = {
    dark: { fg: "#FFFFFF", p: ["#FFFFFF", "#C3E9EE", "#4EC2E2"], streak: "#4EC2E2" },
    light: { fg: "#001538", p: ["#001538", "#0A5877", "#4EC2E2"], streak: "#4EC2E2" },
  };
  const INTRO_END = 3.15, GLINT_S = 0.85;
  const ease3 = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
  const ease2 = (x) => (x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2);
  const clamp01 = (x) => Math.max(0, Math.min(1, x));
  const seeded = (a) => () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };

  function create(host, opts) {
    opts = Object.assign({ theme: "dark", size: null, autoplay: true, glintEvery: 7000, jelly: true, seed: null, ignoreReducedMotion: false }, opts || {});
    const random = opts.seed == null ? Math.random : seeded(opts.seed);
    const reduce = () => !opts.ignoreReducedMotion && global.matchMedia && global.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let theme = THEMES[opts.theme] || THEMES.dark;

    const stage = document.createElement("div");
    stage.className = "nbim-logo";
    stage.setAttribute("role", "img");
    stage.setAttribute("aria-label", "NBIM");
    stage.style.cssText = "position:relative;width:100%;height:100%;overflow:hidden;touch-action:pan-y;-webkit-user-select:none;user-select:none;-webkit-tap-highlight-color:transparent";
    const canvas = document.createElement("canvas");
    canvas.style.cssText = "position:absolute;left:0;top:0";
    const L = svgHalf("120 120 120 240", P_L), R = svgHalf("253.33 120 120 240", P_R);
    stage.appendChild(canvas); stage.appendChild(L); stage.appendChild(R);
    host.appendChild(stage);
    const ctx = canvas.getContext("2d");

    function svgHalf(vb, pts) {
      const s = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      s.setAttribute("viewBox", vb); s.setAttribute("aria-hidden", "true");
      s.style.cssText = "position:absolute;display:block;overflow:visible";
      const p = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
      p.setAttribute("points", pts); s.appendChild(p);
      return s;
    }
    const fill = () => { L.firstChild.setAttribute("fill", theme.fg); R.firstChild.setAttribute("fill", theme.fg); };
    fill();

    let parts = [], W = 0, H = 0, dpr = 1, sc = 1, ox = 0, oxR = 0, oy = 0, symH = 240, raf = 0;
    let mode = "static", t0 = 0, partA = 0, alive = true, timer = 0;

    // the jelly: only the outline is simulated, as springs that follow the pull with a soft falloff round the
    // grab point, then wobble home when you let go
    const OUT = POLYS.map((poly) => {
      const o = [];
      for (let i = 0; i < poly.length; i++) {
        const a = poly[i], b = poly[(i + 1) % poly.length], n = Math.max(1, Math.ceil(Math.hypot(b[0] - a[0], b[1] - a[1]) / 3));
        for (let k = 0; k < n; k++) o.push({ x: a[0] + ((b[0] - a[0]) * k) / n, y: a[1] + ((b[1] - a[1]) * k) / n, ux: 0, uy: 0, vx: 0, vy: 0, w: 0, nx: 0, ny: 0 });
      }
      return o;
    });
    const J = { gx: 0, gy: 0, tx: 0, ty: 0, d0x: 0, d0y: 0, sx: 0, sy: 0, a: 0, va: 0, grab: false, id: null, moved: false, last: 0, rest: false };
    const SIG = 82, RUB = 118; // falloff and rubber-band reach, in symbol units

    function size() {
      W = Math.max(1, stage.offsetWidth); H = Math.max(1, stage.offsetHeight);
      dpr = Math.min(global.devicePixelRatio || 1, 3);
      canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
      canvas.style.width = canvas.width / dpr + "px"; canvas.style.height = canvas.height / dpr + "px";
      // everything on whole screen pixels, so the canvas N (points, jelly) and the SVG N land on the same pixels
      const px = (v) => Math.round(v * dpr) / dpr;
      const want = opts.size || Math.max(48, Math.min(560, H * 0.38, W * 0.5));
      sc = Math.round(want * 0.5 * dpr) / (120 * dpr);
      symH = 240 * sc;
      const pl = px((W - 253.33 * sc) / 2), pt = px((H - symH) / 2), pr = pl + px(133.33 * sc);
      ox = pl - 120 * sc; oy = pt - 120 * sc; oxR = pr - 253.33 * sc;
      L.style.left = pl + "px"; L.style.top = pt + "px"; L.style.width = 120 * sc + "px"; L.style.height = symH + "px";
      R.style.left = pr + "px"; R.style.top = pt + "px"; R.style.width = 120 * sc + "px"; R.style.height = symH + "px";
      build();
    }

    function inside(poly, x, y) {
      let c = false;
      for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
        const xi = poly[i][0], yi = poly[i][1], xj = poly[j][0], yj = poly[j][1];
        if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) c = !c;
      }
      return c;
    }
    // one point per 6.2 symbol units, each flying in along the cut's direction from far outside, with a bend
    function build() {
      const step = 6.2, d = [0.6139, 0.7894], n = [-0.7894, 0.6139];
      parts = [];
      POLYS.forEach((poly, side) => {
        const xs = poly.map((p) => p[0]), ys = poly.map((p) => p[1]), sign = side === 0 ? 1 : -1;
        for (let y = Math.min(...ys) + step / 2; y < Math.max(...ys); y += step) {
          for (let x = Math.min(...xs) + step / 2; x < Math.max(...xs); x += step) {
            if (!inside(poly, x, y)) continue;
            const hx = x * sc + ox, hy = y * sc + oy;
            const Ld = (420 + random() * 420) * sc, j = (random() - 0.5) * 360 * sc;
            const proj = ((x - 120) * d[0] + (y - 120) * d[1]) / 345;
            const r = random();
            parts.push({
              hx, hy, x: hx, y: hy,
              sx: hx - sign * d[0] * Ld + n[0] * j, sy: hy - sign * d[1] * Ld + n[1] * j,
              c: (random() - 0.5) * 200 * sc,
              dl: 0.5 * (side === 0 ? proj : 1 - proj) + 0.35 * random(),
              du: 1.05 + random() * 0.45,
              S: (step - 1.2) * sc, s: 0, on: false, k: r < 0.7 ? 0 : r < 0.92 ? 1 : 2, b: 0,
            });
          }
        }
      });
    }

    function play() {
      size();
      mode = "intro"; t0 = performance.now(); partA = 1;
      wipe(0); L.style.opacity = R.style.opacity = 1;
      if (reduce()) { finish(); return; }
      kick();
    }
    // the solid halves wipe in, the left upwards and the right downwards
    function wipe(sr) {
      const e = (1 - sr) * (symH + 60) - 30;
      L.style.clipPath = "inset(" + e + "px -30px -30px -30px)";
      R.style.clipPath = "inset(-30px -30px " + e + "px -30px)";
    }
    function finish() {
      mode = "idle"; partA = 0;
      L.style.clipPath = R.style.clipPath = "none";
      L.style.opacity = R.style.opacity = 1;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, W, H);
    }
    // the Sea streak down the channel between the pillars; u runs 0 to 1.35
    function streak(u) {
      const u0 = Math.max(0, u - 0.35), u1 = Math.min(1, u);
      if (!(u > 0 && u < 1.35) || u1 <= u0) return;
      const P = (x, y) => [x * sc + ox, y * sc + oy];
      const A = P(146.66, 120), B = P(160, 120), C = P(346.67, 360), D = P(333.34, 360);
      const lp = (p, q, s) => [p[0] + (q[0] - p[0]) * s, p[1] + (q[1] - p[1]) * s];
      const a = lp(A, D, u0), b = lp(B, C, u0), c = lp(B, C, u1), d = lp(A, D, u1);
      ctx.fillStyle = theme.streak;
      ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.lineTo(c[0], c[1]); ctx.lineTo(d[0], d[1]); ctx.closePath(); ctx.fill();
    }

    function draw(now) {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);
      const t = (now - t0) / 1000;
      if (mode === "glint") {
        streak(ease2(clamp01(t / GLINT_S)) * 1.35);
        if (t > GLINT_S + 0.01) { mode = "idle"; ctx.clearRect(0, 0, W, H); return false; }
        return true;
      }
      if (mode === "jelly") return jelly(now);
      if (mode !== "intro") return false;
      const n0 = -0.7894, n1 = 0.6139;
      for (const p of parts) {
        let le = (t - p.dl) / p.du;
        if (le <= 0) { p.on = false; continue; }
        if (le > 1) le = 1;
        const e = ease3(le), bend = Math.sin(Math.PI * e) * p.c;
        p.x = p.sx + (p.hx - p.sx) * e + n0 * bend;
        p.y = p.sy + (p.hy - p.sy) * e + n1 * bend;
        p.s = 1 + (p.S - 1) * e;
        p.on = true;
        p.b = le >= 1 ? 0 : p.k;
      }
      // the solids wipe in from 2.05 s, the points fade from 2.4 s
      wipe(ease2(clamp01((t - 2.05) / 0.55)));
      partA = 1 - ease2(clamp01((t - 2.4) / 0.4));
      if (t > INTRO_END) { finish(); return false; }
      if (partA > 0.002) {
        ctx.globalAlpha = partA;
        for (let b = 0; b < 3; b++) {
          ctx.fillStyle = theme.p[b];
          for (const p of parts) { if (!p.on || p.b !== b) continue; const h = p.s / 2; ctx.fillRect(p.x - h, p.y - h, p.s, p.s); }
        }
        ctx.globalAlpha = 1;
      }
      streak(ease2(clamp01((t - 2.3) / 0.8)) * 1.35);
      return true;
    }
    function loop(now) {
      raf = 0;
      if (!alive) return;
      if (draw(now) !== false) raf = requestAnimationFrame(loop);
    }
    function kick() { if (!raf && alive) raf = requestAnimationFrame(loop); }

    function glint() { if (mode !== "idle" || reduce() || !W || document.hidden) return; mode = "glint"; t0 = performance.now(); kick(); }

    // one step of the jelly: per-point springs towards the pulled shape, then the outline
    function jelly(now) {
      let dt = J.last ? (now - J.last) / 1000 : 1 / 60;
      J.last = now;
      dt = Math.min(Math.max(dt, 0.001), 1 / 30);
      const h = dt / 2;
      if (J.rest) { mode = "idle"; J.last = 0; J.rest = false; L.style.opacity = R.style.opacity = 1; ctx.clearRect(0, 0, W, H); return false; }
      let mx = 0, mv = 0;
      for (let s = 0; s < 2; s++) {
        J.va += (-420 * J.a - 13 * J.va) * h; J.a += J.va * h; // a tap: a squish that springs back out
        for (const poly of OUT) for (const p of poly) {
          const tx = p.w * J.tx + 0.07 * J.tx + p.w * J.a * p.nx, ty = p.w * J.ty + 0.07 * J.ty + p.w * J.a * p.ny;
          const k = J.grab ? 380 + 700 * p.w : 210 + 140 * p.w;
          const c = 2 * Math.sqrt(k) * (J.grab ? 0.9 : 0.3); // let go: it overshoots, comes back once or twice and settles
          p.vx += (k * (tx - p.ux) - c * p.vx) * h; p.vy += (k * (ty - p.uy) - c * p.vy) * h;
          p.ux += p.vx * h; p.uy += p.vy * h;
          if (s) { mx = Math.max(mx, Math.abs(p.ux), Math.abs(p.uy)); mv = Math.max(mv, Math.abs(p.vx), Math.abs(p.vy)); }
        }
      }
      if (!J.grab && (mx + Math.abs(J.a)) * sc < 0.25 && (mv + Math.abs(J.va)) * sc < 4) {
        for (const poly of OUT) for (const p of poly) p.ux = p.uy = p.vx = p.vy = 0;
        J.a = J.va = 0; J.rest = true;
      }
      ctx.fillStyle = theme.fg;
      OUT.forEach((poly, side) => {
        const x0 = side ? oxR : ox;
        ctx.beginPath();
        poly.forEach((p, i) => { const x = (p.x + p.ux) * sc + x0, y = (p.y + p.uy) * sc + oy; if (i) ctx.lineTo(x, y); else ctx.moveTo(x, y); });
        ctx.closePath(); ctx.fill();
      });
      return true;
    }
    const symAt = (e) => { const r = stage.getBoundingClientRect(); return [(e.clientX - r.left - ox) / sc, (e.clientY - r.top - oy) / sc]; };
    function weigh() {
      for (const poly of OUT) for (const p of poly) {
        const dx = p.x - J.gx, dy = p.y - J.gy, d = Math.hypot(dx, dy) || 1;
        p.w = Math.exp(-(dx * dx + dy * dy) / (2 * SIG * SIG));
        p.nx = dx / d; p.ny = dy / d;
      }
    }
    const down = (e) => {
      if (!opts.jelly || mode === "intro" || J.grab || !W) return;
      const [x, y] = symAt(e);
      if (x < 96 || x > 398 || y < 90 || y > 390) return; // only the N itself, with a little margin
      e.preventDefault();
      try { stage.setPointerCapture(e.pointerId); } catch (err) { /* fine */ }
      const wobbling = mode === "jelly";
      if (!wobbling) { mode = "jelly"; J.last = 0; J.tx = J.ty = 0; J.a = J.va = 0; L.style.opacity = R.style.opacity = 0; }
      if (!wobbling || Math.hypot(J.tx, J.ty) < 2) { J.gx = x; J.gy = y; weigh(); }
      J.d0x = J.tx; J.d0y = J.ty; J.sx = x; J.sy = y;
      J.grab = true; J.id = e.pointerId; J.moved = false; J.rest = false;
      stage.style.touchAction = "none";
      kick();
    };
    const move = (e) => {
      if (!J.grab || e.pointerId !== J.id) return;
      const [x, y] = symAt(e);
      const rx = J.d0x + x - J.sx, ry = J.d0y + y - J.sy, len = Math.hypot(rx, ry);
      if (Math.hypot(x - J.sx, y - J.sy) > 4) J.moved = true;
      const f = len > 0 ? (RUB * Math.tanh(len / RUB)) / len : 0; // rubber band: the further you pull, the harder it gets
      J.tx = rx * f; J.ty = ry * f;
    };
    // a grab always ends: let go, cancel, or losing the pointer
    const release = (e) => {
      if (!J.grab || (e && e.pointerId !== J.id)) return;
      J.grab = false; J.id = null;
      if (!J.moved) J.va -= 300; // a tap is a poke: it squishes in and boings back
      J.tx = J.ty = 0;
      stage.style.touchAction = "pan-y";
      kick();
    };
    stage.addEventListener("pointerdown", down);
    stage.addEventListener("pointermove", move);
    ["pointerup", "pointercancel", "lostpointercapture"].forEach((ev) => stage.addEventListener(ev, release));
    const onResize = () => { if (!alive) return; const was = mode; size(); if (was !== "intro") finish(); };
    global.addEventListener("resize", onResize);
    if (opts.glintEvery > 0) timer = setInterval(glint, opts.glintEvery);

    size();
    if (opts.autoplay) requestAnimationFrame(play); else { wipe(0); }

    return {
      element: stage,
      replay: play,
      glint,
      setTheme(name) { theme = THEMES[name] || theme; fill(); if (mode === "idle") finish(); },
      // one exact frame at ms after the start, for recordings (no timers, no requestAnimationFrame):
      // the intro until 3.15 s, then the settled N; pass glintAt (ms) to add one glint after it
      renderAt(ms, glintAt) {
        if (raf) { cancelAnimationFrame(raf); raf = 0; }
        if (ms < INTRO_END * 1000) {
          if (mode !== "intro") { mode = "intro"; partA = 1; L.style.opacity = R.style.opacity = 1; }
          t0 = 0; draw(ms); return;
        }
        finish();
        if (glintAt != null && ms >= glintAt && ms <= glintAt + GLINT_S * 1000) { mode = "glint"; t0 = glintAt; draw(ms); mode = "idle"; }
      },
      destroy() { alive = false; clearInterval(timer); global.removeEventListener("resize", onResize); if (raf) cancelAnimationFrame(raf); stage.remove(); },
    };
  }

  global.NBIMLogo = { create, THEMES };
})(window);
