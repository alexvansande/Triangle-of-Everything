# Recordings, 2026-11-03

The Whisper word timings (medium.en, `scripts/narration-take.py`'s settings) are `rec51.words.json`.

## rec51: "Long 1 take 1.m4a" (long video 1 and its three Shorts, one take)

In the Google Drive "Recordings" folder: 12:00, ALAC 48 kHz stereo (used as mono). The author's one-take
script for long video 1 (`video/scripts/recording-scripts.md`, "Long 1", the version of 2026-11-02), with
the *Long only* and *Short only* lines and retakes, after a mic test (0:00–0:43). It replaces the hook's
rec35 and video 2's rec33 + rec46 entirely, so all four videos are re-cut from it:

| Video | Take | Plays | Made from |
|---|---|---|---|
| Short 1, the hook | `short-01-hook` | 1:44 (was 1:50) | `video/short-01-hook/edl.py`, 14 clips |
| (source of the three below, retired) | `short-02-up-the-line` | 4:47 | `video/short-02-up-the-line/edl.py`, 27 clips |
| Long video 1 (16:9) | `long-01-intro` | 6:01 (was 6:15) | `video/cuts/long-01-intro.json`: the hook to "…the way it does", then video 2 with its *Long only* line and without the Shorts' openings |
| Short 2a, Things | `short-02a-things` | 2:41 | "If you plot everything that exists…" to "…Why does that happen?" |
| Short 2b, Planets | `short-02b-planets` | 2:02 | "If you plot everything by mass and size…" to the end |

All at natural speed (no tempo: the author, 2026-10-27), `enhance.py --plain`.

### How the lines split (as the author said on the recording)
- "So let's start with that first diagonal I mentioned" → long video 1 only ("now for the short" left out).
- "If you plot everything that exists by mass and size, on a log scale… Why?" → Short 2a only.
- "And then, suddenly, notice how everything stops being a potato shape and turns into a sphere. Why does
  that happen?" → the end of Short 2a, and in long video 1, which runs on into "That's because until now…"
  (the author: "that's the end of the second short, on the long video it just continues"). It takes the
  place of the script's *Long only* "As we move up the line, objects become rounder…", not recorded.
- "If you plot everything by mass and size, you can actually see the point where asteroids and small
  moons turn from potato shapes into spheres." → Short 2b only (its opening).
- "I've been obsessed with this chart… what I intend to do." → Short 1 only (long video 1 has no outro).

### Takes chosen
The last try everywhere, as the author prefers, except where it slips. Notable: "That's because this chart
is also a **plot** of energy" (the third try; the first, "a chart of energy", was whole but its next line
broke off); "this **image** contains all of science" (the second); "…how particles **relate to** each
other…" (the only whole try: the first breaks off at "how particles turn into–"); "I could talk about it
for hours, and that's precisely what I intend to do" (the third try, as in the script); the balloons line,
the last of five; "once a planet can hold on to them, it **will** grow into a gas giant" (the only whole
try; the first breaks off at "it can grow,"); the ending: the first try to "…the story of ordinary
matter", then the last try's "We are talking about the stuff that makes the life and death of stars" (its
"Because we are…" runs on from "veer to the left," with no pause to cut in, and the first try trails into
"…and all the weird matter that…").

### Re-cut (from re-transcribing the first cut)
Each clip of the first cut transcribed alone with a filler-friendly prompt, and the pauses listed:
- "The first thing, first thing you probably noticed" → "The first thing you probably noticed" (the cut
  after "The", into the second try's "first": both start on the "f").
- "Most, most things, though…" → "Most things, though…".
- "I could talk–  I could talk about it for hours" → the third try alone.
- "Take the arch and the hole," and "But that's really how every sky–" (false starts) left out.
- Breaths the pause cap kept (it only trims true silence), trimmed to ~0.3–0.45 s: "nitrogen, … but"
  (1.8 s), "litre. … And" (1.2 s), "riverbed. … And", "electromagnetic. … From" (the cut keeps the "-ic"'s
  release, which comes after a silence: the first try at this clipped it to "electromagnets"), "atmosphere.
  … Venus", "electrons. … Those".
- Checked and left: Whisper's "but not – but not enough" on the edit (the source has one "but not
  enough": a hallucination in the pause); "So Wurf lives" (the clip starts cleanly before a fast "So
  Earth"); breaths of ~0.7 s after "elephants.", "Argentinosaurus," and "gas." (natural).

Captions: transcribed clip by clip; corrected "activity" → "bacteria", "saplings" → "zeppelins", "argentino
sauer" → "Argentinosaurus", "weight" → "weigh", "Best" → "Past", "stronger" → "strongest", "Wurf" → "Earth",
"electromagnetism last refugee" → "electromagnetism's last refuge", "electron off" → "electrons off", "all
science" → "all of science" (the source has the "of"), and the hyphenated words joined ("lighter-than-air",
"Jupiter-sized"). "on the shore" → "chart" is a scene caption fix.

### Background noise
The author asks twice about cars (0:44 and 4:50). Measured on every pause against the room's floor, and in
the 20–60 Hz band (below the voice) across everything kept:
- **Cars/rumble, all in parts left out:** 4:39–4:41 (+24 dB in the low band, between the cube tries: the
  "so many cars" moment), 9:25 (+21 dB low, a loud knock or door, inside the 18 s pause after "…shapes
  planets"), 1:44 and 2:09 (+12–13 dB low, in a broken try and a pause the cut skips), 10:23 (before the
  third "You can see it on the chart").
- **In the cut: nothing.** The kept audio has no sustained low-frequency noise; only single half-second
  blips at plosives ("But even that pales", "split", "bigger": breath pops on the mic, mild, +10–12 dB
  below 60 Hz, and the 80 Hz high-pass takes most of them out).

### Fact check

- **Wrong, left out of the cut: "Its whole shape, air included, is about one and a half cubic metres."**
  It's one and a half *million* cubic metres (~1.56 million m³: a 125 m square base, 300 m tall); as said,
  it's off by a factor of a million. Both Whisper passes hear no "million". The cut goes from "…all the
  space inside it." to "Take out the gap on the arch, and it's about five times smaller", which still
  works (the on-screen label says "≈ 1.6 million m³"). **To re-record:** *"Its whole shape, air included,
  is about one and a half million cubic metres."*
- **Check by ear: "electromagnetism's last refuge".** Whisper hears "last **refugee**" in both passes (a
  refugee is a person; the word is *refuge*). The caption says "refuge". If it sounds like "refugee",
  re-record: *"This is once again gravity breaking into electromagnetism's last refuge: the atom itself."*
- **Imprecise, kept:**
  - "it **will** grow into a gas giant" → "it **can** grow" (as in the script): a planet has to gather the
    gas before the young star's disc is gone, and many don't (super-Earths, mini-Neptunes).
  - "Neither Mercury **or** the Moon" → "nor" (grammar).
  - "that's really how every skyscraper works: a lot of empty space held by the strongest but lightest
    skeleton possible": right as the idea (the frame carries the weight, so the rest can be empty); counted
    whole, a skyscraper is still ~300 kg/m³, about 40 times the tower, because of its floors.
  - "how particles relate to each other" is vaguer than the script's "turn into each other" (the shot
    shows the proton, neutron and electron); fine.
- **Right:** the diagonal from bacteria to galaxies; mass and size; photons with no mass; energy and
  wavelength; the three sides and the Big Bang at the corner (as before); the top as time; the
  millilitre, litre and tonne steps; the ball moving things a tiny bit to the right (+0.09 decade); sink
  and float; the air line and lighter-than-air aircraft; hippos; Argentinosaurus and the blue whale; a
  sequoia as ten blue whales; the Eiffel Tower about five times smaller without the space under the
  arches (1.56 million → ~330,000 m³, 4.7×), melted into an 11 m cube (~10,000 t of iron), almost as light
  as air counted whole (6.5 kg/m³ against 1.2); potato shapes to spheres; chemical bonds being
  electromagnetic; Mercury and the Moon without air, Venus and Earth losing hydrogen and helium; the
  visible matter mostly those two; the Goldilocks zone; Saturn at about wood's density (0.69 g/cm³); ten
  to eighty Jupiters at Jupiter's size; "once again" gravity beating electromagnetism (first the bonds,
  now inside the atoms); pressure ionization leaving bare nuclei in a sea of electrons (metallic
  hydrogen); the electrons refusing to be squeezed (degeneracy pressure) as the last stand (it holds
  white dwarfs too, and gives way past 1.4 Suns: video 3); denser, not bigger; the split at the brown dwarfs.

### Scenes
Every cue re-keyed and resolving in all four videos (`scripts/narration-frames.mjs`: "every cue found").
New: the scoreboard "Gravity 2 / Electromagnetism 0" from "once again gravity" to the end of the
super-Jupiters (the script's on-screen note), with "the atom itself", "bare nuclei, free electrons" and
"denser, not bigger" labels; the balloons line in four steps (the zeppelin and balloon, "lighter than air",
named, "floats in air"). Short 2a opens on the moth (its own scene, `short-02a-things.js`) and pushes in to
the insects; long video 1 flies from the light ("…why fire looks the way it does") to the insects across
the pause and its own line, then on as before.

## rec52: "Poeta of ten take 1.m4a" (the powers-of-ten narration)

In the Google Drive "Recordings" folder ("Poeta" for "Powers"): 10:09, ALAC 48 kHz. The author's first recording
of the powers-of-ten script (`video/scripts/recording-scripts.md`, "0 · Powers of ten"), reworded as he went,
with retakes, after a mic check (0:00–0:12). Cut: `video/short-00-powers-of-ten/edl.py`, 27 clips, **2:56**
(the author: keep it under three minutes), natural speed, `enhance.py --plain`; it goes under the zoom's 3:00
render (`public/narration/short-00-powers-of-ten/words.json`: `"audio"` now set, so the render muxes it).

The zoom is retimed to it: `video/short-00-powers-of-ten/zoom-keys.json`, a key per thing the narration names,
at the moment its name is said (the CMB at 0:12, the event horizon 0:27, superclusters 0:39, Laniakea 0:45,
the Local Group 0:54, the Sun 1:01, the nearby stars 1:04, the Oort Cloud 1:09, the planets 1:15, the Moon
1:20, North America 1:23, the sequoias 1:27, the ladybug 1:35, the amoeba 1:42, the DNA 1:44–1:50, the atom
1:53, the proton 2:09, the quarks 2:15, the terrain 2:27, the Planck grid 2:37, the gliders held from 2:44 to
3:00; the voice ends at 2:55.5). The zoom's code isn't in this repository (the render uses the author's local
zoom source, `renderSource`), so **the zoom session applies the keys to `tools/powers-of-ten/zoom-timeline.js`**
before the render; until then the narration plays over the even zoom of the last render.

### Takes chosen, and the cut to fit 3:00
The last whole try of each line. The first cut ran 4:08, with seven restarts hidden inside Whisper's merged
words. The second pass (each clip re-transcribed with a filler-friendly prompt) took out: "That– those represent
galaxies that can still–", "We live in one such small filament called the–", "Here are the local neighbour,
here are the near–", "And one of,", "We named it when we thought with– we had–", "But atoms do split
famously–", "Quantum field theory describes the universe as simply–", "relativity– at this point" and
"clashes with con–". "It weighs," and "And it's one of them" left out too. "…and they're mostly empty space"
comes from the first atom try (the second has no "empty space").

Left out to fit 3:00 (the lines that talk about what isn't on screen went first):
- "Galaxies who are now way beyond our reach, even if you could travel at the speed of light, because space
  itself is expanding, pushing those galaxies further away from us than light can travel, meaning that we can't
  even have information of them, and they will just disappear one day from us." (19 s; the event horizon's line
  says it in brief)
- "Inside this bubble, we can still see galaxies from the early childhood of the universe."
- "In a way, they represent our universe. Those are the things that can still affect us."
- "We just don't have good theories on what would happen."
- Pauses between lines 0.45 s instead of 0.6.

Captions: transcribed clip by clip; corrected "strong along" → "strung along", "Ceres and Prosema" → "Sirius and
Proxima", "On the third rock" → "and the third rock", "one tied" → "wound tight", "2 milligrams" → "two
millionths", "when he thought it hit" → "when we thought we'd hit", "the plankling" → "the Planck length",
"smaller set of rules" → "smallest".

### Background noise
- A loud bang at 9:18–9:20 (+35 dB in the low band, between "…the Planck length." and "At this point"), and
  handling noise at 9:28–9:30 (in the false start before the take used): both in pauses the cut skips.
- Smaller low-band bumps at 0:03 (the mic check), 2:06, 6:44, 8:57 and 10:02: none of them in the kept audio.
- **In the cut: nothing sustained** below 60 Hz; only single half-second plosive pops.

### Fact check
- **Wrong, left out:**
  - "We see the Moon zoom by. **It's two light-seconds away from us.**" It's 1.3 light-seconds (384,000 km).
    To keep it: *"It's just over one light-second away."*
  - "And anything smaller than this will either collapse into a black hole, **or create an antiparticle and
    disappear**." The black hole is right (to see something smaller than the Planck length you'd have to pack so
    much energy into it that it would collapse into one). The antiparticle part isn't the Planck scale: pairs
    appear when you squeeze a particle below its Compton wavelength, about 10²⁰ times bigger, at the atom-and-
    proton end of the zoom. To keep the idea: *"To see anything smaller, you'd have to pack so much energy into
    it that it would collapse into a black hole."*
  - "On its back, **a grain of pollen**, thinner than our hair": the zoom has no pollen grain under the ladybug
    (it goes to a drop of dew, then the amoeba). The cut runs "…a little bit of morning dew. And we find our
    first single-celled organism: an amoeba." (Pollen being thinner than a hair is right: 10–100 µm.)
- **Imprecise, kept:**
  - "We live in one such small **filament** called the Laniakea supercluster": Laniakea is a supercluster
    (about 520 million light-years across), not a filament. *"We live in one of them: the Laniakea
    supercluster, a hundred thousand galaxies."*
  - "every particle as just a **temporary** ripple in one of them": particles are ripples (excitations) of the
    fields, but not temporary (an electron is stable). Drop "temporary".
  - (Left out anyway) "we can't even have information of them": we still see their old light; what never
    reaches us is the light they send from now on.
- **Right:** the universe flat and, as far as we can measure, infinite, and our view limited; the CMB from
  380,000 years after the Big Bang, when light could first escape; looking out as looking back; the cosmic event
  horizon (galaxies inside it can still send light that will reach us); superclusters along filaments around
  voids; Laniakea's 100,000 galaxies; Andromeda and the Milky Way in the Local Group; one star among hundreds of
  billions; Sirius and Proxima Centauri; the Oort Cloud's billions of icy comets; the third rock from the Sun;
  the giant sequoias in the Sierra Nevada and the General Sherman, the largest tree on Earth; the amoeba as a
  single cell; DNA wound around proteins (histones), the double helix 2 nm wide; "atom" from the Greek for
  uncuttable; atoms split; electrons, protons and neutrons, mostly empty space; quarks and gluons; nobody knows
  what quarks are made of; quantum field theory's fields as a number at every point of space and time; the
  Planck length, where relativity and quantum mechanics clash; the game of life as a "maybe".
