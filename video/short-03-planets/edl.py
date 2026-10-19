# short-03-planets: up the line, from humans to brown dwarfs.
# Cut from rec12 = "From humans to brown dwarfs .m4a" (Google Drive "Recordings",
# 2026-10-19, 6:20, 48 kHz ALAC; recorded at home), one take that replaces the
# earlier mix of rec8 (intro) and rec3 (office). Build: see video/short-01-hook/README.md.
# rec13 = "bar_do_zeca_pagodinho_4.m4a" (uploaded 2026-10-19, 0:51, 48 kHz ALAC): a new
# opening (density lines, the water line, sink or float), so this video no longer opens
# like short-02 ("something really interesting happens…"); rec12 takes over from "And if
# you start at the human scale". Same noise floor as rec12 (about −79 dB) and a tone
# within ±3 dB of it, so no EQ. rec13's own human-scale lines are left out.
# rec14 = "bar_do_zeca_pagodinho_6.m4a" (uploaded 2026-10-19, 2:31, 48 kHz ALAC): the
# atmospheres → gas giants → Earth's Goldilocks zone, re-recorded (rec12 had "hold light
# gases", backwards). About 6 dB hotter than rec12 and a little lighter in the bass and
# duller on top: SOURCE_FX turns it down and nudges the tone back (within ±1 dB).
# rec15 = "bar_do_zeca_pagodinho_8.m4a" (uploaded 2026-10-19, 1:38; same session as rec14,
# same treatment): Saturn on the line and the Jupiter-size plateau, replacing rec12's
# "more objects will move towards the right" (only Saturn crosses).
# (source, beat, first-word start, last-word start, {s, e, gap}) in source seconds;
# the builder snaps each cut to the nearest real silence.

R14 = "volume=-6dB,equalizer=f=120:t=q:w=1.0:g=2.5,equalizer=f=1000:t=q:w=1.2:g=-2,equalizer=f=6300:t=q:w=1.2:g=2.5"
R15 = R14.replace("volume=-6dB", "volume=-2.5dB")  # same EQ; rec15 came in about 3.5 dB softer than rec14
SOURCE_FX = {"rec13": "volume=-3dB", "rec14": R14, "rec15": R15}

EDL = [
 ("rec13", "intro", 1.54, 10.54),     # In this chart, diagonal lines represent density. This blue line represents the density of water.
 ("rec13", "intro", 11.92, 25.98),    # And all of those dots are mostly things made of atoms. Everything to the left will sink and everything to the right will float.
 ("rec12", "intro", 28.38, 39.80),    # And if you start at the human scale ... left are meteorites and rocks ... right are actually animals because most of them float in water.
 ("rec12", "life", 40.22, 43.60),     # And we have the largest animal, the blue whale, the largest tree, the sequoia.
 ("rec12", "made", 44.52, 51.20),     # And then we start on more engineering categories like planes and supertankers and the Great Pyramid.
 ("rec12", "made", 51.66, 52.98),     # And after the pyramid,
 ("rec12", "made", 54.66, 58.02, {"gap": 0.15}),  # we will transition to natural things like mountains.   ("we really," left out)
 ("rec12", "made", 59.00, 62.10),     # Because really, the Great Pyramid is a mountain.
 ("rec12", "rocks", 63.12, 69.72),    # And then it will be big rocks and meteorites and comets and small moons.
 ("rec12", "round", 84.44, 91.18),    # and as we go higher on the diagonal line, you notice that the objects are becoming more and more spherical.
 ("rec12", "round", 92.82, 101.92),   # That happens because at this point, the force of gravity overcomes the molecular bond that keeps objects together under shape.
 ("rec12", "round", 103.70, 108.52),  # And at this point, everything might well be liquid, because they behave like liquids.
 ("rec14", "atmo", 3.38, 13.66),      # As these objects become more massive, their gravity starts being able to hold on to some more heavy gases.
 ("rec14", "atmo", 50.00, 60.90),     # So for example, while Moon and Mercury basically have no atmosphere, Mars does have a thin one, and Earth and Venus has a more thicker one.
 ("rec14", "gas", 62.38, 75.44),      # But once they start becoming massive enough, they're able not only to hold the heavy gases, they're also able to hold the lighter gases like hydrogen or helium.
 ("rec14", "gas", 101.62, 109.68),    # On Earth, helium and hydrogen will just float up and go away into space.
 ("rec14", "gas", 110.40, 126.84),    # But with some more massive planets, they stick around ... most of the universe is helium and hydrogen ... that's how they will become gas giants.
 ("rec14", "earth", 131.12, 149.60),  # So Earth also lives in a very interesting Goldilocks zone of mass, where it's massive enough to hold a thin atmosphere, but not so massive that you hold hydrogen and helium and become a gas giant.
 ("rec15", "turn", 21.80, 25.26),     # So, most of the objects are on the left side of the line,
 ("rec15", "turn", 26.90, 27.62, {"gap": 0.12}),  # as they grow,   ("and as we," left out)
 ("rec15", "turn", 33.02, 40.98, {"gap": 0.12}),  # Saturn falls almost on the line to the point that Saturn would float in water if you had a pool big enough.   ("we can see that we have more and more objects falling a little bit to the left," left out: backwards)
 ("rec15", "turn", 70.34, 74.28),     # Something weird happens past the Jupiter mass planets,
 ("rec15", "turn", 81.76, 86.56, {"gap": 0.15}),  # because even as they become more massive, they stay roughly Jupiter size.
 ("rec12", "degen", 303.10, 325.08),  # This is happening because the pressure inside the core ... degenerate matter ... now we are going into the degenerate matter line
 ("rec12", "end", 357.38, 360.20),    # So we are now into the brown dwarf phase.
 ("rec12", "end", 361.48, 372.34),    # But something happens after brown dwarf sizes, that some objects will take a drastic turn to the right and some a drastic turn to the left.
 ("rec12", "end", 373.52, 374.04),    # What is this?
 ("rec12", "end", 375.10, 376.34, {"gap": 0.45}),  # We'll explore on the next video.
]
