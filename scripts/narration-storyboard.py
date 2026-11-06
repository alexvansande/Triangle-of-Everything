#!/usr/bin/env python3
"""A storyboard of a take as a PDF for the phone: one beat a page, the frame on top, the narration below.

    npm run dev    # keep running (the frames come from the player, scripts/narration-frames.mjs)
    python3 scripts/narration-storyboard.py video/scripts/long-02-storyboard.json output/long-02-storyboard.pdf

The author's idea (2026-11-06): "instead of just reading the text, I'm gonna try to imagine what I'm seeing and
trying to explain it in my own words in a more natural cadence." The JSON names the take and its pages: each page
has a `title` (the concept, a few words) and `from`, the phrase the beat starts on in the take's words.json; a
page runs to the next page's start. The frame is the player's picture 40 % into the beat (at most 4 s in), or at
the page's `at` phrase if given. Portrait pages (1080×1920), big type, the frame at the top, the time code and
the page number small. Needs Pillow and the Inter fonts (/usr/share/fonts/opentype/inter) or DejaVu.
"""
import json, os, re, subprocess, sys, textwrap
from PIL import Image, ImageDraw, ImageFont

spec = json.load(open(sys.argv[1])); out_pdf = sys.argv[2]
take = spec["take"]
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
words = json.load(open(os.path.join(ROOT, "public", "narration", take, "words.json")))["words"]
norm = lambda w: re.sub(r"[^a-z0-9']", "", w.lower().replace("’", "'"))

def find(phrase, after=-1):
    p = [norm(x) for x in phrase.split() if norm(x)]
    for i in range(after + 1, len(words) - len(p) + 1):
        if all(norm(words[i + k][0]) == p[k] for k in range(len(p))): return i
    sys.exit(f"phrase not found: {phrase!r}")

pages = spec["pages"]; idx = []; last = -1
for p in pages:
    i = find(p["from"], last); idx.append(i); last = i
for n, p in enumerate(pages):
    i = idx[n]; j = idx[n + 1] - 1 if n + 1 < len(pages) else len(words) - 1
    p["t0"], p["t1"] = words[i][1], words[j][2]
    p["text"] = " ".join(w[0] for w in words[i:j + 1])
    p["text"] = p["text"][0].upper() + p["text"][1:]
    p["frame"] = words[find(p["at"], i - 1)][1] + 1.0 if p.get("at") else p["t0"] + min(4.0, 0.4 * (p["t1"] - p["t0"]))

# the frames, from the player (16:9 for a landscape take)
fdir = os.path.join(ROOT, "output", "storyboard", take); os.makedirs(fdir, exist_ok=True)
times = [f"{p['frame']:.1f}" for p in pages]
need = [t for t in times if not os.path.exists(os.path.join(fdir, f"{take}-{t}.png"))]
if need:
    env = {**os.environ, "W": "1280", "H": "720", "CAPTIONS": "0", "CHROME": os.environ.get("CHROME", "/opt/pw-browsers/chromium")}   # no captions: the text is under the frame
    subprocess.run(["node", os.path.join(ROOT, "scripts", "narration-frames.mjs"), take, *need, "--out", fdir], check=True, env=env)

def font(size, weight="Medium"):
    for f in [f"/usr/share/fonts/opentype/inter/Inter-{weight}.otf", "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"]:
        if os.path.exists(f): return ImageFont.truetype(f, size)
    return ImageFont.load_default()

W, H = 1080, 1920; M = 60
BG, FG, DIM, ACC = (16, 16, 24), (238, 240, 248), (150, 155, 175), (255, 213, 79)
f_title, f_text, f_small = font(54, "SemiBold"), font(46, "Regular"), font(30, "Regular")
f_cover, f_sub = font(78, "SemiBold"), font(40, "Regular")

def wrap(draw, text, f, width):
    lines, line = [], ""
    for word in text.split():
        t = (line + " " + word).strip()
        if draw.textlength(t, font=f) <= width: line = t
        else: lines.append(line); line = word
    if line: lines.append(line)
    return lines

def mmss(t): return f"{int(t // 60)}:{int(t % 60):02d}"

imgs = []
cover = Image.new("RGB", (W, H), BG); d = ImageDraw.Draw(cover)
y = 500
for line in wrap(d, spec["title"], f_cover, W - 2 * M): d.text((M, y), line, font=f_cover, fill=FG); y += 96
y += 30
for line in wrap(d, spec["subtitle"], f_sub, W - 2 * M): d.text((M, y), line, font=f_sub, fill=DIM); y += 56
d.text((M, H - 160), f"{len(pages)} pages · {mmss(pages[-1]['t1'])}", font=f_small, fill=DIM)
imgs.append(cover)
for n, p in enumerate(pages):
    im = Image.new("RGB", (W, H), BG); d = ImageDraw.Draw(im)
    fr = Image.open(os.path.join(fdir, f"{take}-{p['frame']:.1f}.png")).convert("RGB")
    # the frame: the stage, cropped to its picture (the player draws black bars round a 16:9 stage in a 1280×720 window)
    bbox = fr.convert("L").point(lambda v: 255 if v > 8 else 0).getbbox() or (0, 0, fr.width, fr.height)
    fr = fr.crop(bbox); fw = W - 2 * M; fh = round(fr.height * fw / fr.width)
    fr = fr.resize((fw, fh), Image.LANCZOS)
    d.text((M, 70), f"{n + 1} / {len(pages)}", font=f_small, fill=DIM)
    tc = f"{mmss(p['t0'])} – {mmss(p['t1'])}"
    d.text((W - M - d.textlength(tc, font=f_small), 70), tc, font=f_small, fill=DIM)
    im.paste(fr, (M, 130))
    y = 130 + fh + 60
    for line in wrap(d, p["title"], f_title, W - 2 * M): d.text((M, y), line, font=f_title, fill=ACC); y += 68
    y += 24
    for line in wrap(d, p["text"], f_text, W - 2 * M):
        d.text((M, y), line, font=f_text, fill=FG); y += 62
        if y > H - 120: break
    imgs.append(im)
os.makedirs(os.path.dirname(out_pdf) or ".", exist_ok=True)
imgs[0].save(out_pdf, save_all=True, append_images=imgs[1:], resolution=200, quality=82)
print(f"{len(pages)} pages → {out_pdf}  ({os.path.getsize(out_pdf) / 1e6:.1f} MB)")
