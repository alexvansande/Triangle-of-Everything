#!/bin/sh
# Draft renders by day, to see a change quickly (the author, 2026-11-09: full resolution only in the nightly):
#   scripts/narration-draft.sh <take> […]
# Each take in order, from what's on main: rendered at the site's own 720×1280 (--dpr 5/3, no motion blur) into
# output/videos/drafts/ and copied to iCloud's output videos to watch; not put on the site or pushed. Neither the
# full render (output/videos/<take>.mp4) nor its stamp (.commit) is touched, so the take stays out of date and the
# nightly renders it in full. Named narration-overnight.sh.* while it runs, so the
# nightly waits for it. Needs the dev server on :5184 (URL= to change) and Google Chrome (CHROME=).
cd "$(git -C "$(dirname "$0")" rev-parse --show-toplevel)" || exit 1
if [ -z "$DRAFT_COPY" ]; then
  mkdir -p output/videos/drafts && cp "$0" output/videos/narration-overnight.sh.draft &&
    DRAFT_COPY=1 exec sh output/videos/narration-overnight.sh.draft "$@"
fi
export PATH="/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin:$PATH"
CHROME=${CHROME:-"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"}
URL=${URL:-http://localhost:5184}
ICLOUD="$HOME/Library/Mobile Documents/com~apple~CloudDocs/Projects/triangle/output videos"
log() { echo "[$(date +%H:%M:%S)] $*"; }
for t in "$@"; do
  git fetch -q origin && { git merge -q --no-edit origin/main || { git merge --abort; log "merging main conflicts: $t from the branch as it is"; }; }
  out=output/videos/drafts/$t.mp4
  runner=scripts/narration-render.mjs
  [ "$t" != short-00-powers-of-ten ] || runner=scripts/render-zoom-queued.mjs
  log "draft $t from $(git rev-parse --short HEAD)"
  caffeinate -i nice -n 10 node "$runner" "$t" --url "$URL" --workers "${WORKERS:-4}" --subframes 1 --dpr 1.6666667 \
    --chrome "$CHROME" --out "$out" > "output/videos/drafts/$t.log" 2>&1 || { log "! $t: draft failed (output/videos/drafts/$t.log)"; continue; }
  grep WARNING "output/videos/drafts/$t.log" | sort -u | sed 's/^/  /'
  # to watch: iCloud's output videos, dated, beside the full renders; nothing goes to the site or YouTube (the author, 2026-11-09)
  cp "$out" "$ICLOUD/$t-draft-$(date +%F-%H%M).mp4" && log "draft $t: $ICLOUD/$t-draft-$(date +%F-%H%M).mp4"
done
log "drafts done"
