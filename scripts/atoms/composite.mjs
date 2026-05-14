// Build the canonical atom / molecule images from spirograph renders.
//
// Each image is composed of two layers:
//   1. NUCLEUS — sphere-packed protons + neutrons rendered back-to-front
//      using the painter's algorithm. Before drawing each front-er nucleon
//      we paint a soft black knockout disc so it cleanly occludes whatever
//      sat behind it; no opacity tricks anywhere.
//   2. ELECTRON CLOUD — a sparse mostly-black orbital cage screen-blended
//      on top. Its dark gaps let the nucleus underneath show through.
//
// Per-nucleon screen diameter is constant across the whole set (NUCLEON_PX),
// so an H proton in H₂O reads at the same size as one of O's 16 nucleons.
//
// See README.md for the full write-up.
import sharp from 'sharp';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE     = path.dirname(fileURLToPath(import.meta.url));
const SPHERES  = path.join(HERE, 'spheres');
const NUCLEONS = path.join(HERE, 'nucleons');
const OUT      = HERE;
const sphere   = n => path.join(SPHERES,  `sphere${n}.png`);
const proton   = n => path.join(NUCLEONS, `proton${n}.png`);
const neutron  = n => path.join(NUCLEONS, `neutron${n}.png`);

const PROTON_VARIANTS  = [1, 2, 3, 4, 5, 6].map(proton);
const NEUTRON_VARIANTS = [1, 2, 3, 4, 5, 6].map(neutron);

// Random packing with min-distance rejection, seeded.
function rng(seed) {
  let s = seed | 0 || 1;
  return () => { s = (s * 1103515245 + 12345) & 0x7fffffff; return s / 0x7fffffff; };
}
function packPositions(N, { minDist = 1.0, maxR, seed = 7 } = {}) {
  if (N <= 1) return { positions: [[0, 0, 0]], maxR: 0 };
  // Auto-size the cluster radius from N when not overridden. Random close
  // packing of monodisperse spheres reaches a volume fraction of ~0.64; the
  // minimum enclosing-sphere radius is R = 0.5 * (N / 0.64)^(1/3). We add a
  // 20% buffer so the rejection sampler can actually achieve that packing.
  if (maxR == null) maxR = Math.max(1.9, 1.2 * 0.5 * Math.cbrt(N / 0.64));
  const rand = rng(seed);
  const out = [[0, 0, 0]];
  let attempts = 0;
  // Scale attempt budget with N so large clusters still get a fair shot.
  const ATTEMPT_BUDGET = Math.max(20000, N * 500);
  while (out.length < N && attempts < ATTEMPT_BUDGET) {
    attempts++;
    const r = maxR * Math.cbrt(rand());
    const u = 2 * rand() - 1;
    const theta = 2 * Math.PI * rand();
    const s = Math.sqrt(1 - u * u);
    const x = r * s * Math.cos(theta), y = r * s * Math.sin(theta), z = r * u;
    let ok = true;
    for (const [px, py, pz] of out) {
      const dx = px - x, dy = py - y, dz = pz - z;
      if (dx * dx + dy * dy + dz * dz < minDist * minDist) { ok = false; break; }
    }
    if (ok) out.push([x, y, z]);
  }
  return { positions: out, maxR };
}

// Soft black disc used to knock out the nucleon-shaped region of the current
// canvas before drawing the next (front-er) nucleon. The blur softens the
// edge so adjacent balls blend smoothly instead of showing a hard cut.
async function knockoutDisc(coreDiameter, blurRadius) {
  const padding = Math.ceil(blurRadius * 2);
  const size = coreDiameter + padding * 2;
  const r = coreDiameter / 2;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}">
    <circle cx="${size / 2}" cy="${size / 2}" r="${r}" fill="black"/>
  </svg>`;
  return sharp(Buffer.from(svg)).blur(blurRadius).png().toBuffer();
}

async function resized(src, size) {
  return sharp(src).resize(size, size, { fit: 'fill' }).toBuffer();
}

// Build the interleaved [knockout, nucleon, knockout, nucleon, ...] op list
// for one nucleus. Front nucleons come last so they paint over the rest.
async function stackedNucleusOps(nProton, nNeutron, cx, cy, nucleonSize, packFactor, seed) {
  const N = nProton + nNeutron;
  const { positions, maxR } = packPositions(N, { minDist: 1.0, seed });

  // Assign proton/neutron + variant per index (deterministic from seed).
  const rand = rng(seed + 1);
  const idx = positions.map((_, i) => i);
  for (let i = idx.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [idx[i], idx[j]] = [idx[j], idx[i]];
  }
  const isProton = new Set(idx.slice(0, nProton));
  const variants = positions.map(() => Math.floor(rand() * 6));

  // Back-to-front so the painter's algorithm + knockouts stack correctly.
  const order = positions.map((p, i) => ({ p, i })).sort((a, b) => a.p[2] - b.p[2]);

  const positionScale = nucleonSize * packFactor;
  // The bright core of a spirograph nucleon is roughly 60% of its full image.
  // Knock out a slightly-smaller disc so the halo of the front ball still
  // tapers into whatever it covers (avoids a hard black ring).
  const KNOCKOUT_FRAC = 0.62;
  const BLUR_FRAC = 0.10;
  // Depth normalization uses the actual cluster radius (which grows with N
  // via the adaptive maxR in packPositions), so perspective scaling stays
  // proportional for both small and large nuclei.
  const zSpan = Math.max(0.001, 2 * maxR);

  const ops = [];
  let first = true;
  for (const { p, i } of order) {
    const [x, y, z] = p;
    // Mild perspective only — no opacity falloff.
    const depthF = (z + maxR) / zSpan;
    const sizeScale = 0.85 + 0.22 * depthF;
    const size = Math.max(8, Math.round(nucleonSize * sizeScale));
    const px = cx + x * positionScale;
    const py = cy + y * positionScale;

    // For everything after the back-most ball, knock out the region this ball
    // will cover so it appears to sit on top of the prior layer.
    if (!first) {
      const koDia = Math.round(size * KNOCKOUT_FRAC);
      const blur = Math.max(2, Math.round(size * BLUR_FRAC));
      const ko = await knockoutDisc(koDia, blur);
      const koSize = koDia + Math.ceil(blur * 2) * 2;
      ops.push({
        input: ko,
        left: Math.round(px - koSize / 2),
        top:  Math.round(py - koSize / 2),
        blend: 'over',
      });
    }
    first = false;

    const src = isProton.has(i) ? PROTON_VARIANTS[variants[i]] : NEUTRON_VARIANTS[variants[i]];
    const buf = await resized(src, size);
    ops.push({
      input: buf,
      left: Math.round(px - size / 2),
      top:  Math.round(py - size / 2),
      blend: 'screen',
    });
  }
  return ops;
}

// Shared per-nucleon screen diameter — keeps an H proton the same size as
// any one of O's 16 packed nucleons.
const NUCLEON_PX = 165;
const PACK = 0.55;               // bright cores nearly touching

// =========================================================================
// HYDROGEN — single proton in a transparent orbital cage.
// The lone nucleon is allowed to be a touch larger here so it reads at
// standalone scale — but not as huge as the earlier 380px version.
// =========================================================================
{
  const C = 1024;
  const E_SIZE = 900;
  const H_NUCLEON_PX = 300;      // a bit smaller than the previous 380

  const ops = await stackedNucleusOps(1, 0, C / 2, C / 2, H_NUCLEON_PX, 0, 11);
  const elec = await resized(sphere(1), E_SIZE);

  const base = sharp({
    create: { width: C, height: C, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 1 } },
  }).png();

  const out = await base
    .composite([
      ...ops,
      { input: elec, left: (C - E_SIZE) / 2, top: (C - E_SIZE) / 2, blend: 'screen' },
    ])
    .png()
    .toFile(path.join(OUT, 'hydrogen.png'));
  console.log('wrote hydrogen.png', out);
}

// =========================================================================
// HELIUM — 2 protons + 2 neutrons (⁴He). Very compact nucleus.
// =========================================================================
{
  const C = 1024;
  const E_SIZE = 820;            // He cloud is small (real atomic radius < H)
  const ops = await stackedNucleusOps(2, 2, C / 2, C / 2, NUCLEON_PX, PACK, 53);
  const elec = await resized(sphere(2), E_SIZE);

  const base = sharp({
    create: { width: C, height: C, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 1 } },
  }).png();

  const out = await base
    .composite([
      ...ops,
      { input: elec, left: (C - E_SIZE) / 2, top: (C - E_SIZE) / 2, blend: 'screen' },
    ])
    .png()
    .toFile(path.join(OUT, 'helium.png'));
  console.log('wrote helium.png', out);
}

// =========================================================================
// CARBON — 6 protons + 6 neutrons (¹²C).
// =========================================================================
{
  const C = 1024;
  const E_SIZE = 880;
  const ops = await stackedNucleusOps(6, 6, C / 2, C / 2, NUCLEON_PX, PACK, 67);
  const elec = await resized(sphere(3), E_SIZE);

  const base = sharp({
    create: { width: C, height: C, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 1 } },
  }).png();

  const out = await base
    .composite([
      ...ops,
      { input: elec, left: (C - E_SIZE) / 2, top: (C - E_SIZE) / 2, blend: 'screen' },
    ])
    .png()
    .toFile(path.join(OUT, 'carbon.png'));
  console.log('wrote carbon.png', out);
}

// =========================================================================
// OXYGEN ATOM — 8 protons + 8 neutrons. (Distinct from O₂ which is two of these.)
// =========================================================================
{
  const C = 1024;
  const E_SIZE = 900;
  const ops = await stackedNucleusOps(8, 8, C / 2, C / 2, NUCLEON_PX, PACK, 79);
  const elec = await resized(sphere(1), E_SIZE);

  const base = sharp({
    create: { width: C, height: C, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 1 } },
  }).png();

  const out = await base
    .composite([
      ...ops,
      { input: elec, left: (C - E_SIZE) / 2, top: (C - E_SIZE) / 2, blend: 'screen' },
    ])
    .png()
    .toFile(path.join(OUT, 'oxygen.png'));
  console.log('wrote oxygen.png', out);
}

// =========================================================================
// IRON — ⁵⁶Fe: 26 p + 30 n. Mid-size nucleus, still fits a 1024² canvas.
// =========================================================================
{
  const C = 1024;
  const E_SIZE = 920;
  const ops = await stackedNucleusOps(26, 30, C / 2, C / 2, NUCLEON_PX, PACK, 97);
  const elec = await resized(sphere(4), E_SIZE);

  const base = sharp({
    create: { width: C, height: C, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 1 } },
  }).png();

  const out = await base
    .composite([
      ...ops,
      { input: elec, left: (C - E_SIZE) / 2, top: (C - E_SIZE) / 2, blend: 'screen' },
    ])
    .png()
    .toFile(path.join(OUT, 'iron.png'));
  console.log('wrote iron.png', out);
}

// =========================================================================
// GOLD — ¹⁹⁷Au: 79 p + 118 n. Cluster gets big — canvas grows accordingly.
// =========================================================================
{
  const C = 1280;
  const E_SIZE = 1180;
  const ops = await stackedNucleusOps(79, 118, C / 2, C / 2, NUCLEON_PX, PACK, 113);
  const elec = await resized(sphere(5), E_SIZE);

  const base = sharp({
    create: { width: C, height: C, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 1 } },
  }).png();

  const out = await base
    .composite([
      ...ops,
      { input: elec, left: (C - E_SIZE) / 2, top: (C - E_SIZE) / 2, blend: 'screen' },
    ])
    .png()
    .toFile(path.join(OUT, 'gold.png'));
  console.log('wrote gold.png', out);
}

// =========================================================================
// URANIUM — ²³⁸U: 92 p + 146 n. The biggest cluster we ask for.
// =========================================================================
{
  const C = 1400;
  const E_SIZE = 1300;
  const ops = await stackedNucleusOps(92, 146, C / 2, C / 2, NUCLEON_PX, PACK, 127);
  const elec = await resized(sphere(7), E_SIZE);

  const base = sharp({
    create: { width: C, height: C, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 1 } },
  }).png();

  const out = await base
    .composite([
      ...ops,
      { input: elec, left: (C - E_SIZE) / 2, top: (C - E_SIZE) / 2, blend: 'screen' },
    ])
    .png()
    .toFile(path.join(OUT, 'uranium.png'));
  console.log('wrote uranium.png', out);
}

// =========================================================================
// O₂ — two oxygens, each a stack of 8 protons + 8 neutrons.
// =========================================================================
{
  const W = 1700, H = 1024;
  const E_SIZE = 950;
  const dx = E_SIZE * 0.78;

  const cxL = W / 2 - dx / 2;
  const cxR = W / 2 + dx / 2;
  const cy = H / 2;

  const nucL = await stackedNucleusOps(8, 8, cxL, cy, NUCLEON_PX, PACK, 17);
  const nucR = await stackedNucleusOps(8, 8, cxR, cy, NUCLEON_PX, PACK, 23);

  const elecL = await resized(sphere(2), E_SIZE);
  const elecR = await resized(sphere(6), E_SIZE);

  const base = sharp({
    create: { width: W, height: H, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 1 } },
  }).png();

  const out = await base
    .composite([
      ...nucL,
      ...nucR,
      { input: elecL, left: Math.round(cxL - E_SIZE / 2), top: Math.round(cy - E_SIZE / 2), blend: 'screen' },
      { input: elecR, left: Math.round(cxR - E_SIZE / 2), top: Math.round(cy - E_SIZE / 2), blend: 'screen' },
    ])
    .png()
    .toFile(path.join(OUT, 'o2.png'));
  console.log('wrote o2.png', out);
}

// =========================================================================
// H₂O — packed oxygen (8p + 8n) + two single-proton hydrogens at 104.5°.
// The H electron clouds are shrunk so that the H proton matches one O nucleon
// (NUCLEON_PX everywhere); chemically H is smaller than O anyway, so this
// reads correctly.
// =========================================================================
{
  const C = 1400;
  const O_SIZE = 900;
  const H_SIZE = 460;            // shrunk from 560 — H atom is smaller than O
  const BOND = 470;              // pulled in to match the smaller H clouds
  const half = (104.5 / 2) * Math.PI / 180;

  const Ocx = C / 2;
  const Ocy = C / 2 - 80;
  const H1cx = Ocx - BOND * Math.sin(half);
  const H1cy = Ocy + BOND * Math.cos(half);
  const H2cx = Ocx + BOND * Math.sin(half);
  const H2cy = Ocy + BOND * Math.cos(half);

  const nucO  = await stackedNucleusOps(8, 8, Ocx,  Ocy,  NUCLEON_PX, PACK, 31);
  const nucH1 = await stackedNucleusOps(1, 0, H1cx, H1cy, NUCLEON_PX, 0,    41);
  const nucH2 = await stackedNucleusOps(1, 0, H2cx, H2cy, NUCLEON_PX, 0,    43);

  const O  = await resized(sphere(1), O_SIZE);
  const H1 = await resized(sphere(3), H_SIZE);
  const H2 = await resized(sphere(4), H_SIZE);

  const base = sharp({
    create: { width: C, height: C, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 1 } },
  }).png();

  const out = await base
    .composite([
      ...nucO,
      ...nucH1,
      ...nucH2,
      { input: O,  left: Math.round(Ocx  - O_SIZE / 2), top: Math.round(Ocy  - O_SIZE / 2), blend: 'screen' },
      { input: H1, left: Math.round(H1cx - H_SIZE / 2), top: Math.round(H1cy - H_SIZE / 2), blend: 'screen' },
      { input: H2, left: Math.round(H2cx - H_SIZE / 2), top: Math.round(H2cy - H_SIZE / 2), blend: 'screen' },
    ])
    .png()
    .toFile(path.join(OUT, 'h2o.png'));
  console.log('wrote h2o.png', out);
}
