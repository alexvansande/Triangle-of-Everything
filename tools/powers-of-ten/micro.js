// tools/powers-of-ten/micro.js — from DNA up to the ladybug: the double helix
// side on, chromatin (beads on a string, then fibres), the inside of the
// amoeba's nucleus, the cell, the amoeba (content/icons/amoeba.webp) in a dew
// drop on the ladybug's back (content/icons/ladybug.webp). Rough drawings for
// the image pass: each frame is exported and re-rendered in one style.
import { ramp, win, rng, gauss } from "./math.js";

// where things sit, in metres from the centre (y down)
export const NUC_C = [-8e-6, 6e-6], NUC_R = 6e-5;                 // the amoeba's nucleus
const AMOEBA = 3e-4, AM_TL = [NUC_C[0] - 0.47 * AMOEBA, NUC_C[1] - 0.42 * AMOEBA];
export const AM_C = [AM_TL[0] + 0.5 * AMOEBA, AM_TL[1] + 0.5 * AMOEBA];
export const DROP_C = [AM_C[0] + 6e-5, AM_C[1] - 4e-5], DROP_R = 7.5e-4;
const LADY = 9.5e-3, LB_TL = [DROP_C[0] - 0.64 * LADY, DROP_C[1] - 0.58 * LADY];
export const LB_C = [LB_TL[0] + 0.5 * LADY, LB_TL[1] + 0.5 * LADY];

export function image(src) {
  const img = new Image();
  img.src = src;
  img.decode?.().catch(() => {});
  return img;
}
const icon = (name) => image(`/content/icons/${name}.webp`);
const ready = (img) => img.complete && img.naturalWidth > 0;

export function microLayers() {
  const amoebaImg = icon("amoeba"), ladyImg = icon("ladybug");

  // ---------- the double helix, side on, along the straight linker through the centre ----------
  const R = 1, PITCH = 3.4, RISE = 0.34, LINK = 14, D_PH = 0.8 * Math.PI, PH0 = 0.6 * Math.PI;
  const seq = (() => { const r = rng(3); return Array.from({ length: 200 }, () => "ATGC"[(r() * 4) | 0]); })();
  const PAIR = { A: "T", T: "A", G: "C", C: "G" }, BASE_COL = { A: "#5fd06a", T: "#ff5a5a", G: "#ffd84a", C: "#4d8fff" };
  const helix = {
    name: "DNA", range: [-9.3, -6.4],
    draw(cam) {
      const a = win(cam.s, -9.0, -8.6, -7.1, -6.6);
      if (a <= 0.01) return;
      const ctx = cam.ctx, u = 1e-9 * cam.k, X = (x) => cam.cx + x * u, Y = (y) => cam.cy + y * u;
      const strand = (y, k) => { const ph = 2 * Math.PI * y / PITCH + PH0 + k * D_PH; return [R * Math.sin(ph), Math.cos(ph)]; };
      const yMax = Math.min(LINK, cam.H / 2 / u + 1);
      const endFade = (y) => 1 - ramp(Math.abs(y), LINK - 3, LINK);
      ctx.lineCap = "round";
      const tube = (front) => {
        for (const k of [0, 1]) {
          for (let y = -yMax; y < yMax; y += 0.08) {
            const [x0, z0] = strand(y, k), [x1] = strand(y + 0.08, k);
            if ((z0 > 0) !== front) continue;
            const light = front ? 1 : 0.45;
            ctx.strokeStyle = `rgba(${255 * light | 0},${170 * light | 0},${80 * light | 0},${a * endFade(y)})`;
            ctx.lineWidth = 0.45 * u;
            ctx.beginPath(); ctx.moveTo(X(x0), Y(y)); ctx.lineTo(X(x1), Y(y + 0.08)); ctx.stroke();
          }
        }
      };
      tube(false);
      for (let j = -Math.floor(yMax / RISE); j <= Math.floor(yMax / RISE); j++) {
        const y = j * RISE, [x0] = strand(y, 0), [x1] = strand(y, 1), b = seq[(j + 1000) % seq.length];
        const left = j === 0 ? "A" : b, right = PAIR[left], mid = (x0 + x1) / 2;
        ctx.lineWidth = 0.22 * u;
        for (const [xa, xb, base] of [[x1, mid, left], [mid, x0, right]]) {
          ctx.strokeStyle = BASE_COL[base]; ctx.globalAlpha = a * endFade(y) * (j === 0 ? 1 : 0.8);
          ctx.beginPath(); ctx.moveTo(X(xa), Y(y)); ctx.lineTo(X(xb), Y(y)); ctx.stroke();
        }
      }
      ctx.globalAlpha = 1;
      tube(true);
      cam.label(1.8e-9, -2.5e-9, "DNA", a);
    },
  };

  // ---------- chromatin: random walks of the 10 nm chain, nucleosomes when close ----------
  // nm, from the centre; the walk through the centre leaves it straight up and down (the linker)
  function walk(r, start, dir, steps, home) {
    const pts = [start.slice()];
    let [x, y] = start, ang = Math.atan2(dir[1], dir[0]), straight = Math.ceil(LINK / 4);
    for (let i = 0; i < steps; i++) {
      if (i >= straight) {
        ang += 0.28 * gauss(r);
        const hx = home[0] - x, hy = home[1] - y, dist = Math.hypot(hx, hy);
        if (dist > 1200) ang += 0.15 * Math.sin(Math.atan2(hy, hx) - ang);
      }
      x += 4 * Math.cos(ang); y += 4 * Math.sin(ang);
      pts.push([x, y]);
    }
    return pts;
  }
  const r = rng(21), walks = [];
  {
    const up = walk(r, [0, 0], [0, -1], 1800, [300, -200]), down = walk(r, [0, 0], [0, 1], 1800, [300, -200]);
    walks.push({ pts: down.reverse().concat(up.slice(1)), mid: down.length - 1, hue: 28 });
    for (let i = 0; i < 70; i++) {
      const home = [gauss(r) * 2500, gauss(r) * 2500], st = [home[0] + gauss(r) * 600, home[1] + gauss(r) * 600];
      if (Math.hypot(st[0], st[1]) < 150) continue;
      walks.push({ pts: walk(r, st, [Math.cos(r() * 7), Math.sin(r() * 7)], 1400, home), mid: -1, hue: 10 + r() * 40 });
    }
  }
  for (const w of walks) {
    w.path = new Path2D();
    w.pts.forEach(([x, y], i) => (i ? w.path.lineTo(x, y) : w.path.moveTo(x, y)));
    // nucleosomes every 30 nm of chain; the centre's linker stays bare
    w.beads = [];
    for (let i = 0; i < w.pts.length; i += 7) {
      if (w.mid >= 0 && Math.abs(i - w.mid) * 4 < LINK + 5) continue;
      const j = w.mid >= 0 ? w.mid + Math.round((i - w.mid) / 7.5) * 7 + (i > w.mid ? 5 : -5) : i;
      if (j < 0 || j >= w.pts.length) continue;
      w.beads.push(w.pts[j]);
    }
  }
  const chromatin = {
    name: "chromatin", range: [-8.6, -4.6],
    draw(cam) {
      const a = win(cam.s, -8.4, -7.9, -5.5, -4.9);
      if (a <= 0.01) return;
      const ctx = cam.ctx, u = 1e-9 * cam.k;
      const width = 2 + 22 * ramp(cam.s, -7.3, -6.0);
      ctx.save();
      ctx.translate(cam.cx, cam.cy); ctx.scale(u, u);
      ctx.lineJoin = ctx.lineCap = "round";
      ctx.lineWidth = Math.max(width, 1.1 * cam.dpr / u);
      for (const w of walks) {
        ctx.strokeStyle = `hsla(${w.hue}, 70%, ${w.mid >= 0 ? 72 : 60}%, ${a * (w.mid >= 0 ? 1 : 0.75)})`;
        ctx.stroke(w.path);
      }
      ctx.restore();
      const bead = 5.5 * u;
      if (bead > 1.5) {
        const ba = a * ramp(bead, 1.5, 4), hw = cam.W / 2 / u + 6, hh = cam.H / 2 / u + 6;
        for (const w of walks) for (const [x, y] of w.beads) {
          if (Math.abs(x) > hw || Math.abs(y) > hh) continue;
          const px = cam.cx + x * u, py = cam.cy + y * u;
          const g = ctx.createRadialGradient(px - bead * 0.3, py - bead * 0.3, bead * 0.1, px, py, bead);
          g.addColorStop(0, `hsla(${w.hue + 180}, 50%, 80%, ${ba})`); g.addColorStop(1, `hsla(${w.hue + 200}, 45%, 35%, ${ba})`);
          ctx.fillStyle = g; ctx.beginPath(); ctx.arc(px, py, bead, 0, 7); ctx.fill();
          if (bead > 12) { // the DNA's turn and three-quarters around the histones
            ctx.strokeStyle = `hsla(${w.hue}, 70%, 72%, ${ba})`; ctx.lineWidth = 2 * u;
            for (const t of [-0.35, 0.35]) { ctx.beginPath(); ctx.ellipse(px, py + t * bead, bead * 1.05, bead * 0.35, 0.2, 0, 7); ctx.stroke(); }
          }
        }
      }
      cam.label(0, -60e-9, "nucleosomes", a * ramp(bead, 4, 8) * (1 - ramp(bead, 40, 80)));
      cam.label(0, -600e-9, "chromatin", a * ramp(cam.s, -6.8, -6.4) * (1 - ramp(cam.s, -5.6, -5.3)));
    },
  };

  // ---------- the nucleus: chromosome territories, the nucleolus, the envelope ----------
  const tex = fibreTexture();
  const terr = (() => {
    const r = rng(5);
    return Array.from({ length: 16 }, (_, i) => {
      const c = i === 0 ? [1e-6, -1e-6] : [NUC_C[0] + gauss(r) * 25e-6, NUC_C[1] + gauss(r) * 25e-6];
      const size = (6 + r() * 7) * 1e-6;
      return { hue: 10 + r() * 45, light: 50 + r() * 15, blobs: Array.from({ length: 7 }, () => [c[0] + gauss(r) * size * 0.5, c[1] + gauss(r) * size * 0.5, size * (0.45 + 0.4 * r())]) };
    });
  })();
  const NUCLEOLUS = [NUC_C[0] + 22e-6, NUC_C[1] - 18e-6, 10e-6];
  const nucleus = {
    name: "nucleus", range: [-8.6, -1.5],
    draw(cam) {
      const ctx = cam.ctx, R = NUC_R * cam.k;
      if (R < 3) return;
      const a = ramp(R, 3, 12);
      const [x, y] = cam.P(NUC_C);
      ctx.globalAlpha = a;
      disc(cam, NUC_C, NUC_R, "#8a5634");
      const inner = ramp(cam.s, -2.6, -3.4);
      if (inner > 0.01) {
        ctx.save(); ctx.beginPath(); ctx.arc(x, y, Math.min(R, 1e7), 0, 7); ctx.clip();
        const pat = ctx.createPattern(tex, "repeat"), sc = 3e-6 * cam.k / tex.width;
        pat.setTransform(new DOMMatrix().translate(cam.cx, cam.cy).scale(sc));
        for (const t of terr) {
          ctx.globalAlpha = a * inner * 0.85;
          ctx.fillStyle = `hsl(${t.hue}, 55%, ${t.light}%)`;
          ctx.beginPath(); for (const [bx, by, br] of t.blobs) { const [px, py] = cam.P([bx, by]); ctx.moveTo(px + br * cam.k, py); ctx.arc(px, py, br * cam.k, 0, 7); } ctx.fill();
          ctx.globalAlpha = a * inner * 0.5; ctx.fillStyle = pat; ctx.fill();
        }
        ctx.globalAlpha = a * inner;
        const [nx, ny] = cam.P(NUCLEOLUS), nr = NUCLEOLUS[2] * cam.k;
        const g = ctx.createRadialGradient(nx, ny, 0, nx, ny, nr);
        g.addColorStop(0, "#3a1d14"); g.addColorStop(0.8, "#5c2e1c"); g.addColorStop(1, "rgba(92,46,28,0)");
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(nx, ny, nr, 0, 7); ctx.fill();
        ctx.restore();
      }
      // the envelope, a double membrane with pores
      if (R < 2e6) {
        ctx.globalAlpha = a;
        ctx.strokeStyle = "#e8b47a"; ctx.lineWidth = Math.max(1.5 * cam.dpr, 0.6e-6 * cam.k);
        ctx.beginPath(); ctx.arc(x, y, R, 0, 7); ctx.stroke();
        const step = 2.5e-6 * cam.k;
        if (step > 5) {
          ctx.fillStyle = "#4a2414";
          const n = Math.round(2 * Math.PI * NUC_R / 2.5e-6);
          for (let i = 0; i < n; i++) { const t = i / n * 2 * Math.PI, px = x + R * Math.cos(t), py = y + R * Math.sin(t); if (px > -20 && px < cam.W + 20 && py > -20 && py < cam.H + 20) { ctx.beginPath(); ctx.arc(px, py, Math.max(1, 0.06e-6 * cam.k), 0, 7); ctx.fill(); } }
        }
      }
      ctx.globalAlpha = 1;
      cam.label(NUC_C[0], NUC_C[1] - NUC_R * 1.1, "nucleus", ramp(R, 20, 60) * (1 - ramp(R, 600, 900)));
      cam.label(NUCLEOLUS[0], NUCLEOLUS[1], "nucleolus", ramp(R, 300, 600) * (1 - ramp(R, 4000, 8000)));
    },
  };
  // the molecular world goes dark around the chain
  const veil = { name: "veil", range: [-12, -6], draw(cam) { const a = ramp(cam.s, -6.5, -7.6); if (a > 0.01) { cam.ctx.fillStyle = `rgba(4,6,16,${0.92 * a})`; cam.ctx.fillRect(0, 0, cam.W, cam.H); } } };

  // ---------- the cell around the nucleus: granules and vacuoles ----------
  const bits = (() => {
    const r = rng(9), out = [];
    for (let i = 0; i < 900; i++) {
      const ang = r() * 7, d = Math.sqrt(r()) * 1.25e-4, p = [AM_C[0] + d * Math.cos(ang), AM_C[1] + d * Math.sin(ang)];
      if (Math.hypot(p[0] - NUC_C[0], p[1] - NUC_C[1]) < NUC_R * 1.05) continue;
      const vac = r() < 0.08;
      out.push({ p, r: vac ? (6 + r() * 14) * 1e-6 : (0.6 + r() * 2.4) * 1e-6, vac });
    }
    return out;
  })();
  const cytoplasm = {
    name: "cytoplasm", range: [-5.5, -2.3],
    draw(cam) {
      const a = win(cam.s, -5.2, -4.8, -3.2, -2.7);
      if (a <= 0.01) return;
      const ctx = cam.ctx;
      for (const b of bits) {
        const [x, y] = cam.P(b.p), rr = b.r * cam.k;
        if (x < -rr || x > cam.W + rr || y < -rr || y > cam.H + rr || rr < 0.7) continue;
        ctx.globalAlpha = a * (b.vac ? 0.35 : 0.8);
        ctx.fillStyle = b.vac ? "#f4f0d8" : "#c98a3c";
        ctx.beginPath(); ctx.arc(x, y, rr, 0, 7); ctx.fill();
        if (b.vac) { ctx.strokeStyle = "#e0c890"; ctx.lineWidth = Math.max(1, 0.3e-6 * cam.k); ctx.stroke(); }
      }
      ctx.globalAlpha = 1;
    },
  };

  // ---------- the amoeba, the dew drop, the ladybug ----------
  const amoeba = {
    name: "amoeba", range: [-6, -0.8],
    draw(cam) {
      const side = AMOEBA * cam.k;
      if (side < 3 || !ready(amoebaImg)) return;
      const [x, y] = cam.P(AM_TL);
      if (side > 60 * cam.min) { disc(cam, AM_C, AMOEBA * 0.45, "#efe3b8"); return; }
      cam.ctx.globalAlpha = ramp(side, 3, 10);
      cam.ctx.drawImage(amoebaImg, x, y, side, side);
      cam.ctx.globalAlpha = 1;
      cam.label(AM_C[0], AM_C[1] - AMOEBA * 0.55, "amoeba", ramp(side, 30, 80) * (1 - ramp(side, 900, 1600)));
    },
  };
  const dropBody = {
    name: "drop", range: [-5, 0],
    draw(cam) {
      const rr = DROP_R * cam.k;
      if (rr < 2 || rr > 1e6) return;
      const [x, y] = cam.P(DROP_C), ctx = cam.ctx;
      const g = ctx.createRadialGradient(x + rr * 0.2, y + rr * 0.25, rr * 0.1, x, y, rr);
      g.addColorStop(0, "rgba(220,240,255,0.30)"); g.addColorStop(0.85, "rgba(170,210,240,0.22)"); g.addColorStop(1, "rgba(90,140,190,0.55)");
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, rr, 0, 7); ctx.fill();
    },
  };
  const dropShine = {
    name: "drop shine", range: [-5, 0],
    draw(cam) {
      const rr = DROP_R * cam.k;
      if (rr < 2 || rr > 1e6) return;
      const [x, y] = cam.P(DROP_C), ctx = cam.ctx, a = 1 - ramp(rr, 2000, 9000);
      ctx.globalAlpha = a;
      ctx.strokeStyle = "rgba(255,255,255,0.65)"; ctx.lineWidth = Math.max(1, rr * 0.03);
      ctx.beginPath(); ctx.arc(x, y, rr * 0.97, 3.6, 4.6); ctx.stroke();
      const g = ctx.createRadialGradient(x - rr * 0.45, y - rr * 0.45, 0, x - rr * 0.45, y - rr * 0.45, rr * 0.22);
      g.addColorStop(0, "rgba(255,255,255,0.9)"); g.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x - rr * 0.45, y - rr * 0.45, rr * 0.22, 0, 7); ctx.fill();
      ctx.globalAlpha = 1;
      cam.label(DROP_C[0], DROP_C[1] + DROP_R * 1.25, "a drop of dew", ramp(rr, 25, 60) * (1 - ramp(rr, 500, 900)));
    },
  };
  const ladybug = {
    name: "ladybug", range: [-4.5, 0.6],
    draw(cam) {
      const side = LADY * cam.k;
      if (side < 3 || !ready(ladyImg)) return;
      if (side > 80 * cam.min) { cam.ctx.fillStyle = "#c8261c"; cam.ctx.fillRect(0, 0, cam.W, cam.H); return; }
      const [x, y] = cam.P(LB_TL);
      cam.ctx.globalAlpha = ramp(side, 3, 10);
      cam.ctx.drawImage(ladyImg, x, y, side, side);
      cam.ctx.globalAlpha = 1;
      cam.label(LB_C[0], LB_C[1] - LADY * 0.5, "ladybug", ramp(side, 30, 70) * (1 - ramp(side, 700, 1200)));
    },
  };

  return [ladybug, dropBody, amoeba, cytoplasm, dropShine, nucleus, veil, chromatin, helix];
}

// a filled circle that stays sane when it's far bigger than the screen
export function disc(cam, c, r, fill) {
  const ctx = cam.ctx, [x, y] = cam.P(c), rr = r * cam.k;
  ctx.fillStyle = fill;
  if (rr > 50 * Math.max(cam.W, cam.H)) {
    if (Math.hypot(x - cam.cx, y - cam.cy) < rr) ctx.fillRect(0, 0, cam.W, cam.H);
    return;
  }
  ctx.beginPath(); ctx.arc(x, y, rr, 0, 7); ctx.fill();
}

// a tile of tangled fibres, for the chromatin's texture at the nucleus's scale
function fibreTexture() {
  const c = document.createElement("canvas"); c.width = c.height = 256;
  const ctx = c.getContext("2d"), r = rng(13);
  ctx.lineCap = "round";
  for (let i = 0; i < 70; i++) {
    let x = r() * 256, y = r() * 256, a = r() * 7;
    ctx.strokeStyle = `rgba(${40 + r() * 60 | 0},${20 + r() * 30 | 0},${10 + r() * 20 | 0},0.8)`;
    ctx.lineWidth = 1 + r() * 1.5;
    ctx.beginPath(); ctx.moveTo(x, y);
    for (let j = 0; j < 40; j++) {
      a += gauss(r) * 0.5; x += 4 * Math.cos(a); y += 4 * Math.sin(a);
      ctx.lineTo(x, y);
      // wrap so the tile repeats without seams
      if (x < 0 || x > 256 || y < 0 || y > 256) { x = (x + 256) % 256; y = (y + 256) % 256; ctx.moveTo(x, y); }
    }
    ctx.stroke();
  }
  return c;
}
