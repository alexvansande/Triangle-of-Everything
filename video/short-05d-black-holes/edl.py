# short-05d-black-holes: video 5, take 5 (rec24), kept next to 05b and 05c until the author picks.
# rec24 = "Dark matter take 5.m4a" (Google Drive "Recordings", 2026-10-20, 10:48, 48 kHz ALAC;
# noise floor about -79 dB, no clipping). The whole video again, with the Schwarzschild
# radius and the 45-degree slope in place, the red giants' nebulae feeding new stars, the
# "skeleton of a dead star", the Big Bang's "soup", and the "lucky few survivors" ending.
# (source, beat, first-word start, last-word start, {s, e, gap}) in source seconds.

PAUSES = {"word": 0.18, ",": 0.3, ".": 0.45}

EDL = [
 ("rec24", "intro", 32.28, 38.98, {"s": 30.3}),  # Everything that could have ever existed can be plotted in this chart with size on the horizontal axis and mass on the vertical axis.   (a false start, "Everything that could have ever,", left out)
 ("rec24", "intro", 39.46, 42.52),  # It's really a log-log density scatterplot.
 ("rec24", "intro", 44.14, 46.08),  # And as you zoom in, it tells you a million stories.
 ("rec24", "intro", 47.34, 49.50),  # For example, you can see the life cycle of stars.
 ("rec24", "intro", 50.44, 53.60),  # They form from stellar nurseries and collapse into protostars.
 ("rec24", "intro", 55.02, 56.88),  # Then they will live their life in the main sequence.
 ("rec24", "intro", 57.46, 63.28),  # And as their hydrogen is depleted, they will collapse and expand and collapse and become red giants.
 ("rec24", "intro", 63.96, 76.16),  # And those red giants will then expand into nebulas, which will merge again into new stellar nurseries, creating a new generation of stars.
 ("rec24", "intro", 78.68, 94.10, {"s": 78.95, "gap": 0.5}),  # ("And left behind" left out: "behind" comes again at the end) As the skeleton of a dead star, there will always be some sort of dense core behind, which sometimes, depending on the mass, will be a white dwarf, a neutron star, or the most interesting one of them, the black holes.
 ("rec24", "line", 99.40, 104.40, {"s": 99.82, "gap": 0.6}),  # Most objects in our triangle will be clusters of dots around some point.   ("But black holes are…" and a first "Most objects," left out)
 ("rec24", "line", 104.78, 108.80),  # But black holes are not, they sit all on this line.
 ("rec24", "line", 109.28, 111.56),  # And that line is called the Schwarzschild radius.
 ("rec24", "line", 112.74, 118.28),  # And the line is special because it represents the top left limit of our triangle of everything.
 ("rec24", "line", 118.74, 130.92),  # And as anything that gets too small or too massive will become a black hole and live instead somewhere on this line and never actually cross it,
 ("rec24", "horizon", 131.78, 133.82),  # black holes actually don't have a size.
 ("rec24", "horizon", 134.34, 138.74),  # They are considered to be a singularity, meaning they have size of zero.
 ("rec24", "horizon", 139.44, 145.92),  # But they do have what is called an event horizon, a radius from which nothing can escape it.
 ("rec24", "horizon", 146.38, 150.44),  # And that radius is directly related to mass.
 ("rec24", "horizon", 151.80, 157.14),  # That's why the slope on the upper left is just a straight 45-degree angle.
 ("rec24", "known", 172.38, 181.20, {"gap": 0.6}),  # All of the black holes we know of have been formed in the collapsing core of a dying star or just mergers of other black holes.   (three false starts left out)
 ("rec24", "known", 182.54, 188.30),  # They vary in size from a massive star to hundreds and thousands and millions of suns,
 ("rec24", "known", 198.64, 204.22, {"gap": 0.12}),  # like the ones in the center of our own Milky Way, which has four million solar masses.   (a second "They vary in size…" left out)
 ("rec24", "dense", 205.36, 208.90, {"gap": 0.5}),  # And as they grow more massive, they actually become less dense.
 ("rec24", "dense", 210.10, 215.64),  # And after some point, the really supermassive ones are actually lighter than water and could float on a pool.
 ("rec24", "dense", 217.68, 229.40, {"e": 229.65}),  # Like M87, the first one ever to be photographed, or TON 618, the largest black hole that we know of, whose event horizon is larger than our solar system, and whose mass is    (the note about M87's photograph left out)
 ("rec24", "dense", 232.48, 232.70, {"s": 231.50, "gap": 0.12}),  # 60 billion of our suns.   (the first "60 billion of," a false start, left out)
 ("rec24", "small", 256.90, 261.92, {"gap": 0.6}),  # But the most interesting story is not how big they can be, but actually how small they can be.
 ("rec24", "small", 263.06, 265.50),  # With enough pressure, anything can become a black hole.
 ("rec24", "small", 266.06, 268.42),  # We don't know how to build one, we just don't have the technology.
 ("rec24", "small", 269.44, 269.88, {"e": 270.1}),  # But we know
 ("rec24", "small", 272.96, 277.08, {"s": 272.92, "gap": 0.05}),  # two moments where the conditions to make a black hole happens.   ("two places, but we know" left out)
 ("rec24", "small", 277.86, 280.92),  # One of them is, as we said, the core of dying stars.
 ("rec24", "small", 281.48, 293.92),  # And the second one happened in the very early moments of the Big Bang, when everything was a soup of very hot and dense matter.
 ("rec24", "pbh", 304.28, 311.60, {"s": 302.38, "gap": 0.5}),  # So back then, some of that soup could have collapsed into black holes of multiple sizes, and some of those might still be around.   ("So back then, some of those, some," left out)
 ("rec24", "pbh", 312.62, 313.76),  # And we've been looking for them.
 ("rec24", "pbh", 314.20, 322.52),  # We've done surveys using quasars and the cosmic background radiation, and then gravitational waves, and finally microlensing.
 ("rec24", "pbh", 334.08, 338.08, {"e": 338.7, "gap": 0.4}),  # And as we've done those surveys and found nothing so far,
 ("rec24", "pbh", 347.10, 350.60, {"s": 345.45, "gap": 0.2}),  # the window on where primordial black holes can exist has been closing somewhat.   (two tries left out, and "the window of where those black-, the window on-")
 ("rec24", "pbh", 387.56, 394.78, {"gap": 0.4}),  # And we also know they cannot be too small, otherwise they would have evaporated through a process that we called Hawking radiation.
 ("rec24", "window", 407.28, 425.24, {"gap": 0.5}),  # So there is a tiny window of size and mass those objects could be, and they would be something like as tiny as a virus, but with the mass of a small moon, or maybe something as heavy as an asteroid compressed to the size of an atom.   ("So there's a tiny window in which…" left out)
 ("rec24", "window", 425.98, 444.66, {"gap": 0.4}),  # And if those objects exist and are out there and are very common, they would be basically invisible. They would not react to light. They would not be visible on a telescope. We could only find them by secondary effects, like the effects on their gravity.
 ("rec24", "dm", 448.02, 454.76, {"gap": 0.4}),  # And the reason we've been looking for such objects for so long is that we have detected those effects on gravity.   ("…for some objects," left out)
 ("rec24", "dm", 455.66, 471.64),  # When we measure galaxies, we find that they are much heavier than they ought to be, sometimes ten times as much, meaning that most of the mass of the universe is formed of something very heavy, and basically invisible, which is, of course, dark matter.
 ("rec24", "dm", 490.94, 503.60, {"gap": 0.4}),  # We don't know what it is yet, and there are a lot of candidates for it, but if they are just very tiny black holes, then that doesn't require any new physics or any new particles to exist.   (repeats left out)
 ("rec24", "dm", 506.98, 508.40, {"gap": 0.4}),  # So we keep looking for them.
 ("rec24", "dm", 508.98, 510.36),  # That window is still closing down.
 ("rec24", "dm", 511.06, 514.96),  # There's some real research on neutron stars that suggests that the window is even smaller.
 ("rec24", "end", 540.14, 555.72, {"s": 542.75, "gap": 0.4}),  # But it's still possible that most of what we believe to be empty space in the universe is actually filled with little objects the size of an atom that weigh as much as a mountain.   (two first tries left out)
 ("rec24", "end", 597.18, 601.04, {"gap": 0.6}),  # Or maybe not. Maybe you'll figure out that something else is dark matter.
 ("rec24", "end", 578.48, 591.70, {"gap": 0.4}),  # But I still find it fascinating that maybe in the early moments of our history, most of the matter just collapsed into black holes to the size of an atom.   ("most of everything … particle-sized" left out: see the fact check)
 ("rec24", "end", 635.42, 644.10, {"gap": 0.5}),  # And we, everything else, the galaxies, the stars, all that we know of, are just the lucky few survivors.
]
