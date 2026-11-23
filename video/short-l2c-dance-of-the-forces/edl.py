# short-l2c-dance-of-the-forces: the forces Short, recorded on its own (rec77, 2026-11-23, "Dance of forces.m4a", Google
# Drive "Recordings", the car, 24:08, ALAC 48 kHz stereo used as mono): the four forces, the chemical bonds, the
# diagonal of atoms, gravity rounding things off, the giant planets' column, the strong force and fusion, the main
# sequence, the supernova and the weak force, the neutron star, escape velocity and the black hole, the smallest black
# holes and dark matter, to "the lucky few survivors". The author recorded from the script page, improvising around it,
# with many tries; the rule: the last clean try. Word times here are the CTC pass's (scripts/narration-verbatim.py:
# rec77.words.json = its verbatim.json), so every try has its own words. Notes and fact check: video/sources/2026-11-23/.
# (source, beat, first-word start, last-word start, {s, e, gap, cut}) in source seconds.

SOURCES = {"rec77": "Dance of forces.m4a"}
TREATMENT = "plain"
PAUSES = {"word": 0.75, ",": 0.75, ".": 0.75}   # (the CTC words carry no punctuation: one cap for every pause)
GAPS = {"same": 0.55, "beat": 1.0}
ROOM = True

EDL = [
 ("rec77", "dance", 37.1, 40.82),  # Everything in the universe is a delicate dance between four fundamental forces.
 ("rec77", "bonds", 110.62, 113.68),  # At the atomic level, electrons are attracted to the protons next door,
 ("rec77", "bonds", 117.34, 121.94),  # but the electron layers push back when they get too close, so atoms settle where the two balance.
 ("rec77", "bonds", 138.5, 145.88),  # These are the chemical bonds that hold most things around you together, from a stick to a building, and they're all variations of the electromagnetic force.
 ("rec77", "plot", 173.88, 180.82),  # So if you plot objects on a chart of mass and size, they will be all around a diagonal.
 ("rec77", "plot", 216.14, 220.0, {"e": 220.6}),  # Most things will be in this diagonal line. This is where that equilibrium lives.
 ("rec77", "gravity", 275.2, 277.76),  # The electrons prevent atoms from getting too close to each other.
 ("rec77", "gravity", 278.78, 287.58),  # The chemical bonds try to keep them together a little bit, but gravity will win: make something big enough, and it will crush under its own weight.
 ("rec77", "gravity", 307.6, 313.42),  # That's because unlike electromagnetism, there is no negative gravity. Everything attracts, nothing repels.
 ("rec77", "gravity", 340.52, 343.84),  # So gravity adds up, and at some point everything will be shaped by gravity.
 ("rec77", "round", 376.18, 379.58),  # This is the point where gravity wins, and everything just looks like spheres.
 ("rec77", "round", 502.8, 509.98),  # That trend will keep up from dwarf planets and small moons until a planet the size of Jupiter, and then it will change.
 ("rec77", "giants", 538.5, 543.1),  # Beyond Jupiter, when planets get more massive, they don't get any bigger, they just get denser.
 ("rec77", "giants", 558.36, 569.56),  # That's because the gravity is now so strong that the pressure inside their core is winning over the repulsion of the electrons. The atoms are stripped out of the electron layers, and you get a loose nuclei in a sea of electrons.
 ("rec77", "split", 576.6, 580.78),  # So in our chart, everything just goes up, until suddenly we have that split.
 ("rec77", "strong", 587.92, 590.58),  # Add even more mass, and a new force comes into play.
 ("rec77", "strong", 615.1, 621.94),  # The strong force, as the name says, is the strongest of all, but it has a very limited range: it reaches no longer than a nuclei.
 ("rec77", "fusion", 644.26, 649.6),  # In a very massive object, gravity is now so strong that it overpowers the electrons pushing out,
 ("rec77", "fusion", 650.94, 655.36),  # and the nuclei get so close that the strong force captures them and makes them into one atom.
 ("rec77", "fusion", 667.1, 668.84),  # That releases a huge burst of energy,
 ("rec77", "fusion", 670.02, 675.14),  # creating an outward pressure that finally is able to counterbalance gravity. That's fusion.
 ("rec77", "main", 704.82, 710.48),  # The new energy released by the fusion of hydrogen will now create a new equilibrium.
 ("rec77", "main", 713.28, 715.34),  # And all stars who live in this diagonal
 ("rec77", "main", 724.46, 727.12),  # (are) called the main sequence, where stars spend most of their lives.
 ("rec77", "main", 734.86, 740.1),  # But that equilibrium only lasts while there's hydrogen to fuse, and once it runs out, it goes haywire.
 ("rec77", "supernova", 767.7, 772.86),  # When that happens, a very massive star can undergo a catastrophic core collapse called a supernova.
 ("rec77", "supernova", 777.74, 781.26),  # The outer layers are blown away, and in the collapsing core a new player enters:
 ("rec77", "weak", 783.52, 786.1),  # the weak force, which decides what a nucleus even is.
 ("rec77", "weak", 787.12, 790.14),  # If you squeeze a proton and an electron hard enough, you get a neutron.
 ("rec77", "neutron", 844.08, 846.84),  # Neutrons, unlike protons, don't mind being squeezed together,
 ("rec77", "neutron", 856.7, 866.7, {"cut": [(864.86, 865.92)]}),  # so the core stays put: a neutron star, which is really one giant atomic nucleus, held together not by the strong force but by gravity alone.
 ("rec77", "escape", 983.5, 985.54),  # In order to escape gravity, you need to be fast.
 ("rec77", "escape", 1004.54, 1012.1),  # The speed required to escape the tug of gravity of a neutron star is measured over a hundred thousand kilometers per second.
 ("rec77", "escape", 1027.68, 1030.42),  # And the larger the star, the faster you need to be.
 ("rec77", "light", 1082.5, 1093.58),  # But our universe does have a speed limit on everything: it's called the speed of light. And if your escape velocity is higher than it, it means that nothing, not even light, will be able to escape its tug.
 ("rec77", "light", 1121.76, 1125.84),  # That's when you create one of the strangest objects in the universe: a black hole.
 ("rec77", "pbh", 1151.82, 1156.98),  # And black holes come in all sizes. We know that they form under the collapsing core of a dying star,
 ("rec77", "pbh", 1158.52, 1159.24),  # but there's another possibility.
 ("rec77", "pbh", 1186.68, 1187.7),  # In the very early universe,
 ("rec77", "pbh", 1189.12, 1196.12),  # everything was so dense that the pressures could have created lots of tiny black holes of all sizes.
 ("rec77", "pbh", 1209.44, 1211.22),  # And if any of them have survived today,
 ("rec77", "pbh", 1212.98, 1217.12),  # they would be something like an asteroid compressed to the size of a virus.
 ("rec77", "pbh", 1246.14, 1248.82),  # They wouldn't emit any light, and they would be very hard to detect,
 ("rec77", "pbh", 1251.08, 1252.56),  # except for their effect on gravity.
 ("rec77", "pbh", 1259.54, 1263.0),  # And that's why scientists are interested in them, because they could explain dark matter.
 ("rec77", "end", 1289.88, 1293.66),  # It's possible that they don't exist at all, and dark matter is something completely different.
 ("rec77", "end", 1415.78, 1431.1),  # But I find it fascinating to think that maybe the only reason that we see that delicate balance between forces is that in the very early moments, gravity dominated everything, turning most of the matter in the universe into black holes,
 ("rec77", "end", 1437.28, 1443.2),  # and everything else, the galaxies, the planets, we are just the lucky few survivors.
]
