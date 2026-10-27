# Notes for Claude sessions on this repo

## Narration (videos)
- **Before changing a scene, camera move or cutaway, read `video/plans/visual-rules.md`**: the
  author's rules for the videos (chart first, no full zoom-outs, dives before photo cutaways,
  which photos to use, audio checks).
- **Fact-check every new narration recording, always, without being asked.** Read
  the transcript against the chart and the physics, and write the findings in that
  recording's `video/sources/<date>/NOTES.md` under "Fact check": what's right, what's
  wrong (with the fix and a suggested re-wording), and what's only imprecise. Tell the
  author the wrong ones before or alongside cutting the audio.
- **Every new or re-cut video must be watchable by the author when you hand it over** (the
  author's rule, 2026-10-27). Get it onto the unlisted page,
  https://triangleofeverything.com/videos-3v63rqq1/ (built from `main` by GitHub Pages: merge,
  push, wait for the deploy, then check the page serves the new take), and give the link with
  the take's hash, e.g. `…/videos-3v63rqq1/#short-03-stars`. The private claude.ai preview page
  no longer fits (one version holds at most 512 files; the build has more). Don't touch the
  rendered videos (`video/web/`, the preview's "Rendered video" switch): they're rendered in a
  local session.
- **Scripts to record**: `video/scripts/recording-scripts.md` has every video's narration as cut
  now and the lightly edited script to re-record (with what changed). Keep it up to date when a
  take is replaced or the author changes a line.
- How the narration pipeline works (cut lists, voice treatment, tempo, scenes, sound,
  preview): `docs/narration.md` and `video/README.md`.
- **No speed-up for new takes** (the author, 2026-10-27): from video 7 (`short-07-wavelengths`, rec42) on,
  takes play at the speed they were recorded; don't run `scripts/narration-tempo.py`. The older takes keep
  their tempo: recordings from 2026-10-19 to 2026-10-27 play at 1.1× (`scripts/narration-tempo.py --tempo 1.1`), the old video 5 takes at 1.2×, 5b and 5c at 1.3×, 5d (now video 4, `short-04-black-holes`) at 1.1× (the author prefers its rhythm), all with atempo (rubberband sounded like a tin can);
  the earlier shorts at 1.2×.
