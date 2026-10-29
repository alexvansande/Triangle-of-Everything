#!/bin/sh
# The nightly render, run by launchd at 23:50 (scripts/launchd/, see docs/narration.md, "Batches
# and publishing"): brings in main, and if any short's render is out of date (a new cut, a scene
# change, a chart fix), renders and publishes those (scripts/narration-overnight.sh), starting the
# dev server on :5184 for the night if it isn't up. After 14 days with nothing to render it
# uninstalls itself: the author's rule, "if I spend two weeks without touching any of them,
# cancel the worker" (2026-10-28). Reinstall: scripts/launchd/install.sh.
# Log: output/videos/nightly.log. State: output/videos/nightly-last-change (the last night that
# had something to render).
cd "$(dirname "$0")/.." || exit 1
export PATH="/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin:$PATH"
LABEL=com.triangleofeverything.nightly-renders
STATE=output/videos/nightly-last-change
QUIET_DAYS=${QUIET_DAYS:-14}
mkdir -p output/videos
log() { echo "[$(date '+%F %H:%M:%S')] $*"; }

log "nightly check"
# a round started by hand earlier still running: let it finish
if pgrep -f narration-overnight.sh > /dev/null; then log "a render round is still running: skipping"; exit 0; fi
git fetch -q origin && { git merge -q --no-edit origin/main 2>/dev/null || { git merge --abort; log "merging main conflicts: checking the branch as it is"; }; }

stale=$(DRY=1 scripts/narration-render-stale.sh | sed -n 's/^stale //p')
if [ -z "$stale" ]; then
  [ -f "$STATE" ] || date +%s > "$STATE"   # the first quiet night starts the count
  quiet=$(( ($(date +%s) - $(cat "$STATE")) / 86400 ))
  log "nothing to render ($quiet of $QUIET_DAYS quiet days)"
  if [ "$quiet" -ge "$QUIET_DAYS" ]; then
    log "$QUIET_DAYS days without a change: uninstalling the nightly render"
    rm -f "$HOME/Library/LaunchAgents/$LABEL.plist"
    launchctl bootout "gui/$(id -u)/$LABEL" 2>/dev/null
  fi
  exit 0
fi
date +%s > "$STATE"
log "out of date: $(echo $stale)"

# the dev server for the night, unless one is already up (the app's "shorts" preview)
started=""
if ! curl -s -o /dev/null --max-time 5 http://localhost:5184/; then
  npx vite --port 5184 --strictPort > output/videos/nightly-vite.log 2>&1 &
  started=$!
  for i in $(seq 60); do curl -s -o /dev/null --max-time 5 http://localhost:5184/ && break; sleep 2; done
  log "started the dev server (pid $started)"
fi

# the most changed first (the author's rule, 2026-10-28): a whole take (no "changed:" note in the
# queue) by its length, a partial one by the seconds its note covers
weight() {
  note=$(sed -n "s/^# $1 changed: //p" video/render-queue.txt 2>/dev/null | head -1)
  [ -n "$note" ] && echo "$note" | tr ',;' '\n\n' | awk -F'[-–]' 'function s(x){gsub(/ /,"",x); n=split(x,a,":"); return n>1?a[1]*60+a[2]:x}
    NF==2{t+=s($2)-s($1)} END{print t+0}' && return
  python3 -c "import json;m=json.load(open('public/narration/$1/words.json'));print(m['duration'])"
}
order=$(for t in $stale; do echo "$(weight "$t") $t"; done | sort -rn | cut -d' ' -f2)
log "order: $(echo $order)"
WORKERS=${WORKERS:-4} caffeinate -i nice -n 10 scripts/narration-overnight.sh $order

# (npx starts vite as a child: stop whatever holds the port, but only if we started it)
[ -n "$started" ] && { lsof -ti tcp:5184 | xargs kill 2>/dev/null; kill "$started" 2>/dev/null; log "stopped the dev server"; }
log "nightly render done"
