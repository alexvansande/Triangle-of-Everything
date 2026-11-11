# short-05a-emptier: video 5, part 1, The Largest Structures in Space, as a take of its own. Re-recorded whole in one
# sitting on 2026-11-11 (rec66, "5A morning take", home: the author's morning voice), replacing the 2026-11-09 cut from
# rec62 with rec65's patched lines, which didn't match the rest. The chart's density lines, denser to the left, emptier to
# the right, stars, red giants and nebulae, globular clusters, galaxies ("here we find home"), the Local Group, clusters,
# superclusters (Laniakea), voids, and a new ending: the rightmost limit, where the expansion of the universe meets the
# speed of light (the author dropped "our second edge in the triangle of everything": the video never names the triangle).
# Word timings and the fact check: video/sources/2026-11-11/. Treatment: enhance.py --plain, natural speed. The last
# try unless it slips. Build: video/short-01-hook/README.md. The earlier cut lists are in git history.
# (source, beat, first-word start, last-word start, {s, e, gap, cut}) in source seconds.

SOURCES = {"rec66": "5A morning take.m4a",   # 2026-11-11 08:39 (11:39 UTC), ALAC 48 kHz stereo, 7:45
           "rec70": "Retakes for the short.m4a"}   # 2026-11-11 10:07 (13:07 UTC), the dying-star sentence said again with "red giant" (the fact check), 4:52
TREATMENT = "plain"
# then video/tools/debreath.py (--min 0.03) and the audio.m4a encode as it comes (the author, 2026-11-09, evening)
PAUSES = {"word": 0.25, ",": 0.55, ".": 1.0}
GAPS = {"same": 0.55, "beat": 1.1}
ROOM = True

EDL = [
 # the chart and its density lines
 ("rec66", "chart", 35.18, 39.34),     # In this series, I've been exploring this chart, which is a log of mass and size.
 ("rec66", "chart", 40.06, 44.92),     # When you do that, every diagonal becomes a density line. And here you can see the density of water.
 ("rec66", "chart", 45.74, 51.32),     # As we go to the left, we see denser and denser objects, like brown dwarfs, white dwarfs, and neutron stars.
 # today: the largest, emptier and emptier
 ("rec66", "today", 53.16, 56.62),     # Today, I wanna explore the regions of the largest objects we know of.   (the first try: the second, 65.7, has a quiet "today" said again before "I", which the clip-by-clip pass found)
 ("rec66", "today", 70.62, 75.02),     # Now, the more we go to the right, the more we are in the density of emptier and emptier space.
 ("rec66", "today", 75.76, 78.50),     # That's because the bigger something is, the less dense it is.
 ("rec66", "today", 84.42, 89.02),     # A lot of stars are less dense than water, and some are even less dense than air.   (the second try; the first stopped at "water")
 # stars at the end of their lives
 ("rec70", "stars", 37.29, 46.82),     # When a star is about to die, it grows into a red giant, and its outer layers drift off into a nebula, or, if it explodes as a supernova, a supernova remnant.   (the retake, its last try: rec66 said "supergiant", which is wrong for the nebula branch; see NOTES)
 ("rec66", "stars", 103.24, 106.44),   # Taken as a whole, those are less dense than the atmosphere of the Moon.   (the first try: the second, 108.1, restarts, "Taken as a, taken as a whole", which the clip-by-clip pass found)
 # galaxies
 ("rec66", "galaxies", 131.40, 134.10),   # Larger than that, and you find globular clusters and small galaxies.   (the fourth start: twice it stopped at "clusters and"; Whisper had merged this one with the try before it, its words come from a transcription of the clip alone)
 ("rec66", "galaxies", 169.96, 174.60),   # Those are even less dense, because a galaxy is really mostly the empty space between the stars.   (a new line, its last try; the first clean one was "Now, that's even less dense because a galaxy is mostly empty space between its stars", 137.9)
 ("rec66", "galaxies", 205.92, 213.14),   # Here we find home: that's the Milky Way, and Andromeda, our sister galaxy. Our neighborhood of galaxies is called the Local Group.   (the author's rewrite of "Here we find Andromeda… Our local neighbourhood"; from its second "here we find home")
 # clusters and superclusters
 ("rec66", "clusters", 221.80, 229.09),   # And above that we have galaxy clusters, which are even less dense, because now it's the galaxies plus all the empty space between them.   (the second try)
 ("rec66", "clusters", 237.15, 249.77),   # And then above that, we have the largest structures we know of. Those are the superclusters, which come in the shape of filaments. We live in one called the Laniakea, made of about a hundred thousand galaxies.
 # voids
 ("rec66", "voids", 251.67, 253.79),      # And there's something larger still: voids.
 ("rec66", "voids", 261.55, 272.49),      # Voids are big holes in space, just empty regions. Not completely empty, though: they're just emptier than the space around them, so they do have mass, and they fit in this chart.   (from its third "voids")
 # the edge ahead
 ("rec66", "edge", 445.49, 446.23),       # Can you get any bigger?   (the last of twelve tries at the ending)
 ("rec66", "edge", 452.15, 460.69),       # Well, no, because there is a rightmost limit in our chart, and it's where the expansion of the universe meets the speed of light.
]

POST_CUTS = []
