#!/usr/bin/env node
/**
 * generate-molecule.mjs — Generate a molecule icon in the spirograph-atom style.
 *
 * Feeds hand-built atom PNGs from scripts/atoms/ as style references to
 * OpenAI's gpt-image-1 (image-to-image edits endpoint) and asks it to
 * render <slug> in the same visual language. See scripts/atoms/README.md
 * sections "Complex molecules — AI image generation" and "Workflow" for
 * the original plan.
 *
 * Usage:
 *   OPENAI_API_KEY=sk-... node scripts/generate-molecule.mjs glucose
 *   OPENAI_API_KEY=sk-... node scripts/generate-molecule.mjs glucose --refs h,c,o,h2o --quality high
 *   OPENAI_API_KEY=sk-... node scripts/generate-molecule.mjs glucose --out content/icons/src/glucose-ai.png
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const ATOMS_DIR = join(ROOT, "scripts/atoms");
const DEFAULT_OUT_DIR = join(ROOT, "content/icons/src");

// Load .env.local if present (gitignored — safe place for OPENAI_API_KEY).
{
  const envFile = join(ROOT, ".env.local");
  if (existsSync(envFile)) {
    for (const line of readFileSync(envFile, "utf8").split("\n")) {
      const m = line.match(/^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(.*?)\s*$/);
      if (m && !process.env[m[1]]) {
        process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
      }
    }
  }
}

// Pick <slug>.png if free, else <slug>-v2.png, <slug>-v3.png, …
function nextAvailable(dir, slug) {
  const first = join(dir, `${slug}.png`);
  if (!existsSync(first)) return first;
  for (let i = 2; i < 100; i++) {
    const p = join(dir, `${slug}-v${i}.png`);
    if (!existsSync(p)) return p;
  }
  return join(dir, `${slug}-v99.png`);
}

const REF_FILES = {
  h: "hydrogen.png",
  he: "helium.png",
  c: "carbon.png",
  o: "oxygen.png",
  fe: "iron.png",
  au: "gold.png",
  u: "uranium.png",
  h2o: "h2o.png",
  o2: "o2.png",
};

// Sensible default reference set per molecule. The model gets these PNGs
// attached and is told they define the visual style.
const DEFAULT_REFS = {
  glucose:       ["h", "c", "o", "h2o"],
  atp:           ["h", "c", "o", "h2o"],
  "fullerene-c60": ["c", "h2o"],
  dna:           ["h", "c", "o", "h2o"],
  adenine:       ["h", "c", "o", "h2o"],
  guanine:       ["h", "c", "o", "h2o"],
  cytosine:      ["h", "c", "o", "h2o"],
  thymine:       ["h", "c", "o", "h2o"],
};

const MOLECULE_NOTES = {
  glucose:
    "Glucose (C6H12O6). Six-membered chair-conformation ring of five carbons plus one oxygen, lying roughly flat. Each ring carbon has hydrogen and hydroxyl (OH) branches pointing outward. 6 C nuclei (12 nucleons each), 6 O nuclei (16 nucleons each), 12 H protons.",
  atp:
    "ATP (adenosine triphosphate). Adenine ring at one end, ribose sugar in the middle, three phosphate groups in a chain at the other end. Render the chain horizontally.",
  "fullerene-c60":
    "Buckminsterfullerene C60. Soccer-ball truncated icosahedron: one carbon nucleus (12 nucleons each) at each of the 60 vertices, with bond edges visible. No hydrogens.",
  dna:
    "DNA double helix viewed from a 3/4 angle. Rungs are base pairs, backbone is sugar–phosphate. Render small enough that each atom reads as one glowing nucleus along the strand.",
  adenine:
    "Adenine. Planar fused 5- and 6-membered ring system with an NH2 branch. 5 N nuclei (14 nucleons each), 5 C nuclei (12 nucleons each), 5 H protons.",
  guanine:
    "Guanine. Planar fused 5- and 6-membered rings with NH2 and a carbonyl O. 5 N, 5 C, 1 O, 5 H.",
  cytosine:
    "Cytosine. Single planar 6-membered ring with NH2 and a carbonyl O. 3 N, 4 C, 1 O, 5 H.",
  thymine:
    "Thymine. Single planar 6-membered ring with two carbonyl O and a methyl branch. 2 N, 5 C, 2 O, 6 H.",
};

function buildPrompt(slug, refKeys, hasStructure) {
  const refNames = refKeys.map(k => REF_FILES[k]?.replace(/\.png$/, "")).filter(Boolean).join(", ");
  const notes = MOLECULE_NOTES[slug] || `${slug} molecule, real molecular geometry.`;

  const refLine = hasStructure
    ? `Two kinds of reference images are attached. (1) STYLE references — the PNGs named ${refNames} — define the visual language. (2) GEOMETRY reference — a schematic diagram on a black background. Each atom in the diagram is a tight cluster of small colored dots (one dot per proton) connected by thin blue lines for bonds. The colors identify the element: WHITE single dot = hydrogen (H, 1 proton), YELLOW 6-dot cluster = carbon (C, 6 protons), RED 8-dot cluster = oxygen (O, 8 protons). Every dot cluster in the diagram is an atom that MUST appear in your output; do not drop the white hydrogen dots.`
    : `Reference style: the attached PNGs (${refNames}) define the visual language.`;

  const styleLine = `The style is a dense cluster of glowing spirograph "balls" forming each nucleus — yellow/white/red protons mixed with silver neutrons, depth-stacked like glued spheres with soft black knockouts between adjacent nucleons — surrounded by a thin sparse cyan/blue orbital cage on a pure black background.`;

  const renderingRules = [
    `Generate ${slug} as follows:`,
    `- Re-render the molecule with the same atom positions and bond topology as the GEOMETRY reference, but replace each yellow-dot cluster with a spirograph-style sphere-packed nucleus matching the STYLE references. Replace blue bond lines with subtle glowing bonds (or omit them and let neighboring atoms read as bonded via proximity).`,
    `- Each atom's nucleon count: H=1 nucleon, C=12 nucleons (6p+6n), N=14 (7p+7n), O=16 (8p+8n), P=31. An H atom is a single tiny ball; a C atom is a cluster of ~12 small balls; an O atom is ~16. Per-nucleon size is constant across all atoms.`,
    `- Wrap each atom in a thin sparse orbital cage (cyan/blue, as in the style references).`,
    `- Black background. No text, no labels, no axes, no chemical formula overlay. Square aspect, centered composition.`,
    `- Do not collapse the molecule into a single sphere — preserve the ring + substituent layout from the geometry diagram.`,
  ];
  if (!hasStructure) {
    renderingRules.splice(1, 1,
      `- Each atom = a sphere-packed nucleus with the correct nucleon count (H=1, C=12, N=14, O=16, P=31) wrapped in a thin sparse orbital cage.`,
      `- Atom positions match real molecular geometry (correct bond angles and bond lengths). For ring systems, draw the actual planar/chair layout.`,
    );
  }

  return [refLine, ``, styleLine, ``, ...renderingRules, ``, `Geometry: ${notes}`].join("\n");
}

// ─── CLI ───
const args = process.argv.slice(2);
const slug = args[0];
if (!slug || slug.startsWith("--")) {
  console.error("Usage: node scripts/generate-molecule.mjs <slug> [--refs h,c,o,h2o] [--out path.png] [--quality high|medium|low] [--size 1024x1024] [--dry-run]");
  console.error("Known slugs with built-in notes: " + Object.keys(MOLECULE_NOTES).join(", "));
  process.exit(1);
}

function flag(name) {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : null;
}

const dryRun = args.includes("--dry-run");
const refsArg = flag("--refs");
const refKeys = refsArg ? refsArg.split(",").map(s => s.trim()) : (DEFAULT_REFS[slug] || ["h", "c", "o", "h2o"]);

for (const k of refKeys) {
  if (!REF_FILES[k]) { console.error(`Unknown ref key "${k}". Known: ${Object.keys(REF_FILES).join(", ")}`); process.exit(1); }
}

const force = args.includes("--force");
const outPath = flag("--out")
  || (force ? join(DEFAULT_OUT_DIR, `${slug}.png`) : nextAvailable(DEFAULT_OUT_DIR, slug));
// Default to "low" for cheap iteration (~$0.01/image). Bump to "high"
// (~$0.19/image) once the prompt is dialed in and you're rendering the final set.
const quality = flag("--quality") || "low";
const size = flag("--size") || "1024x1024";
const structurePath = flag("--structure"); // optional geometry-reference PNG

if (structurePath && !existsSync(structurePath)) {
  console.error(`--structure path does not exist: ${structurePath}`);
  process.exit(1);
}

const prompt = buildPrompt(slug, refKeys, !!structurePath);

console.log(`\n🧪 generate-molecule\n`);
console.log(`  slug:      ${slug}`);
console.log(`  refs:      ${refKeys.map(k => REF_FILES[k]).join(", ")}`);
console.log(`  structure: ${structurePath || "(none)"}`);
console.log(`  out:       ${outPath}`);
console.log(`  size:      ${size}`);
console.log(`  quality:   ${quality}`);
console.log(`\nPrompt (${prompt.length} chars):\n${prompt}\n`);

if (existsSync(outPath)) {
  console.log(`⚠  ${outPath} already exists — it will be overwritten (--force).\n`);
}

if (dryRun) {
  console.log("Dry run — no API call.");
  process.exit(0);
}

const apiKey = process.env.OPENAI_API_KEY;
if (!apiKey) {
  console.error("OPENAI_API_KEY env var not set. Run with: OPENAI_API_KEY=sk-... node scripts/generate-molecule.mjs " + slug);
  process.exit(1);
}

// ─── Multipart body for /v1/images/edits ───
const boundary = `----triangle-${Date.now()}-${Math.random().toString(36).slice(2)}`;
const parts = [];

function pushField(name, value) {
  parts.push(Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="${name}"\r\n\r\n${value}\r\n`));
}
function pushFile(name, filename, buf) {
  parts.push(Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="${name}"; filename="${filename}"\r\nContent-Type: image/png\r\n\r\n`));
  parts.push(buf);
  parts.push(Buffer.from("\r\n"));
}

pushField("model", "gpt-image-1");
pushField("prompt", prompt);
pushField("size", size);
pushField("quality", quality);
pushField("n", "1");
for (const key of refKeys) {
  const filename = REF_FILES[key];
  const path = join(ATOMS_DIR, filename);
  pushFile("image[]", filename, readFileSync(path));
}
// Geometry reference last so the model sees it as the most recent context.
if (structurePath) {
  pushFile("image[]", "geometry-diagram.png", readFileSync(structurePath));
}
parts.push(Buffer.from(`--${boundary}--\r\n`));
const body = Buffer.concat(parts);

console.log(`Posting ${(body.length / 1024).toFixed(1)} KB to /v1/images/edits…`);

const res = await fetch("https://api.openai.com/v1/images/edits", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${apiKey}`,
    "Content-Type": `multipart/form-data; boundary=${boundary}`,
  },
  body,
});

if (!res.ok) {
  console.error(`HTTP ${res.status}: ${await res.text()}`);
  process.exit(1);
}

const data = await res.json();
if (data.error) {
  console.error("API error:", data.error);
  process.exit(1);
}

const b64 = data.data?.[0]?.b64_json;
if (!b64) {
  console.error("No b64_json in response:", JSON.stringify(data, null, 2));
  process.exit(1);
}

mkdirSync(dirname(outPath), { recursive: true });
writeFileSync(outPath, Buffer.from(b64, "base64"));

const usage = data.usage ? ` (tokens: ${data.usage.total_tokens ?? "?"})` : "";
console.log(`\n✓ Wrote ${outPath}${usage}`);
console.log(`\nNext: run 'npm run process-icons' to refresh content/icons/${slug}.webp.`);
