#!/bin/sh
# The narration's background tracks (Kevin MacLeod, incompetech.com, CC BY 4.0;
# credits in CREDITS.md). Not in git: fetch them before running
# scripts/narration-sound.mjs.
cd "$(dirname "$0")"
for f in "Immersed.mp3" "Dreamer.mp3" "Fresh Air.mp3" "Soaring.mp3" "space explorers.mp3" "Mesmerize.mp3"; do
  [ -s "$f" ] || curl -sSfL -o "$f" "https://incompetech.com/music/royalty-free/mp3-royaltyfree/$(printf %s "$f" | sed 's/ /%20/g')"
done
ls -la *.mp3
