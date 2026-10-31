// Periodic table as drawn on the chart (element dust, logR × logM),
// coloured by binding energy per nucleon of each element's main isotope.
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
const REPO = "/home/user/Triangle-of-Everything";
const SP = path.dirname(new URL(import.meta.url).pathname);
const require = createRequire(REPO + "/package.json");
const { chromium } = await import("/opt/node22/lib/node_modules/playwright/index.mjs").catch(() => require("playwright"));
const d3 = await import(REPO + "/node_modules/d3/src/index.js");
const { ELEMENTS_BY_Z, periodicCell } = await import(REPO + "/src/data.js");

const dust = JSON.parse(fs.readFileSync(REPO + "/src/dust.json"));
const objs = JSON.parse(fs.readFileSync(REPO + "/src/objects.json"));
const SL = JSON.parse(fs.readFileSync(SP + "/slope.json")); const be = SL.els;
const pos = new Map();
dust.name.forEach((n, i) => { if (dust.s[i] === 2) pos.set(n, [dust.r[i], dust.m[i]]); });
for (const o of objs) if (o.cat === "atomic" && o.subcat === "atom") pos.set(o.name, [o.logR, o.logM]);

const els = [];
for (let z = 1; z < ELEMENTS_BY_Z.length; z++) {
  const p = pos.get(ELEMENTS_BY_Z[z]);
  if (!p) { console.warn("missing", z, ELEMENTS_BY_Z[z]); continue; }
  const b = be[z];
  els.push({ z, name: ELEMENTS_BY_Z[z], r: p[0], m: p[1], ...b, mev: b.ba / 1000, sl: b.slope });
}
// Lines: periods (solid), groups (dashed), as on the chart
const rows = new Map(), cols = new Map();
const add = (m, k, z) => (m.get(k) || m.set(k, []).get(k)).push(z);
for (let z = 1; z < ELEMENTS_BY_Z.length; z++) {
  const c = periodicCell(z);
  if (c.f == null) { add(rows, "p" + c.period, z); add(cols, "g" + c.group, z); }
  else { add(rows, "f" + c.period, z); add(cols, "f" + c.f, z); }
}

const W = 1800, H = 1580, BG = "#06061a";
const lineCol = d3.interpolateRgb("#64ffda", "#fff")(0.4);
// Main panel: equal-aspect logR × logM
const rx = d3.extent(els, (e) => e.r), my = d3.extent(els, (e) => e.m);
const P = { x: 70, y: 150, w: 1020, h: 1240 };
const k = Math.min(P.w / (rx[1] - rx[0] + 0.2), P.h / (my[1] - my[0] + 0.25));
const cxr = (rx[0] + rx[1]) / 2, cym = (my[0] + my[1]) / 2;
const X = (r) => P.x + P.w / 2 + (r - cxr) * k, Y = (m) => P.y + P.h / 2 - (m - cym) * k;
const byZ = new Map(els.map((e) => [e.z, e]));

// Signed, compressed scale (asinh) so both sides read: light nuclei have huge slopes, heavy ones gentle ones
const S0 = process.env.SPECTRUM === "1" ? 5 : 2, SMAX = 50;
const SMIN = 8; // the heavy side's steepest descent; each side is scaled to its own range
const u = (v) => Math.max(-1, Math.min(1, v >= 0 ? Math.asinh(v / S0) / Math.asinh(SMAX / S0) : -Math.asinh(-v / S0) / Math.asinh(SMIN / S0)));
const BLUE = "#1c7ed6", GREY = "#868e96", RED = "#e03131";
// SPECTRUM=1: full spectrum, violet/blue (steepest climb) → green → yellow at the top → orange → red
const SPECTRUM = process.env.SPECTRUM === "1";
const TOP = 0.64; // turbo's yellow
const colU = SPECTRUM
  ? (x) => { // saturation eased down to 15% at the top, so iron reads greyish
      const c = d3.hsl(d3.interpolateTurbo(x >= 0 ? TOP - x * (TOP - 0.06) : TOP + -x * (0.96 - TOP)));
      c.s *= 0.15 + 0.85 * Math.min(1, Math.abs(x) / 0.8);
      return c.formatHex();
    }
  : (x) => x >= 0 ? d3.interpolateLab(GREY, BLUE)(x) : d3.interpolateLab(GREY, RED)(-x);
const ink = (c) => (SPECTRUM && d3.lab(c).l > 62 ? "#111" : "#fff");
const col = (v) => colU(u(v));
const t = () => 0.2; // label text colour: white on all

let s = "";
for (const [key, zs] of [...rows, ...cols]) {
  const pts = zs.map((z) => byZ.get(z)).filter(Boolean).map((e) => [X(e.r), Y(e.m)]);
  if (pts.length < 2) continue;
  const row = key[0] === "p" || (key[0] === "f" && rows.has(key));
  const isRow = rows.has(key) && rows.get(key) === zs;
  s += `<path d="${d3.line()(pts)}" fill="none" stroke="${lineCol}" stroke-width="${isRow ? 1.6 : 1.2}" ${isRow ? "" : 'stroke-dasharray="5 4"'} opacity="${isRow ? 0.5 : 0.22}" stroke-linejoin="round"/>`;
}
// Dots, heavy ones first so the light, spread rows sit on top
for (const e of [...els].sort((a, b) => b.z - a.z)) {
  const x = X(e.r), y = Y(e.m), c = col(e.sl);
  const special = e.z === 26;
  s += `<circle cx="${x}" cy="${y}" r="${special ? 15 : e.z > 36 ? 8.5 : 11}" fill="${c}" stroke="${special ? "#fff" : BG}" stroke-width="${special ? 2.5 : 1.5}"/>`;
  const dark = ink(c) === "#111";
  s += `<text x="${x}" y="${y + (e.z > 36 && !special ? 2.7 : 3.6)}" text-anchor="middle" font-size="${special ? 12 : e.z > 36 ? 7.5 : 9.5}" font-weight="700" fill="${dark ? "#111" : "#fff"}">${e.sym}</text>`;
}
// Callouts
const call = (z, text, dx, dy) => {
  const e = byZ.get(z), x = X(e.r), y = Y(e.m);
  s += `<line x1="${x}" y1="${y}" x2="${x + dx}" y2="${y + dy}" stroke="#fff" stroke-width="1" opacity="0.5"/>`;
  s += `<text x="${x + dx + (dx > 0 ? 6 : -6)}" y="${y + dy + 4}" text-anchor="${dx > 0 ? "start" : "end"}" font-size="15" fill="#fff" opacity="0.9">${text}</text>`;
};
call(26, process.env.SPECTRUM === "1" ? "Iron to copper: the top (zero at A ≈ 62)" : "Iron, nickel: slope zero, the top", 140, -40);
call(1, "Hydrogen: the steepest climb of all", 60, 40);

call(92, "Uranium: gently downhill", -120, 50);

// Side panel: the binding-energy curve vs mass number, same colours
const Q = { x: 1180, y: 190, w: 560, h: 420 };
const xa = d3.scaleLinear([0, 300], [Q.x, Q.x + Q.w]), yb = d3.scaleLinear([0, 9.2], [Q.y + Q.h, Q.y]);
let q = `<rect x="${Q.x}" y="${Q.y}" width="${Q.w}" height="${Q.h}" fill="none" stroke="#fff" stroke-opacity="0.12"/>`;
for (const v of [0, 2, 4, 6, 8]) q += `<line x1="${Q.x}" x2="${Q.x + Q.w}" y1="${yb(v)}" y2="${yb(v)}" stroke="#fff" stroke-opacity="0.07"/><text x="${Q.x - 8}" y="${yb(v) + 4}" text-anchor="end" font-size="12" fill="#aab">${v}</text>`;
for (const v of [0, 50, 100, 150, 200, 250, 300]) q += `<text x="${xa(v)}" y="${Q.y + Q.h + 18}" text-anchor="middle" font-size="12" fill="#aab">${v}</text>`;
q += `<text x="${Q.x + Q.w / 2}" y="${Q.y + Q.h + 40}" text-anchor="middle" font-size="13" fill="#ccd">mass number A (protons + neutrons)</text>`;
q += `<text transform="translate(${Q.x - 36},${Q.y + Q.h / 2}) rotate(-90)" text-anchor="middle" font-size="13" fill="#ccd">MeV per nucleon</text>`;
const curve = [...els].sort((a, b) => a.A - b.A);
q += `<path d="${d3.line()(curve.map((e) => [xa(e.A), yb(e.mev)]))}" fill="none" stroke="#fff" stroke-opacity="0.25"/>`;
const [aV, aS, aC, aA] = SL.coef;
const Zv = (A) => A / (2 + (aC / (2 * aA)) * A ** (2 / 3));
const fB = (A) => { const z = Zv(A); return (aV * A - aS * A ** (2 / 3) - aC * z * (z - 1) / A ** (1 / 3) - aA * (A - 2 * z) ** 2 / A) / A; };
const sm = d3.range(8, 300, 1).map((A) => [xa(A), yb(fB(A))]);
q += `<path d="${d3.line()(sm)}" fill="none" stroke="#fff" stroke-opacity="0.55" stroke-width="1.5" stroke-dasharray="6 4"/>`;
q += `<text x="${xa(170)}" y="${yb(fB(170)) - 14}" font-size="12" fill="#ccd">smoothed trend (liquid-drop fit)</text>`;
const fe = byZ.get(26);
q += `<line x1="${xa(SL.zeroA)}" x2="${xa(SL.zeroA)}" y1="${Q.y}" y2="${Q.y + Q.h}" stroke="#fff" stroke-opacity="0.35" stroke-dasharray="3 3"/>`;
q += `<text x="${xa(56) - 8}" y="${Q.y + Q.h - 150}" font-size="13" fill="#fff" text-anchor="end" opacity="0.85">← fusion</text><text x="${xa(56) + 8}" y="${Q.y + Q.h - 150}" font-size="13" fill="#fff" opacity="0.85">fission →</text>`;
q += `<text x="${xa(56) + 8}" y="${Q.y + Q.h - 130}" font-size="12" fill="#ccd" opacity="0.85">both release energy only</text><text x="${xa(56) + 8}" y="${Q.y + Q.h - 114}" font-size="12" fill="#ccd" opacity="0.85">by moving toward iron</text>`;
for (const e of curve) q += `<circle cx="${xa(e.A)}" cy="${yb(e.mev)}" r="${e.z === 26 ? 6 : 3.6}" fill="${col(e.sl)}" stroke="${e.z === 26 ? "#fff" : "none"}" stroke-width="1.5"/>`;
q += `<text x="${Q.x}" y="${Q.y - 14}" font-size="16" font-weight="600" fill="#fff">The binding curve, coloured by its slope</text>`;

// Colour bar
const B = { x: 1180, y: 720, w: 560, h: 22 };
let grad = "";
for (let i = 0; i <= 40; i++) grad += `<stop offset="${i * 2.5}%" stop-color="${colU(1 - i / 20)}"/>`;
let bar = `<defs><linearGradient id="g">${grad}</linearGradient></defs><rect x="${B.x}" y="${B.y}" width="${B.w}" height="${B.h}" rx="3" fill="url(#g)"/>`;
const bx = (v) => B.x + B.w * (1 - u(v)) / 2;
for (const v of (process.env.SPECTRUM === "1" ? [50, 20, 10, 5, 0, -2, -5, -8] : [50, 10, 2, 0, -2, -5, -8])) bar += `<line x1="${bx(v)}" x2="${bx(v)}" y1="${B.y + B.h}" y2="${B.y + B.h + 5}" stroke="#aab"/><text x="${bx(v)}" y="${B.y + B.h + 20}" text-anchor="middle" font-size="12" fill="#aab">${v === 50 ? "≥ +50" : v > 0 ? "+" + v : v}</text>`;
bar += `<text x="${B.x}" y="${B.y - 12}" font-size="16" font-weight="600" fill="#fff">Slope of the binding curve (keV per nucleon, per nucleon added)</text>`;
bar += `<text x="${B.x}" y="${B.y + B.h + 44}" font-size="12.5" fill="#aab">${SPECTRUM ? "Violet to green: still climbing, so fusing gives energy. Orange to red: past the top, so splitting does." : "Blue: still climbing, so fusing gives energy. Red: past the top, so splitting does."}</text>`;
bar += `<text x="${B.x}" y="${B.y + B.h + 62}" font-size="12.5" fill="#aab">${SPECTRUM ? "Grey" : "Grey"}: the top. Each side has its own scale; the light side is far steeper.</text>`;
// Ring key
const L = { x: 1180, y: 830 };
const key0 = [
  ["#ff8787", "2 2", "Found in nature, but radioactive (Bi, Th, U, Ra…)"],
  ["#adb5bd", "1 3", "Not found in nature: made in labs (longest-lived isotope shown)"],
];
let lk = "";
[].forEach(([c, da, txt], i) => {
  lk += `<circle cx="${L.x + 10}" cy="${L.y + i * 30}" r="10" fill="#555"/><circle cx="${L.x + 10}" cy="${L.y + i * 30}" r="14" fill="none" stroke="${c}" stroke-dasharray="${da}" stroke-width="1.3"/><text x="${L.x + 34}" y="${L.y + i * 30 + 5}" font-size="13" fill="#ccd">${txt}</text>`;
});
lk += `<text x="${L.x}" y="${L.y + 0}" font-size="13" fill="#ccd">Solid lines: periods. Dashed: groups. Dots sit where the chart puts</text>`;
lk += `<text x="${L.x}" y="${L.y + 18}" font-size="13" fill="#ccd">each element: atomic size across, mass up (both logarithmic).</text>`;
const notes = [
  "The slope is d(B/A)/dA: how much tighter each nucleon gets held if the",
  "nucleus gains one more nucleon. It's smoothed (a liquid-drop fit to the",
  "measured AME2020 values, A ≥ 16), so the shell bumps and helium's spike",
  "are ironed out; the scale is compressed (asinh) to show both sides.",
  "",
  "Each element is placed at its most abundant (or longest-lived) isotope.",
  "",
  "Superheavy values (Z ≥ ~104) are AME2020 extrapolations, not measured.",
  "",
  "Data: IAEA Nuclear Data Services LiveChart (AME2020 masses, NUBASE",
  "abundances & half-lives); radii & masses as on the main chart.",
];
notes.forEach((n, i) => lk += `<text x="${1180}" y="${1390 + i * 17}" font-size="12.5" fill="#99a">${n}</text>`);


// Standard grid, same colours, for reading the crowded heavy end
const G = { x: 1180, y: 1060, c: 30 };
let gt = `<text x="${G.x}" y="${G.y - 14}" font-size="16" font-weight="600" fill="#fff">The usual grid, same colours</text>`;
for (const e of els) {
  const c = periodicCell(e.z);
  const gx = c.f == null ? c.group - 1 : c.f + 3, gy = c.f == null ? c.period - 1 : c.period + 1.4;
  const x = G.x + gx * G.c, y = G.y + gy * G.c;
  gt += `<rect x="${x}" y="${y}" width="${G.c - 2}" height="${G.c - 2}" rx="3" fill="${col(e.sl)}" stroke="${e.z === 26 ? "#fff" : "none"}" stroke-width="2"/>`;
  gt += `<text x="${x + (G.c - 2) / 2}" y="${y + 18}" text-anchor="middle" font-size="10.5" font-weight="700" fill="${ink(col(e.sl))}">${e.sym}</text>`;
}
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" font-family="Inter, sans-serif">
<rect width="${W}" height="${H}" fill="${BG}"/>
<text x="70" y="70" font-size="34" font-weight="700" fill="#fff" letter-spacing="1">THE PERIODIC TABLE, BY WHICH WAY IS DOWNHILL</text>
<text x="70" y="104" font-size="17" fill="#ccd">The slope of the binding curve: ${SPECTRUM ? "violet to green" : "blue"} elements still give energy by fusing, ${SPECTRUM ? "orange to red" : "red"} ones by splitting. It crosses zero at iron and nickel.</text>
${s}${q}${bar}${lk}${gt}
<text x="${W - 40}" y="${H - 24}" text-anchor="end" font-size="13" fill="#667">triangleofeverything.com</text>
</svg>`;
fs.writeFileSync(SP + (SPECTRUM ? "/binding-slope-spectrum.svg" : "/binding-slope.svg"), svg);
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1.5 });
await page.setContent(`<html><body style="margin:0;background:${BG}">${svg}</body></html>`);
await page.screenshot({ path: SP + (SPECTRUM ? "/binding-slope-spectrum.png" : "/binding-slope.png") });
await browser.close();
console.log("ok", els.length, "x", rx, "y", my);
