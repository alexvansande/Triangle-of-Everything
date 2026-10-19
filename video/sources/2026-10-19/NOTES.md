# Recording of 2026-10-19

| Source | Raw file (Google Drive "Recordings") | Length | Setup |
|---|---|---|---|
| `rec12` | `From humans to brown dwarfs .m4a` | 6:20 | home, 48 kHz ALAC; noise floor about −78 dB, so no extra denoise |
| `rec13` | `bar_do_zeca_pagodinho_4.m4a` (uploaded to the chat) | 0:51 | 48 kHz ALAC; the same noise floor (−79 dB) and a tone within ±3 dB of rec12; 3 dB hotter, turned down |
| `rec18` | `black holes.m4a` (iCloud recordings) | 16:08 | a different room (not the car); 48 kHz AAC; many retries in one take |
| `rec19` | `black holes and dark matter .m4a` (iCloud recordings) | 10:55 | same room as rec18 |
| `rec20` | `primordial black holes.m4a` (iCloud recordings) | 7:12 | same room as rec18–19 |
| `rec14` | `bar_do_zeca_pagodinho_6.m4a` (uploaded to the chat) | 2:31 | 48 kHz ALAC; clean (−81.5 dB floor, no clipping); 6 dB hotter than rec12, a little lighter in the bass and duller on top: turned down and EQ'd to match |

One take of the whole of `short-03-planets`, replacing the earlier cut from
rec8 (home intro) and rec3 (office): humans, rocks and animals either side of
the diagonal, the whale and the sequoia, planes, supertankers and the Great
Pyramid, mountains, rocks, comets and small moons, round worlds, atmospheres,
gas giants and Earth between them, Saturn floating, the turn off the diagonal
into degenerate matter, the brown dwarfs, and a cliffhanger into the next video
("some take a drastic turn to the right and some to the left. What is this?").

**rec13** is a new opening for the same video ("In this chart, diagonal
lines represent density. This blue line represents the density of water…
everything to the left will sink and everything to the right will float"),
replacing rec12's, which began like `short-02-density` ("something really
interesting happens…"). rec12 takes over from "And if you start at the human
scale". rec13's own human-scale lines are left out. Caption fixes: "flow" →
float, "dressed" → drastic.

**rec14** re-records the atmospheres → gas giants → Earth section (rec12 had
"hold light gases", backwards). Kept: "As these objects become more massive,
their gravity starts being able to hold on to some more heavy gases" · "So for
example, while Moon and Mercury basically have no atmosphere, Mars does have a
thin one, and Earth and Venus has a more thicker one" · "But once they start
becoming massive enough … also able to hold the lighter gases like hydrogen or
helium" · "On Earth, helium and hydrogen will just float up and go away into
space" (the last of three tries) · "But with some more massive planets, they
stick around … that's how they will become gas giants" · "So Earth also lives
in a very interesting Goldilocks zone of mass…". Left out: the restarts "As these
objects, as the objects on this line…", "and now the gravity is and now…", and
the first two tries at the escape line.

**rec15** re-records Saturn and the Jupiter plateau, up to the degenerate
matter (rec12 had "more objects will move towards the right"). Kept: "So, most
of the objects are on the left side of the line," · "as they grow," · "Saturn
falls almost on the line to the point that Saturn would float in water if you
had a pool big enough." · "Something weird happens past the Jupiter mass
planets," · "because even as they become more massive, they stay roughly
Jupiter size." Left out: "more and more objects falling a little bit to the
left" (backwards, see the fact check), the silence before 21.8 s, and the
repeated tries. rec12 picks up again at "This is happening because the
pressure inside the core…". Whisper wrote "regrow" for "grow", "moon and the
mercury" and "marsh" in the edit: fixed by hand in words.json.

**Tempo: this batch plays at 1.1×, not 1.2×** (the narration is naturally a
little faster from here on): `python3 scripts/narration-tempo.py <take> --tempo 1.1`.

`rec12`–`rec15.words.json` have their Whisper word timings (medium.en). The cut is
`video/short-03-planets/edl.py` (28 clips from rec13, rec12, rec14, rec15; 3:55 before the 1.1× tempo,
3:34 after); `cuts.csv` lists where each clip landed.

Left out of rec12 (its opening is now rec13's): a false start in the first seconds ("so something very interesting
happens when", hidden in a pause; the cut starts at 7.52 s), the first try at
"if we start at the human scale…" (it had the sides swapped), "we really,"
before "we will transition", repeated takes of "more and more spherical",
"behaving like liquids" and the atmosphere lines, "Venus and Earth have",
the first gas-giant pass ("when they form from the stellar remains…"), "just
massive enough to have some gravity", "that some," before "that more objects",
the first pass of the degenerate-matter lines, and the takes between 328 s
and 353 s.

Whisper often mishears "super-Jupiters" (dropping it, or writing "super
-egyptars"); since rec15 the narration no longer says it (the chart label
still does).

Overlap with `short-04-stars`: resolved by rec16, which replaces that video and
no longer opens with the left turn and degenerate matter (it only recaps brown
dwarfs, adding deuterium).

## Fact check (video 3 as cut: rec13 + rec12)

Right: the blue line is the density of water, denser things to its left sink and
lighter ones to its right float; rocks on the left, animals on the right; the blue
whale is the largest animal and the giant sequoia the largest tree (by volume);
planes → supertankers → the Great Pyramid is the right order by mass; objects turn
round when gravity beats the strength of their material and then settle like a
fluid; Mercury and the Moon have no real atmosphere, Mars a thin one, Venus and Earth
one; past a certain mass a planet keeps its hydrogen, becomes a gas giant and has no
surface; Earth sits on the thin line between rocky worlds and gas planets (the
observed gap at about 1.5–2 Earth radii); Saturn would float (0.69 g/cm³); above about
a Jupiter mass, more mass barely changes the radius, so density climbs and the dots
turn left; crushed atoms lose their electrons (pressure ionisation) and the matter
becomes degenerate, then the brown dwarfs.

Wrong, worth re-recording:
1. **Fixed by rec14.** "the gravity is enough to hold **light gases** together": backwards. Rocky planets
   keep heavier gases (N₂, O₂, CO₂); light ones (H, He) escape, and keeping them is
   what makes a gas giant, the next line. Suggested: "…enough to hold onto gases" or
   "…to hold heavier gases".
2. **Retracted (my error).** "**more objects** will move towards the right side of the
   graph. Saturn…" was flagged as "only Saturn crosses", but that is only true of the
   Solar System. The chart's exoplanet dots (NASA Exoplanet Archive, measured mass
   and radius) say the opposite: about 95% of planets of 0.2–0.7 Jupiter masses are
   less dense than water, and 77% of those around 1 Jupiter mass. The original line
   was right; rec15's "Saturn falls almost on the line" is right too. See the rec15
   check for why.

Imprecise, optional:
3. "In this chart, **diagonal lines** represent density": true of the parallel slanted
   lines, not of the chart's main diagonals (the black-hole and quantum edges).
   "These diagonal lines…" would be safer.
4. "big rocks and **meteorites**": asteroids at that size; meteorites are the small
   pieces that reach the ground.
5. "some take a drastic turn to the right and some to the left": right about the
   chart (stars branch right, white dwarfs left), but white dwarfs come from stars,
   not from brown dwarfs; video 4 should say so.
6. "Venus and Earth **has** one": grammar only.

## Fact check (rec14)

Right: heavier gases are held first, then light ones (hydrogen, helium) once a
planet is massive enough; the Moon and Mercury have essentially no atmosphere,
Mars a thin one, Earth and Venus thicker ones (Venus's is about 90× Earth's); on
Earth hydrogen and helium rise and escape to space; most of the universe's
ordinary matter is hydrogen and helium (about 98% by mass), so a planet that keeps
them grows into a gas giant; Earth sits in a "Goldilocks zone of mass" between the
two (a twist on the usual Goldilocks zone, which is about distance from the star).

Imprecise, optional: "Earth and Venus **has** a **more thicker** one" (grammar).

## Fact check (rec15)

Right: most of the objects on this stretch are left of the water line (denser
than water); Saturn sits almost on it and would float (0.69 g/cm³); past about a
Jupiter mass, planets and brown dwarfs stay roughly Jupiter's size as mass grows
(electron degeneracy pressure), so their density climbs.

Wrong, left out of the cut: "as they grow… more and more objects falling a little
bit to the **left**": backwards. As planets grow into gas giants they get *less*
dense and move right, and most of them cross the line: in the chart's exoplanet
dots, the share less dense than water goes from about 10% at Neptune masses to 54%
at 0.1, 67% at 0.18 and 95% at 0.3–0.6 Jupiter masses (median density 0.4 g/cm³).
Past about a Jupiter mass the radius stops growing, so they go straight up the chart
and back across the line, to the left (35% float at 1.8, 3% at 3 Jupiter masses).
The least dense giants sit near Saturn's mass because: the hydrogen envelope keeps
growing (the core's share falls) while the radius reaches about 1 Jupiter radius by
0.3 Jupiter masses and then stays put, and density is mass ÷ radius³; most of these
planets are hot Jupiters and Saturns, puffed up by their star's heat, and lighter
giants puff up more (WASP-17b: 0.5 Jupiter masses, twice Jupiter's radius, 0.08
g/cm³); and transits favour big, close-in planets, so cool Saturns like ours are
rare in the catalogue. The cut keeps "as they grow, Saturn falls almost
on the line", which is right. If re-recorded: "as they grow, they get lighter for
their size, and Saturn falls almost on the line…".

Nothing from rec12 left open: item 1 is fixed by rec14, and item 2 was my error.

## rec16: `short-04-stars`

One take of the whole of video 4, replacing the 2026-10-07 cut (rec3 + rec6):
planets and stars aren't separate categories → Jupiter and Saturn give off more
heat than they get → brown dwarfs and deuterium → the fork in the chart → fusion
and the main sequence → the end of a star (collapse and expand, split in two) →
supernova remnants and planetary nebulae become stellar nurseries → the core
becomes a white dwarf, a neutron star or a black hole. `video/short-04-stars/edl.py`,
25 clips, 3:11 before the 1.1× tempo, 2:53 after.

The black-hole part (520 s on: "a black hole is not an object in this chart, it's
a line… the Schwarzschild radius… the first limit of the triangle") is left out,
for a video of its own. **rec17** is the new ending, after rec16's "And what about
the core? Well, something interesting happens with the core.": "If a star isn't
massive enough to go supernova, then after the fuel is depleted, all that's left is
a white dwarf. But if it's big enough to go supernova, then the pressure inside the
core of that supernova will be so large that the protons and electrons themselves
will be squished together into a neutron, and it will create a neutron star, an
object so dense that a single spoonful of it would weigh the same as a mountain on
Earth. And if the star is any bigger than that, then the core would collapse into a
black hole, an object so crazy that it deserves a video on itself." Left out of
rec17: a restart ("But, if it's,") and "and if the object is any larger than that,
then the core explosion of the supernova would turn, and if the object is any…".
Whisper wrote "weight" and "protostores": fixed by hand. With rec17 the video is
3:22 at 1.1×.

Left out: the first try of the opening, "starting with Jupiter and Saturn, in
fact, the gas…", two tries at "mostly due to…" (one with an "uh"), "and as that
core, and as that mass increases, and the core pressure…", the first and the
longest deuterium takes, "so they never have enough energy", the restarts before
the fork, the axes explanation (209–224 s; videos 1 and 2 cover it), "the object
becomes," before the internal pressure, "pushes the outer layers of the atmosphere
away" (see the fact check), the repeated main-sequence line, "until their outer
layers will explode, often in a supernova," (wrong, see below), "the inner
layers," before "the inner core", the first stellar-nursery take, a stutter
("where that, those huge clouds"), and the first tries at the core (448–484 s).

Whisper in the edit: "in -between" and "proto -stars" joined by hand.

## Fact check (rec16)

Right: Jupiter and Saturn radiate more heat than they get from the Sun (about
1.7× and 2×), mostly from slow contraction (Kelvin–Helmholtz), so their own
gravity heats them; more mass means more core pressure; brown dwarfs sit between
planets and stars, and above about 13 Jupiter masses fuse deuterium (one proton
and one neutron), which is rare (about 1 hydrogen atom in 40,000 in the universe),
so they never become stars; once fusion of ordinary hydrogen starts, its pressure
puffs the star up and it follows the main sequence, where stars spend about 90% of
their lives until the hydrogen in the core runs out; the ejected gas of dead stars
mixes into new clouds that collapse into protostars and stars; stars not massive
enough to go supernova (below about 8 Suns) leave a white dwarf; above that, a
neutron star, made almost entirely of neutrons; heavier still, a black hole.

Wrong, left out of the cut:
1. "their outer layers will explode, **often** in a supernova": most stars don't
   explode. Only those above about 8 Suns go supernova; the rest (the Sun included)
   shed their outer layers gently as a planetary nebula. The take right after says it
   correctly ("will become a supernova or a planetary nebula"), and that's the one in
   the cut.
2. "pushes the outer layers of the atmosphere **away**": fusion pressure puffs the
   star up, it doesn't push the layers away (that only happens at the end of its
   life). The cut uses the other take, "pushes the objects to be bigger in diameter".

Wrong, replaced by rec17:
3. "if the original star was **just** heavy enough, then it will become a black
   hole": "just heavy enough" sounds like barely. It takes the heaviest stars (about
   20–25 Suns and up). Suggested: "And if the original star was heavier still, its
   core becomes a black hole."

Imprecise, optional:
4. "it can fuse **all of the** hydrogen": he means ordinary hydrogen, not only
   deuterium. A star only ever burns about a tenth of its hydrogen on the main
   sequence. "…it can fuse ordinary hydrogen" would be clearer.
5. "The outer layers will become **a supernova**": they become a supernova
   remnant; the supernova is the explosion.
6. "collapsing and expanding, and collapsing and expanding": simplified. As the
   fuel runs out, the core contracts while the outer layers swell (red giant), in a
   few stages; stars don't really pulse in and out as a whole.
7. "Saturn and Jupiter… mostly due to their mass compressing in their core":
   right for Jupiter; for Saturn, helium raining down inside adds a good part of it.
8. "after the brown dwarf we have a bifurcation": the chart's two branches are stars
   (right) and white dwarfs (left), but brown dwarfs don't become white dwarfs. The
   video explains white dwarfs at the end, and the scene labels that branch "dead
   stars' cores" instead of drawing an arrow to it. Video 3's cliffhanger still draws
   an arrow from the brown dwarfs to the white dwarfs (item 5 of the rec12 check).

The black-hole part (not in the cut) checks out: a black hole's size is its event
horizon, the Schwarzschild radius, which grows in proportion to mass, hence the
1 : 1 slope on this log–log chart; for any size there's a mass it can't exceed
without becoming a black hole. "a black hole is a singularity, it doesn't really
have a size" is fair as a simplification (the singularity is what general
relativity predicts at the centre).

## Fact check (rec17)

Right: stars that don't go supernova (below about 8 Suns) end, once the fuel runs
out, as a white dwarf; in a core-collapse supernova, protons and electrons are
pressed together into neutrons (electron capture, p + e⁻ → n + ν) and the core
becomes a neutron star; the heaviest stars' cores collapse into black holes.

"a single spoonful of it would weigh the same as **a mountain**": right for a modest
mountain. On the chart's numbers (1.4 Suns in a 10 km radius, about 7 × 10¹⁴
g/cm³), a 5 ml teaspoon is about 3–4 billion tonnes: about a cubic kilometre of
rock, a mountain of roughly 1–2 km. Everest (10¹⁵ kg on the chart) would take a
few hundred teaspoons. The scene's label says "a teaspoon ≈ 3 billion tonnes".

Imprecise, optional:
1. "the pressure inside the core **of that supernova**": the core of the star; the
   supernova is the explosion that follows the core's collapse.
2. "if the star is any **bigger** than that": heavier, not bigger (the biggest
   stars aren't always the heaviest); fine as spoken.

## Re-read of all four videos (2026-10-19): what to re-record

**1. Animals and the water line (videos 2 and 3): wrong reason.** Video 2: "Most
of the dots to the right are animals. And most animals float in water, except the
hippo. The hippo sits right on the line…"; video 3 (rec12): "most objects on the
right are actually animals because most of them float in water". On this chart an
animal's size is half its body length (PanTHERIA head–body length; "Human" is
1.7 m → 85 cm), so its dot is a ball as wide as the animal is long, which is mostly
empty space. That puts every mammal and amphibian in the dust (all 2,325) to the
right of the water line, whatever its real density (almost all animals are close
to 1 g/cm³). A human plots at about 0.03 g/cm³, an elephant 0.3, a blue whale 0.015.
The hippo is the exception only because it was hand-placed there
(`src/objects.json`: "Placed denser than water… as easter egg"), with an 89 cm
radius, the same as a human's; a real hippo is about 3.5–5 m long (radius about
2 m), which would put it at about 0.1 g/cm³ like the rest. The hippo fact itself is
right (hippos are denser than water, can't swim, and walk on the bottom), but the
chart can't show it.
A rule that does hold: the ball always contains the object, so the dot's density is
never higher than the real one. Anything **left** of the line really is denser
than water and sinks; something to the right may or may not float.
Suggested (video 2's ending): "Most of the dots to the right are animals. Not
because they're light: almost every animal is about as dense as water. It's
because we measure them by their length, as if each one were a ball that long,
and most of that ball is empty. So the rule only works one way: anything left of
this line sinks for sure." Video 3's line could become: "…and on the right are
animals, mostly because they're long and thin, not round." The hippo dot needs a
decision: move it to its real size, or keep it as an easter egg and stop
pointing at it.

**2. Video 1 (hook): sound, not facts.** It mixes three setups (office rec2 with
noise reduction, home rec7, office rec6), so the background and tone change at
0:24 and 0:48. rec11 ("new intro.m4a", 4:44, home) is a full re-take of the hook
that was never reviewed; it may make a re-record unnecessary. Also "the horizontal
axis is **in** size" (rec9 has "The horizontal axis is size", not spliced yet).
The facts check out: the bottom-left edge is the quantum (Compton) limit, the
top-left the black-hole (Schwarzschild) limit, they meet at the Planck point,
and the chart's diagonal isochrons (Planck 10⁻⁴³ s … now) are the times when the
universe's average density was that high, so "joining at the Big Bang" follows
the paper.

**Optional, small:** video 2 "if you multiply **your** size by 10" (the box's
size); video 2 "so the sizes and the masses, it only matters when you multiply
it by 10" (each grid step is ×10); video 3 "big rocks and **meteorites**"
(asteroids); video 4 "fuse **all of the** hydrogen" (ordinary hydrogen) and "the
outer layers will become **a supernova**" (a supernova remnant).

Fixed today without re-recording: video 3's caption had dropped "right" ("most
objects on the ___ are actually animals"); the audio has it.

## Video 4, second pass (author's notes)

- Pauses: `build.py` now takes `PAUSES` per EDL (longest pause kept after a word,
  a comma, a sentence end). Video 4 uses 0.18 / 0.3 / 0.45 s, which tightens
  "start fusing… hydrogen", "join together… with… others", "until… the hydrogen".
- False starts cut: "The outer layer…" before "The outer layers will become…"
  (rec16 355.3 s) and "an ob…" before "an object so dense" (rec17 46 s).
- rec17 sounded different: besides the room (drier: about 2 dB less decay 100 ms
  after each word), it is spoken about 9% slower (4.0 against 4.4 syllables a
  second while speaking) and lower (median pitch 105 Hz against 120 Hz, about two
  semitones: a calmer, lower-energy read). `SOURCE_TEMPO = {"rec17": 1.09}` matches
  the pace (pitch kept); the pitch is left alone, as shifting it sounds processed.
- Video 4 is now 3:10 at 1.1×.

## rec18 + rec19: `short-05-black-holes`

rec18 is one long take of video 5: the chart so far, black holes as a line, the
Schwarzschild radius, every black hole on it, then small black holes, primordial
ones and dark matter, ending on TON 618. Two notes to Claude inside it:
- 402–441 s: "add points on this line representing all known black holes". Done
  without new data: the catalogue dust already has 524 of them (279 LIGO–Virgo–KAGRA
  merger remnants, 245 supermassive black holes from van den Bosch 2016). A new
  highlight, `{ dust: "blackhole" }` (src/narration.js), lights every one in a sweep
  up the line, on "all known black holes".
- rec19 opens with the author's plan: start with the big black holes, then the
  small ones, so the video ends on a cliffhanger rather than at the top; keep rec18's
  opening, change the middle and the end.

The cut (`video/short-05-black-holes/edl.py`, 48 clips): rec18 up to "every black
hole will be on this line" (the intro, the line, the limit, the Schwarzschild
radius), then rec19: known black holes → from stellar to galaxy centres (Milky Way,
Andromeda) → M87*, TON 618 → less dense than water → the small end → primordial
black holes → dark matter → the dark-matter diagonal of galaxies. 6:30 before the
1.2× tempo (this video plays faster than the others, by request), 5:20 after. Backing track: Mesmerize.

Second pass (author's notes): the first "But unlike most," cut; the density lines ("as black holes become more massive…", "less dense than water") moved before M87* and TON 618, which now read as their examples; "early moments of our uni-… our universe's history" cut to one (Whisper had merged the restart into "universe's"); on "a cloud of dots" the pictures go off and the catalogue clouds get circled (planets, white dwarfs, stars, nebulae & clusters, galaxies); every video now shows only the pictures its scene highlights; the black-hole dust is quieter on the map (30%) and solid, in the Schwarzschild line's colour, when highlighted.

Left out of rec19: the ocean joke (the author's own call), "they are all, of
course, linear", "there is no reason that they could exist in other ways" (says
the opposite; a re-run of Whisper on the clip hears "could" too), "have been," in
"have been, might have been formed", the take saying every galaxy-centre black hole
is less dense than water (item 1 below), "planets compressed to the size of a
single atom" (item 3), "we cannot measure in any way", and "globular clusters"
(item 5).

Caption fixes by hand: "densely scattered" → density scatter, "them covering" →
I'm covering, "shirt" → chart, "Ton-608" → TON 618; scene captionFixes: "novus" →
nurseries, "math" → mass.

## Fact check (rec18 + rec19 as cut)

Right: anything more massive or more compact than the Schwarzschild radius
collapses; a black hole's size on the chart is its event horizon, 2GM/c², which is
proportional to mass, hence the 1 : 1, 45° line on this log–log chart; every black
hole sits on it (the dust confirms it: all 524 lie exactly on the line); stellar
black holes come from the collapse of massive stars; Sgr A* in the Milky Way, one in
Andromeda's centre (about 1.4 × 10⁸ Suns); M87* was the first photographed (EHT,
2019); TON 618 is among the most massive known; density falls as 1/M², so the
heaviest black holes are less dense than water; in principle a black hole of any
mass could exist; primordial black holes could have formed from the dense early
universe, the lightest ones would have evaporated by now (below about 10¹⁵ g: a
proton-sized horizon, matching "the size of a single proton" for the smallest
survivors); they are searched for as dark matter and ruled out over most masses,
with the asteroid-mass window (about 10¹⁷–10²³ g) still open; galaxies and galaxy
clusters hold far more mass than we see, which is what dark matter means here.

Imprecise, worth knowing (the scene labels state the correct version):
1. "**there's a point** in which the supermassive black holes are less dense than
   water": right as cut. The other take, "the supermassive black holes, the ones in
   the center of galaxies, are less dense than water", is wrong for ours: Sgr A*
   (4 million Suns) averages about 1,000 g/cm³. The crossover is at about 1.4 × 10⁸
   Suns, right where Andromeda's sits. M87* and TON 618 are far lighter than water.
2. "TON 618 … the largest black hole we know, whose event horizon would swallow our
   whole solar system": the chart's 66 billion Suns (older estimate; a 2019 one is
   about 41 billion) gives a horizon of about 1,300 AU, some 40× Neptune's orbit,
   though not the Oort cloud.
3. "a small asteroid or a mountain, but the size of a grain of sand, or maybe the size
   of a single proton": the pairing is off. An asteroid's mass (Eros) makes a hole
   smaller than an atom; a grain of sand takes about the Moon's mass; a proton-sized
   one is about 10¹⁵ g, a large hill. The scene shows each: asteroid → smaller than an
   atom, the Moon → a grain of sand, the smallest survivor → proton-sized.
   Suggested re-record: "objects as massive as an asteroid, squeezed smaller than an
   atom, or as massive as the Moon, squeezed into a grain of sand".
4. "tiny **particles**": they'd be black holes, not particles; "tiny objects".
5. "galaxies and **globular** clusters … follow a separate diagonal": globular
   clusters have almost no dark matter (they sit near the stars' density). The cut
   uses "galaxies and clusters" (galaxy clusters, which do).
6. "We know that those black holes could have existed": they are allowed by theory,
   not known; fine as spoken.
7. "a large black hole could get smaller by Hawking radiation" (rec18, not in the
   cut): in principle, but a stellar one takes about 10⁶⁷ years, and today any black
   hole heavier than about the Moon absorbs more from the cosmic background than it
   radiates. rec18's "trillions of years" was far too short and is left out.
8. "the mass of the core inside it" (rec18): the event horizon follows the black
   hole's whole mass; "core" is loose.
9. "without needing to invoke any sort of new physics": primordial black holes need
   no new particle, but forming enough of them needs something unusual in the early
   universe (strong density spikes from inflation). Commonly said this way.

## After the PBH window (PR #14, merged 2026-10-19)

The map now marks where primordial black holes could still be all of the dark
matter: 1e17–1e22 g on the Schwarzschild line, ruled out below by Hawking radiation
and above by microlensing surveys; "Smallest Primordial BH" and "3K BH" are off the
map (the classic figure keeps them). Video 5 shows the window on its own (it is part
of the map), and its cues now point there.

Against the window, rec19's "sizes that will be like a small asteroid or a mountain,
but the size of a grain of sand, or maybe the size of a single proton":
- a mountain or an asteroid: inside the window (Eros → about 1e-9 cm, smaller than
  an atom) ✓
- a grain of sand: takes about the Moon's mass, which microlensing rules out
- a single proton: about 5e14 g, which has evaporated
The scene labels both as ruled out. A re-record that fits the window: "We are talking
about objects as massive as a mountain or an asteroid, squeezed into something far
smaller than an atom."

## After the neutron-star update (PR #16, merged 2026-10-19)

The map's neutron stars are now named pulsars (NICER mass and radius) and 75
measured masses as dust. The scenes point at PSR J0030+0451 where they used the
generic "Neutron Star", labelled "neutron star". Video 4's teaspoon label is now
"≈ 2 billion tonnes": at J0030's 1.43 Suns in 12.7 km (3.3 × 10¹⁴ g/cm³) a 5 ml
teaspoon is about 1.7 billion tonnes, still "a mountain".

## rec20: the small black holes onward, with a cliffhanger

rec20 re-records video 5 from the small black holes to the end, opening "Arguably,
the most interesting story isn't about the largest black holes, but the smallest
possible ones" and ending on the next side of the triangle ("And if we follow that
line of galaxies, where does it end? … Another limit of what things can be in our
universe"). It replaces rec19 from "But there's also a very cool story" on; rec18's
opening and rec19's big black holes stay. One line comes from rec19: "And if primordial
black holes exist, they could explain that without us needing to invoke any sort of
new physics" (rec20's take said "mountain size protons"). 50 clips, 5:38 at 1.2×.

Left out: the first tries at "you could make a black hole of any…", "so we know that
there can be a lot of them" (says the opposite: microlensing shows there can't be), "in
the early," and its restart, "than, let's say, a small meteor", "compressed to the size
of a proton", the first take of the galaxies' diagonal ("should be much more massive than
they are", backwards), the second take's "at the level of nebulas", and the "mountain
size protons" take.

Caption fixes by hand: "mess" → mass, "microlamps and surveys" / "microlensin" →
microlensing surveys, "Hawking's" → Hawking, "That's all that we call" → That's what
we call; "we" restored in "and we haven't found any".

## Fact check (rec20)

Right: any mass becomes a black hole if squeezed enough; collapsing stars make them,
and the early universe was dense enough to (whether it did depends on its density
ripples); microlensing has found no black holes of planet-to-star masses in the numbers
dark matter would need, so they're absent or rare; Hawking radiation sets the lower
limit; a small moon (Phobos, about 1e19 g) or a mountain (1e17–1e18 g) is inside the
window (1e17–1e22 g); they'd be invisible but felt by their gravity; galaxies and
clusters lie on a different, lower-density diagonal than everyday matter, and their
measured mass is several times what their stars and gas account for: the missing
matter we call dark matter; the galaxies' line runs up to the Hubble radius, the next
side of the triangle.

Wrong, left out of the cut:
1. "they couldn't be much smaller than, let's say, a small meteor": far too small. Those
   that have fully evaporated are below about 5e14 g (a hill, a rock some 700 m
   across), and as dark matter they're ruled out up to about 1e17 g (a mountain). A
   meteor is grams to tonnes. The cut keeps "they couldn't be much smaller, because
   otherwise they would have evaporated".
2. "compressed to the size of a proton": a mountain's or small moon's mass makes a
   black hole of 1e-11 to 1e-9 cm, a thousandth to a tenth of an atom, but 200 to 20,000
   times a proton. Only one of about 5e14 g (already evaporated) is proton-sized. The
   scene says "smaller than an atom".
3. "we know that there can be a lot of them": backwards (see above).
4. Galaxies "nebulas and galaxies … aligned in a different diagonal": nebulae and
   molecular clouds hold almost no dark matter and lie elsewhere (Larson's law); only
   galaxies and clusters are on that line.

Imprecise, kept: "much more massive than their size would be expected": they are more
massive than their visible matter, not than their size; the scene says "more mass than
we can see". "you'd be impossible to detect them" (they'd).

Re-record, optional (the cut works without it): "So we have this range: something with
the mass of a small moon or a mountain, squeezed into something far smaller than an
atom."

## Video 5, third pass (author's notes after watching)

- The Schwarzschild limit was explained twice ("they represent a limit of both mass
  and size…", "there is a point in which nothing can become more massive or more
  compact…", then "This line is called the Schwarzschild radius, which represents the
  limit…"): only the last stays, without its "and" before "which".
- Stutters cut: "a black hole and… every black hole" (now two sentences), "by the… the
  effects on gravity", and a double false start before "the reason we've been looking
  for them" (rec20 311–312.7 s).
- Leading "and"/"but" dropped where sentences piled up: "Unlike most…", "In reality…",
  "They all, of course…", "They vary in size…", "We don't know how to make that in a
  lab…", "We know that they couldn't…", "The reason we've been looking…", "If primordial
  black holes exist…".
- Now 5:13 at 1.2×.

## Ideas for a future re-take of video 4's ending (not re-recording now)

- **Order of the collapse.** "the pressure inside the core of that supernova will be
  so large that the protons and the electrons… squished together" puts the
  supernova first. It's the other way round: at the end, a heavy star's core is an
  Earth-sized ball of iron held up by its electrons (like a white dwarf). Iron
  can't be fused for energy, so the core keeps gaining mass; at about 1.4 Suns
  (the Chandrasekhar limit, a dashed line on the chart) the electrons give way.
  In under a second the core falls from Earth size to about 20 km, protons and
  electrons become neutrons, and the infalling star bounces off that new core and
  explodes: the supernova. What stays in the middle is the neutron star; above
  about 2–2.5 Suns (the TOV limit, the other dashed line) it becomes a black hole.
  Possible line: "the core collapses, its protons and electrons are squeezed into
  neutrons, and the rest of the star bounces off it in a supernova."
- **"Every Sun-like star grows a white dwarf inside it as it ages."** Not on the
  main sequence (the Sun's core is hot gas at about 150 g/cm³; a white dwarf is
  about 10⁶ g/cm³). Once the core's hydrogen runs out, the helium ash shrinks
  until its electrons can't be packed tighter, while the outside swells into a red
  giant; later it fuses to carbon and oxygen, what white dwarfs are made of. When
  the outer layers drift off as a planetary nebula, that core is the white dwarf.
  Heavy stars (above about 8 Suns) carry on to iron and collapse instead; red
  dwarfs haven't run out of hydrogen in the age of the universe. Possible line,
  where the red giant appears: "Inside, a white dwarf is growing out of the
  star's own ashes. When the outer layers blow away, that's what's left."

Done in the scene meanwhile: the chart's two limits light up at the end of video 4
(`chandrasekhar` and `tov` lines, new in `src/narration.js`): "white dwarf limit ·
1.44 Suns" on the white dwarf, "core passes 1.44 Suns" at "big enough to go
supernova", "neutron star limit · ~2 Suns" on the neutron star, "above it: black
hole" on the black hole, with the camera close on each. Most of video 4's other
camera moves are about twice as close as before.
