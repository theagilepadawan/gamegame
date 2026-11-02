/* The boot splash: the NBIM logo animation (nbim-logo.js, from the Tech Day New York app). The N builds itself
   out of points of light, the halves wipe in, the Sea streak runs down the cut, one glint passes, and the game
   fades in, as soon as it is ready. On a slow connection the settled N keeps glinting until it is.
   Grab the N to wobble it; tap anywhere else or press a key to skip. Reduced motion: the finished N, briefly. */
(function () {
  "use strict";
  var s = document.getElementById("splash"); if (!s) return;
  var host = s.querySelector(".splash-logo");
  var reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  var t0 = performance.now(), done = false, holding = false, lastTouch = 0, logo = null, glints = 0, poll = 0;
  var INTRO = 3150, FIRST_GLINT = 3300, AFTER_GLINT = 4250, AGAIN = 2400, MAX = 12000;
  try { logo = window.NBIMLogo && NBIMLogo.create(host, { theme: "dark", glintEvery: 0, jelly: true }); } catch (e) { logo = null; }
  if (!logo) s.classList.add("is-static");
  window.LR_SPLASH = { logo: logo, element: s };
  var ready = function () { var b = document.getElementById("start"); return !!b && !b.disabled; };  // looked up late: the button comes after the splash
  function hide() {
    if (done) return; done = true; clearInterval(poll);
    s.classList.add("is-done");
    setTimeout(function () { try { logo && logo.destroy(); } catch (e) {} s.remove(); }, 650);
  }
  function tick() {
    if (done || window.__LR_SPLASH_HOLD) return;
    var t = performance.now() - t0;
    if (holding || t - lastTouch < 1100) { if (t > 30000) hide(); return; }   // someone is playing with the N
    if (t > MAX) { hide(); return; }                                          // never block the game for long
    if (reduce || !logo) { if (t > 900 && ready()) hide(); return; }
    if (t < INTRO) return;
    if (glints === 0 && t >= FIRST_GLINT) { glints = 1; logo.glint(); return; }
    if (glints > 0 && t >= AFTER_GLINT + (glints - 1) * AGAIN) {
      if (ready()) { hide(); return; }
      glints++; logo.glint();                                     // still loading: another glint
    }
  }
  poll = setInterval(tick, 50);
  // grabbing the N (the animation takes the pointer) keeps the splash; any other tap skips it
  s.addEventListener("pointerdown", function (e) {
    if (e.defaultPrevented) { holding = true; return; }
    e.preventDefault(); hide();
  });
  var up = function () { if (holding) { holding = false; lastTouch = performance.now() - t0; } };
  addEventListener("pointerup", up); addEventListener("pointercancel", up);
  addEventListener("keydown", function () { hide(); }, { once: true });
})();
