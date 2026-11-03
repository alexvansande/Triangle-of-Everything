# short-00-powers-of-ten: the narration over the powers-of-ten zoom (the CMB to the Planck length).
# rec52 = "Poeta of ten take 1.m4a" (Google Drive "Recordings", 2026-11-03, 10:09, ALAC 48 kHz): the
# author's first recording of the script (video/scripts/recording-scripts.md, "0 · Powers of ten"),
# reworded as he went, with retakes, after a mic check (0:00–0:12).
# Kept under 3:00 with the zoom's end (the author, 2026-11-03). The zoom (tools/powers-of-ten.html, in the
# author's local zoom source) is retimed to it: video/short-00-powers-of-ten/zoom-keys.json.
# Treatment: enhance.py --plain, natural speed. Build: see video/short-01-hook/README.md.
# (source, beat, first-word start, last-word start, {s, e, gap, cut}) in source seconds.

SOURCES = {"rec52": "Poeta of ten take 1.m4a"}
TREATMENT = "plain"
PAUSES = {"word": 0.18, ",": 0.3, ".": 0.45}

EDL = [
 ("rec52", "infinite", 28.06, 39.76),   # As far as we've been able to measure, for all practical purposes, the universe is infinite in every direction. But we are limited by how much we can see of it.   (the second try)
 ("rec52", "cmb", 59.26, 70.22),        # The largest thing we can see is the cosmic microwave background, a faint glow from 380,000 years after the Big Bang, the moment light could first escape.   (the fourth try)
 ("rec52", "cmb", 85.36, 87.74),        # Everything here is a picture of the past.   (the second try)
# Left out to fit 3:00: "Inside this bubble, we can still see galaxies from the early childhood of the universe."
# (102.76–107.12, the third try).
# Left out to fit 3:00 (the event horizon's line says it shortly after): "Galaxies who are now way beyond our
# reach, even if you could travel at the speed of light, because space itself is expanding, pushing those
# galaxies further away from us than light can travel, meaning that we can't even have information of them,
# and they will just disappear one day from us." (108.34–112.76 + 151.04–165.66, the last tries)
 ("rec52", "horizon", 217.32, 220.02),  # The smaller bubble inside is the cosmic event horizon.   (the last of six tries)
 ("rec52", "horizon", 227.96, 235.44, {"s": 231.27}),  # Those represent galaxies that can still send light or information to us.   (left out to fit 3:00: "In a way, they represent our universe. Those are the things that can still affect us.")   (the third try: "That– those represent galaxies that can still–" left out)
 ("rec52", "super", 246.80, 254.40),    # Inside them are the largest structures of all: superclusters, strung along threads of galaxies, around huge empty voids.
 ("rec52", "laniakea", 280.50, 291.64, {"s": 285.35}), # We live in one such small filament called the Laniakea supercluster, made of 100,000 galaxies.   (the fourth: "We live in one such small filament called the–" left out)
 ("rec52", "local", 311.94, 318.14),    # And in here, we see our local neighbourhood of galaxies. Here's Andromeda, and here's the Milky Way: that's us.   (the fourth try)
 ("rec52", "local", 321.38, 325.28),    # And in one of its arms, one star among hundreds of billions is the Sun.   ("And it's one of them." left out)
 ("rec52", "stars", 337.90, 342.40, {"s": 339.0}),  # Here are the nearby stars, Sirius and Proxima Centauri.   ("Here are the local neighbour, here are the near–" left out)
 ("rec52", "oort", 351.00, 356.04),     # The Sun is surrounded by billions of icy comets that make up the Oort cloud.   (the second try)
 ("rec52", "planets", 369.22, 373.26),  # Now we can see the orbits of planets, and the third rock from the Sun: that's home.   (the third try)
 ("rec52", "moon", 381.68, 383.60),     # We see the Moon zoom by.   (the second try: "zoom by", not "pass by"; "It's two light-seconds away from us" left out: it's 1.3)
 ("rec52", "earth", 388.94, 394.52),    # And in North America, California, in the Sierra Nevada, lives the forest of giant sequoias.
 ("rec52", "earth", 406.84, 409.96),    # There lives the General Sherman, the largest tree on Earth.   (the second try; "It weighs," left out)
 ("rec52", "ladybug", 432.70, 438.26, {"s": 434.15}),  # And on one of its branches, a ladybug is drinking a little bit of morning dew.   (the third try; "And one of," left out)
 ("rec52", "amoeba", 444.82, 448.58, {"s": 444.90}),  # And we find our first single-celled organism: an amoeba.   ("On its back, a grain of pollen, thinner than our hair," left out: the zoom shows a drop of dew, no pollen)
 ("rec52", "dna", 452.88, 461.54),      # Inside it, we find its nucleus, and its DNA, wound tight around proteins. The double helix is two millionths of a millimetre wide.
 ("rec52", "atom", 497.70, 512.38, {"cut": [(501.30, 504.06), (506.60, 510.15)]}),  # Atom is Greek for uncuttable, unsplittable. We named it when we thought we'd hit the bottom. But atoms do split, famously and violently.   (the second try; "We named it when we thought with– we had–" and "But atoms do split famously–" left out)
 ("rec52", "atom", 475.70, 480.96),     # They're made of electrons, protons and neutrons, and they're mostly empty space.   (from the first try: the second has no "empty space")
 ("rec52", "atom", 518.24, 522.68),     # And the proton and neutron, in turn, are made of smaller things, like quarks and gluons.   (the second try)
 ("rec52", "quarks", 524.06, 528.04),   # And what are quarks made of? Well, truly, we don't know.
 ("rec52", "rules", 530.23, 536.16),    # But now, instead of searching for the smallest building block, physics looks for the smallest set of rules.
 ("rec52", "rules", 539.44, 552.56, {"s": 543.05}),  # Quantum field theory describes the universe as simply numbers at every point of space and time, and every particle as just a temporary ripple in one of them.   (the second try; "Quantum field theory describes the universe as simply–" left out)
 ("rec52", "planck", 555.40, 557.00),   # Our journey ends at the Planck length.
 ("rec52", "planck", 567.22, 574.36, {"s": 569.95, "cut": [(571.46, 573.10)]}),  # At this point, relativity clashes with quantum mechanics.   (the third try at it; "clashes with con–" left out)
 # Left out: "And anything smaller than this will either collapse into a black hole, or create an antiparticle and
# disappear" (video/sources/2026-11-03/NOTES.md), and, to fit 3:00, "We just don't have good theories on what
# would happen." (575.34–584.44)
 ("rec52", "life", 593.96, 605.68),     # Is that the limit? Well, we don't know. But maybe, deep down, at the Planck scale, where theories break down, it's all one big game of life.
]

# 0.45 s between lines (build.py's default is 0.6), to fit 3:00 with the zoom's held ending
EDL = [(*e[:4], {"gap": 0.45, **(e[4] if len(e) > 4 else {})}) if i and e[1] != EDL[i - 1][1] else e for i, e in enumerate(EDL)]
