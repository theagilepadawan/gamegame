/* Street traffic belongs to a real road strip, behind the playable terrain.
   The caller supplies both curb lines in screen coordinates and draws terrain
   afterwards. This module never changes the run, its random stream or physics. */
(function () {
  "use strict";
  var WIDTH = 168, HEIGHT = 54, TOP = 49, BOTTOM = 5, ART_SCALE = 4;
  var cars = new Map(), CACHE_LIMIT = 16;
  var lanes = [
    { id: "far", parallax: .50, spacing: 510, chance: .73, speed: 27, direction: -1, height: 28, depth: .20 },
    { id: "near", parallax: .58, spacing: 650, chance: .84, speed: 35, direction: 1, height: 38, depth: .88 }
  ];
  var colors = {
    taxi: ["#ffe594", "#eebd39", "#b57518", "#fff0bc"],
    navy: ["#71939d", "#34556a", "#172e43", "#bdc3b7"],
    silver: ["#ddd8c4", "#8d9e9e", "#4b6370", "#fff1d1"],
    claret: ["#bc7e75", "#74434b", "#402d3b", "#edc5a0"],
    green: ["#98a78d", "#496659", "#253f3d", "#ded3aa"]
  };
  function clamp(n, a, b) { return Math.max(a, Math.min(b, n)); }
  function positive(value) { var n = Number(value); return Number.isFinite(n) ? Math.max(0, n) : 0; }
  function hash(n) {
    n = Math.imul((n >>> 0) ^ ((n >>> 0) >>> 16), 0x7feb352d);
    n = Math.imul(n ^ n >>> 15, 0x846ca68b); return (n ^ n >>> 16) >>> 0;
  }
  function seedOf(seed) {
    if (typeof seed === "number" && Number.isFinite(seed)) return seed >>> 0;
    var n = 2166136261, text = String(seed == null ? "city-street" : seed);
    for (var i = 0; i < text.length; i++) n = Math.imul(n ^ text.charCodeAt(i), 16777619);
    return n >>> 0;
  }
  function value(seed, index, channel) { return hash(seed ^ Math.imul(index, 0x9e3779b1) ^ Math.imul(channel, 0x85ebca6b)) / 4294967296; }
  function curb(line, x) { return typeof line === "function" ? line(x) : line; }
  function road(view, x) {
    var rear = Number(curb(view.rearCurb, x)), front = Number(curb(view.frontCurb, x));
    return Number.isFinite(rear) && Number.isFinite(front) && front - rear >= 12 ? { rear: rear, front: front, depth: front - rear } : null;
  }
  function contact(view, x, scale, depth) {
    var line = road(view, x); if (!line) return NaN;
    // Curb geometry constrains the tire contact and shadow, not the roof.
    // A real vehicle rises above the rear curb in a side-on street view.
    return line.rear + 2 + Math.max(0, line.depth - 4 - BOTTOM * scale) * depth;
  }
  function bounds(car, contactOnly) {
    var cos = Math.cos(car.angle), sin = Math.sin(car.angle), points = [];
    var halfWidth = contactOnly ? 77 : WIDTH / 2;
    for (var x of [-halfWidth * car.stretch, halfWidth * car.stretch]) for (var y of [contactOnly ? 0 : -TOP, BOTTOM]) {
      points.push({ x: car.x + (x * cos - y * sin) * car.scale,
        y: car.y + (x * sin + y * cos) * car.scale });
    }
    return { left: Math.min.apply(null, points.map(function (p) { return p.x; })),
      right: Math.max.apply(null, points.map(function (p) { return p.x; })),
      top: Math.min.apply(null, points.map(function (p) { return p.y; })),
      bottom: Math.max.apply(null, points.map(function (p) { return p.y; })), points: points };
  }
  function layout(view) {
    view = view || {};
    var W = positive(view.W), district = view.district || "opening";
    var output = { enabled: false, cars: [], parallax: [.50, .58], district: district, width: W };
    if (view.enabled === false || !W || (district !== "opening" && district !== "midtown")) return output;
    if (!road(view, W * .5)) return output;
    output.enabled = true;
    var distance = positive(view.distance), time = positive(view.time);
    var seed = seedOf(view.seed) ^ (district === "opening" ? 0x2539cb7d : 0x78e6d192);
    lanes.forEach(function (lane, laneIndex) {
      var laneSeed = hash(seed ^ Math.imul(laneIndex + 1, 0x3521a9b7));
      // Uniform lane speed preserves generous headway forever. The visual seed
      // varies occupancy, spacing, paint and body type, without cars overtaking.
      var travel = view.reduced ? 0 : time * lane.speed * lane.direction;
      var camera = distance * lane.parallax - travel;
      var first = Math.floor((camera - 180) / lane.spacing) - 1;
      var last = Math.ceil((camera + W + 180) / lane.spacing) + 1;
      for (var index = first; index <= last; index++) {
        if (value(laneSeed, index, 1) > lane.chance) continue;
        var x = index * lane.spacing + lane.spacing * (.16 + value(laneSeed, index, 2) * .42) - camera;
        var strip = road(view, x); if (!strip) continue;
        var sideA = road(view, x - 48), sideB = road(view, x + 48);
        if (!sideA || !sideB) continue;
        // Tighter city framing leaves room for one real passing lane. Keep
        // its vehicle proportions and suppress the rear lane, rather than
        // miniaturizing both rows of cars into the available road depth.
        if (!laneIndex && Math.min(strip.depth, sideA.depth, sideB.depth) < 24) continue;
        var height = lane.height;
        var scale = height / HEIGHT, y = contact(view, x, scale, lane.depth);
        var slope = (contact(view, x + 18, scale, lane.depth) - contact(view, x - 18, scale, lane.depth)) / 36;
        if (!Number.isFinite(slope) || Math.abs(slope) > .16) continue;
        var taxi = value(laneSeed, index, 3) < .47;
        var palette = taxi ? "taxi" : ["navy", "silver", "claret", "green"][Math.floor(value(laneSeed, index, 4) * 4)];
        var stretch = .96 + value(laneSeed, index, 5) * .09;
        var car = { id: district + ":" + lane.id + ":" + index, lane: lane.id, index: index,
          x: x, y: y, width: WIDTH * scale * stretch, height: height, scale: scale, stretch: stretch,
          angle: Math.atan(slope), direction: lane.direction, parallax: lane.parallax,
          speed: view.reduced ? 0 : lane.speed * lane.direction, body: taxi ? "taxi" : "sedan", palette: palette,
          variant: Math.floor(value(laneSeed, index, 6) * 2),
          wheelAngle: view.reduced ? 0 : time * lane.speed * lane.direction / (8.5 * scale) % (Math.PI * 2) };
        car.bounds = bounds(car);
        car.contactBounds = bounds(car, true);
        if (car.bounds.right < -4 || car.bounds.left > W + 4) continue;
        // The wheels and contact shadow must remain on the road. The roof may
        // overlap the rear pavement naturally, while foreground terrain is
        // drawn after this layer and occludes cars behind hills and platforms.
        if (!car.contactBounds.points.every(function (point) {
          var segment = road(view, point.x);
          return segment && point.y >= segment.rear + .5 && point.y <= segment.front - .5;
        })) continue;
        output.cars.push(car);
      }
    });
    return output;
  }
  function path(c, points, fill, stroke, width) {
    c.beginPath(); points(c); c.closePath();
    if (fill) { c.fillStyle = fill; c.fill(); }
    if (stroke) { c.strokeStyle = stroke; c.lineWidth = width || 1; c.stroke(); }
  }
  function line(c, x, y, x2, y2, color, width) {
    c.beginPath(); c.moveTo(x, y); c.lineTo(x2, y2); c.strokeStyle = color; c.lineWidth = width || 1; c.stroke();
  }
  function ellipse(c, x, y, rx, ry, color) {
    c.beginPath(); c.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2); c.fillStyle = color; c.fill();
  }
  function gradient(c, y, y2, stops) {
    var g = c.createLinearGradient(0, y, 0, y2);
    stops.forEach(function (color, i) { g.addColorStop(i / (stops.length - 1), color); }); return g;
  }
  function carBody(c, body, palette, variant) {
    var colorsOfCar = colors[palette], taxi = body === "taxi";
    c.lineJoin = "round"; c.lineCap = "round";
    ellipse(c, 1, 1.5, 77, 3, "rgba(11,20,30,.16)");
    ellipse(c, 0, 1, 66, 1.8, "rgba(8,16,25,.28)");
    path(c, function (p) {
      p.moveTo(-72, -8); p.lineTo(-70, -20); p.quadraticCurveTo(-66, -25, -51, -26);
      p.lineTo(-31, taxi ? -39 : -38); p.quadraticCurveTo(-27, -41, -19, -41);
      p.lineTo(14, -41); p.quadraticCurveTo(19, -40, 24, -36);
      p.lineTo(41, -24); p.lineTo(65, -21); p.quadraticCurveTo(74, -20, 76, -14);
      p.lineTo(75, -8); p.quadraticCurveTo(72, -5, 65, -5); p.lineTo(-64, -5);
      p.quadraticCurveTo(-71, -5, -72, -8);
    }, gradient(c, -42, -5, [colorsOfCar[0], colorsOfCar[1], colorsOfCar[1], colorsOfCar[2]]), "#27343a", 1.15);
    // Broad reflected evening light, a shaded rocker and a restrained chrome
    // belt keep this tiny street vehicle legible without flashing highlights.
    path(c, function (p) { p.moveTo(-68, -22); p.lineTo(-51, -25); p.lineTo(40, -23); p.lineTo(69, -19); p.lineTo(68, -16); p.lineTo(-67, -17); }, colorsOfCar[3] + "70");
    line(c, -64, -11, 68, -11, colorsOfCar[2], 3.5);
    line(c, -63, -10, 66, -10, "#d4c7a780", .75);
    var glass = gradient(c, -40, -23, ["#273e57", "#6e8c96", "#d3b68b"]);
    path(c, function (p) { p.moveTo(-46, -25); p.lineTo(-29, -37); p.lineTo(-10, -38); p.lineTo(-10, -25); }, glass, "#263642", 1);
    path(c, function (p) { p.moveTo(-5, -38); p.lineTo(12, -38); p.quadraticCurveTo(17, -38, 21, -34); p.lineTo(34, -25); p.lineTo(-5, -25); }, glass, "#263642", 1);
    line(c, -35, -32, -17, -37, "#eee4c28c", 1.6);
    line(c, 1, -36, 15, -36, "#eee4c2a0", 1.1);
    // Quiet driver shape stays behind the windshield reflection.
    ellipse(c, 11, -31.5, 2.8, 3, "#32414a");
    path(c, function (p) { p.moveTo(6, -26); p.quadraticCurveTo(10, -32, 14, -27); p.lineTo(17, -25); p.lineTo(6, -25); }, "#33434b");
    line(c, -7, -38, -7, -13, "#273b416b", 1);
    line(c, -42, -24, -44, -13, colorsOfCar[2] + "ad", .8);
    line(c, 36, -24, 39, -13, colorsOfCar[2] + "ad", .8);
    line(c, -20, -21, -13, -21, "#e0d3b8", 1.2);
    line(c, 20, -21, 26, -21, "#e0d3b8", 1.2);
    path(c, function (p) { p.moveTo(31, -26); p.lineTo(37, -28); p.lineTo(40, -26); p.lineTo(36, -24); }, colorsOfCar[2], "#273941", .7);
    // Wheel arches are painted before the moving hubs.
    for (var x of [-46, 47]) {
      ellipse(c, x, -7, 10.4, 10.4, "#17242a");
      c.beginPath(); c.arc(x, -7, 10.7, Math.PI, 0); c.strokeStyle = colorsOfCar[0]; c.lineWidth = 1.35; c.stroke();
    }
    path(c, function (p) { p.moveTo(67, -19); p.lineTo(73, -17); p.lineTo(75, -13); p.lineTo(67, -14); }, "#f9e4ad", "#665d48", .65);
    line(c, 70, -15.5, 74, -15, "#fff2d0", 1.1);
    path(c, function (p) { p.moveTo(-71, -20); p.lineTo(-65, -21); p.lineTo(-65, -15); p.lineTo(-72, -14); }, "#ab5341", "#603b3a", .7);
    line(c, -70, -18, -66, -18, "#ed9b69", 1);
    line(c, 68, -8, 75, -8, "#a7ac9b", 1.5);
    line(c, -71, -8, -65, -8, "#a7ac9b", 1.5);
    if (taxi) {
      path(c, function (p) { p.moveTo(-14, -41); p.lineTo(-12, -46); p.lineTo(5, -46); p.lineTo(8, -41); }, "#f7d15b", "#5f573f", .9);
      c.fillStyle = "#293d43"; c.font = "700 4px Arial,sans-serif"; c.textAlign = "center"; c.textBaseline = "middle"; c.fillText("TAXI", -3, -43.5);
      ellipse(c, 7, -17.5, 5.3, 5.3, "#343d3a");
      c.fillStyle = "#f4c94f"; c.font = "800 7px Arial,sans-serif"; c.fillText("T", 7, -17.2);
      c.fillStyle = "#35413d"; c.font = "700 3.5px Arial,sans-serif"; c.fillText("NYC", -8, -17);
      if (variant) line(c, -31, -16, -20, -16, "#45504699", .8);
    } else if (variant) {
      line(c, -28, -40.4, 12, -40.4, colorsOfCar[3] + "b0", .8);
    }
  }
  function bodyCanvas(car) {
    var key = car.body + ":" + car.palette + ":" + car.variant;
    if (cars.has(key)) { var cached = cars.get(key); cars.delete(key); cars.set(key, cached); return cached; }
    var canvas = document.createElement("canvas"); canvas.width = WIDTH * ART_SCALE; canvas.height = HEIGHT * ART_SCALE;
    var c = canvas.getContext("2d"); c.scale(ART_SCALE, ART_SCALE); c.translate(WIDTH / 2, TOP);
    carBody(c, car.body, car.palette, car.variant); cars.set(key, canvas);
    while (cars.size > CACHE_LIMIT) cars.delete(cars.keys().next().value);
    return canvas;
  }
  function wheel(c, x, angle) {
    ellipse(c, x, -8.5, 8.5, 8.5, "#111c24");
    ellipse(c, x, -8.5, 6.4, 6.4, "#3a464b");
    ellipse(c, x, -8.5, 5, 5, "#919c97");
    c.save(); c.translate(x, -8.5); c.rotate(angle);
    for (var i = 0; i < 5; i++) {
      var a = i * Math.PI * 2 / 5;
      line(c, Math.cos(a) * 1.2, Math.sin(a) * 1.2, Math.cos(a) * 4.4, Math.sin(a) * 4.4, "#46575d", 1.3);
    }
    c.restore(); ellipse(c, x, -8.5, 1.5, 1.5, "#cfceba");
    c.beginPath(); c.arc(x, -8.5, 7.2, Math.PI * 1.12, Math.PI * 1.8); c.strokeStyle = "#7183857d"; c.lineWidth = .75; c.stroke();
  }
  function draw2d(c, view) {
    var frame = layout(view); if (!c || !frame.cars.length) return frame;
    c.save();
    // Clip only at the front curb. Roofs rise above the back curb naturally;
    // the verified wheel/shadow footprint remains on the actual road strip.
    c.beginPath();
    c.moveTo(-96, -256); c.lineTo(frame.width + 96, -256);
    for (var x2 = frame.width + 96; x2 >= -96; x2 -= 16) c.lineTo(x2, Number(curb(view.frontCurb, x2)) - .5);
    c.closePath(); c.clip();
    frame.cars.forEach(function (car) {
      c.save(); c.translate(car.x, car.y); c.rotate(car.angle); c.scale(car.direction * car.scale * car.stretch, car.scale);
      c.drawImage(bodyCanvas(car), -WIDTH / 2, -TOP, WIDTH, HEIGHT);
      wheel(c, -46, car.wheelAngle); wheel(c, 47, car.wheelAngle); c.restore();
    });
    c.restore(); return frame;
  }
  function renderCanvas(canvas, view, resolution) {
    resolution = clamp(Number(resolution) || 1, .5, 3);
    var width = Math.max(1, Math.ceil(view.W * resolution)), height = Math.max(1, Math.ceil(view.H * resolution));
    if (canvas.width !== width || canvas.height !== height) { canvas.width = width; canvas.height = height; }
    var ctx = canvas.getContext("2d"); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, width, height);
    ctx.setTransform(resolution, 0, 0, resolution, 0, 0); draw2d(ctx, view); return canvas;
  }
  window.LR_STREET_LIFE = { ready: true, images: [], layout: layout, draw2d: draw2d, renderCanvas: renderCanvas,
    get cachedBodies() { return cars.size; }, cacheLimit: CACHE_LIMIT, release: function () { cars.clear(); } };
})();
