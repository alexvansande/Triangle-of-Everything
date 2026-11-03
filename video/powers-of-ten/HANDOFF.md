# Hand-off: the image pass for the powers-of-ten zoom

Branch `powers-of-ten`. Start with **`genai-kit/README.md`**: it has the task, what's at each
scale, what's true about it, the light, the order to work in, the prompt and where to save.

- **What to make:** 72 tiles (8 per level, L1 to L9), from 13.3 m above the General Sherman
  tree down to a 2 mm dew drop on a ladybug. Each `genai-kit/L*/<tile>-drawing.png` is the
  composition to keep; L1 and L2 also have `<tile>-photo.jpg`, the real ground. L0 is the real
  photo: don't generate it, match it.
- **Where results go:** `genai-kit/generated/L<k>-<width>/<tile>.png`, 1,280 px with the
  overlap, plus `genai-kit/generated/NOTES.md` (model, settings, prompt changes).
- **See the zoom:** `tools/powers-of-ten.html` (`npm run dev`, then
  http://localhost:5173/tools/powers-of-ten.html); its notes are `README.md` here. The real
  photos above the kit are in `photos/` (`../../scripts/powers-of-ten-photos.py` rebuilds them).
- **Rebuild the kit:** `node scripts/powers-of-ten-genai-kit.mjs` (needs the dev server and
  Playwright; see the script's header).
- **Not wired in yet:** the zoom doesn't read `generated/` yet. Once a few levels exist they'll
  be stitched into one image per level (blending the overlaps) and shown as plates, like the photos.
