# short-05d-observable-universe: The Observable Universe, from Earth out: the author's rewrite of 5c as a zoom from
# Earth outward, with no chart (recording-scripts.md, "5d"). Recorded whole twice on 2026-11-12: rec71 (08:48, the
# first cut) and rec72 ("5d take 2", 10:55, home: "not because it was bad, I think it can be better"), which this cut is
# made from alone, with the three lines the author rewrote after hearing the first cut ("Everyone knows", Alpha
# Centauri's TV, Laniakea's light only arriving now) and a new passage at the end (the universe in practice infinite,
# we see only so much of it). The age of the light we see, step by step, out to the cosmic event horizon and the
# oldest light. Word timings and the fact check: video/sources/2026-11-12/. Treatment: enhance.py --plain, natural
# speed. The last try unless it slips. 5c stays as it is. The zoom's script for it (timeline-05d.js) is keyed in the
# zoom's checkout to this take's phrases (the scene's zoom marks). Build: video/short-01-hook/README.md.
# (source, beat, first-word start, last-word start, {s, e, gap, cut}) in source seconds.

SOURCES = {"rec72": "5d take 2.m4a"}   # 2026-11-12 10:55 local (13:55 UTC), ALAC 48 kHz stereo, 9:51
TREATMENT = "plain"
# then video/tools/debreath.py (--min 0.03) and the audio.m4a encode as it comes
PAUSES = {"word": 0.25, ",": 0.55, ".": 1.0}
GAPS = {"same": 0.55, "beat": 1.1}
ROOM = True

EDL = [
 ("rec72", "hook", 43.58, 49.16),   # Everyone knows that when you look at the night sky, the light you see now is how stars were in the past.   (the take's first line)
 ("rec72", "hook", 54.44, 59.58),   # But the sky you see is surprisingly younger than most people realize.   (the second try; the first, "…is actually surprisingly younger", restarted)
 ("rec72", "moon", 60.66, 65.38),   # The moon you're looking at is how it was merely a second ago. It's younger than this phrase.
 ("rec72", "sun", 67.22, 72.62),   # Light leaving the sun right now will be a quarter of its way here by the time you finish watching this video.   ("…will have arrived by the time you finish watching this video", 1:35-1:44, recorded for a longer video, not used)
 ("rec72", "planets", 75.12, 78.74),   # The light from Mars and the inner planets is less than half an hour old.
 ("rec72", "planets", 79.50, 82.78),   # If you can see Jupiter, you're looking at it how it was one hour ago.
 ("rec72", "stars", 139.56, 140.72),   # Here are the nearby stars.   (the fourth of five; the fifth hesitates mid-phrase)
 ("rec72", "stars", 155.64, 162.52),   # If someone in Alpha Centauri has a TV, they're just now watching the Olympics, one whole tournament late.   (the last of three)
 ("rec72", "stars", 189.78, 196.76),   # Most of the others you see on the night sky sent their light before the internet, sometimes even electricity, was invented.   (the last of five; the "depending where you are… older than the country" line of rec71 isn't in this take)
 ("rec72", "galaxy", 210.50, 215.66),   # The light from the other side of the galaxy started its journey when humans were first leaving Africa.   (the second; "started this journey" as Whisper hears it)
 ("rec72", "galaxy", 225.62, 233.72),   # On a very dark night, you can see Andromeda with the naked eye, and if you do, you are looking at it how it was before humans discovered fire.   (the second)
 ("rec72", "laniakea", 248.40, 253.10),   # We live in a supercluster of galaxies in the form of filaments called Laniakea.   (the third of its tries; the last run, 5:03-5:13, restarts twice)
 ("rec72", "laniakea", 284.04, 293.50),   # The light from the far side of that filament was sent when the dinosaurs were still roaming around. It's only arriving now. They never got the message.   (the one complete run with "was sent": the later ones say "were sent")
 ("rec72", "deep", 357.44, 361.00),   # As we look further down, we are seeing the past of our very universe,   (the second start)
 ("rec72", "deep", 372.46, 376.24, {"gap": 0.3}),   # before superclusters, before clusters, before galaxies were even formed.   (the fourth try at the list)
 ("rec72", "deep", 377.48, 384.50),   # Space expands so fast that, for the region outside this bubble, any light they send now will never reach us.
 ("rec72", "deep", 389.90, 395.00),   # The present and future of these ancient galaxies will remain forever unknowable to us.   (the second of four; the last two have long holes inside)
 ("rec72", "deep", 425.96, 427.86),   # This is the limit of the cosmic event horizon.   (the last of three)
 ("rec72", "obs", 429.74, 432.52),   # But we can still see their past. Our past.
 ("rec72", "obs", 518.36, 521.26),   # This is the observable universe, the sum of all the light you can see.   (the second run, the one with the new passage after it: "I might keep that last part")
 ("rec72", "obs", 539.34, 540.46),   # It's not the whole universe.   (the new passage)
 ("rec72", "obs", 541.42, 546.48),   # As far as we've been able to measure, the universe is in practice infinite in every direction.   (the second try)
 ("rec72", "obs", 546.96, 549.80),   # We are just limited on how much of it we can see.
 ("rec72", "obs", 553.64, 557.80),   # It's not a single object either, because one side can't talk to the other.
 ("rec72", "obs", 559.08, 562.78),   # It's not a map, but rather the history of our shared universe.
 ("rec72", "obs", 563.98, 566.60),   # We can see the light emitted before the stars even formed.
 ("rec72", "obs", 567.74, 574.24),   # The furthest we can see is a faint microwave radiation emitted 380,000 years after the Big Bang,
 ("rec72", "obs", 472.78, 475.50, {"gap": 0.3}),   # just as the universe became transparent for the first time.   (from the earlier run, 7:52: the last run's "Just as the…" hangs on "the" for half a second)
 ("rec72", "obs", 580.40, 584.92),   # Light that has been travelling toward us since light could travel at all.   (the last)
]

POST_CUTS = []
