# short-05-hubble-sphere: video 5 (video 6 until 2026-10-21), the top of the line, re-recorded
# in the author's own words: one density line and the split, the dead stars and the
# Schwarzschild limit, stars and nebulae, bigger means emptier up to Laniakea and the voids,
# the second edge, expansion, the Hubble line, the cosmic event horizon, the Hubble sphere on
# the black-hole line and why it isn't one, everyone's own universe, the two limits, and the
# observable universe as a history of our own past.
# rec29 = "hubble sphere take 2 (incomplete).m4a", rec30 = "event horizons.m4a",
# rec31 = "observable universe.m4a" (iCloud recordings, 2026-10-21, 48 kHz, Boya BY-V10).
# Replaces the rec26 cut (in git history). The Planck-point line is saved for a later video.
# Treatment: enhance.py --plain, 1.1x.
# (source, beat, first-word start, last-word start, {s, e, gap}) in source seconds.

PAUSES = {"word": 0.18, ",": 0.3, ".": 0.45}
# rec31 was recorded about 7 dB hotter than rec29 and rec30
SOURCE_FX = {"rec31": "volume=-7dB"}

EDL = [
 # one line
 ("rec29", "recap", 33.06, 44.68),    # You can try to fit everything that has ever existed in one image, and probably the best way to do that is using a log chart of mass and size.   (two starts left out)
 ("rec29", "recap", 78.54, 87.24),    # And if you do that, every object around you that you can see will probably fall on this diagonal density line.   (five tries left out)
 ("rec29", "recap", 88.56, 91.14),    # This is the density of things made of matter,
 ("rec29", "recap", 131.48, 146.7),   # that will remain true from the smallest mouse to the giant blue whale, from Mount Everest to a moon, from Earth to a Jupiter-sized planet.   (four tries left out)
 # the split (rec31)
 ("rec31", "split", 171.99, 174.93, {"gap": 0.6}),  # When we get to Jupiter-sized planets, the trend changes.   ("the trend reversed" tries left out)
 ("rec31", "split", 187.37, 193.11),  # A super Jupiter, ten times the mass of Jupiter, will still have the same diameter.
 ("rec31", "split", 204.03, 208.25),  # And then after brown dwarfs, the line really splits.
 # the left and the first limit (rec29)
 ("rec29", "left", 178.06, 180.88, {"gap": 0.6}),  # To the left, we don't have normal matter anymore.
 ("rec29", "left", 181.78, 186.1, {"e": 186.75}),  # We have the skeletal remains of dead stars, white dwarfs,
 ("rec29", "left", 190.54, 193.14, {"gap": 0.15}), # and neutron stars and finally black holes.   (a second "white dwarfs" left out)
 ("rec29", "left", 216.04, 221.12),   # And black holes will actually represent the first limit in our attempt to draw every object possible,
 ("rec29", "left", 235.86, 241.88),   # because every object that becomes too small or too massive becomes a black hole,
 ("rec29", "left", 246.0, 250.76),    # and black holes all live in this diagonal line called the Schwarzschild radius.
 ("rec29", "left", 259.36, 262.04),   # No object in our universe can be above that.
 # the right (rec31)
 ("rec31", "right", 220.77, 228.81, {"gap": 0.6}), # And to the right we have stars, and when they die they become red giants, and they will go pop and explode into supernovas.
 ("rec31", "right", 273.31, 279.67, {"e": 280.3}),  # And that gas will just expand out into space and meet other supernova remnants,   (three earlier tries left out)
 ("rec31", "right", 285.29, 291.53, {"s": 288.9, "e": 291.75, "gap": 0.15}),  # and create the conditions for a new generation of stars   ("and create the conditions for new stars," left out)
 ("rec31", "right", 296.35, 297.13, {"s": 298.1, "gap": 0.05}),  # to form again.   (a cut-off "to bor…" and a repeat left out)
 # bigger means emptier (rec29)
 ("rec29", "empty", 298.36, 302.56, {"gap": 0.6}), # And at this scale, things are mostly made of empty space.
 ("rec29", "empty", 309.3, 312.3),    # Globular clusters and dwarf galaxies and galaxies.
 ("rec29", "empty", 355.22, 362.06),  # At this scale, the larger something becomes, the less dense it is.
 ("rec29", "empty", 363.92, 369.44),  # A galaxy is mostly empty space between the stars.
 ("rec29", "empty", 378.88, 384.3, {"e": 384.7}),  # Our own galaxy here, the Milky Way, and its sister, the Andromeda,
 ("rec29", "empty", 391.1, 393.46),   # and we live in a local group of galaxies.
 ("rec29", "empty", 407.02, 416.42),  # And galaxy clusters are even less dense, because it's the density of the galaxies plus all the empty space in between them.
 ("rec31", "empty", 350.05, 368.91),  # And above that we have the largest structures that we know of, those are superclusters, which come in the shape of filaments. We live on one called the Laniakea supercluster, which is made of a hundred thousand galaxies.
 # voids (rec31)
 ("rec31", "voids", 105.43, 109.03),  # There is still something larger, and those are the voids.
 ("rec31", "voids", 110.23, 112.55),  # Voids are just empty areas of space.
 ("rec31", "voids", 127.79, 136.27, {"e": 136.6}),  # They are not completely empty, they are just emptier than space around them, so they do have mass and they fit in this chart.   ("and, to be honest, we are not sure what even causes them to exist" left out: we do know)
 # the second edge (rec29)
 ("rec29", "edge", 603.26, 607.62, {"e": 608.3, "gap": 0.6}),  # What about anything bigger? Well, if you try to go any bigger,
 ("rec29", "edge", 608.74, 618.68, {"s": 612.2, "gap": 0.12}),  # then you will reach the second edge, the limit beyond where nothing can be bigger.   ("then it will, then it will, then it," left out)
 ("rec29", "edge", 622.54, 624.5),    # And that will be the Hubble sphere.
 ("rec29", "edge", 661.2, 670.18, {"e": 670.6, "gap": 0.6}),  # The speed of light is not about light, but it's really the speed limit of how fast anything can travel in space,
 ("rec29", "edge", 681.0, 687.38),    # but space itself can actually travel faster than that.
 ("rec29", "edge", 711.52, 717.78, {"e": 718.3}),  # The universe is expanding, not in the sense that it's a ball expanding into something,
 ("rec29", "edge", 723.74, 736.98),   # but rather that space itself is being created, as if we were adding more and more pixels inside each pixel.
 ("rec29", "edge", 772.1, 779.76, {"e": 780.2}),   # Similar to how, when you want to increase the resolution on an image, what you do is you just take one pixel and turn that into four.
 ("rec29", "edge", 800.82, 808.72, {"gap": 0.6}),  # And that means that the further away something is from us, the fastest it is running away from us.
 ("rec29", "edge", 837.08, 841.18, {"s": 839.6}),   # And at this point, in the Hubble line,   ("and everything," left out)
 ("rec30", "edge", 16.0, 23.62, {"s": 20.2}),      # ("things that happen here are moving away from…" restart left out) things that happen here are moving away from us at the speed of light.
 # the cosmic event horizon (rec30)
 ("rec30", "horizon", 47.86, 51.52),  # You'd think that it means that it would never reach us, but that's not exactly true.
 ("rec30", "horizon", 51.94, 53.66, {"s": 52.0, "e": 54.0}),  # It's a little bit more complicated than that,
 ("rec30", "horizon", 57.48, 66.0),   # because the Hubble sphere itself is also growing, so things that happen here will eventually slow down and be able to reach us.
 ("rec30", "horizon", 73.42, 79.0),   # There is a second point a little bit over here, which is the cosmic event horizon,
 ("rec30", "horizon", 89.74, 97.8),   # and this is truly the edge of our universe, because nothing that happens here can ever affect us.
 ("rec30", "horizon", 115.98, 120.66),  # No information will travel from here to there, no mass, no light.
 ("rec30", "horizon", 130.96, 134.92, {"s": 132.8}),  # ("when we," left out)  # This is the limit of the unknowable.
 # the Hubble sphere on the black-hole line
 ("rec31", "twist", 25.18, 36.12, {"s": 31.9, "gap": 0.7}),  # (two false starts left out) Now, if you add up everything that we know exists on the Hubble sphere,
 ("rec31", "twist", 53.29, 55.75),    # here is where it would fit on our chart.
 ("rec30", "twist", 183.94, 189.02, {"e": 189.4}),  # You see that the mass actually falls exactly on the black hole line.
 ("rec30", "twist", 218.12, 218.9),   # What does it mean?
 ("rec30", "twist", 228.22, 230.24),  # Are we living inside a black hole?
 ("rec30", "twist", 239.96, 245.52),  # Both of those represent an event horizon in some way.
 ("rec30", "twist", 252.26, 255.32, {"s": 253.6, "e": 255.6}),  # The Schwarzschild radius is   (a doubled "the Schwarzschild" left out)
 ("rec30", "twist", 258.62, 262.78, {"gap": 0.12}),  # the limit in which light that enters it can never come out.
 ("rec30", "twist", 263.74, 269.64),  # And the event horizon is the limit that anything outside of it can never come in.
 ("rec30", "twist", 277.15, 280.06),  # And they both are dependent on mass.
 ("rec30", "twist", 285.14, 292.44, {"s": 287.15}),  # ("the size of a," left out) The size of an event horizon of a black hole depends on the mass of the black hole,
 ("rec30", "twist", 295.35, 297.42, {"e": 297.8}),  # and the size of our Hubble sphere
 ("rec30", "twist", 310.54, 319.12, {"gap": 0.12}),  # depends on the rate of expansion of the universe, which is dependent on the mass inside it.
 # our universe
 ("rec30", "ours", 329.94, 331.68, {"gap": 0.6}),  # But the similarities also end here,
 ("rec30", "ours", 340.66, 344.1),    # because a black hole is an object with a definitive center.
 ("rec30", "ours", 345.5, 350.9, {"s": 347.4}),     # ("and, um," left out) Our universe is just that, it's our universe.
 ("rec30", "ours", 353.56, 355.64),   # It's not the universe.
 ("rec30", "ours", 380.06, 387.34),   # If you are sitting on a galaxy in the edge of our universe, you will probably not see just empty space on the other side,
 ("rec30", "ours", 392.06, 397.82),   # you'll probably see our galaxy in one direction and a trillion more galaxies in the others,
 ("rec31", "ours", 17.4, 21.92, {"gap": 0.4}),   # as far as we have been able to measure, it may well be infinite,   (rec30's "the universe is infinite" left out)
 ("rec30", "ours", 410.0, 413.28, {"gap": 0.2}), # and probably looks roughly the same everywhere.
 # the two limits
 ("rec31", "limits", 425.33, 429.99, {"e": 430.4, "gap": 0.6}),  # Those two lines, the Hubble radius and the Schwarzschild radius,
 ("rec31", "limits", 433.79, 442.09, {"gap": 0.15}), # and they form the upper limits of how big, how small and how massive a thing can be in the universe.   ("meet on the observable universe" left out: they meet at the Hubble sphere)
 # the observable universe (rec31)
 ("rec31", "end", 512.59, 513.85, {"gap": 0.6}),  # There is, however, one more thing:
 ("rec31", "end", 514.21, 520.25),    # if you ask a scientist the size of the universe, they will probably throw a number like 46 billion light-years,
 ("rec31", "end", 540.97, 550.73, {"s": 542.95}),  # ("let me… inside the…" left out)    # and inside that sphere we will see galaxies that are right now already unreachable for us,
 ("rec31", "end", 573.85, 577.37),    # even if you could travel at light speed and live forever.
 ("rec31", "end", 584.95, 591.73),    # If we map that observable universe, it will fit way outside our triangle.
 ("rec31", "end", 674.67, 676.85),    # But that object is a little bit of an illusion.
 ("rec31", "end", 677.79, 685.33),    # That is the light that is reaching us right now. That doesn't represent where they were when the light first emitted,
 ("rec31", "end", 690.55, 700.97, {"s": 691.9}),  # ("they rather," left out)    # but rather that represents where those objects would be right now if they were not out of our reach.
 ("rec31", "end", 735.37, 739.77),    # The observable universe is less like a view of where your neighbour is,
 ("rec31", "end", 748.53, 750.71),    # but more like the history of our own past.
 ("rec31", "end", 752.25, 760.23),    # It tells us the story of the early universe and galaxies that are already far beyond our reach.
]
