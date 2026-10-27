# Recordings, 2026-10-27

The Whisper word timings (medium.en, `scripts/narration-take.py`'s settings) are
`rec35.words.json` and `rec36.words.json`.

## rec35: "Hook re record.m4a" (video 1)

This is in the Google Drive "Recordings" folder: 5:13, AAC mono. It's a full run of the hook
script with retakes, opening with a mic test (0:00–0:17) and ending with several tries at a new
outro line.

Cut: `video/short-01-hook/edl.py`, 11 clips. The take runs 5:13, the cut 2:01, and it plays in
1:50 at 1.1×. Picks: the opening with "In my opinion"; "Probably the first thing you notice…"
("This is the," left out); "etc." after "radio waves" left out; the third "all of science"; the
second "Notice that along the top…" and the last "that's because the top axis isn't about how
things are but when"; the second "I call this the triangle of everything"; the outro up to "I
sincerely hope you find this as fascinating as I do". The tries at a new last line after it
(3:52–5:10) are left out.

Caption words corrected: "visible lights" → "light"; "the sides of the universe" → "size"; "where
those line meets is actually the Big Bang" → "where those lines meet is actually… the Big Bang?!"
(the author's "?!"); "gravities" → "gravity"; "all the story" → "stories"; punctuation through the
middle stretch, which Whisper ran together. The scene's cues "engineering is here", "those two
lines meet" and "a history of time" are re-keyed to the new words; every cue resolves.

Tries worth noting:
- Opening (0:17): "In my opinion, this is the most interesting chart in all of physics."
- "So this is a **log** chart of mass versus size" (0:41): new, and right.
- "All of science": the first try breaks off at 1:20; the second (1:26) is complete.
- "Where those line meets is actually the Big Bang" (1:39): said as a statement this time, not a
  question.
- The diagonals in seconds: the complete try is 1:55–2:16 then 2:43, "that's because the top axis
  isn't about how things are but when: it's a history of our whole universe".
- "Triangle of everything": the second try (3:01) is complete.
- Outro tries after "I sincerely hope you find this as fascinating as I do" (3:37): "It brought
  me into a journey of discovery…" (4:00), "This is also a learning journey for me…" (4:17–5:10,
  six tries). The cleanest is 4:39: "This is also a journey for me and I really hope that you
  find it as fascinating to watch [as] I did discovering it" (the "as" is swallowed).

### Fact check

- **Right:** "a log chart of mass versus size": both axes are logarithmic.
- **Right:** the three sides (Hubble radius on the right, the Compton/quantum edge bottom left,
  the Schwarzschild/relativity edge top left), and the diagonals along the top as times since
  the Big Bang in seconds.
- **Right:** photons on the chart through their energy and wavelength.
- **Imprecise:** "where those lines meet is actually the Big Bang". The two left edges meet at
  the Planck point: the smallest, earliest scale physics can describe, about 10⁻⁴³ s after the
  Big Bang, not the Big Bang itself. Yesterday's take said it as a question ("…is… the Big
  Bang?"), which a hook can carry. Suggested: "And where those two lines meet is… the Big Bang?"
  or "…is the very beginning: the Big Bang."
- **Imprecise:** "the top axis". The chart's axes are mass (left) and size (bottom); the
  diagonals in seconds are lines across the top of the chart, not an axis. Suggested: "the top
  of the chart isn't about how things are, but when".
- **Wording:** "gravities" → "gravity"; "visible lights" → "visible light"; "where those line
  meets" → "where those two lines meet".

## rec36: "Brown dwarfs to black holes.m4a" (video 3)

This is in the Google Drive "Recordings" folder: 4:45, AAC mono. It's a full run of the video 3
script with retakes, after a short mic test (0:00–0:10). The mic stayed on.

Cut: `video/short-03-stars/edl.py`, 17 clips. The take runs 4:45, the cut 2:27, and it plays in
2:13 at 1.1×. Picks:
- "And as mass grows, so does the pressure in the core" is the third try (0:37). Whisper had
  merged two earlier tries that break off after "so does" into one long line.
- Brown dwarfs: the first try up to "not ordinary hydrogen", then "Deuterium is so rare…" from the
  second (the first runs on into the restart).
- Fusion and the main sequence: "Once the pressure in the core is high enough to fuse ordinary
  hydrogen," then "that fusion releases some energy that creates a force that will push the star
  outwards, making it bigger, and it will move into this other diagonal line that we call the
  main sequence," then "where stars spend most of their lives" from the last try. The first try,
  "it releases a huge amount of pressure", and the restarts are left out.
- "That's it" before "until the hydrogen runs out" and "Now," before "the outer layers" are left out.
- The nurseries are the first try; the second ("…new stars again, and the cycle begins anew") is
  left out.

Caption words corrected:
- "stars on planets" → "stars and planets"; "sun" → "Sun"
- "weight as much as a mountain" → "weigh"
- "the story is any bigger, still, the car collapses" → "the star is any bigger still, the core
  collapses"
- Whisper's "But" before "Something really interesting happens here" taken out (not in the audio)
- "in -betweens" joined into one word
- The raw take's "the tenth score I told you about" is "the dense core" (Whisper heard it right
  on the clean edit).

The scene is re-keyed to the new words (`src/narration-scenes/short-03-stars.js`); every cue
resolves. The fork's camera move is 3 s now (it had 6 s before the next cue in the old take,
3 s in this one).

### Fact check

- **Right:** Jupiter and Saturn give off more heat than they get from the Sun (about 1.7× and
  1.8×), mostly from slow contraction.
- **Right:** brown dwarfs (about 13 to 75–80 Jupiter masses) fuse deuterium but not ordinary
  hydrogen, and deuterium is rare (about 1 hydrogen atom in 40,000 at the Big Bang).
- **Right:** fusing ordinary hydrogen puts a star on the main sequence, where stars spend most of
  their lives. "Fusion releases some energy that creates a force that pushes the star outwards"
  is simplified (the heat keeps the gas pressure up against gravity) but fair.
- **Wrong, left out of the cut:** the first try, "it releases a huge amount of **pressure**".
  Fusion releases energy; the pressure comes from the heat.
- **Imprecise (as in the script):** "the star collapses and then expands again… and splits in
  two". At the end of its life the core shrinks while the outer layers swell into a red giant,
  at the same time, rather than the whole star going in and out; the scene shows it that way.
- **Right:** the outer layers go as a supernova or a planetary nebula; a star too small to go
  supernova leaves a white dwarf; in a supernova's core, protons and electrons become neutrons;
  a teaspoon of neutron star weighs about 2 billion tonnes, a mountain's worth; a still bigger
  core collapses into a black hole.

## rec37, rec38, rec39: video 4, re-recorded at home

The author's first home recordings (QuickTime, AAC 48 kHz, in iCloud
`Projects/triangle/recordings/`; the car takes are the Google Drive ones). Whisper word timings:
`rec37.words.json`, `rec38.words.json`, `rec39.words.json`.

- **rec37**, "New Black holes take.m4a" (7:32): the whole video 4 script with retakes, after a mic
  test. Complete, though the author thought it hadn't recorded.
- **rec38**, "New Black holes take 3.m4a" (6:41): the whole script again.
- **rec39**, "more on dark matter search.m4a" (2:05): a new passage after "…something completely
  different": dark matter, if it's real, is somewhere on this chart, and people have crossed off
  areas of it (ancient crystals, people's heads exploding).

How the rooms compare (same measurements on the car takes rec35 and rec36): the home noise floor is
about 3.5 dB lower (−81.5 vs −78 dBFS), with a little more room tail, more air above 8 kHz, and in
rec37 about 3 dB more at 100–300 Hz (closer to the mic). rec37 gets `SOURCE_FX` (−3 dB at 180 Hz,
+3.5 dB) to match rec38.

Cut: `video/short-04-black-holes/edl.py`, 25 clips; the cut runs 5:52 and plays in about 5:20 at
1.1×. Mostly rec38; rec37 for the stars (rec38's has long hesitations), "They'd float if you had a
big enough pool", the soup (rec38's adds "a millionth of a second in", see below) and the ending
(rec38's tries say "the first nanoseconds" and stumble); rec39 for the new passage. Repeats the
long-form transcript hid, found by re-transcribing every clip, and left out: "…it's a white dwarf.
Depending on its mass…", "they're thought to be, they're thought to be", "but it's still possible
that what we think of, but…", "Look, or maybe not" (rec38's own "Or maybe not…" is used), and "But
if it's, but if it's…".

### Fact check

- **Right:** the life cycle (nurseries, protostars, the main sequence, red giants shedding their
  outer layers, white dwarfs, neutron stars, black holes); black holes all on the Schwarzschild
  line, the top-left limit; a singularity of zero size with an event horizon whose radius is
  proportional to the mass, hence the 45° line.
- **Right:** known black holes formed in collapsing stellar cores or grew by swallowing gas and
  merging; Sgr A* has about 4 million Suns; the supermassive ones have a mean density inside the
  horizon below water's (from about 10⁸ Suns); M87* was the first photographed; TON 618's horizon
  (a radius of about 1,300 AU) is far bigger than the planets' orbits (Neptune: 30 AU), with
  about 60 billion Suns.
- **Imprecise:** "their masses go from a few Suns to millions of Suns", then TON 618 at 60
  billion. "…to billions of Suns" would match.
- **Wrong, left out of the cut:** rec38's "the very first moments of the Big Bang, like a
  millionth of a second in". A primordial black hole forms with about the mass inside the horizon
  at the time, ~10¹⁵ g × (t / 10⁻²³ s): a millionth of a second makes ones of about the Sun's
  mass, not the asteroid-to-moon masses of the window (10¹⁷–10²² g, formed ~10⁻²¹–10⁻¹⁶ s in).
  rec37's "the very first moments after the Big Bang" is used.
- **Imprecise, left out:** rec38's "in the first nanoseconds of our history" (the window's ones
  formed far earlier); rec37's "first moments" is used.
- **Right:** quasars, the microwave background, gravitational waves and microlensing have all
  narrowed the window; the small ones would have evaporated by Hawking radiation; a small moon's
  mass (Hyperion, 5.6×10²¹ g) makes a horizon ~17 nm across, virus-sized; an asteroid's (Eros,
  6.7×10¹⁸ g) about a fifth of an atom; galaxies weigh up to ~10× what we see; most matter is
  dark; neutron-star studies may close the window further (contested).
- **Imprecise (as in the script):** "we wouldn't need any new particle": true of the particle,
  but making that many in the early universe still needs something unusual.
- **rec39, imprecise:** "if it's not just an error in the mathematics". The alternative to dark
  matter is a different law of gravity (modified gravity), not a maths mistake. Suggested: "Maybe
  it isn't a thing at all, and we just have gravity wrong."
- **rec39, right:** macroscopic dark matter of some masses would have left tracks in ancient mica
  crystals, and none are seen (Price & Salamon 1986; Jacobs, Starkman & Lynn 2015).
- **rec39, dramatized:** "people's heads would just be randomly exploding, and they took the
  trouble of looking into death records". Sidhu, Scherrer & Starkman (2019) say a dark matter lump
  of that size and mass passing through someone would leave a wound like a gunshot's; they didn't
  search death records, they argued such unexplained wounds would have been reported in
  well-monitored countries, and none have. The author keeps the exploding heads (the paper's
  gunshot comparison); suggested re-record: "…every now and then someone's head would just
  randomly explode, like being shot by a bullet out of nowhere. And in all our medical records,
  that has never happened."
- **Right:** "the search for dark matter is the collective effort of a lot of people scratching
  off areas of this map".

### rec41: the addendum again, corrected

"dark matter addendumd.aifc" (1:27, lossless AIFF-C from QuickTime's Maximum setting), the
passage re-recorded from the fact check's suggestion: "we just have gravity wrong", "tracks in the
crystals of ancient rocks", "like being shot by a bullet out of nowhere", "they looked at medical
records: never happened". It replaces rec39 in the cut (28 clips, 5:43; 5:11 at 1.1×), with a
small treble lift (`SOURCE_FX`) to match rec38; "Look, or maybe not" comes from rec41's second
try, "And like" before "they looked" is left out. The scene draws each crossed-off area of the
dark matter figure as it's named (crystals, injuries, then white dwarfs and the microwave
background on "scratching off areas").

## rec40: "Hubble sphere.aifc" (video 5)

In iCloud `Projects/triangle/recordings/` (home): 15:35, lossless AIFF-C (QuickTime's Maximum
setting), a handheld mic. One run of the video 5 script with many retakes, and notes to the
editor in the take:
- **Mic hand and aircon (0:00–0:34):** the author asked whether holding the mic in the right or
  the left hand made a difference, and whether the aircon could be heard. Measured: with the
  aircon on, the floor is about 3.5 dB higher (−75.5 vs −79 dBFS), the hum 7 dB stronger at
  200–2,000 Hz; turned off from 0:24. The right hand came out about 3.7 dB louder and brighter
  (+5 dB at 4–8 kHz), the mic more on-axis. A stand or a clip would avoid handling noise.
- **The opening (1:21):** "I really like this opening, let's try to keep that, unless we are
  already using it": "Anything that has ever existed can be plotted in this chart." Video 4 opens
  with nearly the same line, so the cut keeps the script's "You could try to fit everything…".
- **Punctuation (3:01):** "the skeleton of dead stars" ends with a colon, not a full stop, before
  "white dwarfs, neutron stars, and finally black holes".

Cut: `video/short-05-hubble-sphere/edl.py`. Picks: the second super-Jupiter (the author stumbled
on the first); the third try at "black holes are the first limit…", which adds "or to the left of
it"; the second "That gas just spreads out…"; "It's weird to talk about nothing as an object"
from the voids' several tries; "But yeah," and "Okay" left out; the eighth try at "Those two
lines…"; the new bridge, "There's another interesting thing. We sort of know what someone sitting
on the edge of a galaxy far, far away would see, because we are sort of seeing it right now",
before the observable universe; the last of many tries at "it's not just one object…".

### Fact check

- **Right:** a log chart of mass and size; everything made of matter on one density diagonal
  from a mouse to the blue whale, Everest to a moon, a meteorite to a Jupiter-sized planet; a
  super-Jupiter of 10 Jupiter masses has about Jupiter's diameter; after the brown dwarfs the line
  splits, the dead stars on the left; black holes on the Schwarzschild line, and nothing above or
  to the left of it.
- **Right:** dying stars become red giants or explode as supernovae, and the gas feeds new
  stars; bigger is emptier from globular clusters to galaxies, clusters and superclusters;
  Laniakea, about 100,000 galaxies; voids are underdense, not empty, so they have mass.
- **Right:** the speed of light is the limit for travel through space, not for the stretching
  of space; at the Hubble line things recede at the speed of light; the Hubble sphere grows, so
  light sent from just beyond it can still reach us; the cosmic event horizon, a little further
  out, is the true limit.
- **Wording:** "nothing that happens **here** can ever affect us" means there (beyond the
  horizon), as in the script; the captions say what's spoken.
- **Right:** the mass inside the Hubble sphere at the critical density puts it exactly on the
  black-hole line (2GM/c² = c/H); a black hole's horizon depends on its mass, the Hubble sphere on
  the expansion rate, which depends on the density; the universe may be infinite and much the same
  everywhere.
- **Imprecise:** "46 billion light years… That's like more than double the size of the Hubble
  sphere". The observable universe's radius (46 billion light-years) is a bit over three times
  the Hubble radius (about 14.4 billion). "…more than three times the size" would be exact.
- **Right:** galaxies inside the observable universe are already beyond reach even at the speed of
  light (past the event horizon, about 16.5 billion light-years now); the observable universe
  isn't one object; its distance is where those galaxies are now, while their light left long ago.
- **Loose, fine for the line:** "We sort of know what someone at the edge would see, because we
  are sort of seeing it right now": we see a similar universe in every direction, which is what
  they would see too.

### Video 4, second cut (the author's review, 2026-10-27)

- **One take:** "Let's avoid mixing takes": rec37's lines sounded different. The cut is now rec38
  throughout, plus rec41 for the addendum; rec38's stumbles are cut around ("they form in
  stellar, they form in stellar nurseries", "they live their life on the main, then they will
  live…", a trailing "like"), and its "a millionth of a second in" is left out of the soup line.
  Its ending says "the first nanoseconds of our history" (the window's black holes formed far
  earlier, within those nanoseconds; fine as said).
- **No breath** before the first word.
- **Natural speed:** the home takes play at 1.0× (no tempo): 5:37.
- The scene: the M87* dive's photo comes in during the approach (`dive.photoAt`) and grows
  straight to full screen; the dark matter candidates on a wider view with a "Dark matter?" hub
  and arrows; a slow zoom in onto the crystals and injuries; a slow zoom back out on "the search
  for dark matter…" with the other ruled-out areas coming in one by one.
