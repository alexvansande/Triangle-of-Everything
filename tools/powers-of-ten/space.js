// tools/powers-of-ten/space.js — the code-drawn top of the zoom, one 3D scene
// seen straight on (orthographic) by a camera that turns from looking down on
// the tree, to the ecliptic, to the Galaxy, to the supergalactic plane:
// the Moon's orbit, the planets (positions for 2026-10-29), the Kuiper belt,
// the Oort cloud (a model: it's never been seen), the stars (Hipparcos and
// Gaia, tools/sky-points), the Milky Way (a picture for now), the Local Group,
// and the galaxies around us (2MRS) coloured by which great attractor they
// flow towards — a rough Laniakea, from a few point masses, not Cosmicflows.
import {
  ramp, win, rng, gauss, add, sub, mul, dot, lb, AU, LY, KPC, MPC, R_EARTH,
  PLANETS, SUN, EARTH_C, MOON, eclAxes, eclToGal,
} from "./math.js";
import { image } from "./micro.js";

const icon = (name) => image(`/content/icons/${name}.webp`);
const ready = (img) => img.complete && img.naturalWidth > 0;

export function spaceLayers(globe) {
  const imgs = Object.fromEntries(["moon", "sun", "mercury", "venus", "mars", "jupiter", "saturn", "uranus", "neptune", "andromeda-m31", "triangulum-m33", "dwarf-galaxy"].map((n) => [n, icon(n)]));
  const ring = (cam, c, e1, e2, rad, style, width = 1) => {
    const ctx = cam.ctx;
    ctx.strokeStyle = style; ctx.lineWidth = width * cam.dpr;
    ctx.beginPath();
    for (let i = 0; i <= 160; i++) {
      const t = i / 160 * 2 * Math.PI, [x, y] = cam.proj(add(c, add(mul(e1, rad * Math.cos(t)), mul(e2, rad * Math.sin(t)))));
      i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
    }
    ctx.stroke();
  };
  const body = (cam, img, p, r, minPx, a, glow) => {
    const [x, y] = cam.proj(p), rr = Math.max(minPx * cam.dpr, r * cam.k), ctx = cam.ctx;
    if (x < -rr || x > cam.W + rr || y < -rr || y > cam.H + rr) return [x, y, rr];
    ctx.globalAlpha = a;
    if (glow) {
      const g = ctx.createRadialGradient(x, y, 0, x, y, rr * 4);
      g.addColorStop(0, glow); g.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, rr * 4, 0, 7); ctx.fill();
    }
    if (img && ready(img) && rr > 2.5) ctx.drawImage(img, x - rr, y - rr, 2 * rr, 2 * rr);
    else { ctx.fillStyle = "#ddd"; ctx.beginPath(); ctx.arc(x, y, rr, 0, 7); ctx.fill(); }
    ctx.globalAlpha = 1;
    return [x, y, rr];
  };

  // ---------- Earth, the Moon and its orbit ----------
  const earthMoon = {
    name: "earth & moon", range: [7.5, 11.5],
    draw(cam) {
      const a = 1 - ramp(cam.s, 10.6, 11.2);
      if (a <= 0.01) return;
      const [x, y] = cam.proj(EARTH_C), rr = Math.max(1.5 * cam.dpr, R_EARTH * cam.k);
      if (globe.ready) { const c = globe.render(R_EARTH * 1.02); cam.ctx.globalAlpha = a; cam.ctx.drawImage(c, x - rr * 1.02, y - rr * 1.02, rr * 2.04, rr * 2.04); cam.ctx.globalAlpha = 1; }
      ring(cam, EARTH_C, eclAxes.x, eclAxes.y, 3.844e8, `rgba(200,210,230,${0.5 * a * ramp(cam.s, 7.9, 8.4)})`);
      const [mx, my] = body(cam, imgs.moon, MOON, 1.737e6, 1.2, a * ramp(cam.s, 7.8, 8.2));
      cam.labelPx(x, y - rr - 10 * cam.dpr, "Earth", a * ramp(cam.s, 8.3, 8.6) * (1 - ramp(cam.s, 10.2, 10.6)));
      cam.labelPx(mx, my - 10 * cam.dpr, "the Moon", a * ramp(cam.s, 8.3, 8.6) * (1 - ramp(cam.s, 9.8, 10.2)));
    },
  };

  // ---------- the Sun and the planets ----------
  const solar = {
    name: "planets", range: [9, 16.5],
    draw(cam) {
      const a = 1 - ramp(cam.s, 15.2, 16.0);
      if (a <= 0.01) return;
      for (const p of PLANETS) {
        const ra = p.a * cam.k;
        if (ra < 3 || ra > 4 * cam.min) continue;
        const oa = a * ramp(ra, 3, 12) * (1 - ramp(ra, 1.5 * cam.min, 4 * cam.min));
        ring(cam, SUN, eclAxes.x, eclAxes.y, p.a, `rgba(170,190,230,${0.45 * oa})`);
        if (p.name === "Earth") continue;
        const [x, y] = body(cam, imgs[p.name.toLowerCase()], add(SUN, p.pos), p.r, 1.4, oa);
        cam.labelPx(x, y - 9 * cam.dpr, p.name, oa * ramp(ra, 30, 60));
      }
      const [x, y] = body(cam, imgs.sun, SUN, 6.96e8, 2.2, a * ramp(cam.s, 9.4, 9.9), "rgba(255,210,120,0.45)");
      cam.labelPx(x, y - 12 * cam.dpr, "the Sun", a * ramp(cam.s, 10.6, 11) * (1 - ramp(cam.s, 14.2, 14.6)));
    },
  };

  // ---------- the Kuiper belt, the heliosphere, the Oort cloud (a model) ----------
  const icy = (() => {
    const r = rng(77), out = [];
    for (let i = 0; i < 2500; i++) { const d = (30 + 20 * r()) * AU, t = r() * 7; out.push({ p: add(SUN, eclToGal([d * Math.cos(t), d * Math.sin(t), gauss(r) * 2 * AU])), kind: 0 }); }
    for (let i = 0; i < 14000; i++) {
      const outer = r() < 0.6, d = (outer ? 2e4 * Math.pow(5, r()) : 2e3 * Math.pow(10, r())) * AU;
      const z = 2 * r() - 1, ph = r() * 7, q = Math.sqrt(1 - z * z), flat = outer ? 1 : 0.35;
      out.push({ p: add(SUN, eclToGal([d * q * Math.cos(ph), d * q * Math.sin(ph), d * z * flat])), kind: 1 });
    }
    return out;
  })();
  const comets = {
    name: "kuiper & oort", range: [12, 18.6],
    draw(cam) {
      const ka = win(cam.s, 12.4, 13.0, 15.0, 15.6), oa = win(cam.s, 14.3, 15.0, 17.4, 18.2), ctx = cam.ctx, sz = 1.2 * cam.dpr;
      if (ka + oa <= 0.01) return;
      ctx.fillStyle = "rgba(170,205,255,1)";
      for (const c of icy) {
        const al = c.kind ? oa * 0.55 : ka * 0.8;
        if (al <= 0.01) continue;
        const [x, y] = cam.proj(c.p);
        if (x < 0 || x > cam.W || y < 0 || y > cam.H) continue;
        ctx.globalAlpha = al; ctx.fillRect(x, y, sz, sz);
      }
      ctx.globalAlpha = 1;
      const hp = win(cam.s, 13.1, 13.6, 15.2, 15.7);
      if (hp > 0.01) ring(cam, SUN, cam.cam.r, cam.cam.u, 120 * AU, `rgba(120,200,255,${0.35 * hp})`, 1.5);
      const [x, y] = cam.proj(SUN);
      cam.labelPx(x, y - 33 * AU * cam.k, "Kuiper belt", ka * ramp(cam.s, 13.2, 13.5) * (1 - ramp(cam.s, 14.4, 14.8)));
      cam.labelPx(x, y - 3e4 * AU * cam.k, "Oort cloud (a model: never seen)", oa * ramp(cam.s, 15.6, 15.9) * (1 - ramp(cam.s, 16.9, 17.3)));
    },
  };

  // ---------- stars: Hipparcos (nearest) and Gaia, tools/sky-points ----------
  const stars = { name: "stars", range: [15.6, 22.6], data: null, draw(cam) { withGlow(cam, 0.5, (c) => drawPoints(c, this.data, win(cam.s, 15.9, 16.5, 20.3, 20.9), 1.3, 0.004)); } };
  const NAMED = [["Proxima Centauri", 313.94, -1.93, 4.24], ["Alpha Centauri", 315.73, -0.68, 4.37], ["Barnard's Star", 31.0, 14.1, 5.96], ["Sirius", 227.23, -8.89, 8.6], ["Vega", 67.45, 19.24, 25], ["Betelgeuse", 199.79, -8.96, 550], ["Deneb", 84.28, 1.99, 2600]];
  const named = {
    name: "named stars", range: [16, 21],
    draw(cam) {
      const a = win(cam.s, 16.6, 16.9, 20.4, 20.8);
      if (a <= 0.01) return;
      for (const [n, l, b, d] of NAMED) {
        const pd = d * LY * cam.k;
        if (pd < 25 || pd > 0.6 * cam.min) continue;
        const [x, y] = cam.proj(lb(l, b, d * LY));
        cam.labelPx(x, y - 8 * cam.dpr, n, a * ramp(pd, 25, 60) * (1 - ramp(pd, 0.4 * cam.min, 0.6 * cam.min)));
      }
    },
  };

  // ---------- the Milky Way: a model in points (bar, bulge, four arms, the old disc), glowing ----------
  const GC = lb(0, 0, 8.2 * KPC), MW = milkyWayModel(GC);
  const milkyWay = {
    name: "milky way", range: [19.2, 25],
    draw(cam) {
      const a = ramp(cam.s, 19.6, 20.4) * (1 - ramp(cam.s, 24.4, 24.9));
      if (a <= 0.01) return;
      withGlow(cam, 0.9, (c) => drawModel(c, MW, a));
      const side = 34 * KPC * cam.k, [x, y] = cam.proj(GC);
      cam.labelPx(x, y - 0.4 * side, "the Milky Way", a * ramp(cam.s, 20.5, 20.8) * (1 - ramp(cam.s, 22.2, 22.6)));
      const [sx, sy] = cam.proj([0, 0, 0]);
      cam.labelPx(sx, sy + 14 * cam.dpr, "the Sun is here", a * ramp(cam.s, 20.5, 20.8) * (1 - ramp(cam.s, 21.6, 22)));
    },
  };

  // ---------- the Local Group (positions: McConnachie 2012, rounded) ----------
  const LG = [
    ["Andromeda", 121.17, -21.57, 765, 46, "andromeda-m31"], ["Triangulum", 133.61, -31.33, 840, 18, "triangulum-m33"],
    ["Large Magellanic Cloud", 280.47, -32.89, 50, 10, "dwarf-galaxy"], ["Small Magellanic Cloud", 302.8, -44.3, 62, 6, "dwarf-galaxy"],
    ["M32", 121.15, -21.98, 785, 2.5], ["NGC 205", 120.72, -21.14, 824, 4], ["NGC 6822", 25.34, -18.4, 459, 2.5], ["IC 10", 118.97, -3.34, 794, 2],
    ["IC 1613", 129.73, -60.58, 755, 3], ["WLM", 75.86, -73.62, 933, 3], ["Leo I", 225.99, 49.11, 254, 1], ["Leo II", 220.17, 67.23, 233, 0.6],
    ["Sculptor", 287.53, -83.16, 86, 0.8], ["Fornax", 237.1, -65.65, 147, 1.4], ["Draco", 86.37, 34.72, 76, 0.6], ["Ursa Minor", 104.97, 44.8, 76, 0.6],
    ["Carina", 260.11, -22.22, 105, 0.6], ["Sextans", 243.5, 42.27, 86, 0.8], ["Sagittarius dwarf", 5.57, -14.17, 26, 3], ["Pegasus dIrr", 94.77, -43.55, 920, 1.5],
    ["Leo A", 196.9, 52.42, 798, 1.5], ["NGC 3109", 262.1, 23.07, 1300, 6], ["Sextans A", 246.15, 39.88, 1430, 2.5], ["Sextans B", 233.2, 43.78, 1430, 2],
    ["NGC 147", 119.82, -14.25, 712, 3], ["NGC 185", 120.79, -14.48, 616, 2.5], ["Andromeda II", 128.87, -29.15, 652, 1.5], ["Phoenix", 272.16, -68.95, 415, 1],
  ].map(([name, l, b, d, size, img]) => ({ name, p: lb(l, b, d * KPC), r: size * KPC / 2, img: imgs[img ?? "dwarf-galaxy"], big: size > 9 }));
  const localGroup = {
    name: "local group", range: [21, 25.6],
    draw(cam) {
      const a = win(cam.s, 21.6, 22.3, 24.6, 25.2);
      if (a <= 0.01) return;
      for (const g of LG) {
        const [x, y, rr] = body(cam, g.img, g.p, g.r, 1.2, a * 0.95);
        cam.labelPx(x, y - rr - 6 * cam.dpr, g.name, a * (g.big ? 1 : 0.6) * ramp(cam.s, 22.4, 22.7) * (1 - ramp(cam.s, g.big ? 23.8 : 22.8, g.big ? 24.2 : 23.0)));
      }
    },
  };

  // ---------- galaxies (2MRS) and the flows: a rough Laniakea ----------
  const ATTRACTORS = [
    { name: "Great Attractor · Laniakea", l: 325.3, b: -7.3, d: 68, m: 1.0, eps: 35, col: [255, 196, 90] },
    { name: "Shapley", l: 311.5, b: 30.7, d: 200, m: 3.0, eps: 50, col: [190, 140, 255] },
    { name: "Perseus–Pisces", l: 150.6, b: -13.3, d: 73, m: 0.8, eps: 30, col: [110, 170, 255] },
    { name: "Coma", l: 58.1, b: 88.0, d: 100, m: 0.6, eps: 25, col: [120, 230, 160] },
    { name: "Hercules", l: 31.5, b: 44.5, d: 150, m: 0.5, eps: 30, col: [255, 130, 150] },
  ].map((A) => ({ ...A, p: lb(A.l, A.b, A.d) }));
  const galaxies = { name: "galaxies", range: [22.6, 27.4], data: null, flows: [], draw(cam) { withGlow(cam, 0.7, (c) => drawGalaxies(c, this, win(cam.s, 23.0, 23.6, 26.1, 26.7))); } };
  const LABELS = [["Virgo cluster", 283.8, 74.5, 16.5], ["Laniakea", 325.3, -7.3, 68], ["Shapley", 311.5, 30.7, 200], ["Perseus–Pisces", 150.6, -13.3, 73], ["Coma", 58.1, 88, 100]];
  const groupLabels = {
    name: "cluster names", range: [23.5, 26.5],
    draw(cam) {
      const a = win(cam.s, 24.0, 24.3, 25.7, 26.1);
      if (a <= 0.01) return;
      for (const [n, l, b, d] of LABELS) { const [x, y] = cam.proj(lb(l, b, d * MPC)); cam.labelPx(x, y, n, a * (n === "Virgo cluster" ? 1 - ramp(cam.s, 24.8, 25.1) : ramp(cam.s, 24.6, 24.9))); }
    },
  };

  // the catalogue: 5.8 MB of packed points (see scripts/build-sky-points.mjs)
  (async () => {
    try {
      const meta = await (await fetch("/tools/sky-points/points.json")).json();
      const raw = Uint8Array.from(atob(await (await fetch("/tools/sky-points/points.txt")).text()), (c) => c.charCodeAt(0)).buffer;
      const dirs = new Int16Array(raw, meta.dir.offset, meta.dir.length), logs = new Uint16Array(raw, meta.logd.offset, meta.logd.length);
      const aux = new Uint8Array(raw, meta.aux.offset, meta.aux.length), types = new Uint8Array(raw, meta.type.offset, meta.type.length);
      // 2MRS distances come from a redshift table in steps of z = 0.001 (~4.3 Mpc), which draws
      // them as shells: each galaxy is spread across its step
      const STEP_LY = 0.001 * (299792.458 / 70) * MPC / LY, jit = rng(5);
      const pick = (want) => {
        const idx = [];
        for (let i = 0; i < meta.count; i++) if (want(types[i])) idx.push(i);
        const ly = (i) => 10 ** (meta.logMin + (logs[i] / 65535) * (meta.logMax - meta.logMin));
        idx.sort((a, b) => logs[a] - logs[b]);
        const n = idx.length, pos = new Float32Array(3 * n), dist = new Float32Array(n), col = new Uint8Array(n), kind = new Uint8Array(n);
        idx.forEach((i, j) => {
          // the viewer frame (x → GC, y → NGP, z → l = 270°) back to galactic, in light-years
          const d = ly(i) + (types[i] === 2 ? (jit() - 0.5) * STEP_LY : 0), v = [dirs[3 * i] / 32767, dirs[3 * i + 1] / 32767, dirs[3 * i + 2] / 32767];
          pos[3 * j] = v[0] * d; pos[3 * j + 1] = -v[2] * d; pos[3 * j + 2] = v[1] * d;
          dist[j] = d; col[j] = aux[i]; kind[j] = types[i];
        });
        return { n, pos, dist, col, kind };
      };
      stars.data = pick((t) => t <= 1);
      galaxies.data = pick((t) => t === 2);
      basins(galaxies, ATTRACTORS);
      web(galaxies);
    } catch (e) { console.warn("sky points unavailable:", e); }
  })();

  return [earthMoon, solar, comets, stars, named, milkyWay, localGroup, galaxies, groupLabels];
}

// stars as points: the ones within a few frame-widths, at most ~30k a frame
function drawPoints(cam, data, a, size, inner) {
  if (!data || a <= 0.01) return;
  const F = cam.F / LY, ctx = cam.ctx, { r, u } = cam.cam, kl = cam.k * LY;
  const lo = lowerBound(data.dist, inner * F), hi = lowerBound(data.dist, 3 * F), stride = Math.max(1, Math.ceil((hi - lo) / 30000));
  for (let j = lo; j < hi; j += stride) {
    const x = cam.cx + kl * (data.pos[3 * j] * r[0] + data.pos[3 * j + 1] * r[1] + data.pos[3 * j + 2] * r[2]);
    const y = cam.cy - kl * (data.pos[3 * j] * u[0] + data.pos[3 * j + 1] * u[1] + data.pos[3 * j + 2] * u[2]);
    if (x < 0 || x > cam.W || y < 0 || y > cam.H) continue;
    const c = data.col[j] / 255 * 4 - 0.4, near = data.kind[j] === 0;
    ctx.fillStyle = c < 0.3 ? "#aac4ff" : c < 1.0 ? "#fff6e8" : "#ffc28a";
    ctx.globalAlpha = a * (near ? 1 : 0.75);
    const s = (near ? 2.4 : size) * cam.dpr;
    ctx.fillRect(x - s / 2, y - s / 2, s, s);
  }
  ctx.globalAlpha = 1;
}
function lowerBound(arr, v) { let lo = 0, hi = arr.length; while (lo < hi) { const m = (lo + hi) >> 1; if (arr[m] < v) lo = m + 1; else hi = m; } return lo; }

// each galaxy rolls downhill to one attractor (softened point masses, Mpc)
function basins(g, ATT) {
  const { n, pos } = g.data, MPC_LY = MPC / LY, basin = new Uint8Array(n), r = rng(91);
  const grad = (p) => {
    const f = [0, 0, 0];
    for (const A of ATT) {
      const d = sub(A.p, p), q = dot(d, d) + A.eps * A.eps, w = A.m / (q * Math.sqrt(q));
      f[0] += d[0] * w; f[1] += d[1] * w; f[2] += d[2] * w;
    }
    return f;
  };
  for (let j = 0; j < n; j++) {
    let p = [pos[3 * j] / MPC_LY, pos[3 * j + 1] / MPC_LY, pos[3 * j + 2] / MPC_LY];
    const keep = r() < 0.03 && Math.hypot(...p) < 250, path = keep ? [p] : null;
    for (let s = 0; s < 160; s++) {
      const f = grad(p), l = Math.hypot(...f);
      if (l < 1e-12) break;
      p = add(p, mul(f, 2 / l));
      if (path && s % 3 === 0) path.push(p);
    }
    let best = 0, bd = Infinity;
    ATT.forEach((A, i) => { const d = Math.hypot(...sub(A.p, p)) / A.eps; if (d < bd) { bd = d; best = i; } });
    basin[j] = best;
    if (path) g.flows.push({ path: path.map((q) => mul(q, MPC)), basin: best });
  }
  g.basin = basin; g.att = ATT;
}
// the cosmic web: each galaxy linked to its nearest neighbours, up to a length
// that grows with distance as the survey thins out (2MRS keeps only the brighter
// galaxies far away), so filaments show as threads and lone galaxies stay faint.
// Nothing is moved: positions are the catalogue's
function web(g) {
  const { n, pos, dist } = g.data, MPC_LY = MPC / LY, P = new Float32Array(3 * n);
  for (let i = 0; i < 3 * n; i++) P[i] = pos[i] / MPC_LY;
  // mean spacing at each distance, from the galaxies per shell (10 Mpc shells)
  const SH = 10, shells = new Float32Array(60);
  for (let j = 0; j < n; j++) shells[Math.min(59, (dist[j] / MPC_LY / SH) | 0)]++;
  const spacing = Array.from(shells, (c, i) => Math.cbrt((4 / 3) * Math.PI * (((i + 1) * SH) ** 3 - (i * SH) ** 3) / Math.max(c, 1)));
  const reach = (d) => Math.max(1.5, 0.55 * spacing[Math.min(59, (d / SH) | 0)]);
  // a grid of 8 Mpc cells to find neighbours
  const C = 8, cell = new Map(), key = (x, y, z) => `${x},${y},${z}`;
  for (let j = 0; j < n; j++) {
    const k = key(Math.floor(P[3 * j] / C), Math.floor(P[3 * j + 1] / C), Math.floor(P[3 * j + 2] / C));
    (cell.get(k) ?? cell.set(k, []).get(k)).push(j);
  }
  const links = [], seen = new Set(), degree = new Uint8Array(n), K = 3;
  for (let j = 0; j < n; j++) {
    const x = P[3 * j], y = P[3 * j + 1], z = P[3 * j + 2], R = Math.min(reach(Math.hypot(x, y, z)), C);
    const near = [];
    const cx = Math.floor(x / C), cy = Math.floor(y / C), cz = Math.floor(z / C);
    for (let a = -1; a <= 1; a++) for (let b = -1; b <= 1; b++) for (let c = -1; c <= 1; c++) {
      for (const i of cell.get(key(cx + a, cy + b, cz + c)) ?? []) {
        if (i === j) continue;
        const d = Math.hypot(P[3 * i] - x, P[3 * i + 1] - y, P[3 * i + 2] - z);
        if (d < R) near.push([d, i]);
      }
    }
    near.sort((p, q) => p[0] - q[0]);
    for (const [, i] of near.slice(0, K)) {
      const id = Math.min(i, j) * n + Math.max(i, j);
      if (!seen.has(id)) { seen.add(id); links.push(j, i); }
    }
    degree[j] = Math.min(255, near.length);
  }
  g.links = Uint32Array.from(links); g.degree = degree;
}
function drawGalaxies(cam, g, a) {
  if (!g.data || !g.basin || a <= 0.01) return;
  const { pos } = g.data, ctx = cam.ctx, { r, u, n: nv } = cam.cam, kl = cam.k * LY, F = cam.F / LY, s = 1.6 * cam.dpr;
  const hi = lowerBound(g.data.dist, 2.5 * F);
  // a slab ±0.18 frame widths deep, softly: the camera's swing shows the depth
  const fade = (j) => { const t = (pos[3 * j] * nv[0] + pos[3 * j + 1] * nv[1] + pos[3 * j + 2] * nv[2]) / (0.18 * F); return Math.exp(-t * t); };
  const X = (j) => cam.cx + kl * (pos[3 * j] * r[0] + pos[3 * j + 1] * r[1] + pos[3 * j + 2] * r[2]);
  const Y = (j) => cam.cy - kl * (pos[3 * j] * u[0] + pos[3 * j + 1] * u[1] + pos[3 * j + 2] * u[2]);
  ctx.globalCompositeOperation = "lighter";
  // the threads, batched by basin and by four steps of depth fade
  if (g.links) {
    ctx.lineWidth = 1.1 * cam.dpr;
    const paths = g.att.map(() => [new Path2D(), new Path2D(), new Path2D(), new Path2D()]);
    const L = g.links;
    for (let m = 0; m < L.length; m += 2) {
      const i = L[m], j = L[m + 1];
      if (i >= hi && j >= hi) continue;
      const f = Math.min(fade(i), fade(j));
      if (f < 0.08) continue;
      const xi = X(i), yi = Y(i), xj = X(j), yj = Y(j);
      if ((xi < 0 && xj < 0) || (xi > cam.W && xj > cam.W) || (yi < 0 && yj < 0) || (yi > cam.H && yj > cam.H)) continue;
      const p = paths[g.basin[i]][Math.min(3, (f * 4) | 0)];
      p.moveTo(xi, yi); p.lineTo(xj, yj);
    }
    paths.forEach((ps, b) => ps.forEach((p, q) => {
      const c = g.att[b].col;
      ctx.strokeStyle = `rgba(${c[0]},${c[1]},${c[2]},${(a * 0.32 * (q + 0.5) / 4).toFixed(3)})`;
      ctx.stroke(p);
    }));
  }
  // the galaxies: bright where they have neighbours, faint alone
  for (let j = 0; j < hi; j++) {
    const f = fade(j);
    if (f < 0.05) continue;
    const x = X(j), y = Y(j);
    if (x < 0 || x > cam.W || y < 0 || y > cam.H) continue;
    const c = g.att[g.basin[j]].col;
    ctx.fillStyle = `rgb(${c[0]},${c[1]},${c[2]})`;
    ctx.globalAlpha = a * f * (g.degree ? 0.2 + 0.2 * Math.min(4, g.degree[j]) : 0.85);
    ctx.fillRect(x - s / 2, y - s / 2, s, s);
  }
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = "source-over";
  // flow lines, fading towards where they started
  const fa = a * ramp(cam.s, 24.2, 24.7);
  if (fa > 0.01) {
    ctx.lineWidth = 1 * cam.dpr;
    for (const f of g.flows) {
      const c = g.att[f.basin].col;
      ctx.strokeStyle = `rgba(${c[0]},${c[1]},${c[2]},${0.07 * fa})`; // faint: the web is the picture
      ctx.beginPath(); f.path.forEach((p, i) => { const [x, y] = cam.proj(p); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }); ctx.stroke();
    }
  }
  ctx.globalAlpha = 1;
}

// a soft glow for a layer: drawn on its own canvas, then laid down with two blurred
// copies of itself (a quarter and a sixteenth of the size, scaled back up)
const glowBuf = {};
function buf(name, w, h) {
  const c = glowBuf[name] ??= document.createElement("canvas");
  if (c.width !== w || c.height !== h) { c.width = w; c.height = h; }
  const ctx = c.getContext("2d");
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.globalCompositeOperation = "source-over";
  ctx.clearRect(0, 0, w, h);
  return [c, ctx];
}
function withGlow(cam, strength, draw) {
  const { W, H } = cam, [g, gctx] = buf("layer", W, H);
  draw({ ...cam, ctx: gctx });
  const w4 = Math.max(1, W >> 2), h4 = Math.max(1, H >> 2), w16 = Math.max(1, W >> 4), h16 = Math.max(1, H >> 4);
  const [q, qctx] = buf("quarter", w4, h4), [e, ectx] = buf("sixteenth", w16, h16);
  qctx.imageSmoothingQuality = ectx.imageSmoothingQuality = "high";
  qctx.drawImage(g, 0, 0, w4, h4); ectx.drawImage(q, 0, 0, w16, h16);
  const ctx = cam.ctx;
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.drawImage(g, 0, 0);
  ctx.globalCompositeOperation = "lighter"; ctx.imageSmoothingQuality = "high";
  ctx.globalAlpha = 0.7 * strength; ctx.drawImage(q, 0, 0, W, H);
  ctx.globalAlpha = 0.9 * strength; ctx.drawImage(e, 0, 0, W, H);
  ctx.restore();
}

// the Milky Way as ~55k points around the Galactic Centre gc (galactic Cartesian, m):
// a bar 27° from the Sun–centre line with its near end at positive longitude, a
// bulge, four log-spiral arms (12° pitch; trailing, as the Galaxy turns clockwise
// seen from the north galactic pole) with the Sun between two of them, and the old
// disc (scale length 2.6 kpc). Rough, for the look, not a map
function milkyWayModel(gc) {
  const r = rng(27), parts = [], tanP = Math.tan(12 * Math.PI / 180), BAR = 27 * Math.PI / 180;
  const put = (x, y, z, col, w) => parts.push([gc[0] + x * KPC, gc[1] + y * KPC, gc[2] + z * KPC, col, w]);
  const discR = (lo, hi) => { for (;;) { const R = -2.6 * Math.log(r() * r() + 1e-9); if (R > lo && R < hi) return R; } };
  // the arms: young stars, blue-white, a few pink star-forming regions
  for (let i = 0; i < 24000; i++) {
    const k = (r() * 4) | 0, R = discR(2.8, 15), th = Math.PI + k * Math.PI / 2 + Math.log(R / 6.8) / tanP + 0.06 * gauss(r), off = 0.5 * gauss(r);
    put(R * Math.cos(th) - off * Math.sin(th), R * Math.sin(th) + off * Math.cos(th), 0.1 * gauss(r), r() < 0.05 ? 2 : 0, 1);
  }
  // the old disc: yellow-white, thicker
  for (let i = 0; i < 16000; i++) { const R = discR(0.5, 16), th = 2 * Math.PI * r(); put(R * Math.cos(th), R * Math.sin(th), 0.3 * gauss(r), 1, 0.8); }
  // the bar and the bulge: old, orange
  const ux = -Math.cos(BAR), uy = Math.sin(BAR);
  for (let i = 0; i < 8000; i++) { const a = 1.8 * gauss(r), b = 0.55 * gauss(r); put(a * ux - b * uy, a * uy + b * ux, 0.3 * gauss(r), 3, 0.45); }
  for (let i = 0; i < 6000; i++) put(0.8 * gauss(r), 0.8 * gauss(r), 0.5 * gauss(r), 3, 0.45);
  const n = parts.length, pos = new Float32Array(3 * n), col = new Uint8Array(n), wt = new Float32Array(n);
  parts.forEach(([x, y, z, c, w], j) => { pos[3 * j] = x; pos[3 * j + 1] = y; pos[3 * j + 2] = z; col[j] = c; wt[j] = w; });
  return { n, pos, col, wt, COLS: ["rgb(175,205,255)", "rgb(255,238,210)", "rgb(255,140,175)", "rgb(255,205,145)"] };
}
function drawModel(cam, M, a) {
  const { ctx } = cam, { r, u } = cam.cam, k = cam.k, s = Math.max(1.2 * cam.dpr, 0.05 * KPC * k);
  ctx.globalCompositeOperation = "lighter";
  for (let c = 0; c < M.COLS.length; c++) {
    ctx.fillStyle = M.COLS[c];
    for (let j = 0; j < M.n; j++) {
      if (M.col[j] !== c) continue;
      const X = M.pos[3 * j], Y = M.pos[3 * j + 1], Z = M.pos[3 * j + 2];
      const x = cam.cx + k * (X * r[0] + Y * r[1] + Z * r[2]), y = cam.cy - k * (X * u[0] + Y * u[1] + Z * u[2]);
      if (x < -s || x > cam.W + s || y < -s || y > cam.H + s) continue;
      ctx.globalAlpha = a * 0.13 * M.wt[j];
      ctx.fillRect(x - s / 2, y - s / 2, s, s);
    }
  }
  ctx.globalAlpha = 1; ctx.globalCompositeOperation = "source-over";
}
