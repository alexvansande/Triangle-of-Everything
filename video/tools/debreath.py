"""Take the breaths out of an edit's pauses (the author, 2026-11-06: "some breathing sounds").

    python3 video/tools/debreath.py WORKDIR/audio/edit_mono.wav public/narration/<take>/words.json out.wav [--margin 0.05] [--min 0.08]

A breath is a burst in a pause between words (a gap over 0.3 s in the word timings, or the lead before
the first word) that sits well under speech but over the room: 8–32 dB above the noise floor for
`min`–0.9 s (default 0.08), at least `margin` s clear of the words either side (default 0.05). Each one is replaced by the recording's
own room tone (its quietest second), cross-faded over 20 ms, so the pause keeps its length and the
rhythm stays; nothing is cut. Prints every breath it took out (time, length, level) for review.
The words file is the take's words.json (scripts/narration-take.py on the SAME audio). Run it on the
enhanced edit, 16-bit mono (ffmpeg -i edit.wav -ac 1 -c:a pcm_s16le edit_mono.wav), then encode the result
to the take's audio.m4a: the loudness is already set, and nothing moves in time, so words.json stays right.
"""
import json, sys, wave, numpy as np
src, wj, dst = sys.argv[1], sys.argv[2], sys.argv[3]
margin = float(sys.argv[sys.argv.index("--margin") + 1]) if "--margin" in sys.argv else 0.05
minlen = float(sys.argv[sys.argv.index("--min") + 1]) if "--min" in sys.argv else 0.08
wf = wave.open(src); SR = wf.getframerate(); ch = wf.getnchannels()
a = np.frombuffer(wf.readframes(wf.getnframes()), dtype=np.int16).astype(np.float32) / 32768
if ch > 1: a = a.reshape(-1, ch).mean(1)
words = json.load(open(wj)); words = words["words"] if isinstance(words, dict) else words
f = int(0.01 * SR); m = len(a) // f
hp = a - np.convolve(a, np.ones(int(SR / 90)) / int(SR / 90), mode="same")   # the building's rumble out
e = 20 * np.log10(np.sqrt((hp[:m * f].reshape(m, f) ** 2).mean(1)) + 1e-9)
floor = np.percentile(e, 5)
k = int(1.0 / 0.01); sm = np.convolve(e, np.ones(k) / k, mode="valid"); q = int(np.argmin(sm))
room = hp[q * f:q * f + SR].copy()
out = a.copy(); X = int(0.02 * SR); ramp = np.linspace(0, 1, X, dtype=np.float32)
gaps = [(0.0, words[0][1])] + [(words[i][2], words[i + 1][1]) for i in range(len(words) - 1)] + [(words[-1][2], len(a) / SR)]
n = 0
for g0, g1 in gaps:
    if g1 - g0 <= 0.3: continue
    i0, i1 = int((g0 + margin) * 100), int((g1 - margin) * 100)
    j = i0
    while j < i1:
        if floor + 8 < e[j] < floor + 32:
            j0 = j
            while j < i1 and floor + 8 < e[j] < floor + 32: j += 1
            # a short burst right after a word is more likely its tail (a trailing s or t, which Whisper's word
            # end can miss by 50–100 ms) than a breath: only take it when it starts well inside the pause
            if minlen <= (j - j0) / 100 <= 0.9 and ((j - j0) / 100 >= 0.12 or j0 / 100 - g0 >= 0.15):
                s0, s1 = max(0, j0 * f - X), min(len(a), j * f + X)
                seg = np.resize(room, s1 - s0)
                blend = np.ones(s1 - s0, dtype=np.float32); blend[:X] = ramp; blend[-X:] = ramp[::-1]
                out[s0:s1] = out[s0:s1] * (1 - blend) + seg * blend
                print(f"{j0 / 100:8.2f}  {(j - j0) / 100:.2f} s  {e[j0:j].max():.0f} dB"); n += 1
        else: j += 1
w = wave.open(dst, "wb"); w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
w.writeframes((np.clip(out, -1, 1) * 32767).astype(np.int16).tobytes()); w.close()
print(f"{n} breaths replaced by room (floor {floor:.0f} dB) → {dst}")
