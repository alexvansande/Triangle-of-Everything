# short-05b-hubble-sphere: video 5, part 2, The Cosmic Event Horizon, as a take of its own. Re-recorded whole in one
# sitting on 2026-11-11 (rec67, "5B morning take", home), replacing the 2026-11-09 cut from rec63 with rec65's patched
# lines. The largest anything can be, the rightmost edge, the speed of light and the stretching of space, the Hubble
# line, the cosmic event horizon, everything inside it on the black-hole line, the two horizons, an alien at our edge,
# "we can actually see them", and the observable universe ahead. Word timings and the fact check:
# video/sources/2026-11-11/. Treatment: enhance.py --plain, natural speed. The last try unless it slips. The earlier
# cut lists are in git history.
# (source, beat, first-word start, last-word start, {s, e, gap, cut}) in source seconds.

SOURCES = {"rec67": "5B morning take.m4a"}   # 2026-11-11 08:49 (11:49 UTC), ALAC 48 kHz stereo, 5:57
TREATMENT = "plain"
# then video/tools/debreath.py (--min 0.03) and the audio.m4a encode as it comes (the author, 2026-11-09, evening)
PAUSES = {"word": 0.25, ",": 0.55, ".": 1.0}
GAPS = {"same": 0.55, "beat": 1.1}
ROOM = True

EDL = [
 # the hook
 ("rec67", "hook", 20.30, 27.04),      # What is the largest anything can be? In this chart, we are plotting every single object that can exist by mass and size.
 ("rec67", "hook", 27.40, 32.02),      # This is the triangle of everything, and today we are going to meet its rightmost edge.
 # the speed of light, and space stretching
 ("rec67", "light", 33.94, 35.88),     # And it's all about the speed of light.
 ("rec67", "light", 37.50, 40.30),     # It's where the speed of light meets the expansion of the universe.   (a new line)
 ("rec67", "light", 43.20, 47.76),     # See, the speed of light isn't really about light: it's the speed limit for anything travelling through space.
 ("rec67", "light", 48.66, 51.02),     # But space itself can stretch faster than that.
 ("rec67", "light", 51.34, 55.54),     # The universe is expanding, but it's not expanding into anything.
 ("rec67", "light", 57.66, 63.94),     # A better metaphor is increasing the resolution of a photo, where one pixel becomes four, or nine, or more.
 ("rec67", "light", 69.80, 73.96),     # That means that the further away something is, the faster it's moving away from us.   (the second try: the first stopped at "the faster it is"; Whisper had merged the two, the words come from a transcription of the stretch alone)
 # the Hubble line and the cosmic event horizon
 ("rec67", "edge", 75.90, 80.36),      # And at this line, called the Hubble line, things are moving away from us at the speed of light.
 ("rec67", "edge", 81.34, 90.36),      # You'd think that their light could never reach us, but, well, it's a little bit more complicated than that, because the Hubble sphere is also growing, so the real edge is a little bit further out.
 ("rec67", "edge", 111.08, 112.64, {"e": 113.22}),   # So this is the cosmic event horizon.   (e: the snap took the "And" of the restart after it; the second pass heard "horizon and the")   (the last of its starts: "it's the real edge / limit" went round four times, "No, no, I just said real edge")
 ("rec67", "edge", 115.90, 120.54),    # It's the actual limit, because anything that happens beyond it will never affect us.   (after a restart, "And this is the cosmic event horizon")
 ("rec67", "edge", 128.16, 130.96),    # We will never know about it. Its light can never reach us.   (its third try; the last run, 2:21, has a noise between "about it" and "its light")
 ("rec67", "edge", 150.24, 153.74),    # No information can get here. It's the real limit of the unknowable.
 # on the black-hole line
 ("rec67", "bh", 156.38, 163.68),      # Now, if we add up everything that we know exists inside this bubble, here's where it lands on our chart: right on the black hole line.
 ("rec67", "bh", 165.68, 168.60),      # OK, does that mean that we are actually living in a black hole?
 ("rec67", "bh", 174.02, 176.88),      # It's an interesting coincidence, because both are kind of a horizon.   (the second start)
 ("rec67", "bh", 217.42, 230.20),      # A black hole's event horizon is where the light that falls in can never come out, and our cosmic horizon is where the light that is outside can never come in. Also, both depend on the mass of what's inside it.   (the last run; the first, 2:57-3:37, restarted four times)
 ("rec67", "bh", 244.70, 258.94),      # The radius of a black hole depends directly on how much stuff is in it, and the size of our Hubble sphere depends on how fast the universe expands, which depends on how much stuff is in it too. So it's no coincidence that they both are on the same line.   (from its third "the radius of a black hole": the run restarted twice there)
 # our universe, not the universe
 ("rec67", "centre", 260.38, 261.86),  # But that's also where the similarities end,
 ("rec67", "centre", 266.70, 268.46, {"gap": 0.3}),   # because the black hole is an object with a centre.   (the restart's end: "because the black hole, but that's also where similarities end, because the black hole is an object with a centre"; Whisper had merged it, the words come from the stretch alone)
 ("rec67", "centre", 269.72, 273.50),  # Our universe is just that: it's our universe, it's not the universe.
 ("rec67", "centre", 280.50, 285.12),  # Let's imagine, for a moment, an alien living in a galaxy that, for us, seems to be right at the edge.   (the second try: the first ended "seems to be on air"; merged by Whisper, the words from the stretch alone)
 ("rec67", "centre", 285.88, 288.72),  # Well, for them, their universe is centred around them.
 ("rec67", "centre", 298.48, 305.68),  # They don't see a bunch of empty space on the other side. They see more and more galaxies, because, as far as we can tell, the universe is in practice infinite.   (the second try; the first said "practically infinite")
 # and we see them
 ("rec67", "see", 338.32, 353.98),     # And how do we know we can see more galaxies on the other side? Because, and that's the crazy bit, we can actually see them too. Or at least we just see the past version of them. It's time we meet the only thing that sits outside our triangle: the observable universe.   (said again whole after "did I say triangle? Oh yeah, I did say triangle")
]

POST_CUTS = []
