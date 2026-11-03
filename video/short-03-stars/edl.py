# short-03-stars: planets into stars. Jupiter's own heat, brown dwarfs and deuterium,
# the fork after them, the main sequence, the life of a star, the nebulae that make
# new stars, and what the core becomes (white dwarf, neutron star, black hole).
# rec36 = "Brown dwarfs to black holes.m4a" (Google Drive "Recordings", 2026-10-27, 4:45,
# AAC mono): one take of the edited script (video/scripts/recording-scripts.md) with
# retakes. It replaces the 2026-10-19 cut from rec16 + rec17 (in git history).
# Treatment: enhance.py --plain, 1.1x. Build: see video/short-01-hook/README.md.
# (source, beat, first-word start, last-word start, {s, e, gap}) in source seconds;
# the builder snaps each cut to the nearest real silence.

# After the tempo: one second of silence added to the finished audio (public/narration/short-03-stars/
# audio.m4a) at 1:57.0, between "…squeezed together into neutrons," and "and it becomes a neutron star",
# for the neutron sequence (the author, 2026-10-29). A rebuild from this EDL has to add it again
# (or give that clip a 1.1 s longer "gap" before the tempo step).

PAUSES = {"word": 0.18, ",": 0.3, ".": 0.45}

EDL = [
 ("rec36", "hook", 13.56, 18.48),     # We tend to think of stars and planets as completely different things, but that's not really true.   (the mic test before it left out)
 ("rec36", "heat", 19.50, 28.41),     # In our own solar system, Jupiter and Saturn give off more heat than they get from the Sun, mostly because their own mass keeps squeezing their cores.
 ("rec36", "heat", 36.57, 40.41, {"s": 37.22}),  # And as mass grows, so does the pressure in the core.   (the third try; two that break off after "so does" left out, which Whisper had merged into one)
 ("rec36", "bd", 41.83, 56.23),       # Until some point, they become brown dwarfs. Brown dwarfs are really in-betweens, not quite stars, not quite planets. They're just massive enough to fuse a rare kind of hydrogen called deuterium, but not ordinary hydrogen.   (the first try)
 ("rec36", "bd", 84.69, 89.03, {"cut": [(86.30, 86.46)]}), # Deuterium is so rare that brown dwarfs just can't keep shining on like stars.   (the second try; the first runs on into the restart)
 ("rec36", "fork", 92.59, 96.81),     # But add a little bit more mass and you get the split you see on this chart.
 ("rec36", "ms", 97.77, 101.45),      # Once the pressure in the core is high enough to fuse ordinary hydrogen,
 ("rec36", "ms", 120.31, 127.81),     # that fusion releases some energy that creates a force that will push the star outwards, making it bigger.   ("it releases a huge amount of pressure…" and the restarts left out)
 ("rec36", "ms", 132.05, 135.97),     # It will move into this other diagonal line that we call the main sequence,
 ("rec36", "ms", 164.93, 167.61),     # where stars spend most of their lives.   (from the last try; the first says "spends")
 ("rec36", "life", 170.57, 181.71),   # Until the hydrogen runs out, and then as the fuel for fusion is used up, the star collapses and then expands again, and collapses and expands, and splits in two.   ("That's it" left out)
 ("rec36", "split", 182.45, 190.29),  # The outer layers are blown away as supernova or planetary nebula, and the inner core becomes a very dense object.   ("Now," left out)
 ("rec36", "nursery", 192.49, 207.93),  # As those supernova and nebulae spread out, they meet others, and together they make what we call stellar nurseries, huge clouds of gas that pull together, collapse into protostars, and then into stars again, and the cycle begins.   (the first try)
 ("rec36", "core", 238.99, 243.07),   # And what about the dense core I told you about? Something really interesting happens here.
 ("rec36", "end", 243.61, 251.59),    # If a star isn't massive enough to go supernova, then once fuel runs out, what's left is a white dwarf.
 ("rec36", "end", 252.81, 270.33, {"cut": [(258.20, 258.40), (268.60, 268.78)]}), # But if it's big enough to go supernova, the pressure in its core is so huge that protons and electrons get squeezed together into neutrons, and it becomes a neutron star, so dense that a single spoonful would weigh as much as a mountain.
 ("rec36", "end", 271.97, 281.07),    # And if the star is any bigger still, the core collapses into a black hole, an object so strange that it deserves a video of its own.
]
