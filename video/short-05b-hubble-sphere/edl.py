# short-05b-hubble-sphere: video 5, part 2, The Cosmic Event Horizon, as a take of its own, from the author's recording
# of 2026-11-09 (rec63, home): the largest anything can be, the rightmost edge, the speed of light and the stretching of
# space, the Hubble line, the cosmic event horizon, everything inside it on the black-hole line, the two horizons, an
# alien at our edge, "we can actually see them", and the observable universe ahead. Until this take the Short was carved
# from video 5 (video/retired/short-05b-hubble-sphere.cut.json). Word timings and the fact check:
# video/sources/2026-11-09/. Treatment: enhance.py --plain, natural speed. The last try unless it slips.
# (source, beat, first-word start, last-word start, {s, e, gap, cut}) in source seconds.

SOURCES = {"rec63": "The Cosmic Event Horizon.aifc"}
TREATMENT = "plain"
# then video/tools/debreath.py (--min 0.03) and the audio.m4a encode as it comes (the author, 2026-11-09, evening: a
# test with and without the de-click and the 12.5 kHz low-pass added earlier that day: all clean, and without them it sounded better)
PAUSES = {"word": 0.25, ",": 0.55, ".": 1.0}
GAPS = {"same": 0.55, "beat": 1.1}
ROOM = True

EDL = [
 # the hook
 ("rec63", "hook", 26.48, 28.32),      # What's the largest anything can be?   (the last of four)
 ("rec63", "hook", 39.46, 44.78),      # In this chart, we are plotting every single object that can exist by mass and size.   (its second try)
 ("rec63", "hook", 102.50, 106.82),    # This is the triangle of everything. And today, we're going to meet its rightmost edge.
 # the speed of light, and space stretching
 ("rec63", "light", 110.22, 122.88),   # And it's all about the speed of light. See, the speed of light isn't really about light. It's the speed limit for anything traveling through space. But space itself can stretch faster than that.   ("And that depends." left out before it)
 ("rec63", "light", 163.90, 175.44),   # The universe is expanding, but it's not expanding into anything. A better metaphor is like increasing the resolution of a photo, where one pixel just becomes four or nine or more.   (the last of five)
 ("rec63", "light", 184.62, 188.46),   # That means that the further away something is, the faster it's moving away from us.   (its second try)
 # the Hubble line and the cosmic event horizon
 ("rec63", "edge", 191.24, 206.08),    # And at this line, called the Hubble line, things are moving away from us at the speed of light. You'd think that their light could never reach us, but, well, it's a little bit more complicated than that, because the Hubble sphere is also growing, so the real edge is a little bit further out.
 ("rec63", "edge", 298.86, 316.96, {"cut": [(311.42, 315.35)]}),   # ("That's the real limit of what we can know." cut: the author heard "the real limit" twice; from 311.42, after "us" ends: at 310.75 it clipped "reach us", the author, 2026-11-09)
     # This is the cosmic event horizon, and it's the real limit, because anything that happens beyond it will never affect us, we will never know about it, its light can never reach us. That's the real limit of what we can know. It's the real limit of the unknowable.   (the last of six)
 # on the black-hole line
 ("rec63", "bh", 386.70, 399.62, {"s": 387.30}),   # (from its second "now if we": the second pass found "Now, if you," before it)
       # Now if we add up everything that we know to exist inside this bubble, here's where it lands on our chart: it's right on the black hole line. Okay, does that mean that we are actually living in a black hole?   (the last of seven)
 ("rec63", "bh", 402.10, 443.90, {"cut": [(411.60, 413.55), (422.45, 428.40)]}),   # ("our cosmic ho—" cut; the first "The radius of a black hole…" cut whole, its "The" too)
    # It's an interesting coincidence, because both are kind of a horizon. A black hole's event horizon is where the light that falls in can never come out; our cosmic horizon is where nothing outside can ever come in. Also both depend on the mass of what's inside it. The radius of a black hole depends directly on how much stuff is in it, and the size of our Hubble sphere depends on how fast the universe expands, which depends on how much stuff is also in it. So it's no coincidence that they are both on the same line.   (its first "The radius of a black hole depends…" cut, for the second)
 # our universe, not the universe
 ("rec63", "centre", 445.84, 456.30),  # But that's also where the similarities end, because a black hole is an object with a center. Our universe is just that, it's our universe, it's not the universe.
 ("rec63", "centre", 518.14, 527.54, {"s": 518.50}),   # But let's imagine for a moment an alien living in a galaxy that seems on the edge for us. Well, for them, their universe will be also centered around them.   (from "but", 518.58: at 518.70 it began mid-word, the author heard a lost syllable)
 ("rec63", "centre", 571.50, 580.52),  # They don't see a bunch of empty space to the other side. They see more and more galaxies, because as far as we've been able to measure, the universe is infinite.   (the last try)
 # and we see them
 ("rec63", "see", 691.04, 698.90),     # And how do we know they can see more galaxies on the other side? Because, and that's the crazy bit, we can actually see them.   (the last of eight)
 ("rec63", "see", 716.34, 722.54),     # It's time we meet the only thing that fits outside our triangle: it's the observable universe.
]

POST_CUTS = []
