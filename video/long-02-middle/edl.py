# long-02-middle: the middle of long video 2 (space), from the author's second take of 2026-11-05: the truce and
# how it breaks, the star cycle and the dead cores, the black holes whole (the plant, the re-recorded search line),
# dark matter and the lucky few survivors, the turn, bigger means emptier up to the voids, the second edge and the
# cosmic event horizon. It follows long-02-intro (rec54) in the cut, video/cuts/long-02-space.json, and the old
# video 5 take (rec50, short-05-hubble-sphere) still carries "Now add up everything…" to the end, not re-recorded.
# rec55 = "Long 2 take 2.m4a" (Google Drive "Recordings", 2026-11-05, 17:29, ALAC 48 kHz stereo, used as mono):
# one take with retakes after a mic test and a note to the editor (0:00–0:25); the first two minutes repeat the
# brown dwarfs to the cap on the heaviest stars as a warm-up (the author: "the first two minutes should always be
# counted as a rough draft"), left out: rec54 has them. The author's rule: the last try unless it slips.
# Also in the take, as notes to the editor: "No, I don't like the new player. I'm not doing the scoreboard for
# this. Let's stop suggesting that" (14:51; the dark-energy passage was not recorded) and "I'm not sure I like
# that phrase" after "Whatever dark matter is, this is where it's doing the holding" (13:52; the phrase is left
# out). Whisper word timings and the review notes: video/sources/2026-11-05/.
# Treatment: enhance.py --plain, natural speed. Build: see video/short-01-hook/README.md.
# (source, beat, first-word start, last-word start, {s, e, gap, cut}) in source seconds; the builder snaps each
# cut to the nearest real silence and caps the pauses inside a clip (PAUSES).

SOURCES = {"rec55": "Long 2 take 2.m4a"}
TREATMENT = "plain"
PAUSES = {"word": 0.18, ",": 0.3, ".": 0.45}

EDL = [
 # the truce, and how it breaks
 ("rec55", "truce", 163.17, 170.25),       # That new truce between the two forces, one pushing it to the left and the other to the right, will last a few billion years,   (after the last of five tries at "so no star we know of can be beyond about 200 solar masses", not used: rec54 ends the cap)
 ("rec55", "death", 173.01, 200.13),       # but that draw is broken when the fuel runs out. Once there's no more hydrogen, or sometimes helium, to burn, then a new dance begins, where the star starts to rapidly collapse. But now that collapse creates even more heavier elements, which will create a new outer pressure, and it will expand again, and then collapse, until all that is left is a core made mostly of iron and other heavy metals.
 ("rec55", "death", 203.15, 216.79),       # Those elements don't produce energy when they undergo fusion. Quite the contrary, they steal it, so the star enters in a catastrophic core collapse, which now separates it in two distinct objects in our chart.   ("Those metals," before it left out)
 ("rec55", "cycle", 218.81, 250.11),       # The outer layers will keep expanding with the leftover energy from the last battle and become supernova remnants, or nebulas. These will eventually meet others and merge into a larger cloud of dust called a stellar nursery, which eventually will collapse back into a protostar and start a new cycle. But this time, the next generation will start with some richer materials that could lead to a planet full of life, like ours.
 # the cores
 ("rec55", "core", 253.71, 286.75),        # The core, however, stays behind. If the star isn't massive enough to go supernova, it will remain as a white dwarf, a core of carbon and oxygen. If it does go supernova, then its core collapse will be so powerful that its gravity will win once again. Protons and electrons will be squeezed into a mass of pure neutrons: a neutron star. They will sit at the exact density line of the neutron.   (the pauses before "of carbon" and "squeezed" capped)
 ("rec55", "core", 290.39, 296.25, {"s": 289.60}),        # And if they get any bigger, then something even weirder will happen: it will collapse into a black hole.
 ("rec55", "core-short", 300.23, 303.33, {"s": 299.50}),  # An object so weird that it deserves its own video.   (Short only, as the author says on the take: the long cut skips it, video/cuts/long-02-space.json)
 # black holes
 ("rec55", "bh", 308.19, 315.95, {"s": 307.45}),  # Now, most objects on our chart are a bunch of little dots, but black holes are not. They all sit exactly on the line called the Schwarzschild radius.   ("That's only for the short" before it left out; Whisper puts "Now" early, so its start is given)
 ("rec55", "bh", 320.15, 323.85, {"s": 319.90}),  # It's a very important line, because it's the top left edge of our triangle.   (the retake, from its "it's": the first "and it's a very important line" and the retake's "And" left out; its start given, the words run on)
 ("rec55", "bh", 325.33, 338.51),          # Any object that becomes too small for its mass collapses into a black hole, and every black hole lives exactly on this line, meaning that there's no object that could ever exist above or to the left of it.
 ("rec55", "plant", 342.01, 343.81),       # Now, remember this line. It will be important.   (the first try; "Remember this line, … and it comes back later" after it breaks up)
 ("rec55", "size", 356.05, 367.53),        # A black hole doesn't really have a size. It's thought to be a singularity, a point. But it does have an event horizon, the distance from which nothing can escape, and that grows in step with its mass.   (the "so" before it, 2.4 s earlier, left out)
 ("rec55", "size", 378.05, 382.67, {"s": 380.30}),        # That's why the edge is a straight 45-degree line.   (the retake; the first try runs on into a broken "Squeeze the Sun")
 ("rec55", "size", 384.29, 390.05),        # Squeeze the Sun into a black hole and it will be about 6 km wide, and the Earth would be the size of a marble.
 ("rec55", "known", 393.25, 408.19),       # The black holes we know of form in the collapsing core of dying stars, or grow by swallowing gas and merging with other black holes. They go from a few Suns to billions of stars. The one in the centre of our Milky Way, for example, has 4 million solar masses.
 ("rec55", "known", 409.61, 423.97),       # And here's the strange part: the bigger they get, the less dense they are. The really supermassive ones are less dense than water. They would float, if you had a pool big enough. Like M87, the first black hole ever to be photographed,
 ("rec55", "known", 425.03, 427.71),       # or TON 618, one of the largest we know of.
 ("rec55", "known", 429.09, 432.45),       # Its event horizon is bigger than Pluto's orbit.
 ("rec55", "small", 435.77, 442.49, {"s": 438.60}),       # But the most interesting question isn't how big a black hole can be, but how small.
 ("rec55", "small", 443.53, 484.37, {"s": 446.00}),       # With enough pressure, anything can become a black hole. We can't create one in the lab, but we know two places where that condition exists. The first one, as I said, is the core of a dying star. But the second was the very first instants after the Big Bang, when everything was a super hot and dense soup. But some of that soup could have collapsed into black holes of every size, and some of this might just be around.
 ("rec55", "search", 489.03, 495.97),      # And we've been looking for them: with quasars and the cosmic microwave background, with gravitational waves, and finally with microlensing.   (the second try; the first breaks off after "for them,")
 ("rec55", "search", 498.11, 505.11, {"s": 500.80}),  # And every search so far came up empty, and the window where they could hide keeps closing.   (its start given: the false start "And every search has come–" before it, which Whisper merged into the words)
 ("rec55", "search", 506.39, 511.85),      # They can't be too small either, or they would have evaporated by now, through a process we call Hawking radiation.
 ("rec55", "search", 513.93, 536.41, {"cut": [(519.45, 524.52)]}),  # What's left is a narrow window: something the size of a virus with the mass of a small moon, or a whole asteroid's mass squeezed into something smaller than an atom. And if they're out there, they would be invisible. No light, nothing a telescope could see. We only notice their gravity.   (the restart "or a whole asteroid's mass squeezing to something," cut from inside it)
 # dark matter
 ("rec55", "dm", 537.99, 545.41),          # But that's the thing: we do see that gravity. When we weigh galaxies, they are much heavier than everything we can see in them.
 ("rec55", "dm", 546.33, 548.11),          # Five, sometimes ten times heavier.
 ("rec55", "dm", 551.69, 556.35),          # So most of the matter in the universe is something invisible, which of course we call dark matter.   ("So most of the dark," before it left out)
 ("rec55", "dm", 560.35, 591.35),          # We don't know what it is, but if it's just tiny black holes, that's interesting, because it wouldn't need any new particle to explain it. Or, of course, maybe it's something else entirely. Maybe it's not a thing at all, and we just got gravity wrong. But if it's something real, it's somewhere on this chart, and people have been looking for it. Not only on the black hole line, oh no: someone worked out that if dark matter came in lumps about roughly this size, it'd leave tracks in the crystals of ancient rocks.   (the second "We don't know what it is"; the first breaks off at "but if it's")
 ("rec55", "dm", 596.39, 597.31),          # So they looked at the rocks: nothing.   (the third try)
 ("rec55", "dm", 609.41, 616.51, {"s": 609.00}),  # Another team realized that it can't be here either, otherwise people's heads would just randomly explode, as if shot by a cosmic bullet.   (the fourth try; the repeat of "as if shot by a cosmic bullet" after it left out)
 ("rec55", "dm", 632.89, 637.11),          # They even looked at death records to make sure that it wasn't happening.   (new, the last of four tries; "Yes, it's not" after it left out)
 ("rec55", "dm", 644.23, 645.59),          # So we crossed out this area.
 ("rec55", "dm", 646.69, 652.77, {"e": 654.2}),  # The search for dark matter is really a lot of scientists scratching off areas of this map, one by one.   (the false start "But I still find it fascinating that just maybe in the first very…" after it left out)
 ("rec55", "survivors", 659.93, 675.93),   # But I still find it fascinating that maybe, in the first very moments of our history, most of the matter that existed just collapsed into black holes. And we, everything else, the galaxies, the stars, everything we know, are just the lucky few survivors.   (the first try, whole: the second restarts three times inside, the clip check of 2026-11-05)
 #   # But I still find it fascinating that maybe, just maybe, in the very first moments of our history, most of the matter that existed collapsed into black holes.   (the second try; its 8 s pause after "maybe," capped)
 # ("rec55", "survivors", 669.05, 675.93),   # (folded into the first try above)   # And we, everything else, the galaxies, the stars, everything we know, are just the lucky few survivors.   (the first try: the second's ending restarts four times)
 # the turn
 ("rec55", "turn", 726.01, 734.19),        # So that's the first edge of the triangle, and what lives on it. Now let's turn around and go the other way, to the right, to the biggest things there are.
 # bigger means emptier
 ("rec55", "emptier", 755.45, 757.57),     # Every diagonal on this chart represents density.   (the retake; the first try had "on this line")
 ("rec55", "emptier", 758.77, 761.39),     # We saw that the neutron stars have the density of neutrons.
 ("rec55", "emptier", 767.23, 774.69),     # White dwarfs and super-Jupiters have the density of degenerate matter. Most of the stuff has the density of atoms.   (new)
 ("rec55", "emptier", 779.11, 786.47, {"s": 782.90}),     # And even some supermassive black holes are less dense than water itself.
 ("rec55", "emptier", 794.09, 796.83),     # The further right we go, the emptier things get.   (the retake; the first breaks off at "because the bigger something is,")
 ("rec55", "emptier", 798.33, 803.41),     # A galaxy is mostly the empty space between its stars.
 ("rec55", "emptier", 805.07, 808.53),     # Here, our own galaxy, the Milky Way, and its sister, Andromeda.
 ("rec55", "emptier", 809.61, 812.05),     # We live in a small group of galaxies called the Local Group.
 ("rec55", "emptier", 813.63, 819.97),     # And these are the galaxies we weighed a minute ago: five to ten times heavier than everything we can see in them.   ("Whatever dark matter is, this is where it's doing the holding" left out: the author, on the take, "I'm not sure I like that phrase")
 ("rec55", "emptier", 841.25, 849.23, {"s": 840.45}),  # Galaxy clusters are even less dense, because now it's the galaxies plus all the empty space between them. But gravity still holds them together.   (its start given: "galaxy" is spoken from 840.65, which Whisper merged with the aside before it)
 ("rec55", "emptier", 855.01, 868.09, {"cut": [(864.58, 866.30)]}),  # And above them are the largest structures we know of: superclusters, which come in the shape of filaments. We live in one called Laniakea, made of about a hundred thousand galaxies.   (the second try; the stumble "made about," cut from inside it)
 ("rec55", "voids", 903.67, 915.89),       # Yet there is still something larger: voids. Voids are just empty regions of space. Not completely empty, just emptier than the space around them, so they do have mass, and they fit in this chart.   (the whole try; the two broken ones before it left out)
 # the second edge
 ("rec55", "edge", 923.27, 929.15),        # But can anything be bigger than that? Try to go any bigger, and you reach the second edge: the Hubble sphere.
 ("rec55", "edge", 930.31, 947.95),        # The speed of light isn't really about light. It's the speed limit for anything travelling through space. But space itself can stretch faster than that. The universe is expanding, not like a ball blowing up into something. It's more as if there's just more space being created all the time, everywhere.
 ("rec55", "edge", 950.95, 956.43),        # It's like raising the resolution of a photo. You take one pixel and turn it into four, or five, or ten.   (the second try)
 ("rec55", "edge", 957.85, 969.87),        # That means the further away something is, the faster it's moving away from us. And at the Hubble line, things are moving away from us at the speed of light.
 ("rec55", "edge", 971.99, 975.97),        # That line is roughly 14 billion light-years away, in every direction.
 ("rec55", "horizon", 977.77, 986.99, {"e": 987.6}),  # You'd think their light could never reach us, but it's a little bit more complicated than that. The Hubble sphere is also growing, so light from just beyond can still, eventually, get here.   (the first of four tries, the only whole one: the last stumbles, "let's call it is a little bit more complicated"; its "It's," after it left out)
 ("rec55", "horizon", 1019.63, 1035.73),   # The real edge is a little further out. That's the cosmic event horizon. Nothing that happens beyond it can ever affect us. We'll never see it, because the light will never reach us. No information, no matter, nothing. It's the limit of the unknowable.
]

# The restarts the clip-by-clip pass missed, found by sweeping the finished long video in 10 s windows (2026-11-05):
# edit seconds in this take's audio.m4a, after the pause trim, so they apply to that finished file
# (video/tools/postcut.py): rebuilding from the raw recording means finding them again.
POST_CUTS = [
 (56.17, 59.84),   # "These will eventually meet others and merge into a l–"
 (78.70, 80.70),   # "The core, however, sa–"
 (87.53, 88.37),   # "a car,"
 (97.17, 98.91),   # "Protons and electrons,"
 (223.57, 231.61),   # "But the second was the very first instants after the Big Bang, when everything was a super da– But the very–"
 (394.21, 396.49),   # "A galaxy, a galaxy,"
 (481.21, 484.91),   # "And at the Hubble line, things are moving away from us at this–"
]
