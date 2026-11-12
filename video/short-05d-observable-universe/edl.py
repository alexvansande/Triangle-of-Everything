# short-05d-observable-universe: The Observable Universe, from Earth out: the author's rewrite of 5c as a zoom from
# Earth outward, with no chart (recording-scripts.md, "5d"), recorded 2026-11-12 (rec71, "5d take", home, the morning).
# The age of the light we see, step by step: the Moon, the Sun, the planets, the nearest stars, the galaxy, Andromeda,
# Laniakea, the past of the universe, the cosmic event horizon, the observable universe, the oldest light. Word timings
# and the fact check: video/sources/2026-11-12/. Treatment: enhance.py --plain, natural speed. The last try unless it
# slips. 5c stays as it is. The zoom's script for it (timeline-05d.js) is keyed in the zoom's checkout to this take's
# phrases (the scene's zoom marks). Build: video/short-01-hook/README.md.
# (source, beat, first-word start, last-word start, {s, e, gap, cut}) in source seconds.

SOURCES = {"rec71": "5d take.m4a"}   # 2026-11-12 08:48 local (11:48 UTC), ALAC 48 kHz stereo, 11:14
TREATMENT = "plain"
# then video/tools/debreath.py (--min 0.03) and the audio.m4a encode as it comes
PAUSES = {"word": 0.25, ",": 0.55, ".": 1.0}
GAPS = {"same": 0.55, "beat": 1.1}
ROOM = True

EDL = [
 ("rec71", "hook", 31.46, 40.60),   # Most people know that when you look at the night sky, the light you see is how stars were in the past. But the sky you see is actually much younger than most realize.
 ("rec71", "moon", 65.72, 71.58, {"s": 66.15}),   # The moon you're looking at is how it was merely a second ago, younger than this phrase.   (the last try, from its second "the moon": the first "The moon you're looking at," restarts; Whisper merged them, the stretch re-timed alone, the start set by hand)
 ("rec71", "sun", 129.40, 134.84),   # Light leaving the sun right now will be a quarter of the way here by the time you finish watching this video.   (the last of six)
 ("rec71", "planets", 163.06, 166.54),   # The light from Mars and the inner planets is less than half an hour old.   (the fourth start)
 ("rec71", "planets", 243.94, 249.52, {"s": 246.05}),   # If you can see Jupiter, you're looking at it how it was one hour ago.   (the last of five starts; s: Whisper put its "if" 2 s early; "Saturn, roughly one and a half" after it left out: a fragment, see NOTES)
 ("rec71", "stars", 271.84, 282.76),   # The nearest stars you can see with your own eyes, Alpha Centauri and Sirius, live right here, a few light-years away. You are seeing them as they were one or two Olympics ago.   (the fifth start; the Olympics-broadcast idea after it never settled: "I'm going to think about it")
 ("rec71", "stars", 442.18, 447.46, {"s": 443.3}),   # Most of the others sent their light before the internet was invented, or even electricity.   (the fourth of five; the fifth slurs "or at sometimes electricity"; s: a "Most of them." restart before it, which the second pass heard)
 ("rec71", "stars", 490.54, 495.06),   # Depending where you are, most of them will be older than the country you are watching them from.   (the last of six tries at the line)
 ("rec71", "galaxy", 380.98, 386.62),   # The light from the other side of the galaxy started its journey when humans were first leaving Africa.   (the FIRST try: the four later ones are heard as "living (in) Africa", which would be wrong; this one is heard as "leaving" by both models)
 ("rec71", "galaxy", 505.20, 512.18),   # On a dark night, you can see Andromeda with the naked eye, and when you do, you are looking at how it was before humans discovered fire.   (the second)
 ("rec71", "galaxy", 547.74, 553.50),   # The far side of Laniakea, the supercluster of galaxies in which we are part of,   (the last of five starts, to "part of")
 ("rec71", "galaxy", 559.98, 564.76, {"gap": 0.3}),   # sent its light when the dinosaurs were still around. They never got the message.   (the second of three; the third has a 4 s hole before "they never")
 ("rec71", "deep", 580.30, 588.98, {"s": 581.1}),   # As we look further down, we are seeing the past of our very universe: before superclusters, before clusters, before galaxies were even formed.   (from its second "as": "…the past of our –" restarted; merged by Whisper, re-timed alone, the start set by hand)
 ("rec71", "deep", 591.48, 598.06),   # Space expands so fast that, for the region outside this bubble, any light they send now will never reach us.   (the first; the second restarts "The present –")
 ("rec71", "deep", 611.72, 616.68),   # The present and future of these ancient galaxies will remain forever unknowable to us.
 ("rec71", "deep", 616.98, 619.48),   # This is the limit of the cosmic event horizon.
 ("rec71", "obs", 622.90, 625.26),   # But we can still see their past. Our past.
 ("rec71", "obs", 626.52, 630.60),   # This is the observable universe: the sum of all the light we can see.
 ("rec71", "obs", 631.36, 634.82),   # It's not a single thing, because one side can't talk to the other.
 ("rec71", "obs", 635.28, 638.70),   # It's not a map, but rather the history of our shared universe.
 ("rec71", "obs", 648.50, 651.54),   # We can see the light emitted before stars were even formed.   (its second start: the first stopped at "emitted"; merged by Whisper, re-timed alone)
 ("rec71", "obs", 653.30, 663.58),   # The furthest we can see is a faint microwave radiation, emitted 380,000 years after the Big Bang, just as the universe became transparent for the first time.
 ("rec71", "obs", 664.10, 668.84),   # Light that has been travelling toward us since light could travel at all.
]

POST_CUTS = []
