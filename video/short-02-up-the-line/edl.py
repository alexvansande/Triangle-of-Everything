# short-02-up-the-line: video 2, from the density line up to the brown dwarfs.
# rec33 = "Video 2 new take.m4a" (Google Drive "Recordings", 2026-10-26, 8:14, AAC mono; at home).
# rec46 = "Video 2 new take" (Google Drive "Recordings", 2026-10-28, 5:57, ALAC 48 kHz; in the car):
# the author's re-recording of the paragraphs marked for it (the cube and the balls, the walk up,
# the Eiffel Tower's three volumes, the rocks, Saturn and Jupiter, the electrons that push back,
# the split). The author can hear a switch between recordings, so the cut keeps to as few as
# the two takes allow (five): rec33 for the opening, the water and air lines and the animals
# (rec46's animal lines would add two switches for nothing better), and for the round worlds up
# to the Goldilocks zone (not in rec46); rec46 for the rest.
# rec46 is matched to rec33 (SOURCE_FX, measured on the speech: 4.2 dB quieter, ~1.5 dB thinner
# below 500 Hz, 2–4 dB brighter above 2 kHz; within ~1 dB after). The walk up was spoken louder
# than the rest: −1.5 dB on those three clips, so the switch back to rec33 doesn't jump.
# Treatment: the 2026-10-26 natural-speed test (80 Hz high-pass, one gain to a −1 dBFS peak), no
# speed-up. Build: see video/short-01-hook/README.md.
# (source, beat, first-word start, last-word start, {s, e, gap, cut}) in source seconds.
# Where Whisper (medium.en) merged a restart into one long word, `s` is the real
# start of the retake, found from the speech runs.

SOURCE_FX = {"rec46": "volume=4.2dB,lowshelf=f=400:g=1.5,equalizer=f=2000:t=o:w=1:g=-2.6,highshelf=f=5000:g=-3"}
PAUSES = {"word": 0.18, ",": 0.3, ".": 0.45}

EDL = [
 # the diagonal
 ("rec33", "intro", 21.36, 30.20),     # If for some reason you wanted to draw everything that exists on the same chart, a good way would be to use the log of mass and size.
 ("rec33", "intro", 31.26, 37.98, {"cut": [(36.20, 36.60)]}), # Do that, and you notice that almost everything falls along this diagonal line, and it's not hard to see why.
 # a millilitre of water, and why we measure balls (rec46)
 ("rec46", "cube", 47.80, 59.56),      # In the metric system, one millilitre of water weighs one gram and fills a cube exactly one centimetre wide. Most things aren't cubes though, so we will measure everything as if they were a ball.   (the first try, "it fields a cube… as spheres… a little bit to the left", left out)
 ("rec46", "cube", 61.08, 65.88),      # On a log chart that only shifts things by a tiny bit to the right; you won't even notice.
 # walking up the line (rec46)
 ("rec46", "walk", 82.82, 97.74, {"gain": -1.5}),      # Now make every side ten times longer: ten centimetres. On a log chart that's one unit to the right, but the volume grows a thousand times, to one litre, and one litre of water weighs one kilogram.   (the first try, "On a log, that's one step to the side", left out)
 ("rec46", "walk", 99.80, 103.88, {"s": 101.85, "gain": -1.5}),  # That's three units up on the mass axis.   (the first "That's three," left out)
 ("rec46", "walk", 105.62, 110.52, {"gain": -1.5}),    # Do it again, ten times the size, and you get a thousand times the mass: one ton.
 # sink or float, water and air
 ("rec33", "line", 148.72, 162.54),    # All of these will draw a diagonal line: the density of water. Everything to the left is, by definition, denser than water, so it sinks. Here we have things made of stone and metal. Anything to the right will float.
 ("rec33", "air", 164.66, 178.90),     # In the same way, you can draw a line for the density of air at one atmosphere on Earth. It separates things heavier than air from things lighter than air. And as the name says, here are the lighter-than-air aircraft: balloons and zeppelins.   (two more tries, 3:01–3:25, left out)
 # animals
 ("rec33", "animals", 228.82, 237.24), # Most animals though live in a much narrower band. That's because we are mostly made of water. Some of us are a little denser than others.   (the second try: the first has "some of us a lot…")
 ("rec33", "animals", 220.64, 224.38), # The hippo, for example, can't actually swim. It just bounces along the riverbed.   (from the first try: the second has "…bounces around the riverbed")
 ("rec33", "big", 262.32, 277.96),     # As we go up, we see heavier and heavier animals, like elephants, or the Argentinosaurus, the largest animal ever to walk the Earth. However, the largest animal ever is still with us: that's the blue whale. And a little bit above that, that's the largest tree, the sequoia.   (two tries, "the dinosaurs" and "tyrannosaurs", 4:04–4:21, left out)
 # what we build: the Eiffel Tower's three volumes (rec46)
 ("rec46", "built", 181.08, 187.40),   # Past living things, and we get to engineering. Notice that the Eiffel Tower is surprisingly light for its size.
 ("rec46", "built", 197.24, 209.30),   # That's because we're also counting all the space inside it. Its whole shape, air included, is about one and a half million cubic metres. Leave out the arch and the gaps, and it shrinks about five times.   (the third try; "…its whole air" and a second try left out)
 ("rec46", "built", 217.32, 223.18),   # The iron alone would fit in a cube 11 metres wide, which is denser than water, and it would definitely sink.   (the second try)
 ("rec46", "built", 226.00, 233.58, {"s": 228.3}),  # In many ways the Eiffel Tower is kind of a fractal: how big it is depends on how close you look.   (the first "In many ways the Eiffel Tower," left out)
 # rocks, lakes and small moons (rec46)
 ("rec46", "rocks", 239.14, 248.90),   # Then come big rocks and big buildings, and the Great Pyramid, which is a little bit of both. Above that we have lakes and asteroids, and then we arrive at small moons.
 # round worlds, atmospheres and gas giants
 ("rec33", "round", 352.56, 391.80, {"e": 392.6, "cut": [(361.62, 361.86)]}),  # As we move up the line you notice objects becoming more spherical and less potato-shaped. That's because until now the force holding matter in shape was the chemical bonds between the atoms. But now, from this point on, gravity takes over, and that's what shapes planets. And it shapes them in many other ways. Neither Mercury nor the Moon has enough gravity to hold on to an atmosphere. Venus and Earth do, but not enough to keep the lightest gases, hydrogen and helium. And since most of the visible matter in the universe is made of those two, once a planet can hold on to them, it can grow into a gas giant.
 ("rec33", "round", 393.48, 409.76, {"s": 399.65}),  # So Earth lives in a kind of gravitational Goldilocks zone: just enough mass, for its temperature, to hold on to oxygen and nitrogen, not enough to hold on to hydrogen and helium.   (the first try, cut off at "just enough mass,", left out)
 # gas giants (rec46 from here to the end)
 ("rec46", "giants", 265.58, 283.28, {"s": 268.98}),  # You can see it on the chart: most of these dots stop following the rocky planets on the left and move to the right, where planets are mostly gas. Saturn is actually less dense than water, roughly as dense as wood, and it would float like a log.   (the first "You can see it on the chart, most of these dots," left out)
 ("rec46", "giants", 289.48, 292.08, {"e": 292.75}),  # Jupiter is roughly as dense as honey.   (", but the trend stops here", and the aside about maple syrup, left out)
 # super-Jupiters and degenerate matter
 ("rec46", "jupiter", 307.82, 323.96), # Then the trend suddenly stops. You can't get a planet much bigger than Jupiter. Objects 10 times, even 80 times more massive are still roughly Jupiter-sized. That's because the pressure in their core is so high that electrons are squeezed out of their atoms, and they push back.
 ("rec46", "jupiter", 328.06, 330.86), # Add more mass, and the object gets denser, not bigger.
 # the split
 ("rec46", "split", 336.20, 349.62),   # And then, right about brown dwarfs, there's a huge split. Some objects veer to the right and some veer to the left, because now we are no longer talking about the story of ordinary matter. We are talking about life and death of stars.
]
