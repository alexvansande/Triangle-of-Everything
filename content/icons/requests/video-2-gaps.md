# Picture requests: video 2's empty stretches (2026-10-24)

Where video 2 ("Up the line") runs thin. Measured every 2 s on the current cut: how many
pictures are on screen and how much of the frame is empty (cube close-up and Eiffel dive left
out, they are meant to be close). Every object below is already a named dot in
`src/dust-famous.json`; it only lacks a picture, so a picture is all it needs. Same style,
file names and steps as `fill-the-gaps.md` (slug = file name).

| Stretch | Time | Masses | On screen now | Empty |
|---|---|---|---|---|
| Opening on Eois | 1–7 s | 1–40 mg | 3–6 pictures | 75–85% |
| Rocks → lakes → small moons | 153–171 s | 10¹¹–10²³ g (worst 10¹⁶–10²²) | 6–8 | 65–77% |
| Round worlds → planets | 171–223 s | 10²³–10³⁰ g | 8–10 | ~65% |
| Gas giants → brown dwarfs | 225–249 s | 10³⁰–10³² g | 10–12 | ~60% |

## 1. Opening (1–7 s)

| Object | Slug | What to draw |
|---|---|---|
| Codling moth | `codling-moth` | Small grey-brown moth, wings folded tent-like, the coppery eye-spot at each wing tip. Reference: `clothes-moth`. |
| Wax moth | `wax-moth` | Greater wax moth, dull grey-brown, wings folded flat. Reference: `clothes-moth`. |
| Tomato leaf miner | `tomato-leaf-miner` | Tiny silver-grey moth with long antennae swept back, speckled wings. Reference: `clothes-moth`. |

## 2. Rocks, lakes, small moons (153–171 s)

Lake Geneva and 253 Mathilde are already in `fill-the-gaps.md`; these go around them. So the
range isn't all lakes, Itokawa (picture already there), Didymos, Ryugu, Dinkinesh and Comet 67P
now sit among the lakes in `src/dust-famous.json` (replacing Lake Toplitz, Phewa Lake, Lake
Trasimeno, Neusiedl Lake and Lake Mead). Draw these first, then the lakes.

| Object | Slug | What to draw |
|---|---|---|
| Comet 67P | `comet-67p` | The "rubber duck" comet: two lobes joined by a neck, dark grey, cliffs and boulders, faint jets. ESA's Rosetta photos are CC BY-SA, not public domain, so generate it. Reference: `halleys-comet`, `itokawa`. |
| Didymos | `didymos` | Real photo: DART's last full view of Didymos (NASA/Johns Hopkins APL, public domain), the round "spinning top" with its equatorial ridge; composite like Iapetus. |
| Ryugu | `ryugu` | The dark "spinning top" asteroid, a diamond outline with a ridge round its equator, covered in boulders. JAXA photos aren't public domain, so generate it. Reference: `bennu`. |
| Dinkinesh | `dinkinesh` | Real photo: Lucy's view of Dinkinesh (NASA/Goddard/SwRI/Johns Hopkins APL, public domain), small and lumpy, the trough and ridge; composite like Iapetus. |
| Crater Lake | `crater-lake` | The round deep-blue caldera lake from above, Wizard Island near one edge. Reference: `lake-baikal`. |
| Great Salt Lake | `great-salt-lake` | From above, the causeway splitting it into a pink-red north arm and a blue-green south arm. |
| Lake Erie | `lake-erie` | The long shallow lake from above, green-blue. |
| Vatnajökull | `vatnajokull` | Iceland's ice cap from above, white with grey outlet glaciers. Reference: `greenland-ice-sheet`. |
| Lake Tanganyika | `lake-tanganyika` | The long narrow rift lake from above, very dark blue. |
| Nix | `nix` | Small elongated grey-white moon of Pluto, one reddish crater. Reference: `phobos`. |
| 21 Lutetia | `21-lutetia` | Big lumpy grey asteroid, one huge smooth crater bowl, as Rosetta saw it. Reference: `eros`. |
| Phoebe | `phoebe` | Dark, almost round moon of Saturn covered in craters, a few bright crater walls. Reference: `hyperion`. |
| 16 Psyche | `16-psyche` | Potato-shaped metallic-grey asteroid with a faint sheen, two large shallow craters. Reference: `eros`. |
| Amalthea | `amalthea` | Elongated dark-red moon of Jupiter. Reference: `phobos`. |

## 3. Round worlds and rocky planets (171–223 s)

TRAPPIST-1 e is already in `fill-the-gaps.md`; Iapetus now has its picture (a real Cassini photo).
Real moons and asteroids: prefer a public-domain NASA photo composited like Iapetus
(`scripts/compose-iapetus.py`) over a generated picture.

| Object | Slug | What to draw |
|---|---|---|
| Charon | `charon` | Grey moon of Pluto with the dark red polar cap (Mordor Macula). Reference: `mimas`. |
| Tethys | `tethys` | Icy white moon of Saturn, the huge Odysseus crater and the Ithaca Chasma canyon. |
| Dione | `dione` | Icy moon with bright wispy cliffs across one hemisphere. |
| Rhea | `rhea` | Icy, heavily cratered, one bright rayed crater. |
| Titania | `titania` | Uranus's largest moon, grey with long canyons. |
| Miranda | `miranda` | The patchwork moon: grooved "racetrack" regions and the Verona Rupes cliff. |
| K2-18 b | `k2-18-b` | Artist's sub-Neptune, deep blue hazy water world, lit red by a red dwarf. Reference: `kepler-22b`. |
| 55 Cnc e | `55-cnc-e` | Artist's lava world, glowing orange cracks on a black surface. |

## 4. Gas giants (225–249 s)

| Object | Slug | What to draw |
|---|---|---|
| WASP-39 b | `wasp-39-b` | Artist's puffy warm gas giant, tan-orange bands, JWST's first CO₂ planet. Reference: `jupiter`. |
| KELT-9 b | `kelt-9-b` | Artist's ultra-hot Jupiter, glowing white-orange day side, wisps blowing off. |
| WASP-12 b | `wasp-12-b` | Artist's very dark hot Jupiter, slightly egg-shaped (tidally stretched). |

## Order

If there's only time for a few: Charon, Tethys, Dione, Rhea (round worlds hold the screen
longest, 50 s), then 16 Psyche, 21 Lutetia, Crater Lake, Great Salt Lake (the emptiest
stretch), then the moths (the opening's first seconds).
