# short-03-planets: up the line, from whales to round worlds and gas giants.
# Cut from the 2026-10-07 recording rec3 = Link_office_mall_3.m4a (16:36, noise
# reduction off; raw file in iCloud). Build: see video/short-01-hook/README.md.
# (source, beat, first-word start, last-word start, {s, e, gap}) in source seconds.
EDL = [
 ("rec3", "life", 415.40, 423.18),    # And as we move up the line ... the largest animals that ever lived, the blue whale
 ("rec3", "life", 423.50, 430.34),    # and then the largest living thing that have ever existed, the huge sequoia tree.
 ("rec3", "made", 431.34, 440.04),    # From this point on, almost all those dots are man-made structures or small asteroids.
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
