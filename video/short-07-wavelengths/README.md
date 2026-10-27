# short-07-wavelengths

Video 7, wavelengths (4:18, played as recorded with no speed-up), cut from rec42 of 2026-10-27. It plays as
`?narrate=short-07-wavelengths`, with the scene in `src/narration-scenes/short-07-wavelengths.js`;
the plan is `video/plans/wavelengths.md`. Most of it runs in the spectrum explorer
(`public/spectrum/`, `?video=1`) behind the chart's Compton line (the scene's `explorer` cues).

| Source | Raw file (iCloud `Projects/triangle/recordings`, home) | Setup |
|---|---|---|
| `rec42` | `wavelengths take 1.aifc` (6:59) | PCM 48 kHz, the same voice on both channels; one take with retakes and a spoken note |

The Whisper word timings of the raw file are in `video/sources/2026-10-27/`, with the review
notes, the author's note and the fact check. `edl.py` lists the kept clips, and `cuts.csv` is
where each one landed in the edit.

## Rebuild

As `video/short-01-hook/README.md` (build.py, then `enhance.py --plain`), but with **no tempo
step**: from this video on, takes play as recorded. The caption words were transcribed clip by clip
(filler-friendly prompt) and corrected as listed in the NOTES. The still is
`public/narration/short-07-wavelengths/thumb.jpg` (the scene's `thumb`, 128 s).
