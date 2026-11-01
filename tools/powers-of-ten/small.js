import {planckPattern} from './planck-pattern.js';
// tools/powers-of-ten/small.js — the code-drawn bottom of the zoom: the Planck
// grid (a Game of Life), one quark, the proton (the chart's live Hopf renderer,
// public/hopf/hopf-core.js), the hydrogen atom to scale, and the live guanine molecular scene
// whose N1-bound hydrogen holds the centre of the whole zoom.
import { ramp, rng } from "./math.js";

import {guanineApproach} from './guanine-approach.js';
import {loadHopfCore} from './atomic-bridge-geometry.js';

const PROTON_D = 1.68e-15;
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
    const view = new core.HopfView(renderer, null, core.PARTICLES.find((p) => p.id === id));
    view.yaw = 0.6;
    return { renderer, view, size: 0 };
  };
  const proton = hopf("proton-scale"), quark = hopf("up"), guanine=guanineApproach();
  const drawHopf = (h, cam, box, alpha, res) => {
    // Frame dimensions are physical output pixels, including export DPR.
    // Video mode supports the3840px master; preview keeps GPU memory bounded.
    const video = new URLSearchParams(location.search).get('atomquality') === 'video';
    const limit = Math.min(video ? 3840 : 2048, h.renderer.gl.getParameter(h.renderer.gl.MAX_RENDERBUFFER_SIZE));
    const px = Math.min(limit, Math.max(64, Math.ceil(Math.min(box,cam.min*1.5) / 128) * 128));
    // Retain allocation while zooming; shrink only after a substantial retreat.
    if (px > h.size || px < h.size / 2) { h.renderer.resize(px); h.size = px; }
    if (res !== undefined) h.view.res = res;
    h.view.yaw = 0.6 + cam.t * 0.12;h.view.update(cam.t, OPTS);
    if(h===quark){
      const focus=ramp(cam.s,-18.6,-19.2),i=Math.floor(h.view.N*.18)*4;
      if(focus>0){const target=Array.from(h.view.data.slice(i,i+3));h.view.center=h.view.center.map((v,k)=>v*(1-focus)+target[k]*focus);}
    }
    cam.ctx.globalAlpha = alpha;
    h.renderer.render(h.view, OPTS, [cam.ctx, cam.cx - box / 2, cam.cy - box / 2, box, box]);
    cam.ctx.globalAlpha = 1;
  };

  const life=planckPattern();

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
      if(d<10&&proton){
        // Keep the real multicolour proton picture even below resolved size.
        drawHopf(proton,cam,Math.max(6*cam.dpr,d)/HOPF_FILL,a,1);
        return;
      }
      if(!proton)return;
      const fadeIn = ramp(d, 10, 40);
      drawHopf(proton, cam, d / HOPF_FILL, a * fadeIn, ramp(cam.s, -13.9, -14.9));
      cam.label(0, -0.5 * PROTON_D, "proton", a * fadeIn);
    },
  };

  return [life, quarkLayer, protonLayer, guanine];
}
