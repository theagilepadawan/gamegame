/* Seeded Endless course director. Distances are generated from time budgets,
   while terrain, section layout, rewards and rare events use separate streams. */
(function () {
  "use strict";
  var VERSION = 5, GROUND = 422;
  var FAMILIES = [
    { id: 20, name: "MARKET RHYTHM", kind: "rhythm", unlock: 0 },
    { id: 21, name: "ROOFTOP DIVIDENDS", kind: "roofs", unlock: 0 },
    { id: 22, name: "BREAKOUT SPRINGS", kind: "spring", unlock: 0 },
    { id: 23, name: "LIQUIDITY GAPS", kind: "gaps", unlock: 0 },
    { id: 24, name: "FLOATING AVERAGES", kind: "cranes", unlock: 25 },
    { id: 25, name: "SELL-OFF STEPS", kind: "crumble", unlock: 45 },
    { id: 26, name: "MOMENTUM EXPRESS", kind: "express", unlock: 15 },
    { id: 27, name: "MIXED SIGNALS", kind: "mixed", unlock: 35 },
    { id: 28, name: "UPPER MARKET", kind: "upper", unlock: 20 },
    { id: 29, name: "BREATHING ROOM", kind: "recovery", unlock: 0 },
    { id: 30, name: "DIVIDEND LADDER", kind: "ladder", unlock: 15 },
    { id: 31, name: "VOLATILITY RUN", kind: "volatility", unlock: 65 },
    { id: 34, name: "STEPPING STONES", kind: "islands", unlock: 0 },
    { id: 35, name: "THE WIDE SPREAD", kind: "ravine", unlock: 18 }
  ];
  var clamp = function (x, lo, hi) { return Math.max(lo, Math.min(hi, x)); };
  var mix = function (x) { x >>>= 0; x = Math.imul(x ^ x >>> 16, 2146121005); x = Math.imul(x ^ x >>> 15, 2221713035); return (x ^ x >>> 16) >>> 0; };
  function stream(seed, index, salt) {
    var state = mix((seed >>> 0) ^ Math.imul(index + 1, 2654435761) ^ salt);
    return function () { state = state + 1831565813 >>> 0; var t = state; t = Math.imul(t ^ t >>> 15, t | 1); t ^= t + Math.imul(t ^ t >>> 7, t | 61); return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  }
  var between = function (r, a, b) { return a + (b - a) * r(); };
  var choose = function (r, list) { return list[Math.floor(r() * list.length)]; };
  var integer = function (r, a, b) { return a + Math.floor(r() * (b - a + 1)); };
  var active = function (q) { return !!q && q.mode === "endless" && q.procedural === true; };
  var speed = function (time) { return 340 + 360 * (1 - Math.exp(-Math.max(0, time) / 125)); };
  function distanceAtTime(time) {
    time = Math.max(0, Number(time) || 0);
    return 700 * time - 45000 * (1 - Math.exp(-time / 125));
  }
  function timeAtDistance(distance) {
    distance = Math.max(0, distance);
    var low = 0, high = distance / 340 + 1;
    for (var n = 0; n < 28; n++) { var mid = (low + high) / 2; if (distanceAtTime(mid) < distance) low = mid; else high = mid; }
    return (low + high) / 2;
  }
  function difficulty(time) {
    var pressure = 1 - Math.exp(-Math.max(0, time) / 170);
    return { pressure: pressure, tier: Math.min(6, Math.floor(Math.max(0, time) / 45)),
      actionGap: 1.65 - .28 * pressure, rest: 1.30 - .25 * pressure,
      gapTime: .92 + .16 * pressure, actions: Math.min(5, 3 + Math.floor(Math.max(0, time) / 100)),
      movingAmplitude: 12 + 12 * pressure, movingFrequency: 1.0 + .45 * pressure };
  }
  function state(q) {
    if (q.__endlessDirector) return q.__endlessDirector;
    var r = stream(q.seed, 0, 0x4556454e);
    return q.__endlessDirector = { version: VERSION, section: 0, recent: [], history: [],
      nextFlight: between(r, 28, 42), nextContrarian: between(r, 48, 66), nextRecovery: integer(r, 4, 7),
      nextIPO: between(r, 76, 102), lastEventAt: -100, lastPowerAt: -100, eventCounts: { jetpack: 0, contrarian: 0, recovery: 0, ipo: 0 } };
  }
  function terrain(seed, ground) {
    ground = Number.isFinite(ground) ? ground : GROUND;
    // Irregular, individually seeded hills. Neighbouring knots have zero
    // derivative, so crests and valley floors join without a camera jolt.
    // The short first bank is safe; the very first hill is already full size.
    var r = stream(seed, 0, 0x54455252), period = between(r, 1050, 1500), lead = 650;
    function hash(i, salt) { return mix((seed >>> 0) ^ Math.imul(i, 2246822519) ^ salt) / 4294967296; }
    function knot(i) {
      if (i <= 0) return {x: lead, y: ground};
      return {x: lead + period * (i + (hash(i, 0x504f534e) - .5) * .16),
        y: ground + (hash(i, 0x48454947) * 2 - 1) * period * .105};
    }
    function sample(x, derivative) {
      if (!Number.isFinite(x) || x <= lead) return derivative ? 0 : ground;
      var i = Math.max(0, Math.floor((x - lead) / period)), a = knot(i), b = knot(i + 1);
      if (x < a.x) { b = a; a = knot(--i); }
      else if (x > b.x) { a = b; b = knot(i + 2); }
      var span = b.x - a.x, t = clamp((x - a.x) / span, 0, 1);
      return derivative ? (b.y - a.y) * 6 * t * (1 - t) / span : a.y + (b.y - a.y) * t * t * (3 - 2 * t);
    }
    return Object.freeze({ version: VERSION, districtId: "endless", seed: seed >>> 0, ground: ground,
      signature: "endless-v4-" + mix(seed ^ 0x54455252).toString(16).padStart(8, "0"), maxSlope: .375,
      knots: Object.freeze([Object.freeze({x: 0, y: ground}), Object.freeze(knot(0))]),
      at: function (x) { return sample(x, false); }, slopeAt: function (x) { return sample(x, true); },
      knotsIn: function (start, end) {
        if (!Number.isFinite(start) || !Number.isFinite(end) || end < start) return [];
        var points = [], step = Math.max(160, Math.ceil((end - start) / 512));
        for (var x = start; x <= end; x += step) points.push({x: x, y: sample(x, false)});
        if (!points.length || points[points.length - 1].x !== end) points.push({x: end, y: sample(end, false)});
        return points;
      } });
  }
  function generate(q, forcedRoute) {
    if (!active(q)) return false;
    var s = state(q), index = s.section++, layout = stream(q.seed, index, 0x4c41594f), reward = stream(q.seed, index, 0x52455741), events = stream(q.seed, index, 0x4556454e);
    // Planning uses a spatial clock, so frame rate, viewport width and collecting
    // ordinary rewards cannot reshuffle the course for an existing world seed.
    var worldStart = Math.round((q.distance + q.nextX - q.x) * 1000) / 1000;
    var planTime = timeAtDistance(worldStart), d = difficulty(planTime), v = speed(planTime + 2.5), o = q.x + worldStart - q.distance;
    var counts = { obstacles: q.obstacles.length, platforms: q.platforms.length, pickups: q.pickups.length, springs: q.springs.length };
    var family, event = null, recent = s.recent.slice(-4), forced = Number.isInteger(forcedRoute);
    if (forced) family = FAMILIES.find(function (f) { return f.id === forcedRoute; });
    if (!family && !forced && !q.flight && !q.flightLanding && !q.transfer && !q.contrarian && planTime - s.lastEventAt > 20) {
      if (q.ambientJetpacks && planTime >= s.nextIPO) event = "ipo";
      else if (q.ambientJetpacks && planTime >= s.nextFlight) event = "jetpack";
      else if (planTime >= s.nextContrarian) event = "contrarian";
    }
    if (!family && !event) {
      if (!forced && index >= s.nextRecovery && recent.indexOf(29) < 0) family = FAMILIES[9];
      else {
        var available = FAMILIES.filter(function (f) { return f.unlock <= planTime && f.id !== 29 && recent.indexOf(f.id) < 0; });
        if (!available.length) available = FAMILIES.filter(function (f) { return f.unlock <= planTime && f.id !== 29; });
        // Keep strong gap encounters in circulation instead of allowing a
        // long opening run to contain only rooftops and tiny spring holes.
        if (index > 0 && !s.recent.slice(-2).some(function (id) { return [23, 34, 35].includes(id); })) {
          var crossings = available.filter(function (f) { return [23, 34, 35].includes(f.id); });
          if (crossings.length) available = crossings;
        }
        family = choose(layout, available);
      }
    }
    q.spawnCount++;
    var id = event === "ipo" ? 36 : event === "jetpack" ? 32 : event === "contrarian" ? 33 : family.id;
    q.recent.push(id); if (q.recent.length > 8) q.recent.shift();
    s.recent.push(id); if (s.recent.length > 8) s.recent.shift();
    q.markers.push({ x: o - 50, w: 0, route: id, announced: false });
    var actions = [], endTime = 0, platforms = [], gapRanges = [];
    // Art/copy/motion have their own stream: none may reshuffle terrain,
    // landing banks, rewards or the platform director.
    var propMotion = stream(q.seed,index,0x50524f50);
    var xAt = function (t) { return o + t * v; };
    function floorRange(x, width) {
      var min = Infinity, max = -Infinity;
      for (var n = 0, steps = Math.max(2, Math.ceil(width / 20)); n <= steps; n++) {
        var y = q.floorAt(x + width * n / steps); min = Math.min(min, y); max = Math.max(max, y);
      }
      return { min: min, max: max };
    }
    function pickup(x, y, kind, platform, extra) {
      var item = Object.assign({ x: x, y: y, kind: kind, taken: false }, extra || {});
      if (platform) { item.platformId = platform.id; item.offsetY = y - platform.y; }
      q.pickups.push(item); return item;
    }
    function coins(t, span, height, kind, amount) {
      for (var n = 0; n < amount; n++) {
        var x = xAt(t + span * n / Math.max(1, amount - 1));
        pickup(x, q.floorAt(x) - height, kind || "dividend");
      }
    }
    function hurdle(t, kind) {
      // Art has a wide, readable silhouette even at the opening speed.
      // Collision uses this same width: there is no invisible extra obstacle.
      var width = kind === "high" ? between(layout, 146, 166) : between(layout, 98, 116);
      var x = xAt(t), floor = floorRange(x, width);
      // Keep a bar's entire slide envelope clear on crests and sloping ground.
      // Steeper spans become a readable jump rather than an ambiguous ceiling.
      if (kind === "high" && floor.max - floor.min > 24) { kind = "low"; width = 116; floor = floorRange(x, width); }
      var object = q.hazard(kind, x, width, kind === "high" ? floor.min : q.floorAt(x + width / 2));
      if (kind === "low") object.groundSlope = (q.floorAt(x + width) - q.floorAt(x)) / width;
      if(window.LR_HAZARDS) {
        LR_HAZARDS.endless(object,q,planTime+t);
        x=object.x;width=object.w;
        object.groundEnds=[q.floorAt(x+7),q.floorAt(x+width-7)];
        if(kind==="low")object.groundSlope=(q.floorAt(x+width)-q.floorAt(x))/width;
        const moving = kind === "high" && planTime+t>9 &&
          planTime+t-(s.lastMovingAt??-100)>5.8 && propMotion()<.44+.16*d.pressure;
        if(moving) {
          s.lastMovingAt=planTime+t;
          LR_HAZARDS.moving(object,q,between(propMotion,3.6-1.0*d.pressure,5.2-.4*d.pressure),
            between(propMotion,28,42),propMotion()<.5?"lift":"sine");
          if(object.artDistrict==="midtown" && propMotion()<.45)object.label="MOVING GUIDANCE";
        }
      }
      actions.push({ type: kind, t: t, widthTime: width / v, x: x, width: width });
      coins(t - .16, .32, kind === "high" ? 35 : 140, "opportunity", 3);
      endTime = Math.max(endTime, t + width / v + .8);
      return object;
    }
    function gap(t, time, stepping) {
      var x = xAt(t), width = v * time, slope = (q.floorAt(x + width + 40) - q.floorAt(x - 40)) / (width + 80);
      // A rise shortens a ground jump's landing window. Reserve extra margin.
      width *= slope < 0 ? clamp(1 + slope * 1.65, .60, 1) : 1;
      q.hazard("gap", x, width, q.floorAt(x));
      gapRanges.push([x, x + width]);
      actions.push({ type: "gap", t: t, widthTime: width / v, x: x, width: width });
      for (var n = 0; !stepping && n < 4; n++) {
        var px = x - v * .12 + (width + v * .24) * n / 3;
        pickup(px, Math.min(q.floorAt(x), q.floorAt(x + width)) - 115 - Math.sin(n / 3 * Math.PI) * 40, "opportunity");
      }
      endTime = Math.max(endTime, t + width / v + 1);
      return {x: x, width: width, duration: width / v};
    }
    function platform(t, duration, height, kind, premium) {
      var x = xAt(t), width = duration * v, floor = floorRange(x, width), amp = kind === "crane" ? between(layout, 10, d.movingAmplitude) : 0;
      var p = q.platform(x, floor.min - height - amp, width, kind, { premium: !!premium,
        amp: amp, frequency: between(layout, 1.0, d.movingFrequency), phase: between(layout, 0, Math.PI * 2) });
      platforms.push(p);
      var n = integer(reward, 3, 5);
      for (var i = 0; i < n; i++) pickup(x + width * (.15 + .7 * i / Math.max(1, n - 1)), p.y - 40, premium ? "opportunity" : "dividend", p);
      endTime = Math.max(endTime, t + duration + .5);
      return p;
    }
    function spring(t) {
      var x = xAt(t); q.springs.push({ x: x, w: between(layout, 48, 70), y: q.floorAt(x), used: false });
      endTime = Math.max(endTime, t + 1.2);
    }
    function gapBudget() {
      // Mix tap, held-jump and double-jump spans from the first minute.
      // Broad gaps become more common with distance; banks vary separately.
      var roll = layout(), pressure = d.pressure;
      if (roll < .12) return between(layout, .34, .46);
      if (roll < .38 - pressure * .12) return between(layout, .52, .66);
      if (roll < .70 - pressure * .10) return between(layout, .72, .84);
      return between(layout, .88, d.gapTime);
    }
    function groundSequence(types, start) {
      var t = start;
      types.forEach(function (kind) {
        if (kind === "gap") {
          const opening = gap(t, gapBudget());
          t += opening.duration + between(layout, 1.05, 1.55);
        } else { hurdle(t, kind); t += d.actionGap + between(layout, .05, .55); }
      });
      return t;
    }
    if (event) {
      s.lastEventAt = planTime; s.eventCounts[event]++;
      if (event === "ipo") {
        s.nextIPO=planTime+between(events,92,138);
        const offer=between(layout,.9,1.4);
        pickup(xAt(offer),q.floorAt(xAt(offer))-65,"jetpack",null,{flightKind:"ipo",encounterSeed:Math.floor(events()*4294967296)>>>0});
        coins(offer+.5,1.4,34,"dividend",4);
        endTime=offer+3.2; // The arena pauses the street; both entry and return have clear ground.
      } else if (event === "jetpack") {
        s.nextFlight = planTime + between(events, 38, 63); q.lastCruiseSection = q.spawnCount - 1;
        var launch = between(layout, .7, 1.1);
        pickup(xAt(launch), q.floorAt(xAt(launch)) - 160, "jetpack", null, { flightKind: "cruise" });
        var phase = between(layout, 0, Math.PI * 2), waves = choose(layout, [1, 1.5, 2]);
        for (var i = 0; i < 15; i++) {
          var t = launch + .6 + i * .30, px = xAt(t);
          pickup(px, q.floorAt(px) - (165 + Math.sin(phase + i / 14 * Math.PI * 2 * waves) * 52), "opportunity", null, { aerial: true });
        }
        coins(launch + .8, 5.2, 34, "dividend", 9);
        endTime = launch + 8.2; // Flight, landing blend and visible recovery all fit.
      } else {
        s.nextContrarian = planTime + between(events, 58, 87); q.contrarianDone = false;
        q.contrarianOffers++; q.lastOfferSection = q.spawnCount;
        var offer = between(layout, 1.0, 1.7);
        pickup(xAt(offer), q.floorAt(xAt(offer)) - 170, "contrarian");
        coins(.4, offer + 1.8, 34, "dividend", 7);
        endTime = offer + 3.0; // Skipping the voluntary pickup leaves a safe street.
      }
    } else {
      var count = integer(layout, Math.max(2, d.actions - 1), d.actions), lead = between(layout, .65, 1.0), t;
      switch (family.kind) {
        case "rhythm":
          var pattern = [], last = null;
          for (var i = 0; i < count; i++) { var kind = layout() < .53 ? "low" : "high"; if (i > 1 && kind === last && pattern[i - 2] === kind) kind = kind === "low" ? "high" : "low"; pattern.push(kind); last = kind; }
          groundSequence(pattern, lead); break;
        case "mixed":
          var kinds = ["low", "high", "gap"], sequence = [];
          for (var i = 0; i < count; i++) sequence.push(choose(layout, kinds.filter(function (k) { return k !== sequence[sequence.length - 1]; })));
          groundSequence(sequence, lead); break;
        case "volatility":
          groundSequence(Array.from({ length: count }, function () { return layout() < .7 ? "low" : "gap"; }), lead); break;
        case "gaps":
          t = lead;
          var n = integer(layout, 2, Math.max(2, Math.min(3, count))), broad = integer(layout, 0, n - 1);
          for (var i = 0; i < n; i++) {
            // Each opening gets a width and an independent landing bank, never
            // a fixed beat. Later runs admit full double-jump stretches.
            var opening = gap(t, i === broad ? between(layout, .88, d.gapTime) : gapBudget());
            t += opening.duration + between(layout, 1.05, 1.85);
          }
          break;
        case "islands":
          t = lead;
          var n = integer(layout, 2, 4), longerBank = integer(layout, 0, n - 1);
          for (var i = 0; i < n; i++) {
            var opening = gap(t, i === longerBank ? between(layout, .80, .92 + d.pressure * .08) : between(layout, .42, .70));
            t += opening.duration + between(layout, 1.05, 1.65);
          }
          break;
        case "ravine":
          // A genuinely wide opening, crossed on a variable number of broad
          // stepping platforms. No required power-up or perfect triple jump.
          var stones = integer(layout, 2, 4), stride = between(layout, .78, 1.02);
          var hole = gap(lead, stones * stride + .36, true);
          var spacing = hole.duration / (stones + 1);
          for (var i = 0; i < stones; i++) {
            platform(lead + spacing * (i + 1) - .18, between(layout, .38, .50),
              between(layout, 22, 44), "roof", false);
          }
          break;
        case "spring":
          spring(lead); gap(lead + .55, between(layout, .42, .64));
          platform(lead + .95, between(layout, .65, .95), between(layout, 72, 100), choose(layout, ["billboard", "roof"]));
          hurdle(lead + 3.6 + between(layout, 0, .6), "low"); break;
        case "express":
          var dur = between(layout, 1.65, 2.3), train = platform(lead, dur, between(layout, 56, 78), "train");
          gap(lead + .7, between(layout, .34, .60));
          pickup(train.x + train.w * .68, train.y - 43, "conviction", train);
          hurdle(lead + dur + 1.5, "low"); break;
        case "recovery":
          s.eventCounts.recovery++; s.nextRecovery = index + integer(events, 5, 8);
          coins(.4, between(layout, 2.0, 3.0), 35, "dividend", integer(reward, 7, 10));
          if (layout() < .65) platform(.8, between(layout, .55, .9), 58, "awning");
          endTime = Math.max(endTime, between(layout, 3.0, 3.7)); break;
        default:
          var number = integer(layout, 2, Math.min(4, count)), cursor = lead;
          var ascending = layout() < .5, high = between(layout, 54, 74);
          for (var i = 0; i < number; i++) {
            var height = high + (ascending ? i : number - 1 - i) * between(layout, 14, 24);
            height = Math.min(height, 128);
            var kind = family.kind === "cranes" ? "crane" : family.kind === "crumble" ? "crumble" : choose(layout, ["awning", "roof", "billboard"]);
            if (family.kind === "ladder" && i === 0) spring(Math.max(.35, cursor - .35));
            var duration = between(layout, .65, 1.12), p = platform(cursor, duration, height, kind);
            if (family.kind === "upper" && i === 1) {
              var upper = platform(cursor + .20, between(layout, .48, .66), height + 168, "bull", true);
              pickup(upper.x + upper.w * .5, upper.y - 42, "conviction", upper);
            }
            cursor += duration + between(layout, .50, .95);
          }
          // Ground obstacles follow the roof sequence, with landing space.
          // Never hide a mandatory hurdle beneath a low overhanging platform.
          if (layout() < .8) hurdle(cursor + .65, "low");
          break;
      }
      if (family.id !== 29 && index >= s.nextRecovery + 2) s.nextRecovery = index + integer(events, 3, 5);
      // A separate reward stream cannot alter any platform, hazard or event.
      if (planTime - s.lastPowerAt >= 12 && reward() < .52) {
        var power = choose(reward, ["research", "diversification", "conviction"]);
        if (platforms.length && reward() < .72) {
          var p = choose(reward, platforms); pickup(p.x + p.w * .7, p.y - 42, power, p);
        } else {
          var tx = xAt(Math.max(.25, endTime + .25)); pickup(tx, q.floorAt(tx) - 40, power);
          endTime += .65;
        }
        s.lastPowerAt = planTime;
      }
    }
    endTime = Math.max(2.0, endTime);
    var rest = d.rest + between(layout, .12, .65);
    var worldEnd = Math.round((worldStart + (endTime + rest) * v) * 1000) / 1000;
    q.nextX = q.x + worldEnd - q.distance;
    var record = { index: index, route: id, family: event || family.kind, start: worldStart,
      end: worldEnd, time: planTime, speed: v, pressure: d.pressure, tier: d.tier,
      actions: actions.map(function (a) { return { type: a.type, offset: Math.round((a.x - o) * 100) / 100, width: Math.round(a.width * 100) / 100, time: a.t }; }),
      components: { obstacles: q.obstacles.length - counts.obstacles, platforms: q.platforms.length - counts.platforms, pickups: q.pickups.length - counts.pickups, springs: q.springs.length - counts.springs },
      recoverySeconds: rest, event: event };
    s.history.push(record); if (s.history.length > 64) s.history.shift();
    return true;
  }
  window.LR_ENDLESS_GENERATOR = { version: VERSION, active: active, generate: generate, terrain: terrain, speed: speed, difficulty: difficulty, distanceAtTime: distanceAtTime,
    families: FAMILIES.map(function (f) { return Object.freeze(Object.assign({}, f)); }),
    routeName: function (id) { return id === 36 ? "IPO HYPE MACHINE" : id === 32 ? "LIQUIDITY LIFT" : id === 33 ? "AGAINST THE CONSENSUS" : (FAMILIES.find(function (f) { return f.id === id; }) || {}).name || ""; },
    inspect: function (q) { if (!active(q)) return null; var s = state(q); return { version: VERSION, section: s.section, nextFlight: s.nextFlight,
      nextContrarian: s.nextContrarian, nextIPO:s.nextIPO, recent: s.recent.slice(), events: Object.assign({}, s.eventCounts), history: s.history.slice() }; } };
})();
