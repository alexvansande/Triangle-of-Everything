# long-02-end: the end of long video 2 (space), the author's third take of 2026-11-05: the Hubble sphere's mass on
# the black-hole line (the plant's payoff), why both are horizons and why the universe isn't a black hole, everyone's
# own universe, the observable universe at 46 billion light-years, the astronomer at our edge, the mirage, the
# snapshot of our own history, the cosmic microwave background, and the ending into the third side. The last piece
# of video/cuts/long-02-space.json, after long-02-intro (rec54) and long-02-middle (rec55).
# rec56 = "Long 2 take 3.m4a" (Google Drive "Recordings", 2026-11-05, 11:56, ALAC 48 kHz stereo, used as mono):
# said freely from the draft's last three sections, with many retakes and the author thinking aloud (the rule: the
# last try unless it slips). Notes to the editor on the take (10:22–10:46): "I think it's missing all the dark
# matter stuff. I really like the dark matter where we were crossing out things… Oh no, I think I saw it. Yeah, we
# did talk about exploding heads… I'm not sure it's a great ending." Whisper word timings and the review notes:
# video/sources/2026-11-05/. Treatment: enhance.py --plain, natural speed. Build: see video/short-01-hook/README.md.
# (source, beat, first-word start, last-word start, {s, e, gap, cut}) in source seconds.

SOURCES = {"rec56": "Long 2 take 3.m4a"}
TREATMENT = "plain"
PAUSES = {"word": 0.18, ",": 0.3, ".": 0.45}

EDL = [
 # on the black-hole line
 ("rec56", "payoff", 36.58, 47.64),        # Now, here's a weird thing. Add up everything we know exists inside the Hubble sphere, and here's where it lands on our chart: right back on the black hole line.   (the third try; "Now here's a fun thing… And here was the lens" and "Now, here's an interesting thing" before it)
 ("rec56", "payoff", 49.88, 50.74),        # Remember that line?
 ("rec56", "payoff", 68.54, 71.36),        # What does it mean? Are we living inside a black hole?   (the second try)
 ("rec56", "horizons", 72.38, 75.52),      # Well, it's tempting, right? It feels like a weird coincidence,
 ("rec56", "horizons", 81.96, 86.04, {"s": 81.85}),      # there are a lot of similarities between them.   ("because first of all," before it left out; the pause inside capped)
 ("rec56", "horizons", 98.54, 101.00),     # First of all, both are an event horizon.   (the retake)
 ("rec56", "horizons", 102.32, 123.62, {"e": 124.0, "cut": [(113.68, 114.72)]}),    # A black hole's event horizon is where light that falls in will never come out. Our cosmic event horizon is where nothing outside can ever come in. And both depend on the mass of what's inside. The radius of a black hole depends directly on how much stuff is in it.
 ("rec56", "horizons", 129.69, 138.76, {"s": 129.62}),    # And the size of our Hubble sphere depends on how fast the universe expands, which depends on how much stuff is in it too.
 ("rec56", "horizons", 144.80, 147.08),    # So that's why both are on the same line.   ("So," and "though," before it left out)
 # our universe, not the universe
 ("rec56", "ours", 151.84, 162.34),        # But that's also where the similarities end. A black hole is an object with a centre. Our universe is just that: it's our universe. It's not the universe.   ("But that's where," before it left out)
 ("rec56", "ours", 226.36, 239.46, {"s": 228.90}),        # The Hubble sphere's centred around us. But if you imagine one of those galaxies that seems to be on the edge for us, well, for them, their Hubble sphere's centred around them.   (the last try)
 ("rec56", "ours", 241.34, 250.38, {"cut": [(246.08, 246.52)]}),  # If they were to point a telescope the other way around, they wouldn't see empty space. They would see a whole lot of other galaxies, just like the ones we see.   (the last try; a stray "galaxies," cut from inside it)
 ("rec56", "ours", 220.28, 224.88),        # The universe is, as far as we've been able to measure, infinite in all directions.   (the last try, moved after the telescope)
 # the observable universe
 ("rec56", "observable", 258.02, 266.72),  # And here it gets even weirder, because the reason we know what they are seeing is that we can also see them right now.
 ("rec56", "observable", 281.16, 284.08, {"s": 281.08, "e": 285.10}),  # That seems weird, because I just told you the limit of our universe.   (the "yeah," before it left out)
 ("rec56", "observable", 286.06, 287.60),  # How can we see something that's beyond it?
 ("rec56", "observable", 315.26, 316.24),  # It is a little bit of a mind twist,   (the last of four tries; its "yeah, it sounds weird" left out)
 ("rec56", "observable", 317.76, 323.18),  # because the size of the Hubble sphere, the size of our event horizon, is 14 billion light-years.   ("But the size of the observable universe" after it breaks off)
 ("rec56", "observable", 329.26, 336.56),  # But if you ask a scientist what is the size of the observable universe, they will tell you 46 billion light-years.
 # ("rec56", "observable", 430.32, 440.44),  # (left out: its "that astronomer I say, that astronomer I told you about" restart can't be cut cleanly; to re-record) An astronomer sitting on the edge, that astronomer I told you about, sitting on the edge of our universe, looking at them, they can see a more recent past.   (the second try; "But if they tried sending that message back to," after it left out)
 # ("rec56", "observable", 450.46, 459.74),  # (left out with the astronomer) But if they tried to relay that message back to us, then that light would never have time to reach us. That's a weird thing.   (the last of three tries)
 ("rec56", "observable", 470.36, 482.14),  # The farthest light we can see is not where things are right now, but it's the history of how the universe looked to us far in the past.   (the retake inside the run; "The farthest light we can see is the history of what" left out)
 ("rec56", "observable", 489.98, 499.82),  # That's about 46 billion light-years. And if we add all the mass we have of it, it will fall on this point, way outside our triangle.   (the second try)
 ("rec56", "observable", 502.76, 510.02, {"s": 505.50}),  # That's the only object that falls outside our boundaries.
 ("rec56", "observable", 511.50, 521.12, {"s": 517.95}),  # But I don't think it's fair to call it a single object any more.
 ("rec56", "observable", 523.56, 526.16),  # Because one side can never talk to the other.
 ("rec56", "observable", 528.54, 530.06, {"e": 530.72}),  # This is just a mirage.
 # ("rec56", "observable", 534.96, 544.32),  # (left out: three restarts inside it) this is just light that was emitted billions of years ago and is just arriving to us right now.
 ("rec56", "observable", 548.26, 551.66),  # The observable universe is less like a map of where our neighbours are,   (the first try: the second drops "universe")
 ("rec56", "observable", 557.32, 559.52),  # and more like a snapshot of our own history.   (from the second try)
 # the oldest light
 ("rec56", "cmb", 561.20, 566.34),         # And the oldest light we can see is the cosmic microwave background.
 ("rec56", "cmb", 579.66, 584.86),         # A faint light emitted roughly 380,000 years after the Big Bang,   (the second try; "less than half a million years" before it)
 ("rec56", "cmb", 598.62, 602.44),         # just as the universe was becoming transparent and light could come out.   (the last of three tries)
 ("rec56", "cmb", 603.70, 606.78),         # So in a way, it's a portrait of the Big Bang.
 ("rec56", "cmb", 608.48, 611.26),         # It's a photo of the very early universe.
 # the ending
 ("rec56", "ending", 654.14, 665.74),      # So that's the top of the triangle. On the left, the black hole line: squeeze anything hard enough, gravity wins. On the right, the Hubble sphere: stretch anything far enough, and expansion wins.
 ("rec56", "ending", 666.72, 670.42),      # At the very top, where the two lines meet, sits our whole universe.
 ("rec56", "ending", 673.46, 679.72),      # Which leaves out one edge. If there's a limit to how big and how heavy something can be, is there a limit to how small?   ("Now," before it left out)
 ("rec56", "ending", 701.78, 713.70, {"s": 709.25}),      # Well, that's the third side of our triangle, and to be honest, it's as weird as it sounds.   (the last of three tries)
]
