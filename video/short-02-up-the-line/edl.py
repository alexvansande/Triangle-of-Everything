# short-02-up-the-line: video 2, from the density line up to the brown dwarfs. A retired take
# (video/render-skip.txt): it's only the source its cuts are made from, long video 1
# (video/cuts/long-01-intro.json) and Shorts 2a and 2b (short-02a-things, short-02b-planets), so it
# holds every line of all three, the *Long only* and *Short only* ones too, in the recording's order:
#   "So let's start with that first diagonal I mentioned"   long video 1 only
#   "If you plot everything that exists… Why?"              Short 2a only (its opening)
#   "In the metric system…" to "…Why does that happen?"     long video 1 and Short 2a (2a ends there)
#   "If you plot everything by mass and size…spheres."      Short 2b only (its opening)
#   "That's because until now…" to the end                  long video 1 and Short 2b
# rec51 = "Long 1 take 1.m4a" (Google Drive "Recordings", 2026-11-03, 12:00, ALAC 48 kHz): the one-take
# script (video/scripts/recording-scripts.md, "Long 1"), 3:53–11:54 of it; the hook before it is
# video/short-01-hook/edl.py. It replaces the 2026-10-26/28 cut from rec33 + rec46 (in git history).
# The author: "usually the last takes are the best"; the last try is used unless it slips (each clip says).
# Left out on purpose: "Its whole shape, air included, is about one and a half cubic metres" (it's
# 1.5 *million*: video/sources/2026-11-03/NOTES.md, to re-record).
# Treatment: enhance.py --plain, natural speed. Build: see video/short-01-hook/README.md.
# `cut` spans: breaths the pause cap kept (gaps of 0.6–1.8 s after a sentence), trimmed to ~0.3–0.45 s
# (the re-cut of 2026-11-03, from re-transcribing the first cut).
# (source, beat, first-word start, last-word start, {s, e, gap, cut}) in source seconds.
# Where Whisper (medium.en) merged a restart into one long word, `s` is the real start of the
# retake, found from the speech runs (and the first-word start is the merged word's).

SOURCES = {"rec51": "Long 1 take 1.m4a"}
TREATMENT = "plain"
PAUSES = {"word": 0.18, ",": 0.3, ".": 0.45}

EDL = [
 ("rec51", "long-open", 233.72, 236.26),   # So let's start with that first diagonal I mentioned.   (long video 1 only; ", now for the short" left out)
 ("rec51", "short-open", 243.48, 251.40),  # If you plot everything that exists by mass and size, on a log scale, almost everything falls along the diagonal line. Why?   (Short 2a only)
 ("rec51", "cube", 260.90, 266.90),        # In the metric system, one millilitre of water weighs one gram and fills a cube exactly one centimetre wide.
 ("rec51", "ball", 297.68, 304.02, {"s": 299.18}),  # Most things, though, aren't cubes, so we'll measure all sizes as if everything were spherical.   (the last of six tries; the cars the author asks about are in the tries before it, 4:39–4:41; "Most," before it left out, and the throat sound at 299.0 after it: the author, 2026-11-03)
 ("rec51", "ball", 315.44, 320.60),        # That will move most things a tiny bit to the right, but in most scales it won't even be noticeable.   (the second try; the first: "…in most zooms you won't notice")
 ("rec51", "walk", 323.32, 341.94, {"cut": [(332.35, 333.09)]}),        # Now make every side ten times longer, ten centimetres: that's one unit to the right. But the volume grows a thousand times, to one litre. And one litre of water weighs one kilogram: three steps up. Do it again, ten times the size, and you get a thousand times the mass: one tonne.
 ("rec51", "sink", 344.30, 358.38, {"s": 345.88}),  # (the retake: "All of these dra–" left out, the author 2026-11-03) All of these draw a diagonal line, the density of water. Everything to the left is, by definition, denser than water, so it sinks. Here are things made of stone and metal. Anything to the right, therefore, will float.
 ("rec51", "air", 360.54, 363.16),         # In the same way, you can draw a line for the density of air.
 ("rec51", "air", 396.56, 406.50, {"gap": 0.4, "cut": [(396.70, 397.32)]}),  # (the 0.7 s pause after "And" taken out: the author, 2026-11-03) And balloons and zeppelins are literally called lighter-than-air aircraft, because they float on air, and that's why they are on the right of the line of the density of air.   (the last of five tries)
 ("rec51", "animals", 408.50, 441.16, {"cut": [(422.22, 422.90)]}),     # Most animals, though, live in a much narrower band. That's because we are mostly made of water. Some of us are a little denser than others. The hippo, for example, can't actually swim: it just bounces along the riverbed. And as we go up, we see heavier animals, like the elephants. The largest animal ever on land was the Argentinosaurus, but the largest animal ever is still around: that's the blue whale. But even that pales compared to trees. An adult sequoia can weigh as much as ten blue whales.
 ("rec51", "eiffel", 445.38, 455.66, {"e": 455.97}),  # Past living things, we get to engineering. Notice that the Eiffel Tower is surprisingly light for its size. But that's because we are also counting all the space inside it.   ("Its whole shape, air included, is about one and a half cubic metres" left out: "million" is missing)
 ("rec51", "eiffel", 469.04, 473.04),      # Take out the gap on the arch, and it's about five times smaller.   (the second try; "Take the arch and the hole," left out)
 ("rec51", "eiffel", 475.36, 480.06),      # Melt it down, and it would fit in a cube eleven metres wide, way over to the other side.
 ("rec51", "eiffel", 482.32, 484.50),      # Counted whole, it's almost as light as air.
 ("rec51", "eiffel", 488.90, 494.96, {"s": 487.95}),  # But that's really how every skyscraper works: a lot of empty space, held by the strongest but lightest skeleton possible.   (the second try; "But that's really how every sky–" left out)
 ("rec51", "rocks", 499.30, 508.64),       # Then come big rocks, big buildings, and the Great Pyramid, which is a little bit of both. And above that, we have lakes and asteroids, and then we arrive at small moons.
 ("rec51", "rocks", 511.00, 517.50),       # And then, suddenly, notice how everything stops being a potato shape and turns into a sphere. Why does that happen?   (long video 1 and Short 2a: 2a ends here)
 ("rec51", "planets-open", 539.78, 548.06, {"s": 540.66}),  # If you plot everything by mass and size, you can actually see the point where asteroids and small moons turn from potato shapes into spheres.   (Short 2b only; the third try: the first breaks off at "turn from potato", the second at "by size")
 ("rec51", "round", 551.46, 562.24, {"cut": [(558.34, 558.80)]}),       # That's because until now, what held matter in shape was the chemical bonds between atoms, and those are electromagnetic. From this point on, gravity takes over, and it's what shapes planets.
 ("rec51", "atmos", 580.98, 596.70, {"cut": [(587.92, 588.06)]}),       # And it shapes them in many other ways too. Neither Mercury or the Moon has enough gravity to hold on to an atmosphere. Venus and Earth do, but not enough to keep the lightest gases, hydrogen and helium. And since most of the visible matter in the universe is made of those two,
 ("rec51", "atmos", 603.14, 606.18, {"gap": 0.28}),  # once a planet can hold on to them, it will grow into a gas giant.   (the second try; the first breaks off at "it can grow,")
 ("rec51", "goldi", 608.52, 620.76, {"cut": [(616.04, 617.55), (617.965, 618.885)]}),  # ("but not eno– not enough" → "but not enough": the author, 2026-11-03) So Earth lives in a kind of gravitational Goldilocks zone: just enough mass, for its temperature, to hold on to oxygen and nitrogen, but not enough to hold on to hydrogen and helium.
 ("rec51", "gas", 627.24, 641.10, {"s": 627.38}),  # You can see it on the chart. Most of those dots stop following the rocky planets on the left and move to the right, where planets are mostly gas. Saturn is actually less dense than water, roughly as dense as wood. It would float like a log.   (the third "You can see it on the chart")
 ("rec51", "jupiter", 643.76, 653.10),     # Then the trend suddenly stops. You can't get a planet much bigger than Jupiter. Objects ten times, even eighty times more massive are still roughly Jupiter-sized.
 ("rec51", "jupiter", 657.54, 682.00, {"cut": [(673.24, 673.53)]}),     # This is once again gravity breaking into electromagnetism's last refuge: the atom itself. The pressure in the core is so high that it crushes the atoms and strips their electrons off, leaving bare nuclei in a sea of electrons. Those electrons refuse to be squeezed any further. That's the last stand. Add more mass, and the object gets denser, not bigger.   ("This is again," left out)
 ("rec51", "split", 684.08, 695.00),       # And then, right around brown dwarfs, there's a huge split. Some objects veer to the right and some veer to the left, because now we are no longer talking about the story of ordinary matter.
 ("rec51", "split", 709.06, 713.28, {"s": 709.00, "gap": 0.45}),  # We are talking about the stuff that makes the life and death of stars.   (the end of the last try: the first breaks off at "…and all the weird matter that…", and the last try's start, "Because we are…", runs straight on from "veer to the left," with no pause to cut in)
]
