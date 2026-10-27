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
