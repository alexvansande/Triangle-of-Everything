# Bright-centred canopy test — 2026-10-30

This test generates the eight surrounding L1 tiles (13.27 m whole level), anchored to Claude's NAIP aerial imagery. A single finer context plate supplies the centre and overlap, so the test ends on sharp, sunlit foliage. It is an initial visual test rather than the complete finer tiled pyramid.

The user requested a bright foliage centre. The selected NAIP patch is 8.2421 m east and 3.8878 m south of the original centre. `centre.json` records the coordinates and exact offset. Both the tile references and all photographic plates use this same offset. At large scales the preview translates the existing orthographic plates rather than downloading new imagery.

Generated with the built-in image-generation tool; the tool does not expose a model identifier or quality setting. Requested 1280 px square, normalized to 1280 px for assembly, with a 1024 px core and 128 px margin per side. Generated detail is an interpretation, not a photograph of the actual crown.

An initial discarded test supplied a tile crop and the whole aerial photograph together. The whole-image reference dominated and the model repeated the wide composition. The revised prompt uses the single cropped photo as the edit target. Old-centre attempts are not part of these deliverables.

`provenance.json` records the final prompts and input references. `scripts/powers-of-ten-stitch-test.mjs` assembles the tiles using separable overlap weights. `scripts/powers-of-ten-canopy-preview.mjs` copies the result into a pinned isolated version of Claude's viewer (99ffbc0), preserving the unfinished checkout. Run it with `--serve` to start the local preview on port 5187.

The viewer has jump buttons, a 24-second satellite-to-crown approach, a generated-detail comparison checkbox and a centre marker. Generated plates use a narrow square feather (4% per edge) to preserve corner detail; the real photographs retain their existing radial feather. The generated canopy is optional; standard viewer behaviour is unchanged outside this isolated test.

Imagery: USDA FSA / USGS NAIP, public domain; Sentinel-2 cloudless 2016 by EOX, CC BY 4.0 (modified Copernicus Sentinel data). Reference geography and source images come from Claude's generation kit and photo pipeline.

## Intermediate-level review

Added whole-level generated drafts at 39.8107 m and 119.4322 m, with references recropped about the same bright foliage centre. These are two new generated images, not completed eight-tile rings. Both requested 2048 × 2048 but returned native 1254 × 1254. They are saved without enlargement in `intermediates/`, with exact prompts and actual dimensions in that folder's `provenance.json`. The plate manifest retains the 13.27 m stitched level nested inside them. The previous 40 m photo plate remains saved but is no longer the generated-detail layer at that scale.

The review controls now jump to 50, 120 and 400 metres. The 400 m view still relies on source photography; no 360 m or 1080 m generated level has been commissioned. Further subdivision should follow the author's visual review and the actual pixel coverage in the 3840 × 3840 master, not assumed output dimensions.

For comparison, completing four new levels with the original 3 × 3 centre-reuse scheme would require 32 new tiles (8 per level), not four or 28. The adaptive draft approach starts with whole plates, then subdivides only levels or regions that remain soft. Composition drift and joins remain review items; these drafts are not a claim of a pixel-exact reconstruction of the actual forest.

## Crown to ladybug

Added five nested steps at 4.423 m, 1.474 m, 49.15 cm, 16.38 cm and 5.461 cm. The first reuses the central core of the existing finer context plate; the remaining four are new built-in image generations from successive central-third crops. Exact prompts, native output dimensions and files are in `ladybug-chain/provenance.json`. These remain draft-resolution images.

Reviewed `src/objects.json`, `src/dust-famous.json` and the available icons. The catalogue ant is the useful additional reference. Ladybug and ant use the catalogue's log-radius-in-centimetres values: representative spans 6.935 mm and 3.991 mm. They are placed by `canopy-insects.js` at fixed physical coordinates, using 1024px catalogue artwork, so they do not change identity or relative size between generations. The ladybug is at the zoom centre; the ant is 12 mm east and 4 mm north, inside both delivery crops at the final stop. These are illustrative placements, not observations of those species on the actual General Sherman tree. Flea/moths were omitted; pollen is below the useful scale of this stop.

The viewer's minimum comes from the plate manifest. `Crown → ladybug` plays the new section in 26 seconds; the full approach runs in 40 seconds. The square framing and both delivery crop guides remain in place.

## Macro integration and aircraft pass

Following the author's screenshot feedback, replaced the rigid catalogue cutouts with an in-context image edit. The ladybug is turned and slightly tilted, with articulated legs contacting the scales; both insects have matching left-side sunlight, green reflected fill and local contact/cast shadows. An initial oversized edit was corrected in a second generation. Outputs and prompts are in `ladybug-chain/integrated-provenance.json`; the original foliage and earlier sprites remain available. Size and exact pose are illustrative approximations now, rather than exact icon extents.

The viewer blends only the insects' local leaf/contact-shadow neighbourhoods from the edited photograph, at a fixed 54.61 mm world extent, so a square of sharp background does not appear at wider scales. `canopy-optics.js` adds a gradual elliptical macro focus falloff below about 5 m, preserving the central branchlet and insects while softening deeper/off-axis foliage. Blur radii scale with rendered frame size, so the effect has the same visual strength in preview and 4K output. This is a lens-style approximation, not a recovered depth map. The centre marker defaults off to avoid a circle over the beetle.

Added the catalogue Boeing 747 as an optional near-camera crossing around s=3.42 (a 2.6 km-wide ground view). Like existing flybys it scales and moves 1.7 times faster in log scale than the terrain: entering near an edge on the outward zoom and receding towards the centre. It is a stylized close camera pass, not an aircraft drawn to the ground map's scale or an assertion about real traffic above the park. It is deterministic in s and works in either direction. `Ladybug → sky` plays the outward move in 42 seconds; `Airplane flyby` jumps to the pass. Both macro focus and airplane have independent review toggles.

## Bird flyby and dew approach

Added a generated transparent Steller's jay above the terrain, independently enabled and deterministic in zoom. Its pass is centred at s=1.35 (22 m terrain frame), scaling/moving 1.85 times the logarithmic terrain zoom speed, with near-edge blur and fade. It is a separate foreground layer, never baked into imagery.

The 54.61 mm foliage plate now includes dew on leaves and one approximately 1 mm bead on the ladybug shell. Three new 3× finer image plates at 18.20, 6.07 and 2.02 mm continue into that bead. Cropped references and outputs remain beside the originals. All closer plates share a measured offset of x=-2.4387 mm,y=-1.001 mm from the original image centre; the camera gently steers to that target between s=-0.7 and -1.75. Upper levels keep their original coordinates. The former insect patch draws below these plates to avoid covering finer details. Native generations remain 1254px draft assets. Built-in image generation prompts and provenance: ladybug-chain/dew-provenance.json. Controls include Bird flyby, Ladybug → dew and three close-up stops.

Aircraft fade revision: removed the s=4.28 cutoff. The airplane now stays opaque until its rendered extent falls below six pixels in the 3840px square video master, fading smoothly to zero at two pixels. Preview uses the equivalent proportional size so export and preview match. Its parallax motion and near-camera entry are unchanged.

## Green foliage and separated optical planes

Replaced exposed brown/orange woody branches with foliage in four versioned green images at 1.47 m, 49.1 cm, 16.4 cm and 5.46 cm. Reviewed the 4.42 m crown image: it already reads as green foliage, so it is retained. The shell/droplet close-ups contain no exposed wood and remain aligned to their existing anchor.

Removed the former oval screen-space focus treatment from canopy-optics.js. New canopy-depth.js renders an inpainted green background separately from two true-alpha foreground leaf-spray images. Depth fades in between s=0.12 and -0.42. Foreground retains the established 1× physical zoom and the shell-target steering. Background magnification changes at 0.55× logarithmic zoom speed, with a uniform whole-plane blur increasing smoothly from 2 to 29 pixels per 960px frame (proportionally scaled for video). Only this background is blurred. Coarse foreground fades away as its finer replacement spans the frame, preventing a magnified low-resolution foreground from lingering around the sharp close-up. Close shell plates then nest above it as before. This is a two-plane photographic interpretation, not reconstructed geometry.

Review controls: Depth check · 20 cm, Leaf depth layers, Background blur. The original images are retained; built-in image-generation prompts, all inputs and output origins are recorded in ladybug-chain/depth-provenance.json.

Close flyby opacity revision: removed the near-range opacity ramps and fixed close cutoffs from both airplane and bird. They remain fully opaque while growing and passing out through the frame, with existing near-camera blur. Geometry culls only when the rotated image plus blur padding is completely outside the visible square. Distant fade remains (airplane 6→2 master pixels). No imagery regenerated.

## Timing-first depth handoff revision

Moved the separate-plane handoff from 1.3m–38cm to 14–10cm. Relative background motion stays locked at the same physical zoom rate through the entire handoff and begins only below 9cm, easing continuously toward 0.55×. Back-plane initial scale now uses the original 49.1cm image extent rather than an arbitrary screen-relative magnification. Uniform blur ramps during the handoff, with further defocus below it. Removed the width-based early retirement of the broad foreground: a transparent finer cutout cannot replace leaves through its holes. Lower foliage now persists until actual opaque close-ups cover it. No new images or image extensions generated. Added a 22-second 'Test · 1 m → 3 cm' playback for review. Residual differences in generated image composition are unchanged; review timing before extending assets.

## Matched sharp stack before depth

Regenerated a fully sharp 16.4cm background from the green16cm scene with the foreground spray removed. No bokeh or software blur is baked into the background. The existing foreground cutouts are assembled on a shared 3762px coordinate canvas, retaining the central5.46cm cutout's native1254px detail. This is assembly, not additional recovered peripheral resolution. Runtime now uses two optical planes: background-sharp-v2.png and matched/foreground.png, both spanning16.4cm. The flat16cm and5.46cm plates derive from this exact stack. All wider parent centres through120m are rebuilt from their children with narrow edge feathers, so central structures remain in the same positions across resolutions. Verified RGB identity of the recomposed flat16cm and of the unfeathered49cm parent core against its downsampled child.

During the14–10cm handoff both planes remain aligned and receive zero app blur. Only below9cm does the app gradually introduce background parallax and uniform defocus. Camera target steering applies to both planes identically before depth begins. scripts/powers-of-ten-match-depth.mjs runs during preview preparation to keep manifest and derived plates consistent. New exact prompt and origins: ladybug-chain/sharp-matched-provenance.json. Originals retained.

## Canopy, natural dew and microscopic continuation

Saved the author-approved default in video/powers-of-ten/FOREGROUND-LAYERS.md, linked from the README and scoped tools/powers-of-ten/AGENTS.md for future foreground work.

Added three canopy planes (back, middle, near) at4.423m span. The near plane retains the recursively matched1.474m centre. Flat4.423m and wider parents are derived from their composite. Handoff3.9→3.2m is sharp and locked; subtle relative rates1.0,0.965,0.92 ease in below3m. No canopy blur is baked or applied. Finer matched plates cover this stack naturally, preserving leaf positions.

Revised the dew-bearing foreground using the author's three small ladybug references: scattered small condensation beads and one approximately1.16mm target bead. Regenerated18.2mm,6.07mm and2.02mm views, rebuilding their parent centres inward-to-outward to prevent independent composition drift. Target is source pixel570,605 in a1254px54.61mm scene. Originals retained.

Added an illustrative optical transition into the bead below1.5mm, reaching microscopic focus by0.95mm. A new translucent Amoeba proteus keeps a fixed447.7µm maximum body extent from the catalogue (2×10^-1.65cm). Alpha-body bounds1471px calibrate the1536×1024 sprite, excluding transparent margin. It occupies66.4% of the674µm-wide stop; the225µm stop shows part of the cell rather than shrinking it to fit. The roughly1.16mm bead can contain this body. Microworld's primary microscopic observations report typical220–760µm and a22–62µm nucleus: https://amoebae.nl/amoeba-proteus/. Scene is illustrative, not a claim of an observed organism on this ladybug. The red shell's light remains in the watery optical background. All generation prompts/origins are in expansion-provenance.json; physical metadata in micro/scene.json.

Whole amoeba review stop:900µm frame keeps the447.7µm body inside the central56.25% shared area of both YouTube delivery guides. The674µm stop is a closer view;225µm enters the cell's field. User-provided dew references used for generation are preserved in dew-references/. Extended the photographic replacement mask down to the microscopic minimum so the legacy schematic amoeba/nucleus cannot draw over the new scene.

## Photographic aircraft and stronger near defocus

Replaced the runtime catalogue Boeing747 with versioned built-in image generation plane-photographic-v3.png. Catalogue image supplied anatomy/orientation only. The new asset uses warm upper-left sunlight, subdued weathered paint and photographic surface reflections; a correction removed recognisable forest patterns on wings so the metal remains visually opaque. Native1254² transparent image. Exact prompts/origins in plane-photographic-provenance.json; originals retained.

Both bird and plane now share closeFlybyBlur: no defocus at near<=1.35, easing to42px at near>=5 in a960px preview, scaled proportionally to168px in a3840px master. Close opacity remains1; geometric exit and the airplane's distant6→2pixel fade are preserved. Blur remains dynamic, never baked into either sprite.

### 2026-10-30 — 1 mm focus handoff and stronger canopy depth

Canopy lag increased from back/mid 0.08/0.035 to 0.18/0.08; near remains
1×. The unchanged 3.9–3.2 m replacement and below-3 m easing keep the
initial composite registered.

The microscopic layer now begins with the exact same sharp 2.02 mm parent
image at its original physical span and centre (replacement 1.8–1.5 mm).
Only after replacement does app-controlled focus shift (1.4–0.65 mm):
the shell softens and the fixed-size amoeba resolves from defocus.
The different water texture enters later, 0.85–0.45 mm, after the rim has
left both central video crops. No regenerated or preblurred parent assets.
Amoeba diameter remains 447.7 µm; drop diameter remains 1.16 mm.
Verified module syntax and inspected 1 mm, 680 µm and 1.6 m preview stops.

### Integrated microscopic photographic field

Replaced the separate gray amoeba cutout and unrelated water layer with a
coherently lit native micrograph and a matched wider parent. Built-in image
prompts and assembly registration are in micro/field-v2-provenance.json.
The sharp droplet plate still replaces identically at 1.8–1.5 mm. Surface
focus shifts coherently below 1.4 mm, with the integrated interior fading in
from 1.25–0.70 mm; app blur resolves by 0.72 mm. The new field remains inside
the physical 1.16 mm bead until its rim exits the frame. Fine detail switches
only after its feathered parent boundary is outside the entire square.
Body calibration remains 447.744 µm, independently of image canvas dimensions.
Verified central parent pixels against the downsampled detail, module syntax,
physical size and preview around 1 mm / 790 µm.

### Three-plane droplet handoff (supersedes integrated water-field fade)

User requested actual ladybug texture continuing into the microscope scene.
New native sharp planes in micro/layers-v3: shell (central reflections removed),
transparent rim/highlights, and warm translucent amoeba. No water-field swap.
match-drop.mjs records exact pixel registrations and builds their flat parent;
match-depth.mjs propagates that parent through the existing 3× chain.
The app uses that exact flat composite during 1.8–1.5 mm replacement. Only
below 1.3 mm do the shell and surface separate from the fixed-scale specimen,
easing to relative zoom rates 0.45× / 1.75× with app-controlled rear/front blur.
Foreground surface remains at constant opacity and leaves by geometry.
Size checked against microscopy sources: Amoeba proteus can be around
600–750 µm; our nominal 447.7 µm is plausible, no missing unit decade.
Prompts, size sources and assembly are in micro/layers-v3/provenance.json.

### Smaller suspended specimens

Added three faint companions (approximately 63, 93 and 136 µm body widths)
on a separate water-depth plane, using the existing warm transparent specimen
asset with varied rotation and material opacity. All fit wholly inside the
1.16 mm droplet. Their zoom rate eases to 0.75× relative to the hero's 1×;
app-controlled 9px/960px defocus starts only after the matched handoff.
The shared canopy-micro-specimens.js registrations also build the flat parent,
which is propagated through all earlier tiles. No time-based drift, ensuring
reversible zoom and consistent video capture.

### Pollen first, smaller amoeba one decade later

Supersedes the large proteus and companions. New transparent native assets
micro/pollen-v4/pollen.png and amoeba.png have calibrated body spans of
40 µm and 8 µm respectively (alpha bounds exclude transparent margins).
The smaller cell is an illustrative small vannellid-type amoeba, not a scaled
giant proteus. Pollen sits 26 µm left / 8 µm above the cell; the camera eases
to the grain, then passes beside it to the cell. Review frames are 180 µm and
18 µm, exactly one decade apart. Closest frame is 6 µm. Both objects retain
constant world size; focus transfers from pollen to amoeba with app blur.
Shell and droplet reflection layers persist unchanged. Parent tiles derive
from the new exact flat stack; prompts and biological sources in provenance.

### Mixed species community in the droplet

Eight new surrounding specimens from four generated native transparent assets:
Pinus sylvestris pollen (68–70 µm), Betula pendula pollen (22–25 µm),
Arcella vulgaris testate amoeba (110 µm test width), and Vannella simplex
(44–45 µm). These are species-inspired reconstructions; size references and
complete built-in imagegen prompts are in pollen-v4/community-provenance.json.
Shared microCommunity registrations drive both matched parent assembly and
runtime depth planes. Each specimen has its own fixed size, rotation, material
opacity and relative depth lag; all bodies fit wholly inside the 1.16 mm bead.
The hero pollen/cell path is unchanged. All preceding parent tiles rebuilt.
Verified four transparent native assets, four species, eight positions within
the droplet, module syntax and the 1 mm viewer overview.
