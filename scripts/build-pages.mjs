// =============================================================
// build-pages.mjs — one real, shareable page per object (runs after vite build)
// =============================================================
// The app is a single page whose state lives in the URL. Search engines and
// link previews only see one page that way, so after `vite build` this
// writes, for every hand-placed object and every info-panel article:
//
//   dist/<slug>/index.html   the app's own index.html with that object's
//                            <title>, description, canonical URL, Open Graph
//                            / Twitter tags and the article text (noscript),
//                            plus window.__TOE_PAGE__ so the app opens it
//   dist/og/<slug>.jpg       a 1200×630 preview image: picture, name, size
//
// and dist/sitemap.xml, dist/robots.txt and dist/404.html (the app itself,
// so unknown paths still load the map). The app keeps the URL in sync with
// history.replaceState: /<slug>/#cx,cy,zoom (see saveHash in main.js).
//
// Text in the preview images is drawn as vector outlines from the site's
// own Inter font (scripts/og/Inter-*.ttf, static instances of the variable
// font) so the images come out identical locally and on CI.
// =============================================================

import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import opentype from "opentype.js";
import { friendlyRadius, friendlyMass } from "../src/format.js";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const DIST = join(ROOT, "dist");
const SITE = "https://triangleofeverything.com";
const WIDTH_LOG_OFFSET = Math.log10(2); // radius → width, as in the app

const CAT_LABEL = {
  particle: "Particle", composite: "Composite particle", atomic: "Atoms & molecules",
  micro: "Microscopic", macro: "Everyday scale", planet: "Planets & small bodies",
  star: "Stars", remnant: "Stellar remnants & nebulae", blackhole: "Black holes",
  galaxy: "Galaxies & clusters", largescale: "Large-scale structure",
};
const CAT_COLOR = {
  particle: "#00e5ff", composite: "#ff9800", atomic: "#64ffda", micro: "#76ff03",
  macro: "#69f0ae", planet: "#448aff", star: "#ffd740", remnant: "#e0e0e0",
  blackhole: "#ff1744", galaxy: "#d500f9", largescale: "#f48fb1",
};

// Same rules as nameToSlug() in src/main.js
const nameToSlug = (name) => name.toLowerCase()
  .replace(/γ/g, "gamma").replace(/τ/g, "tau").replace(/μ/g, "mu")
  .replace(/['']/g, "").replace(/[*()]/g, "")
  .replace(/[₀₁₂₃₄₅₆₇₈₉]/g, (d) => "0123456789"["₀₁₂₃₄₅₆₇₈₉".indexOf(d)])
  .replace(/ö/g, "o").replace(/ü/g, "u").replace(/ä/g, "a")
  .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

// Markdown (the app's small dialect) → plain text / simple HTML
function stripFrontmatter(md) {
  const t = md.trim();
  if (!t.startsWith("---")) return t;
  const end = t.indexOf("---", 3);
  return end < 0 ? t : t.slice(end + 3).trim();
}
function mdInline(s, html) {
  s = s
    .replace(/\$\$(.+?)\$\$/gs, "$1").replace(/\$(.+?)\$/g, "$1")
    .replace(/\[\[>?@?[\d.,-]*:?([^|\]]+?)(?:\|([^\]]+?))?\]\]/g, (_, a, b) => (b || a).trim())
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, html ? "\u0000a href=\"$2\"\u0001$1\u0000/a\u0001" : "$1");
  if (!html) return s.replace(/\*\*(.+?)\*\*/g, "$1").replace(/\*(.+?)\*/g, "$1").replace(/<[^>]+>/g, "");
  return esc(s.replace(/<[^>]+>/g, ""))
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>").replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/\u0000/g, "<").replace(/\u0001/g, ">");
}
const mdParagraphs = (md) => stripFrontmatter(md).split(/\n\n+/).map((p) => p.trim()).filter(Boolean);
function summary(md, max = 158) {
  const t = mdParagraphs(md).map((p) => mdInline(p, false)).join(" ").replace(/\s+/g, " ").trim();
  if (t.length <= max) return t;
  const cut = t.slice(0, max);
  return cut.slice(0, cut.lastIndexOf(" ")).replace(/[,;:—-]$/, "") + "…";
}

// ---------------------------------------------------------------- data --
const objects = JSON.parse(readFileSync(join(ROOT, "src", "objects.json"), "utf8"));
const descDir = join(ROOT, "content", "descriptions");
const DESC = Object.fromEntries(readdirSync(descDir).filter((f) => f.endsWith(".md"))
  .map((f) => [f.slice(0, -3), readFileSync(join(descDir, f), "utf8")]));

const pages = new Map();
for (const o of objects) {
  const slug = o.slug || nameToSlug(o.name);
  if (pages.has(slug)) continue;
  pages.set(slug, { slug, name: o.sidebarName || o.name, obj: o, md: DESC[slug] || "" });
}
// Info-panel articles with no object of their own (units, eras, regions…)
for (const [slug, md] of Object.entries(DESC)) {
  if (pages.has(slug)) continue;
  const lead = stripFrontmatter(md).match(/^([A-Z][^:\n]{1,60}):\s/);
  const name = lead ? lead[1].trim() : slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  pages.set(slug, { slug, name, obj: null, md });
}

// ------------------------------------------------------- preview image --
const font = (w) => opentype.parse(readFileSync(join(ROOT, "scripts", "og", `Inter-${w}.ttf`)).buffer);
const FONT = { 400: font(400), 700: font(700) };
// Plain glyph run with kerning: opentype.js trips on Inter's chained
// contextual substitutions (calt etc.), which titles don't need anyway.
const TEXT_OPTS = { kerning: true, features: { liga: false, rlig: false, calt: false, ccmp: false } };
// The Latin subset has no subscripts / astronomy glyphs: plain-text stand-ins
const ogText = (s) => s.replace(/[₀-₉]/g, (d) => "0123456789"[d.charCodeAt(0) - 0x2080])
  .replace(/[⁰¹²³⁴-⁹]/g, (d) => ({ "⁰": "0", "¹": "1", "²": "2", "³": "3" }[d] ?? "0123456789"[d.charCodeAt(0) - 0x2070]))
  .replace(/☉/g, "sun").replace(/⊕/g, "Earth").replace(/[*]/g, "");
function textPath(s, w, size, x, y, fill) {
  const p = FONT[w].getPath(ogText(s), x, y, size, TEXT_OPTS);
  return `<path d="${p.toPathData(1)}" fill="${fill}"/>`;
}
const textWidth = (s, w, size) => FONT[w].getAdvanceWidth(ogText(s), size, TEXT_OPTS);
function wrap(s, w, size, maxW, maxLines) {
  const words = s.split(/\s+/), lines = [];
  let cur = "";
  for (const word of words) {
    const t = cur ? `${cur} ${word}` : word;
    if (textWidth(t, w, size) <= maxW || !cur) cur = t;
    else { lines.push(cur); cur = word; }
  }
  if (cur) lines.push(cur);
  if (lines.length > maxLines) {
    lines.length = maxLines;
    while (textWidth(lines[maxLines - 1] + "…", w, size) > maxW) lines[maxLines - 1] = lines[maxLines - 1].replace(/\s*\S+$/, "");
    lines[maxLines - 1] += "…";
  }
  return lines;
}

const manifest = JSON.parse(readFileSync(join(ROOT, "content", "images", "manifest.json"), "utf8"));
function pictureFor(slug) {
  // Transparent icon artwork first (it sits on the card like on the map),
  // then the sidebar photo, then the small 128 px icon as a last resort.
  const cands = [
    join(ROOT, "content", "icons", "src", `${slug}.png`),
    manifest[slug] && join(ROOT, "content", "images", manifest[slug].file),
    join(ROOT, "content", "images", `${slug}.webp`),
    join(ROOT, "content", "icons", `${slug}.webp`),
  ].filter(Boolean);
  return cands.find((p) => existsSync(p)) || null;
}

let BG = null;
async function background() {
  if (BG) return BG;
  // The site's own preview art, darkened and blurred, keeps every card on-brand
  BG = await sharp(join(ROOT, "public", "og-preview.jpg"))
    .resize(1200, 630, { fit: "cover" }).blur(18).modulate({ brightness: 0.38, saturation: 0.9 })
    .png().toBuffer();
  return BG;
}

async function ogImage(page, out) {
  const W = 1200, H = 630, PIC = 470, PX = 70;
  const color = CAT_COLOR[page.obj?.cat] || "#80deea";
  const layers = [];
  const pic = pictureFor(page.slug);
  if (pic) {
    const buf = await sharp(pic).resize(PIC, PIC, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toBuffer();
    layers.push({ input: buf, left: PX, top: Math.round((H - PIC) / 2) });
  } else {
    const r = 70, cx = PX + PIC / 2, cy = H / 2;
    layers.push({ input: Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
      <defs><radialGradient id="g"><stop offset="0" stop-color="${color}" stop-opacity="0.9"/><stop offset="1" stop-color="${color}" stop-opacity="0"/></radialGradient></defs>
      <circle cx="${cx}" cy="${cy}" r="${r * 2.6}" fill="url(#g)" opacity="0.5"/><circle cx="${cx}" cy="${cy}" r="${r / 2.6}" fill="${color}"/></svg>`), left: 0, top: 0 });
  }
  // Text column
  const TX = PX + PIC + 60, TW = W - TX - 60;
  let y = 170;
  const svg = [];
  const kicker = page.obj ? (CAT_LABEL[page.obj.cat] || "") : "The Triangle of Everything";
  if (kicker) { svg.push(textPath(kicker.toUpperCase(), 700, 22, TX, y, color)); y += 26; }
  const titleSize = textWidth(page.name, 700, 64) > TW * 1.6 ? 50 : 64;
  for (const line of wrap(page.name, 700, titleSize, TW, 3)) { y += titleSize * 1.12; svg.push(textPath(line, 700, titleSize, TX, y, "#ffffff")); }
  y += 34;
  if (page.obj) {
    const o = page.obj;
    const facts = [`Width ≈ ${friendlyRadius(o.logR + WIDTH_LOG_OFFSET)}`, `Mass ≈ ${friendlyMass(o.logM)}`];
    for (const f of facts) { y += 40; svg.push(textPath(f.replace("≈", "~"), 400, 30, TX, y, "rgba(255,255,255,0.78)")); }
  } else if (page.md) {
    for (const line of wrap(summary(page.md, 120), 400, 28, TW, 3)) { y += 38; svg.push(textPath(line, 400, 28, TX, y, "rgba(255,255,255,0.75)")); }
  }
  svg.push(textPath("triangleofeverything.com", 400, 24, TX, H - 60, "rgba(255,255,255,0.55)"));
  layers.push({ input: Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">${svg.join("")}</svg>`), left: 0, top: 0 });
  await sharp(await background()).composite(layers).jpeg({ quality: 82, mozjpeg: true }).toFile(out);
}

// ---------------------------------------------------------------- pages --
const template = readFileSync(join(DIST, "index.html"), "utf8");
writeFileSync(join(DIST, "404.html"), template); // unknown paths still load the map

function pageHtml(page) {
  const title = `${page.name} — The Triangle of Everything`;
  const facts = page.obj
    ? `Width ≈ ${friendlyRadius(page.obj.logR + WIDTH_LOG_OFFSET)}, mass ≈ ${friendlyMass(page.obj.logM)}. `
    : "";
  const desc = (page.md ? summary(page.md) : `${facts}See ${page.name} on an interactive chart of every object by mass and size.`);
  const url = `${SITE}/${page.slug}/`;
  const img = `${SITE}/og/${page.slug}.jpg`;
  const set = (html, re, val) => html.replace(re, (m, a, b) => `${a}${esc(val)}${b}`);
  let html = template;
  html = html.replace(/<title>[^<]*<\/title>/, `<title>${esc(title)}</title>`);
  html = set(html, /(<meta name="description" content=")[^"]*(")/, desc);
  html = set(html, /(<meta property="og:title" content=")[^"]*(")/, title);
  html = set(html, /(<meta property="og:description" content=")[^"]*(")/, desc);
  html = set(html, /(<meta property="og:image" content=")[^"]*(")/, img);
  html = set(html, /(<meta property="og:type" content=")[^"]*(")/, "article");
  html = set(html, /(<meta name="twitter:title" content=")[^"]*(")/, title);
  html = set(html, /(<meta name="twitter:description" content=")[^"]*(")/, desc);
  html = set(html, /(<meta name="twitter:image" content=")[^"]*(")/, img);
  const extra = [
    `<link rel="canonical" href="${url}">`,
    `<meta property="og:url" content="${url}">`,
    `<meta property="og:image:width" content="1200"><meta property="og:image:height" content="630">`,
    `<meta property="og:site_name" content="The Triangle of Everything">`,
    `<script>window.__TOE_PAGE__=${JSON.stringify({ slug: page.slug, name: page.name }).replace(/</g, "\\u003c")}</script>`,
  ].join("\n  ");
  html = html.replace("</head>", `  ${extra}\n</head>`);
  // The article as plain HTML for crawlers and no-JS readers; the app shows
  // the same text in its info panel once it boots.
  const body = (page.md ? mdParagraphs(page.md) : []).map((p) => `<p>${mdInline(p, true)}</p>`).join("\n");
  const article = `<noscript><article><h1>${esc(page.name)}</h1>${facts ? `<p>${esc(facts.trim())}</p>` : ""}\n${body}\n<p><a href="/">Explore the Triangle of Everything</a></p></article></noscript>`;
  html = html.replace(/<body([^>]*)>/, `<body$1>\n  ${article}`);
  return html;
}

mkdirSync(join(DIST, "og"), { recursive: true });
const all = [...pages.values()];
for (const page of all) {
  mkdirSync(join(DIST, page.slug), { recursive: true });
  writeFileSync(join(DIST, page.slug, "index.html"), pageHtml(page));
}
// Preview images, a few at a time
for (let i = 0; i < all.length; i += 8) {
  await Promise.all(all.slice(i, i + 8).map((p) => ogImage(p, join(DIST, "og", `${p.slug}.jpg`))));
}

const today = new Date().toISOString().slice(0, 10);
writeFileSync(join(DIST, "sitemap.xml"), `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>${SITE}/</loc><lastmod>${today}</lastmod><priority>1.0</priority></url>
${all.map((p) => `  <url><loc>${SITE}/${p.slug}/</loc><lastmod>${today}</lastmod></url>`).join("\n")}
</urlset>
`);
writeFileSync(join(DIST, "robots.txt"), `User-agent: *\nAllow: /\n\nSitemap: ${SITE}/sitemap.xml\n`);
console.log(`✓ ${all.length} object pages + preview images, sitemap.xml, robots.txt, 404.html`);
