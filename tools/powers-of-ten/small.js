// tools/powers-of-ten/small.js — the code-drawn bottom of the zoom: the Planck
// grid (a Game of Life), one quark, the proton (the chart's live Hopf renderer,
// public/hopf/hopf-core.js), the hydrogen atom to scale, and the A–T base pair
// whose hydrogen bond holds the centre of the whole zoom.
import { ramp, win, rng, gauss } from "./math.js";

const L_PLANCK = 1.616e-35, A0 = 5.29e-11, PROTON_D = 1.68e-15;
// quarks have no measured size; colliders put it under ~10⁻¹⁹ m, so that is the size drawn
const QUARK_D = 1e-19;
// share of the Hopf picture's square the proton's ball fills
const HOPF_FILL = 0.62;
const OPTS = { drift: true, flow: true, width: 1, bloom: 0.9, exposure: 1.1, core: 0.8 };

export async function smallLayers() {
  let core = null;
  // public/hopf/hopf-core.js has no imports of its own; Vite's dev server won't
  // hand a public file to import(), so it comes in as text
  try {
    const src = await (await fetch("/hopf/hopf-core.js")).text();
    const url = URL.createObjectURL(new Blob([src], { type: "text/javascript" }));
    core = await import(/* @vite-ignore */ url);
  }
  catch (err) { console.warn("Hopf renderer unavailable:", err.message); }
  const hopf = (id) => {
    if (!core) return null;
    const renderer = new core.Renderer({ alpha: true });
    const view = new core.HopfView(renderer, null, core.PARTICLES.find((p) => p.id === id));
    view.yaw = 0.6;
    return { renderer, view };
  };
  const proton = hopf("proton-scale"), quark = hopf("up");
  const drawHopf = (h, cam, box, alpha, res) => {
    const px = Math.min(1024, Math.max(64, Math.ceil(box / 64) * 64));
    h.renderer.resize(px);
    if (res !== undefined) h.view.res = res;
    h.view.yaw = 0.6 + cam.t * 0.12;
    h.view.update(cam.t, OPTS);
    cam.ctx.globalAlpha = alpha;
    h.renderer.render(h.view, OPTS, [cam.ctx, cam.cx - box / 2, cam.cy - box / 2, box, box]);
    cam.ctx.globalAlpha = 1;
  };

  // ---------- the Planck grid: a Game of Life, one cell per Planck length ----------
  const N = 160, cells = new Uint8Array(N * N), heat = new Float32Array(N * N);
  { const r = rng(7); for (let i = 0; i < cells.length; i++) cells[i] = r() < 0.32 ? 1 : 0; }
  let lifeT = 0;
  function lifeStep() {
    const next = new Uint8Array(N * N);
    for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
      let n = 0;
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) if (dx || dy) n += cells[((y + dy + N) % N) * N + ((x + dx + N) % N)];
      const i = y * N + x;
      next[i] = n === 3 || (n === 2 && cells[i]) ? 1 : 0;
    }
    cells.set(next);
  }
  const life = {
    name: "planck", range: [-36, -32],
    draw(cam) {
      const cell = L_PLANCK * cam.k, a = ramp(cell, 1.5, 6) * ramp(cam.s, -32.2, -32.9);
      if (a <= 0.01) return;
      while (lifeT < cam.t) { lifeStep(); lifeT += 0.14; for (let i = 0; i < heat.length; i++) heat[i] = Math.max(cells[i], heat[i] * 0.82); }
      const ctx = cam.ctx, half = Math.ceil(Math.max(cam.W, cam.H) / 2 / cell) + 1;
      for (let j = -half; j <= half; j++) for (let i = -half; i <= half; i++) {
        const h = heat[((j % N + N) % N) * N + ((i % N + N) % N)];
        if (h < 0.04) continue;
        ctx.fillStyle = `rgba(${150 + 105 * h | 0}, ${200 + 55 * h | 0}, 255, ${(a * (0.15 + 0.85 * h)).toFixed(3)})`;
        ctx.fillRect(cam.cx + (i - 0.5) * cell + 0.5, cam.cy + (j - 0.5) * cell + 0.5, cell - 1, cell - 1);
      }
    },
  };

  // ---------- one quark, drawn at QUARK_D: a point of light while it's too small to see,
  // then it grows past the frame and we're inside it, in the desert down to the Planck grid ----------
  const quarkLayer = {
    name: "quark", range: [-21, -15],
    draw(cam) {
      const d = QUARK_D * cam.k, a = ramp(cam.s, -15.0, -15.6) * (1 - ramp(d, 1.5 * cam.min, 4 * cam.min));
      if (a <= 0.01) return;
      const ctx = cam.ctx;
      if (d < 16 * cam.dpr || !quark) {
        const r = Math.max(1.2 * cam.dpr, d / 2), g = ctx.createRadialGradient(cam.cx, cam.cy, 0, cam.cx, cam.cy, r * 3);
        g.addColorStop(0, `rgba(255,190,190,${a})`); g.addColorStop(0.35, `rgba(255,110,110,${0.6 * a})`); g.addColorStop(1, "rgba(255,90,90,0)");
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cam.cx, cam.cy, r * 3, 0, 7); ctx.fill();
        if (d < 4 * cam.dpr || !quark) return;
      }
      drawHopf(quark, cam, d / HOPF_FILL, a * ramp(d, 4 * cam.dpr, 16 * cam.dpr));
      cam.label(0, 0.6 * QUARK_D, "a quark: at most 10⁻¹⁹ m across", a * ramp(d, 20, 60) * (1 - ramp(d, 0.6 * cam.min, cam.min)));
    },
  };

  // ---------- the proton, at its own size; finer probes resolve its quarks ----------
  const protonLayer = {
    name: "proton", range: [-16, -10.5],
    draw(cam) {
      const d = PROTON_D * cam.k, a = 1 - ramp(cam.s, -15.1, -15.6);
      if (a <= 0.01) return;
      const ctx = cam.ctx;
      if (d < 10 || !proton) {
        // a point of light at the atom's centre: drawn bigger than life so it's seen at all
        const r = Math.max(1.6 * cam.dpr, d / 2), g = ctx.createRadialGradient(cam.cx, cam.cy, 0, cam.cx, cam.cy, r * 3);
        g.addColorStop(0, `rgba(255,214,150,${a})`); g.addColorStop(0.35, `rgba(255,150,80,${0.6 * a})`); g.addColorStop(1, "rgba(255,120,60,0)");
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cam.cx, cam.cy, r * 3, 0, 7); ctx.fill();
        if (d < 10) return;
      }
      const fadeIn = ramp(d, 10, 40);
      drawHopf(proton, cam, d / HOPF_FILL, a * fadeIn, ramp(cam.s, -13.9, -14.9));
      cam.label(0, -0.5 * PROTON_D, "proton", a * fadeIn);
    },
  };

  // ---------- hydrogen, to scale: the 1s cloud, e^(−2r/a₀), as glow and as places the electron is found ----------
  const r = rng(11), dots = Array.from({ length: 1800 }, () => sample1s(r));
  function sample1s(r) {
    const rad = -(A0 / 2) * Math.log((r() + 1e-9) * (r() + 1e-9) * (r() + 1e-9)); // Gamma(3, a₀/2): r² e^(−2r/a₀)
    const z = 2 * r() - 1, ph = 2 * Math.PI * r(), q = Math.sqrt(1 - z * z);
    return [rad * q * Math.cos(ph), rad * q * Math.sin(ph), r()];
  }
  const atom = {
    name: "hydrogen", range: [-14.6, -8.6],
    draw(cam) {
      const a = win(cam.s, -14.4, -13.8, -9.45, -9.0);
      if (a <= 0.01) return;
      const ctx = cam.ctx, R = 7 * A0 * cam.k;
      const g = ctx.createRadialGradient(cam.cx, cam.cy, 0, cam.cx, cam.cy, R);
      for (let i = 0; i <= 12; i++) {
        const t = i / 12, rho = Math.exp(-2 * t * 7);
        g.addColorStop(t, `rgba(110,170,255,${(a * 0.55 * Math.pow(rho, 0.45)).toFixed(4)})`);
      }
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, cam.W, cam.H);
      // the electron's "where it might be": dots, a few re-drawn every frame
      const dotA = a * ramp(R, 40, 160) * (1 - ramp(R, 4000, 20000));
      if (dotA > 0.01) {
        for (let i = 0; i < 25; i++) dots[(Math.random() * dots.length) | 0] = sample1s(Math.random);
        ctx.fillStyle = `rgba(200,225,255,${(0.75 * dotA).toFixed(3)})`;
        const sz = 1.4 * cam.dpr;
        for (const [x, y] of dots) ctx.fillRect(cam.cx + x * cam.k - sz / 2, cam.cy + y * cam.k - sz / 2, sz, sz);
      }
      cam.label(0, -1.6 * A0, "hydrogen atom", a * ramp(R, 80, 200) * (1 - ramp(R, 3000, 6000)));
    },
  };

  return [life, quarkLayer, protonLayer, atom, basePair()];
}

// ---------- the A–T base pair, flat on (3DNA standard bases, Å; T flipped across the pair's long axis) ----------
function basePair() {
  const A = { "C1'": [-2.479, 5.346], N9: [-1.291, 4.498], C8: [0.024, 4.897], N7: [0.877, 3.902], C5: [0.071, 2.771], C6: [0.369, 1.398], N6: [1.611, 0.909], N1: [-0.668, 0.532], C2: [-1.912, 1.023], N3: [-2.320, 2.290], C4: [-1.267, 3.124] };
  const Tr = { "C1'": [-2.481, 5.354], N1: [-1.284, 4.500], C2: [-1.462, 3.135], O2: [-2.562, 2.608], N3: [-0.298, 2.407], C4: [0.994, 2.897], O4: [1.944, 2.119], C5: [1.106, 4.338], C7: [2.466, 4.961], C6: [-0.024, 5.057] };
  const T = Object.fromEntries(Object.entries(Tr).map(([k, [x, y]]) => [k, [x, -y]]));
  const bondsA = [["C1'", "N9"], ["N9", "C8"], ["C8", "N7"], ["N7", "C5"], ["C5", "C6"], ["C6", "N6"], ["C6", "N1"], ["N1", "C2"], ["C2", "N3"], ["N3", "C4"], ["C4", "C5"], ["C4", "N9"]];
  const bondsT = [["C1'", "N1"], ["N1", "C2"], ["C2", "O2"], ["C2", "N3"], ["N3", "C4"], ["C4", "O4"], ["C4", "C5"], ["C5", "C7"], ["C5", "C6"], ["C6", "N1"]];
  const unit = (v) => { const l = Math.hypot(...v); return [v[0] / l, v[1] / l]; };
  const away = (at, ...nbs) => unit(nbs.reduce((s, nb) => { const u = unit([at[0] - nb[0], at[1] - nb[1]]); return [s[0] + u[0], s[1] + u[1]]; }, [0, 0]));
  const along = (at, dir, d) => [at[0] + dir[0] * d, at[1] + dir[1] * d];
  const rot = ([x, y], deg) => { const c = Math.cos(deg * Math.PI / 180), s = Math.sin(deg * Math.PI / 180); return [x * c - y * s, x * s + y * c]; };
  const atoms = [], bonds = [], hb = [];
  const put = (el, p, base) => { atoms.push({ el, p, base }); return p; };
  for (const [k, p] of Object.entries(A)) put(k[0] === "C" && k !== "C1'" ? "C" : k[0], p, "A");
  for (const [k, p] of Object.entries(T)) put(k[0], p, "T");
  for (const [a, b] of bondsA) bonds.push([A[a], A[b]]);
  for (const [a, b] of bondsT) bonds.push([T[a], T[b]]);
  const H = (p, base) => put("H", p, base);
  const hA2 = H(along(A.C2, away(A.C2, A.N1, A.N3), 1.08), "A");
  const hA8 = H(along(A.C8, away(A.C8, A.N7, A.N9), 1.08), "A");
  const dN6 = unit([A.N6[0] - A.C6[0], A.N6[1] - A.C6[1]]);
  const h61 = H(along(A.N6, rot(dN6, 60), 1.01), "A"), h62 = H(along(A.N6, rot(dN6, -60), 1.01), "A");
  const toO4 = Math.hypot(h61[0] - T.O4[0], h61[1] - T.O4[1]) < Math.hypot(h62[0] - T.O4[0], h62[1] - T.O4[1]) ? h61 : h62;
  const h3 = H(along(T.N3, away(T.N3, T.C2, T.C4), 1.01), "T");
  const h6 = H(along(T.C6, away(T.C6, T.N1, T.C5), 1.08), "T");
  for (const [p, q] of [[A.C2, hA2], [A.C8, hA8], [A.N6, h61], [A.N6, h62], [T.N3, h3], [T.C6, h6]]) bonds.push([p, q]);
  hb.push([h3, A.N1], [toO4, T.O4]);
  // the hydrogen of the middle bond (thymine N3–H ··· adenine N1) is the zoom's centre
  const O = h3;
  // screen: the pair's long axis across, A on the left, the major groove up
  const toScreen = ([x, y]) => [-(y - O[1]) * 1e-10, -(x - O[0]) * 1e-10];
  const RAD = { H: 0.32, C: 0.55, N: 0.52, O: 0.5 };
  const COL = { H: "#f4f4f4", C: "#ffd84a", N: "#4d8fff", O: "#ff4d4d" };
  return {
    name: "base pair", range: [-10.6, -8.3],
    draw(cam) {
      const a = ramp(cam.s, -10.2, -9.6) * (1 - ramp(cam.s, -8.95, -8.55));
      if (a <= 0.01) return;
      // turning edge-on as the helix takes over: squash across the screen's height
      const sq = 1 - 0.9 * ramp(cam.s, -9.1, -8.6);
      const ctx = cam.ctx, P = (p) => { const [x, y] = toScreen(p); return [cam.cx + x * cam.k, cam.cy + y * cam.k * sq]; };
      ctx.globalAlpha = a;
      ctx.lineCap = "round";
      ctx.strokeStyle = "rgba(150,190,255,0.9)"; ctx.lineWidth = 0.16e-10 * cam.k;
      ctx.beginPath(); for (const [p, q] of bonds) { ctx.moveTo(...P(p)); ctx.lineTo(...P(q)); } ctx.stroke();
      ctx.setLineDash([0.18e-10 * cam.k, 0.16e-10 * cam.k]); ctx.strokeStyle = "rgba(255,255,255,0.7)"; ctx.lineWidth = 0.09e-10 * cam.k;
      ctx.beginPath(); for (const [p, q] of hb) { ctx.moveTo(...P(p)); ctx.lineTo(...P(q)); } ctx.stroke(); ctx.setLineDash([]);
      // the sugars' stubs, towards the backbones
      ctx.strokeStyle = "rgba(255,170,80,0.8)"; ctx.lineWidth = 0.5e-10 * cam.k;
      ctx.beginPath(); for (const c of [A["C1'"], T["C1'"]]) { const s = Math.sign(c[1]); ctx.moveTo(...P(c)); ctx.lineTo(...P([c[0] - 1.2, c[1] + s * 2.2])); } ctx.stroke();
      for (const at of atoms) {
        const [x, y] = P(at.p), rr = RAD[at.el] * 1e-10 * cam.k;
        const g = ctx.createRadialGradient(x - rr * 0.35, y - rr * 0.35, rr * 0.1, x, y, rr);
        g.addColorStop(0, "#fff"); g.addColorStop(0.35, COL[at.el]); g.addColorStop(1, "rgba(0,0,0,0.6)");
        ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(x, y, rr, rr * sq, 0, 0, 7); ctx.fill();
      }
      ctx.globalAlpha = 1;
      cam.label(-5e-10, -3.5e-10 * sq, "adenine", a); cam.label(5e-10, -3.5e-10 * sq, "thymine", a);
      cam.label(0, 0.9e-10, "hydrogen bond", a * (1 - ramp(cam.s, -9.4, -9.1)));
    },
  };
}
