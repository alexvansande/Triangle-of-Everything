# Zoom runtime audit — 2026-11-02

The regression combined newer `full-journey.js` with the older `plates.js` API
and an Earth module lacking `render3`. The loader ignored the supplied canopy
folder and fell back to procedural micro/macro layers that still existed under
the images. These were Canvas drawings rather than external SVG image files.
Several current runtime modules and image assets were also untracked, so the
working preview was not fully represented by its branch commits.

## Current path

- `tools/powers-of-ten.html` loads `full-journey.js`.
- `main.js` is a two-line compatibility import of that same scene.
- `earth-scene.js` retains the textured globe and photo handoff without building
  the old procedural forest, crown, foliage, droplets, cell or chromatin.
- `image.js` contains the shared loader independently of procedural scenes.
- The photographic canopy, nuclear foregrounds, molecular renderer, Lenia
  simulation bakes, galaxy data and CMB shell remain the current implementation.

## Removed

- Legacy procedural `micro.js` and `macro.js` and the duplicate old scene loop.
- The hidden spectrum iframe, which could initiate a second scene's asset loads.
- The old image-layer hide-list protocol, unnecessary without the fallback layers.
- Superseded `lenia-animation-v1` and `lenia-opening-v1` generated sequences and
  their two unused prototype bakers. Their prior versions remain in Git history.

Generation sources, original photographs, references, and other applications'
shared spectrum assets were preserved. Unused-looking files outside this zoom
were not removed on the basis of this audit.

`runtime-files.json` records the current module graph plus observed browser
requests and every optical plate manifest entry. The current animation series
contain additional frames beyond those sampled in this inventory; their complete
versioned directories remain tracked. Current dynamic Hopf modules are included.

## Validation

Run `node scripts/check-zoom-runtime.mjs` to validate the module graph, runtime
file inventory, canonical entry point, and absence of legacy imports/iframe.
Browser checks covered canopy (.64), nucleus (-6.05), Earth (7.53), opening Lenia
(-17.8), and the CMB opening (27.32), with no page errors or missing requests.
No legacy micro/macro module was requested during this sweep.
