// tools/powers-of-ten/math.js — shared helpers: easing, seeded randomness,
// the sky's frames (equatorial, ecliptic, galactic, supergalactic) and the
// camera's turns between them.

export const D = Math.PI / 180;
export const AU = 1.495978707e11, LY = 9.4607e15, PC = 3.0857e16, KPC = 1e3 * PC, MPC = 1e6 * PC;
export const R_EARTH = 6.371e6;

export const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
// 0 → 1 as x goes a → b (a > b runs it backwards)
export const ramp = (x, a, b) => { const t = clamp((x - a) / (b - a)); return t * t * (3 - 2 * t); };
// up from a to b, down from c to d
export const win = (x, a, b, c, d) => ramp(x, a, b) * (1 - ramp(x, c, d));

export function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
export const gauss = (r) => Math.sqrt(-2 * Math.log(r() + 1e-12)) * Math.cos(2 * Math.PI * r());

// ---------- vectors ----------
export const add = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
export const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
export const mul = (a, k) => [a[0] * k, a[1] * k, a[2] * k];
export const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
export const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
export const norm = (a) => mul(a, 1 / Math.hypot(...a));

// ---------- frames: everything in space is kept in galactic Cartesian
// (x → the Galactic Centre, y → l = 90°, z → the north galactic pole) ----------
const EQ2GAL = [
  [-0.0548755604, -0.8734370902, -0.4838350155],
  [0.4941094279, -0.4448296300, 0.7469822445],
  [-0.8676661490, -0.1980763734, 0.4559837762],
];
export const eqToGal = (v) => EQ2GAL.map((row) => dot(row, v));
const EPS = 23.4392911 * D;
// ecliptic (x → equinox, z → ecliptic pole) → equatorial
export const eclToEq = ([x, y, z]) => [x, y * Math.cos(EPS) - z * Math.sin(EPS), y * Math.sin(EPS) + z * Math.cos(EPS)];
export const eclToGal = (v) => eqToGal(eclToEq(v));
export const lb = (lDeg, bDeg, r = 1) => [r * Math.cos(bDeg * D) * Math.cos(lDeg * D), r * Math.cos(bDeg * D) * Math.sin(lDeg * D), r * Math.sin(bDeg * D)];
export const SG_POLE = lb(47.37, 6.32);
export const ECL_POLE = eclToGal([0, 0, 1]);
export const GAL_POLE = [0, 0, 1];

// ---------- the moment (2026-10-29 20:00 UTC, early afternoon at the tree) ----------
export const JD = 2461343.3333;
const d2000 = JD - 2451545.0;
export const SITE = { lat: 36.5816, lon: -118.7511 }; // the General Sherman tree, Sequoia National Park
const gmst = (280.46061837 + 360.98564736629 * d2000) * D;
const lst = gmst + SITE.lon * D, phi = SITE.lat * D;
export const UP = eqToGal([Math.cos(phi) * Math.cos(lst), Math.cos(phi) * Math.sin(lst), Math.sin(phi)]);
export const NORTH = eqToGal([-Math.sin(phi) * Math.cos(lst), -Math.sin(phi) * Math.sin(lst), Math.cos(phi)]);

// planets on circular ecliptic orbits from their mean longitudes (good to a few degrees)
export const PLANETS = [
  ["Mercury", 0.387, 252.25, 4.09233445, 2.44e6],
  ["Venus", 0.723, 181.98, 1.60213034, 6.05e6],
  ["Earth", 1.0, 100.46, 0.98560910, 6.371e6],
  ["Mars", 1.524, 355.43, 0.52403840, 3.39e6],
  ["Jupiter", 5.203, 34.35, 0.08308529, 6.99e7],
  ["Saturn", 9.537, 50.08, 0.03344414, 5.82e7],
  ["Uranus", 19.19, 314.06, 0.01172834, 2.54e7],
  ["Neptune", 30.07, 304.35, 0.00598103, 2.46e7],
].map(([name, a, L0, n, r]) => {
  const L = (L0 + n * d2000) * D;
  return { name, a: a * AU, r, angle: L, pos: eclToGal([a * AU * Math.cos(L), a * AU * Math.sin(L), 0]) };
});
export const EARTH_C = mul(UP, -R_EARTH); // Earth's centre, straight below the tree
export const SUN = sub(EARTH_C, PLANETS[2].pos);
const moonL = (218.316 + 13.176396 * d2000) * D;
export const MOON = add(EARTH_C, eclToGal([3.844e8 * Math.cos(moonL), 3.844e8 * Math.sin(moonL), 0]));
export const eclAxes = { x: eclToGal([1, 0, 0]), y: eclToGal([0, 1, 0]) };

// ---------- camera turns: right, up, toward-viewer (right-handed) ----------
function basis(toward, upHint) {
  const up = norm(sub(upHint, mul(toward, dot(upHint, toward))));
  return { r: cross(up, toward), u: up, n: toward };
}
function toQuat({ r, u, n }) {
  // rows of the world → camera rotation
  const m = [r, u, n], t = m[0][0] + m[1][1] + m[2][2];
  let q;
  if (t > 0) { const s = Math.sqrt(t + 1) * 2; q = [(m[1][2] - m[2][1]) / s, (m[2][0] - m[0][2]) / s, (m[0][1] - m[1][0]) / s, 0.25 * s]; }
  else if (m[0][0] > m[1][1] && m[0][0] > m[2][2]) { const s = Math.sqrt(1 + m[0][0] - m[1][1] - m[2][2]) * 2; q = [0.25 * s, (m[1][0] + m[0][1]) / s, (m[2][0] + m[0][2]) / s, (m[1][2] - m[2][1]) / s]; }
  else if (m[1][1] > m[2][2]) { const s = Math.sqrt(1 + m[1][1] - m[0][0] - m[2][2]) * 2; q = [(m[1][0] + m[0][1]) / s, 0.25 * s, (m[2][1] + m[1][2]) / s, (m[2][0] - m[0][2]) / s]; }
  else { const s = Math.sqrt(1 + m[2][2] - m[0][0] - m[1][1]) * 2; q = [(m[2][0] + m[0][2]) / s, (m[2][1] + m[1][2]) / s, 0.25 * s, (m[0][1] - m[1][0]) / s]; }
  return q;
}
function fromQuat([x, y, z, w]) {
  const m = [
    [1 - 2 * (y * y + z * z), 2 * (x * y + z * w), 2 * (x * z - y * w)],
    [2 * (x * y - z * w), 1 - 2 * (x * x + z * z), 2 * (y * z + x * w)],
    [2 * (x * z + y * w), 2 * (y * z - x * w), 1 - 2 * (x * x + y * y)],
  ];
  return { r: m[0], u: m[1], n: m[2] };
}
function slerp(a, b, t) {
  let d = a[0] * b[0] + a[1] * b[1] + a[2] * b[2] + a[3] * b[3];
  if (d < 0) { b = b.map((v) => -v); d = -d; }
  if (d > 0.9995) { const q = a.map((v, i) => v + (b[i] - v) * t); const l = Math.hypot(...q); return q.map((v) => v / l); }
  const th = Math.acos(d), s = Math.sin(th);
  return a.map((v, i) => (Math.sin((1 - t) * th) * v + Math.sin(t * th) * b[i]) / s);
}

// looking straight down on the tree (north up) → down on the ecliptic → on the
// Galaxy → on the supergalactic plane, the galactic pole up, as the spectrum Cloud has it
const K0 = basis(UP, NORTH);
const K1 = basis(ECL_POLE, K0.u);
const K2 = basis(GAL_POLE, K1.u);
const K3 = basis(SG_POLE, GAL_POLE);
const KEYS = [[7.6, K0], [9.6, K1], [15.0, K1], [16.8, K2], [22.6, K2], [24.2, K3]].map(([s, k]) => [s, toQuat(k)]);
// among the galaxies the camera swings round the vertical and back, so the
// cosmic web's depth shows as it moves (parallax), face-on again for the Cloud
const SWING = [23.4, 25.9], SWING_DEG = 40;
export function cameraAt(s) {
  const b = keyed(s), th = SWING_DEG * D * Math.sin(Math.PI * clamp((s - SWING[0]) / (SWING[1] - SWING[0])));
  if (!th) return b;
  const c = Math.cos(th), sn = Math.sin(th);
  return { r: add(mul(b.r, c), mul(b.n, sn)), u: b.u, n: sub(mul(b.n, c), mul(b.r, sn)) };
}
function keyed(s) {
  if (s <= KEYS[0][0]) return fromQuat(KEYS[0][1]);
  for (let i = 1; i < KEYS.length; i++) {
    if (s <= KEYS[i][0]) return fromQuat(slerp(KEYS[i - 1][1], KEYS[i][1], ramp(s, KEYS[i - 1][0], KEYS[i][0])));
  }
  return fromQuat(KEYS[KEYS.length - 1][1]);
}
export const FINAL_VIEW = K3;
