/* Endless, as a skills game.
   - The pace climbs fast: about 2x by the first minute, 2.5x by two, near 3.5x later on.
   - Every 32 seconds the market changes regime (the same clock as the street themes). Each regime
     tightens the breaks between sections, cuts the jetpack breathers and the hedges, and unlocks
     harder sections: stacked hurdles, double dips, bear traps, flash crashes and whipsaws.
   - From Black Swan on, flash crashes arrive without asking, with a short warning.
   - Skill pays: a streak multiplier (x1 to x5) on everything you clear and collect, close calls for
     clearing a hurdle or a bar by a hair, and your personal best is a flag in the street.
   Exposed as window.LR_ENDLESS; the game calls in at a handful of points (see build.py). */
(function () {
  "use strict";
  var GROUND = 422;
  var REGIMES = [
    { name: "CALM MARKETS", title: "Calm markets. Find your rhythm.", sub: "Find your rhythm.", routes: [1, 2, 3, 4, 5, 6, 7], gap: 1, cruise: 5, hedge: 1, crane: 1 },
    { name: "TURBULENCE", title: "Turbulence. Hurdles come in pairs.", sub: "Faster. The hurdles come in pairs.", routes: [1, 2, 3, 4, 5, 6, 7, 8, 9], gap: 0.8, cruise: 5, hedge: 1, crane: 1.15 },
    { name: "BEAR MARKET", title: "Bear market. Floors give way.", sub: "Floors give way. Look before you leap.", routes: [1, 2, 3, 5, 6, 7, 8, 9, 10, 11], gap: 0.66, cruise: 6, hedge: 0.7, crane: 1.3 },
    { name: "BUBBLE", title: "Bubble. Even the cranes move.", sub: "Everything moves. Even the cranes.", routes: [2, 3, 5, 6, 7, 8, 9, 10, 11, 12], gap: 0.56, cruise: 7, hedge: 0.5, crane: 1.5 },
    { name: "BLACK SWAN", title: "Black swan. Expect the unexpected.", sub: "Flash crashes arrive without asking.", routes: [3, 5, 6, 8, 9, 10, 11, 12], gap: 0.46, cruise: 9, hedge: 0.35, crane: 1.7, swan: 5 },
    { name: "THE LONG RUN", title: "The long run. Only skill compounds.", sub: "Only skill compounds now.", routes: [3, 5, 6, 8, 9, 10, 11, 12], gap: 0.4, cruise: 0, hedge: 0.25, crane: 1.85, swan: 4 }
  ];
  var ROMAN = ["", "", " II", " III", " IV", " V", " VI", " VII", " VIII", " IX", " X"];
  var NAMES = { 8: "STACKED HURDLES", 9: "DOUBLE DIP", 10: "BEAR TRAP", 11: "FLASH CRASH", 12: "WHIPSAW" };
  var on = function (q) { return !!q && q.mode === "endless" && q.procedural === true; };
  var level = function (q) { return Math.floor((q.time || 0) / 32); };
  var regime = function (q) { return REGIMES[Math.min(REGIMES.length - 1, level(q))]; };
  function regimeName(q) { var L = level(q), R = regime(q); return R.name + (L >= REGIMES.length - 1 ? ROMAN[Math.min(10, L - REGIMES.length + 2)] || " " + (L - REGIMES.length + 2) : ""); }
  var stats = function (q) { return q.__lr || (q.__lr = { close: 0, bestStreak: 0, maxSpeed: 0, swanAt: 0, toastAt: -9, bestDist: null, passedBest: false, pops: [], lastLevel: 0 }); };
  var toast = null, sound = null, flash = 0;
  function pop(q, text, life) { stats(q).pops.push({ t: q.time, text: text, life: life }); }
  function say(q, tag, title, dur) { if (toast) { toast(tag, title, dur); stats(q).toastAt = q.time; } }

  function bestKey(q) { return "lr.best.dist.endless"; }
  function readBest(q) { var s = stats(q); if (s.bestDist === null) { try { s.bestDist = Number(localStorage.getItem(bestKey(q))) || 0; } catch (e) { s.bestDist = 0; } } return s.bestDist; }

  /* ---- the soundtrack steps up with the pace: at 1.5x, 2x, 2.5x and 3x it goes up a semitone, which
     makes it 6% faster and a key higher at once, like an arcade gear change. The step lands on the next
     bar line of the track (113.26 bpm, first downbeat 1.18 s), with a riser on the beat before. */
  var MUSIC = {
    sa: null, semis: 0, pending: null, timers: [],
    BAR: 4 * 60 / 113.26, DOWN: 1.1785, STEPS: [1.5, 2, 2.5, 3],
    track: function () { return this.sa && this.sa.track; },
    rate: function (n) { return Math.pow(2, n / 12); },
    set: function (r) { var tr = this.track(); if (!tr) return; try { tr.preservesPitch = false; tr.mozPreservesPitch = false; tr.webkitPreservesPitch = false; } catch (e) {} tr.playbackRate = r; },
    clear: function () { this.timers.forEach(clearTimeout); this.timers = []; this.pending = null; },
    reset: function () { this.clear(); this.semis = 0; var tr = this.track(); if (tr && tr.playbackRate !== 1 && !this.tape) tr.playbackRate = 1; },
    update: function (q) {
      var tr = this.track(); if (!tr || this.tape) return;
      var want = 0, pace = q.speed / 315; this.STEPS.forEach(function (p) { if (pace >= p) want++; });
      // the game resets the rate when it resumes from pause: put it back straight away
      if (!this.pending && Math.abs(tr.playbackRate - this.rate(this.semis)) > 0.001) this.set(this.rate(this.semis));
      if (want <= this.semis || this.pending || tr.paused) return;
      var r = tr.playbackRate, t = tr.currentTime, bar = this.BAR, next = this.DOWN + Math.ceil((t - this.DOWN) / bar) * bar;
      var wait = (next - t) / r; if (wait < 0.75) { wait += bar / r; next += bar; }
      wait = Math.max(0, wait - 0.02); // timers land a frame late
      var self = this, n = this.semis + 1, label = this.STEPS[n - 1];
      this.pending = n;
      this.timers.push(setTimeout(function () { if (!tr.paused) self.riser(wait > 0.55 ? 0.55 : wait); }, Math.max(0, (wait - 0.55) * 1000)));
      this.timers.push(setTimeout(function () {
        self.pending = null;
        if (tr.paused) return; // paused, or the contrarian track is playing: try again on the next bar
        self.semis = n; self.set(self.rate(n)); self.lastErr = Math.round((tr.currentTime - next) * 1000);
        self.stinger(n);
        var qq = window.__lrq; if (qq && on(qq)) pop(qq, "PACE " + label + "\u00d7", 1.2);
        window.LR_FX && LR_FX.regime();
      }, wait * 1000));
    },
    riser: function (d) { var sa = this.sa; if (!sa || !sa.tone) return; sa.tone(196, d, "sawtooth", 0.012, 784); sa.tone(392, d, "triangle", 0.016, 1568); },
    stinger: function (n) {
      var sa = this.sa; if (!sa || !sa.tone) return;
      var root = 392 * this.rate(n); // G, a step higher each time
      sa.tone(root, 0.22, "triangle", 0.026); sa.tone(root * 1.5, 0.26, "triangle", 0.02); sa.tone(root * 2, 0.3, "sine", 0.014);
    },
    // a crash: the tape winds down
    stop: function () {
      var tr = this.track(); if (!tr || tr.paused) return;
      this.clear(); var self = this, r0 = tr.playbackRate, t0 = performance.now();
      this.tape = true;
      // wind down over 0.75 s, hold, then glide back to normal under the (quieter) results screen
      var step = function () {
        var ms = performance.now() - t0, u = Math.min(1, ms / 750), low = Math.max(0.5, r0 * 0.5);
        if (ms < 750) self.set(r0 + (low - r0) * u * u);
        else if (ms < 1000) self.set(low);
        else self.set(low + (1 - low) * Math.min(1, (ms - 1000) / 900));
        if (ms < 1900) requestAnimationFrame(step); else { self.set(1); self.tape = false; self.semis = 0; }
      };
      requestAnimationFrame(step);
    }
  };

  window.LR_MUSIC = MUSIC;
  window.LR_ENDLESS = {
    on: on,
    // pace: 340 -> about 1160 units/s, two-thirds of the way there by three minutes
    speed: function (t) { return 340 + 820 * (1 - Math.exp(-t / 150)); },
    speedAt: function (q, t) { return on(q) ? this.speed(t) : null; },
    // which sections the spawner may pick next (never empty, never the last three)
    routes: function (q) {
      var R = regime(q), s = stats(q);
      if (R.swan && q.spawnCount - s.swanAt >= R.swan && q.recent.slice(-2).indexOf(11) < 0) {
        s.swanAt = q.spawnCount; s.swanWarn = true;
        return [11];
      }
      var list = R.routes.filter(function (r) { return q.recent.slice(-3).indexOf(r) < 0; });
      return list.length ? list : R.routes.slice();
    },
    cruise: function (q, t) { var c = regime(q).cruise; return c > 0 && t > 0 && t % c === 3; },
    gap: function (q) { return regime(q).gap; },
    routeName: function (r) { return NAMES[r] || ""; },
    // the new sections; g(x) hurdle, l(x) bar, E(x, w) gap, all in section units scaled by r
    spawn: function (q, a, o, r, g, l, E, I) {
      var T = GROUND;
      if (a === 8) { // stacked hurdles: hop, land, hop again, or one long jump and a somersault
        g(100); g(298); g(620);
        q.trail(o + 120 * r, T - 150, 150 * r, 4, "opportunity"); q.trail(o + 620 * r, T - 130, 60 * r, 2, "opportunity");
        return 820 * r;
      }
      if (a === 9) { // double dip: two pits with a short landing between
        E(120, 150); E(440, 150);
        q.trail(o + 140 * r, T - 140, 110 * r, 3, "opportunity"); q.trail(o + 460 * r, T - 140, 110 * r, 3, "opportunity");
        q.trail(o + 300 * r, T - 36, 100 * r, 2, "dividend");
        return 800 * r;
      }
      if (a === 10) { // bear trap: duck the bar, then jump the pit straight away
        l(120); E(300, 140); g(640);
        q.trail(o + 140 * r, T - 34, 70 * r, 3, "dividend"); q.trail(o + 320 * r, T - 150, 100 * r, 3, "opportunity");
        return 840 * r;
      }
      if (a === 11) { // flash crash: the floor goes; cross on roofs that give way under you
        E(150, 980);
        var hs = [62, 104, 74, 112];
        for (var k = 0; k < 4; k++) {
          var P = q.platform(o + (172 + k * 250) * r, T - hs[k], 170 * r, "crumble");
          q.trail(P.x + 30 * r, P.y - 42, P.w - 60 * r, 3, k === 3 ? "opportunity" : "dividend", P);
        }
        if (stats(q).swanWarn) { stats(q).swanWarn = false; say(q, "BLACK SWAN", "Flash crash ahead. Stay on the roofs.", 2); flash = 0.6; }
        return 1260 * r;
      }
      if (a === 12) { // whipsaw: six turns, hurdle, bar, hurdle, bar...
        var Q = 262 * r;
        for (var n = 0; n < 6; n++) {
          var h = q.hazard(n % 2 ? "high" : "low", o + 100 * r + n * Q, (n % 2 ? 105 : 58) * r);
          q.trail(h.x + 10 * r, T - (n % 2 ? 30 : 124), 40 * r, 2, "opportunity");
        }
        return 100 * r + 6 * Q + 150 * r;
      }
      return I;
    },
    // after any section: faster cranes, fewer hedges as the regime hardens
    after: function (q, n) {
      if (!on(q)) return;
      var R = regime(q);
      q.platforms.slice(n.platforms).forEach(function (p) { if (p.kind === "crane") { p.frequency *= R.crane; p.amp *= 1 + (R.crane - 1) * 0.8; } });
      q.pickups.slice(n.pickups).forEach(function (p) { if (p.kind === "diversification" && q.random() > R.hedge) p.kind = "opportunity"; });
    },
    // the streak: x1 at the start, one step up every six clears, up to x5
    mult: function (q) { return on(q) ? 1 + Math.min(4, Math.floor(q.flow / 6)) : 1; },
    // close calls: track the smallest clearance while the body is over a hurdle or under a bar
    near: function (q, o, g, box) {
      if (!on(q) || o.type === "gap") return;
      if (g.x + g.w <= box.x || g.x >= box.x + box.w) return;
      var c = o.type === "high" ? g.y - (box.y + box.h) : box.y - (g.y + g.h);
      if (c >= 0) o.__clr = Math.min(o.__clr == null ? 1e9 : o.__clr, c);
    },
    cleared: function (q, o) {
      if (!on(q)) return;
      var s = stats(q); s.bestStreak = Math.max(s.bestStreak, q.flow);
      if (o.__clr != null && o.__clr < 13 && !q.dead) {
        s.close++;
        var b = 50 * this.mult(q); q.bonus += b;
        pop(q, "CLOSE CALL +" + b, 0.9);
        window.LR_FX && LR_FX.close();
        sound && sound.tone(880, 0.09, "sine", 0.02, 1320);
      }
      if (q.flow > 0 && q.flow % 6 === 0 && q.flow <= 24) {
        pop(q, "STREAK ×" + this.mult(q), 1.1);
        sound && sound.tone(660, 0.12, "triangle", 0.02, 990);
      }
    },
    // theme changes are regime changes in Endless: say the regime instead of the street
    regimeToast: function (q, Ge, A) {
      if (!on(q)) { Ge(A.name, A.title, 2.6); return; }
      toast = Ge; var L = level(q), R = regime(q);
      say(q, "LEVEL " + (L + 1) + " · PACE " + (this.speed(q.time + 2) / 315).toFixed(1) + "×", L >= REGIMES.length - 1 ? R.title.replace("The long run.", "The long run" + (ROMAN[Math.min(10, L - REGIMES.length + 2)] || "") + ".") : R.title, 2.8);
      var tk = document.getElementById("ticker-text"); if (tk) tk.textContent = R.sub;
      window.LR_FX && LR_FX.regime();
    },
    routeToast: function (route, cg, Ge, m) {
      var q = window.__lrq;
      if (on(q) && q.time - stats(q).toastAt < 2.4) return;
      var name = cg[route] || NAMES[route] || "";
      Ge("NEXT SECTION", name, 1.8);
      m("#route-name").textContent = on(q) ? "L" + (level(q) + 1) + " · " + regimeName(q) : name;
    },
    flowLabel: function (q) {
      var k = this.mult(q);
      return q.flow > 0 ? "STREAK ×" + k + " · " + q.flow : "L" + (level(q) + 1) + " · " + regimeName(q);
    },
    // ~10 times a second from the HUD update
    hud: function (q, Ge, m, SA) {
      window.__lrq = q; toast = Ge; sound = SA;
      MUSIC.sa = SA;
      if (!on(q)) { MUSIC.reset(); return; }
      MUSIC.update(q);
      var s = stats(q); s.maxSpeed = Math.max(s.maxSpeed, q.speed);
      var el = m("#route-name"); if (el && level(q) !== s.lastLevel) { s.lastLevel = level(q); el.textContent = "L" + (level(q) + 1) + " · " + regimeName(q); }
      var best = readBest(q);
      if (best > 0 && !s.passedBest && q.distance > best) {
        s.passedBest = true; say(q, "NEW PERSONAL BEST", "Every metre from here is new.", 2.2);
        window.LR_FX && LR_FX.regime();
        SA && SA.tone && SA.tone(988, 0.2, "triangle", 0.025, 1480);
      }
    },
    // drawn in the gameplay layer (world units): the best-run flag, pops, the swan warning flash
    draw: function (d, q, W, time) {
      if (!on(q)) return;
      var s = stats(q), best = readBest(q);
      if (best > 400) {
        var x = q.x + (best - q.distance);
        if (x > -60 && x < W + 80) {
          var y = q.floorAt(x);
          d.save();
          d.strokeStyle = "#f5f2eb"; d.lineWidth = 2.5; d.beginPath(); d.moveTo(x, y); d.lineTo(x, y - 150); d.stroke();
          var wv = Math.sin(time * 6) * 3;
          d.fillStyle = "#0026ff"; d.beginPath(); d.moveTo(x + 2, y - 150); d.lineTo(x + 92, y - 143 + wv); d.lineTo(x + 92, y - 115 + wv); d.lineTo(x + 2, y - 122); d.closePath(); d.fill();
          d.fillStyle = "#f4cea4"; d.beginPath(); d.moveTo(x + 2, y - 152); d.lineTo(x + 90, y - 145 + wv); d.lineTo(x + 90, y - 119 + wv); d.lineTo(x + 2, y - 125); d.closePath(); d.fill();
          d.fillStyle = "#001538"; d.font = "800 10px 'Norges Bank', Arial, sans-serif"; d.textAlign = "left"; d.textBaseline = "middle";
          d.fillText("YOUR BEST", x + 10, y - 138 + wv * 0.5);
          d.fillStyle = "#f4cea4"; d.fillRect(x - 5, y - 3, 10, 3);
          d.restore();
        }
      }
      if (flash > 0) { flash -= 1 / 60; d.save(); d.globalAlpha = Math.max(0, flash) * 0.35; d.fillStyle = "#ef954a"; d.fillRect(0, -2000, W, 6000); d.restore(); }
    },
    // drawn last in the gameplay layer: the pops, above the runner's head
    drawTop: function (d, q, W, time) {
      if (!on(q)) return;
      var s = stats(q);
      // at speed, what is about to come on screen shows at the right edge first
      if (q.speed > 520 && !q.flight) {
        var reach = q.speed * 0.6, a0 = Math.min(1, (q.speed - 520) / 160);
        d.save();
        q.obstacles.forEach(function (o) {
          if (o.x < W + 6 || o.x > W + reach) return;
          var u = 1 - (o.x - W) / reach, base = o.base == null ? q.floorAt(W - 20) : o.base, y = o.type === "high" ? base - 140 : o.type === "gap" ? q.floorAt(W - 20) - 18 : base - 34;
          var xx = W - 16 - u * 6, sz = 7 + u * 3;
          d.globalAlpha = a0 * (0.45 + u * 0.55);
          d.fillStyle = o.type === "gap" ? "#ef954a" : o.type === "high" ? "#4ec2e2" : "#f4cea4";
          d.beginPath();
          if (o.type === "high") { d.moveTo(xx - sz, y - sz); d.lineTo(xx + sz * 0.6, y - sz); d.lineTo(xx - sz * 0.2, y + sz * 0.6); }
          else if (o.type === "gap") { d.moveTo(xx - sz, y - sz * 0.4); d.lineTo(xx + sz * 0.6, y - sz * 0.4); d.lineTo(xx - sz * 0.2, y + sz); }
          else { d.moveTo(xx - sz, y + sz * 0.6); d.lineTo(xx + sz * 0.6, y + sz * 0.6); d.lineTo(xx - sz * 0.2, y - sz); }
          d.closePath(); d.fill();
        });
        d.restore();
      }
      s.pops = s.pops.filter(function (p) { return q.time - p.t < p.life; }).slice(-3);
      if (s.pops.length) {
        d.save(); d.textAlign = "center"; d.textBaseline = "middle"; d.font = "800 17px 'Norges Bank', Arial, sans-serif";
        s.pops.forEach(function (p, i) {
          var a = (q.time - p.t) / p.life, y = q.y - 205 - (s.pops.length - 1 - i) * 20 - a * 26;
          d.globalAlpha = Math.max(0, Math.min(1, (1 - a) * 2.4));
          d.fillStyle = "#0026ff"; d.fillText(p.text, q.x + 1.5, y + 2);
          d.fillStyle = "#f4cea4"; d.fillText(p.text, q.x, y);
        });
        d.restore();
      }
    },
    // results: the run in skill terms, and the best distance for next time's flag
    results: function (q, m) {
      if (!on(q)) return;
      var s = stats(q), best = readBest(q);
      if (q.distance > best) { try { localStorage.setItem(bestKey(q), String(Math.round(q.distance))); } catch (e) {} }
      var el = m("#result-detail"); if (!el) return;
      el.textContent = "Level " + (level(q) + 1) + " · " + regimeName(q).toLowerCase().replace(/(^|\s)\S/g, function (c) { return c.toUpperCase(); }) +
        " · top pace " + (Math.max(s.maxSpeed, q.speed) / 315).toFixed(2) + "× · " + s.close + " close call" + (s.close === 1 ? "" : "s") +
        " · best streak " + s.bestStreak + (q.distance > best && best > 0 ? " · new distance best" : "") + " · " + el.textContent.split(" · ").slice(-1)[0];
    }
  };

  /* ---- game feel, every mode: hit-stop and slow-mo, shake, flash, haptics ---- */
  var fx = { slow: 0, stop: 0, scale: 1 };
  var buzz = function (p) { try { navigator.vibrate && navigator.vibrate(p); } catch (e) {} };
  var reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  function shake(cls, ms) {
    var st = document.getElementById("stage"); if (!st || reduce) return;
    st.classList.remove("lr-shake", "lr-shake-big"); void st.offsetWidth; st.classList.add(cls);
    clearTimeout(st.__lrShake); st.__lrShake = setTimeout(function () { st.classList.remove(cls); }, ms);
  }
  function pulse(cls) {
    var st = document.getElementById("stage"); if (!st) return;
    var v = st.querySelector(".lr-pulse"); if (!v) { v = document.createElement("i"); v.className = "lr-pulse"; v.setAttribute("aria-hidden", "true"); st.appendChild(v); }
    v.className = "lr-pulse"; void v.offsetWidth; v.className = "lr-pulse " + cls;
  }
  window.LR_FX = {
    ts: function (dt) {
      if (fx.stop > 0) { fx.stop -= dt; return 0.05; }
      if (fx.slow > 0) { fx.slow -= dt; return 0.4; }
      return 1;
    },
    hit: function (q) {
      if (q.shield) { fx.stop = 0.07; shake("lr-shake", 260); pulse("is-hedge"); buzz(35); }
      else { shake("lr-shake-big", 420); pulse("is-hit"); buzz([60, 40, 90]); MUSIC.stop(); }
    },
    close: function () { if (!reduce) fx.slow = 0.16; pulse("is-close"); buzz(12); },
    regime: function () { pulse("is-level"); buzz([18, 40, 18]); }
  };

  /* ---- gamepads: A or the up arrow to jump, B or down to slide, Start to pause ---- */
  var pads = { jump: false, slide: false, pause: false };
  function key(type, code) { window.dispatchEvent(new KeyboardEvent(type, { code: code, key: code, bubbles: true })); }
  function poll() {
    var list = navigator.getGamepads ? navigator.getGamepads() : [], j = false, sl = false, p = false;
    for (var i = 0; i < list.length; i++) {
      var g = list[i]; if (!g) continue;
      var b = function (k) { return g.buttons[k] && g.buttons[k].pressed; };
      j = j || b(0) || b(12) || (g.axes[1] || 0) < -0.6;
      sl = sl || b(1) || b(13) || (g.axes[1] || 0) > 0.6;
      p = p || b(9);
    }
    if (j !== pads.jump) {
      var st = window.longRun ? window.longRun.state : "home";
      if (j && st === "home") { var sb = document.getElementById("start"); sb && !sb.disabled && sb.click(); }
      else if (j && st === "over" && !(window.LongRunReveal && LongRunReveal.active)) {
        var results = document.getElementById("results");
        var rb = document.getElementById(results && results.dataset.primary || "restart");
        if (results && !results.inert && !document.querySelector("dialog[open]") && rb && rb.offsetParent && !rb.disabled) rb.click();
      }
      else key(j ? "keydown" : "keyup", "Space");
      pads.jump = j;
    }
    if (sl !== pads.slide) { key(sl ? "keydown" : "keyup", "ArrowDown"); pads.slide = sl; }
    if (p && !pads.pause) key("keydown", "KeyP");
    pads.pause = p;
    requestAnimationFrame(poll);
  }
  var started = false;
  addEventListener("gamepadconnected", function () { if (!started) { started = true; requestAnimationFrame(poll); } });
})();
