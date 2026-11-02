/* Native painted gameplay objects with crisp, resolution-independent lettering.
   Draw bounds are the existing gameplay bounds; this module never edits a run. */
(function () {
  "use strict";
  const paths = {
    dividend: "assets/props-v14/dividend.webp",
    opportunity: "assets/props-v14/opportunity.webp",
    research: "assets/props-v14/research.webp",
    conviction: "assets/props-v14/conviction.webp",
    cabinet: "assets/props-v14/risk-cabinet.webp",
    overhead: "assets/props-v14/overhead-panel.webp"
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
  function hazard(c, item, x, base, district) {
    if (item.type === "gap" || district === "park") return false;
    const high = item.type === "high", image = high ? art.overhead : art.cabinet;
    if (!loaded(image)) return false;
    const w = item.w, h = high ? 85 : item.h, top = high ? base - 181 : base - h;
    c.save();
    if (high) {
      for (const hook of [x + 12, x + w - 12]) {
        line(c, hook, top - 42, hook, top + 5, "#0d2833", 3);
        line(c, hook - .5, top - 42, hook - .5, top + 5, "#b8b79b", .8);
      }
    }
    // A dark full-width backing retains the exact solid collision silhouette.
    // Native art adds the material detail; the bright rim marks the actionable edge.
    box(c, x, top, w, h, "#0c202a", 2);
    c.save(); c.beginPath(); c.rect(x, top, w, h); c.clip();
    if (high) c.drawImage(image, 0, 64, image.naturalWidth, image.naturalHeight - 64, x, top, w, h);
    else c.drawImage(image, x, top, w, h);
    c.restore();
    line(c, x + .8, top + .8, x + w - .8, top + .8, "#efd2a2", 1.3);
    line(c, x + w - .8, top + 1.5, x + w - .8, top + h - 1, "#493e32", 1);
    line(c, x + .5, top + h - 1, x + w - .5, top + h - 1, high ? "#e0b173" : "#9a7653", 1.5);
    const label = item.label || (high ? "HEADROOM" : "MARKET RISK");
    const px = x + w * (high ? .50 : .43), py = top + h * (high ? .43 : .33);
    const pw = w * (high ? .80 : .65), ph = high ? 29 : Math.min(25, h * .34);
    box(c, px - pw / 2, py - ph / 2, pw, ph, "#06162230", 1.5);
    const words = label.split(" ");
    if (!high && words.length > 1) {
      const split = Math.ceil(words.length / 2);
      text(c, words.slice(0, split).join(" "), px, py - 5, 9, pw - 4, "#fff1cf");
      text(c, words.slice(split).join(" "), px, py + 5, 9, pw - 4, "#fff1cf");
    } else text(c, label, px, py, high ? 11 : 11.5, pw - 5, "#fff1cf");
    if (high) {
      // Three small downward chevrons turn the suspended panel into a readable duck cue.
      for (const dx of [-12, 0, 12]) {
        line(c, x + w / 2 + dx - 3, top + h - 17, x + w / 2 + dx, top + h - 14, "#eac694", 1.3);
        line(c, x + w / 2 + dx, top + h - 14, x + w / 2 + dx + 3, top + h - 17, "#eac694", 1.3);
      }
    }
    c.restore(); return true;
  }
  function sign(c, item, run, floor, angle) {
    const park = run.districtId === "park", fork = item.role === "fork" || item.route === "fork";
    const rows = fork ? [
      {label: park ? "CANOPY WALK" : "HIGH CONVICTION", sub: "UPPER ROUTE", y: -181, direction: -1, color: "#ead098"},
      {label: park ? "LAKESIDE PATH" : "STREET LEVEL", sub: "LOWER ROUTE", y: -127, direction: 0, color: "#b3d6bd"}
    ] : [{label: item.label || (park ? "THE LONG VIEW" : "WORK IN PROGRESS"),
      sub: item.role === "rejoin" ? "ONWARD, TOGETHER" : park ? "LET IT COMPOUND" : "GROWTH TAKES WORK", y: -160, direction: 0, color: "#ead098"}];
    c.save(); c.translate(item.x, floor); c.rotate(angle);
    box(c, -7, -7, 14, 7, "#152f31", 2);
    box(c, -4, -194, 8, 190, gradient(c, -4, -194, 8, 0, ["#314e4b", "#9ca58a", "#52665e", "#243e3b"]), 2);
    box(c, -6, -198, 12, 6, "#405852", 2); line(c, -3, -198, 3, -198, "#c6bc91", 1);
    for (const row of rows) {
      const w = fork ? 195 : 190, left = -w / 2, y = row.y, h = 46;
      box(c, left + 2, y + 3, w, h, "#091e27bb", 5);
      box(c, left, y, w, h, gradient(c, left, y, w * .4, h, ["#dbbd83", "#857c59", "#4d5d50"]), 4);
      box(c, left + 2, y + 2, w - 4, h - 5,
        gradient(c, left, y, w * .25, h, park ? ["#3d6051", "#23483d", "#16392f"] : ["#315566", "#173b4e", "#102b3d"]), 3);
      line(c, left + 5, y + 4, -left - 5, y + 4, "#f0dfb56b", .8);
      line(c, left + 5, y + h - 4, -left - 5, y + h - 4, "#071c245c", 1);
      bolt(c, left + 7, y + 9, 1.2); bolt(c, -left - 7, y + h - 10, 1.2);
      line(c, left + 36, y + 10, left + 36, y + h - 10, "#d1caa337", .8);
      arrow(c, left + 20, y + h / 2, row.direction, row.color, 7.5);
      text(c, row.label, 14, y + 18, 11, w - 54, "#fff0cb");
      text(c, row.sub, 14, y + 32, 7.6, w - 54, row.color, 600);
    }
    // A small foundry plate anchors the NBIM identity without adding another headline.
    box(c, -18, -65, 36, 15, "#a68f63", 2); box(c, -17, -64, 34, 12, "#1d393e", 1);
    text(c, "NBIM", 0, -58, 8, 29, "#dfcea0");
    c.restore(); return true;
  }
  function spring(c, item, offset) {
    const x = item.x + offset, y = item.y, w = item.w;
    c.save();
    box(c, x, y - 4, w, 4, "#0c2630", 1);
    for (const center of [x + 13, x + w - 13]) {
      line(c, center - 4, y - 3, center + 4, y - 6, "#b2bc9f", 1.5);
      line(c, center + 4, y - 6, center - 4, y - 9, "#a2af91", 1.5);
    }
    box(c, x, y - 13, w, 6, gradient(c, x, y - 13, 0, 6, ["#c4d9b1", "#5e957d", "#284d49"]), 2);
    line(c, x + 1, y - 13, x + w - 1, y - 13, "#d7f8ce", 1.6);
    bolt(c, x + 5, y - 10, 1); bolt(c, x + w - 5, y - 10, 1);
    if (!item.used) {
      c.beginPath(); c.moveTo(x + w / 2, y - 36); c.lineTo(x + w / 2 + 10, y - 26);
      c.lineTo(x + w / 2, y - 16); c.lineTo(x + w / 2 - 10, y - 26); c.closePath();
      c.fillStyle = "#103a37"; c.fill(); c.strokeStyle = "#a2d7ae"; c.lineWidth = 1; c.stroke();
      arrow(c, x + w / 2, y - 26, -2, "#e3f5cb", 5);
    }
    c.restore(); return true;
  }
  window.LR_PROPS = {images: Object.values(art), get ready() {return Object.values(art).every(loaded);},
    pickup, hazard, sign, spring, version: 14};
})();
