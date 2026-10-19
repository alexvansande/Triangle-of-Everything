# short-04-stars: planets into stars. Jupiter's own heat, brown dwarfs and deuterium,
# the fork after them, the main sequence, the life of a star, the nebulae that make
# new stars, and what the core becomes (white dwarf, neutron star, black hole).
# Cut from rec16 = "Star life cycles" (Google Drive "Recordings", 2026-10-19, 10:24,
# 48 kHz ALAC; noise floor about −80 dB, no clipping), one take that replaces the
# 2026-10-07 cut from rec3 and rec6. Build: see video/short-01-hook/README.md.
# The black-hole / Schwarzschild part of rec16 (520 s on) is left out: black holes get
# their own video, and the ending will be re-recorded.
# (source, beat, first-word start, last-word start, {s, e, gap}) in source seconds;
# the builder snaps each cut to the nearest real silence.

SOURCE_FX = {}

EDL = [
 ("rec16", "hook", 8.48, 13.40),      # We tend to think of stars and planets as completely different categories, but that's not really true.
 ("rec16", "heat", 15.04, 15.22, {"s": 14.85, "e": 15.82}),  # In fact,
 ("rec16", "heat", 21.22, 28.50, {"s": 22.20, "e": 28.82, "gap": 0.2}),  # Saturn and Jupiter in our solar system, they generate more heat than they absorb from the Sun,
 ("rec16", "heat", 33.62, 36.72, {"s": 32.56, "gap": 0.2}),  # mostly due to their mass compressing in their core.   (third try; "the gas...", "mostly due to..." and "mostly due, uh," left out)
 ("rec16", "heat", 60.62, 63.56),     # And as that mass increases, so does the core pressure.
 ("rec16", "bd", 64.22, 76.50),       # Until at some point, they become brown dwarfs. Brown dwarfs are those really in-between objects ... not really planets.
 ("rec16", "bd", 81.08, 85.16),       # They are massive enough that they can start fusing hydrogen.
 ("rec16", "bd", 86.38, 93.34),       # But not all hydrogen, only those in the form of deuterium, which is only a minuscule portion of it.
 ("rec16", "bd", 141.58, 149.96),     # That sort of hydrogen is so rare that brown dwarfs don't have enough energy to sustain themselves as stars.
 ("rec16", "fork", 170.06, 177.70),   # But once we increase that mass even further, then we have this bifurcation that we see on this graph.
 ("rec16", "ms", 228.70, 240.92),     # What is happening is that once the core pressure is strong enough, then it can fuse all of the hydrogen, and then that starts releasing a massive amount of energy,
 ("rec16", "ms", 248.44, 261.12),     # And there's an internal pressure that pushes the objects to be bigger in diameter, and they start following this other diagonal line, which we call the main sequence of stars,
 ("rec16", "ms", 309.00, 316.28, {"gap": 0.15}),  # in which most stars will live most of their lives on until the hydrogen is depleted.
 ("rec16", "life", 317.64, 319.72),   # And then what will happen is that
 ("rec16", "life", 328.78, 338.88, {"gap": 0.12}),  # as their fuel for fusion is depleted, then they will start collapsing, and expanding, and collapsing, and expanding,
 ("rec16", "split", 349.88, 352.40, {"gap": 0.2}),  # and the object will split in two.   ("until their outer layers will explode, often in a supernova," left out)
 ("rec16", "split", 354.72, 360.92),  # The outer layers will become a supernova, or a planetary nebula,
 ("rec16", "split", 364.12, 367.16, {"gap": 0.15}),  # and the inner core will become a very dense object.
 ("rec16", "nursery", 407.80, 419.60),  # And as those supernovas, and those nebulas expand, they will join together with others, and they will create what we call stellar nurseries,
 ("rec16", "nursery", 420.44, 420.44, {"s": 420.80, "e": 421.22}),  # where   ("that," left out)
 ("rec16", "nursery", 422.20, 434.16, {"s": 422.00, "gap": 0.06}),  # those huge clouds of gas will then be attracted, and compress again into protostars, and then stars again, and the cycle begins.
 ("rec16", "core", 436.38, 441.06),   # And what about the core? Well, something interesting happens with the core.
 ("rec16", "core", 488.04, 493.34),   # So if it's not massive enough to become a supernova, it will become a white dwarf.
 ("rec16", "core", 498.12, 511.30),   # But if it's above a certain limit, then it becomes a neutron star, a super dense object which is mostly made of pure neutrons.
 ("rec16", "core", 512.00, 519.14),   # And if the original star was just heavy enough, then it will become a black hole.
]
