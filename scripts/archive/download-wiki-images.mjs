import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const IMAGES_DIR = path.join(__dirname, '..', 'content', 'images');
const MANIFEST_PATH = path.join(IMAGES_DIR, 'manifest.json');

// Read existing manifest
const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));

// Objects to download with their Wikipedia page titles
const objects = [
  // PARTICLES
  { slug: 'top', wiki: 'Top_quark' },
  { slug: 'higgs', wiki: 'Higgs_boson' },
  { slug: 'z', wiki: 'Z_boson' },
  { slug: 'w', wiki: 'W_boson' },
  { slug: 'bottom', wiki: 'Bottom_quark' },
  { slug: 'tau', wiki: 'Tau_(particle)' },
  { slug: 'charm', wiki: 'Charm_quark' },
  { slug: 'strange', wiki: 'Strange_quark' },
  { slug: 'muon', wiki: 'Muon' },
  { slug: 'meson', wiki: 'Meson' },
  { slug: 'down', wiki: 'Down_quark' },
  { slug: 'up', wiki: 'Up_quark' },
  { slug: 'electron', wiki: 'Electron' },
  { slug: 'gamma-ray', wiki: 'Gamma_ray' },
  { slug: 'x-ray', wiki: 'X-ray' },
  { slug: 'ultraviolet', wiki: 'Ultraviolet' },
  { slug: 'visible-light', wiki: 'Visible_spectrum' },
  { slug: 'infrared', wiki: 'Infrared' },
  { slug: 'microwave', wiki: 'Microwave' },
  { slug: 'cmb-photon', wiki: 'Cosmic_microwave_background' },
  { slug: 'fm-radio', wiki: 'FM_broadcasting' },
  { slug: 'am-radio', wiki: 'AM_broadcasting' },
  { slug: 'neutrino-tau', wiki: 'Tau_neutrino' },
  { slug: 'neutrino-mu', wiki: 'Muon_neutrino' },
  { slug: 'neutrino-e', wiki: 'Electron_neutrino' },
  { slug: 'x-and-y-bosons', wiki: 'X_and_Y_bosons' },

  // ATOMS/MOLECULES
  { slug: 'proton', wiki: 'Proton' },
  { slug: 'neutron', wiki: 'Neutron' },
  { slug: 'hydrogen', wiki: 'Hydrogen' },
  { slug: 'helium', wiki: 'Helium' },
  { slug: 'carbon', wiki: 'Carbon' },
  { slug: 'oxygen', wiki: 'Oxygen' },
  { slug: 'iron', wiki: 'Iron' },
  { slug: 'gold', wiki: 'Gold' },
  { slug: 'uranium', wiki: 'Uranium' },
  { slug: 'oganesson', wiki: 'Oganesson' },
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
  { slug: 'dna', wiki: 'DNA' },
  { slug: 'ribosome', wiki: 'Ribosome' },

  // MACRO
  { slug: '1-ml-of-water', wiki: 'Litre' },
  { slug: '1-liter-of-water', wiki: 'Litre' },
  { slug: '1-tonne-of-water', wiki: 'Tonne' },
  { slug: 'penny', wiki: 'Penny_(United_States_coin)' },
  { slug: 'soccer-ball', wiki: 'Association_football' },

  // PLANETS
  { slug: 'kepler-22b', wiki: 'Kepler-22b' },
  { slug: 'beta-pictoris-b', wiki: 'Beta_Pictoris_b' },

  // STARS
  { slug: 'y-brown-dwarf', wiki: 'Brown_dwarf' },
  { slug: 't-brown-dwarf', wiki: 'T-type_star' },
  { slug: 'l-brown-dwarf', wiki: 'L-type_star' },
  { slug: 'trappist-1', wiki: 'TRAPPIST-1' },
  { slug: 'proxima-cen', wiki: 'Proxima_Centauri' },
  { slug: 'red-dwarf', wiki: 'Red_dwarf' },
  { slug: 't-tauri', wiki: 'T_Tauri_star' },
  { slug: 'alpha-centauri-a', wiki: 'Alpha_Centauri' },
  { slug: 'subgiant-procyon-a', wiki: 'Procyon' },
  { slug: 'sirius-a', wiki: 'Sirius' },
  { slug: 'vega', wiki: 'Vega' },
  { slug: 'horizontal-branch', wiki: 'Horizontal_branch' },
  { slug: 'wolf-rayet', wiki: 'Wolf%E2%80%93Rayet_star' },
  { slug: 'massive-star', wiki: 'Blue_giant' },
  { slug: 'blue-supergiant', wiki: 'Blue_supergiant_star' },
  { slug: 'v-massive-star', wiki: 'Hypergiant' },
  { slug: 'red-giant', wiki: 'Red_giant' },
  { slug: 'agb-star', wiki: 'Asymptotic_giant_branch' },
  { slug: 'mira-variable', wiki: 'Mira_variable' },
  { slug: 'betelgeuse', wiki: 'Betelgeuse' },
  { slug: 'red-supergiant', wiki: 'Red_supergiant_star' },
  { slug: 'procyon-b', wiki: 'Procyon' },
  { slug: 'white-dwarf', wiki: 'White_dwarf' },
  { slug: 'sirius-b', wiki: 'Sirius' },
  { slug: 'massive-wd', wiki: 'White_dwarf' },
  { slug: 'neutron-star', wiki: 'Neutron_star' },
  { slug: 'millisecond-pulsar', wiki: 'Millisecond_pulsar' },
  { slug: 'magnetar', wiki: 'Magnetar' },
  { slug: 'heaviest-ns', wiki: 'Neutron_star' },
  { slug: 'proto-pn', wiki: 'Protoplanetary_nebula' },

  // BLACK HOLES
  { slug: 'big-bang', wiki: 'Big_Bang' },
  { slug: 'primordial-black-hole', wiki: 'Primordial_black_hole' },
  { slug: '3k-bh', wiki: 'Black_hole' },
  { slug: 'stellar-bh', wiki: 'Stellar_black_hole' },
  { slug: 'sgr-a', wiki: 'Sagittarius_A*' },
  { slug: 'm87', wiki: 'Messier_87' },
  { slug: 'ton-618', wiki: 'TON_618' },

  // GALAXIES/LARGE SCALE
  { slug: 'dwarf-galaxy', wiki: 'Dwarf_galaxy' },
  { slug: 'ngc-1277', wiki: 'NGC_1277' },
  { slug: 'galaxy-cluster', wiki: 'Galaxy_cluster' },
  { slug: 'laniakea', wiki: 'Laniakea_Supercluster' },
  { slug: 'bo-tes-void', wiki: 'Boötes_void' },
  { slug: 'eridanus-supervoid', wiki: 'CMB_cold_spot' },
  { slug: 'kbc-void', wiki: 'KBC_Void' },
  { slug: 'observable-universe', wiki: 'Observable_universe' },

  // REMNANTS
  { slug: 'protostar', wiki: 'Protostar' },
  { slug: 'ngc-7538', wiki: 'NGC_7538' },
  { slug: 'bubble-nebula', wiki: 'NGC_7635' },
  { slug: 'barnard-68', wiki: 'Barnard_68' },
  { slug: 'heat-death', wiki: 'Heat_death_of_the_universe' },
];

// Skip SVGs and icons - prefer photos/diagrams
const SKIP_PATTERNS = [
  /Commons-logo/i, /Wiki/i, /icon/i, /logo/i, /Symbol/i, /Flag_of/i,
  /Wiktionary/i, /Folder/i, /Ambox/i, /Edit-clear/i, /Question_book/i,
  /Wikiquote/i, /Nuvola/i, /Crystal/i, /Text-x/i, /Gnome/i,
  /Portal/i, /Disambig/i, /Lock-/i, /Information_icon/i, /Cscr-/i,
  /OOjs_UI/i, /Increase2/i, /Decrease2/i, /Steady2/i, /Arrow/i,
  /Wikidata/i, /Wikisource/i, /Wikinews/i, /Wikiversity/i, /Wikivoyage/i,
  /\bsymbol\b/i, /pictogram/i, /IEC/i, /GHS-/i, /Hazard/i,
  /Electron_shell/i, /Simple_Periodic/i, /Periodic_table/i
];

// Prefer these patterns for images
const PREFER_PATTERNS = [
  /photograph/i, /photo/i, /image/i, /NASA/i, /ESA/i, /Hubble/i,
  /JWST/i, /telescope/i, /microscop/i, /detector/i, /artist/i,
  /illustration/i, /render/i, /diagram/i, /model/i, /structure/i,
  /crystal/i, /sample/i, /specimen/i, /portrait/i, /view/i,
];

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchJSON(url) {
  const resp = await fetch(url);
  if (!resp.ok) throw new Error(`HTTP ${resp.status} for ${url}`);
  return resp.json();
}

async function getWikiImages(wikiTitle) {
  // Use the page images API to get the main image first
  const pageImageUrl = `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(wikiTitle)}&prop=pageimages&piprop=original&format=json`;

  try {
    const data = await fetchJSON(pageImageUrl);
    const pages = data.query.pages;
    const pageId = Object.keys(pages)[0];
    if (pageId === '-1') return { mainImage: null, allImages: [] };

    const page = pages[pageId];
    const mainImage = page.original ? page.original.source : null;

    // Also get the list of images on the page
    const imagesUrl = `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(wikiTitle)}&prop=images&imlimit=50&format=json`;
    const imgData = await fetchJSON(imagesUrl);
    const imgPages = imgData.query.pages;
    const imgPageId = Object.keys(imgPages)[0];
    const allImages = imgPages[imgPageId].images || [];

    return { mainImage, allImages };
  } catch (e) {
    console.error(`  Error fetching wiki images for ${wikiTitle}: ${e.message}`);
    return { mainImage: null, allImages: [] };
  }
}

async function getImageInfo(filename) {
  const url = `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(filename)}&prop=imageinfo&iiprop=url|extmetadata&iiurlwidth=800&format=json`;
  const data = await fetchJSON(url);
  const pages = data.query.pages;
  const pageId = Object.keys(pages)[0];
  if (pageId === '-1' || !pages[pageId].imageinfo) return null;

  const info = pages[pageId].imageinfo[0];
  return {
    thumbUrl: info.thumburl || info.url,
    url: info.url,
    descriptionUrl: info.descriptionurl,
    metadata: info.extmetadata || {}
  };
}

function extractCredit(metadata) {
  if (metadata.Artist) {
    // Strip HTML tags
    return metadata.Artist.value.replace(/<[^>]*>/g, '').trim().substring(0, 200);
  }
  if (metadata.Credit) {
    return metadata.Credit.value.replace(/<[^>]*>/g, '').trim().substring(0, 200);
  }
  return 'Unknown';
}

function extractLicense(metadata) {
  if (metadata.LicenseShortName) {
    return metadata.LicenseShortName.value;
  }
  if (metadata.License) {
    return metadata.License.value;
  }
  return 'Unknown';
}

function shouldSkipImage(filename) {
  return SKIP_PATTERNS.some(p => p.test(filename));
}

function isPreferredImage(filename) {
  return PREFER_PATTERNS.some(p => p.test(filename));
}

function isImageFile(filename) {
  const lower = filename.toLowerCase();
  return lower.endsWith('.jpg') || lower.endsWith('.jpeg') || lower.endsWith('.png') ||
         lower.endsWith('.tif') || lower.endsWith('.tiff') || lower.endsWith('.webp') ||
         lower.endsWith('.gif');
}

async function downloadAndConvert(imageUrl, outputPath) {
  const resp = await fetch(imageUrl);
  if (!resp.ok) throw new Error(`Download failed: HTTP ${resp.status}`);
  const buffer = Buffer.from(await resp.arrayBuffer());

  await sharp(buffer)
    .resize(800, null, { withoutEnlargement: true })
    .webp({ quality: 80 })
    .toFile(outputPath);
}

async function processObject(obj) {
  const { slug, wiki } = obj;

  // Skip if already exists
  if (manifest[slug]) {
    console.log(`SKIP ${slug} - already in manifest`);
    return 'skipped';
  }

  const outputPath = path.join(IMAGES_DIR, `${slug}.webp`);
  if (fs.existsSync(outputPath)) {
    console.log(`SKIP ${slug} - file already exists`);
    return 'skipped';
  }

  console.log(`\nProcessing: ${slug} (wiki: ${wiki})`);

  try {
    const { mainImage, allImages } = await getWikiImages(wiki);
    await sleep(500);

    // Strategy 1: Use the main page image (usually the best one)
    if (mainImage) {
      // Get metadata for the main image
      // Extract filename from URL
      const urlParts = mainImage.split('/');
      const rawFilename = decodeURIComponent(urlParts[urlParts.length - 1]);
      const fileTitle = `File:${rawFilename}`;

      if (isImageFile(rawFilename) && !shouldSkipImage(rawFilename)) {
        console.log(`  Using main page image: ${rawFilename}`);
        const info = await getImageInfo(fileTitle);
        await sleep(500);

        if (info) {
          const downloadUrl = info.thumbUrl || mainImage;
          console.log(`  Downloading from: ${downloadUrl.substring(0, 80)}...`);

          await downloadAndConvert(downloadUrl, outputPath);

          const credit = extractCredit(info.metadata);
          const license = extractLicense(info.metadata);
          const source = info.descriptionUrl || `https://commons.wikimedia.org/wiki/${encodeURIComponent(fileTitle)}`;

          manifest[slug] = {
            file: `${slug}.webp`,
            credit,
            license,
            source
          };

          console.log(`  SUCCESS: ${slug} (${credit}, ${license})`);
          return 'success';
        }
      }
    }

    // Strategy 2: Pick from the images list
    const imageFiles = allImages
      .map(img => img.title)
      .filter(title => {
        const name = title.replace('File:', '');
        return isImageFile(name) && !shouldSkipImage(name);
      });

    // Sort: preferred images first
    imageFiles.sort((a, b) => {
      const aPreferred = isPreferredImage(a) ? -1 : 0;
      const bPreferred = isPreferredImage(b) ? -1 : 0;
      return aPreferred - bPreferred;
    });

    if (imageFiles.length === 0) {
      console.log(`  NO SUITABLE IMAGE found for ${slug}`);
      return 'no-image';
    }

    // Try the first few candidates
    for (let i = 0; i < Math.min(3, imageFiles.length); i++) {
      const fileTitle = imageFiles[i];
      console.log(`  Trying: ${fileTitle}`);

      try {
        const info = await getImageInfo(fileTitle);
        await sleep(500);

        if (!info) continue;

        const downloadUrl = info.thumbUrl;
        console.log(`  Downloading from: ${downloadUrl.substring(0, 80)}...`);

        await downloadAndConvert(downloadUrl, outputPath);

        const credit = extractCredit(info.metadata);
        const license = extractLicense(info.metadata);
        const source = info.descriptionUrl || `https://commons.wikimedia.org/wiki/${encodeURIComponent(fileTitle)}`;

        manifest[slug] = {
          file: `${slug}.webp`,
          credit,
          license,
          source
        };

        console.log(`  SUCCESS: ${slug} (${credit}, ${license})`);
        return 'success';
      } catch (e) {
        console.log(`  Failed with ${fileTitle}: ${e.message}`);
        continue;
      }
    }

    console.log(`  FAILED: Could not download any image for ${slug}`);
    return 'failed';

  } catch (e) {
    console.error(`  ERROR processing ${slug}: ${e.message}`);
    return 'error';
  }
}

async function main() {
  console.log(`Starting download of ${objects.length} Wikipedia images...`);
  console.log(`Images directory: ${IMAGES_DIR}`);
  console.log(`Existing manifest entries: ${Object.keys(manifest).length}\n`);

  const results = { success: 0, skipped: 0, failed: 0, 'no-image': 0, error: 0 };

  for (const obj of objects) {
    const result = await processObject(obj);
    results[result]++;

    // Save manifest after each successful download
    if (result === 'success') {
      fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2));
    }

    // Rate limit
    await sleep(1000);
  }

  // Final save
  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2));

  console.log('\n=== RESULTS ===');
  console.log(`Success: ${results.success}`);
  console.log(`Skipped: ${results.skipped}`);
  console.log(`No image: ${results['no-image']}`);
  console.log(`Failed: ${results.failed}`);
  console.log(`Error: ${results.error}`);
  console.log(`Total manifest entries: ${Object.keys(manifest).length}`);
}

main().catch(console.error);
