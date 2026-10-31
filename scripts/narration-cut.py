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
the music changes with the pieces (each take's own track). In the silence between pieces of two takes
the first one's backing track plays on, from where its piece ended (from its beginning again if it ran
out before: it loops), about 9 LU under its voice (the
level narration-sound.py gives it with no one talking), and fades out under the next piece's start
as that one's own music comes in (the author, 2026-10-31: "I don't mind having the music continue
from the previous clip into the next").

A cut can have music of its own instead, one track after another under the whole video, the
pieces' tracks no longer changing at the joins ("music": the author, 2026-10-31, "we can just keep
playing the music, and when it's done, we play the next music"):

      "music": [ { "track": "Space X-plorers" },                          # from the start
                 { "track": "Space X-plorers", "at": { "gap": 1, "lead": 5.5 } },   # again, its 5.5 s at the 1st gap
                 { "track": "Soaring", "after": true } ]                  # when the one before ends

It goes into words.json as [{ track, at, offset }] (s into the video, s into the track), and the
mix is then made whole by scripts/narration-sound.mjs <cut> (voice, the pieces' sound cues, the
music), not joined from the pieces' mixes.
"""
import json, os, re, subprocess, sys, tempfile

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
NARR = os.path.join(ROOT, "public", "narration")
FADE = 0.06          # s, voice fade at each cut (no clicks)
MIX_FADE = 0.35      # s, the mix (music under the voice) fades at a join
GAP_TAIL = 1.5       # s, the music carried over a gap fades out this far into the next piece
MUSIC = os.path.join(ROOT, "video", "music")
# the scenes' backing names → files (as narration-sound.py's TRACKS)
TRACKS = {"Space X-plorers": "space explorers.mp3", "In the West": "In The West.mp3"}
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


def lufs(path, ss=0.0, t=None):
    """integrated loudness (ffmpeg's EBU R128 meter) of a file, or of a stretch of it"""
    args = ["ffmpeg", "-hide_banner", "-nostats", "-ss", f"{ss:.3f}", *(["-t", f"{t:.3f}"] if t else []), "-i", path,
            "-af", "ebur128", "-f", "null", "-"]
    out = subprocess.run(args, capture_output=True, text=True).stderr
    return float(re.findall(r"I:\s+(-?[\d.]+) LUFS", out)[-1])


def backing(take, scene):
    """the scene's backing track file, or None (a string `backing: "Name"` in src/narration-scenes/)"""
    f = os.path.join(ROOT, "src", "narration-scenes", f"{scene}.js")
    m = os.path.exists(f) and re.search(r'^\s*backing:\s*"([^"]+)"', open(f).read(), re.M)
    if not m: return None
    path = os.path.join(MUSIC, TRACKS.get(m.group(1), m.group(1) + ".mp3"))
    return path if os.path.exists(path) else None


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
            joined = os.path.join(tmp, "joined.wav")
            ffmpeg("-f", "concat", "-safe", "0", "-i", lst, joined)
            # the music carried over each gap (the mix only)
            extra = []
            for k in range(1, len(pieces)) if kind == "mix" and not cut.get("music") else []:
                take, src, a, b, t = pieces[k - 1]
                end = t + (b - a)
                if pieces[k][4] <= end + 0.001: continue                       # no gap: same take
                track = backing(take, src.get("scene", take))
                if not track: continue
                L = float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", track],
                                         capture_output=True, text=True).stdout)
                if b - MIX_FADE < L:   # where the take's own music was (it starts with the take), on from there
                    start, pos = end - MIX_FADE, b - MIX_FADE
                else:                  # the track ran out inside the piece: it starts again from its beginning there
                    start, pos = max(t, t + L - a), 0.0
                dur = end + gap + GAP_TAIL - start
                # (measured on the stretch that plays: a soft intro or a fading end still fills the gap)
                # (but not over 6 dB above the track's level around it: a track's own fade-out stays a fade)
                voice = lufs(os.path.join(NARR, take, src["audio"])) - 9
                level = min(voice - lufs(track, pos, max(3.0, dur)), voice - lufs(track, max(0.0, min(pos, L - 30)), 30) + 6)
                e = os.path.join(tmp, f"carry{k}.wav")
                ffmpeg("-ss", f"{pos:.3f}", "-t", f"{dur:.3f}", "-i", track, "-af",
                       f"volume={level:.2f}dB,afade=t=in:d={MIX_FADE},afade=t=out:st={dur - GAP_TAIL - 0.2:.3f}:d={GAP_TAIL + 0.2},"
                       f"aresample=48000,aformat=channel_layouts=stereo,adelay={int(start * 1000)}:all=1", e)
                extra.append(e)
                print(f"  music on over the gap at {end:.2f} s: {os.path.basename(track)} from {pos:.1f} s, {level:+.1f} dB")
            final = joined
            if extra:
                final = os.path.join(tmp, "carried.wav")
                ins = [x for e in extra for x in ("-i", e)]
                ffmpeg("-i", joined, *ins, "-filter_complex",
                       f"amix=inputs={len(extra) + 1}:duration=first:normalize=0", final)
            ffmpeg("-i", final, "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart", os.path.join(out, f"{kind}.m4a"))
    tempos = {s["tempo"] for s in segments}
    meta = {"audio": "audio.m4a", "mix": "mix.m4a", "scene": segments[0]["scene"], "duration": speech_end,
            "credits": credits, "cut": f"video/cuts/{name}.json", "segments": segments, "words": words}
    if len(tempos) == 1 and tempos != {1}: meta["tempo"] = tempos.pop()   # one pace throughout: the speed buttons know it
    for k in ("title", "blurb", "stage"):
        if cut.get(k): meta[k] = cut[k]
    if cut.get("music"):
        gaps = [p[4] - gap for k, p in enumerate(pieces) if k and p[4] > pieces[k - 1][4] + (pieces[k - 1][3] - pieces[k - 1][2]) + 0.001]
        music, prev = [], None
        for m in cut["music"]:
            path = os.path.join(MUSIC, TRACKS.get(m["track"], m["track"] + ".mp3"))
            L = float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", path],
                                     capture_output=True, text=True).stdout)
            off = m.get("offset", 0.0)
            at = m.get("at", 0.0)
            if isinstance(at, dict): at = gaps[at["gap"] - 1] - at.get("lead", 0.0)   # its `lead` s at that gap's start
            if m.get("after") and prev: at = prev["at"] + prev["len"]               # when the one before ends
            prev = {"track": m["track"], "at": round(max(0.0, at), 3), "offset": off, "len": L - off}
            music.append(prev)
        meta["music"] = [{k: v for k, v in x.items() if k != "len"} for x in music]
        print("  music: " + ", ".join(f"{x['track']} at {x['at']:.1f} s" for x in meta["music"]) + " (then: node scripts/narration-sound.mjs " + name + ")")
    json.dump(meta, open(os.path.join(out, "words.json"), "w"), ensure_ascii=False)
    print(f"{name}: {len(segments)} pieces, {len(words)} words, {speech_end:.1f} s + {credits} s credits")
    for s in segments:
        print(f"  {s['at']:7.2f}  {s['take']} {s['from']:.2f}–{s['to']:.2f}")


if __name__ == "__main__":
    for n in sys.argv[1:]:
        main(n)
