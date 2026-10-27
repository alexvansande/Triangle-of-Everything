# short-04-black-holes: video 4, re-recorded at home on 2026-10-27 from the script in
# video/scripts/recording-scripts.md. Three recordings (iCloud Projects/triangle/recordings,
# AAC 48 kHz; the first takes recorded at home, the car ones are in Google Drive):
#   rec37 = "New Black holes take.m4a" (7:32), the whole script with retakes
#   rec38 = "New Black holes take 3.m4a" (6:41), the whole script again (the author thought
#           rec37 hadn't recorded; it had)
#   rec39 = "more on dark matter search.m4a" (2:05), a first try at a new passage: what else
#           has been crossed off the chart (ancient crystals, the injuries); not used
#   rec41 = "dark matter addendumd.aifc" (1:27, lossless), that passage re-recorded with the
#           fact check's corrections
# Mostly rec38, which sounds closer to the car takes; rec37 for the stars, the soup and the
# ending. It replaces the rec24 cut of 2026-10-20 (in git history).
# Treatment: enhance.py --plain, 1.1x. Build: see video/short-01-hook/README.md.
# (source, beat, first-word start, last-word start, {s, e, gap}) in source seconds.

PAUSES = {"word": 0.18, ",": 0.3, ".": 0.45}

# rec37 was spoken closer to the mic (about 3 dB more at 100–300 Hz) and about 3.5 dB quieter;
# rec41 is about 4 dB duller above 4 kHz than rec38
SOURCE_FX = {"rec37": "equalizer=f=180:t=q:w=1.2:g=-3,volume=3.5dB", "rec41": "treble=g=3:f=5000"}

EDL = [
 ("rec38", "intro", 19.40, 31.32),    # Everything that could ever exist can be plotted on this chart, with size across the bottom and mass going up. It's really a log-log density scatter plot. And as you zoom in, it tells you a million stories.
 ("rec37", "stars", 28.74, 56.00),    # For example, you can see the life cycle of stars. They form in stellar nurseries and collapse into protostars, then they live their life on the main sequence, and as their hydrogen runs out they collapse and expand and collapse and expand and become red giants. Red giants shed their outer layers as nebulae, which merge again into new stellar nurseries, making a new generation of stars.   (rec38's has long hesitations)
 ("rec38", "core", 62.72, 68.48),     # And left behind, like the skeleton of a dead star, there's always some kind of a dense core.
 ("rec38", "core", 74.42, 78.62, {"s": 73.06}),  # Depending on its mass, it's either a white dwarf, a neutron star, or, the most interesting of them all, a black hole.   (the first try, "…it's a white dwarf.", left out)
 ("rec38", "line", 80.26, 90.54),     # Most objects in our triangle are like clusters of dots around some points, but black holes are not. They all sit on one line called the Schwarzschild radius.
 ("rec38", "line", 93.72, 107.20),    # It's special because it's the top left limit of our triangle of everything. Anything that gets too small or too massive becomes a black hole, and it lives on this line instead; therefore nothing can cross it.   ("It's very special." left out)
 ("rec38", "horizon", 107.70, 110.46),  # Black holes don't really have a size, actually.
 ("rec38", "horizon", 112.84, 129.68, {"s": 113.16}),  # They're thought to be a singularity, a point of zero size. But they do have what's called an event horizon, a radius from which nothing can escape. And that radius grows in step with the mass; that's why the line on the upper left is a straight 45-degree slope.   (a first "they're thought to be," left out)
 ("rec38", "known", 131.36, 147.02),  # The black holes we know of either formed in the collapsing core of a dying star, or grew by swallowing gas and merging with each other. Their masses go from a few Suns to millions of Suns, like the one at the center of our own Milky Way, which has 4 million.
 ("rec38", "density", 148.24, 156.24),  # And as they grow more massive, they actually get less dense. Past a certain point, the really supermassive ones are actually less dense than water.
 ("rec37", "density", 212.64, 214.82),  # They'd float if you had a big enough pool.   (rec37's second try; rec38's runs on into "like for example M87…")
 ("rec38", "density", 170.26, 183.54),  # Like M87, the first one ever to be photographed, or TON 618, the largest black hole we know of, whose event horizon is bigger than the orbits of our planets, with the mass of 60 billion Suns.
 ("rec38", "small", 185.86, 205.60),  # But actually the most interesting story isn't how big they can be, but how small. With enough pressure, anything can become a black hole. We don't know how to make one, we just don't have that kind of technology, but we know of two moments when the conditions are just right to make one happen. Number one, as we said, is the core of a dying star.
 ("rec37", "small", 256.84, 264.20),  # The other was the very first moments after the Big Bang, when everything was a soup of very hot, dense matter.   (rec38 adds "a millionth of a second in": too late for these; see the fact check)
 ("rec38", "small", 216.72, 224.24),  # Back then, some of that soup could have collapsed into black holes of all sizes, and some of them might just be around.
 ("rec38", "search", 225.48, 251.76),  # And we've been looking for them, with quasars, and then the cosmic microwave background, gravitational waves, microlensing, and every survey has found nothing so far. And the window where those primordial black holes could exist keeps closing. We also know they can't be too small, or they would have evaporated by now through something that we call Hawking radiation. So there's a tiny window left.
 ("rec38", "search", 261.36, 281.90),  # They'd be something like a virus-sized black hole with the mass of a small moon, or an asteroid's mass squeezed into something smaller than an atom. If they're out there and common, they'd be basically invisible. They wouldn't shine or reflect any light, and no telescope would see them. We could only find them by their gravity.   (the first try, "…or an asteroid size", left out)
 ("rec38", "dm", 294.74, 321.02),     # But the crazy thing, and the reason we've been looking for them for so long, is that we actually do see that gravity. When we weigh galaxies, they are much heavier than they ought to be, sometimes 10 times as much. So most of the matter in the universe is something invisible: dark matter. We don't know what it is yet, and there are plenty of candidates. But if it's tiny black holes, we wouldn't need any new particle to explain it, which is a big thing.   (two tries at "the crazy twist" left out)
 ("rec38", "dm", 322.56, 329.28),     # So we keep looking. The window is still closing. Some new research on neutron stars suggests that it's like even smaller,
 ("rec38", "dm", 337.28, 344.00, {"s": 334.42}),  # but it's still possible that what we think of as empty space is full of little objects, smaller than an atom, each as heavy as a mountain.   (a first "but it's still possible that what we think of," left out)
 ("rec41", "crossed", 11.76, 18.90),   # Or maybe not, maybe we'll find out the dark matter is something completely different. Maybe it isn't a thing at all, and we just have gravity wrong.   (the first two tries left out)
 ("rec41", "crossed", 21.76, 27.18, {"s": 21.46}),  # But if it is something real, then it's somewhere on this chart, and people have been looking for it.   ("But if it's," left out)
 ("rec41", "crossed", 27.50, 35.96),   # And not only on the black hole line, oh no: someone figured out that if dark matter came in lumps about this size, they'd leave tracks in the crystals of ancient rocks.   (the second try, "…marks in crystals", left out)
 ("rec41", "crossed", 46.98, 48.50),   # So they looked at the rocks: nothing.
 ("rec41", "crossed", 49.68, 58.50),   # Another team realized that if dark matter were around here, then every now and then someone's head would just randomly explode, like being shot by a bullet out of nowhere.
 ("rec41", "crossed", 60.16, 62.08, {"s": 60.21}), # They looked at medical records: never happened.   ("And like" left out)
 ("rec41", "crossed", 76.10, 85.96),   # So the search for dark matter is really the collective effort of a lot of scientists, just scratching off areas of this map, one by one.   (the last try; the one before says "people")
 ("rec37", "end", 405.68, 422.74),    # But I still find it fascinating that maybe in the first moments of our history, most of the matter just collapsed into black holes, smaller than atoms. And we, everything else, the galaxies, the stars, everything we know, are just lucky few survivors.   (rec38's tries say "the first nanoseconds" and stumble)
]
