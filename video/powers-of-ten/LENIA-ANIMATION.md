# Baked Lenia and terrain playback

## Current rendering path

Normal playback constructs `imageTerrain()` in `terrain-playback.js`, not the
WebGL terrain generator. It loads only neighboring images from
`generated/terrain-composite-v3/`: 433 padded 1536² WebP frames, 24 samples per
physical decade from -14.7 to -32.7. Every image is centered at the same world
origin with span `2 × 10^s` metres. Playback magnifies each image at that physical
span and interpolates neighboring samples; zoom reversal retraces the same data.
A maximum of four decoded images is retained (36 MiB), not the whole sequence.

The composite contains the procedural hills/channels/craters, changing Lenia
pigment and its height contribution, slope lighting/shadows, emboss, chromatic
aberration and bloom. No terrain WebGL context, rule simulation, normal/shadow
march or post filter runs during ordinary terrain playback.

`planck-terrain.js` separately preserves the existing frozen screenshot, exact
Planck cell spacing, pure RGB endpoint and inexpensive Conway animation. Pixel
cells use hard rectangle edges, not magnified interpolated terrain images.

## Rebuilding

Serve the repository on port 5188, then run:

```
node scripts/bake-terrain-composite.mjs
```

The dedicated `tools/terrain-bake.html?bakeTerrain=1&renderZoom=1` page invokes
`quantum-terrain.js` as an offline generator. Only this mode constructs its WebGL
terrain renderer. The bake resumes missing files and rejects blank captures using pixel statistics, while a completed manifest's
source hash prevents silently reusing frames after changing the generator.
Clear the composite output and rebuild when changing its shader or post effects.

## Simulation inputs

`scripts/bake-lenia-strata.py` computes six populations from saved matter and
carried rules in `/Users/avsa/Dev/Life/library`, never recorded footage. Each
settles for 250 unrecorded steps and saves 90 frames at 20 steps per frame. A
child's first 45 frames receive the parent's final 45 central height fields as
gentle forcing before each rule step. Warped noise modulates pigment intensity.
Fixed union crops preserve travel; placements and rotations are seeded.

`bake-lenia-hero.py` computes the opening multichannel glider using the original
15 coupled kernels from Bend's `lenia_multi_ref.c`. Fractional Fourier alignment
keeps it on the optical axis without rounded pixel jumps. Its static catalog
surroundings use irregular world-space stamps. The saved inputs and helper
players (`lenia-animation.js`, `lenia-opening.js`) now run only in the composite
baker, not during the rendered zoom.

The existing noise-to-Lenia and Lenia-to-relief couplings are preserved. The full
rendered terrain heightfield is not yet fed back into every Lenia rule step;
that stronger two-way interaction remains a separate simulation change.

## Measured check

Same isolated 640² terrain pass, with forced canvas readback:

- Live: 234.48 ms/frame; one terrain WebGL context.
- Baked: 5.74 ms/frame; zero terrain WebGL contexts.

This is approximately 41× faster for this pass, not an estimate of total video
speed. Other scenes, motion-blur sampling and video encoding still cost time.
