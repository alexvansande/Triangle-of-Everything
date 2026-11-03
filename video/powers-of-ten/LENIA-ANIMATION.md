### Rule-generated cellular animation (2026-11-02)

`scripts/bake-lenia-strata.py` recalculates six populations from saved matter and
carried rule parameters in `/Users/avsa/Dev/Life/library`; it never reads videos.
Each population settles for 250 unrecorded steps before recording 90 pigment/
height states, advancing 20 simulation steps per saved frame (previously 10).
The 90 playback frames span 1,800 steps, six times the previous 30 × 10 sequence.
A single union crop covers all frames so translating creatures are not followed
and inadvertently stabilized by the image extraction. The child's first 45 samples receive the parent's final 45 central
height fields as gentle multiplicative forcing before each rule step (0.003).
A small warped spatial noise field modulates pigment intensity before evolution.
Placements and rotations are seeded and irregular. Raw channel/height NPZ files
are build intermediates; playback loads only the small WebP pigment stamps.

`lenia-animation.js` selects neighboring frames from physical zoom depth, with a
45-frame overlap between strata. It retains at most 24 decoded 256² bitmaps
(6 MiB), interpolates pigment before upload, and the existing terrain renderer
applies height lighting, aberration and bloom afterward. Thus the cellular rules
are offline; terrain lighting/postprocessing remain live. The broad main creature
field and final Planck Life endpoint still use their existing separate renderers.

Version 2 assets are in `generated/lenia-animation-v2/`; adjacent-frame prefetch
supports rapid forward/reverse traversal. Obsolete version 1 animation bakes have been removed; Git retains their history.

### Opening correction: static background, unique smooth hero

`bake-lenia-hero.py` and `generated/lenia-opening-v2/` supersede the full-field
opening animation. Only the unique high-resolution central creature animates.
The broad field uses the original catalog snapshots with seeded nonperiodic
patch rotations, offsets and scales; it is never overwritten by animated frames.
The central creature is aligned by fractional Fourier translation during its
simulation, replacing rounded pixel rolls. The maximum measured RGB centroid
step across the 90 256² lossless frames is 0.27 pixels. Runtime interpolation
further smooths intermediate depth samples. Four decoded hero frames now cost
at most 1 MiB. The fixed optical body span is recorded in the manifest.
