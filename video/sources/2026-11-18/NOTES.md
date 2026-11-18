# Recordings, 2026-11-18

## rec75 and rec76: "Space dance take 2.m4a" and "Space dance take 2 part 2.m4a" (all of long video 2, and the forces Short)

Google Drive "Recordings", ALAC 48 kHz stereo (used as mono), 21:16 and 18:31, the car (the Google Drive takes are the car's). One session in two
files: rec75 runs from "What would happen if you try to make a map of every single thing in the universe?" to "the lucky
few survivors", with the forces Short's own opening recorded in the middle (3:04: *"now I'm going to rerecord this, but
only for the intro of the dance of forces"*) and its end marked (13:10: *"so that's where the short ends, and now we
continue for the long one"*); rec76 is the right of the chart, from the nebulae to the microwave background.

Word timings: `rec75.words.json`, `rec76.words.json` (faster-whisper medium.en on the CPU, verbatim: no repetition
penalty, no n-gram blocking, no VAD, no conditioning on earlier text, and a prompt full of restarts and fillers, so
repeated words stay in; the author: *"turn off word smoothing in the transcriber, otherwise it skips repeated words"*).
The long pass still lost two stretches, re-heard on their own: rec75 9:32–9:36 ("And when that happens, a large amount
of energy is released, creating an outward pressure", heard as "And when that pressure") and 11:42–11:54 ("but the speed
of light is the universe's speed limit…", two tries the long pass dropped).

### The author's notes on the take
- rec75 7:19, *"a note to the animator: the part where everything's round is passing too quickly. It needs to be slower
  on that moment."* (the round worlds after "everything in our list becomes round")
- rec76 5:04, *"when we are doing the pixelation thing, would be nice if you could have an arrow between two stars, maybe
  more than one arrow: take a star in the center and make an arrow between two of its neighbors and measure it in terms
  of pixels, so you said it's 10 pixels and it's 20 pixels and it's 40 pixels … calculate how many pixels are there."*
  (the photo-resolution metaphor for the expansion)
- rec75 8:37, *"Why did you remove the range?"* (to the script: the next try puts it back, "but it doesn't reach very
  far … it's the size of a nucleus")
- rec76 14:26, *"Domesticated fire, I like domesticated"* (the Andromeda line's last try).

| Video | Take | Plays | Made from |
|---|---|---|---|
| Long video 2 to the dark matter | `long-02b-opening` | 11:42 | `video/long-02b-opening/edl.py`, 99 clips, all rec75 |
| Long video 2, the right of the chart | `long-02b-right` | 7:19 | `video/long-02b-right/edl.py`, 49 clips, all rec76 |
| Long video 2 (a cut) | `long-02b-space` | 18:49 + 3 s credits | the two takes, the Short's own opening left out |
| The dance of the forces (a cut) | `short-l2b-dance-of-the-forces` | 2:54 + 3 s credits | from `long-02b-opening`, 10 pieces |

Treatment as rec74: `enhance.py --plain`, natural speed, the breaths out of the pauses, the room in the gaps. Each clip
heard again on the edit (the restarts the long pass had smoothed over cut: "and since the numbers are…" ×4, "we sort, we
sort by", "What's happening is that, now, now it's for both of them", "Well, sometimes, well, sometimes", "It prevents
things… but grav-", "But gravity wants-", "so it creates this…" ×4 (the 15:04 try used), "They can go from anything-").
The take transcriber (`scripts/narration-take.py`) now runs verbatim too.
Four more the author heard in the long draft (2026-11-18, the first five minutes), cut the same way: "and we… we will… we
will find out" (rec75 1:35), "some smaller, some smaller part, some smaller particles" (1:52), "but the electrons also,
but the electron layers" (4:27), "so it, so it quickly adds up" (6:59).

## Fact check

### Right
- The chemical bond as a balance: electrons drawn to the next atom's protons, the electron layers pushing back up close,
  the atoms settling where the two balance; all of it electromagnetism.
- Electromagnetism stronger but with both signs, gravity weaker but only attracting, so it adds up; the diagonal as the
  density of atoms; things becoming round past a few hundred km.
- The super-Jupiters' column (about Jupiter's radius from 1 to about 80 Jupiter masses), the pressure stripping the
  electrons (pressure ionization, a sea of electrons, the loose nuclei), "they don't get bigger, they just get denser".
- The strong force the strongest, reaching only about a nucleus across (a femtometre).
- Fusion's energy pushing out against gravity; the main sequence where stars spend most of their lives; the balance kept
  by burning hydrogen.
- **Fixed since rec74**: small stars like the Sun leave a carbon and oxygen core (a white dwarf), the outer layers drift
  off into a nebula (a planetary nebula).
- Core collapse in massive stars; a proton and an electron squeezed into a neutron (electron capture, with a neutrino);
  neutrons packed shoulder to shoulder refusing to be squeezed (degeneracy pressure and the strong force's repulsion up
  close); a neutron star as one giant nucleus, held by gravity rather than the strong force.
- Gold, platinum and uranium from neutron-star collisions (the r-process; GW170817's kilonova, 2017), and from some
  supernovae (still argued how much).
- A neutron star's escape velocity is about half the speed of light (0.4 to 0.7 c for 1.4 suns in 11 to 13 km).
- The Sun squeezed: 6 km wide (its horizon's radius is 2.95 km); the Earth: a marble (1.8 cm).
- Sgr A*: four million suns (4.3); supermassive black holes less dense than water above about 100 million suns; M87*
  the first photographed (2019); TON 618's horizon far bigger than Pluto's orbit (about 1,300 AU across against 80).
- Hawking evaporation ruling out the smallest (below about 10^15 g); the window left: an asteroid's mass inside something
  smaller than an atom (10^14 kg is 0.15 picometres across), up to a small moon's mass the size of a virus (10^20 kg,
  0.15 µm; Mimas is 4×10^19 kg).
- The searches (quasar microlensing, the microwave background, gravitational waves, microlensing) all empty so far;
  tracks in ancient mica; the "death and serious injury from dark matter" bound (Sidhu, Scherrer and Starkman, 2019).
- The right of the chart: nebulae thinner than the Moon's atmosphere (a planetary nebula has 100 to 10,000 particles per
  cm³, the Moon's exosphere about 100,000), galaxies mostly empty space, the Local Group, clusters, Laniakea's 100,000
  galaxies, voids emptier than around them.
- The speed of light as a limit through space, space stretching faster; the Hubble sphere growing so the real edge, the
  cosmic event horizon, lies a little further out (16.7 against 14.4 billion light-years); the mass inside the Hubble
  sphere landing exactly on the Schwarzschild line (critical density makes 2GM/c² equal c/H); both horizons set by
  what's inside.
- The light times: the Moon 1.3 s, Mars under half an hour (22 min at most), Jupiter a little more (33 to 54 min),
  Alpha Centauri 4.4 years (one tournament), the galaxy's far side about 75,000 years (modern humans leaving Africa,
  50,000 to 70,000 years ago), Andromeda 2.5 million years (fire domesticated about a million years ago, the first
  hints 1.5 million); the microwave background 380,000 years after the Big Bang.

### Wrong (with the fix)
- **"the cosmic event horizon falls exactly on the top left vertice of our triangle"** (rec76 7:05). The black-hole line
  is the top-left *edge*; our universe sits at its top end, the chart's **top-right** corner (the chart: "M87* at the
  bottom left, our universe at the top right, both on the black-hole line"). And "vertice" is "vertex". Suggested:
  *"So the cosmic event horizon falls right on the top corner of our triangle."* The cut keeps the line up to "the
  other edge of our chart that we just saw recently" and drops the vertex sentence until it's re-recorded.
- **"The sunlight reaching you right now started its journey when you started watching this video"** (rec76 11:23). The
  Sun's light is 8.3 minutes old; in the long video the line plays about 30 minutes in. Right in a Short, wrong here.
  Suggested: *"The sunlight reaching you right now left the Sun about eight minutes ago, somewhere around when we were
  talking about black holes."* or simply *"…started its journey about eight minutes ago."* Left out of the cut until
  re-recorded (the Moon goes straight on to Mars).

- **"When a star is about to die, it grows into a red giant. And these are often less dense than the atmosphere of
  the Moon"** (rec76, the retake at 2:29): a red giant's gas is about 10^-8 g/cm³, ten billion times the Moon's
  exosphere; it's the nebula that's that thin. The first try (2:06) says it right, "…it grows into a red giant, its
  outer layers drift off into a nebula, or if it explodes, a supernova", and the cut uses it before "And these are
  often less dense than the atmosphere of the Moon".
- **"Our living stars are around this white dwarf slope"** (rec75 13:32), if that's what was said: medium.en hears
  "white dwarf" twice, on the long pass and alone (in rec74 the same line was taken as "rightward slope"). Living
  stars sit on the main sequence; white dwarfs are dead stars on a slope of their own. Suggested: *"Our living stars are
  around this rising slope, the main sequence."* Kept for now; the caption says what's heard.

### Imprecise
- **"the gravity will be so strong that it will overpower the electrons pushing out and the nuclei will be so close
  together that the strong force can now capture them"**: in a star's core what keeps nuclei apart is the protons' own
  electric repulsion, not the electrons (the gas is already ionized); gravity's squeeze heats the core until the nuclei
  hit hard enough to get (by tunnelling) within the strong force's reach. Suggested: *"…so strong that it squeezes and
  heats the core until the nuclei crash into each other hard enough for the strong force to capture them."* And turning
  hydrogen into helium needs the weak force too (two protons become neutrons), so the weak force isn't brand new at the
  supernova; fine to leave for a video at this level.
- "their core is not made of ordinary matter" (giant planets): it's still ordinary atoms' stuff, only no longer in atoms
  (metallic hydrogen). *"…is no longer made of ordinary atoms."*
- "a radioactive element is like a battery charged once in these explosions": true of uranium and thorium, not of every
  radioactive element (carbon-14 is made by cosmic rays, radon by decay). *"So in a way, uranium is like a battery
  charged once in these explosions."*
- "if you add even more mass, then the escape velocity will be faster than the speed of light": the black hole comes
  from the neutron star collapsing (past about 2.3 suns no force holds it), which squeezes it until escape velocity
  passes c. Fine as said.
- "but we know two moments when it happens … the very first instant after the Big Bang": the second is a possibility
  (primordial black holes have never been found). "…two moments when it **could** happen."
- "galaxies … 5, sometimes 10 times heavier than everything we can see": the cosmic ratio is about 5; single galaxies'
  halos are often more (dwarf galaxies hundreds of times). Fine.
- "the bigger something is, the less dense it is": true along the right of the chart, not in general (black holes on
  the line, the super-Jupiters' column). Fine as said.
- "superclusters … the largest structure we know of" then "something larger still, voids": voids are larger but
  aren't structures; fine.
- "It's an interesting coincidence" then "so it's no coincidence": as in rec67; the second is the point.
- "Any signal sent from the far side of that filament was sent when the dinosaurs were still roaming around": Laniakea
  is about 500 million light-years across and we're near its edge, so its far side is more like 400 million years ago,
  before the dinosaurs (230 to 66 million years ago); its middle, the Great Attractor, 250 million, is when the first
  dinosaurs appeared. *"Any signal sent from its heart was sent when the first dinosaurs were roaming around."* (the
  2026-11-11 fact check gave the far side 150 to 250 million: too near.)
- "It's infinite in all directions" (the observable universe's last part): as far as we can tell; earlier in the same
  take, "in practice infinite". *"As far as we can tell, it goes on forever."*
- "The moon you're looking at is merely a second ago": *"…is merely a second old."*
- Slips in words: "the electrons layer themselves" (the cut uses the earlier try's "the electron layers"); "the size of
  a nuclei" (nucleus); "no ordinary star can make them"; "a neutron, packed shoulder to shoulder, refused" (as heard;
  "Neutrons … refuse"); "our weird one, the black hole"; "forever knowable" for "unknowable" on the last try of the line
  (the cut uses the one before, "remain unknowable to us forever").
