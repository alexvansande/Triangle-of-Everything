# short-05c-observable-universe: video 5, part 3, The Observable Universe, as a take of its own, from the author's
# recording of 2026-11-09 (rec64, home): everything falls in the triangle, almost; the three sides; our universe out to
# the cosmic event horizon, 16 billion light-years; the observable universe, 46 billion; looking far is looking back;
# galaxies beyond reach; one side can't talk to the other; a future that never will be; before the stars, the light of
# 380,000 years after the Big Bang. Until this take the Short was carved from video 5
# (video/retired/short-05c-observable-universe.cut.json). Word timings and the fact check: video/sources/2026-11-09/.
# Treatment: enhance.py --plain, natural speed. The last try unless it slips.
# (source, beat, first-word start, last-word start, {s, e, gap, cut}) in source seconds.

SOURCES = {"rec64": "the observable universe.aifc"}
TREATMENT = "plain"
# then, after video/tools/debreath.py (--min 0.03, for clicks too), the audio.m4a encode with
# ffmpeg -af "adeclick=w=40:o=75,lowpass=f=12500": today's recordings carry a 12–16 kHz artifact that crackled on the
# s sounds (the author, 2026-11-09: "crackling noises", "cluzzzeetrzz")
PAUSES = {"word": 0.25, ",": 0.55, ".": 1.0}
GAPS = {"same": 0.55, "beat": 1.1}
ROOM = True

EDL = [
 # everything in a triangle, almost
 ("rec64", "hook", 36.24, 45.60),      # So I'm doing this thing where I'm just plotting every object that can ever exist in this chart of mass and size. And the funny thing is everything falls into a triangle.   (from its third start)
 ("rec64", "hook", 63.16, 70.62),      # Oh, did I say everything? Oh, that's not true. Almost everything, because actually there's one thing that falls outside of it.
 ("rec64", "hook", 72.60, 75.24),      # But I'm not even sure you can call that an object.
 ("rec64", "hook", 78.86, 81.24),      # Today we're exploring the observable universe.
 # the three sides
 ("rec64", "sides", 96.38, 100.14),    # So our chart is limited by three sides. Relativity on the top left.   (from its third start)
 ("rec64", "sides", 107.30, 108.74),   # Quantum mechanics on the bottom left.
 ("rec64", "sides", 113.84, 115.32),   # And the size of the universe on the right.   (the second: the first said "right mode")
 # our universe
 ("rec64", "ours", 131.92, 137.44),    # But I should clarify that this is the size of our universe. That's the cosmic event horizon.
 ("rec64", "ours", 149.42, 166.92),    # About 16 billion light-years across in every direction. This is the limit of everything that can happen that can ever affect us. Nothing that happens outside this bubble will ever be known to us, will ever be seen by us, or will ever reach us.
 ("rec64", "ours", 180.44, 184.28),    # Scientists call this our universe because it's the limit of what can affect us.
 # the observable universe
 ("rec64", "obs", 217.14, 227.30),     # But again, that's 16 billion light-years across. If you ask a scientist the size of the universe, they would give you a number much closer to 46 billion light-years.
 ("rec64", "obs", 236.68, 244.94),     # What's happening is that there is yet another horizon, and that's the observable universe. That's the sum of all the light that has ever reached us.   (its second start)
 # looking far, looking back
 ("rec64", "past", 311.76, 318.68),    # When we point a telescope that far deep, we are not looking only at distant stars, we are looking at our own distant past.   (the last of four)
 ("rec64", "past", 330.62, 339.96),    # We see galaxies that are way beyond our reach. Even if you could travel at the speed of light and live forever, you would never be able to touch them.
 ("rec64", "past", 370.66, 380.80),    # It also means that what happens on one side can never talk to what happens on the other side. So it's not really a single object at all.
 ("rec64", "past", 388.54, 404.30, {"cut": [(394.10, 396.75)]}),   # It represents not only our past, but also a future that never will be. We will never be able to see where they go, or even where they are right now. Even their future is beyond our reach.   (a first "We will never be able to see where they are." cut)
 # before the stars: the oldest light
 ("rec64", "cmb", 456.64, 476.46, {"s": 459.20}),   # (from its second "and when we look": the second pass found "And when we look at the," before it)
      # And when we look at our distant past, we can see a time before superclusters, before clusters, before galaxies, even before stars existed. We can see the faint radiation that was emitted 380,000 years just after the Big Bang,
 ("rec64", "cmb", 546.44, 557.16, {"s": 548.30}),   # (from its second "light that has been traveling": the second pass found the first, cut off)
      # light that has been traveling towards us since light could travel in the universe at all, since it has become transparent enough for light to pass.
]

POST_CUTS = []
