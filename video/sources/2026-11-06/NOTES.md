# Recordings, 2026-11-06

The Whisper word timings (medium.en, `scripts/narration-take.py`'s settings) are `rec57.words.json`. Fourteen stretches
were re-transcribed on their own and spliced into it, where the long-form pass had folded restarts into one
sentence or into a stall (106–119 s, 144–152, 153–183, 224–241, 252–267, 318–337, 364–383, 374–383, 435–446,
690–699, 811–817, 1366–1374, 1518–1523, 1919–1941): the long-form
heard "Therefore, everything that exists fits inside [5 s] the triangle and [6 s] is such an interesting image"
where the take has four tries at "Therefore…"; and "sometimes that see everything as a delicate dance" where it
has "sometimes, see, see, everything is a delicate dance". The isolated passes also caught two restarts the
long-form hid inside stalls ("It's constrained by, It's constrained in three sides"; "its atoms [3.5 s] are
going to push it away").

## rec57: "Space triangle take 4.m4a" (long video 2's opening, re-recorded to the black holes)

In the Google Drive "Recordings" folder: 32:58, ALAC 48 kHz stereo (used as mono), from Voice Memos. The author's
one take of the corrected script (`video/scripts/recording-scripts.md`, "Long 2 · The opening · Script to record",
2026-11-06), after a note to the editor (0:00–0:48): *"I want to record the beginning of video long 2, roughly until
the black hole bit, and I want to really get the take correct so we can use those as shorts, and then we keep
working until the end of the long video and we keep releasing those shorts as they become ready."* Not followed
word for word, as the author said: the script was reworded on the take, and three passages are new (the strong
force at the fusion, the weak force and the neutrino at the supernova, the neutron star as a giant nucleus held
by gravity). Many retakes (the Jupiter heat line took ten, the giant nucleus twelve), a few asides to the editor
(below), the last try kept unless it slips.

| Video | Take | Plays | Made from |
|---|---|---|---|
| The opening (a piece, not a video of its own) | `long-02-intro` | 8:09 after the second pass (8:21 at first; was 4:23 from rec54 + 1:55 of rec55) | `video/long-02-intro/edl.py`, 61 clips |
| Long video 2 (16:9) | `long-02-space` | 19:14 (was 17:29) | `video/cuts/long-02-space.json`: the opening (less its Short-only line), then `long-02-middle` from "most objects on our chart", then `long-02-end` |
| Is Jupiter a failed star? | `short-l2-failed-star` | 1:33 with the 2.5 s opener | the opening from "we tend to think of planets and stars" to "glowing like an ember for billions of years" |
| How do stars die? | `short-l2-how-stars-die` | 2:44 with the opener | the opening from "But that equilibrium is kept by the fusion of hydrogen" to "deserves a video of its own" |

Natural speed, `enhance.py --plain`, no EQ (the take sits near the mic, like rec55: the voice notes below). The
pauses are the speaker's own (PAUSES 0.25/0.55/1.0 s, the gaps between clips filled with the take's room).

### The author's asides on the take (notes to the editor)
- **11:14, after "…not because of a force, but because of a rule of quantum mechanics":** *"Now, dude, you keep
  trying to push me on this rule of quantum mechanics. It's weird the way you're talking… it sounds like a lawyer
  speaking."* The line is out: the retake stops at "a bare nuclei in a sea of electrons", and the sea of electrons
  is explained the author's way ("That sea of electrons is what's keeping the planet from being squeezed any
  further"). **Sessions: stop suggesting "a rule of quantum mechanics" wording; the author doesn't want it.**
- **20:04–20:58, before the cap:** a physics question, answered under "The author's question" below.
- **26:24, after the core collapses "in less than a second":** *"Less than a second? This thing lives for a billion
  years and collapses in a second? Wow."* Left out (said to the editor), but it's a good line if you want it in:
  *"A star that lived for billions of years, gone in a second."*
- **29:18 and 30:13, at the supernova:** *"OK, you're saying the weakest force… is that called the weak force? OK"*
  and *"I think we need to sort of introduce it somehow"*: the weak force went in as "a new player force will
  enter in play: that's the weak force".

### Takes chosen
The last try everywhere, except:
- "Either way, the star is now split in two. Two distinct objects on our chart." (the third of five tries): the
  last two are fragments ("for the purpose of our chart, we will consider them two separate objects"; "the core
  and the nebula, but in either case…").
- "Add a little bit more mass, and something magical happens…": from "add", its "but" 3 s before it.
- "But if it does go supernova…": from the "but" that follows "I think we need to sort of introduce it somehow,"
  (0.7 s of silence between them; the "if" runs straight on from the "but").
- The forces: "See, gravity wants to push matter together. Electromagnetism, on the other hand, prevents it from
  pushing too close together, because electrons repel each other. So do protons." (the last whole try). The retake
  after it, "But electrons repel each other, so do protons. That is the electric force that's part of the
  electromagnetism," trails off and is left out; so is the short first pair ("Gravity wants to push matter close to
  each other. Electromagnetism wants to push it away.").
- Starts given where Whisper merged a false start into the words or put a word early: "It's constrained in three
  sides" (120.78, the restart "It's constrained by," before it), "That pushes a star out again" (1530.96, the
  false start "that pushes a star," before it), "The neutron star is really just a very big atomic nuclei"
  (1919.45), "mostly a bunch of neutrons…" (1934.75, Whisper's "mostly" a second early).
- One cut from inside a clip: the slip "That's the density of water, but most impossible." between "…falls on
  this diagonal line" and the retake "That's the density of water, but most importantly…".
- Ends given: "…until the next fuel catches: helium." (1528.6; Whisper ran "helium" into the restart after it).

### Left out
- The note to the editor (0:00–0:48), the mic test.
- The questions "Where is dark matter, anyway? How far does our universe go?" **weren't recorded this time** (rec54
  had them): the questions now end on "Is it possible that most of the matter in the universe is just them?" The
  long video still answers both; if you want them back, record the two lines (they'd go after "just them?").
- The asides above; the eleven tries at the cap ("But that line also has a limit…" took nine); the four tries at
  "Gravity squeezes the core so hard that protons… get close enough for the strong force to grab them" (the
  suggested line, read once verbatim at 16:09, then reworked into the three sentences kept); "An iron is where
  fusion stops paying. An iron is the death of magic." (the last try has "where magic dies"); the earlier tries at
  the return to the main sequence ("A sort of a new truth between gravity and electromagnetism and the force of
  the photons pushing it out", "So a star will live in this new equilibrium line for most of the lives", "So this
  main sequence star is where the tug of war will reach an equilibrium point for billions of years").
- "An object so weird that it deserves a video of its own" is in the take (`bh-short`) and the Short "How do stars
  die?" ends on it; the long cut skips it and goes "It will collapse into a black hole. And black holes are so
  weird that they are worth taking a closer look. Let's go there."

### The second pass (the author, after listening to the first cut: "lots of small false starts and wrong takes still lurking, as well as some breathing sounds")
The finished cut swept in 7 s windows overlapping by half, each transcribed on its own with a filler-friendly prompt
(the long-form pass hides a restart inside a stall, as a pause; a short window hears it). Seven restarts found and
cut, each confirmed on the raw take's energy and by an isolated transcription of the stretch, the clip now starting
at its last start (its `s` in the EDL):
- "According to the current, according to our current understanding of physics…" (the first fragment out).
- "Make it too compact and it's, make it too compact and its atoms…" (the first "Make it too compact and it's," out:
  the long-form pass had heard it as a 3.5 s stall before "are").
- "You see that, you see that, you see that the trend line…" (two false starts out).
- "Here, the delicate tension now favours gravity" said twice in a row (the first out).
- "So, as a planet, so, as a planet grows…" (the first out).
- "and it, and it just expands as a cloud" (the first "and it," out).
- "With, with no more hydrogen to burn" (the first "With," out).
Checked and left: "See, so the fire suddenly goes out" (the sweep's "See" is a breath, not a word); "it will They stay",
"Which brown dwarfs?", "So what's a planet, Guillermo?", "The YouTube store is": the window edges, not the audio.
**Breaths:** the pauses scanned for bursts well under speech and over the room (8–32 dB above the floor, 0.08–0.9 s,
clear of the words either side; a burst under 0.12 s right after a word is left alone, it's the word's tail): 34
breaths replaced by the recording's own room tone, cross-faded, so every pause keeps its length (`video/tools/debreath.py`,
new; the long-form pass's words as the map). The cut is 8:09 (was 8:21); the long video 19:14; the Shorts re-cut.
Not changed: the delivery. The author on the take: "my cadence is still forced… as if I'm reading something with a lot
of effort (which in a way I am)". For the next recording: the clean clips are the short sentences said straight
through; the ones that took five to twelve tries are the long ones. Shorter sentences, and a beat before each, would
let the rhythm come from the sentences instead of the edit.

### Captions
Transcribed whole (`narration-take.py` on the edit) and checked against each clip transcribed on its own (the
clip-by-clip pass found the one restart left, "It's constrained by," now cut): no word lost at a join. Corrected:
"shard" → "chart", "its constraints in" → "It's constrained in", "up to size planets" → "Jupiter-sized planets",
"in -between" → "in-between", "favors" → "favours", "puffes" → "puffs", "protostore" → "protostar", "Pronos" →
"Protons", "An iron is" → "And iron is", "the poor gravity" → "pure gravity", "larger stars we know" →
"largest" (as said), "You'll see" → "You see", a doubled "life" at a join, a doubled "on" ("keep on shining on for"),
"few catches" → "fuel catches" (the second pass had it right). Left as said: "a bare nuclei", "a very big atomic
nuclei" (nucleus), "what keeping", "which will eventually will collapse", "two hydrogens into one helium" (see the
fact check).

### Fact check
- **Right, and fixed from the earlier takes:** Jupiter's heat: *"almost half of the energy that keeps its temperature
  inside it is not coming from the Sun, it's actually coming from inside its own core. As it squeezes together, it
  generates heat"*: right, Jupiter radiates about 1.7 times what it absorbs, so its own heat is about 40 % of what
  it gives off, made by its slow contraction (Kelvin–Helmholtz) and the heat left from its birth. The ember ("they
  just sit there, cooling slowly, glowing like an ember"). The cap: "its outer layers… thrown so violently outside
  that it escapes its own gravity well" (escape velocity, not orbital). The star's death: hydrogen out, the core
  shrinks and heats, helium catches, a red giant; the Sun's end of the road, puffing its layers away; the biggest
  stars shrink, ignite and swell through carbon, oxygen and silicon to iron; iron costs energy to fuse; the core
  collapses in less than a second (right: about a quarter of a second for the inner core). The white dwarf as
  carbon and oxygen. The weak force deciding the collapse (electron capture, p + e⁻ → n + νₑ, is a weak
  interaction). The neutron star as "really just a very big atomic nucleus, mostly a bunch of neutrons held
  together not by the strong force but by pure gravity": right (about 10⁵⁷ neutrons at nuclear density; the
  strong force only reaches its neighbours, gravity reaches them all). The strong force "the strongest of all forces,
  but it also has a very limited range" (about a femtometre). "Electrons repel each other. So do protons." "As a
  planet grows to be more massive than Jupiter, it doesn't actually get bigger, it just gets denser" (right: the
  radius even shrinks a little up to the brown dwarfs). The three limits and their sides. "According to our current
  understanding of physics, nothing can exist outside that triangle." The diagonal as the density of water and of
  atoms. Deuterium "comes with an extra neutron". The main sequence: "the more massive a star is, the brighter it
  shines" (right, roughly L ∝ M³·⁵). The cycle through remnants, nebulae and nurseries to protostars; "richer
  materials" for the next generation.
- **Imprecise: "It turns two hydrogens into one helium"** (16:59). Helium-4 takes four hydrogen nuclei (the pp
  chain: two protons make deuterium, deuterium and a proton make helium-3, two helium-3 make helium-4 and give two
  protons back). Two protons alone make deuterium, not helium. The earlier try had it right: *"It turns the
  hydrogen into helium."* To re-record if wanted: *"It turns four hydrogens into one helium, and releases a lot of
  energy."*
- **Imprecise: "A neutrino will be sent out, carrying a huge amount of energy"** (30:43): about 10⁵⁸ of them, carrying
  about 99 % of the collapse's energy (10⁴⁶ J). *"Neutrinos will be sent out, carrying almost all of the energy."*
- **Imprecise: "because neutrons, unlike protons and electrons, do not repel each other, it will just stay put"**
  (30:48). True that neutrons have no charge to repel with; but what stops the collapse at a neutron star is not the
  absence of repulsion (that would let it fall further) but two things that push back: the neutrons' refusal to be
  squeezed (degeneracy, the same rule as the electrons') and the strong force's hard core at under half a
  femtometre, which stiffens the star up to about two Suns. The line reads as "nothing pushes back, so it stays":
  the opposite. If re-recorded: *"And neutrons, packed shoulder to shoulder like the protons and neutrons in a
  nucleus, refuse to be squeezed any further. So it just stays put."*
- **Imprecise: "around here are the largest stars we know"** (23:09): the cap is on mass; the *largest* stars by size
  are the red supergiants far to the right, lighter and cooler. The shot names R136a1, the heaviest known (about
  200 Suns). *"the heaviest stars we know"* (as in the corrected script).
- **Imprecise: "the main sequence, where stars will live most of their lives"** is said twice (17:47 at the line, and
  again at 24:36 in the truce sentence). Kept both: the second is part of the sentence the author chose.
- **Imprecise: "It's constrained in three sides"** → "on three sides"; "a bare nuclei" → "bare nuclei"; "a very big
  atomic nuclei" → "nucleus"; "the gravity is making such a high pressure, not only it's winning over that electron
  pressure" (the brown dwarfs): fine as speech.
- **Right, as physics, but note the order:** "Electromagnetism, on the other hand, prevents it from pushing too close
  together, because electrons repel each other. So do protons." What sets the density of atoms is the electrons'
  mutual repulsion plus their refusal to share a state (the same rule the author doesn't want named); protons'
  repulsion matters inside the nucleus, not for the density of a rock. Fine for the story.
- **The two questions that are gone** (dark matter, how far the universe goes): not a fact issue, but the video's
  second half answers questions it no longer asks. See "Left out".

### The author's question on the take (20:04–20:58), answered
*"Light is radiation, right? So all that energy being created inside the stars, that's photons, right? That's
radiation, that's heat, that's energy. So why are we talking about light pressure? It's the same energy. Everything
that comes out of a star is in the form of an electromagnetic wave. So we have heat in the form of infrared, we
have X-rays, we have radiation. So why are we talking about the pressure of light? Isn't everything just photons
coming out? Shouldn't they be saying that it really is a photon, and that photon creates an outward pressure?"*

Yes: it's all photons, and every photon pushes. "Light pressure" (radiation pressure) means the push of all of
them, gamma rays in the core, X-rays, visible light and infrared on the way out: heat radiating through a star *is*
those photons, and each carries momentum E/c, so each one absorbed or scattered by the gas gives it a kick
outward. In a star like the Sun that push is small next to the gas pressure (the atoms bouncing off each other),
and it's the gas that holds the star up. In the heaviest stars the core is so hot that the photon flood pushes
harder than the gas does, and the star is held up mostly by its own light. Past the Eddington limit (a luminosity
about 30,000 Suns per solar mass) the photons push harder than gravity pulls, and the outer layers go. So the
wording in the take, "if a star is too bright, then its outer layers are thrown so violently outside that it escapes
its own gravity well", is the right physics; "too bright" is exactly the condition (brightness is the photon
flood). If you want a line that answers your own question on camera: *"All that energy leaves the star as photons,
and every photon that hits the gas on its way out gives it a tiny push. In a star like the Sun that push is nothing.
In the heaviest stars it's so strong that it's the light itself holding the star up, and past a point it blows the
outer layers away."* (Also "heat" isn't a separate thing here: the infrared is photons too, and the "heat" inside the
star is the gas's motion, which gives gas pressure.)

### The voice (measured on the raw take, 0:48–32:55; the two earlier takes measured the same way on their finished cuts, `long-02-intro` (rec54) and `long-02-middle` (rec55), so their levels are after the −16 LUFS normalisation and not comparable, the rest is)
| | rec57 (today, raw) | rec54 (cut) | rec55 (cut) |
|---|---|---|---|
| Peak | −1.4 dBFS, no clipping | | |
| Room floor | −78 dB | | |
| Speech level by minute | −36 to −29 dB: the first eight minutes 3–5 dB softer than the last ten | | |
| Pace, words per minute of speech | 193 | 187 | 206 |
| Pitch, median (10–90 %) | 137 Hz (97–255) | 120 Hz (91–202) | 145 Hz (103–247) |
| Tone, 4–8 kHz / over 8 kHz against the whole | −25 / −25 dB | −23 / −22 dB (brightened 3 dB in its cut) | −24 / −23 dB |
| Sentence ends, last 0.4 s against the middle | −7 dB; 53 % drop over 6 dB | −8 dB; 59 % | −6 dB; 48 % |
| Pauses over 2 s | 87 (the retakes) | | |

- **The warm-up is there again, and it falls on the opening.** The level climbs 5 dB from the first minutes to the
  last ten; the questions and the chart (minutes 1–3) are the softest of the take, the stars' death and the cores
  the fullest. The enhance step evens the loudness, but the softer voice also has less bite. Next time, as before:
  warm up on something that isn't the script, then start.
- **Pitch and pace sit between the two earlier takes:** livelier than rec54 (the one you recorded from memory, a
  touch flat), a shade calmer than rec55. The questions rise at the end this time.
- **Tone like rec55:** the mic is where it was in the afternoon take, so no EQ in the cut (rec54 needed +3 dB
  above 4 kHz to sit next to rec55; this take doesn't).
- **No pops, no mic bumps in the kept clips.** The room is quiet (−78 dB). Six low thumps in the pauses, all in
  parts left out.
- **The retakes:** the same pattern as before, a long sentence that stalls near its end and restarts from the
  middle (the forces took nine starts, the cap nine, Jupiter's heat ten, the giant nucleus twelve). The clean ones
  are the short sentences. The author's own summary of the method on the take: "the last takes are the best", and
  it held: the last try was the keeper in 56 of 61 clips.

### Scene
`src/narration-scenes/long-02-intro.js`: re-keyed to the new words, and the stars' death, the cycle and the cores
brought over from `long-02-middle.js` (video 3's shots) keyed to the new wording. New shots for the new lines: the
three sides named before the lines are drawn; "nothing outside it / everything inside it" on the triangle; the
hand-over from humans to the planets along the diagonal, with the density of water and then of atoms; "under its
own weight" before "push it away" (the order swapped); the trend "slightly to the left, then straight up" as the
super-Jupiter column before the fork; the strong force on Proxima ("reaches only its neighbours", "protons
grabbed", "hydrogen → helium"); the electrons holding the super-Jupiters up ("more mass, same size"); the cap
with a Wolf-Rayet star blowing its layers off; the weak force at the white-dwarf limit, the neutrino's flight on
its own line ("A neutrino will be sent out"), the whip back up at "do not repel each other", "one giant nucleus"
and "held together by gravity" on the neutron star; the bridge into the black holes ("worth taking a closer look")
onto the black-hole line. Sound: ignite at "something magical happens", the heartbeat from "once it runs out" to
"split in two" (cut on the boom), the drop on "collapse into a black hole". Every cue found
(`scripts/narration-frames.mjs`), in the long cut and both Shorts too.

## The author's notes after the first render of the new opening (2026-11-07), and what changed
- **1:03, a lost "so" (sounds like "saw")**: the "So," before "on the last video" was 1.3 s ahead of "on", with the pause
  capped; cut. **1:32, "I'm saying 'see' twice"**: "See, everything is a delicate dance…" stays, the "See," before
  "gravity wants to push matter together" is cut. **2:00, "another 'see', can you cut it or it sounds weird?"**: the "See,"
  before "the thing is" cut at the 80 ms dip before "the" (it had no silence of its own); listen for it. The opening is
  8:07 (was 8:09), the captions carried over, the breaths taken out again (27).
- **"From 1:30 the whole thing should zoom into the microbes and be slowly panning up, so it reaches the planets by
  the time I say 'round', no panning up and down."** Done: from "See, everything is a delicate dance" the camera sits on
  the bacterium, then glides up the diagonal in one move, the force arrows and the two circles ("crushes under its own
  weight", "its atoms push back") placed wherever it is at the time, through the gram-sized things at "the result of
  that tug of war", the kilograms at "push it away", on up through "the smallest form of life… the larger planets", and
  lands on Ceres and Pluto at "planets to be round". No return to the bacterium (that was the "down").
- **"The Sun needs more yellow: a timid salmon orange; it needs patches of bright yellow and strong orange."** The Sun
  in the videos is drawn live by the Star Forge (`src/star-forge.js`), not from its picture: its G-star palette is now a
  stronger orange with a yellow bright, and the colour regions are on for the Sun (warm regions an F star's yellow-white,
  cool ones a K star's orange, crisp borders), so it shows as patches. To judge on the render; the forge's tuning page
  (`tools/star-forge.html`) is where to push it further.
- **"When I talk about gravity winning over electrons we should do an animation"** (the author's design: a hydrogen atom,
  its electron cloud cut open to a glowing blue circle with the proton inside and the faint back of the shell behind,
  blue arrows out "electric repulsion", other atoms crowding, red arrows in from the edges "gravity / core pressure";
  squeezed until the blue bubbles pop, tiny electrons fly out, the nuclei sit closer but not too close). Done as a
  full-screen diagram (`drawCrush`, `src/narr-diagrams.js`) from "There's so much weight" to "squeezed any further":
  the squeeze through "the atoms themselves are crushed", the pop at "stripped of their nuclei", the sea of free
  electrons from "a sea of electrons", "the free electrons hold it up" at "squeezed any further"; back to the chart's
  super-Jupiter column at "it just gets denser".
- **"Take for example Jupiter: Saturn is highlighted"**: Saturn's halo out of the three Jupiter shots.
- **"At 3:50, the brown dwarfs: you highlighted an empty space. After the deuterium cut we should be in a close-up of
  a brown dwarf and slowly zoom out."** Done: the chart comes back from the hydrogen/deuterium clips on the L brown
  dwarf, 0.7 decades wide, and zooms out through "deuterium is so rare" (1.3) and "billions of years" (2.4) to the
  fusion shot; the three brown dwarfs' pictures are forced so there's a star under the halo.
- **"The strong force bit deserves its own animation"** (the author's design: dark background, bare protons; the
  central one with a dotted yellow circle and thick arrows in, the strong force; thinner blue arrows out, "electric
  repulsion"; red arrows in at the margins, pressure; the protons pushed together until two yellow circles touch and
  merge, two protons in one circle; lots of tiny 3D photons exploding outwards, now pushing the other atoms apart).
  Done as a full-screen diagram (`drawFuse`) from "The strong force, as the name implies" to "pushing our objects
  again to the right": the reach and "very short range", the squeeze at "squeezing the protons together", the merge at
  "grab them together", "helium" at "it's helium", the burst of photons (a squiggle along the way, a bright head) at
  "releases a lot of energy", "the light pushes outwards" and the others spread apart at "outward pressure"; the chart
  returns at "the brighter it shines". Both diagrams run on the take's clock from the cue times, so a render worker can
  start anywhere.

## The author's second round of notes (2026-11-07, afternoon), and what changed
- **"The animation should end when we say it pushes stars to the main sequence."** The fusion diagram now runs through
  "pushing our objects again to the right. The more massive a star is, the brighter it shines", and the chart is back,
  with the main sequence lit, as "called main sequence" is said.
- **"When I mention the largest star we know, make it an object with an image. You have the code for that. Then do a
  dive into it and show some animation where outer layers of the star are being pushed away."** R136a1 is now one of
  the Star Forge's stars (46,000 K, a strong wind, `src/star-forge.js`), and its picture on the chart is the forge's own
  rendering (`scripts/star-forge-icon.mjs`, new: a star's icon from the forge, for the site too), with its disc frame so
  the live star lands on it. The dive sits on "thrown so violently outside that it escapes its own gravity well, and it
  just expands as a cloud": the star comes forward, and over it rings of gas drift out and fade while streaks of wind race
  ahead, "its light blows the outer layers away" (`blow`, a new drawing in `src/narration.js`, in the layer that doesn't
  dim with the chart). It unwinds by "where it ends", and "around here are the largest stars we know" shows the star on
  the chart with its label. (The first try put the dive on "largest stars we know" itself, where the next passage's camera
  move cut across it.)
- **"6:30, there's a hu-hum"** (the author, 2026-11-08: "it's a cough, that's why it's not on the transcript"). Scanned the
  whole opening for loud, noisy, unvoiced bursts: every one is a word's own fricative; nothing cough-like. Lined up with the
  render the author watched (the night of 2026-11-06, 8:09), 6:30 there is 6:27 in today's cut: "The, the outer layers", two
  short voiced "the"s back to back, a hiccup that reads as a throat-clear. The first one is cut (the clip starts at the
  second). The only other non-word sound in the opening is a quiet breath before "shrink, ignite, swell" at 5:56, left.
- **"Which will eventually will" (stellar nurseries):** the second "will" cut from inside the clip, between its two dips:
  "which will eventually collapse back into a protostar".
- **"A planet like ours says 'a planet with metals'. It should say a planet with oxygen, carbon, nitrogen, etc."** The label
  on the Earth is now "a planet with carbon, oxygen, nitrogen…".
- **"'And black holes are so weird that', and then your dive goes crazy and shows planets and then fades them. It's weird."**
  The hand-over zoomed from the black hole's close-up out to 22 decades, flying over the planets while the M87 dive was still
  unwinding, and then the middle's first cue hid every picture. Now the camera only eases out to five decades around the
  black hole, on the black-hole line, and the middle's own opening takes over at "most objects on our chart". (The Short's
  "deserves a video of its own" ending eases out to eight.)
- **"I think there's something you did on the audio edit that I sound less angry"**: nothing is done to the voice beyond
  the high-pass, the loudness and the room tone in the gaps; the breaths are replaced by room tone, which may read as calmer.
  The author will re-record the part after the black holes.

## The third round (2026-11-07, evening): the weak force, the proton's picture, a liquid crowd
- **The weak force, animated** (the author: "do the weak force animation as you described"), a full-screen diagram
  (`drawWeak`, `src/narr-diagrams.js`) from "a new player force will enter in play" to "held together not by the strong
  force, but by pure gravity", in place of the whip down to the hydrogen clip. Where the crush left off: bare nuclei packed
  close, the electron sea roaming between them, pressure at the margins. At "that's the weak force" a tiny dotted violet
  circle round each proton, the weak force's reach, "the shortest reach of all". From "protons and electrons will be
  squeezed", each nucleus's electron is pushed straight into it at its own moment (staggered over six seconds): a flash,
  the proton's picture cross-fades into the neutron's, and a neutrino, a faint fast ghost with a short trail, shoots away
  in a straight line through everything; a few per cent of the nuclei keep their proton and their electron ("mostly
  neutrons"). "The neutrinos carry the energy away" at "a neutrino will be sent out". At "do not repel each other" the sea
  is gone and the whole crowd drops to a tight pack, neutrons touching: "nothing holds it up any more"; "one giant
  nucleus" at "a very big atomic nucleus"; the margin arrows' label turns to "gravity" and "held together by gravity" at
  "pure gravity". The camera moves behind it to the view the chart comes back to at "any bigger": the white dwarf, the
  neutron star and the black hole.
- **The protons are the chart's own proton** (the author: "the proton isn't a red dot, we have a nice image of it, and it's
  a gray aberration sphere"): all three diagrams draw the chart's proton picture (and the neutron's, and the electron's,
  small) instead of dots, loaded like the galaxies in the own-universe diagram, counted by the render's `pending()`.
- **The crushed atoms start as a liquid** (the author: "show it as such, not a lattice, but a series of spheres packed
  together, some arranging in a lattice but most not, a little bit chaotic; snap it to a hexagonal arrangement only
  later"): every atom sits off its lattice point by its own seeded amount, a few nearly on it (a patch of local order),
  most well off, and the whole crowd drifts slowly; only after the pop, as the bare nuclei are packed tighter, do the
  offsets shrink away and the crowd snaps into the hexagonal packing (which, as the author noted, is the natural
  close packing in a plane, as the rhombic dodecahedron's is in three dimensions).
- **Two fixes found on the stills:** the diagram canvas picked the oldest live diagram highlight, which could be one
  fading out, so the chart showed through at a phase change (now the newest); and the lattices were a fixed number of
  rows, a band in a tall frame, so they're sized to the frame at whatever spacing they have (the pack fills it).
- **R136a1 last in the Star Forge's list**: a star's pattern seed is its place in the list, so inserting it mid-list had
  shifted the blue supergiant's, Sirius B's, the Wolf-Rayet's and the pulsar's patterns; at the end, they're as they were.
  Its icon is re-rendered with its final seed.

## 2026-11-08: the recap of the three animations, and the four Shorts for the week
The author's recap of the gravity-wins animations, applied:
1. **Gravity wins over the electric repulsion**: small protons, large blue circles, the atoms in a chaotic arrangement,
   then the sea of electrons (as built).
2. **Gravity puts the protons within reach of the strong force**: medium protons, the smaller yellow circle; two circles
   touch and join and the atoms fuse; the crowd has patches of hexagonal order but is not a rigid lattice (each proton a
   little off its point, a third of them nearly on it); the explosion of photons.
3. **Gravity merges the protons**: large protons practically touching; at the pack they transform, suddenly (0.7 s), into
   a tight rigid lattice of neutrons, with a shower of neutrinos (three from each change).
The "hu-hum" at 6:30 is a *pigarro* (a throat-clear), not a cough: voiced, so the scan for unvoiced bursts could not have
found it. The doubled "The, the outer layers" at that spot (6:27 in the cut the author watched, both sounds voiced and
short) is cut; the author listens to confirm.
**The Shorts for next week** (the author: "add the long and the four shorts to tonight's render queue"), carved from the
opening with the axes opener: "Is Jupiter a failed star?" (1:30), "What makes a star a star?" (1:18, new: the fusion
animation and the R136a1 dive), "How do stars die?" (1:34, re-sliced to end on "a planet full of life, like ours"), and
"What's left when a star dies?" (1:08, new: the weak-force animation and the black hole). All queued with the long video.
