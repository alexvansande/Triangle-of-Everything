# Recordings, 2026-11-17

## rec74: "Space dance take 1.m4a" (long video 2's new opening and the dance of the forces, a first draft)

Google Drive "Recordings" (uploaded 13:26 UTC, recorded 13:09 UTC with iPhone Voice Memos), ALAC 48 kHz stereo (used as
mono), 15:33. The script: the claude.ai doc "Long 2: Space Triangle — script" (the author's, 2026-11-13), whose italic lines
are the author's notes for the picture. Word timings: `rec74.words.json` (faster-whisper small.en on the CPU, the whole take;
the doubtful stretches re-heard with medium.en, which the cut list's comments follow). The cut's own words
(`public/narration/long-02b-opening/words.json`) are medium.en on the edit.

### The author's note on the take (0:00–1:15)
- *"I want to record now the script for the long video, and that will also work as sort of a new short for the dance of the
  forces."* A new intro and a new dance-of-the-forces part, edited together; *"we'll then jump into the black hole and dark
  matter, and everything else is built"* (the Shorts already cut).
- *"I think we can probably take out just the dance of the forces part and make a short video."*
- *"Those will be published at the same time, and when we do publish them at the same time, I want to link back all the
  other shorts that I made that are related to this, to the main video."* (For the descriptions: the long video's links
  every related Short, and each Short links the long video.)
- *"This first recording will be a draft. We'll probably edit it, and eventually we will record everything else."*
- Two asides on the take: at 5:35 *"I'm going to remove that last phrase. These bonds are all variations, etc. And the
  next one we'll do"* (the cut drops "Electromagnetism prevents things from getting too close…" and "It keeps things at the
  right distance of each other", keeps "These bonds are all variations of the electromagnetic force" and goes on with the
  next try's "It prevents things from getting too close to each other. But gravity works…"), and at 6:40 *"I think those
  two phrases should go all the way down"* (the next try joins the two sentences: "The more massive something is, the more
  gravity has an effect on it, and the less chemical bonds can keep it together").

| Video | Take | Plays | Made from |
|---|---|---|---|
| Long video 2's new opening, to the Schwarzschild line | `long-02b-opening` | 6:14 | `video/long-02b-opening/edl.py`, 53 clips, all rec74 |
| Long video 2, the new draft | `long-02b-space` (a cut) | 17:40 + 3 s credits | `video/cuts/long-02b-space.json`: the opening, then the Shorts as the script runs |
| The dance of the forces, the new Short | `short-l2b-dance-of-the-forces` (a cut) | 2:50 + 3 s credits | `video/cuts/short-l2b-dance-of-the-forces.json`, from the opening |

Treatment as rec73: `enhance.py --plain`, natural speed, the breaths out of the pauses (`debreath.py`), the room in the gaps.

### The cut
- The last try of each line unless it slips; where the author restructured (the stars' end, 11:00 on: small stars, then
  the massive ones, then the weak force), the new structure.
- **"If you squeeze a proton and an electron hard enough, it will create a neutron"** is two tries joined: the fourth's
  start (its end heard as "it will create a mess") and the fifth's end (whose start says "a proton and a few electrons").
- Hesitations cut from inside clips: between "do" and "not" (giant planets), between "add" and "even" (the strong force).
- Left as said, to re-record if wanted: **"a very single big atomic nucleus"** (no clean gap to cut "very");
  **"More massive stars… will… undergo"** keeps two long pauses (sounds between the words, not silence; cutting them risked
  the words); "the scientists used a lot" (*"that scientists use a lot"*); "each square is 10x of the last one".
- Caption fixes on the words: "along the hair" → here; "natural magnetism" → electromagnetism; "super-ejecture" →
  super-Jupiter; "nucleon" → nucleus; "nebulas" → nebulae; "white dwarf's slope" → rightward slope (what medium.en hears
  on the raw take).

### The second pass (the author, 2026-11-17: "lots of repeated words and lost phrases")
Each clip of the edit transcribed on its own, with a prompt that keeps fillers and restarts (the long-form pass had
smoothed them over), found restarts the first cut kept: "we can even include, we can even include", "and then, and then
we, and then we sort", "if you do that, you know, if you do that", "more massive star, more massive stars, more massive
stars", "their outer layers will spread. Their outer layers…", "so far our objects have been… so far", "all living stars
are, all living stars are", "and the strange, and the strangest", and tails ("…10x of the last one, you", "…limited range,
and in…", "…a neutron. One"). Each clip now starts at the last restart's first word and ends at its own last word, found
on the waveform (the start and end given in the cut list); "That's fusion" had lost its "That's" to the silence snap
(its start given). The edit transcribes clean clip by clip; 6:14 now.

### Fact check
- **Right:** a log chart of mass and size for every kind of thing; light placed by its energy (as mass, E = mc²) and its
  wavelength; most things in bands and the diagonal of ordinary matter; the electric push between electrons and the pull
  of nuclei setting the distance between atoms (chemical bonds are all electromagnetic); too big and it crushes under its
  own weight, too squeezed and the electrons push back; the diagonal as the density of atoms; tall buildings and
  everything big enough becoming round; the giant planets' column and the atoms broken into nuclei in a sea of electrons
  (pressure ionisation, degenerate electrons); super-Jupiters getting denser, not bigger; the split into brown dwarfs and
  stars; the strong force the strongest and shortest in reach, gravity pushing nuclei close enough for it to grab them;
  fusion's energy pushing out against gravity; the main sequence as the new equilibrium where stars spend most of their
  lives, kept by hydrogen fusion; massive stars' core collapse as a supernova; the weak force turning protons and
  electrons into neutrons; a neutron star as one giant nucleus held by gravity; black holes on one line, the first limit;
  any object squeezed enough becomes a black hole; nothing crosses the Schwarzschild line.
- **Wrong: "Small stars will remain with a nucleus made of oxygen and helium."** A Sun-like star leaves a white dwarf of
  **carbon and oxygen** (only the lightest stars, far in the future, would leave helium ones). To re-record: *"Small stars,
  like our Sun, will leave a core of carbon and oxygen behind, and their outer layers will drift off into a nebula."*
- **Imprecise: "Gravity is very weak compared to electromagnetism, but it works at much larger distances."** Both reach
  forever (both fall off as 1/r²); gravity wins at large scales because it only adds up (there's no negative mass), while
  positive and negative charges cancel out. *"…but it only ever adds up: there's no negative mass to cancel it out, so the
  bigger something is, the more it matters."*
- **Imprecise: "the strong force… has an even more limited range"** ("even more" than what? Electromagnetism's range is
  unlimited). *"…but it only reaches across the width of a nucleus."* (The doc has "than electromagnetism": that's the
  comparison that needs the fix.)
- **Imprecise: "neutrons, unlike protons and electrons, do not repel each other, so they will just stay put"** (as in rec57
  and rec58): what holds a neutron star up is the neutrons' refusal to be squeezed (degeneracy pressure) and the strong
  force's hard core. The rec58 suggestion stands: *"And neutrons, packed shoulder to shoulder, refuse to be squeezed any
  further, so it just stays put."*
- **Imprecise: "Their outer layers will spread out, and a new player force will enter into play"**: the weak force acts in
  the collapsing core (electrons captured by protons), not because the outer layers spread; the order reads as if one
  causes the other. *"Their outer layers are blown away, and in the collapsing core a new player enters: the weak force."*
- **Imprecise: "the ones that don't have mass will have energy level and wavelength, which turns out to be the same
  thing"**: one sets the other (E = hc/λ), fine for the video; *"…which turn out to be two ways of saying the same thing."*
- **Imprecise: "the Schwarzschild radius represents the upper limit in which anything can be"**: it's the limit of how
  small something of a given mass can be (on the chart, the top-left edge); "upper" reads as size. As rec59.
- **Imprecise: "the more gravity has an effect on it, and the less chemical bonds can keep it together"**: bonds don't
  weaken with size; the weight they carry grows faster than their strength (mass with the cube, a cross-section with the
  square). Fine as said.
- Answer to the script's question *"(how would you explain black holes using the same style we were in the section?)"*:
  in the forces' terms, a black hole is where nothing wins against gravity any more: *"Add even more mass, and even the
  neutrons give way. No force we know can push back, and gravity wins for good: everything falls in, and what's left is a
  black hole."* That would sit after the neutron star, before "So far our objects have all been around bands".
