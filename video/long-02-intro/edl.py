# long-02-intro: the opening of long video 2 (space), re-recorded by the author on 2026-11-06 in one take
# (rec57), from the video's questions to the hand-over into the black holes: the chart and its three limits,
# the hand-over from long video 1 (the density of atoms), the tug of war between gravity and electromagnetism
# along the diagonal, the trend up to the giant planets and the split, Jupiter's own heat, the atoms crushed
# and the sea of electrons, brown dwarfs and deuterium, hydrogen fusion (the strong force, new), the main
# sequence, the light-pressure cap, the truce and how it breaks (the iron fix, new), the star split in two,
# the cycle of nebulae and nurseries, the cores (the weak force and the neutrino, new; the neutron star as a
# giant nucleus held by gravity, new), and the collapse into a black hole. It replaces the 2026-11-05 opening
# (rec54, in git history) and the first two minutes of long-02-middle (rec55, the truce to the black hole),
# which the cut now uses only from "most objects on our chart" (video/cuts/long-02-space.json).
# rec57 = "Space triangle take 4.m4a" (Google Drive "Recordings", 2026-11-06, 32:58, ALAC 48 kHz stereo,
# used as mono): a note to the editor (0:00–0:48), then one take with many retakes and a few asides. The
# author's rule: the last try unless it slips (each clip says). Whisper word timings and the review notes:
# video/sources/2026-11-06/ (the words of six stretches re-transcribed on their own, where the long-form
# pass merged restarts: NOTES.md). Treatment: enhance.py --plain, natural speed. Build: video/short-01-hook/README.md.
# (source, beat, first-word start, last-word start, {s, e, gap, cut}) in source seconds; the builder snaps
# each cut to the nearest real silence and caps the pauses inside a clip (PAUSES).

SOURCES = {"rec57": "Space triangle take 4.m4a"}
TREATMENT = "plain"
# the speaker's own rhythm (the author, 2026-11-05: the trimmed pauses read as "stressful"), the gaps between
# clips filled with the take's own room (ROOM)
PAUSES = {"word": 0.25, ",": 0.55, ".": 1.0}
GAPS = {"same": 0.55, "beat": 1.1}
ROOM = True

EDL = [
 # the questions (the second try: the first stalls at "What's the real difference?")
 ("rec57", "questions", 62.96, 71.2),      # What's the real difference between a star and a planet? What happens to dead stars? How are stars born? How do they die?
 ("rec57", "questions", 72.08, 74.9),      # What's the biggest and smallest a black hole can be?
 ("rec57", "questions", 78.38, 81.94),     # Is it possible that most of the matter in the universe is just them?   ("Is it possible?" before it left out; the dark-matter and how-far questions of rec54 weren't recorded this time)
 # the chart
 ("rec57", "tool", 92.36, 97.7),           # To help answer a lot of these questions, I'm gonna use a surprisingly useful but simple tool.   (the third try)
 ("rec57", "tool", 98.74, 105.8),          # It's a single chart that contains everything that can ever be or ever was. It's a log plot of mass and size.
 ("rec57", "limits", 113.72, 117.94),      # The single image contains everything, but also contains its own limits.   (the third try: "but it doesn't…" and "the single image contains everything but also contains," before it)
 ("rec57", "limits", 119.14, 125.92, {"s": 120.78}),  # It's constrained in three sides: by relativity, quantum mechanics, and the size of the universe.   (its start given: the restart "It's constrained by," 1.7 s before it, which the long-form pass had folded into a stall after "in")
 ("rec57", "limits", 146.46, 151.92),      # According to our current understanding of physics, nothing can exist outside that triangle.   (the last of three tries)
 ("rec57", "limits", 171.62, 182.36),      # Therefore, anything that exists fits inside the triangle. And it's such an interesting image that I've been doing a series of videos on them, called the triangle of everything.   (the fourth try; the long-form pass had merged the four into one)
 # the hand-over from long video 1
 ("rec57", "lasttime", 224.0, 240.94, {"cut": [(232.95, 236.85)]}),  # So, on the last video we've covered from humans to planets, and we saw that most of the stuff falls on this diagonal line. [the slip "That's the density of water, but most impossible." cut] That's the density of water, but most importantly, that's the density of atoms.   (the sixth try, after five restarts of "on the last video we've covered from humans to planets")
 # the tug of war
 ("rec57", "dance", 258.22, 266.02),       # See, everything is a delicate dance, or sometimes a violent tug of war, between a few fundamental forces of the universe.   (the third start; "The whole universe is a delicate dance and sometimes, see," before it)
 ("rec57", "dance", 318.0, 320.6),         # See, gravity wants to push matter together.   (the last of three tries at the forces; the short first pair "Gravity wants to push matter close to each other. Electromagnetism wants to push it away." and the tries in between left out)
 ("rec57", "dance", 326.08, 335.78),       # Electromagnetism, on the other hand, prevents it from pushing too close together, because electrons repel each other. So do protons.   (its restart "electromagnetism," before it left out; the retake "But electrons repel each other, so do protons. That is the electric force that's part of the electromagnetism," trails off, left out)
 ("rec57", "diagonal", 364.0, 372.32),     # So this diagonal we see is really the result of that tug of war. Build anything too big, it collapses under its own weight.
 ("rec57", "diagonal", 375.26, 381.82),    # Make it too compact, and its atoms are going to push it away.   (the 3.5 s stall before "are" capped)
 # up the line to the giant planets
 ("rec57", "trend", 391.74, 395.58),       # That trend will follow from the smallest form of life to the larger planets.
 ("rec57", "trend", 404.12, 408.82),       # That balance is what pushes planets to be round, what decides what sort of atmosphere they have.   (the second try; the first slips, "with the size of sort of atmosphere")
 ("rec57", "trend", 410.12, 412.48),       # That trend stops once you reach Jupiter-sized planets.
 # the split
 ("rec57", "split", 436.76, 445.42),       # You see that the trend line shoots slightly to the left, then goes straight up, and then there's a split.   (the third try; the 2 s stall after "the" capped)
 ("rec57", "split", 447.62, 451.04),       # Today I want to explore that split, and why does it matter.   (the second try)
 # planets into stars
 ("rec57", "stars", 475.94, 481.7),        # See, the thing is, we tend to think of planets and stars as completely different things, but that's not really true.   (the third try)
 ("rec57", "heat", 625.16, 638.8),         # Take for example Jupiter: almost half of the energy that keeps its temperature inside it, it's not coming from the Sun, it's actually coming from inside its own core. As it squeezes together, it generates heat.   (the last of ten tries at Jupiter's heat; "almost half" is right, see NOTES)
 ("rec57", "gravity", 691.26, 708.2),      # Here, the delicate tension now favours gravity. There is so much weight that the atoms themselves are crushed. The electrons are stripped of their nuclei, leaving what we call degenerate matter: a bare nuclei in a sea of electrons.   (the second try: the first went on to "…not because of a force, but because of a rule of quantum mechanics", which the author struck on the take: "it sounds like a lawyer speaking")
 ("rec57", "gravity", 803.22, 807.9),      # That sea of electrons is what's keeping the planet from being squeezed any further.   (the last of nine tries)
 ("rec57", "gravity", 811.98, 820.96),     # So as a planet grows to be more massive than Jupiter, it doesn't actually get bigger, it just gets denser.   (the 2.7 s stall after "grows" capped)
 # brown dwarfs
 ("rec57", "bd", 837.24, 843.74),          # Increase the mass any further and we reach brown dwarfs: a weird in-between object, too big to be a planet, too small to be a star.   (the second try; the first ends on "gravity wins once again")
 ("rec57", "bd", 862.48, 872.16),          # Now the gravity is making such a high pressure, not only it's winning over that electron pressure, but it's fusing hydrogen together.   (the restart inside the try; "Now gravity is making a pressure so strong that not only fuses gravity," before it left out)
 ("rec57", "bd", 900.14, 907.26),          # But not common hydrogen. It can only fuse a very rare kind of hydrogen called deuterium, that comes with an extra neutron.   (the last of five tries)
 ("rec57", "bd", 923.4, 932.56),           # Deuterium is so rare that brown dwarfs just can't keep on shining for very long. They just sit there, cooling slowly, glowing like an ember for billions of years.   (the last of three tries)
 # hydrogen fusion: the strong force
 ("rec57", "fusion", 1074.36, 1079.24),    # Add a little bit more mass, and something magical happens, because a new force comes into play.   (the last try, from "add": its "but" sits 3 s before it; the two earlier tries, "and then something magic happens", and the four tries at "gravity squeezes the core so hard that…" left out)
 ("rec57", "fusion", 1080.42, 1087.28),    # The strong force, as the name implies, is the strongest of all forces, but it also has a very limited range.   (the last of three tries)
 ("rec57", "fusion", 1106.94, 1117.82),    # In here, now gravity is squeezing the protons together so much that the strong force is able to grab them together and create a new kind of nuclei.   (the third start inside the try)
 ("rec57", "fusion", 1123.42, 1125.56),    # It's not hydrogen anymore, it's helium.   (the second try: "an elion" before it)
 ("rec57", "fusion", 1139.86, 1143.94),    # It turns two hydrogens into one helium, and releases a lot of energy.   (the last restart; four hydrogen nuclei, really: NOTES)
 ("rec57", "fusion", 1146.32, 1152.3),     # And that energy will now create an outward pressure, pushing our objects again to the right.
 # the main sequence
 ("rec57", "ms", 1172.4, 1182.28),         # The more massive a star is, the brighter it shines, and it creates this diagonal line, which is called main sequence, and is where stars will live most of their lives.   (the third start inside the try; "but if light shines, it's too bright," after it, the first of nine tries at the cap, left out)
 # the cap
 ("rec57", "limit", 1350.06, 1364.64),     # But that line also has a limit, because if a star is too bright, then its outer layers of their atmospheres are being thrown so violently outside that it escapes its own gravity well.   (the last of nine tries, after the author's question about light pressure, 20:04–20:58: answered in NOTES)
 ("rec57", "limit", 1370.89, 1373.06),     # And it just expands as a cloud.   (the second try)
 ("rec57", "limit", 1389.38, 1394.22),     # We are not sure exactly where it ends, but around here are the largest stars we know.   (the third try)
 # the truce
 ("rec57", "truce", 1476.0, 1489.22),      # Now, that new delicate dance between gravity, the electromagnetism and the strong force will create this stable equilibrium point at this diagonal line, the main sequence, where stars will live most of their lives.   (the last of eight tries at the return to the main sequence)
 ("rec57", "truce", 1502.82, 1509.72),     # But that equilibrium is kept by the fusion of hydrogen. And once it runs out, that equilibrium goes haywire.   (the second try)
 # how it breaks (the iron fix, from the corrected script)
 ("rec57", "death", 1519.52, 1528.1, {"e": 1528.6}),   # With no more hydrogen to burn, the core shrinks under its own weight. And that squeeze heats it up until the next fuel catches: helium.   (the second try; its end given, Whisper runs "helium" into the restart after it)
 ("rec57", "death", 1530.38, 1537.3, {"s": 1530.96}),  # That pushes a star out again, far bigger than before: a red giant, now burning helium.   (the restart; "that pushes a star," before it, its start given in the silence between them)
 ("rec57", "death", 1538.94, 1545.08),     # For a star like the Sun, that's the end of the road. It puffs its outer layers away and leaves its core behind.
 ("rec57", "death", 1549.0, 1558.78),      # But the biggest stars will go on: shrink, ignite, swell, again and again, burning carbon, then oxygen, then silicon, until the core is iron.
 ("rec57", "death", 1591.46, 1603.32),     # And iron is where magic dies, because fusing it costs energy instead of giving it away. So the fire suddenly goes out, and the core collapses in less than a single second.   (the last try; "An iron is where fusion stops paying… the death of magic…" and the aside "this thing lives for a billion years and collapses in a second? Wow." before it)
 ("rec57", "death", 1616.7, 1620.88),      # Either way, the star is now split in two. Two distinct objects on our chart.   (the third of five tries: the last two, "for the purpose of our chart, we will consider them two separate objects" and "the core and the nebula, but in either case…", are fragments)
 # the cycle
 ("rec57", "cycle", 1651.42, 1658.76),     # The outer layers will keep expanding with the leftover energy from the last battle, and become supernova remnants, or nebulae.   (the second try)
 ("rec57", "cycle", 1667.86, 1687.08),     # These will eventually meet others and merge into a larger cloud of gas and dust called the stellar nursery, which will eventually collapse back into a protostar and start a new cycle. But this time, the next generation will start with some richer materials that could lead to a planet full of life, like ours.   (the second try)
 # the cores
 ("rec57", "core", 1692.64, 1694.38),      # The core, however, will stay put.   (the second try)
 ("rec57", "core", 1727.92, 1733.42),      # If the star isn't massive enough to go supernova, it will stay as a white dwarf: a core of carbon and oxygen.   (the last of five tries)
 ("rec57", "core", 1816.42, 1827.24),      # But if it does go supernova, that catastrophic core collapse will be so powerful that a new player force will enter in play: that's the weak force.   (the last of six tries; the asides about the weak force and "I think we need to sort of introduce it somehow," before it left out)
 ("rec57", "core", 1834.28, 1840.12),      # Protons and electrons will be squeezed into a mass of mostly neutrons: a neutron star.
 ("rec57", "core", 1842.96, 1846.78),      # A neutrino will be sent out, carrying a huge amount of energy.
 ("rec57", "core", 1848.22, 1853.94),      # And because neutrons, unlike protons and electrons, do not repel each other, it will just stay put.
 ("rec57", "core", 1919.0, 1923.5, {"s": 1919.45}),    # The neutron star is really just a very big atomic nucleus:   (the last of twelve tries at the giant nucleus; its start given)
 ("rec57", "core", 1933.78, 1940.5, {"s": 1934.75}),   # mostly a bunch of neutrons, held together not by the strong force, but by pure gravity.   (the restart; "a lot of neutrons, a bunch of neutrons, but held together not by," before it; its start given: Whisper puts "mostly" 1 s early)
 # the black hole
 ("rec57", "bh", 1955.06, 1959.52),        # And if the core is any bigger, then something even weirder will happen.   (the restart inside the try)
 ("rec57", "bh", 1960.16, 1961.92),        # It will collapse into a black hole.
 ("rec57", "bh-short", 1962.88, 1966.76),  # An object so weird that it deserves a video of its own.   (Short only: the long cut skips it, video/cuts/long-02-space.json)
 ("rec57", "bh-long", 1969.08, 1974.72),   # And black holes are so weird that they are worth taking a closer look. Let's go there.   (Long only)
]

POST_CUTS = []
