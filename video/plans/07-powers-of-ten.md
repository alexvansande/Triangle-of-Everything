# Video 7: powers of ten (plan)

From the author's brief (2026-10-29): a powers-of-ten zoom from the microwave background
down to a quark and on to the Planck length, closing on fields and the Game of Life.
Built from the small end up (quark first, zooming out), played top down in the script.
Nothing is built yet; this is the inventory, the gaps and the order of work.

## Facts to get right before writing a line

- **The famous film is from 1977, not the 90s**: Charles and Ray Eames's *Powers of
  Ten* (IBM; a first version, *A Rough Sketch…*, in 1968), a picnic in Chicago, 10× every
  10 seconds out to 10²⁴ m, then in to 10⁻¹⁶ m inside a carbon nucleus. Its ancestors:
  Kees Boeke's book *Cosmic View* (1957) and the NFB's *Cosmic Zoom* (1968). **The 90s
  one is *Cosmic Voyage*** (IMAX, 1996, narrated by Morgan Freeman), a remake of the
  idea. Probably both are worth naming. We can talk about them, not show their footage
  or stills, and the video's title shouldn't read as theirs.
- **Quarks have no measured size.** The chart puts each quark at its Compton wavelength
  (Up at ~10⁻¹³ m, *bigger* than the proton); in a zoom, quarks are unresolved points
  inside the proton, smaller than ~10⁻¹⁹ m (the colliders' limit). The script must never
  give a quark a size, and the hand-off from "the chart's quark" to "the zoom's quark"
  needs a sentence if both appear.
- **Below 10⁻¹⁹ m nothing has been measured**: sixteen decades of "the desert" down to the
  Planck length (1.6 × 10⁻³⁵ m). There's no evidence space is pixelated there; it's where
  our theories stop working. The Game of Life is a fair *metaphor* for fields (a value at
  every point, changed only by its neighbours; lattice QCD really computes protons on a
  grid), not a claim that nature is a cellular automaton.
- **The chart's "Observable Universe" sits at 1.4 × 10²⁶ m (about 14 billion light-years,
  the Hubble radius); the CMB shell today is 46 billion light-years away** (comoving).
  The zoom ends on the CMB sphere, so the counter at the end reads ~10²⁷ m across, and
  if the chart appears in the same video the two numbers need one line of explanation.
- **The Oort cloud has never been seen**, only inferred from long-period comets; its
  points are a model, and the video should say so lightly ("we think").
- **Laniakea is defined by how galaxies flow**, not by a visible edge; ~520 million
  light-years across, the Milky Way near its outskirts.
- **A hydrogen atom is almost all empty**: the proton is ~1/60,000 of its width. Our atom
  renders (`scripts/atoms/`) draw the nucleus hugely oversized on purpose; the zoom needs
  a to-scale atom, or the five empty decades between proton and atom are lost.

## The engine: one zoom, many layers

Not a baked video and not the chart: a page (`tools/powers-of-ten.html`, sharing the Hopf
renderer from `public/hopf/hopf-core.js`) where the whole picture is a function of one
number, **s = log₁₀(frame width in metres)**. The narration scene drives s(t) the way
other scenes drive the chart's camera, so the zoom can play in either direction, at any
pace, and be re-timed to a new take without re-rendering anything by hand.

- **Layers** are placed at their real width and at an offset inside their parent (the
  proton sits where the hydrogen is in the base pair, the base pair where it is in the
  helix…). Each fades in as it grows past a small share of the screen and out once it
  overflows it, so two neighbours always cross-fade, and the centre stays on the path.
  A layer is an image, a WebGL draw (Hopf proton, orbital, point clouds, CMB) or vector
  lines (orbits).
- **The powers-of-ten grid**: a square grid at 10^k m with its label, fading as 10^(k+1)
  arrives (like the chart's rulers with in-between ticks), and a counter: "10⁻¹⁵ m" plus
  a plain one where there is one ("1 km", "1 light-year", "a million light-years").
- **Frames for the video** go through the same Playwright path as the chart
  (`scripts/narration-frames.mjs`), so captions, music and the vertical/horizontal stages
  come for free.
- **First milestone** (to judge the look before anything else): proton → to-scale
  hydrogen atom, with the grid and counter, scrubbed by hand.

## The ladder

Frame width in metres. "Have" = already in the repo; "adapt" = existing code with new
work; "new code" = generator to write; "generate" = AI image chain (see below);
"real" = public-domain or open imagery.

| Width | What's in frame (centre → path) | Source | Status |
| --- | --- | --- | --- |
| 10⁻³⁵ | the Planck length: fields as a grid, Game-of-Life-like | new code (shader) | new |
| 10⁻³⁴…10⁻¹⁹ | the desert: nothing measured; grid only, fast | engine | free |
| 10⁻¹⁸…10⁻¹⁶ | one quark, an unresolved point in the gluon sea | Hopf proton at res → 1 | adapt |
| 10⁻¹⁵ | the proton: fuzzy ball → three quarks in a flux Y, gluon sea | Hopf `proton` (res sweep) | have |
| 10⁻¹⁴…10⁻¹¹ | inside the atom: the 1s cloud's faint edge, a dot at the centre | new code (density e^(−2r/a₀)) | new |
| 10⁻¹⁰ | the hydrogen atom, to scale | new code (same) | new |
| 10⁻⁹ | that hydrogen in the A–T base pair's hydrogen bond (the bond that holds DNA's two strands) | `scripts/molecules/` lib: adenine + thymine paired | adapt |
| 10⁻⁸ | the double helix, a few turns (2 nm wide) | `dna.webp` or a procedural helix | have/adapt |
| 10⁻⁷ | DNA wound on histones (nucleosomes, 11 nm), chromatin | generate | new |
| 10⁻⁶ | chromatin loops, a chromosome territory | generate | new |
| 10⁻⁵ | the cell nucleus (~10 µm) | generate | new |
| 10⁻⁴ | inside the amoeba: nucleus, vacuoles | `amoeba.webp` + generate | adapt |
| 10⁻³ | the amoeba (~0.5 mm) in a drop of dew | `amoeba.webp` + generate | adapt |
| 10⁻² | the dew drop beside a ladybug | `ladybug.webp` + generate | adapt |
| 10⁻¹ | a sequoia sprig (scale-like leaves, not a broad leaf) | generate | new |
| 10⁰…10¹ | a branch, the crown | generate | new |
| 10² | the sequoia (~85 m) | `sequoia.webp`, sequoia photo | have |
| 10³…10⁴ | the Giant Forest grove, the valley | real (Landsat / NAIP aerials) + generate at the seams | new |
| 10⁵…10⁶ | the Sierra Nevada, California | real (Landsat, Blue Marble) | new |
| 10⁷ | the Earth | real (Blue Marble) / `earth.webp` | have |
| 10⁸…10⁹ | the Moon's orbit | vector orbit + `moon.webp` | new code |
| 10¹⁰…10¹² | the Sun, Earth's orbit, the inner planets | vector orbits + icons | new code |
| 10¹³…10¹⁴ | outer planets, the Kuiper belt, the heliosphere's edge | vector + points | new code |
| 10¹⁵…10¹⁶ | the Oort cloud (inner disc, outer sphere) | new code (point cloud) | new |
| 10¹⁷ | the nearest stars (Proxima, 4.2 ly) | `tools/sky-points` (Hipparcos < 30 ly) | adapt |
| 10¹⁸…10²⁰ | the solar neighbourhood, the local arm | `tools/sky-points` (Gaia DR3) | adapt |
| 10²¹ | the Milky Way | see open questions (no real face-on picture exists) | new |
| 10²²…10²³ | the Local Group (Andromeda, Triangulum, ~100 dwarfs) | new code (a catalogue of real positions) | new |
| 10²⁴ | the local volume, Virgo | `tools/sky-points` (2MRS) | adapt |
| 10²⁵ | Laniakea (~5 × 10²⁴ m) | new generator (Cosmicflows-4 galaxies + flow lines) | new |
| 10²⁶ | the cosmic web | 2MRS / Quaia from `tools/sky-points` | adapt |
| 10²⁷ | the CMB sphere around us | `public/spectrum/` (microwave, its CMB shell) | adapt |

About 62 decades. At the Eames pace (10 s each) that's over 10 minutes, so the pace has
to change: slow at the stops the script talks about, fast through the desert, the empty
atom, and the gaps between the Sun and the stars.

## What we're missing (the work list)

1. **The zoom engine** (layers, cross-fades, grid, counter, scene-driven s(t)). Everything
   below plugs into it.
2. **To-scale hydrogen**: a 1s cloud shader around the Hopf proton.
3. **The base pair**: adenine + thymine joined by their hydrogen bonds, from the existing
   molecule drawing lib, so one H can be the zoom's centre.
4. **The cell chain** (nucleosome → chromatin → nucleus → amoeba → dew drop): AI chain.
5. **The plant chain** (ladybug → sprig → branch → sequoia): AI chain, the sequoia
   picture and photo as anchors.
6. **Earth from orbit down to the grove**: real imagery for 10³–10⁷ m, AI only to hide
   seams.
7. **Solar system**: orbits from real elements, the planets' chart icons.
8. **Oort cloud**: point generator (a thick inner disc, an outer sphere, density falling
   with distance), no AI.
9. **Stars and the galaxy**: adapt `tools/sky-points` into a layer (it is 3D; seen from
   above the plane, with a little parallax).
10. **Local Group**: a small catalogue generator (McConnachie 2012 positions).
11. **Laniakea**: a new generator from Cosmicflows-4 (the onion's version isn't good
    enough, per the author).
12. **CMB sphere**: adapt `public/spectrum/`'s microwave shell into the last layer.
13. **The Planck end**: the fields grid, a Life-like automaton easing into a field.

Already usable as is: Hopf proton, `dna.webp`, `amoeba.webp`, `ladybug.webp`,
`sequoia.webp`, `earth.webp`, `moon.webp`, `sun.webp`, the sky-points and spectrum data.
Chart icons top out at 1024 px, enough for a layer while it's small on screen, not for a
full 4K frame: anything held full screen needs a bigger source.

## AI image chains

For the cell and plant chains (and seams in the satellite stretch):

1. Start from the anchor (e.g. the ladybug icon at 10⁻² m).
2. Ask for the next frame out at 4× (the author's idea; a 10× step loses too much of
   the old frame): the previous image pasted at the centre at 1/4 size, the model
   asked to paint around it and keep the centre untouched.
3. Fit the centre to the previous frame (scale, offset, rotation), as dives are fitted,
   and feather the join so the engine's cross-fade hides it.
4. Keep every prompt and source in `content/icons/src/`-style provenance JSON.

Going inwards (sprig → ladybug) works the same in reverse: the zoom only needs each pair
to agree where they overlap.

## How this sits with the visual rules

`visual-rules.md` is written for chart videos; this one mostly leaves the chart. What
still applies: never open on a still frame (open with the slow pull), the camera never
stands still, real photographs where we claim them, captions and audio the same.
What's different: AI frames are part of the picture here, so credit them as generated in
the description. A bookend on the chart (the zoom's sizes are the chart's bottom axis,
from the Planck end to the universe) would tie it to the series.

## Script outline (to record)

1. **Hook**: "In 1977, two designers made a nine-minute film…" Eames, *Powers of Ten*;
   *Cosmic Voyage* in 1996. "Let's do it again, with what we know now."
2. **The universe, from outside**: the CMB sphere, 46 billion light-years away: the
   oldest light, and why we're at its centre (everyone is).
3. **Down through structure**: the cosmic web, Laniakea and how it's drawn from flows,
   the Local Group, the Milky Way, the stars getting sparse, the Oort cloud (we think),
   the planets' orbits, the Moon's, the Earth.
4. **Down to life**: California, the sequoia, a sprig, a ladybug, a drop of dew, an
   amoeba, its nucleus, DNA.
5. **Down to matter**: the hydrogen bond holding the two strands, one hydrogen atom,
   almost entirely empty, the proton, its quarks, which have no size we can measure.
6. **The end of the map**: sixteen decades of nothing measured, then the Planck length;
   what's really there is fields, a value everywhere changing with its neighbours, like
   the Game of Life.
7. **Close**: back to the triangle: every stop was a point on its bottom axis.

## Open questions for the author

- **Format**: a long horizontal video (16:9, Eames-like, ~6–8 min) or a vertical short
  (~4 min, fewer stops)? Or both cut from one take?
- **The Milky Way frame**: there's no photograph of it from outside. A Gaia-based
  reconstruction, a procedural spiral, or a real look-alike galaxy (and say so)?
- **The hydrogen**: the A–T hydrogen bond (true to DNA and keeps the path continuous),
  or a water molecule in DNA's groove, as first suggested?
- **The bookend on the chart**: in, or keep this video off the chart entirely?
