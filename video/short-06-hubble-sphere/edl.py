# short-06-hubble-sphere: video 6, the top of the line. Bigger means emptier, from nebulae
# to voids and the average density of the universe; the two edges, the Schwarzschild
# line and the Hubble radius; our own universe and everyone else's; the Hubble sphere on
# the black-hole line, and why; the observable universe outside the triangle.
# Cut from rec26 = "Hubble Sphere.m4a" (iCloud recordings, 2026-10-21, 8:30, 48 kHz),
# read from the v2 script in video/plans/06-hubble-sphere.md (rec25 was the rough draft).
# (source, beat, first-word start, last-word start, {s, e, gap}) in source seconds.

PAUSES = {"word": 0.18, ",": 0.3, ".": 0.45}

EDL = [
 # recap
 ("rec26", "recap", 9.64, 36.58),      # When you put everything that exists in one chart of mass and size ... to the right stars and red giants, which die and blow out in clouds of gas.   (two false starts left out)
 # bigger means emptier
 ("rec26", "empty", 37.76, 41.52, {"gap": 0.5}),   # Everything bigger than a star gets emptier the bigger it is.
 ("rec26", "empty", 42.58, 50.28),     # A nebula is a thin cloud, a galaxy is mostly empty space between its stars: about one atom every cubic centimeter.
 ("rec26", "empty", 51.1, 62.4),       # Our galaxy lives in a small local group, and groups gather in clusters, and clusters are even emptier, because now you count the space between the galaxies too.
 ("rec26", "empty", 63.68, 66.26),     # Then the largest structures we've mapped: superclusters.
 ("rec26", "empty", 67.6, 69.36),      # The one we live on is called Laniakea,
 ("rec26", "empty", 74.32, 80.12, {"gap": 0.15}),  # a hundred thousand galaxies strung along filaments, half a billion light-years across.   ("around a hundred thousand star," left out)
 ("rec26", "empty", 80.74, 94.06),     # And then there are voids. A void is a giant hole ... it's not empty, it's just emptier than average.
 ("rec26", "empty", 95.24, 100.44),    # At this scale everything comes down to, sort of, the average density of the universe,
 ("rec26", "empty", 108.52, 112.52, {"gap": 0.15}),  # roughly five hydrogen atoms for every cubic meter,   (the first try, "the mass of let's say five hydrogen atoms in every meter", left out)
 # the two edges
 ("rec26", "edges", 113.6, 129.18, {"gap": 0.15}),  # which brings us to the edge of the triangle. The first one we met last time, the Schwarzschild line ... black holes never cross that line, they live on it.
 ("rec26", "edges", 131.58, 137.98),   # Nothing can exist up or to the left of this line.   ("nothing can exist," restart left out)
 ("rec26", "edges", 138.32, 142.98),   # And now the other edge isn't about how small something can be, but how big.
 ("rec26", "edges", 147.74, 169.94),   # Nothing can travel through space faster than light, but space itself can. So the universe is expanding ... about 14 billion light-years out it's carried away at the speed of light.   (the first try, "through the universe… but that", left out)
 # our own universe
 ("rec26", "ours", 175.0, 175.8),      # And a little further,
 ("rec26", "ours", 187.8, 190.64, {"gap": 0.12}),  # about 17 billion light-years, that's the real horizon.   (the "real Earth" try left out)
 ("rec26", "ours", 191.98, 215.82),    # Anything that happens there, right now, will never reach us ... This is in practice the edge of our own universe. Our universe, not the universe.
 ("rec26", "ours", 222.64, 229.82, {"s": 222.45}),  # As far as we can measure, it may well be infinite, and beyond our horizon it probably looks just like here. We'll never know.   (the first try, "it may be well infinite and beyond our…", left out)
 ("rec26", "ours", 230.32, 242.9),     # And the horizon is centered on us. A galaxy near our edge has its own, centered on it, and we are the ones at the edge. Everyone gets their own universe.
 # the twist
 ("rec26", "twist", 244.74, 245.62),   # Now here's the strange part.
 ("rec26", "twist", 246.68, 249.84),   # Count everything inside that sphere, even dark energy,
 ("rec26", "twist", 256.2, 262.96, {"gap": 0.12}),  # and put it on a chart. It lands right on the black hole line. So is our universe a black hole?   (the first try, cut off at "speeding up the…", joined to the second)
 ("rec26", "twist", 263.96, 268.94),   # No. A black hole is a lump of mass in empty space, its center falling in on itself.
 ("rec26", "twist", 271.78, 274.78, {"gap": 0.3}),  # The universe has no center, and no outside, and it's expanding.   ("The universe has no center," first try and the horizon lines left out)
 ("rec26", "twist", 283.82, 285.72, {"gap": 0.4}),  # But it's not a coincidence either,
 ("rec26", "twist", 303.72, 309.06, {"gap": 0.12}),  # because the rate of expansion of the universe is related to the mass that it contains.   ("balanced on a knife's edge" left out: the author didn't like it)
 ("rec26", "twist", 313.12, 321.96),   # It's like escaping the orbit of a planet: the more massive it is, the harder it is for you to escape it.   ("it's like light escaping" left out)
 ("rec26", "twist", 332.16, 339.24, {"gap": 0.4}),  # It has always been this way: since the Big Bang our horizon has been sliding up this line, from the Planck point to the corner.   (two earlier tries left out)
 # one more horizon
 ("rec26", "close", 352.82, 365.92),   # There's actually one more horizon: the farthest light that has ever reached us, from places that are now 46 billion light-years away. It falls on the same line, which is the average density of the universe.
 ("rec26", "close", 431.7, 440.02),    # But that point, the universe we can observe, sits outside the triangle of everything.
 ("rec26", "close", 440.64, 454.3),    # But it's sort of an illusion, because the light that reaches us is not there ... It was closer to us
 ("rec26", "close", 457.7, 459.46, {"gap": 0.1}),  # due to the expansion of the universe.   ("due to the distance of the universe" left out)
 ("rec26", "close", 497.18, 507.08, {"gap": 0.5}),  # That's why those two lines, the black hole line and the Hubble line, represent the limit of anything that can exist right now.
]
