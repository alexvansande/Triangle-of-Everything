import { defineConfig } from "vite";

export default defineConfig({
  build: {
    // Never base64-inline the content images (map icons, sidebar photos).
    // assets.js globs them as `?url` so each webp is fetched only when it
    // is actually drawn — but Vite's default 4 KB inline limit silently
    // turned ~270 of them into base64 inside the main JS bundle (~115 KB
    // gzipped of startup JS for pictures most visits never show).
    assetsInlineLimit: (file) => (file.includes("/content/") ? false : undefined),
  },
});
