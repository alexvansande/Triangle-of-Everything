#!/usr/bin/env python3
"""Find the false starts and repeats Whisper smoothed away, and put them back into a take's words.json.

    uv run --with torch --with transformers --with soundfile --with numpy \
        python3 scripts/narration-verbatim.py long-02b-opening [--write]

Whisper writes what the speaker *meant*: a restart like "it's what decides what a nucleus tiv… it's what decides
what a nucleus even is" comes out once, the dropped try glued into one long word (the author, 2026-11-22: "Your
transcriber has the habit of smoothing out what we say … not great when it's editing audio"). A CTC model
(wav2vec2, no language model) only writes the sounds, so it keeps every try. This script runs it over the take in
overlapping 30 s windows, lines its words up against Whisper's, and lists each run of words Whisper left out, plus
each Whisper word stretched over more than a second (a likely hidden restart).

With --write it moves Whisper's words onto the try the speaker finished (the last one) in
public/narration/<take>/words.json, so the cut's `drop` ranges (video/cuts/*.json, take seconds) take out the false
starts and keep the words of the line that stays. The CTC words are written to public/narration/<take>/verbatim.json.
"""
import difflib, json, os, re, subprocess, sys

import numpy as np

take = sys.argv[1]
write = "--write" in sys.argv
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
d = os.path.join(ROOT, "public", "narration", take)
meta = json.load(open(os.path.join(d, "words.json")))
ws = meta["words"]
if meta.get("verbatim"):
    sys.exit(f"{take}: words.json already has verbatim inserts ({len(meta['verbatim'])}); restore it from git first")

pcm = np.frombuffer(subprocess.run(["ffmpeg", "-hide_banner", "-loglevel", "error", "-i", os.path.join(d, meta["audio"]),
                                    "-ac", "1", "-ar", "16000", "-f", "f32le", "-"], capture_output=True, check=True).stdout,
                    np.float32)

import torch
from transformers import Wav2Vec2ForCTC, Wav2Vec2Processor
NAME = "facebook/wav2vec2-large-960h-lv60-self"
proc = Wav2Vec2Processor.from_pretrained(NAME)
model = Wav2Vec2ForCTC.from_pretrained(NAME).eval()
voc = {v: k for k, v in proc.tokenizer.get_vocab().items()}
pad = proc.tokenizer.pad_token_id


def ctc(a, t0):
    with torch.no_grad():
        ids = model(proc(a, sampling_rate=16000, return_tensors="pt").input_values).logits[0].argmax(-1).tolist()
    out, cur, st, last, prev = [], "", 0, 0, None
    for i, t in enumerate(ids):
        if t != prev and t != pad:
            c = voc[t]
            if c == "|":
                if cur: out.append([cur.lower(), round(t0 + st * 0.02, 2), round(t0 + (last + 1) * 0.02, 2)]); cur = ""
            else:
                if not cur: st = i
                cur += c
        if t != pad and voc[t] != "|": last = i
        prev = t
    if cur: out.append([cur.lower(), round(t0 + st * 0.02, 2), round(t0 + (last + 1) * 0.02, 2)])
    return out


WIN, HOP = 30.0, 26.0          # 4 s overlap; a word is kept by the window where it sits away from the edges
cw, s = [], 0.0
total = len(pcm) / 16000
while s < total:
    a = pcm[int(s * 16000):int(min(total, s + WIN) * 16000)]
    lo = s + (2.0 if s > 0 else 0.0)
    hi = s + WIN - 2.0 if s + WIN < total else total + 1
    cw += [w for w in ctc(a, s) if lo <= w[1] < hi]
    print(f"\r  ctc {min(s + WIN, total):6.0f}/{total:.0f} s", end="", file=sys.stderr, flush=True)
    s += HOP
print(file=sys.stderr)
json.dump(cw, open(os.path.join(d, "verbatim.json"), "w"), separators=(",", ":"))

norm = lambda w: re.sub(r"[^a-z0-9']", "", w.lower().replace("’", "'"))
A = [norm(w[0]) for w in ws]
B = [norm(w[0]) for w in cw]


def same(x, y):
    return x == y or (len(x) > 2 and len(y) > 2 and difflib.SequenceMatcher(None, x, y).ratio() >= 0.6)


# align on exact matches first, then let near spellings ("corps"/"core") pair up inside each replaced run
sm = difflib.SequenceMatcher(None, A, B, autojunk=False)
inserts, pairs = [], []
for tag, i1, i2, j1, j2 in sm.get_opcodes():
    if tag == "equal":
        pairs += [(i1 + k, j1 + k) for k in range(i2 - i1)]
    elif tag in ("replace", "insert"):
        jj = j1
        for ii in range(i1, i2):
            for k in range(jj, j2):
                if same(A[ii], B[k]):
                    inserts += [(ii, x) for x in range(jj, k)]
                    pairs.append((ii, k)); jj = k + 1
                    break
        inserts += [(i2, x) for x in range(jj, j2)]
# a line said twice: the longest match takes Whisper's one copy to the FIRST try (it runs on from the words before).
# Where a run of left-out words ends with the words Whisper has just before it, those words move to the later try,
# the one the speaker finished and a cut keeps
pj = dict((j, i) for i, j in pairs)
runs_j, cur = [], []
for _, j in sorted(inserts, key=lambda x: x[1]):
    if cur and j != cur[-1] + 1: runs_j.append(cur); cur = []
    cur.append(j)
if cur: runs_j.append(cur)
for r in runs_j:
    j1, j2 = r[0], r[-1] + 1
    m = 0
    while m < len(r) and (j1 - 1 - m) in pj and same(B[j1 - 1 - m], B[j2 - 1 - m]): m += 1
    for k in range(m):
        pj[j2 - 1 - k] = pj.pop(j1 - 1 - k)
pairs = sorted((i, j) for j, i in pj.items())
paired_j = set(pj)
inserts = [(min([i for i, j in pairs if j > x] or [len(A)]), x) for x in range(len(B)) if x not in paired_j]
inserts = [(i, cw[x]) for i, x in inserts]

# a Whisper word more than 0.3 s from its CTC partner (put on a dropped try, or stretched over a restart): moved there
retime = {i: cw[j] for i, j in pairs if abs(ws[i][1] - cw[j][1]) > 0.3 or ws[i][2] - ws[i][1] >= 1.0}

# group the inserts into runs (same Whisper position) and report them in context
runs = {}
for i, w in inserts:
    runs.setdefault(i, []).append(w)
ctx = lambda i, n: " ".join(w[0] for w in ws[max(0, i - n):i])
print(f"\n{take}: {len(cw)} CTC words vs {len(ws)} Whisper words; {len(runs)} places with words Whisper left out\n")
for i in sorted(runs):
    r = runs[i]
    if all(len(norm(w[0])) <= 1 for w in r) and len(r) == 1: continue      # a lone stray letter: noise
    nxt = " ".join(w[0] for w in ws[i:i + 6])
    print(f"  {r[0][1]:7.2f}  …{ctx(i, 6)} [[{' '.join(w[0] for w in r)}]] {nxt}…")
long = [(i, ws[i]) for i in range(len(ws)) if ws[i][2] - ws[i][1] >= 1.0]
if long:
    print("\n  Whisper words a second or longer (a hidden restart, or a long pause):")
    for i, w in long:
        print(f"  {w[1]:7.2f}  {w[0]!r} {w[2] - w[1]:.1f} s{'  → ' + str(retime[i][1]) if i in retime else ''}   …{ctx(i, 5)} [{w[0]}] {' '.join(x[0] for x in ws[i + 1:i + 5])}")

if write:
    for i, w in retime.items():
        ws[i] = [ws[i][0], w[1], max(w[2], w[1] + 0.05)]
    ws.sort(key=lambda w: w[1])
    meta["words"] = ws
    meta["verbatim"] = {"retimed": len(retime)}
    json.dump(meta, open(os.path.join(d, "words.json"), "w"), separators=(",", ":"))
    print(f"\n  moved {len(retime)} words to the CTC times in {take}/words.json")
