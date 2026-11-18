# long-02b-opening: long video 2 (space) up to the dark matter, from the author's second take of the new script (rec75,
# 2026-11-18; the script: the claude.ai doc "Long 2: Space Triangle — script"): a map of every single thing, the catalogue,
# mass and size on a log chart; the dance of the forces (the bonds, gravity rounding things off, the giant planets'
# column, the strong force and fusion, the main sequence, small stars' end, the supernova and the weak force, the neutron
# star, the heavy elements, escape velocity and the black hole); the black-hole line, its slope, the black holes we know,
# the smallest ones and dark matter, to "the lucky few survivors". The right of the chart is long-02b-right (rec76).
# The forces Short's own opening ("If you try to map every single thing…", the "intro" clips) sits after "What is it?":
# the long cut (video/cuts/long-02b-space.json) skips it, the Short (video/cuts/short-l2b-dance-of-the-forces.json)
# starts on it.
# rec75 = "Space dance take 2.m4a" (Google Drive "Recordings", 2026-11-18, 21:16, ALAC 48 kHz stereo, used as mono). The
# author's rule: the last try unless it slips (each clip says where not). Word timings and the fact check:
# video/sources/2026-11-18/. Treatment: enhance.py --plain, natural speed. Build: video/short-01-hook/README.md.
# The first take's cut list (rec74, 2026-11-17) is in git history.
# (source, beat, first-word start, last-word start, {s, e, gap, cut}) in source seconds.

SOURCES = {"rec75": "Space dance take 2.m4a"}
TREATMENT = "plain"
PAUSES = {"word": 0.25, ",": 0.55, ".": 1.0}
GAPS = {"same": 0.55, "beat": 1.1}
ROOM = True

EDL = [
 ("rec75", "map", 19.18, 23.72),  # What would happen if you try to make a map of every single thing in the universe?
 ("rec75", "map", 25.22, 29.8),  # Every star, every planet, galaxy, animal, rock, car, and microbe, or atom.
 ("rec75", "map", 30.92, 36.78),  # Not where they are, but how they connect to each other, and how everything connects in this one universe.
 ("rec75", "map", 39.44, 43.88),  # Turns out, it's a tool that scientists use a lot, and it's surprising how much it reveals.
 ("rec75", "map", 44.76, 49.3),  # From the Big Bang to the heat death of the universe, a unified history, all in a single chart.
 ("rec75", "catalogue", 51.62, 56.7),  # So let's start by cataloging every single thing we can imagine, at numbers, features, labels.
 ("rec75", "catalogue", 57.74, 59.28),  # We list everything we know about them.
 ("rec75", "catalogue", 59.7, 62.24),  # We can even include things like rainbow or radio waves.
 ("rec75", "sort", 71.48, 73.0),  # And then we sort and categorize them.
 ("rec75", "sort", 73.66, 77.26),  # Some will float in the water, some will sink, some are round, some are not.
 ("rec75", "sort", 88.46, 103.26, {"s": 89.12, "cut": [(95.0, 98.3)]}),   # (and the "And we…" before "and we will find out" out: the author, 2026-11-18, long draft 0:55)   # (from the second "we sort": "we sort, we sort by" heard on the edit)
 #  # we sort by heavier or lighter, bigger, smaller, and we will find out that there are two numbers that apply to almost everything, that is math and size.
 ("rec75", "chart", 112.82, 121.58, {"s": 115.35}),   # (the last of "some smaller, some smaller part, some smaller particles": long draft 1:05)  # Some smaller particles won't have either, but they do have energy and wavelength, which turns out is the same thing.
 ("rec75", "chart", 149.07, 167.55, {"s": 156.8}),   # (from the last "and since": four restarts before it, 2:29-2:36, the long pass heard one)
 #  # And since the numbers are orders of magnitude difference, the only way we can organize them is by a log chart, where each square is 10 times the last one.
 ("rec75", "bands", 175.89, 179.31),  # If you do that, you notice that most things will fall in bands.
 ("rec75", "bands", 179.87, 183.51),  # And it seems there's something special about this particular diagonal. What is it?
 ("rec75", "intro", 206.71, 209.29),  # if you try to map every single thing that exists
 ("rec75", "intro", 223.69, 224.79, {"e": 225.08}),   # (its end given: the snap took the "you" of "you see" after it, heard twice with the next clip, the author, 2026-11-18)
 #  # in a chart of mass and size,   ("shard": chart; the try before it, 3:25, gives "if you try to map every single thing that exists")
 ("rec75", "intro", 231.43, 236.31),  # You see that most objects will fall in this diagonal band. What's special about it?
 ("rec75", "dance", 242.67, 250.73, {"s": 246.12}),   # (from the second "what's happening": an aside before it, "now, now it's for both of them")
 #  # What's happening is that everything in our universe is a delicate dance between four fundamental forces.
 ("rec75", "dance", 254.49, 258.49, {"s": 256.35}),   # (from the second "well": "Well, sometimes, well, sometimes")
 #  # Well, sometimes it can be a violent tug of war also.
 ("rec75", "em", 260.21, 262.67),  # Electrons are attracted to protons of the atom next door,
 ("rec75", "em", 266.31, 270.09, {"s": 267.7}),   # (after "but the electrons also,": long draft 1:47)  # but the electron layers also push back when they get too close,
 ("rec75", "em", 283.21, 286.09),  # So the atoms settle at a distance where the two balance.
 ("rec75", "em", 288.11, 292.37),  # These are the chemical bonds keeping most things around you together, from a stick to a building.
 ("rec75", "em", 293.09, 295.47),  # These bonds are all variations of the electromagnetic force.
 ("rec75", "em", 297.91, 308.79, {"s": 301.42, "cut": [(304.22, 306.72)]}),   # (from the second "it prevents": "It prevents things… but grav-" before it; "But gravity wants-" cut)
 #  # It prevents atoms from getting too close to each other, but gravity keeps pulling matter together.
 ("rec75", "diagonal", 310.43, 326.49),  # Make something too big and it will crush under its own weight. Try to squeeze it too hard and the electrons themselves will push it outwards. The resulting line, this diagonal, is actually the density of atoms, and everything made of ordinary matter will fall somewhere along here.
 ("rec75", "gravity", 406.17, 410.45),  # electromagnetism is stronger than gravity, but it has both attraction and repulsion.
 ("rec75", "gravity", 411.73, 414.79),  # Gravity is weaker, but it only attracts.
 ("rec75", "gravity", 418.53, 421.29, {"s": 420.3}),   # (the second "so it": long draft 2:37)  # So it quickly adds up.
 ("rec75", "gravity", 423.03, 434.55),  # The more massive something is, the more gravity has an effect on it, and the less chemical bonds can keep it together. That's why it's hard to build very tall buildings. And that's why at some point, everything in our list becomes round.
 ("rec75", "gravity", 435.89, 437.81),  # Gravity shapes everything from this point onwards.
 ("rec75", "column", 453.19, 456.93, {"gap": 3.2}),   # (a longer hold on the round worlds before it, the author, rec75 7:19: "the part where everything's round is passing too quickly")
 #  # Get massive enough and gravity starts to matter even at the atomic scale.
 ("rec75", "column", 458.05, 467.95),  # Notice how giant planets beyond Jupiter do not fall on our diagonal line anymore, Rather, they just go up a column. That's because their core is not made of ordinary matter.
 ("rec75", "column", 469.19, 481.47),  # These planets are massive, and there's so much pressure in their core that it's able to win over the repulsion of the electrons. The atoms get stripped out of their electron layers, and it becomes a lot of loose nuclei in a sea of electrons.
 ("rec75", "column", 483.77, 492.05),  # That's why super Jupiter planets don't get bigger, they just get denser. That is, until this little bifurcation here happens. What is that?
 ("rec75", "strong", 493.85, 498.91, {"e": 499.18}),   # (its end given: the snap took the start of the next "the strong force", heard twice)
 #  # Turns out, if you add even more mass, then something magical happens because a new force comes into play,
 ("rec75", "strong", 507.31, 511.91),  # The strong force, and as the name implies, it's the strongest of all,
 ("rec75", "strong", 527.21, 537.49, {"cut": [(529.75, 536.45)]}),  # But it doesn't reach very far, it's the size of a nuclei.   ("but it reaches, it's very tiny," cut; "nuclei" as said)
 ("rec75", "strong", 554.87, 570.57, {"cut": [(562.25, 564.28)]}),   # (the first "and the nuclei will be," cut: said twice)
 #  # For some massive objects, the gravity will be so strong that it will overpower the electrons pushing out and the nuclei will be so close together that the strong force can now capture them and make them one single nucleus.
 ("rec75", "fusion", 571.7, 578.01),  # And when that happens, a large amount of energy is released, creating an outward pressure that counterbalances the force of gravity.   (the long pass heard "And when that pressure": the words re-heard, 9:31-9:38)
 ("rec75", "fusion", 579.05, 579.61),  # That's fusion.
 ("rec75", "fusion", 581.31, 592.91),  # And it changes that delicate dance between gravity, electromagnetism, and the strong force, creating this new stable equilibrium diagonal here, called the main sequence, where stars live most of their lives.
 ("rec75", "fusion", 594.27, 599.39),  # But that equilibrium is only kept by the fusion of hydrogen, and once it runs out, that goes haywire.
 ("rec75", "end", 601.03, 607.23),  # Small stars like our sun will leave a core of carbon and oxygen behind, and their outer layers will drift off into a nebula.
 ("rec75", "end", 608.03, 611.73),  # More massive stars will undergo a catastrophic core collapse called a supernova.
 ("rec75", "end", 612.73, 621.41),  # Their outer layers are blown away, and in the collapsing core, a new player enters. It's the weak force. It's what decides what a nucleus even is.
 ("rec75", "neutron", 625.35, 629.21),  # If you squeeze a proton on an electron hard enough, it will create a neutron.
 ("rec75", "neutron", 629.53, 636.89),  # A neutron, packed shoulder to shoulder, refused to be squeezed any further, so the core just stays put, held together by gravity.
 ("rec75", "neutron", 644.53, 648.51),  # This forms a neutron star, which really is just one big giant atomic nucleus.
 ("rec75", "neutron", 649.99, 655.53),  # A bunch of neutrons held together, not by the strong force this time, but purely by the force of gravity.
 ("rec75", "heavy", 657.25, 668.59),  # The death of massive stars and above all the collision of two neutron stars is so violent that it forges atoms no ordinary star can make them, like gold, platinum, uranium.
 ("rec75", "heavy", 669.89, 675.63),  # So in a way, a radioactive element is like a battery charged once in these explosions.
 ("rec75", "escape", 679.79, 692.99, {"cut": [(683.45, 686.6)]}),  # They are thrown out so fast that they escape the neutron star's gravity, faster than its escape velocity, the speed you need to win the tug of war against an object's gravity.   (the first "faster than its escape velocity" cut)
 ("rec75", "escape", 693.93, 697.11),  # For a neutron star, that's already about half the speed of light.
 ("rec75", "escape", 726.39, 732.07, {"s": 727.95}),   # (from the second "but the speed of light": "But the speed of light, but…")
 #  # But the speed of light works as a universal speed limit,
 ("rec75", "escape", 760.39, 771.63, {"s": 762.33, "cut": [(767.05, 767.98)]}),   # (from the third "meaning that if you add", and the first "then," cut: "Meaning, meaning that if you add, meaning that if you add… then, then")
 #  # Meaning that if you add even more mass, then the escape velocity will be faster than the speed of light.
 ("rec75", "escape", 780.63, 783.69),  # So nothing, not even light will be able to get out.
 ("rec75", "escape", 785.67, 788.93),  # That's when the strangest of objects is born, a black hole.
 ("rec75", "cemetery", 797.05, 799.23),  # So far, our objects have been around bands,
 ("rec75", "cemetery", 803.57, 807.43),  # scatter around the density of water on the column of super Jupiter planets.
 ("rec75", "cemetery", 812.43, 814.69),  # our living stars are around this white dwarf slope.
 ("rec75", "cemetery", 815.69, 823.61),  # And this right here is the region where stars go to die. And to the left, we have a cemetery of dead stars, white dwarfs, neutron stars,
 ("rec75", "cemetery", 831.49, 833.59),  # and our weird one, the black hole.
 ("rec75", "line", 836.33, 839.65),  # And unlike everything else, black holes are not scattered around.
 ("rec75", "line", 840.57, 843.29),  # Every single black hole lives exactly on this line.
 ("rec75", "line", 848.45, 856.71),  # and this line is special because it actually represents the first limit we meet on our chart of everything.
 ("rec75", "line", 857.71, 862.81),  # For every object you can see, there's a size in which if you squeeze them hard enough, they will become a black hole.
 ("rec75", "line", 869.91, 872.89),  # And black holes never cross this line, therefore nothing will.
 ("rec75", "line", 875.33, 883.23),  # So this line called the Schwarzschild radius is the limit of how small anything of any given mass can be, nothing can exist above it.
 ("rec75", "slope", 885.25, 893.93),  # And black holes don't actually have a size, there are singularity, but they do have an event horizon, the point in which light cannot escape.
 ("rec75", "slope", 894.43, 897.35),  # And that event horizon is dependent on the mass.
 ("rec75", "slope", 909.31, 915.93, {"s": 904.5, "e": 908.15}),   # So it creates this diagonal, a one-to-one, 45 degrees slope.   (the third try, 15:04: the last restarts four times, "so it creates this, so it creates this slope for…")
 #  # So it creates this 45 degrees slope.
 ("rec75", "known", 918.09, 923.45),  # Squeeze the sun into a black hole and it would be about six kilometers wide. The earth would be the size of a marble.
 ("rec75", "known", 924.33, 930.91),  # The black holes we know of form in the collapsing core of dying stars or grow by swallowing gas and merging with other black holes.
 ("rec75", "known", 931.93, 937.21, {"s": 933.5}),   # (from the second "they can go": "They can go from anything-" before it)
 #  # They can go from anything from a few sun masses to billions of them.
 ("rec75", "known", 938.11, 962.93),  # The one in the center of our Milky Way, for example, has four million solar masses. And here's a strange part. The bigger they get, the less dense they are. The really supermassive ones are less dense than water. They would float if you had a pool big enough. Like M87, the first black hole ever to be photographed. Or TON 618, one of the largest we know of. Its event horizon is bigger than Pluto's orbit.
 ("rec75", "small", 991.73, 995.75),  # But the most interesting question isn't how big a black hole can be, but actually how small.
 ("rec75", "small", 1011.49, 1017.77),  # Because there are actually some scientists believing that most of the matter in the universe are just tiny black holes.
 ("rec75", "small", 1038.89, 1046.45),  # We can't turn matter into a black hole in a lab yet, but we know two moments when it happens.
 ("rec75", "small", 1047.53, 1058.21),  # One is when a very large star dies, but the second one happened the very first instance after the Big Bang, when everything in the universe was a very hot and dense soup of matter and energy.
 ("rec75", "small", 1063.01, 1068.49),  # It's possible the black holes of all sizes were created. And some of them might just be around today.
 ("rec75", "search", 1074.45, 1081.01),  # and we've been looking for them with quasars, with the cosmic microwave background, gravitational waves, and finally with microlensing.
 ("rec75", "search", 1087.71, 1091.31),  # and every search has come up empty and the window where they could hide keeps closing
 ("rec75", "search", 1097.39, 1102.39),  # and they can't be too small either or they would have evaporated by now through a process we call Hawking radiation.
 ("rec75", "search", 1109.37, 1118.73),  # what's left is a really narrow window, something the size of a virus with the mass of a small moon or a whole asteroid's mass squeezed into something smaller than an atom.
 ("rec75", "search", 1151.19, 1154.31),  # That window might close more in the future.
 ("rec75", "dark", 1154.75, 1165.59),  # But if it doesn't, and if they do exist, they would be invisible. No light, nothing a telescope could see. We would only notice their gravity.
 ("rec75", "dark", 1166.45, 1175.71),  # But here's the thing, we do see that gravity. When we wait galaxies, they are much heavier than everything we can see in them. 5, sometimes 10 times heavier.
 ("rec75", "dark", 1176.69, 1182.41),  # So, most of the matter in the universe is something invisible, which, of course, we call dark matter.
 ("rec75", "dark", 1183.45, 1184.73),  # We don't know what dark matter is,
 ("rec75", "dark", 1190.71, 1196.79),  # but if it's just tiny black holes, then that's interesting because it would mean we don't actually need any new particle to explain it.
 ("rec75", "dark", 1197.93, 1199.63),  # Or, of course, maybe it's something else entirely,
 ("rec75", "dark", 1210.45, 1214.09),  # maybe it isn't a thing at all, and we just got gravity wrong.
 ("rec75", "dark", 1214.69, 1229.99),  # But if it's something real, it's somewhere on this chart, and people have been looking for it. And not only on the black hole line, oh no, someone worked out that if dark matter coming lumps roughly this size, they'd leave tracks in the crystal of ancient rocks.
 ("rec75", "dark", 1231.01, 1232.43),  # So they looked at the rocks, nothing.
 ("rec75", "dark", 1233.53, 1245.41),  # Another team realized that it can't be here either, otherwise people's head would just randomly explode as if they had been shot by a cosmic bullet. So it crossed out this area also.
 ("rec75", "dark", 1246.21, 1251.97),  # So the search for dark matter is really a lot of scientists scratching off areas of this map one by one.
 ("rec75", "dark", 1253.11, 1270.87),  # But I still find it fascinating that just maybe in the very first instance of our history, most of the matter that ever existed just collapsed into black holes. And everything else, we, the galaxies, the stars, are just the lucky few survivors.
]
