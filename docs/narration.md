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

**Where the recordings live:** the raw recordings and final renders are kept
in the author's iCloud, not in git. Each editing session gets the recording by
direct upload into the chat, then `narration-take.py` (or the EDL tools in
`video/<take>/tools/`) rebuilds `audio.m4a` and `words.json` from it. The
committed `words.json` and EDLs are enough to recreate any cut once the same
source recording is uploaded again.
The exceptions are the audio of take 2 and of `short-01-hook` (the current
hook), so the player and the preview work from a clean checkout.

## Watch it live

```bash
npm run dev
open "http://localhost:5173/?narrate=take-1"
```

Tap or press Space to play and pause. Tap the bottom edge to seek, or use ←/→ for ±5 s.
On a desktop it runs in the 9:16 phone stage. Add `&stage=landscape` for 16:9
or `&stage=none` for the plain window, and `&captions=0` to drop the captions.

**Autoplay** (on by default, remembered per browser): a take starts on load if
the browser allows it (otherwise it waits for a tap), and at the end it counts
down 5 s and starts the next short **in place**, on the same audio element, so
phones keep playing without another tap. The "Autoplay on/off" chip on the
pause screen switches it; `&autoplay=0` starts with it off.

**Speed**: the shorts' audio is sped up to **1.2×** with the pitch kept
(`scripts/narration-tempo.py`, which also scales the word timings and writes
`"tempo": 1.2` into words.json), so renders come out at 1.2× too. The pause
screen's 1× to 1.5× (`[` and `]` on a keyboard, `&speed=` in the URL) count
from the pace it was spoken at: 1.2× plays the file as-is and is the default,
and 1× slows it back to natural speed. A choice is remembered per browser and
carries over to the next short.

## Sound design

```bash
npm run dev    # keep running
node scripts/narration-sound.mjs short-01-hook short-02-density …
```

It reads each take's timeline from the player (`window.__narr.timeline()`:
camera flights, highlights that are new, the classic → map fade) and
synthesizes a bed for it in numpy (`scripts/narration-sound.py`). There are no
samples, so nothing needs a licence:
- **Pad**: open chords, D sus2 → B m7 → G maj9 → A sus4, about 12 s each,
  that dip 7 dB while the voice talks. It sits about 23 dB under the voice.
- **Whooshes** on camera flights: band-passed noise that sweeps up when
  zooming in and down when zooming out, sized by how far the camera goes and
  panned along its travel. Drifts and small moves stay quiet.
- **Chimes** on new highlights: a soft bell on D major pentatonic, at most one
  every 2.5 s, with a fifth on top when two things light up at once.
- **Reveal**: a rising shimmer into the classic → map cross-fade, then a low
  bloom and a ringing chord as the map lands.
- A shared hall reverb, the mix matched to the voice's loudness (−16 LUFS),
  and a look-ahead limiter at −1 dBFS.

It writes `mix.m4a` next to `audio.m4a` (the voice alone stays as it is) and
`"mix"` in words.json. The player plays the mix, and a "Sound design on/off"
chip on the pause screen switches to the bare voice in place. The renderer
muxes the mix too (`--voice-only` for the bare voice). Run it again after
changing a take's audio or its scene.

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

## Check a take

```bash
node scripts/narration-frames.mjs short-02-density 4 30 61.5 --out /tmp/frames
```

This lists any cue whose phrase isn't in the take, and saves a 9:16 still at
each time given.

## Preview without rendering

Rendering takes about an hour, so to check an edit, watch the player live
instead. It plays the audio and runs every camera move, highlight and caption
in real time. To watch it away from a dev server (for example on a phone,
through a private claude.ai page), build the trimmed preview:

```bash
node scripts/narration-preview.mjs short-01-hook take-2   # takes with audio; default: all of them
```

`dist-preview/` is the app with relative paths, so it runs from any folder. It
holds only what the player needs: map tiles to zoom level 4, woff2 fonts only,
no object pages. `index.html` is the normal page, and `page.html` is the same
page without `<html>`/`<head>`/`<body>` for hosts that add their own. It opens on a
grid of the takes: each card shows a still, the length, and the `title` and
`blurb` from the take's scene. `#<take>` plays one, with an "All videos"
button back to the grid; "Play all" starts the first and autoplays through the
rest. A card opens its take without a reload, so the tap that chose it also
starts the sound. The stills come from a running dev server, so keep
`npm run dev` up while building. In this build mode (`--mode narration-preview`), the app leaves
the address bar alone and skips the service worker.

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
- The app draws the classic figure's vertical axes **differently from the
  paper**, so it reads like the map: the left axis is mass in GeV (the energy
  side), and the right axis is mass in g. The paper's second mass axis, in
  M☉, is left out.

**Axis highlight** (`swellAxisNumbers` in `src/narration.js`): done. Over the
classic figure, `{ axis: side }` makes that axis's own tick numbers swell one
after another along it, then stay about 30% larger over blurred yellow disks.
There's no box. On the map, which has no tick numbers in the narration view,
a soft glow runs along that edge.

## Output plan: one long horizontal cut, many short vertical ones

The same recordings feed two kinds of video:

- **Long horizontal** (16:9, `&stage=landscape`): one or two long videos
  covering the whole tour.
- **Short vertical** (9:16, the default stage): many 2–6 minute videos, one
  topic each. **These are the current focus.**

They share material but are edited separately, because some things suit one
format and not the other:
- Vertical shorts each need their own small introduction and ending, which the
  long video doesn't.
- The long video has connecting parts that aren't worth a short of their own.

**How to save edits.** Keep one recording, but give it **several scripts**.
Each video gets its own cut list (an EDL in the `video/<take>/tools/edl.py`
style) and its own take folder under `public/narration/`, with that cut's
`words.json` and `"scene"`. For example:
- `short-01-hook`, `short-02-density`, `short-03-black-holes`… (vertical)
- `long-01` (horizontal)

A clip can appear in several cuts. When you transcribe a new recording, note
which lines are short-only (intros, endings), which are long-only, and which
are shared, and keep the scene scripts per cut. They usually share their cues,
so a short's scene can import the matching section from the tour scene.
