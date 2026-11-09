# short-04b-smallest-black-holes: The Smallest Black Holes, part 2 of video 4, as a take of its own, from the author's
# re-recordings of 2026-11-09 (home): rec61 for the new opening (the black-hole line as relativity's limit, the two
# places black holes are made), rec60 for the body (the search, the window, dark matter, the crossed-out areas, the
# survivors). Until this take the Short was carved from video 4 (video/cuts/short-04b-smallest-black-holes.json, in git
# history). Word timings and the fact check: video/sources/2026-11-09/. Treatment: enhance.py --plain, natural speed.
# The author's rule: the last try unless it slips. Build: video/short-01-hook/README.md.
# (source, beat, first-word start, last-word start, {s, e, gap, cut}) in source seconds.

SOURCES = {"rec61": "tiny black holes take 2.aifc", "rec60": "Tiny Black Holes.aifc"}
TREATMENT = "plain"
# then, after video/tools/debreath.py (--min 0.03, for clicks too), the audio.m4a encode with
# ffmpeg -af "adeclick=w=40:o=75,lowpass=f=12500": today's recordings carry a 12–16 kHz artifact that crackled on the
# s sounds (the author, 2026-11-09: "crackling noises", "cluzzzeetrzz")
PAUSES = {"word": 0.25, ",": 0.55, ".": 1.0}
GAPS = {"same": 0.55, "beat": 1.1}
ROOM = True

EDL = [
 # the line: relativity's limit
 ("rec61", "line", 158.38, 168.02, {"s": 158.34, "cut": [(162.60, 166.30)]}),   # (from the word: it began with a breath)
    # For any given mass, there is a minimum size an object can have before it collapses into a black hole.   (from its second "for any given mass"; a 3.9 s pause before "before" cut)
 ("rec61", "line", 176.48, 182.56, {"s": 178.62}),   # (from its second "and once": "And once it," before it)
      # And once it becomes a black hole, it will live constantly on this line.
 ("rec61", "line", 213.14, 222.92, {"s": 214.82}),   # That means that due to relativistic effect, it is physically impossible for any object to exist in the dark regions of this chart.   (the last of five, from its second "that means": the second pass found "That means that due to," before it)
 # where they're made
 ("rec61", "made", 237.10, 240.66),     # And with enough pressure, any object can become a black hole.   (the first try: the later ones restart "it also means that" four times)
 ("rec61", "made", 271.26, 272.96, {"s": 268.80}),   # We can't do that in a lab yet, but we know of two moments where this happened.   (its second try, from 268.8 s: the transcript ran it into the first)
 ("rec61", "made", 279.00, 283.62, {"s": 280.45}),   # One is when a very large star dies.   (from its second "one": the second pass found "One, in the," before it)
 ("rec61", "made", 294.46, 299.62),     # But the second one happened the very first instants just after the Big Bang,   (its slip, "after the black hole", left out)
 ("rec61", "made", 348.20, 370.38, {"s": 351.95, "cut": [(355.10, 357.40), (362.30, 364.62)]}),   # (from its second "when everything": the author heard the first)
    # when everything in the universe was a very hot and dense soup of matter and energy. It is possible that black holes of all sizes were created. And some of them might just be around today.   (two hesitations and "a lot of it is possible that" cut)
 # the search
 ("rec60", "search", 288.00, 295.10),   # And we've been looking for them with quasars, with the cosmic microwave background, gravitational waves, and finally with microlensing.
 ("rec60", "search", 487.40, 491.28),   # And every search has come up empty, and the window where they could hide keeps closing.   (the retake at the end: the first said "has came up")
 ("rec60", "search", 506.56, 508.66),   # And it can close up even further in the future.   (from its second "and")
 ("rec60", "search", 303.38, 321.96, {"cut": [(314.10, 315.36)]}),   # They can't be too small either, or they'd have evaporated by now through a process we call Hawking radiation. What's left is really a narrow window: something the size of a virus with the mass of a small moon, or a whole asteroid's mass squeezed into something smaller than an atom.   ("with this mass" cut)
 # dark matter
 ("rec60", "dark", 323.80, 349.38, {"cut": [(346.80, 347.05)]}),   # (a click in the pause after "invisible," cut: the author heard it)
      # And if they're out there, they would be invisible: no light, nothing a telescope could see. We would only notice their gravity. But here's the thing: we do see that gravity. When we weigh galaxies, they are much heavier than everything we can see in them, five, sometimes ten times heavier. So most of the matter in the universe is something invisible, which, of course, we call dark matter.
 ("rec60", "dark", 350.96, 364.48, {"cut": [(353.58, 355.50), (359.13, 361.04)]}),   # ("if they're, but" and "it wouldn't need, because" cut at the word edges: the author heard the fragments)
    # We don't know what dark matter is. But if it's just tiny black holes, then it's interesting, because it would mean we don't actually need any new particles to explain them.   (a first "it wouldn't need, because" cut)
 ("rec60", "dark", 368.86, 380.50),     # Or, of course, maybe it's something else entirely. Maybe it isn't a thing at all, we just got gravity wrong. But if it's something real, it's somewhere on this chart, and people have been looking for it.
 # crossed off the chart
 ("rec60", "crossed", 381.28, 402.72),  # And not only on the black hole line, oh no: someone worked out that if dark matter came in lumps roughly this size, they'd leave tracks in the crystals of ancient rocks. So they looked at the rocks: nothing. Another team realized that it can't be here either, otherwise people's heads would just randomly explode, as if they'd been shot by a cosmic bullet. So we crossed out this area also.
 ("rec60", "crossed", 403.76, 409.84),  # So the search for dark matter is really a lot of scientists scratching off areas of this map, one by one.
 # the survivors
 ("rec60", "end", 413.42, 424.02),      # But I still find it fascinating that just maybe, in the very first instants of our history, most of the matter that ever existed just collapsed into black holes.   (from its second "but I still find it fascinating")
 ("rec60", "end", 436.06, 441.92, {"s": 435.80}),   # And everything else, we, the galaxies, the stars, are just the lucky few survivors.   (its third try whole: the first two broke off, "everything we know of" came out garbled)
]

POST_CUTS = []
