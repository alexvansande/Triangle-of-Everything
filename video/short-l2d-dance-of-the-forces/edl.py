# short-l2d-dance-of-the-forces: the forces Short from its second recording of the day (rec78, 2026-11-23, an iPhone
# voice memo, "O2 Corporate Offices 5", 13:32, ALAC 48 kHz stereo used as mono), tighter and more energetic than rec77,
# recorded from the marked script (the doc "Dance of the Forces · Short script"), with the dark-matter ending kept inside
# 3:00 (the author: "I really want to try to include the final bit about dark matter in the 3 minute mark"). The rule:
# the last clean try. Word times are the CTC pass's (scripts/narration-verbatim.py), every try its own words. Notes and
# fact check: video/sources/2026-11-23/.
# (source, beat, first-word start, last-word start, {s, e, gap, cut}) in source seconds.

SOURCES = {"rec78": "O2 Corporate Offices 5.m4a"}
TREATMENT = "plain"
PAUSES = {"word": 0.4, ",": 0.4, ".": 0.4}   # (the CTC words carry no punctuation: one cap for every pause)
GAPS = {"same": 0.3, "beat": 0.5}
ROOM = True

EDL = [
 ("rec78", "forces", 23.76, 45.32),  # Everything in the universe is a delicate dance between four fundamental forces. At the atomic level, electrons are attracted to the protons next door, but the electron layers push back when they get too close, so atoms settle where the two balance. These are the chemical bonds that hold most things around you together, from a stick to a building, and they're all variations of the electromagnetic force.
 ("rec78", "diagonal", 57.4, 61.44),  # So if you plot objects on a chart of mass and size, they will be all around a diagonal.
 #("rec78", "diagonal", 145.52, 152.2),  # This diagonal is the density of things made of ordinary matter. It's the equilibrium point between the electromagnetic force and gravity.   # (cut for 3:00)
 #("rec78", "gravity", 178.24, 182.46),  # The chemical bonds can try to shape things, but gravity will eventually win:   # (cut for 3:00)
 ("rec78", "gravity", 185.08, 187.68),  # make something big enough, and it will crush under its own weight.
 ("rec78", "gravity", 191.98, 197.04),  # That's because unlike electromagnetism, there is no negative gravity. Everything attracts, nothing repels.
 #("rec78", "gravity", 201.72, 205.22),  # So gravity adds up, and at this point everything just looks like spheres.   # (cut for 3:00)
 ("rec78", "giants", 214.6, 241.94),  # But beyond Jupiter, planets don't get any bigger, they just get denser: the pressure in their cores beats the electrons' push, and the atoms are stripped down to loose nuclei in a sea of electrons. But if you add even more mass, a new force comes into play. The strong force, as the name implies, is the strongest of all, but it has a very limited range: it reaches no longer than a nucleus.
 ("rec78", "fusion", 252.74, 259.5),  # And heavier still, gravity squeezes the nuclei so close that the strong force captures them and makes them into one.
 ("rec78", "fusion", 262.02, 269.2),  # That releases a huge burst of energy, creating an outward pressure that finally is able to counterbalance gravity. That's fusion.
 #("rec78", "main", 278.1, 283.54),  # That energy creates a new balance, which is the main sequence, where stars spend most of their lives.   # (cut for 3:00)
 ("rec78", "main", 293.5, 296.06),  # But that equilibrium only lasts while there's hydrogen to fuse,
 ("rec78", "supernova", 319.28, 324.92),  # and once it runs out, a massive star can undergo a catastrophic core collapse called a supernova.
 ("rec78", "weak", 328.5, 334.32),  # And in that collapsing core a new player enters: it's the weak force, which decides what a nucleus even is.
 ("rec78", "weak", 335.42, 338.28),  # If you squeeze a proton and an electron hard enough, you get a neutron.
 ("rec78", "neutron", 344.02, 347.54),  # And neutrons have no charge pushing them apart, so they pack shoulder to shoulder,
 #("rec78", "neutron", 352.74, 355.72),  # and only quantum effects prevent them from being squeezed any further.   # (cut for 3:00)
 ("rec78", "neutron", 359.74, 367.34),  # The result is a neutron star, which is really one giant atomic nucleus, held together not by the strong force but by gravity alone.
 #("rec78", "escape", 440.66, 444.3),  # In order to escape the gravity of a neutron star, you need to have an orbital velocity   # (cut for 3:00)
 #("rec78", "escape", 446.32, 449.18),  # measured over a hundred thousand kilometers per second.   # (cut for 3:00)
 ("rec78", "light", 452.88, 456.82),  # But our universe does have a speed limit on everything: it's the speed of light.
 ("rec78", "light", 480.54, 486.7),  # And if a star is so massive that its escape velocity is higher than it, then nothing, not even light, will escape,
 ("rec78", "light", 489.4, 492.76),  # and you create one of the strangest objects in the universe: a black hole.
 #("rec78", "pbh", 538.84, 541.88),  # All the black holes we know of have been formed by dying stars,   # (cut for 3:00)
 ("rec78", "pbh", 631.02, 635.06),  # but it's possible that there is another type that went completely undetected so far.
 ("rec78", "pbh", 651.2, 657.38),  # Primordial black holes are smaller black holes that could have been created in the very early moments of the Big Bang.
 #("rec78", "pbh", 670.14, 674.42),  # And if they're out there, they would be something like the mass of an asteroid compressed to the size of a virus.   # (cut for 3:00)
 ("rec78", "pbh", 675.8, 680.52),  # They wouldn't emit any light, and they would be very hard to detect, except for their effects on gravity,
 ("rec78", "pbh", 688.28, 691.94),  # which is why scientists are curious about them: they could explain dark matter.
 ("rec78", "end", 733.96, 736.5),  # We found none so far, but I find it fascinating to think
 ("rec78", "end", 737.72, 741.36),  # that maybe the only reason that we see that delicate balance at all
 ("rec78", "end", 742.4, 749.98),  # is that in the early moments of the universe, gravity dominated everything, turning most of the matter in the universe into black holes,
 ("rec78", "end", 802.28, 807.88),  # and everything else, the ordinary matter that makes up the galaxies and ourselves, are just the lucky few survivors.
]
