# Recordings, 2026-11-27

## rec80: "Outer limit take one.m4a" (The Outer Limit, long video 2 part two)

An iPhone voice memo sent in the chat, AAC 48 kHz stereo (used as mono), 14:22, the whole of part two read again with
a new intro: the map of every object, its million stories, the density diagonal, the dead stars, the chart's upper
limit, then "today we are moving to the right" into the right of the chart as in rec76 (the nebulae to the oldest
light), reworded in places (the Sun's light now "emitted when you started watching this video", the reflected light
from Mars; the black-hole line "the upper edge of our chart that I had mentioned previously"). Words:
`rec80.ctc.json` (the CTC pass, every try) and `rec80.words.json` (Whisper on the raw take).

The edit: `video/long-02c-outer/edl.py`, 54 clips, the last clean try of each line, **7:30** after `enhance.py
--plain`, pauses capped at 0.7 s, gaps 0.5 / 0.85 s with the room's own tone (the long videos keep the author's
rhythm). Cut by hand:
- the intro: "The upper limit of our chart" (two tries) gives way to "Our chart is limited on the top by relativity";
  of "and nothing can cross this line / and nothing can exist above this line" the second (the try that stuck).
- "When a star is about to die…" from the second try (the first stops at "and these…").
- "because a galaxy is even," dropped; "Here we find home, that's the Milky Way" + "and Andromeda, our sister galaxy"
  (its second try).
- "Can you get any bigger than that? Well…" → the later "Can you get bigger? Well, no, actually, …".
- "The thing about the speed of light is that it's not really about light. It's a speed limit." → the last try, "The
  thing about it is that it's not really about light. It's actually the speed limit of anything traveling through
  space."
- "A better metaphor is squeezing the resolution" → "A good way to think of it is increasing the resolution of a photo".
- "the other edge, the upper edge of our chart, that I mentioned before" → the full retake, "…the black hole line, the
  upper edge of our chart that I had mentioned previously".
- "Our cosmic horizon is where the light that" → "In our cosmic horizon, the light outside can never come in."
- "And how do we know we can see more galaxies…" → "And we know they can see more galaxies on the other side, …".
- The Sun and the planets (9:34 to 11:25 of the take, many tries): "The light that the sun emitted when you started
  watching this video is arriving at you right now." + "Some of that light will reach Mars, bounce back and come back to
  you." + "That reflected light is less than half an hour old." + "Jupiter, just a little bit above that." The earlier
  "The light from Mars and the inner planets is less than half an hour old" is left out (the reflected-light version
  replaces it).
- "because humans had not" (cut off) → its second try; "was sent to us when the dinosaur was stew" → the next try.
- "We can see their past but their present and future will remain unknowable to us" → the try ending "forever".
- "you can't really consider that a single object" dropped after "It's not a single object either".
- "Just as the universe become" → "just as the universe became transparent…".
The CTC check on the edit finds no try left twice (only CTC spellings: "short" for chart, "mic ray", the number spelt
out).

Captions: Whisper's mishearings fixed in the take's words.json (an eyeball → a nebula, a Milky Way → the Milky Way, "An
Andromeda, or sister galaxy, or neighborhood" → "and Andromeda, our sister galaxy. Our neighborhood", "in OAuth" → "we
know of", Supper Clusters, "short" → chart, "short side radius" → Schwarzschild radius, "can ever come out/in" → never,
"see them through" → too, "send … are invented" → sent … were, "galaxy sands" → galaxies send).

### Fact check
Right:
- A map of every object by mass and size is a density chart; the diagonal is the density of ordinary matter (atoms);
  the dense objects left when stars die (white dwarfs, neutron stars); the top edge is the Schwarzschild (black-hole)
  line, from general relativity, and nothing can sit above it.
- The bigger, the emptier along the right of the chart: many stars less dense than water, giants thinner than air;
  a planetary nebula (100 to 10,000 particles per cm³) and a supernova remnant (about 1) thinner than the Moon's
  exosphere (about 100,000); galaxies mostly empty space; the Local Group; clusters; superclusters as filaments;
  Laniakea's 100,000 galaxies; voids emptier than around them but not empty.
- The rightmost limit where the expansion meets the speed of light (the Hubble radius, 14.4 billion light-years); the
  speed of light as a limit through space, space itself stretching faster; expanding into nothing; the photo's
  resolution as a picture of it; recession speed growing with distance; the Hubble line at c; the Hubble sphere
  growing so the cosmic event horizon lies further out (about 16.7 billion light-years) and nothing beyond it can ever
  affect us.
- The mass inside the Hubble sphere lands on the black-hole line (at the critical density, 2GM/c² = c/H); both are
  horizons, one keeps light in and one keeps it out, both set by what's inside; the black hole has a centre and our
  universe doesn't; an alien at our edge sees galaxies beyond it, and we see the past of those; the observable
  universe as a third horizon (the particle horizon), outside the triangle because its far sides never talked.
- The light times: the Moon 1.3 s; Mars's reflected light under half an hour (up to 22 minutes from Mars to us);
  Jupiter a little more (33 to 54 minutes); Alpha Centauri 4.4 years (one World Cup or Olympics cycle); most naked-eye
  stars before computers (over about 80 light-years); the galaxy's far side about 75,000 years (humans leaving Africa,
  50,000 to 70,000 years ago); Andromeda 2.5 million years (fire domesticated about a million years ago); the oldest
  light, the microwave background, 380,000 years after the Big Bang, as the universe turned transparent.

Wrong (with the fix):
- **"The light that the sun emitted when you started watching this video is arriving at you right now"** (rec80 9:54;
  in the cut at **5:09**). Sunlight takes 8 minutes 20 seconds, so at 5:09 the light arriving left the Sun about three
  minutes *before* the viewer pressed play; the light emitted at 0:00 arrives at about 8:20, after the video ends
  (7:33). Suggested re-wording: *"The sunlight reaching you right now left the Sun about eight minutes ago, a few
  minutes before you started watching this video."* Kept in this draft as said.

Imprecise:
- "That reflected light is less than half an hour old": from Mars to us it's 3 to 22 minutes, fine; counted from when
  it left the Sun (the line before talks of "that light"), it can be up to about 35 minutes.
- "In most cases, they are older than the country you're watching this from" (rec76 said "in some cases"): depends on
  the country; for a country 200 to 250 years old, most naked-eye stars are farther than that, but many of the bright
  ones aren't. *"In many cases…"*
- "Any signal sent from the far side of that filament was sent to us when the dinosaurs were still roaming around"
  (as in rec76): Laniakea's far side is about 400 million light-years, before the dinosaurs (230 to 66 million years
  ago); its heart, the Great Attractor (250 million), is when the first ones appeared. *"Any signal sent from its heart
  was sent when the first dinosaurs were roaming around."*
- "the size of our Hubble sphere depends on how fast the universe expands, which also depends on how much stuff is in
  it": and on dark energy, which isn't stuff in the usual sense; fine at this level.
- "Our chart is limited on the top by relativity": by general relativity's black holes in particular; fine.
- "superclusters … the largest structures we know of" then "something larger still, voids": voids are bigger but not
  structures; fine (as rec76).
- "It's infinite in all directions": as far as we can tell (said earlier as "in practice infinite").
- Slips in words, kept: "more larger and massive objects"; "their universe is centre around them"; "the dinosaurs
  was still"; "yet another third horizon"; "The moon you're looking at is merely a second ago" (a second old).
