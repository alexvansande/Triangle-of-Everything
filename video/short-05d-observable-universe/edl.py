# short-05d-observable-universe: The Observable Universe, from Earth out: the author's rewrite of 5c as a zoom from
# Earth outward, with no chart (recording-scripts.md, "5d"). Recorded whole three times: rec71 and rec72 (2026-11-12;
# the cut of 2026-11-12 was rec72 alone, in git history) and rec73 ("5d take 3", 2026-11-13 08:13, uploaded to the
# session: "re-recorded everything because there were some passages I was not happy" with), which this cut is made
# from alone. rec73's changes, said on the take: Jupiter folded into the planets ("I think we can merge that": "…is
# less than half an hour old. Jupiter is just slightly above that."), "Here we have the nearby stars", Alpha Centauri
# "tuning in to the World Cup or the Olympics", the stars' light "way before computers were invented. In some cases,
# they're older than the country you're watching this from", "invented fire", any signal from Laniakea's far side
# "was sent to us when the dinosaurs were still roaming around", and "We can see the light emitted before the stars
# even formed" left out ("take out this line"). Word timings and the fact check: video/sources/2026-11-13/.
# Treatment: enhance.py --plain, natural speed. The zoom's script for it (timeline-05d.js) is keyed in the zoom's
# checkout to this take's phrases. Build: video/short-01-hook/README.md.
# (source, beat, first-word start, last-word start, {s, e, gap, cut}) in source seconds.

SOURCES = {"rec73": "5d take 3.m4a"}   # 2026-11-13 08:13 local (11:13 UTC), iPhone Voice Memos, ALAC 48 kHz stereo, 8:25
TREATMENT = "plain"
# then video/tools/debreath.py (--min 0.03) and the audio.m4a encode as it comes
PAUSES = {"word": 0.25, ",": 0.55, ".": 1.0}
GAPS = {"same": 0.55, "beat": 1.1}
ROOM = True

EDL = [
 ("rec73", "hook", 24.86, 34.76),   # Everyone knows that when you look at the night sky, the light you see now is how stars were in the past. But the sky you see is surprisingly younger than most people realize.
 ("rec73", "moon", 37.78, 46.00),   # The moon you're looking at is how it was merely a second ago. It's younger than this phrase.   (the second start; the first, "…looking at how", restarted)
 ("rec73", "sun", 46.52, 51.94),   # Light leaving the sun right now will be a quarter of its way here by the time you finish watching this video.
 ("rec73", "planets", 84.90, 92.40),   # The light from Mars and the inner planets is less than half an hour old. Jupiter is just slightly above that.   (the last, the two merged, as the author said on the take)
 ("rec73", "stars", 96.10, 98.14),   # Here we have the nearby stars.   (the second; the first, "Here are…")
 ("rec73", "stars", 118.61, 125.12),   # If someone in Alpha Centauri is tuning in to the World Cup or the Olympics, then they are watching it one whole tournament late.   (the last of three)
 ("rec73", "stars", 199.72, 204.78),   # Most of the stars in the night sky sent their lights way before computers were invented.   (the last of its tries, "lights" as said: the one with "light", 2:23, restarts three times inside)
 ("rec73", "stars", 214.04, 217.86),   # In some cases, they're older than the country you're watching this from.   (the last; the one before trails off)
 ("rec73", "galaxy", 222.84, 227.90),   # The light from the other side of the galaxy started this journey when humans were first leaving Africa.
 ("rec73", "galaxy", 229.82, 233.02),   # On a very dark night, you can see Andromeda with the naked eye.
 ("rec73", "galaxy", 241.40, 245.84),   # And if you do, you are looking at it how it was before humans invented fire.
 ("rec73", "laniakea", 247.44, 252.10),   # We live in a supercluster of galaxies in the form of filaments called the Laniakea.
 ("rec73", "laniakea", 321.90, 331.40),   # Any signal from the far side of that filament was sent to us when the dinosaurs were still roaming around. They never got the message.   (the last of many tries)
 ("rec73", "deep", 331.84, 344.08),   # As we look further down, we are seeing the past of our very universe, before superclusters, before clusters, even before galaxies were formed.
 ("rec73", "deep", 345.74, 352.76),   # Space here expands so fast that for the region outside this bubble, any light they send now will never reach us.
 ("rec73", "deep", 353.96, 362.16),   # The present and the future of these ancient galaxies will remain forever unknowable to us. This is the limit of the cosmic event horizon.
 ("rec73", "obs", 364.02, 379.58),   # But we can still see their past. Our past. This is the observable universe, the sum of all the light we can see. It's not the whole universe. As far as we've been able to measure, the universe is in practice infinite in every direction.
 ("rec73", "obs", 387.44, 394.98),   # We are just limited on how much of it we can see. It's not a single object either, because one side can't talk to the other.   (the first; the second says "can talk")
 ("rec73", "obs", 414.66, 417.86, {"s": 414.79}),   # It's not a map, but rather the history of our shared universe.   (the last, from "it's": its "and" left out; the first two restart)
 ("rec73", "obs", 436.76, 444.30),   # The furthest light we can see is a faint microwave radiation, emitted 380,000 years after the Big Bang,   (the first, to "Big Bang": its end, "…transparent to further thoughts", slips, and the second's start sounds like "the first slide")
 ("rec73", "obs", 478.38, 481.60),   # just as the universe became transparent for the first time.   (the second's end)
 ("rec73", "obs", 493.40, 499.00),   # Light that has been travelling toward us since light could travel at all.   (the last of three)
]

POST_CUTS = []
