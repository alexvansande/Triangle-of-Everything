# Recordings, 2026-10-26

Both were recorded from the edited scripts in `video/scripts/recording-scripts.md`. The Whisper
word timings (medium.en, `scripts/narration-take.py`'s settings) are `rec33.words.json` and
`rec34.words.json`. In a few places Whisper merged a restart into one long word: there the
EDLs give the retake's real start (`s`), found from the speech runs and checked with small.en.

## rec33: "Video 2 new take.m4a" (video 2)

This is in the Google Drive "Recordings" folder: 8:14, AAC mono. It's a full run of the video 2 script with
retakes. The mic stayed on the whole time. The one long silence (7.7 s at 2:21) is a
pause between tries.

Cut: `video/short-02-up-the-line/edl.py`, 21 clips. The take runs 8:14, the cut 4:20, and it plays in
3:57 at 1.1×. Picks:
- The walk up the line is from the second try ("…one step to the side", "density of one gram per
  cubic centimetre"), then "You just walk three steps up in the mass axis".
- The animals' first lines are from the second try. The hippo is from the first try, because the
  second one says "bounces around the riverbed".
- "Elephants, or the Argentinosaurus" is used. The "dinosaurs" and "tyrannosaurs" tries are left out.
- The rocks line is the last of six tries ("…and the pyramid, which is a little bit in both
  categories").
- Goldilocks is the second try. Saturn is the second "You can see that on the chart…" run.

Caption words corrected in words.json (said right, misheard):
- "you can't draw a line" → "can". Both models heard "can't". The other tries say "can", but this
  one is worth a listen at 1:13.
- "then as an Earth do" → "Venus and Earth do"
- "gold lock" → "Goldilocks"
- "less dense on water" → "than"
- "geoptericized" → "Jupiter-sized"
- "aircrafts" → "aircraft" (said with an s)

### Fact check

All the fixes from the 2026-10-23 fact check are in:
- "most of the *visible* matter in the universe"
- "one millilitre of water weighs one gram"
- "a density of one gram per cubic centimetre"
- "even 80 times"
- "on Earth"
- Venus and Earth "do" (have an atmosphere), no longer "a very dense" one

The new parts:
- **Right:** below a few hundred kilometres, rock and ice keep their shape through their
  chemical bonds; above that, gravity wins and pulls bodies round. Mercury and the Moon
  have no real atmosphere, only a trace exosphere. Earth and Venus hold on to heavy gases but
  lose hydrogen and helium. A planet that keeps those two can grow into a gas giant.
- **Right:** the "gravitational Goldilocks zone". Whether a gas escapes depends on the
  planet's escape speed against the gas's thermal speed, so on its mass *and* its
  temperature (hence "for its temperature"). Earth keeps N₂ and O₂ but loses H₂ and He.
- **Right:** the Argentinosaurus is among the largest land animals known, at about 70 t (estimates
  vary), and it's a dot on the chart.
- **Right:** the Eiffel Tower is "surprisingly light for its size", and the Great Pyramid is
  "a little bit in both categories" (a monument made of solid stone).
- **Imprecise, fine as said:** "Saturn… could float if you could have a pool big enough"
  (0.69 g/cm³). "It becomes degenerate matter": the electrons become degenerate, as in
  rec32.
- Mars ("almost none") is no longer in the take, so its cue is gone.
- **The round-world line** (scene only, added at the author's request): a dashed level at
  5×10²³ g, "chemical bonds dominate" below and "gravity dominates" above, between Vesta
  (2.6×10²³ g, lumpy) and Ceres (9.4×10²³ g, round). It holds for rocky bodies. Icy moons turn
  round lighter, because ice is softer: Mimas (3.7×10²² g) is round. The "potato" shot leaves Mimas out
  so the chart doesn't contradict the line. "Chemical bonds" are the electromagnetic force
  between atoms (not the weak force); "electromagnetism" would be the force's name, if
  the author wants one.

## rec34: "New hook.m4a" (video 1)

This is in the Google Drive "Recordings" folder: 5:00, AAC mono. It's a full run of the new hook script with
retakes, and a new outro that replaces "Follow me for the triangle of everything". The
author wanted no follow-and-subscribe feel. The mic stayed on.

Cut: `video/short-01-hook/edl.py`, 14 clips. The take runs 5:00, the cut 2:08, and it plays in 1:57 at 1.1×.
Second pass (the author's notes): it now opens on "This is…", without the "cha-cha-cha" before
it (Whisper heard it as "Look,"). The energy line is spliced so the second try's "That's
because this… that's… because…" is gone: "That's because this chart is also a chart of energy,"
from the first try, then "and the bottom axis doubles as wavelength." from the second.
Picks:
- The opening is "This is the most interesting chart in all of physics". "You have to see
  this… the most interesting science chart I've ever seen" is left out.
- "All of science" is the third try.
- The outro is "I've been obsessed about this chart for many years now… precisely what I
  intend to do in this series of videos" (4:10), then "I sincerely hope you find it as
  fascinating as I do" (4:47). "I hope you like it / love it", "By the end of them…" and
  "So follow me for the triangle of everything" are left out.
- The edit was cut down a little: a second "yeah" after "right?" is gone. Whisper's "and And" and
  "in, the history" were its own doubles (not in the audio) and were taken out of words.json.

Caption words corrected:
- "short" → "chart" (throughout)
- "Photons, visible light, radio waves" → "Photons: visible light, radio waves" (the author's
  reading: light and radio waves as kinds of photons)
- "a history of fame/thing" → "things". It's worth a listen at 1:13 at 1.1×.

### Fact check

- **Right:** the vertical axis is mass and the horizontal axis is size; photons are on the chart
  through their energy (E = mc²) and wavelength.
- **Right:** the three sides. The right is the size of the universe (the Hubble radius), the bottom
  left is quantum mechanics (the Compton limit), and the top left is relativity (the
  Schwarzschild line). The two left sides meet at the Planck point, the earliest time
  physics can describe, so "where those two lines meet is the Big Bang" is fair for a
  hook.
- **Right:** the diagonals along the top are times since the Big Bang, in seconds.
- **Right:** "Photons: visible light, radio waves". The caption's colon makes light and radio
  waves kinds of photons, as they are.
