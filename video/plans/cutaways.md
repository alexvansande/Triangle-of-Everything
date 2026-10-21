# Cutaways: where the camera sits still

Every stretch of 8 s or more where the camera barely moves while the narration goes on,
in all five videos (times are in the video as played, at its 1.1× speed), and what could
cut in there. Found by scanning each take's camera path (`window.__narr.timeline().path`)
on 2026-10-21; re-run after any re-edit, the times move.

Totals: video 1, 12 s still; video 2, 176 s; video 3, 146 s; video 4, 234 s; video 5, 354 s.

## The two kinds of cutaway

**Photo.** The camera dives onto the object's dot, the chart fades to black around it and
the real image fills the frame at full resolution, with a slow push-in (Ken Burns) and a
one-line caption at the bottom: *what · who · when* (e.g. "M87* · Event Horizon Telescope ·
April 2019"). On the way out it shrinks back into the dot. Only real images: telescope,
spacecraft or camera photos, never illustrations. The repo's photos (`content/images/`)
are 400–800 px, made for the side panel: for video, fetch the original from the
Wikimedia source listed in `content/images/manifest.json` (most are 2000–6000 px).

**Diagram.** A short animation in one house style: white lines and dots on black, the
caption yellow for the key word, no more than three moving parts, 4–8 s. It replaces the
chart full-screen and hands back to it on the next camera move.

Lower cost, when neither fits: **a camera move** on the chart itself (a slow pan along the
line, a push onto a cluster of dots).

Priority: ★★★ do first (long still, strong picture), ★★ good, ★ only if time allows.

---

## Video 1 · The hook

| When | Still | What's said | Cutaway |
|---|---|---|---|
| 0:15–0:27 | 12 s | "the horizontal axis is size… a chart of mass versus size, but it's so much more" | ★ Camera move: let the classic figure's axes swell one at a time (already partly done); no cutaway needed. |

## Video 2 · Water to brown dwarfs

| When | Still | What's said | Cutaway |
|---|---|---|---|
| 0:00–0:12 | 12 s | "You can fit everything in the universe in a single chart…" | ★★ Camera move: the same slow push towards the human as video 5's opening. |
| 0:13–0:43 | 29 s | a liter is a kilogram and 10 cm; ×10 size = one square right, ×1000 volume = three squares up | ★★★ **Diagram: the cube law.** A 10 cm cube (1 kg) → a row of 10 → a 10×10 slab → a 10×10×10 block (1 m, 1 tonne), each step labelled ×10. Then the same jump drawn as one square right and three squares up on a grid, which becomes the chart's diagonal. |
| 1:16–1:25 | 9.5 s | "life started in water… we just carried it with us" | ★★ **Diagram**: a cell as a little bag of seawater; zoom out to a fish, then a person, each drawn as the same bag with "~70 % water". Hank Green's line as the caption. |
| 1:49–1:58 | 9.5 s | the blue whale, the sequoia | ★★ **Photos**: blue whale (NOAA) and the Grizzly Giant sequoia, side by side with a person silhouette for scale. |
| 2:03–2:11 | 9 s | the Eiffel Tower "has a lot of empty space… a fractal" | ★★★ **Photo**: the Eiffel Tower's lattice from below (Wikimedia), caption "≈ 0.007 g/cm³ counting the air inside: 140× lighter than water". |
| 2:27–2:37 | 9.5 s | Deimos and Phobos | ★★ **Photos**: Phobos (MRO HiRISE, 2008) and Deimos (MRO HiRISE, 2009). |
| 2:38–2:59 | 21.5 s | past Hyperion and Vesta things get round: gravity beats the bonds, worlds act like liquids | ★★★ **Photos in a row, by size**: Hyperion (Cassini, 2005) · Vesta (Dawn, 2011) · Ceres (Dawn, 2015) · Pluto (New Horizons, 2015), from potato to ball. |
| 3:00–3:17 | 17 s | atmospheres: Moon and Mercury none, Mars thin, Venus and Earth thick; hydrogen and helium escape | ★★ **Photos**: Mercury (MESSENGER), Mars with its thin haze at the limb, Earth's blue limb from the ISS; or a **diagram**: a planet with molecules bouncing, light ones (H, He) flying off small planets, staying on big ones. |
| 3:23–3:37 | 14 s | most ordinary matter is hydrogen and helium; hold on to them and you become a gas giant | ★★ **Photo**: Jupiter (Hubble OPAL, 2024) then Saturn (Cassini, 2009), caption "≈ 74 % hydrogen · 24 % helium". |
| 3:48–4:13 | 25 s | super-Jupiters: more mass, same size; the core pressure strips the electrons: degenerate matter | ★★★ **Diagram: degeneracy.** Atoms as circles (nucleus + electron cloud) squeezed together until the clouds merge into one sea of electrons; then a line of planets, each heavier, all the same width. |
| 4:14–4:33 | 19 s | the graph splits: stars to the right, dead stars to the left | ★ Camera move: travel up each branch in turn (cheap, and leads into video 3). |

## Video 3 · Planets into stars

| When | Still | What's said | Cutaway |
|---|---|---|---|
| 0:08–0:18 | 9.5 s | Jupiter and Saturn give off more heat than they get from the Sun | ★★ **Photo**: Jupiter in infrared (Gemini North, 2020), glowing from its own heat. |
| 0:19–0:56 | 36 s | brown dwarfs: not stars, not planets; they fuse only deuterium, a minuscule part of hydrogen | ★★★ **Photo**: Gliese 229B, the first brown dwarf ever seen (Palomar/Hubble, 1995). Then a **diagram**: 6,400 hydrogen nuclei with one deuterium (a proton and a neutron) lit up. |
| 0:57–1:05 | 8 s | "then we have this bifurcation" | ★ Camera move up both branches. |
| 1:06–1:41 | 34 s | the core can fuse all the hydrogen, pushes the star bigger, the main sequence; the fuel runs out | ★★★ **Photo**: the Sun (SDO, a real full-disk image). Then a **diagram**: gravity arrows in, fusion pressure arrows out, balanced = the main sequence. |
| 2:01–2:15 | 14.5 s | gas clouds join and make stellar nurseries | ★★★ **Photo**: the Pillars of Creation (JWST, 2022). |
| 2:22–2:33 | 10.5 s | a star too small to go supernova leaves a white dwarf | ★★ **Photo**: Sirius A and the tiny dot of Sirius B (Hubble, 2005). |
| 2:33–3:07 | 33 s | a supernova core squeezes protons into neutrons: a neutron star, a spoonful weighs a mountain; bigger, a black hole | ★★★ **Photo**: the Crab Nebula with its pulsar (Hubble + Chandra). Then a **diagram**: a teaspoon on a scale, a mountain on the other pan. |

## Video 4 · Black holes

| When | Still | What's said | Cutaway |
|---|---|---|---|
| 0:00–0:19 | 19 s | "everything that could ever exist can be plotted in this chart… a log-log density plot" | ★ Camera move: slow push in (not a full zoom-out). |
| 0:25–0:35 | 10 s | stars collapse and expand into red giants | ★★ **Photo**: Betelgeuse's surface (ALMA, 2017). |
| 0:45–0:58 | 13 s | a dense core is left: white dwarf, neutron star, black hole | ★ Reuse video 3's Sirius B and Crab cutaways, short. |
| 0:59–1:29 | 23 s | black holes sit on one line, the Schwarzschild radius; nothing crosses it | ★★ Camera move along the real black holes on the line (stellar, Sgr A*, M87*, TON 618), not the whole line. |
| 1:30–1:44 | 14 s | a singularity with an event horizon: the radius nothing escapes | ★★★ **Diagram**: a dot with a dark circle round it; light rays curving in, and one just outside it escaping. |
| 1:45–1:56 | 11 s | the event horizon grows in proportion to mass: a 45° line | ★★ **Diagram**: double the mass, double the radius, drawn as circles growing, then plotted as a 45° line. |
| 2:23–2:39 | 16 s | M87*, the first to be photographed; TON 618, bigger than the solar system, 60 billion suns | ★★★ **Photos**: M87* (Event Horizon Telescope, April 2019) and Sgr A* (EHT, May 2022). Then a **diagram**: TON 618's horizon drawn over the planets' orbits. |
| 2:42–2:54 | 12 s | we know two ways to make a black hole | ★ Camera move. |
| 2:59–3:15 | 16 s | right after the Big Bang everything was a hot, dense soup; some could have collapsed | ★★★ **Photo**: the cosmic microwave background (Planck, 2018), "the soup, 380,000 years later". |
| 3:16–3:38 | 23 s | surveys: quasars, the cosmic background, gravitational waves, microlensing; the window closes | ★★ **Photos**, one per survey: a LIGO detector arm, the Planck map, a microlensing light curve (diagram). |
| 3:55–4:17 | 22 s | something as heavy as an asteroid the size of an atom; invisible, found only by its effects | ★★ **Diagram**: an atom-sized dot on one pan, an asteroid on the other. |
| 4:29–4:40 | 10.5 s | most of the mass of the universe is invisible: dark matter | ★★★ **Photo**: the Bullet Cluster (Chandra + Hubble, 2006), the classic evidence. |
| 4:46–5:17 | 30 s | the window is still closing; maybe empty space is full of atom-sized black holes | ★ Camera move along the window. |
| 5:24–5:38 | 15 s | most matter collapsed; galaxies, stars and us are the lucky few | ★★ **Photo**: the Hubble Ultra Deep Field (2004), "the lucky few". |

## Video 5 · The Hubble sphere

| When | Still | What's said | Cutaway |
|---|---|---|---|
| 0:11–0:23 | 12 s | everything around you falls on one density line | (the new slow push in covers it) |
| 0:49–1:20 | 29 s | dead stars, white dwarfs, neutron stars, black holes; black holes are the first limit, on the Schwarzschild line | ★★ Camera move across the real black holes (as now), then a short **photo**: M87* again. |
| 1:20–1:40 | 19 s | stars → red giants → supernovae; the gas meets other remnants and new stars form | ★★★ **Photos**: the Crab Nebula (remnant) → the Pillars of Creation (nursery). |
| 1:41–1:53 | 12.5 s | globular clusters, dwarf galaxies, galaxies: the larger, the less dense | ★★ **Photo**: a globular cluster (Hubble, M2) next to a dwarf galaxy (the Large Magellanic Cloud). |
| 1:54–2:05 | 11 s | the Milky Way and its sister Andromeda; the Local Group | ★★★ **Photo**: Andromeda (a real telescope image), caption "2.5 million light-years · our sister". |
| 2:06–2:19 | 13 s | clusters are emptier still; superclusters are the largest structures | ★★ **Photo**: a galaxy cluster (JWST's SMACS 0723, 2022). |
| 2:20–2:52 | 32 s | superclusters are filaments; Laniakea, 100,000 galaxies; voids, emptier than the space around them | ★★★ **Diagram/data**: the cosmic web from a galaxy survey (SDSS or 2dF wedge plot, real data), voids as the dark holes; then Laniakea's map (Tully et al., 2014) with "you are here". |
| 3:05–3:48 | 43 s | the speed of light; space itself can outrun it; the universe isn't a ball growing into something; pixels inside pixels | ★★★ **Diagram: the pixels** (your idea). A white-on-black grid with three lit pixels. Each pixel splits into 3×3 = 9 new empty ones, so the lit pixels are now farther apart, measured in pixels; then the big grid shrinks back to the old size, and the three dots have spread out while nothing moved. Caption: "nothing moves: there's just more space between". |
| 3:49–4:04 | 15 s | it would never reach us… but the Hubble sphere grows, so the light gets here | ★★ **Diagram**: a light ray walking towards us on a stretching grid, losing ground at first, then winning as the sphere grows. |
| 4:05–4:26 | 21 s | the cosmic event horizon: the edge of our universe, the limit of the unknowable | ★★ **Diagram**: two circles centred on us, the Hubble sphere and, just outside it, the event horizon; beyond it, galaxies greyed out. |
| 4:27–5:23 | 56 s | add up everything in the Hubble sphere: it lands on the black-hole line; both are event horizons, one keeps light in, one keeps it out; both set by mass; a black hole has a centre | ★★★ **Diagram**: a black hole with light trapped inside (arrows can't leave), and our horizon with light outside (arrows can't arrive), side by side; then the black hole's centre marked, and the universe's "centre" shown as wherever the viewer is. Break the 56 s with the M87* photo at "both are event horizons". |
| 5:28–5:47 | 19 s | it's our universe, not the universe; someone at our edge sees us one way and a trillion galaxies the other | ★★★ **Diagram**: our circle; slide to a galaxy at its edge, draw its own circle overlapping ours, and the galaxies beyond it light up. |
| 5:55–6:06 | 11 s | the two lines form the upper limits of how big, small and massive things can be | ★ Camera move along both lines to where they meet. |
| 6:07–7:07 | 60 s | 46 billion light-years; galaxies we see but can never reach; outside the triangle; an illusion; a history of our own past | ★★★ **Photo**: the Hubble eXtreme Deep Field (2012), "galaxies as they were, up to 13 billion years ago", and the cosmic microwave background (Planck) for "the early universe". Then a **diagram**: where the light left (close), where the galaxy is now (46 billion ly away). |

## Making them

- Photos: one component in the player, `{ at, photo: "m87", caption: "…", dur }`, that dives
  onto the object's dot, fades the chart, shows `video/photos/<name>.jpg` full-frame with a
  slow push-in and the caption, and returns. Needs the originals downloaded with their
  credits (into the video description, like the music).
- Diagrams: small scripted SVG animations in the same player (`{ at, diagram: "pixels" }`),
  so they render frame-exact with the rest; the pixel grid, cube law, degeneracy and the
  two horizons are each about a screen of code.
- Start with the ★★★ ones: in video 5 they cover about 4 of its 6 still minutes.
