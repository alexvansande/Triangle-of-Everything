# Recordings of 2026-10-07: review notes

Four recordings came in that morning, all on the iPhone at about the same mic gain:

| File | Length | Setup | Used for |
|---|---|---|---|
| `Link_office_mall_2.m4a` | 3:47 | noise reduction on | `short-01-hook` |
| `Link_office_mall_3.m4a` | 16:36 | noise reduction **off** | `short-02-density`, `short-03-planets`, `short-04-stars` |
| `Link_office_mall_4.m4a` | 1:39 | noise reduction on, air conditioner on low | was `short-01-hook`'s energy and wavelength lines, now replaced by rec7 |
| `Barra_da_Tijuca.m4a` (`rec5`) | 7:15 | mic about 10 cm away, **16 kHz**: recorded over the car's Bluetooth hands-free link, so nothing above 8 kHz | not used; it has every correction below, read well, but too dull to splice |
| `O2 Corporate & Offices 2.m4a` (`rec6`, Google Drive "Recordings") | 4:17 | 48 kHz 24-bit lossless, mic about 10 cm away, off to the side | intros: `short-01-hook` (quantum + relativity → the Big Bang), `short-02-density`, `short-04-stars` |
| `wavelength.m4a` (`rec7`, iCloud) | 1:18 | 48 kHz, quiet room (floor about −91 dBFS) | `short-01-hook`: "a chart of mass versus size, right?" → photons → "a chart of energy" → "doubles as a wavelength" |

**Sound.** Recording 3 is the cleanest. Its background in pauses sits at about
−81 dBFS, against −68 for recording 2 and −64 for recording 4. All three end up
fine after `video/tools/enhance.py`, the cleanup and −16 LUFS step. Keep one
setup per video so the background doesn't change at the joins. A 20–60 Hz
building rumble is in every file, and the 80 Hz high-pass removes it.

## The shorts cut from recording 3

| Short | Length | From → to |
|---|---|---|
| `short-02-density` | 1:57 | "why is everything just on this diagonal?" → humans → a liter and a tonne of water → the cube law → the water line → float or sink → the hippo |
| `short-03-planets` | 2:19 | up the line: blue whale, sequoia → man-made things and asteroids → round worlds → atmospheres → gas giants → Earth in between |
| `short-04-stars` | 3:08 | "planets and stars differ mostly by mass" → the left turn → brown dwarfs → the main sequence → the life of a star → neutron star or black hole → the first side of the triangle |

Each one keeps the cleanest complete take of every sentence. False starts and
repeats are cut, and pauses longer than half a second are shortened. The cut
lists are in `video/<short>/edl.py`, and the result is in `cuts.csv` next to it.

**Left out of the cuts:**
- The opening, roughly 0:36–2:20 of recording 3: "this is the triangle of
  everything… I created a website for it, triangleofeverything.com…". It suits
  the long video, or an ending for the shorts.
- The cube-or-sphere aside, and "the difference between a hundred or seventy
  kilograms".
- "Super earths… until it becomes a metallic core" was garbled. Also out: "what's the
  name of the… yellow cake line or the lollipop line".
- The Saturn line, which is wrong (see below).
- The repeated passes on the star life cycle.

## To re-record

Each row is a factual problem, followed by a suggested line that fits where it goes.

| Where | Said | Problem | Suggested line |
|---|---|---|---|
| rec 3, 11:06 (not in any cut) | "Notice that Saturn is to the **left** of the yellow line… Saturn would float on it" | Things that float sit to the **right** of the water line, which is blue. Saturn (0.69 g/cm³) is just to the right of it. | "Notice that Saturn is just to the right of the blue line. If you had a pool big enough, Saturn would float in it." This would fit at the end of `short-03-planets` or the start of `short-04-stars`. |
| `short-04-stars`, 2:00 | "…expand and collapse a few times, becoming a red giant or a red supergiant, until they will go boom and become a supernova" | Only stars heavier than about 8 Suns explode. Sun-like stars become red giants, puff off a planetary nebula and leave a white dwarf, with no boom. Red giants don't go supernova; red **super**giants do. | "Stars like the Sun swell into red giants, shed their outer layers as a planetary nebula, and leave a white dwarf behind. The most massive stars swell into red supergiants and end with a boom: a supernova." |
| `short-04-stars`, 2:30 | the remnant: "it will become a neutron star. But if it's any more massive than that, it becomes a black hole" | The source also said "if it's under a limit, it just becomes a white dwarf", but white dwarfs don't come out of supernovae. I cut that line, so the cut now goes straight from "it also depends on mass" to "it will become a neutron star", which is a little abrupt. | "If the core left behind is up to about two or three Suns, it becomes a neutron star. Any heavier, and it becomes a black hole." |
| `short-04-stars`, 0:20 | "the matter in the **nucleus** starts becoming degenerate matter… they scrape the electron layers" | It's the planet's **core**, not the nucleus. The source then said "and they start fusing", which I cut, because brown dwarfs never fuse hydrogen. | "…the matter in their core becomes degenerate: the pressure is so large it strips the electrons off the atoms." |
| `short-04-stars`, 0:45 | brown dwarfs: "they start breaking down their core atoms, but not as much as to generate fusion" | They do fuse deuterium for a while, just never ordinary hydrogen. | Optional: "…they can fuse a little deuterium, but never enough hydrogen to become a star." |
| `short-03-planets`, 0:08 | "the largest living thing that have ever existed, the huge sequoia tree" | Giant sequoias are the largest single **trees**. Some clonal colonies and fungi are larger organisms. | Optional: "…the largest single tree, the giant sequoia." |
| `short-02-density`, 0:39 | "If you multiply your size by 10" | "your size" means the container's size. | Optional: "If you make the box 10 times wider…" |
| `short-04-stars`, 0:00 | "planets **on** stars" | Your accent; the caption shows "on". | Optional re-take: "planets and stars". |

**Accent and caption fixes already in the scenes:** "short" → chart,
"Celadus"/"Celagos" → Enceladus, "spread super giant" → red supergiant,
"nebulae" → nebula, and "recipient" → container.

## Listen to these joins

I checked the cuts by re-transcribing them, not by ear, so intonation jumps are possible at:
- `short-01-hook` 0:24 (recording 2 → 7) and 0:48 (recording 7 → 6).
- `short-04-stars` at 0:11: the hook "Their difference is mostly about mass" comes from 12:10. It's followed by "And then notice that suddenly…" from 11:17.
- `short-04-stars` at 2:00: the life-cycle lines join two passes, one ending "…generate new energy", the next starting "so they will expand and collapse a few times…".

## Next recording: an intro for each short

Each short should stand on its own, so it opens with about 10 s of what we're
looking at and what this video is about. The easiest way is to record two pieces:

1. **One shared line, recorded once and used in every short:**
   "This is the triangle of everything: every object in the universe on one
   chart. Size goes from left to right, mass from bottom to top."
2. **One line per short, the promise:**
   - `short-02-density`: "And almost everything sits on one diagonal line. Why?"
     The cut then goes straight to "Let's zoom in. So here we are, humans."
   - `short-03-planets`: "Today we climb that diagonal, from whales to planets,
     and watch gravity take over."
   - `short-04-stars`: "Today: what turns a planet into a star, how stars live
     and die, and where black holes draw the first edge of the triangle."

On screen during the intro, the camera starts on the whole triangle, with
"size →" and "mass ↑" arrows on the shared line, then flies to where the short
begins on its promise line.


## Status after rec6

- **Spliced in:** the density intro ("When you plot every object by mass and
  size…"), the stars intro ("We think of planets and stars as being completely
  different things…"), and the hook's new passage (quantum mechanics bottom
  left, relativity top left, one point, the diagonals in seconds, "joining at
  the Big Bang"). It replaces "on the top here we have seconds…" and the
  "history of the universe" line. rec6 is EQ-matched to rec3 (`SOURCE_FX` in
  each EDL).
- **Still to record at 48 kHz (Bluetooth off):** the corrections above. They
  exist in rec5, but only at 16 kHz. Also the intro for `short-03-planets`.

## rec7: the wavelength lines

`wavelength.m4a` replaces rec4's four lines in `short-01-hook` (24–52 s). Rec4
had the air conditioner under it: about 12 dB more background than the rest of
the hook after cleanup, and "visible lights". Rec7 is the quietest recording so
far. On its own it sounded different from its neighbours: a honk at 1 kHz,
6–7 dB thin at 1.2–2 kHz, and no background at all (−76 dB against about
−60). Its `SOURCE_FX` is fitted on third-octave averages of rec2 and rec6
(±0.3 dB above 250 Hz), and its clips carry 4 s of rec6's own room tone,
looped and cleaned the same way, at the neighbours' level. The new wording drops "So what do these things have?" and
says "the bottom axis doubles as a wavelength", which makes the hook 4.4 s
shorter. The raw rec2 wasn't at hand, so the new lines were built and cleaned
with the same tools and spliced into the existing edit; `edl.py` rebuilds the
whole thing from raw.
