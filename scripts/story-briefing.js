/* A short, player-paced call before Nicolai's first New York chapter.
   Minimal ink portraits; local expressions keep the silhouettes still. */
(function () {
  "use strict";
  const reduce = matchMedia("(prefers-reduced-motion: reduce)");
  const atlas = new Image(); atlas.decoding = "async";
  atlas.src = "assets/briefing-v120/portraits.webp";
  const nicolaiAtlas = new Image(); nicolaiAtlas.decoding = "async";
  nicolaiAtlas.src = "assets/briefing-v120/nicolai-portraits.webp";
  const reactionAtlas = new Image(); reactionAtlas.decoding = "async";
  reactionAtlas.src = "assets/briefing-v122/nicolai-reaction.webp";
  const dialDuration = 4400;
  const lines = [
    {speaker: "grete", text: "Nicolai, ??? just had a cancellation. They can meet you in Central Park in one hour."},
    {speaker: "nicolai", expression: 4, text: "Hellandussen, that’s great! Sounds like an easy run, but I could really use my joggers."},
    {speaker: "grete", expression: 4, text: "Stop by 505. I’ll have a pair waiting for you."},
    {speaker: "nicolai", expression: 5, text: "Perfect. Let’s see if active management can beat a taxi."}
  ];
  const portraits = {
    grete: {image: atlas, row: 0, name: "Grete", mouth: [329, 278, 55, 26], eyes: [323, 187, 83, 34], blinkOffset: 0},
    nicolai: {image: nicolaiAtlas, row: 1, name: "Nicolai", mouth: [245, 283, 52, 25], eyes: [239, 181, 82, 29], blinkOffset: 1370}
  };
  let dialog, speaker, text, next, count, alert, dial, dialStatus, dialWords, dialOrbit, dialSignal, active = null, raf = 0, previousTime = 0;
  let lastReason = null, frameCache = null;
  const canvases = {}, lastFrame = {};

  function surprise() {
    if (!active || active.alertAt !== null) return;
    active.alertAt = active.clock;
    active.audio?.clip("mission-alert");
  }
  function drawSurprise() {
    if (!active) return;
    const age = active.alertAt === null ? -1 : active.clock - active.alertAt;
    const visible = active.beat === 1 && age >= 0;
    alert.hidden = !visible; dialog.toggleAttribute("data-alert", visible);
    if (!visible) return;
    const enter = Math.min(1, age / 190), settle = 1 - (1 - enter) ** 3;
    const scale = reduce.matches ? 1 : .65 + .35 * settle + .06 * Math.sin(enter * Math.PI);
    const rise = reduce.matches ? 0 : 6 * (1 - settle);
    alert.style.opacity = String(reduce.matches ? 1 : Math.min(1, age / 60));
    alert.style.transform = `translate(-50%, ${rise}px) scale(${scale})`;
    alert.querySelector(".alert-rays").style.opacity = reduce.matches ? "0" : String(Math.max(0, 1 - age / 580));
  }
  function stopClip(pending, id) {
    const audio = pending?.audio;
    if (audio?.activeClip && audio.activeClip === audio.clips[id]) audio.stopClips();
  }
  function stopSurprise(pending) { stopClip(pending, "mission-alert"); }
  const ease = value => { const t = Math.max(0, Math.min(1, value)); return t * t * (3 - 2 * t); };
  function drawDial() {
    if (!active || active.phase !== "ringing") return;
    const age = active.dialAge, progress = Math.min(1, age / dialDuration);
    const unfold = ease((age - 1850) / 1250), pulse = Math.sin(age / 190) ** 2;
    dial.style.opacity = String(reduce.matches ? 1 : 1 - ease((age - 4060) / 340));
    dial.style.setProperty("--dial-pulse", reduce.matches ? "0" : String(pulse));
    dialOrbit.style.opacity = String(reduce.matches ? .35 : .5 * (1 - unfold));
    dialOrbit.style.transform = reduce.matches ? "none" : `rotate(${age * .012}deg)`;
    dial.querySelector(".dial-progress").style.strokeDashoffset = String(628.32 * (1 - progress));
    dialWords.forEach((word, index) => {
      const appear=reduce.matches?1:ease((age-90-index*120)/210);
      word.style.opacity=String(appear);word.style.transform=`translateY(${3*(1-appear)}px)`;
      const amount = reduce.matches ? 1 : ease((age - 1850 - index * 120) / 900);
      const suffix = word.querySelector(".dial-suffix");
      suffix.style.maxWidth = `${suffix.textContent.length * amount}ch`;
      suffix.style.opacity = String(amount);
    });
    const signal = age < 1850 ? "Incoming call" : age < 3300 ? "Connecting" : "Line open";
    if (dialStatus.textContent !== signal) dialStatus.textContent = signal;
    dialSignal.style.transform = reduce.matches ? "none" : `rotate(${age < 1850 ? Math.sin(age / 27) * pulse * 5 : 0}deg)`;
  }
  function connect() {
    if (!active || active.phase !== "ringing") return;
    stopClip(active, "gdl-ring");
    active.phase = "talk"; active.clock = active.age = 0;
    dialog.dataset.phase = "talk"; dial.hidden = true;
    showBeat();
  }
  function closeTranslation() {
    const tip = dialog?.querySelector(".dialect-tooltip"), term = dialog?.querySelector(".dialect-term");
    if (!tip || tip.hidden) return false;
    tip.hidden = true; term.setAttribute("aria-expanded", "false"); return true;
  }
  function dialogueText(line) {
    text.replaceChildren();
    for (const part of line.split(/(\?\?\?|Hellandussen)/)) {
      if (part === "???") {
        const unknown = document.createElement("span"); unknown.className = "briefing-unknown";
        unknown.textContent = part; unknown.setAttribute("aria-label", "an undisclosed contact"); text.append(unknown);
      } else if (part === "Hellandussen") {
        const wrap = document.createElement("span"); wrap.className = "dialect-wrap";
        const term = document.createElement("button"); term.type = "button"; term.className = "dialect-term";
        term.textContent = part; term.setAttribute("aria-describedby", "dialect-meaning");
        term.setAttribute("aria-expanded", "false");
        const tip = document.createElement("span"); tip.className = "dialect-tooltip";
        tip.id = "dialect-meaning"; tip.setAttribute("role", "tooltip"); tip.hidden = true;
        tip.textContent = "Norwegian dialect for 'woah'";
        const open = () => { tip.hidden = false; term.setAttribute("aria-expanded", "true"); };
        wrap.addEventListener("pointerenter", event => { if (event.pointerType !== "touch") open(); });
        wrap.addEventListener("pointerleave", () => { if (document.activeElement !== term) closeTranslation(); });
        term.addEventListener("focus", open); term.addEventListener("blur", closeTranslation);
        // Touch and keyboard can reveal the same note without advancing the call.
        term.addEventListener("click", event => { event.stopPropagation(); open(); });
        wrap.append(term, tip); text.append(wrap);
      } else text.append(document.createTextNode(part));
    }
  }

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
  function reactionFrames(art) {
    if (art.nicolai.length > 4 || !reactionAtlas.complete || !reactionAtlas.naturalWidth) return;
    // Only the brows, eyes and mouth change. The approved head outline, short
    // hair, neck and jacket remain the exact neutral portrait pixels.
    const data = {image: reactionAtlas, row: 1};
    for (const column of [1, 2]) {
      const canvas = document.createElement("canvas"); canvas.width = canvas.height = 512;
      canvas.getContext("2d").drawImage(art.nicolai[0], 0, 0);
      shape(canvas, data, column, [242, 174, 94, 43]);
      shape(canvas, data, column, [246, 285, 58, 37]);
      art.nicolai.push(canvas);
    }
  }
  function draw(force = false) {
    if (!active) return;
    if (active.phase === "ringing") { drawDial(); return; }
    drawSurprise();
    const art = frames(); if (!art) return;
    reactionFrames(art);
    const line = lines[active.beat];
    for (const [id, data] of Object.entries(portraits)) {
      const blinkAt = (active.clock + data.blinkOffset) % 5100;
      const blinking = !reduce.matches && blinkAt > 4080 && blinkAt < 4210;
      const syllable = Math.floor(active.age / 145) % 9;
      const speaking = !reduce.matches && line.speaker === id && active.age < Math.min(4800, 800 + line.text.length * 30);
      const mouth = speaking && [1, 2, 4, 6, 7].includes(syllable);
      // Hold the surprised drawing for the entire first reply; reserve the
      // smile for his final line instead of morphing between them mid-sentence.
      const expression = id === "nicolai" && line.expression;
      const frame = expression && art.nicolai.length > expression ? expression : (mouth ? 1 : 0) + (blinking ? 2 : 0);
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
    if (!document.hidden) {
      if (active.phase === "ringing") {
        active.dialAge += delta;
        if (active.dialAge >= dialDuration) connect();
      } else { active.clock += delta; active.age += delta; }
      draw();
    }
    raf = requestAnimationFrame(tick);
  }
  function showBeat() {
    const line = lines[active.beat]; active.age = 0;
    speaker.textContent = portraits[line.speaker].name;
    dialogueText(line.text);
    dialog.dataset.speaker = line.speaker;
    count.textContent = `${active.beat + 1} / ${lines.length}`;
    next.textContent = active.beat === lines.length - 1 ? "Let’s go →" : "Continue →";
    draw(true);
  }
  function advance() {
    if (!active || document.hidden) return;
    if (active.phase === "ringing") { connect(); return; }
    if (active.beat === lines.length - 1) { finish("complete", true); return; }
    if (active.beat === 1) stopSurprise(active);
    active.beat++;
    if (active.beat === 1) surprise();
    showBeat();
  }
  function create() {
    if (dialog) return;
    dialog = document.createElement("dialog"); dialog.id = "story-briefing";
    dialog.setAttribute("aria-labelledby", "briefing-title");
    dialog.innerHTML = `<section class="briefing-shell">
      <header class="briefing-heading"><h2 id="briefing-title">New York · Before the bell</h2><span><i aria-hidden="true"></i> Private line</span></header>
      <div class="briefing-dial" aria-label="Incoming call. GDL: Grete Direct Line">
        <svg class="dial-orbit" viewBox="0 0 240 240" aria-hidden="true"><circle cx="120" cy="120" r="100"/><path d="M120 10v12m0 196v12M10 120h12m196 0h12"/><circle class="dial-progress" cx="120" cy="120" r="100" pathLength="628.32"/></svg>
        <div class="dial-ident"><span class="dial-tag">GDL / PRIVATE CONNECTION</span>
          <div class="dial-brand" aria-hidden="true"><span class="dial-word">G<span class="dial-suffix">rete</span></span><span class="dial-word">D<span class="dial-suffix">irect</span></span><span class="dial-word">L<span class="dial-suffix">ine</span></span></div>
          <div class="dial-status-line"><svg class="dial-receiver" viewBox="0 0 32 32" aria-hidden="true"><path d="M9 5l5 5-3 4c2 4 3 5 7 7l4-3 5 5-2 4c-1 2-5 1-9-1C9 22 5 17 4 10c0-2 2-4 5-5Z"/><path class="dial-waves" d="M21 5c4 1 6 3 7 7M21 10c1 0 2 1 2 2"/></svg><span class="dial-status" role="status">Incoming call</span><span class="dial-dots" aria-hidden="true">···</span></div>
        </div>
        <div class="dial-baseline" aria-hidden="true"><span>NEW YORK</span><span>06:00</span><span>DIRECT LINE</span></div>
      </div>
      <div class="briefing-connection">
        <figure class="briefing-portrait" data-person="grete"><canvas width="512" height="512" role="img" aria-label="Ink portrait of Grete, wearing glasses, a lavender blazer and a patterned scarf"></canvas><figcaption><strong>Grete</strong><i aria-hidden="true"></i></figcaption></figure>
        <div class="briefing-link" aria-label="06:00 New York. Grete Direct Line."><span>NBIM · NYC</span><b>06:00</b><svg aria-hidden="true" viewBox="0 0 100 32"><path d="M3 16h25m44 0h25M38 11v10m8-16v22m8-22v22m8-16v10"/></svg><span>GDL · CONNECTED</span></div>
        <figure class="briefing-portrait" data-person="nicolai"><span class="briefing-alert" aria-hidden="true" hidden><svg viewBox="0 0 48 78"><defs><linearGradient id="briefing-alert-gold" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#fff5cf"/><stop offset=".55" stop-color="#f5d28a"/><stop offset="1" stop-color="#c89140"/></linearGradient></defs><g fill="#041425" stroke="#041425" stroke-width="5" stroke-linejoin="round" transform="translate(2 3)"><path d="M15 8Q14 4 19 4H35Q40 4 39 9L32 48Q31 53 27 53H22Q18 53 18 49Z"/><circle cx="24" cy="66" r="7"/></g><g fill="url(#briefing-alert-gold)" stroke="#132b3c" stroke-width="2.5" stroke-linejoin="round"><path d="M15 8Q14 4 19 4H35Q40 4 39 9L32 48Q31 53 27 53H22Q18 53 18 49Z"/><circle cx="24" cy="66" r="7"/></g><path d="M20 10H32M22 17L24 43M21 63L25 61" fill="none" stroke="#fff7dd" stroke-width="2.2" stroke-linecap="round" opacity=".8"/><g class="alert-rays" fill="none" stroke="#b7d9cb" stroke-width="2" stroke-linecap="round"><path d="M5 18L2 14M42 25L46 22M9 42L5 43"/></g></svg></span><canvas width="512" height="512" role="img" aria-label="Ink portrait of Nicolai, wearing his blue checked jacket"></canvas><figcaption><strong>Nicolai</strong><i aria-hidden="true"></i></figcaption></figure>
      </div>
      <div class="briefing-dialogue" aria-live="polite" aria-atomic="true"><span id="briefing-speaker"></span><p id="briefing-text"></p></div>
      <footer class="briefing-footer"><button type="button" class="briefing-skip">Skip call</button><span class="briefing-count" aria-label="Conversation progress"></span><button type="button" class="briefing-next">Continue →</button></footer>
    </section>`;
    document.querySelector("#stage").append(dialog);
    for (const id of Object.keys(portraits)) canvases[id] = dialog.querySelector(`[data-person="${id}"] canvas`);
    speaker = dialog.querySelector("#briefing-speaker"); text = dialog.querySelector("#briefing-text");
    next = dialog.querySelector(".briefing-next"); count = dialog.querySelector(".briefing-count");
    alert = dialog.querySelector(".briefing-alert");
    dial = dialog.querySelector(".briefing-dial"); dialStatus = dialog.querySelector(".dial-status");
    dialWords = [...dialog.querySelectorAll(".dial-word")]; dialOrbit = dialog.querySelector(".dial-orbit");
    dialSignal = dialog.querySelector(".dial-receiver");
    next.onclick = advance;
    dialog.querySelector(".briefing-skip").onclick = () => finish("skipped", true);
    dialog.addEventListener("cancel", event => { event.preventDefault(); finish("skipped", true); });
    dialog.addEventListener("keydown", event => {
      // The game's window handlers also consume Escape and map arrows. Keep
      // modal input here so a skipped call cannot change the selected course.
      event.stopPropagation();
      if (event.code === "Escape") { event.preventDefault(); if (!event.repeat && !closeTranslation()) finish("skipped", true); }
      else if (event.code === "ArrowRight") { event.preventDefault(); if (!event.repeat) advance(); }
      else if (event.repeat && ["Enter", "Space"].includes(event.code)) event.preventDefault();
    });
    dialog.addEventListener("close", () => { if (active && !dialog.open) cancel(); });
  }
  function finish(reason, proceed = false) {
    const pending = active; if (!pending) return;
    active = null; lastReason = reason; cancelAnimationFrame(raf); raf = 0; previousTime = 0;
    stopClip(pending, "gdl-ring"); stopSurprise(pending); alert.hidden = true; dialog.removeAttribute("data-alert");
    dialog?.close(); dialog?.removeAttribute("data-hidden");
    pending.audio?.holdMusic?.("briefing", false);
    if (proceed && window.longRun?.state === "home" && selected() === pending.selection) pending.onComplete();
  }
  function cancel() { finish("cancelled"); }
  function launch({character, onComplete, audio} = {}) {
    if (active) return true;
    if (character !== "nicolai" || typeof onComplete !== "function" || !available()) return false;
    create(); lastReason = null; active = {onComplete, audio, selection: selected(), phase: "ringing", dialAge: 0, beat: 0, age: 0, clock: 0, alertAt: null};
    audio?.holdMusic?.("briefing", true);
    dialog.dataset.phase = "ringing"; dialog.removeAttribute("data-speaker"); dial.hidden = false; alert.hidden = true;
    text.replaceChildren(); speaker.textContent = ""; count.textContent = "Incoming"; next.textContent = "Answer call →";
    drawDial(); dialog.showModal(); next.focus({preventScroll: true}); audio?.clip?.("gdl-ring");
    previousTime = 0; raf = requestAnimationFrame(tick); return true;
  }
  document.addEventListener("visibilitychange", () => {
    if (!active) return;
    previousTime = 0; dialog.toggleAttribute("data-hidden", document.hidden);
    const current = active, audio = current.audio, clip = audio?.clips[current.phase === "ringing" ? "gdl-ring" : "mission-alert"];
    if (document.hidden) {
      cancelAnimationFrame(raf); raf = 0;
      if (clip && audio.activeClip === clip) clip.pause();
    } else {
      if (clip && audio.enabled && audio.activeClip === clip && !clip.ended) {
        Promise.resolve(clip.play()).then(() => {
          if (!active || active === current && (document.hidden || !audio.enabled)) clip.pause();
        }).catch(() => { if (active === current) audio.stopClips(); });
      }
      draw(true); raf = requestAnimationFrame(tick);
    }
  });
  window.addEventListener("pagehide", cancel);
  reduce.addEventListener("change", () => draw(true));
  atlas.addEventListener("load", () => draw(true));
  nicolaiAtlas.addEventListener("load", () => draw(true));
  reactionAtlas.addEventListener("load", () => draw(true));
  window.LR_BRIEFING = {launch, cancel, inspect: () => ({active: !!active, beat: active?.beat ?? -1,
    phase: active?.phase ?? null, dialAge: active?.dialAge ?? 0, dialDuration,
    speaker: active?.phase === "talk" ? lines[active.beat].speaker : null, age: active?.age ?? 0, clock: active?.clock ?? 0,
    reason: lastReason, reduced: reduce.matches, portraitsReady: !!(atlas.complete && atlas.naturalWidth && nicolaiAtlas.complete && nicolaiAtlas.naturalWidth),
    reactionReady: !!(reactionAtlas.complete && reactionAtlas.naturalWidth),
    alertPlayed: active?.alertAt !== null && active?.alertAt !== undefined,
    alertAge: active?.alertAt === null || !active ? -1 : active.clock - active.alertAt,
    frames: {...lastFrame}, count: lines.length})};
})();
