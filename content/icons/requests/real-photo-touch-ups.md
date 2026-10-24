# Picture requests: touch-ups of four real-photo rocks (2026-10-24)

Phoebe, 253 Mathilde, Gaspra and Ida are live now, cut out of real NASA photos by
`scripts/compose-real-body.py` (their current masters are `content/icons/src/<slug>.png`). Each
needs some image-generation work to read as a whole object, keeping the real surface: redraw
the missing or ragged parts, don't invent a different rock. Start from the current master and
the original photo in `references/<slug>.jpg`; same house style and steps as `fill-the-gaps.md`
(lit from the upper left, transparent background, subject about 93–95% of the square), then
replace `src/<slug>.png` and `<slug>.webp` and note the edit in `<slug>-generation.json`.

| Object | Slug | What it needs | Reference photo |
|---|---|---|---|
| ~~Phoebe~~ | `phoebe` | Saturn's dark, cratered, almost round moon (213 km). The photo is lit from the side, so the night side was cut away and the outline is ragged on one edge: complete the round-ish body, continue the craters into a soft shadow on the lower right, clean the edge. | `references/phoebe.jpg` |
| ~~253 Mathilde~~ | `253-mathilde` | A very dark, lumpy rubble-pile asteroid with giant craters. The photo is small (soft when enlarged) and a huge shadowed crater makes the cut-out a hook shape: fill the shadowed bowl back in as a crater in shadow, sharpen the detail, keep it charcoal-dark. | `references/253-mathilde.jpg` |
| ~~Gaspra~~ | `gaspra` | An elongated grey asteroid (18 km long), the first one a spacecraft flew past. The bottom edge of the cut-out is ragged where the shadow met the black: complete the lower outline, keep its faint colour, sharpen. | `references/gaspra.jpg` |
| ~~Ida~~ | `ida` | A long, cratered grey asteroid (60 km). The photo is small, so the master is soft, and one end is ragged: complete the outline, sharpen the craters. Leave out its moon Dactyl. | `references/ida.jpg` |

Completed 2026-10-24: photo-constrained AI touch-ups, full opaque dark sides, NW lighting, resolution tiers and refreshed silhouette shadows. Unseen terrain is inferred.
