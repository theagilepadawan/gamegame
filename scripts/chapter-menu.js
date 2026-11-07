/* The chapter overworld keeps the existing progression and game controls.
   The selected runner travels along the path that joins the destinations. */
(function () {
  "use strict";
  function init() {
    var browser = document.getElementById("chapter-browser");
    var rail = document.getElementById("district-picker");
    var intro = document.getElementById("intro");
    if (!browser || !rail || !intro) return;
    var cards = Array.from(rail.querySelectorAll("[data-district]"));
    var modes = Array.from(document.querySelectorAll("[data-mode]"));
    var characters = Array.from(document.querySelectorAll("[data-character]"));
    var previous = document.getElementById("chapter-prev");
    var next = document.getElementById("chapter-next");
    var progress = document.getElementById("journey-progress");
    var announce = document.getElementById("chapter-announce");
    var route = document.getElementById("map-route");
    var marker = browser.querySelector(".map-player");
    var legs = Array.from(browser.querySelectorAll("[data-leg]"));
    var markerLength = 0, markerFrame = 0, markerTarget = 0, runner = "", artwork = "";
    var launchAction = null, launchChapter = "", launchRunner = "";
    var start = document.getElementById("start");
    var stops = [0, legs[0].getTotalLength(), route.getTotalLength()];
    var names = { opening: "Opening Bell", midtown: "Midtown", park: "Central Park" };
    var reduce = matchMedia("(prefers-reduced-motion: reduce)");
    var browsing = 0, selected = "", scheduled = false, drag = null;
    var suppressClickUntil = 0, programmatic = false, wheelAt = 0, wheelAmount = 0;
    // Native crops retain the approved runners, including their registered feet.
    // One idle and six running frames; preload both so switching never flashes.
    var avatarSources = {
      nicolai: "assets/map-characters-v20/nicolai.webp",
      trond: "assets/map-characters-v20/trond.webp"
    };
    var gestureSources = {
      nicolai: "assets/map-gestures-v117/nicolai.webp",
      trond: "assets/map-gestures-v117/trond.webp"
    };
    var avatarImages = Object.create(null);
    var gestureImages = Object.create(null);
    Object.keys(avatarSources).forEach(function (id) {
      var image = new Image(); image.src = avatarSources[id]; avatarImages[id] = image;
      var gesture = new Image(); gesture.src = gestureSources[id]; gestureImages[id] = gesture;
    });
    var figure = document.createElement("div");
    figure.className = "map-player-figure";
    var shadow = document.createElement("div");
    shadow.className = "map-player-shadow";
    marker.replaceChildren(shadow, figure);
    marker.dataset.motion = "idle";
    marker.dataset.facing = "right";
    function syncRunner() {
      var button = characters.find(function (b) { return b.classList.contains("selected"); });
      // A locked runner can be previewed in the picker. Keep the map on the
      // actual playable selection until that runner has been earned.
      var chosen = window.longRun ? longRun.character : button && button.dataset.character;
      var id = chosen === "trond" ? "trond" : "nicolai";
      if (runner === id) return;
      if (launchAction) cancelLaunch();
      runner = id;
      marker.dataset.runner = id;
      artwork = "";
      pose(0);
    }
    function useArtwork(kind) {
      if (artwork === kind) return;
      artwork = kind;
      var image = kind === "gesture" ? gestureImages[runner] : avatarImages[runner];
      figure.style.backgroundImage = 'url("' + image.src + '")';
      figure.style.backgroundSize = kind === "gesture" ? "300% 100%" : "700% 100%";
    }
    function pose(frame) {
      useArtwork("run");
      figure.style.backgroundPositionX = (frame / 6 * 100) + "%";
    }
    function expression(hop, lean, squash) {
      marker.style.setProperty("--map-hop", hop + "px");
      marker.style.setProperty("--map-lean", lean + "deg");
      marker.style.setProperty("--map-sx", 1 + squash);
      marker.style.setProperty("--map-sy", 1 - squash);
      shadow.style.transform = "scaleX(" + (1 + hop * .035) + ")";
    }
    function settleMarker() {
      cancelAnimationFrame(markerFrame);
      markerFrame = 0;
      placeMarker(stops[markerTarget]);
      marker.dataset.motion = "idle";
      pose(0);
      expression(0, 0, 0);
    }
    function cancelLaunch() {
      launchAction = null;
      start.removeAttribute("aria-busy");
      settleMarker();
    }
    function finishLaunch() {
      var action = launchAction;
      launchAction = null;
      start.removeAttribute("aria-busy");
      // Hide the map by starting the level before resetting its artwork. There
      // is deliberately no arm-lowering animation after the held thumbs-up.
      if (action && menuActive()) action();
      settleMarker();
    }
    function menuActive() {
      return !document.hidden && !intro.classList.contains("hidden") && !document.querySelector("dialog[open]") && !(window.LR_RUN && LR_RUN.previewing()) && isStory() && window.longRun && longRun.state === "home";
    }
    function thumbsUp() {
      cancelAnimationFrame(markerFrame);
      expression(0, 0, 0);
      useArtwork("gesture");
      marker.dataset.motion = "thumbs-up";
      figure.style.backgroundPositionX = "0%";
      var began = performance.now();
      function step(now) {
        if (!launchAction || !menuActive()) { cancelLaunch(); return; }
        var age = now - began;
        figure.style.backgroundPositionX = age < 110 ? "0%" : age < 250 ? "50%" : "100%";
        if (age >= 2000) { finishLaunch(); return; }
        markerFrame = requestAnimationFrame(step);
      }
      markerFrame = requestAnimationFrame(step);
    }
    function launch(action) {
      if (launchAction) return true; // Repeated Play / controller presses cannot queue runs.
      refresh();
      var image = gestureImages[runner];
      if (!menuActive() || reduce.matches || !image.complete || !image.naturalWidth) return false;
      launchAction = action;
      launchChapter = selectedCard().dataset.district;
      launchRunner = runner;
      start.setAttribute("aria-busy", "true");
      // If Play is pressed during a trip, finish that trip before the gesture.
      if (!markerFrame) thumbsUp();
      return true;
    }
    function isStory() { var b = document.querySelector("[data-mode].selected"); return !b || b.dataset.mode === "chapter"; }
    function selectedCard() { return cards.find(function (b) { return b.classList.contains("selected"); }) || cards[0]; }
    function clamp(i) { return Math.max(0, Math.min(cards.length - 1, i)); }
    function updateArrows() {
      previous.disabled = browsing === 0;
      next.disabled = browsing === cards.length - 1;
      browser.dataset.browsing = cards[browsing].dataset.district;
      browser.querySelector(".map-gesture").hidden = rail.scrollWidth - rail.clientWidth < 16;
    }
    function placeMarker(length) {
      markerLength = length;
      var point = route.getPointAtLength(length);
      marker.style.left = (point.x / 860 * 100) + "%";
      marker.style.top = (point.y / 240 * 100) + "%";
    }
    function moveMarker(index, instant) {
      cancelAnimationFrame(markerFrame);
      markerTarget = index;
      var from = markerLength, to = stops[index];
      if (instant || reduce.matches || Math.abs(to - from) < 1) { settleMarker(); return; }
      var direction = to < from ? -1 : 1, distance = Math.abs(to - from);
      marker.dataset.facing = direction < 0 ? "left" : "right";
      marker.dataset.motion = "anticipating";
      cards.forEach(function (card) { card.classList.remove("is-arriving"); });
      pose(0);
      // A short preparation, a readable run, then one soft landing. Strides
      // follow distance rather than a timer, so the feet slow with the runner.
      var began = performance.now(), lead = 80, landing = 150;
      var duration = Math.min(1250, 500 + distance * 1.15);
      function step(now) {
        if (!menuActive()) { cancelLaunch(); return; }
        var age = now - began;
        if (age < lead) {
          expression(0, direction * 2 * age / lead, Math.sin(age / lead * Math.PI) * .035);
        } else if (age < lead + duration) {
          var t = (age - lead) / duration;
          // Sine easing avoids an abrupt change in acceleration halfway along.
          var eased = (1 - Math.cos(t * Math.PI)) / 2, travelled = distance * eased;
          marker.dataset.motion = "running";
          placeMarker(from + (to - from) * eased);
          pose(1 + Math.floor(travelled / 22) % 6);
          var hop = -Math.abs(Math.sin(travelled / 44 * Math.PI)) * 1.25;
          if (t > .86) hop -= Math.sin((t - .86) / .14 * Math.PI) * 2.5;
          expression(hop, direction * Math.sin(t * Math.PI) * 3, 0);
        } else {
          var arrival = Math.min(1, (age - lead - duration) / landing);
          if (marker.dataset.motion !== "arriving") cards[index].classList.add("is-arriving");
          marker.dataset.motion = "arriving";
          placeMarker(to); pose(0);
          expression(0, 0, Math.sin(arrival * Math.PI) * .055);
          if (arrival >= 1) { settleMarker(); if (launchAction) thumbsUp(); return; }
        }
        markerFrame = requestAnimationFrame(step);
      }
      markerFrame = requestAnimationFrame(step);
    }
    function scrollToCard(index, instant) {
      if (browser.hidden || !rail.clientWidth) return;
      var card = cards[index], box = card.getBoundingClientRect(), view = rail.getBoundingClientRect();
      var target = rail.scrollLeft + box.left - view.left + box.width / 2 - rail.clientWidth / 2;
      target = Math.max(0, Math.min(rail.scrollWidth - rail.clientWidth, target));
      rail.scrollTo({ left: target, behavior: instant || reduce.matches ? "auto" : "smooth" });
    }
    function setAnnouncement(index) {
      var card = cards[index], state = card.querySelector(".chapter-status");
      announce.textContent = "Chapter " + (index + 1) + ": " + names[card.dataset.district] + ". " + (state ? state.textContent : "");
    }
    function activate(index, focus) {
      browsing = clamp(index);
      scrollToCard(browsing, false);
      programmatic = true;
      cards[browsing].click();
      programmatic = false;
      if (focus) cards[browsing].focus({ preventScroll: true });
      updateArrows();
      setAnnouncement(browsing);
    }
    function closest() {
      if (rail.scrollLeft < 3) return 0;
      if (rail.scrollLeft > rail.scrollWidth - rail.clientWidth - 3) return cards.length - 1;
      var center = rail.getBoundingClientRect().left + rail.clientWidth / 2;
      var best = 0, distance = Infinity;
      cards.forEach(function (card, i) {
        var rect = card.getBoundingClientRect(), d = Math.abs(rect.left + rect.width / 2 - center);
        if (d < distance) { best = i; distance = d; }
      });
      return best;
    }
    function refresh() {
      scheduled = false;
      var story = isStory(), wasHidden = browser.hidden, chosen = selectedCard();
      browser.hidden = !story;
      intro.classList.toggle("is-endless", !story);
      syncRunner();
      if (launchAction && (!story || chosen.dataset.district !== launchChapter || runner !== launchRunner)) cancelLaunch();
      if (!story && markerFrame) settleMarker();
      var completed = 0;
      cards.forEach(function (card, i) {
        var id = card.dataset.district;
        var done = !!(window.LR_CH && LR_CH.completed(id));
        var open = window.LR_CH ? LR_CH.unlocked(id) : !card.classList.contains("is-locked");
        var active = card === chosen;
        if (done) completed++;
        card.classList.toggle("is-complete", done);
        var label = done ? "Complete · Replay" : !open ? "Finish " + names[cards[i - 1].dataset.district] : "Ready to play";
        var status = card.querySelector(".chapter-status");
        if (status.textContent !== label) status.textContent = label;
        var stamp = card.querySelector(".chapter-stamp");
        if (stamp.textContent !== (done ? "✓" : String(i + 1))) stamp.textContent = done ? "✓" : String(i + 1);
        card.setAttribute("aria-label", "Chapter " + (i + 1) + ", " + names[id] + ". " + label + (open ? "." : " to unlock."));
        var leg = browser.querySelector('[data-leg="' + id + '"]');
        if (leg) leg.classList.toggle("is-open", open);
      });
      var text = completed + " of " + cards.length + " chapters complete";
      if (progress.textContent !== text) progress.textContent = text;
      if (selected !== chosen.dataset.district || (story && wasHidden)) {
        var first = !selected;
        selected = chosen.dataset.district;
        browsing = cards.indexOf(chosen);
        moveMarker(browsing, first || wasHidden);
        requestAnimationFrame(function () { scrollToCard(browsing, wasHidden); });
      }
      updateArrows();
    }
    function queueRefresh() { if (!scheduled) { scheduled = true; requestAnimationFrame(refresh); } }
    var observer = new MutationObserver(queueRefresh);
    cards.concat(modes, characters).forEach(function (button) {
      observer.observe(button, { attributes: true, attributeFilter: ["class", "aria-pressed", "aria-disabled"] });
    });
    previous.addEventListener("click", function () { activate(browsing - 1, false); });
    next.addEventListener("click", function () { activate(browsing + 1, false); });
    cards.forEach(function (card, i) {
      card.addEventListener("click", function () {
        browsing = i;
        scrollToCard(i, false);
        updateArrows();
        queueRefresh();
      });
      card.addEventListener("focus", function () {
        browsing = i;
        scrollToCard(i, false);
        updateArrows();
      });
    });
    browser.addEventListener("keydown", function (event) {
      if (event.altKey || event.ctrlKey || event.metaKey) return;
      var index = cards.indexOf(event.target.closest("[data-district]"));
      if (index < 0) index = browsing;
      if (["ArrowLeft", "ArrowRight", "Home", "End"].indexOf(event.key) >= 0) {
        event.preventDefault(); event.stopPropagation();
        activate(event.key === "Home" ? 0 : event.key === "End" ? cards.length - 1 : index + (event.key === "ArrowRight" ? 1 : -1), true);
      } else if ((event.key === " " || event.key === "Enter") && event.target.closest("button")) {
        event.preventDefault(); event.stopPropagation();
        if (!event.repeat) event.target.closest("button").click();
      }
    });
    rail.addEventListener("pointerdown", function (event) {
      if (event.button != null && event.button !== 0) return;
      drag = { id: event.pointerId, x: event.clientX, y: event.clientY, left: rail.scrollLeft, moved: false };
    });
    rail.addEventListener("pointermove", function (event) {
      if (!drag || event.pointerId !== drag.id) return;
      var dx = event.clientX - drag.x, dy = event.clientY - drag.y;
      if (!drag.moved && Math.abs(dx) > 6 && Math.abs(dx) > Math.abs(dy)) {
        drag.moved = true;
        rail.classList.add("is-dragging");
        rail.style.scrollSnapType = "none";
        try { rail.setPointerCapture(event.pointerId); } catch (_) {}
      }
      if (drag.moved) { event.preventDefault(); rail.scrollLeft = drag.left - dx; }
    });
    function finishDrag(event, cancelled) {
      if (!drag || event.pointerId !== drag.id) return;
      var moved = drag.moved, id = drag.id;
      drag = null;
      if (moved) {
        suppressClickUntil = performance.now() + 400;
        var index = closest();
        rail.classList.remove("is-dragging");
        rail.style.removeProperty("scroll-snap-type");
        try { rail.releasePointerCapture(id); } catch (_) {}
        if (!cancelled) activate(index, false); else scrollToCard(browsing, false);
      }
    }
    rail.addEventListener("pointerup", function (event) { finishDrag(event, false); });
    rail.addEventListener("pointercancel", function (event) { finishDrag(event, true); });
    rail.addEventListener("click", function (event) {
      if (!programmatic && performance.now() < suppressClickUntil) { event.preventDefault(); event.stopImmediatePropagation(); }
    }, true);
    rail.addEventListener("wheel", function (event) {
      if (event.ctrlKey || rail.scrollWidth <= rail.clientWidth + 2) return;
      event.preventDefault();
      var now = performance.now();
      if (now - wheelAt < 360) return;
      wheelAmount += Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
      if (Math.abs(wheelAmount) < 24) return;
      activate(browsing + (wheelAmount > 0 ? 1 : -1), false);
      wheelAmount = 0; wheelAt = now;
    }, { passive: false });
    var resize = typeof ResizeObserver === "function" ? new ResizeObserver(function () {
      if (!drag) { scrollToCard(browsing, true); updateArrows(); }
    }) : null;
    if (resize) resize.observe(rail);
    window.addEventListener("resize", function () { if (!drag) scrollToCard(browsing, true); });
    window.addEventListener("storage", queueRefresh);
    reduce.addEventListener("change", function () {
      if (reduce.matches) { if (launchAction) finishLaunch(); else settleMarker(); }
    });
    document.addEventListener("visibilitychange", function () { if (document.hidden) cancelLaunch(); });
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && launchAction) cancelLaunch();
    });
    // Horizontal pad input belongs to the map; A / jump and result defaults
    // stay in the existing gameplay controller handler.
    var padPolling = false, lastPadDirection = 0;
    function pollMapPad() {
      var direction = 0;
      try {
        var gamepads = navigator.getGamepads ? navigator.getGamepads() : [];
        for (var i = 0; i < gamepads.length; i++) {
          var pad = gamepads[i]; if (!pad) continue;
          if ((pad.buttons[14] && pad.buttons[14].pressed) || (pad.axes[0] || 0) < -.6) direction = -1;
          else if ((pad.buttons[15] && pad.buttons[15].pressed) || (pad.axes[0] || 0) > .6) direction = 1;
          if (direction) break;
        }
      } catch (_) {}
      if (direction && direction !== lastPadDirection && !document.hidden && window.longRun && longRun.state === "home" && isStory() && !document.querySelector("dialog[open]")) activate(browsing + direction, false);
      lastPadDirection = direction;
      requestAnimationFrame(pollMapPad);
    }
    function startMapPad() { if (!padPolling) { padPolling = true; requestAnimationFrame(pollMapPad); } }
    window.addEventListener("gamepadconnected", startMapPad);
    try { if (navigator.getGamepads && Array.from(navigator.getGamepads()).some(Boolean)) startMapPad(); } catch (_) {}
    window.LR_MENU = {
      refresh: queueRefresh,
      launch: launch,
      focusChapter: function (id) { var i = cards.findIndex(function (card) { return card.dataset.district === id; }); if (i >= 0) activate(i, true); },
      get state() { return { mode: isStory() ? "story" : "endless", selected: selectedCard().dataset.district, browsing: cards[browsing].dataset.district, runner: runner, moving: marker.dataset.motion !== "idle", launching: !!launchAction }; }
    };
    refresh();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once: true }); else init();
})();
