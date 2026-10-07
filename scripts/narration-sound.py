"""Sound design for a take: a pad under the voice, whooshes on camera flights,
chimes on new highlights, and a swell on the classic → map reveal. All of it is
synthesized here (no samples) and keyed to the scene's own timeline.

    python3 scripts/narration-sound.py public/narration/<take> timeline.json
(run through scripts/narration-sound.mjs, which gets timeline.json from the
player). Writes mix.m4a (voice + sound, stereo) next to audio.m4a and adds
"mix" to words.json; the voice file itself is left alone.
"""
import json, os, subprocess, sys
import numpy as np

SR = 48000
rng = np.random.default_rng(7)   # same take, same sound
db = lambda x: 10 ** (x / 20)

take_dir, tl_path = sys.argv[1], sys.argv[2]
take = json.load(open(os.path.join(take_dir, "words.json")))
tl = json.load(open(tl_path))

# ---------- the voice ----------
raw = subprocess.run(["ffmpeg", "-v", "error", "-i", os.path.join(take_dir, take["audio"]), "-ac", "1", "-ar", str(SR),
                      "-f", "f32le", "-"], capture_output=True, check=True).stdout
voice = np.frombuffer(raw, np.float32).astype(np.float64)
N = len(voice); T = N / SR
t = np.arange(N) / SR

def smooth(x, attack, release):
    """One-pole envelope follower (seconds), on a 10 ms grid then upsampled."""
    hop = SR // 100; m = len(x) // hop
    e = np.sqrt((x[:m * hop].reshape(m, hop) ** 2).mean(1))
    a, r = np.exp(-1 / (attack * 100)), np.exp(-1 / (release * 100))
    out = np.empty(m); y = 0.0
    for i, v in enumerate(e):
        y = a * y + (1 - a) * v if v > y else r * y + (1 - r) * v
        out[i] = y
    return np.interp(np.arange(len(x)) / hop, np.arange(m), out)

# Ducking: how much the voice is talking, 0..1
venv = smooth(voice, 0.06, 0.45)
talk = np.clip((20 * np.log10(venv + 1e-9) + 48) / 18, 0, 1)

def stereo(x, pan=0.0):
    """Equal-power pan, -1 left … 1 right (pan may be an array)."""
    a = (np.asarray(pan) + 1) * np.pi / 4
    return np.stack([x * np.cos(a), x * np.sin(a)])

def fft_convolve(x, ir):
    n = 1 << int(np.ceil(np.log2(len(x) + len(ir))))
    return np.fft.irfft(np.fft.rfft(x, n) * np.fft.rfft(ir, n), n)[:len(x)]

def reverb_ir(seconds=2.8, seed=1):
    """A soft hall: decaying stereo noise, darker as it fades."""
    r = np.random.default_rng(seed); n = int(seconds * SR); k = np.arange(n) / SR
    out = []
    for ch in range(2):
        x = r.standard_normal(n) * np.exp(-k * 6.9 / seconds)
        X = np.fft.rfft(x); f = np.fft.rfftfreq(n, 1 / SR)
        x = np.fft.irfft(X * (1 / (1 + (f / 5000) ** 2)), n)
        x[: int(0.012 * SR)] *= np.linspace(0, 1, int(0.012 * SR))   # pre-delay ramp
        out.append(x / np.sqrt((x ** 2).sum()))
    return out
IR = reverb_ir()
def verb(st, wet):
    return np.stack([fft_convolve(st[c], IR[c]) for c in range(2)]) * wet

# ---------- pad: a slow progression of open chords ----------
# D sus2 → B m7 → G maj9 → A sus4, about 12 s each; voices are a few
# harmonics with a slight L/R detune, so it breathes without beating hard.
hz = lambda midi: 440 * 2 ** ((midi - 69) / 12)
CHORDS = [[38, 45, 52, 57, 64], [35, 42, 50, 54, 61], [31, 43, 50, 54, 57], [33, 45, 50, 52, 57]]
SEG = 12.0
pad = np.zeros((2, N))
nseg = int(np.ceil(T / SEG)) + 1
for i in range(nseg):
    chord = CHORDS[i % len(CHORDS)]
    t0 = i * SEG - 3; t1 = (i + 1) * SEG + 3          # 3 s crossfades
    a, b = max(0, int(t0 * SR)), min(N, int(t1 * SR))
    if a >= b: continue
    tt = t[a:b]
    w = np.clip((tt - t0) / 6, 0, 1) * np.clip((t1 - tt) / 6, 0, 1)
    w = np.sin(w * np.pi / 2) ** 2
    for j, note in enumerate(chord):
        f = hz(note)
        amp = 0.9 / (1 + 0.35 * j) * (1 + 0.25 * np.sin(2 * np.pi * (0.05 + 0.013 * j) * tt + j))
        for ch, det in ((0, -0.18), (1, 0.18)):
            s = np.zeros_like(tt)
            for h, ha in ((1, 1), (2, 0.35), (3, 0.12), (4, 0.05)):
                s += ha * np.sin(2 * np.pi * (f + det) * h * tt + rng.uniform(0, 6.28))
            pad[ch, a:b] += s * amp * w
pad /= np.abs(pad).max()
# fade in over 2.5 s, out over the last 3 s; dip 7 dB while the voice talks
env = np.clip(t / 2.5, 0, 1) * np.clip((T - t) / 3, 0, 1) * db(-7 * talk)
pad *= env * db(-24)

fx = np.zeros((2, N))
def place(st, at):
    a = int(at * SR)
    if a >= N: return
    b = min(N, a + st.shape[1]); fx[:, a:b] += st[:, : b - a]

# ---------- whooshes on camera flights ----------
def whoosh(dur, rise, size, pan0, pan1):
    """Noise through a band that sweeps up (zooming in) or down (out)."""
    L = dur + 0.8; n = int(L * SR); k = np.arange(n) / SR
    win, hop = 2048, 512
    noise = rng.standard_normal(n + win)
    out = np.zeros(n + win); norm = np.zeros(n + win); hann = np.hanning(win)
    freqs = np.fft.rfftfreq(win, 1 / SR)
    lo, hi = (250, 2400) if rise else (2400, 250)
    for s0 in range(0, n, hop):
        p = min(1, (s0 / SR) / dur)
        fc = lo * (hi / lo) ** (p * p * (3 - 2 * p))
        band = np.exp(-0.5 * (np.log2(np.maximum(freqs, 1) / fc) / 0.9) ** 2)
        seg = np.fft.irfft(np.fft.rfft(noise[s0:s0 + win] * hann) * band, win)
        out[s0:s0 + win] += seg * hann; norm[s0:s0 + win] += hann ** 2
    x = (out / np.maximum(norm, 1e-6))[:n]
    peak = 0.62 * dur
    e = np.where(k < peak, (k / peak) ** 2, np.exp(-(k - peak) / 0.35))
    x = x * e / (np.abs(x * e).max() + 1e-9) * size
    return stereo(x, np.linspace(pan0, pan1, n))

for fl in tl["flights"]:
    move = abs(fl["zoom"]) + 0.6 * fl["travel"]
    if move < 0.12 or fl["t"] < 0.5: continue            # drifts and the opening hold stay quiet
    size = db(-27 + 7 * min(1, (move - 0.12) / 0.9))
    sweep = np.clip(fl["travel"], 0, 0.6)
    place(whoosh(fl["dur"], fl["zoom"] < 0, size, -sweep, sweep), fl["t"] - 0.15)

# ---------- chimes on new highlights ----------
def chime(f, level, seconds=3.2):
    """A soft bell: inharmonic partials with their own decays."""
    n = int(seconds * SR); k = np.arange(n) / SR
    x = sum(a * np.sin(2 * np.pi * f * r * k) * np.exp(-k / d)
            for r, a, d in ((1, 1, 1.4), (2.0, 0.28, 0.7), (2.76, 0.18, 0.45), (5.4, 0.06, 0.2)))
    x *= np.minimum(1, k / 0.004)
    return x / np.abs(x).max() * level

PENT = [74, 76, 78, 81, 83, 86, 88]   # D major pentatonic, from D5
chimes, last = [], -9
for h in tl["highlights"]:            # at most one every 2.5 s, so it never ticks like a clock
    if h["t"] - last >= 2.5: chimes.append(h); last = h["t"]
for i, h in enumerate(chimes):
    note = PENT[(i * 2) % len(PENT)]
    c = chime(hz(note), db(-30))
    if h["n"] > 1: c = c + chime(hz(note + 7), db(-34))   # two things at once: a fifth
    place(stereo(c, 0.35 * np.sin(i * 2.1)), h["t"] + 0.02)

# ---------- the reveal: classic figure → the map ----------
if tl.get("fade"):
    ft, fd = tl["fade"]["t"], tl["fade"]["dur"]
    pre = 1.8; L = pre + fd; n = int(L * SR); k = np.arange(n) / SR
    # a rising shimmer: noise + fifths, swelling into the moment the map lands
    sw = (k / L) ** 2.2
    shimmer = sum(np.sin(2 * np.pi * hz(m) * k * (1 + 0.02 * k / L)) for m in (62, 69, 74, 81)) / 4
    nz = rng.standard_normal(n); nz = np.convolve(nz, np.ones(24) / 24, "same")
    rise = (0.6 * shimmer + 0.5 * nz) * sw
    rise *= np.minimum(1, (L - k) / 0.08)                          # cut at the landing
    place(stereo(rise / np.abs(rise).max() * db(-24)), ft - pre)
    # the landing: a low bloom and a bright chord ringing out
    n2 = int(4.5 * SR); k2 = np.arange(n2) / SR
    boom = np.sin(2 * np.pi * 46 * k2 * (1 - 0.08 * k2 / 4.5)) * np.exp(-k2 / 1.3) * np.minimum(1, k2 / 0.02)
    bell = sum(chime(hz(m), 1, 4.5)[:n2] for m in (62, 69, 74, 78)) / 4
    land = 0.9 * boom / np.abs(boom).max() + 0.5 * bell
    place(stereo(land * db(-24)), ft + fd)

# ---------- mix ----------
wet = verb(fx + 0.25 * pad, db(-6))
bed = pad + fx + wet
mix = stereo(voice) + bed          # the voice sits in the centre (equal power)

# A look-ahead limiter at -1 dBFS for the few peaks where the bed lands on a loud syllable
def limit(x, ceiling=db(-1), look=0.004, release=0.12):
    need = np.minimum(1, ceiling / (np.abs(x).max(0) + 1e-9))
    w = int(look * SR)
    pad_ = np.concatenate([need, np.ones(w)])
    g = np.minimum.reduce([pad_[i:i + len(need)] for i in range(0, w, max(1, w // 8))])   # hold the dip ahead
    r = np.exp(-1 / (release * SR)); out = np.empty_like(g); y = 1.0
    for i in range(0, len(g), 64):        # block-wise release keeps it quick in numpy
        blk = g[i:i + 64]; y = min(blk.min(), 1 - (1 - y) * r ** 64); out[i:i + 64] = np.minimum(blk, y)
    return x * out

def lufs(x):
    p = subprocess.run(["ffmpeg", "-hide_banner", "-f", "f32le", "-ar", str(SR), "-ac", str(x.shape[0]), "-i", "-",
                        "-af", "ebur128=framelog=quiet", "-f", "null", "-"],
                       input=x.T.astype(np.float32).tobytes(), capture_output=True).stderr.decode()
    return float(p.rsplit("I:", 1)[1].split("LUFS")[0])

target = lufs(np.stack([voice]))          # the voice file's loudness (−16 LUFS)
mix *= db(target - lufs(mix))
mix = limit(mix)
if os.environ.get("SOUND_STEMS"):         # for checking levels: the bed alone
    bed.T.astype(np.float32).tofile(os.path.join(take_dir, "bed.f32"))

out = os.path.join(take_dir, "mix.m4a")
subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "f32le", "-ar", str(SR), "-ac", "2", "-i", "-",
                "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart", out],
               input=mix.T.astype(np.float32).tobytes(), check=True)
take["mix"] = "mix.m4a"
json.dump(take, open(os.path.join(take_dir, "words.json"), "w"), ensure_ascii=False, separators=(",", ":"))
n_wh = sum(1 for f in tl["flights"] if abs(f["zoom"]) + 0.6 * f["travel"] >= 0.12 and f["t"] >= 0.5)
print(f"  {T:.1f} s: pad, {n_wh} whooshes, {len(chimes)} chimes" + (", reveal" if tl.get("fade") else ""))
