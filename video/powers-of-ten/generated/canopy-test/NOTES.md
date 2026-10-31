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

### Fixed microscopic zoom axis

Removed the temporary pollen-visit camera steering. The optical axis stays
through the small amoeba; the main pollen remains at its existing off-axis
position (-26 µm, -8 µm), with the surrounding grains. Layer parallax and
focus changes remain intact. No asset or parent registration changed.

### Later pollen defocus, sharp target cell

The target amoeba now starts sharp at its actual tiny size, without an initial
blur. Pollen/community/dust defocus waits until that 8 µm cell occupies 12%
of frame width (about 67 µm frame), then eases to full defocus at 40%
(20 µm frame). Existing parallax and shell/surface blur are unchanged.

### Slower shell-background focus shift

Shell background blur now starts at a 1 mm frame and eases across roughly
1.4 decades to full defocus at 40 µm, replacing the much faster 1.3 mm–291 µm
ramp. Shell parallax, surface reflections and pollen/cell focus are unchanged.

### Amoeba interior: nucleus → chromatin → nucleosomes

New fixed-axis image stops: 2 µm nucleus, 667 nm chromatin, 222 nm closer
chromatin and 74 nm nucleosome/DNA view. Six generated scientific asset calls,
including a wider molecular field correction; final prompt/asset provenance
in micro/nucleus-v6/provenance.json. These interiors are reconstructions below
optical resolution; molecular geometry is approximate rather than measured.

match-nucleus.mjs builds the 3× matched pyramid from the finest image outward,
then the sharp nuclear background/envelope composite and amoeba source patch.
The same source axis649.5,617.5 is retained. match-drop and match-depth then
propagate that updated sprite through all earlier photographic tiles.
Nuclear envelope is independently rendered only after the sharp handoff, with
app-only faster zoom/blur; later chromatin fields replace their exact parent
cores. Broad25% edge blending softens the change in representation.

Inspected existing small.js/public/hopf/hopf-core.js: real-scale hydrogen and
proton rendering already exist. This extension ends at chromatin/nucleosomes;
subsequent generated DNA/base-pair images must keep central hydrogen aligned
to the existing Hopf electron-cloud handoff. No camera recentering introduced.
Verified exact nuclear composite, matched child centres and four preview stops.

### Populated midrange water field

Added a native transparent mixed-microorganism image over a240µm water field,
plus42 small6–9.5µm cells in reproducible inner/outer bands. The existing
pollen/Arcella/Vannella community remains. The main central specimen retains
its independent high-resolution sprite/nuclear interior and fixed axis.
Imagegen source and6% edge feather recorded in water-field-provenance.json.
No per-frame randomization or camera recentering; each field/cell retains its
registered size, position, depth lag and optical focus. All earlier tiles
rebuilt from the new composite. Visual inspection at180µm confirms a densely
populated field with the hero still identifiable; coordinate checks confirm
cells fit inside the physical drop and leave the centre target unobstructed.

### Populate the wider level and remove the rectangular population boundary

Expanded the240µm organism field to720µm. A newly generated populated outer
field surrounds the original1254px centre on a3762px assembled canvas. The
original centre retains its exact physical pixel scale and unchanged core
pixels, including transparent gaps. Outer content is cleared underneath that
centre rather than stacked into it;6% centre-edge blending joins the fields.
The new outer boundary tapers across18%, avoiding a sharp replacement square.
Runtime and parent builder now respect per-asset sourcePixels; no implicit
1254px resizing changes the field's world size. Flat dew and all earlier
parents rebuilt. Verified centre core pixels, unchanged metres-per-pixel,
field fitting inside dew, syntax and reported s=-3.38 preview.


## Photographic cell → DNA pass (2026-10-30, anatomy-v9)

SVG layouts in `micro/anatomy-v9/*-layout.svg` establish approximate geometry;
built-in image generation supplies photographic scientific reconstruction.
Prompts, inputs and biological limitations are in `provenance.json`.
New small amoeba source square is12µm, body approximately8µm (provisional,
not an identified species), fixed centre627,627. Nuclear centre is0.5µm left
of the zoom axis, so we enter chromatin beside its central nucleolus.
`powers-of-ten-match-anatomy.mjs` registers generated size drift and builds
8 matched3× levels:12µm,4µm,1.333µm,444nm,148nm,49.4nm,16.5nm,5.49nm.
Intermediate levels are crops, not additional native generated detail.
All7 central100px parent/child registration checks pass.
No new parallax is introduced inside these flat matched illustrations.
The shell/leaf foreground handoff remains in its established layers.
Whole-cell opacity transitions from0.82 to1 between12µm and4µm, removing
red shell tint inside the nucleus. Ribosome25nm is in cytoplasm, included as
an off-axis miniature and a separate40nm close-up; it is NOT inside chromatin.
Cell → DNA plays the new segment. Hopf atom handoff is still future work.
Molecular images are approximate artistic reconstructions, not PDB renders;
no claim of atomically exact generated connectivity or species-specific anatomy.

## Hopf renderer review (2026-10-30)

`public/hopf/hopf-core.js` supplies WebGL2 extruded Hopf fibre tubes, HDR where
available,4-sample MSAA and bloom. `tools/powers-of-ten/small.js` already adapts
hydrogen, proton and up-quark views to the zoom in linear physical scale and
hides the explorer's enlarged nucleus. The A–T base pair uses a chosen hydrogen
as the fixed centre. The canopy photo sequence still ends at5.49nm: its bridge
into this coded base pair and hydrogen is not yet connected.

Improved the zoom adapter: preview render cap2048px, `atomquality=video` cap3840px,
subject to GPU renderbuffer limit; retain render targets until resolution halves
to avoid reallocating on every small zoom change. Stable seeded electron samples
replace per-frame random resampling. Release imported module Blob URL after load.
Validated whole-atom Hopf rendering at500pm and inner cloud at50pm in the viewer.
Next: register generated DNA to the actual coded A–T geometry and target H before
crossfading; match lighting/background and hold orbital camera pose during handoff.

## Earth-to-space review (2026-10-30)

The full viewer already continues through globe/Moon, staged planet flybys,
Kuiper/Oort, catalogue stars, Milky Way, Local Group,2MRS galaxies and CMB.
The isolated `canopytest` view still stops at its satellite-scale upper bound.
Planet flybys use enlarged radii and shifted positions for staging.
Fixed sky projection previously rendered a square and stretched it: horizontal
and vertical field now use the actual output aspect and shorter-side scale.
Longitude-wrap bilinear sampling reduces nearest-pixel shimmer. Cache includes
both output dimensions. Moving preview increases360→720px; `spacequality=video`
(or `hq=1`) uses8K sky source and up to3840 output pixels on the longest edge,
including while camera rotates. Earth globe cap rises720→1024 preview and3840
in video mode. Checked Earth at50,000km in16:9 and9:16.

## Integrated CMB → quark journey (2026-10-30)

The `canopytest=1` artifact now spans s27.6 through−18.7 (rather than stopping
at satellite and DNA). Play CMB → quarks and the reverse each take180seconds;
Stop journey, preset clicks, wheel and keyboard cancel the scripted traversal.
New presets expose CMB, galaxy groups, Milky Way, solar system, globe, base pair,
hydrogen, proton and quark alongside all the photographic review stops.
The shorter Cell → DNA control now carries on into hydrogen at320pm.

Fixed a shared-camera leak: photographic shell registration previously mutated
cam.cx/cy before the small-scale renderer ran. Those offsets are now isolated in
a picture-only camera. The coded hydrogen/proton/quark stay at the unchanged
screen centre. Leaf backdrop retires after opaque nuclear coverage; microscopic
imagery dissolves between2.8nm and0.63nm as the coded A–T base pair takes over.
The final photograph and coded molecular pose are not yet pixel registered: this
first full integration uses a material/focus dissolve there. Future polish should
anchor a generated atom surface to the actual base-pair geometry before its reveal.
The old procedural DNA is suppressed during that handoff to avoid a third helix.
Added am/zm scale readouts instead of expressing quarks as huge Planck multiples.
CMB remains the existing logarithmic spectrum-shell presentation at the end.

Verified uninterrupted180-second playback from CMB to the quark endpoint.
The complete route lives in `tools/powers-of-ten/full-journey.js`, shared by
the normal entry and isolated preview helper so they cannot drift in scale limits.
Manual transport and slider input cancel scripted playback as well.


## Big-to-small review (2026-10-31)

User review was dictated; odd names/phrases are transcription noise.
- Correct Hubble/CMB comparison: old logarithmic radii0.976/1 made14.4Gly and
  46Gly look equal. CMB control now uses linear radius and calibrated maximum
  frame118Gly, rather than420Gly. Hubble overlay radius is14.4/46 of CMB.
  Explicit radius labels. Keep current camera orientation pending clarification.
- Human distance labels: thousand/million/billion/trillion km; switch to powers
  at1000trillion km. Frame HUD uses the same formatter. Added radius rings for
  light-second/hour/day,1/10/100 light-years,1million and1billion light-years.
- Local Group approximate10million-light-year diameter circle, centred halfway
  toward M31 for the drawn group. Neptune/Jupiter/Mars/Moon orbital reference
  lines label distance from their parent. Moon and planets now true-size at
  catalogue positions; removed enlarged staged foreground passes.
- Restore real cloud overlays in integrated canopy view. Added persistent cloud
  planes at8.5/7/4.2km using existing MODIS wisps with stronger intrinsic alpha,
  perspective and geometric edge exit before crossing altitude. Plane/bird and
  accepted canopy/leaf/bug composition retained.
- At500µm: increase community and field opacity instead of washed-out ghosts.
  Rebuilt matched flat drop and outward parents from shared specimen definitions.
- At120nm: new148nm outpaint wraps exact49nm child, instead of an enlarged crop
  of a different chromatin arrangement. Built-in generator prompt/input in
  anatomy-v9/bridge-provenance.json. Seven parent-centre checks pass.
- Biology: amoebae have ribosomes and chromosomes. Do not add a field of X-shaped
  mitotic chromosomes to an interphase nucleus, or assign human XX/XY to an
  unidentified amoeba. Keep visible chromatin and existing ribosome inspection.
- Explicitly deferred by user:1nm coded-molecule redesign. No molecule changes.

References checked:
https://www.nasa.gov/science-research/astrophysics/how-big-is-space-we-asked-a-nasa-expert-episode-61/
https://imagine.gsfc.nasa.gov/features/cosmic/local_group_info.html
https://science.nasa.gov/solar-system/oort-cloud/facts/
https://science.nasa.gov/asset/hubble/relationship-of-the-kuiper-belt-to-the-oort-cloud/
https://pmc.ncbi.nlm.nih.gov/articles/PMC2107637/
https://openstax.org/books/biology/pages/10-1-cell-division

## Matched galactic interior handoffs · 2026-10-31

New diffuse plate: `../galaxy-handoff-v1/distant-milky-way.png` (native1254×1254;
original retained, not described as native4K). Built-in image generation; exact
prompt and provenance are beside the image in `provenance.json`.

`tools/powers-of-ten/galaxy-handoff.js` builds the interior outward:
- Sample the plate's luminance for a seeded local star cloud. Put these stars in
  depth35–935ly; retain the nearest Hipparcos catalogue stars separately.
- As camera distance shrinks, use perspective projection that tends to fixed
  angular positions. Stars behind the camera are culled geometrically. There is
  no opacity retirement of the local star field on entry to the solar system.
- Galaxy entry uses a textured light-volume mesh, with depth from luminance,
  rather than large square particle sprites. Rotate the object by up to86°,
  flatten and register every mesh vertex onto the interior plate. Edge feathering
  avoids a floating rectangular photograph during the approach.
- Morph froms21.65 to20.05; only once registered, replace the mesh with the exact
  full-resolution plate from20.05 to19.65. The two draws use complementary weights
  and additive compositing, preserving brightness. The camera axis is unchanged.
- The background stays behind the separately rendered stars and solar system.
  It follows the existing camera orientation; no independently generated sky swap.
- Dedicated preview buttons: Galaxy→local stars(22→18,26s), and Stars→solar
  system(19→12.8,32s). Both run through the normal viewer and both delivery guides.

Verification: JavaScript syntax; identical registered image source and transform
across the handoff, complementary brightness weights; angular convergence of
stars and behind-camera culling; visual checks at20.7,20.05,18.2 and13.
Stellar distribution beyond the nearest catalogue stars is intentionally
compositional, following the author's request; this is not an astrometric survey.

## Equirectangular map → catalogue stars → modelled galaxy · 2026-10-31

Supersedes thev1 rotating image surface. This version follows the author's
explicit outward construction. The original all-sky map is
`video/powers-of-ten/sky/sky-4k.jpg`, in galactic equirectangular coordinates.
Longitude0 is at horizontal centre, positive to the left; latitude north is up.

The cleaned image, generated edit prompt, geometry and face-on diagnostic are
in `generated/galaxy-handoff-v2/`. Cleaned native resolution1774×887; the runtime
resamples it to2048×1024 for repeat-wrapped WebGL1 texture addressing, which
adds no native detail. The complete original map is retained at4096×2048.

Outward phases (s=log10 frame width in metres):
-15.35–15.85: original sky → cleaned sky plus catalogue stars at angular positions.
-15.85–17.6: measured star distances become active. Catalogue directions and
 distances come from the existing Hipparcos/Gaia data; local neighbourhood LOD
 uses stars within150ly plus the named bright landmarks (including Proxima and
 the more distant Betelgeuse/Deneb), with duplicates suppressed. Distant unresolved light remains in the cleaned map.
-18.8–19.25: cleaned sky →360,000 dots sampled from its brightness and colour.
 Dots are still at infinity, so their projected directions remain registered.
-19.25–21.35: only after image replacement, modelled galactic distances become
 active. The existing tilt towards the galactic pole is delayed to this interval.
- Beyond: the same 3D dots remain the galaxy; they are not replaced by a texture.

`galaxy-geometry.js` defines the shared angular mapping and non-overlapping
phases. `galaxy-handoff.js` projects the map and both point clouds using the same
camera basis and50° field of view. Inverse distance starts at zero, so changing
stored distance cannot move points during a fade. As inverse distance activates,
the standard finite perspective projection emerges. The Sun remains a central
warm point after the solar system contracts. Resolved Oort particles attenuate
when their cloud becomes too small to distinguish, avoiding a false blue star.

`scripts/powers-of-ten-build-galaxy.mjs` samples solid-angle-weighted luminance
and retains each chosen direction. Conditional distance along that ray comes
from a thin/thick disc, Gaussian bar/bulge and four logarithmic spiral arms.
Latitude integration resolves the thin midplane at512 rows. Model luminosity
weights activate with depth, correcting the observer's dust-biased angular
sampling so exterior arms can appear; the map controls the fully registered
initial view. Extended Magellanic light is placed near50/62kpc and reduced as
existing external-galaxy layers take over. These distances/densities are a visual
model, while the local catalogue stars retain measured distances.

Rendering is WebGL point sprites with additive radiance crossfades. Point
footprints narrow during the depth reveal. The old square photo/mesh morph and
random local stars are not used. All geometry and sampling are seeded and
reversible for normal zooming in either direction.

Validation: spherical coordinate round trips, angular registration independent
of distance, strict fade-before-depth ordering, finite perspective equivalence,
unit directions and positive distances for all360,000 generated points. A
face-on model diagnostic is committed alongside the data. Visual review covers
both handoffs and the exterior galaxy; browser shader/asset logs checked.

### Galactic appearance refinement · 2026-10-31

Following visual review: add fine, deterministic grain to the cleaned sky in
world-ray coordinates (two spatial frequencies, no time seed or screen overlay).
Nearby catalogue stars now use4.3px footprints per960px frame rather than2.3,
and2.1 peak exposure rather than0.75, making their emerging parallax readable.
Galaxy particles narrow from3.3 to2.4px during depth, replacing the earlier
11px angular splats. Inner-cloud exposure is balanced separately so the smaller
particles don't wash out the remaining galactic light.

A separate distant galactic-band component remains behind the moving points:
60% equatorial-band strength, attenuated by latitude, retires between s20.3 and
21.05. The interior sightline is held through20.15, then tilt and yaw catch up
smoothly to the existing exterior orientation by21.6. This retains the far edge
while the nearer cloud pulls away. The two registered replacement/depth phase
boundaries and all catalogue/model positions remain unchanged.

Visual checks at s16.25 (catalogue-star brightness) and20.15 (retained band,
small points), shader logs clean; existing spherical/phase/data checks pass.

### Shrinking sky sphere and camera crossing · 2026-10-31

Author explicitly superseded the galactic fade-before-depth sequence: fade the
3D stars in while the sky stays lit, move out of a shrinking sphere looking at
its centre, and only fade the sky after crossing outside it.

The sky shader now raycasts a spherical shell in world space. Radius contracts
40→12kpc over s18.8–21.3; the camera moves radially along its existing viewing
normal, always aimed at the common origin. The same effective camera distance
is used by the shell and galaxy points. Stars gain their modelled positions
while fading in over18.8–19.25; subsequent movement is normal perspective zoom.

The shell uses the far ray-intersection root on both sides of the surface,
preventing a near-wall texture flip when crossing. Missing intersections leave
transparent space around its exterior silhouette. It remains fully illuminated
while D/R≤1.02 and fades only outside, over D/R1.02→2.5. Crossing is near s20.67;
by s21.0 the shell is retired and the 3D galaxy remains. The older equatorial
background-retention overlay is replaced by this actual sphere geometry.

36 seeded cool-white specks are placed along the crossing corridor in world
space. They enter/exit the frame geometrically, stay opaque when nearby, blur
when large, and retire only at subpixel size. Positions depend on zoom rather
than wall-clock time, so forward/reverse playback is consistent. They are a
cinematic depth layer, not catalogue objects or labelled physical star sizes.

Validation updated to enforce full sky illumination inside the sphere and fade
only outside; the earlier galactic fade-before-depth assertion is intentionally
removed. Local catalogue-star handoff ordering, angular registration and all
point data checks remain. Shader logs and the crossing view were checked.

Point exposure is balanced against the still-lit shell (40%→100% as it retires),
to avoid adding two fully exposed galactic cores during the crossing.

### Oort departure, persistent stars and earlier shell retirement · 2026-10-31

Author refinement: start nearby-star depth earlier while leaving Oort, keep
stars lit until the whole neighbourhood is a small central dot, strengthen icy
bodies and merge them into a brighter Sun, fix the13k–16kly camera jump, and
start shell retirement at6kly with almost nothing remaining by50kly.

- Local sky/cached-star crossfade now15.35–16.5. Measured depth starts gradually
  at15.8 and is complete at16.7 (≈0.67–5.3ly frame width), overlapping the slow
  image transition intentionally. This supersedes the earlier local fade-first
  ordering as requested by the author.
- Catalogue dots keep their emitted brightness (no inverse-square attenuation
  or fixed next-phase alpha fade). Their bounding radius, including named
  landmarks, controls geometric retirement: full light while radius≥1.2 output
  pixels, fading only below that, with shrinking point footprints. The central
  Sun follows this retirement rather than an arbitrary exponent cutoff.
- Kuiper/Oort dots now1.8px rather than1.2, opacity1/.9 rather than.8/.55. Their
  spatial positions stay fixed. Each set becomes unresolved based on its own
  projected radius and warms toward the Sun colour as it merges. The Sun halo
  grows with both merge fractions, then compacts for the galactic view.
- Camera discontinuity found at s20.15: the early-return branch left roll/tilt
  inactive, then enabled an existing≈7° tilt on the next frame. Tilt now uses
  the same smooth gate as yaw. Threshold continuity and a sampled13k–16kly sweep
  are included in the regression check.
- Optical sphere radius is calibrated so D/R=1.02 at6,000ly frame width. It is
  fully lit before then, falls smoothly to2% by50,000ly, and reaches zero at
 70,000ly. The crossing particles were moved to this earlier interval. The
  radius is a transition-dome parameter, not the physical edge of the Milky Way.

Validation: projection/data checks, revised early stellar overlap, exact shell
opacity milestones, camera-basis continuity and camera sweep; browser review of
strong Oort and early stars. Generated images and point geometry are unchanged.
