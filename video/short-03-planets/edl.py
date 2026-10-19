# short-03-planets: up the line, from humans to brown dwarfs.
# Cut from rec12 = "From humans to brown dwarfs .m4a" (Google Drive "Recordings",
# 2026-10-19, 6:20, 48 kHz ALAC; recorded at home), one take that replaces the
# earlier mix of rec8 (intro) and rec3 (office). Build: see video/short-01-hook/README.md.
# rec13 = "bar_do_zeca_pagodinho_4.m4a" (uploaded 2026-10-19, 0:51, 48 kHz ALAC): a new
# opening (density lines, the water line, sink or float), so this video no longer opens
# like short-02 ("something really interesting happens…"); rec12 takes over from "And if
# you start at the human scale". Same noise floor as rec12 (about −79 dB) and a tone
# within ±3 dB of it, so no EQ. rec13's own human-scale lines are left out.
# (source, beat, first-word start, last-word start, {s, e, gap}) in source seconds;
# the builder snaps each cut to the nearest real silence.

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
 ("rec12", "atmo", 151.04, 161.60),   # as we increase in mass, objects now start acquiring an atmosphere because the gravity is enough to hold light gases together.
 ("rec12", "atmo", 163.90, 167.36),   # So Mercury and the Moon don't have an atmosphere, but Mars has a thin one.
 ("rec12", "atmo", 169.52, 171.60, {"gap": 0.2}),  # Venus and Earth has one,   ("Venus and Earth have" left out)
 ("rec12", "gas", 198.08, 216.76, {"gap": 0.2}),   # but after this point, objects are so massive that hydrogen does not escape its orbit ... a gas giant ... doesn't have an actual surface anymore.
 ("rec12", "earth", 225.34, 235.98),  # So, Earth really sits in this thin line where it's massive enough to have some atmosphere, but not so massive that it's just a gas giant.
 ("rec12", "turn", 249.78, 251.86),   # The further we go in the mass line, you notice
 ("rec12", "turn", 253.84, 263.26, {"gap": 0.12}), # that more objects will move towards the right side of the graph. Saturn actually would float in water if you had a pool big enough,
 ("rec12", "turn", 264.28, 280.36),   # but then they start going drastically to the left of it, the Jupiter and the super-Jupiters, and now we are off the main diagonal line.
 ("rec12", "degen", 303.10, 325.08),  # This is happening because the pressure inside the core ... degenerate matter ... now we are going into the degenerate matter line
 ("rec12", "end", 357.38, 360.20),    # So we are now into the brown dwarf phase.
 ("rec12", "end", 361.48, 372.34),    # But something happens after brown dwarf sizes, that some objects will take a drastic turn to the right and some a drastic turn to the left.
 ("rec12", "end", 373.52, 374.04),    # What is this?
 ("rec12", "end", 375.10, 376.34, {"gap": 0.45}),  # We'll explore on the next video.
]
