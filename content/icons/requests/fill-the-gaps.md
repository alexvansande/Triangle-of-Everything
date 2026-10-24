> All macro illustration requests in this file installed 2026-10-24 with matching wall shadows. Space requests remain pending. See `tools/macro-request-review.html` and `docs/macro-request-batch.json`.

> First macro batch installed 2026-10-23: Spirit of St. Louis, polar bear, sperm whale, humpback whale. See tools/macro-request-review.html. Remaining rows are still pending.

# Picture requests: filling the chart's gaps (2026-10-23)

Catalogue objects in parts of the chart with no pictures, picked by the author's
list of gaps. All are already catalogue dots; Peekskill, the two whales and 253 Mathilde
were added to `src/dust-famous.json` so their pictures show. A catalogue picture is found
by the slug of its famous label (or its name), so save each as
`content/icons/src/<slug>.png` (master) and `content/icons/<slug>.webp` (live), run
`npm run icons:resolutions`, add a `<slug>-generation.json` like the cube's, and strike it
off this list.

Common style for all (as the existing icons): a highly polished realistic illustrated
miniature, seen as if pinned on a wall slightly below eye level, soft lighting from the
upper left, restrained palette, no ground, no background, no text, no cast shadow. Square
1254×1254 PNG with a genuine transparent background; subject about 93–95% of the square,
at least 25 px clear margin. Crisp enough to read at 128 px.

Rock formations must read as complete floating volumes lifted from the ground: retain
the recognizable upper formation, and finish the lower edge with a modest irregular,
fractured rock underside. No flat photo-cutout ground edge or thin grass carpet. Keep
the near-front view slightly below eye level; do not tilt upward to expose the bottom.
Lighting is explicitly screen northwest (upper left), with darker right faces and
undersides, regardless of the original photograph's sun direction. The added lower
volume is illustrative; it does not change the catalogue's stated size/mass scope.

| Gap | Object | Slug | What to draw |
|---|---|---|---|
| ~~a 5 kg meteorite~~ | ~~**Peekskill** (12.4 kg, hit a parked Chevrolet Malibu in New York, 1992)~~ | ~~`peekskill`~~ | ~~A fist-sized ordinary-chondrite stone: dark brown-black fusion crust, one broken face showing grey speckled interior with tiny metal flecks. Reference style: `chelyabinsk`, `hoba`.~~ |
| ~~a 1–10 t airplane~~ | ~~**Spirit of St. Louis** (2.4 t loaded, Lindbergh, 1927)~~ | ~~`spirit-of-st-louis`~~ | ~~The silver Ryan NYP monoplane, high wing, no front windows (periscope), "NX-211" on the wing, three-quarter side view, nose to the left. Reference style: `flyer-i`, `concorde`.~~ |
| ~~a half-ton animal~~ | ~~**Polar bear** (about 400 kg; males up to 700)~~ | ~~`polar-bear`~~ | ~~A walking adult polar bear, side view, cream-white fur with soft blue shadows. Reference style: `lion`.~~ |
| ~~a 20 t animal~~ | ~~**Sperm whale** (about 15 t, big males 45 t)~~ | ~~`sperm-whale`~~ | ~~Side view, the huge blunt square head, wrinkled dark grey skin, small lower jaw, nose to the left. Reference style: `blue-whale`.~~ |
| ~~a 30 t animal~~ | ~~**Humpback whale** (30 t)~~ | ~~`humpback-whale`~~ | ~~Side view with the long white pectoral fins spread, knobbly head, dark back, white throat grooves. Reference style: `blue-whale`.~~ |
| ~~a 100 Gt object~~ | ~~**Lake Geneva** (89 km³, 89 Gt of water)~~ | ~~`lake-geneva`~~ | ~~The crescent-shaped lake seen from above as a deep blue water body with a thin shoreline, like the other lakes. Reference style: `lake-baikal`, `konigssee`.~~ |
| between Mars and Venus | **TRAPPIST-1 e** (0.7 Earth masses, in its star's habitable zone) | `trappist-1-e` | An artist's rocky planet with a thin atmosphere, lit deep red-orange by a dim red-dwarf sun from the upper left, possible dark oceans and pale clouds. Reference style: `kepler-22b`, `earth`. |

Between Ceres and Pluto: done with the real Iapetus (Cassini photo, shaded with the sphere template, 2026-10-24), not a generated picture. 100,000–1,000,000 Gt: 253 Mathilde, from NEAR's photo, the same way.
