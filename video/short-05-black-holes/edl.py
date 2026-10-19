# short-05-black-holes: black holes are a line, not a kind of object. The chart so far,
# the Schwarzschild radius as the limit nothing can cross, why it is a 1 : 1 line, every
# known black hole on it, big first (Sgr A*, Andromeda, M87*, TON 618, less dense than
# water), then the small ones (engineered, primordial), the hunt for them as dark matter,
# and a cliffhanger on the chart's dark-matter line.
# The small black holes onward come from rec20 = "primordial black holes.m4a" (2026-10-19,
# 7:12, same room), which re-records that part and ends on the next side of the triangle.
# Cut from rec18 = "black holes.m4a" (iCloud recordings, 2026-10-19, 16:08, 48 kHz AAC;
# a different room from rec12–17, one take with many retries) up to "every black hole
# will be on this line"; then rec19 = "black holes and dark matter .m4a" (2026-10-19, 10:55,
# same room), which re-records the rest big-first, so the video ends on dark matter
# instead of TON 618 (the author's note at the start of rec19). Build: see
# video/short-01-hook/README.md.
# (source, beat, first-word start, last-word start, {s, e, gap}) in source seconds;
# the builder snaps each cut to the nearest real silence.

PAUSES = {"word": 0.18, ",": 0.3, ".": 0.45}

EDL = [
 ("rec18", "intro", 51.54, 55.52),     # Anything that ever existed can be plotted in this chart,
 ("rec18", "intro", 66.72, 75.52, {"gap": 0.2}),  # featuring mass on the vertical axis and diameter on the horizontal axis. It is in effect a density scatter plot.   (two restarts left out)
 ("rec18", "intro", 83.72, 84.98),     # It tells you a million stories,
 ("rec18", "intro", 125.08, 127.34, {"gap": 0.2}),  # I have been covering a lot of those stories.   (three restarts left out)
 ("rec18", "intro", 128.66, 129.02),   # For example,
 ("rec18", "intro", 132.22, 155.96, {"gap": 0.15}),  # how stars are formed in stellar nurseries ... a white dwarf or a neutron star, or the strangest object of all, the black holes.
 ("rec18", "intro", 159.14, 161.3),    # Now I want to tell you a little bit about black holes.
 ("rec18", "line", 165.22, 183.14, {"s": 168.6}),  # (the first "But unlike most," left out) but unlike most of the other objects ... black holes are not really one object, not even a category of objects, but a line,
 ("rec18", "line", 230.78, 236.92, {"gap": 0.2}),  # really, they are one of the three sides of the triangle of everything.   ("the top half of the three lines" and the restarts left out)
 ("rec18", "schw", 283.24, 286.28, {"gap": 0.4}),  # This line is called the Schwarzschild radius,   ("And the reason is that they represent a limit…" and "There is a point in which nothing can become more massive…" left out: the next sentence says it)
 ("rec18", "schw", 289.38, 342.02, {"s": 289.36, "gap": 0.12}),  # which represents the limit … 45 degrees here.   ("and" before "which" left out)    # This line is called the Schwarzschild radius ... a straight one-to-one slope line, going 45 degrees here.   (first try left out)
 ("rec18", "onthe", 385.82, 391.32, {"s": 387.5, "e": 391.75}),  # But in reality, anything that reaches this line is a black hole, and
 ("rec18", "onthe", 397.18, 399.34, {"s": 397.27, "gap": 0.25}),  # every black hole will be on this line.   ("anything and" left out)
 # rec19: big black holes first
 ("rec19", "big", 28.6, 33.86),        # So, we know black holes are formed when massive stars collapse,
 ("rec19", "big", 37.08, 44.54, {"gap": 0.15}),  # and those dots here show you a list of all known black holes,
 ("rec19", "big", 51.2, 55.42, {"s": 53.32, "gap": 0.3}),   # and they all of course follow the same line.   ("linear", "in this" left out)
 ("rec19", "big", 90.28, 95.24, {"s": 90.64}),       # And they vary in size, from just the size of stars
 ("rec19", "big", 97.76, 101.6, {"gap": 0.12}),  # to the ones that are in the center of galaxies,
 ("rec19", "big", 65.06, 70.84, {"gap": 0.15}),  # like the one in the center of our own Milky Way, or the one in the center of the Andromeda Galaxy.
 ("rec19", "dense", 161.93, 166.27, {"gap": 0.4}),   # As black holes become more massive, they actually become less dense.
 ("rec19", "dense", 172.77, 185.33),   # There's a point in which the supermassive black holes are actually less dense than water, and again could float on a pool if you had one big enough.   (the ocean joke left out, and the take that says all galaxy-centre ones are: see the fact check)
 ("rec19", "big", 116.87, 123.54),     # Like the M87 (examples of the light ones: the density lines now come first, as the author asked), which was the first one to be photographed, or the TON 618,
 ("rec19", "big", 229.11, 231.01, {"gap": 0.12}),  # the largest black hole we know,
 ("rec19", "big", 133.01, 137.01, {"gap": 0.12}),  # whose event horizon would swallow our whole solar system.
 # rec20: the small ones, dark matter, and the cliffhanger
 ("rec20", "small", 3.38, 10.44, {"gap": 0.7}),   # Arguably, the most interesting story isn't about the largest black holes, but the smallest possible ones.
 ("rec20", "small", 70.58, 75.02),     # We know that black holes are formed when giant stars collapse,
 ("rec20", "small", 41.92, 49.28, {"gap": 0.12}),  # but in theory, you could make any mass into a black hole. You just need to press it very, very hard.
 ("rec20", "small", 51.18, 55.88),     # Maybe some aliens out there have some machinery that builds a black hole.
 ("rec20", "pbh", 92.3, 97.22),        # So we know those conditions exist when a star collapses.
 ("rec20", "pbh", 102.36, 110.28, {"s": 102.97, "e": 111.0}),  # And we don't know how to make that in a lab, but we know that those conditions also existed
 ("rec20", "pbh", 117.58, 118.92, {"s": 116.4, "gap": 0.1}),  # in the very early moments of the Big Bang.   ("in the early," and the restart "we know those conditions also existed" left out)
 ("rec20", "pbh", 122.06, 128.68),     # So maybe some of them have remained, and we've actually been looking for them.
 ("rec20", "pbh", 160.4, 175.22),      # We've looked for black holes with the mass of stars and planets, and we haven't found any through microlensing surveys. So maybe they don't exist, or maybe they're very rare.   ("so we know that there can be a lot of them" left out: backwards)
 ("rec20", "pbh", 176.84, 180.38, {"s": 177.2}),     # And we know that they couldn't be much smaller,
 ("rec20", "pbh", 186.4, 191.32, {"gap": 0.12}),   # because otherwise they would have evaporated by now due to Hawking radiation.   ("than, let's say, a small meteor" left out: see the fact check)
 ("rec20", "pbh", 192.94, 193.72),     # So we have this range,
 ("rec20", "pbh", 197.74, 202.62, {"gap": 0.12}),  # which is something the size of a small moon or maybe a mountain.   ("compressed to the size of a proton" left out: see the fact check)
 ("rec20", "pbh", 209.62, 212.9),      # We don't know if it exists. It could exist.
 ("rec20", "pbh", 214.34, 230.54, {"e": 231.45}),
 ("rec20", "pbh", 233.48, 233.48, {"s": 234.25, "e": 234.6, "gap": 0.08}),  # by
 ("rec20", "pbh", 234.5, 237.48, {"s": 236.05, "gap": 0.04}),  # the effects on gravity.   ("the…" hesitation left out)     # And if it does, you'd be impossible to detect them using our conventional means. We could not see them. We could not catch them, but we could detect their presence by the effects on gravity.
 ("rec20", "dm", 306.84, 317.24, {"s": 312.69}),      # And the reason we've been looking for them is that we know that those effects exist.
 ("rec20", "dm", 247.41, 261.54),      # If we look at large galaxies on this graph, you'll see that they are in a different diagonal line than everything else.
 ("rec20", "dm", 263.5, 269.12),       # Most of the things we've seen so far are on this atomic diagonal line,
 ("rec20", "dm", 270.56, 276.2, {"gap": 0.12}),    # but the galaxies and clusters of galaxies, they exist in this other one,
 ("rec20", "dm", 331.42, 337.56, {"gap": 0.12}),   # meaning that they are much more massive than their size would be expected.   (from the second take; the first had it backwards, the second's "nebulas" left out)
 ("rec20", "dm", 344.24, 350.94),      # We don't know where all that missing matter is. That's what we call dark matter.
 ("rec19", "dm", 503.31, 511.75, {"s": 504.32, "gap": 0.4}),    # And if primordial black holes exist, they could explain that without us needing to invoke any sort of new physics.   (rec20's "mountain size protons" take left out)
 ("rec20", "end", 408.81, 412.76),     # And if we follow that line of galaxies, where does it end?
 ("rec20", "end", 417.5, 422.98, {"gap": 0.3}),    # It will end in the next side of our triangle of everything.
 ("rec20", "end", 426.24, 429.94),     # Another limit of what things can be in our universe.
]
