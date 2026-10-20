# short-05c-black-holes: video 5, take 4 (rec22), kept next to 05b until the author picks.
# rec22 = "Black holes take 4" (Google Drive "Recordings", 2026-10-20, 10:00, 48 kHz ALAC;
# noise floor about -80 dB, no clipping; construction nearby, none audible in the pauses).
# The whole video again, ending sooner: on dark matter and primordial black holes as
# "the lucky survivors", without the empty-space diagonal and the next side.
# rec23 = "bar_do_zeca_pagodinho_14.m4a" (uploaded 2026-10-20, 2:14): a pickup naming the
# Schwarzschild radius and explaining the 45° slope (event horizon proportional to mass);
# it replaces take 4's "every black hole … lives on this line … the first limit".
# (source, beat, first-word start, last-word start, {s, e, gap}) in source seconds.

PAUSES = {"word": 0.18, ",": 0.3, ".": 0.45}

EDL = [
 ("rec22", "intro", 6.56, 14.94),  # Everything that could have ever existed can be plotted in this chart with size on the horizontal axis and mass on the vertical axis.
 ("rec22", "intro", 16.02, 17.86),  # It's really a density scatter plot.
 ("rec22", "intro", 18.82, 20.90),  # And as you zoom in, it tells you a million stories.
 ("rec22", "intro", 21.88, 30.30),  # Like for example, you can see the life cycle of stars as they form from stellar nurseries and collapse into protostars.
 ("rec22", "intro", 32.18, 40.74),  # Then stars, as they live their life in the main sequence and as their hydrogen is depleted, they will collapse and expand and become red giants.
 ("rec22", "intro", 41.72, 50.28),  # And depending on their mass, stars will always leave a dense core behind, which could be a white dwarf or a neutron star, or even a black hole.   (the repeated "or even a black hole" left out)
 ("rec22", "line", 54.68, 57.60, {"gap": 0.6}),  # But black holes are a very different kind of objects.
 ("rec23", "line", 34.72, 39.02, {"s": 32.45}),  # Most objects in this graph are clusters of dots around some point, but black holes are not.   (a first "Most objects in this graph…" left out)
 ("rec23", "line", 48.58, 49.86, {"gap": 0.15}),  # They all sit in this line.
 ("rec23", "line", 52.08, 54.18),  # And this line is called the Schwarzschild radius.
 ("rec23", "line", 55.84, 63.50),  # And the line is very special because it represents the top left limit of our triangle of everything.
 ("rec22", "line", 99.38, 111.30),  # As anything that gets too small or too massive to cross it will become a black hole and live instead somewhere on this line and never cross it.
 ("rec23", "horizon", 77.18, 78.86, {"gap": 0.5}),  # Black holes don't actually have a size.   (the first try, "…because it just broke space time", left out)
 ("rec23", "horizon", 79.99, 85.02),  # They are considered to be a singularity, meaning that they have size of zero.
 ("rec23", "horizon", 86.04, 86.64, {"e": 87.28}),  # But they do have
 ("rec23", "horizon", 89.76, 94.40, {"s": 88.82, "gap": 0.05}),  # what is called an event horizon, a radius from which nothing can escape it.   (a first "what is called an," left out)
 ("rec23", "horizon", 95.76, 99.30),  # And that radius is directly related to mass.
 ("rec23", "horizon", 122.90, 127.66, {"gap": 0.3}),  # That's why the slope on the upper left is just a 45 degree angle.   (two other tries left out)
 ("rec22", "known", 118.32, 128.18, {"gap": 0.6}),  # All the black holes we know of have been formed in the collapsing core of dying star or are mergers of other black holes.
 ("rec22", "known", 129.52, 135.78),  # They vary in size from a massive star to hundreds and thousands and millions of suns
 ("rec22", "known", 138.56, 141.14),  # like the ones in the center of our own Milky Way,   (first try left out)
 ("rec22", "known", 145.02, 146.54, {"gap": 0.12}),  # which has four million solar masses.   (first try left out)
 ("rec22", "dense", 147.78, 151.34, {"gap": 0.5}),  # And as they grow massive and bigger, they actually become less dense.
 ("rec22", "dense", 153.12, 175.62),  # And after some point, the really supermassive ones are actually lighter than water and could float in a pool like M87, the first one ever to be photographed, or TON 618, largest black hole we know of, whose event horizon is larger than our whole solar system and whose mass is 60 billion of our suns.
 ("rec22", "small", 199.66, 205.20, {"gap": 0.6}),  # But the most interesting story is not how big they can be, but how small they can be actually.   (the first try, "is actually is not asking…", left out)
 ("rec22", "small", 218.58, 222.60),  # With enough pressure, anything can become a black hole.   ("Because… hmm, anything" left out)
 ("rec22", "small", 232.84, 235.64),  # We don't have the technology to build one,   (two tries left out)
 ("rec22", "small", 237.74, 242.30, {"gap": 0.12}),  # but we know that those conditions happen in the core of dying stars.
 ("rec22", "pbh", 250.52, 258.04, {"s": 250.33}),  # And we also know that those conditions have happened before in the very early moments of our own universe.   (two stalled tries, "those conditions have…", left out)
 ("rec22", "pbh", 262.28, 272.56),  # And it's possible that back then, some of the mass has collapsed in some very old, cold primordial black holes.
 ("rec22", "pbh", 276.02, 283.34),  # And they might still be around, and we've been looking for them.
 ("rec22", "pbh", 299.14, 311.46, {"gap": 0.4}),  # We've done surveys using quasars and the cosmic background radiation and then gravitational waves and finally microlensing, and so far we haven't found any.   (the faster first list left out)
 ("rec22", "pbh", 323.24, 330.26, {"gap": 0.4}),  # We also know that it can't be too small, otherwise they would have evaporated by now in a process called Hawking radiation.
 ("rec22", "window", 332.58, 339.90, {"gap": 0.4}),  # So each of those surveys has closed the window on the existence of primordial black holes, but it's still open.
 ("rec22", "window", 357.94, 375.22, {"gap": 0.5}),  # So it is still possible that the universe is filled with objects tiny as a virus, with the mass of a small moon, or maybe some objects the size of an asteroid compressed to the size of an atom.
 ("rec22", "window", 382.30, 394.16, {"gap": 0.5}),  # And if those objects are out there, they will be almost invisible. They would be dark, and we could only detect them probably through their effect on gravity.
 ("rec22", "dm", 395.20, 398.64, {"gap": 0.4}),  # And the reason we've been looking for such objects for so long
 ("rec22", "dm", 406.76, 410.26, {"gap": 0.1}),  # is that we have detected those effects on gravity.
 ("rec22", "dm", 413.96, 421.52, {"gap": 0.4}),  # When we measure galaxies, we find that they are much heavier than they ought to be, sometimes ten times as much,
 ("rec22", "dm", 427.92, 434.98),  # meaning that most of the mass in the universe is formed of something very heavy and invisible.
 ("rec22", "dm", 439.50, 442.02, {"gap": 0.3}),  # This is of course dark matter.
 ("rec22", "dm", 459.88, 463.14, {"gap": 0.4}),  # We don't know what it is yet, there are a lot of things they could be,
 ("rec22", "dm", 465.44, 476.22, {"gap": 0.12}),  # but if they were actually just very tiny black holes, then that wouldn't require any new physics or any new particle to exist.   (a false start "but…" left out)
 ("rec22", "dm", 477.08, 478.42, {"gap": 0.4}),  # So we keep looking for them.
 ("rec22", "dm", 480.04, 482.22),  # That window is still closing down.
 ("rec22", "dm", 483.48, 488.14),  # There are some new research on neutron stars that suggest that the window is even smaller,
 ("rec22", "end", 517.62, 524.06, {"gap": 0.15}),  # but it's still possible that most of what we believe to be empty space in the universe is
 ("rec22", "end", 528.02, 536.34, {"gap": 0.05}),  # filled with asteroids that have been compressed to the size of an atom in the very early moments of the universe.   ("filled with objects, it's" left out)
 ("rec22", "end", 551.08, 556.84, {"gap": 0.5}),  # There are a lot of other explanations for dark matter and we're still looking for them,
 ("rec22", "end", 558.06, 559.90, {"e": 560.18}),  # but I find it fascinating that
 ("rec22", "end", 574.62, 590.34, {"gap": 0.08}),  # maybe in the early moments of the universe, most of the matter has been compressed into tiny black holes that are still out there, the size of an atom maybe, and the mass of an asteroid.
 ("rec22", "end", 590.90, 596.32, {"gap": 0.5}),  # And we, everything else, are just the lucky survivors.
]
