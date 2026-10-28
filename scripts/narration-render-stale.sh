#!/bin/sh
# Render every short whose full render is older than what it's made of, then make its web
# copy and a dated copy for iCloud. Meant to run unattended (overnight):
#   caffeinate -i scripts/narration-render-stale.sh [take …]   # default: every public/narration/short-*
# Needs the dev server on :5184 (URL= to change) and Google Chrome (CHROME=); WORKERS= Chrome workers (8).
# DRY=1: only list the out-of-date takes ("stale <take>"), render nothing.
# A take listed in video/render-queue.txt renders even if it looks up to date, and comes off
# the list once it has. A note "# <take> changed: 1:20-1:45, 3:00-3:30" there (the playback
# times whose picture changed) re-renders only those stretches and splices them into the last
# render (scripts/narration-render-partial.py), when the take's audio is older than that render
# and its length still matches; otherwise the whole take renders.
#
# A take is stale when its render (output/videos/<take>.mp4, never in git) is older than the
# last commit touching its audio, captions or scene, or the code and pictures every short
# draws with (src/, content/, public/hopf/, the cutaway photos). The old render stays in
# place until the new one has finished. Then:
#   video/web/<take>.mp4   the site's copy (720×1280, H.264 two-pass, ~19.5 MB; see video/web/README.md)
#   $ICLOUD/<take>-<date>.mp4   the full render, dated
cd "$(dirname "$0")/.." || exit 1
URL=${URL:-http://localhost:5184}
CHROME=${CHROME:-"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"}
ICLOUD=${ICLOUD:-"$HOME/Library/Mobile Documents/com~apple~CloudDocs/Projects/triangle/output videos"}
mkdir -p output/videos video/web

takes="$*"
[ -n "$takes" ] || takes=$(ls -d public/narration/short-*/ | xargs -n1 basename)

web() {   # full render → the site's copy, sized just under 20 MiB
  D=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$1")
  VB=$(python3 -c "print(int(19.5e6*8/$D/1000 - 148))")k
  P=output/videos/$3.pass
  ffmpeg -hide_banner -loglevel error -y -i "$1" -vf scale=720:1280:flags=lanczos -c:v libx264 -preset slow -profile:v high \
    -pix_fmt yuv420p -b:v "$VB" -pass 1 -passlogfile "$P" -an -f mp4 /dev/null &&
  ffmpeg -hide_banner -loglevel error -y -i "$1" -vf scale=720:1280:flags=lanczos -c:v libx264 -preset slow -profile:v high \
    -pix_fmt yuv420p -b:v "$VB" -pass 2 -passlogfile "$P" -c:a aac -b:a 128k -movflags +faststart "$2"
  rm -f "$P"*
}

for t in $takes; do
  [ -f "public/narration/$t/words.json" ] || { echo "- $t: no take"; continue; }
  out=output/videos/$t.mp4
  changed=$(git log -1 --format=%ct -- "public/narration/$t" "src/narration-scenes/$t.js" src ':!src/narration-scenes' \
    content public/hopf public/narration/photos)
  queued=$(grep -qx "$t" video/render-queue.txt 2>/dev/null && echo 1)
  if [ -z "$queued" ] && [ -f "$out" ] && [ "$(stat -f %m "$out")" -gt "${changed:-0}" ]; then
    echo "= $t: render up to date"
  elif [ -n "$DRY" ]; then
    echo "stale $t"; continue
  else
    echo "=== $t $(date +%H:%M:%S)"
    # only the stretches noted in the queue, if the audio hasn't changed since the last render
    note=$(sed -n "s/^# $t changed: //p" video/render-queue.txt 2>/dev/null | head -1)
    voice=$(git log -1 --format=%ct -- "public/narration/$t/audio.m4a" "public/narration/$t/mix.m4a" "public/narration/$t/words.json")
    partial=""
    if [ -n "$note" ] && [ -f "$out" ] && [ "$(stat -f %m "$out")" -gt "${voice:-0}" ]; then
      echo "  only $note"
      python3 scripts/narration-render-partial.py "$t" "$note" --old "$out" --out "output/videos/$t.new.mp4" \
        --url "$URL" --workers "${WORKERS:-8}" --subframes 12 --chrome "$CHROME" > "output/videos/$t.log" 2>&1 && partial=1 ||
        echo "  partial render didn't apply (output/videos/$t.log): rendering it whole"
    fi
    if [ -n "$partial" ] || node scripts/narration-render.mjs "$t" --url "$URL" --workers "${WORKERS:-8}" --subframes 12 --chrome "$CHROME" \
        --out "output/videos/$t.new.mp4" > "output/videos/$t.log" 2>&1; then
      mv "output/videos/$t.new.mp4" "$out"
      # off the render queue (video/render-queue.txt), with its note: the publish commits it with the web copy
      [ -n "$queued" ] && sed -i '' "/^$t\$/d" video/render-queue.txt
      sed -i '' "/^# $t changed: /d" video/render-queue.txt
    else
      echo "! $t: render failed (output/videos/$t.log)"; continue
    fi
  fi
  # the copies, when they're older than the render
  if [ ! -f "video/web/$t.mp4" ] || [ "$out" -nt "video/web/$t.mp4" ]; then
    web "$out" "video/web/$t.mp4" "$t" && echo "  web copy: video/web/$t.mp4"
  fi
  dated="$ICLOUD/$t-$(date -r "$out" +%F).mp4"
  [ -f "$dated" ] && [ ! "$out" -nt "$dated" ] || { cp "$out" "$dated" && echo "  iCloud: $dated"; }
done
echo "=== all done $(date +%H:%M:%S)"
