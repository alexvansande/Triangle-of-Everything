#!/bin/sh
# Installs the nightly render (scripts/narration-nightly.sh) as a launchd agent: every day at
# 23:50, from this checkout. A night missed while the Mac sleeps runs when it wakes.
# Uninstall: scripts/launchd/uninstall.sh (it also uninstalls itself after 14 quiet days).
cd "$(dirname "$0")/../.." || exit 1
LABEL=com.triangleofeverything.nightly-renders
PLIST="$HOME/Library/LaunchAgents/$LABEL.plist"
ROOT=$(pwd)
mkdir -p "$HOME/Library/LaunchAgents" output/videos
cat > "$PLIST" <<PL
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key><string>$LABEL</string>
  <key>ProgramArguments</key>
  <array><string>/bin/sh</string><string>$ROOT/scripts/narration-nightly.sh</string></array>
  <key>WorkingDirectory</key><string>$ROOT</string>
  <key>StartCalendarInterval</key>
  <dict><key>Hour</key><integer>23</integer><key>Minute</key><integer>50</integer></dict>
  <key>EnvironmentVariables</key>
  <dict><key>PATH</key><string>/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin</string></dict>
  <key>StandardOutPath</key><string>$ROOT/output/videos/nightly.log</string>
  <key>StandardErrorPath</key><string>$ROOT/output/videos/nightly.log</string>
</dict>
</plist>
PL
launchctl bootout "gui/$(id -u)/$LABEL" 2>/dev/null
launchctl bootstrap "gui/$(id -u)" "$PLIST" && echo "installed: $LABEL, every day at 23:50 ($PLIST)"
date +%s > output/videos/nightly-last-change   # the 14 quiet days count from now
