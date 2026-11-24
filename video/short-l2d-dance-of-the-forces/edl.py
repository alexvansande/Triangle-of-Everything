# short-l2d-dance-of-the-forces: the forces Short from its take-3 recording (rec79, 2026-11-24, "Dance take 3", an
# iPhone voice memo sent in the chat, 9:08, ALAC 48 kHz stereo used as mono), read from the take-3 script (one
# dark-matter sentence; video/scripts/recording-scripts.md). Replaces rec78 (its cut is in git history). The rule: the
# last clean try. Word times are the CTC pass's (scripts/narration-verbatim.py), every try its own words. Notes and
# fact check: video/sources/2026-11-24/.
# (source, beat, first-word start, last-word start, {s, e, gap, cut}) in source seconds.

SOURCES = {"rec79": "Dance take 3.m4a"}
TREATMENT = "plain"
PAUSES = {"word": 0.45, ",": 0.45, ".": 0.5}   # (the CTC words carry no punctuation: one cap for every pause)
GAPS = {"same": 0.35, "beat": 0.65}
ROOM = True

EDL = [
 ("rec79", "forces", 46.62, 50.4),  # Everything in the universe is a delicate dance between four fundamental forces.
 ("rec79", "forces", 57.9, 65.56),  # At the atomic level, electrons are attracted to the protons next door, but the electron layers push back when they get too close, so atoms settle where the two balance.
 ("rec79", "forces", 68.68, 74.34),  # These are the chemical bonds that hold most things around you together, and they're all variations of the electromagnetic force.
 ("rec79", "diagonal", 77.34, 83.92),  # So if you plot objects on a chart of mass and size, they all fall around this one diagonal. It's the density of ordinary matter.
 ("rec79", "gravity", 108.26, 114.1, {"e": 114.62}),  # But make something big enough, and it will crush under its own weight. Unlike electromagnetism, there is no negative gravity.
 ("rec79", "gravity", 132.08, 138.76),  # Everything attracts, nothing repels, so gravity adds up, and past this point on the line, gravity dominates, and everything is round.
 ("rec79", "giants", 140.86, 150.64),  # Beyond Jupiter, planets don't get any bigger, they just get denser. The pressure in their core beats the electrons' push, and the atoms are stripped down to bare nuclei in a sea of electrons.
 ("rec79", "strong", 153.92, 159.54),  # Add even more mass, and a new force comes into play. It's the strong force, and as the name implies, it's the strongest of all,
 ("rec79", "strong", 163.14, 164.66),  # but it reaches no farther than a nucleus.
 ("rec79", "fusion", 175.34, 181.5),  # Inside the star, the nuclei are squeezed so close and heated so much that the strong force captures them and makes them into one.
 ("rec79", "fusion", 187.9, 198.56),  # That releases a huge burst of energy, an outward pressure that finally holds gravity back. That's fusion. And that balance is the main sequence, where stars spend most of their lives.
 ("rec79", "supernova", 216.86, 230.92),  # But it only lasts while there's fuel to burn. When hydrogen runs out, the core of a massive star collapses, and the star explodes in a supernova. In that collapsing core, a new player enters: it's the weak force, which decides what a nucleus even is.
 ("rec79", "neutron", 233.18, 240.48),  # Squeeze a proton and an electron hard enough, and you get a neutron. Neutrons have no charge pushing them apart, so they pack shoulder to shoulder,
 ("rec79", "neutron", 246.18, 248.94),  # only quantum effects preventing them from being compressed any further.
 ("rec79", "neutron", 250.4, 256.98),  # The result is a neutron star, one giant atomic nucleus, held together not by the strong force but by gravity alone.
 ("rec79", "escape", 281.26, 282.44),  # To escape the gravity of any body,
 ("rec79", "escape", 295.64, 298.04, {"cut": [(295.8, 296.18)]}),  # your velocity needs to be higher than the escape velocity.   # ("orbital" cut out: "your [orbital] velocity")
 ("rec79", "escape", 305.36, 308.9),  # In the case of a neutron star, that can be a hundred thousand kilometers per second.
 ("rec79", "light", 323.7, 326.42),  # But our universe has a speed limit: the speed of light.
 ("rec79", "light", 343.9, 348.44),  # And if the matter of any body is so dense that the escape velocity is higher than that,   # (from the second "and if")
 ("rec79", "light", 350.48, 352.64),  # then nothing, not even light, gets out.
 ("rec79", "light", 394.66, 396.76, {"e": 397.8}),  # That's a black hole, where gravity is unescapable.   # (CTC glued "unescapable" to the next "we": cut by hand)
 ("rec79", "pbh", 416.9, 422.58),  # We know dying stars make black holes, but the Big Bang might have made many more, enough
 ("rec79", "pbh", 428.04, 430.96),  # to be the dark matter that outweighs everything we can see.
 ("rec79", "end", 497.96, 503.88),  # If so, then it means that in the first moments of the universe, gravity dominated most of the matter,
 ("rec79", "end", 537.5, 540.04),  # and everything else that makes up that delicate equilibrium
 ("rec79", "end", 541.58, 543.42),  # is just a very few lucky survivors.
]
