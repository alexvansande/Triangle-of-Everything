import { defineConfig } from "vite";
import fs from "node:fs";
import path from "node:path";

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

// Dev server only: /videos/ is the narration videos page, as the build makes it
// (scripts/narration-preview.mjs), from the current scenes and takes on each load,
// and /rendered/<take>.mp4 its rendered videos: the full renders in output/videos/
// where this machine has them, else the web copies the site gets (video/web/).
const videosPage = () => ({
  name: "narration-videos-page",
  apply: "serve",
  configureServer(server) {
    server.middlewares.use(async (req, res, next) => {
      // the rendered videos (the full render where there is one), with byte ranges so they can seek
      const mp4 = req.url.match(/^\/rendered\/(short-[\w-]+)\.mp4/);
      if (mp4) {
        const { renderedVideo } = await import("./scripts/narration-grid.mjs");
        const { video } = renderedVideo(mp4[1], server.config.root, true);
        if (!video) return next();
        const fp = path.join(server.config.root, video);
        const size = fs.statSync(fp).size, range = /bytes=(\d*)-(\d*)/.exec(req.headers.range || "");
        const start = range && range[1] ? +range[1] : 0, end = range && range[2] ? +range[2] : size - 1;
        res.setHeader("Content-Type", "video/mp4");
        res.setHeader("Accept-Ranges", "bytes");
        res.setHeader("Content-Length", end - start + 1);
        if (range) { res.statusCode = 206; res.setHeader("Content-Range", `bytes ${start}-${end}/${size}`); }
        return fs.createReadStream(fp, { start, end }).pipe(res);
      }
      if (!/^\/videos\/?(\?|$)/.test(req.url)) return next();
      try {
        const { takeInfo, gridHtml, gitDate } = await import("./scripts/narration-grid.mjs");
        const root = server.config.root, narr = path.join(root, "public/narration");
        const takes = fs.readdirSync(narr).filter(t => t.startsWith("short-") && fs.existsSync(path.join(narr, t, "words.json"))).sort();
        const info = await takeInfo(takes, path.join(root, "public"), { root, fresh: true, local: true });
        for (const k of info) if (fs.existsSync(path.join(narr, k.id, "thumb.jpg"))) k.thumb = `narration/${k.id}/thumb.jpg`;
        const html = (await server.transformIndexHtml(req.url, fs.readFileSync(path.join(root, "index.html"), "utf8")))
          .replace("</body>", gridHtml(info, { built: gitDate([], root), commit: "local", base: "/" }) + "\n</body>");
        res.setHeader("Content-Type", "text/html");
        res.end(html);
      } catch (e) { next(e); }
    });
  },
});

export default defineConfig(({ mode }) => {
  // the narration preview and the site's on-device test build (scripts/device-preview.mjs)
  const preview = mode === "narration-preview" || mode === "device-preview";
  return {
    plugins: [videosPage(), ...(preview ? [maxResolutionsOnly()] : [])],
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
