/* Trond is earned: finish Central Park, the final chapter, to unlock him. Until then his slot in the
   player select reads "???", and picking it shows only his silhouette and shadow on the home screen.
   Winning Central Park for the first time reveals him on the results screen.
   ?unlock=all opens him for demos. Exposed as window.LR_RUN; the game calls in from the picker,
   the home screen, the start of a run and the results (see build.py). */
(function () {
  "use strict";
  var KEY = "lr.runner.trond", SEEN = "lr.runner.trond.seen";
  var demo = /[?&]unlock=all\b/.test(location.search);
  var store = { get: function (k) { try { return localStorage.getItem(k); } catch (e) { return null; } }, set: function (k, v) { try { localStorage.setItem(k, v); } catch (e) {} } };
  var previewing = false, sil = null, sessionUnlocked = false, revealPending = false;
  var reduced = matchMedia("(prefers-reduced-motion: reduce)");
  var SEA = "#4ec2e2", INK = "#061024";

  // the silhouette: the sheet filled with deep navy, a cool rim of light on its top-left edges
  function silhouette(img) {
    if (sil && sil.__src === img) return sil;
    if (!img || !img.complete || !img.naturalWidth) return null;
    var w = img.naturalWidth, h = img.naturalHeight, c = document.createElement("canvas"); c.width = w; c.height = h;
    var g = c.getContext("2d"), tmp = document.createElement("canvas"); tmp.width = w; tmp.height = h;
    var t = tmp.getContext("2d");
    t.drawImage(img, 0, 0); t.globalCompositeOperation = "source-in"; t.fillStyle = SEA; t.fillRect(0, 0, w, h);
    g.globalAlpha = 0.7; g.drawImage(tmp, -3, -3); g.globalAlpha = 1;
    t.globalCompositeOperation = "source-over"; t.clearRect(0, 0, w, h);
    t.drawImage(img, 0, 0); t.globalCompositeOperation = "source-in";
    var gr = t.createLinearGradient(0, 0, 0, 512); gr.addColorStop(0, "#0b1c3a"); gr.addColorStop(1, INK);
    t.fillStyle = INK; t.fillRect(0, 0, w, h);
    g.drawImage(tmp, 0, 0);
    c.complete = true; c.naturalWidth = w; c.naturalHeight = h; c.__src = img;
    sil = c; return c;
  }

  var R = window.LR_RUN = {
    unlocked: function () { return demo || sessionUnlocked || store.get(KEY) === "1"; },
    previewing: function () { return previewing && !R.unlocked(); },
    preview: function (on) { previewing = !!on; },
    silhouette: silhouette,
    hint: function () { return "Finish Central Park to unlock this runner."; },
    // the picker and the caption under the runner
    paint: function () {
      var b = document.querySelector('[data-character="trond"]'), nb = document.querySelector('[data-character="nicolai"]');
      if (!b) return;
      var open = R.unlocked();
      b.classList.toggle("is-locked", !open);
      if (!open) {
        if (!b.querySelector(".qm")) b.innerHTML = '<span class="qm" aria-hidden="true"><i>?</i><i>?</i><i>?</i></span><span class="visually-hidden">Locked runner</span>';
        b.title = R.hint(); b.setAttribute("aria-label", "Locked runner. " + R.hint());
      } else if (b.textContent.trim() !== "Trond") {
        b.textContent = "Trond"; b.title = ""; b.removeAttribute("aria-label");
      }
      b.classList.toggle("is-new", open && store.get(SEEN) !== "1" && !demo);
      if (open && revealPending && window.longRun?.state === "home") {
        revealPending = false;
        if (!reduced.matches) b.animate([
          {boxShadow:"0 0 0 0 #f4cea400", transform:"scale(.96)"},
          {boxShadow:"0 0 0 6px #f4cea455", transform:"scale(1.035)", offset:.4},
          {boxShadow:"0 0 0 12px #f4cea400", transform:"scale(1)"}
        ], {duration:700, easing:"cubic-bezier(.2,.7,.3,1)"});
      }
      if (R.previewing()) {
        b.classList.add("selected"); b.setAttribute("aria-pressed", "true");
        if (nb) { nb.classList.remove("selected"); nb.setAttribute("aria-pressed", "false"); }
        var n = document.getElementById("character-name"), s = document.getElementById("character-style");
        if (n) n.textContent = "???";
        if (s) s.textContent = "LOCKED · FINISH CENTRAL PARK";
        document.getElementById("stage").dataset.runner = "locked";
      }
    },
    seen: function () { if (R.unlocked()) store.set(SEEN, "1"); },
    // Central Park won: the first time, Trond steps out of the shadow on the results screen
    won: function (atlas) {
      if (R.unlocked()) return false;
      sessionUnlocked = true; revealPending = true; previewing = false;
      store.set(KEY, "1");
      // The unlock happens on results, before the picker is visible again.
      // Update its actual label now; returning home also refreshes the caption.
      R.paint();
      var panel = document.querySelector("#results .results-panel"), anchor = document.getElementById("result-seed");
      if (!panel || !anchor) return true;
      var old = panel.querySelector(".lr-unlock"); old && old.remove();
      var card = document.createElement("div"); card.className = "lr-unlock";
      card.setAttribute("role", "status"); card.setAttribute("aria-live", "polite");
      card.innerHTML = '<canvas width="168" height="216" aria-hidden="true"></canvas><div><span class="lr-unlock-tag">NEW RUNNER UNLOCKED</span>' +
        '<strong>Trond</strong><small>Belly glide · Triple spin</small><button type="button" class="lr-unlock-go">Run as Trond <span aria-hidden="true">→</span></button></div>';
      anchor.insertAdjacentElement("afterend", card);
      var cv = card.querySelector("canvas"), g = cv.getContext("2d"), t0 = performance.now();
      var sh = silhouette(atlas);
      // idle frame 6 of the run sheet, cropped to the figure
      var sx = 2 * 512 + 96, sy = 512 + 40, sw = 320, sh2 = 420;
      var draw = function () {
        var u = reduced.matches ? 1 : Math.min(1, Math.max(0, (performance.now() - t0 - 100) / 650));
        g.clearRect(0, 0, cv.width, cv.height);
        g.save(); g.globalAlpha = 0.35; g.fillStyle = "#000"; g.beginPath(); g.ellipse(84, 206, 46, 6, 0, 0, Math.PI * 2); g.fill(); g.restore();
        if (atlas && atlas.naturalWidth) {
          if (sh && u < 1) { g.globalAlpha = 1 - u; g.drawImage(sh, sx, sy, sw, sh2, 4, 0, 160, 210); }
          g.globalAlpha = u; g.drawImage(atlas, sx, sy, sw, sh2, 4, 0, 160, 210); g.globalAlpha = 1;
        }
        if (u < 1 && document.body.contains(cv)) requestAnimationFrame(draw);
      };
      requestAnimationFrame(draw);
      card.querySelector(".lr-unlock-go").addEventListener("click", function () {
        var h = document.getElementById("home"); h && h.click();
        setTimeout(function () { var b = document.querySelector('[data-character="trond"]'); b && b.click(); }, 60);
      });
      return true;
    }
  };
  // a fresh results screen never keeps an old unlock card
  addEventListener("click", function (e) {
    if (e.target && e.target.closest && e.target.closest("#restart, #new-run, #home, #next-chapter")) {
      var c = document.querySelector(".lr-unlock"); c && setTimeout(function () { c.remove(); }, 0);
    }
  }, true);
})();
