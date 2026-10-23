import { defineConfig } from "vite";
import fs from "node:fs";

// The narration preview is hosted where a page can hold only ~500 files
// (claude.ai). The full build emits ~1,250, so the host silently drops the
// rest and pictures go missing. For that build only: the player always draws
// an icon's largest picture (setIconMaxRes), so ship just that one, and fold
// the small content images into the bundle instead of separate files.
const PREVIEW_INLINE_BYTES = 12 * 1024;
const maxResolutionsOnly = () => {
  const manifest = JSON.parse(fs.readFileSync("content/icons/resolutions/manifest.json", "utf8"));
  const largest = Object.values(manifest)
    .map(e => e.variants.reduce((a, b) => (b.width > a.width ? b : a), e.variants[0]))
    .filter(Boolean)
    .map(v => `"../content/icons/resolutions/${v.path}"`);
  return {
    name: "narration-preview-max-resolutions",
    transform(code, id) {
      if (!id.endsWith("/src/assets.js")) return;
      return code.replace('import.meta.glob("../content/icons/resolutions/*/*.webp"', `import.meta.glob([${largest.join(",")}]`);
    },
  };
};

export default defineConfig(({ mode }) => {
  // the narration preview and the site's on-device test build (scripts/device-preview.mjs)
  const preview = mode === "narration-preview" || mode === "device-preview";
  return {
    plugins: preview ? [maxResolutionsOnly()] : [],
    build: {
      // Never base64-inline the content images (map icons, sidebar photos).
      // assets.js globs them as `?url` so each webp is fetched only when it
      // is actually drawn — but Vite's default 4 KB inline limit silently
      // turned ~270 of them into base64 inside the main JS bundle (~115 KB
      // gzipped of startup JS for pictures most visits never show).
      assetsInlineLimit: (file, content) =>
        file.includes("/content/") ? (preview ? content.length < PREVIEW_INLINE_BYTES : false) : undefined,
    },
  };
});
