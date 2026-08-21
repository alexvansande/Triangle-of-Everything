# Round 2 — polish, accessibility, code health

Follow-up to the mobile overhaul (docs/mobile-plan.md, all four phases shipped).
Based on a 4-lens audit — UX polish (against 14 fresh screenshots), code health,
accessibility, desktop parity — with every finding adversarially verified:
**29 findings, 28 confirmed, 0 refuted** ([full audit](./round2-audit-findings.json)).

Lens verdicts in one line each: the mobile bones are excellent but polish debt
shows at the seams; main.js works but is a 6,080-line monolith with mapped-out
module seams; accessibility has never had a pass and is the largest untapped
audience win; desktop survived the overhaul with a handful of small nicks.

---

## Wave 1 — Bugs & visible embarrassments (a day; all verified against pixels)

> **STATUS: SHIPPED 2026-08-20.** All 12 fixed, verified against fresh
> screenshots; all suites + budgets green.

1. **"macro" label leak** — `CAT_DISPLAY.macro = ""` falls through
   `|| catKey` and prints the raw key dead-center of the home view. Treat `""`
   as "suppress label". *(high, 1-liner)*
2. **Search is a silent dead end** — "black" matches nothing (name-only filter;
   black holes are named Sgr A*/M87*/Ton 618) and zero matches produce zero
   feedback. Add a "No matches" row, index subcategory/category names as
   searchable entries that fly to the region, 44px rows on mobile. *(high)*
3. **Fallback dot glows through screen-blend icons** — mix-blend `screen`
   brightens what's beneath instead of covering it; hemoglobin/insulin wear a
   permanent mint disc. Hide the dot on image load. *(medium)*
4. **Boot chaos** — the intro card fades in at t=1s, exactly when the 3s
   zoom-out starts; labels fly through the title. Start the intro when the
   zoom settles. *(medium, small)*
5. **Labels render under icons** — layer order puts lIcons above lLabels,
   washing out text (and contradicting the code's own comment). Move the
   label layer above icons. *(medium, small)*
6. **Label placement ignores icon bounds** — "lanets", "gr A*", "Soccer Bal".
   Seed the collision solver with icon rects so labels flip to a free side.
   *(medium)*
7. **Mobile settings popover** — floats ~90px above its gear (desktop anchor
   never overridden) with off-brand red checkboxes. Anchor to the mobile gear;
   purple accent. *(medium, small)*
8. **Tour text clips mid-sentence with no scroll cue** — add a bottom fade
   mask that lifts at scroll end. *(medium, small)*
9. **Stale hover line during wheel zoom** — a hovered connection stays glowing
   at pre-zoom coordinates through the gesture; hide revealed line groups on
   zoom start. *(medium, small)*
10. **Title lockup breaks crossing 768px after boot** — the width fitter runs
    once at boot only when starting mobile; re-run on mode change. *(small)*
11. **One touch strips desktop glass** — `body.touch-mode *` kills
    backdrop-filter everywhere; on a hybrid desktop a single touchscreen tap
    de-glasses the whole UI until the mouse moves. Scope the glass diet to
    `is-mobile` / coarse-primary only. *(small)*
12. Small placement nicks: keyhint vs DENSITY subtitle collision, scrubber
    tick alignment, scale-bar/zoom-reset overlap (pre-existing), coarse-gated
    height-resize guard applying to desktop-layout tablets. *(all small)*

## Wave 2 — Accessibility (the big new front; ~2 days)

> **STATUS: SHIPPED 2026-08-21.** All 8 done; new 11-check a11y smoke suite
> green (keyboard search → select → announce, focus rings, reduced motion).

The app is currently invisible to assistive tech and inoperable by keyboard.
Verified specifics, in priority order:

1. **Focus visibility**: global `:focus-visible` treatment (accent ring on
   pills, buttons, links); stop removing outlines.
2. **Real names & states for icon buttons**: aria-labels for search/axes/
   chevron/zoom/scrubber pills; `aria-expanded` on search, sheet, settings;
   `aria-pressed` on toggles.
3. **Keyboard-operable search**: results become a listbox (arrow keys + Enter,
   `role=option`, active-descendant); today they're mouse-only divs.
4. **Chart semantics**: `<title>/<desc>` + `role=img` label on the SVG;
   click-target divs become labeled buttons; selection announced via a
   polite live region ("Sun — star. Diameter 6.9×10⁵ km…").
5. **Settings checkboxes** are `display:none` — swap to visually-hidden so
   they're focusable and SR-visible.
6. **prefers-reduced-motion**: skip the intro zoom, make fly-tos instant,
   park connection dots, disable momentum.
7. **Contrast floor**: bump functional text below 3:1 (axis numbers at 0.3
   alpha, keyhint, scrubber ticks) to ≥ 4.5:1 equivalents.
8. **Non-gesture alternatives**: sheet full/peek reachable by keyboard (the
   grabber becomes a real button); pause the ruler's 8s auto-hide while it
   has focus or recent interaction.

## Wave 3 — Code health (structural; can trail the others)

> **STATUS: SHIPPED 2026-08-21 (first slice).** Done: `drawObjectsFast`
> deleted (the label-invariant CI gate is the guard now); stale INTERIM
> comment rewritten; `window.__` forward-refs replaced with module bindings
> (the `__debugBigBang` console hook stays); `flyTo()` replaces ten inlined
> copies of the centering math; `selectObject()`/`setIconHover()` replace the
> remaining copies; dead CSS rules dropped; wiki-download script variants
> archived; perf-reports untracked except the baseline (CI uploads its own);
> stray PDFs gitignored. Extracted modules: **src/format.js** (pure
> formatters + unit tables, zero app state) and **src/assets.js** (content
> manifests + icon warmup, now anchored to app-ready so it can never race
> the startup measurement window). main.js: ~6,100 → 5,832 lines.
> Deferred to a future slice: connections/axes/sidebar/bigbang/interactions
> extractions (need a shared chart-context interface — the seams and an
> injection sketch are mapped in round2-audit-findings.json), and the
> MOBILE_TUNING table consolidation.


1. **Split main.js** along the audit's verified seams, in dependency order:
   `format.js` (pure formatters) → `assets.js` (manifest globs) →
   `chart-ctx.js` (one shared mutable context: scales, dims, layers, flags) →
   `connections.js` → `axes.js` → `sidebar.js` → `bigbang.js` →
   `interactions.js` (click-targets/touch/gesture surface) → what remains in
   main.js is boot + zoom + objects. Each step is a cut-paste + imports,
   gated by the full smoke suite.
2. **Dedupe interaction sequences**: one `flyTo(logR, logM, k, ms)` replacing
   7 inlined copies; use `selectObject()` at the 3 remaining inline sites;
   one icon-hover-resize helper for the 4 copies.
3. **Delete `drawObjectsFast`** (dead, double-guarded, contradicts the
   retained renderer) and rewrite the stale "INTERIM until Phase 2" comment
   on the gesture surface (Phase 2 shipped; the surface is still required).
4. **Kill `window.__` forward-reference globals** (same-module indirection).
5. **Hygiene**: archive the three superseded wiki-download script variants;
   keep only the baseline + latest perf reports in git (ignore the rest);
   drop unused CSS rules (`.axis-unit-label`, `.setting-divider`); collapse
   the 34 scattered mobile-tuning ternaries into one `MOBILE_TUNING` table.

## Ground rules carried over

Label invariants (no strand / no scale / no hide) stay enforced by the
harness on every change; every wave ends with the full smoke suite + perf
budgets green; work happens on a branch with checkpoint commits for a
squash-merge PR.
