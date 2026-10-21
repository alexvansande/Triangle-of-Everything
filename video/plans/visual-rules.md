# How the narrated videos look: the author's rules

The decisions behind the camera, cutaways and audio of the shorts, each from the
author's own feedback while reviewing them (2026-10-21). Read this before changing a
scene (`src/narration-scenes/short-0*.js`) or adding cutaways. The plan of where
cutaways could go is `cutaways.md`; this file is the *why*.

## 1. The chart comes first

- If something can be shown **on the chart** (a highlight, an arrow, a camera move onto
  an object's icon, an animation such as the star's core and outer layers), do that
  before any photo or diagram.
- A stretch where the camera holds but the chart is **animating** (a star swelling and
  shrinking, arrows drawing, a window closing) is not dead time. Don't put a cutaway on it.

## 2. Camera

- **Never open on a static frame.** Start with a slow push in (10–14 s) towards where the
  story begins (e.g. towards the human, or the microchip-to-pyramid view).
- **No full zoom-outs in the middle of a video** ("the second edge", "those two lines",
  the end of video 4 used to jump to the whole triangle). Frame the part being talked about.
- **Animations start where the thing already is.** A transition picks up from the current
  state on screen (the split starts from the star mid-swell), never jumps to a new spot.
- **Check every arrow against the physics on the chart**: an arrow from a cloud to the stars
  it makes must go from more mass to less (the stellar nursery is heavier than the
  protostar; the generic "Nebulae" dot was not).
- **Show the real things, not the abstract line.** Black holes: frame the real ones on the
  Schwarzschild line (stellar, Sgr A*, M87*, TON 618), not the whole line.
- **Zoom in close enough** to see the objects and their catalogue dots (the Eiffel Tower,
  the pyramid, ships, statues; scenes can target catalogue dots by name: `{ obj: "Titanic" }`).
  Gas giants: close enough to see the other giant planets' dots around Jupiter and Saturn.
- **Replace long holds with slow moves** (a 3–7 s pan or push between the objects being
  named), e.g. Mercury → Mars → Earth for atmospheres, a push onto Phobos and Deimos.
- **The background painting stays on**, even blurred, on deep zooms (an automatic fade-out
  was tried and rejected; `bgFadeDeep` is off). It's 8192 px over the whole chart, so in
  the top right (cosmology), keep shots at ~4 decades across or wider.
- **Axis rulers** show in-between ticks (10 kg, 100 kg… and 2×/5× when zoomed in), in every video.

- **Clean shots when the author asks for them**: a cue's `labels: false` hides every piece of
  chart text (object, band and path names) until a later `labels: true`; `quiet: true` on a
  camera move keeps the unit rulers off. Used for "Here be dark matter?" and the closing
  zoom-out of video 4 to the bare triangle.
- **Diagrams on the chart beat cutaways**: video 4's dark-matter search draws the figure from
  `docs/img/dark-matter-constraints.svg` on the chart itself (hatched "ruled out by…" areas,
  the candidates as questions), not as a picture.
- **Axis talk shows the real axes**: mass on the right (as in the map), size along the bottom,
  with the numbered rulers pinned while they're named.

## 3. Photo cutaways: when, and which

Mechanics: `{ at, photo, caption: "what · who · when", obj, dur, fit, kb, focus, place }`
in a scene (see `src/narration.js`, "photo cutaways"). Photos in
`public/narration/photos/`, credits in `video/photos/CREDITS.md` (they go in each video's
description).

- **Only when a real image adds what the chart can't**: living things and structures
  (the blue whale, the sequoia, the Eiffel Tower's lattice), the black-hole images
  (M87*, Sgr A*), deep fields (eXtreme Deep Field), the microwave background.
- **No cutaway for objects whose icon is already on screen**: planets, moons, the small
  moons (Phobos, Deimos), Jupiter and Saturn, the atmospheres talk. A slow move onto the
  icons instead.
- **Nebulae and galaxies: a round window on the chart** over the object's dot
  (`place: 0.7–0.86`), growing out of it, the chart still around it (the stellar nursery
  with the Pillars, Andromeda, SMACS 0723, the Crab as a supernova remnant). The author
  likes these best.
- **Only real photographs**: telescope, spacecraft or camera images, never artist's
  impressions or 3D renderings (the Laniakea "map" was dropped for this).
- **Not busy**: no comparison figures with panels and text (Gliese 229B was dropped).
- **Not just loosely related**: no Crab Nebula for "neutron star" (it only contains one).
- **High resolution**: originals from Wikimedia at up to 3600 px, so a push-in (Ken Burns,
  `kb`) can go deep; small originals (under ~1000 px) get only a gentle push.
- One cutaway at a time; 3–6 s; caption at the top, the karaoke captions stay at the bottom.
- **Pick images that work vertically** (9:16): a subject that stands up (the whale's tail
  fluke) beats a wide one (whales from the air). Keep good wide images for a future
  horizontal version (`blue-whale.jpg`, noted in `video/photos/CREDITS.md`).

## 4. Diagrams (next)

White lines and dots on black, the key word in yellow, no more than three moving parts,
4–8 s, handing back to the chart on the next camera move. Ideas in `cutaways.md`
(the pixel grid for expansion, the cube law, degeneracy, the two horizons…).

## 5. Audio and captions

- Voice treatment: `enhance.py --plain` (high-pass + loudness only) for the Boya office
  recordings; the full chain sounded boxy. All takes at 1.1×.
- **After every edit, re-check the cut for false starts, repeated words, ums, coughs and
  clipped word ends**: transcribe each clip with a filler-friendly prompt and compare with
  the expected text (`stutter.py`-style), and look at the energy around each cut point.
- **Don't cut inside joined-up speech**: if a word runs into the next one ("surprising to
  think about it"), keep the phrase whole rather than cut between them.
- Captions are transcribed clip by clip (long-form Whisper drops words at joins); remove
  Whisper's inventions in silences ("Thanks for watching", "See you soon").
- Fact-check every new recording (see the repo's CLAUDE.md).

## Open

- Video 2's "from lumpy to round" row (Hyperion → Vesta → Ceres → Pluto) is still a
  cutaway although those objects have icons; kept for the size-ordered comparison, the
  author hasn't ruled on it yet.
