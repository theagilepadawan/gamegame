/* Painted chapter exits, using the game's existing canvas/Pixi compositor.
   Back wall -> runner -> near door pier is real depth ordering, not a fade. */
(function () {
  "use strict";
  const reduce = matchMedia("(prefers-reduced-motion: reduce)");
  const definitions = {
    opening: {src: "assets/finish-gates-v118/opening.webp", end: 75, speed: 360, scale: .425, foot: 976, door: 515, pier: 950, plaque: [720, 377], title: "THE LISTING BELL", sub: "A LONGER HORIZON", number: "I"},
    midtown: {src: "assets/finish-gates-v118/midtown.webp", end: 60, speed: 320, scale: .36, foot: 976, door: 320, pier: 628, outerPier: 1200, interiorRise: 10, host: true, title: "505 FIFTH", number: "II"},
    park: {src: "assets/finish-gates-v118/park.webp", end: 60, speed: 320, scale: .395, foot: 980, door: 404, pier: 973, plaque: [712, 249], title: "THE LONG VIEW", sub: "RETURNS, WITH A VIEW", number: "III"}
  };
  const sequences = new WeakMap();
  for (const info of Object.values(definitions)) {
    info.image = new Image(); info.image.src = info.src;
  }
  function definition(run) { return run?.mode === "chapter" ? definitions[run.districtId || "opening"] : null; }
  function ready(run) { const info = definition(run); return !!(info?.image.complete && info.image.naturalWidth); }
  function geometry(run) {
    const info = definition(run);
    if (!info) return null;
    // The near corner arrives at the far right of the viewport. The whole
    // structure still scrolls at ground speed on approach; it is not pinned
    // to the screen. 505 keeps its full blue front and both revolving doors.
    const offset = (info.end - run.chapterTime) * info.speed;
    const left = run.width - (info.outerPier || info.pier) * info.scale - (info.host ? 24 : 48) + offset;
    const threshold = left + info.door * info.scale;
    return {info, left, floor: run.floorAt(threshold), threshold,
      hostX: info.host ? run.width - 48 + offset : null};
  }
  function begin(run) {
    if (!ready(run)) return;
    const gate = geometry(run), gravity = 1900;
    const vy = run.grounded ? 0 : run.vy;
    const height = Math.max(0, gate.floor - run.y);
    const land = run.grounded ? 0 : Math.max(0, (Math.sqrt(vy * vy + 2 * gravity * height) - vy) / gravity);
    const endX = gate.left + (gate.info.pier + 180) * gate.info.scale;
    const landingX = land ? Math.min(gate.threshold - 26, run.x + gate.info.speed * land * .8) : run.x;
    const walkDuration = Math.max(1.45, (endX - landingX) / (gate.info.speed * .9));
    sequences.set(run, {gate, startX: run.x, startY: run.y, vy, gravity, land, landingX,
      endX, walkDuration, duration: land + walkDuration + .18});
  }
  function duration(run) { return reduce.matches ? .7 : sequences.get(run)?.duration ?? .95; }
  function actor(run, age) {
    const seq = sequences.get(run);
    if (!seq || !run.won) return null;
    if (reduce.matches) return {x: seq.startX, y: seq.gate.floor, action: "idle", frame: 0};
    const airborne = age < seq.land;
    // Complete a jump on the approach apron before passing under the lintel.
    // Even a late super-jump must not carry a head through the architecture.
    const landingX = seq.landingX;
    const t = Math.max(0, Math.min(1, (age - seq.land) / seq.walkDuration));
    // Constant, readable running pace, easing only as the runner passes fully
    // behind the near pier. No camera zoom, screen drift or victory bouncing.
    const travel = t < .8 ? t / .9 : (.8 + .1 * (1 - ((1 - t) / .2) ** 2)) / .9;
    const x = airborne ? seq.startX + (landingX - seq.startX) * age / seq.land : landingX + (seq.endX - landingX) * travel;
    const entry = Math.max(0, Math.min(1, (x - seq.gate.threshold) / ((seq.gate.info.pier - seq.gate.info.door) * seq.gate.info.scale)));
    // 505's angled sill leads up into its recessed floor plane. Feet and
    // contact shadow follow that small perspective rise together.
    const shadowY = seq.gate.floor - (seq.gate.info.interiorRise || 0) * entry * entry * (3 - 2 * entry);
    const y = airborne ? Math.min(seq.gate.floor, seq.startY + seq.vy * age + seq.gravity * age * age / 2) : shadowY;
    return {x, y, shadowY, action: airborne ? seq.vy + seq.gravity * age < 0 ? "jump" : "fall" : "run", frame: Math.floor((run.distance + x - seq.startX) / 28) % 6};
  }
  function gateFor(run) { return sequences.get(run)?.gate || geometry(run); }
  function back(ctx, run, width) {
    if (!ready(run)) return false;
    const gate = gateFor(run), {info, left, floor} = gate, s = info.scale;
    if (left > width + 30 || left + 1536 * s < -30) return true;
    ctx.save(); ctx.translate(left, floor - info.foot * s); ctx.scale(s, s);
    ctx.drawImage(info.image, 0, 0);
    if (info.plaque) {
      ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillStyle = "#f3d69c"; ctx.font = "bold 34px Georgia, serif";
      ctx.fillText(info.title, info.plaque[0], info.plaque[1] - 5);
      ctx.fillStyle = "#bfac81"; ctx.font = "500 16px system-ui, sans-serif";
      ctx.fillText(info.sub, info.plaque[0], info.plaque[1] + 28);
    }
    ctx.restore(); return true;
  }
  function front(ctx, run, width, age = 0) {
    if (!ready(run)) return;
    const gate = gateFor(run), {info, left, floor} = gate, s = info.scale;
    if (left > width + 30 || left + 1536 * s < -30) return;
    ctx.save();
    ctx.beginPath(); ctx.rect(left + info.pier * s, floor - 450 * s, (1536 - info.pier) * s, 450 * s + 2); ctx.clip();
    ctx.drawImage(info.image, left, floor - info.foot * s, 1536 * s, 1024 * s);
    ctx.restore();
    if (info.host) window.LR_OFFICE_HOST?.drawEntrance(ctx,
      {x: gate.hostX, y: floor, height: 128, visible: gate.hostX > -50 && gate.hostX < width + 50,
        fullyVisible: gate.hostX > 45 && gate.hostX < width - 40},
      run.chapterTime + (run.won ? Math.max(0, age) : 0), reduce.matches, run);
  }
  window.LR_FINISH = {ready, begin, duration, actor, back, front,
    inspect(run) { const gate = gateFor(run); return gate ? {id: run.districtId || "opening", left: gate.left, floor: gate.floor, interiorFloor: gate.floor - (gate.info.interiorRise || 0), threshold: gate.threshold, pier: gate.left + gate.info.pier * gate.info.scale, hostX: gate.hostX, ready: ready(run), duration: duration(run), active: sequences.has(run)} : null; }};
})();
