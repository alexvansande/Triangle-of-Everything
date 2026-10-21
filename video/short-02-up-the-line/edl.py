# short-02-up-the-line: video 2, from the density line up to the brown dwarfs. It replaced
# the old videos 2 and 3 (video/retired/short-02-density, short-03-planets) on 2026-10-21.
# rec27 = "animals and water density line.m4a" (the video 2 re-record) and
# rec28 = "from humans to brown dwarfs.m4a" (iCloud recordings, 2026-10-21, 12:00, 48 kHz,
# Boya mic in the office). Treatment: enhance.py --plain, 1.1x.
# Build: see video/short-01-hook/README.md.
# (source, beat, first-word start, last-word start, {s, e, gap}) in source seconds.

PAUSES = {"word": 0.18, ",": 0.3, ".": 0.45}

EDL = [
 # the diagonal (rec27, as in video 2)
 ("rec27", "q", 82.52, 94.16),        # You can fit everything in the universe in a single chart by measuring mass and the size, and most things will fall in this diagonal line.
 ("rec27", "q", 99.2, 103.86),       # And it shouldn't be surprising to think about it.   (kept whole: "surprising" runs into "to", any cut there sounded clipped)
 ("rec27", "water", 104.18, 109.2, {"gap": 0.3}),   # Take a look, for example, at one liter of water: that's exactly one kilogram,
 ("rec27", "water", 130.52, 133.94, {"gap": 0.2}),  # and it's 10 centimeters. That is just how the metric system works.
 ("rec27", "cube", 138.34, 142.26, {"s": 139.15}),  # If you multiply the size in all three dimensions by ten,   (a stray "the size," left out)
 ("rec27", "cube", 143.24, 148.5, {"s": 145.7}),    # it means that you're moving one square to the right.   (a first "it means that you're moving one square." left out)
 ("rec27", "cube", 149.9, 156.2),     # But then it multiplies the volume by a thousand, it means you're moving three squares up.
 ("rec27", "cube", 156.82, 163.86),   # And because water has a constant density, that also increases the weight by a thousand.
 ("rec27", "cube", 169.1, 174.08),    # That's why everything in water will always fall in this diagonal blue line.
 # sink or float (rec28)
 ("rec28", "line", 32.16, 40.84, {"s": 33.45}),     # ("And these water," false start left out) And this water density line tells us an interesting story, because by definition everything on the left will sink.   (the first try, 0:03–0:28, left out)
 ("rec28", "line", 42.48, 50.3),      # And here we have things made of rocks or metal, like meteorites or statues or other structures.
 ("rec28", "line", 61.06, 62.18, {"e": 63.5}),  # Everything to the right will float,   ("everything to the left," slip left out)
 ("rec28", "line", 75.42, 80.64, {"gap": 0.2}), # and it's not surprising that we shall find boats and things with empty space inside.   (the "...to the left will float" retake's slip left out)
 # animals
 ("rec28", "animals", 82.64, 86.74),  # Animals, on the other hand, all live in a much narrower range.
 ("rec28", "animals", 88.68, 91.2, {"e": 91.6}),  # That's because, as Hank Green once said it,   (his "We never left the water": DFTBA shirt, see NOTES)
 ("rec27", "animals", 276.82, 283.8, {"s": 277.8, "e": 284.3}),  # ("life is," restart left out) life started in water, and in reality we never left it, we just carried it with us.
 ("rec28", "animals", 116.84, 124.74, {"s": 117.7}),   # (a cough, "so most" and "most angels," left out) Most animals live in this range, but they will have some variation, some will be lighter and some will be heavier.
 ("rec28", "animals", 125.5, 129.3, {"s": 127.6}),     # A famous example would be the hippo.   ("For example," before it left out)
 ("rec28", "animals", 130.38, 134.36),   # The hippo, despite being an aquatic animal, does not actually swim.
 ("rec28", "animals", 144.04, 148.44),   # The hippopotamus sinks to the bottom of lakes and rivers and just walks.   (two cut-off tries left out)
 ("rec28", "big", 174.99, 184.58, {"gap": 0.6}),  # And as we go up the line, we'll find larger animals like dinosaurs or the blue whale, which is the largest animals to ever exist.   ("who ever walked earth" try left out)
 ("rec28", "big", 188.32, 190.5),     # Or the sequoia tree, the largest plant,   ("the largest single organism that we know of" left out: see NOTES)
 # what we build
 ("rec28", "built", 199.98, 200.7),   # Bigger than that,
 ("rec28", "built", 204.44, 206.86),  # and we are now clearly in engineering phase.
 ("rec28", "built", 233.9, 234.38, {"e": 234.62}),  # For example,   ("and as we move up the line we will see more engineering objects" left out: it repeats "engineering phase")
 ("rec28", "built", 219.86, 224.02, {"gap": 0.15}),  # the Eiffel Tower is very to the right because it has a lot of empty space.   (the "…the Eiffel Tower here. The Eiffel Tower…" doubling left out)
 ("rec28", "built", 246.1, 248.36),   # It is in practice a fractal.
 # mountains, rocks and small moons
 ("rec28", "rocks", 326.56, 339.48, {"s": 330.5}),  # Once we go past the largest structures we ever built, the Great Pyramid, we arrive at natural things like hills and mountains.   (earlier tries, 4:17–5:05, left out)
 ("rec28", "rocks", 282.02, 285.44),  # The Great Pyramid is in many ways a mountain itself.
 ("rec28", "rocks", 315.22, 316.9),   # Mount Everest is here,
 ("rec28", "rocks", 347.32, 358.5),   # we have lakes and glaciers, and then small asteroids and comets, and now small moons like Deimos and Phobos, the small moons of Mars.
 # round worlds
 ("rec28", "round", 358.9, 369.84),   # But something funny happens once we are past Hyperion or Vesta: now our objects are more and more round.
 ("rec28", "round", 371.64, 373.26),  # That's because at this scale,
 ("rec28", "round", 376.82, 378.06, {"gap": 0.15}),  # the force of gravity overcomes
 ("rec28", "round", 383.2, 386.42, {"gap": 0.1}),    # the molecular bond that keeps things in shape around us,
 ("rec28", "round", 401.7, 408.92, {"s": 403.1}),   # ("and everything will," left out) and everything can just be treated like a liquid, and liquids will take a spherical shape.
 # atmospheres
 ("rec28", "air", 431.74, 434.86, {"s": 432.9, "gap": 0.6}),  # ("and whether," left out) And as we climb the hill of mass,
 ("rec28", "air", 441.32, 442.06, {"e": 442.74, "gap": 0.15}),  # their mass starts
 ("rec28", "air", 442.78, 445.32, {"s": 443.1, "gap": 0.05}),  # being able to attract and retain gas.   (a stray "at" left out)
 ("rec28", "air", 450.48, 454.3, {"s": 451.45}),     # The Moon and Mercury basically have no atmosphere.   ("…no gravity" slip and a doubled "the Moon," left out)
 ("rec28", "air", 455.66, 457.1),     # Mars has one, but it's very thin.
 ("rec28", "air", 475.96, 482.18, {"e": 482.4}),  # Venus and Earth are able to trap the heavy gases, but the light gases like hydrogen and helium
 ("rec28", "air", 483.16, 486.0, {"gap": 0.12}),  # will still float out into space.
 # gas giants
 ("rec28", "giants", 491.06, 495.76), # Once we are past that, objects balloon into gas giants.
 ("rec28", "giants", 506.26, 516.12), # That's because most of the ordinary matter in the universe is hydrogen and helium, and if you can hold on to them, you will become a gas giant.   (four starts left out)
 ("rec28", "giants", 520.84, 524.96), # And you see that reflected on the graph as we move from rocky planets:
 ("rec28", "giants", 536.72, 540.14), # the gas giants are briefly on the right side of the line.
 ("rec28", "giants", 552.0, 554.54),  # Saturn is less dense than water and would float.
 # super-Jupiters and degenerate matter
 ("rec28", "jupiter", 599.92, 604.02, {"gap": 0.6}),  # But after we are past the Jupiter mass, something weird happens:   (the "10 times their sizes" try left out)
 ("rec28", "jupiter", 610.54, 623.92, {"s": 613.3}), # super-Jupiter planets, they can be much more massive than Jupiter itself, but still they will be the same size of Jupiter.
 ("rec28", "jupiter", 633.26, 646.88), # What's happening here is that the pressure in the core of those planets is becoming so tough that it's stripping away the electron layers and creating degenerate matter.
 # the split
 ("rec28", "split", 654.52, 658.0),   # And this is when our graph will split.
 ("rec28", "split", 666.64, 673.3),   # Where some objects are just shooting to the right and some objects are shooting to the left.
 ("rec28", "split", 678.7, 681.78),   # This happens right on the brown dwarfs,
 ("rec28", "split", 703.68, 711.56, {"gap": 0.3}),  # and that's happening because this is not the story of ordinary matter anymore. This is the story of life and death of stars.
]
