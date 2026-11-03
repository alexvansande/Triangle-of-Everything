# short-01-hook: the opening hook as a vertical short (and, cut at "…the way it does", the start of
# long video 1, video/cuts/long-01-intro.json).
# rec51 = "Long 1 take 1.m4a" (Google Drive "Recordings", 2026-11-03, 12:00, ALAC 48 kHz): the one-take
# script for long video 1 and its three Shorts (video/scripts/recording-scripts.md, "Long 1"), with
# retakes, after a mic test (0:00–0:43). The hook is 0:48–3:51 of it; the rest is video 2
# (video/short-02-up-the-line/edl.py). It replaces the 2026-10-27 cut from rec35 (in git history).
# Treatment: enhance.py --plain, natural speed (no tempo: the author, 2026-10-27). Build: see README.md.
# (source, beat, first-word start, last-word start, {s, e, gap, cut}) in source seconds.
# Where Whisper (medium.en) merged a restart into one long word, `s` is the real start of the
# retake, found from the speech runs (and the first-word start is the merged word's).

SOURCES = {"rec51": "Long 1 take 1.m4a"}
TREATMENT = "plain"
PAUSES = {"word": 0.18, ",": 0.3, ".": 0.45}

EDL = [
 ("rec51", "open", 48.56, 51.94),     # In my opinion, this is the most interesting chart in all of physics.   (the second try; the first, at 0:29, runs into the mic check)
 ("rec51", "diag", 53.78, 61.92, {"cut": [(53.845, 55.10)]}),  # The first thing you probably noticed is this diagonal line, with everything from bacteria to humans, to planets, stars and galaxies.   (after "The", the first "first thing," left out: the re-cut of 2026-11-03)
 ("rec51", "axes", 70.80, 85.00),     # The vertical axis is mass, the horizontal axis is size. So this is a log chart of mass versus size, right? Yeah, but it's so much more than that, because it also includes things that don't have mass at all. Photons, like visible light or radio waves.   (the second try; the first says "the horizontal vertical axis is mass")
 ("rec51", "energy", 110.37, 115.26, {"s": 110.40}),  # That's because this chart is also a plot of energy, and the bottom axis doubles as wavelength.   (the third try: the first is whole, "a chart of energy", but its next line breaks off; the second breaks off at "also…")
 ("rec51", "science", 116.14, 118.90),  # So, in a way, this image contains all of science.   (the second try; the first: "this chart contains…")
 ("rec51", "science", 120.01, 125.86, {"gap": 0.4}),  # Astronomy is up here, engineering is down there, biology all the way down here, then chemistry and particle physics.
 ("rec51", "sides", 131.92, 140.04),  # And the whole thing is bounded by three sides. On the right, the size of the universe. On the bottom left, quantum mechanics. On the top left, relativity.
 ("rec51", "sides", 144.00, 150.40, {"s": 147.15, "gap": 0.45}),  # And where those two lines meet is actually the Big Bang.   (the second try; "And where those lines meet," left out)
 ("rec51", "time", 157.42, 162.44, {"s": 157.97}),  # Notice that along the top there are even more diagonal lines, and they're all measured in seconds.   (the third try: "…that we have those diagonal lines. Notice that along the top, there are," left out)
 ("rec51", "time", 163.22, 169.76),   # That's because the top of the chart isn't about how things are, but when. It's the history of our whole universe.
 ("rec51", "stories", 178.46, 187.38, {"e": 188.02}),  # I call this the triangle of everything, and as you zoom in, it tells you a million stories about airplanes, hippos, and gravity, about how stars evolve,   (the second try at the line, run on to "evolve,": the join after "gravity," into the retake sounded like a mistake, the author 2026-11-03; "I call this the triangle of everything." left out)
 ("rec51", "stories", 193.48, 201.38, {"s": 193.40, "e": 202.10}),  # how particles relate to each other, why balloons float, and even contains the periodic table, and it tells you why fire looks the way it does.   (the retake from "how particles": the first try breaks off at "how particles turn into…"; "does" is there, Whisper lost it)
 ("rec51", "outro", 207.94, 214.52),  # I've been obsessed with this chart for many years, and I spent countless days designing ways to explore it better.   (Short only)
 ("rec51", "outro", 224.66, 229.96, {"s": 225.48}),  # I could talk about it for hours, and that's precisely what I intend to do.   (the third try, as in the script: the first ends "…in this series of videos", the second breaks off at "I could talk–")
]
