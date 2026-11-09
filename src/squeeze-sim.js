// src/squeeze-sim.js — the Squeeze Lab's soft-body simulation (tools/squeeze-lab.html): the three particle
// transformations of the forces Short, 1 the electron shells crushed (degenerate matter), 2 fusion (the strong force),
// 3 the neutrons (the weak force at the collapse). The lab tunes it with sliders; the narration draws it on the take's
// clock (src/narration.js, { squeeze: { mode } }). No DOM: draw() takes a 2D context.
//   const sim = createSqueeze({ pics }); sim.S.mode = 1; sim.S.P = defaults(1); sim.build(); sim.step(DT); sim.draw(ctx, w, h, pixelRatio)

// ---------- world ----------
// World units: the screen's short side is 1080, its long side 1920 (a phone's frame or a landscape one). The box is a
// square centred on the screen, larger than it, shrinking over time. Everything is simulated inside the box; the
// screen shows its middle.
export const SHORT = 1080, LONG = 1920;
export const DT = 1 / 120;                 // physics step (two a frame at 60 fps, more when slowed down)


// ---------- parameters ----------
// The base, then each regime's overrides. Every number is a slider in the rail.
export const BASE = {
  count: 100, radius: 100, sizeSpread: 0.1, nucleus: 0.1, segments: 28,
  startBox: 2.2, endBox: 1.0, shrinkTime: 40, relief: 0, gravity: 0, initSpeed: 60, jitter: 0,
  repel: 1, falloff: 2, range: 1, stiffness: 1, tension: 1, pressure: 1, contact: 1, damping: 1, drift: 0.3,
  tremble: 1,
  threshold: 0.3, spread: 0.2, centreFirst: 0, popTime: 0.35, electrons: 8, electronSpeed: 900, electronPush: 0.01, electronSize: 0.03, electronBounce: true, bareSpacing: 1,
  fuseAt: 0.6, fourAtOnce: false, neutrons: 2, maxNuclei: 4, bridgeTime: 0.4, hugRate: 0.7, nucleiPull: 2, chargeScaling: true,
  contract: false, shatter: 1, greySize: 1, greyUniform: true, greyAttract: 0, captureElectrons: false,
  onScreenOnly: true, pictures: false, arrowsOut: false, arrowsIn: false, arrowsStrong: false, arrowSize: 0.45, arrowTime: 5, lineWidth: 3, glow: 1, fill: 0.06, hud: true, walls: true,
};
export const MODE_DEFAULTS = {
  1: { nucleus: 0.10, count: 150, sizeSpread: 0.12, shrinkTime: 23, repel: 5.05, falloff: 4, range: 0.6, stiffness: 2.95, pressure: 0.5, damping: 0.8,
       threshold: 0.04, spread: 0.2, centreFirst: 4, electrons: 30, electronPush: 0.105, electronBounce: false, pictures: true, arrowsOut: true, arrowsIn: true, lineWidth: 2, glow: 1.2 },
  2: { nucleus: 0.50, count: 339, radius: 120, segments: 32, relief: 2, sizeSpread: 0.08, jitter: 25, repel: 6, falloff: 4, range: 1.2, stiffness: 4, pressure: 4, damping: 2, shrinkTime: 50,
       fuseAt: 0.3, fourAtOnce: true, bridgeTime: 0.05, hugRate: 4.15, nucleiPull: 2.15, pictures: true, arrowsOut: true, arrowsIn: true, arrowsStrong: true },
  3: { nucleus: 0.90, count: 700, radius: 100, sizeSpread: 0, startBox: 4, repel: 6, falloff: 4, range: 0.6, stiffness: 8, pressure: 4, damping: 2, threshold: 0.015, spread: 0.35, centreFirst: 2.9,
       contract: true, shatter: 3, greySize: 0.9, pictures: true, captureElectrons: true },
};
export function defaults(mode) { return Object.assign({}, BASE, MODE_DEFAULTS[mode]); }
const TAU = Math.PI * 2;
const COL = { 1: "79,163,255", 2: "255,213,74", 3: "80,230,120" };   // electromagnetism, strong, weak

// pics: { proton, neutron } images (the chart's particle pictures), drawn when P.pictures is on and they've loaded
export function createSqueeze({ pics = {} } = {}) {
  const PICS = pics;
  const picReady = (k) => PICS[k] && PICS[k].complete && PICS[k].naturalWidth > 0;
  let ctx = null, dpr = 1;
  const canvas = { width: 1, height: 1 };
  // ---------- state ----------
  const S = {
    seed: 1, hudText: "", arrowT0: 0,   // arrowT0: when the arrows' time starts (the run's start in the lab; a video clip's first frame)
    mode: 1, orient: "v", view: "screen", paused: false, speed: 1,
    P: null, t: 0, blobs: [], electrons: [], captures: [], flashes: [], pops: [], frags: [], bridges: [], events: { pop: 0, fuse: 0, break: 0 }, maxSq: 0,
    W: SHORT, H: LONG, box: 0, shrinkT: 0, floor: 0, jam: 0, nextId: 1, fps: 0,
  };
  // seeded, so a seed always gives the same run (the video's renders step it on the take's clock, each worker from the
  // start); reset by build()
  let seedState = 1;
  const random = () => { seedState = (seedState + 0x6D2B79F5) | 0; let x = Math.imul(seedState ^ (seedState >>> 15), 1 | seedState);
    x = (x + Math.imul(x ^ (x >>> 7), 61 | x)) ^ x; return ((x ^ (x >>> 14)) >>> 0) / 4294967296; };
  const rnd = (a, b) => a + random() * (b - a);
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const TAU = Math.PI * 2;

  // ---------- the crowd ----------
  function makeBlob(x, y, vx, vy, R, M, kind) {
    const b = {
      id: S.nextId++, kind, state: "intact", R, A0: restArea(R, M), M,
      nodes: [], nuclei: [], cx: x, cy: y, vx, vy, q: 1, charge: 1, mass: 1, sq: 0, kfac: 1, grey: 0, born: S.t, u: random() * 2 - 1,
      minx: 0, miny: 0, maxx: 0, maxy: 0,
    };
    for (let i = 0; i < M; i++) {
      const a = (i / M) * TAU;
      b.nodes.push({ x: x + Math.cos(a) * R, y: y + Math.sin(a) * R, vx, vy, rt: R, fx: 0, fy: 0 });
    }
    b.nuclei.push({ x, y, vx, vy, r: R * S.P.nucleus, fx: 0, fy: 0, rot: random() * TAU });
    return b;
  }

  function build() {
    const P = S.P;
    seedState = S.seed >>> 0;
    S.t = 0; S.blobs = []; S.electrons = []; S.captures = []; S.flashes = []; S.pops = []; S.frags = []; S.bridges = []; S.events = { pop: 0, fuse: 0, break: 0 }; S.maxSq = 0;
    S.box = P.startBox * Math.max(S.W, S.H); S.shrinkT = 0; S.floor = 0; S.jam = 0;
    const half = S.box / 2 - P.radius * 1.05, R = P.radius;
    let pts = [];
    for (let n = 0, tries = 0; n < P.count && tries < P.count * 400; tries++) {
      const x = rnd(-half, half), y = rnd(-half, half);
      let ok = true;
      for (const p of pts) if ((p[0] - x) ** 2 + (p[1] - y) ** 2 < (2.3 * R) ** 2) { ok = false; break; }
      if (!ok) continue;
      pts.push([x, y]); n++;
    }
    if (pts.length < P.count) {   // too crowded to scatter: a jittered hexagonal lattice, spaced to fit the count (or as many as fit)
      const area = (2 * half) ** 2, sp = Math.max(2.04 * R, Math.sqrt(2 * area / (Math.sqrt(3) * P.count))), rowH = sp * 0.866;
      pts = [];
      const cols = Math.floor(2 * half / sp), rows = Math.floor(2 * half / rowH);
      const x0 = -(cols - 1) * sp / 2, y0 = -(rows - 1) * rowH / 2, j = Math.min(0.12 * R, (sp - 2.02 * R) / 2);
      for (let r = 0; r < rows; r++) for (let c = 0; c < cols - (r % 2); c++) pts.push([x0 + c * sp + (r % 2) * sp / 2 + rnd(-j, j), y0 + r * rowH + rnd(-j, j)]);
      pts.sort((a, b) => Math.hypot(a[0], a[1]) - Math.hypot(b[0], b[1]));   // the middle first, so a short list stays centred
      pts = pts.slice(0, P.count);
    }
    for (const [x, y] of pts) {
      const a = rnd(0, TAU), s = P.initSpeed * rnd(0.4, 1), Ri = R * (1 + P.sizeSpread * rnd(-1, 1));
      S.blobs.push(makeBlob(x, y, Math.cos(a) * s, Math.sin(a) * s, Ri, Math.max(10, Math.round(P.segments * Ri / R) & ~1), S.mode));
    }
    // mode 3: an electron beside each proton, drifting round just outside its ring (the author, 2026-11-09: "blue
    // glowing circles representing electrons that merge with the protons")
    if (S.mode === 3 && P.captureElectrons) for (const b of S.blobs) S.captures.push({ b, a: rnd(0, TAU), d: rnd(1.08, 1.22), w: rnd(-0.35, 0.35), x: b.cx, y: b.cy, fall: -1 });
  }

  // ---------- geometry ----------
  function restArea(R, M) { return M / 2 * R * R * Math.sin(TAU / M); }   // the ring's area at rest: a regular M-gon, not the circle
  function polyArea(nodes) {
    let a = 0;
    for (let i = 0, n = nodes.length; i < n; i++) { const p = nodes[i], q = nodes[(i + 1) % n]; a += p.x * q.y - q.x * p.y; }
    return a / 2;
  }
  function measure(b) {
    let cx = 0, cy = 0, vx = 0, vy = 0, n = b.nodes.length;
    if (n) {
      let minx = 1e9, miny = 1e9, maxx = -1e9, maxy = -1e9;
      for (const p of b.nodes) {
        cx += p.x; cy += p.y; vx += p.vx; vy += p.vy;
        if (p.x < minx) minx = p.x; if (p.x > maxx) maxx = p.x; if (p.y < miny) miny = p.y; if (p.y > maxy) maxy = p.y;
      }
      b.cx = cx / n; b.cy = cy / n; b.vx = vx / n; b.vy = vy / n;
      b.minx = minx; b.miny = miny; b.maxx = maxx; b.maxy = maxy;
      const A = polyArea(b.nodes);
      b.A = A; b.sq = 1 - A / b.A0;
      // the ring's mean radius (electrons bounce off it)
      let rm = 0; for (const p of b.nodes) rm += Math.hypot(p.x - b.cx, p.y - b.cy); b.rm = rm / n;
    } else {
      const k = b.nuclei[0];
      b.cx = k.x; b.cy = k.y; b.vx = k.vx; b.vy = k.vy; b.sq = 0; b.rm = k.r;
      b.minx = k.x - k.r; b.maxx = k.x + k.r; b.miny = k.y - k.r; b.maxy = k.y + k.r;
    }
  }
  // the radius the long-range force counts from: the ring for a whole circle, a spacing for a bare nucleus
  function reach(b) { return b.state === "popped" ? b.R * S.P.bareSpacing * 0.5 : b.rm || b.R; }
  function onScreen(b) { return !S.P.onScreenOnly || (Math.abs(b.cx) < S.W / 2 && Math.abs(b.cy) < S.H / 2); }
  // a shell's own threshold: the regime's, spread a little per shell, and growing with distance from the screen's centre
  function thresholdOf(b) {
    const P = S.P, d = Math.hypot(b.cx, b.cy) / Math.hypot(S.W / 2, S.H / 2);
    return P.threshold * (1 + P.spread * b.u) * (1 + P.centreFirst * d);
  }
  function strainOf(b) {   // how close a shell is to its threshold, 0..1
    if (b.state !== "intact" || S.mode === 2 || !onScreen(b)) return 0;
    return clamp(b.sq / thresholdOf(b), 0, 1);
  }

  // ---------- physics ----------
  function step(dt) {
    const P = S.P, blobs = S.blobs;
    // the box: its schedule shrinks with an ease-in-out and holds; an event can set the schedule back (relief); a jammed
    // crowd of hard discs sets a floor it can't go below; the real side eases toward the result
    S.shrinkT += dt;
    const u = clamp(S.shrinkT / P.shrinkTime, 0, 1), e = u * u * (3 - 2 * u), big = Math.max(S.W, S.H);
    const goal = Math.max((P.startBox + (P.endBox - P.startBox) * e) * big, S.floor);
    S.box += (goal - S.box) * Math.min(1, 3 * dt);
    const half = S.box / 2;

    for (const b of blobs) { measure(b); for (const p of b.nodes) { p.fx = 0; p.fy = 0; } for (const k of b.nuclei) { k.fx = 0; k.fy = 0; } }

    // neighbours: pairs of blobs whose centres are within a cell of each other (a grid, so a thousand circles stay cheap);
    // the cell covers two radii plus the farthest the repulsion or a contact reaches
    let Rmax = 0; for (const b of blobs) if (b.R > Rmax) Rmax = b.R;
    const lamMax = P.range * Rmax * (P.repel > 0 ? 5 : 0), cs = 2 * Rmax * 1.3 + Math.max(lamMax, 60), cells = new Map();
    for (const b of blobs) { const k = Math.floor(b.cx / cs) * 65536 + Math.floor(b.cy / cs); const c = cells.get(k); if (c) c.push(b); else cells.set(k, [b]); }
    const pairs = [];
    for (const A of blobs) {
      const ix = Math.floor(A.cx / cs), iy = Math.floor(A.cy / cs);
      for (let ox = -1; ox <= 1; ox++) for (let oy = -1; oy <= 1; oy++) {
        const c = cells.get((ix + ox) * 65536 + iy + oy); if (!c) continue;
        for (const B of c) if (B.id > A.id) pairs.push(A, B);
      }
    }

    // long-range repulsion between centres (electric), 1/d^n from the edges, fading over `range` radii of gap
    const a0 = P.repel * 300;
    for (let i = 0; i < pairs.length; i += 2) {
      const A = pairs[i], B = pairs[i + 1];
      {
        const qA = P.chargeScaling ? A.charge : (A.charge > 0 ? 1 : 0), qB = P.chargeScaling ? B.charge : (B.charge > 0 ? 1 : 0);
        let dx = B.cx - A.cx, dy = B.cy - A.cy, d = Math.hypot(dx, dy) || 1e-6;
        const ra = reach(A), rb = reach(B), d0 = ra + rb;
        let f = 0;
        if (qA > 0 && qB > 0) {
          const dd = Math.max(d, d0 * 0.5), gap = Math.max(0, d - d0), lam = P.range * Math.max(A.R, B.R);
          f = a0 * qA * qB * Math.pow(d0 / dd, P.falloff) * Math.exp(-gap / lam);
        } else if (P.greyAttract > 0 && A.state === "grey" && B.state === "grey") {
          const gap = d - d0;
          if (gap < A.R * 0.6 && gap > A.R * 0.02) f = -P.greyAttract * 300;   // a short-range pull between neutrons
        }
        if (f === 0) continue;
        dx /= d; dy /= d;
        bodyForce(A, -dx * f / A.mass, -dy * f / A.mass);
        bodyForce(B, dx * f / B.mass, dy * f / B.mass);
      }
    }

    // a pull to the screen's centre (a star's gravity: the middle is squeezed hardest)
    if (P.gravity > 0) for (const b of blobs) {
      const d = Math.hypot(b.cx, b.cy) || 1; const g = P.gravity * 150 * Math.min(1, d / (big * 0.5));
      bodyForce(b, -b.cx / d * g, -b.cy / d * g);
    }

    // each ring: hold its distance from the centre, its spacing, its smoothness, its area; stay outside its nuclei
    const kr0 = 300 * P.stiffness, kt0 = 400 * P.tension, kb0 = 150 * P.tension, kp0 = 30000 * P.pressure;
    for (const b of blobs) {
      const n = b.nodes.length; if (!n || b.state === "grey") continue;   // a clenched ring is rigid: placed round its disc below
      const kr = kr0 * b.kfac, kt = kt0, kb = kb0 * b.kfac, kp = kp0 * b.kfac;
      const l0 = TAU * b.R / n, areaPush = kp * (1 - b.A / b.A0);
      for (let i = 0; i < n; i++) {
        const p = b.nodes[i], prev = b.nodes[(i + n - 1) % n], next = b.nodes[(i + 1) % n];
        // radial spring to the ring's target radius (a merged ring's target relaxes toward the new circle)
        let rx = p.x - b.cx, ry = p.y - b.cy, r = Math.hypot(rx, ry) || 1e-6; rx /= r; ry /= r;
        const rad = kr * (p.rt - r);
        p.fx += rx * rad; p.fy += ry * rad;
        // area pressure along the outward normal
        let nx = next.y - prev.y, ny = -(next.x - prev.x), nl = Math.hypot(nx, ny) || 1e-6; nx /= nl; ny /= nl;
        if (nx * rx + ny * ry < 0) { nx = -nx; ny = -ny; }
        p.fx += nx * areaPush; p.fy += ny * areaPush;
        // tension to the neighbours
        for (const q of [prev, next]) {
          let dx = q.x - p.x, dy = q.y - p.y, d = Math.hypot(dx, dy) || 1e-6;
          const f = kt * (d - l0) / l0;
          p.fx += dx / d * f; p.fy += dy / d * f;
        }
        // smoothness: toward the neighbours' midpoint
        p.fx += kb * ((prev.x + next.x) / 2 - p.x) / l0 * 0.5; p.fy += kb * ((prev.y + next.y) / 2 - p.y) / l0 * 0.5;
        // outside the blob's own nuclei (a position fix, so the ring can never cut through them)
        for (const k of b.nuclei) {
          let dx = p.x - k.x, dy = p.y - k.y, d = Math.hypot(dx, dy) || 1e-6;
          const lim = k.r + l0 * 0.4;
          if (d < lim) {
            dx /= d; dy /= d;
            p.x = k.x + dx * lim; p.y = k.y + dy * lim;
            const vn = p.vx * dx + p.vy * dy; if (vn < 0) { p.vx -= vn * dx; p.vy -= vn * dy; }
            k.fx -= dx * 2000 * P.contact * (lim - d) / lim; k.fy -= dy * 2000 * P.contact * (lim - d) / lim;
          }
        }
      }
      // several nuclei in one ring: a short pull to each other (the strong force), a weak one to the centre, kept apart by contact
      if (b.nuclei.length > 1) {
        const pull = P.nucleiPull * 800, centre = P.nucleiPull * 600;
        for (const k of b.nuclei) {
          const dx = b.cx - k.x, dy = b.cy - k.y, d = Math.hypot(dx, dy);
          if (d > 1) { k.fx += dx / d * centre; k.fy += dy / d * centre; }
        }
        for (let i = 0; i < b.nuclei.length; i++) for (let j = i + 1; j < b.nuclei.length; j++) {
          const a = b.nuclei[i], c = b.nuclei[j], dx = c.x - a.x, dy = c.y - a.y, d = Math.hypot(dx, dy) || 1e-6;
          if (d < (a.r + c.r) * 2.2) { a.fx += dx / d * pull; a.fy += dy / d * pull; c.fx -= dx / d * pull; c.fy -= dy / d * pull; }
          nucleusContact(a, c, P);
        }
      }
    }

    // contact between rings of different blobs, and between rings and other blobs' nuclei (broad phase: bounding boxes)
    const dc0 = Math.max(8, TAU * P.radius / P.segments) * 0.7, kc = 8000 * P.contact;
    const touching = [], touchD = dc0 * (1 - P.fuseAt);
    for (let i = 0; i < pairs.length; i += 2) {
      const A = pairs[i], B = pairs[i + 1];
      {
        if (A.minx > B.maxx + dc0 || B.minx > A.maxx + dc0 || A.miny > B.maxy + dc0 || B.miny > A.maxy + dc0) continue;
        if (A.bridge && A.bridge === B.bridge) { bridgePull(A, B, dc0); bridgePull(B, A, dc0); continue; }   // reaching into each other
        const hA = isHard(A), hB = isHard(B);
        const touched = hA || hB ? false : ringContact(A, B, dc0, kc, touchD) | ringContact(B, A, dc0, kc, touchD);
        if (!hA) ringVsNuclei(A, B, dc0, kc); if (!hB) ringVsNuclei(B, A, dc0, kc);
        // bare discs and clenched neutrons are hard: two of them are pushed apart half each; one against a live ring's
        // disc moves by the whole overlap
        const moveA = isHard(A), moveB = isHard(B);
        for (const ka of A.nuclei) for (const kb of B.nuclei) hardContact(A, ka, B, kb, P, moveA, moveB);
        if (touched) touching.push([A, B]);
      }
    }

    // the heat; a strained shell shivers; a lone nucleus hands the forces on it to its ring (it rides at the ring's centre, below)
    const jit = P.jitter * Math.sqrt(dt) * 10, trem = P.tremble * 6000;
    for (const b of blobs) {
      if (jit) { const ax = rnd(-jit, jit), ay = rnd(-jit, jit); bodyForce(b, ax * 60, ay * 60); }
      b.strain = strainOf(b);
      if (trem && b.strain > 0.5) { const a = trem * ((b.strain - 0.5) * 2) ** 2; for (const p of b.nodes) { p.fx += rnd(-a, a); p.fy += rnd(-a, a); } }
      if (b.nodes.length && b.nuclei.length === 1) {
        const k = b.nuclei[0], n = b.nodes.length;
        for (const p of b.nodes) { p.fx += k.fx / n; p.fy += k.fy / n; }
        k.fx = 0; k.fy = 0;
      }
    }

    // integrate: wobble damped against the blob's own travel, the travel damped a little (drift)
    const gi = Math.min(0.95, P.damping * 10 * dt), gd = Math.min(0.95, P.drift * dt * 10);
    for (const b of blobs) {
      const vx = b.vx * (1 - gd), vy = b.vy * (1 - gd);
      for (const p of b.nodes) {
        p.vx += p.fx * dt; p.vy += p.fy * dt;
        p.vx = vx + (p.vx - vx) * (1 - gi); p.vy = vy + (p.vy - vy) * (1 - gi);
        p.x += p.vx * dt; p.y += p.vy * dt;
      }
      for (const p of b.nodes) wallClamp(p, half);
      if (b.nodes.length && b.nuclei.length === 1) {   // rides at the ring's centre
        let cx = 0, cy = 0; for (const p of b.nodes) { cx += p.x; cy += p.y; }
        const k = b.nuclei[0], n = b.nodes.length;
        k.vx = (cx / n - k.x) / dt; k.vy = (cy / n - k.y) / dt; k.x = cx / n; k.y = cy / n;
        continue;
      }
      for (const k of b.nuclei) {
        k.vx += k.fx * dt; k.vy += k.fy * dt;
        const g = b.nodes.length ? Math.min(0.95, (P.damping + 1) * 10 * dt) : Math.min(0.95, (P.damping * 3 + 0.5) * dt);
        k.vx = vx + (k.vx - vx) * (1 - g); k.vy = vy + (k.vy - vy) * (1 - g);
        k.x += k.vx * dt; k.y += k.vy * dt;
        wallClamp(k, half - k.r);
        if (b.nodes.length && !b.hug) {   // inside a settled ring, always
          const dx = k.x - b.cx, dy = k.y - b.cy, d = Math.hypot(dx, dy) || 1e-6, lim = b.rm - k.r * 0.9;
          if (d > lim && lim > 0) { k.x = b.cx + dx / d * lim; k.y = b.cy + dy / d * lim; }
        }
      }
    }

    // bare discs (popped nuclei, neutrons) are hard: a few passes push every overlapping pair apart; if the crowd is
    // jammed (overlap left after that), the box can't shrink past this size
    let residual = 0, rcMax = 1;
    for (let pass = 0; pass < 8; pass++) {
      residual = 0;
      for (let i = 0; i < pairs.length; i += 2) {
        const A = pairs[i], B = pairs[i + 1];
        if (!isHard(A) || !isHard(B)) continue;
        const o = hardContact(A, A.nuclei[0], B, B.nuclei[0], P, true, true);
        if (o > residual) residual = o;
        if (A.nuclei[0].r > rcMax) rcMax = A.nuclei[0].r;
      }
      for (const b of blobs) if (isHard(b)) {
        const k = b.nuclei[0], x = k.x, y = k.y; wallClamp(k, half - k.r);
        if (b.nodes.length && (k.x !== x || k.y !== y)) for (const p of b.nodes) { p.x += k.x - x; p.y += k.y - y; }
      }
    }
    for (const b of blobs) if (b.state === "grey" && b.nodes.length) {   // the clenched ring: a circle riding on its disc
      const k = b.nuclei[0], n = b.nodes.length;
      for (let i = 0; i < n; i++) { const p = b.nodes[i], a = (i / n) * TAU; p.x = k.x + Math.cos(a) * b.R; p.y = k.y + Math.sin(a) * b.R; p.vx = k.vx; p.vy = k.vy; }
    }
    const jam = residual > rcMax * 0.06;   // real overlap left after eight passes: the discs don't fit
    S.jam = jam ? 1 : 0;
    if (jam) S.floor = Math.max(S.floor, S.box); else S.floor *= 1 - 0.1 * dt;
    // a ring that folded over itself (a tangle, its area gone or negative) is laid round again
    for (const b of blobs) {
      if (!b.nodes.length || !(b.sq > 0.85)) continue;
      const n = b.nodes.length, r = b.R * 0.6;
      for (let i = 0; i < n; i++) { const p = b.nodes[i], a = (i / n) * TAU; p.x = b.cx + Math.cos(a) * r; p.y = b.cy + Math.sin(a) * r; p.vx = b.vx; p.vy = b.vy; p.rt = b.R; }
      b.sq = 1 - restArea(r, n) / b.A0;
    }
    // events
    for (const b of blobs) {
      if (b.state !== "intact") continue;
      if (b.sq > S.maxSq) S.maxSq = b.sq;
      const thr = thresholdOf(b);
      if (!onScreen(b)) continue;
      if (S.mode === 1 && b.sq > thr) pop(b);
      else if (S.mode === 3 && b.sq > thr) breakBlob(b);
    }
    if (S.mode === 2) {
      const free = b => !b.bridge && b.state === "intact" && onScreen(b);
      const groups = [];
      if (P.fourAtOnce) {
        // four lone nuclei in one touching cluster: the four nearest the most-touched one
        const adj = new Map();
        for (const [A, B] of touching) {
          if (!free(A) || !free(B) || A.q !== 1 || B.q !== 1) continue;
          (adj.get(A) || adj.set(A, []).get(A)).push(B); (adj.get(B) || adj.set(B, []).get(B)).push(A);
        }
        const taken = new Set();
        for (const [seed, nb] of [...adj.entries()].sort((a, b) => b[1].length - a[1].length)) {
          if (taken.has(seed)) continue;
          const group = [seed], queue = [seed];
          while (queue.length && group.length < 4) {
            const c = queue.shift();
            for (const n of adj.get(c)) if (!taken.has(n) && !group.includes(n)) { group.push(n); queue.push(n); if (group.length === 4) break; }
          }
          if (group.length === 4) { for (const g of group) taken.add(g); groups.push(group); }
        }
      } else {
        for (const [A, B] of touching) {
          if (!free(A) || !free(B)) continue;
          if (P.maxNuclei < 13 && A.q + B.q > P.maxNuclei) continue;
          groups.push([A, B]);
        }
      }
      for (const g of groups) {
        if (g.some(b => b.bridge)) continue;
        if (P.bridgeTime <= 0) { fuseMany(g); continue; }
        const id = S.nextId++; let x = 0, y = 0;
        for (const b of g) { b.bridge = id; x += b.cx; y += b.cy; }
        S.bridges.push({ members: g, t: 0, x: x / g.length, y: y / g.length });
      }
      for (let i = S.bridges.length - 1; i >= 0; i--) {
        const br = S.bridges[i]; br.t += dt;
        if (!br.members.every(b => blobs.includes(b))) { S.bridges.splice(i, 1); continue; }
        let x = 0, y = 0; for (const b of br.members) { x += b.cx; y += b.cy; } br.x = x / br.members.length; br.y = y / br.members.length;
        if (br.t >= P.bridgeTime) { fuseMany(br.members); S.bridges.splice(i, 1); }
      }
      // the weak force: a scheduled proton turns into a neutron, with a flash and a neutrino that flies straight out
      for (const b of blobs) for (const k of b.nuclei) {
        if (!k.turnAt || k.grey || S.t < k.turnAt) continue;
        k.grey = true; k.greyAt = S.t; b.charge--;
        S.flashes.push({ x: k.x, y: k.y, r0: k.r * 0.5, r1: k.r * 2.2, t: 0, dur: 0.35, color: "140,255,170" });   // the weak force: green
        const a = rnd(0, TAU), v = 2400;
        S.electrons.push({ x: k.x, y: k.y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, nu: true });
      }
    }
    // a torn film races round from the tear, spraying its electrons from the two rims
    for (let i = S.pops.length - 1; i >= 0; i--) {
      const o = S.pops[i]; o.t += dt;
      const n = o.pts.length, u = Math.min(1, o.t / o.dur), half = Math.floor(u * n / 2);
      const drift = P.electronSpeed * 0.12 * (1 - u);
      for (const q of o.pts) { q.x += (q.rx * drift + o.vx) * dt; q.y += (q.ry * drift + o.vy) * dt; }
      const want = Math.round(o.K * u);
      for (let side = 0; o.emitted < want; o.emitted++, side ^= 1) {
        const idx = (o.tear + (side ? half : -half) + n) % n, q = o.pts[idx];
        const tx = side ? -q.ry : q.ry, ty = side ? q.rx : -q.rx;   // along the rim's travel
        const s = P.electronSpeed * rnd(0.7, 1.3), a = P.electronBounce ? rnd(0.15, 0.55) : 0;   // straight out when they don't ricochet
        S.electrons.push({ x: q.x, y: q.y, px: q.x, py: q.y, vx: (q.rx * (1 - a) + tx * a) * s + o.vx, vy: (q.ry * (1 - a) + ty * a) * s + o.vy });
      }
      if (u >= 1) S.pops.splice(i, 1);
    }
    // the pieces of a shattered ring fly apart and fade
    for (let i = S.frags.length - 1; i >= 0; i--) {
      const f = S.frags[i]; f.t += dt;
      const c = Math.cos(f.w * dt), sn = Math.sin(f.w * dt);
      f.cx += f.vx * dt; f.cy += f.vy * dt; f.vx *= 1 - 2 * dt; f.vy *= 1 - 2 * dt;
      for (const q of f.pts) { const x = q.x * c - q.y * sn, y = q.x * sn + q.y * c; q.x = x; q.y = y; }
      if (f.t > f.dur) S.frags.splice(i, 1);
    }
    // merged rings round themselves off: every node's target radius relaxes toward the blob's
    for (const b of blobs) if (b.hug) {
      let left = 0; const k = 1 - Math.exp(-P.hugRate * 1.5 * dt);
      for (const p of b.nodes) { p.rt += (b.R - p.rt) * k; if (Math.abs(p.rt - b.R) > 0.5) left++; }
      if (!left) b.hug = false;
    }

    // electrons: straight flights, free to leave the box (gone once well outside it), bouncing off each other and off whole circles
    const gone = Math.max(half, Math.max(S.W, S.H) / 2) * 1.3 + 200;
    for (let i = S.electrons.length - 1; i >= 0; i--) {
      const el = S.electrons[i];
      el.x += el.vx * dt; el.y += el.vy * dt;
      if (Math.abs(el.x) > gone || Math.abs(el.y) > gone) S.electrons.splice(i, 1);
    }
    if (P.electronBounce && S.electrons.length > 1) {   // equal masses: a head-on exchange of the velocity along the line between them
      const rc = P.radius * P.electronSize, cs = rc * 2, cells = new Map();
      for (const el of S.electrons) { const k = Math.floor(el.x / cs) * 65536 + Math.floor(el.y / cs); const c = cells.get(k); if (c) c.push(el); else cells.set(k, [el]); }
      for (const el of S.electrons) {
        const ix = Math.floor(el.x / cs), iy = Math.floor(el.y / cs);
        for (let ox = -1; ox <= 1; ox++) for (let oy = -1; oy <= 1; oy++) {
          const c = cells.get((ix + ox) * 65536 + iy + oy); if (!c) continue;
          for (const o of c) {
            if (o === el || o.nu || el.nu || o.x < el.x || (o.x === el.x && o.y <= el.y)) continue;   // each pair once
            let dx = o.x - el.x, dy = o.y - el.y; const d2 = dx * dx + dy * dy;
            if (d2 >= 4 * rc * rc || d2 === 0) continue;
            const d = Math.sqrt(d2); dx /= d; dy /= d;
            const vn = (o.vx - el.vx) * dx + (o.vy - el.vy) * dy;
            if (vn < 0) { el.vx += vn * dx; el.vy += vn * dy; o.vx -= vn * dx; o.vy -= vn * dy; }
            const push = (2 * rc - d) / 2; el.x -= dx * push; el.y -= dy * push; o.x += dx * push; o.y += dy * push;
          }
        }
      }
    }
    if (P.electronBounce && S.electrons.length) for (const b of blobs) {
      if (!b.nodes.length) continue;
      const r = b.rm * 0.97;
      for (const el of S.electrons) {
        if (el.nu || el.x < b.minx || el.x > b.maxx || el.y < b.miny || el.y > b.maxy) continue;
        let dx = el.x - b.cx, dy = el.y - b.cy, d = Math.hypot(dx, dy);
        if (d >= r || d < 1e-6) continue;
        dx /= d; dy /= d;
        const vn = el.vx * dx + el.vy * dy;
        if (vn < 0) {
          el.vx -= 2 * vn * dx; el.vy -= 2 * vn * dy;
          const kick = 2 * vn * P.electronPush;   // the shell takes the recoil
          for (const p of b.nodes) { p.vx += dx * kick; p.vy += dy * kick; }
        }
        el.x = b.cx + dx * r; el.y = b.cy + dy * r;
      }
    }
    for (let i = S.flashes.length - 1; i >= 0; i--) { const f = S.flashes[i]; f.t += dt; if (f.t > f.dur) S.flashes.splice(i, 1); }
    // the captured electrons: beside their ring until it clenches, then into the proton in a third of a second
    for (let i = S.captures.length - 1; i >= 0; i--) {
      const c = S.captures[i], b = c.b, k = b.nuclei[0];
      if (c.fall < 0) {
        c.a += c.w * dt; const r = (b.rm || b.R) * c.d;
        c.x = b.cx + Math.cos(c.a) * r; c.y = b.cy + Math.sin(c.a) * r;
        if (b.state === "grey") { c.fall = 0; c.x0 = c.x - k.x; c.y0 = c.y - k.y; }
      } else {
        c.fall += dt;
        const u = Math.min(1, c.fall / 0.33), e = u * u;
        c.x = k.x + c.x0 * (1 - e); c.y = k.y + c.y0 * (1 - e);
        if (u >= 1) {
          S.flashes.push({ x: k.x, y: k.y, r0: k.r * 0.4, r1: k.r * 1.6, t: 0, dur: 0.3, color: "150,210,255" });
          const a = rnd(0, TAU), v = 2400;
          S.electrons.push({ x: k.x, y: k.y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, nu: true });
          S.captures.splice(i, 1);
        }
      }
    }
    S.t += dt;
  }

  function relieve() { S.shrinkT = Math.max(0, S.shrinkT - S.P.relief); }
  function bodyForce(b, ax, ay) { for (const p of b.nodes) { p.fx += ax; p.fy += ay; } for (const k of b.nuclei) { k.fx += ax; k.fy += ay; } }
  function wallClamp(p, half) {   // the box's walls are hard
    if (p.x < -half) { p.x = -half; if (p.vx < 0) p.vx = 0; } else if (p.x > half) { p.x = half; if (p.vx > 0) p.vx = 0; }
    if (p.y < -half) { p.y = -half; if (p.vy < 0) p.vy = 0; } else if (p.y > half) { p.y = half; if (p.vy > 0) p.vy = 0; }
  }
  // A's nodes against B's segments: a push apart within the contact distance, shared by the segment's ends.
  // Returns whether any node pressed in deeper than touchD (two rings touching, for fusion).
  function ringContact(A, B, dc, kc, touchD) {
    let touched = false;
    const nb = B.nodes.length, dc2 = dc * dc;
    for (const p of A.nodes) {
      if (p.x < B.minx - dc || p.x > B.maxx + dc || p.y < B.miny - dc || p.y > B.maxy + dc) continue;
      for (let j = 0; j < nb; j++) {
        const q = B.nodes[j], r = B.nodes[(j + 1) % nb];
        const ex = r.x - q.x, ey = r.y - q.y, el2 = ex * ex + ey * ey || 1e-9;
        let t = ((p.x - q.x) * ex + (p.y - q.y) * ey) / el2; t = t < 0 ? 0 : t > 1 ? 1 : t;
        const dx = p.x - (q.x + ex * t), dy = p.y - (q.y + ey * t), d2 = dx * dx + dy * dy;
        if (d2 >= dc2) continue;
        const d = Math.sqrt(d2) || 1e-6, f = kc * (dc - d) / dc, fx = dx / d * f, fy = dy / d * f;
        p.fx += fx; p.fy += fy;
        q.fx -= fx * (1 - t); q.fy -= fy * (1 - t); r.fx -= fx * t; r.fy -= fy * t;
        if (d < touchD) touched = true;
      }
    }
    return touched;
  }
  // Two rings about to join: each node near the other ring is drawn to its nearest point on it, so the two lines
  // bend into each other and open a neck (a liquid bridge) before they become one.
  function bridgePull(A, B, dc) {
    const reachD = dc * 4, nb = B.nodes.length;
    for (const p of A.nodes) {
      if (p.x < B.minx - reachD || p.x > B.maxx + reachD || p.y < B.miny - reachD || p.y > B.maxy + reachD) continue;
      let best = reachD * reachD, bx = 0, by = 0;
      for (let j = 0; j < nb; j++) { const q = B.nodes[j], dx = q.x - p.x, dy = q.y - p.y, d2 = dx * dx + dy * dy; if (d2 < best) { best = d2; bx = dx; by = dy; } }
      if (best < reachD * reachD) { const d = Math.sqrt(best) || 1e-6, f = 5000 * (1 - d / reachD) + 1500; p.fx += bx / d * f; p.fy += by / d * f; }
    }
  }
  function ringVsNuclei(A, B, dc, kc) {       // A's ring stays outside B's nuclei: pushed, and never cutting into them
    for (const k of B.nuclei) {
      const lim = k.r + dc * 0.5, hardLim = k.r + dc * 0.15;
      if (k.x + lim < A.minx || k.x - lim > A.maxx || k.y + lim < A.miny || k.y - lim > A.maxy) continue;
      for (const p of A.nodes) {
        let dx = p.x - k.x, dy = p.y - k.y; const d2 = dx * dx + dy * dy;
        if (d2 >= lim * lim) continue;
        const d = Math.sqrt(d2) || 1e-6, f = kc * (lim - d) / lim;
        p.fx += dx / d * f; p.fy += dy / d * f; k.fx -= dx / d * f; k.fy -= dy / d * f;
        if (d < hardLim) { dx /= d; dy /= d; p.x = k.x + dx * hardLim; p.y = k.y + dy * hardLim; const vn = p.vx * dx + p.vy * dy; if (vn < 0) { p.vx -= vn * dx; p.vy -= vn * dy; } }
      }
    }
  }
  // a blob that behaves as one hard disc: a bare nucleus, or a clenched neutron whose ring just rides along
  const isHard = (b) => !b.nodes.length || b.state === "grey";
  // a disc contact whose moves carry the blob's ring along
  function hardContact(A, ka, B, kb, P, moveA, moveB) {
    const ax = ka.x, ay = ka.y, bx = kb.x, by = kb.y;
    const o = nucleusContact(ka, kb, P, moveA, moveB);
    if (moveA && A.nodes.length) for (const p of A.nodes) { p.x += ka.x - ax; p.y += ka.y - ay; }
    if (moveB && B.nodes.length) for (const p of B.nodes) { p.x += kb.x - bx; p.y += kb.y - by; }
    return o;
  }
  function nucleusContact(a, b, P, moveA, moveB) {
    let dx = b.x - a.x, dy = b.y - a.y; const lim = a.r + b.r, d2 = dx * dx + dy * dy;
    if (d2 >= lim * lim || lim <= 0) return 0;
    const d = Math.sqrt(d2) || 1e-6, f = 40000 * P.contact * (lim - d) / lim;
    a.fx -= dx / d * f; a.fy -= dy / d * f; b.fx += dx / d * f; b.fy += dy / d * f;
    if (moveA || moveB) {   // the movable discs are pushed apart, and stop closing
      dx /= d; dy /= d; const o = lim - d, wa = moveA && moveB ? 0.5 : moveA ? 1 : 0, wb = moveA && moveB ? 0.5 : moveB ? 1 : 0;
      a.x -= dx * o * wa; a.y -= dy * o * wa; b.x += dx * o * wb; b.y += dy * o * wb;
      const vn = (b.vx - a.vx) * dx + (b.vy - a.vy) * dy;
      if (vn < 0) { a.vx += vn * dx * wa; a.vy += vn * dy * wa; b.vx -= vn * dx * wb; b.vy -= vn * dy * wb; }
    }
    return lim - d;
  }

  // ---------- the three events ----------
  // The film tears at its most squeezed point; the two rims race round the ring away from the tear (a burst soap
  // bubble), spraying the electrons as they go; the bare nucleus stays.
  function pop(b) {
    const P = S.P, n = b.nodes.length;
    let tear = 0, rmin = Infinity;
    const pts = b.nodes.map((p, i) => {
      let rx = p.x - b.cx, ry = p.y - b.cy; const r = Math.hypot(rx, ry) || 1e-6;
      if (r < rmin) { rmin = r; tear = i; }
      return { x: p.x, y: p.y, rx: rx / r, ry: ry / r };
    });
    S.pops.push({ pts, tear, t: 0, dur: P.popTime, vx: b.vx, vy: b.vy, K: P.electrons, emitted: 0 });
    S.flashes.push({ x: pts[tear].x, y: pts[tear].y, r0: 0, r1: b.rm * 0.5, t: 0, dur: 0.25, color: "200,230,255" });
    b.nodes = []; b.state = "popped";
    const k = b.nuclei[0]; k.x = b.cx; k.y = b.cy; k.vx = b.vx; k.vy = b.vy;
    S.events.pop++; relieve();
  }

  // The stiff ring shatters into arcs that fly apart and fade; the disc flashes and turns grey, its push gone. Or, by the
  // switch, the ring clenches: it snaps down to the grey disc's size and stays as a compact hard shell (the author,
  // 2026-11-09: the weak force isn't gone, so the ring shouldn't vanish).
  function breakBlob(b) {
    const P = S.P, n = b.nodes.length, pieces = 3 + Math.floor(rnd(0, 4));
    if (P.contract) {
      // the grey disc's size, and a ring hugging it a tenth larger: a compact outline, not a cell
      const k = b.nuclei[0], R0 = b.R, rg = (P.greyUniform ? P.radius : b.R) * P.nucleus * P.greySize, Rg = rg * 1.1, f = Rg / R0;
      for (const p of b.nodes) { p.x = b.cx + (p.x - b.cx) * f; p.y = b.cy + (p.y - b.cy) * f; p.rt = Rg; p.vx = b.vx; p.vy = b.vy; }
      b.R = Rg; b.A0 = restArea(Rg, n); b.kfac = 2;
      k.r = rg;
      S.flashes.push({ x: b.cx, y: b.cy, r0: R0 * 1.1, r1: Rg * 0.95, t: 0, dur: 0.25, color: "140,255,170" });   // a ring closing in
      b.state = "grey"; b.q = 0; b.charge = 0; b.broke = S.t;
      S.events.break++; relieve();
      return;
    }
    const cuts = []; for (let i = 0; i < pieces; i++) cuts.push(Math.floor(rnd(0, n))); cuts.sort((a, c) => a - c);
    for (let i = 0; i < pieces; i++) {
      const from = cuts[i], to = cuts[(i + 1) % pieces], len = ((to - from) + n) % n || n;
      if (len < 2) continue;
      const pts = []; let mx = 0, my = 0;
      for (let j = 0; j <= len; j++) { const p = b.nodes[(from + j) % n]; pts.push({ x: p.x, y: p.y }); mx += p.x; my += p.y; }
      mx /= pts.length; my /= pts.length;
      for (const q of pts) { q.x -= mx; q.y -= my; }
      let dx = mx - b.cx, dy = my - b.cy; const d = Math.hypot(dx, dy) || 1e-6; dx /= d; dy /= d;
      const s = P.shatter * rnd(120, 260);
      S.frags.push({ pts, cx: mx, cy: my, vx: dx * s + b.vx, vy: dy * s + b.vy, w: P.shatter * rnd(-4, 4), t: 0, dur: 0.7, color: COL[3] });
    }
    S.flashes.push({ x: b.cx, y: b.cy, r0: b.rm * 0.9, r1: b.rm * 1.3, t: 0, dur: 0.3, color: "140,255,170" });
    b.nodes = []; b.state = "grey"; b.q = 0; b.charge = 0; b.broke = S.t;
    const k = b.nuclei[0]; k.x = b.cx; k.y = b.cy; k.vx = b.vx; k.vy = b.vy; k.r = (P.greyUniform ? P.radius : b.R) * P.nucleus * P.greySize;
    S.events.break++; relieve();
  }

  // Two rings touch: one ring round both, built by casting rays from the new centre to the farthest edge of either
  // polygon (the union), its nodes' target radius relaxing toward the circle of the combined area.
  function fuseMany(members) {
    const P = S.P;
    let m = 0, cx = 0, cy = 0, vx = 0, vy = 0, R2 = 0;
    for (const b of members) { m += b.q; cx += b.cx * b.q; cy += b.cy * b.q; vx += b.vx * b.q; vy += b.vy * b.q; R2 += b.R * b.R; }
    cx /= m; cy /= m; vx /= m; vy /= m;
    const R = Math.sqrt(R2);
    const M = Math.max(P.segments, Math.round(P.segments * R / P.radius));
    const polys = members.map(b => b.nodes);
    const nodes = [], rads = [];
    for (let i = 0; i < M; i++) {
      const a = (i / M) * TAU, dx = Math.cos(a), dy = Math.sin(a);
      let best = 0;
      for (const poly of polys) {
        for (let j = 0, n = poly.length; j < n; j++) {
          const p = poly[j], q = poly[(j + 1) % n];
          // ray (cx,cy)+t(dx,dy) against segment p→q
          const ex = q.x - p.x, ey = q.y - p.y, den = dx * ey - dy * ex;
          if (Math.abs(den) < 1e-9) continue;
          const wx = p.x - cx, wy = p.y - cy;
          const t = (wx * ey - wy * ex) / den, s = (wx * dy - wy * dx) / den;
          if (t > best && s >= 0 && s <= 1) best = t;
        }
      }
      rads.push(clamp(best, R * 0.08, R * 2.6));
    }
    for (let i = 0; i < M; i++) {   // a 3-tap smoothing, so no spike from a bent segment
      const r = (rads[(i + M - 1) % M] + 2 * rads[i] + rads[(i + 1) % M]) / 4, a = (i / M) * TAU;
      nodes.push({ x: cx + Math.cos(a) * r, y: cy + Math.sin(a) * r, vx, vy, rt: r, fx: 0, fy: 0 });
    }
    const nuclei = [].concat(...members.map(b => b.nuclei));
    let charge = 0; for (const k of nuclei) if (!k.grey) charge++;
    const b = {
      id: S.nextId++, kind: 2, state: "intact", R, A0: restArea(R, M), M, nodes, nuclei,
      cx, cy, vx, vy, q: m, charge, mass: m, sq: 0, kfac: 1, grey: 0, hug: true, born: S.t, u: random() * 2 - 1,
      minx: 0, miny: 0, maxx: 0, maxy: 0,
    };
    // helium: once four nuclei share a ring, the weak force turns some of them grey, one after another
    if (m >= 4) {
      const reds = nuclei.filter(k => !k.grey && !k.turnAt), want = Math.min(P.neutrons, reds.length) - nuclei.filter(k => k.grey || k.turnAt).length;
      for (let i = 0; i < want; i++) { const j = Math.floor(rnd(0, reds.length)); reds.splice(j, 1)[0].turnAt = S.t + 0.5 + i * 0.45; }
    }
    for (const k of b.nuclei) {   // every nucleus starts inside the new ring
      k.vx = vx; k.vy = vy;
      const dx = k.x - cx, dy = k.y - cy, d = Math.hypot(dx, dy) || 1e-6, i = Math.round(Math.atan2(dy, dx) / TAU * M + M) % M;
      const lim = rads[i] - k.r * 1.1;
      if (d > lim && lim > 0) { k.x = cx + dx / d * lim; k.y = cy + dy / d * lim; }
    }
    for (const o of members) S.blobs.splice(S.blobs.indexOf(o), 1);
    S.blobs.push(b);
    S.flashes.push({ x: cx, y: cy, r0: R * 0.2, r1: R * 0.9, t: 0, dur: 0.4, color: "255,213,74" });
    S.events.fuse++; relieve();
  }


  // ---------- drawing ----------
  function ringPath(nodes) {
    const n = nodes.length;
    ctx.beginPath();
    let p = nodes[n - 1], q = nodes[0];
    ctx.moveTo((p.x + q.x) / 2, (p.y + q.y) / 2);
    for (let i = 0; i < n; i++) { p = nodes[i]; q = nodes[(i + 1) % n]; ctx.quadraticCurveTo(p.x, p.y, (p.x + q.x) / 2, (p.y + q.y) / 2); }
    ctx.closePath();
  }

  function drawScene() {
    const P = S.P, cw = canvas.width, ch = canvas.height;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = "#000"; ctx.fillRect(0, 0, cw, ch);
    // the view: the screen fills the canvas, or the whole box fits in it with a margin
    let scale;
    if (S.view === "screen") scale = cw / S.W;
    else scale = Math.min(cw, ch) / (Math.max(S.box, Math.max(S.W, S.H)) * 1.06);
    ctx.setTransform(scale, 0, 0, scale, cw / 2, ch / 2);
    const lw = P.lineWidth * dpr / scale;

    if (S.view === "box") {   // the screen's frame
      ctx.strokeStyle = "rgba(220,228,239,0.35)"; ctx.lineWidth = lw * 0.6; ctx.setLineDash([lw * 3, lw * 3]);
      ctx.strokeRect(-S.W / 2, -S.H / 2, S.W, S.H); ctx.setLineDash([]);
    }
    if (P.walls) {
      const h = S.box / 2;
      ctx.strokeStyle = "rgba(123,135,154,0.55)"; ctx.lineWidth = lw * 0.8;
      ctx.strokeRect(-h, -h, S.box, S.box);
    }

    // electrons: plain dots
    if (S.electrons.length) {
      const er = Math.max(1.2 * lw, P.radius * P.electronSize);
      ctx.fillStyle = "#b3e5fc"; ctx.beginPath();
      for (const e of S.electrons) if (!e.nu) { ctx.moveTo(e.x + er, e.y); ctx.arc(e.x, e.y, er, 0, TAU); }
      ctx.fill();
      ctx.fillStyle = "#ffffff"; ctx.beginPath();   // neutrinos: tiny, white, straight through everything
      for (const e of S.electrons) if (e.nu) { ctx.moveTo(e.x + er * 0.6, e.y); ctx.arc(e.x, e.y, er * 0.6, 0, TAU); }
      ctx.fill();
    }

    // nuclei: a broken one flashes white, then greys
    for (const b of S.blobs) {
      const fill = "#ff3b30";
      for (const k of b.nuclei) {
        const grey = k.grey || b.state === "grey", since = k.grey ? k.greyAt : b.broke;
        const flash = grey ? 1 - clamp((S.t - since - 0.1) / 0.35, 0, 1) : 0;   // white just after the change, fading
        const pic = grey ? "neutron" : "proton";
        if (P.pictures && picReady(pic)) {
          const d = k.r * 2 / 0.78;
          ctx.save(); ctx.translate(k.x, k.y); ctx.rotate(k.rot); ctx.drawImage(PICS[pic], -d / 2, -d / 2, d, d); ctx.restore();
          if (flash > 0) { ctx.beginPath(); ctx.arc(k.x, k.y, k.r, 0, TAU); ctx.fillStyle = `rgba(255,255,255,${flash})`; ctx.fill(); }
          continue;
        }
        ctx.beginPath(); ctx.arc(k.x, k.y, k.r, 0, TAU);
        if (grey) { const u = 1 - flash; ctx.fillStyle = `rgb(${Math.round(255 - (255 - 138) * u)},${Math.round(255 - (255 - 143) * u)},${Math.round(255 - (255 - 153) * u)})`; }
        else ctx.fillStyle = fill;
        ctx.fill();
        if (b.state === "popped" && P.glow > 0) { ctx.strokeStyle = "rgba(255,59,48,0.35)"; ctx.lineWidth = lw * 1.5; ctx.stroke(); }
      }
    }
    // rings: a strained shell whitens (and a film thins) toward its threshold
    ctx.lineJoin = "round"; ctx.lineCap = "round";
    for (const b of S.blobs) {
      if (!b.nodes.length) continue;
      const base = COL[b.kind].split(",").map(Number), st = (b.strain || 0) ** 3;
      const col = base.map(c => Math.round(c + (255 - c) * st * 0.85)).join(",");
      const w = lw * (b.kind === 1 ? 1 - 0.45 * st : 1 + 0.3 * st);
      ringPath(b.nodes);
      if (P.fill > 0) { ctx.fillStyle = `rgba(${col},${P.fill})`; ctx.fill(); }
      if (P.glow > 0) { ctx.strokeStyle = `rgba(${col},${0.18 * P.glow + 0.25 * st})`; ctx.lineWidth = w * (1 + 3 * P.glow); ctx.stroke(); }
      ctx.strokeStyle = `rgb(${col})`; ctx.lineWidth = w; ctx.stroke();
    }
    // arrows: blue ones out of every whole shell (the push), red ones in from the screen's edge (the squeeze); each one
    // lives only while there's room for it, fading as a neighbour, a wall or a circle takes its place
    // a readable arrow at phone size: the triangle is the arrow (two thirds of the length, as wide as it is long), with
    // a short thin shaft behind it (the author, 2026-11-09: the triangle, not the base)
    const arrow = (x0, y0, x1, y1, col, a, w) => {
      if (a <= 0.01) return;
      const dx = x1 - x0, dy = y1 - y0, len = Math.hypot(dx, dy) || 1, ux = dx / len, uy = dy / len, h = len * 0.65, hw = h * 0.5;
      ctx.strokeStyle = `rgba(${col},${a})`; ctx.fillStyle = `rgba(${col},${a})`; ctx.lineWidth = w; ctx.lineCap = "round";
      ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1 - ux * h * 0.8, y1 - uy * h * 0.8); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x1 - ux * h - uy * hw, y1 - uy * h + ux * hw); ctx.lineTo(x1 - ux * h + uy * hw, y1 - uy * h - ux * hw); ctx.closePath(); ctx.fill();
    };
    const arrowLife = clamp(1 - (S.t - S.arrowT0 - P.arrowTime), 0, 1);   // gone a second after their time, counted from arrowT0
    if ((P.arrowsOut || P.arrowsIn) && arrowLife > 0) {
      const L = P.radius * P.arrowSize, hb = S.box / 2, aw = Math.max(lw * 0.9, L * 0.06);
      if (P.arrowsOut) for (const b of S.blobs) {
        if (!b.nodes.length) continue;
        if (Math.abs(b.cx) > S.W / 2 + b.rm + L || Math.abs(b.cy) > S.H / 2 + b.rm + L) continue;   // off screen anyway
        // the neighbours that could take an arrow's room
        const near = []; for (const o of S.blobs) if (o !== b) { const d = Math.hypot(o.cx - b.cx, o.cy - b.cy); if (d < b.rm + (o.rm || 0) + L * 2) near.push([o, d]); }
        for (let i = 0; i < 6; i++) {
          const ang = i / 6 * TAU + b.u * 0.5, ux = Math.cos(ang), uy = Math.sin(ang);
          const x0 = b.cx + ux * (b.rm + L * 0.2), y0 = b.cy + uy * (b.rm + L * 0.2);
          let space = Infinity;
          for (const [o, d] of near) {   // room along this direction before the neighbour's ring
            const vx = (o.cx - b.cx) / d, vy = (o.cy - b.cy) / d, cos = vx * ux + vy * uy;
            if (cos < 0.5) continue;
            const gap = d - b.rm - o.rm; if (gap < space) space = gap;
          }
          // and before the box's wall
          const tx = ux > 1e-6 ? (hb - x0) / ux : ux < -1e-6 ? (-hb - x0) / ux : Infinity, ty = uy > 1e-6 ? (hb - y0) / uy : uy < -1e-6 ? (-hb - y0) / uy : Infinity;
          space = Math.min(space, tx, ty);
          const a = clamp((space - L * 0.5) / (L * 0.7), 0, 1) * arrowLife;
          arrow(x0, y0, x0 + ux * L, y0 + uy * L, "150,205,255", a, aw);
        }
      }
      if (P.arrowsStrong) for (const b of S.blobs) {   // yellow, from just inside the ring in toward the nucleus
        if (!b.nodes.length || b.nuclei.length !== 1 || b.kind !== 2) continue;
        if (Math.abs(b.cx) > S.W / 2 + b.rm || Math.abs(b.cy) > S.H / 2 + b.rm) continue;
        const k = b.nuclei[0], gap = b.rm - k.r, Ly = Math.min(L, gap - L * 0.35);
        if (Ly < L * 0.4) continue;
        const a = clamp((gap - L * 0.6) / (L * 0.5), 0, 1) * arrowLife;
        for (let i = 0; i < 6; i++) {
          const ang = i / 6 * TAU + b.u * 0.5 + Math.PI / 6, ux = Math.cos(ang), uy = Math.sin(ang);
          const r0 = b.rm - L * 0.18;
          arrow(b.cx + ux * r0, b.cy + uy * r0, b.cx + ux * (r0 - Ly), b.cy + uy * (r0 - Ly), "255,213,74", a, aw);
        }
      }
      if (P.arrowsIn) {
        const Lr = L * 1.6, inset = 24, step = P.radius * 1.6, pts = [];
        const nx = Math.max(2, Math.round(S.W / step)), ny = Math.max(2, Math.round(S.H / step));
        for (let i = 0; i < nx; i++) { const x = -S.W / 2 + (i + 0.5) * S.W / nx; pts.push([x, -S.H / 2 + inset, 0, 1]); pts.push([x, S.H / 2 - inset, 0, -1]); }
        for (let j = 0; j < ny; j++) { const y = -S.H / 2 + (j + 0.5) * S.H / ny; pts.push([-S.W / 2 + inset, y, 1, 0]); pts.push([S.W / 2 - inset, y, -1, 0]); }
        for (const [x, y, ux, uy] of pts) {
          const mx = x + ux * Lr / 2, my = y + uy * Lr / 2;
          let room = Infinity;   // the nearest circle's edge to the arrow's middle
          for (const o of S.blobs) { const d = Math.hypot(o.cx - mx, o.cy - my) - (o.nodes.length ? o.rm : o.nuclei[0].r); if (d < room) room = d; }
          const a = clamp((room - Lr * 0.1) / (Lr * 0.5), 0, 1) * arrowLife;
          arrow(x, y, x + ux * Lr, y + uy * Lr, "255,80,70", a, aw * 1.2);
        }
      }
    }
    // torn films: the remaining arc, its ends bright
    for (const o of S.pops) {
      const n = o.pts.length, u = Math.min(1, o.t / o.dur), half = Math.floor(u * n / 2);
      const from = o.tear + half, to = o.tear - half + n;   // the film left, from one rim round the far side to the other
      const len = to - from; if (len < 1) continue;
      ctx.beginPath();
      for (let j = 0; j <= len; j++) { const q = o.pts[(from + j) % n]; if (j) ctx.lineTo(q.x, q.y); else ctx.moveTo(q.x, q.y); }
      ctx.strokeStyle = `rgba(200,230,255,${0.9 * (1 - u * 0.5)})`; ctx.lineWidth = lw * 0.7; ctx.stroke();
      ctx.fillStyle = "#ffffff";
      for (const idx of [from % n, to % n]) { const q = o.pts[idx]; ctx.beginPath(); ctx.arc(q.x, q.y, lw * 1.1, 0, TAU); ctx.fill(); }
    }
    // the bridge of two joining rings: a glow at the neck
    for (const br of S.bridges) {
      const u = Math.min(1, br.t / Math.max(0.01, P.bridgeTime));
      const g = ctx.createRadialGradient(br.x, br.y, 0, br.x, br.y, P.radius * (0.3 + 0.5 * u));
      g.addColorStop(0, `rgba(255,236,150,${0.55 * (1 - u * 0.4)})`); g.addColorStop(1, "rgba(255,213,74,0)");
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(br.x, br.y, P.radius * (0.3 + 0.5 * u), 0, TAU); ctx.fill();
    }
    // shards of broken rings
    for (const f of S.frags) {
      const u = f.t / f.dur;
      ctx.beginPath();
      f.pts.forEach((q, j) => j ? ctx.lineTo(f.cx + q.x, f.cy + q.y) : ctx.moveTo(f.cx + q.x, f.cy + q.y));
      ctx.strokeStyle = `rgba(${u < 0.15 ? "255,255,255" : f.color},${(1 - u) * 1.1})`; ctx.lineWidth = lw * (1 + 0.3 * (1 - u)); ctx.stroke();
    }
    // flashes
    // the electrons waiting to be captured: blue glowing dots
    if (S.captures.length) {
      const re = P.radius * 0.2;
      for (const c of S.captures) {
        if (Math.abs(c.x) > S.W / 2 + re * 3 || Math.abs(c.y) > S.H / 2 + re * 3) continue;
        const g = ctx.createRadialGradient(c.x, c.y, 0, c.x, c.y, re * 2.6);
        g.addColorStop(0, "rgba(220,240,255,1)"); g.addColorStop(0.3, "rgba(120,190,255,0.95)"); g.addColorStop(0.55, "rgba(79,163,255,0.35)"); g.addColorStop(1, "rgba(79,163,255,0)");
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(c.x, c.y, re * 2.6, 0, TAU); ctx.fill();
      }
    }
    for (const f of S.flashes) {
      const u = f.t / f.dur, r = f.r0 + (f.r1 - f.r0) * u;
      ctx.beginPath(); ctx.arc(f.x, f.y, r, 0, TAU);
      ctx.strokeStyle = `rgba(${f.color},${(1 - u) * 0.9})`; ctx.lineWidth = lw * (2.5 - 2 * u); ctx.stroke();
    }

    // readout
    if (P.hud) {
      let onscreen = 0, intact = 0, area = 0;
      for (const b of S.blobs) {
        if (Math.abs(b.cx) < S.W / 2 && Math.abs(b.cy) < S.H / 2) onscreen++;
        if (b.state === "intact") intact++;
        area += b.nodes.length ? Math.max(b.A || 0, 0) : Math.PI * b.nuclei[0].r ** 2;
      }
      const pack = area / (S.box * S.box);
      const ev = S.mode === 1 ? `popped <b>${S.events.pop}</b>` : S.mode === 2 ? `fused <b>${S.events.fuse}</b>` : `broken <b>${S.events.break}</b>`;
      S.hudText = `t <b>${S.t.toFixed(1)}s</b>  box <b>${(S.box / Math.max(S.W, S.H)).toFixed(2)}×</b>${S.jam ? " <b>jammed</b>" : ""}  packing <b>${Math.round(pack * 100)}%</b>\n` +
        `on screen <b>${onscreen}</b>  whole <b>${intact}</b>/${S.blobs.length}  ${ev}\n` +
        `squeeze now <b>${Math.round(Math.max(0, ...S.blobs.map(b => b.state === "intact" ? b.sq : 0)) * 100)}%</b>  peak <b>${Math.round(S.maxSq * 100)}%</b>  ${S.fps | 0} fps`;
    } else S.hudText = "";
  }

  // the whole frame onto ctx, w × h device pixels, `pixelRatio` of them to a CSS pixel (line widths are in CSS pixels)
  function draw(c, w, h, pixelRatio = 1) { ctx = c; canvas.width = w; canvas.height = h; dpr = pixelRatio; drawScene(); }
  return { S, build, step, draw };
}
