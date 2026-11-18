# long-02b-right: long video 2 (space) from the nebulae to the microwave background, the right of the chart, from the
# author's second take of the new script (rec76, 2026-11-18, part two of the session; part one, rec75, is
# long-02b-opening): the nebulae and remnants to the right, emptier and emptier space, galaxies, the Local Group,
# clusters, Laniakea and voids; the rightmost limit, the speed of light against the expansion, the Hubble line and the
# cosmic event horizon; the mass inside landing on the black-hole line; living inside a black hole?; the observable
# universe, the light's ages from the Moon to Laniakea, the event horizon crossed, and the furthest light.
# rec76 = "Space dance take 2 part 2.m4a" (Google Drive "Recordings", 2026-11-18, 18:31, ALAC 48 kHz stereo, used as
# mono). The last try unless it slips. Left out until re-recorded (the fact check, video/sources/2026-11-18/NOTES.md):
# "the cosmic event horizon falls exactly on the top left vertice of our triangle" (it's the top-right corner) and
# "the sunlight reaching you right now started its journey when you started watching this video" (8 minutes; the line
# plays half an hour into the long video). Treatment: enhance.py --plain, natural speed.
# (source, beat, first-word start, last-word start, {s, e, gap, cut}) in source seconds.

SOURCES = {"rec76": "Space dance take 2 part 2.m4a"}
TREATMENT = "plain"
PAUSES = {"word": 0.25, ",": 0.55, ".": 1.0}
GAPS = {"same": 0.55, "beat": 1.1}
ROOM = True

EDL = [
 ("rec76", "nebulae", 57.88, 67.54),  # Remember the supernova remnants on the nebulas that were left behind when the stars died?
 ("rec76", "nebulae", 97.54, 99.74),  # They're all for the right on our map.
 ("rec76", "nebulae", 100.0, 101.06),  # So let's explore that area.
 ("rec76", "emptier", 106.48, 108.98),  # notice how we move to more larger and massive objects.
 ("rec76", "emptier", 114.2, 116.7),  # We're also in the density of emptier and emptier space.
 ("rec76", "emptier", 117.56, 120.46),  # That's because the bigger something is, the less dense it is.
 ("rec76", "emptier", 121.18, 125.68),  # A lot of the stars are less dense than water, and some are even less dense than air.
 ("rec76", "emptier", 126.9, 134.1),  # When a star is about to die, it grows into a red giant, its outer layers drift off into a nebula, or if it explodes a supernova.   (the first try: the retake, 2:29, goes from the red giant straight to "these are often less dense than the atmosphere of the Moon", which is wrong for a red giant and right for the nebula)
 ("rec76", "emptier", 156.16, 159.76),  # And these are often less dense than the atmosphere of the moon.
 ("rec76", "galaxies", 166.67, 175.34),  # Larger than that, and you'll find globular clusters and small galaxies, and those are even less dense because a galaxy is really mostly the empty space between the stars.
 ("rec76", "galaxies", 176.58, 183.44),  # Here we find home, that's the Milky Way, an Andromeda or sister galaxy, or a neighborhood of galaxies, it's called the local group.
 ("rec76", "galaxies", 184.78, 193.14),  # And above that, we have galaxy clusters, which are even less dense because now it's the galaxies plus the empty space between them.
 ("rec76", "galaxies", 194.04, 205.36),  # And then above that, we have the largest structure we know of. Those are the super clusters, which come in the shape of filaments. We live in one called the Laniakea, made of about 100,000 galaxies.
 ("rec76", "galaxies", 206.78, 220.64),  # And there are something larger still, voids. void there's big holes in space, just empty regions. Not completely empty though, they're just emptier than the space around them. So they do have mass and they fit in this chart.
 ("rec76", "edge", 222.32, 227.02),  # Can you get any bigger? Well, no, because there is a right most limit in our chart.
 ("rec76", "edge", 229.98, 232.82),  # and it's where the expansion of the universe meets the speed of light.
 ("rec76", "hubble", 244.1, 263.92),  # See, here's the speed of light again. And the thing about it, it's not really about light. It's the speed of limit of anything traveling through space. But space itself can stretch faster than that. And the universe is expanding, but it's not expanding into anything. A better metaphor is increasing the resolution of a photo, where one pixel
 ("rec76", "hubble", 264.26, 267.44),  # where one pixel becomes four, or nine, or more.
 ("rec76", "hubble", 268.16, 302.82),  # That means that the further away something is, the faster it's moving away from us. And at this line, called the Hubble line, things are moving away from us at the speed of light. You'd think that their light could never reach us, but well, it's a little bit more complicated than that because the Hubble sphere is also growing, so the real edge is a little bit further out. This is the cosmic event horizon, and it's the actual limit, because anything that happens beyond it will never affect us. We will never know about it, its light can never reach us, no information can get here. It's the real limit of the unknowable.
 ("rec76", "bubble", 397.72, 401.24),  # now if we add up everything we know exists inside this bubble,
 ("rec76", "bubble", 408.68, 410.5),  # It will end up on the Schwarzschild radius.
 ("rec76", "bubble", 411.5, 415.2),  # The black hole line, the other edge of our chart that we just saw recently.
 ("rec76", "bubble", 434.36, 438.1),  # What does it mean? Does it mean that we are living inside a black hole?
 ("rec76", "bubble", 439.02, 507.7),  # Well, it is an interesting coincidence because both are an horizon. one, a black hole's event horizon is where the light that falls in can never come out, or a cosmic horizon is where the light that is outside can never come in, and also both depend on the mass of what's inside. The radius of a black hole depends directly on how much stuff is in it, and the size of the Hubble sphere depends on how fast the universe expands, which depends on how much stuff is in it too, so it's no coincidence that they both are on the same line. But that's also where the similarities end, because the black hole is an object with a definite center. Our universe is just that, it's our universe, it's not the universe. Imagine for a moment an alien living in a galaxy that for us seems to be right at the edge. Well, for them, their universe the center around them, they don't see a bunch of empty space on the other side, they see more and more galaxies because as far as we can tell, the universe is in practice infinite.
 ("rec76", "bubble", 514.94, 524.04),  # And how do we know we can see more galaxies on the other side? Because, and that's the crazy bit, we can actually see them too, or at least we just see the past version of them.
 ("rec76", "observable", 595.93, 608.59),  # Our universe has yet another third horizon. It's the observable universe, the sum of all the light we can see. And it's the only object that falls outside our triangle.
 ("rec76", "light", 611.61, 626.11),  # You certainly know that when you look at the night sky, the light you see now is how stars were in the past. But the sky you see is surprisingly younger than most people realize. The moon you're looking at is merely a second ago. It's younger than this phrase.
 ("rec76", "light", 695.23, 699.13),  # the light from morse on the inner planet is less than a half an hour old
 ("rec76", "light", 703.63, 705.67),  # And Jupiter is just slightly above that.
 ("rec76", "light", 706.69, 708.05),  # And here we have the nearby stars.
 ("rec76", "light", 717.37, 720.85),  # If someone in Alpha Centauri is turning into the World Cup or the Olympics,
 ("rec76", "light", 723.55, 725.69),  # then they're watching it one whole tournament late.
 ("rec76", "light", 726.79, 734.83),  # Most of the stars in the night sky sent their light way before computers were invented. In some cases, they're older than the country you're watching this from.
 ("rec76", "light", 758.37, 763.53),  # the light from the other side of the galaxy left when humans were first leaving Africa.
 ("rec76", "light", 811.65, 814.51),  # On a very dark night, you can see Andromeda with the naked eye.
 ("rec76", "light", 849.63, 855.99),  # And if you do, you're looking at it how it was when all the nights were dark
 ("rec76", "light", 870.09, 873.05),  # Because humans had not yet domesticated fire.
 ("rec76", "light", 921.59, 925.11),  # And here we see Laniakea, the supercluster we live in.
 ("rec76", "light", 926.41, 934.73),  # Any signal sent from the far side of that filament was sent to us when the dinosaurs were still roaming around. They never got the message.
 ("rec76", "past", 950.61, 958.99),  # And as we look further away, we are seeing the past of our very universe before superclusters, before clusters, before galaxies were formed.
 ("rec76", "past", 988.37, 998.75),  # And now we just crossed the cosmic event horizon. That region where space expands so fast that the light these galaxies send will never reach us anymore.
 ("rec76", "past", 1009.57, 1013.95),  # Their present and their future will remain unknowable to us forever.
 ("rec76", "past", 1020.51, 1026.63),  # But we can still see their past, our past.
 ("rec76", "observable", 1034.37, 1040.29),  # We now finally reach the observable universe, the sum of all the light we can see.
 ("rec76", "observable", 1055.99, 1060.79),  # Again, it's not the whole universe. There's more outside of it. It's infinite in all directions.
 ("rec76", "observable", 1065.61, 1068.49),  # But we are limited on how much we can ever see of it.
 ("rec76", "observable", 1069.31, 1075.77),  # And it's not a single object either. That's why it falls outside our triangle, because one side does not talk to the other.
 ("rec76", "observable", 1084.97, 1088.55),  # So it's not really a map, but rather the history of our shared universe.
 ("rec76", "observable", 1091.11, 1107.51),  # And finally, the furthest light we can see is a faint microwave radiation emitted 380 ,000 years after the Big Bang, just as the universe became transparent for the first time. is light that has been traveling toward us since light could travel at all.
]
