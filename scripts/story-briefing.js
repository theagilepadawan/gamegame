/* A short, player-paced call before Nicolai's first New York chapter.
   Minimal ink portraits; local expressions keep the silhouettes still. */
(function () {
  "use strict";
  const reduce = matchMedia("(prefers-reduced-motion: reduce)");
  const atlas = new Image(); atlas.decoding = "async";
  atlas.src = "assets/briefing-v120/portraits.webp";
  const nicolaiAtlas = new Image(); nicolaiAtlas.decoding = "async";
  nicolaiAtlas.src = "assets/briefing-v120/nicolai-portraits.webp";
  const lines = [
    {speaker: "grete", text: "Nicolai, change of plan. We’re taking the investment meeting to Central Park."},
    {speaker: "nicolai", text: "What’s wrong with the meeting room?"},
    {speaker: "grete", text: "Nothing. But the long view is easier to find without forty-seven slides."},
    {speaker: "nicolai", text: "I’m downtown. In office shoes."},
    {speaker: "grete", text: "Stop at 505. Your running shoes are waiting. Then head north—we’ll walk and talk."},
    {speaker: "nicolai", text: "Fine. I’m counting this as active management."}
  ];
  const portraits = {
    grete: {image: atlas, row: 0, name: "Grete", mouth: [329, 278, 55, 26], eyes: [323, 187, 83, 34], blinkOffset: 0},
    nicolai: {image: nicolaiAtlas, row: 1, name: "Nicolai", mouth: [245, 283, 52, 25], eyes: [239, 181, 82, 29], blinkOffset: 1370}
  };
  let dialog, speaker, text, next, count, active = null, raf = 0, previousTime = 0;
  let lastReason = null, frameCache = null;
  const canvases = {}, lastFrame = {};

  function selected() {
    return [window.longRun?.character,
      document.querySelector("[data-mode].selected")?.dataset.mode,
      document.querySelector("[data-district].selected")?.dataset.district].join(":");
  }
  function available() {
    return window.longRun?.state === "home" && !document.hidden &&
      !document.querySelector("dialog[open]") && !window.LR_RUN?.previewing();
  }
  function shape(canvas, data, column, ellipse) {
    const patch = document.createElement("canvas"); patch.width = patch.height = 512;
    const p = patch.getContext("2d");
    p.drawImage(data.image, column * 512, data.row * 512, 512, 512, 0, 0, 512, 512);
    const mask = document.createElement("canvas"); mask.width = mask.height = 512;
    const m = mask.getContext("2d"); m.filter = "blur(3px)"; m.fillStyle = "white";
    m.beginPath(); m.ellipse(...ellipse, 0, 0, Math.PI * 2); m.fill();
    p.globalCompositeOperation = "destination-in"; p.drawImage(mask, 0, 0);
    canvas.getContext("2d").drawImage(patch, 0, 0);
  }
  function frames() {
    if (frameCache || !atlas.complete || !atlas.naturalWidth || !nicolaiAtlas.complete || !nicolaiAtlas.naturalWidth) return frameCache;
    frameCache = {};
    for (const [id, data] of Object.entries(portraits)) {
      frameCache[id] = [];
      for (let f = 0; f < 4; f++) {
        const canvas = document.createElement("canvas"); canvas.width = canvas.height = 512;
        canvas.getContext("2d").drawImage(data.image, 0, data.row * 512, 512, 512, 0, 0, 512, 512);
        if (f & 1) shape(canvas, data, 1, data.mouth);
        if (f & 2) shape(canvas, data, 2, data.eyes);
        frameCache[id].push(canvas);
      }
    }
    return frameCache;
  }
  function draw(force = false) {
    if (!active) return;
    const art = frames(); if (!art) return;
    const line = lines[active.beat];
    for (const [id, data] of Object.entries(portraits)) {
      const blinkAt = (active.clock + data.blinkOffset) % 5100;
      const blinking = !reduce.matches && blinkAt > 4080 && blinkAt < 4210;
      const syllable = Math.floor(active.age / 145) % 9;
      const speaking = !reduce.matches && line.speaker === id && active.age < Math.min(4800, 800 + line.text.length * 30);
      const mouth = speaking && [1, 2, 4, 6, 7].includes(syllable);
      const frame = (mouth ? 1 : 0) + (blinking ? 2 : 0);
      if (!force && lastFrame[id] === frame) continue;
      lastFrame[id] = frame;
      const c = canvases[id].getContext("2d"); c.save();
      c.drawImage(art[id][frame], 0, 0); c.restore();
    }
  }
  function tick(now) {
    if (!active) return;
    if (window.longRun?.state !== "home" || selected() !== active.selection) { cancel(); return; }
    const delta = previousTime ? Math.min(80, now - previousTime) : 0; previousTime = now;
    if (!document.hidden) { active.clock += delta; active.age += delta; draw(); }
    raf = requestAnimationFrame(tick);
  }
  function showBeat() {
    const line = lines[active.beat]; active.age = 0;
    speaker.textContent = portraits[line.speaker].name;
    text.textContent = line.text;
    dialog.dataset.speaker = line.speaker;
    count.textContent = `${active.beat + 1} / ${lines.length}`;
    next.textContent = active.beat === lines.length - 1 ? "Let’s go →" : "Continue →";
    draw(true);
  }
  function advance() {
    if (!active || document.hidden) return;
    if (active.beat === lines.length - 1) { finish("complete", true); return; }
    active.beat++; showBeat();
  }
  function create() {
    if (dialog) return;
    dialog = document.createElement("dialog"); dialog.id = "story-briefing";
    dialog.setAttribute("aria-labelledby", "briefing-title");
    dialog.innerHTML = `<section class="briefing-shell">
      <header class="briefing-heading"><h2 id="briefing-title">New York line</h2><span>A change of plan.</span></header>
      <div class="briefing-connection">
        <figure class="briefing-portrait" data-person="grete"><canvas width="512" height="512" role="img" aria-label="Ink portrait of Grete, wearing glasses, a lavender blazer and a patterned scarf"></canvas><figcaption><strong>Grete</strong><i aria-hidden="true"></i></figcaption></figure>
        <div class="briefing-link" aria-hidden="true"><svg viewBox="0 0 100 32"><path d="M3 16h25m44 0h25M38 11v10m8-16v22m8-22v22m8-16v10"/></svg><span>Connected</span></div>
        <figure class="briefing-portrait" data-person="nicolai"><canvas width="512" height="512" role="img" aria-label="Ink portrait of Nicolai, wearing his blue checked jacket"></canvas><figcaption><strong>Nicolai</strong><i aria-hidden="true"></i></figcaption></figure>
      </div>
      <div class="briefing-dialogue" aria-live="polite" aria-atomic="true"><span id="briefing-speaker"></span><p id="briefing-text"></p></div>
      <footer class="briefing-footer"><button type="button" class="briefing-skip">Skip call</button><span class="briefing-count" aria-label="Conversation progress"></span><button type="button" class="briefing-next">Continue →</button></footer>
    </section>`;
    document.querySelector("#stage").append(dialog);
    for (const id of Object.keys(portraits)) canvases[id] = dialog.querySelector(`[data-person="${id}"] canvas`);
    speaker = dialog.querySelector("#briefing-speaker"); text = dialog.querySelector("#briefing-text");
    next = dialog.querySelector(".briefing-next"); count = dialog.querySelector(".briefing-count");
    next.onclick = advance;
    dialog.querySelector(".briefing-skip").onclick = () => finish("skipped", true);
    dialog.addEventListener("cancel", event => { event.preventDefault(); finish("skipped", true); });
    dialog.addEventListener("keydown", event => {
      // The game's window handlers also consume Escape and map arrows. Keep
      // modal input here so a skipped call cannot change the selected course.
      event.stopPropagation();
      if (event.code === "Escape") { event.preventDefault(); if (!event.repeat) finish("skipped", true); }
      else if (event.code === "ArrowRight") { event.preventDefault(); if (!event.repeat) advance(); }
      else if (event.repeat && ["Enter", "Space"].includes(event.code)) event.preventDefault();
    });
    dialog.addEventListener("close", () => { if (active && !dialog.open) cancel(); });
  }
  function finish(reason, proceed = false) {
    const pending = active; if (!pending) return;
    active = null; lastReason = reason; cancelAnimationFrame(raf); raf = 0; previousTime = 0;
    dialog?.close(); dialog?.removeAttribute("data-hidden");
    if (proceed && window.longRun?.state === "home" && selected() === pending.selection) pending.onComplete();
  }
  function cancel() { finish("cancelled"); }
  function launch({character, onComplete} = {}) {
    if (active) return true;
    if (character !== "nicolai" || typeof onComplete !== "function" || !available()) return false;
    create(); lastReason = null; active = {onComplete, selection: selected(), beat: 0, age: 0, clock: 0};
    showBeat(); dialog.showModal(); next.focus({preventScroll: true});
    previousTime = 0; raf = requestAnimationFrame(tick); return true;
  }
  document.addEventListener("visibilitychange", () => {
    if (!active) return;
    previousTime = 0; dialog.toggleAttribute("data-hidden", document.hidden);
    if (document.hidden) { cancelAnimationFrame(raf); raf = 0; }
    else { draw(true); raf = requestAnimationFrame(tick); }
  });
  window.addEventListener("pagehide", cancel);
  reduce.addEventListener("change", () => draw(true));
  atlas.addEventListener("load", () => draw(true));
  nicolaiAtlas.addEventListener("load", () => draw(true));
  window.LR_BRIEFING = {launch, cancel, inspect: () => ({active: !!active, beat: active?.beat ?? -1,
    speaker: active ? lines[active.beat].speaker : null, age: active?.age ?? 0, clock: active?.clock ?? 0,
    reason: lastReason, reduced: reduce.matches, portraitsReady: !!(atlas.complete && atlas.naturalWidth && nicolaiAtlas.complete && nicolaiAtlas.naturalWidth),
    frames: {...lastFrame}, count: lines.length})};
})();
