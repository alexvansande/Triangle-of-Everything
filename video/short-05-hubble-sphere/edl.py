# short-05-hubble-sphere: video 5, the top of the line, re-recorded at home on 2026-10-27 from
# the script in video/scripts/recording-scripts.md: one density line and the split, the dead
# stars and the Schwarzschild limit, stars and nebulae, bigger means emptier up to Laniakea and
# the voids, the second edge, expansion, the Hubble line, the cosmic event horizon, the Hubble
# sphere on the black-hole line and why it isn't one, our universe and the universe, the two
# limits, and the observable universe as a history of our own past.
# rec40 = "Hubble sphere.aifc" (iCloud Projects/triangle/recordings, 15:35, lossless AIFF-C
# from QuickTime's Maximum setting; handheld mic, the aircon off from 0:24). One run of the
# script with many retakes and notes to the editor.
# Replaces the rec29–rec31 cut of 2026-10-21 (in git history).
# Treatment: enhance.py --plain, 1.0x (natural speed, the author's choice for the home takes). Build: see video/short-01-hook/README.md.
# (source, beat, first-word start, last-word start, {s, e, gap}) in source seconds.

PAUSES = {"word": 0.18, ",": 0.3, ".": 0.45}

EDL = [
 # one line
 ("rec40", "recap", 36.80, 45.90),    # You could try to fit everything that has ever existed into one image, and probably the best way to do it is a log chart of mass and size.   (the author's preferred "Anything that has ever existed can be plotted in this chart" opens video 4 already)
 ("rec40", "recap", 122.64, 129.18),  # Do that, and every object around you will fall on this diagonal line. That's the density of things made of matter.   (a first try breaks off at "on the,")
 ("rec40", "recap", 132.04, 143.12),  # That stays true from the smallest mouse to the giant blue whale, from Mount Everest to a moon, from a meteorite to a Jupiter-sized planet. After that, though, the trend changes.   (a first "That stays true from the," left out)
 ("rec40", "recap", 145.06, 150.44, {"s": 144.15}),  # A super-Jupiter, ten times Jupiter's mass, is still about the same diameter.   (the first try; the second starts "with, with, with… a super, a super…")
 # the split and the first edge
 ("rec40", "split", 165.68, 177.22),  # And then, after brown dwarfs, the line splits. To the left, it's not ordinary matter anymore: it's the skeleton of dead stars: white dwarfs, neutron stars, and finally black holes.
 ("rec40", "split", 223.36, 244.60),  # And black holes are the first limit in our attempt to draw every possible object, because anything that gets too small or too massive becomes a black hole. And because all black holes live on this diagonal line, called the Schwarzschild radius, nothing in our universe can be above or to the left of it.   (the third try)
 ("rec40", "stars", 247.00, 252.82),  # So, to the right we have stars. When they die, they become red giants, or go pop and explode as supernovae.
 ("rec40", "stars", 265.70, 273.00),  # That gas just spreads out into space, meets other supernova remnants, and makes conditions for a new generation of stars to form.   (the second try)
 # bigger means emptier
 ("rec40", "empty", 274.88, 287.82),  # Now at this scale, things are mostly empty space: globular clusters, dwarf galaxies, galaxies. The bigger something is, the less dense it is. A galaxy is mostly empty space between its stars.
 ("rec40", "empty", 292.54, 296.92, {"s": 290.80}),  # (a first "Here's our own," left out) Here's our own galaxy, the Milky Way, and its sister, Andromeda. We live in a local group of galaxies.
 ("rec40", "empty", 298.42, 316.84),  # Galaxy clusters are even less dense, because now it's the galaxies plus all the empty space between them. And above that are the largest structures we know of, the superclusters, which come in the shapes of filaments. We live in one called Laniakea, made of about a hundred thousand galaxies.
 ("rec40", "voids", 339.82, 342.14),  # There's still something larger, actually: voids.   (two earlier tries and a first "There's" left out)
 ("rec40", "voids", 343.54, 345.14),  # Voids are just empty regions of space.
 ("rec40", "voids", 364.52, 366.12, {"s": 363.40}),  # It's weird to talk about nothing as an object.   (several tries left out)
 ("rec40", "voids", 368.42, 375.24),  # It's not completely empty. It's just emptier than the space around it. They do have mass, and they do fit in this chart.
 # the second edge
 ("rec40", "edge", 380.44, 381.62, {"s": 380.58}),   # What about anything bigger?   ("Okay." left out)
 ("rec40", "edge", 382.88, 391.60),   # If you try to go any bigger, then you reach the second edge, the limit beyond which nothing can be larger. That's the Hubble sphere.
 ("rec40", "edge", 392.94, 403.52),   # The speed of light isn't really about light, it's the speed limit for anything traveling through space. But space itself can stretch faster than that.
 ("rec40", "edge", 404.24, 420.24),   # The universe is expanding, not like a ball blowing into something, but because new space is made everywhere, as if you kept adding more pixels inside every pixel. It's like raising the resolution of an image: you take one pixel and turn it into four.   (two more tries at the last line left out)
 ("rec40", "edge", 427.36, 435.96),   # That means that the further away something is, the faster it's moving away from us. And at the Hubble line, things are moving away from us at the speed of light.
 ("rec40", "edge", 436.84, 439.14),   # You'd think that means that the light could never reach us.
 ("rec40", "edge", 440.12, 444.60),   # It's a little bit more complicated than that, because the Hubble sphere itself is growing.   ("But yeah," left out)
 ("rec40", "edge", 450.20, 453.08),   # So the light they send towards us eventually reaches us.   (a first try left out)
 ("rec40", "edge", 454.20, 472.58),   # So there's like a second edge, a little further out. That's the cosmic event horizon. That's the true edge of our universe, because nothing that happens there can ever affect us. No information can travel from there to here: no mass, no light. It's the limit of the unknowable.
 # are we inside a black hole?
 ("rec40", "bh", 483.46, 490.28),     # Now add up everything we know exists in the Hubble sphere, and here's where it lands on our chart: right on the black hole line.   (a first try left out)
 ("rec40", "bh", 491.44, 494.34, {"s": 491.45}),     # What does that mean? Are we living inside a black hole?   ("Okay," left out)
 ("rec40", "bh", 500.38, 500.38, {"s": 501.18, "e": 503.30}),  # Both are kind of an horizon.   (two tries before it and one after left out)
 ("rec40", "bh", 518.54, 528.06),     # The Schwarzschild radius is the limit where light that goes in can never come out. The cosmic horizon is the limit where nothing outside can ever come in.   (a first try left out)
 ("rec40", "bh", 529.00, 541.84),     # And both depend on mass. The size of a black hole's event horizon depends on the black hole's mass, and the size of our Hubble sphere depends on how fast the universe expands, which depends on the mass that is inside it.
 ("rec40", "bh", 542.66, 565.80),     # But that's where the similarities end. A black hole is an object with a definite center. Our universe is just that: it's our universe, it's not the universe. If you sat in a galaxy at the edge of our universe, you probably wouldn't see empty space on the other side. You would see our galaxy in one direction, and a trillion more galaxies in all the others.
 ("rec40", "bh", 570.00, 576.26),     # And as far as we've been able to measure, it may well be infinite, and it will probably look roughly the same everywhere.   (a first try left out)
 ("rec40", "limits", 628.06, 637.28),  # Those two lines, the Hubble radius and the black hole line, they represent the upper limits on how big and how massive something can be in the universe.   (the eighth try)
 # the observable universe
 ("rec40", "observable", 685.86, 687.32, {"s": 686.36}),  # There's another interesting thing.   (four tries at "There's one more thing" and a first "There's another," left out)
 ("rec40", "observable", 688.28, 697.28),  # We sort of know what someone sitting on the edge of a galaxy far, far away would see, because we are sort of seeing it right now.
 ("rec40", "observable", 719.18, 728.94),  # If you ask a scientist how big the universe is, they'll probably give you a number like 46 billion light years. That's like more than double the size of the Hubble sphere.   (the second try)
 ("rec40", "observable", 747.38, 755.80),  # And inside that sphere are galaxies that are already outside of our reach, even if you could travel at the speed of light and live forever.   (the third try)
 ("rec40", "observable", 759.02, 765.52),  # If we put all of that observable universe on the chart, it lands way outside our triangle.   ("If we put that," left out)
 ("rec40", "observable", 878.16, 891.84, {"s": 877.80}),  # That's because it's not just one object: its far sides have never been able to reach each other. And that distance is where those galaxies are right now, but what we see is the light they sent long ago, when they were much closer.   (the last of many tries; "That's because it's not, like, one," left out)
 ("rec40", "observable", 893.88, 910.22),  # So, the observable universe is less like a view of where your neighbors are, and more like a history of our own past. It tells us the story of the early universe, and of galaxies that are already far beyond our own reach.
]
