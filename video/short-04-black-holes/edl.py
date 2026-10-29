# short-04-black-holes: video 4, re-recorded whole on 2026-10-29 from the rewritten script (a hook, no
# star life-cycle recap, the Sun and the Earth as black holes, "billions", TON 618 bigger than Pluto's
# orbit, the cosmic bullet, the very first moments).
#   rec48 = "Black holes again.m4a" (Google Drive "Recordings", 2026-10-29, 12:58, AAC 48 kHz), the
#           whole script with retakes. The author: "usually the last take is my favourite"; the last try
#           is used unless it trails off or has a slip (noted per clip).
# Treatment: enhance.py --plain, natural speed (no tempo). Build: see video/short-01-hook/README.md.
# (source, beat, first-word start, last-word start, {s, e, gap, cut, gain}) in source seconds.
# The earlier cuts (rec47 + the rec43/rec41 second half, 2026-10-29; rec43 + rec41, 2026-10-27) are in
# git history.

PAUSES = {"word": 0.18, ",": 0.3, ".": 0.45}

EDL = [
 # the hook
 ("rec48", "hook", 23.94, 30.62),      # What is the smallest black hole that could exist? And is it possible that most matter in the universe is them?   (the first try, "And could,", left out)
 # ("I want to show you this chart." left out: the author, 2026-10-29, "remove the first line")
 # the chart, and the cores stars leave
 ("rec48", "intro", 77.76, 89.34),     # I've been doing a series of videos explaining this chart, which I call the triangle of everything, because it contains literally everything on a log of mass and size.   (the last of five tries)
 ("rec48", "intro", 100.12, 112.74),   # In the last video, we saw that this chart could show how stars die and leave a dense core behind, which can be a white dwarf, a neutron star, or the one I want to talk about today, a black hole.   (two starts left out)
 # the line
 ("rec48", "line", 141.26, 155.66),    # Most objects in this chart are a bunch of little dots, but black holes are not. They all sit exactly on one line, called the Schwarzschild radius. And it's a very important line, because it's the top-left edge of our triangle.   (the second try)
 ("rec48", "line", 190.14, 198.82, {"e": 199.3}),  # Any object that becomes too small for its mass will collapse into a black hole, and every black hole lives exactly on this line,   (the "correlation" tries left out)
 ("rec48", "line", 219.48, 225.82),    # meaning that there's no object that could ever exist that lives above or to the left of it.   (the last of four tries)
 ("rec48", "size", 229.88, 252.50),    # A black hole doesn't really have a size: it's thought to be a singularity, a point. But it does have an event horizon, the distance from which nothing can escape, and that grows in step with its mass. That's why the edge is a straight 45-degree line. Squeeze the Sun into a black hole and it would be about six kilometres wide, and the Earth would be the size of a marble.
 # the big ones
 ("rec48", "big", 257.62, 265.20),     # The black holes we know formed in the collapsing core of dying stars, or just grew by swallowing gas and merging with other black holes.
 ("rec48", "big", 266.58, 269.30),     # They can go from a few Suns to billions of stars.   (the first try: the second says "billions times the size of our Sun", but a billion-Sun black hole is ~8,000 times the Sun's width)
 ("rec48", "big", 275.50, 279.96, {"s": 276.0}),  # The one in the centre of the Milky Way, for example, has four million solar masses.   (from 276.0: before it, the end of the other try's "…of our Sun" sounded like an "and", the author's note)
 ("rec48", "big", 283.68, 293.02),     # And here's the strange part: the bigger they get, the less dense they are. The really supermassive ones are less dense than water: they would float if you had a pool big enough.
 ("rec48", "big", 300.24, 309.62, {"s": 302.4}),  # Like M87, the first black hole ever to be photographed, or TON 618, one of the largest we know of.   (the second try; from the second "like M87": a "Like M8…" restart before it, 300.9–302.1, the author's note)
 ("rec48", "big", 343.36, 346.06),     # Its event horizon is bigger than Pluto's orbit.   (the last of five; the author: "I prefer the last one")
 # the small ones
 ("rec48", "small", 350.42, 357.26, {"e": 357.62}),  # But the most interesting question isn't how big they can be, but how small. With enough pressure, anything can become a black hole.
 ("rec48", "small", 362.30, 389.58),   # We can't really create one in the lab, but we know two places where that condition exists. The first one is, as I said, the core of a dying star. But the second one was the very first instants after the Big Bang, when everything was a super hot and super dense soup. Some of that soup could have collapsed into black holes of every size, and some of these might still be around.   ("We know of two places where," left out)
 ("rec48", "search", 396.44, 410.58),  # And we've been looking for them with quasars, with the cosmic microwave background, gravitational waves, and finally with microlensing. And every search has come up empty, and the window where they could hide keeps closing.   (the first start left out)
 ("rec48", "search", 416.66, 421.78),  # They can't be too small either, or they'd have evaporated by now through a process we call Hawking radiation.   (two starts left out)
 ("rec48", "search", 434.14, 444.83),  # What's left is a narrow window: something the size of a virus with the mass of a small moon, or a whole asteroid's mass squeezed into something smaller than an atom.   (the last of three)
 # dark matter
 ("rec48", "dark", 451.31, 462.37),    # And if they're out there, they'd be invisible. No light, nothing a telescope could see. We would only notice their gravity. But that's the thing: we do see that gravity.
 ("rec48", "dark", 469.73, 483.93),    # When we weigh galaxies, they are much heavier than everything we can see in them: five, sometimes ten times heavier. So most of the matter in the universe is something invisible, which of course we call dark matter. We don't know what it is.   (the second try)
 ("rec48", "dark", 501.83, 508.57),    # But if they are just tiny black holes, then it's interesting, because it wouldn't need any new particle to explain them.   (the last try; the first says "any particle")
 ("rec48", "dark", 510.83, 518.37, {"cut": [(514.12, 515.52)]}),    # Or of course, maybe it's something else entirely. Maybe it isn't a thing at all, and we just got gravity wrong.   (a first "Maybe it isn't a," cut)
 # crossed off the chart
 ("rec48", "hunt", 533.53, 549.05),    # But if it's something real, it's somewhere on this chart, and people have been looking for it. And not only on the black hole line, oh no: someone worked out that if dark matter came in lumps about roughly this size, they'd leave tracks in crystals of ancient rocks.   (the third try)
 ("rec48", "hunt", 551.71, 553.11),    # So they looked at the rocks: nothing.
 ("rec48", "hunt", 723.19, 735.25),    # Another team realised that it can't be here either, otherwise people's heads would just randomly explode, as if they were just shot by a cosmic bullet. So we crossed out this area.   (the last of many tries)
 ("rec48", "hunt", 737.47, 743.29),    # The search for dark matter is really a lot of scientists scratching off areas of this map, one by one.
 # the end
 ("rec48", "end", 756.89, 774.71),     # But I still find it fascinating that just maybe, in the very first moments of our history, most of the matter that existed just collapsed into black holes. And we, everything else, the galaxies, the stars, everything we know, are just the lucky few survivors.   (the last try)
]
