# short-01-hook

The opening hook as a vertical short (1:50 at 1.1×), cut from the 2026-10-27
re-recording of the script. It plays as `?narrate=short-01-hook`, with the
scene in `src/narration-scenes/short-01-hook.js`. The earlier cuts (rec34 of
2026-10-26; rec2, rec6, rec7 of 2026-10-07) are in git history.

| Source | Raw file (Google Drive "Recordings") | Setup |
|---|---|---|
| `rec35` | `Hook re record.m4a` (5:13) | AAC mono; one take with retakes, after a mic test |

The Whisper word timings of the raw file (medium.en) are in
`video/sources/2026-10-27/`, with the review notes and fact check. `edl.py` lists the kept clips, and `cuts.csv` is
where each one landed in the edit. Video 2 (`video/short-02-up-the-line/`, rec33) is built the
same way.

## Rebuild

```bash
W=/some/scratch; mkdir -p $W/audio
ffmpeg -i "Hook re record.m4a" -ac 1 -ar 48000 -c:a pcm_s16le $W/audio/rec35.wav
cp video/sources/2026-10-27/rec35.words.json $W/
python3 video/tools/build.py $W video/short-01-hook/edl.py                 # → $W/audio/edit_raw.wav, $W/cuts.csv
python3 video/tools/enhance.py $W/audio/edit_raw.wav $W/audio/edit --plain   # cleanup, −16 LUFS
```

Then copy the edit into place and re-transcribe it for `words.json` (the cues
anchor to its words): `python3 scripts/narration-take.py $W/audio/edit.m4a short-01-hook`.
Re-apply the caption corrections listed in the NOTES and set `"scene"`. Then speed it up to 1.1×
(pitch kept; the word timings scale with it):
`python3 scripts/narration-tempo.py short-01-hook --tempo 1.1`, and remix the
sound with `node scripts/narration-sound.mjs short-01-hook` (dev server running).

A clip's `cut` spans (source seconds) leave a hesitation out from inside it (the clean-up of
2026-10-28: pauses the PAUSES cap missed because a breath or the room kept them over the silence
threshold). After a re-cut that only removes pauses, fillers or false starts, carry the corrected
caption words over instead of re-applying the NOTES by hand:
`python3 video/tools/transfer-captions.py old-words.json public/narration/<take>/words.json`
(old-words.json from `git show HEAD:public/narration/<take>/words.json`). For takes whose raw
recordings aren't at hand, `video/tools/postcut.py` cuts the EDL's `POST_CUTS` (edit seconds) out
of the finished audio instead.
