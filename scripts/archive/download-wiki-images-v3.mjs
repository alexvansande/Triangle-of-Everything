import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const IMAGES_DIR = path.join(__dirname, '..', 'content', 'images');
const MANIFEST_PATH = path.join(IMAGES_DIR, 'manifest.json');

const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));

const HEADERS = {
  'User-Agent': 'TriangleOfEverything/1.0 (https://github.com/triangle-project; contact@example.com) Node.js',
  'Accept': 'application/json'
};

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchJSON(url) {
  const resp = await fetch(url, { headers: HEADERS });
  if (resp.status === 429) {
    console.log('    Rate limited, waiting 30s...');
    await sleep(30000);
    const resp2 = await fetch(url, { headers: HEADERS });
    if (!resp2.ok) throw new Error(`HTTP ${resp2.status}`);
    return resp2.json();
  }
  if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
  return resp.json();
}

async function fetchBuffer(url) {
  const resp = await fetch(url, {
    headers: { 'User-Agent': HEADERS['User-Agent'] }
  });
  if (resp.status === 429) {
    console.log('    Rate limited on download, waiting 30s...');
    await sleep(30000);
    const resp2 = await fetch(url, { headers: { 'User-Agent': HEADERS['User-Agent'] } });
    if (!resp2.ok) throw new Error(`Download HTTP ${resp2.status}`);
    return Buffer.from(await resp2.arrayBuffer());
  }
  if (!resp.ok) throw new Error(`Download HTTP ${resp.status}`);
  return Buffer.from(await resp.arrayBuffer());
}

// Use Wikimedia Commons API directly instead of Wikipedia API
async function getCommonsImageInfo(filename) {
  // Query commons directly
  const url = `https://commons.wikimedia.org/w/api.php?action=query&titles=${encodeURIComponent(filename)}&prop=imageinfo&iiprop=url|extmetadata&iiurlwidth=800&format=json`;
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

// Get page images from Wikipedia using prop=pageimages
async function getMainPageImage(wikiTitle) {
  const url = `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(wikiTitle)}&prop=pageimages&piprop=original&format=json`;
  const data = await fetchJSON(url);
  const pages = data.query.pages;
  const pageId = Object.keys(pages)[0];
  if (pageId === '-1') return null;
  return pages[pageId].original?.source || null;
}

// Get all images listed on a Wikipedia page
async function getPageImages(wikiTitle) {
  const url = `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(wikiTitle)}&prop=images&imlimit=50&format=json`;
  const data = await fetchJSON(url);
  const pages = data.query.pages;
  const pageId = Object.keys(pages)[0];
  if (pageId === '-1') return [];
  return (pages[pageId].images || []).map(i => i.title);
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

const SKIP = /Commons-logo|Wiki[a-z]|icon\b|logo\b|Symbol|Flag_of|Folder|Ambox|Edit-clear|Question_book|Nuvola|Crystal_|Text-x|Gnome|Portal-|Disambig|Lock-|Information_icon|Cscr-|OOjs_UI|Increase2|Decrease2|Steady2|Arrow|pictogram|IEC_|GHS-|Hazard|Electron_shell|Simple_Periodic|Periodic_table|HSV_color|Standard_Model|Feynman_diagram|Speaker_Icon|Loudspeaker|Headphones|Pronunciation|Audio|\.svg$/i;

function isGoodFile(title) {
  if (SKIP.test(title)) return false;
  return /\.(jpe?g|png|gif|tiff?|webp)$/i.test(title);
}

async function downloadAndConvert(imageUrl, outputPath) {
  const buffer = await fetchBuffer(imageUrl);
  try {
    await sharp(buffer, { animated: false })
      .resize(800, null, { withoutEnlargement: true })
      .webp({ quality: 80 })
      .toFile(outputPath);
  } catch (e) {
    await sharp(buffer)
      .resize(800, null, { withoutEnlargement: true })
      .webp({ quality: 80 })
      .toFile(outputPath);
  }
}

async function tryFile(slug, fileTitle) {
  const info = await getCommonsImageInfo(fileTitle);
  if (!info) return false;

  const outputPath = path.join(IMAGES_DIR, `${slug}.webp`);
  const downloadUrl = info.thumbUrl || info.url;
  console.log(`    Downloading: ${downloadUrl.substring(0, 80)}...`);
  await downloadAndConvert(downloadUrl, outputPath);

  manifest[slug] = {
    file: `${slug}.webp`,
    credit: extractCredit(info.metadata),
    license: extractLicense(info.metadata),
    source: info.descriptionUrl || `https://commons.wikimedia.org/wiki/${encodeURIComponent(fileTitle)}`
  };
  return true;
}

// All remaining objects to process
const objects = [
  // PARTICLES
  { slug: 'higgs', wiki: 'Higgs_boson', preferFiles: ['File:CMS_Higgs-event.jpg', 'File:Candidate_Higgs_Events_in_ATLAS_and_CMS.png'] },
  { slug: 'top', wiki: 'Top_quark' },
  { slug: 'electron', wiki: 'Electron', preferFiles: ['File:Hydrogen_Density_Plots.png', 'File:Atomic-orbital-clouds_spd_m0.png'] },
  { slug: 'gamma-ray', wiki: 'Gamma_ray', preferFiles: ['File:Gamma_ray_burst.jpg'] },
  { slug: 'x-ray', wiki: 'X-ray', preferFiles: ['File:X-ray_of_a_hand.jpg', 'File:Color_X-ray_photogram.jpg'] },
  { slug: 'ultraviolet', wiki: 'Ultraviolet', preferFiles: ['File:Fluorescent_minerals_hg.jpg', 'File:UV_Portrait.jpg'] },
  { slug: 'visible-light', wiki: 'Visible_spectrum', preferFiles: ['File:Light_dispersion_of_a_mercury-vapor_lamp_with_a_flint_glass_prism_IPNr%C2%B00125.jpg'] },
  { slug: 'infrared', wiki: 'Infrared', preferFiles: ['File:Infrared_dog.jpg', 'File:Infrared_portrait_comparison.jpg'] },
  { slug: 'microwave', wiki: 'Microwave', preferFiles: ['File:Radar_antenna.jpg'] },
  { slug: 'fm-radio', wiki: 'FM_broadcasting' },
  { slug: 'am-radio', wiki: 'AM_broadcasting' },
  { slug: 'proton', wiki: 'Proton', preferFiles: ['File:Proton_detected_in_an_isopropanol_cloud_chamber.jpg'] },
  { slug: 'neutron', wiki: 'Neutron', preferFiles: ['File:Institut_Laue%E2%80%93Langevin_(ILL)_in_Grenoble,_France.jpg'] },
  { slug: 'down', wiki: 'Quark' },
  { slug: 'neutrino-mu', wiki: 'Muon_neutrino', preferFiles: ['File:FirstNeutrinoEventAnnotated.jpg'] },

  // ATOMS/MOLECULES
  { slug: 'hydrogen', wiki: 'Hydrogen', preferFiles: ['File:Hydrogen_discharge_tube.jpg'] },
  { slug: 'carbon', wiki: 'Carbon', preferFiles: ['File:Graphite-and-diamond-with-scale.jpg'] },
  { slug: 'gold', wiki: 'Gold', preferFiles: ['File:Gold-36g.jpg', 'File:GoldNuggetUSGOV.jpg'] },
  { slug: 'water-h-o', wiki: 'Water', preferFiles: ['File:Stilles_Mineralwasser.jpg'] },
  { slug: 'glucose', wiki: 'Glucose', preferFiles: ['File:Glucose_teste.JPG'] },
  { slug: 'fullerene-c', wiki: 'Fullerene', preferFiles: ['File:C60-Fulleren-kristallin.JPG'] },
  { slug: 'atp', wiki: 'Adenosine_triphosphate', preferFiles: ['File:ATP-xtal-3D-balls.png'] },
  { slug: 'insulin', wiki: 'Insulin', preferFiles: ['File:InsulinMonomer.jpg', 'File:Insulin_struct.png'] },
  { slug: 'hemoglobin', wiki: 'Hemoglobin', preferFiles: ['File:1GZX_Haemoglobin.png'] },
  { slug: 'antibody-igg', wiki: 'Antibody', preferFiles: ['File:Antibody_IgG1_structure.png'] },
  { slug: 'adenine-a', wiki: 'Adenine', preferFiles: ['File:Adenine-3D-balls.png'] },
  { slug: 'guanine-g', wiki: 'Guanine', preferFiles: ['File:Guanine-3D-balls.png'] },
  { slug: 'cytosine-c', wiki: 'Cytosine', preferFiles: ['File:Cytosine-3D-balls.png'] },
  { slug: 'thymine-t', wiki: 'Thymine', preferFiles: ['File:Thymine-3D-balls.png'] },
  { slug: 'ribosome', wiki: 'Ribosome', preferFiles: ['File:Ribosome_shape.png'] },

  // MACRO
  { slug: 'penny', wiki: 'Penny_(United_States_coin)', preferFiles: ['File:2017_US_Lincoln_Penny.jpg', 'File:US_One_Cent_Obv.png'] },
  { slug: 'soccer-ball', wiki: 'Football_(ball)', preferFiles: ['File:Adidas_Jabulani_Official_Match_Ball_(4400718968).jpg'] },
  { slug: '1-ml-of-water', wiki: 'Water', preferFiles: ['File:Stilles_Mineralwasser.jpg'] },
  { slug: '1-liter-of-water', wiki: 'Litre', preferFiles: ['File:Masskrug.jpg'] },
  { slug: '1-tonne-of-water', wiki: 'Swimming_pool', preferFiles: ['File:Swimming_pool_01.jpg'] },

  // PLANETS
  { slug: 'beta-pictoris-b', wiki: 'Beta_Pictoris_b', preferFiles: ['File:Beta_Pictoris_b.jpg'] },

  // STARS
  { slug: 'y-brown-dwarf', wiki: 'Brown_dwarf', preferFiles: ["File:Artist's_conception_of_a_brown_dwarf_like_2MASSJ22282889-431026.jpg"] },
  { slug: 't-brown-dwarf', wiki: 'T-type_star' },
  { slug: 'l-brown-dwarf', wiki: 'L-type_star' },
  { slug: 'trappist-1', wiki: 'TRAPPIST-1' },
  { slug: 'proxima-cen', wiki: 'Proxima_Centauri', preferFiles: ['File:New_shot_of_Proxima_Centauri,_our_nearest_neighbour.jpg'] },
  { slug: 'alpha-centauri-a', wiki: 'Alpha_Centauri', preferFiles: ['File:Best_image_of_Alpha_Centauri_A_and_B.jpg'] },
  { slug: 'sirius-a', wiki: 'Sirius', preferFiles: ['File:Sirius_A_and_B_Hubble_photo.editted.PNG'] },
  { slug: 'sirius-b', wiki: 'Sirius', preferFiles: ['File:Sirius_A_and_B_Hubble_photo.editted.PNG'] },
  { slug: 'vega', wiki: 'Vega', preferFiles: ['File:The_first_image_of_Vega.jpg'] },
  { slug: 'horizontal-branch', wiki: 'Horizontal_branch', preferFiles: ['File:Hertzsprung-Russell_Diagram_-_ESO.png'] },
  { slug: 'wolf-rayet', wiki: 'Wolf%E2%80%93Rayet_star' },
  { slug: 'betelgeuse', wiki: 'Betelgeuse', preferFiles: ['File:Betelgeuse_2020_(cropped).gif'] },
  { slug: 'mira-variable', wiki: 'Mira_(star)' },
  { slug: 'white-dwarf', wiki: 'White_dwarf', preferFiles: ['File:Sirius_A_and_B_Hubble_photo.editted.PNG'] },
  { slug: 'massive-wd', wiki: 'White_dwarf', preferFiles: ['File:Sirius_A_and_B_Hubble_photo.editted.PNG'] },
  { slug: 'neutron-star', wiki: 'Neutron_star', preferFiles: ['File:Moving_heart_of_the_Crab_Nebula.jpg'] },
  { slug: 'heaviest-ns', wiki: 'Neutron_star', preferFiles: ['File:Moving_heart_of_the_Crab_Nebula.jpg'] },
  { slug: 'proto-pn', wiki: 'Protoplanetary_nebula', preferFiles: ['File:An_interstellar_butterfly.jpg', 'File:Westbrook_Nebula.tif'] },

  // BLACK HOLES
  { slug: 'm87', wiki: 'Messier_87', preferFiles: ['File:Black_hole_-_Messier_87_crop_max_res.jpg'] },
  { slug: 'dwarf-galaxy', wiki: 'Dwarf_galaxy', preferFiles: ['File:Large.mc.arp.750pix.jpg'] },
  { slug: 'galaxy-cluster', wiki: 'Galaxy_cluster', preferFiles: ['File:Abell_1689.jpg'] },
  { slug: 'laniakea', wiki: 'Laniakea_Supercluster', preferFiles: ['File:07-Laniakea_(LofE07240).png'] },
  { slug: 'observable-universe', wiki: 'Observable_universe', preferFiles: ['File:HubbleUltraDeepFieldwithScaleComparison.jpg', 'File:Observable_universe_logarithmic_illustration.png'] },
  { slug: 'ngc-7538', wiki: 'NGC_7538', preferFiles: ['File:NGC_7538.jpg'] },
  { slug: 'bubble-nebula', wiki: 'NGC_7635', preferFiles: ['File:Bubble_nebula_NGC7635.jpg'] },

  // Misc remaining
  { slug: 'bo-tes-void', wiki: 'Boötes_void' },
  { slug: 'kbc-void', wiki: 'KBC_Void' },
  { slug: 'red-supergiant', wiki: 'Red_supergiant_star' },
  { slug: 'blue-supergiant', wiki: 'Blue_supergiant_star' },
];

async function processObject(obj) {
  if (manifest[obj.slug]) {
    console.log(`SKIP ${obj.slug} - in manifest`);
    return 'skipped';
  }
  if (fs.existsSync(path.join(IMAGES_DIR, `${obj.slug}.webp`))) {
    console.log(`SKIP ${obj.slug} - file exists`);
    return 'skipped';
  }

  console.log(`\nProcessing: ${obj.slug}`);

  try {
    // Strategy 1: Try preferred files on Commons directly
    if (obj.preferFiles) {
      for (const file of obj.preferFiles) {
        try {
          console.log(`  Trying preferred: ${file}`);
          const ok = await tryFile(obj.slug, file);
          if (ok) {
            console.log(`  SUCCESS: ${obj.slug}`);
            return 'success';
          }
        } catch (e) {
          console.log(`    Failed: ${e.message}`);
        }
        await sleep(2000);
      }
    }

    // Strategy 2: Get main page image
    console.log(`  Getting main page image for ${obj.wiki}`);
    const mainImg = await getMainPageImage(obj.wiki);
    await sleep(2000);

    if (mainImg) {
      const urlParts = mainImg.split('/');
      const rawFilename = decodeURIComponent(urlParts[urlParts.length - 1]);
      if (!SKIP.test(rawFilename)) {
        const fileTitle = `File:${rawFilename}`;
        try {
          const ok = await tryFile(obj.slug, fileTitle);
          if (ok) {
            console.log(`  SUCCESS: ${obj.slug} (main page image)`);
            return 'success';
          }
        } catch (e) {
          console.log(`    Main page image failed: ${e.message}`);
        }
        await sleep(2000);
      }
    }

    // Strategy 3: Browse all page images
    console.log(`  Getting all images from ${obj.wiki}`);
    const allImages = await getPageImages(obj.wiki);
    await sleep(2000);

    const goodImages = allImages.filter(isGoodFile);
    for (let i = 0; i < Math.min(5, goodImages.length); i++) {
      try {
        console.log(`  Trying: ${goodImages[i]}`);
        const ok = await tryFile(obj.slug, goodImages[i]);
        if (ok) {
          console.log(`  SUCCESS: ${obj.slug}`);
          return 'success';
        }
      } catch (e) {
        console.log(`    Failed: ${e.message}`);
      }
      await sleep(2000);
    }

    console.log(`  FAILED: ${obj.slug}`);
    return 'failed';
  } catch (e) {
    console.error(`  ERROR: ${obj.slug}: ${e.message}`);
    return 'error';
  }
}

async function main() {
  console.log(`Processing ${objects.length} objects...`);
  const results = { success: 0, skipped: 0, failed: 0, error: 0 };

  for (const obj of objects) {
    const result = await processObject(obj);
    results[result]++;

    if (result === 'success') {
      fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2));
    }

    await sleep(1500);
  }

  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2));

  console.log(`\n=== RESULTS ===`);
  console.log(`Success: ${results.success}`);
  console.log(`Skipped: ${results.skipped}`);
  console.log(`Failed: ${results.failed}`);
  console.log(`Error: ${results.error}`);
  console.log(`Total manifest entries: ${Object.keys(manifest).length}`);
}

main().catch(console.error);
