# short-03-planets: up the line, from whales to round worlds and gas giants.
# Cut from the 2026-10-07 recording rec3 = Link_office_mall_3.m4a (16:36, noise
# reduction off; raw file in iCloud). Build: see video/short-01-hook/README.md.
# rec8 = "intro to video 3.m4a" (iCloud, 0:56; recorded at home): the intro, through
#        the man-made objects; replaces rec3's opening (blue whale → "small asteroids").
#        The EQ is fitted to rec3 (third-octave averages); the extra denoise brings its
#        background from about −61 to −64 dB, still ~6 dB above rec3's.
# (source, beat, first-word start, last-word start, {s, e, gap}) in source seconds.
SOURCE_FX = {"rec8": "firequalizer=gain_entry='entry(100,-1.30);entry(125,-1.44);entry(160,-2.68);entry(200,-3.01);entry(250,-3.46);entry(315,-2.28);entry(400,-1.22);entry(500,1.70);entry(630,2.00);entry(800,1.05);entry(1000,2.25);entry(1250,3.17);entry(1600,-0.55);entry(2000,1.30);entry(2500,1.13);entry(3150,-4.88);entry(4000,10.00);entry(5000,0.50);entry(6300,4.90);entry(8000,2.08);entry(10000,0.94);entry(12500,1.82);entry(16000,4.91)',volume=14dB,afftdn=nr=18:nf=-72:tn=1,volume=-14dB"}

EDL = [
 ("rec8", "intro", 4.32, 11.00),   # When you plot every object by their mass and their size, they all will align over this diagonal line.
 ("rec8", "intro", 11.80, 19.80),  # And that line tells an interesting story ... the category of objects you see.
 ("rec8", "life", 20.86, 28.76),   # We start with animals right here ... the blue whale, and the largest plant ever, the sequoia tree
 ("rec8", "made", 31.90, 39.72, {"s": 32.45}),  # and then as we move higher and higher we are now in the area of man-made objects and small structures
 ("rec3", "round", 443.40, 453.68),   # And as we go up and up, we mostly have small asteroids and moons. And we're going to see something very interesting.
 ("rec3", "round", 456.10, 461.02),   # The more up we go, the more those asteroids will become rounder and rounder.
 ("rec3", "round", 461.72, 473.90),   # Look at Hyperion and Mimas and Enceladus, Vesta, Ceres, and then when we reach Pluto, we are in the dwarf planets and they are mostly all round.
 ("rec3", "liquid", 489.88, 498.46),  # so this point is where gravity overcomes the molecular bond that holds shapes together.
 ("rec3", "liquid", 499.70, 506.76),  # From this point on, everything might as well be liquid, they behave like liquid, so they become round.
 ("rec3", "atmo", 527.34, 536.06),    # As the mass of the object increases, its gravity also allows it to start having an atmosphere.
 ("rec3", "atmo", 537.48, 542.78),    # Mercury and the moon don't have any atmosphere. Mars has one, but it's very thin.
 ("rec3", "atmo", 544.16, 549.38),    # Venus and Earth, well, they have a nice atmosphere. I would say Earth is better.
 ("rec3", "gas", 553.76, 571.12, {"e": 572.30}),  # but if we go any further, we start seeing super earths and gas giants ... it's just gas.
 ("rec3", "gas", 591.60, 597.06),     # Their gravity is so strong that hydrogen just cannot escape it.
 ("rec3", "earth", 648.44, 658.88),   # So Earth is really in this thin line ... becomes a giant gas planet.
 ("rec3", "end", 661.68, 665.40, {"gap": 0.9}),  # And when you go up and up, something else start happening.
]
