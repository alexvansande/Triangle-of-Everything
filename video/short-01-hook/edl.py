# short-01-hook: the opening hook as a vertical short.
# rec34 = "New hook.m4a" (Google Drive "Recordings", 2026-10-26, 5:00, AAC mono).
# One take of the new script (video/scripts/recording-scripts.md) with retakes:
# the sciences across the chart, the three sides, time on the diagonals, the
# million stories, and the author's new outro in place of "follow me for…".
# It replaces the 2026-10-07 cut from rec2 + rec6 + rec7 (in git history).
# Treatment: enhance.py --plain, 1.1x. Build: see video/short-01-hook/README.md.
# (source, beat, first-word start, last-word start, {s, e, gap}) in source seconds.
# Where Whisper (medium.en) merged a restart into one long word, `s` is the
# real start of the retake, found from the speech runs.

PAUSES = {"word": 0.18, ",": 0.3, ".": 0.45}

EDL = [
 ("rec34", "open", 33.18, 36.06, {"s": 33.05}),  # This is the most interesting chart in all of physics.   (the "cha-cha-cha" before it, heard as "Look", the cut-off tries and "you have to see this… the most interesting science chart I've ever seen" left out)
 ("rec34", "diag", 50.90, 62.82, {"s": 55.55}),  # The first thing you'll probably notice is this diagonal line, with everything from bacteria to humans to planets, stars and galaxies.   ("The first thing you probably notice is that," left out)
 ("rec34", "axes", 64.14, 71.60, {"e": 71.93}),  # The vertical axis is mass, the horizontal axis is size, so this is a chart of mass versus size, right? Yeah,
 ("rec34", "axes", 71.98, 80.52, {"s": 72.13, "gap": 0.12}),  # but it's so much more than that, because it also includes things that don't have mass at all. Photons, visible light, radio waves.   (a second "yeah" left out)
 ("rec34", "energy", 82.34, 85.50, {"e": 86.3}),  # That's because this chart is also a chart of energy,   (the first try, clean; its "…because mass and energy are equivalent" left out)
 ("rec34", "energy", 96.76, 98.96, {"s": 96.72, "gap": 0.15}),  # and the bottom axis doubles as wavelength.   (the second try's "That's because this… that's… because…" left out)
 ("rec34", "science", 112.04, 123.98, {"s": 114.2}),  # So in a way, this chart contains all of science. Astronomy is up at the top, engineering is here, biology goes all the way down to here,   (the third try; two earlier ones left out)
 ("rec34", "science", 127.26, 128.74),  # and then chemistry and particle physics.   (the first "and then chemistry," left out)
 ("rec34", "sides", 129.92, 140.22),    # And the whole thing is bounded by three sides. On the right, the size of the universe. On the bottom left, quantum mechanics. On the top left, relativity.
 ("rec34", "sides", 141.52, 144.72),    # And where those two lines meet is the Big Bang.
 ("rec34", "time", 147.38, 165.40, {"s": 150.55}),  # Notice that along the top there are all these diagonal lines, and they are all measured in seconds. That's because the top of the chart isn't a history of things, but a history of time, the history of our whole universe.   (the first "Notice that along the top there are," left out)
 ("rec34", "stories", 173.88, 193.44),  # I call this the triangle of everything, and as you zoom in it tells you a million stories: about airplanes, hippos and gravity, about how stars evolve, how particles turn into each other, and why balloons float. It even contains the periodic table, and it tells you why fire looks the way it does.   (the first try, "a million story", left out)
 # the outro (the author's, 2026-10-26), in place of "So follow me for the triangle of everything" (3:16)
 ("rec34", "outro", 250.70, 269.30),    # I've been obsessed about this chart for many years now, and I've put hours and hours trying to visualize it in different ways, and seeing all the stories it contains. I could talk about it all day, and that's precisely what I intend to do in this series of videos.   (three earlier tries, 3:28–4:04, left out)
 ("rec34", "outro", 288.94, 292.80, {"s": 288.98}),  # I sincerely hope you find it as fascinating as I do.   ("I hope you like it. I hope you love it.", "By the end of them, I hope you appreciate this." and "I hope," left out)
]
