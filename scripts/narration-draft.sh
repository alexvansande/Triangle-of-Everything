#!/bin/sh
# Draft renders by day, to see a change quickly (the author, 2026-11-09: full resolution only in the nightly):
#   scripts/narration-draft.sh <take> […]
# Each take in order, from what's on main: rendered at the site's own 720×1280 (--dpr 5/3, no motion blur) into
# output/videos/drafts/, put on the videos page as its "Rendered video" and pushed. Neither the full render
# (output/videos/<take>.mp4) nor its stamp (.commit) is touched, so the take stays out of date and the nightly
# renders it in full, which replaces the draft on the page. Named narration-overnight.sh.* while it runs, so the
# nightly waits for it. Needs the dev server on :5184 (URL= to change) and Google Chrome (CHROME=).
cd "$(git -C "$(dirname "$0")" rev-parse --show-toplevel)" || exit 1
if [ -z "$DRAFT_COPY" ]; then
  mkdir -p output/videos/drafts && cp "$0" output/videos/narration-overnight.sh.draft &&
    DRAFT_COPY=1 exec sh output/videos/narration-overnight.sh.draft "$@"
fi
export PATH="/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin:$PATH"
CHROME=${CHROME:-"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"}
URL=${URL:-http://localhost:5184}
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
  # the site's copy: the bitrate the full render's copy gets (under 20 MiB, at least 500 kbps)
  D=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$out")
  VB=$(python3 -c "print(max(int(19.5e6*8/$D/1000 - 148), 500))")k
  ffmpeg -hide_banner -loglevel error -y -i "$out" -c:v libx264 -preset slow -profile:v high -pix_fmt yuv420p -b:v "$VB" \
    -c:a aac -b:a 128k -movflags +faststart "video/web/$t.mp4" || { log "! $t: web copy failed"; continue; }
  git add "video/web/$t.mp4" && git commit -q -m "Draft render: $t (720×1280, no motion blur; the nightly renders it in full)

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>" -- "video/web/$t.mp4"
  git fetch -q origin; git merge -q --no-edit origin/main || { git merge --abort; log "! $t: merge conflicts, not pushed"; continue; }
  npm run build > output/videos/drafts/build.log 2>&1 || { log "! $t: site build failed, not pushed"; continue; }
  git push -q origin HEAD:main && git push -q origin HEAD && log "published draft $t"
done
log "drafts done"
