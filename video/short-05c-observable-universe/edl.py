# short-05c-observable-universe: video 5, part 3, The Observable Universe, as a take of its own. Re-recorded whole in
# one sitting on 2026-11-11 (rec68, "6c morning take": the author's file name; it is 5c, home), replacing the 2026-11-09
# cut from rec64 with rec65's patched lines. Everything falls in the triangle, except one thing; the three sides; our
# universe out to the cosmic event horizon, 16 billion light-years; the observable universe, 46 billion; looking far is
# looking back; galaxies beyond reach; one side can't talk to the other; a future that never will be; before the stars,
# the light of 380,000 years after the Big Bang. Word timings and the fact check: video/sources/2026-11-11/.
# Treatment: enhance.py --plain, natural speed. The last try unless it slips. The earlier cut lists are in git history.
# (source, beat, first-word start, last-word start, {s, e, gap, cut}) in source seconds.

SOURCES = {"rec68": "6c morning take.m4a"}   # 2026-11-11 08:56 (11:56 UTC), ALAC 48 kHz stereo, 8:16
TREATMENT = "plain"
# then video/tools/debreath.py (--min 0.03) and the audio.m4a encode as it comes (the author, 2026-11-09, evening)
PAUSES = {"word": 0.25, ",": 0.55, ".": 1.0}
GAPS = {"same": 0.55, "beat": 1.1}
ROOM = True

EDL = [
 # the hook
 ("rec68", "hook", 31.52, 40.36),      # So I'm doing this thing where I'm plotting every object that can ever exist on this chart of mass and size. And the funny thing is, everything falls into a triangle.
 ("rec68", "hook", 61.84, 66.60),      # Everything except one, but I'm not even sure you can call that a single object.   (the last of five tries at the line, from "everything": its "I mean," out)
 ("rec68", "hook", 72.76, 74.58),      # Today, we're exploring the observable universe.   (the second)
 # the three sides
 ("rec68", "sides", 86.88, 88.40, {"e": 88.6}),   # So this chart is limited by three sides.   (the second start, from "so"; e: a murmured "this chart" follows, which the second pass heard)
 ("rec68", "sides", 92.48, 97.24),     # Relativity on the top left, quantum mechanics on the bottom left, and the size of the universe on the right.
 # our universe, out to the cosmic event horizon
 ("rec68", "ours", 99.26, 107.56),     # But I should clarify that this is the size of our universe. That's the cosmic event horizon, about 16 billion light-years away in every direction.   (the FIRST run of the two sentences: the second run's "But I should clarify" starts on the tail of a false start, and its "16 billion light-years wide" is wrong: it's the radius. See NOTES; the author may re-record it)
 ("rec68", "ours", 144.32, 147.66),    # This is the limit of everything that can happen and can ever affect us.
 ("rec68", "ours", 148.36, 154.24),    # Nothing that happens outside this bubble will ever be known to us, will ever be seen by us, or will ever reach us.
 ("rec68", "ours", 155.06, 158.56),    # We can call this our universe, because it's the limit of what can affect us.
 ("rec68", "ours", 159.48, 161.90),    # But again, that's 16 billion light-years away.   (the first: the retake dropped "away", to go with "wide")
 # the observable universe
 ("rec68", "obs", 165.80, 171.82),     # And if you ask a scientist about the size of the universe, they would give you a number much closer to 46 billion light-years.
 ("rec68", "obs", 175.70, 179.58),     # What's happening is that there is yet another horizon, and that's the observable universe.   (the second start)
 ("rec68", "obs", 243.90, 246.54),     # That's the sum of all the light that's reaching us.   (the last of nine tries at the line, 3:00-4:07)
 ("rec68", "obs", 251.58, 261.08),     # When we point a telescope that deep, we are not only looking at distant stars, we are looking at our own distant past. We see galaxies that are way beyond the reach.   (from its second "when": the first stopped at "looking at it"; Whisper had merged the two, the words come from a transcription of the stretch alone)
 # beyond reach
 ("rec68", "reach", 293.66, 299.26),   # Even if you could travel the speed of light and live forever, you would never be able to touch them.   (from its second "even if you could"; the stretch re-timed alone)
 ("rec68", "reach", 323.46, 331.80),   # That also means that what happens on one side of the observable universe can never talk to what happens on the other side. So it's not really a single object at all.   (the last of four)
 ("rec68", "reach", 360.23, 368.30),   # And it's not only about our own past, but also about a future that never will be. We will never be able to see where they go, or even where they are right now.   (the third; "Their future is also beyond the reach" out: the author, on the take, "let's just stop at where they are right now")
 # the distant past
 ("rec68", "past", 445.92, 456.04),    # And when we look at the distance, we are looking at our distant past. You can see a time before superclusters existed, before galaxies, even before stars emerged.   (the last of seven starts)
 ("rec68", "past", 457.42, 463.80),    # We can even see the faint radiation that was emitted just 380,000 years after the Big Bang.
 ("rec68", "past", 486.02, 492.74),    # A light that has been travelling towards us since the first moment that light could even travel through the universe at all.   (the third)
]

# Sound fixes after the second draft (the author, 2026-11-11, 12:30; the raw take isn't on this Mac, so they were made on
# the cut audio, see video/sources/2026-11-11/NOTES.md):
#  - "three sides" (0:21) was murmured and clipped at the clip's end (0.27 s for the two words): the words come from
#    rec68's own first full try of the line, "so our chart is limited by three sides." (79.72-81.70): 81.04-81.80 through
#    the 80 Hz high-pass at +10.3 dB (that try's "limited by" at the cut's level), in place of 20.86-21.14 of this cut;
#    everything after moves 0.48 s later. (Until the raw take was on this Mac, 14:45, they came from the Nov 9 cut.)
#    From the take: ("rec68", "sides", 79.72, 81.70) would give the whole line, with "our chart" for "this chart".
#  - the "And" of "And if you ask a scientist" (0:58) started silent (the clip's first 0.1 s is the vowel's quiet
#    onset): the "And" of "And it's not only about our own past" (this cut's 100.40-100.70) is put over 58.40-58.70.
POST_CUTS = []
