# short-01-hook: the opening hook as a vertical short, cut from the
# 2026-10-07 morning recordings (raw files live in iCloud):
#   rec2 = Link_office_mall_2.m4a (the intro, several passes)
#   rec4 = Link_office_mall_4.m4a (re-recorded energy / wavelength / time lines)
# (source, beat, first-word start, last-word start, {optional exact s/e}) in
# source seconds; the builder snaps each cut to the nearest real silence.
EDL = [
 ("rec2", "open", 48.52, 52.66),    # This is the most interesting chart in all of physics.
 ("rec2", "diag", 63.18, 73.36),    # The first thing you probably noticed ... stars and planets and galaxies.
 ("rec2", "axes", 96.32, 98.66),    # The vertical axis is mass,
 ("rec2", "axes", 100.84, 104.62),  # the horizontal axis is in size.
 ("rec4", "axes", 40.64, 43.10),    # So this is a chart about mass and size, right?
 ("rec4", "more", 43.96, 53.16),    # No, it's so much more than that ... visible light or radio waves.
 ("rec4", "energy", 54.54, 61.76),  # So what do these things have? Well, it turns out the left axis is energy.
 ("rec4", "energy", 68.48, 74.08),  # And the bottom axis is not only about size, it's also about wavelength.
 ("rec4", "time", 75.48, 85.98),    # And it becomes crazier ... those diagonals on the top, they measure time.
 ("rec4", "time", 87.66, 89.10),    # Time since the Big Bang.
 ("rec4", "time", 93.06, 96.62),    # Because this is also a chart about the history of the universe.
 ("rec2", "end", 214.08, 220.98, {"e": 222.40, "gap": 1.0}), # This is the triangle of everything, and let me take you a tour around because it is simply fascinating.
]
