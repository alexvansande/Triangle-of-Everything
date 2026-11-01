// tools/powers-of-ten/small.js — the code-drawn bottom of the zoom: the Planck
// grid (a Game of Life), one quark, the proton (the chart's live Hopf renderer,
// public/hopf/hopf-core.js), the hydrogen atom to scale, and the A–T base pair
// whose hydrogen bond holds the centre of the whole zoom.
import { ramp, win, rng, gauss } from "./math.js";

import {atomicBridge,atomBridgePhase} from './atomic-bridge.js';
import {loadHopfCore,hydrogenParticle,HYDROGEN_SPAN,SNAPSHOT_TIME,SNAPSHOT_YAW} from './atomic-bridge-geometry.js';

const A0 = 5.29e-11, PROTON_D = 1.68e-15;
// quarks have no measured size; colliders put it under ~10⁻¹⁹ m, so that is the size drawn
const QUARK_D = 1e-19;
// share of the Hopf picture's square the proton's ball fills
const HOPF_FILL = 0.62;
const OPTS = { drift: true, flow: true, width: 1, bloom: 0.9, exposure: 1.1, core: 0.8 };

export async function smallLayers() {
  let core = null;
  // Vite's dev server won't hand a public file to import(), so public/hopf/hopf-core.js
  // comes in as text, its own imports (the molecules) pointed at their full addresses
  try {
    core=await loadHopfCore();
    // the atoms to true (linear) scale, and no nucleus of their own: the zoom draws
    // the proton itself, at its real size (the explorer's is ~18,000× too big)
    core.LOOK.logScale = false; core.LOOK.showNucleus = false;
  }
  catch (err) { console.warn("Hopf renderer unavailable:", err.message); }
  const hopf = (id) => {
    if (!core) return null;
    const renderer = new core.Renderer({ alpha: true });
    const view = new core.HopfView(renderer, null, id==="hydrogen"?hydrogenParticle(core):core.PARTICLES.find((p) => p.id === id));
    view.yaw = 0.6;
    return { renderer, view, size: 0 };
  };
  const proton = hopf("proton-scale"), quark = hopf("up"), hydrogen = hopf("hydrogen"), bridge=atomicBridge();
  const drawHopf = (h, cam, box, alpha, res) => {
    // Frame dimensions are physical output pixels, including export DPR.
    // Video mode supports the3840px master; preview keeps GPU memory bounded.
    const video = new URLSearchParams(location.search).get('atomquality') === 'video';
    const limit = Math.min(video ? 3840 : 2048, h.renderer.gl.getParameter(h.renderer.gl.MAX_RENDERBUFFER_SIZE));
    const px = Math.min(limit, Math.max(64, Math.ceil(Math.min(box,cam.min*1.5) / 128) * 128));
    // Retain allocation while zooming; shrink only after a substantial retreat.
    if (px > h.size || px < h.size / 2) { h.renderer.resize(px); h.size = px; }
    if (res !== undefined) h.view.res = res;
    if(h===hydrogen&&bridge.ready()){
      const freeze=ramp(cam.s,-10.4,-9.9),time=cam.t*(1-freeze)+SNAPSHOT_TIME*freeze;
      h.view.yaw=SNAPSHOT_YAW+(1-freeze)*cam.t*.12;h.view.update(time,OPTS);
    }else{h.view.yaw = 0.6 + cam.t * 0.12;h.view.update(cam.t, OPTS);}
    cam.ctx.globalAlpha = alpha;
    h.renderer.render(h.view, OPTS, [cam.ctx, cam.cx - box / 2, cam.cy - box / 2, box, box]);
    cam.ctx.globalAlpha = 1;
  };

  // ---------- the Planck grid: a Game of Life, cells 10^-35 m (about the Planck length,
  // 1.6 × 10^-35 m, so the cells sit exactly on the powers-of-ten grid), upright on
  // the screen like the grid, not rolled with the picture ----------
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
      const cell = 1e-35 * cam.k, a = ramp(cell, 1.5, 6) * ramp(cam.s, -32.2, -32.9);
      if (a <= 0.01) return;
      cam = { ...cam, ...cam.screen };
      cam.ctx.save(); cam.ctx.setTransform(1, 0, 0, 1, 0, 0);
      while (lifeT < cam.t) { lifeStep(); lifeT += 0.14; for (let i = 0; i < heat.length; i++) heat[i] = Math.max(cells[i], heat[i] * 0.82); }
      const ctx = cam.ctx, half = Math.ceil(Math.max(cam.W, cam.H) / 2 / cell) + 1;
      for (let j = -half; j <= half; j++) for (let i = -half; i <= half; i++) {
        const h = heat[((j % N + N) % N) * N + ((i % N + N) % N)];
        if (h < 0.04) continue;
        ctx.fillStyle = `rgba(${150 + 105 * h | 0}, ${200 + 55 * h | 0}, 255, ${(a * (0.15 + 0.85 * h)).toFixed(3)})`;
        ctx.fillRect(cam.cx + i * cell + 0.5, cam.cy + j * cell + 0.5, cell - 1, cell - 1);
      }
      ctx.restore();
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
  // the Hopf explorer's hydrogen: the 1s cloud woven from the electron's own Hopf
  // circles, each lit by |ψ|² where it passes, out to 4.2 Bohr radii (99% of the
  // electron) at radius 1 of its picture, the picture's square 2.1 wide
  const H_BOX = HYDROGEN_SPAN;
  const atom = {
    name: "hydrogen", range: [-14.6, -8.6],
    draw(cam) {
      const a = bridge.ready()?ramp(cam.s,-14.4,-13.8)*(1-atomBridgePhase(cam.s)):win(cam.s, -14.4, -13.8, -9.45, -9.0);
      if (a <= 0.01) return;
      const ctx = cam.ctx, R = 7 * A0 * cam.k, box = H_BOX * cam.k;
      // from a few frames inside it outwards, the woven cloud; deeper in, where one
      // picture can't hold it, the plain glow and dots below
      const ha = hydrogen ? a * (1 - ramp(box, 3 * cam.min, 8 * cam.min)) : 0;
      if (ha > 0.01){ctx.save();if(bridge.ready())ctx.globalCompositeOperation="lighter";drawHopf(hydrogen, cam, box, ha);ctx.restore();}
      const ga = a * (hydrogen ? (bridge.ready()?ramp(box,2*cam.min,6*cam.min):0.35+0.65*ramp(box,2*cam.min,6*cam.min)) : 1);
      const g = ctx.createRadialGradient(cam.cx, cam.cy, 0, cam.cx, cam.cy, R);
      for (let i = 0; i <= 12; i++) {
        const t = i / 12, rho = Math.exp(-2 * t * 7);
        g.addColorStop(t, `rgba(110,170,255,${(ga * 0.55 * Math.pow(rho, 0.45)).toFixed(4)})`);
      }
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, cam.W, cam.H);
      // Fixed seeded probability samples avoid random frame-to-frame video noise.
      const dotA = ga * ramp(R, 40, 160) * (1 - ramp(R, 4000, 20000));
      if (dotA > 0.01) {
        ctx.fillStyle = `rgba(200,225,255,${(0.75 * dotA).toFixed(3)})`;
        const sz = 1.4 * cam.dpr;
        for (const [x, y] of dots) ctx.fillRect(cam.cx + x * cam.k - sz / 2, cam.cy + y * cam.k - sz / 2, sz, sz);
      }
      cam.label(0, -1.6 * A0, "hydrogen atom", a * ramp(R, 80, 200) * (1 - ramp(R, 3000, 6000)));
    },
  };

  return [life, quarkLayer, protonLayer, atom, bridge];
}
