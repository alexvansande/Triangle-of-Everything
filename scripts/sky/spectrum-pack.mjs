// Shared by the Earth and Sun spectrum builds: normalise a band to 0…1 and
// pack three bands per RGB image, in the format tools/sky-spectrum.html reads.
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import sharp from "sharp";

// log, asinh or linear stretch, then the [lo, hi] percentiles → 0…255
export function normalise(vals, stretch = "lin", loPct = 0.01, hiPct = 0.998) {
  const finite = [];
  for (let i = 0; i < vals.length; i += 17) if (Number.isFinite(vals[i])) finite.push(vals[i]);
  finite.sort((a, b) => a - b);
  const q = (p) => finite[Math.floor(p * (finite.length - 1))];
  let f = (v) => v;
  if (stretch === "log") {
    const floor = Math.max(q(0.005), q(0.5) * 1e-3, 1e-12);
    f = (v) => Math.log10(Math.max(v, floor));
  } else if (stretch === "asinh") {
    const med = q(0.5), mad = q(0.75) - q(0.25) || 1;
    f = (v) => Math.asinh((v - med) / (2 * mad));
  }
  const t = finite.map(f).sort((a, b) => a - b);
  const lo = t[Math.floor(loPct * (t.length - 1))], hi = t[Math.floor(hiPct * (t.length - 1))];
  const out = new Uint8Array(vals.length);
  for (let i = 0; i < vals.length; i++) {
    if (!Number.isFinite(vals[i])) continue;
    out[i] = Math.round(255 * Math.max(0, Math.min(1, (f(vals[i]) - lo) / (hi - lo || 1))));
  }
  return out;
}

// bands: [{ id, name, wave, what, source, region, grey (Uint8Array W×H) | empty }]
export async function writePacks(outDir, W, H, bands, extra = {}) {
  const packs = [];
  for (let p = 0; p * 3 < bands.length; p++) {
    const rgb = Buffer.alloc(W * H * 3);
    for (let c = 0; c < 3; c++) {
      const g = bands[p * 3 + c]?.grey;
      if (g) for (let i = 0; i < W * H; i++) rgb[3 * i + c] = g[i];
    }
    const file = `pack-${p}.jpg`;
    await sharp(rgb, { raw: { width: W, height: H, channels: 3 } })
      .jpeg({ quality: 90, chromaSubsampling: "4:4:4" }).toFile(join(outDir, file));
    packs.push(file);
  }
  writeFileSync(join(outDir, "bands.json"), JSON.stringify({
    width: W, height: H, packs, ...extra,
    bands: bands.map(({ id, name, wave, what, source, region, empty }, i) =>
      ({ id, name, wave, what, source, region, empty: !!empty, pack: Math.floor(i / 3), channel: i % 3 })),
  }, null, 1));
  return packs;
}
