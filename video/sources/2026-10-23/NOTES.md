# Recordings, 2026-10-23

## rec32: "Vídeo 2 new take and script" (video 2)

Google Drive "Recordings", 11:48, 48 kHz mono ALAC, the Boya mic as on 2026-10-21
(rec27, rec28). A full new run of video 2 with retakes, in the author's own words:
the diagonal; a millilitre of water as a cube 1 cm wide, then everything measured as
a ball ("a little bit to the side, but that's okay"); walking up the line in grid
units; sink or float, and the new air line with the balloons and zeppelins; animals,
the hippo, elephants, dinosaurs, the blue whale and the sequoia; the Eiffel Tower;
rocks, the Great Pyramid, lakes, asteroids, small moons; round worlds; atmospheres
and gas giants, Saturn; super-Jupiters and degenerate matter; the split at the
brown dwarfs.

Sound: clean, about −29 LUFS before treatment, no clipping. Treated with
`enhance.py --plain` as rec27/28; the edit lands at −17 LUFS (the single-pass
normaliser stops at its −1.5 dB true-peak limit), the same as the 2026-10-21 cut.

Cut: `video/short-02-up-the-line/edl.py`, 42 clips, 4:53 → 4:26 at 1.1×. Left out:
the false starts and retakes (most of 0:53–1:26, 2:29–2:57, 4:49–5:09 and 5:21–7:27),
"to now" (in "by 10, to now 10 centimeters"), a garbled "that's a… times", "nice
giants" after "the rocky planets", a stray "are" in "even objects are ten times".
Checked by transcribing the edit again with a filler-friendly prompt: the remaining
differences from the EDL text were Whisper's own ("though", "some some", "exactly"
for "actually"), not in the audio. Two caption words corrected in words.json:
"walked to Earth" (said so: a slip for "the Earth") shows as "walked the Earth", and
"exactly surprisingly light" (misheard) as "actually".

### Fact check

Right:
- A log of mass against size puts almost everything near the diagonal lines.
- A millilitre is a cube one centimetre wide (1 cm³, by definition).
- Most things aren't cubes, so the chart measures them as balls; on a log chart
  that only moves a thing a little (a ball of the same volume is 1.24× as wide as
  the cube: under a tenth of a decade).
- Sides ×10: one unit to the right; volume ×1000 (to one litre); at water's density
  that's one kilogram, three units up; again, one tonne.
- Left of the water line is denser than water and sinks; right of it floats. Stone
  and metal on the left (meteorites, the Sphinx, bronze statues).
- An air line at one atmosphere separates what's lighter or heavier than air, and
  the lighter-than-air aircraft (balloons, zeppelins) sit to its right on the chart.
- Animals live in a narrow band because they're mostly water; some are a little
  denser than others.
- The hippo can't swim: it's denser than water and walks or bounces along the
  bottom of rivers and lakes.
- Elephants and dinosaurs; the sauropods were the largest animals ever to walk the
  Earth, and the blue whale, still alive, is the largest animal ever.
- The sequoia as "the largest tree" (General Sherman is the largest single tree by
  volume). This take was kept over the two "heaviest plant" ones: clonal colonies
  like Pando, an aspen grove sharing one root system, are heavier.
- The Eiffel Tower is light for its size because its envelope is mostly air, and
  its lattice is often called fractal-like.
- The Great Pyramid is basically a giant rock (solid limestone, about 6 million t).
- Lakes, asteroids, then small moons; above a few hundred kilometres moons turn
  round: gravity beats the strength of rock and ice, and they settle like a liquid
  (hydrostatic equilibrium).
- The Moon and Mercury have no real atmosphere (only a trace exosphere); Mars has a
  thin one, under 1% of Earth's pressure.
- Venus and Earth hold on to heavy gases, but hydrogen and helium escape to space.
- Holding on to hydrogen and helium makes a gas giant; Saturn is less dense than
  water (0.69 g/cm³).
- Past Jupiter's mass, objects stop growing: up to about 80 Jupiter masses brown
  dwarfs stay about Jupiter's size, and a 100-Jupiter-mass red dwarf is still only
  about 1.2 Jupiters wide. In their cores the pressure strips electrons from atoms
  into degenerate matter (pressure ionization; electron degeneracy holds them up).
- The split at the brown dwarfs: stars to the right, the dead stars' cores to the
  left; it's the story of stars from here on.

Wrong, with a fix:
- **"Because most of the universe is actually those two gases."** Most of the
  universe is dark energy and dark matter; it's most of the *ordinary* matter (about
  98% of it by mass) that is hydrogen and helium. Kept in this cut; for a re-record,
  say: "and because almost all the ordinary matter in the universe is those two
  gases". (The 2026-10-21 take said "most of the ordinary matter".)

Imprecise:
- **"One gram of water is exactly one milliliter."** Almost exactly: 0.99997 mL at
  4 °C, 1.002 mL at room temperature (the gram was once defined this way, but
  hasn't been since 1799). "Almost exactly" or "one millilitre of water weighs one
  gram" would be safe; fine as said for a video.
- **"A slope of one to three"** (left out of the cut): the line climbs three units
  of mass for every one of size, so "one to three" reads the wrong way round. If you
  want it back: "three squares up for every one across".
- **"Venus and Earth do have a very dense atmosphere."** Venus's is (92 times
  Earth's pressure); Earth's is ordinary. "Venus and Earth do have atmospheres" or
  "a thick atmosphere" for Venus.
- **"Hydrogen and helium would just float away."** They escape: light molecules
  move fast enough to leave. "Float away" is fine for the video.
- **"The density of air at one atmosphere in Earth"**: "on Earth".
- **"Lighter than air aircraft… those are balloons and zeppelins"**: a modern
  zeppelin (the Zeppelin NT on the chart) is flown slightly heavier than air and
  gets the rest of its lift from its engines; balloons are truly lighter than air.
  Fine as said.
