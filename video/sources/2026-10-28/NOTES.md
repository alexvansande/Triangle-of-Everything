# Recordings, 2026-10-28

The Whisper word timings (medium.en, `scripts/narration-take.py`'s settings) are `rec46.words.json` and `rec47.words.json`.

## rec46: "Video 2 new take" (video 2)

This is in the Google Drive "Recordings" folder: 5:57, ALAC 48 kHz stereo (used as mono), **recorded in
the car**. It re-records the paragraphs marked for it in the script of 2026-10-28: the cube and the balls
("spheres" sounded like "fierce"), the walk up the line, the Eiffel Tower's three volumes, the rocks, Saturn
and Jupiter, the electrons that push back, and the split; plus a retake of the animals. After a mic test
(0:00–0:20).

Cut: `video/short-02-up-the-line/edl.py`, 24 clips with rec33 (2026-10-26, at home), five switches between
them. rec33 keeps the opening, the water and air lines and the small animals, and the round worlds through
the Goldilocks zone (not in rec46). The author first worried the switches would show; after hearing the cut
he couldn't tell them apart (both his usual car setup), so the second pass (same day) takes rec46 wherever
it's better: the elephants, the Argentinosaurus, the blue whale and the sequoia now come from it. The cut
runs 4:28 at natural speed (no speed-up), with the 2026-10-26 treatment (80 Hz high-pass, one gain to a
−1 dBFS peak).

Matching the car to the home take (measured on the speech): rec46 was 4.2 dB quieter, ~1.5 dB thinner below
500 Hz and 2–4 dB brighter above 2 kHz, with the same noise floor; `SOURCE_FX` brings it within ~1 dB in every
band. The walk up was spoken louder than everything else (−21 against −23.5 dB), so those three clips get
−1.5 dB (`gain`, new in build.py) to soften the switch back to rec33.

Picks from rec46: the second try at the cube ("it fields a cube… a little bit to the left" left out); the
second walk ("one step to the side" left out) and "That's three units up" without its first "That's three,";
"Past living things… surprisingly light", then the third "counting all the space inside it" with the volumes,
the second "iron alone… definitely sink", and "In many ways…" without its first start; the rocks; Saturn
without the first "You can see it on the chart, most of these dots,"; "Jupiter is roughly as dense as honey"
(", but the trend stops here" and the aside about maple syrup left out); the trend, the push back, the split. Second pass: "As we go up, we will see heavier animals like the elephants.
The largest animal ever on land was the Argentinosaurus, but the largest animal ever is still around, and that's
the blue whale" (without its restart), then "But if we talk about the largest tree, then that's the sequoia,
which is much bigger" (the last of three tries). "Jupiter is roughly as dense as honey" is out (the author
doesn't like it), and so is its label.

Caption words corrected: "are in cubes" → "aren't cubes" (checked twice); "10 cm", "1 liter", "1 kg", "max
axis" → spelled out, "mass axis"; "1 .5 million" → "one and a half million"; "gold -lock" → "Goldilocks";
"then as an Earth" → "Venus and Earth"; "And more mass and the object get denser" → "Add more mass, and the
object gets denser"; punctuation where Whisper ran sentences together. Thirteen cues were re-keyed to the new
words (each keeps the old phrase as a fallback); the Eiffel Tower's second and third outlines now land on
"leave out the arch" and "the iron alone"; a new label "Saturn · like wood".

### Fact check

- **Right:** one millilitre of water weighs a gram and fills a 1 cm cube; ten times the side is one step right
  on a log chart and a thousand times the volume (a litre, a kilogram): three steps up.
- **Right:** measuring things as balls moves them "a tiny bit to the right": a ball holding a cube's volume is
  1.24 times as wide. (The first try said "to the left": wrong, and left out.)
- **Right:** the Eiffel Tower's envelope, air included, about 1.5 million m³ (the chart uses 1.56 million);
  without the arch and the gaps "about five times" smaller (330,000 m³: 4.7×); the iron alone, 1,300 m³, "a
  cube 11 metres wide" (10.9 m), denser than water, so it would sink.
- **Right:** Saturn, 0.69 g/cm³, "roughly as dense as wood" (pine ~0.5, oak ~0.75): it would float.
- **Right:** "the largest animal ever on land was the Argentinosaurus" (about 70 t; estimates vary) and the blue
  whale the largest animal ever; the sequoia (~2,000 t) "much bigger" than the whale (~150 t).
- (Not used: "Jupiter is roughly as dense as honey", roughly right: 1.33 against honey's ~1.4.)
- **Right:** objects 10 and even 80 times Jupiter's mass stay about Jupiter's size; the electrons, squeezed out
  of their atoms, push back (degeneracy pressure), so more mass makes them denser, not bigger.
- Nothing wrong in the parts used.

## rec47: "Black holes.m4a" (video 4, first half)

This is in the Google Drive "Recordings" folder: 9:18, ALAC 48 kHz stereo (used as mono), in the car. The first
half of the rewritten video 4 script (a hook, no star life-cycle recap, the Sun and the Earth as black holes,
"billions of Suns"), from the hook to "…and we just have gravity wrong", with retakes, after a mic test.

Cut (2026-10-29, a day late: it should have gone in as soon as it arrived, see CLAUDE.md):
`video/short-04-black-holes/edl.py`, 26 clips, 4:47 at natural speed. rec47 up to "gravity wrong", then the
previous cut's own finished audio (rec43 + rec41, cleaned up) from "But if it is something real" to the end,
until the author records the second half. rec47 matched to it (8.6 dB quieter, ~1.5 dB more at 2 kHz).
Picks: the third "What's the smallest black hole…"; "I am doing a series of videos on this chart…" without
"I'm doing a,"; "And in the last one, we saw that stars die…"; the line from the first try ("…called the
Schwarzschild radius… Nothing can cross it.") and "Everything we have is to the bottom and to the right of
this line" from the later one; "A black hole doesn't actually have a size…" without a first "a" and a first
"and that grows in step with it,"; the second Sun-and-Earth try; the restarts in "some of the,", "we've been,",
"maybe, maybe" and "its event horizon is so big," taken out.

Captions: Whisper dropped "…a single atom. And if they're out there, they would be completely invisible. No
light, nothing" at a join; it was transcribed on its own and put back. The second half keeps the old take's
corrected captions. Corrected: "shard" → "chart", "Neutron store", "grilled" → "grew", "on a lab" → "in a lab",
"surge" → "search", "weight" → "weigh". The scene's cues are re-keyed to the new words; the life-cycle cues
the new script no longer narrates (main sequence, red giants, a new generation of stars), "research on neutron
stars" and the mountain's mass are gone; new: the Sun and the Earth squeezed onto the black-hole line ("the
Sun: 6 km wide", "the Earth: 2 cm, a marble").

### Fact check

- **Right:** the Schwarzschild line as the top-left edge, everything below and to the right of it; the
  45° line; the Sun as a black hole about 6 km wide (5.9 km), the Earth about 1.8 cm (a marble); "a few Suns
  to billions of Suns"; Sgr A* about 4 million Suns; the supermassive ones less dense than water; TON 618's
  horizon (radius ~1,300 AU) holding every planet's orbit (Neptune 30 AU); "we can't do that in a lab"; the
  four searches; Hawking radiation; the window (virus-sized with a small moon's mass; an asteroid's mass
  smaller than an atom); galaxies "five, sometimes ten times heavier".
- **Imprecise:** "we wouldn't need any new physics or any new particles". No new particle, right; but making
  that many small black holes needs early-universe physics beyond the standard picture, so "no new physics"
  overstates it. Suggested: "…we wouldn't need any new particle to explain it."
- **Imprecise, fine for a short:** "It's a singularity, a point" (what general relativity predicts; the script
  had "it's thought to be").
- Still in the old second half until it's re-recorded: "in the first nanoseconds of our history" (imprecise:
  the window's black holes formed ~10⁻²¹–10⁻¹⁶ s in; "the very first moments").
