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
| rec69 | "Powers of 10.m4a" | 09:11 | 12:00 | `video/short-00-powers-of-ten/edl.py`, 33 clips | 3:06 of voice: **over the zoom's 3:00**, see below |

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
- **Length: 3:06 of voice with the tight pauses (3:17 with the usual ones). The zoom is 3:00 and a Short's limit is
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

## rec70: "Retakes for the short.m4a" (the two sentences from the morning's fact checks)

Uploaded 2026-11-11 after the author's drive; recorded 10:07 local (13:07 UTC), ALAC 48 kHz stereo, 4:52, −25.9 LUFS,
peak −0.8 dBFS. The author at the start: *"I'm going to do some very short retakes. I want to try to make sure they
sound the same."* Word timings: `rec70.words.json`.

- **5a, the dying star (0:14–0:47):** four tries; the last used (0:37): *"When a star is about to die, it grows into a
  red giant, and its outer layers drift off into a nebula, or, if it explodes as a supernova, a supernova remnant."*
  ("into" before "a supernova remnant" dropped; it reads fine.) Spliced into `short-05a-emptier` in place of rec66's
  "supergiant" clip (0:39–0:49 of the cut); the captions carried over, the mix remade, the clip re-checked alone.
- **5c, the 16 billion passage (0:58–4:51): recorded both ways, as the author said on the take** (*"Well, I'm gonna
  record both"*), and the cut keeps neither: the current 5c already has these lines from rec68, in the same voice, and
  the "away in every direction" version here (1:09–1:23: "…That's a cosmic event horizon about 16 billion light years
  away in every direction. This is the limit of everything that can happen that can ever affect us") says the same.
  **The "wide" version is wrong as recorded, and the reasoning on the take says why:** *"46 light[-years] is the
  diameter and 16 is the radius, right?"* (2:01). No: **both are radii.** 16.7 billion light-years is the distance to
  the cosmic event horizon; 46 billion light-years is the distance now to the matter that sent the CMB, the edge of the
  observable universe. So "32 billion light-years wide" (3:42) is right for our universe, but it has to pair with
  **"closer to 93 billion light-years wide"** for the observable universe, not "46 billion light years wide" (4:23),
  which is a radius called a width: the two bubbles would then look only 1.4× apart instead of 2.8×. Also in the
  "wide" tries: "16 million light years away" and "46 million light years" (2:17, 2:24: slips), "32 light billion"
  (2:37, 3:00). **If the author wants the "wide" wording:** re-say *"That's the cosmic event horizon, about 32 billion
  light-years wide"* and *"they would give you a much larger number, closer to 93 billion light-years wide"*; "But
  again, that's 32 billion light-years wide" (2:45) can then stay. Otherwise the cut stands as it is.
- Also said here, not used (the current lines say the same): "We call this our universe because it's the limit of what
  can affect us", "Nothing that happens outside this bubble will ever be known to us, will ever be seen by us, or will
  ever reach us", "What's happening there is that there is yet another horizon, and that's an observable universe",
  "That's the sum of all the light that is reaching us right now" (4:44, the last of two: if the author prefers it to
  the cut's "that's reaching us", it's one clip to swap).

## The author's notes on the morning drafts (2026-11-11, 10:43–10:57 drafts; fixed the same morning)

The raw takes (rec66–rec70) aren't on this Mac (they were uploaded to the morning's session), so the sound fixes below
were made on the finished `audio.m4a` of each take (decoded, fixed, encoded again at AAC 192 kbps: one more generation)
and the words carried over; to rebuild from the takes, the equivalent EDL changes are given.

### 5a, The Largest Structures in Space
- **"Cut the tongue sound in the first second. Start with the music 1 second before the voice starts."** The head of the
  edit (0–0.66 s: a click at 0.05 s and the take's pre-roll at about −55 dB; the voice began at 0.68) is replaced by
  1.0 s of the take's room (the edit's own gap at 17.55–18.70, looped), so the voice starts at 1.0 s and Fresh Air (the
  scene's backing, in from 0 with its 2 s fade) is a second ahead of it. Every word +0.34 s, "In" set to its onset
  (1.00); duration 123.75. (From rec66: the first clip from `s: 35.84` with a 1 s lead.)
- **0:20, "you don't need to reanimate the density lines you've already animated":** the player now keeps a density
  line named by consecutive cues as it is (`since`, as objects and lines: no fade and no drawing out again,
  src/narration.js), so water's line and the brown dwarfs' stay through the white dwarfs' and the neutron stars'
  cues; the zoom out at "largest objects" keeps water's line instead of clearing it, and "lots of stars" no longer
  clears and redraws it. (The same change reaches long video 2's "every diagonal on this chart" passage and video 5's
  density lines, which also name a line over consecutive cues: they stop redrawing there too.)
- **0:40, "when I say nebula it should show the nebulas":** the camera move and the planetary nebula on "nebula"
  (43.6 s); the cue had waited for "supernova remnant" (47.3). The Crab Nebula still comes on "supernova remnant".
- **1:10, "what's this blob to the right of the Milky Way?"** The Whirlpool's picture (M51 with its companion NGC 5195,
  the blob), which sits right beside the Milky Way on the chart: at "Andromeda" the scene lifted the Milky Way's
  forced picture, and the Whirlpool's took the room. Now the Milky Way's and Andromeda's pictures are both forced from
  "Andromeda" to "galaxy clusters", and the Whirlpool's is hidden through the galaxies.

### 5b, The Cosmic Event Horizon
- **"label that ends in 'by mass and size' is out of the frame":** on the triangle's outline the label landed at its
  left corner, half off the frame. It's now set along the upper edge mid-frame (`labelAt` [0, 27.8] on the
  Schwarzschild line, label only; the outline is highlighted as before).
- **1:05, "a strange click and a gag":** after "horizon" (65.72 s) a click at 65.93–66.00 and, just before "it's"
  (66.61), a 55 ms voiced grunt at 66.54–66.60 (Whisper had written it as "and"). Both filled with the room between
  them; the pause stays as it was. (A first try that also filled 65.75–65.93 took the "n" of "horizon": the clip
  pass heard "cosmic event, right?"; that stretch is the word's quiet nasal tail, kept.) Clip pass after: "So this is
  the cosmic event horizon. It's the actual limit, because anything that happens…". (From rec67: `cut` spans at the
  same places in the source.)
- **2:20, "alien's galaxy label is out of frame":** the diagram's "an alien's galaxy", centred on the circle at the
  right edge, ran off it; now it slides left as far as it needs to end inside the frame (and a little higher, off
  the arrowhead).
- **2:53, "the transition between the observable universe we were seeing and the one zooming out is not seamless":**
  the diagram still had our and their galaxies, the rings, the labels and the "us" dot drawn on the microwave
  background when the chart's picture took over, so they went in a cut (fading 0.5 s over the new picture). Now they
  fade out 1.2–2.8 s after the background comes in ("it's time we meet"), leaving the bare sphere; the chart's
  picture starts at its size (grow 2.57: the sphere measured 462 px to the picture's 467 at 2.6 in the 540-px stage)
  and pulls out as before. Stills at 170, 171.5, 172.7, 172.9, 173.6: the same sphere either side of the cut.

### 5c, The Observable Universe
- **0:10, "a hum or cough":** a noise at 9.66–9.80 s in the pause between "triangle." and "Everything except one",
  filled with the room beside it. (From rec68: a `cut` span there.)
- **"Why is it that inside the cosmic event horizon we see a yellow nuclei mess instead of the nice filaments network
  we have?"** It is the web: at the horizon's frame (44 billion light-years across) the zoom draws the superclusters'
  cosmic web as its coarse 500 Mly grain (cosmic-web.js, lod 2), whose cells are two or three pixels there, and the
  finished web ends at z 0.5 (about 6 billion light-years, 0.4 of the horizon's radius) with a sharp edge, the sea of
  farther, redder galaxies outside it: a bright ball with a rim. To read as a network at that scale the grain would
  have to grow with the frame (a cell a fortieth of the horizon, say, where it is a four-hundredth now) and the ball's
  edge soften into the galaxies. That's the zoom's own picture (also the app's universe and the zoom video's
  opening), so it's left for the author's say.
- **"in the zoom out, I would like to experiment rotating the date circles with a circle that is tilted so it's
  closer to the camera and comes from underneath it":** built as an experiment in the zoom's timeline
  (tools/powers-of-ten/timeline-05c.js, the overlay): each circle of when the light was sent is a ring on a plane
  tilted 62° from the screen, its near side down, in perspective from 0.9 frame-heights away, so a wide ring is only
  its far arc near a horizon line above Earth and its near side comes up from under the camera as the zoom pulls out;
  the tilt eases off as the camera nears the microwave background, where the circles become the shell's own
  perspective. `?tilt=0` on the render page draws them flat as before; `?tilt=…&persp=…` to try other values.

## The author's notes on the second drafts (2026-11-11, 12:30, on the 11:19/11:24/11:29 set)

### 5a: "other than that it's good enough"
- **0:50, "emptier than the Moon's..." label is cut off:** the Crab Nebula's tag ran off the right edge of the frame
  (the picture sits near the mass axis at that camera); it's placed on the left now.

### 5c, The Observable Universe
- **0:22, "three [sides]", "the word is mangled":** in rec68 the end of the sentence is murmured ("three" 90 ms,
  "sides" 130 ms, at -21 and -29 dB where "by" before them peaks at -12) and the clip ends on it (the murmured "this
  chart" that follows had to go). The raw take isn't on this Mac, so the two words come from the 2026-11-09 cut (git
  3edc4f78, its audio at 28.36-28.98, from rec64's "three sides" clip, rec64 96.38-100.14): the same room, two days
  earlier, at -2.5 dB to sit with the words round them. In place of 20.86-21.14; everything after is 0.34 s later
  (words.json and the mix follow; the voice is 2:17.2). Whisper now hears "limited by three sides. Relativity on the
  top left". If the splice shows, the line to re-record is "So this chart is limited by three sides."
- **0:40, "is there a 10B ly label in the axis? It should":** there wasn't one: the size ruler's unit list
  (src/data.js, RADIUS_UNITS) went 1M ly, 1 Mpc, 1B ly, 1 Gpc, Hubble R. "10B ly" is in it now (at 10¹⁰ light-years,
  between 1 Gpc and the Hubble radius), so it shows wherever the ruler is zoomed in enough: here at "the size of our
  universe", and on the site's chart.
- **1:00, "[and] if you ask a scientist", "and is not very audible":** the clip started on the word, and the vowel's
  onset is at -40 dB for its first 0.1 s (the take's, not the cut's: a 12 ms fade only). The "And" of "And it's not
  only about our own past" (this cut's 100.40-100.70, a sentence-initial "And" from the same take) is put over
  58.40-58.70, same length, so nothing moves. Whisper hears "away. And if you ask a scientist".
- **1:30, the discs "more tilted towards the viewer and with an actual edge thickness (so the closer one is wider than
  the more distant edge) so it feels it's passing just under the camera… I want the camera to feel they're the light
  itself":** tilt 75° from the screen now (was 62°), seen from 0.75 frame-widths (was 0.9), and each ring is a band
  whose width grows with nearness (2.4 px at the screen's depth, up to 12× that as it passes under the camera), so the
  near edge is the thick one. A ring comes in when its near edge enters the frame from below and goes as it passes
  under the camera (before, it faded by its size, and the pass was faint). The labels sit under the near edge now
  (the far sides crowd towards a horizon line at that tilt), bigger as the edge nears, stacked when two would meet,
  and drawn after every band.
- **2:00, "don't rotate the light age disc, keep it so that by the end it feels it's cutting the CMB equator":** the
  tilt no longer eases off near the microwave background; the rings keep it through the crossing, so the oldest
  light's ring sits on the ball's equator, its far half hidden behind the ball (and the 10-billion-year ring inside
  it the same), cutting it as asked. Still at 2:11: the ring through the ball, "13.8 billion years · the oldest light"
  under its near edge. `?tilt=0` on the render page still draws them flat; `?tilt=…&persp=…` to try other values.

### 5b, The Cosmic Event Horizon (the author's notes of 12:40)
- **0:10, "can we remove the Whirlpool galaxy's companion? Is that part of the Milky Way image or another object that
  is overlapping?"** Neither: it's in the Whirlpool's own picture (content/icons/whirlpool.webp, Hubble's M51 with its
  companion NGC 5195 at the end of an arm; the blob beside the Milky Way in 5a's 1:10 was the same). NGC 5195 is
  painted out of the master (content/icons/src/whirlpool.png: an ellipse round it filled with the halo around it, a
  wide masked blur, feathered) and the icon's tiers rebuilt (generate-icon-resolutions, unscreen-icons --again). The
  chart everywhere shows the Whirlpool alone now; the Milky Way's picture is its own.
- **1:00, "increasing the resolution of a photo": "experiment that with an actual photo of stars… start with a very
  low pixelated like it is, just use the photo instead of random pixels, and make the pixel grid white":** the pixels
  diagram takes a photograph now (`pixels.photo`, src/narration.js drawPixelsPhoto): the globular cluster photo's
  sparse upper-right corner (public/narration/photos/globular.jpg, the crop 9:16), seen through 81 px pixels that get
  3 × 3 finer at "four", "nine" and "more" (81, 27, 9, 3 px), each pixel the light that falls in it, each level
  exposed on its own with the sky black (the median cell and below) and its brightest cell white, so the first
  picture is a few lit pixels on black like the drawn one, and the stars come out of it as the pixels shrink: a
  star's light stays in the one pixel it is in, the ones round it go dark. The grid is white (the first level's
  lines heavier). Stills at 38.6, 40.7, 41.6, 42.6.
- **2:00, "a black hole is an object with a centre: instead of moving back and forth between the two points, keep
  both the black hole (M87) and our universe in the screen and show arrows and labels…":** from "can never come
  out" (1:42) the camera holds a frame with M87* at the bottom left and our universe at the top right, both on the
  black-hole line (r 21.8, m 49.8, span 17; their pictures forced), labelled "a black hole" and "our universe". "The
  light that falls in can never come out": three short yellow arrows into M87*, "light falls in · never out"; "the
  light that is outside can never come in": three blue arrows towards our universe that stop outside it, "light
  outside · never in". The mass and expansion-rate labels follow as before, over the same frame (no more Ton 618
  shot). "An object with a centre": a + at M87*'s centre with the arrow "a singularity at the centre". "Our universe
  is just that": the dive into our universe's picture starts with a blue arrow at its centre, "not the centre, just
  our now", which keeps its size through the dive (arrows can now sit at px offsets from an object, `dx`/`dy`); the
  edge diagram's own "now" arrow comes in at the same place as it begins (0.2 s in, was 0.8), so one becomes the
  other. Stills at 103.5, 107.5, 131.6, 134.6, 137.

### 5c with motion blur (the author, 13:30: "start also a draft render with motion blur")
- The draft script pins `--subframes 1`; the blur draft is the same command with the nightly's 4 subframes (shutter 0.5),
  720p, into output/videos/drafts/short-05c-observable-universe-blur.mp4 and iCloud's
  `short-05c-observable-universe-draft-blur-<date>-<time>.mp4`. The first (13:50) showed the band passing under the
  camera as four copies, not a smear: it moves tens of px a frame, more than the four sub-frames can join. The rings now
  sample themselves across half a frame (up to 10 times, a share of the alpha each, as many as the fastest near edge in
  the frame moves 2.4 px) in the flat regime, so the renderer's copies join into one; a second blur draft follows.

### 5c, the author's notes of 14:15
- **"Today we are exploring the observable universe": "do we have any other take? This feels like it ends with a …
  instead of a !"** rec68 had two tries (the cut has the second); its raw file and its word timings aren't on this Mac,
  so the first can't be cut here. What is here is the Nov 9 take of the line (rec64, in the previous cut): the two are
  side by side in iCloud's output videos, `5c-hook-line-current-rec68.m4a` and `5c-hook-line-2026-11-09-rec64.m4a`.
  If neither lands, the line to re-record is "Today we are exploring the observable universe!"
- **1:00 (the dive to Earth at 1:13), "the big fast zoom should have an ease in and out so it accelerates and
  decelerates when it arrives":** the dive's segment of the zoom (tools/powers-of-ten/timeline-05c.js) is on a quintic
  ease now, from rest 3.0 s before "telescope" (was 2.6) to rest at Earth 1.2 s after it (was 1.0): 0.5, 1.4, 2.4,
  3.1, 3.5, 3.3, 2.7, 1.8, 0.8, 0.1 decades per 0.4 s through it, where the cubic through the keys had a short ramp
  and a long flat-out run.

### 5b, the author's notes of 14:30
- **"It's about the speed of light… it's where the speed of light meets the expansion of the universe": cut the first
  phrase.** "And it's all about the speed of light." (13.54-15.74) and the pause after it are out (13.42-16.62 of the
  built audio, a 10 ms crossfade; the beat before it kept, so "rightmost edge." → 1.2 s → "It's where the speed of
  light meets…"). Everything after is 3.2 s earlier; the voice is 2:51.5. The Hubble sphere's edge label, which was
  keyed to "all about the speed of light", is keyed to "speed of light meets" now. (From rec67: the clip at
  33.94-35.88 out; marked in the EDL.)
- **"no coincidence" label is cut:** on our universe's left now (above or right of it, it ran off the frame's edge
  where our universe sits in the two-horizons frame).
- **"I want you to use these pixelated images of the Hubble Deep Field… add a grid of lines to show the pixel
  division and then show more lines sliding in to cut them":** HubbleDeepField.psd (seven layers, 1474 × 1475: the
  original and its pixelations at 200, 100, 50, 25, 12 and 6 px, each step one pixel into four) exported to
  public/narration/photos/hdf-pixels-<px>.png (the original as .jpg). The diagram (`pixels.photos`, src/narration.js
  drawPixelsStack) crops them to the stage's shape, centred (9:16 here; a 16:9 video would crop the other way), shows
  the 200 px one with a white grid on its pixels, and at each step slides the new lines in from the line before them
  to cut every pixel in two each way while the finer picture comes in: 100 px on "four", 50 on "nine", 25 on "more",
  then 12, 6 and the original close behind (steps 2.2, 3.0, 3.8, 4.4, 4.9, 5.3 s after the cue).

### 5c, with the morning take on this Mac (the author, 14:45: "I added the 5c morning take to the iCloud recordings folder")
- rec68 is `recordings/5c morning take.m4a` now (ALAC 48 kHz, 8:16). Its tries of the two lines in question:
  - "Today we're exploring the observable universe": the first at 67.54-70.18, the second (the cut's) at 72.78-75.0.
    The first is beside the other two clips in iCloud's output videos, `5c-hook-line-first-try-rec68.m4a` (at the
    cut's level; it peaks near full scale, so it may clip a touch there).
  - "three sides": the take has it whole in the first full try, "so our chart is limited by three sides." at
    79.72-81.70 ("sides." 81.28-81.70); the cut's try (86.68) and the one after it (90.34) both trail off into a
    restart after "three". So the two words come from the same take now (81.04-81.80, through the 80 Hz high-pass and
    +10.3 dB, the gain that puts that try's "limited by" at the cut's), in place of the Nov 9 words at 20.86-21.48;
    everything after is 0.14 s later (the voice is 2:17.4). Whisper: "limited by three sides. Relativity".

### 5b, the author's notes of 15:30: "the pixelation animation is moving the grid; instead bring the lines from the side
individually as if cutting a cake. Other than that it's ready to be scheduled too. It needs metadata and a thumbnail"
- The grid's new lines no longer slide from the coarser line: each sits at its place from the start and is drawn
  across the frame like a knife, the verticals down from the top, the horizontals in from the left, one after another
  over the step's first 0.6 s (0.35 s each), and the finer picture comes in 0.25 s behind the first cuts.
- youtube.json: "The Cosmic Event Horizon", Tuesday 2026-11-24 06:00 (the slot after 5a's Friday). The thumbnail: the
  triangle's apex with our universe on the black-hole line, the Hubble line named, "16 billion light-years in every
  direction" and "the largest anything can be" (video/thumbnails/short-05b-hubble-sphere.jpg).
- The upload: queued like 5a's, a detached job that waits for the nightly's render of 5b and uploads it private with
  its schedule (output/videos/upload-5b-tonight.sh, log upload-5b.log). The raw rec67 isn't on this Mac, so the
  upload's voice is the committed cut.
- 5d: the author's new Observable Universe script, written in the shared doc, is saved in
  video/scripts/recording-scripts.md as `short-05d-observable-universe`, to record; 5c stays as it is.
