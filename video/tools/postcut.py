"""Cut fillers, false starts and dead air out of a finished edit.

    python3 video/tools/postcut.py video/<take>/edl.py AUDIO OUT.wav [--tempo 1.1]

For the takes whose raw recordings aren't at hand (iCloud), so the EDL can't be rebuilt: the
clean-up of 2026-10-28 took the restarts and the long pauses out of the finished audio. The EDL
module lists them as POST_CUTS = [(t0, t1), …] in edit seconds (edit.m4a from enhance.py, before
any tempo). AUDIO is that edit, or a take's audio.m4a after its tempo with --tempo (the spans are
divided by it). Each join gets a 15 ms cross-fade; OUT.wav is 24-bit at the input's rate and
channels, ready for scripts/narration-take.py (then video/tools/transfer-captions.py for the
corrected caption words, and the tempo step if the take has one and AUDIO was the edit).

Rebuilding from the raw recordings later: build.py → enhance.py → this on edit.m4a gives the same
audio, as long as the EDL above it is unchanged; change a clip and the POST_CUTS after it have to
be found again (or turned into build.py "cut" spans in source seconds).
"""
import argparse, importlib.util, json, subprocess
import numpy as np

ap = argparse.ArgumentParser()
ap.add_argument("edl"); ap.add_argument("audio"); ap.add_argument("out"); ap.add_argument("--tempo", type=float, default=1.0)
a = ap.parse_args()
spec = importlib.util.spec_from_file_location("edl", a.edl); m = importlib.util.module_from_spec(spec)
spec.loader.exec_module(m)
cuts = [(s / a.tempo, e / a.tempo) for s, e in sorted(getattr(m, "POST_CUTS", []))]
for (s0, e0), (s1, e1) in zip(cuts, cuts[1:]):
    assert e0 <= s1, f"overlapping cuts {s0}-{e0} / {s1}-{e1}"
info = json.loads(subprocess.run(["ffprobe", "-v", "error", "-select_streams", "a:0", "-show_entries",
                                  "stream=channels,sample_rate", "-of", "json", a.audio],
                                 capture_output=True, text=True, check=True).stdout)["streams"][0]
ch, SR = int(info["channels"]), int(info["sample_rate"])
x = np.frombuffer(subprocess.run(["ffmpeg", "-hide_banner", "-loglevel", "error", "-i", a.audio, "-f", "f32le", "-"],
                                 capture_output=True, check=True).stdout, np.float32).reshape(-1, ch)
n0 = len(x)
X = int(0.015 * SR); ramp = np.linspace(0, 1, X, dtype=np.float32)[:, None]
for s, e in reversed(cuts):
    i, j = int(round(s * SR)), int(round(e * SR))
    head, tail = x[:i], x[j:]
    x = np.concatenate([head[:-X], head[-X:] * (1 - ramp) + tail[:X] * ramp, tail[X:]])
subprocess.run(["ffmpeg", "-hide_banner", "-loglevel", "error", "-y", "-f", "f32le", "-ar", str(SR), "-ac", str(ch),
                "-i", "-", "-c:a", "pcm_s24le", a.out], input=x.astype(np.float32).tobytes(), check=True)
print(f"{len(cuts)} cuts, {(n0 - len(x)) / SR:.2f} s out: {n0 / SR:.2f} → {len(x) / SR:.2f} s")
