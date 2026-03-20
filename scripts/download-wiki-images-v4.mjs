import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const IMAGES_DIR = path.join(__dirname, '..', 'content', 'images');
const MANIFEST_PATH = path.join(IMAGES_DIR, 'manifest.json');

const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Use the REST API to get summary + image info
async function getPageSummary(wikiTitle) {
  const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(wikiTitle)}`;
  const resp = await fetch(url);
  if (!resp.ok) return null;
  return resp.json();
}

// Get image metadata from Commons API
async function getCommonsMetadata(filename) {
  const url = `https://commons.wikimedia.org/w/api.php?action=query&titles=File:${encodeURIComponent(filename)}&prop=imageinfo&iiprop=url|extmetadata&format=json`;
  const resp = await fetch(url);
  if (!resp.ok) return null;
  const data = await resp.json();
  const pages = data.query.pages;
  const pageId = Object.keys(pages)[0];
  if (pageId === '-1' || !pages[pageId].imageinfo) return null;
  const info = pages[pageId].imageinfo[0];
  return {
    url: info.url,
    descriptionUrl: info.descriptionurl,
    metadata: info.extmetadata || {}
  };
}

function extractCredit(metadata) {
  if (metadata.Artist) return metadata.Artist.value.replace(/<[^>]*>/g, '').trim().substring(0, 200);
  if (metadata.Credit) return metadata.Credit.value.replace(/<[^>]*>/g, '').trim().substring(0, 200);
  return 'Unknown';
}

function extractLicense(metadata) {
  if (metadata.LicenseShortName) return metadata.LicenseShortName.value;
  if (metadata.License) return metadata.License.value;
  return 'Unknown';
}

// Download using curl (which seems to work for originals)
function downloadWithCurl(url, outputPath) {
  try {
    execSync(`curl -sL -o "${outputPath}" "${url}"`, { timeout: 60000 });
    return fs.existsSync(outputPath) && fs.statSync(outputPath).size > 1000;
  } catch (e) {
    return false;
  }
}

async function convertToWebp(inputPath, outputPath) {
  await sharp(inputPath, { animated: false })
    .resize(800, null, { withoutEnlargement: true })
    .webp({ quality: 80 })
    .toFile(outputPath);
}

// All remaining objects to process
const objects = [
  // PARTICLES
  { slug: 'higgs', wiki: 'Higgs_boson' },
  { slug: 'top', wiki: 'Top_quark' },
  { slug: 'electron', wiki: 'Electron' },
  { slug: 'gamma-ray', wiki: 'Gamma_ray' },
  { slug: 'x-ray', wiki: 'X-ray' },
  { slug: 'ultraviolet', wiki: 'Ultraviolet' },
  { slug: 'visible-light', wiki: 'Visible_spectrum' },
  { slug: 'infrared', wiki: 'Infrared' },
  { slug: 'microwave', wiki: 'Microwave' },
  { slug: 'fm-radio', wiki: 'FM_broadcasting' },
  { slug: 'am-radio', wiki: 'AM_broadcasting' },
  { slug: 'proton', wiki: 'Proton' },
  { slug: 'neutron', wiki: 'Neutron' },
  { slug: 'down', wiki: 'Down_quark' },
  { slug: 'up', wiki: 'Up_quark' },
  { slug: 'neutrino-mu', wiki: 'Muon_neutrino' },
  { slug: 'neutrino-e', wiki: 'Electron_neutrino' },
  { slug: 'neutrino-tau', wiki: 'Tau_neutrino' },
  { slug: 'z', wiki: 'Z_boson' },
  { slug: 'w', wiki: 'W_boson' },
  { slug: 'bottom', wiki: 'Bottom_quark' },
  { slug: 'tau', wiki: 'Tau_(particle)' },
  { slug: 'charm', wiki: 'Charm_quark' },
  { slug: 'strange', wiki: 'Strange_quark' },
  { slug: 'meson', wiki: 'Meson' },
  { slug: 'x-and-y-bosons', wiki: 'X_and_Y_bosons' },

  // ATOMS/MOLECULES
  { slug: 'hydrogen', wiki: 'Hydrogen' },
  { slug: 'carbon', wiki: 'Carbon' },
  { slug: 'gold', wiki: 'Gold' },
  { slug: 'water-h-o', wiki: 'Water' },
  { slug: 'glucose', wiki: 'Glucose' },
  { slug: 'fullerene-c', wiki: 'Fullerene' },
  { slug: 'atp', wiki: 'Adenosine_triphosphate' },
  { slug: 'insulin', wiki: 'Insulin' },
  { slug: 'hemoglobin', wiki: 'Hemoglobin' },
  { slug: 'antibody-igg', wiki: 'Antibody' },
  { slug: 'adenine-a', wiki: 'Adenine' },
  { slug: 'guanine-g', wiki: 'Guanine' },
  { slug: 'cytosine-c', wiki: 'Cytosine' },
  { slug: 'thymine-t', wiki: 'Thymine' },
  { slug: 'ribosome', wiki: 'Ribosome' },

  // MACRO
  { slug: 'penny', wiki: 'Penny_(United_States_coin)' },
  { slug: 'soccer-ball', wiki: 'Football_(ball)' },
  { slug: '1-ml-of-water', wiki: 'Water' },
  { slug: '1-liter-of-water', wiki: 'Litre' },
  { slug: '1-tonne-of-water', wiki: 'Tonne' },

  // PLANETS
  { slug: 'beta-pictoris-b', wiki: 'Beta_Pictoris_b' },

  // STARS
  { slug: 'y-brown-dwarf', wiki: 'Brown_dwarf' },
  { slug: 't-brown-dwarf', wiki: 'T-type_star' },
  { slug: 'l-brown-dwarf', wiki: 'L-type_star' },
  { slug: 'trappist-1', wiki: 'TRAPPIST-1' },
  { slug: 'proxima-cen', wiki: 'Proxima_Centauri' },
  { slug: 'alpha-centauri-a', wiki: 'Alpha_Centauri' },
  { slug: 'sirius-a', wiki: 'Sirius' },
  { slug: 'sirius-b', wiki: 'Sirius' },
  { slug: 'vega', wiki: 'Vega' },
  { slug: 'horizontal-branch', wiki: 'Horizontal_branch' },
  { slug: 'wolf-rayet', wiki: 'Wolf–Rayet_star' },
  { slug: 'betelgeuse', wiki: 'Betelgeuse' },
  { slug: 'mira-variable', wiki: 'Mira_(star)' },
  { slug: 'white-dwarf', wiki: 'White_dwarf' },
  { slug: 'massive-wd', wiki: 'White_dwarf' },
  { slug: 'neutron-star', wiki: 'Neutron_star' },
  { slug: 'heaviest-ns', wiki: 'Neutron_star' },
  { slug: 'proto-pn', wiki: 'Protoplanetary_nebula' },
  { slug: 'red-supergiant', wiki: 'Red_supergiant_star' },
  { slug: 'blue-supergiant', wiki: 'Blue_supergiant_star' },

  // BLACK HOLES
  { slug: 'm87', wiki: 'Messier_87' },

  // GALAXIES
  { slug: 'dwarf-galaxy', wiki: 'Dwarf_galaxy' },
  { slug: 'galaxy-cluster', wiki: 'Galaxy_cluster' },
  { slug: 'laniakea', wiki: 'Laniakea_Supercluster' },
  { slug: 'observable-universe', wiki: 'Observable_universe' },
  { slug: 'bo-tes-void', wiki: 'Boötes_void' },
  { slug: 'kbc-void', wiki: 'KBC_Void' },

  // REMNANTS
  { slug: 'ngc-7538', wiki: 'NGC_7538' },
  { slug: 'bubble-nebula', wiki: 'NGC_7635' },
];

// Map of specific Commons filenames to use for objects (fallbacks with known working files)
const SPECIFIC_FILES = {
  'higgs': 'CMS_Higgs-event.jpg',
  'electron': 'Hydrogen_Density_Plots.png',
  'gamma-ray': 'NASA_Fermi_Gamma-ray_Space_Telescope_Observations_of_a_Gamma-ray_Burst.jpg',
  'x-ray': 'X-ray_of_the_hand.jpg',
  'ultraviolet': 'Fluorescent_minerals_hg.jpg',
  'visible-light': 'Light_dispersion_conceptual_waves.gif',
  'infrared': 'Infrared_dog.jpg',
  'proton': 'Proton_detected_in_an_isopropanol_cloud_chamber.jpg',
  'hydrogen': 'Hydrogen_discharge_tube.jpg',
  'carbon': 'Graphite-and-diamond-with-scale.jpg',
  'gold': 'Gold-36g.jpg',
  'water-h-o': 'Stilles_Mineralwasser.jpg',
  'glucose': 'Glucose_teste.JPG',
  'fullerene-c': 'C60-Fulleren-kristallin.JPG',
  'atp': 'ATP-xtal-3D-balls.png',
  'insulin': 'InsulinMonomer.jpg',
  'hemoglobin': '1GZX_Haemoglobin.png',
  'antibody-igg': 'Antibody_IgG1_structure.png',
  'adenine-a': 'Adenine-3D-balls.png',
  'guanine-g': 'Guanine-3D-balls.png',
  'cytosine-c': 'Cytosine-3D-balls.png',
  'thymine-t': 'Thymine-3D-balls.png',
  'ribosome': 'Ribosome_shape.png',
  'penny': 'US_One_Cent_Obv.png',
  '1-ml-of-water': 'Stilles_Mineralwasser.jpg',
  'sirius-a': 'Sirius_A_and_B_Hubble_photo.editted.PNG',
  'sirius-b': 'Sirius_A_and_B_Hubble_photo.editted.PNG',
  'white-dwarf': 'Sirius_A_and_B_Hubble_photo.editted.PNG',
  'massive-wd': 'Sirius_A_and_B_Hubble_photo.editted.PNG',
  'neutron-star': 'Moving_heart_of_the_Crab_Nebula.jpg',
  'heaviest-ns': 'Moving_heart_of_the_Crab_Nebula.jpg',
  'm87': 'Black_hole_-_Messier_87_crop_max_res.jpg',
  'galaxy-cluster': 'Abell_1689.jpg',
  'bubble-nebula': 'Bubble_nebula_NGC7635.jpg',
  'beta-pictoris-b': 'Beta_Pictoris_b.jpg',
};

async function processObject(obj) {
  if (manifest[obj.slug]) {
    console.log(`SKIP ${obj.slug} - in manifest`);
    return 'skipped';
  }

  const outputPath = path.join(IMAGES_DIR, `${obj.slug}.webp`);
  if (fs.existsSync(outputPath)) {
    console.log(`SKIP ${obj.slug} - file exists`);
    return 'skipped';
  }

  console.log(`\nProcessing: ${obj.slug} (wiki: ${obj.wiki})`);

  const tmpPath = `/tmp/wiki_${obj.slug}_tmp`;

  try {
    let imageUrl = null;
    let filename = null;

    // Strategy 1: Use specific known file
    if (SPECIFIC_FILES[obj.slug]) {
      filename = SPECIFIC_FILES[obj.slug];
      // Construct direct commons URL
      // Commons uses md5-based paths: commons/a/ab/filename
      // We need to get the URL from the API
      console.log(`  Trying specific file: ${filename}`);
      const meta = await getCommonsMetadata(filename);
      await sleep(1500);
      if (meta) {
        imageUrl = meta.url;
      }
    }

    // Strategy 2: Use REST API to get main page image
    if (!imageUrl) {
      console.log(`  Getting page summary for ${obj.wiki}...`);
      const summary = await getPageSummary(obj.wiki);
      await sleep(1500);

      if (summary?.originalimage?.source) {
        imageUrl = summary.originalimage.source;
        // Extract filename from URL
        const parts = imageUrl.split('/');
        filename = decodeURIComponent(parts[parts.length - 1]);
        console.log(`  Found main image: ${filename}`);
      } else {
        console.log(`  No image found for ${obj.slug}`);
        return 'no-image';
      }
    }

    if (!imageUrl) {
      console.log(`  No image URL for ${obj.slug}`);
      return 'no-image';
    }

    // Download with curl (works even when fetch is rate-limited for some paths)
    console.log(`  Downloading: ${imageUrl.substring(0, 80)}...`);
    const ok = downloadWithCurl(imageUrl, tmpPath);

    if (!ok) {
      console.log(`  Download failed for ${obj.slug}`);
      return 'failed';
    }

    // Convert to webp
    try {
      await convertToWebp(tmpPath, outputPath);
    } catch (e) {
      console.log(`  Conversion failed: ${e.message}`);
      // Clean up
      try { fs.unlinkSync(tmpPath); } catch {}
      return 'failed';
    }

    // Clean up temp file
    try { fs.unlinkSync(tmpPath); } catch {}

    // Get metadata
    if (!filename) {
      const parts = imageUrl.split('/');
      filename = decodeURIComponent(parts[parts.length - 1]);
    }

    let credit = 'Unknown';
    let license = 'Unknown';
    let source = imageUrl;

    try {
      const meta = await getCommonsMetadata(filename);
      await sleep(1500);
      if (meta) {
        credit = extractCredit(meta.metadata);
        license = extractLicense(meta.metadata);
        source = meta.descriptionUrl || `https://commons.wikimedia.org/wiki/File:${encodeURIComponent(filename)}`;
      }
    } catch (e) {
      console.log(`  Metadata fetch failed, using defaults`);
    }

    manifest[obj.slug] = {
      file: `${obj.slug}.webp`,
      credit,
      license,
      source
    };

    console.log(`  SUCCESS: ${obj.slug} (${credit.substring(0, 50)}, ${license})`);
    return 'success';

  } catch (e) {
    console.error(`  ERROR: ${e.message}`);
    try { fs.unlinkSync(tmpPath); } catch {}
    return 'error';
  }
}

async function main() {
  console.log(`Processing ${objects.length} objects...`);
  console.log(`Existing manifest entries: ${Object.keys(manifest).length}\n`);

  const results = { success: 0, skipped: 0, failed: 0, 'no-image': 0, error: 0 };

  for (const obj of objects) {
    const result = await processObject(obj);
    results[result]++;

    if (result === 'success') {
      fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2));
    }

    await sleep(2000);
  }

  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2));

  console.log(`\n=== RESULTS ===`);
  Object.entries(results).forEach(([k, v]) => console.log(`${k}: ${v}`));
  console.log(`Total manifest entries: ${Object.keys(manifest).length}`);

  // List what's still missing
  const allSlugs = objects.map(o => o.slug);
  const missing = allSlugs.filter(s => !manifest[s]);
  if (missing.length > 0) {
    console.log(`\nStill missing: ${missing.join(', ')}`);
  }
}

main().catch(console.error);
