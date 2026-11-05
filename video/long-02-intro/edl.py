# long-02-intro: the opening of long video 2 (space), recorded from memory by the author on 2026-11-05 after
# the written script was lost: the video's questions, the chart and its three limits, the hand-over from long
# video 1, the balance of gravity and electromagnetism along the density line, the Jupiter turn and the split,
# then the start of the stars' story (Jupiter's heat, electrons stripped, brown dwarfs and deuterium, hydrogen
# fusion and the main sequence, and the light-pressure cap on the biggest stars). The rest of the stars'
# story comes from video 3's take (rec36) in the cut, video/cuts/long-02-space.json.
# rec54 = "Long 2 intro take.m4a" (Google Drive "Recordings", 2026-11-05, 14:37, ALAC 48 kHz stereo, used as
# mono): one take with many retakes, after a short pause. Whisper word timings and the review notes:
# video/sources/2026-11-05/. The author: "usually the last takes are the best"; the last try is used unless it
# slips (each clip says). Treatment: enhance.py --plain, natural speed (no tempo: the author, 2026-10-27).
# Left out on purpose: "some veer to the [right], and some veer to the left" (the "right" was skipped in the
# take: to re-record), the truck wait ("okay, I'm waiting for the truck to go by") and the broken tries.
# Build: see video/short-01-hook/README.md.
# (source, beat, first-word start, last-word start, {s, e, gap, cut}) in source seconds; the builder snaps
# each cut to the nearest real silence and caps the pauses inside a clip (PAUSES).

SOURCES = {"rec54": "Long 2 intro take.m4a"}
# rec54 sits a little further from the mic than rec55 (the take that follows it in the cut: 4 dB less above 4 kHz,
# 8 dB less above 8 kHz), so it's brightened to meet it halfway (2026-11-05, the voice notes in NOTES.md)
SOURCE_FX = {"rec54": "highshelf=f=4000:g=3"}
TREATMENT = "plain"
PAUSES = {"word": 0.18, ",": 0.3, ".": 0.45}

EDL = [
 # the questions
 ("rec54", "questions", 5.92, 9.00),       # What's the real difference between a star and a planet?
 ("rec54", "questions", 12.34, 13.80),     # What happens to dead stars?
 ("rec54", "questions", 17.18, 20.24),     # How are stars born? How do they die?
 ("rec54", "questions", 23.06, 26.50),     # What's the biggest and the smallest a black hole can be?
 ("rec54", "questions", 31.22, 35.04),     # Can it be that most of the matter in the universe is just black holes?
 ("rec54", "questions", 38.28, 40.26),     # Where is dark matter, anyway?   (the "where is" restart after it left out)
 ("rec54", "questions", 48.02, 51.06),     # How far does our universe go?   (the second try)
 ("rec54", "tool", 65.58, 69.96),          # All these questions and more can be answered with a surprisingly useful tool:   (the last of three tries)
 ("rec54", "tool", 71.41, 76.24),          # a single chart that contains everything that can ever be or ever was,
 ("rec54", "tool", 87.60, 89.44),          # a log plot of mass and size.   ("it's a plot… it's a…" before it left out)
 # the three limits
 ("rec54", "limits", 107.68, 117.38),      # This single image contains everything, but also it contains limits. It's constrained by relativity, quantum mechanics, and the size of the universe.   (the last try; "And it contains everything, but it's also limited" before it)
 ("rec54", "limits", 120.32, 124.36),      # Those three sides make what I call the triangle of everything.
 # the hand-over from long video 1
 ("rec54", "lasttime", 142.20, 153.64),    # Last time we explored from humans to brown dwarfs, and now I want to explore the upper part of the triangle and see all the stories it contains.   (the third try; "from humans to huge planets" before it)
 # the balance of forces along the line
 ("rec54", "dance", 163.76, 170.98, {"e": 171.08}),  # See, if you plot everything by mass and size, you can see a lot of things, but mostly you see that   (cut right after "that": the first try's "most of the things in" runs straight on from it)
 ("rec54", "dance", 175.42, 184.20),       # most of the universe is a delicate dance between some fundamental forces. Gravity, for example, wants to push matter together, to the left;   ("that most of the things in— you see" left out)
 ("rec54", "dance", 185.28, 188.88),       # electromagnetism wants to keep it apart, pushing it to the right.
 ("rec54", "dance", 199.94, 202.74),       # This diagonal line is where they reach their equilibrium point.   (the retake; "This diagonal line is where they reach, this diagonal line," left out)
 ("rec54", "dance", 207.58, 211.64),       # That's the density of atoms, and of everything that is made of them.
 ("rec54", "dance", 233.26, 239.36),       # Make it too compact and the electrons will push it out. Make it too big and it will collapse in its own weight.   (the last of three tries)
 ("rec54", "trend", 255.04, 265.04),       # That trend will follow from the smallest form of life to the larger planets.   (the last of three tries; the 4 s hesitation after "form" capped)
 ("rec54", "round", 301.50, 307.38),       # That balance is what pushes planets to be round, what decides what sort [of] atmosphere they have.   (after the truck and three false starts)
 ("rec54", "jupiter", 353.50, 360.06),     # That trend stops once we reach Jupiter-sized planets.   (the last of six tries)
 # the split
 ("rec54", "split", 371.86, 376.66),       # You see that now most objects go straight up and then they split.   ("some veer to the— and some veer to the left" left out: the "right" is missing)
 ("rec54", "split", 386.50, 387.94),       # Today, we're exploring that split.   (the second try)
 # planets into stars
 ("rec54", "stars", 389.24, 394.76),       # See, the thing is, we tend to think of planets and stars as completely different things, but that's not really true.
 ("rec54", "heat", 402.64, 406.80),        # In fact, Saturn and Jupiter, they create more heat than they receive from the Sun.   (the third "in fact")
 ("rec54", "heat", 425.10, 428.90),        # And most of it is generated in the high pressure inside their cores.   (the last of three tries)
 ("rec54", "gravity", 459.20, 464.54, {"s": 458.40}),  # Here, that delicate tension now favours gravity.   (the second try; Whisper puts "Here" 0.6 s late, so its start is given; what follows it, "gravity, the core pressure is so high…", and the five tries after are left out)
 ("rec54", "gravity", 518.22, 533.78),     # There's so much weight that the inward force is higher than the outward force of the electrons pushing away from each other, and they are stripped out of their nuclei, leaving what we call degenerate matter,   (the last try; the 3 s pause after "that" capped)
 ("rec54", "gravity", 538.78, 542.56, {"s": 540.30}),  # just protons, neutrons, and a sea of electrons.   (its start given: "just nuclei," before it, a slip Whisper merged into the words, left out)
 ("rec54", "bd", 582.94, 590.92),          # Increase the mass further, and we reach brown dwarfs. A weird in-between object, too big to be a planet, too small to be a star.   (the last of four tries)
 ("rec54", "bd", 613.58, 624.66),          # Gravity wins once again. Now not only it wins over the electrons, it also fuses hydrogen together. But not all hydrogen, just a rare kind of hydrogen called deuterium.   (the last try)
 ("rec54", "bd", 628.84, 633.06),          # But deuterium is so rare that brown dwarfs just can't keep shining on for long.
 ("rec54", "bd", 651.10, 654.88),          # So they just stay like that, burning like amber for billions of years.   (the last of five tries)
 # hydrogen fusion and the main sequence
 ("rec54", "fusion", 678.44, 682.74),      # But add a little bit more mass, and now you can actually fuse hydrogen.   (the last of five tries)
 ("rec54", "fusion", 685.72, 689.68),      # That fusion will create helium and release a lot of energy.
 ("rec54", "fusion", 707.70, 709.76),      # And that energy will create an outward pressure,   (the last of four tries)
 ("rec54", "fusion", 711.48, 714.48),      # pushing our objects again to the right.
 ("rec54", "ms", 739.88, 745.88),          # Stars are usually found in this diagonal line, called the main sequence. And they will be there for most of their lives.   (the last of three tries)
 # the cap on the biggest stars
 ("rec54", "limit", 829.40, 843.50),       # But that line also has a limit, because light itself has pressure. And if a star shines just too bright, their outer layers will be sent away with such force that any extra mass will be simply thrown away   (the last of six tries)
 ("rec54", "limit", 845.42, 847.52),       # higher than the orbital velocity of the star,
 ("rec54", "limit", 849.84, 851.16),       # and escape its gravity well.
 ("rec54", "limit", 867.82, 874.64, {"s": 871.05}),  # So right around here is where the largest stars live.   (the last of three tries; its start given: "So, right aroun– So right around here," before it, two false starts Whisper merged into one "So")
]
