# short-01-hook: the opening hook as a vertical short, cut from the
# 2026-10-07 morning recordings (raw files live in iCloud):
#   rec2 = Link_office_mall_2.m4a (the intro, several passes)
#   rec4 = Link_office_mall_4.m4a (re-recorded energy / wavelength / time lines)
# (source, beat, first-word start, last-word start, {optional exact s/e}) in
# source seconds; the builder snaps each cut to the nearest real silence.
# rec6 = "O2 Corporate & Offices 2.m4a" (Google Drive, 48 kHz lossless; mic about
# 10 cm away, off to the side). It is 4–8 dB darker above 1.2 kHz than rec3;
# this EQ matches it to rec3 within about ±2 dB.
SOURCE_FX = {"rec6": "equalizer=f=1400:t=q:w=1.2:g=4,highshelf=f=4500:t=q:w=0.6:g=7"}

EDL = [
 ("rec2", "open", 48.52, 52.66),    # This is the most interesting chart in all of physics.
 ("rec2", "diag", 63.18, 73.36),    # The first thing you probably noticed ... stars and planets and galaxies.
 ("rec2", "axes", 96.32, 98.66),    # The vertical axis is mass,
 ("rec2", "axes", 100.84, 104.62),  # the horizontal axis is in size.
 ("rec4", "axes", 40.64, 43.10),    # So this is a chart about mass and size, right?
 ("rec4", "more", 43.96, 53.16),    # No, it's so much more than that ... visible light or radio waves.
 ("rec4", "energy", 54.54, 61.76),  # So what do these things have? Well, it turns out the left axis is energy.
 ("rec4", "energy", 68.48, 74.08),  # And the bottom axis is not only about size, it's also about wavelength.
 ("rec6", "time", 133.08, 134.88),  # it gets even crazier
 ("rec6", "time", 142.52, 149.20, {"e": 149.42}),  # because on the bottom left, we have quantum mechanics, on the top left, we have relativity and they connect in
 ("rec6", "time", 151.94, 152.32, {"gap": 0.08}),  # this one point.
 ("rec6", "time", 153.94, 154.74),  # What is that point?
 ("rec6", "time", 155.22, 166.54),  # And then you realize ... diagonal lines ... measured in seconds until they get to now. That is time since the Big Bang.
 ("rec6", "time", 167.58, 171.10),  # So relativity and quantum mechanics are joining at the Big Bang.
 ("rec2", "end", 214.08, 220.98, {"e": 222.40, "gap": 1.0}), # This is the triangle of everything, and let me take you a tour around because it is simply fascinating.
]
