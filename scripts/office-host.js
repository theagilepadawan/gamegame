/* A quiet welcome at 505. The host belongs to the office's painted pavement;
   both renderers share its fixed architectural anchor during jumps. */
(function () {
  "use strict";
  var image = new Image();
  image.src = "assets/office-host-v14/host.webp";
  var NATIVE_W = 1024, NATIVE_H = 1536, BODY_H = 1500;
  var FOOT_X = 450, FOOT_Y = 1517;
  var states = new WeakMap(), entranceStates = new WeakMap(), fallback = { start: null };
  var last = { visible: false, angle: 0 };

  function ready() { return image.complete && image.naturalWidth > 0; }
  function placement(distance, width, height, view) {
    if (!window.LR_SHOPS) return null;
    var office = LR_SHOPS.inspect(distance, width, height, view).items.find(function (item) { return item.key === "fifth"; });
    if (!office || !office.host) return null;
    var host = office.host;
    return { x: host.x, y: host.y, height: host.height,
      visible: host.x > -host.height * .4 && host.x < width + host.height * .4,
      fullyVisible: host.x > host.height * .4 && host.x < width - host.height * .4 };
  }
  function pose(run, time, host, reduced, pool) {
    pool = pool || states;
    var state = fallback;
    if (run && typeof run === "object") {
      state = pool.get(run);
      if (!state) { state = { start: null }; pool.set(run, state); }
    }
    // One small, eased wrist greeting. Head, torso and both feet never shift.
    // The run clock stops with pause; reduced motion holds the original pose.
    if (host.fullyVisible && state.start === null) state.start = time;
    var elapsed = state.start === null ? -1 : time - state.start;
    if (reduced || elapsed < 0 || elapsed >= 2.4) return 0;
    var phase = elapsed / 2.4;
    return Math.pow(Math.sin(Math.PI * phase), 2) * Math.sin(Math.PI * 2 * phase) * .09;
  }
  function handPath(ctx) {
    ctx.moveTo(706, 204); ctx.lineTo(837, 204); ctx.lineTo(844, 290);
    ctx.lineTo(780, 406); ctx.lineTo(740, 411); ctx.lineTo(706, 374); ctx.closePath();
  }
  function portrait(ctx, angle) {
    // Move only the palm about its wrist. The cuff overlaps the seam; using
    // the same native pixels avoids a mismatched sleeve or face between poses.
    ctx.save();
    ctx.translate(746, 390); ctx.rotate(angle); ctx.translate(-746, -390);
    ctx.beginPath(); handPath(ctx); ctx.clip(); ctx.drawImage(image, 0, 0);
    ctx.restore();
    ctx.save(); ctx.beginPath(); ctx.rect(0, 0, NATIVE_W, NATIVE_H);
    handPath(ctx); ctx.clip("evenodd"); ctx.drawImage(image, 0, 0); ctx.restore();
  }
  function paint(ctx, host, angle) {
    var scale = host.height / BODY_H;
    ctx.save(); ctx.translate(host.x, host.y);
    // A small contact shadow grounds the shoes on the architectural pavement.
    var shadow = ctx.createRadialGradient(0, -.2, 0, 0, -.2, host.height * .17);
    shadow.addColorStop(0, "rgba(10,18,30,.28)"); shadow.addColorStop(1, "rgba(10,18,30,0)");
    ctx.save(); ctx.scale(1, .13); ctx.fillStyle = shadow; ctx.beginPath();
    ctx.arc(0, -.2, host.height * .17, 0, Math.PI * 2); ctx.fill(); ctx.restore();
    ctx.scale(scale, scale); ctx.translate(-FOOT_X, -FOOT_Y); portrait(ctx, angle); ctx.restore();
  }
  function frame(id, distance, width, height, time, reduced, run, cameraY, view) {
    if (id !== "midtown" || (window.longRun && longRun.state === "home") || !ready()) {
      last = { visible: false, angle: 0 }; return null;
    }
    var host = placement(distance, width, height, view);
    if (!host || !host.visible) { last = { visible: false, angle: 0 }; return null; }
    // Wait until the foreground crest clears the pavement before greeting.
    // The feet keep their architectural anchor even while the hill occludes it.
    if (run && typeof run.floorAt === "function") {
      host.fullyVisible = host.fullyVisible && run.floorAt(host.x) + (cameraY || 0) >= host.y - 3;
    }
    var angle = pose(run, time || 0, host, reduced);
    last = { visible: true, x: host.x, y: host.y, height: host.height, angle: angle,
      feetFixed: true, headFixed: true, reduced: !!reduced };
    return { host: host, angle: angle };
  }
  window.LR_OFFICE_HOST = {
    images: [image],
    get ready() { return ready(); },
    drawEntrance: function (ctx, host, time, reduced, run) {
      if (!ready() || !host.visible) return;
      paint(ctx, host, pose(run, time, host, reduced, entranceStates));
    },
    draw2d: function (ctx, id, distance, width, height, time, reduced, run, cameraY, view) {
      var clock = run && typeof run.chapterTime === "number" ? run.chapterTime : time;
      var current = frame(id, distance, width, height, clock, reduced, run, cameraY, view);
      if (current) paint(ctx, current.host, current.angle);
    },
    pixi: function (env, id, width, height, distance, Sprite, Texture, view) {
      var current = frame(id, distance, width, height, env.run?.chapterTime || env.age, env.reduced, env.run, env.worldLayer.y, view);
      var entry = env.officeHost;
      if (!current) { if (entry) entry.sprite.visible = false; return; }
      if (!entry) {
        var canvas = document.createElement("canvas");
        // More than 5x the normal on-screen size; the delivered source remains
        // native 1024x1536. No per-frame full-screen texture is allocated.
        canvas.width = 512; canvas.height = 800;
        var texture = Texture.from(canvas), sprite = new Sprite(texture);
        env.backgroundLayer.addChild(sprite);
        entry = env.officeHost = { canvas: canvas, ctx: canvas.getContext("2d"), texture: texture, sprite: sprite, angle: null };
      }
      if (entry.angle === null || Math.abs(entry.angle - current.angle) > .001 || current.angle === 0 && entry.angle !== 0) {
        entry.ctx.clearRect(0, 0, 512, 800);
        entry.ctx.save(); entry.ctx.scale(.5, .5);
        paint(entry.ctx, { x: FOOT_X, y: FOOT_Y, height: BODY_H }, current.angle);
        entry.ctx.restore(); entry.texture.source.update(); entry.angle = current.angle;
      }
      var scale = current.host.height / BODY_H;
      entry.sprite.visible = true; entry.sprite.scale.set(scale * 2);
      entry.sprite.position.set(current.host.x - FOOT_X * scale, current.host.y - FOOT_Y * scale);
    },
    layout: placement,
    inspect: function () { return Object.assign({ ready: ready(), sourceWidth: NATIVE_W, sourceHeight: NATIVE_H }, last); }
  };
})();
