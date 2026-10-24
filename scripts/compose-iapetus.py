# Iapetus icon (python3 scripts/compose-iapetus.py <photo> "content/icons/src/sphere template.png" <out.png> 113 1.4): Cassini PIA08384 (public domain) cut to its disc, turned so the photo's thin
# night edge sits on the shadow side, then shaded with content/icons/src/sphere template.png.
import sys, numpy as np
from PIL import Image, ImageDraw
src, tpl, out, rot, strength = sys.argv[1], sys.argv[2], sys.argv[3], float(sys.argv[4]), float(sys.argv[5])
cx, cy, R = 1908.9, 1906.3, 1647.7          # least-squares circle on the sunlit limb
S, D = 1024, 970                             # canvas and disc size, as mimas.png
im = Image.open(src).convert("RGB")
half = R * S / D
crop = im.crop((round(cx - half), round(cy - half), round(cx + half), round(cy + half)))
crop = crop.rotate(rot, resample=Image.BICUBIC).resize((S, S), Image.LANCZOS)
ss = 4
m = Image.new("L", (S * ss, S * ss), 0)
o = (S - D) / 2 * ss
ImageDraw.Draw(m).ellipse((o, o, S * ss - o, S * ss - o), fill=255)
m = m.resize((S, S), Image.LANCZOS)
t = Image.open(tpl).convert("RGBA")
t = t.crop(t.getbbox()).resize((D, D), Image.LANCZOS)
sh = np.asarray(t).astype(np.float32) / 255
mul = sh[..., :3] * sh[..., 3:] + (1 - sh[..., 3:])
mul = 1 - strength * (1 - mul)
full = np.ones((S, S, 3), np.float32); p = (S - D) // 2
full[p:p + D, p:p + D] = mul
res = np.clip(np.asarray(crop).astype(np.float32) * full, 0, 255).astype(np.uint8)
Image.fromarray(np.dstack([res, np.asarray(m)]), "RGBA").save(out)
