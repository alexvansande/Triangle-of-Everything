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
The exceptions are the shorts' audio and mix, so the player and the preview
work from a clean checkout.

## Watch it live

```bash
npm run dev
open "http://localhost:5173/?narrate=short-01-hook"
```

Tap or press Space to play and pause. Drag the scrubber (just above the bottom edge, clear of the phone's home-bar swipe) to seek, or use ←/→ for ±5 s.
On a desktop it runs in the 9:16 phone stage. Add `&stage=landscape` for 16:9
or `&stage=none` for the plain window, and `&captions=0` to drop the captions.

**Autoplay** (on by default, remembered per browser): a take starts on load if
the browser allows it (otherwise it waits for a tap), and at the end it counts
down 5 s and starts the next short **in place**, on the same audio element, so
phones keep playing without another tap. The "Autoplay on/off" chip on the
pause screen switches it; `&autoplay=0` starts with it off.

**Speed**: from video 7 (2026-10-27) on, takes are **not** sped up: they play as recorded (the author no
longer wants it). Before that, the shorts' audio was sped up with the pitch kept, to **1.2×** for the 2026-10-07 recordings and **1.1×** from the 2026-10-19 ones (`--tempo 1.1`)
(`scripts/narration-tempo.py`, with ffmpeg's atempo: rubberband made the voice sound like a phone or a tin can; it also scales the word timings and writes
`"tempo": 1.2` into words.json), so renders come out at 1.2× too. The pause
screen's 1× to 1.5× (`[` and `]` on a keyboard, `&speed=` in the URL) count
from the pace it was spoken at: 1.2× plays the file as-is and is the default,
and 1× slows it back to natural speed. A choice is remembered per browser and
carries over to the next short.

## End credits

Every video ends on a credits card for 3 seconds after the last
word (scene `credits: <seconds>`; 0 for none): design and narration, the
Lineweaver–Patel paper, the music (the take's backing track) and
triangleofeverything.com. The AI-use note goes in the published description
instead (`video/DESCRIPTION.md`). The text is `creditsHTML` in `src/narration.js`.
The mix (`narration-sound.mjs`) is that much longer, with the music carrying on
under the card and fading out by the end, and it writes `"credits"` into
words.json so the renderer includes them.

## Sound design

Keep it light: most of a short is the plain voice. Three kinds of moments,
each a phrase-anchored cue in the scene's `sound` list (fields under
[Scene fields](#scene-fields)):
- **Voice effects** (in the code, but none in use for now: on the voice they
  read as a recording glitch), for a few highlighted phrases: `echo`, `hall`, `radio`,
  `wide`, `liquid`, `deep`.
- **Small sound effects** when the narration names something you could hear:
  `bubble`, `glug`, `wind`, `hiss`, `drops` (condensation), `ignite`, `boom`,
  `drop`, `static`.
- **Music, rarely**, only under an emotional passage, made of quiet rhythms:
  `pulse` (a soft beat and plucked notes) or `heartbeat` (a lub-dub that
  quickens). It steps back 4 dB while the voice talks, and `stop: "cut"` ends
  it dead (the heartbeat stops on the supernova's "boom").

- **A music bed** (off by default for now; `bed: true` in a scene turns it
  on) under the whole take, quiet and rhythmic (soft plucked
  arpeggios at 92 BPM on a D – Bm – G – A loop), to fill the gaps between
  phrases. It follows the camera: the scale at the screen centre sets its
  character (atoms: quick 16ths, high and glassy, with faint ticks; human
  scale: warm 8ths; stars: slower, rounder notes; galaxies: sparse, low and long, with a pad
  and more reverb), a wide overview of the chart counts as spacious, and
  density sets the mood (left of the water line, dense: the minor loop; airy:
  major), switching only on a chord change. The tempo never changes, so it
  stays one piece. It sits about 19 dB under the voice, drops 8 dB while the
  voice talks, and steps aside for cue music (and stays out a few seconds
  after a `stop: "cut"`). - **A backing track**: `backing: "Dreamer"` (or `{ track, offset, gain }`) puts
  one of Kevin MacLeod's pieces under the whole take (incompetech.com, CC BY 4.0:
  credit it in the video's description; `video/music/CREDITS.md` has the text,
  and `video/music/fetch.sh` downloads the mp3s, which aren't in git). It's
  normalised to sit about 19 dB under the voice while it talks (ducked 8 dB),
  fades in and out, and steps aside for cue music.
- **Drama**: `{ at: "phrase", intensity: 2 }` cues set the bed's energy from
  that phrase on, until the next one: 0 silent, 0.5 hushed, 1 normal, 2 a
  build (twice the notes, a bass pulse on every beat), 3 the peak (a soft kick
  and a sustained pad, about 6 dB fuller than normal). It ramps over `ramp`
  seconds (default 2). No intensity cues are set yet, and they only act when the bed is on.

```bash
npm run dev    # keep running
node scripts/narration-sound.mjs short-01-hook short-02-density …
```

The player resolves the cues to times (`window.__narr.timeline()`), and
`scripts/narration-sound.py` synthesizes every sound in numpy (no samples, so
nothing needs a licence), mixes it with the voice at the voice's loudness
(−16 LUFS) under a −1 dBFS ceiling, and writes `mix.m4a` next to `audio.m4a`
(the voice file stays as it is) and `"mix"` in words.json. The player plays the
mix, and a "Sound design on/off" chip on the pause screen switches to the bare
voice in place. The renderer muxes the mix too (`--voice-only` for the bare
voice). Run it again after changing a take's audio or its scene.

Where it's used now:

| Short | Sound effects | Music |
|---|---|---|
| hook | – | pulse from "and then you realize" to the end |
| density | bubble on "float", glug on "sink" and the hippo's "sinks" | – |
| planets | wind on "atmosphere", hiss on "hydrogen just cannot escape" | – |
| stars | ignite on fusion, boom on the supernova, a sub drop on "black hole" | heartbeat through the life cycle, cut at "boom" |
| black holes | a sub drop on "collapse into a black hole", bubble on "float on a pool" | – |

**Moving dots.** The connection paths' dots (a star's life, what things are
made of, the spectrum) are drawn at 2.4× size and 1.7× opacity while narrating
(`app.setDots`; a scene can set `dots: { size, opacity }`): at the app's own 1.6 px
they vanish in a phone video.

## A new recording

**Fact-check it.** Every new recording gets a fact-check against the chart and
the physics before it ships: what's right, what's wrong (with a suggested
re-wording to record), and what's only imprecise, written in that recording's
`video/sources/<date>/NOTES.md` under "Fact check".

```bash
pip install faster-whisper
python3 scripts/narration-take.py ~/Desktop/recording.m4a short-05-example
open "http://localhost:5173/?narrate=short-05-example"
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
- `hl`: what to highlight until the next cue that has `hl` or `clear`. That can be objects, the lines (`schwarzschild`, `compton`, `hubble`, `water`, `darkmatter`, `luminous` (the galaxies' line without dark matter), `mainsequence`, `chandrasekhar`, `tov`, `triangle`), one side of the water line, or arrows between objects or points.
- The unit rulers fade in for every camera move and out once it settles. Add `units: true` to pin them. Mass is on the right, as in the map; the left side is kept for energy and temperature.
- `classic: "out"` cross-fades from the classic figure to the map. The narration starts on the classic figure.

The full field list is under [Scene fields](#scene-fields) below.

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
node scripts/narration-preview.mjs short-01-hook short-03-stars   # takes with audio; default: the shorts
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
node scripts/narration-render.mjs short-01-hook --workers 3 --out short-01-hook.mp4
# a slice for checking: --from 100 --to 120 --workers 1
```

The page runs on a virtual clock that the script steps one frame at a time, so
every frame is exact no matter how slow the machine is. That's about 10 frames
per second per worker on a 4-core box, so a 13-minute take needs roughly an hour
(without motion blur; with it, see below).

### Batches and publishing

- `scripts/narration-render-stale.sh [take …]` renders each take whose full render
  (`output/videos/<take>.mp4`, never in git) is older than the last commit touching its
  audio, captions or scene, or the code and pictures every short draws with. Then it makes
  the web copy (`video/web/<take>.mp4`, ~19.5 MB) and a dated copy in iCloud
  `output videos/`. The old render stays until the new one finishes.
- `scripts/narration-overnight.sh [take …]` does that take by take and publishes each one as it
  finishes: merges main, renders, commits the web copy, runs the site build and pushes to main
  (the videos page's "Rendered video" switch picks it up on deploy). A merge that conflicts is
  undone, not forced. Run it as `caffeinate -i nice -n 10 scripts/narration-overnight.sh`, from a
  session that stays open, with the "shorts" dev server (:5184) up.
- **Every night at 23:50** (`scripts/narration-nightly.sh`, a launchd agent installed with
  `scripts/launchd/install.sh`): it merges main, renders every take listed in
  `video/render-queue.txt` or out of date, publishes them, and clears the queue. Sessions add a
  take to the queue whenever they change it (CLAUDE.md). A note `# <take> changed: 1:20-1:45, …` re-renders
  only those stretches and splices them into the last render, when the audio hasn't changed
  (`scripts/narration-render-partial.py`); otherwise the whole take renders. With nothing to render for 14 days it
  uninstalls itself; `scripts/launchd/install.sh` puts it back. It renders the most changed first (a whole take by its length, a
  partial one by its noted seconds). A take counts as out of date only through its own audio,
  captions or scene; a shared-code change reaches a take only through the queue. Log: `output/videos/nightly.log`.
- Pace (2026-10-27, M1 Max): about one 5-minute video per hour or two with motion blur. The
  author releases about one video a week, so one or two renders a night is plenty; render in
  number order.

### Rendering faster: what we measured (2026-10-27, M1 Max, 1080×1920, 12 sub-frames)

- **The capture is the cost, not the drawing.** Per sub-frame: `renderAt` 16 ms; a PNG capture
  (`Page.captureScreenshot`) 295 ms; JPEG at q95 106 ms; WebP 169 ms. With 12 PNG sub-frames
  a frame took ~3.6 s, 95% of it encoding and decoding pictures.
- **Blur only what moves** (`--adaptive`, on by default): two tiny captures (1/8 size) at the
  shutter's ends; if under 0.1% of pixels differ by more than 12 levels, the frame gets one
  capture instead of 12. 40–70% of a video's frames are still. Everything that moves (whips,
  dives, the explorer turning, karaoke words changing) still gets full blur.
- **JPEG q95 captures** (`--capture jpeg`, the default): ~3× faster than PNG, and averaging the
  sub-frames hides the JPEG grain. Together: ~4× faster per worker on a stretch with a dive
  (10 s of video in 229 s with 2 workers).
- **More workers stop helping early.** Each worker is a whole Chrome drawing WebGL and
  compositing a 1080×1920 page; they share one GPU. 2 workers made ~1.3 frames/s in all,
  8 workers ~1.6. More than 3–4 mostly adds contention (load average in the 20s–40s).
- **Start workers apart.** Eight Chromes loading the dev server's unbundled modules at once
  all timed out (120 s). They now start 6 s apart and get 10 minutes to load.
- **Stopping a render must close its Chromes.** Killing the node process left its puppeteer
  Chromes running, orphaned, still drawing: the next run crawled (load average ~300) until
  they were killed. The renderer now closes its browsers on SIGINT/SIGTERM; after a crash,
  look for `puppeteer_dev_chrome_profile` processes whose parent is 1 and kill them.
- **Render overnight, with the Mac idle.** The night of 2026-10-27 (adaptive blur, JPEG, 4 workers):
  12–19 s of rendering per second of video with nobody at the Mac (video 3, 2:16, in 30 min;
  video 5, 6:15, in 78 min); about 24 s/s that evening while the author was using it. Whatever
  is on screen shares the same GPU.
- **Run one heavy job at a time.** Whisper transcriptions, other sessions' renders and sound
  mixes all slow a render a lot; the first hook render of the day took 67 minutes for 113 s
  under that load.
- Ideas not tried yet: fewer sub-frames for slow motion (6 is likely enough for glides; 12 for
  whips), a static production build served instead of the dev server (faster page loads), and
  capturing at a lower JPEG quality for the sub-frames only.

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
Each video gets its own cut list (an EDL like `video/<cut>/edl.py`) and its own take folder under `public/narration/`, with that cut's
`words.json` and `"scene"`. For example:
- `short-01-hook`, `short-02-density`, `short-03-black-holes`… (vertical)
- `long-01` (horizontal)

A clip can appear in several cuts. When you transcribe a new recording, note
which lines are short-only (intros, endings), which are long-only, and which
are shared, and keep the scene scripts per cut. They usually share their cues,
so a short's scene can import the matching section from another scene.

## Reference figures

- **What has been ruled out as dark matter**: [`img/dark-matter-constraints.png`](img/dark-matter-constraints.png)
  (SVG alongside) marks every primordial-black-hole limit (by mass, along the
  Schwarzschild line) and every macro dark-matter limit (mica, human injuries, white
  dwarfs, CMB) on the chart's axes; [`dark-matter-constraints.md`](dark-matter-constraints.md)
  explains each with sources. Use it to check narration about dark matter and
  primordial black holes (video 4 and after).

## Scene fields

Scene-level: `pbhWindow: false` hides the map's own primordial black hole window
(and its "ruled out by" labels) for a scene that draws the window itself.
`cover: { src, size: [w, h], frame: [x0, y0, x1, y1], r: [r0, r1], m: [m0, m1], hole: [x0, y0, x1, y1], from, dur, fade, bg, surround }`
opens a take over the classic figure on a picture of the page it comes from (`src` in
`public/narration/photos/`, `size` its pixels) with the figure's box (`hole`) cut out,
so the live figure shows through it, whole and as laid out. Both start at `from` of
the stage's width (default 1), centred on `surround` (the stage's dark), and zoom in together for `dur` s until the picture's plot
(`frame`, spanning log radius `r` and log mass `m`) fills the screen; then the picture
fades over `fade` s and the figure's camera eases into the scene's (the hook's AJP cover).

A scene is `src/narration-scenes/<take>.js`; a take picks it with `"scene"` in its
words.json (default: the take's own name).

```
Cue fields
  at       phrase (or [alternatives]) that triggers the cue
  offset   seconds relative to the phrase's first word (default -0.25)
  atEnd    anchor to the phrase's last word instead
  cam      { r, m, span } — log radius [cm], log mass [g], decades across
           the screen width — or { obj: "Name", span, dr, dm }
           cam.whip: a fast straight move at close zoom (no zoom out on the way),
           with a small elastic overshoot (default dur 0.6 s; the render's
           sub-frames blur it;
           cam.overshoot sets the bump, default 0.7, about 1.5 % of the move)
  dur      flight seconds (default: from the distance travelled)
           "end": fly until the end card covers the picture (the last word, + 0.65 s)
  ease     "gentle": sine easing, a near-even pace for long moves (default cubic in-out)
  swap     { "Name": "icon-file" }: from this cue on, the object is drawn with that
           picture from content/icons/ instead of its own (video 6's spherical cow);
           false puts the objects' own pictures back
  pop      true, with swap: the picture pops into the new one (shrinks, swaps at its
           smallest 0.14 s after the cue, springs back past its size and settles in
           ~1.2 s) with a white ring and rays bursting out of it (video 6's cow)
  periodic true: the map's periodic table (rows, columns, type rings, family
           names) fades in once the cue's camera arrives; false fades it out
  spectrum true: the spectrum's sine wave, likewise (it isn't redrawn while the
           camera moves, so end it with a cue before the next flight)
  explorer the spectrum explorer (public/spectrum/, ?video=1) over the chart, set
           as a pure function of t (the scene's `explorer` is its state at t = 0):
             show: true|false (fade s, default 1.2); view "inside"|"cloud",
             radius "custom"|"log"|"linear", bright "lin"|"log", rings (or
             "labelled": only the rings and discs named in labels), labels
             ({ "ring or marker name": "shown as" }: only those labels, renamed;
             "edge": a ring at the observable universe's edge, "Earth": one on
             Earth's surface): switch at the
             cue, and xfade: s with a view switch cross-fades from the old view;
             c, s (RGB selector, in bands of the sky's bar: natural colour c 22,
             s 1), yaw, pitch, orbit, ezoom (one camera for Inside and the Cloud:
             ezoom is Earth's size as Inside's field of view, orbit turns the
             camera about Earth's axis, so Earth stays put across a switch),
             gmst, unit, lz, exposure, contrast, lift, aurora (0–1: Earth's
             auroral X-ray ovals, a model), guides (0–1: the rings,
             discs and names faded so the dots show), names (0–1: the names alone,
             once set in place of guides), dot (the dots' size ×, each as bright):
             glide over dur s (default 2.5; ease "in"|"out"|"linear" chains glides
             into one move, default cubic in-out); spin: rad/s, added to the orbit with ezoom (the camera going
             round a still Earth); without, turns Earth (Inside) or the Cloud
           (short-07-wavelengths is the worked example; in the explorer page,
           spectrumVideo.mix() lists the bands under each channel, to check the
           words against the picture)
  header   false: the classic figure's title block fades out from the cue; true
           fades it in (hidden from the start if the first header cue is true)
  drift    slow zoom-in while holding, as a fraction (default 0.05)
  hl       highlights, shown until the next cue with hl/clear:
             { obj: "Name", label?, place?: "left"|"below", color? }
             (no tag when its text, or the name by default, only repeats the
             object's own label on the chart while that label shows)
             { line: "schwarzschild"|"compton"|"hubble"|"water"|
                     "darkmatter"|"mainsequence"|"triangle"|
                     "chandrasekhar"|"tov"|"eventhorizon", label? }
               (eventhorizon: the cosmic event horizon, a vertical line like the
               Hubble line, at 16.7 billion ly)
             { side: "left"|"right", of?: "water", label? }
             { side: "above"|"below", mass: logM, label?, note? } — one side of a level
               of constant mass, the level drawn dashed (video 2's round-world line)
             { card: "E = mc²", hold?: 2, bg?: "#fff", arrow?, caption? } — the
               screen (over the classic figure, its plot frame, so the axes stay)
               fades to a card with the text, holds, and fades back; arrow: a
               double arrow between the side axes, caption under it
             { density: logRho, label? } — a line of constant density (log g/cm³);
               "\n" in a line label stacks it
             { arrow: true, from: {obj}|{r,m}, to: {obj}|{r,m,mark}, label? }
             { swing: [{obj}|{r,m}, {obj}|{r,m}], period?, label? } — a star
               swinging back and forth between two points, further each time
             { dust: "blackhole", label?, labelX?, labelY?, sweep?, ticks? } —
               every catalogue dot of that category, lit in a sweep up the
               chart (black holes as ticks beside the Schwarzschild line)
             { ellipse: [r, m, rx, ry], rot?, label?, place? } — a loop round a
               cloud of dots (centre and half-axes in decades); leans with the
               3 : 1 density diagonals unless rot (screen degrees) is given
             { window: [lo, hi], from?, trace?, label?, cuts: [{ m: [lo, hi], label?, dash? }] }
               — masses (log g) still open along the Schwarzschild line, in red;
               each cut is a survey's own range, kept drawn and given its own lane
               where it overlaps an earlier one; the one with a label is the new
               one and grows in. trace: a faint line along the first window
             { cross: { r, m }, mass?, size? } — a dot with dashed guides to the
               mass ruler (right) and the size ruler (bottom), labelled
             { path: "DNA" | "stellar-high-mass" | [..], label?, color? } — moving-dot
               connection paths lit up (CONNECTION_PATHS and the "made of" paths in
               src/data.js): by id, or every path building that whole (DNA ← its four
               bases); a bright line drawn on under the pictures, white dots streaming
               along it the way the chart's dots go. Use it whenever the narration
               talks about what a path shows (a star's life, a decay, what a thing is
               made of)
             { text: "Dark matter?", at: [r, m], color?, size? } — a big free-standing word ("\n" stacks lines),
               a hub for arrows to point out from
             { key: [["microwave", "#ff6b5e"], …], title? } — a colour key near the
               top, for a false-colour view (the explorer's RGB)
             { pixels: { steps: [s, …], n?, cell?, seed? } } — expansion as an image gaining
               pixels: a black n×n image (9) with a few lit pixels; at each step every pixel
               becomes 3×3, the old one in the centre, so the lit ones spread apart
           any item can take delay (s) to stagger
  clear    end the current highlights
  density  from this cue on, the pictures' density (Settings → Icons; above 100 they
           may overlap more: video 5's pan up the galaxies); null back to the scene's
  units    pin the unit rulers on (they also show during every move)
  classic  "out" — cross-fade from the classic figure to the map (fade s)
  icons    from this cue on: false (no pictures), true (the scene's set) or a
           list of names. By default only objects some cue highlights keep their
           picture (a scene's `icons: [...]` replaces that set)

Scene-level: dots: { size, opacity } for the paths' moving dots (default 2.4, 1.7);
iconBoost: { from: log r, k } pictures of things that big and up drawn k× larger (video 5:
nebulae and up); hideLabels: [names] objects whose own chart label never shows

Sound cues (optional `sound: [...]`, read by scripts/narration-sound.mjs;
keep them rare). Each names a phrase like a cue does:
  { at, voice }  (none in use: they read as recording glitches) an effect on the voice for that phrase: "echo" (repeats
                 that fade off), "hall" (a long tail), "radio" (a tuned-in
                 radio with static), "wide" (spreads out in stereo),
                 "liquid" (a watery wobble), "deep" (sinks and drags)
  { at, fx }     a small effect from the phrase's first word: "static",
                 "bubble", "glug", "wind", "hiss", "drops", "ignite",
                 "boom", "drop"; offset (s), atEnd, gain (dB)
  { at, music, to?, toEnd? }  quiet rhythm from the phrase to the `to`
                 phrase (or the end): "pulse" (a soft beat and plucks) or
                 "heartbeat"; stop: "cut" ends it dead instead of fading
  { at, intensity, ramp? }  the music bed's energy from this phrase on, until
                 the next one: 0 silent, 0.5 hushed, 1 normal, 2 a build
                 (twice the notes, a bass pulse), 3 the peak (a soft kick and
                 a pad, about 6 dB fuller); ramps over `ramp` s (default 2)
bed: true         a quiet rhythmic music bed under the whole take, shaped by
                 where the camera is: small scales quick and high, galaxies
                 slow and low; dense things minor (off by default for now)
```
