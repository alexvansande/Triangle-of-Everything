// Shared by the generator and local editor. Mirrors chart blend exclusions.
import { readFileSync } from 'node:fs';
import sharp from 'sharp';
import { SHADOWED_SCREEN_SPHERES } from '../src/star-light.js';
import { LUMINOUS_CATS, LUMINOUS_SLUGS } from '../src/luminous-art.js';
const SCREEN_BLEND_CATS = LUMINOUS_CATS;
// The legacy black-hole icons can be absent from objects.json/dust-famous.
const SCREEN_BLEND_SLUGS = new Set([...LUMINOUS_SLUGS, "3k-bh", "primordial-black-hole"]);
const nameToSlug = (name) => name.toLowerCase()
  .replace(/γ/g, "gamma").replace(/τ/g, "tau").replace(/μ/g, "mu")
  .replace(/['’]/g, "").replace(/[*()]/g, "")
  .replace(/[₀-₉]/g, (d) => String(d.charCodeAt(0) - 0x2080))
  .replace(/ö/g, "o").replace(/ü/g, "u").replace(/ä/g, "a")
  .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

export function iconCategories() {
  const assets = readFileSync("src/assets.js", "utf8");
  const map = {};
  for (const [, a, b] of assets.match(/ICON_SLUG_MAP = \{([\s\S]*?)\};/)[1].matchAll(/"([^"]+)":\s*"([^"]+)"/g)) map[a] = b;
  const cat = {};
  for (const o of JSON.parse(readFileSync("src/objects.json", "utf8"))) cat[o.slug || nameToSlug(o.name)] = o.cat;
  const dust = JSON.parse(readFileSync("src/dust.json", "utf8"));
  const srcCat = Object.fromEntries(dust.sources.map(s => [s.id, s.cat]));
  for (const f of JSON.parse(readFileSync("src/dust-famous.json", "utf8"))) {
    const slug = nameToSlug(f.label || f.name);
    if (!(slug in cat)) cat[slug] = srcCat[f.source];
  }
  return (file) => { const slug = map[file] || file; return { slug, cat: cat[slug] }; };
}


const categoryFor = iconCategories();
export async function shadowExclusion(file) {
  const {slug, cat} = categoryFor(file);
  if (SHADOWED_SCREEN_SPHERES.has(slug)) return null;
  // Approved hybrid optical layers: faint cast shadow plus a central ember.
  if (['y-brown-dwarf','t-brown-dwarf','l-brown-dwarf'].includes(slug)) return null;
  if (SCREEN_BLEND_CATS.has(cat) || SCREEN_BLEND_SLUGS.has(slug) || slug.includes('void')) return 'Luminous artwork has no shadow';
  // Catch unclassified opaque black-backed pictures too. Transparent black
  // pixels are not a black background: their alpha must also be opaque.
  const {data, info} = await sharp(`content/icons/${file}.webp`).resize(16,16).ensureAlpha().raw().toBuffer({resolveWithObject:true});
  const corners = [[0,0],[15,0],[0,15],[15,15]];
  const black = corners.filter(([x,y]) => {const i=(y*16+x)*info.channels;return data[i+3]>240 && Math.max(data[i],data[i+1],data[i+2])<35;}).length;
  return black>=3 ? 'Black-background artwork has no shadow' : null;
}
