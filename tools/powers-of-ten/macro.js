// tools/powers-of-ten/macro.js — from the ladybug's sprig up to the Earth,
// looking straight down on the General Sherman tree: sequoia shoots (scale
// leaves), the twig and limb, the crown, the grove, the forest and the Sierra
// (procedural, rough), then California and the Earth from the spectrum page's
// true-colour Earth maps (public/spectrum/earth-spectrum: red, green, blue bands).
import { ramp, win, rng, gauss, SITE, R_EARTH, D } from "./math.js";
import { LB_C } from "./micro.js";

const rel = (dx, dy) => [LB_C[0] + dx, LB_C[1] + dy];

export function macroLayers() {
  // ---------- shoots: polylines with a width; scale leaves drawn once they resolve ----------
  const shoots = [], r = rng(31);
  function shoot(p, ang, len, width, depth, bend = 0.15) {
    const pts = [p], n = Math.max(6, Math.round(len / width / 2));
    let [x, y] = p, a = ang;
    for (let i = 0; i < n; i++) { a += gauss(r) * bend / n * 3; x += (len / n) * Math.cos(a); y += (len / n) * Math.sin(a); pts.push([x, y]); }
    const s = { pts, width, depth, box: bbox(pts, width) };
    shoots.push(s);
    if (depth > 0) {
      const kids = 7 + ((r() * 4) | 0);
      for (let i = 1; i <= kids; i++) {
        const t = i / (kids + 1), q = pts[Math.round(t * (pts.length - 1))], side = i % 2 ? 1 : -1;
        const qa = Math.atan2(pts[pts.length - 1][1] - pts[0][1], pts[pts.length - 1][0] - pts[0][0]);
        shoot(q, qa + side * (0.7 + 0.2 * r()), len * (0.55 - 0.3 * t), width * 0.72, depth - 1);
      }
    }
    return s;
  }
  // the shoot under the ladybug, its spray, the twig the spray grows on
  shoot(rel(0, 0.043), -Math.PI / 2 + 0.1, 0.11, 0.0032, 0, 0.02);
  shoot(rel(-0.2, 0.5), Math.atan2(-0.8, 0.35), 0.9, 0.0045, 2);
  const twigP = rel(-1.3, 1.7), twigQ = rel(-0.2, 0.5);
  shoot(twigP, Math.atan2(twigQ[1] - twigP[1], twigQ[0] - twigP[0]), 3.4, 0.012, 0, 0.05);
  for (let i = 0; i < 9; i++) {
    const t = (i + 0.5) / 9, b = [twigP[0] + (twigQ[0] - twigP[0]) * t * 2.2, twigP[1] + (twigQ[1] - twigP[1]) * t * 2.2];
    if (Math.hypot(b[0] - twigQ[0], b[1] - twigQ[1]) < 0.3) continue;
    shoot(b, Math.atan2(-0.8, 0.35) + (i % 2 ? 0.9 : -0.9) + gauss(r) * 0.2, 0.7 + r() * 0.3, 0.0045, 2);
  }

  // ---------- the crown from above: clumps of foliage along limbs, the ground between ----------
  const CROWN = rel(9, -6), CROWN_R = 16;
  const clumps = [];
  {
    const r2 = rng(41);
    // the limb that carries our twig
    for (let t = 0.15; t <= 1.05; t += 0.06) clumps.push({ p: [CROWN[0] + (twigP[0] - CROWN[0]) * t + gauss(r2) * 0.6, CROWN[1] + (twigP[1] - CROWN[1]) * t + gauss(r2) * 0.6], r: 1.4 + r2() * 1.4, l: 0.4 + 0.3 * r2() });
    for (let i = 0; i < 260; i++) {
      const ang = r2() * 7, d = Math.sqrt(r2()) * CROWN_R;
      clumps.push({ p: [CROWN[0] + d * Math.cos(ang), CROWN[1] + d * Math.sin(ang)], r: 1.2 + r2() * 2.4, l: 0.25 + 0.5 * (1 - d / CROWN_R) + 0.2 * r2() });
    }
  }
  const trees = [];
  {
    const r3 = rng(51);
    for (let i = 0; i < 2600; i++) {
      const p = [CROWN[0] + gauss(r3) * 700, CROWN[1] + gauss(r3) * 700];
      if (Math.hypot(p[0] - CROWN[0], p[1] - CROWN[1]) < CROWN_R + 6) continue;
      if (Math.hypot(p[0] + 260, p[1] - 180) < 150) continue; // Round Meadow
      const big = r3() < 0.12;
      trees.push({ p, r: big ? 6 + r3() * 8 : 2 + r3() * 3.5, big, l: r3() });
    }
  }

  const ground = {
    name: "ground", range: [-3.6, 4.4],
    draw(cam) {
      const a = ramp(cam.s, -3.4, -2.6) * (1 - ramp(cam.s, 3.8, 4.3)), t = ramp(cam.s, 0.3, 1.2);
      if (a <= 0.01) return;
      cam.ctx.globalAlpha = a; cam.ctx.fillStyle = `rgb(${29 + 45 * t | 0},${38 + 22 * t | 0},${22 + 20 * t | 0})`; cam.ctx.fillRect(0, 0, cam.W, cam.H); cam.ctx.globalAlpha = 1;
    },
  };
  const grove = {
    name: "grove", range: [0.8, 4.6],
    draw(cam) {
      const a = win(cam.s, 0.9, 1.6, 3.9, 4.4);
      if (a <= 0.01) return;
      const ctx = cam.ctx;
      ctx.globalAlpha = a;
      // the meadow and the road
      const [mx, my] = cam.P([-260, 180]);
      ctx.fillStyle = "#8a9a4a"; ctx.beginPath(); ctx.ellipse(mx, my, 170 * cam.k, 110 * cam.k, 0.4, 0, 7); ctx.fill();
      ctx.strokeStyle = "#8c8478"; ctx.lineWidth = Math.max(1, 7 * cam.k);
      ctx.beginPath(); [[-900, 600], [-400, 320], [-60, 90], [200, -150], [600, -300], [1100, -700]].forEach((p, i) => { const [x, y] = cam.P(p); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }); ctx.stroke();
      for (const t of trees) {
        const [x, y] = cam.P(t.p), rr = t.r * cam.k;
        if (rr < 0.4 || x < -rr * 2 || x > cam.W + rr * 2 || y < -rr * 2 || y > cam.H + rr * 2) continue;
        ctx.fillStyle = "rgba(20,16,10,0.5)"; ctx.beginPath(); ctx.ellipse(x + rr * 0.5, y + rr * 0.6, rr, rr * 0.9, 0, 0, 7); ctx.fill();
        ctx.fillStyle = t.big ? `hsl(${95 + 20 * t.l}, 35%, ${30 + 10 * t.l}%)` : `hsl(${140 + 20 * t.l}, 30%, ${18 + 8 * t.l}%)`;
        ctx.beginPath(); ctx.arc(x, y, rr, 0, 7); ctx.fill();
      }
      ctx.globalAlpha = 1;
      cam.label(-260, 180, "Round Meadow", a * ramp(cam.s, 2.6, 3.0) * (1 - ramp(cam.s, 3.6, 3.9)));
    },
  };
  const crown = {
    name: "crown", range: [-0.3, 3.6],
    draw(cam) {
      const a = win(cam.s, -0.2, 0.5, 3.0, 3.5);
      if (a <= 0.01) return;
      const ctx = cam.ctx;
      ctx.globalAlpha = a;
      const [cx, cy] = cam.P(CROWN);
      ctx.fillStyle = "rgba(15,12,8,0.55)"; ctx.beginPath(); ctx.ellipse(cx + 6 * cam.k, cy + 7 * cam.k, CROWN_R * cam.k, CROWN_R * 0.9 * cam.k, 0, 0, 7); ctx.fill();
      for (const c of clumps) {
        const [x, y] = cam.P(c.p), rr = c.r * cam.k;
        if (x < -rr || x > cam.W + rr || y < -rr || y > cam.H + rr) continue;
        const g = ctx.createRadialGradient(x - rr * 0.3, y - rr * 0.35, rr * 0.1, x, y, rr);
        g.addColorStop(0, `hsl(88, 40%, ${30 + 22 * c.l}%)`); g.addColorStop(1, `hsl(110, 35%, ${12 + 8 * c.l}%)`);
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, rr, 0, 7); ctx.fill();
      }
      ctx.globalAlpha = 1;
      cam.label(CROWN[0], CROWN[1] - CROWN_R * 1.15, "the General Sherman tree", a * ramp(cam.s, 1.9, 2.2) * (1 - ramp(cam.s, 2.8, 3.1)));
    },
  };
  const foliage = {
    name: "foliage", range: [-3, 1.8],
    draw(cam) {
      const a = 1 - ramp(cam.s, 1.0, 1.6);
      if (a <= 0.01) return;
      const ctx = cam.ctx, hw = cam.W / 2 / cam.k, hh = cam.H / 2 / cam.k;
      ctx.globalAlpha = a; ctx.lineCap = "round"; ctx.lineJoin = "round";
      for (const s of shoots) {
        const w = s.width * cam.k;
        if (w < 0.5) continue;
        if (s.box[2] < -hw || s.box[0] > hw || s.box[3] < -hh || s.box[1] > hh) continue;
        ctx.strokeStyle = w > 6 ? "#3d5a2a" : "#4f7034"; ctx.lineWidth = w;
        ctx.beginPath(); s.pts.forEach((p, i) => { const [x, y] = cam.P(p); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }); ctx.stroke();
        if (w > 6) scales(cam, s, Math.min(1, (w - 6) / 10));
      }
      ctx.globalAlpha = 1;
      cam.label(LB_C[0] + 0.03, LB_C[1] - 0.06, "a sequoia sprig", a * ramp(cam.s, -1.6, -1.3) * (1 - ramp(cam.s, -0.6, -0.3)));
    },
  };
  // overlapping awl-shaped scale leaves along a shoot
  function scales(cam, s, a) {
    const ctx = cam.ctx, step = s.width * 0.55;
    let acc = 0;
    for (let i = 1; i < s.pts.length; i++) {
      const [x0, y0] = s.pts[i - 1], [x1, y1] = s.pts[i], seg = Math.hypot(x1 - x0, y1 - y0), ang = Math.atan2(y1 - y0, x1 - x0);
      for (; acc < seg; acc += step) {
        const t = acc / seg, p = [x0 + (x1 - x0) * t, y0 + (y1 - y0) * t], [px, py] = cam.P(p);
        if (px < -50 || px > cam.W + 50 || py < -50 || py > cam.H + 50) continue;
        const L = s.width * 0.75 * cam.k, n = Math.round(acc / step);
        for (const side of [-1, 1]) {
          const a2 = ang + side * 0.45;
          ctx.fillStyle = (n + side) % 3 === 0 ? `rgba(120,160,80,${a})` : `rgba(80,120,55,${a})`;
          ctx.beginPath(); ctx.ellipse(px + Math.cos(a2) * L * 0.4, py + Math.sin(a2) * L * 0.4, L * 0.55, L * 0.2, a2, 0, 7); ctx.fill();
        }
      }
      acc -= seg;
    }
  }

  // ---------- the forest and the Sierra: procedural ground, the river canyons ----------
  const forestTex = terrain(1024, 61, (h, x, y) => {
    const canyon = Math.exp(-((y - 0.62 - 0.12 * Math.sin(x * 6)) ** 2) / 0.0012);
    const v = h * (1 - 0.8 * canyon);
    return v < 0.38 ? [70, 95, 55] : [32 + 30 * v, 52 + 40 * v, 30 + 15 * v].map((c) => c * (1 - 0.5 * canyon));
  });
  const sierraTex = terrain(1024, 71, (h, x) => {
    const east = x; // the crest to the east, the Central Valley to the west
    if (east < 0.18 + 0.05 * h) return [196, 176, 120];
    if (east > 0.62 + 0.15 * h) return h > 0.62 ? [235, 235, 238] : [130 + 60 * h, 128 + 55 * h, 125 + 50 * h];
    return [40 + 50 * h, 70 + 40 * h, 40 + 20 * h];
  });
  const texLayer = (name, img, side, range, fadeIn) => ({
    name, range,
    draw(cam) {
      const a = win(cam.s, ...fadeIn);
      if (a <= 0.01) return;
      const px = side * cam.k, [x, y] = cam.P([-side / 2, -side / 2]);
      cam.ctx.globalAlpha = a; cam.ctx.drawImage(img, x, y, px, px); cam.ctx.globalAlpha = 1;
    },
  });
  const forest = texLayer("forest", forestTex, 2.5e4, [2.5, 5.6], [2.9, 3.4, 5.0, 5.4]);
  const sierra = texLayer("sierra", sierraTex, 3e5, [3.5, 6.8], [3.9, 4.4, 6.1, 6.6]);

  // ---------- California and the Earth: the true-colour globe ----------
  const globe = earthGlobe();
  const earth = {
    name: "earth", range: [4.4, 7.7],
    draw(cam) {
      const a = ramp(cam.s, 4.6, 5.3) * (1 - ramp(cam.s, 7.55, 7.65));
      if (a <= 0.01 || !globe.ready) return;
      const hw = Math.min(R_EARTH * 1.02, 0.75 * Math.max(cam.W, cam.H) / cam.k);
      const c = globe.render(hw);
      const px = 2 * hw * cam.k;
      cam.ctx.globalAlpha = a; cam.ctx.drawImage(c, cam.cx - px / 2, cam.cy - px / 2, px, px); cam.ctx.globalAlpha = 1;
      cam.label(0, -2.2e5, "California", a * ramp(cam.s, 5.8, 6.1) * (1 - ramp(cam.s, 6.6, 6.9)));
    },
  };

  return { layers: [ground, earth, sierra, forest, grove, crown, foliage], globe };
}

function bbox(pts, w) {
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  for (const [x, y] of pts) { x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y); }
  return [x0 - w, y0 - w, x1 + w, y1 + w];
}

// fBm value noise → colours, faded out towards the edge so it sits on what's below
function terrain(n, seed, colour) {
  const r = rng(seed), G = 64, grid = Float32Array.from({ length: G * G }, () => r());
  const noise = (x, y) => {
    const xi = Math.floor(x), yi = Math.floor(y), fx = x - xi, fy = y - yi;
    const at = (i, j) => grid[((j % G + G) % G) * G + ((i % G + G) % G)];
    const sx = fx * fx * (3 - 2 * fx), sy = fy * fy * (3 - 2 * fy);
    return (at(xi, yi) * (1 - sx) + at(xi + 1, yi) * sx) * (1 - sy) + (at(xi, yi + 1) * (1 - sx) + at(xi + 1, yi + 1) * sx) * sy;
  };
  const c = document.createElement("canvas"); c.width = c.height = n;
  const ctx = c.getContext("2d"), img = ctx.createImageData(n, n);
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
    let h = 0, amp = 0.5, f = 4;
    for (let o = 0; o < 6; o++) { h += amp * noise(x / n * f, y / n * f); amp *= 0.5; f *= 2; }
    const [R, Gc, B] = colour(h, x / n, y / n), i = 4 * (y * n + x);
    const d = Math.hypot(x / n - 0.5, y / n - 0.5) * 2;
    img.data[i] = R; img.data[i + 1] = Gc; img.data[i + 2] = B; img.data[i + 3] = 255 * (1 - ramp(d, 0.62, 0.98));
  }
  ctx.putImageData(img, 0, 0);
  return c;
}

// orthographic Earth centred on the tree, north up, from equirectangular maps
function earthGlobe() {
  const out = { ready: false };
  const W = 2048, H = 1024;
  let rgb = null, last = null;
  const c = document.createElement("canvas"); c.width = c.height = 640;
  const ctx = c.getContext("2d"), img = ctx.createImageData(640, 640);
  const load = (src) => new Promise((ok, no) => { const i = new Image(); i.onload = () => ok(i); i.onerror = no; i.src = src; });
  Promise.all([load("/spectrum/earth-spectrum/pack-4.jpg"), load("/spectrum/earth-spectrum/pack-5.jpg")]).then(([p4, p5]) => {
    const read = (im) => { const k = document.createElement("canvas"); k.width = W; k.height = H; const x = k.getContext("2d"); x.drawImage(im, 0, 0, W, H); return x.getImageData(0, 0, W, H).data; };
    const a = read(p4), b = read(p5);
    rgb = new Uint8ClampedArray(W * H * 3);
    // red 645 nm = pack 4 blue; green 555 nm = pack 5 red; blue 469 nm = pack 5 green
    for (let i = 0; i < W * H; i++) { rgb[3 * i] = a[4 * i + 2]; rgb[3 * i + 1] = b[4 * i]; rgb[3 * i + 2] = b[4 * i + 1]; }
    out.ready = true;
  }).catch((e) => console.warn("Earth maps unavailable:", e));
  const phi0 = SITE.lat * D, lam0 = SITE.lon * D, sp0 = Math.sin(phi0), cp0 = Math.cos(phi0);
  // half-width hw (m) of the square shown, centred on the tree
  out.render = (hw) => {
    if (last && Math.abs(Math.log(hw / last)) < 0.04) return c;
    last = hw;
    const n = 640, d = img.data, sc = hw / R_EARTH;
    for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) {
      const x = ((i + 0.5) / n * 2 - 1) * sc, y = -((j + 0.5) / n * 2 - 1) * sc, rho = Math.hypot(x, y), o = 4 * (j * n + i);
      if (rho > 1) { d[o + 3] = 0; continue; }
      const cc = Math.asin(rho), sc2 = Math.sin(cc), cs = Math.cos(cc);
      const lat = rho ? Math.asin(cs * sp0 + y * sc2 * cp0 / rho) : phi0;
      const lon = lam0 + Math.atan2(x * sc2, rho * cp0 * cs - y * sp0 * sc2);
      const u = ((lon / (2 * Math.PI) + 0.5) % 1 + 1) % 1, v = 0.5 - lat / Math.PI;
      const fx = u * W - 0.5, fy = Math.max(0, Math.min(H - 1.001, v * H - 0.5)), x0 = Math.floor(fx), y0 = Math.floor(fy), tx = fx - x0, ty = fy - y0;
      const i00 = 3 * (y0 * W + ((x0 + W) % W)), i10 = 3 * (y0 * W + ((x0 + 1) % W)), i01 = i00 + 3 * W, i11 = i10 + 3 * W;
      const limb = 0.75 + 0.25 * Math.sqrt(1 - rho * rho);
      for (let ch = 0; ch < 3; ch++) d[o + ch] = limb * ((rgb[i00 + ch] * (1 - tx) + rgb[i10 + ch] * tx) * (1 - ty) + (rgb[i01 + ch] * (1 - tx) + rgb[i11 + ch] * tx) * ty);
      d[o + 3] = 255 * ramp(1 - rho, 0, 3 * sc / n);
    }
    ctx.putImageData(img, 0, 0);
    return c;
  };
  return out;
}
