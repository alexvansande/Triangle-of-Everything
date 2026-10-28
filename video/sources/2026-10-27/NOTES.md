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

## rec44, rec43, rec45: video 4, re-recorded at home

(Numbered rec43–rec45 so as not to clash with the video 6 and 7 recordings, rec38, rec39 and
rec42, numbered in another session the same day.)

The author's first home recordings (QuickTime, AAC 48 kHz, in iCloud
`Projects/triangle/recordings/`; the car takes are the Google Drive ones). Whisper word timings:
`rec44.words.json`, `rec43.words.json`, `rec45.words.json`.

- **rec44**, "New Black holes take.m4a" (7:32): the whole video 4 script with retakes, after a mic
  test. Complete, though the author thought it hadn't recorded.
- **rec43**, "New Black holes take 3.m4a" (6:41): the whole script again.
- **rec45**, "more on dark matter search.m4a" (2:05): a new passage after "…something completely
  different": dark matter, if it's real, is somewhere on this chart, and people have crossed off
  areas of it (ancient crystals, people's heads exploding).

How the rooms compare (same measurements on the car takes rec35 and rec36): the home noise floor is
about 3.5 dB lower (−81.5 vs −78 dBFS), with a little more room tail, more air above 8 kHz, and in
rec44 about 3 dB more at 100–300 Hz (closer to the mic). rec44 gets `SOURCE_FX` (−3 dB at 180 Hz,
+3.5 dB) to match rec43.

Cut: `video/short-04-black-holes/edl.py`, 25 clips; the cut runs 5:52 and plays in about 5:20 at
1.1×. Mostly rec43; rec44 for the stars (rec43's has long hesitations), "They'd float if you had a
big enough pool", the soup (rec43's adds "a millionth of a second in", see below) and the ending
(rec43's tries say "the first nanoseconds" and stumble); rec45 for the new passage. Repeats the
long-form transcript hid, found by re-transcribing every clip, and left out: "…it's a white dwarf.
Depending on its mass…", "they're thought to be, they're thought to be", "but it's still possible
that what we think of, but…", "Look, or maybe not" (rec43's own "Or maybe not…" is used), and "But
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
- **Wrong, left out of the cut:** rec43's "the very first moments of the Big Bang, like a
  millionth of a second in". A primordial black hole forms with about the mass inside the horizon
  at the time, ~10¹⁵ g × (t / 10⁻²³ s): a millionth of a second makes ones of about the Sun's
  mass, not the asteroid-to-moon masses of the window (10¹⁷–10²² g, formed ~10⁻²¹–10⁻¹⁶ s in).
  rec44's "the very first moments after the Big Bang" is used.
- **Imprecise, left out:** rec43's "in the first nanoseconds of our history" (the window's ones
  formed far earlier); rec44's "first moments" is used.
- **Right:** quasars, the microwave background, gravitational waves and microlensing have all
  narrowed the window; the small ones would have evaporated by Hawking radiation; a small moon's
  mass (Hyperion, 5.6×10²¹ g) makes a horizon ~17 nm across, virus-sized; an asteroid's (Eros,
  6.7×10¹⁸ g) about a fifth of an atom; galaxies weigh up to ~10× what we see; most matter is
  dark; neutron-star studies may close the window further (contested).
- **Imprecise (as in the script):** "we wouldn't need any new particle": true of the particle,
  but making that many in the early universe still needs something unusual.
- **rec45, imprecise:** "if it's not just an error in the mathematics". The alternative to dark
  matter is a different law of gravity (modified gravity), not a maths mistake. Suggested: "Maybe
  it isn't a thing at all, and we just have gravity wrong."
- **rec45, right:** macroscopic dark matter of some masses would have left tracks in ancient mica
  crystals, and none are seen (Price & Salamon 1986; Jacobs, Starkman & Lynn 2015).
- **rec45, dramatized:** "people's heads would just be randomly exploding, and they took the
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
records: never happened". It replaces rec45 in the cut (28 clips, 5:43; 5:11 at 1.1×), with a
small treble lift (`SOURCE_FX`) to match rec43; "Look, or maybe not" comes from rec41's second
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

- **One take:** "Let's avoid mixing takes": rec44's lines sounded different. The cut is now rec43
  throughout, plus rec41 for the addendum; rec43's stumbles are cut around ("they form in
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
## rec38: "Draft for the video 6, the tiny universe.aifc" (video 6, draft)

In iCloud `Projects/Triangle/recordings`: 15:14, 48 kHz stereo PCM. A **draft of ideas**, not a
take to cut: the author talks through the chart from humans down to the Compton line, ending on
gamma rays as the hook for a video on wavelengths. Opens with notes to the editor (0:00–0:38).
Transcript: `rec38.transcript.txt`; word timings: `rec38.words.json` (medium.en with a
filler-friendly prompt; times are on the raw recording, no tempo). It's numbered rec38 so the
"Hubble sphere.aifc" recorded just before it can be rec37.

The story built from it and the script to record are in `video/scripts/recording-scripts.md`
under "6 · The tiny world".

What's in it, in order (raw times):
- 0:40 Recap: the two edges so far, and a third, the limit of how small something can be. "But
  let's start with us." (1:16) is a good line.
- 1:22 The human: size and mass, log rounding, "we assume everything is spherical" ("the famous
  spherical cow": Whisper heard "spherical call").
- 2:12–2:51 Water and air density lines (sink/float, balloons, soap bubbles).
- 2:58 Down the animals: tiny moths, ants, a grain of sand, amoebas and tardigrades, pollen.
- 3:38–4:13 Aside on units (kilogram, pound, ounce, gram; why metric fits the grid).
- 4:16 Red blood cell, bacteria; 4:40 where biology ends and chemistry starts: viruses, prions.
- 5:19 The kingdom of molecules: ribosome, ferritin, antibodies, haemoglobin, DNA and its four
  bases, simpler molecules, water, atoms.
- 5:56–6:23 Aside: microbiology sits just left of the water line, which is why centrifuges work.
- 6:46 Atoms: mass from the nucleus, size from the electrons; hydrogen → helium → lithium; the
  sawtooth that is the periodic table; alkali metals; palladium is weird; lanthanides, gold,
  silver; heavy and radioactive elements; oganesson.
- 10:15 The hook: follow the line down and you reach the third edge, the Compton line.
- 10:43 Units become electron-volts over c²: E = mc².
- 11:37 Why nothing can be smaller than its wavelength (squeezing it makes particle–antiparticle
  pairs).
- 12:50 The water line meets the Compton line near X-rays and gamma rays; gamma rays as the
  energy of matter (said twice; the second, 14:30–15:10, is cleaner); the hook to wavelengths.

### Fact check

Checked against the chart (`src/objects.json`, the element dust in `src/dust.json`) and the
physics.

**Wrong** (fix before recording):
- **Sink and float are swapped.** "Everything to the right, like the rocks and the golden
  record, will sink, and everything to the left… will float" (2:20 and again at 2:38). On this
  chart left of the water line is denser (smaller for its mass): it sinks; right floats, as video
  2 says. Suggested: "Everything to the left of it is denser than water, and sinks, like this
  meteorite. Everything to the right floats, like a soccer ball."
- **The Golden Record is a bad example of sinking.** It's copper, so it really sinks, but the
  chart measures it as a ball as wide as the disc, so it sits on the *floating* side. Either drop
  it or use it on purpose for the spherical cow: "the Voyager Golden Record is solid copper, but
  as a ball as wide as the disc it would float."
- **Soap bubbles don't float.** They sit right on the air line (log mass −1.70 against −1.76 for
  air): about as dense as air, a touch heavier, which is why they drift and slowly sink. Party
  balloons ("portable" in the transcript) are the ones lighter than air. Suggested: "Party
  balloons float in air. Soap bubbles sit right on the line: that's why they drift."
- **"Water balloons… will float"** (2:27): a water balloon is water, so it's on the line.
  Drop it.
- **Red blood cell: "one picometre… one picogram"** (4:16). It's about 7–8 micrometres across
  (the chart's radius is 3.7 µm) and weighs about 30 picograms. Suggested: "a red blood cell,
  about seven thousandths of a millimetre across." (The chart has it at 10⁻¹⁰ g = 100 pg, about
  3–4× too heavy; a catalogue fix to log mass ≈ −10.6 is worth considering.)
- **Helium is four times hydrogen's mass, not twice** (7:13). Helium has two protons *and* two
  neutrons; the chart shows it 0.6 decades (4×) above hydrogen. Suggested: "Add a second proton,
  with two neutrons to hold it together, and you get helium: four times the mass."
- **Heavy elements aren't made in the cores of stars** (9:25, "uranium… only formed in the core
  of stars"). Fusion in star cores stops at iron. Gold and uranium come from neutron-star mergers
  and supernovae (the r-process) and from dying giant stars (the s-process). Suggested: "Up to
  iron, elements are forged in the cores of stars. Everything heavier, like gold or uranium, takes
  something more violent: exploding stars and colliding neutron stars."
- **Wavelength is *inversely* proportional to energy, not directly** (11:45). Later (12:13) the
  draft gets it right ("inversely proportional to the mass"). Suggested: "the more energy
  something has, the shorter its wavelength."
- **"Gamma rays are what you get when you convert energy to matter"** (14:46) is backwards:
  matter to energy. And the crossing is not *because* gamma rays are the energy of matter: see
  the next point for what the chart really shows.

**Imprecise:**
- **Why the water line meets the Compton line near gamma rays.** The crossing is at about 66 keV,
  where X-rays turn into gamma rays (log size −9.5, log mass −27.9). That is mostly a coincidence
  of where ordinary density happens to sit; nothing nuclear sets it. What *is* exact, and makes a
  better hook: **every particle and every photon sits on the Compton line itself.** The chart puts
  a particle at its (reduced) Compton wavelength ħ/mc and light at its (reduced) wavelength ħc/E,
  so size × mass is the same constant for all of them (log R + log M = −37.45: the electron, the
  gamma ray, the X-ray, visible light, FM radio). The third edge is lined with light, from radio
  waves at the top to gamma rays at the bottom. And an electron meeting its antiparticle turns into
  two gamma rays of exactly the electron's energy, which land on the electron's own dot (511 keV).
  That's "matter becomes gamma rays", said right. Gamma rays in radioactivity come from the
  nucleus settling down, because nuclear energies are around a million electron-volts.
- **"Squeeze it and it becomes a particle–antiparticle pair and disappears"** (12:35). The
  particle doesn't vanish: the energy you put in makes *new* pairs, so you no longer have one
  particle in a small box but a crowd of them. Suggested: "squeeze it any tighter and the energy
  you put in just makes new particles: pairs of matter and antimatter."
- **"Nothing can cross this"**: nothing sits on the far side of it; things are fine on the big
  side. Suggested: "nothing can be smaller than its own wavelength."
- **The black hole line, "which nothing can be more massive"** (0:58): more massive *for its
  size*. Suggested: "the black hole line: nothing can be more massive for its size."
- **"We measure atoms in electron-volts"** (10:50). Atoms are usually weighed in daltons (atomic
  mass units); electron-volts over c² are for particles. Suggested: "down here, physicists stop
  weighing things in grams and start using electron-volts."
- **The human: "roughly one metre… two metres, a hundred kilos"** (1:22–1:51). The chart's size is a
  radius: 85 cm, half a 1.7 m person's height, and 80 kg. Fine on a log chart, but say it once,
  clearly: "This is a human: about two metres tall, and around a hundred kilos. On a log chart
  that's close enough."
- **"We assume all sizes are spherical"**: the chart uses half the longest dimension as the
  radius (a human is not a sphere of water, which would be only 53 cm wide). The spherical cow
  joke still fits.
- **Viruses: "Biologists don't consider them alive"**: it's debated. "Most biologists don't
  count them as alive."
- **Prions "able to multiply themselves"**: they don't copy themselves; a misfolded prion makes
  normal proteins fold the same wrong way. Prions and **ferritin** are not on the chart (it has
  the ribosome, antibody, haemoglobin, insulin, DNA, ATP, fullerene, glucose and the four bases).
- **"DNA is made of those four molecules"**: its code is written in four bases, on a backbone of
  sugar and phosphate. And the chart's DNA dot is a short stretch, about one turn of the helix
  (~10 base pairs, 6,700 daltons), not a chromosome.
- **Centrifuges**: right that cells, viruses and organelles are denser than water (about 1.05–1.4
  g/cm³), so they settle. On the chart that shows for bacteria and viruses; the red blood cell and
  the ribosome land on or just right of the line because the chart measures them as balls (a cell
  is a flat disc).

**Right:**
- An atom's mass is almost all nucleus and its size is the electron cloud. Helium is smaller than
  hydrogen (its doubled charge pulls the electrons in), and across each period atoms get heavier
  but smaller, then the next alkali metal balloons out with a new shell: the sawtooth on the chart
  is the periodic table.
- **Palladium is weird**, and the chart shows it: its calculated radius (log −8.23) is much
  smaller than rhodium's or silver's (−7.83, −7.84), out towards the noble gases. It's the only
  element that leaves its period's new outer (5s) shell empty: its ten outer electrons sit in a
  full inner (4d) shell, so it's nearly as compact as a noble gas.
- Oganesson (element 118) is the heaviest element ever made, a few atoms at a time; everything
  past bismuth is radioactive.
- Electron-volts over c² are a unit of mass via E = mc².
- You can't confine something to less than its Compton wavelength: it takes energy around mc²,
  enough to make new particles. The Compton wavelength is inversely proportional to mass, which is
  why the line slopes the way it does.
- The water line does meet the Compton line between the X-ray and gamma-ray dots.

**Wording:** "spherical call" → cow; "portable" → party balloons; "red-blue cell" → red blood
cell; "bacterias" → bacteria; "what makes everyone DNA" → "what makes every one of us: DNA";
"alkenine" → alkali metals; "a Ganesan" → oganesson; "rabbit road" → rabbit hole; "relieve" →
release.

## rec39: "wavelengths take 2.aifc" (video 6)

In iCloud `Projects/Triangle/recordings`: 15:17, 48 kHz stereo PCM. One take of the video 6
script (`video/scripts/recording-scripts.md`) with retakes. At 11:54 the author drops the
script's electron ending for radioactivity ("I wanna talk about radioactivity… a much cooler
story") and records that instead (13:18–14:16). 8:33–8:48 has stray audio from something else
playing ("the story is short, we've lost everything that exists…"), left out. "wavelengths take
1.aifc" (7 min, 17:53) is not used. Transcript: `rec39.transcript.txt`; word timings:
`rec39.words.json`.

Cut: `video/short-06-tiny-world/edl.py`, 44 clips. The take runs 15:17, the cut 6:24, and it
plays in 5:49 at 1.1×. The full Whisper pass dropped "a centrifuge works. Spin them fast
enough" (3:01–3:06) and heard "You can squeeze" for "can't"; a re-listen of those seconds has
both right, and both are in the cut. Picks are noted clip by clip in the EDL.

Caption words corrected: "theory" → series; "math" → mass; "boxing by" → boxed in by; "shard"
→ chart; "fuels" → fills; "denser on sinks" → and sinks; "bend" → band; "this malus insect" →
the smallest insects; "red-blued" → red blood; "7,000th" → seven thousandths; "than bacteria"
→ Then; "a thousand viruses" → cells and viruses; "the factory of the beauty of proteins" → that
builds your proteins; "It's code" → Its; "clouds" → cloud; "four times mass" → the mass;
"electron" → electrons; "in the wall" → on; "weighting" → weighing; "divided" → Divide it;
"You can squeeze" → can't; "we are following" → were; "density water line" → density of water
line; "comes at the" → comes as; a stray "Okay," and a doubled "and" Whisper added; "That's a
story" → the story; "X -rays" → X-rays. The black-hole clip opens on "nothing" (Whisper
heard a "For" before it); the captions start at "Nothing".

### Fact check

The take follows the fact-checked script, so most of it is right as read. New in it:

- **Wording:** "from radio waves **up** here to gamma rays **down** here" is backwards against
  the picture: on the chart radio waves sit at the bottom right of the Compton line and gamma
  rays higher up, towards the top left. Suggested for a re-record: "from radio waves down here
  to gamma rays up here."
- **Imprecise: the radioactivity ending.** Right that a decaying nucleus ends up a little
  lighter, a bit of its mass turned into energy, and that nuclear gamma rays are what comes out
  (their energies, about 0.1–10 MeV, are nuclear energy levels). Three things are loose:
  - Most of a decay's energy goes into the alpha or beta particle's motion, and many decays send
    out no gamma ray at all. "It emits a little bit of gamma rays" can stay.
  - "Which is right here" points at the crossing (about 66 keV, where X-rays turn into gamma
    rays). Decay gamma rays mostly sit a little higher up the line: the chart's "Gamma Ray" dot
    is 1.2 MeV.
  - Put right after "it crosses the Compton line right here", it reads as if that's *why* the
    water line crosses there. It's mostly a coincidence (see rec38's fact check).

  It works as a hook. If re-recorded, a tighter line: "When a radioactive atom decays, the
  pieces weigh a little less than the atom did. That bit of mass becomes energy, and some of it
  flies out as gamma rays, right up here."
- **Right:** helium four times the mass of hydrogen and smaller; lithium's new shell; the
  sawtooth as the periodic table; palladium's empty outer shell (the only element whose ground
  state has no electron in its period's new s shell: [Kr] 4d¹⁰); iron as the last element fused
  in stars' cores, heavier ones from supernovae and neutron-star mergers; everything past bismuth
  radioactive; oganesson the heaviest made; eV/c² and E = mc²; you can't squeeze something below
  its wavelength without making new particle–antiparticle pairs; the Compton wavelength shrinks
  as mass grows.

## rec42: "wavelengths take 1.aifc" (video 7)

This is in iCloud `Projects/triangle/recordings` (recorded **at home**): 6:59, PCM 48 kHz, the same
voice on both channels. It's one run of the draft script in `video/plans/wavelengths.md` with
retakes, a new passage on why the Compton line runs at 45°, and a spoken note about the visuals.
The Whisper word timings (medium.en, filler-friendly prompt) are `rec42.words.json` and
`rec42.transcript.txt`.

Cut: `video/short-07-wavelengths/edl.py`, 32 clips. The take runs 6:59 and the cut 4:18. It plays
**as recorded, with no speed-up** (the author, 2026-10-27: new takes aren't sped up any more).
Picks:
- The opening is the second try ("I've been exploring this chart…"). The mic check ("first
  recording for video 7, I guess?") and "And we," are left out.
- "Gamma rays are photons, they are particles of light" is the second try. The first breaks
  off into "uh…".
- A "yeah" between "shorter wavelength" and "less energy" is left out.
- The Compton line: "That's why the Compton line runs at a 45-degree angle" (second try), then
  "at this scale we look at energy instead of mass, they are the same, and we look at wavelength
  instead of size. And the more energy, the shorter wavelength. And that's one of the limits of
  our triangle." The restarts in between are left out, along with "so almost everything falls
  into the downward 45-degree line. That's a contour line. That's also the limit of how any".
- The spoken note (1:59–2:42) and the retakes of "This is the Earth" are left out (the note is
  below).
- "It's a label your brain puts on a wavelength" is the second try; the first says "puts out".
- Infrared: "Now let's go all the way back down to infrared" (second try), then "Warm land
  glows, cold cloud tops are dark" (the last of four tries).
- "Not all light comes from the same place" is the second try. "So let's try to put, see them in
  a log scale…" and "It's the only way to be able to see different kinds" are left out.
- "Every wavelength is a different window" is the first try.

The cut was re-transcribed clip by clip and is clean: no false starts, repeats or ums left.

Caption words corrected: "Gamma rays or photons are" → "Gamma rays are photons, they're" (the
audio has the latter); "wavelength as instead of size" → "wavelength instead of size" (a filler
"as", too joined-up to cut); "the answer on," → "to:"; "or air" → "our air"; "X-rays and Earth go
dark, or atmospheres stop" → "X-rays, Earth goes dark: our atmosphere stops"; "the most energetic
lighter is" → "light there is"; "smashes" → "smash"; "called the cold clouds" → "cold clouds"; "sea,
ice" → "sea ice"; "moon orbit" → "Moon's orbit"; "sun" → "Sun"; "the star around us" → "stars";
"galaxy magnetic" → "galaxy's magnetic"; "An X-ray" → "And X-rays".

### The author's note in the take (1:59–2:42), done

> instead of having that visualizer on top, I want the ranges to be shown on the Compton line…
> we show the visualizer on the back. We hide the elements. We hide the labels. We hide the
> background. We just show the visualizer with the Compton line, and as you go through the
> Compton line, it shows the labels, but also the colors… the colors we see.

Done: from "Now let's go back to visible light", the explorer fills the screen behind the chart's
Compton line. Its own spectrum bar is hidden, and everything else on the chart goes. The line
carries the colours we see (380–750 nm, as a rainbow), the selector's red, green and blue ranges
glowing at their wavelengths, and the photons' names, which light up as a range passes them. The
chart's camera follows the selector along the line: close in (3 decades across) for the colours,
since visible light is a sliver of the line to scale, and wider for gamma rays and radio.

### Fact check

- **Right:** gamma rays are photons; every photon is the same kind of particle, differing only in
  energy; more energy, shorter wavelength (E = hc/λ).
- **Right:** "the Compton line runs at a 45-degree angle": mass goes as 1/size along it (slope −1 on
  log-log axes with equal decades, which the chart has), and photons sit on it by their energy
  (as mass, E/c²) and wavelength. "One of the limits of our triangle": it's the quantum edge,
  since nothing can be pinned down smaller than its own Compton wavelength.
- **Imprecise:** "at this scale we look at energy instead of mass, they are the same". They're
  equivalent (E = mc²), which is how photons, with no rest mass, get a place on the mass axis.
  Suggested: "…we look at energy instead of mass (E = mc², they're equivalent)…".
- **Right:** three kinds of colour sensors (cones); infrared as red, red as green, green as blue is
  a one-step shift towards longer wavelengths; plants reflect strongly in the near-infrared; bees see
  ultraviolet.
- **Imprecise:** "Not if you're talking about bees" works as a joke, but bees don't see red at all
  (their cones peak in UV, blue and green), so "the red we see" doesn't exist for them.
- **Right:** in ultraviolet, Earth shows smoke and dust (OMI's aerosol index).
- **Imprecise (the draft script's wording):** "There's no full map of the sky in ultraviolet, our air
  blocks it, so you have to go to space to see it." The air is why UV astronomy happens in space,
  but it isn't why there's no full map: space telescopes (GALEX) have mapped most of the sky, just
  not all of it. Suggested: "There's no complete map of the sky in ultraviolet: our air blocks it,
  and no space telescope has covered the whole sky yet."
- **Right:** X-rays: the atmosphere stops them; hot gas at millions of degrees; X-ray binaries ("pairs
  of stars where one is eating the other"). Gamma rays: the Galactic plane glows where cosmic rays
  hit gas, plus pulsars and blazars.
- **Right:** thermal infrared: warm land bright, cold cloud tops dark. Near-infrared passes
  through the dust towards the Galactic Centre. Far-infrared shows the cold dust where stars form.
  Microwaves: Earth's water vapour, rain and sea ice, and the sky's cosmic microwave background.
- **Imprecise:** "Further up, X-rays, Earth goes dark". Spoken as "X-rays and Earth go dark";
  captioned with the meaning.
- **Right:** the Moon's orbit is 1.28 light-seconds; the Sun 8.3 light-minutes; the nearest
  stars a few light-years (Proxima, 4.2).
- **Right:** visible light from stars nearby; infrared further through the dust; radio from
  cosmic-ray electrons in the galaxy's magnetic field and from radio galaxies billions of
  light-years away; microwaves from the edge (the CMB). **Imprecise:** "X-rays and gamma rays
  from the most violent things": true of the sources, but the diffuse gamma glow is cosmic rays
  hitting ordinary gas.
- **Wording:** "light-second", "light-minutes", "light-years" (hyphenated in print);
  "Moon's orbit".

### Second pass (the author's notes of 2026-10-27, evening)

- **Fillers and false starts:** re-transcribed clip by clip. Two false starts were left in and
  are now cut: a stray "of" before "instead of size" (raw 96.24–96.64) and a cut-off "cold—"
  before "cold clouds" (raw 299.14–299.6). "Infrared, or, as we see, heat" stays (phrasing, not
  a filler). The cut is 4:16. The captions keep their corrections.
- **The north pole glowing in X-rays was not aurorae.** Earth has no X-ray band in the explorer.
  The selector's red channel at c = 25.5 sat half on the ultraviolet slot, and OMI's aerosol-index
  map ends at about 78°N in a ring of index 3–4.5 all the way round (the edge of its coverage), with
  a flat fill north of it. The build now leaves OMI north of 78°N empty (inpainted, like any gap:
  `scripts/build-earth-spectrum.mjs`), and the X-ray beat uses a narrower selector (s = 0.5) so all
  three channels are X-rays and Earth is truly dark. Real Earth does glow faintly in X-rays
  (aurorae), but no global map of it exists.
- **Frame check against the words** (every beat rendered and read against the explorer's band
  mix; the "what you see" lines are in `video/scripts/recording-scripts.md`):
  - "In ultraviolet, Earth shows its smoke and dust": the selector had moved on to c = 23.6, where
    the sky's blue was 62 % X-rays while the words say there's no UV sky map. It now holds at the
    bee's shift (blue = Earth's UV aerosol index and the sky's empty UV slot).
  - "Infrared goes straight through the dust that hides the center of our galaxy": the camera
    was looking at the anticentre. Earth's turn is re-phased (its picture is all daylight, so the
    turn is free): the Galactic Centre is behind Earth at that line, the galactic plane behind it
    for gamma rays and cold dust, and the Amazon still faces us at "the forests light up".
  - "Earth shows its water: vapor, rain, sea ice": the microwave beat shows rain, ice clouds and
    sea ice (GMI 89–166 GHz) and the air's oxygen (57 GHz); water vapour's band (23.8 GHz) only
    comes up in the radio beat. Imprecise, not wrong; a re-wording is in the script.
  - Everything else matches: natural colour; plants red in near-infrared; Earth black in X-rays
    and gamma rays; hot gas and X-ray sources; the galactic plane in gamma rays; warm ground and
    cold cloud tops at 11 µm; cold dust; the CMB; each distance named while it's said.
