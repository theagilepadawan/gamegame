import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';
import {fileURLToPath, pathToFileURL} from 'node:url';
import {createHash} from 'node:crypto';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export function model(engine, endless, generator = '') {
  const context = vm.createContext({console, performance: {now: () => 0}, setTimeout: () => 0, clearTimeout() {},
    requestAnimationFrame: () => 0, matchMedia: () => ({matches: true}), addEventListener() {},
    document: {getElementById: () => null}, navigator: {}});
  context.window = context;
  const end = engine.indexOf('var Wo = class');
  assert.ok(end > 0, 'Extract the actual model before rendering/DOM bootstrap');
  vm.runInContext(engine.slice(0, end), context);
  if (generator) vm.runInContext(generator, context);
  vm.runInContext(readFileSync(path.join(root,'scripts/endless-ipo.js'),'utf8'),context);
  vm.runInContext(endless, context);
  return context;
}
const digest = value => createHash('sha256').update(JSON.stringify(value)).digest('hex');
export function storyState(context, seed, width, character) {
  const q = new context.hi(width, seed, {mode: 'chapter', procedural: true, character});
  const states = [];
  for (let frame = 0; frame <= 300; frame++) {
    if ([8, 36, 145].includes(frame)) q.jump();
    if ([24, 55, 170].includes(frame)) q.release();
    if (frame) q.step(1 / 120, frame >= 210 && frame < 250);
    if ([0, 120, 300].includes(frame)) states.push(JSON.parse(JSON.stringify({time: q.time, chapterTime: q.chapterTime, distance: q.distance,
      chapterDistance: q.chapterDistance, x: q.x, y: q.y, vy: q.vy, speed: q.speed, grounded: q.grounded,
      sliding: q.sliding, chain: q.jumpChain, dead: q.dead, score: q.score, obstacles: q.obstacles,
      platforms: q.platforms, pickups: q.pickups, springs: q.springs, events: q.events})));
  }
  return digest(states);
}
function copy(q) {
  const next = Object.assign(Object.create(Object.getPrototypeOf(q)), q);
  for (const name of ['obstacles', 'pickups', 'platforms', 'springs', 'markers']) next[name] = q[name].map(item => ({...item}));
  next.events = [];
  if (q.__lr) next.__lr = {...q.__lr, pops: []};
  return next;
}
function stateKey(q) {
  return [q.grounded, q.support, Math.round(q.y / 7), Math.round(q.vy / 45), q.held, q.airJumpAvailable,
    q.jumpChain, q.chainWindow > 0, q.jumpCount, q.forcedBounce > 0, q.sliding, q.flight, q.flightLanding > 0,
    q.platforms.map(p => p.collapseAt ? Math.round((p.collapseAt - q.time) * 10) : '').join(',')].join('|');
}
export function controlSearch(context, initial, target, inputs = [0, 1, 2], options = {}) {
  // The test explores player inputs every100ms, while the real engine simulates
  // at120Hz. It neither moves geometry nor grants invincibility. A successful
  // path is a concrete witness; failure means this bounded search found none.
  let beam = [{q: initial, controls: ''}], peak = 1;
  const maximumSteps = Math.ceil(((target - initial.distance) / context.LR_ENDLESS.speed(initial.time) + 4) / .1);
  for (let step = 0; step < maximumSteps; step++) {
    const seen = new Map();
    for (const previous of beam) for (const input of inputs) {
      const q = copy(previous.q);
      // Optional super-jumps must not be required to survive the street route.
      if (!options.allowGrand && input === 1 && !q.held && q.chainReady && q.jumpChain === 2) continue;
      if (input === 1 && !q.held) q.jump();
      else if (input !== 1 && q.held) q.release();
      for (let tick = 0; tick < 12 && !q.dead && !q.qaDamage && !q.qaThirdJump; tick++) {
        q.step(1 / 120, input === 2);
        if (q.superJumpAge >= 0 || q.jumpChain >= 3) {q.qaGrandUsed=true;if(!options.allowGrand)q.qaThirdJump = true;}
      }
      if (q.dead || q.qaDamage || q.qaThirdJump) continue;
      const controls = previous.controls + input;
      if (q.distance >= target && q.grounded && (!options.goal || options.goal(q))) return {pass: true, controls, seconds: q.time - initial.time, peak};
      const ahead=q.platforms.filter(p=>p.skill&&!p.premium&&p.active&&p.x>q.x+12&&p.x<q.x+q.speed*1.8).sort((a,b)=>a.x-b.x)[0];
      const key = stateKey(q), score = (q.grounded ? 0 : 40) + Math.abs(q.y - (ahead?.y??q.floorY)) * (ahead?.1:.025) + (input === 2 ? 1 : 0);
      if (!seen.has(key) || score < seen.get(key).score) seen.set(key, {q, controls, score});
    }
    beam = [...seen.values()].sort((a, b) => a.score - b.score).slice(0,options.beamWidth??(initial.platforms.some(p=>p.skill)?192:80));
    peak = Math.max(peak, beam.length);
    if (!beam.length) return {pass: false, failedAt: step * .1, peak};
  }
  return {pass: false, timeout: true, peak};
}
function replayControls(initial, target, controls) {
  const q = initial, start = q.time;
  for (const control of controls) {
    const input = Number(control);
    assert.ok([0, 1, 2].includes(input), 'Replay contains only real player controls');
    if (input === 1 && !q.held) q.jump();
    else if (input !== 1 && q.held) q.release();
    for (let tick = 0; tick < 12; tick++) {
      q.step(1 / 120, input === 2);
      if (q.dead || q.qaDamage || q.superJumpAge >= 0 || q.jumpChain >= 3) return {pass: false, failedAt: q.time - start};
    }
  }
  return {pass: q.distance >= target && q.grounded, controls, seconds: q.time - start, replayed: true};
}

async function main() {
  const output = process.env.ENDLESS_FAIRNESS_OUTPUT || path.join(root, 'review/v127/endless-fairness');
  await fs.mkdir(output, {recursive: true});
  const [engine, endless, generator, baseline] = await Promise.all([
    fs.readFile(path.join(root, 'scripts/engine.js'), 'utf8'), fs.readFile(path.join(root, 'scripts/endless.js'), 'utf8'),
    fs.readFile(path.join(root, 'scripts/endless-generator.js'), 'utf8'),
    fs.readFile(path.join(root, 'tests/fixtures/story-props-v124.json'), 'utf8').then(JSON.parse)]);
  const c = model(engine, endless, generator), G = c.LR_ENDLESS_GENERATOR;
  // After unrelated presentation/copy edits, replay previously discovered
  // witnesses through the current real engine instead of repeating the search.
  const replayPath=process.env.ENDLESS_REPLAY_REPORT||(process.env.ENDLESS_SEARCH==='1'?null:path.join(root,'tests/fixtures/endless-controls-v127.json'));
  const replay = replayPath ? JSON.parse(await fs.readFile(replayPath, 'utf8')) : null;
  assert.equal(G.version, 7);
  const sample = new c.hi(540, 42, {mode: 'endless', procedural: true});
  assert.equal(sample.terrainProfile.version, 7, 'Constructor uses the new terrain in real Endless');
  sample.spawn(20);
  assert.equal(G.inspect(sample).history.at(-1).route, 20, 'Real engine spawn delegates to the new generator');
  const report = {sourceSha256: {engine: createHash('sha256').update(engine).digest('hex'), endless: createHash('sha256').update(endless).digest('hex'), generator: createHash('sha256').update(generator).digest('hex')}, storyReference: baseline.reference, storyChecks: [], compactReaction: [], physics: [], bars: 0, events: []};
  for (const item of baseline.cases) {
    assert.equal(storyState(c, item.seed, item.width, item.character), item.sha256, 'Story physics/course snapshot remains identical');
    report.storyChecks.push({seed: item.seed, width: item.width, character: item.character});
  }
  for (const time of [0, 60, 180, 600, 1800]) {
    const seconds = (540 - sample.x - 15) / G.speed(time);
    // Pace is deliberately uncapped: record the narrowing compact-view window.
    assert.ok(Number.isFinite(seconds) && seconds > 0);
    report.compactReaction.push({time, speed: G.speed(time), seconds});
  }
  // Record every actual collision, including a hit absorbed by a shield; the
  // solver must find a path that survives by controls rather than damage credit.
  const originalHit = c.hi.prototype.hit;
  c.hi.prototype.hit = function(cause) {this.qaDamage = (this.qaDamage || 0) + 1; return originalHit.call(this, cause);};
  for (const time of [0, 240]) for (const family of G.families) {
    const seed = (0x51a7 + family.id * 917 + time * 31) >>> 0;
    const q = new c.hi(864, seed, {mode: 'endless', procedural: true, ambientJetpacks: false});
    q.time = time; q.distance = G.distanceAtTime(time); q.nextX = q.x + 500; q.autoSpawn = false;
    q.spawn(family.id); q.y = q.floorY;
    assert.equal(q.invincible, 0);
    for (const bar of q.obstacles.filter(o => o.type === 'high')) {
      for (let sampleX = bar.x; sampleX <= bar.x + bar.w; sampleX += 4) {
        const edge=bar.requiredAction==='slide'?G.ceilingAt(bar,sampleX):bar.base-96;
        assert.ok(edge <= q.floorAt(sampleX) - 78 + .05, 'Slide clears the full bar, including terrain crests');
      }
      report.bars++;
    }
    const target = q.distance + q.nextX - q.x;
    const witness = replay?.physics.find(item => item.time === time && item.seed === seed && item.route === family.id);
    if (replay && process.env.ENDLESS_SEARCH!=='1') assert.ok(witness?.pass && witness.controls, 'Replay contains the exact previously successful seed/family/time witness');
    let result = witness ? replayControls(copy(q), target, witness.controls) : controlSearch(c, q, target);
    if(!result.pass&&process.env.ENDLESS_SEARCH==='1')result=controlSearch(c,q,target);
    const item = {time, seed, family: family.kind, route: family.id, ...result};
    report.physics.push(item);
    await fs.writeFile(path.join(output, 'report.json'), JSON.stringify(report, null, 2));
    assert.ok(result.pass, `No collision-free input witness: ${JSON.stringify(item)}`);
    console.log(`PASS Endless physics: ${family.kind} at${time}s, seed${seed}`);
  }
  // Voluntary events may be skipped without a mandatory hole underneath them.
  // Taking an event must leave the original launch/recovery mechanics usable.
  for (const kind of ['jetpack', 'contrarian']) {
    const q = new c.hi(540, 0x71f00d, {mode: 'endless', procedural: true});
    q.time = 90; q.distance = G.distanceAtTime(90); q.nextX = q.x + 500; q.autoSpawn = false; q.y = q.floorY;
    G.inspect(q); // Initialize the real director before setting its due event.
    q.__endlessDirector.nextFlight = kind === 'jetpack' ? 0 : Infinity;
    q.__endlessDirector.nextContrarian = kind === 'contrarian' ? 0 : Infinity;
    q.__endlessDirector.nextIPO = Infinity;
    q.spawn();
    const event = G.inspect(q).history.at(-1);
    assert.equal(event.event, kind);
    assert.equal(q.obstacles.length, 0, 'An offered event keeps a safe ground bypass');
    const pickup = q.pickups.find(p => p.kind === kind);
    assert.ok(pickup && pickup.x > q.x + 250, 'Event appears with a visible approach');
    if (kind === 'jetpack') {
      q.beginFlight({kind: 'cruise'});
      for (let frame = 0; frame < 900 && (q.flight || q.flightLanding); frame++) {q.held = frame % 120 < 40; q.step(1 / 120);}
      assert.equal(q.dead, false); assert.equal(q.flight, false); assert.equal(q.grounded, true);
    } else {
      q.beginContrarian();
      assert.ok(q.transfer && q.contrarian);
      q.endContrarian();
      assert.ok(q.transfer && !q.contrarian);
      assert.ok(q.nextX >= q.x + 900, 'Return reserves a readable ground recovery');
    }
    report.events.push({kind, route: event.route, launchAndRecovery: true});
  }
  await fs.writeFile(path.join(output, 'report.json'), JSON.stringify(report, null, 2));
  console.log(`PASS: ${report.storyChecks.length} Story snapshots, ${report.physics.length} collision-free section witnesses, full-span slide clearance and event recovery.`);
}
if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) await main();
