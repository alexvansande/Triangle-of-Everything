# Atom & molecule renders

Two-layer composites of atoms and small molecules built from hyperspirograph
captures. Each image is rendered the same way:

1. **Nucleus** — sphere-packed protons and neutrons drawn back-to-front using
   the painter's algorithm. Before drawing each front-er nucleon a soft black
   disc is painted at its position, knocking out whatever sat behind it. The
   front nucleon then sits on top as if opaque. No alpha tricks anywhere.
2. **Electron cloud** — a sparse, mostly-black orbital cage screen-blended on
   top of the nucleus. Its dark gaps let the nucleus show through; only the
   thin glowing orbital lines write to the result.

The per-nucleon screen diameter (`NUCLEON_PX = 165`) is constant across the
set, so an H proton in `h2o.png` reads at the same size as one of O's sixteen
nucleons in `oxygen.png`.

## Files

| File | Subject | Composition |
| --- | --- | --- |
| `hydrogen.png`     | ¹H atom     | 1 p + 0 n            |
| `helium.png`       | ⁴He atom    | 2 p + 2 n            |
| `carbon.png`       | ¹²C atom    | 6 p + 6 n            |
| `oxygen.png`       | ¹⁶O atom    | 8 p + 8 n            |
| `iron.png`         | ⁵⁶Fe atom   | 26 p + 30 n          |
| `gold.png`         | ¹⁹⁷Au atom  | 79 p + 118 n         |
| `uranium.png`      | ²³⁸U atom   | 92 p + 146 n         |
| `o2.png`           | O₂ molecule | two ¹⁶O nuclei + clouds |
| `h2o.png`          | H₂O molecule | 1 ¹⁶O + 2 ¹H at 104.5° bond angle |

Source assets (kept so re-renders don't need a fresh capture pass):

- `spheres/sphere{1..7}.png` — electron-cloud variants from the same preset,
  varied by inner-axis 3 + Spin XZ + Tilt YZ.
- `nucleons/proton{1..6}.png` — proton variants (Fire colour gradient),
  varied by Spin XZ + Tilt YZ.
- `nucleons/neutron{1..6}.png` — neutron variants (Steel back + Fire tip),
  same spin sweep.

## How they were made

### 1. Spirograph presets

Three hyperspirograph state hashes are loaded via `applyState()`:

- **Electron cloud** — `325a04133e41017d0c05dee8f71401010301061e05-181.56.0.0-020d074f64408c0f09`
  A sparse 5D orbital cage on a mostly-black background. Picked specifically
  because it screen-blends cleanly over a bright nucleus.
- **Proton** — `32592203010001545904fffff50e01030317010d05-179.51.0.0-100b04325b00860f89`
  Fire gradient (red → orange → yellow → white core).
- **Neutron** — `32592203010001545909fffff50e01030317010d05-171.52.0.0-100b06194100870f84`
  Steel back with a Fire highlight.

### 2. Capture (`capture.mjs`, `capture-nucleons.mjs`)

Each script launches headless Chromium via Playwright at `localhost:5173/hiperspirograph.html`,
applies the state hash, disables time animation, then sweeps Spin XZ / Tilt YZ
(and Axis 3 for electron variants), calling `draw()` and grabbing
`canvas.toDataURL('image/png')` for each variant. PNGs are written into
`spheres/` and `nucleons/`.

### 3. Composite (`composite.mjs`)

Per atom/molecule:

1. **Pack nucleons in 3D.** `packPositions(N)` does random rejection sampling
   inside a unit-ish sphere with a minimum centre-to-centre spacing — gives a
   compact "glued spheres" cluster.
2. **Sort back-to-front by z.** Standard painter's algorithm.
3. **Build the composite op list** as `[nucleon₀, knockout₁, nucleon₁, knockout₂, nucleon₂, …]`.
   - `knockoutDisc(d, blur)` returns a soft black disc — opaque in the centre,
     gaussian-blurred edges (`KNOCKOUT_FRAC = 0.62` of the nucleon size,
     `BLUR_FRAC = 0.10`). Composited with `blend: 'over'`, so wherever a front
     nucleon is about to land, the existing pixels are darkened to black.
   - The nucleon image is then composited with `blend: 'screen'` at full
     brightness — black halo around it stays inert, glow lands cleanly inside
     the knocked-out disc.
   - A mild perspective scale (0.85× back → 1.07× front) keeps the cluster
     reading as 3D. No opacity falloff.
4. **Electron cloud last.** Screen-blended on top. Its dark gaps mean the
   nucleus underneath shows through unchanged.

For molecules (O₂, H₂O) each atom's nucleus is built as its own op list, then
all the ops + cloud overlays are flushed into one `sharp().composite([...])`
call onto a black canvas.

### Re-rendering

```bash
# from this directory (scripts/atoms/)
node capture.mjs            # writes spheres/sphere*.png  (needs vite dev server up + playwright)
node capture-nucleons.mjs   # writes nucleons/{proton,neutron}*.png
node composite.mjs          # writes hydrogen.png … uranium.png … h2o.png
node install.mjs            # converts PNGs → content/images/*.webp + stages content/icons/src/
npm run process-icons       # (run from repo root) → content/icons/*.webp
```

The capture step needs Playwright. It's not in the project's `package.json`
(headless Chromium is heavy); install it locally with `npm i -D playwright`
or set `PLAYWRIGHT_PATH=/path/to/global/playwright` and re-run. The capture
scripts only need to be re-run if you're changing the source spirograph
states or spin sweeps — the captured PNGs in `spheres/` and `nucleons/` are
checked in.

## Atoms on the chart still missing

Only Oganesson (²⁹⁴Og: 118 p + 176 n) is unrendered — outside the "up to
Uranium" scope. Adding it is one more section in `composite.mjs` with a
bigger canvas; the adaptive `packPositions` already auto-sizes the cluster.

## Complex molecules — AI image generation

Glucose, ATP, the DNA bases (Adenine, Guanine, Cytosine, Thymine), DNA,
Fullerene C₆₀, and other chart entries with real molecular geometry are bad
candidates for the sphere-pack-the-nucleus technique — they need bond
positions, ring topology, and a sense of the whole arrangement, not a single
glowing ball.

For those, the plan is to feed the hand-made atoms (`hydrogen.png` …
`uranium.png`, `h2o.png`) to an image generator as **style reference** and
ask it to produce molecule images in the same visual language.

### Prompt template (ChatGPT / DALL·E / image-gen of choice)

> Reference style: attached PNGs of hydrogen, helium, oxygen, iron, gold,
> uranium and water (H₂O). The style is a dense cluster of glowing
> spirograph "balls" (the nucleus — yellow/white/red protons mixed with
> silver neutrons, depth-stacked like glued spheres) surrounded by a thin
> sparse cyan/blue orbital cage on pure black background.
>
> Generate `<MOLECULE>` in the same style:
> - Each atom = a sphere-packed nucleus (correct nucleon count: C=12,
>   H=1, O=16, N=14, P=31 nucleons each) wrapped in a thin sparse orbital
>   cage. The nucleus reads as opaque stacked balls (painter's algorithm
>   with soft black knockouts between adjacent nucleons), not a blurred
>   blob.
> - Atom positions match the real molecular geometry (bond angles + bond
>   lengths). For rings/DNA-like helices, draw the actual planar/helical
>   layout — don't collapse into a single sphere.
> - Per-nucleon size is constant across all atoms in the image (an H proton
>   is the same size as one of carbon's 12 nucleons).
> - Black background, no labels, no axes, square aspect, ~1024×1024.

Per-molecule additions:

- **Glucose (C₆H₁₂O₆)** — chair-conformation hexagon with the
  five-C-plus-O ring lying mostly flat; H atoms branching outward from
  each C and from each OH.
- **Adenine / Guanine / Cytosine / Thymine** — show the planar ring(s);
  call out NH₂ branches and the carbonyl O atoms where applicable.
- **DNA** — double helix viewed from a 3/4 angle; rungs are base pairs,
  backbone is sugar–phosphate. Render at scale where atoms read as small
  glowing nuclei along the strand.
- **Fullerene C₆₀** — soccer-ball polyhedron; one carbon nucleus at each
  of the 60 vertices.

### Workflow

1. In ChatGPT (or whatever image-gen tool), upload 4–6 of the hand-made
   reference PNGs.
2. Paste the prompt above, with `<MOLECULE>` filled in.
3. Iterate on the result until atom counts and geometry are right.
4. Save as `content/icons/src/<slug>.png` (slug from `nameToSlug` in
   `src/main.js`).
5. Run `npm run process-icons` (chart marker) and `node molecules/install.mjs`
   after adding the slug to `MAPPING` (sidebar image).
6. Add the slug to `STRINGS_ATOM_SLUGS` in `src/main.js` so it gets the
   "Explore multidimensional strings" link.

A first batch of candidates from `src/objects.json` to attempt this way:
Adenine, Guanine, Cytosine, Thymine, Glucose, ATP, Fullerene C₆₀, DNA.
