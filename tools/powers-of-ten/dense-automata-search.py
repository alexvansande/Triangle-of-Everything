#!/usr/bin/env python3
"""The random search behind the Lenia and MNCA presets of dense-automata.html (see
video/plans/inside-the-quark.md). Usage: dense-automata-search.py <lenia|mnca> <seed> <count>;
prints the winners as JSON lines (best first) and saves a contact sheet sheet-<family>-<seed>.png."""
import json, sys, math
import numpy as np
from PIL import Image

N = 128
rng = np.random.default_rng(int(sys.argv[2]) if len(sys.argv) > 2 else 1)
FAM = sys.argv[1] if len(sys.argv) > 1 else "lenia"
COUNT = int(sys.argv[3]) if len(sys.argv) > 3 else 300

yy, xx = np.mgrid[-N//2:N//2, -N//2:N//2]
RR = np.sqrt(xx**2 + yy**2)

def fft_kernel(K):
    K = K / K.sum()
    return np.fft.rfft2(np.fft.ifftshift(K))

def conv(A, FK):
    return np.fft.irfft2(np.fft.rfft2(A) * FK, s=A.shape)

def score(frames):
    A = frames[-1]
    mean = A.mean(); std = A.std()
    if not (0.12 < mean < 0.88) or std < 0.12: return 0, "flat"
    # alive: changes between the last frames
    dif = np.mean([np.abs(frames[i] - frames[i-1]).mean() for i in range(-5, 0)])
    if dif < 0.0015: return 0, "frozen"
    # not pixel noise: smooth at lag 2
    c2 = np.corrcoef(A.ravel(), np.roll(A, 2, 1).ravel())[0, 1]
    if c2 < 0.55: return 0, "noise"
    # structure scale: correlation at lag 8 should have dropped (so there's structure under ~16 px)
    c8 = np.corrcoef(A.ravel(), np.roll(A, 8, 1).ravel())[0, 1]
    if c8 > 0.93: return 0, "too smooth"
    # bimodal-ish occupancy: fraction of pixels above 0.5 well inside (0.15,0.85)
    occ = (A > 0.5).mean()
    if not (0.12 < occ < 0.88): return 0, "lopsided"
    # similarity to the frame 40 steps ago: not a blinking/periodic mess, but changing
    c_t = np.corrcoef(A.ravel(), frames[-40].ravel())[0, 1]
    return std * (1 - c8) * min(1, dif * 100) * (0.4 + c_t), "ok"

def lenia_candidate():
    R = int(rng.integers(8, 20))
    nrings = int(rng.integers(1, 4))
    peaks = rng.uniform(0.2, 1.0, nrings); peaks[rng.integers(nrings)] = 1.0
    mu = float(rng.uniform(0.08, 0.5)); sigma = float(rng.uniform(0.008, 0.12))
    dt = float(rng.choice([0.1, 0.2, 0.5]))
    return dict(fam="lenia", R=R, peaks=[round(float(p), 3) for p in peaks], mu=round(mu, 4), sigma=round(sigma, 4), dt=dt)

def lenia_run(p, steps=400):
    R = p["R"]; peaks = np.array(p["peaks"]); n = len(peaks)
    r = RR / R
    K = np.zeros_like(r)
    for i, h in enumerate(peaks):
        u = n * r - i
        m = (u >= 0) & (u < 1)
        K[m] += h * np.exp(4 - 1 / (u[m] * (1 - u[m]) + 1e-9))
    K[r >= 1] = 0
    FK = fft_kernel(K)
    A = rng.uniform(0, 1, (N, N))
    frames = []
    for t in range(steps):
        U = conv(A, FK)
        G = 2 * np.exp(-((U - p["mu"]) ** 2) / (2 * p["sigma"] ** 2)) - 1
        A = np.clip(A + p["dt"] * G, 0, 1)
        if t >= steps - 45: frames.append(A.copy())
    return frames

def mnca_candidate():
    nr = int(rng.integers(2, 5))
    edges = np.sort(rng.uniform(1, 24, nr * 2))
    rings = []
    for i in range(nr):
        rin, rout = float(edges[2*i]), float(edges[2*i+1])
        if rout - rin < 1.5: rout = rin + 1.5
        rules = []
        for _ in range(int(rng.integers(1, 4))):
            lo = float(rng.uniform(0, 1)); hi = min(1.0, lo + float(rng.uniform(0.03, 0.3)))
            rules.append([round(lo, 3), round(hi, 3), round(float(rng.choice([-1, 1]) * rng.uniform(0.02, 0.3)), 3)])
        rings.append(dict(rin=round(rin, 2), rout=round(rout, 2), rules=rules))
    return dict(fam="mnca", rings=rings)

def mnca_run(p, steps=300):
    FKs = []
    for ring in p["rings"]:
        K = ((RR >= ring["rin"]) & (RR < ring["rout"])).astype(float)
        if K.sum() == 0: K[N//2, N//2] = 1
        FKs.append(fft_kernel(K))
    A = rng.uniform(0, 1, (N, N))
    frames = []
    for t in range(steps):
        D = np.zeros_like(A)
        for ring, FK in zip(p["rings"], FKs):
            U = conv(A, FK)
            for lo, hi, d in ring["rules"]:
                D += d * ((U >= lo) & (U <= hi))
        A = np.clip(A + D, 0, 1)
        if t >= steps - 45: frames.append(A.copy())
    return frames

cand, run = (lenia_candidate, lenia_run) if FAM == "lenia" else (mnca_candidate, mnca_run)
winners = []
reasons = {}
for i in range(COUNT):
    p = cand()
    try:
        frames = run(p)
    except Exception as e:
        continue
    s, why = score(frames)
    reasons[why] = reasons.get(why, 0) + 1
    if s > 0:
        winners.append((s, p, frames[-1]))
winners.sort(key=lambda w: -w[0])
print(json.dumps(reasons), file=sys.stderr)
top = winners[:24]
for s, p, _ in top:
    print(json.dumps(dict(score=round(float(s), 4), **p)))
if top:
    cols = 6; rows = math.ceil(len(top) / cols)
    sheet = Image.new("L", (cols * N, rows * N))
    for k, (s, p, A) in enumerate(top):
        sheet.paste(Image.fromarray((A * 255).astype(np.uint8)), ((k % cols) * N, (k // cols) * N))
    sheet.save(f"sheet-{FAM}-{sys.argv[2] if len(sys.argv) > 2 else 1}.png")
