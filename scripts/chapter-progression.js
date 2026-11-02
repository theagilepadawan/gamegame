/* Chapters in order, unlocked one at a time: Opening Bell, then Midtown, then Central Park, the finale.
   Finishing a chapter unlocks the next one (kept in localStorage). ?unlock=all opens everything for a demo.
   Exposed as window.LR_CH; the game calls in from the chapter picker, the home screen and the results. */
(function () {
  "use strict";
  var ORDER = ["opening", "midtown", "park"];
  var NAMES = { opening: "Opening Bell", midtown: "Midtown", park: "Central Park" };
  var KEY = "lr.chapters.done";
  var demo = /[?&]unlock=all\b/.test(location.search);
  function read() { try { return JSON.parse(localStorage.getItem(KEY) || "[]") || []; } catch (e) { return []; } }
  function write(list) { try { localStorage.setItem(KEY, JSON.stringify(list)); } catch (e) {} }
  var prev = function (id) { var i = ORDER.indexOf(id); return i > 0 ? ORDER[i - 1] : null; };
  // each chapter's soundtrack: Opening Bell keeps the original, Midtown charges, Central Park ends gracefully
  var TRACKS = { midtown: "assets/original-19.mp3", park: "assets/original-20.mp3" };
  var CH = window.LR_CH = {
    order: ORDER,
    // at the start of every run, before the music starts: the right track for where the run is
    music: function (SA, q) {
      var tr = SA && SA.track; if (!tr) return;
      if (tr.__lrMain == null) { tr.__lrMain = tr.src; tr.__lrKey = "main"; }
      var id = q && q.mode === "chapter" && TRACKS[q.districtId] ? q.districtId : "main";
      if (tr.__lrKey !== id) { tr.__lrKey = id; tr.src = id === "main" ? tr.__lrMain : TRACKS[id]; tr.loop = true; }
      else if (id !== "main") { try { tr.currentTime = 0; } catch (e) {} } // a chapter song starts from the top every run
    },
    track: function (SA) { return SA && SA.track ? SA.track.__lrKey || "main" : null; },
    unlocked: function (id) { if (demo || id === "opening") return true; var p = prev(id); return !!p && read().indexOf(p) >= 0; },
    completed: function (id) { return read().indexOf(id) >= 0; },
    // a chapter was won: remember it, and say what it opened
    done: function (id) {
      var list = read(), first = list.indexOf(id) < 0;
      if (first) { list.push(id); write(list); }
      var next = ORDER[ORDER.indexOf(id) + 1];
      return { first: first, unlocked: first && next ? next : null, final: id === ORDER[ORDER.length - 1] };
    },
    // the picker: locks on the chapters still to earn
    paint: function () {
      document.querySelectorAll("[data-district]").forEach(function (b) {
        var id = b.dataset.district, open = CH.unlocked(id);
        b.classList.toggle("is-locked", !open);
        b.setAttribute("aria-disabled", String(!open));
        b.title = open ? NAMES[id] : "Finish " + NAMES[prev(id)] + " to unlock " + NAMES[id];
        var lock = b.querySelector(".lock");
        if (!open && !lock) { lock = document.createElement("i"); lock.className = "lock"; lock.setAttribute("aria-hidden", "true"); b.appendChild(lock); }
        if (open && lock) lock.remove();
      });
    },
    // a locked chapter was tapped
    locked: function (b) {
      var id = b.dataset.district, note = document.getElementById("load-status");
      b.classList.remove("is-shake"); void b.offsetWidth; b.classList.add("is-shake");
      if (note) {
        if (!note.classList.contains("is-hint")) note.__was = note.textContent;
        note.textContent = "Finish " + NAMES[prev(id)] + " to unlock " + NAMES[id] + "."; note.classList.add("is-hint");
        clearTimeout(note.__t); note.__t = setTimeout(function () { note.classList.remove("is-hint"); if (note.__was != null) note.textContent = note.__was; }, 2600);
      }
    }
  };
})();
