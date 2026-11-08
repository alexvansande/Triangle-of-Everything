# short-l2-dance-of-the-forces: the forces Short as a take of its own, from the author's first recording of its script
# (rec58, 2026-11-08): the four forces' dance, the diagonal as the tug of war between gravity and electromagnetism, the
# giant planets' column and degenerate matter, the strong force and fusion, the main sequence, the fuel running out, the
# weak force at the collapse, the neutron star as one giant nucleus held by gravity. Until this take the Short was carved
# from the opening of long video 2 (video/cuts/short-l2-dance-of-the-forces.json, in git history).
# rec58 = "Dance of the forces.m4a" (uploaded 2026-11-08, 9:22, ALAC 48 kHz stereo, used as mono): a mic test and a note
# ("probably this won't be a good video, my voice isn't very good right now, I just wanted to make a try"), then one take
# with many retakes. The author's rule: the last try unless it slips. Whisper word timings and the review notes:
# video/sources/2026-11-08/. Treatment: enhance.py --plain, natural speed. Build: video/short-01-hook/README.md.
# (source, beat, first-word start, last-word start, {s, e, gap, cut}) in source seconds; the builder snaps each cut to the
# nearest real silence and caps the pauses inside a clip (PAUSES).

SOURCES = {"rec58": "Dance of the forces.m4a"}
TREATMENT = "plain"
PAUSES = {"word": 0.25, ",": 0.55, ".": 1.0}
GAPS = {"same": 0.55, "beat": 1.1}
ROOM = True

EDL = [
 # the four forces
 ("rec58", "dance", 44.12, 53.68),         # Everything in our universe is a delicate dance between four fundamental forces, and, well, sometimes it can be a violent tug of war also.   (the fourth try)
 # the diagonal
 ("rec58", "diagonal", 54.9, 62.6),        # If you plot everything that exists in a chart of mass and size, you see that most things form this diagonal line.
 ("rec58", "diagonal", 63.48, 69.96),      # This is where the equilibrium of that particular tug of war between electromagnetism and gravity…   (said once; a fragment, see NOTES)
 ("rec58", "diagonal", 98.0, 111.18, {"cut": [(102.4, 106.6)]}),     # Make something too big and it will crush under its own weight; try to squeeze it too hard and the electrons themselves will push it outwards.   (the last of four tries; "Make it, try to squeeze it so," cut from inside it: the second pass)
 ("rec58", "diagonal", 123.98, 132.24),    # The resulting line, this diagonal, is actually the density of atoms, and everything made of ordinary matter will fall somewhere along here.   (the second try)
 # the giant planets' column
 ("rec58", "column", 151.16, 159.98, {"s": 150.95}),   # But you can see the giant planets like Jupiter and beyond do not fall on this diagonal line; rather they just go up a column.   (the third start inside the try)
 ("rec58", "column", 160.5, 165.06),       # That's because their core is not made of ordinary matter but degenerate matter.
 ("rec58", "crush", 234.88, 244.18, {"s": 234.93}),     # This happens because they are so massive, and there's so much pressure in their core, that is able to win over the repulsion of the electrons.   (the last of eight tries, from its restart)
 ("rec58", "crush", 254.74, 260.66, {"s": 254.55}),    # So they break out of their clouds, and what we have is a bunch of nuclei and a sea of electrons.   (from the restart)
 ("rec58", "crush", 274.12, 278.52, {"e": 278.95}),    # That creates a new equilibrium, as quantum effects prevent them from being crushed any further.   ("and creates an outward…" trails off: cut at "further")
 # the strong force
 ("rec58", "fusion", 299.2, 304.04, {"s": 299.05}),   # But if you add even more mass, then something magical happens, because a new force comes into play.   (from its restart: "But if you add a little bit more," before it, folded into the words by the long-form pass: the second pass)
 ("rec58", "fusion", 304.88, 311.92),      # The strong force, as the name implies, is the strongest of all forces, but it also has a very limited range.
 ("rec58", "fusion", 374.96, 386.62, {"s": 374.75}),   # For some very massive objects, their gravity will be so strong that will push those cores together, that the strong force can now capture them and make one single nucleus.   (the last restart of the last try)
 ("rec58", "fusion", 423.66, 432.58),      # So that's fusion: first on brown dwarfs, with a very small percentage of their hydrogen, then on stars, that can burn all of their hydrogen.   (the last of five tries)
 ("rec58", "fusion", 435.22, 441.5, {"e": 441.95}),    # That fusion creates a massive amount of energy, and that now pushes the objects even further.   (cut before "and stars will grow", said three times and said again in the next line)
 # the main sequence
 ("rec58", "ms", 460.66, 471.92),          # And now that delicate dance between gravity and electromagnetism and the strong force will create this new stable equilibrium diagonal here, which is called the main sequence, where stars will live most of their lives.
 ("rec58", "ms", 475.42, 481.4),           # But that equilibrium is only kept by the fusion of hydrogen, and once that runs out, that goes haywire.
 # the weak force
 ("rec58", "weak", 492.06, 499.02, {"s": 492.0}),   # And when that happens, a catastrophic core collapse will be so powerful that a new player force will enter into play.   (from its third start: "And when we, and when that happens," before it, which the long-form pass had folded into a stall)
 ("rec58", "weak", 504.36, 507.88),        # That's the weak force. And that's what decides what the nucleus even is.   (the second "That's the weak force")
 ("rec58", "weak", 525.56, 537.84),        # Protons and electrons squeezed together will create a mass of neutrons, and that creates a neutron star. And when that happens, a sea of neutrinos is sent out, carrying a huge amount of energy.   (the retakes of both lines)
 ("rec58", "weak", 539.66, 544.82),        # And because neutrons, unlike protons and electrons, do not repel each other, they will just stay put.
 ("rec58", "weak", 546.06, 557.38),        # So a neutron star is really just a very big atomic nucleus: mostly a bunch of neutrons, held together not by the strong force, but purely by the force of gravity.
]

POST_CUTS = []
