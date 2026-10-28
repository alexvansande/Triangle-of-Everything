"""Carry the corrected caption words of the old words.json over to a fresh transcription.

    git show HEAD:public/narration/<take>/words.json > /tmp/old.json
    python3 scripts/narration-take.py edit.m4a <take>
    python3 video/tools/transfer-captions.py /tmp/old.json public/narration/<take>/words.json

After a re-cut that only takes out pauses, fillers and false starts (the clean-up of
2026-10-28), instead of re-applying the NOTES' caption corrections by hand: the audio says
the same words as before, so
the old text, with its hand corrections, is kept and gets the new timings: aligned word for
word where the two agree, spread over the new span where Whisper split or merged words
differently. Every place where they differ is printed for review. The old file's other keys
(scene, thumb, credits, mix) are kept; tempo/stretch/postcut are dropped (tempo is re-applied).
"""
import difflib, json, re, sys
old = json.load(open(sys.argv[1])); new = json.load(open(sys.argv[2]))
ow, nw = old["words"], new["words"]
norm = lambda w: re.sub(r"[^a-z0-9]", "", w.lower())
sm = difflib.SequenceMatcher(a=[norm(w[0]) for w in ow], b=[norm(w[0]) for w in nw], autojunk=False)
out = []
for op, i1, i2, j1, j2 in sm.get_opcodes():
    if op == "equal":
        out += [[ow[i][0], nw[j][1], nw[j][2]] for i, j in zip(range(i1, i2), range(j1, j2))]; continue
    o, n = ow[i1:i2], nw[j1:j2]
    print(f"{op:7s} old {' '.join(w[0] for w in o)!r:45s} new {' '.join(w[0] for w in n)!r} @ {n[0][1] if n else (out[-1][2] if out else 0):.2f}")
    if o and n:
        if len(o) == len(n): out += [[a[0], b[1], b[2]] for a, b in zip(o, n)]
        else:
            t0, t1 = n[0][1], n[-1][2]; d = (t1 - t0) / len(o)
            out += [[a[0], round(t0 + k * d, 2), round(t0 + (k + 1) * d, 2)] for k, a in enumerate(o)]
    elif o:   # Whisper dropped them this time: squeeze them in after the previous word
        t0 = out[-1][2] if out else 0; t1 = nw[j1][1] if j1 < len(nw) else t0 + 0.3 * len(o)
        d = max(0.05, (t1 - t0) / len(o))
        out += [[a[0], round(t0 + k * d, 2), round(t0 + (k + 1) * d, 2)] for k, a in enumerate(o)]
    else:     # new words the old captions didn't have: listed above, left out
        pass
res = {k: v for k, v in old.items() if k not in ("words", "duration", "tempo", "stretch", "postcut")}
res["audio"] = new["audio"]; res["duration"] = new["duration"]; res["words"] = out
json.dump(res, open(sys.argv[2], "w"), ensure_ascii=False, separators=(",", ":"))
print(f"{len(out)} words (old {len(ow)}, Whisper {len(nw)}); keys {list(res)}")
