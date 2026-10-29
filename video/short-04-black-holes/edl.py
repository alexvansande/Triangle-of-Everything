# short-04-black-holes: video 4, re-recorded in the car on 2026-10-28 from the rewritten script
# (a hook, no star life-cycle recap, the Sun and the Earth as black holes, "billions of Suns").
#   rec47 = "Black holes.m4a" (Google Drive "Recordings", 2026-10-28, 9:18, ALAC 48 kHz): the first
#           half, from the hook to "…and we just have gravity wrong", with retakes
#   cut4  = the previous cut's own finished audio (public/narration/short-04-black-holes/audio.m4a
#           at 2026-10-28, rec43 + rec41, cleaned up; their raws are in iCloud), used for the second
#           half (from "But if it is something real" to the end) until the author records it
#           (the author's rule: cut every recording as it arrives, 2026-10-29)
# rec47 matched to cut4 (measured on the speech: 8.6 dB quieter, ~1.5 dB more at 2 kHz; its 63 Hz
# goes with the high-pass). Treatment: enhance.py --plain, natural speed (no tempo).
# (source, beat, first-word start, last-word start, {s, e, gap, cut, gain}) in source seconds.
# The rec43/rec41 cut of 2026-10-27 is in git history.

PAUSES = {"word": 0.18, ",": 0.3, ".": 0.45}

SOURCE_FX = {"rec47": "highpass=f=80,volume=8.6dB,equalizer=f=2000:t=o:w=1:g=-1.5"}

EDL = [
 # the hook
 ("rec47", "hook", 52.76, 55.30),      # What's the smallest black hole that could exist?   (two earlier tries left out)
 ("rec47", "hook", 60.66, 65.58),      # And is it possible that most of the matter of the universe is actually black holes?
 ("rec47", "hook", 71.70, 72.78),      # Let's look at this chart.
 # the chart, and the cores stars leave
 ("rec47", "intro", 170.68, 179.66, {"s": 171.9}),   # I am doing a series of videos on this chart, which I call the triangle of everything. It's a log chart of both mass and size.   ("I'm doing a," left out)
 ("rec47", "intro", 180.58, 189.68, {"s": 180.55}),  # And in the last one, we saw that stars die and leave a dense core behind: a white dwarf, a neutron star, or the most interesting of them, a black hole.
 # the line
 ("rec47", "line", 105.14, 118.84),    # Most objects in this chart are clouds of dots, but black holes are not: they all sit on the same line, called the Schwarzschild radius, and it's the top-left edge of our triangle of everything.   (the first "Most objects in this chart," left out)
 ("rec47", "line", 120.24, 128.48),    # Anything that gets too small or too massive becomes a black hole and ends up on this line. Nothing can cross it.
 ("rec47", "line", 281.62, 286.02),    # Everything we have is to the bottom and to the right of this line.   (from the later try at the line)
 ("rec47", "size", 288.88, 306.26, {"s": 288.15, "cut": [(298.4, 300.72)]}),    # A black hole doesn't actually have a size. It's a singularity, a point, but it does have an event horizon, the distance from which nothing can escape. And that grows in step with its mass. That's why this edge is a straight 45-degree line.   (a first "a", and a first "and that grows in step with it," left out)
 ("rec47", "size", 318.20, 324.82),    # Squeeze the Sun into a black hole and it would be roughly six kilometres wide, and the Earth would be the size of a marble.   (the second try)
 # the big ones
 ("rec47", "big", 329.60, 336.38),     # The black holes we know formed in the collapsing core of dying stars, or grew by swallowing gas and merging with each other.
 ("rec47", "big", 346.38, 349.30),     # They can grow from just a few Suns to billions of Suns.   (two tries left out, one ending "…the centre of our moon")
 ("rec47", "big", 350.12, 353.94),     # The one in the centre of our Milky Way has four million Sun masses.
 ("rec47", "big", 355.86, 373.62, {"s": 355.78}),     # And here's the strange part: the bigger they get, the less dense they are. The really supermassive ones are less dense than water: they would float if you had a pool big enough. Like M87, the first black hole ever to be photographed, or TON 618, one of the largest we know:
 ("rec47", "big", 377.46, 383.68),     # its event horizon is so big that it would fit the orbits of every planet in our solar system.   (the first "its event horizon is so big," left out)
 # the small ones
 ("rec47", "small", 389.68, 397.70),   # But really the most interesting question isn't how big a black hole can be, but how small. With enough pressure, anything can become a black hole.
 ("rec47", "small", 400.78, 415.60),   # We can't do that in a lab, but we know two places where that pressure happens. One is the core of a dying star. The other was the very first moments after the Big Bang, when everything was in a hot, dense soup.
 ("rec47", "small", 417.78, 424.44, {"s": 418.35}),   # Some of that soup could have collapsed into black holes of every size, and some of them might still be around.   ("some of the," left out)
 ("rec47", "search", 428.98, 441.86, {"s": 429.84}),  # We've been looking for them with quasars, with the cosmic microwave background, with gravitational waves and microlensing, and every search has come up empty, and the window where they could hide keeps closing.   (the first "we've been," left out)
 ("rec47", "search", 442.78, 447.28),  # They can't be too small either, or they would have evaporated by now through Hawking radiation.   (the first try; the second has "a process we called…")
 ("rec47", "search", 463.92, 474.38),  # What's left is a narrow window: something like a virus-sized black hole with the mass of a small moon, or an asteroid's mass squeezed into something smaller than a single atom.   (the first try, "with this mass", left out)
 # dark matter
 ("rec47", "dark", 476.70, 484.38),    # And if they're out there, they would be completely invisible. No light, nothing a telescope could see. We'd only notice their gravity.   (the first try)
 ("rec47", "dark", 502.30, 519.06),    # But that's the thing: we do see that gravity. When we weigh galaxies, they are much heavier than everything we can see in them: five, sometimes ten times heavier. So most of the matter in the universe is something invisible, which we call dark matter.
 ("rec47", "dark", 523.04, 530.66),    # We don't know what it is, but if it's tiny black holes, then we wouldn't need any new physics or any new particles to explain it.   (the second try; the third adds "and that's a good thing")
 ("rec47", "dark", 544.38, 551.02, {"cut": [(546.95, 547.95)]}),    # Or maybe it's something else entirely. Maybe it isn't a thing at all, and we just have gravity wrong.   (a doubled "maybe" cut)
 # the search on the chart, and the end: the previous cut until the author records them
 ("cut4", "hunt", 279.3, 335.54),      # But if it is something real, then it's somewhere on this chart… …are just the lucky few survivors.
]
