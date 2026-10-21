# short-02-density: why everything sits on the diagonal (the water line).
# Cut from the 2026-10-07 recording rec3 = Link_office_mall_3.m4a (16:36, noise
# reduction off; raw file in iCloud). Build: see video/short-01-hook/README.md.
# (source, beat, first-word start, last-word start, {s, e, gap}) in source seconds.
# rec6 = "O2 Corporate & Offices 2.m4a" (Google Drive, 48 kHz lossless; mic about
# 10 cm away, off to the side). It is 4–8 dB darker above 1.2 kHz than rec3;
# this EQ matches it to rec3 within about ±2 dB.
SOURCE_FX = {"rec6": "equalizer=f=1400:t=q:w=1.2:g=4,highshelf=f=4500:t=q:w=0.6:g=7"}

EDL = [
 ("rec6", "q", 60.42, 78.44),        # When you plot every object by mass and size, something really interesting happens ... diagonal line. And at first it's weird, but then you realize it's sort of obvious when you zoom in.
 ("rec3", "human", 172.24, 174.94),   # Let's zoom in. So here we are, humans.
 ("rec3", "human", 175.82, 183.76),   # We are roughly one to two meters high. We are usually about 100 kilograms or less.
 ("rec3", "human", 199.94, 202.68),   # Notice that we're just talking about order of magnitude.
 ("rec3", "human", 204.10, 209.56),   # So the sizes and the masses, it only matters when you multiply it by 10.
 ("rec3", "water", 217.84, 222.78, {"e": 223.20}),  # One liter of water is one kilogram and it's 10 centimeter wide
 ("rec3", "water", 241.70, 244.80),   # So this is where the one liter of water sits.
 ("rec3", "ton", 264.66, 270.60),     # If you multiply your size by 10, so now what was 10 centimeters is one meter.
 ("rec3", "ton", 271.36, 274.54),     # You have a cube of one meter by one meter by one meter.
 ("rec3", "ton", 275.32, 277.06),     # That's one ton of water.
 ("rec3", "ton", 278.02, 284.50, {"e": 285.10}),  # So when you multiply the sizes by 10, you have 1,000 times more mass
 ("rec3", "ton", 308.30, 310.56),     # That's because we live in a three-dimensional universe.
 ("rec3", "ton", 311.94, 312.80),     # That's the cube law.
 ("rec3", "line", 332.86, 337.08),    # so this blue line here is always the density of water.
 ("rec3", "line", 337.76, 349.24),    # And that already tells us a story ... to the right of it will float ... to the left of it will sink.
 ("rec3", "eg", 361.82, 366.60),      # So for example, most of those dots to the left are meteorites and small rocks.
 ("rec3", "eg", 367.06, 375.88),      # Most of the dots to the right are animals and most animals float in water, except the hippo.
 ("rec3", "hippo", 385.50, 398.20),   # The hippo sits right on the line, a little bit to the left of it ... walks in the bottom of the rivers.
 ("rec3", "end", 398.86, 402.20),     # So that's a small interesting story that this already tells.
]
