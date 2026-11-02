/* ==========================================================================
   The reveal. The Opening Bell course is the fund's value since 1998, so
   finishing it is the chart: the camera pulls back until the whole course
   is on screen, settles on 1998-2025 while the runner nips back to the
   start, and then he runs the long run again with the course turning into
   the chart behind him. Exposed as window.LongRunReveal.
   ========================================================================== */
(function () {
  "use strict";
  var $ = function (s) { return document.querySelector(s); };
  var reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  var MID = "#001538", SEA = "#4ec2e2", SAND = "#f4cea4", EDGE = "#0026ff", POLAR = "#c3e9ee", DOWN = "#ef954a", SKY = "#f5f2eb";
  var NX = 0.78; // the N diagonal: across per unit down
  // timeline (ms): hold on the finish · pull back until the whole course is in view · settle on 1998-2025
  // while the runner nips back to the start · run the long run again, the course turning into the chart behind him
  var T = { fade: 300, hold: 900, zoom: 4400, refit: 5900, beat: 6250, run1: 9650, out: 10250, done: 10350 };
  var root, canvas, ctx, copy, deck, deckMode, deckYear, skipBtn, doneBtn, run = null;

  var clamp = function (t) { return Math.max(0, Math.min(1, t)); };
  var ease = function (t) { t = clamp(t); return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; };
  var easeOut = function (t) { t = clamp(t); return 1 - Math.pow(1 - t, 3); };
  var lerp = function (a, b, t) { return a + (b - a) * t; };
  var lerpLog = function (a, b, t) { return Math.exp(lerp(Math.log(a), Math.log(b), t)); };

  /* ---- course recorder: remembers what was on the track ---------------- */
  var course = { items: [], keys: Object.create(null), lastT: -1 };
  function resetCourse() { course.items = []; course.keys = Object.create(null); }
  function sample() {
    var lr = window.longRun; if (!lr || lr.state !== "playing") return;
    var c; try { c = lr.course; } catch (e) { return; }
    if (!c || c.mode !== "chapter" || c.district !== "opening") return;
    if (c.t < course.lastT - 0.5) resetCourse();
    course.lastT = c.t;
    if (c.flight || c.contrarian || c.transfer) return;
    var near = function (x) { return x > c.x - 60 && x < c.x + 1100; };
    var put = function (key, item) { if (course.keys[key]) return; course.keys[key] = 1; course.items.push(item); };
    c.obstacles.forEach(function (o) {
      if (!near(o.x)) return;
      var X = c.d + (o.x - c.x);
      put("o" + o.type + Math.round(X / 12), { cls: "obstacle", X: X, w: o.w, data: { type: o.type, w: o.w, h: o.h, label: o.label, theme: o.theme } });
    });
    c.platforms.forEach(function (o) {
      if (!near(o.x)) return;
      var X = c.d + (o.x - c.x);
      put("p" + o.id, { cls: "platform", X: X, w: o.w, dy: o.y - c.floor(o.x), data: { w: o.w, kind: o.kind, premium: o.premium, active: true } });
    });
    c.pickups.forEach(function (o) {
      if (o.taken || o.kind === "contrarian" || !near(o.x)) return;
      var X = c.d + (o.x - c.x), dy = o.y - c.floor(o.x);
      put("k" + o.kind + Math.round(X / 8) + "_" + Math.round(dy / 8), { cls: "pickup", X: X, w: 30, dy: dy, data: { kind: o.kind } });
    });
    c.springs.forEach(function (o) {
      if (!near(o.x)) return;
      var X = c.d + (o.x - c.x);
      put("s" + Math.round(X / 12), { cls: "spring", X: X, w: o.w, data: { w: o.w } });
    });
  }
  setInterval(sample, 140);

  /* ---- DOM ------------------------------------------------------------- */
  function build() {
    root = document.createElement("section");
    root.id = "history-reveal"; root.className = "history-reveal"; root.hidden = true;
    root.setAttribute("aria-label", "What you just ran");
    root.innerHTML =
      '<canvas class="hr-canvas" aria-hidden="true"></canvas>' +
      '<div class="hr-deck" aria-hidden="true"><span class="hr-mode">◀◀ REWIND</span><strong class="hr-year">2025</strong></div>' +
      '<div class="hr-copy">' +
        '<span class="eyebrow">WHAT YOU JUST RAN</span>' +
        '<h2>28 years<br><span>of the fund.</span></h2>' +
        "<p>The course was the fund. Every climb and every dip was its value, year by year, 1998 to 2025. Down in some years. Up over the long run.</p>" +
        '<div class="hr-stats"><div><strong>6.6%</strong><small>ANNUALISED RETURN<br>SINCE 1998</small></div>' +
        '<div><strong>×6.05</strong><small>GROWTH OF 1 INVESTED<br>AT THE START OF 1998</small></div></div>' +
      "</div>" +
      '<button type="button" class="hr-skip">Skip ▸▸</button>' +
      '<button type="button" class="primary hr-done">See your result <span aria-hidden="true">→</span></button>';
    $("#stage").appendChild(root);
    canvas = root.querySelector(".hr-canvas"); ctx = canvas.getContext("2d");
    copy = root.querySelector(".hr-copy"); deck = root.querySelector(".hr-deck");
    deckMode = root.querySelector(".hr-mode"); deckYear = root.querySelector(".hr-year");
    skipBtn = root.querySelector(".hr-skip"); doneBtn = root.querySelector(".hr-done");
    skipBtn.addEventListener("click", function () { if (run) run.skip = true; });
    doneBtn.addEventListener("click", finish);
    addEventListener("keydown", function (e) {
      if (!run || root.hidden) return;
      if (e.code === "Space" || e.code === "Enter" || e.code === "Escape") {
        e.preventDefault(); e.stopPropagation();
        if (run.phase === "done") finish(); else run.skip = true;
      }
    }, true);
  }
  function tint(img) {
    if (!img || !img.naturalWidth) return null;
    var c = document.createElement("canvas"); c.width = img.naturalWidth; c.height = img.naturalHeight;
    var g = c.getContext("2d"); g.drawImage(img, 0, 0); g.globalCompositeOperation = "source-in"; g.fillStyle = EDGE; g.fillRect(0, 0, c.width, c.height);
    return c;
  }

  /* ---- geometry ------------------------------------------------------- */
  // Heights are in world units above street level (the summit and the finish are at 0, 1998 is -rise).
  function layout(r) {
    var W = root.clientWidth, H = root.clientHeight, dpr = Math.min(2, devicePixelRatio || 1);
    if (canvas.width !== Math.round(W * dpr) || canvas.height !== Math.round(H * dpr)) { canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr); }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    // one design frame, 1280 x 720: u is this screen's scale against it (the CSS sizes use it too), and the
    // chart always fills the same share of the screen: 6-90% across, 34% of the height, ending at 82%
    var k = H / r.H, h = r.history, u = Math.min(W / 1280, H / 720), tall = W / H < 1.15, compact = u < 0.75, wide = !tall;
    if (root.__u !== u) { root.__u = u; root.style.setProperty("--u", u.toFixed(4) + "px"); }
    root.classList.toggle("is-tall", tall);
    var chart;
    if (!tall) {
      // on small screens the buttons keep a finger-sized minimum: keep the year labels clear of them
      var db = doneBtn.getBoundingClientRect(), rb0 = root.getBoundingClientRect(), bt = db.height ? db.top - rb0.top - Math.max(7, 10 * u) - 22 * u - 8 : H;
      var cbm = Math.min(H * 0.82, bt);
      chart = { l: W * 0.06, r: W * 0.9, b: cbm, t: cbm - H * 0.34 };
    } else {
      var cb = copy.getBoundingClientRect(), rb = root.getBoundingClientRect();
      chart = { l: W * 0.07, r: W * 0.86, t: Math.max(cb.bottom - rb.top + 30 * u, H * 0.4), b: H - 110 * u };
    }
    var mc = (chart.r - chart.l) / (h.x1 - h.x0), ex = (chart.b - chart.t) / h.rise / mc;
    var n = h.index.length - 1, S = h.rise / (h.index[n] - 1);
    return { W: W, H: H, k: k, u: u, dpr: dpr, compact: compact, wide: wide, chart: chart, mc: mc, ex: ex, S: S, end: h.index[n], col: h.col };
  }
  var hill = function (r, X) { return r.ground - r.at(X); };
  var sxOf = function (v, X) { return v.a + X * v.m; };
  var syOf = function (v, hgt) { return v.base - hgt * v.sy; };
  // the game camera at the finish line
  function gameView(g, r) { return { z: 0, m: g.k, a: r.x * g.k - r.distance * g.k, base: (r.ground + r.camera) * g.k, sy: g.k }; }
  // the whole level, start line to listing bell, at true proportions
  function levelView(g, r) {
    var D = r.distance, m = (g.W * 0.9) / D, sy = m, mid = g.wide ? g.H * 0.6 : (g.chart.t + g.chart.b) / 2;
    return { z: 1, m: m, a: g.W * 0.05, base: mid - (r.history.rise * sy) / 2, sy: sy };
  }
  // the same course, framed on 1998-2025: the chart is the course
  function chartView(g, r) {
    var h = r.history, m = g.mc, sy = m * g.ex;
    return { z: 1, m: m, a: g.chart.l - h.x0 * m, base: g.chart.b - h.rise * sy, sy: sy };
  }
  function mixView(v0, v1, u) {
    return { z: lerp(v0.z, v1.z, u), m: lerpLog(v0.m, v1.m, u), a: lerp(v0.a, v1.a, u), base: lerp(v0.base, v1.base, u), sy: lerpLog(v0.sy, v1.sy, u) };
  }
  // pulling back about the finish line: it drifts to its place as the whole course opens up to its left
  function zoomView(g, r, z) {
    var v0 = gameView(g, r), v1 = levelView(g, r), D = r.distance;
    var m = lerpLog(v0.m, v1.m, z), sy = lerpLog(v0.sy, v1.sy, z), e = easeOut(Math.min(1, z * 1.25));
    var fx = lerp(sxOf(v0, D), sxOf(v1, D), e), fy = lerp(syOf(v0, hill(r, D)), syOf(v1, hill(r, D)), e);
    return { z: z, m: m, a: fx - D * m, base: fy + hill(r, D) * sy, sy: sy };
  }
  // a little sideways move between two framings, keeping the scale change smooth
  function refitView(g, r, u) { return mixView(levelView(g, r), chartView(g, r), u); }

  /* ---- the game scene, redrawn ------------------------------------------ */
  function drawCity(g, r, s, veil) {
    var img = r.backdrop, TW = 1120 * g.k;
    ctx.fillStyle = "#0b1430"; ctx.fillRect(0, 0, g.W, g.H);
    if (img && img.naturalWidth) {
      if (window.LR_SCENERY) {
        ctx.save(); ctx.scale(g.k, g.k);
        LR_SCENERY.draw2d(ctx, "opening", img, s / 0.000105, g.W / g.k, g.H / g.k, "chapter");
        ctx.restore();
      } else ctx.drawImage(img, -Math.min(Math.max(0, s * TW), Math.max(0, TW - g.W)), 0, TW, g.H);
      ctx.fillStyle = "rgba(0,0,0,.12)"; ctx.fillRect(0, 0, g.W, g.H);
    }
    if (window.LR_KABIN && LR_KABIN.drawScreen) LR_KABIN.drawScreen(ctx, s, g.k, g.W);
    if (veil > 0) { ctx.globalAlpha = veil; ctx.fillStyle = MID; ctx.fillRect(0, 0, g.W, g.H); ctx.globalAlpha = 1; }
  }
  function groundPts(g, r, v, x0, x1) {
    var pts = [], step = 3;
    for (var x = x0; x <= x1 + step; x += step) { var X = (Math.min(x, x1) - v.a) / v.m; pts.push([Math.min(x, x1), syOf(v, hill(r, X))]); }
    return pts;
  }
  function strokePts(pts, dx, dy, col, w) { ctx.beginPath(); pts.forEach(function (p, i) { i ? ctx.lineTo(p[0] + dx, p[1] + dy) : ctx.moveTo(p[0] + dx, p[1] + dy); }); ctx.strokeStyle = col; ctx.lineWidth = w; ctx.stroke(); }
  function drawTerrain(g, r, v) {
    var pts = groundPts(g, r, v, -24, g.W + 24), sc = Math.max(0.45, Math.min(1, v.m / g.k)) * g.k;
    ctx.beginPath(); ctx.moveTo(-24, g.H + 10); pts.forEach(function (p) { ctx.lineTo(p[0], p[1]); }); ctx.lineTo(g.W + 24, g.H + 10); ctx.closePath();
    var top = Math.min.apply(null, pts.map(function (p) { return p[1]; }));
    var gr = ctx.createLinearGradient(0, top, 0, Math.max(top + 40, g.H)); gr.addColorStop(0, "#1c3340"); gr.addColorStop(0.25, "#0a1b2b"); gr.addColorStop(1, "#06121e");
    ctx.fillStyle = gr; ctx.fill();
    // the game's lane marks, fading as the camera pulls back
    var ga = 1 - v.z; if (ga > 0.02) {
      ctx.save(); ctx.globalAlpha = ga;
      var step = 120 * v.m, x0 = ((v.a % step) + step) % step - step;
      for (var x = x0; x < g.W + step; x += step) {
        var y = syOf(v, hill(r, (x - v.a) / v.m));
        ctx.strokeStyle = "#7d929723"; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x, y + 14 * v.m); ctx.lineTo(x, y + 108 * v.m); ctx.stroke();
        ctx.fillStyle = "#b2b8a34d"; ctx.fillRect(x + 9 * v.m, y + 14 * v.m, 4 * v.m, 4 * v.m);
      }
      ctx.restore();
    }
    strokePts(pts, 0, 0, "#071622", 9 * sc); strokePts(pts, 0, 7 * sc, "#526a6f", 3 * sc); strokePts(pts, 0, 0, "#a8c7bc", Math.max(2, 2 * sc));
  }
  function withArt(r, fn) {
    var art = r.art; if (!art) return;
    var prev = art.c; art.c = ctx;
    try { fn(art); } catch (e) {} finally { art.c = prev; }
  }
  function drawItems(g, r, v, time) {
    var a = clamp((v.m / g.k - 0.05) / 0.12); if (a <= 0) return;
    ctx.save(); ctx.globalAlpha = a;
    withArt(r, function (art) {
      course.items.forEach(function (it) {
        var x = sxOf(v, it.X); if (x + it.w * v.m < -40 || x - 40 > g.W) return;
        var y = syOf(v, hill(r, it.X));
        ctx.save(); ctx.translate(x, y); ctx.scale(v.m, v.m);
        var d = Object.assign({ x: 0, y: it.dy || 0 }, it.data);
        if (it.cls === "obstacle") art.obstacle(d, 0, 0, 1e6);
        else if (it.cls === "platform") art.platform(d, 0, 1e6, time);
        else if (it.cls === "pickup") art.pickup(d, 0, time, false);
        else if (it.cls === "spring") art.spring({ x: 0, y: 0, w: d.w, used: false }, 0);
        ctx.restore();
      });
      // the listing bell where the chapter ended
      var bx = sxOf(v, r.distance);
      if (bx > -260 && bx < g.W + 260) { ctx.save(); ctx.translate(bx, syOf(v, hill(r, r.distance))); ctx.scale(v.m, v.m); art.listingBell(0, 0, time, true); ctx.restore(); }
    });
    ctx.restore();
  }
  // once the real art is too small to read, the course keeps its game texture as a level map:
  // coins become sand dots, hazards little red blocks, platforms thin rails, and the bell a sand pin
  function drawMarkers(g, r, v, alpha) {
    var a = alpha * (1 - clamp((v.m / g.k - 0.05) / 0.12)); if (a <= 0.02) return;
    ctx.save(); ctx.globalAlpha = a;
    course.items.forEach(function (it) {
      var x = sxOf(v, it.X); if (x < -10 || x > g.W + 10) return;
      var y = syOf(v, hill(r, it.X));
      if (it.cls === "pickup") {
        var py = y + Math.max(-26, (it.dy || 0) * v.m * 3);
        ctx.fillStyle = it.data.kind === "dividend" || it.data.kind === "opportunity" ? SAND : SEA;
        ctx.beginPath(); ctx.arc(x, py - 3, 1.7, 0, Math.PI * 2); ctx.fill();
      } else if (it.cls === "obstacle" && it.data.type !== "gap") {
        ctx.fillStyle = "#b37e6c"; ctx.fillRect(x, y - 6, Math.max(2.5, it.w * v.m), it.data.type === "high" ? 3 : 6);
      } else if (it.cls === "platform") {
        ctx.fillStyle = "#a8c7bc"; ctx.fillRect(x, y + Math.max(-30, (it.dy || 0) * v.m * 3), Math.max(3, it.w * v.m), 1.6);
      }
    });
    var bx = sxOf(v, r.distance), by = syOf(v, hill(r, r.distance));
    if (bx > -10 && bx < g.W + 10) { ctx.fillStyle = SAND; ctx.beginPath(); ctx.moveTo(bx - 5, by - 2); ctx.lineTo(bx + 5, by - 2); ctx.lineTo(bx, by - 11); ctx.closePath(); ctx.fill(); ctx.fillRect(bx - 0.75, by - 11, 1.5, 9); }
    ctx.restore();
  }

  /* ---- the chart: the course itself, in the fund's colours -------------- */
  function yearX(r, i) { return r.history.x0 + i * r.history.col; }
  function drawChart(g, r, v, X, labelsUpTo) {
    var h = r.history, n = h.years.length, x0 = h.x0, base = syOf(v, -h.rise), fs = Math.max(7, 10 * g.u);
    var Xe = Math.max(x0, Math.min(X, h.x1));
    // value grid, x1 to x6
    ctx.save(); ctx.font = "700 " + fs + "px 'Norges Bank', Arial, sans-serif"; ctx.textBaseline = "middle"; ctx.textAlign = "left";
    var gl = sxOf(v, x0) - 10, gr2 = sxOf(v, h.x1) + 6, fade = ctx.createLinearGradient(gl, 0, gr2, 0);
    fade.addColorStop(0, "rgba(195,233,238,0)"); fade.addColorStop(0.45, "rgba(195,233,238,.15)"); fade.addColorStop(1, "rgba(195,233,238,.18)");
    [1, 2, 3, 4, 5, 6].forEach(function (mul) {
      var y = syOf(v, g.S * (mul - g.end)); if (y < -10) return;
      ctx.strokeStyle = mul === 1 ? POLAR : fade; ctx.lineWidth = mul === 1 ? 2.4 : 1;
      ctx.beginPath(); ctx.moveTo(gl, y); ctx.lineTo(gr2, y); ctx.stroke();
      if (mul === 1 || mul === 2 || mul === 4) { ctx.fillStyle = mul === 1 ? POLAR : "rgba(195,233,238,.62)"; ctx.fillText("×" + mul, gr2 + 6, y); }
    });
    ctx.restore();
    // the area the fund has grown, up to where the runner is
    var pts = []; for (var px = sxOf(v, x0); px <= sxOf(v, Xe) + 2; px += 2) { var XX = Math.min((px - v.a) / v.m, Xe); pts.push([sxOf(v, XX), syOf(v, hill(r, XX))]); }
    if (pts.length > 1) {
      ctx.beginPath(); ctx.moveTo(pts[0][0], base); pts.forEach(function (p) { ctx.lineTo(p[0], p[1]); }); ctx.lineTo(pts[pts.length - 1][0], base); ctx.closePath();
      var top = syOf(v, 0), ag = ctx.createLinearGradient(0, top, 0, base); ag.addColorStop(0, "rgba(78,194,226,.34)"); ag.addColorStop(1, "rgba(78,194,226,.05)");
      ctx.fillStyle = ag; ctx.fill();
      // the line, with the brand's offset shadow; the down years in orange
      var w = Math.max(3, 6 * g.u), off = w * 0.8;
      ctx.save(); ctx.lineJoin = "round"; ctx.lineCap = "round";
      strokePts(pts, off * NX, off, EDGE, w);
      strokePts(pts, 0, 0, SAND, w);
      h.years.forEach(function (yr, i) {
        if (yr[1] >= 0) return;
        var a = sxOf(v, yearX(r, i)), b = Math.min(sxOf(v, yearX(r, i + 1)), sxOf(v, Xe)); if (b <= a) return;
        strokePts(pts.filter(function (p) { return p[0] >= a - 1 && p[0] <= b + 1; }), 0, 0, DOWN, w);
      });
      ctx.restore();
    }
    // years along the baseline, and the two big dips
    ctx.save(); ctx.textAlign = "center";
    h.years.forEach(function (yr, i) {
      var xc = sxOf(v, yearX(r, i) + h.col / 2), passed = clamp((sxOf(v, labelsUpTo) - xc) / 30);
      if (passed <= 0) return;
      var full = i === 0 || i === n - 1;
      ctx.globalAlpha = passed;
      ctx.fillStyle = POLAR; ctx.fillRect(sxOf(v, yearX(r, i)) - 0.5, base - 3, 1, 6);
      if (full || (!g.compact ? i % 3 === 0 : i % 4 === 0)) {
        ctx.textBaseline = "top"; ctx.font = "700 " + fs + "px 'Norges Bank', Arial, sans-serif"; ctx.fillStyle = full ? SKY : POLAR;
        ctx.fillText(full ? String(yr[0]) : "’" + String(yr[0]).slice(2), xc, base + 8);
      }
      if (yr[0] === 2008 || yr[0] === 2022) { // over the peak the year fell from
        var px2 = sxOf(v, yearX(r, i)), py2 = syOf(v, hill(r, yearX(r, i)));
        ctx.font = "800 " + (fs + 2) + "px 'Norges Bank', Arial, sans-serif"; ctx.fillStyle = DOWN; ctx.textBaseline = "bottom";
        ctx.fillText(yr[0] + "  −" + Math.abs(yr[1]).toFixed(1) + "%", px2 + (sxOf(v, yearX(r, i + 1)) - px2) * 0.5, py2 - 12);
      }
    });
    ctx.restore();
    // the stretch after 2025 that the run went on to (the IPO and the listing bell), faded
    var fx = sxOf(v, h.x1);
    if (fx < g.W) {
      ctx.save(); ctx.globalAlpha = 0.35; ctx.setLineDash([4, 6]);
      strokePts([[fx + 28, syOf(v, 0)], [Math.min(g.W + 10, sxOf(v, r.distance)), syOf(v, 0)]], 0, 0, POLAR, 2);
      ctx.restore();
    }
  }
  function drawTip(g, r, v, alpha) {
    var h = r.history, x = sxOf(v, h.x1), y = syOf(v, 0), w = Math.max(3, 6 * g.u), a = w * 3.2, off = w * 0.8;
    ctx.save(); ctx.globalAlpha = alpha; ctx.lineCap = "square"; ctx.lineJoin = "miter";
    [[off * NX, off, EDGE], [0, 0, SAND]].forEach(function (s) {
      ctx.beginPath(); ctx.moveTo(x - a + s[0], y + s[1]); ctx.lineTo(x + s[0], y + s[1]); ctx.lineTo(x + s[0], y + a + s[1]);
      ctx.strokeStyle = s[2]; ctx.lineWidth = w; ctx.stroke();
    });
    ctx.font = "800 " + Math.max(11, 17 * g.u) + "px 'Norges Bank', Arial, sans-serif"; ctx.fillStyle = SAND; ctx.textAlign = "right"; ctx.textBaseline = "bottom";
    ctx.fillText("×" + g.end.toFixed(2), x - a - 8, y - 6);
    ctx.restore();
  }

  /* ---- the runner, from the game's own sprite sheets -------------------- */
  function drawRunner(r, x, y, cell, frame, sheet, anchor, alpha, shadow) {
    var img = sheet === "flip" ? r.flip : r.atlas, sh = sheet === "flip" ? run.tFlip : run.tAtlas;
    if (!img || !img.naturalWidth || alpha <= 0) return;
    var sx = (frame % 4) * 512, sy = Math.floor(frame / 4) * 512, left = x - cell / 2, top = anchor === "feet" ? y - cell * (460 / 512) : y - cell / 2;
    ctx.save(); ctx.globalAlpha = alpha;
    if (shadow > 0 && sh) { ctx.globalAlpha = alpha * shadow; ctx.drawImage(sh, sx, sy, 512, 512, left + cell * 0.035, top + cell * 0.045, cell, cell); ctx.globalAlpha = alpha; }
    ctx.drawImage(img, sx, sy, 512, 512, left, top, cell, cell);
    ctx.restore();
  }

  /* ---- the wipe: the city on one side, the chart on the other ---------- */
  function clipSide(g, front, yRef, left) {
    var y0 = -20, y1 = g.H + 20, xa = front + (y0 - yRef) * NX, xb = front + (y1 - yRef) * NX;
    ctx.beginPath();
    if (left) { ctx.moveTo(-20, y0); ctx.lineTo(xa, y0); ctx.lineTo(xb, y1); ctx.lineTo(-20, y1); }
    else { ctx.moveTo(xa, y0); ctx.lineTo(g.W + 20, y0); ctx.lineTo(g.W + 20, y1); ctx.lineTo(xb, y1); }
    ctx.closePath(); ctx.clip();
  }
  function drawEdge(g, front, yRef) {
    var y0 = -20, y1 = g.H + 20;
    [[4, 5, EDGE, 3], [0, 0, SEA, 3]].forEach(function (s) {
      ctx.beginPath(); ctx.moveTo(front + (y0 - yRef) * NX + s[0], y0 + s[1]); ctx.lineTo(front + (y1 - yRef) * NX + s[0], y1 + s[1]);
      ctx.strokeStyle = s[2]; ctx.lineWidth = s[3]; ctx.stroke();
    });
  }

  function setDeck(mode, year, on) {
    if (deck.dataset.mode !== mode) { deck.dataset.mode = mode; deckMode.textContent = mode === "rewind" ? "◀◀ REWIND" : "▶ THE LONG RUN"; }
    var ys = String(year); if (deckYear.textContent !== ys) { deckYear.textContent = ys; deckYear.classList.remove("tick"); void deckYear.offsetWidth; deckYear.classList.add("tick"); }
    deck.classList.toggle("is-on", on);
  }
  function yearAt(r, X) { var h = r.history; return h.years[Math.max(0, Math.min(h.years.length - 1, Math.floor((X - h.x0) / h.col)))][0]; }

  /* ---- timeline ------------------------------------------------------- */
  function frame(now) {
    if (!run) return;
    var r = run.data, g = layout(r), h = r.history;
    if (run.skip) { run.t0 = now - T.done; run.skip = false; }
    var t = reduce ? 1e9 : now - run.t0, time = r.time + t / 1000;
    ctx.clearRect(0, 0, g.W, g.H);
    canvas.style.opacity = String(clamp(t / T.fade));
    var sEnd = r.scroll * 0.000105, cell = g.H * 0.13, D = r.distance;

    if (t < T.refit) {
      var v, X = D, cellNow, fr, veil, tape = 0;
      if (t < T.zoom) {
        // 1 · pull back from the finish, still the game, until the whole course is on screen
        var z = ease((t - T.hold) / (T.zoom - T.hold));
        v = zoomView(g, r, z);
        cellNow = Math.max(174 * v.m, cell);
        fr = 6 + (Math.floor(time * 2) % 2);
        veil = 0.38 * z;
        setDeck("rewind", 2025, false);
      } else {
        // 2 · settle on 1998-2025; the runner nips back down the course to the start of 1998
        var u = ease((t - T.zoom) / (T.refit - T.zoom)), du = ease((t - T.zoom - 120) / (T.refit - T.zoom - 240));
        v = refitView(g, r, u);
        X = lerp(D, h.x0, du);
        cellNow = cell;
        fr = du <= 0 ? 6 + (Math.floor(time * 2) % 2) : du >= 1 ? 7 : 5 - (Math.floor(t / 62) % 6);
        veil = lerp(0.38, 0.55, u);
        setDeck("rewind", X > h.x1 ? 2025 : yearAt(r, X), du > 0);
        tape = du > 0 && du < 1 ? Math.sin(Math.PI * du) * 0.5 : 0;
      }
      drawCity(g, r, sEnd, veil);
      drawTerrain(g, r, v);
      drawMarkers(g, r, v, 1);
      drawItems(g, r, v, time);
      drawRunner(r, sxOf(v, X), syOf(v, hill(r, X)), cellNow, fr, "atlas", "feet", 1, Math.min(1, v.z * 1.5));
      if (!reduce && tape > 0) { // tracking lines while he runs the tape back
        for (var b = 0; b < 2; b++) {
          var by = ((t * 0.32 + b * g.H * 0.55) % (g.H + 60)) - 30;
          ctx.fillStyle = "rgba(245,242,235," + (0.07 * tape).toFixed(3) + ")"; ctx.fillRect(0, by, g.W, 2 + b * 2);
          ctx.fillStyle = "rgba(78,194,226," + (0.05 * tape).toFixed(3) + ")"; ctx.fillRect(0, by + 5, g.W, 1);
        }
      }
    } else {
      // 3 · the long run again: behind him the course is the chart, ahead of him it is still the city
      var cv = chartView(g, r), pRun = clamp((t - T.beat) / (T.run1 - T.beat));
      var Xr = t < T.beat ? h.x0 : lerp(h.x0, h.x1, pRun * pRun * (3 - 2 * pRun) * 0.25 + pRun * 0.75);
      var rx = sxOf(cv, Xr), ry = syOf(cv, hill(r, Xr)), front;
      if (t < T.beat) front = lerp(-g.H * NX - 20, sxOf(cv, h.x0) - cell * 0.3, easeOut((t - T.refit) / (T.beat - T.refit)));
      else if (t < T.run1) front = rx - cell * 0.08;
      else front = lerp(rx - cell * 0.08, g.W + g.H * NX + 40, ease((t - T.run1) / (T.out - T.run1)));
      var yRef = ry, done = t >= T.run1;
      ctx.save(); clipSide(g, front, yRef, false);
      drawCity(g, r, sEnd, 0.55);
      drawTerrain(g, r, cv);
      drawMarkers(g, r, cv, 0.85);
      ctx.restore();
      ctx.save(); clipSide(g, front, yRef, true);
      ctx.fillStyle = MID; ctx.fillRect(0, 0, g.W, g.H);
      drawChart(g, r, cv, done ? h.x1 : Xr, done ? h.x1 + h.col : Xr);
      ctx.restore();
      if (front < g.W + g.H * NX) drawEdge(g, front, yRef);
      if (done) drawTip(g, r, cv, clamp((t - T.run1) / 300));
      if (t < T.beat) drawRunner(r, sxOf(cv, h.x0), syOf(cv, -h.rise), cell, t > T.beat - 120 ? 6 : 7, "atlas", "feet", 1, 1);
      else if (!done) drawRunner(r, rx, ry, cell, Math.floor(t / 70) % 6, "atlas", "feet", 1, 1);
      else if (t < T.run1 + 750) {
        var uu = (t - T.run1) / 750, ff = Math.min(7, Math.floor(uu * 8)), ex = sxOf(cv, h.x1), ey = syOf(cv, 0);
        drawRunner(r, ex + uu * cell * 1.5, ey - cell * 0.45 - Math.sin(uu * Math.PI) * cell * 0.8, cell, ff, "flip", "centre", uu < 0.65 ? 1 : (1 - uu) / 0.35, 1);
      }
      setDeck("run", t < T.beat ? 1998 : yearAt(r, Math.min(Xr, h.x1 - 1)), t < T.run1 - 250);
      if (t >= T.run1 - 200 && !root.classList.contains("is-told")) root.classList.add("is-told");
      if (t >= T.done && run.phase !== "done") { run.phase = "done"; root.classList.add("is-done"); doneBtn.focus({ preventScroll: true }); }
    }
    run.raf = requestAnimationFrame(frame);
  }

  function finish() {
    if (!run) return;
    var cb = run.onDone; cancelAnimationFrame(run.raf);
    root.classList.add("is-leaving");
    setTimeout(function () { root.hidden = true; root.classList.remove("is-leaving", "is-told", "is-done"); deck.classList.remove("is-on"); run = null; }, 420);
    cb && cb();
  }

  window.LongRunReveal = {
    play: function (data, onDone) {
      if (!root) build();
      if (!data || !data.history) { onDone && onDone(); return false; }
      run = { data: data, t0: performance.now(), onDone: onDone, phase: "playing", skip: false, tAtlas: tint(data.atlas), tFlip: tint(data.flip) };
      root.hidden = false; root.classList.remove("is-told", "is-done", "is-leaving");
      canvas.style.opacity = "0";
      run.raf = requestAnimationFrame(frame);
      return true;
    },
    get active() { return !!run; },
    get course() { return course.items.length; }
  };
  if (document.readyState !== "loading") build(); else addEventListener("DOMContentLoaded", build);
})();
