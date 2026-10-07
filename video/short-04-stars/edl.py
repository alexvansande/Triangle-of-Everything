# short-04-stars: planets to stars, the main sequence, the life of a star and
# the first side of the triangle.
# Cut from the 2026-10-07 recording rec3 = Link_office_mall_3.m4a (16:36, noise
# reduction off; raw file in iCloud). Build: see video/short-01-hook/README.md.
# (source, beat, first-word start, last-word start, {s, e, gap}) in source seconds.
# rec6 = "O2 Corporate & Offices 2.m4a" (Google Drive, 48 kHz lossless; mic about
# 10 cm away, off to the side). It is 4–8 dB darker above 1.2 kHz than rec3;
# this EQ matches it to rec3 within about ±2 dB.
SOURCE_FX = {"rec6": "equalizer=f=1400:t=q:w=1.2:g=4,highshelf=f=4500:t=q:w=0.6:g=7"}

EDL = [
 ("rec6", "hook", 225.46, 234.04),    # We think of planets and stars as being completely different things in two different categories that don't mix, but that's not really true.
 ("rec6", "hook", 239.06, 252.36),    # If we plot them all by size and mass, then not only we can understand how they connect ... how they evolve into each other. Their whole life cycle is here.
 ("rec3", "hook", 730.15, 732.44),    # Their difference is mostly about mass.
 ("rec3", "turn", 677.22, 684.56),    # And then notice that suddenly most of the dots start taking a sharp left turn.
 ("rec3", "turn", 685.93, 701.82, {"e": 702.45}),  # That's because they become so massive ... they scrape the electron layers
 ("rec3", "bd", 760.08, 780.44),      # So we start having those weird objects called brown dwarfs ... not as much as to generate fusion.
 ("rec3", "ms", 781.30, 805.14),      # And then once they start generating fusion ... directly proportional to their mass.
 ("rec3", "ms", 808.22, 810.88),      # this line is called the main sequence.
 ("rec3", "ms", 812.67, 815.60),      # Almost every star is on the main sequence.
 ("rec3", "life", 820.62, 828.90),    # And this becomes even interesting, because this chart will tell you the life cycle of a star.
 ("rec3", "life", 829.32, 850.34),    # Because what happens ... generate new energy.
 ("rec3", "life", 878.66, 889.68),    # so they will expand and collapse a few times becoming a red giant or a red supergiant until they will go boom and become a supernova
 ("rec3", "split", 915.12, 927.40),   # and then the object will split in two. The outer layers will expand in a nebula while the inner layers will become a very dense object.
 ("rec3", "split", 928.10, 931.64),   # And what that object will become, it also depends on mass.
 ("rec3", "split", 942.14, 943.60),   # it will become a neutron star.
 ("rec3", "bh", 952.56, 956.14),      # But if it's any more massive than that, it becomes a black hole.
 ("rec3", "bh", 956.54, 962.40),      # And that's where we meet the first side of our triangle of everything.
 ("rec3", "side", 969.32, 980.80),    # for every object, there's a relationship between mass and size ... you become a black hole.
 ("rec3", "side", 981.90, 992.52),    # the size of a black hole is defined by its Schwarzschild radius ... a one-to-one slope.
]
