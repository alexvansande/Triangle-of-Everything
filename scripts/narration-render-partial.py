#!/usr/bin/env python3
"""Re-render only the stretches of a short that changed, and splice them into its last render.

    python3 scripts/narration-render-partial.py short-04-black-holes "1:20-1:45, 3:00-3:30" \
        --old output/videos/short-04-black-holes.mp4 --out output/videos/short-04-black-holes.new.mp4 \
        [--url http://localhost:5184] [--workers 4] [--subframes 12] [--chrome PATH]

The ranges are the take's playback time (m:ss or seconds), as noted in video/render-queue.txt
("# <take> changed: …", CLAUDE.md). Each is padded by PAD seconds, snapped to frames and merged
with its neighbours, rendered with scripts/narration-render.mjs --from/--to, and spliced over
the old render's frames; the audio is the take's own (mix if it has one), whole.

Only safe when the audio and timing are unchanged since the old render: the caller checks the
audio's last commit is older than the render, and this script refuses (exit 2) if the old
render's length doesn't match the take's, so the nightly falls back to a full render.
"""
import json, os, re, subprocess, sys, tempfile

FPS, PAD = 30, 1.0

def opt(k, d=None):
    a = sys.argv
    return a[a.index("--" + k) + 1] if "--" + k in a else d

take, spec = sys.argv[1], sys.argv[2]
old, out = opt("old"), opt("out")
meta = json.load(open(f"public/narration/{take}/words.json"))
total = meta["duration"] + (meta.get("credits") or 0)

def secs(x):
    x = x.strip()
    m = re.fullmatch(r"(\d+):(\d+(?:\.\d+)?)", x)
    return int(m.group(1)) * 60 + float(m.group(2)) if m else float(x)

# the ranges, padded, on frames, merged
ranges = []
for part in re.split(r"[,;]", spec):
    if not part.strip():
        continue
    a, b = (secs(v) for v in re.split(r"\s*[-–]\s*", part.strip(), maxsplit=1))
    a, b = max(0, min(a, b) - PAD), min(total, max(a, b) + PAD)
    ranges.append([round(a * FPS), round(b * FPS)])
ranges.sort()
merged = []
for a, b in ranges:
    if merged and a <= merged[-1][1] + FPS:   # less than a second apart: one range
        merged[-1][1] = max(merged[-1][1], b)
    else:
        merged.append([a, b])
if not merged:
    sys.exit("no ranges")

probe = lambda f: float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", f],
                                       capture_output=True, text=True).stdout or 0)
if abs(probe(old) - total) > 0.2:
    print(f"old render is {probe(old):.2f} s, the take {total:.2f} s: the timing changed, render it whole")
    sys.exit(2)
end_frame = round(total * FPS)
print(f"{take}: re-rendering " + ", ".join(f"{a / FPS:.1f}–{b / FPS:.1f} s" for a, b in merged)
      + f" of {total:.1f} s ({sum(b - a for a, b in merged) / end_frame:.0%})")

tmp = tempfile.mkdtemp(prefix=".narr-partial-", dir=os.path.dirname(os.path.abspath(out)))
segs = []
for i, (a, b) in enumerate(merged):
    seg = os.path.join(tmp, f"seg{i}.mp4")
    cmd = ["node", "scripts/narration-render.mjs", take, "--from", f"{a / FPS:.6f}", "--to", f"{b / FPS:.6f}",
           "--url", opt("url", "http://localhost:5184"), "--workers", opt("workers", "4"),
           "--subframes", opt("subframes", "12"), "--out", seg]
    if opt("chrome"):
        cmd += ["--chrome", opt("chrome")]
    subprocess.run(cmd, check=True)
    segs.append(seg)

# old frames between the ranges, the new segments in them, then the take's audio, whole
inputs, chains, labels = ["-i", old], [], []
cur = 0
for i, (a, b) in enumerate(merged):
    if a > cur:
        chains.append(f"[0:v]trim=start_frame={cur}:end_frame={a},setpts=PTS-STARTPTS[o{i}]"); labels.append(f"[o{i}]")
    inputs += ["-i", segs[i]]
    chains.append(f"[{i + 1}:v]trim=end_frame={b - a},setpts=PTS-STARTPTS[s{i}]"); labels.append(f"[s{i}]")
    cur = b
if cur < end_frame:
    chains.append(f"[0:v]trim=start_frame={cur}:end_frame={end_frame},setpts=PTS-STARTPTS[otail]"); labels.append("[otail]")
chains.append(f"{''.join(labels)}concat=n={len(labels)}:v=1:a=0[v]")
audio = f"public/narration/{take}/{meta['mix'] if meta.get('mix') else meta['audio']}"
inputs += ["-i", audio]
subprocess.run(["ffmpeg", "-hide_banner", "-loglevel", "error", "-y", *inputs,
                "-filter_complex", ";".join(chains), "-map", "[v]", "-map", f"{len(segs) + 1}:a",
                "-c:v", "libx264", "-preset", "medium", "-crf", "18", "-pix_fmt", "yuv420p", "-r", str(FPS),
                "-af", "apad", "-t", f"{total:.3f}", "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart", out],
               check=True)
subprocess.run(["rm", "-rf", tmp])
print("done:", out)
