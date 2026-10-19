# Recording of 2026-10-19

| Source | Raw file (Google Drive "Recordings") | Length | Setup |
|---|---|---|---|
| `rec12` | `From humans to brown dwarfs .m4a` | 6:20 | home, 48 kHz ALAC; noise floor about −78 dB, so no extra denoise |
| `rec13` | `bar_do_zeca_pagodinho_4.m4a` (uploaded to the chat) | 0:51 | 48 kHz ALAC; the same noise floor (−79 dB) and a tone within ±3 dB of rec12; 3 dB hotter, turned down |
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
2. **Fixed by rec15.** "**more objects** will move towards the right side of the graph. Saturn…": only
   Saturn crosses. Jupiter (1.33 g/cm³), Uranus (1.27) and Neptune (1.64) are denser
   than water, left of the line on the chart. Suggested: "…objects get close to the
   line, and Saturn actually crosses it: it would float…".

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
dense and move right, toward the line (Neptune 1.64 → Saturn 0.69 g/cm³); only past
Jupiter do they turn left again. The cut keeps "as they grow, Saturn falls almost
on the line", which is right. If re-recorded: "as they grow, they get lighter for
their size, and Saturn falls almost on the line…".

Nothing from rec12 left open: items 1 and 2 are fixed by rec14 and rec15.

## rec16: `short-04-stars`

One take of the whole of video 4, replacing the 2026-10-07 cut (rec3 + rec6):
planets and stars aren't separate categories → Jupiter and Saturn give off more
heat than they get → brown dwarfs and deuterium → the fork in the chart → fusion
and the main sequence → the end of a star (collapse and expand, split in two) →
supernova remnants and planetary nebulae become stellar nurseries → the core
becomes a white dwarf, a neutron star or a black hole. `video/short-04-stars/edl.py`,
25 clips, 3:11 before the 1.1× tempo, 2:53 after.

**The ending will be re-recorded**, and the black-hole part (520 s on: "a black hole
is not an object in this chart, it's a line… the Schwarzschild radius… the first
limit of the triangle") is left out, for a video of its own. The cut ends for now
at "…then it will become a black hole."

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

Wrong, still in the cut (the ending is being re-recorded anyway):
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
