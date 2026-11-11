# short-00-powers-of-ten: the narrated powers-of-ten zoom, re-recorded whole on 2026-11-11 (rec69, "Powers of 10",
# home, the morning session: "since I'm on a roll"), in place of rec52 (2026-11-03). The author's full three-minute
# script: the universe infinite as far as we can measure, the oldest light, the cosmic event horizon, superclusters,
# Laniakea, home, the Sun, the Oort cloud, Earth, the sequoias, a ladybug, pollen, an amoeba, DNA, the atom, quarks,
# quantum fields, the Planck scale, and one big game of life. Word timings and the fact check: video/sources/2026-11-11/.
# Treatment: enhance.py --plain, natural speed. The last try unless it slips. The zoom's keys (zoom-keys.json) must be
# re-timed to this voice in the zoom's own checkout (docs/narration.md, "zoom").
# (source, beat, first-word start, last-word start, {s, e, gap, cut}) in source seconds.

SOURCES = {"rec69": "Powers of 10.m4a"}   # 2026-11-11 09:11 (12:11 UTC), ALAC 48 kHz stereo, 12:00
TREATMENT = "plain"
# then video/tools/debreath.py (--min 0.03) and the audio.m4a encode as it comes
PAUSES = {"word": 0.18, ",": 0.3, ".": 0.45}   # the zoom's tighter pauses, as rec52 (the Short must end with the 3:00 zoom)
GAPS = {"same": 0.35, "beat": 0.6}
ROOM = True

EDL = [
 # the oldest light
 ("rec69", "cmb", 177.52, 182.44),     # As far as we've been able to measure, for all practical purposes, the universe is infinite in every direction.   (the second of the whole run; the first run, 0:18-2:46, groped for the "limited" line nine times)
 ("rec69", "cmb", 183.50, 192.22, {"cut": [(187.98, 190.18)]}),   # But we are limited by how much we can see of it, because the furthest away something is, the older is the light that is coming to us.   ("the older the light get cut," out)
 ("rec69", "cmb", 197.62, 201.62),     # And the furthest away we can see is also the oldest light that there is.   (from its second start)
 ("rec69", "cmb", 208.56, 214.52),     # It's a faint microwave radiation from 380,000 years just after the Big Bang,   (the second start)
 ("rec69", "cmb", 219.08, 222.42, {"gap": 0.3}),   # the moments that light could even first escape from it.   ("the very first moments," out before it)
 ("rec69", "cmb", 231.92, 234.16),     # Everything you're seeing is a picture of the past.   (the second)
 # zooming in: the history replayed
 ("rec69", "history", 294.22, 303.96, {"cut": [(298.26, 300.52)]}),   # And as we zoom in, we are actually playing a history of the universe, as we are seeing light from the first galaxy formations.   (the last of five; "as we are seeing light from the galaxy" out)
 # the cosmic event horizon
 ("rec69", "ceh", 323.12, 332.36),     # The smaller bubble inside is the cosmic event horizon. Those represent galaxies that can still send light or information to us, despite the expansion rate of the universe.   (the second; the later tries, 6:25-6:47, never came out whole)
 ("rec69", "ceh", 381.48, 384.80),     # The universe is still expanding. So a lot of those galaxies are now beyond the reach.   (the last of nine)
 # superclusters, Laniakea, home
 ("rec69", "home", 407.02, 421.38),    # Inside them are the largest structures of all: superclusters, strung along threads of galaxies around huge empty voids. We live in one such small filament called the Laniakea supercluster, made of a hundred thousand galaxies,
 ("rec69", "home", 422.56, 424.14, {"gap": 0.3}),   # and in here we see our local neighborhood.
 ("rec69", "home", 433.14, 436.02),    # Here's Andromeda, and here's the Milky Way: that's home.   (the second of three; the third, "here's Milky Way where we live", drops "the")
 ("rec69", "home", 449.80, 453.74),    # And in one of its arms, one star among hundreds of billions is the Sun.   (the fourth start; Whisper had merged the four, the words come from the stretch alone)
 # the stars, the Oort cloud, the planets, Earth
 ("rec69", "sun", 478.38, 480.50),     # And as we zoom further, we see nearby stars.   (the third)
 ("rec69", "sun", 481.64, 485.48),     # The Sun is surrounded by billions of icy comets that make up the Oort cloud.
 ("rec69", "sun", 486.24, 487.92),     # And now we can see the orbits of planets.
 ("rec69", "sun", 488.68, 490.72),     # And the third rock from the Sun: that's us.
 # the forest, the tree, the ladybug
 ("rec69", "earth", 494.08, 499.16),   # And in North America, California, in the Sierra Nevada, lives a forest of giant sequoias.
 ("rec69", "earth", 513.14, 515.96),   # And there lives the General Sherman, the largest tree on Earth.   (the third)
 ("rec69", "earth", 521.38, 525.62),   # And in one of these branches, a ladybug is drinking a little bit of morning dew.   (the second)
 # pollen, the amoeba, DNA
 ("rec69", "life", 531.32, 536.70),    # Inside that, we'll find grains of pollen, and the first single-celled organism: a small amoeba.   (the second)
 ("rec69", "life", 537.92, 542.28),    # Inside it, we find its nucleus and its DNA, wound tight around proteins.
 ("rec69", "life", 544.22, 547.36),    # The double helix is two millionths of a millimetre wide.
 # the atom and below
 ("rec69", "atom", 550.38, 558.74),    # Atom is Greek for uncuttable, unsplittable. We named it when we thought we'd hit bottom. But atoms do split, famously and violently.
 ("rec69", "atom", 562.66, 566.70),    # They're made of electrons, protons and neutrons, and they are mostly empty space.   (the second; merged by Whisper, the words from the stretch alone)
 ("rec69", "atom", 567.74, 571.98),    # And the protons and neutrons in turn are made of smaller things, like quarks and gluons.
 ("rec69", "atom", 574.16, 578.00),    # And what are quarks made of? Well, we truly don't know.   (the second start)
 ("rec69", "atom", 578.56, 584.12),    # But now, instead of searching for the smallest building block, physics now looks for the smallest set of rules.
 ("rec69", "atom", 585.88, 594.32),    # Quantum field theory describes the universe as simply numbers at every point in space and time, and every particle as just temporary ripples in one of them.
 # the Planck scale
 ("rec69", "planck", 640.48, 642.12),  # There is a limit to our own understanding.   (the last of its tries, 10:14-10:40)
 ("rec69", "planck", 644.08, 648.96, {"s": 645.6}),   # At the Planck scale is where relativity and quantum mechanics meet.   (s: from its second "at"; "At the quantum," before it, which the second pass heard)
 ("rec69", "planck", 689.44, 693.90),  # Anything smaller, and our math simply breaks down. We don't know what's happening.   (the last of four; re-timed alone)
 ("rec69", "planck", 708.78, 713.32),  # But maybe, deep down at the Planck scale, it's all one big game of life.   (the last of four)
]

POST_CUTS = []
