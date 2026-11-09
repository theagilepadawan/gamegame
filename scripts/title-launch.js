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
  let pending = null, raf = 0, light = null, lightKey = "";
  const smooth = t => { t = Math.max(0, Math.min(1, t)); return t * t * (3 - 2 * t); };
  const patchBox = {x: 164, y: 136, w: 122, h: 112};
  const steps = 44;
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
    if (light) { light.hidden = true; light.style.opacity = "0"; }
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
    const trond = runner === "trond";
    const scale = trond ? .88 : .855, tx = trond ? 28 : 37, ty = trond ? 29 : 41;
    const frame = document.createElement("canvas"); frame.width = frame.height = 512;
    const c = frame.getContext("2d", {willReadFrequently: true});
    c.drawImage(atlas, 1024, 512, 512, 512, 0, 0, 512, 512);
    const base = c.getImageData(0, 0, 512, 512), poses = [base];
    // Skip the generated anticipation/downstroke: begin at the exact idle and
    // lift directly. Register each palm before tweening, so two hands never
    // dissolve across one another. The shoulder stays anchored.
    for (const i of [2, 3, 4, 5]) {
      c.clearRect(0, 0, 512, 512);
      c.drawImage(images[runner], i % 3 * 512, Math.floor(i / 3) * 512, 512, 512, tx, ty, 512 * scale, 512 * scale);
      poses.push(c.getImageData(0, 0, 512, 512));
    }
    c.putImageData(base, 0, 0);
    const hands = trond ? [[266,194],[265,180],[262,169],[259,163],[256,161]] :
      [[260,213],[245,204],[245,185],[244,172],[241,161]];
    // Curved seams end inside the jacket, with a broad feather. The stationary
    // far hand is excluded. No mask pixel reaches the face, waist or legs.
    const mask = document.createElement("canvas"); mask.width = mask.height = 512;
    const m = mask.getContext("2d");
    m.beginPath(); m.moveTo(181,153); m.bezierCurveTo(205,147,234,141,267,142);
    m.bezierCurveTo(279,150,278,180,274,trond ? 196 : 219);
    m.bezierCurveTo(246,trond ? 207 : 231,204,234,179,214); m.closePath();
    m.fillStyle = "white"; m.filter = "blur(7px)"; m.fill();
    const maskData = m.getImageData(patchBox.x, patchBox.y, patchBox.w, patchBox.h).data;
    const patches = [], sampleA = new Float64Array(4), sampleB = new Float64Array(4);
    // Bilinear sampling in premultiplied alpha prevents coloured transparent
    // fringes. Samples are then blended by weight, never source-over twice.
    function sample(data, x, y, out) {
      const ix = Math.floor(x), iy = Math.floor(y), fx = x - ix, fy = y - iy;
      out.fill(0);
      for (let j = 0; j < 2; j++) for (let i = 0; i < 2; i++) {
        const k = ((iy + j) * 512 + ix + i) * 4;
        const w = (i ? fx : 1 - fx) * (j ? fy : 1 - fy), alpha = data[k + 3] / 255;
        for (let channel = 0; channel < 3; channel++) out[channel] += data[k + channel] * alpha * w;
        out[3] += alpha * w;
      }
    }
    function patch(index) {
      if (patches[index]) return patches[index];
      const phase = smooth(index / steps) * 4, lo = Math.min(3, Math.floor(phase)), mix = phase - lo;
      const a = hands[lo], b = hands[lo + 1], target = [a[0] + (b[0]-a[0])*mix, a[1] + (b[1]-a[1])*mix];
      const out = new ImageData(patchBox.w, patchBox.h), pixels = out.data;
      for (let py = 0; py < patchBox.h; py++) for (let px = 0; px < patchBox.w; px++) {
        const x = px + patchBox.x, y = py + patchBox.y, k = (py * patchBox.w + px) * 4, original = (y * 512 + x) * 4;
        const distance = Math.hypot(x-target[0],y-target[1]);
        const warp = 1 - smooth((distance - 20) / 62);
        sample(poses[lo].data, x-(target[0]-a[0])*warp, y-(target[1]-a[1])*warp, sampleA);
        sample(poses[lo+1].data, x-(target[0]-b[0])*warp, y-(target[1]-b[1])*warp, sampleB);
        // Full opacity around both the old and moving palm removes any ghost
        // of the resting hand; softer cloth transitions surround this core.
        const palm = 1 - smooth((Math.hypot((x-target[0])/1.05, (y-target[1])/.95) - 23) / 10);
        const rest = 1 - smooth((Math.hypot(x-hands[0][0], y-hands[0][1]) - 19) / 10);
        let maskWeight = Math.max(maskData[k+3]/255, palm, rest) * smooth((y-136)/3);
        maskWeight *= 1-smooth((x-(trond ? 278 : 273))/10);
        if (trond) maskWeight *= 1-smooth((y-203)/10) * smooth((x-225)/20);
        const originalAlpha = base.data[original+3]/255;
        const sourceAlpha = sampleA[3]*(1-mix)+sampleB[3]*mix;
        // Slight atlas-registration differences must never cut a transparent
        // slit into the solid jacket. Retain its original backing underneath
        // any newly exposed edge; the hand still replaces opaque cloth above.
        const backing = Math.max(0, originalAlpha-sourceAlpha);
        const alpha = originalAlpha*(1-maskWeight)+(sourceAlpha+backing)*maskWeight;
        pixels[k+3] = Math.round(alpha*255);
        for (let channel=0;channel<3;channel++) {
          const source = sampleA[channel]*(1-mix)+sampleB[channel]*mix+base.data[original+channel]*backing;
          pixels[k+channel] = alpha ? (base.data[original+channel]*originalAlpha*(1-maskWeight)+source*maskWeight)/alpha : 0;
        }
      }
      patches[index] = out; return out;
    }
    const result = {frame, paint(index) { c.putImageData(patch(index), patchBox.x, patchBox.y); return frame; }};
    cache.set(atlas, result);
    // Small cached arm crops only (~2.5 MB per runner), not 45 full sprites.
    // Warm them in idle slices; a fast first click can render its pose directly.
    let next = 0;
    const warm = deadline => {
      do { patch(next++); } while (next <= steps && deadline.timeRemaining() > 6);
      if (next <= steps) requestIdleCallback(warm, {timeout: 500});
    };
    if (window.requestIdleCallback) requestIdleCallback(warm, {timeout: 500});
    return result;
  }
  function spotlight(ctx, x, y, scale, age) {
    if (ctx.canvas.id !== "game") return;
    if (!light) {
      light = document.createElement("canvas"); light.id = "title-launch-light";
      light.setAttribute("aria-hidden", "true");
      light.style.cssText = "position:absolute;inset:0;width:100%;height:100%;z-index:50;pointer-events:none";
      document.getElementById("stage").append(light);
    }
    const transform = ctx.getTransform(), key = [ctx.canvas.width,ctx.canvas.height,...["a","b","c","d","e","f"].map(k=>transform[k]),x,y,scale].join(":");
    if (key !== lightKey) {
      lightKey = key; light.width = ctx.canvas.width; light.height = ctx.canvas.height;
      const l = light.getContext("2d"), factor = scale/.48;
      l.fillStyle = "rgba(2,7,17,.68)"; l.fillRect(0,0,light.width,light.height);
      l.setTransform(transform);
      // A stationary, warm theatre light. No camera shift, moving iris or
      // sweep. Its clear core keeps the approved character colours intact.
      l.save(); l.translate(x-5*factor,y-95*factor); l.scale(114*factor,153*factor);
      let glow = l.createRadialGradient(0,0,.1,0,0,1.28);
      glow.addColorStop(0,"rgba(255,229,171,.12)"); glow.addColorStop(.67,"rgba(255,223,164,.08)"); glow.addColorStop(1,"rgba(255,222,163,0)");
      l.fillStyle = glow; l.fillRect(-1.3,-1.3,2.6,2.6);
      l.globalCompositeOperation = "destination-out";
      const clear = l.createRadialGradient(0,0,0,0,0,1);
      clear.addColorStop(0,"rgba(0,0,0,1)"); clear.addColorStop(.65,"rgba(0,0,0,1)"); clear.addColorStop(.9,"rgba(0,0,0,.46)"); clear.addColorStop(1,"rgba(0,0,0,0)");
      l.fillStyle = clear; l.fillRect(-1,-1,2,2); l.restore();
      l.save(); l.translate(x,y+2*factor); l.scale(92*factor,15*factor);
      const floor = l.createRadialGradient(0,0,0,0,0,1);
      floor.addColorStop(0,"rgba(255,225,165,.15)"); floor.addColorStop(.55,"rgba(255,224,166,.07)"); floor.addColorStop(1,"rgba(255,224,166,0)");
      l.fillStyle = floor; l.fillRect(-1,-1,2,2); l.restore();
    }
    light.hidden = false;
    light.style.opacity = String(smooth(age/240) * (1-smooth((age-1840)/160)));
  }
  function draw(ctx, atlas, runner, x, y, scale) {
    const ready = images[runner]?.complete && images[runner]?.naturalWidth;
    if (ready && atlas?.complete && atlas.naturalWidth) frames(atlas, runner);
    if (!pending || runner !== pending.runner) return false;
    const art = frames(atlas, runner), age = performance.now() - pending.start;
    const index = Math.round(Math.max(0, Math.min(1, (age-100)/740)) * steps);
    ctx.save(); ctx.translate(x - 256 * scale, y - 460 * scale);
    ctx.drawImage(art.paint(index), 0, 0, 512 * scale, 512 * scale);
    ctx.restore(); spotlight(ctx, x, y, scale, age); return true;
  }
  document.addEventListener("visibilitychange", () => { if (document.hidden) cancel(); });
  document.addEventListener("keydown", event => { if (event.key === "Escape") cancel(); });
  reduce.addEventListener("change", () => { if (reduce.matches) finish(); });
  window.LR_TITLE_LAUNCH = {launch, cancel, draw,
    get state() { return {active: !!pending, runner: pending?.runner, age: pending ? performance.now() - pending.start : 0}; }};
})();
