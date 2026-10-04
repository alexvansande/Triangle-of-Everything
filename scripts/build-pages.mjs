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
import { friendlyRadius, friendlyMass, friendlyDensity } from "../src/format.js";

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
// Each preview is a real screenshot of the chart around the object (taken
// headlessly through the app's ?og-shot hook), with a frosted card beside the
// object in the style of the map's hover tooltip: category, name, and the
// width / mass / density rows. Without a Chrome to drive (local builds), it
// falls back to the icon on a plain dark card.
const W = 1200, H = 630;
const font = (f) => opentype.parse(readFileSync(join(ROOT, "scripts", "og", `${f}.ttf`)).buffer);
const FONT = { inter400: font("Inter-400"), inter700: font("Inter-700"), mono400: font("SpaceMono-400"), mono700: font("SpaceMono-700") };
// The Latin subsets have no subscripts / astronomy glyphs: plain-text stand-ins
// Superscript runs the font can draw stay superscripts (cm³, 10²); a run with
// any missing glyph (⁻, ⁴…⁹) becomes ^digits (10⁻²⁴ → 10^-24).
const SUP = { "⁰": "0", "¹": "1", "²": "2", "³": "3", "⁴": "4", "⁵": "5", "⁶": "6", "⁷": "7", "⁸": "8", "⁹": "9", "⁻": "-" };
const hasGlyphs = (s) => [...s].every((ch) => FONT.inter400.charToGlyphIndex(ch) > 0 && FONT.mono400.charToGlyphIndex(ch) > 0);
const ogText = (s) => s.replace(/[₀-₉]/g, (d) => "0123456789"[d.charCodeAt(0) - 0x2080])
  .replace(/[⁰¹²³⁴-⁹⁻]+/g, (run) => hasGlyphs(run) ? run : "^" + [...run].map((c) => SUP[c]).join(""))
  .replace(/ ?M☉/g, " Msun").replace(/☉/g, "sun").replace(/⊕/g, " Mearth").replace(/[*]/g, "").replace(/≈/g, "~");
const TEXT_OPTS = { kerning: true, features: { liga: false, rlig: false, calt: false, ccmp: false } };
const textPath = (s, f, size, x, y, fill, ls = 0) => {
  if (!ls) return `<path d="${FONT[f].getPath(ogText(s), x, y, size, TEXT_OPTS).toPathData(1)}" fill="${fill}"/>`;
  let out = "", cx = x; // letter-spaced (small caps kicker)
  for (const ch of ogText(s)) { out += FONT[f].getPath(ch, cx, y, size, TEXT_OPTS).toPathData(1); cx += FONT[f].getAdvanceWidth(ch, size, TEXT_OPTS) + ls; }
  return `<path d="${out}" fill="${fill}"/>`;
};
const textWidth = (s, f, size, ls = 0) => FONT[f].getAdvanceWidth(ogText(s), size, TEXT_OPTS) + ls * ogText(s).length;
function wrap(s, f, size, maxW, maxLines) {
  const words = s.split(/\s+/), lines = [];
  let cur = "";
  for (const word of words) {
    const t = cur ? `${cur} ${word}` : word;
    if (textWidth(t, f, size) <= maxW || !cur) cur = t;
    else { lines.push(cur); cur = word; }
  }
  if (cur) lines.push(cur);
  if (lines.length > maxLines) {
    lines.length = maxLines;
    while (textWidth(lines[maxLines - 1] + "…", f, size) > maxW) lines[maxLines - 1] = lines[maxLines - 1].replace(/\s*\S+$/, "");
    lines[maxLines - 1] += "…";
  }
  return lines;
}

// Card content → { w, h, svg(x, y) }
function cardLayout(page) {
  const color = CAT_COLOR[page.obj?.cat] || "#80deea";
  const PAD = 34, MAXW = 500;
  const kicker = (page.obj ? CAT_LABEL[page.obj.cat] || "" : "The Triangle of Everything").toUpperCase();
  const titleSize = textWidth(page.name, "inter700", 50) > MAXW * 1.5 ? 40 : 50;
  const title = wrap(page.name, "inter700", titleSize, MAXW, 3);
  let rows;
  if (page.obj) {
    const o = page.obj;
    rows = [`width   ≈ ${friendlyRadius(o.logR + WIDTH_LOG_OFFSET)}`, `mass    ≈ ${friendlyMass(o.logM)}`];
    if (!(Math.abs(o.logM + o.logR + 36.656) < 0.5)) rows.push(`density ≈ ${friendlyDensity(o.logR, o.logM, o.logDensity)}`);
  } else {
    rows = wrap(summary(page.md, 150), "inter400", 24, MAXW, 3);
  }
  const rowFont = page.obj ? "mono400" : "inter400", rowSize = page.obj ? 24 : 24, rowGap = page.obj ? 36 : 34;
  const w = Math.min(MAXW, Math.max(
    textWidth(kicker, "inter700", 17, 2.4),
    ...title.map((l) => textWidth(l, "inter700", titleSize)),
    ...rows.map((r) => textWidth(r, rowFont, rowSize)),
    textWidth("triangleofeverything.com", "mono400", 17),
  )) + PAD * 2;
  const h = PAD + 18 + 14 + title.length * titleSize * 1.12 + 18 + rows.length * rowGap + 22 + 17 + PAD;
  return {
    w: Math.round(w), h: Math.round(h),
    svg(x, y) {
      let yy = y + PAD + 17, out = textPath(kicker, "inter700", 17, x + PAD, yy, color, 2.4);
      yy += 14;
      for (const l of title) { yy += titleSize * 1.12; out += textPath(l, "inter700", titleSize, x + PAD, yy, "#ffffff"); }
      yy += 18;
      for (const r of rows) { yy += rowGap; out += textPath(r, rowFont, rowSize, x + PAD, yy, "rgba(255,255,255,0.72)"); }
      yy += 22 + 17;
      out += textPath("triangleofeverything.com", "mono400", 17, x + PAD, yy, "rgba(255,255,255,0.42)");
      return out;
    },
  };
}

// Frosted card on top of a 1200×630 background buffer; anchor = object pixel
async function composeCard(bg, page, anchor) {
  const card = cardLayout(page);
  let x, y;
  if (anchor) {
    x = anchor.x + anchor.r + 26;
    if (x + card.w > W - 28) x = Math.max(28, anchor.x - anchor.r - 26 - card.w);
    y = Math.round(anchor.y - card.h / 2);
  } else { x = W - card.w - 60; y = Math.round((H - card.h) / 2); }
  y = Math.max(28, Math.min(H - card.h - 28, y));
  const R = 22, { w, h } = card;
  const round = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}"><rect width="${w}" height="${h}" rx="${R}" fill="#fff"/></svg>`);
  // frosted glass: the chart behind the card, blurred and darkened, clipped round
  const glass = await sharp(bg).extract({ left: x, top: y, width: w, height: h })
    .blur(16).modulate({ brightness: 0.55 })
    .composite([{ input: Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}"><rect width="${w}" height="${h}" fill="rgb(10,10,40)" fill-opacity="0.5"/></svg>`) },
                { input: round, blend: "dest-in" }])
    .png().toBuffer();
  const shadow = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}"><defs><filter id="s" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="18"/></filter></defs>
    <rect x="${x}" y="${y + 10}" width="${w}" height="${h}" rx="${R}" fill="#000" opacity="0.55" filter="url(#s)"/></svg>`);
  const overlay = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
    <rect x="${x + 0.5}" y="${y + 0.5}" width="${w - 1}" height="${h - 1}" rx="${R}" fill="none" stroke="rgba(255,255,255,0.16)"/>
    ${card.svg(x, y)}</svg>`);
  return sharp(bg).composite([{ input: shadow }, { input: glass, left: x, top: y }, { input: overlay }]);
}

const manifest = JSON.parse(readFileSync(join(ROOT, "content", "images", "manifest.json"), "utf8"));
function pictureFor(slug) {
  const cands = [
    join(ROOT, "content", "icons", "src", `${slug}.png`),
    manifest[slug] && join(ROOT, "content", "images", manifest[slug].file),
    join(ROOT, "content", "images", `${slug}.webp`),
    join(ROOT, "content", "icons", `${slug}.webp`),
  ].filter(Boolean);
  return cands.find((p) => existsSync(p)) || null;
}

// Fallback background (no Chrome): the icon on the chart's deep purple
async function fallbackBg(page) {
  const base = sharp({ create: { width: W, height: H, channels: 3, background: "#1d1352" } })
    .composite([{ input: Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}"><defs><radialGradient id="g" cx="35%" cy="50%" r="75%"><stop offset="0" stop-color="#3a2a8c"/><stop offset="1" stop-color="#0b0824"/></radialGradient></defs><rect width="${W}" height="${H}" fill="url(#g)"/></svg>`) }]);
  const pic = pictureFor(page.slug);
  let buf = await base.png().toBuffer();
  if (pic) {
    const icon = await sharp(pic).resize(300, 300, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toBuffer();
    buf = await sharp(buf).composite([{ input: icon, left: Math.round(W * 0.34 - 150), top: Math.round(H / 2 - 150) }]).png().toBuffer();
    return { bg: buf, anchor: { x: Math.round(W * 0.34), y: Math.round(H / 2), r: 150 } };
  }
  return { bg: buf, anchor: null };
}

function findChrome() {
  const cands = [process.env.CHROME_PATH, "/usr/bin/google-chrome", "/usr/bin/chromium", "/usr/bin/chromium-browser",
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"];
  try { for (const d of readdirSync("/opt/pw-browsers")) cands.push(`/opt/pw-browsers/${d}/chrome-linux/chrome`); } catch {}
  return cands.filter(Boolean).find((p) => existsSync(p)) || null;
}

// Zoom per object: show its neighbourhood — the 4th-nearest hand-placed
// neighbour (in decades) sets how many decades the image spans.
function neighbourSpan(o, objs) {
  const d = objs.filter((q) => q !== o).map((q) => Math.hypot(q.logR - o.logR, q.logM - o.logM)).sort((a, b) => a - b);
  return Math.min(22, Math.max(1.2, (d[3] ?? 4) * 2.4)); // decades across the image width
}

async function screenshotAll(pages, out) {
  const chrome = findChrome();
  if (!chrome || process.env.OG_NO_SHOTS) return false;
  const { preview } = await import("vite");
  const { default: puppeteer } = await import("puppeteer-core");
  const server = await preview({ root: ROOT, logLevel: "silent", preview: { port: 4321, strictPort: false, open: false } });
  const base = server.resolvedUrls.local[0].replace(/\/$/, "");
  const browser = await puppeteer.launch({ executablePath: chrome, headless: true, args: ["--no-sandbox", "--hide-scrollbars"] });
  try {
    const p = await browser.newPage();
    // 2× pixel density: a 600×315 CSS-px view → a crisp 1200×630 image
    await p.setViewport({ width: 960, height: 600, deviceScaleFactor: 2 });
    await p.goto(`${base}/?og-shot`, { waitUntil: "load" });
    await p.waitForFunction(() => window.__toeOg?.ready(), { timeout: 30000 });
    const plot = await p.evaluate(() => window.__toeOg.plot());
    const spanX = await p.evaluate(() => window.__toeOg.fullSpanX());
    const CW = W / 2, CH = H / 2; // CSS px
    const clip = { x: Math.round(plot.x + (plot.w - CW) / 2), y: Math.round(plot.y + (plot.h - CH) / 2), width: CW, height: CH };
    const objs = objects.map((o) => ({ ...o, slug: o.slug || nameToSlug(o.name) }));
    const OBJ_X = 0.34;
    for (const page of pages) {
      const o = page.obj && objs.find((q) => q.slug === page.slug);
      let k = 1;
      if (o) {
        const decades = neighbourSpan(o, objs);
        k = Math.max(1, Math.min(700, (CW / decades) * spanX / plot.w)); // CSS px per decade = CW / decades
      }
      const px = clip.x - plot.x + CW * OBJ_X, py = clip.y - plot.y + CH / 2;
      await p.evaluate((slug, k, px, py) => window.__toeOg.place(slug, k, px, py), o ? page.slug : null, k, px, py);
      // icons stream in on demand: wait for them (bounded), then hide the
      // subject's own label — the card names it
      await p.waitForFunction(() => window.__toeOg.iconsPending() === 0, { timeout: 4000 }).catch(() => {});
      await p.waitForNetworkIdle({ idleTime: 250, timeout: 5000 }).catch(() => {}); // background tiles
      await p.evaluate((slug) => document.querySelectorAll(`[data-label-slug="${slug}"]`).forEach((e) => e.setAttribute("display", "none")), page.slug);
      await new Promise((r) => setTimeout(r, 120));
      const r = o ? await p.evaluate((slug) => {
        const img = document.querySelector(`image.obj-icon[data-slug="${slug}"]`);
        return img ? img.getBoundingClientRect().width : 8; // CSS width × 2 px/CSS px / 2
      }, page.slug) : 0;
      const shot = await p.screenshot({ clip, type: "png" });
      const card = await composeCard(shot, page, o ? { x: Math.round(W * OBJ_X), y: Math.round(H / 2), r: Math.max(10, Math.round(r)) } : null);
      await card.jpeg({ quality: 84, mozjpeg: true }).toFile(join(out, `${page.slug}.jpg`));
    }
  } finally {
    await browser.close();
    await new Promise((r) => server.httpServer.close(r));
  }
  return true;
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
// Preview images: real chart screenshots when a Chrome is available
const shot = await screenshotAll(all, join(DIST, "og"));
if (!shot) {
  console.warn("  (no Chrome found — preview images use the plain icon card; set CHROME_PATH for chart screenshots)");
  for (const page of all) {
    const { bg, anchor } = await fallbackBg(page);
    await (await composeCard(bg, page, anchor)).jpeg({ quality: 84, mozjpeg: true }).toFile(join(DIST, "og", `${page.slug}.jpg`));
  }
}

const today = new Date().toISOString().slice(0, 10);
writeFileSync(join(DIST, "sitemap.xml"), `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>${SITE}/</loc><lastmod>${today}</lastmod><priority>1.0</priority></url>
${all.map((p) => `  <url><loc>${SITE}/${p.slug}/</loc><lastmod>${today}</lastmod></url>`).join("\n")}
</urlset>
`);
writeFileSync(join(DIST, "robots.txt"), `User-agent: *\nAllow: /\n\nSitemap: ${SITE}/sitemap.xml\n`);
console.log(`✓ ${all.length} object pages + preview images (${shot ? "chart screenshots" : "icon cards"}), sitemap.xml, robots.txt, 404.html`);
