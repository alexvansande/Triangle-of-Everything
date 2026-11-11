# Recordings, 2026-11-11

The Whisper word timings (medium.en, `scripts/narration-take.py`'s settings, a filler-friendly prompt) are
`rec66.words.json`. One stretch is hand-spliced: Whisper merged two back-to-back tries of "Larger than that, and you'll
find globular clusters and small galaxies" (128.4–134.3 s) into one sentence, so the second try's words (131.4–134.3)
come from a transcription of that clip alone (small.en) and the first try's "and" ends at 131.1.

## rec66: "5A morning take.m4a" (video 5, part 1, The Largest Structures in Space, re-recorded whole)

Uploaded to the session 2026-11-11 11:48 UTC; recorded at 08:39 local (11:39 UTC), ALAC 48 kHz stereo (used as mono),
7:45, −26.3 LUFS, peak −1.5 dBFS, no clipping. The first of the re-recordings asked for in `recording-scripts.md`
("5a, 5b, 5c · Re-record each part whole", 2026-11-10): the author, at the start (0:00–0:33): *"we are going to record
all five, the new takes of the five short videos. I want some energy, not too much. This is morning, so this is my
morning voice."* Then 5a read through in one sitting (0:35–4:40) with retakes, and from 4:37 to 7:41 the ending tried
twelve ways. The whole take is one voice, so nothing from rec62 or rec65 is left in the cut.

| Video | Take | Plays | Made from |
|---|---|---|---|
| The Largest Structures in Space | `short-05a-emptier` | 2:04 of voice, 2:07 with the credits (was 2:10 + credits from rec62/rec65) | `video/short-05a-emptier/edl.py`, 18 clips, all rec66; scene `src/narration-scenes/short-05a-emptier.js` |

Natural speed, `enhance.py --plain` (−17.0 LUFS after the breaths are out, peak −1.4 dBFS), the speaker's own pauses
(caps 0.25 s after a word, 0.55 after a comma, 1.0 after a sentence; 0.55 s between clips, 1.1 between beats, the
take's room tone in the gaps), the breaths in the pauses replaced by room tone (`debreath.py --min 0.03`: 25).
No music, as before (`sound: []`); the mix is the voice.

### What changed in the words (against the script in `recording-scripts.md`)
- **A new ending.** The script ended "…because now we are going to meet our second edge in the triangle of everything."
  The author, after saying it (4:50): *"Did I ever mention the triangle of everything? Never mentioned, yeah."* The video
  never names the triangle, so the ending was re-written on the spot and tried twelve ways (4:37–7:41): "the rightmost
  edge in our chart", "it's all about the speed of light", "…and the expansion of the universe" (*"Oh, I like that"*,
  6:42), "there is a rightmost limit in our chart". The cut takes the last: *"Can you get any bigger? Well, no, because
  there is a rightmost limit in our chart, and it's where the expansion of the universe meets the speed of light."*
- **A new line on the galaxies' density**, between "small galaxies" and the Milky Way: *"…and those are even less dense,
  because a galaxy is really mostly the empty space between the stars."* (said six ways, 2:17–2:54; the last used).
- **"Here we find home"**: the script's "Here we find Andromeda, our sister galaxy, and the Milky Way, which we call
  home. Our local neighbourhood is called the Local Group" became, after a try at the old line and *"What if I just said
  our neighborhood of galaxies is called the Local Group. Yeah, I prefer that"* (3:06), *"Here we find home: that's the
  Milky Way, and Andromeda, our sister galaxy. Our neighborhood of galaxies is called the Local Group."*
- Small: "A lot of stars" for "Lots of stars"; "I wanna explore"; "Larger than that, and you'll find" (the "and" the
  script had dropped is back, said every time); "the Laniakea" (the article is back too; not cut out: one short word
  mid-phrase); "they fit in this chart"; "just empty regions" ("of space" dropped); "Not completely empty, though:
  they're just emptier…".

### Takes chosen
The last try everywhere, except: "And there's something larger still: voids" is the first (4:12), because the retake
(4:15) stumbles ("void are big holes, there's still something larger, voids, voids are big holes…") and the cut joins
it from its third "voids" (4:21). "Larger than that…": its fourth start (2:11), the complete one (twice before it
stopped at "clusters and", and Whisper had merged the third and fourth: see the top). "Here we find home": from its
second "here we find home" (3:26; the first is a restart). "Today, I wanna explore…": the first (0:53): the second (1:06) has a quiet
"today" said again before "I" (the second pass found it; after the first the author only checked the direction, *"to
the right? Yeah, to the right, left, right, yeah"*, and the line itself is clean). "Taken as a whole": the first (1:43):
the second (1:48) restarts, "Taken as a, taken as a whole". "Can you get any bigger?": the last of its tries (7:25), then "Well, no, because there is a rightmost
limit…" (7:32), the restart between them ("because there is an edge, there is a limit") out.

### The second pass
Every clip of the edit transcribed on its own with a filler-friendly prompt (small.en), after each build (the author's
reminder, 2026-11-11: "once you do the first edit check again for missing false starts and noises"). The first pass
found two restarts the whole-file transcription had smoothed over: "Today, today I want to explore" (a quiet second
"today" before "I" in the 1:06 try: the cut now takes the first try, 0:53, which reads clean) and "Taken as a, taken as
a whole" (the 1:48 try: the cut now takes the first, 1:43). The second run reads clean, clip for clip. The voice is
2:04 (was 2:06 before the two were swapped).

### Left out
- The mic test and the notes to self (0:00–0:33, 1:01–1:05, 3:54 "Okay, I lost again, back", 4:50 "Did I ever
  mention…").
- "Lots of stars are less dense than water" (1:19, stopped before "air"); the second tries of "Today, I wanna explore"
  (1:06) and "Taken as a whole" (1:48), both with a restart inside;
  "Now, larger than that…" (1:54–2:03); "Now, that's even less dense because a galaxy is mostly empty space between its
  stars" (2:17: the cleanest of the galaxy-density tries, but the author went on re-saying it as "and those are even
  less dense…", so the last is used); the Andromeda lines in the script's order (2:56–3:21); "And then above that we
  have galaxy clusters… the galaxy." (3:35, cut short); the eleven other endings, among them "…we are going to meet the
  rightmost edge in our chart" (5:04), "That's the rightmost edge in our chart, and it's all about the speed of light"
  (6:00), "Actually, there is a rightmost edge in our chart, and it's all about the speed of light and the expansion of
  the universe" (6:34).

### Captions
Corrected in `words.json`: "shark" → chart; "less dense on water… on air" → than water… than air; "in an ebbler" →
into a nebula; "galaxies, and Those" → "galaxies, and those"; "our sister galaxy, our neighborhood" → "galaxy. Our";
"the larger structures" → largest; "do have math" → mass. In the raw transcript: "separate clusters" → superclusters,
"or sister/Circe galaxy" → our sister galaxy, "shark/shard" → chart, "math and science" (the usual) → mass and size.

### Fact check
- **Right:** a log chart of mass and size, every diagonal a density, water's marked; denser to the left (brown dwarfs,
  white dwarfs, neutron stars); the biggest things are the emptiest ("the bigger something is, the less dense it is":
  true from the stars up); lots of stars less dense than water, some less dense than air (the giants); a dying star's
  outer layers drift off into a nebula, or a supernova remnant if it explodes; those, taken whole, less dense than the
  Moon's atmosphere (the Crab Nebula ~1e-23 g/cm³; the Moon's exosphere ~1e-18); globular clusters and small galaxies
  next; a galaxy mostly the empty space between its stars (~1 atom per cm³) and so less dense again; the Milky Way our
  home, Andromeda our sister galaxy, the Local Group our neighbourhood of galaxies; clusters emptier still (the galaxies
  plus the space between them); superclusters the largest structures, filaments; Laniakea ~100,000 galaxies; voids
  emptier than their surroundings, not empty, so they have mass and a place on the chart; a rightmost limit to the
  chart.
- **Wrong (1:34 in the recording, 0:41 in the cut): "it grows into a supergiant".** A star like the Sun swells into a
  *red giant*; only the heavy stars (roughly eight Suns and up) become supergiants, and those are the ones that explode.
  The nebula branch of the sentence (a planetary nebula) comes from red giants, so "supergiant" is wrong for it. rec62 and
  rec65 both said "red giant", and the script does. The chart labels the object "red giant" as before. Re-word (one
  sentence to re-record): *"When a star is about to die, it grows into a red giant, and its outer layers drift off into a
  nebula, or, if it explodes as a supernova, into a supernova remnant."*
- **Imprecise (the ending, 1:57 in the cut): "a rightmost limit in our chart, and it's where the expansion of the
  universe meets the speed of light."** Where recession reaches the speed of light is the Hubble line (~14.4 billion
  light-years); the chart's rightmost edge is the cosmic event horizon, a little further out (~16.7), which 5b explains
  ("the real edge is a little bit further out"). As the hand-over into 5b it works, since 5b corrects it. If it's ever
  re-said: *"…and it's set by the speed of light and the expansion of the universe."*
- **Imprecise, fine:** "the Laniakea" (a name, no article; the author's own edit list dropped it); "they fit in this
  chart" (on). Nothing else changed in substance.

### The scene
The same scene, its phrases widened for the new words ("lot of stars", "supergiant", "any bigger", "rightmost limit"),
and the galaxies re-cued: the glide to the Milky Way now starts at "a galaxy is really" (so it's in frame while its
emptiness is described, not only at "between the stars"), with its picture forced from there (the first stills showed
"home" on a bare dot: the Whirlpool's picture beside it had taken the room); "here we find home" labels it "home"; at
"Andromeda" the force is lifted, so Andromeda's picture, right beside it, gets the room back, labelled "our sister
galaxy" with "home" still on the Milky Way's dot; then "local group" as before. The ending keeps its pull-out to the
right edge, now labelled "the rightmost edge", and "speed of light" renames it "where expansion meets the speed of
light". Every cue resolves ("every cue found"); stills checked at 16 times, the galaxies' four twice more.

## rec67, rec68, rec69: 5b, 5c and the powers-of-ten zoom, re-recorded whole (the same morning)

All three uploaded to the session 2026-11-11 (the author, driving: "This is for when you're done with the others… Ok
here's the last one!… Also powers of 10 because I'm on a roll"), each ALAC 48 kHz stereo, used as mono, the same room
and the same morning voice as rec66. Word timings (medium.en, the filler prompt): `rec67.words.json`,
`rec68.words.json`, `rec69.words.json`; a few stretches that Whisper had merged (two back-to-back tries heard as one
sentence) are re-timed from a transcription of the stretch alone (small.en), listed under each take.

| Take | File | Recorded | Length | Cut | Plays |
|---|---|---|---|---|---|
| rec67 | "5B morning take.m4a" | 08:49 local | 5:57 | `video/short-05b-hubble-sphere/edl.py`, 27 clips | 2:55 of voice + 3 s credits (was 2:58 + credits) |
| rec68 | "6c morning take.m4a" (the author's name for it; it is 5c) | 08:56 | 8:16 | `video/short-05c-observable-universe/edl.py`, 20 clips | 2:17 + credits (was 2:40 + credits) |
| rec69 | "Powers of 10.m4a" | 09:11 | 12:00 | `video/short-00-powers-of-ten/edl.py`, 33 clips | 3:07 of voice: **over the zoom's 3:00**, see below |

The same treatment as rec66 (`enhance.py --plain`, natural speed, the breaths out of the pauses, the room in the gaps);
5b and 5c with the usual pauses, the zoom with rec52's tighter ones (0.18 / 0.3 / 0.45 s, gaps 0.35 / 0.6), since it
has to end with the zoom. Every clip of each edit transcribed on its own afterwards (the second pass), twice where a
clip changed.

### rec67: 5b, The Cosmic Event Horizon
- **As the script, with one new line** after "And it's all about the speed of light": *"It's where the speed of light
  meets the expansion of the universe."* Small changes: "What is the largest anything can be?"; "the further away";
  "This is the cosmic event horizon. It's the actual limit, because…"; "We will never know about it. Its light can never
  reach us. No information can get here. It's the real limit of the unknowable."; "both are kind of a horizon"; "our
  cosmic horizon is where the light that is outside can never come in"; "the universe is in practice infinite" (the
  second try; the first said "practically infinite"); "Or at least we just see the past version of them".
- **Takes chosen:** the last try unless it slipped. The cosmic event horizon's naming went round four times ("…and it's
  the real edge / real limit", then "No, no, I just said real edge"): the cut takes "So this is the cosmic event
  horizon" (1:51) and, after a restart, "It's the actual limit, because anything that happens beyond it will never
  affect us" (1:56). "We will never know about it. Its light can never reach us" is the third of five tries (2:08): the
  last run (2:21) has a noise between "about it" and "its light" that no transcription could name. The two-horizons
  passage: the last run (3:37), its restart ("…and the size of our Hubble sphere depends on how fast / the radius of a
  black hole, the radius of a black hole…") cut round, joining at the third "the radius of a black hole" (4:05). "But
  that's also where the similarities end," is the first try's start and "because the black hole is an object with a
  centre" the restart's end (4:26). The alien line from its second try (4:40: the first ended "seems to be on air").
  The ending said again whole after *"did I say triangle? Oh yeah, I did say triangle"* (5:38).
- **Re-timed stretches** (Whisper merged the tries): "That means that the further away…" (65.5–74.2 s), "the black
  hole is an object with a centre" (262.8–268.9), "Let's imagine…" (274.4–285.4).
- **Second pass:** one clip's tail had caught the "And" of the restart after it ("…cosmic event horizon and the"): its
  end set by hand (`e`); clean on the second run. "their light" (not Whisper's "your") confirmed by the clip pass.
- **Captions:** "meet" → meets, "your light" → their, "on our short" → chart, "kind of an horizon" → a horizon, "THE
  universe" → the; "right most" came out as one word already.
- **Fact check. Right:** the hook; the speed of light as the limit for anything moving through space, space itself
  stretching faster; not expanding into anything; the photo's resolution; the farther, the faster (Hubble's law); the
  Hubble line (recession at the speed of light), light from beyond it still arriving because the sphere grows, the real
  edge a little further out; the cosmic event horizon as the limit of what can ever affect us; everything inside on
  the black-hole line; the two horizons (what falls in never comes out; what is outside never comes in); both set by
  the mass inside; a black hole has a centre, our universe doesn't; an alien at our edge sees more galaxies; the
  universe measured flat, "in practice infinite"; we see them too, as they were.
  **Imprecise, fine:** the new line, "where the speed of light meets the expansion of the universe": that is the
  Hubble line, named next; the edge itself is the event horizon, which the take then explains ("the real edge is a
  little bit further out"). "Both depend on the mass of what's inside it" as before (exact for the Hubble sphere, a
  tenth of a decade off for the event horizon). Nothing to re-record.
- **The scene:** the parent scene's cues keep their old phrases; the take's wordings are added as alternatives
  (`ALSO`): "all about the speed of light" for the old "that's the Hubble sphere" (the line after "rightmost edge":
  cues resolve in order, so an alternative has to sit where the old phrase did), "can never come in", "let's imagine",
  "the observable universe" (the take drops "it's"). The first check put the Hubble-sphere alternative at "the Hubble
  sphere is also growing" (0:58) and seven earlier cues went unresolved behind it.

### rec68: 5c, The Observable Universe
- **As the script, lightly reworded:** "Everything except one, but I'm not even sure you can call that a single object"
  (the author's new turn: "Oh, did I say everything? No, that's not true. Almost everything" is gone); "So this chart is
  limited by three sides"; "That's the sum of all the light that's reaching us" (nine tries, 3:00–4:07, from "has ever
  reached us" through "even from places that are now beyond the reach" to this); "That also means that what happens on
  one side of the observable universe can never talk to what happens on the other side"; "And it's not only about our own
  past, but also about a future that never will be" (the author, on the take: "let's just stop at 'where they are right
  now'": "Their future is also beyond the reach" out); "And when we look at the distance, we are looking at our distant
  past. You can see a time before superclusters existed, before galaxies, even before stars emerged"; "A light that has
  been travelling towards us since the first moment that light could even travel through the universe at all".
- **Takes chosen:** the last try unless it slipped; "When we point a telescope that deep…" from its second start (4:11;
  the first stopped at "looking at it"); "Even if you could travel…" from its second "even if you could" (4:53).
- **The 16 billion line: the first run, on purpose.** At 1:49 the author questioned "about 16 billion light-years away
  in every direction" (*"if we say away in every direction, then it's not away from us. That's the thing. It's weird"*)
  and re-said it at 2:21 as *"about 16 billion light-years wide"*, then "But again, that's 16 billion light-years"
  (2:43, "away" dropped to match). **"Wide" is wrong:** 16 billion light-years is the radius, our distance to the
  horizon in whichever direction we look; the bubble is about 32 billion light-years across. And 46 billion is a
  radius too (the rec65 fact check, 2026-11-09: the distance now to the matter that sent the CMB), so the two numbers
  only compare if both stay "away". "Away in every direction" was right: away from us, in every direction. The cut
  takes the first run of the two sentences (1:39–1:47: "But I should clarify… That's the cosmic event horizon, about 16
  billion light-years away in every direction") and "But again, that's 16 billion light-years away" (2:39); the second
  run's "But I should clarify" also starts on the tail of a false start. **To re-record, if the author wants the phrase
  gone:** *"That's the cosmic event horizon, about 16 billion light-years away from us, in every direction."* or *"…a
  bubble with a radius of about 16 billion light-years."*
- **Re-timed stretches:** "When we point a telescope…" (246.5–262 s), "Even if you could…" (292–300).
- **Second pass:** two finds. "So this chart is limited by three sides" had a murmured "this chart" on its tail (its
  end set by hand); "But I should clarify" (the 2:15 try) began on the tail of "But I should–" before it (the first run
  used instead, see above). Clean on the second run.
- **Captions:** "shard of meson size" → chart of mass and size, "two traits" → three sides, "side of our universe" →
  size, "an observable universe" → the, "path" → past, "distance past" → distant, "suburb clusters" → superclusters,
  "Big Ben" → Big Bang.
- **Fact check. Right:** everything on one chart of mass and size, inside a triangle but for one thing; the three
  sides; our universe as far as the cosmic event horizon, ~16 billion light-years away in every direction (the cut's
  words); the limit of what can ever affect us; 46 billion light-years for the observable universe (also a radius);
  the sum of all the light that has reached us; looking deep is looking back; galaxies beyond reach even at the speed
  of light; the two sides never in contact; not a single object; a time before superclusters, galaxies and stars; the
  CMB, 380,000 years after the Big Bang, travelling since the universe became transparent. **Wrong, not in the cut:**
  "16 billion light-years wide" (above). **Imprecise, fine:** "even before stars emerged"; "the first moment that light
  could even travel through the universe at all" (fine: recombination).
- **The scene:** cue phrases widened: "everything except one", "call that a single object", "looking at our distant
  past" (the zoom's "past" mark).

### rec69: the powers-of-ten zoom (`short-00-powers-of-ten`)
- **The author's three-minute script (recording-scripts.md, "0 · Powers of ten"), read whole**, with the opening said
  twice (the first run, 0:18–2:46, groped for the "limited" line nine times: *"how to explain this"*; the second run from
  2:57 is used) and the ending four times. New wordings: "the furthest away something is, the older is the light that
  is coming to us. And the furthest away we can see is also the oldest light that there is"; "a faint microwave
  radiation from 380,000 years just after the Big Bang, the moments that light could even first escape from it";
  "Everything you're seeing is a picture of the past"; "as we zoom in, we are actually playing a history of the
  universe, as we are seeing light from the first galaxy formations"; the cosmic event horizon as the smaller bubble,
  "galaxies that can still send light or information to us, despite the expansion rate of the universe"; "The universe
  is still expanding, so a lot of those galaxies are now beyond the reach"; "Here's Andromeda, and here's the Milky
  Way: that's home"; "we see nearby stars"; "the General Sherman, the largest tree on Earth"; "a ladybug is drinking a
  little bit of morning dew"; the amoeba, DNA "wound tight around proteins", "two millionths of a millimetre"; the
  atom, quarks, "the smallest set of rules", quantum fields; "There is a limit to our own understanding. At the Planck
  scale is where relativity and quantum mechanics meet. Anything smaller, and our math simply breaks down. We don't
  know what's happening. But maybe, deep down at the Planck scale, it's all one big game of life."
- **Length: 3:07 of voice with the tight pauses (3:17 with the usual ones). The zoom is 3:00 and a Short's limit is
  3:00.** rec52's cut left two lines out for the same reason. Not cut shorter here: the author's choice. About 10 s
  must go; candidates, shortest loss first: "And now we can see the orbits of planets" (2.4 s), "And in here we see our
  local neighborhood" (2.5 s), "There is a limit to our own understanding" (2.5 s), "Everything you're seeing is a
  picture of the past" (2.6 s), "the moments that light could even first escape from it" (3.4 s), "And as we zoom
  further, we see nearby stars" (2.6 s). The zoom's keys (`zoom-keys.json`) have to be re-timed to this voice in the
  zoom's own checkout either way.
- **Takes chosen:** the last try unless it slipped; "Here's Andromeda, and here's the Milky Way: that's home" is the
  second of three (7:13; the third, "here's Milky Way where we live", drops "the"). Cut spans inside two clips: "the
  older the light get cut," and "as we are seeing light from the galaxy" (restarts mid-sentence, said again right).
- **Re-timed stretches:** "one star among hundreds of billions" (442–454 s, four starts), "They're made of electrons…"
  (559.8–567), "And what are quarks made of?" (573.4–578.2), "Anything smaller…" (688–695).
- **Second pass:** one find, "At the quantum, at the Planck scale is where relativity and quantum mechanics meet"
  (10:44): the clip now starts at the second "at". Clean otherwise.
- **Captions:** "a foreign of giant sequoias" → forest, "trenches" → branches, "pollens" → pollen, "one tied around
  proteins" → wound tight, "two millions of a millimeter" → two millionths of a millimetre, "and splittable" →
  unsplittable, "particles" → particle, "smaller on our math" → and our math, "on the Planck scale" → at.
- **Fact check. Right:** the universe measured flat, infinite for all practical purposes; the farther, the older the
  light; the oldest light the CMB, 380,000 years after the Big Bang, when light could first travel; everything a picture
  of the past; zooming in replays the history (the first galaxies); the cosmic event horizon inside the observable
  universe, the galaxies that can still reach us; the expansion putting the rest beyond reach; superclusters along
  threads around voids; Laniakea ~100,000 galaxies; the Sun one of hundreds of billions in an arm of the Milky Way; the
  Oort cloud; the third rock; the Sierra Nevada's sequoias and the General Sherman (the largest tree by volume); DNA
  wound round proteins (histones); the double helix 2 nm = two millionths of a millimetre (right); atom from the Greek
  for uncuttable; electrons, protons, neutrons, mostly empty space; quarks and gluons; quantum fields, particles as
  ripples; the Planck scale where relativity and quantum mechanics meet.
  **Imprecise:** "We live in one such **small** filament called the Laniakea supercluster" (Laniakea is one of the
  largest; we live in a small branch of it: rec52's fact check said the same): *"We live in one of them: the Laniakea
  supercluster, a hundred thousand galaxies."* "the **first** single-celled organism, a small amoeba" (an amoeba is not
  the first of anything here): *"and a single-celled organism, an amoeba."* "billions of icy comets" (estimates run to
  trillions; "billions" is a floor). "every particle as just temporary ripples" (rec52's note: "temporary" adds
  nothing). Nothing wrong.
