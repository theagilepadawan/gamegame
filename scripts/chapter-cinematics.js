/* The supplied gift reveal, only on Next: Central Park after winning Midtown.
   Decoded once per visit; no timer substitutes for the actual video ending. */
(function () {
  "use strict";
  const source = "assets/cutscenes-v119/midtown-gift.mp4";
  const poster = "assets/cutscenes-v119/midtown-gift-poster.webp";
  let dialog, video, playButton, active = null, lastReason = null;
  function eligible(run, next) { return !!(next === "park" && run?.mode === "chapter" && run.districtId === "midtown" && run.won); }
  function create() {
    if (dialog) return;
    dialog = document.createElement("dialog"); dialog.id = "chapter-film";
    dialog.className = "chapter-film"; dialog.setAttribute("aria-label", "Midtown: a change of pace");
    const atmosphere = document.createElement("div"); atmosphere.className = "film-atmosphere";
    atmosphere.style.backgroundImage = `url("${poster}")`; atmosphere.setAttribute("aria-hidden", "true");
    const frame = document.createElement("div"); frame.className = "film-frame";
    video = document.createElement("video"); video.id = "chapter-video";
    video.muted = true; video.defaultMuted = true; video.playsInline = true;
    video.setAttribute("playsinline", ""); video.preload = "auto"; video.poster = poster;
    video.setAttribute("aria-label", "Outside 505 Fifth Avenue, Nicolai receives and opens a gift of blue running shoes.");
    const controls = document.createElement("div"); controls.className = "film-controls";
    const caption = document.createElement("p"); caption.textContent = "A change of pace.";
    playButton = document.createElement("button"); playButton.type = "button";
    playButton.textContent = "Play scene"; playButton.hidden = true; playButton.onclick = resume;
    const skip = document.createElement("button"); skip.type = "button"; skip.className = "film-skip";
    skip.textContent = "Skip scene →"; skip.onclick = () => finish("skipped");
    controls.append(caption, playButton, skip); frame.append(video, controls); dialog.append(atmosphere, frame);
    document.querySelector("#stage").append(dialog);
    dialog.addEventListener("cancel", event => { event.preventDefault(); finish("skipped"); });
    dialog.addEventListener("keydown", event => {
      if (event.code === "Escape" || event.code === "Space" && event.target === skip) {
        event.preventDefault(); event.stopPropagation(); finish("skipped");
      }
    });
    video.addEventListener("ended", () => {
      if (document.hidden) { if (active) active.ended = true; }
      else finish("ended");
    });
    video.addEventListener("error", () => finish("unavailable"));
  }
  function prepare(run) {
    if (run?.mode !== "chapter" || run.districtId !== "midtown") return;
    create(); if (!video.getAttribute("src")) video.src = source;
  }
  function resume() {
    const current = active;
    if (!current || document.hidden) return;
    if (current.ended) { finish("ended"); return; }
    current.audio.syncMusic();
    current.stalled = 0; current.waiting = false; playButton.hidden = true;
    Promise.resolve(video.play()).then(() => {
      // A cancelled play promise may resolve after a new visit has begun.
      // It may stop an abandoned element, never the newer active screening.
      if (!active || active === current && document.hidden) video.pause();
    }).catch(() => {
      if (active !== current) return;
      current.audio.musicTracks.gift?.pause();
      current.waiting = true; playButton.hidden = false; playButton.focus({preventScroll: true});
    });
  }
  function finish(reason, notify = true) {
    const current = active; if (!current) return;
    active = null; lastReason = reason; clearInterval(current.watchdog);
    video.pause(); dialog.close();
    current.audio.endMusic({resume: false});
    current.audio.ducked = current.ducked; current.audio.scene = current.scene; current.audio.apply();
    if (notify) current.done();
  }
  function play(run, next, audio, done) {
    if (!eligible(run, next)) { done(); return; }
    finish("replaced", false); prepare(run);
    active = {audio, done, ducked: audio.ducked, scene: audio.scene, stalled: 0, waiting: false, ended: false, time: 0};
    lastReason = null; video.currentTime = 0; playButton.hidden = true;
    audio.stopClips(); audio.scene = "cutscene"; audio.ducked = false; audio.startMusic("gift");
    dialog.showModal(); dialog.querySelector(".film-skip").focus({preventScroll: true});
    const current = active;
    current.watchdog = setInterval(() => {
      if (active !== current || document.hidden || current.waiting) return;
      current.stalled = video.currentTime > current.time + .005 ? 0 : current.stalled + 250;
      current.time = video.currentTime;
      if (video.error || current.stalled >= 8000) finish("unavailable");
    }, 250);
    if (video.error) finish("unavailable"); else resume();
  }
  document.addEventListener("visibilitychange", () => {
    if (!active) return;
    if (document.hidden) { video.pause(); active.audio.syncMusic(); }
    else resume();
  });
  window.LR_CINEMA = {eligible, prepare, play, cancel: () => finish("cancelled", false),
    inspect: () => ({active: !!active, reason: lastReason, time: video?.currentTime || 0,
      duration: video?.duration || 0, width: video?.videoWidth || 0, height: video?.videoHeight || 0,
      paused: video?.paused ?? true, waiting: active?.waiting || false})};
})();
