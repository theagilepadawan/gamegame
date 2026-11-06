/* Warm, readable props based on the earlier game’s original silhouettes.
   Native painted sprites and small street signs; collision and reward logic stay in the engine. */
(function () {
  "use strict";
  const paths = {
    dividend: "assets/props-v18/dividend.webp",
    opportunity: "assets/props-v18/opportunity.webp",
    research: "assets/props-v18/research.webp",
    conviction: "assets/props-v18/conviction.webp",
    cabinet: "assets/props-v18/road-barrier.webp",
    overhead: "assets/props-v18/market-board.webp"
  };
  const art = Object.fromEntries(Object.entries(paths).map(([key, path]) => {
    const image = new Image(); image.src = path; return [key, image];
  }));
  const loaded = image => image && image.complete && image.naturalWidth > 0;
  function box(c, x, y, w, h, color, radius = 0) {
    c.fillStyle = color; c.beginPath(); c.roundRect(x, y, w, h, radius); c.fill();
  }
  function line(c, x, y, x2, y2, color, width = 1) {
    c.beginPath(); c.moveTo(x, y); c.lineTo(x2, y2); c.strokeStyle = color; c.lineWidth = width; c.stroke();
  }
  function gradient(c, x, y, w, h, colors) {
    const fill = c.createLinearGradient(x, y, x + w, y + h);
    colors.forEach((color, i) => fill.addColorStop(i / (colors.length - 1), color)); return fill;
  }
  function text(c, label, x, y, size, width, color, weight = 700) {
    c.font = `${weight} ${size}px Arial,sans-serif`;
    const measured = c.measureText(label).width;
    if (measured > width) c.font = `${weight} ${Math.max(7.5, size * width / measured)}px Arial,sans-serif`;
    c.textAlign = "center"; c.textBaseline = "middle"; c.fillStyle = color; c.fillText(label, x, y, width);
  }
  function bolt(c, x, y, r = 1.5) {
    c.beginPath(); c.arc(x, y, r + .7, 0, Math.PI * 2); c.fillStyle = "#071c26"; c.fill();
    c.beginPath(); c.arc(x, y - .3, r, 0, Math.PI * 2); c.fillStyle = "#d3ba85"; c.fill();
    line(c, x - r * .6, y, x + r * .6, y, "#625b4b", .6);
  }
  function arrow(c, x, y, direction, color, size = 8) {
    c.save(); c.translate(x, y); c.rotate(direction * Math.PI / 4);
    c.beginPath(); c.moveTo(-size, 0); c.lineTo(size, 0); c.moveTo(size * .25, -size * .75);
    c.lineTo(size, 0); c.lineTo(size * .25, size * .75); c.strokeStyle = color;
    c.lineWidth = 2; c.lineCap = "round"; c.lineJoin = "round"; c.stroke(); c.restore();
  }
  function pickup(c, item, offset, time, reduced) {
    const image = art[item.kind];
    if (!loaded(image) || !["dividend", "opportunity", "research", "conviction"].includes(item.kind)) return false;
    const sizes = {dividend: [23, 23], opportunity: [32, 36], research: [49, 50], conviction: [54, 52]};
    const [w, h] = sizes[item.kind], x = item.x + offset;
    const y = item.y + (reduced ? 0 : Math.sin(time * 2.5 + item.x * .003) * 1.5);
    c.save(); c.translate(x, y);
    // Keep the coin visible throughout its turn; there is no change to collection radius.
    if (item.kind === "dividend") c.scale(reduced ? 1 : .55 + .45 * Math.abs(Math.cos(time * 1.7 + item.x * .01)), 1);
    if (item.kind === "research") c.rotate(reduced ? 0 : Math.sin(time * .8) * .025);
    c.drawImage(image, -w / 2, -h / 2, w, h);
    if (!reduced && item.kind !== "dividend") {
      const glint = Math.max(0, Math.sin(time * 1.3 + item.x * .01)) ** 12;
      c.globalAlpha *= glint;
      line(c, -w * .25 - 3, -h * .31, -w * .25 + 3, -h * .31, "#fff7d2", 1);
      line(c, -w * .25, -h * .31 - 3, -w * .25, -h * .31 + 3, "#fff7d2", 1);
    }
    c.restore(); return true;
  }
  function hazard(c, item, x, base, district, run) {
    if (item.type === "gap" || district === "park") return false;
    const high = item.type === "high", image = high ? art.overhead : art.cabinet;
    if (!loaded(image)) return false;
    const w = item.w, h = high ? 85 : item.h, top = high ? base - 181 : base - h;
    c.save();
    if (high) {
      if (item.guidance) {
        const anchor = item.guidance.base - 181;
        // The hoist frame stays planted on the pavement while the board moves.
        // Its slim support posts sit behind the playable clearance.
        for (const rail of [x + 4, x + w - 4]) {
          const ground = run?.floorAt(rail) ?? item.guidance.base;
          line(c, rail, anchor - 46, rail, ground, "#102a3b", 5);
          line(c, rail - .6, anchor - 44, rail - .6, ground - 2, "#b8d8d4", 1);
          box(c, rail - 6, ground - 3, 12, 3, "#33474b", 1);
          box(c, rail - 4, anchor - 49, 8, 5, "#dfb866", 1.5);
        }
        box(c, x, anchor - 49, w, 5, "#203b4b", 2);
        line(c, x + 4, anchor - 49, x + w - 4, anchor - 49, "#dfb866", 1);
      }
      for (const hook of [x + w * .163, x + w * .842]) {
        const anchor = item.guidance ? item.guidance.base - 230 : top - 42;
        line(c, hook, anchor, hook, top - h * .07, "#263a3c", 2.6);
        line(c, hook - .5, anchor, hook - .5, top - h * .07, "#b7b39a", .7);
      }
    }
    // Original compact construction silhouette; no decorative gold frame.
    // The image occupies exactly the original solid obstacle rectangle.
    if (high) {
      // The suspension eyes are decoration above the solid collision box.
      // Keep the actual board face aligned to that box, as in the old renderer.
      const eyeHeight = 40, faceHeight = image.naturalHeight - eyeHeight;
      const eyeDisplay = h * eyeHeight / faceHeight;
      c.drawImage(image, 0, 0, image.naturalWidth, eyeHeight, x, top - eyeDisplay, w, eyeDisplay);
      c.drawImage(image, 0, eyeHeight, image.naturalWidth, faceHeight, x, top, w, h);
    } else c.drawImage(image, x, top, w, h);
    const label = item.label || (high ? "MARKET RISK" : "DELIVERY");
    if (high) {
      // Typography remains live and sharp instead of being baked into an atlas.
      const pw = w * .82, ph = 18, px = x + w / 2, py = top + h * .20;
      box(c, px - pw / 2, py - ph / 2, pw, ph, "#302c32", 1.5);
      text(c, label, px, py + .2, 9.3, pw - 7, "#fff0d1");
      if (item.guidance) {
        box(c, x + w / 2 - 13, top + h * .46, 26, 21, "#102e3f", 5);
        arrow(c, x + w / 2 - 5, top + h * .46 + 10.5, -2, "#c8e6d0", 4.5);
        arrow(c, x + w / 2 + 5, top + h * .46 + 10.5, 2, "#c8e6d0", 4.5);
      }
      for (const dx of [-10, 0, 10]) {
        line(c, x + w / 2 + dx - 2.5, top + h - 11, x + w / 2 + dx, top + h - 8.5, "#f3d5a2", 1);
        line(c, x + w / 2 + dx, top + h - 8.5, x + w / 2 + dx + 2.5, top + h - 11, "#f3d5a2", 1);
      }
    } else if (w >= 50) {
      const pw = w * .75, py = top + h * .42;
      box(c, x + (w - pw) / 2, py - 6, pw, 12, "#263739ee", 1);
      text(c, label, x + w / 2, py, 7.2, pw - 4, "#f7e4b7", 600);
    }
    c.restore(); return true;
  }
  function sign(c, item, run, floor, angle) {
    const park = run.districtId === "park", fork = item.role === "fork" || item.route === "fork";
    const rows = fork ? [
      {label: park ? "CANOPY WALK" : "HIGH CONVICTION", sub: "UPPER ROUTE", y: -168, direction: -1, color: "#e9ce91"},
      {label: park ? "LAKESIDE PATH" : "STREET LEVEL", sub: "LOWER ROUTE", y: -124, direction: 0, color: "#b7d5b4"}
    ] : [{label: item.label || (park ? "THE LONG VIEW" : "WORK IN PROGRESS"),
      sub: item.role === "rejoin" ? "ONWARD, TOGETHER" : park ? "LET IT COMPOUND" : "GROWTH TAKES WORK", y: -148, direction: 0, color: "#e9ce91"}];
    c.save(); c.translate(item.x, floor); c.rotate(angle);
    box(c, -5, -5, 10, 5, "#35483d", 1.5);
    box(c, -3, -179, 6, 176, gradient(c, -3, -179, 6, 0, ["#4a604f", "#939c7e", "#3d584d"]), 1.5);
    box(c, -4, -181, 8, 4, "#9b9e7d", 1.3);
    for (const row of rows) {
      const w = fork ? 153 : 145, left = -w / 2, y = row.y, h = 35;
      box(c, left + 1.5, y + 2, w, h, "#10262966", 3);
      box(c, left, y, w, h, gradient(c, left, y, w * .2, h, park ? ["#6c7950", "#4b5d43"] : ["#b1936b", "#6b6653"]), 3);
      box(c, left + 1.2, y + 1.2, w - 2.4, h - 2.4,
        gradient(c, left, y, w * .2, h, park ? ["#395846", "#24483b"] : ["#315563", "#213e49"]), 2);
      line(c, left + 4, y + 2, -left - 4, y + 2, "#efdaa777", .8);
      bolt(c, left + 5, y + h / 2, 1); bolt(c, -left - 5, y + h / 2, 1);
      arrow(c, left + 18, y + h / 2, row.direction, row.color, 5.5);
      text(c, row.label, 10, y + 12.5, 8.6, w - 43, "#f8e8c4");
      text(c, row.sub, 10, y + 24.5, 6.2, w - 43, row.color, 600);
    }
    c.restore(); return true;
  }
  function spring(c, item, offset) {
    const x = item.x + offset, y = item.y, w = item.w;
    c.save();
    box(c, x, y - 13, w, 13, "#244a40", 2.5);
    box(c, x + 1, y - 12, w - 2, 10,
      gradient(c, x, y - 12, 0, 10, ["#73a58b", "#477d68", "#315849"]), 2);
    line(c, x + 1, y - 13, x + w - 1, y - 13, "#c7e8aa", 1.8);
    line(c, x + 2, y - 2, x + w - 2, y - 2, "#183a35", 1.4);
    bolt(c, x + 4.5, y - 6.5, .8); bolt(c, x + w - 4.5, y - 6.5, .8);
    for (let i = 1; i <= 3; i++) {
      const center = x + w * i / 4;
      line(c, center - 3, y - 5, center, y - 8, "#d7ebbd", 1.2);
      line(c, center, y - 8, center + 3, y - 5, "#d7ebbd", 1.2);
    }
    if (!item.used) arrow(c, x + w / 2, y - 26, -2, "#d6e8af", 6.5);
    c.restore(); return true;
  }
  window.LR_PROPS = {images: Object.values(art), get ready() {return Object.values(art).every(loaded);},
    pickup, hazard, sign, spring, version: 18};
})();
