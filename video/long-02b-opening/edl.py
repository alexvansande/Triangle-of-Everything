# long-02b-opening: the new opening of long video 2 (space), the author's first draft of its new script (rec74,
# 2026-11-17; the script: the claude.ai doc "Long 2: Space Triangle — script"): a map of every single thing, the catalogue
# (numbers, labels, sorted and categorized), mass and size on a log chart; then the dance of the forces: the diagonal as
# the tug of war between electromagnetism and gravity, gravity rounding things off, the giant planets' column and the sea
# of electrons, the split, the strong force and fusion, the main sequence, the fuel running out, small stars' cores and
# nebulae, the supernova and the weak force, the neutron star; then the black-hole line up to the Schwarzschild limit,
# where the long cut (video/cuts/long-02b-space.json) hands over to the Black Hole Slope Short. The forces Short,
# short-l2b-dance-of-the-forces, is cut from this take (video/cuts/short-l2b-dance-of-the-forces.json).
# rec74 = "Space dance take 1.m4a" (Google Drive "Recordings", 2026-11-17, 15:33, ALAC 48 kHz stereo, used as mono): a note
# to the editor (0:00-1:15: the plan; "this first recording will be a draft"), then one take with retakes and two asides
# ("I'm going to remove that last phrase", 5:35; "those two phrases should go all the way down", 6:40). The author's rule:
# the last try unless it slips (each clip says). Word timings and the review notes: video/sources/2026-11-17/.
# Treatment: enhance.py --plain, natural speed. Build: video/short-01-hook/README.md.
# (source, beat, first-word start, last-word start, {s, e, gap, cut}) in source seconds.

SOURCES = {"rec74": "Space dance take 1.m4a"}
TREATMENT = "plain"
PAUSES = {"word": 0.25, ",": 0.55, ".": 1.0}
GAPS = {"same": 0.55, "beat": 1.1}
ROOM = True

EDL = [
 # a map of every single thing (the fourth try; the earlier three restart)
 ("rec74", "map", 153.78, 157.68),         # What will happen if you try to make a map of every single thing in the universe?
 ("rec74", "map", 158.66, 162.72, {"e": 163.42}),         # Every star, every planet, galaxy, animal, rock, car, microbe or atom.   (its end given, before "Not where they are": that try says "how they connect each other", with no "to" and "other" swallowed, the author, 2026-11-17: "how they connect to ea[ch other] - phrase cut")
 ("rec74", "map", 177.8, 182.76, {"s": 177.25}),         # Not where they are, but how they relate to each other and how everything connects in this one universe.   (the last try, 2:57, whole)
 ("rec74", "map", 185.42, 189.14),         # Turns out it's a tool the scientists used a lot, and it's surprising how much it reveals.
 ("rec74", "map", 198.88, 200.94),         # From the Big Bang to the heat death of the universe,   (the second try)
 ("rec74", "map", 210.04, 211.86, {"gap": 0.35}),  # a unified history, all in a single chart.   (the last of three endings)
 # the catalogue
 ("rec74", "catalogue", 217.2, 219.78),    # So let's start by cataloging every single thing we can imagine.   (the second try)
 ("rec74", "catalogue", 220.88, 224.74),   # Add numbers, features, labels. We list everything we know about those objects.
 ("rec74", "catalogue", 232.18, 236.8, {"s": 233.85}),    # We can even include things like the rainbow or radio waves.   (the fourth start: its start given, the three before it restart)
 ("rec74", "sort", 244.62, 253.8, {"s": 247.55}),         # And then we sort and categorize them.   (from the third "and then": its start given) Some will float in water, some sink, some are round, some are not, some are in between.
 ("rec74", "sort", 254.66, 258.3),         # Some objects are alive, some are not, and surprisingly, some also are in between.
 ("rec74", "sort", 259.56, 262.7),         # We can categorize them as heavy or light, big or small.
 ("rec74", "chart", 264.64, 281.78, {"e": 282.05}),       # There are two numbers that we apply to almost everything, mass and size. The ones that don't have mass will have energy level and wavelength, which turns out to be the same thing. But the numbers are wildly different, so the only way to organize them is a log chart, where each square is 10x the last one.
 # the dance of the forces
 ("rec74", "bands", 283.62, 288.14, {"s": 285.4}),       # If you do that, you'll notice that most things will fall in bands.   (the second "if you do that": "If you do that, you know," before it)
 ("rec74", "bands", 290.54, 294.36),       # And it seems there is something special about this particular diagonal. What is it?
 ("rec74", "dance", 294.56, 303.42),       # What is happening is that everything in our universe is a delicate dance between four fundamental forces. Well, sometimes it can be a violent tug of war also.
 ("rec74", "em", 306.42, 311.9),           # Electrons repel other electrons and are attracted to protons, so they find a good equilibrium point between them.   (the second try)
 ("rec74", "em", 312.72, 317.1),           # These are the chemical bonds keeping most things around you together, from a stick to a building.
 ("rec74", "em", 318.12, 320.48),          # These bonds are all variations of the electromagnetic force.   ("It keeps things at the right distance of each other" after it and "Electromagnetism prevents things…" at 5:28 left out: the author, 5:35, "I'm going to remove that last phrase. These bonds are all variations, etc.")
 ("rec74", "em", 348.94, 354.16),          # It prevents things from getting too close to each other. But gravity works trying to push matter together.   (the try after the aside; its "All of these are the electromagnetic force" before it left out for the line above)
 ("rec74", "diagonal", 355.86, 371.56, {"cut": [(371.40, 371.57)]}),    # Make something too big, and it will crush under its own weight. Try to squeeze it too hard, and electrons themselves will push it outwards. The resulting line, this diagonal, is actually the density of atoms, and everything made of ordinary matter will fall somewhere along here.   (its "the" before "here" cut, 371.40-371.57: "along the here", the author, 2026-11-17)
 ("rec74", "gravity", 381.96, 386.68),     # Gravity is very weak compared to electromagnetism, but it works at much larger distances.
 ("rec74", "gravity", 402.45, 416.08, {"s": 404.8}),     # The more massive something is, the more gravity has an effect on it, and the less chemical bonds can keep it together. That's why it's hard to build very tall buildings, and why at some point everything in our list becomes round.   (the try after the aside, 6:40: "those two phrases should go all the way down", the two sentences joined; from its second "the more massive something is": the first, 402.3, restarts, the author, 2026-11-17)
 ("rec74", "gravity", 417.66, 419.4, {"s": 417.05}),      # Gravity shapes everything from this point onwards.   (its start given: the word timings run "Gravity" into "shapes")
 # the giant planets' column
 ("rec74", "column", 427.12, 430.62),      # Get massive enough, and gravity starts to matter even at atomic scale.   (the second try)
 ("rec74", "column", 431.02, 445.7, {"cut": [(434.2, 437.85)]}),       # Notice how giant planets beyond Jupiter do not fall on our diagonal line anymore. Rather, they just go up on a column. That's because their core is not made of ordinary matter.   (a hesitation between "do" and "not" cut)
 ("rec74", "column", 447.52, 460.84),      # These planets are massive, and there's so much pressure in their core that it's able to win over the repulsion of the electrons. The atoms get stripped out of the outer electron layers, and it becomes a lot of loose nuclei in a sea of electrons.
 ("rec74", "column", 482.8, 491.16),       # That's why super-Jupiter planets don't get bigger, they just get denser. That is, until this bifurcation here happens. What is that?   (the second try)
 # the strong force and fusion
 ("rec74", "strong", 493.78, 504.72, {"cut": [(494.75, 496.12)]}),      # Turns out, if you add even more mass, then something magical happens, because a new force comes into play. The strong force, as the name implies, is the strongest of all forces.   (a hesitation between "add" and "even" cut)
 ("rec74", "strong", 506.46, 508.52, {"e": 509.45}),      # But it also has an even more limited range.   (its end given, at the end of "range" on the waveform, 509.4 (508.95 clipped it, the author, 2026-11-17): a restart, "but it also has even a more", follows at 510.35)
 ("rec74", "strong", 513.66, 523.08),      # For some massive objects, their gravity will be so strong that it will push those cores together that the strong force can now capture them and make one single nucleus.
 ("rec74", "fusion", 565.94, 574.5),       # And when that happens, a large amount of energy will be released, creating an outwards pressure that counterbalances the force of gravity.   (the last of four tries)
 ("rec74", "fusion", 590.88, 591.14, {"s": 590.75}),      # That's fusion.   (the third of three)
 ("rec74", "fusion", 594.96, 606.06),      # And it changes the delicate dance between gravity and electromagnetism and the strong force, creating this new stable equilibrium diagonal here, which is called the main sequence, where stars will live most of their lives.
 ("rec74", "fusion", 607.92, 613.12),      # But that equilibrium is only kept by the fusion of hydrogen, and once it runs out, that goes haywire.
 # how stars end, and the weak force (the author's last version, from 11:00: small stars, then the massive ones; the
 # earlier "When that happens, a catastrophic core collapse…" tries, 10:15-10:51, left out)
 ("rec74", "end", 669.34, 679.46, {"s": 672.85}),   # Small stars will remain with a nucleus made of oxygen and helium, and their outer layers will expand into nebulae.   (from its restart: "Small stars will just remain with the nucleus," before it)
 ("rec74", "end", 697.3, 705.04, {"s": 700.55}),          # More massive stars will undergo a catastrophic core collapse called a supernova.   (the third "more massive stars", its start given)
 ("rec74", "end", 711.96, 722.8, {"s": 714.15}),          # Their outer layers will spread out, and a new player force will enter into play. It's the weak force. It's what decides what the nucleus even is.   (the second "their outer layers", its start given)
 ("rec74", "neutron", 738.96, 742.1),      # If you squeeze a proton and an electron hard enough,   (the fourth try's start…)
 ("rec74", "neutron", 747.64, 748.52, {"gap": 0.3, "e": 748.95}),   # it will create a neutron.   (…and the fifth's end: the fourth ends "it will create a mess", the fifth says "a proton and a few electrons")
 ("rec74", "neutron", 784.26, 791.56),     # And neutrons, unlike protons and electrons, do not repel each other, so they will just stay put, held by the force of gravity.
 ("rec74", "neutron", 794.68, 800.16),   # This forms a neutron star, which is really just a very single big atomic nucleus.   (the slip "a very single" kept: no clean cut between the words; to re-record)
 ("rec74", "neutron", 804.22, 809.54),     # A bunch of neutrons held together not by the strong force, but purely by the force of gravity.
 # the black-hole line (the long cut hands over to short-04a-black-hole-slope after "Nothing can exist above it")
 ("rec74", "blackholes", 819.38, 823.82),  # And if you add even more mass, a stranger thing will happen.
 ("rec74", "blackholes", 825.44, 833.84, {"s": 827.85}),  # So far our objects have all been around bands, scattered around the density of water, the column of super-Jupiter planets.   (the second "so far", its start given)
 ("rec74", "blackholes", 834.34, 841.4, {"s": 838.85, "e": 841.65}),   # All living stars are around this rightward slope.   (the third "all living stars", its start given)
 ("rec74", "blackholes", 847.82, 858.7, {"cut": [(855.5, 856.55)]}),   # This is the region where stars go to die. On the left is a cemetery of dead stars, white dwarfs, neutron stars, and the strangest of all, black holes.   (the restart "and the strange," cut)
 ("rec74", "line", 869.92, 872.74),        # And unlike everything else, black holes are not scattered around.   (the second try)
 ("rec74", "line", 878.06, 881.12),        # Every single black hole lives exactly on this line.   (the second "every single black hole")
 ("rec74", "line", 882.0, 894.94),         # And this line is very special because it actually represents the first limit we meet on our chart of everything. Because for every object you can see, there's a size in which if you squeeze them hard enough, they will become a black hole.
 ("rec74", "line", 905.52, 908.84),        # Black holes never cross this line, therefore nothing will.   ("And as I said," before it left out)
 ("rec74", "line", 909.9, 915.88),         # So this line, called the Schwarzschild radius, represents the upper limit in which anything can be.
 ("rec74", "line", 921.96, 923.18),        # Nothing can exist above it.   (the second try: the first says "above us")
]
