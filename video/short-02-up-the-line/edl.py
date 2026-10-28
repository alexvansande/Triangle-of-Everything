# short-02-up-the-line: video 2, from the density line up to the brown dwarfs.
# rec33 = "Video 2 new take.m4a" (Google Drive "Recordings", 2026-10-26, 8:14, AAC mono).
# The re-recording of the edited script (video/scripts/recording-scripts.md): the same
# order as rec32, with the fact fixes ("most of the visible matter"), the new gravity
# part (chemical bonds, Mercury and the Moon, the Goldilocks zone) and Argentinosaurus.
# It replaces the 2026-10-23 cut from rec32 (in git history).
# Treatment: enhance.py --plain, 1.1x. Build: see video/short-01-hook/README.md.
# (source, beat, first-word start, last-word start, {s, e, gap}) in source seconds.
# Where Whisper (medium.en) merged a restart into one long word, `s` is the real
# start of the retake, found from the speech runs.

PAUSES = {"word": 0.18, ",": 0.3, ".": 0.45}

EDL = [
 # the diagonal
 ("rec33", "intro", 21.36, 30.20),     # If for some reason you wanted to draw everything that exists on the same chart, a good way would be to use the log of mass and size.
 ("rec33", "intro", 31.26, 37.98, {"cut": [(36.20, 36.60)]}), # Do that, and you notice that almost everything falls along this diagonal line, and it's not hard to see why.
 # a millilitre of water, and why we measure balls
 ("rec33", "cube", 44.74, 51.50),      # In the metric system, one millilitre of water weighs one gram, and it fills a cube exactly one centimetre wide.   (the cut-off first try left out)
 ("rec33", "cube", 52.38, 63.20),      # But since most things aren't really cubes, we will measure sizes as spheres. On a log chart that just moves things a little bit to the side. That's okay, you won't even notice.
 # walking up the line
 ("rec33", "walk", 70.62, 81.90),      # Now imagine you multiply all three sides by 10, so we get 10 centimetres. On a log chart, that's one step to the side. And you just multiply the volume by 1000, to one litre.   (the first "Now imagine…" left out)
 ("rec33", "walk", 82.20, 87.22),      # And since water has a density of one gram per cubic centimetre, that's one kilogram.
 ("rec33", "walk", 130.64, 133.50),    # You just walk three steps up in the mass axis.   ("So you've always walked", the third try at the whole step and the "very constant density" tries, 1:28–2:10, left out)
 ("rec33", "walk", 135.74, 141.00),    # Do it again, ten times the size, and you get a thousand times the mass: one ton.
 # sink or float, water and air
 ("rec33", "line", 148.72, 162.54),    # All of these will draw a diagonal line: the density of water. Everything to the left is, by definition, denser than water, so it sinks. Here we have things made of stone and metal. Anything to the right will float.
 ("rec33", "air", 164.66, 178.90),     # In the same way, you can draw a line for the density of air at one atmosphere on Earth. It separates things heavier than air from things lighter than air. And as the name says, here are the lighter-than-air aircraft: balloons and zeppelins.   (two more tries, 3:01–3:25, left out)
 # animals
 ("rec33", "animals", 228.82, 237.24), # Most animals though live in a much narrower band. That's because we are mostly made of water. Some of us are a little denser than others.   (the second try: the first has "some of us a lot…")
 ("rec33", "animals", 220.64, 224.38), # The hippo, for example, can't actually swim. It just bounces along the riverbed.   (from the first try: the second has "…bounces around the riverbed")
 ("rec33", "big", 262.32, 277.96),     # As we go up, we see heavier and heavier animals, like elephants, or the Argentinosaurus, the largest animal ever to walk the Earth. However, the largest animal ever is still with us: that's the blue whale. And a little bit above that, that's the largest tree, the sequoia.   (two tries, "the dinosaurs" and "tyrannosaurs", 4:04–4:21, left out)
 # what we build
 ("rec33", "built", 281.26, 297.76, {"cut": [(296.72, 296.98)]}), # Now past living things, we get to engineering. Notice that the Eiffel Tower is surprisingly light for its size. That's because we are also counting all the space inside it. In many ways the Eiffel Tower is somewhat a fractal.
 # rocks, lakes and small moons
 ("rec33", "rocks", 337.82, 350.96, {"cut": [(344.50, 345.90)]}), # Then comes lots of big rocks and big buildings, and the pyramid, which is a little bit in both categories. Above that we have lakes and asteroids, and then we arrive at small moons.   (six tries, 5:00–5:36, left out)
 # round worlds, atmospheres and gas giants
 ("rec33", "round", 352.56, 391.80, {"e": 392.6, "cut": [(361.62, 361.86)]}),  # As we move up the line you notice objects becoming more spherical and less potato-shaped. That's because until now the force holding matter in shape was the chemical bonds between the atoms. But now, from this point on, gravity takes over, and that's what shapes planets. And it shapes them in many other ways. Neither Mercury nor the Moon has enough gravity to hold on to an atmosphere. Venus and Earth do, but not enough to keep the lightest gases, hydrogen and helium. And since most of the visible matter in the universe is made of those two, once a planet can hold on to them, it can grow into a gas giant.
 ("rec33", "round", 393.48, 409.76, {"s": 399.65}),  # So Earth lives in a kind of gravitational Goldilocks zone: just enough mass, for its temperature, to hold on to oxygen and nitrogen, not enough to hold on to hydrogen and helium.   (the first try, cut off at "just enough mass,", left out)
 ("rec33", "giants", 426.94, 440.76),  # You can see that on the chart. Most of these dots stop following the rocky planets on the left and move to the right, where planets are mostly made of gas. Saturn is actually less dense than water: it could float if you could have a pool big enough.   (the first try, "a pool buget", and the last Saturn line left out)
 # super-Jupiters and degenerate matter
 ("rec33", "jupiter", 451.76, 464.82),  # Now objects keep climbing, and then suddenly the trend stops. You can't get a planet much bigger than Jupiter. Objects 10 times, even 80 times more massive than Jupiter are still roughly Jupiter-sized.
 ("rec33", "jupiter", 465.26, 475.46, {"s": 468.65, "cut": [(471.32, 471.48)]}),  # That's because the pressure in their core is so high that electrons get squeezed out of their atoms, and it becomes degenerate matter.   (the first "That's because the pressure in the core," left out)
 # the split
 ("rec33", "split", 477.42, 490.86),   # And then, right about brown dwarfs, there's a huge split. Some objects veer to the right and some veer to the left, because now we are no longer talking about the story of ordinary matter. We are talking about life and death of stars.
]
