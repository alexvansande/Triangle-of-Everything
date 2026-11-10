# short-05a-emptier: video 5, part 1, The Largest Structures in Space, as a take of its own, from the author's
# recording of 2026-11-09 (rec62, home): the chart's density lines, denser to the left, emptier to the right, stars,
# red giants and nebulae, globular clusters, galaxies, the Local Group, clusters, superclusters (Laniakea), voids, and the
# second edge ahead. Until this take the Short was carved from video 5 (video/retired/short-05a-emptier.cut.json).
# Word timings and the fact check: video/sources/2026-11-09/. Treatment: enhance.py --plain, natural speed. The last
# try unless it slips. Build: video/short-01-hook/README.md.
# (source, beat, first-word start, last-word start, {s, e, gap, cut}) in source seconds.

SOURCES = {"rec62": "The Largest Structures in Space.aifc", "rec65": "new recordings for shorts 5.aifc"}   # rec65: the re-recorded lines (2026-11-09, 21:33)
TREATMENT = "plain"
# then video/tools/debreath.py (--min 0.03) and the audio.m4a encode as it comes (the author, 2026-11-09, evening: a
# test with and without the de-click and the 12.5 kHz low-pass added earlier that day: all clean, and without them it sounded better)
PAUSES = {"word": 0.25, ",": 0.55, ".": 1.0}
GAPS = {"same": 0.55, "beat": 1.1}
ROOM = True

EDL = [
 # the chart and its density lines
 ("rec62", "chart", 70.76, 74.38),     # In this series, I've been exploring this chart, which is a log of mass and size.   (from its second "in this series")
 ("rec62", "chart", 86.70, 93.14),     # When you do that, every diagonal becomes a density line. In here, you can see the density of water.
 ("rec62", "chart", 110.86, 116.70),   # As we go to the left, we see denser and denser objects, like brown dwarfs, white dwarfs, and neutron stars.   (the third try)
 # today: the largest, emptier and emptier
 ("rec62", "today", 146.08, 150.04),   # Today I want to explore the regions of the largest objects you know of.   (the last of four starts)
 ("rec62", "today", 191.52, 196.54),   # Now the more we go to the right, the more we are in the density of emptier and emptier space.
 ("rec65", "today", 13.58, 21.72),     # That's because the bigger something is, the less dense it is. Lots of stars are less dense than water, and some are even less dense than air.   (re-recorded: it said "most stars", see NOTES)
 # stars at the end of their lives
 ("rec65", "stars", 30.46, 40.28),     # When a star is about to die, it grows into a red giant. Its outer layers drift off into a nebula, or, if it explodes as a supernova, into a supernova remnant.   (re-recorded, its second try: a planetary nebula comes from a star that doesn't explode)
 ("rec62", "stars", 342.40, 346.06),   # Taken as a whole, those are less dense than the atmosphere of the Moon.   (the second try: the first said "the vacuum of space")
 # galaxies
 ("rec62", "galaxies", 383.50, 387.52),   # Larger than that, and you'll find globular clusters and small galaxies.
 ("rec62", "galaxies", 485.58, 488.08),   # A galaxy is mostly empty space between its stars.   (the second)
 ("rec62", "galaxies", 410.84, 415.42),   # Here we find Andromeda, our sister galaxy, and the Milky Way, which we call home.   (the third try)
 ("rec62", "galaxies", 505.46, 509.30, {"s": 507.18}),   # (from "our": "They both live in" out, the author, 2026-11-09, evening)
    # Our local neighborhood, it's called the Local Group.
 # clusters and superclusters
 ("rec62", "clusters", 513.34, 535.08),   # And then we have galaxy clusters, which are even less dense, because now it's the galaxies plus all the empty space between them. And above that, we have the largest structures we know of, superclusters, which come in the shape of filaments. We live in one called Laniakea, made of about 100,000 galaxies.
 # voids
 ("rec62", "voids", 543.94, 562.70, {"cut": [(554.30, 557.70)]}),   # There's something larger still: voids. There are big holes in space, just empty regions of space. Although not completely empty, they're just emptier than the space around them. So they do have mass, and they fit on this chart.   ("…around us." cut, for its retake "…around them.")
 # the edge ahead
 ("rec62", "edge", 597.80, 601.56, {"s": 598.25, "cut": [(598.38, 599.68)]}),   # But can you get any bigger than that?   (its first "can you get any," cut)
 ("rec62", "edge", 627.24, 635.02),    # The problem is going to be physics itself, because now we are going to meet our second edge in the triangle of everything.
]

POST_CUTS = []
