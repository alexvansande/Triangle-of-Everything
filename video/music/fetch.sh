#!/bin/sh
# The narration's background tracks: the whole of Kevin MacLeod's album Mesmerize
# (2016; incompetech.com, CC BY 4.0; credits in CREDITS.md). Not in git: fetch them before running
# scripts/narration-sound.mjs.
cd "$(dirname "$0")"
for f in "Fretless.mp3" "Immersed.mp3" "Dreamer.mp3" "Promises to Keep.mp3" "Fresh Air.mp3" "Soaring.mp3" \
         "Relaxing Piano Music.mp3" "space explorers.mp3" "Universal.mp3" "Daytime TV Theme.mp3" "Mesmerize.mp3" "In The West.mp3"; do
  [ -s "$f" ] || curl -sSfL -o "$f" "https://incompetech.com/music/royalty-free/mp3-royaltyfree/$(printf %s "$f" | sed 's/ /%20/g')"
done
ls -la *.mp3
