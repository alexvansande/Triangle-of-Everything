"""Sound design for a take, kept light: an effect on the voice for a few
highlighted phrases, small sound effects when the narration talks about
something you could hear (bubbles, wind, an explosion…), and, rarely, quiet
rhythmic music under an emotional passage. Everything is synthesized here (no
samples) and placed by the scene's `sound` cues (see the top of
src/narration-scenes/tour.js), resolved to times by the player.

    python3 scripts/narration-sound.py public/narration/<take> timeline.json
(run through scripts/narration-sound.mjs, which gets timeline.json from the
player). Writes mix.m4a (stereo) next to audio.m4a and adds "mix" to
words.json; the voice file itself is left alone.
"""
import json, os, subprocess, sys
import numpy as np

SR = 48000
rng = np.random.default_rng(7)   # same take, same sound
db = lambda x: 10 ** (x / 20)
hz = lambda midi: 440 * 2 ** ((midi - 69) / 12)
I = lambda sec: int(round(sec * SR))

take_dir, tl_path = sys.argv[1], sys.argv[2]
take = json.load(open(os.path.join(take_dir, "words.json")))
TL = json.load(open(tl_path))
cues = TL.get("sound") or []

raw = subprocess.run(["ffmpeg", "-v", "error", "-i", os.path.join(take_dir, take["audio"]), "-ac", "1", "-ar", str(SR),
                      "-f", "f32le", "-"], capture_output=True, check=True).stdout
voice = np.frombuffer(raw, np.float32).astype(np.float64)
N = len(voice); T = N / SR

# ---------- helpers ----------
def fft_filter(x, lo=None, hi=None, order=2):
    """Zero-phase band-pass by spectrum shaping (Butterworth-like magnitude)."""
    n = 1 << int(np.ceil(np.log2(len(x) + 1)))
    X = np.fft.rfft(x, n); f = np.fft.rfftfreq(n, 1 / SR) + 1e-9
    g = np.ones_like(f)
    if lo: g *= 1 / np.sqrt(1 + (lo / f) ** (2 * order))
    if hi: g *= 1 / np.sqrt(1 + (f / hi) ** (2 * order))
    return np.fft.irfft(X * g, n)[:len(x)]

def fft_convolve(x, ir):
    n = 1 << int(np.ceil(np.log2(len(x) + len(ir))))
    return np.fft.irfft(np.fft.rfft(x, n) * np.fft.rfft(ir, n), n)[:len(x) + len(ir) - 1]

def reverb_ir(seconds, seed, bright=5000):
    r = np.random.default_rng(seed); n = I(seconds); k = np.arange(n) / SR; out = []
    for _ in range(2):
        x = fft_filter(r.standard_normal(n) * np.exp(-k * 6.9 / seconds), hi=bright)
        x[: I(0.015)] *= np.linspace(0, 1, I(0.015))
        out.append(x / np.sqrt((x ** 2).sum()))
    return out
ROOM, HALL = reverb_ir(1.6, 1), reverb_ir(4.5, 2, 3500)

def env(n, attack, release, hold=0):
    k = np.arange(n) / SR
    return np.minimum(1, k / max(attack, 1e-4)) * np.where(k < attack + hold, 1, np.exp(-(k - attack - hold) / release))

def fade_mask(a, b):
    """1 over samples [a, b) of the voice, with 30 ms ramps: for swapping a span."""
    m = np.zeros(N); r = I(0.03); a, b = max(0, a), min(N, b)
    m[a:b] = 1
    m[max(0, a - r):a] = np.linspace(0, 1, a - max(0, a - r))
    m[b:min(N, b + r)] = np.linspace(1, 0, min(N, b + r) - b)
    return m

def frac_delay(x, d):
    """x delayed by d samples (d may vary over time)."""
    return np.interp(np.arange(len(x)) - d, np.arange(len(x)), x, left=0, right=0)

# The voice in stereo, centred (equal power); voice effects work on it in place
vL = voice * np.sqrt(0.5); vR = vL.copy()
M = N + I(8)                                      # buses have room for tails
fxL, fxR, send = np.zeros(M), np.zeros(M), np.zeros(M)

def add(x, at, pan=0.0, wet=0.0):
    """Mix a mono (or (2, n) stereo) clip into the effects bus at `at` seconds."""
    a = I(at)
    if a >= M: return
    if x.ndim == 1:
        p = (pan + 1) * np.pi / 4; x = np.stack([x * np.cos(p), x * np.sin(p)])
    b = min(M, a + x.shape[1]); n = b - a
    fxL[a:b] += x[0, :n]; fxR[a:b] += x[1, :n]
    if wet: send[a:b] += (x[0, :n] + x[1, :n]) * wet

def swap_voice(a, b, left, right):
    """Replace the voice over [a, b) with a processed left/right pair."""
    global vL, vR
    m = fade_mask(a, b); L = np.zeros(N); R = np.zeros(N)
    n = min(b, N) - a; L[a:a + n] = left[:n]; R[a:a + n] = right[:n]
    vL = vL * (1 - m) + L * m; vR = vR * (1 - m) + R * m

# ---------- voice effects ----------
def span(c, pre=0.04, post=0.12):
    return I(c["s"] - pre), I(c["e"] + post)

def v_echo(c):            # repeats that fade off, darker and further each time
    a, b = span(c, post=0.25); seg = voice[a:b]
    for k in range(1, 4):
        rep = fft_filter(seg, lo=300, hi=3600 / k ** 0.6) * 0.32 * 0.5 ** (k - 1)
        add(rep, c["s"] - 0.04 + 0.3 * k, pan=0.35 * (-1) ** k, wet=0.25)

def v_hall(c):            # a long tail after the phrase
    a, b = span(c); seg = voice[a:b] * 0.2
    add(np.stack([fft_convolve(seg, HALL[0]), fft_convolve(seg, HALL[1])]), c["s"] - 0.04)

def v_radio(c):           # a tuned-in radio: narrow band, a little grit, its hiss under it
    a, b = span(c, pre=0.12, post=0.2); seg = voice[a:b]
    r = fft_filter(seg, lo=320, hi=3400, order=2)
    r = np.tanh(r * 2 / (np.abs(r).max() + 1e-9)) / np.tanh(2) * np.abs(seg).max()
    r *= 1 + 0.04 * np.sin(2 * np.pi * 7 * np.arange(len(r)) / SR)
    r = 0.6 * r + 0.4 * seg                      # the natural voice stays under it
    swap_voice(a, b, r * np.sqrt(0.5), r * np.sqrt(0.5))
    add(static(len(r) / SR + 0.25) * db(-4), c["s"] - 0.16)

def v_wide(c):            # spreads out in stereo (Haas delay + a slow chorus)
    a, b = span(c, post=0.2); seg = voice[a:b]; k = np.arange(len(seg)) / SR
    right = frac_delay(seg, I(0.009) + 25 * np.sin(2 * np.pi * 0.7 * k))
    left = frac_delay(seg, 12 + 18 * np.sin(2 * np.pi * 0.9 * k + 1))
    dry = seg * np.sqrt(0.5)
    swap_voice(a, b, 0.5 * dry + 0.4 * left, 0.5 * dry + 0.4 * right)

def v_liquid(c):          # a watery wobble on a copy of the phrase
    a, b = span(c, post=0.3); seg = voice[a:b]; k = np.arange(len(seg)) / SR
    wob = frac_delay(seg, I(0.009) + I(0.004) * np.sin(2 * np.pi * 5.5 * k))
    wob = fft_filter(wob, lo=200, hi=2400) * 0.22
    add(np.stack([wob, frac_delay(wob, I(0.007))]), c["s"] - 0.04, wet=0.3)

def v_deep(c):            # a copy that sinks in pitch and drags behind
    a, b = span(c, post=0.1); seg = voice[a:b]
    slow = np.interp(np.arange(0, len(seg), 0.8), np.arange(len(seg)), seg)
    slow = fft_filter(slow, hi=1600) * env(len(slow), 0.05, 0.9, hold=len(seg) / SR * 0.6) * 0.3
    add(slow, c["s"] + 0.05, wet=0.4)

# ---------- small effects ----------
def static(sec):
    n = I(sec); x = rng.standard_normal(n) * 0.25
    x += (rng.random(n) < 0.0009) * rng.standard_normal(n) * 3     # crackles
    x = fft_filter(x, lo=1200, hi=7000)
    return x * env(n, 0.05, 0.12, hold=max(0, sec - 0.2)) / (np.abs(x).max() + 1e-9) * db(-26)

def blip(f0, f1, sec, level):
    n = I(sec); k = np.arange(n) / SR; f = f0 * (f1 / f0) ** (k / sec)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * env(n, 0.003, sec / 3) * level

def fx_bubble():          # bubbles rising: quicker and higher
    out = np.zeros(I(1.4)); t = 0.0
    for j in range(6):
        f = 380 * 1.22 ** j * rng.uniform(0.95, 1.05)
        x = blip(f, f * 2.2, 0.07, db(-22) * (1 - 0.08 * j)); a = I(t)
        out[a:a + len(x)] += x[: len(out) - a]; t += 0.2 * 0.82 ** j
    return out

def fx_glug():            # bloops going down
    out = np.zeros(I(1.3))
    for j in range(3):
        f = 520 * 0.72 ** j; x = blip(f, f * 0.45, 0.16, db(-21)); a = I(0.21 * j)
        out[a:a + len(x)] += x
    return fft_filter(out, hi=1800)

def fx_wind():
    sec = 3.4; n = I(sec); k = np.arange(n) / SR
    x = fft_filter(rng.standard_normal(n), lo=300, hi=1400, order=1)
    x *= (0.6 + 0.4 * np.sin(2 * np.pi * 0.45 * k - 1.2)) * np.sin(np.pi * k / sec) ** 2
    return x / np.abs(x).max() * db(-22)

def fx_hiss():            # escaping gas: swells, then thins away to one side
    sec = 2.6; n = I(sec); k = np.arange(n) / SR
    x = fft_filter(rng.standard_normal(n), lo=2500, hi=9000) * np.sin(np.pi * (k / sec) ** 0.6) ** 2
    p = (k / sec * 0.8 + 0.1) * np.pi / 2
    st = np.stack([x * np.cos(p), x * np.sin(p)])
    return st / np.abs(st).max() * db(-25)

def fx_drops():           # condensation: a few droplets
    out = np.zeros(I(1.8))
    for j, tt in enumerate((0.0, 0.33, 0.52, 0.94, 1.15)):
        x = blip(hz(84 + (j * 5) % 9), hz(91 + (j * 5) % 9), 0.05, db(-27)); a = I(tt)
        out[a:a + len(x)] += x
    return out

def fx_ignite():          # a warm low hum swelling up
    sec = 3.2; n = I(sec); k = np.arange(n) / SR
    hum = sum(a * np.sin(2 * np.pi * f * k) for f, a in ((55, 1), (110, 0.5), (165, 0.25), (220, 0.12)))
    x = (hum + fft_filter(rng.standard_normal(n), lo=150, hi=900) * 0.3) * (k / sec) ** 1.5 * np.minimum(1, (sec - k) / 0.6)
    return x / np.abs(x).max() * db(-25)

def fx_boom():            # a distant explosion: thump, blast, rumble
    sec = 4.5; n = I(sec); k = np.arange(n) / SR
    f = 52 * np.exp(-k * 0.5) + 26
    x = (np.sin(2 * np.pi * np.cumsum(f) / SR) * env(n, 0.006, 0.7)
         + fft_filter(rng.standard_normal(n), hi=900) * env(n, 0.01, 0.35) * 0.8
         + fft_filter(rng.standard_normal(n), hi=160) * env(n, 0.3, 1.4) * 0.9)
    return x / np.abs(x).max() * db(-15)

def fx_drop():            # a sub drop
    sec = 2.2; n = I(sec); k = np.arange(n) / SR
    f = 90 * (30 / 90) ** (k / sec)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * env(n, 0.02, 0.8) * db(-17)

FX = {"bubble": (fx_bubble, 0.25), "glug": (fx_glug, 0.3), "wind": (fx_wind, 0.2), "hiss": (fx_hiss, 0.3),
      "drops": (fx_drops, 0.35), "ignite": (fx_ignite, 0.2), "boom": (fx_boom, 0.45), "drop": (fx_drop, 0.3),
      "static": (lambda: static(1.4), 0.1)}

# ---------- music: quiet rhythms under a passage ----------
def kick(f0=62, f1=44, sec=0.32):
    n = I(sec); k = np.arange(n) / SR; f = f1 + (f0 - f1) * np.exp(-k * 30)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * env(n, 0.003, 0.09)

def tick():
    n = I(0.04); return fft_filter(rng.standard_normal(n), lo=6000) * env(n, 0.001, 0.008)

def pluck(f, sec):
    """Karplus–Strong: a soft, damped string."""
    n = I(sec); p = max(2, int(SR / f)); buf = rng.uniform(-1, 1, p); out = np.empty(n)
    for i in range(n):
        j = i % p; out[i] = buf[j]; buf[j] = 0.497 * (buf[j] + buf[(i + 1) % p])
    out = fft_filter(out, hi=3200) * env(n, 0.002, sec / 2.5)
    return out / np.abs(out).max()

def put(out, x, at, pan, lvl):
    a = I(at)
    if a >= out.shape[1]: return
    b = min(out.shape[1], a + len(x)); p = (pan + 1) * np.pi / 4
    out[0, a:b] += x[: b - a] * np.cos(p) * lvl; out[1, a:b] += x[: b - a] * np.sin(p) * lvl

def music_pulse(L):
    """A soft beat with plucked open notes (D major add9), about 84 BPM."""
    beat = 60 / 84; out = np.zeros((2, I(L + 3)))
    notes = [62, 69, 76, 78, 69, 76, 74, 69]; plk = {m: pluck(hz(m), 1.6) for m in set(notes)}
    for i in range(int(L / (beat / 2)) + 1):
        at = i * beat / 2
        if i % 4 == 0: put(out, kick(), at, 0, db(-19))
        if i % 4 == 2: put(out, kick(58, 42), at, 0, db(-24))
        if i % 2 == 1: put(out, tick(), at, 0.3 * (-1) ** (i // 2), db(-33))
        if i % 8 != 5: put(out, plk[notes[i % 8]], at, 0.45 * np.sin(i * 0.9), db(-24))
    return out

def music_heartbeat(L):
    """Lub-dub, quickening from 62 to 88 BPM toward the end, with a faint tick."""
    out = np.zeros((2, I(L + 3))); t = 0.0
    while t < L:
        p = t / L; bpm = 62 + 26 * p ** 1.6
        put(out, kick(58, 38, 0.28), t, 0, db(-17))
        put(out, kick(50, 38, 0.28), t + 0.17, 0, db(-22))
        put(out, tick(), t + 30 / bpm, 0, db(-40) * (0.5 + p))
        t += 60 / bpm
    return out

def shape(out, L, stop):
    """Fade in over 2.5 s; out over 2 s past the end, or cut dead at the end."""
    k = np.arange(out.shape[1]) / SR; g = np.minimum(1, k / 2.5)
    g *= np.clip((L - k) / 0.03, 0, 1) if stop == "cut" else np.clip(1 - (k - L) / 2.0, 0, 1)
    return out * g

MUSIC = {"pulse": music_pulse, "heartbeat": music_heartbeat}
VOICE = {"echo": v_echo, "hall": v_hall, "radio": v_radio, "wide": v_wide, "liquid": v_liquid, "deep": v_deep}

music = np.zeros((2, M))
done = []
cue_music = []     # (start, end, cut) of cue music: the bed steps aside for it
for c in cues:
    if "voice" in c:
        VOICE[c["voice"]](c); done.append(f"voice {c['voice']}")
    elif "fx" in c:
        fn, wet = FX[c["fx"]]
        at = (c["e"] if c.get("atEnd") else c["s"]) + c.get("offset", 0)
        add(fn() * db(c.get("gain", 0)), at, pan=c.get("pan", 0), wet=wet); done.append(f"fx {c['fx']}")
    elif "music" in c:
        L = min(c["e"], T) - c["s"]
        if c.get("stop") != "cut" and c["s"] + L > T - 2.2: L = T - 2.2 - c["s"]   # fade out inside the take
        m = shape(MUSIC[c["music"]](L), L, c.get("stop"))
        a = I(c["s"]); b = min(M, a + m.shape[1]); music[:, a:b] += m[:, : b - a]
        cue_music.append((c["s"], c["s"] + L, c.get("stop") == "cut"))
        done.append(f"music {c['music']} {L:.0f} s")

# Music steps back 4 dB while the voice talks (a slow follower, so it doesn't pump)
def follower(x, attack, release):
    hop = SR // 100; m = len(x) // hop
    e = np.sqrt((x[:m * hop].reshape(m, hop) ** 2).mean(1))
    a, r = np.exp(-1 / (attack * 100)), np.exp(-1 / (release * 100)); y = 0.0; out = np.empty(m)
    for i, v in enumerate(e):
        y = a * y + (1 - a) * v if v > y else r * y + (1 - r) * v; out[i] = y
    return np.interp(np.arange(len(x)) / hop, np.arange(m), out)
talk = np.clip((20 * np.log10(follower(voice, 0.08, 0.6) + 1e-9) + 48) / 18, 0, 1)
music *= db(-4 * np.concatenate([talk, np.zeros(M - N)]))
send += (music[0] + music[1]) * 0.2

# ---------- the music bed: quiet rhythmic plucks shaped by where the camera is ----------
# One tempo and one chord loop for the whole take; the camera's place sets the
# colour. Scale (log radius at the screen centre) → small things are quick, high
# and glassy, galaxies slow, low and wide with a pad under them. Density (which
# side of the water line) → dense things take the minor loop, airy ones major.
# It rises into the pauses and drops 8 dB while the voice talks.
BPM = 92; STEP = 60 / BPM / 4                     # a 16th note
CHORDS = {"major": [[50, 54, 57], [47, 50, 54], [43, 47, 50], [45, 49, 52]],     # D  Bm G  A
          "minor": [[50, 53, 57], [46, 50, 53], [43, 46, 50], [45, 49, 52]]}     # Dm Bb Gm A
BAR_STEPS = 16; CHORD_STEPS = 2 * BAR_STEPS

def note(midi, sec, bright):
    """A soft plucked/piano-ish tone: harmonics that die away faster the higher they are."""
    n = I(sec); k = np.arange(n) / SR; f = hz(midi); x = np.zeros(n)
    for h in range(1, 9):
        if f * h > 9000: break
        x += (0.6 ** (h - 1)) * np.sin(2 * np.pi * f * h * k * (1 + 0.0004 * h * h)) * np.exp(-k * h ** (1.2 - 0.6 * bright) / (sec * 0.35))
    x *= np.minimum(1, k / 0.004) * np.minimum(1, (sec - k) / 0.05)
    return x / (np.abs(x).max() + 1e-9)
_cache = {}
def note_c(midi, sec, bright):
    key = (midi, round(sec, 1), round(bright, 1))
    if key not in _cache: _cache[key] = note(midi, key[1], key[2])
    return _cache[key]

# Intensity: { at, intensity, ramp? } cues set the bed's energy from that phrase
# on: 0 silent, 1 the normal bed, 2 a build (more notes, a bass pulse), 3 the
# peak (a soft kick too, louder). It ramps over `ramp` s (default 2) and holds
# until the next intensity cue.
KEYS = sorted(((c["s"] + c.get("offset", 0), float(c["intensity"]), c.get("ramp", 2.0))
               for c in cues if "intensity" in c), key=lambda k: k[0])
def intensity(t):
    v = 1.0
    for t0, target, ramp in KEYS:
        if t < t0: break
        f = min(1, (t - t0) / max(ramp, 0.01)); f = f * f * (3 - 2 * f)
        v = v + (target - v) * f
    return v

def bed_music():
    path = np.array(TL["path"])                   # t, log r, log m, span
    tt, r, m, span = path[:, 0], path[:, 1], path[:, 2], path[:, 3]
    x = np.clip((r + 15) / 42, 0, 1)              # 0: protons, ~0.17 atoms, ~0.4 us, ~0.6 the Sun, ~0.9 galaxies
    wide = np.clip((span - 20) / 40, 0, 1)        # a wide overview (the whole chart) sounds spacious, like the cosmos
    x = x * (1 - wide) + 0.8 * wide
    a = np.exp(-0.25 / 1.8); xs = np.empty_like(x); y = x[0]
    for i, v in enumerate(x): y = a * y + (1 - a) * v; xs[i] = y          # glide, don't jump with every flight
    rho = m - 3 * r - 0.62                        # log density in g/cm³ (0 = water)
    X = lambda t: float(np.interp(t, tt, xs))
    out = np.zeros((2, M)); pad = np.zeros((2, M))
    nsteps = int(T / STEP) + 1
    mode = "major"
    for st in range(nsteps):
        t = st * STEP
        if st % CHORD_STEPS == 0:                 # the mood can change only on a chord change
            d = float(np.interp(t + 2, tt, rho))
            mode = "minor" if d > 0.6 else "major" if d < 0.2 else mode
        chord = CHORDS[mode][(st // CHORD_STEPS) % 4]
        v = X(t)
        e = intensity(t)
        per_beat = min(4, 4 * 2 ** (-3 * v) * 2 ** max(0, min(e, 2) - 1))   # 4 a beat (atoms) … ½ (galaxies); doubled by a build
        every = max(1, int(round(4 / per_beat)))  # play on every n-th 16th
        if st % every == 0:
            base = 74 - 30 * v                    # register: high for small things, low for big ones
            tones = [p + 12 * o for o in range(-2, 4) for p in chord]
            tones = [p for p in tones if base - 2 <= p <= base + 17]
            if tones:
                i = (st // every) % (2 * len(tones) - 2) if len(tones) > 1 else 0
                p = tones[i if i < len(tones) else 2 * len(tones) - 2 - i]      # up and down the chord
                sec = 0.45 + 2.6 * v; bright = 1 - v
                accent = 1.0 if st % 4 == 0 else 0.7
                lvl = db(-18 + 3 * v) * accent * (e if e < 1 else db(3 * min(e - 1, 1) + 2 * max(0, e - 2)))
                add_to(out, note_c(p, sec, bright) * lvl, t + rng.normal(0, 0.004), 0.5 * np.sin(st * 0.37) * (0.4 + 0.6 * v))
        if e > 1.4 and st % 4 == 0:               # a build: the root pulses on every beat
            add_to(out, note_c(chord[0] - 12, 0.5, 0.3) * db(-21) * min(1, e - 1.4) * (1 if st % 16 == 0 else 0.75), t, 0)
        if e > 2.2 and st % 8 == 0:               # the peak: a soft kick on beats 1 and 3
            add_to(out, kick() * db(-14) * min(1, (e - 2.2) / 0.8), t, 0)
        if st % BAR_STEPS == 0:                   # a soft root under each bar
            add_to(out, note_c(chord[0] - 12, 1.6 + 2 * X(t), 0.2) * db(-19) * min(1, e), t, 0)
        if st % 2 == 1 and X(t) < 0.35:           # small scales: a faint tick on the off-16ths
            tk = fft_filter(rng.standard_normal(I(0.03)), lo=7000) * env(I(0.03), 0.001, 0.006)
            add_to(out, tk * db(-33) * (0.35 - X(t)) / 0.35, t, 0.3 * (-1) ** st)
        e2 = intensity(t + 2); padamt = max((X(t + 2) - 0.5) / 0.5, (e2 - 2) * 0.8)
        if st % CHORD_STEPS == 0 and padamt > 0:  # big scales, or the peak: a slow pad on each chord
            L = CHORD_STEPS * STEP + 1.5; n = I(L); k = np.arange(n) / SR
            w = np.sin(np.pi * np.clip(k / L, 0, 1)) ** 2
            s_ = sum(np.sin(2 * np.pi * hz(q + 12) * k + j) for j, q in enumerate(chord)) * w / 3
            add_to(pad, s_ * db(-24) * min(1, padamt) * min(1, e2), t - 0.75, 0, wide=True)
    return out + pad, xs, tt

def add_to(bus, x, at, pan, wide=False):
    a = max(0, I(at))
    if a >= M: return
    b = min(M, a + len(x)); p = (pan + 1) * np.pi / 4
    if wide: bus[0, a:b] += x[: b - a]; bus[1, a:b] += frac_delay(x, I(0.011))[: b - a]; return
    bus[0, a:b] += x[: b - a] * np.cos(p); bus[1, a:b] += x[: b - a] * np.sin(p)

if TL.get("bed") and TL.get("path"):          # off unless the scene sets bed: true
    bedm, xs, tt = bed_music()
    k = np.arange(M) / SR
    g = np.minimum(1, k / 3) * np.clip((T - 0.3 - k) / 3, 0, 1)        # in over 3 s, out by the end
    for s0, e0, cut in cue_music:                 # step aside for cue music; after a cut, stay out a while
        out_from, back = s0 - 2, (e0 + 4 if cut else e0 + 1)
        g *= np.clip(np.maximum((out_from - k) / 2, (k - back) / 3), 0, 1)
    # its own quicker follower, so it blooms even in the short pauses between phrases
    talk_b = np.clip((20 * np.log10(follower(voice, 0.05, 0.3) + 1e-9) + 48) / 18, 0, 1)
    bedm *= g * db(-8 * np.concatenate([talk_b, np.zeros(M - N)]))
    music += bedm
    send += (bedm[0] + bedm[1]) * (0.15 + 0.45 * np.interp(k, tt, xs))
    done.append(f"bed ({len(KEYS)} intensity cues)" if KEYS else "bed")

wet = [fft_convolve(send, ROOM[c])[:M] * db(-8) for c in range(2)]
bed = np.stack([fxL + music[0] + wet[0], fxR + music[1] + wet[1]])[:, :N]
mix = np.stack([vL, vR]) + bed                      # same length as the voice, so the timings hold

# ---------- level: the voice file's loudness, a −1 dBFS ceiling ----------
def lufs(x):
    p = subprocess.run(["ffmpeg", "-hide_banner", "-f", "f32le", "-ar", str(SR), "-ac", str(x.shape[0]), "-i", "-",
                        "-af", "ebur128=framelog=quiet", "-f", "null", "-"],
                       input=x.T.astype(np.float32).tobytes(), capture_output=True).stderr.decode()
    return float(p.rsplit("I:", 1)[1].split("LUFS")[0])

def limit(x, ceiling=db(-1), look=0.004, release=0.12):
    need = np.minimum(1, ceiling / (np.abs(x).max(0) + 1e-9)); w = I(look)
    padded = np.concatenate([need, np.ones(w)])
    g = np.minimum.reduce([padded[i:i + len(need)] for i in range(0, w, max(1, w // 8))])
    r = np.exp(-1 / (release * SR)); out = np.empty_like(g); y = 1.0
    for i in range(0, len(g), 64):
        blk = g[i:i + 64]; y = min(blk.min(), 1 - (1 - y) * r ** 64); out[i:i + 64] = np.minimum(blk, y)
    return x * out

gain = db(lufs(voice[None]) - lufs(mix))
mix = limit(mix * gain)
if os.environ.get("SOUND_STEMS"):                   # for checking levels: everything but the voice
    (bed * gain).T.astype(np.float32).tofile(os.path.join(take_dir, "bed.f32"))

subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "f32le", "-ar", str(SR), "-ac", "2", "-i", "-",
                "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart", os.path.join(take_dir, "mix.m4a")],
               input=mix.T.astype(np.float32).tobytes(), check=True)
take["mix"] = "mix.m4a"
json.dump(take, open(os.path.join(take_dir, "words.json"), "w"), ensure_ascii=False, separators=(",", ":"))
print(f"  {T:.1f} s: " + (", ".join(done) or "no sound cues"))
