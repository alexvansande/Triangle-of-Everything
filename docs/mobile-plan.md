# Making the Triangle great on mobile

A measured plan to take the app from "born on a poster" to as smooth as a mobile map app.
Written 2026-08-19, based on a 48-finding code audit (every finding verified against the
source) plus real measurements from the new perf harness.

---

## 1. Where we are — the measured baseline

Conditions: headless Chrome, 390×844 @3x touch viewport, **Fast-4G network + 4× CPU
throttle** (a mid-range Android). Reproduce anytime with `npm run perf:mobile`.

| Metric | Today | Budget ("map-app good") |
|---|---|---|
| LCP | **4.9 s** | ≤ 2.5 s |
| Requests before interactive | **189** | ≤ 60 |
| Startup long tasks (main thread blocked) | **8.2 s** across 108 tasks | ≤ 0.8 s |
| Pinch zoom | **18–22 fps** | ≥ 45 fps avg |
| Pan | **11 fps** | ≥ 45 fps avg |
| Preset / tour fly-to animation | **5.7 fps** | ≥ 45 fps avg |
| Idle CPU after load | **60 fps rAF loop, forever** | 0 (idle page = idle CPU) |

The budgets are encoded in `scripts/mobile-perf.mjs` (`BUDGETS` at the top) — `--ci` makes
the script exit non-zero when busted.

### Why it's slow — the five root causes

1. **Immediate-mode rendering on retained-mode SVG.** Every zoom/pan frame calls 14 draw
   functions that each `selectAll("*").remove()` and rebuild — ~1,000–2,000 SVG nodes
   destroyed and recreated per frame, plus O(n²) label/cluster layout over 179 objects
   ([main.js:4546](../src/main.js), layers cleared at 553, 661, 763, 915, 1361, 1713,
   1785–1787, 3318, 3775…). The 3 s intro and every 2–3 s tour step ride this same path.
2. **A rAF loop that never stops.** `animateConnections` re-queues itself forever — even
   when disabled, with no visible paths, or with the tab hidden — animating up to 930
   circles, some with per-dot `feGaussianBlur` on `mix-blend-mode: screen` layers
   ([main.js:3908–3997](../src/main.js)). The page never idles; batteries pay for it.
3. **Per-frame geometry measurement.** `drawConnections` runs in the zoom path and does
   19 × `getTotalLength()` + ~160 × `getPointAtLength()` per frame, and marks the dot pool
   stale so it's rebuilt every frame during gestures ([main.js:3774–3812](../src/main.js)).
4. **Startup request storm.** All 130 icons are eagerly preloaded at module load; the lazy
   `import.meta.glob` gives each icon a JS wrapper chunk, so it's ~260 requests / 1.26 MB
   (the comment says "~70KB" — it isn't) ([main.js:73–98](../src/main.js)). First paint is
   gated on the full 360 KB bundle executing (`body.ready` added on the last line); KaTeX
   (75 KB gz) and all 208 description files load up front; Google Fonts CSS render-blocks.
5. **No mobile design, expensive glass.** Zero `@media` queries in the entire app. 16
   `backdrop-filter: blur()` surfaces composite over the always-repainting SVG (the mobile
   killer: full-screen sidebar blur, [style.css:520](../src/style.css)). A viewport-sized
   `feGaussianBlur` triangle glow is re-filtered every frame ([main.js:775](../src/main.js)).
   Any resize — rotation, URL-bar collapse, keyboard — **wipes the user's zoom position**
   ([main.js:5222](../src/main.js)).

---

## 2. The toolkit (new scripts — use these to prove every change)

| Command | What it does |
|---|---|
| `npm run perf:mobile` | Builds nothing; serves `dist/` via `vite preview`, emulates a mid-range phone (4G + 4× CPU, touch), measures load waterfall, long tasks, and **frame rate during pinch / pan / preset fly-to**. Also runs the **label-invariant checks** — fails if text scales during pinch, disappears during gestures, or strands in place while images move (the three banned regressions from past redesigns). Writes `scripts/perf-reports/*.json`. Flags: `--dev`, `--url <u>`, `--net 3g\|4g\|none`, `--cpu N`, `--trace` (DevTools-loadable trace), `--ci`. |
| `npm run audit:assets` | Static audit: dist chunk shape (request-storm detection), icon/photo dimensions vs. rendered size, tile pyramid weight, render-blocking externals. `--json` for machine output. |
| `npm run perf:compare` | Diffs the two latest perf reports (or any two): every load metric and per-gesture fps with ✓/✗ deltas. |

**The loop:** `npm run build && npm run perf:mobile` → make one change → build + run again →
`npm run perf:compare`. Run on a quiet machine — background load skews long-task numbers.

---

## 3. Phase 1 — Stop the constant burn (small fixes, big wins)

> **STATUS: DONE (2026-08-19), including an 8-angle adversarial review of the
> diff (10 findings, all fixed).** Measured against the baseline (same 4G + 4× CPU
> conditions): LCP 4.9 s → **0.85 s** (−83%), requests 189 → **21** (−89%), startup
> main-thread blockage 8.2 s → **0.28 s** (−97%), fly-to 5.7 → **56.7 fps** (+895%),
> pan 11 → **52.7 fps** (+375%), pinch 21 → **48–57 fps**. All label invariants
> green with honest 1:1 tracking (texts move 185 px when the map moves 185 px).
> Review fixes worth knowing about: input-modality tracker (touch mode ⇄ mouse
> mode) as the single gate for the gesture surface and click-target divs, so
> hybrid devices work; taps forward to in-SVG handlers (minimap, info labels);
> a dot renders beneath each icon until its webp arrives; Greek glyph subset
> restored; resize no longer clobbers the clip rect or double-renders.
>
> **Two real bugs discovered along the way:**
> 1. **Touch gestures died after one frame** (pre-existing, likely THE mobile
>    complaint): touch events stay bound to the element the finger first lands
>    on, and the per-frame rebuild deletes that node — the detached node stops
>    bubbling, d3-zoom loses the gesture. Fixed with a stable transparent
>    gesture-surface rect on top of the chart (coarse pointers only), plus
>    inert click-target divs on touch with direct tap hit-testing.
> 2. **The tour intro card covers the bottom half of a phone screen** at boot
>    and swallows gestures — now the first Phase 3 item (compact mobile card).
>
> Icon downscaling was dropped: icons render up to ~230 CSS px at deep zoom on
> @3x screens, so the 512 px sources are correct (and now lazily fetched anyway).

Every item here is `effort: small/medium` and independent.

1. **Kill the perpetual rAF.** Cancel instead of re-queue when `_animDisabled`, no
   `cp._visible` path, or `document.hidden`; restart from `drawConnections()` /
   `visibilitychange`. Pause it during active zoom. [main.js:3908–3997]
2. **Stop measuring paths per frame.** Connection control points live in data space and
   never change: sample each path once, cache the points, map through `px()/py()` per
   frame. Never set `_connDotsStale` during a gesture — keep the circle pool, update
   `cx/cy` only. Skip `drawConnections` while `_zooming`; rebuild once on `end`. [main.js:3774]
3. **De-blur the dots.** Replace per-dot `feGaussianBlur` with a radial-gradient fill or
   pre-blurred sprite; on mobile cut `CLUSTER_DOTS` 5 → 2. [main.js:3936]
4. **Fake the triangle glow.** 2–3 stacked strokes of rising width / falling opacity look
   identical to the `feGaussianBlur` glow and cost nothing. [main.js:775]
5. **Collapse the icon request storm.** Switch both globs to
   `import.meta.glob('../content/icons/*.webp', { eager: true, query: '?url', import: 'default' })`
   — inlines 130 URLs, deletes 130 wrapper chunks (same for images at line 33). Preload
   only viewport-visible icons up front; fetch the rest on `requestIdleCallback`. Downscale
   the 30 icons that ship at 512px (max rendered ≈ 96 CSS px → 192px cap):
   `npm run audit:assets` lists them. [main.js:73–98]
6. **Fix resize wiping zoom.** Capture center + `currentK` before re-layout, re-apply the
   equivalent transform after; ignore height-only changes below a threshold (URL bar,
   keyboard). This is the single worst mobile bug: rotating the phone loses your place.
   [main.js:5222]
7. **Mobile glass diet.** Add an `is-mobile` class (coarse-pointer media query) and swap
   all 16 `backdrop-filter`s for slightly-more-opaque solid backgrounds on it. Keep glass
   on desktop. [style.css:77–534]
8. **Fonts.** Self-host Inter + Space Mono woff2 (the 2–3 weights actually used),
   `font-display: swap`, preload — removes a render-blocking third-party CSS chain.
   [index.html:20]
9. **Paint before the bundle.** Gate only `#chart` behind `.ready`, let static HTML paint
   immediately, add `.ready` in a `try/finally` (today a JS error = blank page forever).
   [main.js:5621, index.html:23]

## 4. Phase 2 — Make the full render cheap (the big one)

> **STATUS: DONE (2026-08-19). ALL harness budgets green** — pinch 50–60 fps,
> pan 57 fps, fly-to 58 fps, p95 frame 34.6 ms, under 4G + 4× CPU throttle.
> The safe subset sufficed: keyed data joins on persistent nodes (items 1, 6),
> single `paint-order` label nodes (item 5), grid batched into one path per
> tier (item 4), label click targets from the layout rects instead of getBBox
> (item 7). Layout math still runs every frame (it was never the bottleneck —
> DOM teardown was), so **visuals are frame-identical to before, and the
> mid-gesture group-transform idea (item 3) was never needed** — labels and
> every layer keep full per-frame rendering. Verified: mobile tap/tour/edge
> smokes, desktop hover/click/wheel + DOM-node retention, Big Bang scrubber.

> **Hard constraint (per project decision):** labels stay visible, correctly positioned,
> and non-scaling on **every** frame of zoom/pan/tour. Three past "optimizations" made the
> experience worse and are **banned** — the perf harness now fails the run if any returns:
>
> 1. **Stranded** — text/vectors stay fixed in place while images (tiles/icons) move.
>    This includes the dots-only `drawObjectsFast`, which stays out of the zoom path.
> 2. **Scaled** — text rasterized or put under the scaling transform so it grows with
>    the zoom, then snaps on re-render.
> 3. **Hidden** — the SVG/vector layer turned off during gestures while images move.
>
> The fix is making the *full* render cheap — which is exactly what real map apps do:
> cache layout, move geometry by transform, touch only what changed. Text and icons are
> never under a scaling transform, never skipped, never frozen.

1. **Retained scene, keyed data joins.** Convert `drawObjects` + label layers from
   remove-all/rebuild to `enter/update/exit` keyed by slug; per-frame work becomes
   attribute updates (x/y/size) on persistent nodes. Enter/exit runs only when the visible
   set changes. [main.js:1784]
2. **Cache the layout solution.** Cluster membership, label visibility, and collision
   offsets change smoothly — recompute only when `k` moves >5% or the view pans past a
   threshold; between recomputes, positions are cheap `px()/py()` projections. [main.js:1784]
3. **Transform the geometry-only layers.** Grid, density lines, boundaries, regions,
   energy bands, connection paths are pure affine functions of the transform: give each a
   single group transform per frame (the tile layers already do exactly this at
   main.js:4607–4614) with `vector-effect: non-scaling-stroke` so line weights stay
   constant, and re-anchor on gesture end. **Text, labels, and icons are explicitly
   excluded from this trick** — they live in screen-space layers whose x/y attributes are
   updated every frame on persistent nodes (cheap once step 1 lands), so they move with
   the map without ever scaling, stranding, or hiding (the banned modes above).
4. **Batch line soup.** Grid/axis emit hundreds of individual `<line>`s; merge into a few
   `<path d="…">` per style tier. [main.js:660]
5. **One-node labels.** `paint-order: stroke` renders the outline on a single `<text>`
   instead of painting every label twice. [main.js:2217]
6. **Event delegation.** One listener on the layer resolving `data-slug`, instead of
   per-object closures rebuilt each frame; skip hover wiring entirely on touch devices.
7. **Drop the getBBox batch.** `updateClickTargets` forces layout per label after every
   gesture; reuse the cached label metrics from the layout solution. [main.js:4380]
8. **Intro & tour ride for free.** They use the same zoom path, so once it's retained,
   the 3 s intro and tour steps get smooth automatically. On mobile also honor
   `prefers-reduced-motion` and shorten the intro. [main.js:5607]

Expected: fly-to 5.7 → 30–60 fps; pan 11 → 45+; and recording tours no longer needs the
"record slow, speed up in post" workaround.

## 5. Phase 3 — Touch & layout parity (parallel with Phase 2)

### Field-test feedback (real iPhone, 2026-08-19) — ALL DONE same day

- ✅ **F1. Tour panel flashed mid-screen at tour start** — root cause: the
  `.tour-hidden` state and `tourFadeIn` animation overwrite `transform`,
  stripping the `translateX(-50%)` centering. Fixed by centering with
  left/right insets instead of transform (bottom sheet).
- ✅ **F2. Declutter during tour** — `body.touring` class hides preset bar,
  `>>`, readout, and bottom axis on mobile while the tour drives.
- ✅ **F3 + F7. Icons too big on phones** — mobile icon size = desktop ÷ 2
  across all zooms.
- ✅ **F4. Tour text height limit** — box capped at 34vh, text scrolls inside.
- ✅ **F5. Top density numbers bundled when zoomed out** — labels now enforce
  34px minimum spacing (they stepped every 9 decades of ρ with no screen check).
- ✅ **F6. Edge-to-edge map** — mobile margins are zero; the map is the screen.
  All chrome floats: pill stack top-left (`>>`, search, and a new axes toggle
  that temporarily restores unit margins), zoom cluster bottom-left, settings
  bottom-right, all 44px with safe-area insets. Preset bar, readout, and scale
  bar are desktop-only.
- ✅ **F8. Title lockup** — "THE TRIANGLE OF" never wraps; "EVERYTHING" is
  canvas-measured and scaled so both lines span exactly the same width.

### Spirograph (public/hiperspirograph.html) — reviewed 2026-08-19

Verdict: genuinely good on mobile (canvas 2D, 25KB gz, no deps, loops=1 embeds).
Fixed same day: ✅ rAF loops now park when the page is hidden/offscreen (the
sidebar iframe used to run its 16-pass bloom pipeline forever behind a closed
sidebar); ✅ `history.replaceState` debounced to 300ms, try/caught, and skipped
entirely in embed mode (was ~60/s — iOS Safari rate-limits at 100 per 30s).
Backlog: per-frame canvas allocation churn (~19 new 512² canvases/frame —
hoist and reuse); two-finger gesture for 4D/5D rotation (unreachable on touch);
skip tour fetch + controls build in embed mode; optional DPR sharpening.

0. **Compact mobile tour card (first).** `#tour-box.tour-intro` occupies the
   bottom half of a phone screen at boot and eats every gesture that lands on
   it. Collapse it to a slim dismissible bar on mobile. (Same work as F1/F4.)
1. **A real phone layout** (first `@media` queries in the app):
   - Sidebar becomes a **bottom sheet** with peek / half / full states instead of covering
     the map ([style.css:1031] area).
   - Preset bar: horizontal scroll-snap with edge-fade affordance; ≥44px tall buttons.
   - `#search-input` → `font-size: 16px` (kills the iOS focus-zoom trap; with
     `touch-action: none` users currently get *stuck* zoomed). [style.css:449]
   - `env(safe-area-inset-*)` padding for top controls, tour box, scrubber
     (viewport-fit=cover is already set, nothing consumes it). [style.css:1025, tour.css:430]
2. **44pt tap targets.** ~~Objects~~ *(done in Phase 1: touch taps hit-test
   `_lastProjected` with a ≥44px effective target)*. Remaining: scrubber thumb,
   tour dots, settings controls.
3. **Kill the 500 ms dead zone.** *(done on touch in Phase 1: taps no longer
   depend on the rebuilt overlay divs at all)*. Desktop mouse clicks still wait
   for the 500 ms rebuild — acceptable, hover covers the gap there.
4. **Gesture parity with maps:** double-tap zoom, two-finger tap to zoom out, momentum
   pan (sample velocity on gesture end, decay via a short transition). [main.js:4643]
5. **Touch equivalents for hover features** (tooltips, density-line highlight, axis
   readout): tap = select + tooltip, tap-away dismisses; fix the stuck-tooltip /
   permanently-inflated-icon bug from emulated `mouseenter` without `mouseleave`. [main.js:4341]

## 6. Phase 4 — Map-app polish

1. **Service worker + manifest.** Precache app shell, z0–z3 tiles (~60 KB), icons;
   stale-while-revalidate the rest. Repeat visits become instant and offline-capable —
   this is most of what makes native map apps *feel* native. (GitHub Pages caps HTTP
   cache at 10 min, so a SW is the only real caching lever there.)
2. **Priority hints.** `modulepreload` the entry, preload `tiles/meta.json` + z0 tile,
   `import()` KaTeX only when a formula first renders, lazy-glob descriptions
   (74 KB out of the entry chunk). [main.js:29]
3. **Deploy hygiene.** Stop shipping the 68 MB source PNGs in `public/imgs` on every
   deploy; slim the 1 MB og:image (messaging apps drop previews > ~300 KB).
4. **Regression gate.** GitHub Action: `npm run build && node scripts/mobile-perf.mjs --ci`
   on every PR. Budgets live in the script; tighten them as phases land.

---

## 7. Definition of done

`npm run perf:mobile` fully green on defaults (4G, 4× CPU): LCP ≤ 2.5 s, ≤ 60 requests,
long tasks ≤ 800 ms, every gesture ≥ 45 fps avg with p95 frame ≤ 40 ms, **and all three
label invariants passing** (no scale, no hide, no strand). Plus: rotation keeps your
place, everything tappable is ≥ 44 px, the map stays visible while reading about an
object, and a second visit loads instantly.

> **2026-08-19: the harness is fully green** (LCP 0.88 s, 25 requests, 272 ms
> long tasks, worst gesture 58.7 fps, p95 34.6 ms, invariants passing).
> Remaining for full "done": bottom-sheet sidebar (map visible while reading),
> service worker for instant repeat visits, and the CI gate.

## Appendix — audit trail

The full audit (48 findings, each independently verified against the code, with evidence,
mobile impact, fix, and effort) is in [mobile-audit-findings.json](./mobile-audit-findings.json);
baseline measurements are in `scripts/perf-reports/`. Severity mix: 7 critical, 14 high,
20 medium, 7 low across render-pipeline, assets-network, css-gpu, touch-ux, and startup-path.
