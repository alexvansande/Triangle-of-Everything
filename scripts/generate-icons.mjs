#!/usr/bin/env node
/**
 * generate-icons.mjs — Generate or download icons for Triangle objects.
 *
 * Each entry in ICON_SPECS is either:
 *   { slug, prompt }           → generate with DALL-E 3
 *   { slug, url }              → download from URL
 *   { slug, prompt, url }      → try download first, fall back to generate
 *
 * Usage:
 *   OPENAI_API_KEY=sk-... node scripts/generate-icons.mjs [--only slug1,slug2] [--dry-run] [--force]
 *
 * Reads OPENAI_API_KEY from env. Skips icons that already exist in content/icons/src/
 * unless --force is passed. Use --only to generate specific slugs.
 * Use --dry-run to preview what would be generated/downloaded.
 */

import { readdirSync, mkdirSync, writeFileSync, existsSync } from "fs";
import { join } from "path";
import https from "https";
import http from "http";

const SRC_DIR = "content/icons/src";
mkdirSync(SRC_DIR, { recursive: true });

// ─── Style constants for prompt consistency ───
const STYLE_BASE = "On a pure black background, centered, no text, no labels, high detail";
const LIGHT_NW = "45-degree northwest lighting with soft shadows";
const SPHERE_STYLE = `photorealistic sphere, ${LIGHT_NW}, ${STYLE_BASE}`;
const GLOW_STYLE = `glowing in space, ${STYLE_BASE}`;
const ABSTRACT_STYLE = `abstract scientific visualization, glowing, ethereal, ${STYLE_BASE}`;

// ─── Category prompt templates ───
const PROMPTS = {
  // Particles — abstract quantum-inspired orbs
  particle: (name, sub) => {
    const colors = {
      quark: "deep red and orange",
      lepton: "electric blue and cyan",
      boson: "golden yellow and white",
    };
    const c = colors[sub] || "purple and blue";
    return `Tiny glowing ${c} energy orb representing a ${name} particle, quantum-inspired, with subtle orbital trails, ${ABSTRACT_STYLE}`;
  },

  // Atoms — Bohr-model inspired glowing orbs
  atom: (name) =>
    `Glowing atomic structure of ${name}, stylized Bohr model with electron shells as luminous rings around a bright nucleus, ${ABSTRACT_STYLE}`,

  // Molecules — structural beauty
  molecule: (name) =>
    `3D molecular structure of ${name}, ball-and-stick model with glowing bonds, scientifically accurate, ${ABSTRACT_STYLE}`,

  // Viruses — photorealistic microscopy style
  virus: (name) =>
    `Photorealistic 3D render of ${name} virus, electron microscope style, ${SPHERE_STYLE}`,

  // Bacteria
  bacterium: (name) =>
    `Photorealistic 3D render of a ${name}, microscopy style, translucent cell membrane, ${LIGHT_NW}, ${STYLE_BASE}`,

  // Micro organisms
  micro: (name) =>
    `Photorealistic 3D render of a ${name}, microscopy style, detailed cellular structure, ${LIGHT_NW}, ${STYLE_BASE}`,

  // Macro objects — photorealistic everyday objects
  macro: (name) =>
    `Photorealistic ${name}, ${SPHERE_STYLE}`,

  // Animals/insects
  animal: (name) =>
    `Photorealistic ${name}, side view, natural pose, ${LIGHT_NW}, ${STYLE_BASE}`,

  // Planets & moons — spherical with consistent lighting
  planet: (name) =>
    `Photorealistic ${name} as seen from space, full sphere view, ${SPHERE_STYLE}`,

  // Asteroids & comets — irregular rocky bodies
  asteroid: (name) =>
    `Photorealistic ${name}, irregular rocky body floating in space, ${LIGHT_NW}, ${STYLE_BASE}`,

  // Stars — glowing spheres with different colors
  star: (name, color = "yellow-white") =>
    `Glowing ${color} star ${name}, photorealistic stellar surface with visible convection and corona, ${GLOW_STYLE}`,

  // Neutron stars / pulsars
  neutron: (name) =>
    `Rapidly spinning neutron star ${name} with magnetic field lines and energy beams, blue-white glow, ${GLOW_STYLE}`,

  // White dwarfs
  whiteDwarf: (name) =>
    `Dense white dwarf star ${name}, small intensely bright blue-white sphere, fading glow, ${GLOW_STYLE}`,

  // Black holes
  blackhole: (name) =>
    `Supermassive black hole ${name}, photorealistic accretion disk with gravitational lensing, orange-red hot gas spiraling inward, event horizon visible, ${GLOW_STYLE}`,

  // Nebulae & remnants
  nebula: (name) =>
    `${name}, colorful interstellar gas cloud in deep space, Hubble Space Telescope style, ${GLOW_STYLE}`,

  // Galaxies
  galaxy: (name) =>
    `${name} galaxy, deep space photograph, billions of stars visible, Hubble style, ${GLOW_STYLE}`,

  // Large scale / voids
  void_obj: (name) =>
    `Cosmic void ${name}, vast empty region of space with sparse distant galaxy clusters at the edges, deep dark blue-black, ${GLOW_STYLE}`,
};

// ─── Icon specifications ───
// Maps object slug → generation/download instructions
// Objects already in content/icons/src/ are skipped unless --force

const ICON_SPECS = [
  // === PARTICLES ===
  // Quarks
  { slug: "top", prompt: PROMPTS.particle("top", "quark") },
  { slug: "bottom", prompt: PROMPTS.particle("bottom", "quark") },
  { slug: "charm", prompt: PROMPTS.particle("charm", "quark") },
  { slug: "strange", prompt: PROMPTS.particle("strange", "quark") },
  { slug: "down", prompt: PROMPTS.particle("down", "quark") },
  { slug: "up", prompt: PROMPTS.particle("up", "quark") },
  { slug: "meson", prompt: PROMPTS.particle("meson", "quark") },
  // Leptons
  { slug: "tau", prompt: PROMPTS.particle("tau", "lepton") },
  { slug: "muon", prompt: PROMPTS.particle("muon", "lepton") },
  { slug: "electron", prompt: PROMPTS.particle("electron", "lepton") },
  { slug: "neutrino-", prompt: PROMPTS.particle("neutrino", "lepton") },
  // Bosons / photons
  { slug: "higgs", prompt: PROMPTS.particle("Higgs boson", "boson") },
  { slug: "z", prompt: PROMPTS.particle("Z boson", "boson") },
  { slug: "w", prompt: PROMPTS.particle("W boson", "boson") },
  { slug: "gamma-ray", prompt: PROMPTS.particle("gamma ray photon", "boson") },
  { slug: "x-ray", prompt: PROMPTS.particle("X-ray photon", "boson") },
  { slug: "visible-light", prompt: PROMPTS.particle("visible light photon", "boson") },
  { slug: "cmb-photon", prompt: PROMPTS.particle("cosmic microwave background photon", "boson") },
  // Composite
  { slug: "proton", prompt: `Three quarks (two up, one down) bound by gluon color force lines, red-green-blue tricolor glow, ${ABSTRACT_STYLE}` },
  { slug: "neutron", prompt: `Three quarks (two down, one up) bound by gluon color force lines, blue-green-red tricolor glow, ${ABSTRACT_STYLE}` },

  // === ATOMS ===
  { slug: "hydrogen", prompt: PROMPTS.atom("Hydrogen") },
  { slug: "helium", prompt: PROMPTS.atom("Helium") },
  { slug: "carbon", prompt: PROMPTS.atom("Carbon") },
  { slug: "oxygen", prompt: PROMPTS.atom("Oxygen") },
  { slug: "iron", prompt: PROMPTS.atom("Iron") },
  { slug: "gold", prompt: PROMPTS.atom("Gold") },
  { slug: "uranium", prompt: PROMPTS.atom("Uranium") },
  { slug: "oganesson", prompt: PROMPTS.atom("Oganesson") },

  // === MOLECULES ===
  { slug: "water-h2o", prompt: PROMPTS.molecule("water H2O") },
  { slug: "glucose", prompt: PROMPTS.molecule("glucose") },
  { slug: "fullerene-c60", prompt: PROMPTS.molecule("Buckminsterfullerene C60") },
  { slug: "atp", prompt: PROMPTS.molecule("ATP adenosine triphosphate") },
  { slug: "insulin", prompt: PROMPTS.molecule("insulin protein") },
  { slug: "hemoglobin", prompt: PROMPTS.molecule("hemoglobin protein") },
  { slug: "antibody-igg", prompt: PROMPTS.molecule("IgG antibody Y-shaped") },
  { slug: "dna", prompt: PROMPTS.molecule("DNA double helix") },
  { slug: "ribosome", prompt: PROMPTS.molecule("ribosome") },

  // === VIRUSES ===
  { slug: "tobacco-mosaic", prompt: PROMPTS.virus("tobacco mosaic") },
  { slug: "influenza", prompt: PROMPTS.virus("influenza") },
  { slug: "hiv", prompt: PROMPTS.virus("HIV") },
  { slug: "covid-virus", prompt: PROMPTS.virus("SARS-CoV-2 coronavirus") },
  { slug: "bacteriophage-t4", prompt: PROMPTS.virus("bacteriophage T4") },
  { slug: "ebola-virus", prompt: PROMPTS.virus("Ebola") },
  { slug: "mimivirus", prompt: PROMPTS.virus("Mimivirus giant") },

  // === MICRO ===
  { slug: "bacterium", prompt: PROMPTS.bacterium("E. coli bacterium") },
  { slug: "red-blood-cell", prompt: PROMPTS.micro("red blood cell, biconcave disc shape") },
  { slug: "pollen-grain", prompt: PROMPTS.micro("pollen grain, spiky spherical") },
  { slug: "amoeba", prompt: PROMPTS.micro("amoeba, translucent with pseudopods") },
  { slug: "paramecium", prompt: PROMPTS.micro("paramecium, ciliated single-cell organism") },
  { slug: "dust-mite", prompt: PROMPTS.micro("dust mite, microscopic arachnid") },
  { slug: "tardigrade", prompt: PROMPTS.micro("tardigrade water bear, plump segmented body") },

  // === MACRO ===
  { slug: "grain-of-sand", prompt: PROMPTS.macro("grain of sand, translucent mineral crystal") },
  { slug: "ladybug", prompt: PROMPTS.animal("ladybug, red with black spots, top view") },
  { slug: "ant", prompt: PROMPTS.animal("ant, side profile") },
  { slug: "flea", prompt: PROMPTS.animal("flea, microscopy-style side view") },
  { slug: "nickel", prompt: PROMPTS.macro("US nickel coin, front face") },
  { slug: "mouse", prompt: PROMPTS.animal("house mouse, small grey mouse") },
  { slug: "human", prompt: PROMPTS.animal("human figure, standing neutral pose, Leonardo da Vinci Vitruvian Man style") },
  { slug: "hippopotamus", prompt: PROMPTS.animal("hippopotamus, side view") },
  { slug: "elephant", prompt: PROMPTS.animal("African elephant, side view") },
  { slug: "blue-whale", prompt: PROMPTS.animal("blue whale, side view underwater") },
  { slug: "sequoia", prompt: PROMPTS.macro("giant sequoia tree, full tree view") },
  { slug: "boeing-747", prompt: PROMPTS.macro("Boeing 747 airplane, side view") },
  { slug: "great-pyramid", prompt: PROMPTS.macro("Great Pyramid of Giza") },
  { slug: "supertanker", prompt: PROMPTS.macro("supertanker cargo ship, aerial view") },
  { slug: "mt-everest", prompt: PROMPTS.macro("Mount Everest, snow-capped peak") },

  // === PLANETS & MOONS (download NASA images where possible) ===
  { slug: "mercury", prompt: PROMPTS.planet("Mercury") },
  { slug: "venus", prompt: PROMPTS.planet("Venus with thick atmosphere") },
  { slug: "mars", prompt: PROMPTS.planet("Mars, red planet") },
  { slug: "earth", prompt: PROMPTS.planet("Earth showing Africa and Europe") },
  { slug: "jupiter", prompt: PROMPTS.planet("Jupiter with Great Red Spot") },
  { slug: "saturn", prompt: PROMPTS.planet("Saturn with prominent rings") },
  { slug: "uranus", prompt: PROMPTS.planet("Uranus, pale blue-green ice giant") },
  { slug: "neptune", prompt: PROMPTS.planet("Neptune, deep blue ice giant") },
  { slug: "moon", prompt: PROMPTS.planet("Earth's Moon, full moon, grey craters") },
  { slug: "europa", prompt: PROMPTS.planet("Europa, icy surface with cracks") },
  { slug: "io", prompt: PROMPTS.planet("Io, volcanic yellow-orange surface") },
  { slug: "titan", prompt: PROMPTS.planet("Titan, thick orange haze atmosphere") },
  { slug: "enceladus", prompt: PROMPTS.planet("Enceladus, bright white icy surface") },
  { slug: "phobos", prompt: PROMPTS.planet("Phobos, small irregular grey moon") },
  { slug: "pluto", prompt: PROMPTS.planet("Pluto, heart-shaped Tombaugh Regio") },
  { slug: "ceres", prompt: PROMPTS.planet("Ceres, cratered dwarf planet with bright spots") },

  // Asteroids
  { slug: "bennu", prompt: PROMPTS.asteroid("Bennu, diamond-shaped rubble pile") },
  { slug: "eros", prompt: PROMPTS.asteroid("433 Eros, elongated peanut-shaped") },
  { slug: "halleys-comet", prompt: `Halley's Comet with bright tail streaming away from sun, icy nucleus visible, ${GLOW_STYLE}` },

  // === STARS ===
  { slug: "sun", prompt: PROMPTS.star("the Sun", "yellow-white") },
  { slug: "sirius-a", prompt: PROMPTS.star("Sirius A", "brilliant blue-white") },
  { slug: "vega", prompt: PROMPTS.star("Vega", "bright blue-white") },
  { slug: "betelgeuse", prompt: PROMPTS.star("Betelgeuse", "deep red-orange, enormous") },
  { slug: "red-giant", prompt: PROMPTS.star("a red giant", "swollen deep red") },
  { slug: "blue-supergiant", prompt: PROMPTS.star("a blue supergiant", "intense blue-white, massive") },
  { slug: "wolf-rayet", prompt: PROMPTS.star("a Wolf-Rayet star", "blue-violet with fierce stellar wind") },
  { slug: "t-tauri", prompt: PROMPTS.star("a T Tauri star", "young orange with accretion disk") },
  { slug: "protostar", prompt: `Protostar forming inside a dark molecular cloud, glowing reddish core surrounded by infalling gas and dust, ${GLOW_STYLE}` },

  // Brown dwarfs
  { slug: "y-brown-dwarf", prompt: PROMPTS.star("a Y-type brown dwarf", "very dim deep red-magenta, barely glowing") },
  { slug: "t-brown-dwarf", prompt: PROMPTS.star("a T-type brown dwarf", "dim magenta-brown") },
  { slug: "red-dwarf", prompt: PROMPTS.star("a red dwarf", "small dim red-orange") },
  { slug: "proxima-cen", prompt: PROMPTS.star("Proxima Centauri", "small red dwarf with occasional flares") },

  // === REMNANTS ===
  { slug: "neutron-star", prompt: PROMPTS.neutron("neutron star") },
  { slug: "millisecond-pulsar", prompt: PROMPTS.neutron("millisecond pulsar, extremely rapid spin") },
  { slug: "magnetar", prompt: PROMPTS.neutron("magnetar, intense magnetic field lines") },
  { slug: "procyon-b", prompt: PROMPTS.whiteDwarf("Procyon B") },
  { slug: "white-dwarf", prompt: PROMPTS.whiteDwarf("white dwarf") },
  { slug: "sirius-b", prompt: PROMPTS.whiteDwarf("Sirius B") },
  { slug: "planetary-nebula", prompt: PROMPTS.nebula("Planetary nebula, Ring Nebula style, circular shell of glowing gas") },
  { slug: "supernova-remnant", prompt: PROMPTS.nebula("Supernova remnant, Crab Nebula style, filamentary expanding gas shell") },
  { slug: "nebulae", prompt: PROMPTS.nebula("Colorful emission nebula, Orion Nebula style") },

  // === BLACK HOLES ===
  { slug: "sgr-a", prompt: PROMPTS.blackhole("Sagittarius A*") },
  { slug: "m87", prompt: PROMPTS.blackhole("M87*, famous first black hole photograph style") },
  { slug: "ton-618", prompt: PROMPTS.blackhole("TON 618, ultramassive") },
  { slug: "smallest-primordial-bh", prompt: `Tiny primordial black hole, extremely small event horizon with faint Hawking radiation glow, ${GLOW_STYLE}` },

  // === GALAXIES (prefer real photos but AI fallback) ===
  { slug: "milky-way", prompt: PROMPTS.galaxy("Milky Way, edge-on spiral view") },
  { slug: "andromeda-m31", prompt: PROMPTS.galaxy("Andromeda M31, large spiral") },
  { slug: "sombrero-m104", prompt: PROMPTS.galaxy("Sombrero Galaxy M104, edge-on with dust lane") },
  { slug: "triangulum-m33", prompt: PROMPTS.galaxy("Triangulum Galaxy M33, face-on spiral") },
  { slug: "large-magellanic-cloud", prompt: PROMPTS.galaxy("Large Magellanic Cloud, irregular galaxy") },
  { slug: "small-magellanic-cloud", prompt: PROMPTS.galaxy("Small Magellanic Cloud, irregular galaxy") },
  { slug: "dwarf-galaxy", prompt: PROMPTS.galaxy("Small dwarf galaxy, sparse stars") },
  { slug: "globular-cluster", prompt: `Dense globular star cluster, thousands of tightly packed stars, spherical shape, ${GLOW_STYLE}` },
  { slug: "galaxy-cluster", prompt: `Massive galaxy cluster, dozens of galaxies gravitationally bound, deep space, ${GLOW_STYLE}` },

  // === LARGE SCALE ===
  { slug: "laniakea", prompt: `Laniakea Supercluster, cosmic web visualization showing galaxy filaments and voids, large scale structure, ${GLOW_STYLE}` },
  { slug: "observable-universe", prompt: `Observable universe, concentric shells of cosmic history from Big Bang to present, cosmic microwave background at the edge, ${GLOW_STYLE}` },
  { slug: "bo-tes-void", prompt: PROMPTS.void_obj("Boötes Void") },
  { slug: "eridanus-supervoid", prompt: PROMPTS.void_obj("Eridanus Supervoid") },
  { slug: "kbc-void", prompt: PROMPTS.void_obj("KBC Void") },
];

// ─── Helpers ───

function slugToFilename(slug) {
  return slug.replace(/[^a-z0-9-]/g, "") + ".png";
}

function fileExists(slug) {
  // Check both exact slug match and common name variations in src/
  const files = readdirSync(SRC_DIR);
  const target = slugToFilename(slug);
  return files.some(f => f === target) || files.some(f => {
    const fSlug = f.replace(/\.[^.]+$/, "").toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
    return fSlug === slug;
  });
}

async function downloadImage(url, outPath) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith("https") ? https : http;
    client.get(url, { headers: { "User-Agent": "Mozilla/5.0" } }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return downloadImage(res.headers.location, outPath).then(resolve, reject);
      }
      if (res.statusCode !== 200) return reject(new Error(`HTTP ${res.statusCode}`));
      const chunks = [];
      res.on("data", c => chunks.push(c));
      res.on("end", () => {
        writeFileSync(outPath, Buffer.concat(chunks));
        resolve();
      });
      res.on("error", reject);
    }).on("error", reject);
  });
}

async function generateWithDalle(prompt, outPath) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY not set");

  const body = JSON.stringify({
    model: "dall-e-3",
    prompt,
    n: 1,
    size: "1024x1024",
    quality: "standard",
    response_format: "url",
  });

  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: "api.openai.com",
      path: "/v1/images/generations",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
        "Content-Length": Buffer.byteLength(body),
      },
    }, (res) => {
      const chunks = [];
      res.on("data", c => chunks.push(c));
      res.on("end", async () => {
        const data = JSON.parse(Buffer.concat(chunks).toString());
        if (data.error) return reject(new Error(data.error.message));
        const imageUrl = data.data[0].url;
        await downloadImage(imageUrl, outPath);
        resolve(data.data[0].revised_prompt);
      });
    });
    req.on("error", reject);
    req.write(body);
    req.end();
  });
}

// ─── Main ───

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const force = args.includes("--force");
const onlyIdx = args.indexOf("--only");
const onlySlugs = onlyIdx >= 0 ? args[onlyIdx + 1]?.split(",") : null;

let specs = ICON_SPECS;
if (onlySlugs) {
  specs = specs.filter(s => onlySlugs.includes(s.slug));
}

console.log(`\n📦 Icon Generator — ${specs.length} specs${dryRun ? " (DRY RUN)" : ""}\n`);

let generated = 0, downloaded = 0, skipped = 0, errors = 0;

for (const spec of specs) {
  const exists = fileExists(spec.slug);
  if (exists && !force) {
    skipped++;
    continue;
  }

  const outPath = join(SRC_DIR, slugToFilename(spec.slug));
  const action = spec.url ? "download" : "generate";
  console.log(`  ${action === "download" ? "⬇" : "🎨"}  ${spec.slug}`);

  if (dryRun) {
    if (spec.prompt) console.log(`     Prompt: ${spec.prompt.slice(0, 100)}...`);
    if (spec.url) console.log(`     URL: ${spec.url}`);
    continue;
  }

  try {
    if (spec.url) {
      await downloadImage(spec.url, outPath);
      downloaded++;
      console.log(`     ✓ downloaded`);
    } else if (spec.prompt) {
      const revised = await generateWithDalle(spec.prompt, outPath);
      generated++;
      console.log(`     ✓ generated`);
      if (revised) console.log(`     revised: ${revised.slice(0, 80)}...`);
    }
    // Rate limit: DALL-E 3 allows ~5 req/min on free tier
    if (spec.prompt) await new Promise(r => setTimeout(r, 15000));
  } catch (err) {
    errors++;
    console.error(`     ✗ ${err.message}`);
  }
}

console.log(`\n✅ Done: ${generated} generated, ${downloaded} downloaded, ${skipped} skipped, ${errors} errors\n`);
console.log("Run 'npm run process-icons' to convert to webp.\n");
