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
