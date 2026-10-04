// Object descriptions (~29 KB gzipped). Kept out of the startup bundle:
// main.js loads this chunk on the first user interaction, or when the info
// panel opens, whichever comes first (see loadDescriptions in assets.js).
const files = import.meta.glob("../content/descriptions/*.md", { query: "?raw", import: "default", eager: true });

export const DESC_BY_SLUG = {};
for (const [path, content] of Object.entries(files)) {
  const slug = path.replace("../content/descriptions/", "").replace(".md", "");
  DESC_BY_SLUG[slug] = content.trim();
}
