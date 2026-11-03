import {ramp,SITE,R_EARTH,D,GMST,galToEq} from "./math.js";
export function earthScene(){
  // ---------- California and the Earth: the true-colour globe ----------
  const globe = earthGlobe();
  const earth = {
    name: "earth", range: [4.4, 7.7],
    draw(cam) {
      const a = ramp(cam.s, 4.6, 5.3) * (1 - ramp(cam.s, 6.45, 6.9));
      if (a <= 0.01 || !globe.ready) return;
      const hw = Math.min(R_EARTH * 1.02, 0.75 * Math.max(cam.W, cam.H) / cam.k);
      const c = globe.render(hw);
      const px = 2 * hw * cam.k;
      cam.ctx.globalAlpha = a; cam.ctx.drawImage(c, cam.cx - px / 2, cam.cy - px / 2, px, px); cam.ctx.globalAlpha = 1;
      cam.label(0, -2.2e5, "California", a * ramp(cam.s, 5.8, 6.1) * (1 - ramp(cam.s, 6.6, 6.9)));
    },
  };

  return {layers:[earth],globe};
}

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
  // the whole globe seen from any side: view is the camera's { r, u, n } (galactic),
  // sun the direction to the Sun; lit by it, with a faint night side and a thin blue
  // edge of atmosphere. Its map is the photos' own end (photos/globe-4k.jpg, or 8K with
  // ?hq=1): the Blue Marble with the clouds of 15 June 2024, so the photos hand over
  // to it without a jump. win: the part of the disc to draw ([x0, y0, x1, y1] in its
  // radii, y up), nx × ny pixels
  const big = /[?&]hq=1/.test(location.search);
  let map = null;
  load(`/video/powers-of-ten/photos/globe-${big ? "8k" : "4k"}.jpg`).then((im) => {
    const k = document.createElement("canvas"); k.width = im.naturalWidth; k.height = im.naturalHeight;
    const x = k.getContext("2d"); x.drawImage(im, 0, 0);
    map = { w: k.width, h: k.height, d: x.getImageData(0, 0, k.width, k.height).data };
  }).catch((e) => console.warn("globe map unavailable:", e));
  const c3 = document.createElement("canvas"), ctx3 = c3.getContext("2d");
  let img3 = null, last3 = "";
  out.render3 = (view, sun, nx, ny = nx, win = [-1.02, -1.02, 1.02, 1.02]) => {
    if (!map) return null;
    const key = `${nx}x${ny}|${win.map((v) => v.toFixed(3))}|${view.n.map((v) => v.toFixed(4))}|${view.u.map((v) => v.toFixed(4))}`;
    if (key === last3) return c3;
    last3 = key;
    if (c3.width !== nx || c3.height !== ny) { c3.width = nx; c3.height = ny; img3 = ctx3.createImageData(nx, ny); }
    const d = img3.data, { r, u } = view, f = view.n, { w: MW, h: MH, d: M } = map;
    const [x0, y0, x1, y1] = win, edge = 3 * (x1 - x0) / nx;
    for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) {
      const x = x0 + (i + 0.5) / nx * (x1 - x0), y = y1 - (j + 0.5) / ny * (y1 - y0), rho2 = x * x + y * y, o = 4 * (j * nx + i);
      if (rho2 > 1) { d[o + 3] = 0; continue; }
      const z = Math.sqrt(1 - rho2), N = [x * r[0] + y * u[0] + z * f[0], x * r[1] + y * u[1] + z * f[1], x * r[2] + y * u[2] + z * f[2]];
      const q = galToEq(N), lat = Math.asin(Math.max(-1, Math.min(1, q[2]))), lon = Math.atan2(q[1], q[0]) - GMST;
      const uu = ((lon / (2 * Math.PI) + 0.5) % 1 + 1) % 1, vv = 0.5 - lat / Math.PI;
      const k = 4 * (Math.min(MH - 1, (vv * MH) | 0) * MW + Math.min(MW - 1, (uu * MW) | 0));
      const lit = N[0] * sun[0] + N[1] * sun[1] + N[2] * sun[2], day = 0.06 + 0.94 * ramp(lit, -0.08, 0.25);
      const rim = Math.pow(1 - z, 3) * ramp(lit, -0.3, 0.3);
      d[o] = Math.min(255, M[k] * day + 90 * rim); d[o + 1] = Math.min(255, M[k + 1] * day + 140 * rim); d[o + 2] = Math.min(255, M[k + 2] * day + 255 * rim);
      d[o + 3] = 255 * ramp(1 - Math.sqrt(rho2), 0, edge);
    }
    ctx3.putImageData(img3, 0, 0);
    return c3;
  };
  return out;
}
