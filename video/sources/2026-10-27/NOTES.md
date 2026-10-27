# Recordings, 2026-10-27

The Whisper word timings (medium.en, `scripts/narration-take.py`'s settings) are
`rec35.words.json` and `rec36.words.json`.

## rec35: "Hook re record.m4a" (video 1)

This is in the Google Drive "Recordings" folder: 5:13, AAC mono. It's a full run of the hook
script with retakes, opening with a mic test (0:00–0:17) and ending with several tries at a new
outro line. Not cut yet: the author is recording another take.

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
