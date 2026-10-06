# Edit decision list: (beat, first-word start, last-word start) in source seconds.
# Each tuple is one kept clip; the builder looks up the last word's end time.
EDL = [
 ("hook", 19.69, 23.76),        # This is probably the most interesting chart in all of physics.
 ("hook", 65.16, 73.68),        # First thing you'll probably notice ... planets and stars.
 ("hook", 75.00, 78.92),        # So something related to mass and size, right?
 ("hook", 79.80, 88.06),        # But on the other hand ... this left axis is all about energy.
 ("hook", 90.24, 97.64),        # And if you go up ... measured in seconds.
 ("hook", 116.56, 117.38),      # So what is happening?
 ("intro", 118.96, 122.54),     # So let me take you through the triangle of everything.
 ("intro", 140.38, 146.42),     # Anything that can ever exist ... fits here.
 ("axes", 146.94, 162.18),      # So let's start ... a little above the center.
 ("axes", 167.24, 172.54),      # In this chart, the horizontal axis represents the size of things,
 ("axes", 177.44, 180.58),      # and the vertical axis represents the mass.
 ("axes", 181.84, 191.52),      # So right here ... one liter of water is
 ("axes", 194.44, 196.56),      # roughly a cube 10 centimeters wide.
 ("axes", 207.48, 225.84),      # One ton of water ... the line of the density of water.
 ("density", 226.56, 233.44),   # And everything that is on the right of the chart is something that will float in water.
 ("density", 280.30, 282.12, {"s": 280.20, "e": 282.56}),  # On the left side are things that are heavier.  (moved up from the later take)
 ("density", 237.72, 247.44),   # For example ... the hippo ... It just walks.
 ("density", 255.74, 262.18),   # And as you go up the line ... most of the stuff here is to the left side,
 ("density", 282.50, 285.96, {"s": 282.56}),  # and most those data points is mostly meteorites and meteors.
 ("human-to-planets", 286.54, 297.82, {"e": 298.44}),  # and if you go up we leave the living things ... the Great Pyramid
 ("human-to-planets", 300.84, 303.88, {"s": 301.50}),  # and then we have asteroids and small moons
 ("human-to-planets", 304.34, 306.04),  # and you'll notice that
 ("human-to-planets", 306.80, 311.70),  # they're all on the left side, meaning ... made of rocks.
 ("human-to-planets", 312.94, 321.22),  # And as you go up and up ... rounder and rounder and rounder
 ("human-to-planets", 323.70, 327.88),  # and when we reach Pluto ... a perfect sphere.
 ("human-to-planets", 343.62, 351.56),  # What's happening is that gravity simply overcomes ...
 ("human-to-planets", 357.30, 362.64),  # and therefore the object just starts acting as a liquid ...
 ("human-to-planets", 375.70, 378.44),  # So everything now will be round because
 ("human-to-planets", 379.52, 381.82),  # the strongest force here is gravity.
 ("human-to-planets", 382.78, 401.80),  # And as we increase the gravity ... we reach the gas giants.
 ("human-to-planets", 403.06, 420.50),  # That's because Earth sits in a very thin line ... becomes a gas giant.
 ("human-to-planets", 423.88, 426.30, {"s": 423.90}),  # We have four gas giants in our solar system.
 ("planets-to-stars", 430.84, 433.80),  # And as they become larger and larger, suddenly
 ("planets-to-stars", 436.22, 437.64),  # something weird happens.
 ("planets-to-stars", 438.62, 445.42),  # Notice that Saturn ... as dense as styrofoam.
 ("planets-to-stars", 453.78, 460.34),  # If you could find a pool of water large enough ... float on it.
 ("planets-to-stars", 461.64, 471.96),  # Then we start seeing ... diverging from the line.
 ("planets-to-stars", 473.90, 474.24),  # They are compressing.
 ("planets-to-stars", 475.42, 488.14),  # What is happening here ... degenerate matter.
 ("planets-to-stars", 490.20, 498.58),  # And it starts stripping away the atoms ... crushing the atoms together,
 ("planets-to-stars", 502.70, 507.36),  # and the atoms will start generating a little bit of energy.
 ("planets-to-stars", 515.94, 525.72),  # And when they start generating energy ... the fusion of the atoms,
 ("planets-to-stars", 528.06, 529.64),  # and as they create this energy,
 ("planets-to-stars", 530.22, 539.78),  # they start expanding ... those will become stars.
 ("stellar-evolution", 541.74, 543.28), # So stars like the Sun,
 ("stellar-evolution", 545.20, 549.72), # they're always in this one giant line which is called main sequence.
 ("stellar-evolution", 569.16, 574.66), # And here we will see actually the life cycle of a star.
 ("stellar-evolution", 632.86, 641.46), # But that expansion has a cost ... that fuel is hydrogen,
 ("stellar-evolution", 644.50, 645.96), # And when they run out of helium,
 ("stellar-evolution", 650.16, 654.78), # first they will expand as they shed their outer layers
 ("stellar-evolution", 608.62, 610.32), #   and they become red giants   (from an earlier take)
 ("stellar-evolution", 655.20, 661.90), # and then sometimes they will collapse ... just go boom.
 ("stellar-cycle", 676.40, 681.80),     # And a supernova is a rapidly expanding cloud of gas,
 ("stellar-cycle", 687.56, 691.56),     # which will push the object very far to the right.
 ("stellar-cycle", 691.78, 705.12),     # Actually, it will split the object ... some special object.
 ("stellar-cycle", 706.66, 709.06),     # Depending on the mass, it might become a white dwarf,
 ("stellar-cycle", 723.48, 728.82),     # or if they are massive enough they will become a neutron star
 ("stellar-cycle", 729.32, 730.96),     # and if they are
 ("stellar-cycle", 733.16, 736.84),     # more massive they will just collapse into black holes.
 ("black-holes", 741.74, 745.52),       # on this line right here is the Schwarzschild radius.
 ("black-holes", 753.96, 760.86),       # And the Schwarzschild radius is the first limit of our triangle of everything.
 ("black-holes", 775.18, 781.88),       # There's a point in which every object ... will collapse into a black hole.
 ("black-holes", 796.42, 804.12),       # For any object there is a compression point ... become a black hole.
 ("black-holes", 807.44, 809.48),       # A black hole has no really defined size
 ("black-holes", 818.16, 827.08),       # because scientists consider ... singularity of size zero.
 ("black-holes", 828.43, 851.76),       # But there is a Schwarzschild radius ... a 45-degree angle.
 ("black-holes", 858.86, 867.26),       # The more massive your black hole becomes ... any size.
 ("black-holes", 867.80, 870.98),       # Right here, we are looking at black holes
 ("black-holes", 875.52, 876.92),       # with the mass of stars,
 ("black-holes", 877.70, 879.84),       # but anything can become a black hole.
 ("black-holes", 888.84, 894.28),       # It's not easy for some object to become a black hole ...
 ("black-holes", 894.94, 918.20),       # And we know that those conditions ... Hawking radiation.
 ("black-holes", 921.16, 923.32),       # But there could be some left over,
 ("black-holes", 944.42, 946.18),       # and if there are any
 ("black-holes", 947.18, 949.10),       # of those primordial black holes around,
 ("black-holes", 955.36, 963.22),       # they would be roughly the mass of a small moon ... tiny atom.
 ("black-holes", 987.52, 994.02),       # Can you imagine ... an atom just zipping around the galaxy ...
 ("black-holes", 1014.88, 1018.30),     # You could not observe such an object with the telescope.
 ("black-holes", 1019.30, 1021.76),     # It's just too small and too far away.
 ("black-holes", 1053.98, 1057.66),     # So it would be an object that is invisible to the eye,
 ("black-holes", 1060.24, 1064.28),     # but you could detect it only because of its effects on gravity.
 ("black-holes", 1068.94, 1078.00),     # You might think this sounds a lot like dark matter ... primordial black holes
 ("black-holes", 1081.28, 1086.58),     # are actually one of the possible candidates for dark matter.
 ("dark-matter", 1155.80, 1156.62),     # You notice that
 ("dark-matter", 1157.88, 1162.02),     # beyond the scale of stars ... a second diagonal line,
 ("dark-matter", 1164.94, 1167.30),     # which is a separate density line.
 ("dark-matter", 1168.22, 1169.98),     # It's a much lighter density.
 ("dark-matter", 1172.58, 1175.22),     # And that's the density of dark matter.
 ("dark-matter", 1177.34, 1213.42),     # And that's the density of supernovas ... made of stars.
 ("largest", 1215.60, 1221.08),         # And then the only object beyond those are just voids.
 ("largest", 1223.98, 1241.62),         # Just areas in space ... same diagonal as everything else here.
 ("largest", 1251.08, 1260.86),         # There's a point in which nothing can be bigger ... the Hubble radius.
 ("largest", 1270.42, 1275.40, {"s": 1268.97}),  # The Hubble radius is the limit at which anything can be seen by us.
 ("largest", 1276.68, 1281.24),         # It's based on the speed of light and the rate of expansion of the universe.
 ("largest", 1289.16, 1300.10),         # Nothing can be bigger than the Hubble radius ... in any way.
 ("largest", 1301.32, 1303.32),         # It is not the size of the universe.
 ("largest", 1304.38, 1305.28),         # The size of the universe
 ("largest", 1308.92, 1311.18),         # is, as far as we know, infinite.
 ("largest", 1312.30, 1316.76),         # But that is our universe, that is the observable universe,
 ("largest", 1318.06, 1357.20),         # and if we try to calculate ... coincidence, because the observable universe is a bubble ... nothing can come out.
 ("largest", 1358.30, 1363.02),         # Does that mean that our universe is itself a black hole? Probably not.
 ("largest", 1364.08, 1366.16),         # Probably the observable universe was not always
 ("largest", 1367.20, 1370.20),         # on the Schwarzschild radius.
 ("largest", 1374.46, 1400.00),         # Also, the black holes are round ... communicate that to us.
]
