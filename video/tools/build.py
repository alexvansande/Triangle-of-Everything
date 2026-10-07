"""Cut an edit from one or more raw recordings.

    python3 video/tools/build.py WORKDIR video/<short>/edl.py
WORKDIR holds audio/<source>.wav (48 kHz mono) and <source>.words.json
([[word, start, end], …] from scripts/narration-take.py's Whisper settings)
for every source the EDL names. Writes WORKDIR/audio/edit_raw.wav and
WORKDIR/cuts.csv; then run video/tools/enhance.py on edit_raw.wav.

EDL entries: (source, beat, first-word start, last-word start, {s, e, gap})
SOURCE_FX (optional): {source: ffmpeg filter}, applied to that recording first.
in source seconds. Cuts snap to the nearest real silence unless s/e are
given; gap overrides the pause before a clip (default 0.28 s inside a
beat, 0.6 s between beats).
"""
import csv, json, os, sys, wave
import numpy as np
import importlib.util
spec = importlib.util.spec_from_file_location("edl", sys.argv[2]); m = importlib.util.module_from_spec(spec)
spec.loader.exec_module(m); EDL = m.EDL
# Optional per-source ffmpeg filters (EDL module's SOURCE_FX), e.g. an EQ that
# matches a recording made with a different mic placement to the others.
SOURCE_FX = getattr(m, "SOURCE_FX", {})
D = sys.argv[1]
GAP_SAME, GAP_BEAT, TAIL = 0.28, 0.6, 0.5

class Source:
    def __init__(self, name):
        self.words = [{"w": w, "s": s, "e": e} for w, s, e in json.load(open(f"{D}/{name}.words.json"))]
        self.by_start = {round(w["s"], 2): w for w in self.words}
        src = f"{D}/audio/{name}.wav"
        if name in SOURCE_FX:
            import subprocess
            fx = f"{D}/audio/{name}.fx.wav"
            subprocess.run(["ffmpeg", "-hide_banner", "-loglevel", "error", "-y", "-i", src, "-af", SOURCE_FX[name],
                            "-ac", "1", "-c:a", "pcm_s16le", fx], check=True)
            src = fx
        wf = wave.open(src); self.SR = SR = wf.getframerate()
        a = np.frombuffer(wf.readframes(wf.getnframes()), dtype=np.int16).astype(np.float32) / 32768
        # the building's rumble sits at 20–60 Hz: keep it out of the silence detector
        self.a = a
        hop, win = int(0.005 * SR), int(0.02 * SR)
        n = (len(a) - win) // hop
        hp = a - np.convolve(a, np.ones(int(SR / 90)) / int(SR / 90), mode="same")
        self.db = 20 * np.log10(np.array([np.sqrt(np.mean(hp[i*hop:i*hop+win] ** 2)) for i in range(n)]) + 1e-9)
        self.hop, self.win, self.n = hop, win, n
    def t(self, i): return (i * self.hop + self.win / 2) / self.SR
    def i(self, t): return max(0, min(self.n - 1, int(t * self.SR / self.hop)))
    def quietest(self, t0, t1):
        i0, i1 = self.i(t0), self.i(t1); return self.t(i0 + int(np.argmin(self.db[i0:i1 + 1])))
    def runs(self, t0, t1, thr, minlen=0.06):
        i0, i1 = self.i(t0), self.i(t1); q = self.db[i0:i1 + 1] < thr; out, k = [], 0
        while k < len(q):
            if q[k]:
                j = k
                while j < len(q) and q[j]: j += 1
                if self.t(i0 + j) - self.t(i0 + k) >= minlen: out.append((self.t(i0 + k), self.t(i0 + j)))
                k = j
            else: k += 1
        return out
    def thr(self):  # silence threshold: 8 dB over this recording's noise floor
        return np.percentile(self.db, 8) + 8
    def start_cut(self, w):
        c = [r for r in self.runs(w["s"] - 0.6, w["e"], self.thr()) if w["s"] - 0.35 <= r[1] <= w["e"] - 0.06]
        return max(c, key=lambda r: r[1] - r[0])[1] - 0.04 if c else self.quietest(w["s"] - 0.15, w["s"] + 0.03)
    def end_cut(self, w):
        c = [r for r in self.runs(w["e"] - 0.2, w["e"] + 0.8, self.thr()) if r[0] >= w["e"] - 0.2 and r[1] - r[0] >= 0.08]
        return c[0][0] + 0.08 if c else self.quietest(w["e"] - 0.05, w["e"] + 0.15)
    def cap_pauses(self, x, maxp=0.5):
        SR = self.SR; f = int(0.01 * SR); m = len(x) // f
        hp = x - np.convolve(x, np.ones(int(SR / 90)) / int(SR / 90), mode="same")
        e = 20 * np.log10(np.sqrt((hp[:m * f].reshape(m, f) ** 2).mean(1)) + 1e-9)
        quiet = e < self.thr(); out, k, last = [], 0, 0
        while k < m:
            if quiet[k]:
                j = k
                while j < m and quiet[j]: j += 1
                if (j - k) * f > maxp * SR:
                    keep = int(maxp * SR) // 2; out.append(x[last:k * f + keep]); last = j * f - keep
                k = j
            else: k += 1
        out.append(x[last:]); return np.concatenate(out)

def fade(x, SR, ms=12):
    k = int(ms / 1000 * SR); x = x.copy(); r = np.linspace(0, 1, k); x[:k] *= r; x[-k:] *= r[::-1]; return x

sources = {name: Source(name) for name in {item[0] for item in EDL}}
SR = next(iter(sources.values())).SR
out, rows, t, prev = [], [], 0.0, None
for item in EDL:
    name, beat, ws, we = item[:4]; ov = item[4] if len(item) > 4 else {}
    S = sources[name]; w0, w1 = S.by_start[round(ws, 2)], S.by_start[round(we, 2)]
    s = ov.get("s") or S.start_cut(w0); e = ov.get("e") or S.end_cut(w1)
    clip = fade(S.cap_pauses(S.a[int(s * SR):int(e * SR)]), SR)
    gap = 0.0 if prev is None else ov.get("gap", GAP_BEAT if beat != prev else GAP_SAME)
    out.append(np.zeros(int(gap * SR), np.float32)); t += gap
    text = " ".join(w["w"] for w in S.words if w0["s"] - 1e-3 <= w["s"] <= w1["s"] + 1e-3)
    rows.append([name, beat, f"{t:.2f}", f"{t + len(clip) / SR:.2f}", f"{s:.2f}", f"{e:.2f}", text])
    out.append(clip); t += len(clip) / SR; prev = beat
out.append(np.zeros(int(TAIL * SR), np.float32))
y = np.concatenate(out)
w = wave.open(f"{D}/audio/edit_raw.wav", "wb"); w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
w.writeframes((np.clip(y, -1, 1) * 32767).astype(np.int16).tobytes()); w.close()
with open(f"{D}/cuts.csv", "w", newline="") as f:
    c = csv.writer(f); c.writerow(["source", "beat", "out_start", "out_end", "src_start", "src_end", "text"]); c.writerows(rows)
print(f"{len(rows)} clips, {len(y) / SR:.1f}s")
