#!/bin/sh
# Removes the nightly render agent (scripts/launchd/install.sh).
LABEL=com.triangleofeverything.nightly-renders
launchctl bootout "gui/$(id -u)/$LABEL" 2>/dev/null
rm -f "$HOME/Library/LaunchAgents/$LABEL.plist" && echo "uninstalled $LABEL"
