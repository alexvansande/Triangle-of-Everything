# Wavelengths (plan, 2026-10-27)

The video right after the one on the microscopic world (the Compton line, matter breaking
down into gamma rays). From the author's outline of 2026-10-27. Number to be set once the
microscopic video has one.

Almost all of it plays in the **spectrum explorer** (`public/spectrum/index.html`), not on
the chart: the chart opens and hands over, the explorer carries the rest. That's new for
the videos, so most of the building is in "What needs building" below.

## Shape

1. **One kind of stuff** (chart). Photons are particles; gamma rays to radio are the same
   thing at different energies. The photons along the Compton line, the sine wave drawn
   along them.
2. **Colours are labels** (explorer, Earth). Back to visible light: Earth in natural
   colour, the sky behind it. Shift the selector one step and the colours move: what we
   call colour is the brain's label for a wavelength.
3. **Up the spectrum and back** (explorer, Earth). Ultraviolet, X-rays, gamma rays, then
   all the way back down through infrared to microwaves. At each step, what Earth and the
   sky now show, and what we learn from it.
4. **How far is the light from?** (explorer, Cloud). Log distance: Earth this size, the
   Moon about a light-second away, the Sun eight light-minutes, the nearest stars a few
   light-years. The sky behind turns into a cloud of dots: nearby stars, the galaxy, the
   whole universe.
5. **Every wavelength from its own place** (explorer, Universe). Sweep the spectrum again
   on the cloud: each band lights up a different depth.

## Shot list

Selector positions are on the sky's bar (29 bands, evenly spaced, 0 = 408 MHz radio …
28 = gamma 3–300 GeV): `c` is the green channel's band, `s` the spread (red at c−s, blue
at c+s). Natural colour is c=22, s=1 (Gaia RP, G, BP).

| # | Beat | On screen |
|---|---|---|
| 1a | Photons are particles | Chart: slow push in along the Compton line onto the photon icons (never open static). |
| 1b | Same stuff, gamma to radio | Glide down the photons, gamma → radio, with the spectrum sine wave on (`setSpectrum`). Halo on gamma, then radio. |
| 1c | Back to visible light | Glide back to the visible-light photon; a **dive** into its icon (the icons are rendered from the explorer's sky cloud), and the explorer fades in where the icon is. |
| 2a | Earth in visible light | Explorer, Inside view, Earth centred, slowly turning; c=22, s=1. |
| 2b | Colours are labels | Glide to c=21: near-IR (J) shows as red, red as green, green as blue, blue drops out. Plants and snow change colour. Hold, then back to 22. |
| 2c | Ultraviolet | Glide to c=23: green as red, blue as green, ultraviolet as blue (how a bee's eye is built). Sky's UV is empty (no all-sky map); Earth's UV is smoke and dust. |
| 3a | X-rays | c → 25–26. Earth goes dark (air stops X-rays); sky: hot gas, X-ray binaries. |
| 3b | Gamma rays | c → 27. Sky: the galaxy's plane (cosmic rays hitting gas), pulsars, blazars. |
| 3c | Back down: infrared | Long glide down to c≈19–17: Earth's heat (11 µm), plants bright in near-IR; sky: stars through the dust, old stars. |
| 3d | Far infrared | c≈10–13: the galaxy's cold dust. |
| 3e | Microwaves | c≈4–6: Earth's water vapour and rain; sky: the cosmic microwave background. |
| 4a | Log distance | Zoom out from Inside into the Cloud (Log radius, the handover already exists), back at visible light. Rings: 1 light-second (Moon's orbit), 1 light-minute, the Sun's path at 8 light-minutes. |
| 4b | Nearest stars | Rings to 1 ly, 10 ly; the sky becomes dots. |
| 4c | The galaxy | Out to 10,000–100,000 ly; the Milky Way disc. |
| 4d | The universe | Out to 10 billion ly; the CMB shell at the edge. |
| 5 | Every wavelength from its own place | Hold the Universe view, slowly turning; sweep c from radio up to gamma (or the reverse) while each band's light sits at its own depth. End on a slow turn. |

## Draft script

A starting point in the author's voice, to say in your own words. About 600 words: a
little over 3½ minutes spoken, about 3¼ at 1.1×.

**1. One kind of stuff**

In the last video we saw that when matter breaks down, it turns into gamma rays. Gamma
rays are photons: particles of light. And here's the thing: every photon is the same
kind of particle. Gamma rays, X-rays, ultraviolet, visible light, infrared, microwaves,
radio waves: it's all the same stuff. The only difference is how much energy each photon
carries. More energy, shorter wavelength. Less energy, longer wavelength. And that's
the line they make on the chart, from gamma rays down here all the way to radio waves.

**2. Colours are labels**

Let's go back to visible light. This is Earth as you would see it from space, and the sky
behind it, in the light our eyes can see.

But colour isn't something out there in the world. It's a label your brain puts on a
wavelength. We have three kinds of colour sensors in our eyes, and we call what they
see red, green and blue. If our eyes were tuned a bit differently, we could see infrared
as red, red as green, and green as blue. Look: the forests light up, because plants
reflect a lot of infrared.

Or we could shift the other way, like a bee does, and see ultraviolet as blue.

**3. Up the spectrum and back**

Now let's keep going. In ultraviolet, Earth shows its smoke and dust. There's no full
map of the sky in ultraviolet: our air blocks it, so you have to go to space to see it.

Further up, in X-rays, Earth goes dark. Our atmosphere stops X-rays completely, which is
lucky for us. But the sky lights up with hot gas at millions of degrees, and pairs of
stars where one is eating the other.

And in gamma rays, the most energetic light there is, we see the plane of our galaxy
glowing where cosmic rays smash into gas, and spinning dead stars, and the cores of
distant galaxies with giant black holes at their centre.

Now let's go back down. In infrared, we see heat. Warm land glows, cold cloud tops are
dark. In the sky, infrared goes straight through the dust that hides the centre of our
galaxy, and we see the stars behind it. Further down, we see the dust itself: cold
clouds where new stars are born.

And in microwaves, Earth shows its water: vapour, rain, sea ice. And the sky is filled
with the oldest light in the universe: the afterglow of the Big Bang.

**4. How far is the light from?**

All this light comes from different places, at very different distances. So let's put it
on a log scale, like the chart. If Earth is this big, the Moon's orbit is just over one
light-second away. The Sun is eight light-minutes away. And the closest stars are only a
few light-years away.

Zoom out further, and the sky becomes a cloud of dots: the stars around us, then our
whole galaxy, and then the entire observable universe.

**5. Every wavelength from its own place**

Now let's go through the spectrum again. Visible light comes mostly from stars in our own
neighbourhood of the galaxy. Infrared reaches further, through the dust. Radio shows us
our galaxy's magnetic field and galaxies billions of light-years away. Microwaves come
from the very edge, the oldest light there is. And X-rays and gamma rays come from the
most violent things in the universe: exploding stars and feeding black holes.

Every wavelength is a different window, and each one shows a different universe.

## Facts to get right (fact-check notes before recording)

- **The colour shift goes one way only.** Shifting one step towards longer wavelengths
  shows infrared as red, red as green and **green** as blue; blue drops out. The outline's
  "blue as green" is the shift the other way (towards ultraviolet), where ultraviolet shows
  as blue. The script keeps them as two separate shifts.
- **"Colours are labels"**: right. Our three cone types peak near 420, 530 and 560 nm;
  colour is how the brain compares them. Bees see ultraviolet (their cones peak around
  340, 430 and 535 nm) but not red. "See infrared" in the sense of seeing it as a colour
  is fiction for us; pit vipers sense infrared as heat, with a separate organ.
- **Plants are bright in near-infrared**: right (the "red edge", ~700 nm on). The
  explorer's Near-IR 858 nm band shows it.
- **Ultraviolet sky**: the explorer has no all-sky UV map, because none exists at full sky
  (GALEX covered most but not all of it). The air blocks most UV below ~300 nm (ozone).
  Earth's UV picture is OMI's aerosol index, a measurement of how smoke and dust absorb
  UV, not a plain UV photo. "Shows its smoke and dust" is fair; avoid "this is Earth in
  ultraviolet".
- **X-rays and gamma rays don't reach the ground**: right; Earth goes dark in the explorer
  because it has no Earth bands above UV. In reality Earth does glow faintly in X-rays
  (aurorae) and gamma rays (a bright rim where cosmic rays hit the upper air, which Fermi
  sees), so say "Earth goes dark", not "Earth gives off no X-rays".
- **Gamma sky**: the diffuse plane is mostly cosmic rays hitting gas (pion decay); the
  point sources are pulsars and blazars. Right as scripted.
- **Microwave sky = afterglow of the Big Bang**: right for the CMB bands (70–217 GHz);
  the lowest (30 GHz) and highest Planck bands are dominated by the galaxy instead.
- **Distances**: Moon 384,400 km = 1.28 light-seconds; Sun 1 AU = 8.3 light-minutes;
  nearest star (Proxima Centauri) 4.24 ly. "A few light-years" is right.
- **"Visible light comes mostly from our neighbourhood"**: right for what the explorer's
  Gaia maps show (stars within a few thousand light-years, dust hides farther ones).
  "Radio shows galaxies billions of light-years away": right for the catalogued radio
  sources; the bright diffuse 408 MHz glow is our own galaxy.

## What needs building

1. **Scenes that drive the explorer.** Narration scenes only drive the chart. Needed: a
   scene cue that opens the explorer full-frame over the chart (the app already opens it
   as an overlay from the photons, `openAppOverlay` in `src/main.js`) and drives it on cue:
   target/view, selector glides (`c`, `s`), camera turn (yaw, pitch, zoom), Cloud radius
   mode, unit and `lz` glides, exposure. Simplest: a small `postMessage` API in the
   explorer (it already posts `close-app` to its parent), timed from the narration
   clock, and the explorer's own UI hidden except the spectrum bar.
2. **Chart → explorer handover**: a dive into the visible-light photon icon that lands on
   the explorer's matching sky view (the icons are already rendered from its cloud).
3. **Moon's orbit** in the Cloud: a ring at 1.28 light-seconds, labelled, beside the
   existing "1 light-second" circle; labels for the Sun (8.3 light-minutes) and Proxima
   Centauri (4.2 ly) as the zoom passes them.
4. **Portrait layout (9:16)** for the explorer in a video: the bar at the top, captions
   kept clear at the bottom, Earth centred.
5. **Band captions on the selector** in plain words while it glides ("near-infrared shown
   as red"): the explorer's own band notes (`bands.json`, `what`) are a good source.
6. **Check in the preview**: Earth in X-ray/gamma (should go dark, not glitch), the empty
   UV sky (reads as a gap, not a bug), and the Cloud's frame rate on a phone.

## Open questions for the author

- ~~Night lights?~~ Daylight only (author, 2026-10-27: only data that is a real part of
  the wavelength set). The night-lights band is VIIRS's 2012 composite with the land
  picked out of it by a script, and the explorer's globe is all daylit, so it stays out.
- Part 5: sweep radio → gamma, or gamma → radio to mirror part 1?
- End on the universe cloud, or dive back out to the chart's photons?
