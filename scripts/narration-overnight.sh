#!/bin/sh
# Overnight renders, published as they finish:
#   caffeinate -i nice -n 19 scripts/narration-overnight.sh [take …]
# For each take in order (default: every short, in number order): bring in
# what's new on main, render it if its render is out of date (scripts/narration-render-stale.sh:
# the full render in output/videos/, the web copy in video/web/, a dated copy in iCloud), then
# commit the web copy and push to main, so the videos page's "Rendered video" has it as soon
# as GitHub Pages deploys. When the list is done it looks once more for takes that went out of
# date meanwhile (another session's new cut). It never forces anything: a merge that conflicts
# is undone and that push waits for the next take.
# Needs the dev server on :5184 (the "shorts" preview) and Google Chrome.
cd "$(dirname "$0")/.." || exit 1
log() { echo "[$(date +%H:%M:%S)] $*"; }

ORDER="$*"
[ -n "$ORDER" ] || ORDER=$(ls -d public/narration/short-*/ | xargs -n1 basename)   # number order

sync_main() {   # bring main in; false (and undone) if it conflicts
  git fetch -q origin || return 1
  git merge -q --no-edit origin/main 2>/dev/null && return 0
  git merge --abort 2>/dev/null; log "merging main conflicts: left for the morning"; return 1
}
publish() {     # commit the web copies and push them to main (after a build check)
  git add video/web/*.mp4 video/render-queue.txt 2>/dev/null
  git diff --cached --quiet && return 0
  git commit -q -m "Rendered video: $1 (overnight render, $(date +%F))

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>" || return 1
  sync_main || return 1
  if ! npm run build > output/videos/overnight-build.log 2>&1; then log "site build failed (output/videos/overnight-build.log): not pushed"; return 1; fi
  git push -q origin HEAD:main && git push -q origin HEAD && log "published $1"
}

round() {
  for t in $ORDER; do
    [ -d "public/narration/$t" ] || { sync_main; [ -d "public/narration/$t" ] || { log "$t: no take yet"; continue; }; }
    sync_main
    out=$(scripts/narration-render-stale.sh "$t" 2>&1); echo "$out"
    case "$out" in *"web copy"*) publish "$t"; RENDERED=1 ;; esac
  done
}

log "overnight renders: $ORDER"
RENDERED=0; round
# anything that went out of date while the others rendered (a new cut on main)
for pass in 1 2; do
  sync_main
  RENDERED=0; ORDER=$(ls -d public/narration/short-*/ | xargs -n1 basename); round
  [ "$RENDERED" = 1 ] || break
done
log "all done"
