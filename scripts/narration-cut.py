#!/usr/bin/env python3
"""A take made of pieces of other takes: a short split from a longer one, or a long video joined
from several shorts, without recording anything again.

    python3 scripts/narration-cut.py long-01-intro        # reads video/cuts/long-01-intro.json

The cut file names its pieces by phrase, so they stay put when a source take's timing moves:

    { "title": "…", "blurb": "…", "stage": "landscape",      # stage: the player's (default 9:16)
      "gap": 0.6,                                            # s of silence between pieces of different takes
      "segments": [
        { "take": "short-01-hook", "to": "all the stories it contains" },
        { "take": "short-02-up-the-line", "from": "almost everything falls" },
        { "take": "short-01-hook", "from": "I could talk about them" } ] }

A piece runs from the first word of `from` (default: the take's start) to the last word of `to`
(default: its end, with its end-credit music), cut in the pauses between words. It writes
public/narration/<take>/audio.m4a and mix.m4a (the pieces joined, with short fades at the joins),
and words.json with the joined words and "segments": where each piece came from and where it sits,
so the player plays each piece with its own scene's cues (src/narration.js). Nothing is re-recorded;
the music changes with the pieces (each take's own track).
"""
import json, os, re, subprocess, sys, tempfile

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
NARR = os.path.join(ROOT, "public", "narration")
FADE = 0.06          # s, voice fade at each cut (no clicks)
MIX_FADE = 0.35      # s, the mix (music under the voice) fades at a join
norm = lambda w: re.sub(r"[^a-z0-9']", "", w.lower().replace("’", "'"))


def find(words, phrase, after=-1):
    """index range [i, j] of the first occurrence of `phrase` starting after word `after`"""
    p = [norm(x) for x in phrase.split() if norm(x)]
    for i in range(after + 1, len(words) - len(p) + 1):
        if all(norm(words[i + k][0]) == p[k] for k in range(len(p))):
            return i, i + len(p) - 1
    sys.exit(f"phrase not found: {phrase!r}")


def ffmpeg(*args):
    subprocess.run(["ffmpeg", "-hide_banner", "-loglevel", "error", "-y", *args], check=True)


def main(name):
    cut = json.load(open(os.path.join(ROOT, "video", "cuts", f"{name}.json")))
    gap = cut.get("gap", 0.6)
    pieces, words, segments, at = [], [], [], 0.0
    for n, s in enumerate(cut["segments"]):
        src = json.load(open(os.path.join(NARR, s["take"], "words.json")))
        ws = src["words"]
        i = find(ws, s["from"])[0] if s.get("from") else 0
        j = find(ws, s["to"], i - 1)[1] if s.get("to") else len(ws) - 1
        # cut in the pauses: halfway to the neighbouring words, at most 0.25 s before / 0.45 s after
        a = 0.0 if i == 0 else max(ws[i][1] - 0.25, (ws[i - 1][2] + ws[i][1]) / 2)
        end_of_take = j == len(ws) - 1
        b = (src["duration"] + (src.get("credits") or 3)) if end_of_take and n == len(cut["segments"]) - 1 \
            else (src["duration"] if end_of_take else min(ws[j][2] + 0.45, (ws[j][2] + ws[j + 1][1]) / 2))
        if n and s["take"] != cut["segments"][n - 1]["take"]:
            at += gap
        words += [[w, round(t0 - a + at, 3), round(t1 - a + at, 3)] for w, t0, t1 in ws[i:j + 1]]
        segments.append({"take": s["take"], "scene": src.get("scene", s["take"]), "from": round(a, 3), "to": round(b, 3),
                         "at": round(at, 3), "tempo": src.get("tempo", 1)})
        pieces.append((s["take"], src, a, b, at))
        at += b - a
    last_src = pieces[-1][1]
    credits = last_src.get("credits") or 3
    speech_end = round(at - (credits if pieces[-1][3] > last_src["duration"] else 0), 3)

    out = os.path.join(NARR, name)
    os.makedirs(out, exist_ok=True)
    for kind in ("audio", "mix"):
        with tempfile.TemporaryDirectory() as tmp:
            parts = []
            for k, (take, src, a, b, t) in enumerate(pieces):
                f = src.get(kind) or src["audio"]
                fade = FADE if kind == "audio" else MIX_FADE
                p = os.path.join(tmp, f"{k}.wav")
                ffmpeg("-ss", f"{a:.3f}", "-to", f"{b:.3f}", "-i", os.path.join(NARR, take, f),
                       "-af", f"afade=t=in:d={fade if a > 0 else 0.001},afade=t=out:st={max(0, b - a - fade):.3f}:d={fade},"
                              f"aresample=48000,aformat=channel_layouts=stereo", p)
                if k and t > segments[k - 1]["at"] + (pieces[k - 1][3] - pieces[k - 1][2]) + 0.001:   # a gap before it
                    g = os.path.join(tmp, f"{k}-gap.wav")
                    ffmpeg("-f", "lavfi", "-i", "anullsrc=r=48000:cl=stereo", "-t", f"{gap:.3f}", g)
                    parts.append(g)
                parts.append(p)
            lst = os.path.join(tmp, "list.txt")
            open(lst, "w").write("".join(f"file '{p}'\n" for p in parts))
            ffmpeg("-f", "concat", "-safe", "0", "-i", lst, "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart",
                   os.path.join(out, f"{kind}.m4a"))
    tempos = {s["tempo"] for s in segments}
    meta = {"audio": "audio.m4a", "mix": "mix.m4a", "scene": segments[0]["scene"], "duration": speech_end,
            "credits": credits, "cut": f"video/cuts/{name}.json", "segments": segments, "words": words}
    if len(tempos) == 1 and tempos != {1}: meta["tempo"] = tempos.pop()   # one pace throughout: the speed buttons know it
    for k in ("title", "blurb", "stage"):
        if cut.get(k): meta[k] = cut[k]
    json.dump(meta, open(os.path.join(out, "words.json"), "w"), ensure_ascii=False)
    print(f"{name}: {len(segments)} pieces, {len(words)} words, {speech_end:.1f} s + {credits} s credits")
    for s in segments:
        print(f"  {s['at']:7.2f}  {s['take']} {s['from']:.2f}–{s['to']:.2f}")


if __name__ == "__main__":
    for n in sys.argv[1:]:
        main(n)
