# Video edits

One folder per cut (`short-01-hook`, `short-02-density`, …), each with an
`edl.py` (the clips kept, in source seconds) and `cuts.csv` (where each clip
landed). Its take, `public/narration/<cut>/`, and its scene,
`src/narration-scenes/<cut>.js`, share the name.

- `tools/build.py WORKDIR video/<cut>/edl.py` cuts the edit from the raw
  recordings. `tools/enhance.sh` cleans it up and sets loudness to −16 LUFS.
  `video/short-01-hook/README.md` has the steps.
- `sources/<date>/`: Whisper word timings of each raw recording and review
  notes, with the factual problems and lines to re-record. The raw audio lives
  in iCloud and gets uploaded per session.
- `narration-take-1/`: the first take's edit (13 minutes, the whole tour).

Only `short-01-hook`'s audio is in git. For the others, upload the source
recording and rebuild.
