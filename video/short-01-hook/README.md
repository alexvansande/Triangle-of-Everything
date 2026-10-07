# short-01-hook

The opening hook as a vertical short (87 s), cut from the 2026-10-07 morning
recordings. It plays as `?narrate=short-01-hook`, with the scene in
`src/narration-scenes/short-01-hook.js`.

| Source | Raw file (iCloud) | Setup |
|---|---|---|
| `rec2` | `Link_office_mall_2.m4a` (3:47) | noise reduction on |
| `rec6` | `O2 Corporate & Offices 2.m4a` (4:17) | 48 kHz lossless, mic about 10 cm away, off to the side |
| `rec7` | `wavelength.m4a` (1:18) | 48 kHz, quiet room; the mass/size → energy → wavelength lines |

The Whisper word timings of the raw files (medium.en) are in
`video/sources/2026-10-07/`, with review notes on all four recordings. `edl.py` lists the kept clips, and `cuts.csv` is
where each one landed in the edit.

## Rebuild

```bash
W=/some/scratch; mkdir -p $W/audio
ffmpeg -i Link_office_mall_2.m4a -ac 1 -ar 48000 -c:a pcm_s16le $W/audio/rec2.wav
ffmpeg -i "O2 Corporate & Offices 2.m4a" -ac 1 -ar 48000 -c:a pcm_s16le $W/audio/rec6.wav
ffmpeg -i wavelength.m4a -ac 1 -ar 48000 -c:a pcm_s16le $W/audio/rec7.wav
cp video/sources/2026-10-07/rec*.words.json $W/
python3 video/tools/build.py $W video/short-01-hook/edl.py         # → $W/audio/edit_raw.wav, $W/cuts.csv
python3 video/tools/enhance.py $W/audio/edit_raw.wav $W/audio/edit   # cleanup, −16 LUFS
```

Then copy `edit.m4a` to `public/narration/short-01-hook/audio.m4a`, and
re-transcribe the edit for `words.json` (the cues anchor to its words).
Last, speed it up to 1.2× (pitch kept; the word timings scale with it):
`python3 scripts/narration-tempo.py short-01-hook`.
