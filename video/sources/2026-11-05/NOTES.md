# Recordings, 2026-11-05

The Whisper word timings (medium.en, `scripts/narration-take.py`'s settings) are `rec54.words.json` and `rec55.words.json`.

## rec54: "Long 2 intro take.m4a" (long video 2's opening, recorded from memory)

In the Google Drive "Recordings" folder: 14:37, ALAC 48 kHz stereo (used as mono), from Voice Memos. The
author's opening for long video 2, recorded on 2026-11-05 **from memory**: the script and the new opening
they had given on 2026-11-04 were never committed by any session (searched: every branch, the sources, and
the transcripts of the two sessions of that day), so they recorded without them, after voice exercises. One
take with many retakes ("usually the last takes are the best"), no mic test, a truck at 4:46 ("okay, I'm
waiting for the truck to go by"). It runs from the video's questions to the light-pressure cap on the
heaviest stars, so it covers video 3's own opening (rec36, up to the main sequence) and adds the cap; the
cut carries on with video 3's take from "as the fuel for fusion is used up".

| Video | Take | Plays | Made from |
|---|---|---|---|
| The opening (a piece, not a video of its own) | `long-02-intro` | 4:17 | `video/long-02-intro/edl.py`, 43 clips |
| Long video 2 (16:9) | `long-02-space` | 15:12 (was 11:54) | `video/cuts/long-02-space.json`: the opening, then video 3 from "as the fuel for fusion is used up", then videos 4 and 5 as before |

Natural speed (no tempo: the author, 2026-10-27), `enhance.py --plain`. Video 3's take still plays at 1.1×
in the cut, so the pace steps up a little at the join.

### Takes chosen
The last try everywhere, except: "Here, that delicate tension now favours gravity" (the second of two, the
first being "this is a delicate tense favoring gravity. Gravity is so strong."); "That balance is what pushes
planets to be round…" (the only whole try, after the truck); "the questions", each said once. The three
lines on the electrons ("Gravity, the core pressure is so high…", "The core pressure is so high that it's
stronger than the force pushing electrons away…", "Gravity is stronger than the repulsion force…") gave way to
the last, longest try ("There's so much weight that the inward force is higher…"); see the fact check.
- "it's a plot… it's a… a log plot of mass and size": cut at the last "a", so it runs on from "…everything
  that can ever be or ever was, a log plot of mass and size."
- "but mostly you see that most of the things in— you see… most of the universe": cut right after "that"
  (171.08, in the 60 ms dip before the first try's "most"), then the retake's "most of the universe…".
- "That trend stops once we reach Jupiter-sized planets": the sixth try; "But once they become a gas giant,
  the trend also changes. As you see," before them left out (it only announced the line).
- Whisper's late words: "Here" (459.2 in the words, spoken from 458.58) and "So right around here" (867.82,
  spoken from 867.5) have their starts given in the EDL; without them the first clipped the "H" and the
  second took in the end of the try before.
- Pauses inside clips capped (PAUSES): the 4 s hesitation in "from the smallest form [4 s] of life", the 3 s
  one in "so much weight that [3 s] the inward force".

### Left out
- "some veer to the— and some veer to the left": the "right" was skipped ("some veer to the, and some veer to
  the left"). The cut goes "…and then they split. Today, we're exploring that split." **To re-record** if
  wanted: *"Some veer to the right, and some veer to the left."*
- The truck wait, the broken tries, "Those are brown dwarfs…" (three tries before the one kept), "So they
  stay. So they will just stay like that, burning. So they just stay like that. So they just stay in that
  state." (four tries before the one kept).

### Captions
Transcribed whole (`narration-take.py` on the edit) and checked against the clips: no word lost at a join.
Corrected: "storms" → "stars" ("How were storms born?" → "How are stars born?"), "shard" → "chart",
"math" → "mass", "the telecadence" → "that delicate tension", "generate" → "degenerate", "amber" → "ember"
(see the fact check), "in -between" → "in-between", "Jupiter -sized" → "Jupiter-sized", "favors" →
"favours", "outwards force" → "outward force".

### Fact check
- **Wrong, kept in the cut: "Saturn and Jupiter, they create more heat than they receive from the Sun."**
  They *give off* more than they get, but they don't *make* more: Jupiter radiates about 1.7 times what it
  absorbs, so its own heat is about 0.7 times the sunlight it absorbs (Saturn: about 1.8 times, its own
  heat about 0.8 times). Video 3 had it right ("give off more heat than they get from the Sun"). **To
  re-record:** *"Saturn and Jupiter give off more heat than they get from the Sun."*
- **Wrong as physics, kept in the cut: "the inward force is higher than the outward force of the
  electrons pushing away from each other, and they are stripped out of their nuclei."** What gravity's
  squeeze beats when it strips the electrons is their *attraction to their own nuclei*: the atoms are
  crushed into each other until the electrons are no longer bound to any one of them (pressure
  ionization, as in Jupiter's metallic hydrogen). And what then holds the object up is not the electrons'
  mutual repulsion but the quantum rule, "matter refuses to be squeezed" (long video 1: "Those electrons
  simply refuse to be squeezed any further"). Said this way the video also contradicts itself a minute
  earlier ("Make it too compact and the electrons will push it out"). **To re-record:** *"There's so much
  weight that the atoms themselves are crushed: the electrons are stripped off their nuclei, leaving bare
  nuclei in a sea of electrons. And those electrons refuse to be squeezed any further: not because of a
  force, but because of a rule of quantum mechanics."*
- **Imprecise, kept: "This diagonal line is where they reach their equilibrium point. That's the density of
  atoms."** For most of the line gravity is not in the dance at all: a microbe, a tree or a rock has the
  density of atoms because electromagnetism (chemistry) and the quantum rule set it, and gravity is far
  too weak to compress them. Gravity joins in at a few hundred kilometres (the round worlds) and only wins
  at the planets. The lines that follow ("Make it too big and it collapses under its own weight; make it
  too compact and the electrons push it out") are right. A wording that keeps the tug-of-war: *"Most of the
  universe is a tug of war between two forces. Electromagnetism, the chemistry between atoms, holds
  matter at one fixed density: this diagonal. Gravity pulls everything inward, and the more mass there
  is, the harder it pulls. Down here it loses; up the line it starts to win."*
- **Wrong word: "burning like amber for billions of years"** → *ember* (amber is fossil resin; an ember is
  a glowing coal). The caption says "ember". And "burning": deuterium burning lasts only tens to a few
  hundred million years; after that a brown dwarf makes no energy and just cools, fainter and fainter,
  for billions of years. Suggested: *"So they just sit there, cooling slowly, glowing like an ember for
  billions of years."*
- **Imprecise: "thrown away higher than the orbital velocity of the star, and escape its gravity well"** →
  *escape velocity* (the speed to leave for good, √2 times the orbital speed; the winds of the hottest
  stars run at 2,000–3,000 km/s against an escape speed of 1,000–1,500). Suggested: *"…thrown away faster
  than the star's escape velocity, and gone for good."*
- **Imprecise: "where the largest stars live"** (and "a limit on how big they can be"): the cap is on
  *mass*. The *largest* stars by size are the red supergiants far to the right (UY Scuti), which are
  lighter. The shot names R136a1, the heaviest star known (about 200 Suns; the cap is soft, about 150–200).
  Suggested: *"the heaviest stars"*.
- **Imprecise, kept: "just protons, neutrons, and a sea of electrons"**: hydrogen nuclei are lone protons;
  the neutrons are in the helium. Long video 1's "bare nuclei in a sea of electrons" is exact.
- **Imprecise, kept: "Last time we explored from humans to brown dwarfs"**: long video 1 starts at a
  millilitre of water (the hook's diagonal runs from bacteria); humans are near the start. Fine.
- **Right:** the questions (a star and a planet; dead stars; how stars are born and die; the biggest and
  smallest black hole; most matter as black holes; dark matter; how far the universe goes); a single
  chart of everything, a log plot of mass and size; the three limits (relativity, quantum mechanics, the
  size of the universe) as the triangle's three sides; gravity pulling in (left, denser) and
  electromagnetism holding apart (right); too big collapses, too compact and the electrons push back
  (degeneracy); the trend from the smallest life to the giant planets; the balance making planets round and
  deciding their atmospheres; the trend stopping at Jupiter's size (super-Jupiters stay Jupiter-sized);
  straight up, then the split; "that delicate tension now favours gravity" (the Jupiter turn, scored
  2 × 0 again on screen as in long video 1); "what we call degenerate matter" (brown dwarfs and white
  dwarfs are held up by it); brown dwarfs as the in-between, too big for a planet, too small for a star
  (13–80 Jupiters); deuterium, the rare hydrogen, the only thing they fuse; hydrogen fusion making helium
  and energy, the outward pressure pushing the star to the right; the main sequence, where stars spend
  most of their lives; light's pressure capping the heaviest stars (the Eddington limit) by blowing their
  outer layers off.

### The voice (the author asked, after voice exercises; measured against rec53 of 2026-11-03, the last take, and rec51 for pace)
| | rec54 (today) | rec53 (2026-11-03) |
|---|---|---|
| Speech level, median | −30.7 dB | −30.7 dB |
| Level by minute | −32 to −30 dB, steady to the end | −31 to −28 dB |
| Peak | −6.3 dBFS, no clipping | −5.5 dBFS |
| Room floor | −79 dB | −75 dB |
| Pace, words per minute of speech | 119 | 140 (rec51: 151) |
| Pitch, median (10–90 %) | 122 Hz (92–194) | 126 Hz (96–213) |
| Sentence ends, last 0.4 s against the sentence's middle | −9 dB; 52 % of sentences drop over 6 dB | −12 dB; 75 % |
| Tone, 4–8 kHz / over 8 kHz, against the whole | −28 / −32 dB | −24 / −24 dB |

- **Steadier and clearer.** The level holds for all fifteen minutes (no fading as the take goes on), the
  sentence endings trail off less than last time, and the room is quieter. Keep that.
- **Slower.** About 15–20 % slower than the last two takes: more deliberate, easier to follow. In the
  finished opening it reads well; the join into video 3 steps up in pace (rec36 plays at 1.1×). If the
  rest of long video 2 is re-recorded at this pace, the old 1.1× parts will sound hurried next to it.
- **A little flatter.** The pitch is a touch lower and its range a little narrower than last time: calmer,
  but the questions at the top could use more lift (a question rises at the end). Try the first line as if
  asking a friend.
- **Warmer and duller.** Less energy above 4 kHz (4 dB) and above 8 kHz (8 dB), a little more around
  120–250 Hz: fewer sharp "s" sounds, but also less presence. That's the mic a little further away or more
  off-axis, or the softer voice. For the next take: the same distance as the last ones (a hand's width,
  slightly off to the side), and the exercises are doing no harm.
- **The retakes.** 56 pauses over two seconds; "that trend stops" took six tries, "if a star is too big" six,
  the electrons line eight, "and that energy will create an outward pressure" four. The pattern: a long
  sentence that stalls near its end, then restarts from the middle. When a line stalls twice, shorten it
  (one idea per sentence) before trying again, and restart from the start of the sentence after a beat of
  silence: the cuts come out clean (they did here) and the line reads as one.

**Against the recording tips on file** (the voice-exercise tips themselves aren't in any saved session or note: like
the script, they were given somewhere this repo can't see):
- *Mic on-axis, a hand away, the right hand* (rec40's test, 2026-10-27: on-axis is brighter by 5 dB at 4–8 kHz): today
  is 4 dB duller there than rec53, so the mic sat a little further or more to the side. Bring it back on-axis.
- *Aircon off, a quiet room*: the floor is 4 dB lower than rec53's; nothing to fix. Six low thumps in the pauses
  (the truck, the phone being handled), all in parts left out.
- *Gain* (2026-10-21: "turn the input gain up"): peaks at −6 dBFS, speech at −31 dB: right where the last takes are.
- *No breath before the first word*: none at the start of any kept clip; ten audible breaths in 126 pauses (one over
  −40 dB), against two in 31 last time, the same share. The pause cap trims the long ones.
- *Mic pops on b and p* (rec51 had a few): none in 127 b/p words today.
- *One take, don't mix takes* (the author, 2026-10-27): the opening is one take throughout.
- *Restart from the start of the sentence* (so the cut has a seam): mostly done; the mid-sentence restarts are
  listed above under "the retakes".

### Scene
`src/narration-scenes/long-02-intro.js`: the questions whipped through on the chart (Jupiter and the
Sun; the dead stars; the nurseries and red giants; the black-hole line; the primordial window; the dark
matter line; the Hubble sphere), the whole triangle with its three sides named, the hand-over from the
human to the brown dwarfs, "gravity pulls in / electromagnetism pushes out" either side of the diagonal,
the pan from a bacterium to Jupiter, the round worlds and the atmospheres, the super-Jupiter column, the
fork, then video 3's shots (the Jupiter dive, the brown dwarfs, hydrogen and deuterium on black, the
main sequence) and the top of the main sequence with R136a1 for the cap. The scoreboard shows the same
2 × 0 as long video 1 at "favours gravity". Every cue found (`scripts/narration-frames.mjs`).

## rec55: "Long 2 take 2.m4a" (the middle of long video 2, from the draft)

In the Google Drive "Recordings" folder: 17:29, ALAC 48 kHz stereo (used as mono), after the morning's rec54. The
author read the draft (`video/scripts/long-02-space.draft.md`, found that day) from the brown dwarfs to the cosmic
event horizon, after a mic test and a note to the editor (0:00–0:25): the first two minutes repeat the brown dwarfs
to the cap on the heaviest stars as a warm-up ("you told me that the first two minutes should always be counted as
a rough draft"), so the cut uses rec54 for those and starts rec55 at "That new truce…". Not recorded: "Now add
up everything…" to the end (the old rec50 carries it in the cut), and the draft's "new player" passage, which the
author struck on the take: **"No, I don't like the new player. I'm not doing the scoreboard for this. Let's stop
suggesting that"** (14:51). Also on the take, after "Whatever dark matter is, this is where it's doing the holding":
**"I'm not sure I like that phrase"** (13:52), so the phrase is out of the cut.

| Video | Take | Plays | Made from |
|---|---|---|---|
| The middle (a piece) | `long-02-middle` | 9:30 | `video/long-02-middle/edl.py`, 55 clips |
| Long video 2 (16:9) | `long-02-space` | 16:48 (was 15:12 that morning, 11:54 before) | `video/cuts/long-02-space.json`: the opening (rec54), the middle (rec55, the Short-only line skipped), then video 5's old take from "Now add up everything" |
| Eight Shorts | `short-l2a` … `short-l2h` | 1:14–2:10 with the 2.5 s opener | `video/cuts/short-l2*.json`, carved from the two takes, each with a visual opener (the axes) in place of a spoken intro |

Natural speed, `enhance.py --plain`. rec54 is brightened 3 dB above 4 kHz (`SOURCE_FX`) to sit next to rec55, which
was recorded closer to the mic.

### Takes chosen
The last try everywhere, except: the survivors' second half from the first try ("And we, everything else, the
galaxies, the stars, everything we know, are just the lucky few survivors": the last try restarts it four times),
the Hubble sphere's "You'd think their light could never reach us…" from the first of four tries (the last
stumbles: "let's call it is a little bit more complicated"), and the plant from its first try ("Now, remember this
line. It will be important": the retake breaks up). The retake of "Every diagonal on this chart represents density"
and "The further right we go, the emptier things get" (the first try of each runs on into a restart). New lines
in this take, not in the draft: "White dwarfs and super-Jupiters have the density of degenerate matter. Most of the
stuff has the density of atoms"; "They even looked at death records to make sure that it wasn't happening"; "You
take one pixel and turn it into four, or five, or ten".
- Restarts cut from inside clips: "And every search has come–" (500.8 given as the start), "or a whole asteroid's
  mass squeezing to something," (cut span), "made about," before "made of about a hundred thousand galaxies"
  (cut span), the first "and it's a very important line" (the clip is split round it).
- Starts given where Whisper merged a false start into the words: "Now" (307.45), "Galaxy clusters" (840.45),
  "Another team" (609.0).

### Left out
- The warm-up (0:38–2:50): the brown dwarfs to the cap, said again; rec54 has them.
- "An object so weird that it deserves its own video. That's only for the short": the line is in the take
  (`core-short`) and the Short "How do stars die?" ends on it; the long cut skips it.
- "Whatever dark matter is, this is where it's doing the holding" (the author's doubt), "Bigger means empty" (a
  heading read aloud), "And here, something changes" (the start of the struck passage), the aside about the new
  player and the scoreboard, "Thank you very much".

### Captions
Corrected: "both objects on our short" → "most objects on our chart", "fit exactly" → "sit exactly", "it will be
even important" → "it will be important", "protostaur" → "protostar", "lamps" → "lumps", "tough to be" → "thought
to be", "weight galaxies" → "weigh", "waited a minute ago" → "weighed", "deaf records" → "death records", "no
mother" → "no matter", "damp soup" → "dense soup", "truth" → "truce", "instance" → "instants", "nebulas" →
"nebulae"; "lucky few survivors. So that's the" put back where Whisper dropped it at a join.

### Fact check
The draft's fact check (`video/scripts/recording-scripts.md`, "Long 2 · The author's draft") stands; the take was
recorded before it was read, so these are in the cut as said:
- **Wrong for most stars: "until all that is left is a core made mostly of iron and other heavy metals… so the
  star enters in a catastrophic core collapse."** Only stars over about eight Suns burn to iron and collapse; a
  star like the Sun stops at carbon and oxygen (the take's own white dwarf, a minute later) and sheds its layers
  gently. "Heavy metals" aren't made there. **To re-record:** the paragraph in the scripts file ("The truce
  breaks when the fuel runs out…").
- **Imprecise: "or sometimes helium"** (the fuel that runs out): hydrogen first, then helium, carbon…; fine.
- **Imprecise: "They go from a few Suns to billions of stars"** → billions of Suns.
- **Imprecise: "White dwarfs and super-Jupiters have the density of degenerate matter."** Degenerate matter has no
  one density: brown dwarfs and super-Jupiters sit at 10–100 g/cm³, white dwarfs at about a million. What they
  share is what holds them up (the electrons' refusal to be squeezed). Suggested: *"White dwarfs and super-Jupiters
  are held up by degenerate matter."*
- **Right:** everything else as in the draft's check: the truce and its billions of years; the cycle of remnants,
  nebulae and nurseries; the white dwarf as carbon and oxygen; neutron stars at the neutron's density; the
  black-hole line as the top-left edge, the 45°, the Sun at 6 km and the Earth as a marble; the supermassive ones
  lighter than water (M87*, TON 618 beyond Pluto's orbit); the primordial window closed by quasars, the CMB,
  gravitational waves and microlensing, and by evaporation below; a virus-sized black hole with a small moon's
  mass; galaxies five to ten times heavier than they look; the rocks and the injuries (and the death records:
  Sidhu, Scherrer & Starkman checked for unexplained deaths); the turn; emptier the bigger; the Local Group,
  clusters bound, Laniakea's hundred thousand galaxies, voids with mass; the Hubble line at fourteen billion
  light-years, light from just beyond it still arriving, the cosmic event horizon a little further out.

### The voice, minute by minute (the warm-up the author asked about)
| minute | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| speech dB | −29 | −27 | −29 | −29 | −29 | −27 | −28 | −28 | −28 | −27 | −28 | −28 | −29 | −28 | −29 | −26 | −26 |
| pitch Hz | 144 | 133 | 140 | 139 | 130 | 146 | 149 | 153 | 142 | 161 | 158 | 150 | 136 | 150 | 138 | 147 | 150 |
| over 4 kHz dB | −23 | −23 | −26 | −25 | −26 | −25 | −22 | −19 | −20 | −22 | −23 | −20 | −25 | −22 | −21 | −19 | −25 |

- **The warm-up is real, and it's about five minutes, not two.** The voice opens up from minute 6 (2–6 dB more
  above 4 kHz, the pitch range widening) and is loudest in the last three minutes. Minutes 2–4 are the dullest of
  the take. Since the first two minutes were the repeated brown dwarfs, the dull stretch falls on the truce and the
  star's death, the first thing the cut uses. Next time: warm up with something that isn't in the script.
- **Against rec54 (the morning):** 3 dB louder, 4–8 dB brighter above 4 kHz (the mic closer or on-axis: the
  morning's note taken), the pitch a fifth higher on average (145 against 122 Hz) with a wider range: more
  projection, more lift at the ends of questions, less of the "radio" lowness. Pace 121 words per minute of
  speech, the same as the morning. Peaks −3.5 dBFS, no clipping; the floor −79 dB.
- **Retakes:** fewer than the morning, and the restarts now mostly go back to the start of the sentence, which is
  why the cut has so few splices inside clips. The ones that didn't: the survivors' ending (four tries in one
  breath), "another team realized" (four), the Hubble sphere's "You'd think" (four).
