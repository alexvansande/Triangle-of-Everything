"""Speed up a take's audio, keeping the pitch, and scale its word timings to match.

    python3 scripts/narration-tempo.py short-01-hook short-02-density …   # 1.2×
    python3 scripts/narration-tempo.py short-01-hook --tempo 1.15

The last step of a new cut: after copying the edit to
public/narration/<take>/audio.m4a and writing its words.json, run this.
It rewrites both files and records "tempo" in words.json, so the player's
speed buttons stay in recorded-speed terms: 1× slows the file back to the
pace it was spoken at, and the take's own tempo (1.2×) plays the file as-is.
A take that already has a tempo is left alone (rebuild it from the edit).

The stretch is done with rubberband (--engine rubberband, the default), tuned for
speech: smooth transients and a soft onset detector keep the voice from sounding
phasey or mechanical, which ffmpeg's simpler atempo does more and more above about
1.2×. --engine atempo gives the old behaviour.
"""
import argparse, json, os, subprocess, sys

ap = argparse.ArgumentParser()
ap.add_argument("takes", nargs="+")
ap.add_argument("--tempo", type=float, default=1.2)
ap.add_argument("--engine", choices=["rubberband", "atempo"], default="rubberband")
a = ap.parse_args()
for take in a.takes:
    d = os.path.join("public/narration", take)
    wj = os.path.join(d, "words.json")
    t = json.load(open(wj))
    if t.get("tempo", 1) != 1:
        print(f"{take}: already at {t['tempo']}×, skipped"); continue
    src = os.path.join(d, t["audio"]); tmp = src + ".tmp.m4a"
    br = subprocess.run(["ffprobe", "-v", "error", "-select_streams", "a:0", "-show_entries", "stream=bit_rate",
                         "-of", "csv=p=0", src], capture_output=True, text=True).stdout.strip() or "192000"
    # time-stretch without changing the pitch
    af = (f"rubberband=tempo={a.tempo}:transients=smooth:detector=soft:window=long:pitchq=quality"
          if a.engine == "rubberband" else f"atempo={a.tempo}")
    subprocess.run(["ffmpeg", "-hide_banner", "-loglevel", "error", "-y", "-i", src, "-af", af,
                    "-c:a", "aac", "-b:a", br, "-movflags", "+faststart", tmp], check=True)
    os.replace(tmp, src)
    k = 1 / a.tempo
    t["words"] = [[w, round(s * k, 3), round(e * k, 3), *rest] for w, s, e, *rest in t["words"]]
    t["duration"] = round(t["duration"] * k, 2)
    t["tempo"] = a.tempo
    t["stretch"] = a.engine
    json.dump(t, open(wj, "w"), ensure_ascii=False, separators=(",", ":"))
    print(f"{take}: {a.tempo}×, {t['duration']:.1f} s")
