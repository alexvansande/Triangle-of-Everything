# The Triangle of Everything

An interactive, zoomable visualization that plots every known object in the universe on a single log-log chart of **mass vs. width** — from neutrinos to the observable universe.

Inspired by the [Lineweaver-Patel diagram](https://doi.org/10.1119/5.0150209) and the "Triangle of Everything" poster.

## What is this?

Featuring mass on the vertical axis and width on the horizontal axis, it is, in effect, a density scatter plot. But it's much more than that:

- **Density ↔ Time**: due to the expansion of the universe, density correlates with time
- **Mass ↔ Energy**: due to relativity, mass is equivalent to energy
- **Energy ↔ Wavelength**: due to quantum effects, energy is related to wavelength

All objects are bounded by an isosceles right triangle:
- **Schwarzschild radius** (too massive → black hole)
- **Compton wavelength** (too small → particle-antiparticle pair)
- **Hubble radius** (too big → beyond the observable universe)

## Features

- Google Maps-like zoom and pan with smooth transitions
- 180+ objects across all scales: particles, atoms, everyday objects, planets, stars, black holes, galaxies
- Adaptive grid system with three levels of detail (×1000, ×10, logarithmic subdivisions)
- Diagonal density/time lines connecting the chart to the history of the universe
- Cosmic **time scrubber** — drag from the Planck epoch (10⁻⁴³ s) to heat death (10¹⁰⁰ yr) and watch objects condense into and fade out of existence as the universe cools; press play to run the whole history
- Click any object for detailed info (size, mass, density, description, Wikipedia link)
- Keyboard shortcuts, search, preset views, URL-based state
- Hidden classic mode (`L` key or `#classic`): a zoomable redrawing of the original Lineweaver–Patel figure, with every object added as a dot; click its small rectangle to zoom into their stellar-collapse panel (`src/classic.js`)

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Build for production

```bash
npm run build
npm run preview
```

## Data

- **`src/objects.json`** — coordinates and metadata for all plotted objects
- **`src/dust.json`** — generated background “dust” (see below)
- **`content/descriptions/`** — one Markdown file per object with a short description
- **`content/intro.md`** — introductory text shown in the sidebar

Adding a new object is as simple as adding a line to `objects.json` and optionally creating a `.md` file in `content/descriptions/`.

### Catalogue dust

Behind the ~180 hand-placed objects sit ~50,000 faint dots: real, named
objects from 40 published sources — hadrons, nuclei with measured charge
radii, elements, molecules (PubChem), proteins (SASBDB), bacteria and algae
cells, insects, amphibians, mammals, meteorites, vehicles, ships, aircraft,
spacecraft and structures (Wikidata), lakes, glaciers and ice sheets,
asteroids and boulders, moons, exoplanets, brown dwarfs, stars (DEBCat,
Gaia DR3, exoplanet hosts), white dwarfs, black holes, molecular clouds,
star clusters, galaxies and galaxy clusters. Where a mass or size is derived
rather than measured (e.g. mass from a measured volume × a measured density),
the hover label says so. Extra sources live one file each in
`scripts/dust/src-*.mjs`. They
have only a name, shown on hover — no description, no link, no click — and
only appear where there is room, giving way first to everything else. They
are there to show trends: how stars scatter off the main sequence, the
exoplanet mass–radius curve, nuclear density, Larson's law for clouds.
Toggle them in settings ("Show catalogue dust").

```bash
npm run build:dust               # rebuild src/dust.json from cached downloads
npm run build:dust -- --refresh  # re-download every catalogue
```

Every source is listed with its citation and the radius it plots in
`scripts/dust/sources.mjs`. The build fails unless each source reproduces
known anchor values (e.g. the Fe-56 charge radius, Ceres' GM, GW150914's
remnant mass), agrees within 0.3 dex with any hand-placed object of the same
name (the Moon, Titan, Vesta, TRAPPIST-1… agree to ≤ 0.02 dex), stays inside
the triangle and a plausible density envelope, and rejects no more than 2%
of its rows. Everything dropped is listed in `docs/dust-report.md`.

### Validating the data

```bash
npm run validate
```

Checks that every object sits inside the physical triangle (nothing is plotted
below its own Schwarzschild radius or Compton wavelength, or beyond the Hubble
radius) and flags any object whose density is wildly out of line with others of
the same size. Use `npm run validate -- --strict` for a noisier review pass.

## Tech stack

- [D3.js](https://d3js.org/) for scales, zoom, and SVG rendering
- [Vite](https://vitejs.dev/) for development and bundling
- Vanilla JavaScript, HTML, CSS — no framework

## References

- "All objects and some questions" by Charles H. Lineweaver and Vihan M. Patel (*Am. J. Phys.* 91, 819–825, 2023)
- "Macro Dark Matter" by David M. Jacobs, Glenn D. Starkman, Bryan W. Lynn ([arXiv:1410.2236](https://arxiv.org/abs/1410.2236))
- "Dark Exoplanets" by Yang Bai, Sida Lu, Nicholas Orlofsky (*Phys. Rev. D* 108, 103026, 2023)

## License

Creative Commons CC-BY 3.0 — see [LICENSE](./LICENSE)

Visual Design by Alex Van de Sande
