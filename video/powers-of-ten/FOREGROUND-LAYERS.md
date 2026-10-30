# Matched foreground layers

Approved by the author on 2026-10-30. Apply this workflow whenever the powers-of-ten
zoom encounters a foreground object: canopy, leaf, insect, drop or microscopic subject.

1. Establish one physical frame width and coordinate origin. Extract natural
   transparent contours for near and middle objects. Inpaint the hidden background.
   Keep every plane sharp; no generated bokeh, baked blur or geometric cutout edges.
2. Keep framing and registration fixed. Composite the exact planes in their
   intended order. Build the lower-resolution parent's central third from this
   composite; propagate the matched child centre outward through the 3× pyramid.
   Never independently regenerate two supposedly matching views and rely on a fade.
3. During replacement all planes use identical physical zoom, position and zero
   app blur. Finish the replacement before introducing any relative movement.
   Readiness must include every required plane; retain the original while loading.
4. After replacement, ease relative speeds continuously from the common rate.
   Blur whole rear planes in the app, proportional to output frame size. No oval
   screen-space focus masks. Keep near objects opaque. Cull offscreen geometry;
   reserve a distant fade for objects only a few output pixels across.
5. A transparent finer cutout does not cover a coarser object through its holes.
   Retain lower branches until they leave geometrically or opaque imagery replaces
   them. Check both 16:9 and9:16 delivery guides during the transition, not just stops.
6. Record exact world spans and target coordinates, prompts, source references,
   native generation dimensions and any assembly/downsampling. Enlarging a canvas
   preserves placement but does not create native detail.

The first working example is `scripts/powers-of-ten-match-depth.mjs`, with optical
planes in `tools/powers-of-ten/canopy-depth.js`. `generated/canopy-test/ladybug-chain/`
contains originals, derived matched plates and versioned generation provenance.

## Scale convention

Catalogue `logR` is log10 radius in centimetres. Diameter in metres is
`2 * 10**logR / 100`. Ladybug logR=-0.46 gives6.935mm; amoeba logR=-1.65 gives447.7µm.
Frame `s` is log10 frame width in metres. A 3× step changes s by log10(3).
Keep the same world coordinates when crossing an optical boundary; change focus
and depiction rather than silently resizing organisms to fill the frame. A
microscopic illustration inside a droplet is an illustrative scenario, not an
observation that the pictured animal carries that organism.
