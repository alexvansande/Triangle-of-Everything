# Stable object visibility

Panning translates the chart without changing object visibility decisions.
Curated dot and icon collisions are evaluated against the whole collection,
before viewport culling. This prevents an offscreen neighbour from changing
which member of a crowded group appears. Icons and labels slide through the
viewport edge; the edge itself is not a collision blocker.

The shared visibility epoch retains both positive and negative decisions
through pans and small zoom reversals. It resets after a 12% scale change
relative to its last decision pass, or immediately after a relevant layout,
display-setting or data change. There is no timeout that expires during a
pan. Both horizontal and vertical scale changes are considered.

Dust remembers dot thinning, labels, label side and icon promotion. Existing
visible entries reserve their space before newly encountered candidates;
existing hidden entries are not repeatedly retried against the screen grid.
Within an epoch, the label/icon caps prevent new promotions but do not evict
existing selections. Cached placements are reprojected every frame, so text
still moves with the chart and icons retain their actual current size.

Tests:

- `node --test scripts/visibility-memory.test.mjs`
- `node scripts/check-pan-visibility.mjs` with the dev app running. Override
  `CHART_URL` or `CHROME_PATH` if needed. This checks three chart regions,
  back-and-forth pans and small pixel movements. It checks both appearing
  and disappearing objects, icon-vs-dot state and label visibility away
  from viewport clipping. Results: `docs/visibility-review/pan-report.json`.
