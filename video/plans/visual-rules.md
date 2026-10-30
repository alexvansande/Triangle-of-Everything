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
- **The camera never stands still** (2026-10-23): outside the set pieces that explain a step
  (video 2's millilitre → litre → tonne), it's one slow glide of pans and zooms, waypoints
  at their cue times (`cam: { …, glide: true }`), not flights that stop at each object.
  A pan up the line runs a bit over two decades wide on a phone frame (1.5 for the animals,
  so catalogue pictures like the lion find room), never with dives or close-up stops.
- **Named objects get a halo, not a hover**: a lavender glow behind the picture (two overlay
  passes; one fainter plain pass in Safari) for a few seconds; with only one object named,
  the dashed guides to its mass and diameter too. While a step is explained, a cue's
  `focus: [names]` fades every other object.
- **Two pictures never overlap** (2026-10-24) unless a scene asks for it (`forceIcons`,
  e.g. Venus behind Earth): the less important one gives way, named ones included. The
  videos' picture density is a little over standard (60), so pictures keep clear room
  around them; a scene's `alsoIcons` puts pictures first without forcing them. Real space
  photographs take room before generated pictures.
- **Pictures sized by what they show** (author, 2026-10-28): galaxies and nebulae are the
  chart's best pictures (real photographs, soft-edged), particles are small abstract glyphs.
  One smooth curve over log size (`iconSizeCurve` in `src/main.js`, two logistic steps) on
  top of the old sizing: particles (quarks, leptons, bosons, protons; under ~1e-11 cm) 0.5×,
  atoms and x-rays ~0.9×, everyday things, light from UV to radio, planets and stars ~1×,
  supergiants 1.1×, planetary nebulae 1.5×, nebulae 1.7–1.8×, globular clusters 1.95×,
  galaxies 2.1–2.2×, clusters and up 2.3×. The site's map too. A glow's room from its
  neighbours grows only by the square root of that, so the bigger galaxies still leave room
  for each other (soft edges may touch).
- **Live 3D pictures in the videos** (author, 2026-10-30, for Laniakea: "render it as a 3d object
  with parallax effect like we do with others"): the Hopf particles (`src/hopf-icons.js`) and
  Laniakea (`src/laniakea-icons.js`, the real 2MRS galaxies, `public/laniakea/`) are drawn live
  over their pictures while a take plays, turning with their place on screen as the camera pans.
  Laniakea only sways about the view the author picked; the site's chart keeps the stills.
- **Space is darker** (2026-10-24): the chart darkens with mass from the stars up (half by
  10^35 g, 70% from 10^41 g), and soft-edged space pictures (galaxies, clusters, nebulae)
  may sit closer together than solid things: they keep as little as 45% of their room.
- **Lists get whips** (2026-10-26): when the narration runs through a list of places on the chart
  (the hook's sciences, its "million stories"), zoom in on the first and then whip straight to
  each next one at the same close zoom (`cam: { …, whip: true }`): a fast move (~0.6 s) with
  motion blur and a small elastic bump on landing, no zooming out in between. Then one slow
  zoom out at the end.
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

- **Lit paths, strong** (author, 2026-10-28): when the narration talks about what a path's
  moving dots show (a star collapsing and swelling, the split, supernovae, the nebulae making
  nurseries, protostars, the core to a black hole, black holes merging), light that path
  (`{ path }`, `from`/`to` for a stretch) instead of drawing an arrow along it: the line glows
  with the named objects' halo treatment (blurred lavender, overlay) and its dots are twice
  the old size.
  **Revised 2026-10-29:** keep the dots natural. Evenly spaced dots of our own turned the path
  into a subway line, so the chart's own moving dots stay as they are and only grow (3×) and
  brighten; the glow is discreet, like an object's halo. Don't light a path while an
  animation plays on it (video 3's collapse and swell): light it after, and keep it lit
  through the whole story it tells (video 3: the star → nebula → nursery → protostar → star
  cycle, with the dense core).
- **Everything is connected** (author, 2026-10-29): as the narration reaches a thing, light the
  chart's connection into or out of it: what it's made of, what it's part of (video 6: a living
  thing ← DNA ← its bases ← atoms; an atom ← its nucleus, ← its electrons; the proton ← its quarks).
  One link at a time, following the words, not all at once. A missing link can be added to
  `COMPOSITION` (src/data.js) when it's true (a bacterium: DNA + ribosomes).
- **Same density, same diagonal** (author, 2026-10-29): to show two things share a density, whip
  between them along their density line (`whip`, a straight move at the same zoom), so the
  diagonals stay put on screen while the objects change (video 3: neutron stars and neutrons).
- **Particles get the energy ruler** (author, 2026-10-29): whenever a video talks about particles
  (or light) by their energy, show the energy ruler on the left (`energyAxis: true` on a cue, from
  then on), the mass ruler's heights read as E = mc², in eV.
- **Highlight what the chart actually shows.** Super-Jupiters and brown dwarfs sit in one
  column at Jupiter's size; Beta Pictoris b is a young, inflated planet drawn wider, so don't
  point at it as "same size": draw a vertical trend line up the column (`trend: [[r, m], …]`),
  no label.
- **A movement gets a clear arrow**: when the galaxies drop a decade, a bold solid arrow
  (`solid: true, width`) in clear space beside them, not a thin dashed one over the dots.
- **Region names sit in their region** (author, 2026-10-28): "gravity dominates",
  "electromagnetism dominates" and "Goldilocks zone" go in the middle of the rectangle they
  name, as it is on screen at that moment, and large (`labelCenter`, `labelSize` on a
  `side` or `poly` highlight), not tucked against an edge.
- **Keep busy frames lean**: drop a joke title or extra label if the frame already has a lot
  (an early "Here be dark matter?" was cut for this). It's back as the title of video 4's
  dark-matter screen (author, 2026-10-28): "Here be dark matter?" replaces the "Dark matter?"
  that sat up in the corner, placed in the empty middle of the frame (left of the everyday
  objects, between ~1 pg and 1 lb), where there's room for it. All the candidate labels
  ("WIMPs?" too) share one size and style.

## 3. Dives: the default way to show a real photo

A **dive** (named by the author, 2026-10-22) shows a real photograph without cutting away
from the chart: the camera zooms onto the object, its picture grows like the hover effect
while everything around it dims (to black for the dramatic ones), and the photo fades in
*on top of the picture*, scaled and turned so the photo's subject lands exactly on the
icon's (a disc on a disc, the Pillars on the Pillars). It reads as holding a lens to the
map. Optionally it then fills the screen, holds, and fades slowly back to the chart.

- **How a dive moves (author, 2026-10-23, for every dive):** the camera trick of changing
  the zoom while the camera moves. The object comes towards the screen and grows large,
  while the depths behind it fall back at different rates (the background painting
  zooms out the most, then the dust, lines and dots, then the other pictures), blurring
  and darkening as they go. Then the photo fades in over the object for a few seconds,
  fades out, and the same move runs slowly backwards. Mechanics: a `dolly` cue
  (`{ obj, grow?, in, out }`, `dur` held all the way in) with a `lens` photo inside the
  hold; see "dives: the camera trick" in `src/narration.js` and `setDolly` in `src/main.js`.
  First tried on Jupiter in video 3.
- **The other pictures come along** (author, 2026-10-28, after video 3: "it will help with the
  idea that we are approaching the main object in a 3D space"): during a dive the pictures
  around the object grow too, by a share of its growth (its growth to the power 0.12 far
  away, up to ~0.42 right beside it, a little more for the ones nearer in the parallax), and
  spread out from it as much, like things passing by on the way in, while the painting and
  the chart still fall back. Their halos and cast shadows fade as they set off (they stay in
  the chart's depth). `setDolly` in `src/main.js` (`DOLLY_ICON_SHARE`).
- **A dive comes back the way it went in** (author, 2026-10-29): a photo that grew to fill the
  screen shrinks back onto the picture (`lens.back`), fades into it, then the dive unwinds. No
  fade at full screen onto the still-grown picture: that read as zooming in again.
- **A dive is one continuous move** (author, 2026-10-30, after video 4: "it moves the icon, then
  fades to a photograph, then zooms the photograph in a different speed, then fades out with the
  icon somewhere else. It's weird"): the object comes towards us as if we approached it in 3D (the
  camera trick, the pictures around it coming along) while the camera turns to it (a pan at the same
  zoom, as long as the approach, never a zoom of its own), and the photo fades in over the growing
  picture during the approach, no fill stage at another speed. A second held, then the same move
  backwards: the photo fades back into the picture as the dive unwinds (`dive.mirror`, a lens
  without `fill`). Video 4's Sgr A* and M87*.
- **Use a dive, not a photo cutaway, whenever the object has a picture on the chart.**
  Plain cutaways (below) are left for things the chart can't show by itself.
- **Current dives**: Jupiter in infrared (video 3, the camera trick above), the Pillars of
  Creation (video 5, upright and edge to edge; dropped from video 3 by the author, 2026-10-29, for
  plain pans that follow the words across the cycle), M87* (end of video 3, video 4,
  video 5) and Sgr A* (video 4).
- **Not a dive: the Eiffel Tower** (author, 2026-10-28). When the point is *where* a thing
  lands on the chart, stay on the chart: zoom onto the tower and grow its picture while every
  other element fades, leaving only the grid, the water and air lines and the catalogue dots;
  trace its outline and fade the picture; then a faint copy of the outline slides to where a
  second way of measuring its volume puts it, and another to the third, each labelled (the
  envelope with the air in it, 6.5 kg/m³, where the chart has it; the silhouette without the
  arches, 30 kg/m³; the iron alone, 7,800 kg/m³, left of the water line). Then the chart
  comes back. Mechanics: the `trace` highlight (`docs/narration.md`), replacing the old dive
  with its row of sketched towers.
- **One move, no wait** (author, 2026-10-27, on M87*): the photo is already fading in while the
  camera approaches (`dive.photoAt`, ~0.4 s after the cue) and grows straight on to fill the
  screen; a pause on arrival and then a second zoom read as two moves.
- **The dramatic version is preferred**: background to black, the photo grows to fill
  the screen, holds for a while, and fades back slowly (`fadeOut` ~1.5–1.8 s). Camera
  moves to the next shot can happen behind the black.
- **Alignment is fitted, not eyeballed**: match features in the icon and the photo
  (a planet's disc; the shadow and bright spots of a black hole's ring; the pillar tips),
  fit a similarity (scale, rotation, offset), and check by blending the two images.
  Refit whenever the icon is redrawn (the black holes were, on 2026-10-22).
- Mechanics, in a scene: a cue with `cam: { obj, span: ~0.5 }` and
  `hl: [{ spot: name, grow: 2–3, dim: 1 }]`, then a photo cue with `obj`, `fadeIn`,
  `fadeOut` and `lens: { icon/photo | map, r, size, fill: true | "cover", hold, fillDur }`
  (see `src/narration.js`, "photo cutaways" and drawSpot).

## 4. Photo cutaways: when, and which

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
  Video 2's "from lumpy to round" row (Hyperion → Vesta → Ceres → Pluto) went for
  this reason (author, 2026-10-22): the chart's ringed icons tell it.
- **Nebulae and galaxies: a round window on the chart** over the object's dot
  (`place: 0.7–0.86`), growing out of it, the chart still around it (Andromeda, SMACS
  0723, the Crab as a supernova remnant), when there's no matching picture to dive into.
  The Pillars, once a window, are now a dive.
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

## 5. Diagrams (next)

White lines and dots on black, the key word in yellow, no more than three moving parts,
4–8 s, handing back to the chart on the next camera move. Ideas in `cutaways.md`
(the pixel grid for expansion, the cube law, degeneracy, the two horizons…).

- **A diagram that stands for a metaphor plays on its own** (author, 2026-10-27): the pixels
  for expansion go full screen over black, with no chart behind and no border that grows (a
  growing border is the balloon again); the new pixels fade in between the old ones.
- **In the universe-on-a-log-scale view, the guides step back**: rings and names faint once it
  opens (explorer `guides`), and gone at the end, the dots brighter.

## 6. Audio and captions

- Voice treatment: `enhance.py --plain` (high-pass + loudness only) for the Boya office
  recordings; the full chain sounded boxy. No speed-up from video 7 on (author, 2026-10-27):
  new takes play as recorded; the older ones keep their 1.1×.
- **After every edit, re-check the cut for false starts, repeated words, ums, coughs and
  clipped word ends**: transcribe each clip with a filler-friendly prompt and compare with
  the expected text (`stutter.py`-style), and look at the energy around each cut point.
- **Don't cut inside joined-up speech**: if a word runs into the next one ("surprising to
  think about it"), keep the phrase whole rather than cut between them.
- Captions are transcribed clip by clip (long-form Whisper drops words at joins); remove
  Whisper's inventions in silences ("Thanks for watching", "See you soon").
- Fact-check every new recording (see the repo's CLAUDE.md).
