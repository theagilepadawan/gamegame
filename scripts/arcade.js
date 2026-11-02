(function(){
  "use strict";
  var $ = function (s) { return document.querySelector(s); };
  var reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  var state = function () { return window.longRun ? window.longRun.state : "home"; };

  /* ---- HI-SCORE: read the same best-score keys the game writes --------- */
  function bestKey() {
    var m = document.querySelector("[data-mode].selected"), d = document.querySelector("[data-district].selected");
    var mode = m ? m.dataset.mode : "chapter", dist = d ? d.dataset.district : "opening";
    if (mode === "chapter") return dist === "opening" ? "nyc.opening-bell.best" : "nyc.district." + dist + ".best";
    return "nyc.chapter-build.best";
  }
  var hiQueued = false;
  function paintHi() {
    hiQueued = false;
    var el = $("#home-hi"); if (!el) return;
    var v = 0;
    try { v = Number(localStorage.getItem(bestKey())) || 0; } catch (e) {}
    el.querySelector("strong").textContent = String(Math.min(v, 999999)).padStart(6, "0");
    el.classList.toggle("is-empty", !v);
  }
  function queueHi() { if (!hiQueued) { hiQueued = true; requestAnimationFrame(paintHi); } }
  var live = $("#live-hud");
  function hiVisibility() { var el = $("#home-hi"); if (el && live) el.classList.toggle("is-off", !live.classList.contains("hidden")); }
  if (live) { new MutationObserver(hiVisibility).observe(live, { attributes: true, attributeFilter: ["class"] }); hiVisibility(); }
  var intro = $("#intro");
  if (intro) new MutationObserver(queueHi).observe(intro, { subtree: true, attributes: true, attributeFilter: ["class"] });
  queueHi();

  /* ---- Score bump when a pickup lands ---------------------------------- */
  var score = $("#score"), last = 0;
  if (score) new MutationObserver(function () {
    var n = parseInt(score.textContent, 10) || 0;
    if (n - last >= 10 && !reduce) { score.classList.remove("bump"); void score.offsetWidth; score.classList.add("bump"); }
    last = n;
  }).observe(score, { childList: true, characterData: true, subtree: true });

  /* ---- Results: the history reveal, then the tally and the board ------ */
  var results = $("#results"), tally = 0, shown = false;
  function runTally() {
    var out = $("#final-score"); if (!out || reduce) return;
    var final = out.textContent, target = parseInt(final.replace(/\D/g, ""), 10) || 0, i = 0, steps = 14;
    clearInterval(tally);
    if (!target) return;
    out.textContent = "0";
    tally = setInterval(function () {
      i++;
      if (i >= steps) { clearInterval(tally); out.textContent = final; return; }
      out.textContent = Math.round(target * i / steps).toLocaleString();
    }, 45);
  }
  if (results) new MutationObserver(function () {
    var visible = !results.classList.contains("hidden");
    if (!visible || shown) {
      shown = visible;
      // only touch the class list when needed: every write re-fires this observer
      if (!visible && (results.classList.contains("is-held") || results.classList.contains("is-replay"))) results.classList.remove("is-held", "is-replay");
      return;
    }
    shown = true;
    var tag = $("#result-tag");
    results.classList.toggle("is-best", !!tag && /PERSONAL BEST/i.test(tag.textContent));
    var lr = window.longRun || {}, snap = lr.snapshot, rev = lr.reveal;
    var proceed = function () {
      results.inert = false; results.classList.remove("is-held");
      if (rev && rev.history) results.classList.add("is-replay");
      var primary = document.getElementById(results.dataset.primary || "restart");
      if (primary && !primary.hidden && !primary.disabled) primary.focus({ preventScroll: true });
      runTally();
      window.LongRunBoard && window.LongRunBoard.onResults(snap);
    };
    if (rev && rev.history && rev.won && window.LongRunReveal) {
      results.classList.add("is-held"); results.inert = true;
      if (document.activeElement && document.activeElement.blur) document.activeElement.blur();
      window.LongRunReveal.play(rev, proceed);
    } else proceed();
  }).observe(results, { attributes: true, attributeFilter: ["class"] });

  /* ---- PRESS START: Space or Enter runs from the home screen ---------- */
  addEventListener("keydown", function (e) {
    if ((e.code !== "Space" && e.code !== "Enter") || e.repeat || e.defaultPrevented) return;
    if (state() !== "home" || $("#splash")) return;
    if (document.querySelector("dialog[open]")) return;
    var a = document.activeElement;
    if (a && (/^(BUTTON|INPUT|SELECT|TEXTAREA|A)$/.test(a.tagName) || a.isContentEditable || a.closest(".chapter-browser"))) return;
    var start = $("#start");
    if (!start || start.disabled) return;
    e.preventDefault();
    start.classList.add("is-pressed");
    setTimeout(function () { start.classList.remove("is-pressed"); start.click(); }, 120);
  });

  /* ---- Upwards and onwards: the runner climbs the long-run line -------- */
  (function () {
    var svg = $(".mq-chart"), box = svg && svg.parentNode, runner = box && box.querySelector(".mq-runner");
    if (!svg || !runner) return;
    var traces = svg.querySelectorAll(".mq-trace,.mq-trace-shadow"), heads = svg.querySelectorAll(".mq-head,.mq-head-shadow");
    var P = [[4, 94], [22, 72], [32, 82], [50, 56], [60, 66], [80, 38], [110, 8]], seg = [], total = 0;
    for (var i = 1; i < P.length; i++) { var L = Math.hypot(P[i][0] - P[i - 1][0], P[i][1] - P[i - 1][1]); seg.push(L); total += L; }
    function along(p) {
      var d = p * total;
      for (var i = 0; i < seg.length; i++) {
        if (d <= seg[i] || i === seg.length - 1) {
          var f = Math.max(0, Math.min(1, d / seg[i]));
          return [P[i][0] + (P[i + 1][0] - P[i][0]) * f, P[i][1] + (P[i + 1][1] - P[i][1]) * f, P[i + 1][1] < P[i][1]];
        }
        d -= seg[i];
      }
    }
    var CYCLE = 8200, FOOT = 456 / 512, T0 = null, lastS = 0;
    // sheet: 0-5 run, 6 take-off, 7 stand, 8-15 somersault; row 0 Nicolai, row 1 Trond
    function chart(drawn, headOn, fade) {
      for (var j = 0; j < traces.length; j++) { traces[j].style.strokeDashoffset = String(100 * (1 - drawn)); traces[j].style.opacity = fade; }
      for (j = 0; j < heads.length; j++) heads[j].style.opacity = headOn ? fade : 0;
    }
    function put(vx, vy, frame, anchor, alpha, tilt) {
      var r = svg.getBoundingClientRect(), b = box.getBoundingClientRect();
      if (!r.height) return;
      var k = Math.min(r.width / 120, r.height / 100), s = Math.round(r.height * 0.78);
      var px = r.left - b.left + (r.width - 120 * k) / 2 + vx * k, py = r.top - b.top + (r.height - 100 * k) / 2 + vy * k;
      if (s !== lastS) {
        lastS = s;
        runner.style.width = runner.style.height = s + "px";
        runner.style.backgroundSize = 16 * s + "px " + 2 * s + "px";
        runner.style.filter = "drop-shadow(" + (s * 0.035).toFixed(1) + "px " + (s * 0.045).toFixed(1) + "px 0 #0026ff)";
      }
      var row = window.longRun && window.longRun.character === "trond" ? 1 : 0;
      runner.style.backgroundPosition = -frame * s + "px " + -row * s + "px";
      var top = anchor === "feet" ? py - FOOT * s : py - s / 2;
      runner.style.transform = "translate3d(" + (px - s / 2).toFixed(1) + "px," + top.toFixed(1) + "px,0) rotate(" + (tilt || 0) + "deg)";
      runner.style.opacity = alpha;
    }
    function hide() { runner.style.opacity = 0; }
    function tick(now) {
      requestAnimationFrame(tick);
      if (state() !== "home" || $("#splash") || document.hidden) { T0 = null; return; }
      if (reduce) { chart(1, true, 1); put(110, 8, 7, "feet", 1, 0); return; }
      if (T0 === null) T0 = now + 650;          // let the title wipe in first
      var t = now - T0;
      if (t < 0) { chart(0, false, 1); hide(); return; }
      t %= CYCLE;
      var run = Math.floor(t / 70) % 6, u, pt;
      if (t < 250) { chart(0, false, 1); put(4, 94, run, "feet", t / 250, 0); }
      else if (t < 1650) {                       // upwards: sprint the line, drawing it as he goes
        u = (t - 250) / 1400; pt = along(u);
        chart(u, false, 1); put(pt[0], pt[1], run, "feet", 1, pt[2] ? -5 : 4);
      } else if (t < 2400) {                     // onwards: take off from the arrowhead and somersault away
        u = (t - 1650) / 750;
        chart(1, !(t > 1720 && t < 1800), 1);
        var vx = 110 + 95 * u, vy = 8 - 78 * u + 42 * u * u;
        var frame = u < 0.1 ? 6 : 8 + Math.min(7, Math.floor((u - 0.1) / 0.9 * 8));
        put(vx, vy, frame, u < 0.1 ? "feet" : "centre", u < 0.6 ? 1 : (1 - u) / 0.4, 0);
      } else if (t < CYCLE - 450) { chart(1, true, 1); hide(); }
      else { chart(1, true, 1 - (t - (CYCLE - 450)) / 450); hide(); }
    }
    requestAnimationFrame(tick);
  })();
})();
