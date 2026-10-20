# short-05b-black-holes: video 5 re-recorded in one take (rec21), kept next to the
# first version (short-05-black-holes) until the author picks one.
# rec21 = "Black holes to dark matter take 3" (Google Drive "Recordings", 2026-10-20,
# 18:08, 48 kHz ALAC; noise floor about -77 dB, no clipping). It covers the whole
# video: the chart, the life of stars, black holes as the top-left limit, the known
# ones from stellar to TON 618, the small ones, primordial black holes and the
# surveys, the open window, dark matter, the galaxies' empty-space diagonal and the
# next side. Build: see video/short-01-hook/README.md.
# (source, beat, first-word start, last-word start, {s, e, gap}) in source seconds;
# the builder snaps each cut to the nearest real silence.

PAUSES = {"word": 0.18, ",": 0.3, ".": 0.45}

EDL = [
 ("rec21", "intro", 43.40, 49.66),  # everything that could have ever existed can be plotted in this chart.
 ("rec21", "intro", 55.64, 60.46),  # With size on the horizontal axis,   ("with mass on the horizontal axis" left out)
 ("rec21", "intro", 64.20, 69.02),  # and mass on the vertical axis, it's really a density scatter plot.
 ("rec21", "intro", 70.16, 72.88),  # And as you zoom in, it tells you a million stories.
 ("rec21", "intro", 75.28, 79.78),  # Like, for example, you can see the life cycle of stars
 ("rec21", "intro", 86.04, 88.88),  # as they form from stellar nurseries
 ("rec21", "intro", 91.98, 98.58),  # and collapse into protostars, then stars, and they live their life in the main sequence.
 ("rec21", "intro", 110.76, 117.20),  # And as their hydrogen is depleted, they will collapse and expand and become red giants,
 ("rec21", "intro", 135.32, 139.46, {"gap": 0.15}),  # and depending on their mass, stars will always leave a dense core behind.   ("and then explode in a supernova" left out: only heavy stars do)
 ("rec21", "intro", 140.44, 146.40),  # That could be a white dwarf, or a neutron star, or even a black hole.
 ("rec21", "line", 148.40, 154.84),  # And black holes are a very different kind of object than most we've seen.
 ("rec21", "line", 166.16, 172.16),  # Unlike most of the objects in this graph, which usually shows a cluster of dots,
 ("rec21", "line", 186.54, 190.34, {"gap": 0.15, "s": 186.72}),  # ("because" left out) all of the known black holes exist on a line,
 ("rec21", "line", 191.48, 199.30),  # and that line isn't any line, that line is the upper limit of our triangle of everything,
 ("rec21", "line", 231.62, 237.36),  # because it represents the top left limit on anything that can ever exist.
 ("rec21", "line", 242.76, 257.14),  # Anything that gets small enough, or massive enough, to cross the Schwarzschild radius will just become a black hole, and will live somewhere on this line, and never cross it.
 ("rec21", "known", 280.18, 286.38, {"gap": 0.6}),  # All of the black holes we know of are formed in the collapsing core of a dying star,
 ("rec21", "known", 303.06, 305.60),  # they're often five to a hundred of our suns,
 ("rec21", "known", 327.50, 338.46),  # they vary in size from a massive star to hundreds and thousands and millions of suns,
 ("rec21", "known", 340.04, 343.56),  # like the ones in the center of our own Milky Way,
 ("rec21", "known", 346.70, 349.78, {"gap": 0.12}),  # which has four million solar masses.
 ("rec21", "dense", 399.18, 403.58, {"gap": 0.5}),  # And as they grow massive and bigger they actually become less dense,   ("black holes are typically the size of a star" left out: see the fact check)
 ("rec21", "dense", 407.54, 408.24),  # and after some point,
 ("rec21", "dense", 411.24, 418.08, {"gap": 0.12}),  # the really supermassive black holes are actually lighter than water and could float on a pool,
 ("rec21", "dense", 420.66, 424.78),  # like the M87, the first one ever to be photographed,
 ("rec21", "dense", 427.68, 440.48),  # or TON 618, the largest black hole we know of, whose event horizon is larger than our whole solar system,
 ("rec21", "dense", 441.92, 448.24),  # and whose mass is 60 billion of our suns.
 ("rec21", "small", 450.46, 457.86, {"gap": 0.6}),  # But the most interesting story is not asking how big they can become, but really how small they can become,
 ("rec21", "small", 460.23, 468.86),  # because despite the fact that the ones we know have been formed in the collapsing core of dying stars,
 ("rec21", "small", 472.96, 480.70),  # in theory, if you could compress anything enough, it would also become a black hole.
 ("rec21", "pbh", 508.42, 517.84),  # We know those conditions exist when stars die, we don't know how to make them yet in a lab,
 ("rec21", "pbh", 518.94, 525.40),  # but we know that those conditions also existed in the early moments of the universe,
 ("rec21", "pbh", 528.60, 535.58),  # so maybe some of them have been formed, and they are still around, and we've been looking for them.
 ("rec21", "pbh", 581.18, 588.06),  # We use quasars and the cosmic background radiation, and gravitational waves,
 ("rec21", "pbh", 589.24, 594.32),  # and microlensing, and we haven't found any,
 ("rec21", "pbh", 602.34, 609.78),  # and each of those surveys limit the sizes of primordial black holes that can exist.
 ("rec21", "pbh", 612.64, 623.08),  # We also know that they cannot be too small, otherwise Hawking radiation would have evaporated them by now.
 ("rec21", "window", 695.02, 702.70),  # So each of those surveys has closed the window on primordial black holes, but the window is still open.
 ("rec21", "window", 664.02, 672.46),  # So the window that's still open would be an object with the mass of a moon compressed to the size of a virus,
 ("rec21", "window", 674.08, 681.62),  # to maybe an object the size of an asteroid compressed to the size of an atom.
 ("rec21", "window", 760.26, 766.44, {"gap": 0.5}),  # And if those objects are out there they would be invisible, they would be dark,
 ("rec21", "window", 771.46, 774.24, {"e": 774.95}),  # but we would still know that they existed
 ("rec21", "window", 777.44, 778.68, {"s": 777.35, "gap": 0.12}),  # through their effects on gravity.   (a first "through their, uh," left out)
 ("rec21", "dm", 779.24, 792.00, {"gap": 0.4}),  # And the reason we've been looking for such objects for so long is that we know something exactly like this ought to exist.
 ("rec21", "dm", 819.84, 820.54, {"e": 820.95}),  # When we measure
 ("rec21", "dm", 822.42, 829.34, {"s": 822.58, "gap": 0.05}),  # galaxies and clusters of galaxies, we find that they are much heavier than they ought to be,   ("nebulae and" left out: nebulae hold almost no dark matter)
 ("rec21", "dm", 887.22, 893.28, {"gap": 0.12}),  # sometimes 10 times more heavy than what we expected them to be in the first place.
 ("rec21", "dm", 855.08, 858.12, {"gap": 0.3}),  # And that missing mass is dark matter.
 ("rec21", "dm", 895.86, 901.22, {"gap": 0.4}),  # So most of the mass of the universe is invisible to us,
 ("rec21", "dm", 901.94, 907.04),  # and if they were in the form of microscopic black holes
 ("rec21", "dm", 916.26, 920.80, {"gap": 0.12}),  # then that wouldn't require a new particle or new physics.
 ("rec21", "dm", 923.64, 929.60, {"gap": 0.4}),  # It's possible that that window will close even further with some studies of neutron stars,
 ("rec21", "dm", 946.68, 948.90),  # but so far it is still open.
 ("rec21", "end", 956.06, 972.06, {"gap": 0.6}),  # And if we follow those large galaxies, you'll notice that unlike most of the objects in the chart that are following the density line of atoms, galaxies and clusters
 ("rec21", "end", 975.02, 987.38, {"gap": 0.12}),  # follow a different diagonal, that is the density of empty space, because most of the stuff is just empty.
 ("rec21", "end", 1036.04, 1046.16),  # Because the largest structures that we know in the universe are as dense as empty space, some of them are actually just empty space.
 ("rec21", "end", 1065.48, 1069.06, {"gap": 0.4}),  # And if you keep following that line, where do we get?
 ("rec21", "end", 1074.78, 1084.72, {"gap": 0.3}),  # We will find the second wall that limits everything that can exist. This is the second side of our triangle of everything.
]
