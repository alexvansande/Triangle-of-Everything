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
# last commit touching its own audio, captions or scene. A change to the code and pictures every
# short draws with (src/, content/, the photos) doesn't count by itself: most only add an opt-in
# cue field, and sessions push several a day, so each would re-render every take. The session
# that makes one queues the takes it changes (CLAUDE.md). The old render stays in
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
  # 720×1280, or 1280×720 for a 16:9 long cut
  S=$(ffprobe -v error -select_streams v -show_entries stream=width,height -of csv=p=0 "$1" | awk -F, '{print ($1 > $2) ? "1280:720" : "720:1280"}')
  VB=$(python3 -c "print(int(19.5e6*8/$D/1000 - 148))")k
  P=output/videos/$3.pass
  ffmpeg -hide_banner -loglevel error -y -i "$1" -vf "scale=$S:flags=lanczos" -c:v libx264 -preset slow -profile:v high \
    -pix_fmt yuv420p -b:v "$VB" -pass 1 -passlogfile "$P" -an -f mp4 /dev/null &&
  ffmpeg -hide_banner -loglevel error -y -i "$1" -vf "scale=$S:flags=lanczos" -c:v libx264 -preset slow -profile:v high \
    -pix_fmt yuv420p -b:v "$VB" -pass 2 -passlogfile "$P" -c:a aac -b:a 128k -movflags +faststart "$2"
  rm -f "$P"*
}

# what every short draws with (as scripts/narration-render-diff.mjs's "shared")
SHARED="src :!src/narration-scenes content public/hopf public/spectrum public/narration/photos index.html"
for t in $takes; do
  [ -f "public/narration/$t/words.json" ] || { echo "- $t: no take"; continue; }
  # already rendering in another run (a timed or hand-started render): leave it to that one
  pgrep -f "narration-render.mjs $t " > /dev/null && { echo "= $t: already rendering"; continue; }
  out=output/videos/$t.mp4
  changed=$(git log -1 --format=%ct -- "public/narration/$t" "src/narration-scenes/$t.js")
  # a "# next: <take>" note alone queues it too
  queued=$(grep -qxE "$t|# next: $t" video/render-queue.txt 2>/dev/null && echo 1)
  note=$(sed -n "s/^# $t changed: //p" video/render-queue.txt 2>/dev/null | head -1)
  # up to date: every commit to its files is in the commit it rendered from (the stamp). The
  # render file's time alone misses a push that landed while it rendered (video 4, 2026-10-29).
  # The code and pictures every short draws with count too: a change there that no session
  # pinned to stretches (a queue note) can be anywhere, so the take renders whole (the author,
  # 2026-10-30: "if something changes on the video and you can't tell exactly when you have to
  # re-render all of it").
  stamp=$(cat "output/videos/$t.commit" 2>/dev/null)
  if [ -n "$stamp" ] && git cat-file -e "$stamp" 2>/dev/null; then
    fresh=$([ -f "$out" ] && [ -z "$(git rev-list -1 "$stamp..HEAD" -- "public/narration/$t" "src/narration-scenes/$t.js" $SHARED)" ] && echo 1)
  else
    changed=$(git log -1 --format=%ct -- "public/narration/$t" "src/narration-scenes/$t.js" $SHARED)
    fresh=$([ -f "$out" ] && [ "$(stat -f %m "$out")" -gt "${changed:-0}" ] && echo 1)
  fi
  if [ -z "$queued" ] && [ -n "$fresh" ]; then
    echo "= $t: render up to date"; [ -n "$DRY" ] && continue
  else
    # what changed since the render (scripts/narration-render-diff.mjs: none, audio, partial or full)
    diff=$(node scripts/narration-render-diff.mjs "$t" 2>/dev/null || echo '{"kind":"full","why":"the diff failed"}')
    j() { echo "$diff" | python3 -c "import json,sys;v=json.load(sys.stdin).get('$1','');print(v if not isinstance(v,bool) else ('1' if v else ''))"; }
    kind=$(j kind); ranges=$(j ranges)
    if [ -n "$queued" ] && [ -n "$note" ] && [ "$kind" != full ]; then kind=partial; ranges="${ranges:+$ranges, }$note"   # its note's stretches
    elif [ -n "$(j shared)" ]; then kind=full   # shared code changed, no note says where: all of it
    elif [ -n "$queued" ] && [ "$kind" = none ]; then kind=full   # queued with nothing to show for it: trust the session
    fi
    if [ -n "$DRY" ]; then [ "$kind" = none ] && echo "= $t: only notes changed" || echo "stale $t $kind $ranges"; continue; fi
    echo "=== $t $(date +%H:%M:%S): $kind${ranges:+ ($ranges)} — $(j why)"
    head=$(git rev-parse HEAD)
    ok=""
    case "$kind" in
      none) touch "$out"; ok=keep ;;
      audio)   # the same frames, the new sound
        a=$(python3 -c "import json;m=json.load(open('public/narration/$t/words.json'));print(m.get('mix') or m['audio'])")
        ffmpeg -hide_banner -loglevel error -y -i "$out" -i "public/narration/$t/$a" -map 0:v -map 1:a -c:v copy -c:a aac -b:a 192k \
          -af apad -t "$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$out")" "output/videos/$t.new.mp4" && ok=1 ;;
      partial)
        python3 scripts/narration-render-partial.py "$t" "$ranges" --old "$out" --out "output/videos/$t.new.mp4" \
          --url "$URL" --workers "${WORKERS:-8}" --subframes 12 --chrome "$CHROME" > "output/videos/$t.log" 2>&1 && ok=1 ||
          echo "  partial render didn't apply (output/videos/$t.log): rendering it whole" ;;
    esac
    [ -n "$ok" ] || { node scripts/narration-render.mjs "$t" --url "$URL" --workers "${WORKERS:-8}" --subframes 12 --chrome "$CHROME" \
        --out "output/videos/$t.new.mp4" > "output/videos/$t.log" 2>&1 && ok=1; }
    if [ -n "$ok" ]; then
      [ "$ok" = keep ] || mv "output/videos/$t.new.mp4" "$out"
      echo "$head" > "output/videos/$t.commit"   # the next diff starts here
      # off the render queue (video/render-queue.txt), with its notes: the publish commits it with the web copy
      [ -n "$queued" ] && sed -i '' "/^$t\$/d" video/render-queue.txt
      sed -i '' "/^# $t changed: /d;/^# next: $t$/d" video/render-queue.txt
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
