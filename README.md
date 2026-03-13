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
- 130+ objects across all scales: particles, atoms, everyday objects, planets, stars, black holes, galaxies
- Adaptive grid system with three levels of detail (×1000, ×10, logarithmic subdivisions)
- Diagonal density/time lines connecting the chart to the history of the universe
- Click any object for detailed info (size, mass, density, description, Wikipedia link)
- Keyboard shortcuts, search, preset views, URL-based state

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
- **`src/descriptions/`** — one Markdown file per object with a short description
- **`src/texts/intro.md`** — introductory text shown in the sidebar

Adding a new object is as simple as adding a line to `objects.json` and optionally creating a `.md` file in `descriptions/`.

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
