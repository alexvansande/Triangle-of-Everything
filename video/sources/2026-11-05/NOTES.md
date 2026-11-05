# Recordings, 2026-11-05

The Whisper word timings (medium.en, `scripts/narration-take.py`'s settings) are `rec54.words.json`.

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
