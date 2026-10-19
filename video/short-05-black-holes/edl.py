# short-05-black-holes: black holes are a line, not a kind of object. The chart so far,
# the Schwarzschild radius as the limit nothing can cross, why it is a 1 : 1 line, every
# known black hole on it, big first (Sgr A*, Andromeda, M87*, TON 618, less dense than
# water), then the small ones (engineered, primordial), the hunt for them as dark matter,
# and a cliffhanger on the chart's dark-matter line.
# Cut from rec18 = "black holes.m4a" (iCloud recordings, 2026-10-19, 16:08, 48 kHz AAC;
# a different room from rec12–17, one take with many retries) up to "every black hole
# will be on this line"; then rec19 = "black holes and dark matter .m4a" (2026-10-19, 10:55,
# same room), which re-records the rest big-first, so the video ends on dark matter
# instead of TON 618 (the author's note at the start of rec19). Build: see
# video/short-01-hook/README.md.
# (source, beat, first-word start, last-word start, {s, e, gap}) in source seconds;
# the builder snaps each cut to the nearest real silence.

PAUSES = {"word": 0.18, ",": 0.3, ".": 0.45}

EDL = [
 ("rec18", "intro", 51.54, 55.52),     # Anything that ever existed can be plotted in this chart,
 ("rec18", "intro", 66.72, 75.52, {"gap": 0.2}),  # featuring mass on the vertical axis and diameter on the horizontal axis. It is in effect a density scatter plot.   (two restarts left out)
 ("rec18", "intro", 83.72, 84.98),     # It tells you a million stories,
 ("rec18", "intro", 125.08, 127.34, {"gap": 0.2}),  # I have been covering a lot of those stories.   (three restarts left out)
 ("rec18", "intro", 128.66, 129.02),   # For example,
 ("rec18", "intro", 132.22, 155.96, {"gap": 0.15}),  # how stars are formed in stellar nurseries ... a white dwarf or a neutron star, or the strangest object of all, the black holes.
 ("rec18", "intro", 159.14, 161.3),    # Now I want to tell you a little bit about black holes.
 ("rec18", "line", 165.22, 183.14),    # But unlike most of the other objects ... black holes are not really one object, not even a category of objects, but a line,
 ("rec18", "line", 230.78, 236.92, {"gap": 0.2}),  # really, they are one of the three sides of the triangle of everything.   ("the top half of the three lines" and the restarts left out)
 ("rec18", "limit", 238.2, 251.0),     # And the reason is that they represent a limit of both mass and size that anything can be in the universe.
 ("rec18", "limit", 258.26, 266.48),   # There is a point in which nothing can become more massive or more compact than this line.
 ("rec18", "schw", 283.24, 342.02),    # This line is called the Schwarzschild radius ... a straight one-to-one slope line, going 45 degrees here.   (first try left out)
 ("rec18", "onthe", 385.82, 391.7, {"s": 387.35}),  # But in reality, anything that reaches this line is a black hole, and
 ("rec18", "onthe", 397.18, 399.34, {"gap": 0.12}),  # every black hole will be on this line.   ("anything and" left out)
 # rec19: big black holes first
 ("rec19", "big", 28.6, 33.86),        # So, we know black holes are formed when massive stars collapse,
 ("rec19", "big", 37.08, 44.54, {"gap": 0.15}),  # and those dots here show you a list of all known black holes,
 ("rec19", "big", 51.2, 55.42, {"gap": 0.15}),   # and they all of course follow the same line.   ("linear", "in this" left out)
 ("rec19", "big", 90.28, 95.24),       # And they vary in size, from just the size of stars
 ("rec19", "big", 97.76, 101.6, {"gap": 0.12}),  # to the ones that are in the center of galaxies,
 ("rec19", "big", 65.06, 70.84, {"gap": 0.15}),  # like the one in the center of our own Milky Way, or the one in the center of the Andromeda Galaxy.
 ("rec19", "big", 116.87, 123.54),     # Like the M87, which was the first one to be photographed, or the TON 618,
 ("rec19", "big", 229.11, 231.01, {"gap": 0.12}),  # the largest black hole we know,
 ("rec19", "big", 133.01, 137.01, {"gap": 0.12}),  # whose event horizon would swallow our whole solar system.
 ("rec19", "dense", 161.93, 166.27),   # As black holes become more massive, they actually become less dense.
 ("rec19", "dense", 172.77, 185.33),   # There's a point in which the supermassive black holes are actually less dense than water, and again could float on a pool if you had one big enough.   (the ocean joke left out, and the take that says all galaxy-centre ones are: see the fact check)
 # then the small ones
 ("rec19", "small", 276.75, 285.09),   # But there's also a very cool story towards the other end of this line, into smaller black holes,
 ("rec19", "small", 295.85, 300.09, {"gap": 0.15}),  # despite the fact that black holes are formed when giant stars collapse,   ("there is no reason that they could exist in other ways" left out: it says the opposite)
 ("rec19", "small", 308.79, 315.15, {"gap": 0.2}),   # if you had the technology to make a black hole, you could build a black hole of any size.
 ("rec19", "pbh", 318.95, 322.53),     # But other than in some alien tech laboratory,
 ("rec19", "pbh", 327.25, 329.95, {"gap": 0.15}),  # the only natural way in which we know that
 ("rec19", "pbh", 330.17, 330.49, {"gap": 0.05}),  # black holes
 ("rec19", "pbh", 331.59, 332.55, {"gap": 0.08}),  # might have been formed,   ("have been," left out)
 ("rec19", "pbh", 333.67, 341.09, {"gap": 0.12}),  # are in the very early moments of our universe's history,
 ("rec19", "pbh", 344.77, 347.33, {"gap": 0.12}),  # when everything was a dense soup of materials.
 ("rec19", "pbh", 350.97, 355.65),     # We know that those black holes could have existed, and we've been looking for them.
 ("rec19", "pbh", 378.45, 382.79),     # While we have already looked into many sizes,
 ("rec19", "pbh", 385.73, 392.29, {"gap": 0.12}),  # there are still some ranges in which we haven't been able to look in yet, and they could be there.
 ("rec19", "pbh", 392.65, 409.65),     # We are talking about sizes that will be like a small asteroid or a mountain, but the size of a grain of sand, or maybe the size of a single proton.
 ("rec19", "pbh", 411.27, 413.01),     # Those are primordial black holes.
 ("rec19", "dm", 432.87, 439.35),      # Those would be tiny particles that are invisible to any telescope,
 ("rec19", "dm", 457.63, 466.31, {"gap": 0.15}),   # but you could detect them by the gravitational effects on the galaxies as a whole.
 ("rec19", "dm", 468.51, 472.99),      # And the interesting part is that we do know that those effects exist.
 ("rec19", "dm", 486.89, 500.21),      # And the reason we're looking for them is that we know galaxies are full of something that is very massive, yet invisible,
 ("rec19", "dm", 503.31, 511.75, {"gap": 0.12}),   # and if primordial black holes exist, they could explain that without us needing to invoke any sort of new physics.   ("and primordial" slip left out)
 # ending: the dark-matter line
 ("rec19", "end", 584.41, 596.15),     # And another way you can see all this missing dark matter in our universe, in our chart, is by looking at galaxies.
 ("rec19", "end", 602.83, 604.53),     # Galaxies and clusters,   ("globular clusters" take left out: they hold almost no dark matter)
 ("rec19", "end", 623.95, 638.75, {"gap": 0.15}),  # you see that they follow a completely separate diagonal line, in which they are much larger than we would expect.
 ("rec19", "end", 642.61, 651.61),     # And that different diagonal line is probably due to the existence of dark matter.
]
