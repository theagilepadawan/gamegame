/* A short, cancellable extension of the existing title idle. The original
   head, silhouette, trousers and shoes are retained; only the near arm moves. */
(function () {
  "use strict";
  const reduce = matchMedia("(prefers-reduced-motion: reduce)");
  const sources = {
    nicolai: "assets/title-gestures-v118/nicolai.webp",
    trond: "assets/title-gestures-v118/trond.webp"
  };
  const images = {}, cache = new WeakMap();
  for (const id of Object.keys(sources)) { const image = new Image(); image.src = sources[id]; images[id] = image; }
  let pending = null, raf = 0;
  const button = () => document.getElementById("start");
  function selection() {
    return [window.longRun?.character, document.querySelector("[data-mode].selected")?.dataset.mode,
      document.querySelector("[data-district].selected")?.dataset.district].join(":");
  }
  function available() {
    return window.longRun?.state === "home" && !document.hidden &&
      !document.querySelector("dialog[open]") && !window.LR_RUN?.previewing();
  }
  function cancel() {
    cancelAnimationFrame(raf); raf = 0; pending = null;
    button()?.removeAttribute("aria-busy");
  }
  function finish() {
    const p = pending, valid = p && available() && selection() === p.selection;
    cancel(); if (valid) p.action();
  }
  function tick() {
    if (!pending) return;
    if (!available() || selection() !== pending.selection) { cancel(); return; }
    if (performance.now() - pending.start >= 2000) { finish(); return; }
    raf = requestAnimationFrame(tick);
  }
  function launch(action) {
    if (pending) return true;
    const runner = window.longRun?.character, image = images[runner];
    if (!available() || reduce.matches || !image?.complete || !image.naturalWidth) return false;
    pending = { action, runner, start: performance.now(), selection: selection() };
    button()?.setAttribute("aria-busy", "true");
    // Reserved for the user's forthcoming recording; nothing is spoken yet.
    window.dispatchEvent(new CustomEvent("longrun:launch-cue", {detail: {runner, duration: 2000}}));
    raf = requestAnimationFrame(tick); return true;
  }
  function frames(atlas, runner) {
    if (cache.has(atlas)) return cache.get(atlas);
    const result = [], trond = runner === "trond";
    const scale = trond ? .88 : .855, tx = trond ? 28 : 37, ty = trond ? 29 : 41;
    // The mask never reaches the face. Its outer edge follows the existing
    // jacket; feathering is confined to seams inside the fabric.
    const mask = document.createElement("canvas"); mask.width = mask.height = 512;
    const m = mask.getContext("2d");
    m.beginPath(); m.moveTo(173, 151); m.lineTo(215, 145); m.lineTo(280, 142);
    m.lineTo(285, 226); m.lineTo(241, 237); m.lineTo(176, 225); m.closePath();
    m.fillStyle = "white"; m.filter = "blur(2px)"; m.fill();
    for (let i = 0; i < 6; i++) {
      const frame = document.createElement("canvas"); frame.width = frame.height = 512;
      const c = frame.getContext("2d");
      c.drawImage(atlas, 1024, 512, 512, 512, 0, 0, 512, 512);
      if (i) {
        const patch = document.createElement("canvas"); patch.width = patch.height = 512;
        const p = patch.getContext("2d");
        p.drawImage(images[runner], i % 3 * 512, Math.floor(i / 3) * 512, 512, 512, tx, ty, 512 * scale, 512 * scale);
        p.globalCompositeOperation = "destination-in"; p.drawImage(mask, 0, 0);
        c.globalCompositeOperation = "destination-out"; c.drawImage(mask, 0, 0);
        c.globalCompositeOperation = "source-over"; c.drawImage(patch, 0, 0);
      }
      result.push(frame);
    }
    cache.set(atlas, result); return result;
  }
  function draw(ctx, atlas, runner, x, y, scale) {
    if (!pending || runner !== pending.runner) return false;
    const art = frames(atlas, runner), age = performance.now() - pending.start;
    const t = Math.max(0, Math.min(1, (age - 90) / 510));
    const f = t * t * (3 - 2 * t) * 5, low = Math.floor(f), mix = f - low;
    // Interpolate just the small arm patch, on a registered, unchanging body.
    ctx.save(); ctx.translate(x - 256 * scale, y - 460 * scale);
    ctx.drawImage(art[low], 0, 0, 512 * scale, 512 * scale);
    if (mix > 0) { ctx.globalAlpha *= mix; ctx.drawImage(art[Math.min(5, low + 1)], 0, 0, 512 * scale, 512 * scale); }
    ctx.restore(); return true;
  }
  document.addEventListener("visibilitychange", () => { if (document.hidden) cancel(); });
  document.addEventListener("keydown", event => { if (event.key === "Escape") cancel(); });
  reduce.addEventListener("change", () => { if (reduce.matches) finish(); });
  window.LR_TITLE_LAUNCH = {launch, cancel, draw,
    get state() { return {active: !!pending, runner: pending?.runner, age: pending ? performance.now() - pending.start : 0}; }};
})();
