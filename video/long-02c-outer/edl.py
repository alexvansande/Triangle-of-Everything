# long-02c-outer: The Outer Limit (long video 2, part two) from its own recording (rec80, 2026-11-27, "Outer limit take
# one", an iPhone voice memo sent in the chat, 14:22, used as mono), a new intro (the map, the diagonal, the dead stars,
# the upper limit) then the right of the chart as in rec76, reworded in places. The rule: the last clean try. Word times
# are the CTC pass's (scripts/narration-verbatim.py), every try its own words. Notes and fact check:
# video/sources/2026-11-27/.
# (source, beat, first-word start, last-word start, {s, e, gap, cut}) in source seconds.

SOURCES = {"rec80": "Outer limit take one.m4a"}
TREATMENT = "plain"
PAUSES = {"word": 0.7, ",": 0.7, ".": 0.7}   # (the CTC words carry no punctuation: one cap; long videos keep the author's rhythm)
GAPS = {"same": 0.5, "beat": 0.85}
ROOM = True

EDL = [
 # ── the intro: the map, its stories, the upper limit ──
 ("rec80", "map", 28.72, 32.82),  # You can make a map of every single object that has ever existed in the universe
 ("rec80", "map", 38.98, 41.26, {"gap": 0.3}),  # by plotting them in a chart of mass and size.
 ("rec80", "map", 62.34, 67.62),  # The resulting image will be a density graph, which tells you a million stories.
 ("rec80", "map", 77.48, 80.62),  # And in this series of videos, I'm telling some of them one by one.
 ("rec80", "diag", 91.50, 94.48),  # Like this density diagonal, which is about ordinary matter.
 ("rec80", "diag", 107.10, 110.38),  # Or these dense objects here, created when a star dies.
 ("rec80", "upper", 136.84, 138.74),  # Our chart is limited on the top by relativity,   # (the "upper limit of our chart" tries left out)
 ("rec80", "upper", 144.64, 146.60, {"gap": 0.4}),  # and nothing can exist above this line.   # ("and nothing can cross this line", the try before, left out)
 ("rec80", "right", 163.16, 168.54),  # Today we are moving to the right, and we're meeting the outer limit of the triangle of everything.
 # ── emptier and emptier ──
 ("rec80", "empty", 174.90, 188.92),  # As we move to more larger and massive objects, we're also in the density of emptier and emptier space. That's because the bigger something is, the less dense it is. A lot of the stars are less dense than water, and some of them are less dense than air.
 ("rec80", "empty", 203.78, 216.60),  # When a star is about to die, it grows into a red giant, its outer layers drift off into a nebula, or if it explodes, it leaves a supernova remnant, and these are often less dense than the atmosphere of the Moon.
 ("rec80", "galaxies", 218.66, 223.76),  # Larger than that, and you find globular clusters and small galaxies, and those are even less dense
 ("rec80", "galaxies", 226.68, 229.84, {"gap": 0.3}),  # because a galaxy is really mostly the empty space between the stars.   # ("because a galaxy is even" left out)
 ("rec80", "galaxies", 230.94, 232.80),  # Here we find home, that's the Milky Way,
 ("rec80", "galaxies", 236.08, 257.02, {"gap": 0.4}),  # and Andromeda, our sister galaxy. Our neighborhood of galaxies is called the Local Group. And above that, we have galaxy clusters … the largest structures we know of. Those are the superclusters, which come in the shape of filaments.
 ("rec80", "galaxies", 268.20, 272.30),  # We live in one called the Laniakea, made of about a hundred thousand galaxies.
 ("rec80", "voids", 275.36, 289.22),  # We could say there's something larger still, voids. Voids are big holes in space, empty regions. Although they're not completely empty, they're emptier than the space around them. So they do have mass, and they fit in this chart.
 # ── the rightmost limit ──
 ("rec80", "limit", 298.64, 306.60),  # Can you get bigger? Well, no, actually, because there is a rightmost limit to our chart, and it's where the expansion of the universe meets the speed of light.
 ("rec80", "limit", 317.38, 330.78),  # The thing about it is that it's not really about light. It's actually the speed limit of anything traveling through space. But space itself can stretch faster than that. And the universe is expanding, but it's not expanding into anything.
 ("rec80", "limit", 339.74, 349.86),  # A good way to think of it is increasing the resolution of a photo, where one pixel becomes four or nine or more. That means that the further away something is, the faster it's moving away from us.
 ("rec80", "limit", 352.64, 356.70),  # And at this line, called the Hubble line, things are moving away from us at the speed of light.
 ("rec80", "horizon", 362.12, 378.52),  # You'd think that it means that their light can't reach us, but well, it's a little bit more complicated, because the Hubble sphere is also growing. So the real edge is a little bit further out. This is the cosmic event horizon, and that's the actual limit, because anything that happens beyond it will never affect us.
 ("rec80", "horizon", 383.30, 389.68),  # We will never know about it. Its light can never reach us. No information can get here. It's the real limit of the unknowable.
 # ── the mass inside, on the black-hole line ──
 ("rec80", "bh", 418.02, 427.42),  # Now, if we add up everything we know exists in this bubble, it will end up on the Schwarzschild radius, the black hole line, the upper edge of our chart that I had mentioned previously.
 ("rec80", "bh", 429.12, 432.02),  # What does it mean? Does it mean that we are living inside a black hole?
 ("rec80", "bh", 437.38, 439.92),  # Well, it's an interesting coincidence, because both are on a horizon.
 ("rec80", "bh", 441.10, 444.36),  # A black hole's event horizon is where the light that falls in can never come out.
 ("rec80", "bh", 449.22, 451.92),  # In our cosmic horizon, the light outside can never come in.   # ("Our cosmic horizon is where the light that" left out)
 ("rec80", "bh", 453.44, 470.08),  # And both depend on the mass of everything that's inside. The radius of a black hole … so it's no coincidence that they both are on the same line.
 ("rec80", "alien", 472.58, 500.96),  # But that's also where the similarities end … the universe is, in practice, infinite.
 ("rec80", "alien", 506.98, 513.10),  # And we know they can see more galaxies on the other side, because, and that's the crazy bit, we can actually see them too,   # ("And how do we know…" left out)
 ("rec80", "alien", 516.12, 519.46, {"gap": 0.4}),  # or at least we just see the past version of what they used to be.
 ("rec80", "observable", 521.76, 533.66),  # Because our universe has yet another third horizon, it's the observable universe, the sum of all the light you can see, and it's the only object that falls outside our triangle of everything.
 # ── the night sky, from the Moon out ──
 ("rec80", "sky", 535.34, 540.70),  # You certainly know that when you look at the night sky, the light you see now is how stars were in the past,
 ("rec80", "sky", 542.94, 550.66, {"gap": 0.4}),  # but the sky you see is surprisingly younger than most people realize. The Moon you're looking at is merely a second ago. It's younger than this phrase.
 ("rec80", "sun", 594.14, 598.82),  # The light that the sun emitted when you started watching this video is arriving at you right now.   # (the last of the sun's tries)
 ("rec80", "sun", 660.06, 663.22),  # Some of that light will reach Mars, bounce back and come back to you.
 ("rec80", "sun", 679.96, 682.30),  # That reflected light is less than half an hour old.
 ("rec80", "sun", 683.48, 685.04),  # Jupiter, just a little bit above that.
 ("rec80", "stars", 695.56, 703.70),  # Zoom out, and we have the nearby stars. If someone in Alpha Centauri is tuning into the World Cup or the Olympics, they're watching it one whole tournament late.
 ("rec80", "stars", 705.06, 719.46),  # Most of the stars in the night sky sent their light before computers were invented. In most cases, they are older than the country you're watching this from. The light from the other side of the galaxy left when humans were first leaving Africa.
 ("rec80", "far", 722.50, 729.68),  # On a very dark night, you can see Andromeda with the naked eye. And if you do, you're looking at it how it was when all the nights were dark,
 ("rec80", "far", 732.38, 734.78, {"gap": 0.35}),  # because humans had not yet domesticated fire.
 ("rec80", "far", 736.40, 743.24),  # And here we see Laniakea, the supercluster we all live in. Any signal sent from the far side of that filament
 ("rec80", "far", 748.80, 753.28, {"gap": 0.35}),  # was sent to us when the dinosaurs were still roaming around. They never got the message.
 ("rec80", "past", 761.10, 769.00),  # And as we look further away, we are seeing the past of our very universe, before superclusters, before clusters, before galaxies were even formed.
 ("rec80", "past", 770.94, 779.34),  # And now we just crossed the cosmic event horizon, that region where space expands so fast that the light these galaxies send will never reach us anymore.
 ("rec80", "past", 786.60, 792.74),  # We can see their past, but their present and future will remain unknowable to us forever.
 # ── the observable universe, and the oldest light ──
 ("rec80", "end", 795.90, 807.20),  # And we now finally reach the observable universe, the sum of all the light we can see. And again, that's not the whole universe. There's more outside of it. It's infinite in all directions.
 ("rec80", "end", 812.94, 816.58),  # But we are limited on how much we can see of it by the age of the universe itself.
 ("rec80", "end", 819.62, 821.04),  # It's not a single object either,   # ("you can't really consider that a single object" left out)
 ("rec80", "end", 825.84, 834.64, {"gap": 0.4}),  # and that's why it falls outside our triangle, because one side does not talk to the other. So it's not really a map, but rather the history of our shared universe.
 ("rec80", "end", 837.66, 845.68),  # And finally, the furthest light we can see is a faint microwave radiation emitted 380,000 years after the Big Bang,
 ("rec80", "end", 849.72, 857.62, {"gap": 0.4}),  # just as the universe became transparent for the first time. It's light that has been traveling toward us since light could travel at all.
]
