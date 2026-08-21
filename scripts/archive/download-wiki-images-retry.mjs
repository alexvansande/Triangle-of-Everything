import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const IMAGES_DIR = path.join(__dirname, '..', 'content', 'images');
const MANIFEST_PATH = path.join(IMAGES_DIR, 'manifest.json');

const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchJSON(url) {
  const resp = await fetch(url);
  if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
  return resp.json();
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
  if (metadata.Artist) return metadata.Artist.value.replace(/<[^>]*>/g, '').trim().substring(0, 200);
  if (metadata.Credit) return metadata.Credit.value.replace(/<[^>]*>/g, '').trim().substring(0, 200);
  return 'Unknown';
}

function extractLicense(metadata) {
  if (metadata.LicenseShortName) return metadata.LicenseShortName.value;
  if (metadata.License) return metadata.License.value;
  return 'Unknown';
}

async function downloadAndConvert(imageUrl, outputPath) {
  console.log(`    Downloading: ${imageUrl.substring(0, 100)}...`);
  const resp = await fetch(imageUrl);
  if (!resp.ok) throw new Error(`Download failed: HTTP ${resp.status}`);
  const buffer = Buffer.from(await resp.arrayBuffer());

  // Handle different formats including gif
  try {
    await sharp(buffer, { animated: false })
      .resize(800, null, { withoutEnlargement: true })
      .webp({ quality: 80 })
      .toFile(outputPath);
  } catch (e) {
    // Try without animation flag
    await sharp(buffer)
      .resize(800, null, { withoutEnlargement: true })
      .webp({ quality: 80 })
      .toFile(outputPath);
  }
}

async function processWithFile(slug, fileTitle) {
  const outputPath = path.join(IMAGES_DIR, `${slug}.webp`);

  const info = await getImageInfo(fileTitle);
  if (!info) {
    console.log(`    No info for ${fileTitle}`);
    return false;
  }

  const downloadUrl = info.thumbUrl || info.url;
  await downloadAndConvert(downloadUrl, outputPath);

  manifest[slug] = {
    file: `${slug}.webp`,
    credit: extractCredit(info.metadata),
    license: extractLicense(info.metadata),
    source: info.descriptionUrl || `https://commons.wikimedia.org/wiki/${encodeURIComponent(fileTitle)}`
  };

  console.log(`  SUCCESS: ${slug}`);
  return true;
}

// For pages where we need to get all images and try them
async function getPageImages(wikiTitle) {
  const url = `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(wikiTitle)}&prop=images&imlimit=50&format=json`;
  const data = await fetchJSON(url);
  const pages = data.query.pages;
  const pageId = Object.keys(pages)[0];
  if (pageId === '-1') return [];
  return (pages[pageId].images || []).map(i => i.title);
}

// Skip these generic/icon files
const SKIP = /Commons-logo|Wiki|icon|logo|Symbol|Flag_of|Wiktionary|Folder|Ambox|Edit-clear|Question_book|Wikiquote|Nuvola|Crystal|Text-x|Gnome|Portal|Disambig|Lock-|Information_icon|Cscr-|OOjs_UI|Increase2|Decrease2|Steady2|Arrow|Wikidata|Wikisource|Wikinews|Wikiversity|Wikivoyage|pictogram|IEC|GHS-|Hazard|Electron_shell|Simple_Periodic|Periodic_table|HSV_color_solid_cylinder|Feynman|Standard_Model/i;

function isGoodImage(title) {
  if (SKIP.test(title)) return false;
  const lower = title.toLowerCase();
  // Accept: jpg, jpeg, png, gif, tif, tiff, webp
  return /\.(jpe?g|png|gif|tiff?|webp)$/i.test(lower);
}

// Objects that failed - with specific preferred image filenames where known
const retryObjects = [
  // PARTICLES - try harder with specific known images
  { slug: 'higgs', file: 'File:CMS Higgs-event.jpg', fallbackWiki: 'Higgs_boson' },
  { slug: 'top', file: 'File:ATLAS top quark  pair  candidate.jpg', fallbackWiki: 'Top_quark' },
  { slug: 'electron', file: 'File:Hydrogen Density Plots.png', fallbackWiki: 'Electron' },
  { slug: 'gamma-ray', file: 'File:Gamma-ray image of the Milky Way.tif', fallbackWiki: 'Gamma_ray' },
  { slug: 'x-ray', file: 'File:X-ray by Wilhelm Röntgen of Albert von Kölliker\'s hand - 18960123-02.jpg', fallbackWiki: 'X-ray' },
  { slug: 'ultraviolet', file: 'File:Fluorescent minerals hg.jpg', fallbackWiki: 'Ultraviolet' },
  { slug: 'visible-light', file: 'File:Light dispersion conceptual waves.gif', fallbackWiki: 'Visible_spectrum' },
  { slug: 'infrared', file: 'File:Infrared dog.jpg', fallbackWiki: 'Infrared' },
  { slug: 'microwave', file: 'File:Radar antenna.jpg', fallbackWiki: 'Microwave' },
  { slug: 'fm-radio', file: 'File:88.5 FM Antenna - San Francisco.jpg', fallbackWiki: 'FM_broadcasting' },
  { slug: 'am-radio', file: 'File:Two-Mast antenna.jpg', fallbackWiki: 'AM_broadcasting' },
  { slug: 'proton', file: 'File:Quark structure proton.svg', fallbackWiki: 'Proton' },
  { slug: 'neutron', file: 'File:Quark structure neutron.svg', fallbackWiki: 'Neutron' },

  // Molecules
  { slug: 'hydrogen', file: 'File:Hydrogen discharge tube.jpg', fallbackWiki: 'Hydrogen' },
  { slug: 'carbon', file: 'File:Graphite-and-diamond-with-scale.jpg', fallbackWiki: 'Carbon' },
  { slug: 'gold', file: 'File:Gold-nugget-tiny.jpg', fallbackWiki: 'Gold' },
  { slug: 'water-h-o', file: 'File:Stilles Mineralwasser.jpg', fallbackWiki: 'Water' },
  { slug: 'glucose', file: 'File:Glucose teste.JPG', fallbackWiki: 'Glucose' },
  { slug: 'fullerene-c', file: 'File:C60-Fulleren-kristallin.JPG', fallbackWiki: 'Fullerene' },
  { slug: 'atp', file: 'File:ATP-xtal-3D-balls.png', fallbackWiki: 'Adenosine_triphosphate' },
  { slug: 'insulin', file: 'File:InsulinMonomer.jpg', fallbackWiki: 'Insulin' },
  { slug: 'hemoglobin', file: 'File:1GZX Haemoglobin.png', fallbackWiki: 'Hemoglobin' },
  { slug: 'antibody-igg', file: 'File:Antibody IgG1 structure.png', fallbackWiki: 'Antibody' },
  { slug: 'adenine-a', file: 'File:Adenine-3D-balls.png', fallbackWiki: 'Adenine' },
  { slug: 'guanine-g', file: 'File:Guanine-3D-balls.png', fallbackWiki: 'Guanine' },
  { slug: 'cytosine-c', file: 'File:Cytosine-3D-balls.png', fallbackWiki: 'Cytosine' },
  { slug: 'thymine-t', file: 'File:Thymine-3D-balls.png', fallbackWiki: 'Thymine' },
  { slug: 'ribosome', file: 'File:Ribosome shape.png', fallbackWiki: 'Ribosome' },

  // MACRO
  { slug: 'penny', file: 'File:2017 US Lincoln Penny.jpg', fallbackWiki: 'Penny_(United_States_coin)' },
  { slug: 'soccer-ball', file: 'File:Adidas Jabulani Official Match Ball (4400718968).jpg', fallbackWiki: 'Football_(ball)' },
  { slug: '1-ml-of-water', file: 'File:Stilles Mineralwasser.jpg', fallbackWiki: 'Water' },
  { slug: '1-liter-of-water', file: 'File:Stilles Mineralwasser.jpg', fallbackWiki: 'Litre' },
  { slug: '1-tonne-of-water', file: 'File:Swimming pool 01.jpg', fallbackWiki: 'Swimming_pool' },

  // Stars/Exoplanets
  { slug: 'kepler-22b', wiki: 'Kepler-22b', usePageImg: true },
  { slug: 'beta-pictoris-b', file: 'File:Beta Pictoris b.jpg', fallbackWiki: 'Beta_Pictoris_b' },
  { slug: 'y-brown-dwarf', wiki: 'Brown_dwarf', usePageImg: true },
  { slug: 'trappist-1', wiki: 'TRAPPIST-1', usePageImg: true },
  { slug: 'proxima-cen', wiki: 'Proxima_Centauri', usePageImg: true },
  { slug: 'alpha-centauri-a', file: 'File:Best image of Alpha Centauri A and B.jpg', fallbackWiki: 'Alpha_Centauri' },
  { slug: 'sirius-a', file: 'File:Sirius A and B Hubble photo.editted.PNG', fallbackWiki: 'Sirius' },
  { slug: 'sirius-b', file: 'File:Sirius A and B Hubble photo.editted.PNG', fallbackWiki: 'Sirius' },
  { slug: 'vega', file: 'File:The first image of Vega.jpg', fallbackWiki: 'Vega' },
  { slug: 'betelgeuse', file: 'File:Betelgeuse 2020 (cropped).gif', fallbackWiki: 'Betelgeuse' },
  { slug: 'white-dwarf', file: 'File:Sirius A and B Hubble photo.editted.PNG', fallbackWiki: 'White_dwarf' },
  { slug: 'massive-wd', file: 'File:Sirius A and B Hubble photo.editted.PNG', fallbackWiki: 'White_dwarf' },
  { slug: 'neutron-star', file: 'File:Moving heart of the Crab Nebula.jpg', fallbackWiki: 'Neutron_star' },
  { slug: 'heaviest-ns', file: 'File:Moving heart of the Crab Nebula.jpg', fallbackWiki: 'Neutron_star' },
  { slug: 'mira-variable', wiki: 'Mira_(star)', usePageImg: true },
  { slug: 'wolf-rayet', wiki: 'Wolf–Rayet_star', usePageImg: true },
  { slug: 'horizontal-branch', file: 'File:Hertzsprung-Russell Diagram - ESO.png', fallbackWiki: 'Horizontal_branch' },
  { slug: 'proto-pn', file: 'File:An interstellar butterfly.jpg', fallbackWiki: 'Protoplanetary_nebula' },

  // Black holes / Galaxies
  { slug: 'm87', file: 'File:Black hole - Messier 87 crop max res.jpg', fallbackWiki: 'Messier_87' },
  { slug: 'dwarf-galaxy', wiki: 'Dwarf_galaxy', usePageImg: true },
  { slug: 'galaxy-cluster', file: 'File:Abell 1689.jpg', fallbackWiki: 'Galaxy_cluster' },
  { slug: 'laniakea', wiki: 'Laniakea_Supercluster', usePageImg: true },
  { slug: 'observable-universe', file: 'File:HubbleUltraDeepFieldwithScaleComparison.jpg', fallbackWiki: 'Observable_universe' },
  { slug: 'ngc-7538', file: 'File:NGC 7538.jpg', fallbackWiki: 'NGC_7538' },
  { slug: 'bubble-nebula', file: 'File:Bubble nebula NGC7635.jpg', fallbackWiki: 'NGC_7635' },

  // Abstract particle concepts - try Feynman diagrams or detector images from other pages
  { slug: 'down', wiki: 'Quark', usePageImg: true },
  { slug: 'neutrino-mu', file: 'File:FirstNeutrinoEventAnnotated.jpg', fallbackWiki: 'Muon_neutrino' },
];

async function tryPageImage(slug, wiki) {
  console.log(`  Trying page image for ${wiki}`);
  const url = `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(wiki)}&prop=pageimages&piprop=original&format=json`;
  const data = await fetchJSON(url);
  const pages = data.query.pages;
  const pageId = Object.keys(pages)[0];
  if (pageId === '-1') return false;
  const page = pages[pageId];
  if (!page.original) return false;

  const mainImage = page.original.source;
  const urlParts = mainImage.split('/');
  const rawFilename = decodeURIComponent(urlParts[urlParts.length - 1]);
  const fileTitle = `File:${rawFilename}`;

  console.log(`  Page image: ${rawFilename}`);

  // Get thumb URL via API
  const info = await getImageInfo(fileTitle);
  await sleep(300);
  if (!info) return false;

  const outputPath = path.join(IMAGES_DIR, `${slug}.webp`);
  const downloadUrl = info.thumbUrl || info.url;
  await downloadAndConvert(downloadUrl, outputPath);

  manifest[slug] = {
    file: `${slug}.webp`,
    credit: extractCredit(info.metadata),
    license: extractLicense(info.metadata),
    source: info.descriptionUrl || `https://commons.wikimedia.org/wiki/${encodeURIComponent(fileTitle)}`
  };

  console.log(`  SUCCESS: ${slug}`);
  return true;
}

async function tryAllPageImages(slug, wiki) {
  console.log(`  Getting all images from ${wiki}`);
  const images = await getPageImages(wiki);
  await sleep(300);

  const goodImages = images.filter(isGoodImage);
  if (goodImages.length === 0) return false;

  for (let i = 0; i < Math.min(5, goodImages.length); i++) {
    try {
      console.log(`  Trying: ${goodImages[i]}`);
      const result = await processWithFile(slug, goodImages[i]);
      await sleep(300);
      if (result) return true;
    } catch (e) {
      console.log(`    Failed: ${e.message}`);
    }
  }
  return false;
}

async function main() {
  let success = 0;
  let failed = 0;

  for (const obj of retryObjects) {
    if (manifest[obj.slug]) {
      console.log(`SKIP ${obj.slug} - already in manifest`);
      continue;
    }

    const outputPath = path.join(IMAGES_DIR, `${obj.slug}.webp`);
    if (fs.existsSync(outputPath)) {
      console.log(`SKIP ${obj.slug} - file exists`);
      continue;
    }

    console.log(`\nProcessing: ${obj.slug}`);

    try {
      let ok = false;

      // Strategy 1: Try specific file if provided
      if (obj.file && !ok) {
        try {
          ok = await processWithFile(obj.slug, obj.file);
          await sleep(500);
        } catch (e) {
          console.log(`  Specific file failed: ${e.message}`);
        }
      }

      // Strategy 2: Try page image
      if (!ok && obj.usePageImg && obj.wiki) {
        try {
          ok = await tryPageImage(obj.slug, obj.wiki);
          await sleep(500);
        } catch (e) {
          console.log(`  Page image failed: ${e.message}`);
        }
      }

      // Strategy 3: Try all images from fallback wiki or wiki
      if (!ok) {
        const wiki = obj.fallbackWiki || obj.wiki;
        if (wiki) {
          try {
            ok = await tryAllPageImages(obj.slug, wiki);
            await sleep(500);
          } catch (e) {
            console.log(`  All page images failed: ${e.message}`);
          }
        }
      }

      if (ok) {
        success++;
        fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2));
      } else {
        failed++;
        console.log(`  FAILED: ${obj.slug}`);
      }
    } catch (e) {
      failed++;
      console.error(`  ERROR: ${obj.slug}: ${e.message}`);
    }

    await sleep(800);
  }

  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2));

  console.log(`\n=== RETRY RESULTS ===`);
  console.log(`Success: ${success}`);
  console.log(`Failed: ${failed}`);
  console.log(`Total manifest entries: ${Object.keys(manifest).length}`);
}

main().catch(console.error);
