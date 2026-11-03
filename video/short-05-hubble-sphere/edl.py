# short-05-hubble-sphere: video 5, re-recorded on 2026-10-29 from the revised script (a short recap of the
# series, then up and to the right: bigger means emptier, the voids, the Hubble sphere, expansion, the cosmic
# event horizon, the Hubble sphere on the black-hole line, our universe and the universe, and the
# observable universe), much of it re-worded on the fly.
#   rec49 = "Hubble part 1.m4a" (Google Drive "Recordings", 2026-10-29, 6:28): the recap, many tries, up
#           to the Hubble sphere.
#   rec50 = "Hubble part 2.m4a" (same, 14:44): the second edge to the end, many tries, and a note to the
#           editor at 3:04 (show only the Hubble line while it's talked about; put the Hubble sphere on the
#           chart at "here's where it lands").
# The last clean try of each line is used, unless an earlier one is clearer (noted). The rec40 cut of
# 2026-10-27 is in git history.
# Treatment: enhance.py --plain, natural speed (no tempo). Build: see video/short-01-hook/README.md.
# (source, beat, first-word start, last-word start, {s, e, gap, cut, gain}) in source seconds.

PAUSES = {"word": 0.18, ",": 0.3, ".": 0.45}

EDL = [
 # where we are
 ("rec49", "recap", 90.24, 100.84, {"s": 96.2}),  # In this series, we've been exploring this chart, a log of mass and size.   (the second try: a first "…a log" at 91.0–94.7 left out)
 ("rec49", "recap", 102.38, 105.50),   # You see that everything that is made of matter is in this diagonal.
 ("rec49", "recap", 108.82, 109.74),   # But once we reach stars,
 ("rec49", "recap", 123.02, 125.44),   # to the left we have the dead remains of stars,
 ("rec49", "recap", 136.40, 141.14),   # to the right we have stars and red giants and supernova remnants.
 ("rec49", "recap", 177.86, 188.46),   # In the last video we went left to explore the black hole line, the first limit of the triangle of everything, in which nothing can go past.
 ("rec49", "recap", 231.94, 235.84),   # Today I want to take us to the right until we find what is the next edge.   (the last of six)
 # bigger means emptier
 ("rec49", "empty", 277.26, 279.40),   # Every diagonal line represents a density.
 ("rec49", "empty", 271.34, 274.84),   # We saw that neutron stars actually have the density of the neutron.
 ("rec49", "empty", 305.78, 311.20),   # And the more we go to the right, the more we are in the density of emptier and emptier space.
 ("rec49", "empty", 314.68, 330.86),   # That's because the bigger something is, the less dense it is. A galaxy is mostly empty space between its stars. Here's our own galaxy, the Milky Way, and its sister Andromeda. We live in a small group of galaxies called the Local Group.
 ("rec49", "empty", 333.04, 353.34),   # And when we are in galaxy clusters, it's even less dense, because now it's the galaxies plus all the empty space between them. And above that are the largest structures we know of, superclusters, which come in the shape of filaments. We live in one called Laniakea, made of about a hundred thousand galaxies.
 ("rec49", "voids", 355.54, 366.46),   # There's still something larger still: voids. Voids are just empty regions of space, not completely empty though, just emptier than the space around them.
 ("rec49", "voids", 371.62, 373.80),   # So they do have mass, and they fit on the chart.   (the second try)
 # the second edge
 ("rec49", "edge2", 375.62, 377.84),   # But can anything be bigger than that?
 ("rec50", "edge2", 12.56, 15.10),     # Try to go any bigger and you reach the second edge.
 ("rec50", "edge2", 18.80, 19.78),     # That's the Hubble sphere.   ("That's the limit beyond nothing can be larger" left out: "which" is missing)
 ("rec50", "edge2", 21.36, 26.32),     # The speed of light isn't really about light: it's the speed limit for anything traveling through space.
 ("rec50", "edge2", 27.32, 29.78),     # But space itself can stretch faster than that.
 ("rec50", "expand", 33.32, 36.64),    # The universe is expanding, not like a ball blowing up into something.
 ("rec50", "expand", 49.92, 53.50),    # It's more as if there's just more space being created all the time.
 ("rec50", "expand", 80.08, 86.86),    # It's like when you increase the resolution of a photo, in which you're just creating a bunch of pixels where there was just one.   (the last of five)
 ("rec50", "expand", 90.80, 94.90),    # That means that the further away something is, the faster it's moving away from us.
 ("rec50", "expand", 98.90, 102.06),   # And at the Hubble line, things are moving away from us at the speed of light.   (the second try)
 ("rec50", "horizon", 103.18, 107.32), # You'd think their light could never reach us, but it's a little bit more complicated than that.
 ("rec50", "horizon", 108.38, 113.64), # Because the Hubble sphere is also growing. So the real edge is a little bit further out.
 ("rec50", "horizon", 114.40, 115.90), # That's the cosmic event horizon.
 ("rec50", "horizon", 131.82, 136.40, {"s": 131.75}),  # ("Now there," left out) It's the limit where nothing that happens beyond it can ever affect us.
 ("rec50", "horizon", 139.52, 145.22), # We'll never see anything, because the light will never reach us. No information, no matter, nothing.
 ("rec50", "horizon", 152.96, 154.44), # It's the limit of the unknowable.   (the last of three)
 # are we inside a black hole?
 ("rec50", "bh", 170.00, 178.06),      # Now add up everything that we know exists inside the Hubble sphere, and here's where it lands on our chart: right on the black hole line.
 ("rec50", "bh", 179.28, 182.74, {"s": 179.33}),      # What does that mean? Are we living inside a black hole?   ("Okay, okay," left out)
 ("rec50", "bh", 198.94, 200.74),      # So both are kind of a horizon.   (the note to the editor before it left out)
 ("rec50", "bh", 202.32, 211.46),      # A black hole's event horizon is where light that falls in can never come out. Our cosmic horizon is where nothing outside can ever come in.
 ("rec50", "bh", 212.40, 214.96),      # Also, both depend on the mass of what's inside them.
 ("rec50", "bh", 233.28, 237.74),      # The radius of a black hole depends directly on how much stuff is in it.   (the last of four, from its second start)
 ("rec50", "bh", 243.26, 250.90),      # And the size of our Hubble sphere depends on how fast the universe expands, which depends on how much stuff is also in it.
 ("rec50", "bh", 251.52, 257.26),      # So it's no coincidence they are both on the same line. But that's where the similarities end.
 ("rec50", "ours", 258.16, 260.14),    # A black hole is an object with a centre.
 ("rec50", "ours", 265.30, 269.02),    # Our universe is just that: it's our universe, it's not the universe.
 ("rec50", "ours", 306.94, 314.92),    # What if you imagine one of those galaxies that seem on the edge for us? Well, for them, their universe will also be centred around them.
 ("rec50", "ours", 329.18, 331.84),    # If they put up a telescope and look at the galaxies around them,
 ("rec50", "ours", 334.86, 336.90),    # they won't see an empty space on one side,
 ("rec50", "ours", 337.40, 341.46),    # they will also see a bunch of other galaxies that are out of our reach.
 ("rec50", "ours", 369.10, 378.68),    # Because as far as we've been able to measure, the universe is practically infinite in all directions.   (the last of four)
 # the observable universe
 ("rec50", "obs", 388.68, 390.74),     # And how do we know they would see more galaxies?
 ("rec50", "obs", 397.14, 404.44),     # And it gets even weirder, because we know they would see more galaxies because we also see them.
 ("rec50", "obs", 424.22, 428.18, {"e": 428.30}),     # You just told me we couldn't see those galaxies, right? Yeah, but here's the thing.
 ("rec50", "obs", 444.12, 454.70),     # The Hubble sphere is roughly 13 billion light-years, but if you ask a scientist the size of the universe, they will give you a number like 46 billion light-years in every direction.
 ("rec50", "obs", 487.24, 492.76),     # What's happening is that there is yet another horizon, and that is the observable universe:
 ("rec50", "obs", 520.95, 527.97),     # that's the sum of all the light that has ever reached us.
 ("rec50", "obs", 545.79, 549.31),     # You see that this is the only object that falls outside our triangle.
 ("rec50", "obs", 585.55, 589.17),     # That's because the observable universe is not really one single object:
 ("rec50", "obs", 597.89, 600.63),     # one side can't ever talk to the other side.
 ("rec50", "obs", 706.89, 710.03),     # This represents where a bunch of galaxies are right now.
 ("rec50", "obs", 711.17, 717.71),     # When they sent us that light, they were much closer to us, and the light that they sent is arriving just now.
 ("rec50", "obs", 736.05, 741.77),     # So it's less like a map of where our neighbours are, and more like a snapshot of history.
 # the end
 ("rec50", "end", 800.05, 804.27),     # It represents galaxies that are already way beyond our reach.   ("everything we see in the observable universe is already beyond our cosmic event horizon" left out: only most of it is; NOTES)
 ("rec50", "end", 805.05, 811.01, {"e": 811.30}),     # Even if you could travel at the speed of light and live forever, you would never be able to touch them.
 ("rec50", "end", 826.63, 828.25, {"e": 828.95}),  # It represents not only your past,
 ("rec50", "end", 835.99, 838.87, {"s": 836.18}),  # but it's also a future that never will be.   (from the second try; its "not only represents our past" restarts)
 ("rec50", "end", 871.39, 875.33),     # So we'll never even be able to see where they are right now.
 ("rec50", "end", 877.57, 880.35),     # Even their future is beyond our reach.
]
