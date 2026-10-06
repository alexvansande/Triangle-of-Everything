# Narrated tour: player, scene script and video render

The app can play a recorded narration and drive itself to it: camera moves,
highlighted objects and lines, unit rulers, karaoke captions, and the opening
cross-fade from the classic Lineweaver–Patel figure to the map.

| Piece | File |
|---|---|
| Player / engine | `src/narration.js` (loaded only with `?narrate=`) |
| What happens when | `src/narration-scenes/<scene>.js` (a take picks one with `"scene"` in its words.json; default `tour`) |
| A recording ("take") | `public/narration/<take>/audio.m4a` + `words.json` |
| New take from an audio file | `scripts/narration-take.py` |
| Video render (1080×1920 MP4) | `scripts/narration-render.mjs` |

**Audio and video files are not in git** (`.gitignore`): recordings get
re-recorded and renders get regenerated. Only `words.json` (the word timings)
is committed per take. To play a take, put its `audio.m4a` back in
`public/narration/<take>/`, or regenerate both files with `narration-take.py`.
The one exception is `video/reference/`, a compact copy of the latest render.
It's kept so each new version can be compared against it and then replace it.

## Watch it live

```bash
npm run dev
open "http://localhost:5173/?narrate=take-1"
```

Tap or press Space to play and pause. Tap the bottom edge to seek, or use ←/→ for ±5 s.
On a desktop it runs in the 9:16 phone stage. Add `&stage=landscape` for 16:9
or `&stage=none` for the plain window, and `&captions=0` to drop the captions.

## A new recording

```bash
pip install faster-whisper
python3 scripts/narration-take.py ~/Desktop/narration-2.m4a take-2
open "http://localhost:5173/?narrate=take-2"
```

The scene script doesn't change. Each cue fires when its **phrase is spoken**,
so the same script fits any recording that says roughly the same things. Phrases
that the new take doesn't contain are skipped and listed in the console
(`window.__narrMissing`). Edit those cues, or give them alternatives
(`at: ["first wording", "second wording"]`).

## The scene script

```js
{ at: "reach pluto", cam: { obj: "Pluto", span: 4 }, hl: [{ obj: "Pluto", label: "Pluto · round" }] },
{ at: "this line right here", cam: { r: 5, m: 33, span: 16 }, hl: [{ line: "schwarzschild", label: "schwarzschild radius" }] },
```

- `cam`: where to fly. `r` and `m` are log radius [cm] and log mass [g] at the screen centre, and `span` is decades across the screen width; or use `{ obj: "Name", span }`. Flights take a duration based on distance, then the camera drifts slowly inward while it holds.
- `hl`: what to highlight until the next cue that has `hl` or `clear`. That can be objects, the lines (`schwarzschild`, `compton`, `hubble`, `water`, `darkmatter`, `mainsequence`, `triangle`), one side of the water line, or arrows between objects or points.
- The unit rulers fade in for every camera move and out once it settles. Add `units: true` to pin them.
- `classic: "out"` cross-fades from the classic figure to the map. The narration starts on the classic figure.

The full field list is at the top of `src/narration-scenes/tour.js`.

## Render the video

```bash
npm run dev    # keep running
node scripts/narration-render.mjs take-1 --workers 3 --out narration.mp4
# a slice for checking: --from 100 --to 120 --workers 1
```

The page runs on a virtual clock that the script steps one frame at a time, so
every frame is exact no matter how slow the machine is. That's about 10 frames
per second per worker on a 4-core box, so a 13-minute take needs roughly an hour.

## Notes for the next take (from the take 2 review)

What worked: the condensed caption style, the new mic, and the bottom-edge ruler.
Keep those.

**Recording**
- Keep the intro on the classic figure shorter, so we reach our own chart sooner.

**Classic figure facts** (the hook scene must match these)
- The top axis is log radius too (Mpc), and the bottom is log radius (cm).
  Time is *not* on an axis: it's written on the diagonal lines (the ones
  labelled "now" or ending in "s"). So on "time…", highlight those diagonal
  labels instead of the top axis.
- The left axis is mass (g and M☉). The right axis is mass in GeV, which is
  the energy side.

**Axis highlight: restyle** (`drawAxis` in `src/narration.js`)
- Replace the rectangle band. Instead, make the axis's own tick numbers grow
  for about a second in a wave that runs along the axis, one number after
  another, with a soft yellow glow behind each number.
- This works on the classic figure's axis labels (`.cl-num` text in
  `src/classic.js`) and the map's axis numbers. Do it through a narration
  hook rather than drawing a copy on top, so the real numbers animate.
