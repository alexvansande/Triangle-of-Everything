# short-04a-black-hole-slope: "The Black Hole Slope", the first black holes Short recorded on its own (rec59, 2026-11-09):
# a new opening (the chart as a tool, the bands things fall in, the left side as a cemetery of dead stars), the line as the
# first limit, the horizon growing with the mass and so a 45-degree slope, then the black holes we know, read from the old
# script, and a new ending ("…how small? … most of the things in the universe are just tiny black holes").
# The earlier version, carved from video 4's take (rec48), stays as it was for comparison: short-04a-black-hole-line
# (video/cuts/short-04a-black-hole-line.json).
# rec59 = "The Black Hole Slope.aifc" (iCloud Projects/triangle/recordings, so recorded at home; 2026-11-09, 11:13, PCM
# 48 kHz stereo, used as mono): a mic test, then one take said freely with many retakes. The author's rule: the last try
# unless it slips. Whisper word timings and the review notes: video/sources/2026-11-09/. Treatment: enhance.py --plain,
# natural speed. Build: video/short-01-hook/README.md.
# (source, beat, first-word start, last-word start, {s, e, gap, cut}) in source seconds; the builder snaps each cut to the
# nearest real silence and caps the pauses inside a clip (PAUSES).

SOURCES = {"rec59": "The Black Hole Slope.aifc"}
TREATMENT = "plain"
PAUSES = {"word": 0.25, ",": 0.55, ".": 1.0}
GAPS = {"same": 0.55, "beat": 1.1}
ROOM = True

EDL = [
 # the chart, and the bands things fall in
 ("rec59", "intro", 42.68, 55.82, {"s": 45.16}),   # I've been exploring this surprisingly useful tool where you plot every single object that exists in a log chart of size and mass, and a lot of interesting things happen.   (the third try, from its restart: "I've been explore–, I've been exploring")
 ("rec59", "bands", 80.18, 89.78),     # Most objects will fall in ranges, like this diagonal line for the density of water, or this huge vertical column for super-Jupiter planets,   (the fourth try)
 ("rec59", "bands", 138.90, 143.72),   # or this rather complex labyrinth that tells you the life and death of stars.   (the last of six)
 # the cemetery of dead stars
 ("rec59", "dead", 184.72, 189.10),    # This whole left side here is all just a big cemetery of dead stars.   (the third try)
 ("rec59", "dead", 209.60, 212.32),    # Stars like ours will leave a white dwarf behind.   (the last of four)
 ("rec59", "dead", 216.82, 219.52),    # Larger ones will go supernova and make a neutron star.   (the restart)
 ("rec59", "dead", 240.92, 245.66),    # But larger still and they will leave a black hole, and every black hole lives on this line.   (the last of three)
 # the line
 ("rec59", "line", 250.40, 257.10),    # And this line is special, because it actually represents the first limit we meet on our chart of everything,   (the restart)
 ("rec59", "line", 407.84, 415.62),    # because for every object you can see, there is some size in which if you squeeze them hard enough, they will become a black hole.   (the last whole try of about fifteen starts)
 # ("And every black hole lives precisely on this line, never crossing it." left out: said just before, and the cut has to stay well under three minutes)
 ("rec59", "line", 431.18, 438.78),    # So this line, called the Schwarzschild radius, represents the upper limit in which anything can be.
 # the slope
 ("rec59", "slope", 468.28, 484.98, {"s": 467.66}),   # And black holes don't actually have a size, they're a singularity, but they do have an event horizon, the point in which light cannot escape, and that event horizon is dependent on the mass, so it creates this diagonal, one-to-one, 45 degrees slope.   (the last try, from its restart "and black holes", the whole "and": it runs into "black"; "that represents the upper limit of our chart" left out: said in the line before and after)
 ("rec59", "slope", 532.84, 539.26),   # It means that according to relativity, there are no objects that could exist beyond this line.   (the last of seven)
 # the black holes we know
 ("rec59", "big", 546.36, 552.34, {"s": 546.13}),   # Squeeze the Sun into a black hole and it would be about six kilometers wide. The Earth would be the size of a marble.   (the start given: the snap had clipped the "S")
 ("rec59", "big", 553.72, 561.38),     # The black holes we know of form in the collapsing core of dying stars, or just grew by swallowing gas and merging with other black holes.
 ("rec59", "big", 574.78, 578.62, {"s": 574.87}),   # They can go anything from a few Sun masses to billions of them.   (the last of three, from its restart; the first says "a few billion suns")
 ("rec59", "big", 580.18, 584.54),     # The one in the center of the Milky Way, for example, has 4 million solar masses.
 ("rec59", "big", 585.92, 608.50),     # And here's a strange part. The bigger they get, the less dense they are. The really supermassive ones are less dense than water. They would float if you had a pool big enough. Like M87, the first black hole ever to be photographed. Or TON 618, one of the largest we know of. Its event horizon is bigger than Pluto's orbit.
 # the small ones
 ("rec59", "small", 630.14, 634.84),   # But the most interesting question isn't actually how big a black hole can be, but how small?   (the second try)
 ("rec59", "small", 656.30, 666.80, {"s": 659.68}),   # Because there are actually some people who believe that most of the things in the universe are just tiny black holes.   (the last of three, from its third start: "Because, because there are, because there are actually")
]

POST_CUTS = []
