### Rule-generated cellular animation (2026-11-02)

`scripts/bake-lenia-strata.py` recalculates six populations from saved matter and
carried rule parameters in `/Users/avsa/Dev/Life/library`; it never reads videos.
Each population settles for 250 unrecorded steps before recording 30 pigment/
height states. The child's first 15 samples receive the parent's final 15 central
height fields as gentle multiplicative forcing before each rule step (0.003).
A small warped spatial noise field modulates pigment intensity before evolution.
Placements and rotations are seeded and irregular. Raw channel/height NPZ files
are build intermediates; playback loads only the small WebP pigment stamps.

`lenia-animation.js` selects neighboring frames from physical zoom depth, with a
15-frame overlap between strata. It retains at most 18 decoded 256² bitmaps
(4.5 MiB), interpolates pigment before upload, and the existing terrain renderer
applies height lighting, aberration and bloom afterward. Thus the cellular rules
are offline; terrain lighting/postprocessing remain live. The broad main creature
field and final Planck Life endpoint still use their existing separate renderers.
