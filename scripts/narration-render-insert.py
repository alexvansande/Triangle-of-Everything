#!/usr/bin/env python3
"""A cut that is another take with a passage inserted: render only the new stretch and splice it
into the other take's render (the author, 2026-11-04: long video 1 with its outro).

    python3 scripts/narration-render-insert.py long-01-with-outro --out output/videos/long-01-with-outro.new.mp4 \
        [--url http://localhost:5184] [--workers 4] [--subframes 12] [--chrome PATH]

The cut file (video/cuts/<take>.json) names the render it goes into, "insertInto": "long-01-intro".
The words of the two takes are compared: the same up to the insert, and the same words at one
later time (the shift) from some point on. Frames up to the insert come from the old render,
then the new stretch, then the old render's frames, shifted. The stretch runs SETTLE seconds into
the words the two share again, so the camera has joined the old render's path, and ends in a
CROSS seconds cross-fade, since what moves by the clock alone (the paths' dots) sits elsewhere. The
sound is the take's own mix, whole. Refuses (exit 2) if the old render doesn't match its take.
"""
import json, os, re, subprocess, sys, tempfile

FPS = 30
PAD = 1.0        # s of old frames re-rendered before the insert (the join is exact there)
SETTLE = 2.5     # s into the shared words the stretch goes on
CROSS = 0.5      # s, the cross-fade back into the old render


def opt(k, d=None):
    a = sys.argv
    return a[a.index("--" + k) + 1] if "--" + k in a else d


take = sys.argv[1]
out = opt("out", f"output/videos/{take}.new.mp4")
base = json.load(open(f"video/cuts/{take}.json"))["insertInto"]
old = f"output/videos/{base}.mp4"
meta, bm = (json.load(open(f"public/narration/{t}/words.json")) for t in (take, base))
total, btotal = (m["duration"] + (m.get("credits") or 0) for m in (meta, bm))
probe = lambda f: float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", f],
                                       capture_output=True, text=True).stdout or 0)
if abs(probe(old) - btotal) > 0.2:
    print(f"{old} is {probe(old):.2f} s, its take {btotal:.2f} s: render it whole")
    sys.exit(2)

w, b = meta["words"], bm["words"]
head = 0
while head < min(len(w), len(b)) and w[head] == b[head]:
    head += 1
tail = 0
while tail < len(b) - head and w[-1 - tail][0] == b[-1 - tail][0] and abs((w[-1 - tail][1] - b[-1 - tail][1]) - (total - btotal)) < 0.02:
    tail += 1
if head + tail < len(b):
    print(f"the words differ beyond one insert (the same: first {head}, last {tail} of {len(b)}): render it whole")
    sys.exit(2)
shift = total - btotal
last_same = b[head - 1][2]            # the last word before the insert, in both
back = w[len(w) - tail][1]            # the first word they share again, in the new take
# the first of them after the camera's flight in the old render ("In the metric system" here)
gaps = [i for i in range(len(w) - tail, len(w) - 1) if w[i + 1][1] - w[i][2] > 0.3]
back = w[gaps[0] + 1][1] if gaps else back
a_f = round((last_same - PAD) * FPS)
b_f = round((back + SETTLE) * FPS)
cross_f = round(CROSS * FPS)
print(f"{take}: into {base}, +{shift:.2f} s; rendering {a_f / FPS:.2f}–{b_f / FPS:.2f} s, cross-fade {CROSS} s back into the old render")

tmp = tempfile.mkdtemp(prefix=".narr-insert-", dir=os.path.dirname(os.path.abspath(out)))
seg = os.path.join(tmp, "seg.mp4")
cmd = ["node", "scripts/narration-render.mjs", take, "--from", f"{a_f / FPS:.6f}", "--to", f"{b_f / FPS:.6f}",
       "--url", opt("url", "http://localhost:5184"), "--workers", opt("workers", "4"),
       "--subframes", opt("subframes", "12"), "--out", seg]
if opt("chrome"):
    cmd += ["--chrome", opt("chrome")]
subprocess.run(cmd, check=True)

W, H = subprocess.run(["ffprobe", "-v", "error", "-select_streams", "v", "-show_entries", "stream=width,height", "-of", "csv=p=0", old],
                      capture_output=True, text=True).stdout.strip().split(",")[:2]
sf = round(shift * FPS)
new_len = b_f - a_f
chains = [
    f"[0:v]trim=start_frame=0:end_frame={a_f},setpts=PTS-STARTPTS,setsar=1[a]",
    f"[1:v]trim=end_frame={new_len},setpts=PTS-STARTPTS,scale={W}:{H},setsar=1,format=yuv420p[n]",
    # the old render from where the cross-fade starts on, at its place in the new take
    f"[0:v]trim=start_frame={b_f - cross_f - sf},setpts=PTS-STARTPTS,setsar=1,format=yuv420p[o]",
    f"[n][o]xfade=transition=fade:duration={CROSS}:offset={(new_len - cross_f) / FPS:.6f}[x]",
    "[a][x]concat=n=2:v=1:a=0[v]",
]
audio = f"public/narration/{take}/{meta['mix'] if meta.get('mix') else meta['audio']}"
subprocess.run(["ffmpeg", "-hide_banner", "-loglevel", "error", "-y", "-i", old, "-i", seg, "-i", audio,
                "-filter_complex", ";".join(chains), "-map", "[v]", "-map", "2:a",
                "-c:v", "libx264", "-preset", "medium", "-crf", "18", "-pix_fmt", "yuv420p", "-r", str(FPS),
                "-af", "apad", "-t", f"{total:.3f}", "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart", out],
               check=True)
subprocess.run(["rm", "-rf", tmp])
print("done:", out, f"{probe(out):.2f} s of {total:.2f}")
