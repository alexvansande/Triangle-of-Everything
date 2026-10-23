// How much of its square each map picture actually covers (mean alpha), so
// the map can draw sparse silhouettes (a hippo, the Eiffel Tower) a little
// bigger than pictures that fill their box (a cube of water). Rerun after
// adding or redrawing icons:
//
//   node scripts/icon-coverage.mjs      # → content/icons/coverage.json
import fs from "node:fs";
import sharp from "sharp";

const DIR = "content/icons";
// Luminous pictures converted from screen-blend art (scripts/unscreen-icons.mjs)
// keep the coverage measured before: their new faint glow isn't a silhouette.
const unscreened = JSON.parse(fs.readFileSync(`${DIR}/unscreened.json`, "utf8"));
const before = JSON.parse(fs.readFileSync(`${DIR}/coverage.json`, "utf8"));
const out = {};
for (const f of fs.readdirSync(DIR).filter(f => f.endsWith(".webp")).sort()) {
  const name = f.replace(/\.webp$/, "");
  if (unscreened[name] && before[name] != null) { out[name] = before[name]; continue; }
  const { data, info } = await sharp(`${DIR}/${f}`).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  let a = 0;
  for (let i = 3; i < data.length; i += 4) a += data[i];
  out[f.replace(/\.webp$/, "")] = +(a / 255 / (info.width * info.height)).toFixed(3);
}
fs.writeFileSync(`${DIR}/coverage.json`, JSON.stringify(out, null, 1) + "\n");
console.log(`${DIR}/coverage.json: ${Object.keys(out).length} pictures`);
