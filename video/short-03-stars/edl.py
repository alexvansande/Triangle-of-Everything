# short-03-stars: planets into stars. Jupiter's own heat, brown dwarfs and deuterium,
# the fork after them, the main sequence, the life of a star, the nebulae that make
# new stars, and what the core becomes (white dwarf, neutron star, black hole).
# Cut from rec16 = "Star life cycles" (Google Drive "Recordings", 2026-10-19, 10:24,
# 48 kHz ALAC; noise floor about −80 dB, no clipping), one take that replaces the
# 2026-10-07 cut from rec3 and rec6. Build: see video/short-01-hook/README.md.
# The black-hole / Schwarzschild part of rec16 (520 s on) is left out: black holes get
# their own video.
# rec17 = "Avenida_Afonso_de_Taunay_660_8.m4a" (uploaded 2026-10-19, 1:27, 48 kHz ALAC): the new
# ending, after "And what about the core?" (white dwarf, neutron star, black hole → next
# video). It replaces rec16's 448–520 s.
# (source, beat, first-word start, last-word start, {s, e, gap}) in source seconds;
# the builder snaps each cut to the nearest real silence.

# rec17: 2.5 dB softer than rec16, about 2 dB heavier at 80–160 Hz and 2 dB brighter above
# 2.5 kHz; this matches it within about ±1.5 dB.
# pauses inside a clip: short mid-phrase, a breath at commas, a full pause at sentence ends
# rec17 is spoken about 9% slower than rec16 (4.0 against 4.4 syllables a second) and
# lower (median pitch 105 against 120 Hz); the tempo is matched, the pitch left alone.
SOURCE_TEMPO = {"rec17": 1.09}
PAUSES = {"word": 0.18, ",": 0.3, ".": 0.45}
SOURCE_FX = {"rec17": "volume=2.5dB,equalizer=f=115:t=q:w=1.0:g=-2,equalizer=f=1000:t=q:w=1.2:g=1.5,highshelf=f=3500:g=-4"}

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
 ("rec16", "split", 354.72, 360.92, {"s": 356.55}),  # The outer layers will become a supernova, or a planetary nebula,   ("The outer layer…" false start left out)
 ("rec16", "split", 364.12, 367.16, {"gap": 0.15}),  # and the inner core will become a very dense object.
 ("rec16", "nursery", 407.80, 419.60),  # And as those supernovas, and those nebulas expand, they will join together with others, and they will create what we call stellar nurseries,
 ("rec16", "nursery", 420.44, 420.44, {"s": 420.80, "e": 421.22}),  # where   ("that," left out)
 ("rec16", "nursery", 422.20, 434.16, {"s": 422.00, "gap": 0.06}),  # those huge clouds of gas will then be attracted, and compress again into protostars, and then stars again, and the cycle begins.
 ("rec16", "core", 436.38, 441.06),   # And what about the core? Well, something interesting happens with the core.
 ("rec17", "end", 5.12, 15.60),       # If a star isn't massive enough to go supernova, then after the fuel is depleted, all that's left is a white dwarf.
 ("rec17", "end", 24.32, 44.28, {"s": 23.45, "e": 45.0}),  # But if it's big enough to go supernova ... protons and the electrons ... squished together into a neutron, and it will create a neutron star,   (a restart, "But, if it's,", left out)
 ("rec17", "end", 47.86, 55.78, {"s": 47.20, "gap": 0.15}),  # an object so dense that a single spoonful of it would weigh the same as a mountain on Earth.   ("an ob…" false start left out)
 ("rec17", "end", 71.86, 85.14, {"s": 70.90}),  # and if the star is any bigger than that, then the core would collapse into a black hole, an object so crazy that it deserves a video on itself.   ("the core explosion of the supernova would turn," and a restart left out)
]
