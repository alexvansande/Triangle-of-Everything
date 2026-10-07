# Sound map

The chart as a step sequencer, after Yamaha's Tenori-on and André Michelle's
ToneMatrix. It's a separate mode from the narration.

| Piece | File |
|---|---|
| The sequencer, instruments and panel | `src/sonify.js` (loaded only with `?sonify`) |
| Its own page for hosting (claude.ai…) | `scripts/sonify-preview.mjs` → `dist-sonify/` |

```bash
npm run dev
open "http://localhost:5173/?sonify"     # press play (or P), then zoom and pan
node scripts/sonify-preview.mjs          # dist-sonify/: page.html, index.html
```

## How it plays

- A playhead sweeps left to right across the visible plot in 16 steps (8th
  notes, 112 BPM by default; a tempo slider goes from 60 to 168).
- Every main object (the 181 in `src/objects.json`, not the catalogue dust)
  plays when the playhead passes it. At most five a step, the most important
  first (`z`), quieter when there are more.
- **Pitch** is its height on the screen, on a D major pentatonic scale over
  three octaves, so any zoom covers a full musical range and never clashes.
- **Instrument** is its region of the triangle (its category), with its own
  register:

| Category | Instrument |
|---|---|
| particle | glass bells (FM), high |
| composite (hadrons) | metal pluck (FM) |
| atomic | marimba |
| micro | bubbles |
| macro (living and made) | plucked string |
| planet | vibraphone |
| star | warm brass |
| remnant | pulsar ticks |
| blackhole | sub drop, low |
| galaxy | slow pad |
| largescale | deep choir, lowest |

- **Its own tone**: four numbers hashed from each object's name vary the
  instrument (FM ratio, brightness, decay, detune), so every dot keeps the same
  voice wherever it shows up.
- Pan follows its place across the screen, and the reverb grows toward the
  cosmic end.
- Zooming into a region leaves only its instruments playing; the region
  buttons (Particle Physics … Cosmology) jump between them.
- The panel lists the instruments with how many of each are on screen. Tap to
  mute, double-tap to solo.

Everything is synthesized with Web Audio; there are no samples.
