# Exporting and publishing the shorts

Shared between the cloud session (edits, artifact) and the local session on Alex's
Mac (renders, uploads). Update this file when you change something the other side
depends on.

## Renders (local only)

`scripts/narration-render-all.sh <take>…` renders each take to
`output/videos/<take>.mp4` (1080×1920, 30 fps, with the sound-design mix; `output/` is
gitignored). It needs the dev server and Google Chrome, so it runs on the Mac.

Rendered 2026-10-20 from 32bb067 (the branch tip after take 5), checked (length = narration + credits, sample frames), and copied to iCloud `Projects/triangle/output videos/`:

| Take | Length | Status |
|---|---|---|
| short-01-hook | 1:13 | done, 1:16 with credits, 48 MB |
| short-02-density | 1:48 | done, 1:51, 116 MB |
| short-03-planets | 3:34 | done, 3:37, 179 MB |
| short-04-stars | 3:10 | done, 3:13, 129 MB |
| short-05d-black-holes | 5:40 | done, 5:43, 305 MB (video 5 = take 5) |

Archived 2026-10-20: the earlier black-hole takes were rendered the same way (length =
narration + credits checked, mid-video frame checked), copied to iCloud
`Projects/triangle/output videos/older black hole takes/`, and then removed from the branch
(audio, words.json, scene, edl; recoverable from git history; `video/sources/` notes kept):

| Take | Length | Size |
|---|---|---|
| short-05-black-holes.mp4 | 5:16 with credits | 288 MB |
| short-05b-black-holes.mp4 | 4:56 with credits | 294 MB |
| short-05c-black-holes.mp4 | 4:42 with credits | 269 MB |

If a take's audio, words.json or scene changes after its render, say so
here: it needs rendering again.

## Publishing

`scripts/youtube-publish.py` uploads `output/videos/*.mp4` with the YouTube Data API:
titles, blurbs, music and schedule in `video/youtube.json`, the description from
`video/DESCRIPTION.md` and the track's credit, the take's thumb as thumbnail, captions
from words.json, the playlist. Dry run by default; `--upload` sends, private unless
`youtube.json` says otherwise. Uploaded IDs are kept in `video/youtube-uploads.json`.

**Visibility (2026-10-20):** the test upload of short-01-hook (jDmPwXFs8vQ) could be
switched to unlisted in Studio, so this API project (Wandering About, 974507465706) is
not locked to private: no YouTube API audit needed. Workflow: the script uploads private,
Alex publishes or schedules in Studio. Still to try: `publishAt` from the script
(fully automatic scheduling). The OAuth app is in Testing mode, so the sign-in expires
weekly; switch it to "In production" before any unattended job.

YouTube counts a vertical video as a Short only up to 3:00: 01 and 02 qualify; 03, 04
and 05 go up as regular vertical videos unless trimmed.
