# short-02-up-the-line: video 2, from the density line up to the brown dwarfs.
# rec32 = "Vídeo 2 new take and script" (Google Drive "Recordings", 2026-10-23, 48 kHz mono
# ALAC, Boya mic). It replaces the 2026-10-21 cut from rec27 + rec28 (in git history):
# the new take opens on the 1 mL cube and measures everything as balls, and adds the air
# line and the balloons. Treatment: enhance.py --plain, 1.1x.
# Build: see video/short-01-hook/README.md.
# (source, beat, first-word start, last-word start, {s, e, gap}) in source seconds.

PAUSES = {"word": 0.18, ",": 0.3, ".": 0.45}

EDL = [
 # the diagonal
 ("rec32", "intro", 18.9, 24.62),     # If, for some reason, you wanted to draw everything that exists into the same chart,   (the first try, 0:08, left out)
 ("rec32", "intro", 27.76, 32.28, {"gap": 0.2}),  # probably a good way is to use a log of mass and size.   ("A probably," left out)
 ("rec32", "intro", 33.38, 41.66),    # If you do that, you notice that almost all things will fall along those diagonal lines. And it's not hard to see why.
 # the cube of water, and why we measure balls
 ("rec32", "cube", 42.6, 51.64),      # In the metric system, one gram of water is exactly one milliliter, and that will fill a cube exactly one centimeter wide.
 ("rec32", "cube", 92.72, 99.02),     # But since most things aren't really cubes, we'll be measuring size as a sphere.   (two earlier tries, 0:53–1:26, left out)
 ("rec32", "cube", 112.76, 119.36),   # Since this is log, in most cases it means just moving things a little bit to the side, but that's okay.   (two cut-off tries left out)
 # walking up the line
 ("rec32", "walk", 121.08, 124.02),   # Now imagine that you multiply all three sides by 10,
 ("rec32", "walk", 125.58, 126.08, {"gap": 0.15}),  # 10 centimeters.   ("to now" left out)
 ("rec32", "walk", 127.4, 130.62),    # In a log chart that means walking one unit to the side.
 ("rec32", "walk", 139.12, 143.46),   # You've just increased the volume by a thousand to one liter.   (the "…one unit to the size" slip left out: it's three units up)
 ("rec32", "walk", 177.32, 183.52),   # since liquid water has a consistent density of one, that means one kilogram.   (five tries, 2:29–2:57, left out)
 ("rec32", "walk", 191.4, 194.08),    # So you walked three units up in the chart.
 ("rec32", "walk", 196.66, 199.94),   # If you do that again, multiply the size by 10,
 ("rec32", "walk", 204.26, 207.62, {"gap": 0.2}),  # and you have 1,000 times the weight that's one ton.   (a garbled "that's a… times" left out)
 ("rec32", "walk", 208.54, 210.94),   # All of this creates this diagonal line.   ("always with a slope of one to three" left out: see NOTES)
 ("rec32", "walk", 214.46, 216.0, {"gap": 0.25}),  # That is the density of water.
 # sink or float, water and air
 ("rec32", "line", 220.34, 224.62),   # everything to the left of this will by definition be denser than water and it sinks.   ("Everything to the left of it," restart left out)
 ("rec32", "line", 225.66, 230.3),    # Here we have objects made of stone, of metal. Anything to the right will float.
 ("rec32", "air", 231.56, 240.84),    # Similarly you could draw a diagonal line for the density of air at one atmosphere in Earth. These will separate things lighter or heavier than air.
 ("rec32", "air", 268.6, 274.68),     # And as the name indicates, you can see lighter than air aircraft. Those are balloons and zeppelins.   (three earlier tries left out)
 # animals
 ("rec32", "animals", 278.32, 288.02),  # Most animals however live in a much narrower band. That's because we are mostly made of water. Some of us are heavier than others. For example,
 ("rec32", "animals", 311.98, 316.08, {"gap": 0.15}),  # the hippo can't actually swim. They just bounce along the riverbed.   (two tries, 4:49–5:09, left out)
 ("rec32", "big", 451.3, 460.3),      # As we go up, we see heavier and heavier animals, like the elephants, or dinosaurs, the largest animals that ever walked to Earth.   (many tries, 5:21–7:27, left out)
 ("rec32", "big", 461.38, 465.42),    # However, the largest animal ever is still with us. That's the blue whale.
 ("rec32", "big", 483.04, 487.42),    # And a little bit above that, we have the largest tree. That's the sequoia.   (the two "heaviest plant" tries left out: see NOTES)
 # what we build
 ("rec32", "built", 498.72, 501.46),  # Now we are done with life and we are in engineering projects.
 ("rec32", "built", 511.76, 522.24),  # You can see, for example, that the Eiffel Tower is actually surprisingly light. That's because we are also counting all the internal space. The Eiffel Tower is in many ways fractal.
 # rocks and small moons
 ("rec32", "rocks", 528.88, 531.14),  # And then we move to
 ("rec32", "rocks", 533.36, 540.22, {"gap": 0.1}),  # lots of big rocks and there's some intersection between them, like the Great Pyramid, which is basically just a giant rock.   ("lots of engineering projects and" left out)
 ("rec32", "rocks", 542.08, 546.96),  # Higher than that, now we have lakes and asteroids, and then we arrive at small moons.
 # round worlds
 ("rec32", "round", 549.8, 575.92),   # And something very interesting happens when we talk about those moons. As we go up, the moons start becoming less and less potato-shaped and more spherical. This is the moment where gravity becomes stronger than the molecular bonds that keep things in their shape. And after this, everything may as well behave as a liquid, so they all become spherical.
 ("rec32", "round", 583.64, 588.5),   # From here on, gravity dominates everything.
 # atmospheres and gas giants
 ("rec32", "giants", 590.92, 596.1),  # Another example is that the Moon and Mercury have no atmosphere, while Mars has almost none.
 ("rec32", "giants", 604.56, 622.36), # Venus and Earth do have a very dense atmosphere, but the lighter gases like hydrogen and helium would just float away. And because most of the universe is actually those two gases, once you have enough gravity to hold on to them you become mostly made of them. That's why we see the gas giant planets.   (two tries left out; "most of the universe": see NOTES)
 ("rec32", "giants", 631.4, 636.86, {"e": 637.24}),  # and you see that reflected on the graph, most of those dots stop being on the left with the rocky planets
 ("rec32", "giants", 638.42, 643.5, {"gap": 0.15}),  # and move to the right where they are mostly made of gas, Saturn is actually less dense than water.   ("nice giants," left out)
 # super-Jupiters and degenerate matter
 ("rec32", "jupiter", 645.1, 651.48), # Objects keep climbing and then suddenly the trend stops. You see that you can't get a planet much bigger than Jupiter.
 ("rec32", "jupiter", 652.44, 652.66, {"e": 653.28}),  # Even objects
 ("rec32", "jupiter", 653.56, 657.86, {"gap": 0.1}),  # ten times, a hundred times more massive than Jupiter are still roughly Jupiter sized.   (a stray "are" left out)
 ("rec32", "jupiter", 658.86, 665.96),  # This is because the pressure in the core is now so large that electrons get squeezed out of their atoms and it becomes degenerate matter.
 # the split
 ("rec32", "split", 686.28, 701.42),  # and then just around brown dwarfs we have a huge bifurcation in which some objects veer to the right and some veer to the left because now we are not talking about the history of ordinary matter anymore.   ("And then at the brown dwarf" left out)
 ("rec32", "split", 702.08, 705.06),  # We are talking about the life and death of stars.
]
