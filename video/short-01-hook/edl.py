# short-01-hook: the opening hook as a vertical short.
# rec35 = "Hook re record.m4a" (Google Drive "Recordings", 2026-10-27, 5:13, AAC mono).
# One take of the hook script (video/scripts/recording-scripts.md) with retakes, after a
# mic test (0:00–0:17), and several tries at a new last line after the outro.
# It replaces the 2026-10-26 cut from rec34 (in git history).
# Treatment: enhance.py --plain, 1.1x. Build: see video/short-01-hook/README.md.
# (source, beat, first-word start, last-word start, {s, e, gap}) in source seconds.
# Where Whisper (medium.en) merged a restart into one long word, `s` is the
# real start of the retake, found from the speech runs.

PAUSES = {"word": 0.18, ",": 0.3, ".": 0.45}

EDL = [
 ("rec35", "open", 17.56, 21.66),     # In my opinion, this is the most interesting chart in all of physics.   (the mic test before it left out)
 ("rec35", "diag", 30.16, 38.90, {"s": 29.9}),  # Probably the first thing you notice here is this diagonal line, with everything from bacteria to humans, to planets, stars and galaxies.   ("This is the," left out)
 ("rec35", "axes", 41.44, 57.46, {"e": 57.95, "cut": [(51.25, 51.43)]}),  # Vertical axis is mass, horizontal axis is size. So this is a log chart of mass versus size, right? Yeah, but it's so much more than that, because it also includes things that don't have mass at all. Photons, like visible light, radio waves.   ("etc." left out)
 ("rec35", "energy", 60.64, 66.92),   # That's because this chart is also a chart of energy, and the bottom axis doubles as wavelength.
 ("rec35", "science", 86.66, 96.70),  # So in a way, this chart contains all science. Astronomy is up here at the top, engineering is down there, biology all the way down here, and then we have chemistry and particle physics.   (the third try; the first breaks off at "and then we have…", the second at "all science")
 ("rec35", "sides", 99.62, 113.28),   # But the whole thing is bounded by three sides. On the right, the size of the universe. On the bottom left, quantum mechanics. On the top left, relativity. And where those lines meet is actually… the Big Bang?!
 ("rec35", "time", 125.46, 131.48, {"s": 126.85}),  # Notice that along the top there are all the diagonal lines, and they're all measured in seconds.   (the second try; the first runs on into "that's because the top axis isn't about…")
 ("rec35", "time", 163.02, 170.48),   # That's because the top axis isn't about how things are, but when: it's a history of our whole universe.   (the last of five tries)
 ("rec35", "stories", 183.10, 201.30, {"s": 182.88}),  # I call this the triangle of everything, and as you zoom in, it tells you a million stories about airplanes and hippos and gravity, about how stars evolve, how particles turn into each other, why balloons float, even contains the periodic table, and tells you why fire looks the way it does.   (the second try; "I call it… about airplanes, I call" left out)
 ("rec35", "outro", 204.26, 214.26),  # I've been obsessed about this chart for many years now, and I've put hours and hours trying to visualize it in different ways and seeing all the stories it contains.
 ("rec35", "outro", 217.52, 228.82),  # I could talk about them for hours, and that's precisely what I intend to do in this series of videos. I sincerely hope you find this as fascinating as I do.   (the tries at a new last line after it, 3:52–5:10, left out)
]
