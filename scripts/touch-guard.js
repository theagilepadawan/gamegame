/* A held finger on the game is a jump or a slide. On iOS (Safari, Edge) a long press would otherwise select the
   page's text (the blue tint) and open the callout, which takes focus and pauses the run. Text fields keep
   working: the leaderboard name and the world seed. */
(function () {
  "use strict";
  var field = function (t) { t = t && t.nodeType === 3 ? t.parentElement : t; return !!(t && t.closest && t.closest("input,textarea,[contenteditable]")); };
  document.addEventListener("selectstart", function (e) { if (!field(e.target)) e.preventDefault(); });
  document.addEventListener("contextmenu", function (e) { if (!field(e.target)) e.preventDefault(); });
  var clear = function () { try { var s = getSelection(); if (s && s.rangeCount && !field(document.activeElement)) s.removeAllRanges(); } catch (e) {} };
  document.addEventListener("pointerdown", clear, true);
  document.addEventListener("selectionchange", function () { var st = window.longRun ? window.longRun.state : "home"; if (st === "playing") clear(); });
})();
