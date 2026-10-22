# Shadow studio

## Star wall lights — accepted circular treatment, 22 October 2026

Open `/tools/star-shine-study.html` on the Vite app (port 5173). Stars now use
procedural circular gradients in both the study and the live chart. Earlier
AI ray textures remain archived in `content/icons/light-studies/`; they are
not used for the active stellar lights. `?noglow` disables stellar light pools
for comparison without disabling object shadows.

The wall light stays at the source's resting anchor. At 1.5× icon magnification
its radius grows 1.55× and its opacity falls to 1/1.55² of its resting value.
Base diameter is 2.7× the image width, base opacity 0.22, with a smooth radial
fade and soft blur. The chart samples each star's bright pixels for its tint.
Light renders behind dust and labels, with screen blending. Camera parallax
moves the foreground star independently of the wall pool.

Opaque black backing discs follow measured visible stellar bodies, not image
canvas centers. `src/star-body-frames.json` records normalized centers/radii;
`src/star-light.js` shares backing geometry and wall-light behavior. Backings
grow and move with the source on hover and wait for the artwork to load.
Round Sun, dwarfs, giants, Sirius, Vega and neutron-star artwork use this
backing. Protostars and other noncircular stellar scenes are excluded.

Brown dwarfs use a separate AI-generated optical layer: a faint dark cast
shadow with a small muted ember glow in its center. All three Y/T/L examples
share `content/icons/light-studies/brown-dwarf-wall/`, including exact prompt,
raw transparent output, normalized candidate and registered layer. Registration
is scale 0.52, opacity 0.30, x=y=80 on a 768 px canvas; the chart applies its
usual custom-shadow multiplier and southeast bias. This is a visual transition,
not a calibrated temperature-to-luminosity model. Hover uses the independent
wall-shadow projection (farther, larger, blurrier, dimmer), not the star pool's
formula. No additional circular light is stacked behind these dwarfs.

The generator protects the three brown-dwarf layers from silhouette replacement.
Browser captures and measured rest/hover checks are in `docs/star-light-review/`;
run `node scripts/check-star-lights.mjs` and `node --test scripts/star-light.test.mjs`.

## Camera parallax — 22 October 2026

The chart now has subtle depth while panning, including programmatic narration
camera moves. Back to front: background/shadows, dust dots, labels/grid,
normal icons, hovered icons. Shadows stay on the wall plane; they retain their
existing hover growth/blur behavior independently of this parallax.
The chart adds a fixed southeast bias of 10% of body diameter on each axis
to all object cast shadows, balancing the foreground shift near the bottom-right
corner. This translation is independent of pan and hover; ring extensions do
not inflate it. Star light pools keep their existing placement.

`src/parallax.js` is the shared projection. Dust shifts up to 2 px per axis and
labels/grid up to 4 px at viewport edges. A normal icon's centre shifts at most
about 28% of its body diameter from its true anchor. Each object has a stable
identity-based depth variation of ±12%, producing at most 31.36% displacement
from the anchor (62.72% total across the screen). The same slug has the same
depth in curated and catalogue rendering, across pans, searches and reloads.
Ring/jet size multipliers are excluded from the body diameter. Hover adds depth
proportional to the existing growth. Text translates without changing size.

Offsets depend on viewport position, never accumulated pan distance or speed,
so reverse pans return exactly and narrated motion gets the same effect.
Picking follows the projected artwork. Visibility decisions remain in anchored
coordinates, and label clearance reserves the possible icon travel. Reduced
motion, poster mode and Big Bang mode disable this effect; `?noparallax` is an
explicit comparison switch. Geometry checks are in `scripts/parallax.test.mjs`;
browser checks in `scripts/check-parallax.mjs` and `scripts/check-pan-visibility.mjs`.

## Big Ben shadow strength — 22 October 2026

Big Ben's scripted shadow uses opacity 0.65 (previously 0.50), following
feedback that it looked too light on the chart. Keep the shared long-shadow
direction, length, progressive blur and hover behavior. This is an individual
reviewed override; the shared sphere remains at 0.45 layer opacity.

## Animal direction: side view, always facing left — 22 October 2026

The user explicitly requested cane toad, naked mole-rat, mouse and lion
in side view, always facing LEFT. All four replacements now use broadside
bodies parallel to the wall and left-facing heads; do not turn their faces
toward the viewer. Apply this left-facing direction to future side-view
animal illustrations as well. This supersedes the earlier frontal lion
guidance below. Preserve species-appropriate poses: toad crouching, rodents
low on four feet, lion reclining with forepaws extended to the left.

Use the approved hippo/elephant finish: near-orthographic miniature viewed
only slightly from above, upper-left lighting, readable texture, real alpha,
no baked cast shadow. Keep tails compact without cropping, and include
whiskers and paws inside the canvas margins. Replaced the mouse's old
frontal source with a transparent full-body profile.

Built-in image generation supplied the four objects; the shared script
supplied their separate long wall shadows. Masters, prompts, old assets,
resolution backups, sizing checks and previews are in
`content/icons/shadow-candidates/wall-studies/left-facing-animals/`.
Chart masters are 1254px; updated runtime tiers are 128/256/512/1024px.

## Meteorites: natural outlines and specimen identity — 22 October 2026

Reviewed the two existing meteorite icons, Hoba and Chelyabinsk, after the
user flagged overly square shapes. Replaced both masters and refreshed
their separate scripted long shadows and 128/256/512/1024 exports.

Chelyabinsk should read as an irregular, naturally broken stony fragment,
with dark fusion crust and localized exposed pale interior, not a machined
cube with three broad planar faces. Hoba is genuinely a broad, roughly
rectangular iron slab: retain its tabular identity, while avoiding ruler-
straight edges and a paving-stone appearance. Use a near-frontal specimen
view with a little top visible, upper-left illumination and true alpha.
Do not turn every meteorite into the same rounded generic boulder.

Built-in image generation supplied these replacements. Old assets,
prompts, source references, raw and normalized PNGs, shadow PNGs, alpha
checks and the before/after chart-size comparison are saved in
`content/icons/shadow-candidates/wall-studies/meteorite-review/`.

## Approved lake reference and real outlines — 22 October 2026

The user explicitly approved the current Loch Ness without changes. Use
`content/icons/src/loch-ness.png` and the prompt/selected artwork in
`content/icons/shadow-candidates/wall-studies/loch-ness-wall-front/`
as the material, camera and lighting references for other lakes.

For each new lake, start with a real shoreline outline where available:
prefer an SVG or a vector lake polygon from a documented map dataset.
Keep the source URL, attribution/license and any projection or simplification
with the generation record. Render that outline as a reference for image
generation alongside Loch Ness; preserve the new lake's actual proportions,
bays, islands and recognizable contour rather than copying Loch Ness's shape.
Use a suitable local map projection, simplify only details too small for
the chart, and compare the generated silhouette against the source before
installing it. If no usable outline is available, record that limitation
rather than describing an invented silhouette as geographically verified.

Presentation: just the water volume, like a translucent blue-resin miniature
mounted slightly off a vertical museum wall. Keep the map contour facing
the viewer with little or no perspective; show a narrow band of depth on
TOP-facing edges from the slightly elevated camera, never a thick bottom
fascia. Match the approved Loch Ness texture, upper-left light, violet
bounce and readable contrast. Avoid adding surrounding terrain or a base.

Deliver a transparent object PNG and a separate wall shadow with refracted
light/caustics. Generate the caustics with AI using the approved reference;
an alpha-only scripted shadow cannot supply them. Follow the collection's
shared placement and hover behavior, centered sizing and adaptive-resolution
exports. Preserve the approved Loch Ness assets.

## Approved vehicle references — 22 October 2026

The user explicitly approved Titanic and Boeing 747 without further changes.
Use their current masters as visual references when generating other vehicles:

- Airplanes: `content/icons/src/boeing-747.png`. Direct top/dorsal view,
  wings and fuselage in the wall plane, like a miniature glued to the wall.
  Match its camera, lighting and degree of relief; retain the new aircraft's
  actual proportions and distinguishing features.
- Ships: `content/icons/src/titanic.png`. Broadside profile, like a miniature
  displayed on an invisible shelf slightly below eye level. Show just a
  little of the upper deck, with minimal perspective. Match its lighting
  and shelf-display presentation, not Titanic-specific ship details.
- Cars: viewing angle remains undecided. Do not infer an approved car angle
  from the airplane or ship rule; use a small view study when cars are next
  requested.

Preserve the approved Titanic and 747 artwork. Future vehicle outputs keep
real transparency, the collection's upper-left light, separate scripted
long wall shadows, centered silhouettes and adaptive-resolution exports.

## Large animals: side profiles like the sphinx — 22 October 2026

The user prefers side views for animals such as hippo and elephant.
Both now face left, with their long side parallel to the wall and their
heads aligned in profile, following the Great Sphinx camera reference.
Show only a slight amount of the back/top from just above eye level;
avoid foreshortened frontal bodies or heads turning toward the viewer.
Retain realistic skin, strong upper-left light, four natural staggered
feet, transparency and separate shared-preset scripted long shadows.
This supersedes the earlier near-frontal hippo/elephant guidance below.

The two 1254px masters, prompts, refined outputs and previous assets are
in `content/icons/shadow-candidates/wall-studies/side-profile-animals/`.
Chart exports include refreshed 128/256/512/1024px versions. The separate
Asian-elephant icon was not part of this revision.

## Adaptive chart icon resolution — 22 October 2026

The chart previously displayed 187 icons at 128×128 and 30 at 512×512,
regardless of zoom, hover or display pixel density. Both curated objects
and named dust icons now select the smallest sufficient WebP tier using
`max(64, displayedWidth × 1.5) × devicePixelRatio`. Budgeting for hover at
rest avoids a low-resolution first hover frame. Shadow artwork and its
geometry are unchanged. The existing small root WebPs remain compatible
with the shadow renderer and other consumers.

`content/icons/resolutions/` contains 128/256/512/1024 tiers where native
source size permits, plus native-size caps such as 500px. No thumbnail is
upscaled to invent detail. 173 matching source masters were exported;
30 existing 512px icons also have smaller variants. Fourteen legacy icons
remain limited to 128px because their source is missing or differs from
the approved current artwork. `manifest.json` records source provenance,
comparison error, content fingerprints and available sizes.

After replacing any master AND its root runtime WebP, run
`npm run icons:resolutions -- <slug> [<slug>...]`. This refreshes only those
icons; unchanged inputs are cached. `npm run process-icons` refreshes tiers
automatically after its normal full thumbnail export. Avoid running that
full command merely to build tiers: some historical sources differ from
approved runtime art. Use `npm run icons:resolutions` for a safe tier-only
refresh. Selection lives in `src/icon-resolution.js` and `src/assets.js`.

Live Retina/3× checks and screenshots: `docs/icon-resolution-review/`.

## Silkworm moth, discs and shared sphere opacity — 22 October 2026

Silkworm moth now uses a dorsal top view, head upward and ivory wings
spread in the wall plane, matching the insect collection. Artwork and
built-in image-generation prompt are saved under
`content/icons/shadow-candidates/wall-studies/silkworm-disc-shadows/`.

Penny and Voyager Golden Record are discs, not spheres: both use their own
alpha-derived long shadow. Penny was removed from `shadows/round.json`;
the already-scripted Golden Record shadow was refreshed. Keep these discs
out of the shared round group in future classifications.

The shared spherical texture now has an explicit 0.45 runtime layer
opacity in `src/shadow-geometry.js`, shared by chart and studio. This was
reduced from 0.60 after visual feedback to better match the scripted shadows.
Its existing gradient and shape are unchanged; hover still fades it further.
Custom shadow textures keep the existing 0.85 runtime multiplier, because
their individual opacity is already baked into their pixels.

## Insects and microchip: direct top view — 22 October 2026

Ant, bumblebee, ladybug and microchip now face the viewer as specimens
mounted against the wall. Insects show their dorsal surfaces with heads
pointing upward, six legs and two antennae; bumblebee wings spread in the
display plane. The microchip package is square to the screen, with leads
on all four sides. Avoid the old isometric or corner-on camera. Use the
same upper-left illumination and shared scripted long-shadow preset.

Built-in image generation supplied the artwork; alpha normalization and
the existing Canvas renderer supplied the exports and separate shadows.
Masters are 1254px transparent PNGs with about 94% maximum solid extent;
runtime icons are 128px WebPs. Raw outputs, prompts, selected output IDs,
masters, shadows and prior-asset backups are in
`content/icons/shadow-candidates/wall-studies/insect-chip-top/`.
Review all four:
`http://127.0.0.1:5190/?icon=ant&objects=ant,microchip,bumblebee,ladybug`.

## Map-shaped miniatures: front face and TOP thickness — 22 October 2026

User correction: treat the lake outline as the FRONT face of a resin
miniature glued to a vertical wall, not a horizontal slab viewed from above.
The front contour has little or no perspective distortion. Looking from
slightly above reveals a small thickness band along the TOP-facing edge;
the front face hides the bottom sidewall. Do not show a thick underside,
lower fascia or a tabletop/isometric cutaway. Apply this camera rule to
future map-shaped miniatures as well as the general collection style.

Loch Ness was edited accordingly, preserving its diagonal outline, blue
resin material, transparency and existing AI-generated caustic shadow.
Current master, prompt and previous assets:
`content/icons/shadow-candidates/wall-studies/loch-ness-wall-front/`.
The earlier lower-edge-depth wording for the ice/lake batch below is
historical and is superseded by this rule.

## Frontal animals and artifacts — 22 October 2026

Lion, hippo, elephant, Argentinosaurus, Tyrannosaurus rex, Nefertiti,
Voyager Golden Record and the Great Pyramid have been regenerated with
`image_gen.imagegen` for the museum collection presentation. Lion remains
reclining with a frontal face; hippo and elephant have lower, near-frontal
views. The dinosaurs are side-elevation shelf miniatures so the complete
neck/head, body, legs and tail remain readable, with no steep aerial camera.
Nefertiti is frontal and retains her missing left-eye inlay (viewer’s right).
The record is a face-on gold disc with grooves and a center label, rather
than the playback diagrams from its cover. The single pyramid has a
dominant front face, narrow right face, smaller masonry and worn summit.

All eight keep true transparency, 1254px square masters, centered solid
outlines with safe margins, and the approved shared scripted long shadows.
The Asian elephant is a separate icon and was not part of this revision.
Raw outputs, normalized masters, separate shadows, prompts, source links,
selected output IDs and previous-asset backups are in
`content/icons/shadow-candidates/wall-studies/museum-batch-two/`.
Review:
`http://127.0.0.1:5190/?icon=lion&objects=lion,hippo,elephant,argentinosaurus,tyrannosaurus-rex,bust-of-queen-nefertiti,voyager-golden-record,pyramid-giza`.

## Library-wide long shadows — 22 October 2026

The user approved the scripted style and requested replacement of all older
shadows. The bulk generator now uses the exact browser Canvas renderer in
`src/long-shadow.js`, without the old rotation/mirroring algorithm. 98 icons
use the new shadows: 89 older ones migrated and nine recent ones rerendered.
Existing long-shadow settings are retained; older projection/AI shadows use
the approved common preset. Object artwork is unchanged by this operation.

Exceptions remain protected: the three water measures and Loch Ness retain
AI caustics; 26 round subjects retain `_sphere.webp` and the existing round
manifest. 89 screen-blended or black-backed icons are excluded, including
legacy black-hole icons not present in the primary object manifest. Their
obsolete shadow files, if present, are backed up and removed.

Run `node scripts/generate-shadows.mjs --all` to regenerate, or name specific
icons. Add `--dry-run` to list decisions without writing. `--reset-reviewed`
resets only eligible objects to the common long-shadow preset; it never
overwrites the caustic or shared-round exceptions. Chrome/Chromium supplies
the same Canvas blur used by the studio; use `CHROME_PATH` if necessary.
No studio server or AI service is required for this script.

Each run renders everything before replacing assets and keeps previous
WebPs/settings, PNG masters and a report under
`content/icons/shadow-candidates/long-shadow-batches/<timestamp>/`.
To restore one, copy its previous WebP and its previous override entry
together; registration depends on that entry. Review galleries are in
`docs/shadow-studio-review/bulk-long-shadows/`.

## Whole sequoia specimen — 22 October 2026

The sequoia now includes its exposed branching root system: the entire tree
appears uprooted and mounted slightly in front of the wall, like displaying
a whole carrot. Keep this as a woody branching root network, with no soil
block or pot. The crown, trunk and roots fit together inside the usual icon
margin. The regenerated alpha-based long shadow includes the roots and keeps
the shared preset. Object artwork was edited with `image_gen.imagegen`.
The raw image, transparent master, shadow, prompt and previous assets are in
`content/icons/shadow-candidates/wall-studies/sequoia-roots/`.

## Ice and lake miniatures — 22 October 2026

Loch Ness, Greenland and Antarctica now use overhead miniature views, with
subtle relief visible along their lower edges. Loch Ness is the water alone,
as a blue translucent resin casting: no surrounding land block. The ice
sheets have white textured ice surfaces and cool blue relief edges. These
are illustrative miniatures rather than survey-accurate geographic models.

The lake object and its separate violet shadow with lavender caustics were
made with `image_gen.imagegen`. Do not replace those caustics with an alpha
silhouette. Its studio settings are opacity 0.50, scale 0.40, extra blur 0,
distance 0, x/y −15, saved placement enabled, rotation off. The ice sheets
use the shared scripted long-shadow preset below. No object includes a
baked-in cast shadow or background.

Transparent object masters, raw AI output, prompts, separate 768px shadow
PNGs and previous-asset backups are in
`content/icons/shadow-candidates/wall-studies/ice-lake-miniatures/`.
Active 1254px object masters are in `content/icons/src/`; the chart uses the
128px object and 256px shadow WebPs in their usual locations. Review at
`http://127.0.0.1:5190/?icon=loch-ness&objects=loch-ness,greenland-ice-sheet,antarctic-ice-sheet`.

## Shelf batch and scripted long shadows — 22 October 2026

The frontal human, Big Ben and Eiffel Tower now also use the identical
scripted long-shadow preset below. Their object images are unchanged.
Separate shadow PNGs and backups of their previous shadows/settings are in
`content/icons/shadow-candidates/wall-studies/collection-long-shadows/`.
Review these three at
`http://127.0.0.1:5190/?icon=human&objects=human,big-ben,eiffel-tower`.

The new sequoia, Great Sphinx, Titanic and Boeing 747 are installed in the
chart. Sequoia is frontal; Sphinx and Titanic are broadside shelf displays,
with only a slight view of their upper surfaces. The 747 is a symmetric top
view, nose upward, like a model mounted on the wall. These explicit views
override the default frontal view below.

Their shadows are **scripted from transparency**, not AI-generated. Select
“Long wall shadow · from transparency” in the studio. The silhouette sweeps
continuously down-right; blur increases and opacity fades along that sweep.
Maximum coverage prevents overlapping samples from making the shadow darker
merely because more samples were used. This is a graphic approximation for
frontal miniatures, not recovered 3D depth. Water caustics still need separate
artwork; never derive them from the alpha channel.

All four share the same preset: opacity 0.50, length 0.80 object diameters,
gap 0.06 diameters, direction 45°, near blur 1.5px, far blur 18px and full
far-end fade. Blur values refer to a 256px object in a 768px working texture.
The icon and texture centers are registered: `mode: "long"` tells both the
chart and studio to skip the legacy resting offset. Existing independent
hover depth still adds travel, expansion, blur and fading. Saved opacity is
baked into the texture once; runtime applies the common 0.85 shadow opacity
and hover fade. No special per-object corrections are required.

Object masters remain 1254px square, with their longest solid extent about
94% of the canvas, and export to 128px WebP. Separate shadow masters are
768px transparent PNGs, exported to the chart's 256px WebPs. Raw generation,
prompts, normalized objects, shadows and backups are in
`content/icons/shadow-candidates/wall-studies/shelf-long-shadows/`.
The objects were generated with `image_gen.imagegen`. Their original assets
and settings are preserved in that folder's `previous-assets/` directory.

Review all four:
`http://127.0.0.1:5190/?icon=titanic&objects=sequoia,great-sphinx,titanic,boeing-747`

Implementation: `src/long-shadow.js`; tests:
`node --test scripts/long-shadow.test.mjs`. The shared round shadow and
previously approved water settings are unchanged.

## Current default style — frontal miniature collection (22 October 2026)

This is the user's latest direction. It supersedes earlier isometric,
3:1-slope, corner-on, steep overhead, and floor-shadow guidance for new work.

Imagine a miniature collection in a museum, or an insect display on a wall
directly in front of the viewer. Objects appear attached a little distance
off that wall, or sitting on an invisible shelf slightly below eye level.
This describes their presentation: do not draw pins, glue, shelves or cases.

- **Head-on front shots:** no horizontal rotation by default. Very little
  perspective, like a long-lens photograph of a small souvenir. Look gently
  downward so only a little of the top surfaces is visible. Avoid street-level
  upward views, steep aerial views and three-quarter isometric angles.
- **Upright geometry:** front platform edges are level; symmetrical subjects
  are balanced about their centerline. Big Ben shows one centered clock face
  and no side facade. Eiffel has a centered arch and matching front feet.
- **Pose and detail:** retain recognizable structure and natural anatomy.
  The human keeps his seated meditation pose. Inspect hands and jewelry at
  full size; a camera update does not require changing a suitable pose.
- **Light:** consistent soft upper-left/front illumination, readable material
  detail and contrast, darker right-facing relief and undersides, restrained
  purple ambient bounce suited to the chart.
- **Wall shadows:** the receiver is a vertical wall behind the object.
  Shadows fall down-right and retain upright frontal profiles, with soft
  penumbrae. Do not flatten them into long shadows on a horizontal floor.
- **Separate layers:** object and cast shadow are separate transparent images.
  No wall, floor, shelf, horizon, scenery or cast shadow in the object cutout.
  The app supplies the background and positions the shadow.
- **Shared settings:** standardize source framing, shadow registration,
  strength and softness so one preset works across a family. Use approved
  composites as references instead of requiring individual slider corrections.
- **Hover:** the object approaches the viewer with its center fixed; the
  shadow moves farther down-right, grows, softens and fades. Object growth
  follows camera perspective; shadow motion follows light/wall geometry.

Keep square 1254px transparent PNG masters: about 95% solid extent for round
subjects, 90–95% on the longest side for other subjects, centered with at least
about 25px clear margin. Measure alpha above 25%, excluding faint glow.

Current implementation: `/Users/avsa/Dev/Triangle`. Active object masters:
`content/icons/src/`; active shadows: `content/icons/shadows/`. References:
`content/icons/shadow-candidates/wall-studies/cube-head-on-study.png`, and in
that folder's `collection-front/`: `big-ben-square-on-object.png`,
`eiffel-square-on-object.png`, and `human-object-corrected.png`.
Saved presets are in `content/icons/shadows/overrides.json`.
Older assets remain historical references; this default applies to future
generation and requested revisions, not an automatic replacement of all icons.

## User-supplied long-shadow references — 22 October 2026

Five reference screenshots are preserved unchanged in
`content/icons/shadow-candidates/wall-studies/long-shadow-references/`:
soft white tile, green lettering, wooden punctuation, orange tile, wooden X.
These are user-provided design references, not production assets; retain
their original markings and watermarks.

What the references demonstrate for future shadow work:

- A common upper-left light direction, with shadows extending diagonally
  down-right (roughly 45 degrees in screen space).
- A coherent shadow extending from behind the object, rather than reading
  as an unrelated displaced duplicate. The silhouette and intervening shadow
  communicate the object's depth relative to the receiving surface.
- Stronger, more defined shadow near the object, with increasing softness
  and/or fading toward its far end. Some examples are deliberately hard-edged
  graphic treatments; others are soft physical-looking casts.
- Shadow color relates to the background. For Triangle, judge the result on
  the actual purple chart, not only against white or transparency.
- The wooden examples demonstrate frontal textured miniature objects with
  dimensional relief and soft cast shadows. The lettering/tile examples
  demonstrate consistent direction and clean shadow shapes. These are
  complementary references, not a request to flatten every object into a logo.

Retain the frontal museum-collection camera and vertical-wall interpretation.
Use these references when revising shadow generation; do not replace approved
assets or change hover behavior solely because references were supplied.
For volumetric subjects, infer the cast from their depth and pose rather than
mechanically extruding every pixel by the same amount.

## Studio usage

Run `npm run shadow-studio`, then open http://127.0.0.1:5190.
Use `SHADOW_PORT=5191 npm run shadow-studio` if that port is occupied.

Choose an object, compare its current chart shadow with the live replacement,
and adjust footprint depth, height projection, width, softness, fade, strength
and position. Soft footprint mode provides an ellipse when a projected outline
is misleading. Check 96/128/180 px sizes and hover lift. Save writes the existing
`content/icons/shadows/<file>.webp`, so the chart consumes the change without new
rendering code. Refresh the chart or rebuild after saving.

The preview and chart import the same image geometry from
`src/shadow-geometry.js`, including hover movement, scale, opacity and blur. It does not simulate chart neighbors or label collisions.

The editor suggests settings from the icon's proportions and subject name and
flags likely tall/volumetric cases for review. These are heuristics, **not an AI
visual quality judge**. A person or an agent must inspect both previews and
decide whether the replacement looks right. The replacement is an approximate
2D projection, not a recovered 3D scene. Icons themselves are never modified.

## Review workflow for future sessions

1. Start the editor and open `/?icon=<icon-file-name>`.
2. Inspect both previews, including hover and chart-size rendering.
3. Keep acceptable originals. For a bad shadow, adjust the projected silhouette
   or use a soft footprint; inspect again before saving.
4. Save only reviewed replacements. Capture the before/after state first if a
   review record is useful. Existing examples are in `docs/shadow-studio-review/`.

First reviewed corrections: big-ben, sequoia, elephant, hippo, argentinosaurus,
tyrannosaurus-rex, hoba. These replace oversized reflected profiles with softer,
more compact animal/rock footprints and down-right tall-object projections.

## Persistence and recovery

Settings and review status live in `content/icons/shadows/overrides.json`.
First-save originals are preserved under `content/icons/shadows/originals/`.
Saving removes a per-object override from `round.json` if necessary, allowing
the individual shadow to take precedence over the shared sphere.

Bulk and explicit generation now use the approved long-shadow renderer;
see the library-wide section above for protected exceptions and recovery.
To restore a backup, restore both its WebP and matching override entry.

The app binds to loopback and accepts saves only from its own origin with a
request header. It validates icon names against existing assets and validates
the shadow canvas dimensions. It is a local single-user editor, not a hosted
service. No API key or image-generation service is required.

Screen-blended categories and comets are excluded from the editor and from
explicit generator requests as well as bulk generation. Unclassified artwork
with opaque black corners is also excluded. The save endpoint enforces the
same rule; water and opaque objects remain eligible. Eligibility is cached
for the server lifetime; restart after replacing source artwork.

## Flat-surface base anchoring

Enable “Anchor at base · flat carpet” for towers and other upright objects.
The anchor uses the bottom solid row and the horizontal center of opaque pixels
in the lowest 8% of the subject. Higher parts project down-right from that base.
The saved `anchorBase` flag tells the chart to omit its old center-based offset,
keeping contact aligned at different display sizes. Hover adds a small detached
offset. Defaults suggest this mode for tall subjects; saving applies it.
Reviewed base-anchored versions: Big Ben, Eiffel Tower, Burj Khalifa and sequoia.

## Low-relief surfaces

“Low relief · preserve outline” translates the original alpha footprint without
mirroring or height projection. At defaults it retains original width/depth,
uses a uniform blur and opacity, and offsets equally down/right (20 working
pixels, or 10px at a 128px icon). This is the preset for Hoba, lakes, glaciers
and ice sheets. Flat-surface placement omits the chart’s old center offset;
reviewed shadows therefore stay close to the object. Sixteen such assets were
reviewed and saved; contact sheet: `docs/shadow-studio-review/low-relief-contact.png`.

## Floating animals

Animal suggestions anchor projection at the lower feet region rather than
the middle of the body, with equal down-right offsets of30 working pixels
and a softer projected body silhouette. The gap suggests elevation above
the carpet; it is an artistic setting, not a calibrated distance in meters.
Ten reviewed animals saved: elephant, Asian elephant, hippo, Argentinosaurus,
T. rex, lion, naked mole-rat, hedgehog, cane toad and meerkat.
Review: `docs/shadow-studio-review/animal-feet-contact.png`.

Round objects listed in `round.json` keep the original shared `_sphere.webp`,
including its strong contrast and increasing blur/fade. The editor displays
that exact asset in both previews and disables individual edits and saves.
The save API also rejects individual round-object overrides.

## Visual review decisions

User prefers Eros’s original `content/icons/shadows/eros.webp` over the studio’s
proposed replacement. Keep the original. It has not been overwritten and has
no override entry. Treat the right-hand procedural preview as an unapproved
suggestion, not a replacement or an improvement.

## Custom generated candidates

`content/icons/shadow-candidates/<icon>.png` contains AI-generated shadow-only
artwork inferred from the object references, not the procedural alpha projection.
When present, the right preview selects “Custom generated candidate.” Scale,
position and strength controls register that artwork without changing its shape
or applying a uniform replacement blur. Current chart shadows remain on the
left and unchanged until Save. Raw prompts and provenance are in
`content/icons/shadow-candidates/generation-record.json`. Water candidates include
lavender caustic light. Initial set: three water quantities, Big Ben, Burj
Khalifa, elephant, hippo and Titanic. These are visual candidates, not
physically simulated ray-traced solutions.

## Applied generated shadows (22 October 2026)

The three water quantities, Big Ben, Burj Khalifa, elephant, hippo, Titanic,
and seated meditating human are now saved to the chart on `gen3-icons`.
Their `overrides.json` entries have `source: "imagegen"`, `reviewed: true`,
and `anchorBase: true`. The shared round shadow and Eros remain unchanged.

To reproduce the result, load the raw candidate in the studio and use its saved
scale, x/y and opacity values. The legacy-named `flipY` setting actually turns
the candidate clockwise 90 degrees; it is used for elephant, hippo and Titanic.
The human candidate was generated for the actual seated, cross-legged pose and
needs no turn. Do not substitute a standing-human silhouette.

Save draws this registered artwork onto a transparent 768×768 canvas, then
exports a 256×256 WebP. Its canvas spans three icon widths. Shape, progressive
blur and water caustics are baked into the pixels. The chart must centre that
canvas on the icon when `anchorBase` is true, without the legacy centre-based
shadow displacement. Do not reapply the studio's scale, x/y, rotation or opacity
in the chart: those are already baked in. The chart applies its normal overall
shadow opacity and hover displacement separately. Both curated and dust icons
read the same anchor setting through `SHADOW_SETTINGS_BY_SLUG`.

The later library-wide migration supersedes preservation of old reviewed
opaque-object shadows. Caustic and shared-round exceptions remain protected.
First-save backups are in `content/icons/shadows/originals/`.
The separate sphere shadow remains a reference in `floor-studies/`; it has not
replaced the shared planet texture. The saved-preview contact sheet is
`docs/shadow-studio-review/implemented-shadows.png`.

## Current experiment: wall behind the objects

This supersedes the earlier floor-based hover behavior. The background is a
poster parallel to the screen. Hover moves the object toward the viewer, away
from the poster. Its centre stays fixed while its shadow grows, moves farther
down-right, becomes blurrier and fades. `src/shadow-geometry.js` is shared by
chart and studio, so the two previews use identical image placement.

The original shared sphere texture is the visual reference. Resting displacement
is 85% of the first wall study's distance. `WALL_SCENE` models observer distance
and light projection separately, in resting object diameters. Apparent object
scale k is converted to depth z = observerDistance × (1 − 1/k). That depth is
then projected onto the wall using the light's distance and angle, rather than
multiplying shadow position or size by k.

Current tuning: observer distance 3 diameters, resting wall gap 0.5 diameters,
light distance 8 diameters, light slope 0.8. At 1.5× object size, the shadow grows
only 1.154× and travels about 1.05 resting object diameters farther down-right.
The observer distance is absent from `wallShadowAtDepth`: for a fixed depth,
changing the viewer cannot change the shadow. Blur and fade depend on depth.
Registered older artwork retains its baked placement; image and fallback
shadows use the same light-driven travel. Fallback ellipse blur also grows with
its bounds.
Stars' emitted light and noninteractive dust-dot shadows are separate effects.

The cube and all three water shadows have been regenerated for the wall. The
water textures include projected lavender caustics. Existing human artwork still
depicts its earlier floor projection, pending a request to regenerate it.
The cube is a study, not a replacement for an existing chart icon.

Open `/wall-study` in the studio for the cube's resting/hover comparison.
Its transparent shadow and source cube are in
`content/icons/shadow-candidates/wall-studies/`. The prompt records the original
`content/icons/shadows/_sphere.webp` as its style reference, not the newer sphere
floor study. Artwork was generated using the built-in imagegen tool.

### Water wall artwork

The droplet, bowl and tank use centered generated wall textures at scale 0.42,
x/y zero, opacity 1, no rotation, and `anchorBase: false`. This selects the same
wall displacement as the reference study and shared sphere. Their previous floor
PNG candidates and saved WebPs are backed up in `shadow-candidates/floor-studies/`.
The new transparent PNG masters and full imagegen prompts/provenance are in
`shadow-candidates/wall-studies/`. The study's object selector includes all three
and renders the saved chart WebPs using the shared geometry. These contain both
dark translucent regions and lavender caustic light, and must not be recolored
to black or composited with multiply.

### Head-on tank and household bowl

The approved head-on tank and a matching one-liter fishbowl now replace the old
object artwork as well as their shadows. Each uses a separate object-only PNG
and shadow/caustics-only PNG generated with imagegen; projected light is not
baked into the object. The tank has thick structural glass and dense refraction;
the bowl has a thinner rolled rim, a visible air gap and meniscus, sparse small
bubbles and fine glass surface detail. The droplet retains its smooth appearance.

Active source objects are `content/icons/src/1-tonne-of-water.png` and
`content/icons/src/1-liter-of-water.png`, normalized to 1254 square with about
95% solid-pixel coverage on the longest axis and clear margins. Their 128px
WebPs are used by the chart. Paired masters are `tank-head-on-object.png`,
`tank-head-on-shadow.png`, `fishbowl-head-on-object.png` and
`fishbowl-head-on-shadow.png` in `shadow-candidates/wall-studies/`.
Raw generation prompts are recorded in `head-on-water-layers-record.json`.
Previous active assets are backed up in that directory's `previous-assets/`.
The candidate aliases and saved 256px shadow WebPs use the existing centered
wall registration (scale 0.42, no base anchoring). The tank and bowl use
x = -90 and y = -125 in the 768px studio canvas to reproduce the approved
composite studies: caustics overlap behind the lower-right edge instead of
forming a detached second object. These corrections are baked into the saved
WebPs and therefore apply identically in the chart and wall-study preview.
The droplet retains zero x/y. The object and
shadow continue to animate independently using the wall geometry model.

### Frontal collection: human, Big Ben, Eiffel Tower

On 22 October the user requested objects as a collection in front of the
viewer, slightly below eye level. This supersedes the steep 3:1 isometric
view for these three icons. Human retains the bald, grey-bearded man's
cross-legged meditation pose, bare torso and brown trousers;
lighting now comes consistently from screen upper-left. Eiffel was further
corrected to a front-facing souvenir on an invisible shelf: zero horizontal
yaw, symmetric main arch and front feet, level platform edges, very weak
perspective and a gentle downward view. No shelf is drawn. Its latest masters
are `eiffel-square-on-object.png` and `eiffel-square-on-shadow.png` in
`collection-front/`, with prompts in `eiffel-square-on-prompts.json`.
The earlier three-quarter Eiffel version is superseded. The user clarified
that Big Ben must be exactly head-on like the cube: zero horizontal yaw,
one centered clock face, no visible side facade, and a slightly downward
view of a miniature on the wall. `big-ben-square-on-object.png` and
`big-ben-square-on-shadow.png` in `collection-front/` supersede the earlier
three-quarter version. Prompts are in `big-ben-square-on-prompts.json`.

Human detail correction: the user flagged fused fingers and malformed
necklace pendants. The active version has relaxed overlapping hands in the
lap with touching thumbs and one continuous wooden-bead necklace, without
pendants or tangled strands. Preserve anatomical hand structure in future
edits and inspect at full size before installation. The corrected master
is `collection-front/human-object-corrected.png`; the edit prompt is in
`collection-front/human-detail-correction.json`. The outer seated silhouette
and shared shadow settings are retained.

Follow-up: the user caught a remaining malformed lower finger. A second
targeted hand edit replaces the double-ended appearance with a single nail
and fingertip at the screen-left end, connected continuously to the lower
palm. Inspect hand anatomy even when it will be tiny in the chart: viewers
notice these defects first. Latest retained master is
`collection-front/human-lower-finger-corrected.png`; active human aliases
are updated. Prompt: `collection-front/human-lower-finger-repair.json`.

New object and shadow artwork was generated separately with built-in
imagegen. Shadow shapes were inferred from the objects' volume as upright
projections on a vertical wall, not flattened floor silhouettes. Raw and
normalized masters, generation prompts, and previous versions are in
`content/icons/shadow-candidates/wall-studies/collection-front/`.
Active sources are `content/icons/src/{human,big-ben,eiffel-tower}.png`,
1254-square transparent PNGs with about 94% solid height and clear margins.
The chart uses their 128px WebPs and separate 256px shadow WebPs.

All three share the same studio preset: opacity 0.50, extra blur 8,
distance 0, shadow size 0.40, x=-45, y=-65, anchorBase=false, flipY=false.
The generated shadow masters use a consistent centered canvas and about
89% coverage including faint edges. Values are baked once on save. Existing
wall hover geometry remains unchanged; user-approved water settings remain
unchanged. This establishes a common preset for this opaque-object family.

Review together at `/?icon=human&objects=human,big-ben,eiffel-tower`.
The `objects` query parameter limits the studio's list and Next button to
the requested names. The contact sheet is
`docs/shadow-studio-review/collection-front-review.png` (rest above, hover below).

### Water color and placement

For user tuning, open `/?icon=1-ml-of-water&search=water` to list just the
three water objects. Generated artwork supports Opacity, Extra blur, and
Shadow distance (negative = closer, positive = farther along the down-right
light direction), plus size and separate x/y corrections. Extra blur and
distance default to zero so older saved artwork does not change. Both are
baked into the saved shadow texture, like opacity; do not apply them again
in the chart. Click Save shadow to chart before switching objects to retain
the selected settings. The Current chart shadow preview remains unchanged
until Save is clicked.

The approved 1 ml droplet is the color reference: deep violet shadow with
selective pale lavender caustics, not an evenly luminous lavender shape.
An initial opacity-only reduction to 0.6 was superseded by regenerated bowl
and tank artwork matching that reference. The user then tuned all three
in the studio; the approved settings below supersede earlier calibration.
The runtime applies its normal 0.85 multiplier and depth fading on top of
the baked texture, without reapplying the studio settings.

#### User-approved water settings — 22 October 2026

| Object | Opacity | Extra blur | Distance | Size | X | Y |
| --- | --- | --- | --- | --- | --- | --- |
| 1 ml droplet | 0.70 | 0 | -70 | 0.50 | 0 | 0 |
| 1 tonne cube | 0.50 | 0 | 75 | 0.45 | -90 | -125 |
| 1 liter bowl | 0.50 | 0 | 109 | 0.45 | -90 | -125 |

All use generated artwork, anchorBase=false and flipY=false. The four
slider values came from the user's three screenshots, in droplet / cube /
bowl order. X/Y retain the prior registration. Values are saved in
`content/icons/shadows/overrides.json` and baked into the active WebPs.

Future generation requirement: shadows should work with a shared preset,
without individual fine tuning. Standardize source-canvas coverage,
registration relative to the object, dark-shadow strength and caustic
brightness against these approved composites before installation. Match
the shared light direction and wall model. Do not simply assign identical
slider values to differently framed raw assets: that would change the
approved appearance. These current per-object values remain the reference
until the source artwork is normalized for a common preset.

Latest masters: `wall-studies/1-liter-of-water-drop-color-match.png` and
`wall-studies/1-tonne-of-water-drop-color-match.png`. Candidate aliases and
saved chart WebPs are updated. Earlier head-on shadow masters are historical.
Built-in imagegen prompts and refinement passes are recorded in
`wall-studies/drop-color-match-prompts.json`. Previous active assets are in
`wall-studies/previous-assets/*-before-drop-color-match.*`.

Studio and wall-study default to #433193, sampled from the live chart in the
water region with the shadow layer hidden. The chart is a varying background,
so this is a local reference color rather than a global replacement. The
opacity comparison is in docs/shadow-studio-review/water-opacity-comparison.png.
## Saturn: generated globe and ring shadow — 22 October 2026

Saturn uses a custom AI-generated wall shadow, based on its existing image
and the original shared sphere shadow. Preserve the globe's dark near edge
and fading, progressively softer far edge, plus the rings' projected shape
and open gaps. This is not an alpha-sweep shadow. The planet image is unchanged.

The raw transparent candidate is `content/icons/shadow-candidates/saturn.png`.
The prompt, PNG master, rest/hover preview and previous assets are archived in
`content/icons/shadow-candidates/wall-studies/saturn-ring-shadow/`.
Built-in image generation was used. The installed shadow is
`content/icons/shadows/saturn.webp`; its studio settings use `mode: generated`
and `registered: true`, so chart and studio honor the same centered canvas
without adding a second legacy offset. Opacity is baked at 0.53 before the
custom layer multiplier of 0.85, approximately matching the 0.45 shared shadow.

`CUSTOM_AI_SHADOWS` protects Saturn from scripted batch regeneration,
including `--reset-reviewed`. Adjust its candidate in the studio when needed.

Position correction: compare Saturn's globe with an equally sized spherical
planet, not its full ring span. The generated candidate's placement is now
x=55, y=76 on the 768px studio canvas (previously 35,40), scale 0.42 and
opacity 0.53 unchanged. This moves the central umbra down-right to match the
shared sphere's resting separation. See `alignment-comparison.png` in the
same archive for the old placement, corrected placement and Jupiter reference.

## Illustration refresh batch — 22 October 2026

The approved backlog produced 40 refreshed illustrations and seven new ones:
14-bis, helium party balloon, weather balloon, near-burst weather balloon,
hot-air balloon, Zeppelin NT and soap bubble. All are installed in the chart.
The complete per-object status is in `docs/illustration-refresh-queue.json`.
Review them at `/tools/illustration-refresh-review.html`, with a search field,
shadow toggle, rest/hover comparison and links to each object's studio controls.

Preserve the user's exclusions: no second elephant, rocket refresh, Burj Khalifa
refresh, 1 ml droplet change, microorganism refresh, soccer ball change, Eros or
Bennu change. Stars, atoms, particles and the remaining space illustrations
were left alone during this batch. Rodina Glacier remains unresolved.

The image service blocked four sculpture generations: Manneken Pis, the Little
Mermaid, Venus of Willendorf and Venus de Milo. These are explicitly marked
`generation-blocked`; previous artwork was retained wherever it existed.
Do not describe them as completed or silently substitute unrelated figures.

### Artwork, framing and shadows

Use the wall-mounted miniature style: front-facing contours with minimal
perspective and a little visible depth along the top. Animals face left in
profile, ships and ground vehicles are side views, aircraft and winged insects
are top views. The approved Titanic, 747 and Loch Ness remain style references.

All 47 installed masters are transparent 1254×1254 PNGs, with their longest
solid dimension about 92% of the canvas and at least 25 px of clear margin.
The chart has 128, 256, 512 and 1024 px WebP exports. Generation prompts, raw
results, source outlines, sizing checks and previous assets are archived in
`content/icons/refresh-2026-10-22/`. Do not overwrite those previous assets.

Thirty-six opaque/non-lake objects received scripted long wall shadows from
their final alpha masks. Eleven lakes received separate AI-generated caustic
layers. These lakes are now protected by `CAUSTIC_SHADOWS` in the batch shadow
generator, alongside the approved water objects and Loch Ness. Saturn retains
its separate AI-shadow protection.

The eleven new lake candidates share one normalized preset: generated mode,
registered=true, anchorBase=false, flipY=false, scale=0.4, opacity=0.5,
extra blur=0, distance=0, x=88, y=88 on the 768 px studio canvas. These values
are baked into the installed 256 px shadows. The chart's existing depth,
opacity and southeast parallax compensation still apply at runtime.
`scripts/install-lake-caustics.mjs` reproduces the export; don't apply its
opacity or registration a second time in the renderer.

### Lake outline provenance

Caspian Sea, Dead Sea, Baikal, Superior, Tahoe, Victoria, Sea of Galilee and
Titicaca use generalized 1:10m outlines from
[Natural Earth](https://github.com/nvkelso/natural-earth-vector), public domain.
They are shape references, not current surveys of changing water levels.

The remaining outlines are © OpenStreetMap contributors, ODbL, retrieved
22 October 2026: [Lake Nyos](https://www.openstreetmap.org/way/23126844),
[Hallstätter See](https://www.openstreetmap.org/relation/21485), and
[Königssee](https://www.openstreetmap.org/relation/56916).
Their GeoJSON, SVG and PNG references and source metadata are saved in
`content/icons/refresh-2026-10-22/outlines/`. Use these actual outlines for
future revisions instead of asking the image model to invent the coastline.

Browser review captures and the runtime mapping check are in
`docs/illustration-refresh-review/`. The check covers all seven new chart
entries, high-resolution selection, hover controls and a 390 px viewport.

### Neutron star follow-up

At the user's subsequent request, removed both polar jets from the neutron-star
icon using built-in imagegen. The blue-white sphere and compact rim glow remain,
with transparent 1254 px master and 128/256/512/1024 px chart exports. Removed
the old 2.5× icon multiplier, which existed only to compensate for the beams.
The prompt, generated result and previous artwork are archived in
`content/icons/refresh-2026-10-22/neutron-star-no-jets/`. This is an explicit
exception to the earlier instruction to leave star illustrations untouched.

## Review follow-up — 22 October 2026

- Halved all parallax displacement coefficients: dust 1 px, labels/grid 2 px,
  icon 0.14 body lengths, hover contribution 0.10. The relative per-object depth
  variation remains 12%. This changes camera parallax, not hover magnification
  or the independent wall-light projection.
- The star-shine study now has a normal-blend opaque black disc between each
  light pool and star image. Disc sizes follow the visible body (Sun 86%, red
  dwarf and brown dwarf 94% of image width), grow with hover and hide with
  Show stars. Star surface colors screen against black; outer transparent
  regions still reveal the wall and light pool. Chart star lighting is unchanged.
- Eleven refreshed lake shadows moved from x=y=88 to x=y=30 on the studio's
  768 px canvas, preserving scale 0.4, opacity 0.5 and the existing caustics.
  This supersedes the earlier lake placement. Do not change the approved
  droplet, bowl or Loch Ness settings to match this adjustment.
- Soap bubble now uses a separate AI optical layer with a transparent center,
  delicate violet shading and luminous arcs. It uses the same closer preset
  as the lakes and is protected from scripted silhouette regeneration.
- Everest now has a substantial fractured-rock base. Its cut is illustrative;
  the inherited chart mass has no documented footprint or basal surface.
  The description and data note disclose this; no numeric mass was changed.
- The Eois illustration was reconstructed from the LEFT/dorsal specimen in
  the user's photo, matching the existing chart icon's source. Preserve the
  photo's markings rather than borrowing the ventral view. The photo caption
  says Eois ewa while the existing chart label is Eois stantonae; this edit is
  not a taxonomic determination. The original photo and the old chart master
  are retained, and the new image is an AI reconstruction, not recovered detail.
- Venus of Willendorf and Venus de Milo are omitted at the user's request.
  They are no longer pending or shown as blocked in the refresh gallery.

Prompts, original Eois reference and previous assets are in
`content/icons/refresh-2026-10-22/review-followup/`. New installed masters are
`content/icons/src/mt-everest.png` and `content/icons/src/eois-stantonae.png`;
the optical candidate is `content/icons/shadow-candidates/soap-bubble.png`.
The soap-bubble export is reproducible with
`scripts/install-soap-bubble-caustics.mjs`. Browser captures are in
`docs/illustration-refresh-review/followup/`.

### Lake material study: darker glass with sparse light

The user rejected the broad lavender caustic webs: thick blue resin/glass should
read primarily as a shadow, with only one or two localized pale light patches.
Two AI studies (Hallstätter See and Victoria) are saved under
`content/icons/shadow-candidates/lake-resin-study/`, with full prompts, raw
transparent outputs, normalized candidates and registered 768 px layers.
Both use scale 0.4, opacity 0.5 and x=y=30, matching the current closer preset.
The comparison is `/tools/lake-resin-study.html`, with current/proposed columns,
a Show lakes checkbox to inspect the shadows alone, and hover comparison.
These are studies only: active chart shadows have not been replaced. The
proposed shadows have clearer contours and much less luminous area; assess
edge softness as well as sparse highlight placement before adopting widely.

The user liked the darker glass treatment but found the study shadows too far
away. The proposed column now translates the optical layer northwest by 15%
of the resting image width on each axis, relative to the previous preview.
This reduces the combined baked registration and chart bias from about 22%
to 7% per axis. Scale, opacity, caustics and hover separation are preserved.
The current column remains unchanged for comparison. The translation is in
the preview rather than the PNG; carry it across when installing these layers
(equivalent resting registration x=y≈-8 instead of 30 on the 768 px canvas,
with the chart's usual +10% southeast bias).
