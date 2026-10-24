# Icon from a real (public-domain) photo of a moon or asteroid on black:
# cut the body out, turn it so its lit side faces the upper left (north-west,
# as every icon is lit) and, for a round body, shade it with the sphere
# template like iapetus.png (see compose-iapetus.py).
#
#   python3 scripts/compose-real-body.py <photo> <out.png> round|irregular
#       [--rot DEG] [--strength 1.4] [--thresh 14]
#
# --rot overrides the automatic turn (PIL degrees, counter-clockwise). The
# automatic one points the sun to the upper left: for a round body the sun is
# where the lit part sits off the fitted circle's centre (a half-lit moon), or,
# when the disc is nearly full, where its brightness-weighted centre sits; for
# an irregular body always the latter. --grey drops a false-colour tint.
import argparse, math, numpy as np
from PIL import Image, ImageDraw, ImageFilter
from scipy import ndimage

TEMPLATE = "content/icons/src/sphere template.png"
S, D = 1024, 970                      # canvas and body size, as mimas.png

ap = argparse.ArgumentParser()
ap.add_argument("src"); ap.add_argument("out"); ap.add_argument("mode", choices=["round", "irregular"])
ap.add_argument("--rot", type=float); ap.add_argument("--strength", type=float, default=1.4)
ap.add_argument("--thresh", type=float, default=14); ap.add_argument("--grey", action="store_true")
a = ap.parse_args()

im = Image.open(a.src).convert("RGB")
if a.grey: im = im.convert("L").convert("RGB")
rgb = np.asarray(im).astype(np.float32); lum = rgb.mean(2)
mask = ndimage.binary_opening(lum > a.thresh, iterations=2)
lab, n = ndimage.label(mask)
mask = ndimage.binary_fill_holes(lab == np.argmax(np.bincount(lab.ravel())[1:]) + 1)
ys, xs = np.nonzero(mask)
cx, cy = xs.mean(), ys.mean()
w = lum[ys, xs]
lx, ly = (xs * w).sum() / w.sum() - cx, (ys * w).sum() / w.sum() - cy
light = math.degrees(math.atan2(ly, lx))           # image angle, y down
rot = a.rot if a.rot is not None else light + 135   # turn the light to -135° (upper left)

if a.mode == "round":
    # circle through the sunlit limb: last pixel above the threshold along rays
    # from the centre, kept where the ground just inside it is bright
    H, W = lum.shape; pts = []
    rmax = int(math.hypot(W, H))
    for t in np.linspace(0, 2 * math.pi, 720, endpoint=False):
        r = np.arange(5, rmax)
        x = (cx + r * math.cos(t)).astype(int); y = (cy + r * math.sin(t)).astype(int)
        ok = (x >= 0) & (x < W) & (y >= 0) & (y < H)
        r, x, y = r[ok], x[ok], y[ok]
        idx = np.nonzero(mask[y, x])[0]
        if len(idx) < 20: continue
        k = idx[-1]; inner = lum[y[max(0, k - 25):max(1, k - 5)], x[max(0, k - 25):max(1, k - 5)]].mean()
        pts.append((x[k], y[k], inner))
    P = np.array(pts); P = P[P[:, 2] >= np.percentile(P[:, 2], 50)]
    A = np.c_[2 * P[:, 0], 2 * P[:, 1], np.ones(len(P))]
    sol = np.linalg.lstsq(A, (P[:, :2] ** 2).sum(1), rcond=None)[0]
    ccx, ccy = sol[0], sol[1]; R = math.sqrt(sol[2] + ccx ** 2 + ccy ** 2)
    if math.hypot(cx - ccx, cy - ccy) > 0.04 * R and a.rot is None:
        light = math.degrees(math.atan2(cy - ccy, cx - ccx)); rot = light + 135
    half = R * S / D
    pad = int(half) + 2
    big = Image.new("RGB", (W + 2 * pad, H + 2 * pad)); big.paste(im, (pad, pad))
    crop = big.crop((round(ccx - half) + pad, round(ccy - half) + pad, round(ccx + half) + pad, round(ccy + half) + pad))
    crop = crop.rotate(rot, resample=Image.BICUBIC).resize((S, S), Image.LANCZOS)
    ss = 4; m = Image.new("L", (S * ss, S * ss), 0); o = (S - D) / 2 * ss
    ImageDraw.Draw(m).ellipse((o, o, S * ss - o, S * ss - o), fill=255)
    m = m.resize((S, S), Image.LANCZOS)
    t = Image.open(TEMPLATE).convert("RGBA"); t = t.crop(t.getbbox()).resize((D, D), Image.LANCZOS)
    sh = np.asarray(t).astype(np.float32) / 255
    mul = 1 - a.strength * (1 - (sh[..., :3] * sh[..., 3:] + (1 - sh[..., 3:])))
    full = np.ones((S, S, 3), np.float32); p = (S - D) // 2; full[p:p + D, p:p + D] = mul
    res = np.clip(np.asarray(crop).astype(np.float32) * full, 0, 255).astype(np.uint8)
    out = Image.fromarray(np.dstack([res, np.asarray(m)]), "RGBA")
    info = f"circle ({ccx:.1f}, {ccy:.1f}) r {R:.1f}"
else:
    alpha = Image.fromarray((ndimage.binary_dilation(mask, iterations=1) * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(0.7))
    rgba = im.convert("RGBA"); rgba.putalpha(alpha)
    rgba = rgba.rotate(rot, resample=Image.BICUBIC, expand=True, center=(cx, cy))
    rgba = rgba.crop(rgba.getbbox())
    k = D / max(rgba.size)
    rgba = rgba.resize((max(1, round(rgba.width * k)), max(1, round(rgba.height * k))), Image.LANCZOS)
    out = Image.new("RGBA", (S, S), (0, 0, 0, 0)); out.alpha_composite(rgba, ((S - rgba.width) // 2, (S - rgba.height) // 2))
    info = f"body {rgba.width}x{rgba.height}"
out.save(a.out)
print(f"{a.out}: light from {light:.0f}°, turned {rot:.0f}°, {info}")
