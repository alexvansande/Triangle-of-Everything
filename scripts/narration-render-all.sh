#!/bin/sh
# Usage: scripts/narration-render-all.sh short-01-hook short-02-density …
# Needs the dev server on :5184 (or edit --url) and Google Chrome.
# Render each take to output/videos/<take>.mp4 (1080x1920, 30 fps, sound-design mix).
cd "$(dirname "$0")/.."
for t in "$@"; do
  echo "=== $t $(date +%H:%M:%S)"
  node scripts/narration-render.mjs "$t" --workers 6 --url http://localhost:5184 \
    --chrome "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
    --out "output/videos/$t.mp4" 2>&1 | grep -E "done|Error|error" 
done
echo "=== all done $(date +%H:%M:%S)"
