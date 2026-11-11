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
| The Largest Structures in Space | `short-05a-emptier` | 2:06 of voice, 2:09 with the credits (was 2:10 + credits from rec62/rec65) | `video/short-05a-emptier/edl.py`, 18 clips, all rec66; scene `src/narration-scenes/short-05a-emptier.js` |

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
second "here we find home" (3:26; the first is a restart). "Today, I wanna explore…": the second (1:06); after the
first the author checked the direction (*"to the right? Yeah, to the right, left, right, yeah"*). "Taken as a whole":
the second (1:48). "Can you get any bigger?": the last of its tries (7:25), then "Well, no, because there is a rightmost
limit…" (7:32), the restart between them ("because there is an edge, there is a limit") out.

### Left out
- The mic test and the notes to self (0:00–0:33, 1:01–1:05, 3:54 "Okay, I lost again, back", 4:50 "Did I ever
  mention…").
- The first tries: "Lots of stars are less dense than water" (1:19, stopped before "air"); "Taken as a whole" (1:43);
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
