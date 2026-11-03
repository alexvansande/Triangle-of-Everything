# Repaint the WMAP ILC rainbow map in the Planck palette: the temperature read back from the hue
# (blue cold to red hot, as the shell's opacity reads it), then the Planck colours at that temperature.
import sys, numpy as np
from PIL import Image
src, out, width = sys.argv[1], sys.argv[2], int(sys.argv[3])
a = np.asarray(Image.open(src).convert('RGB').resize((width, width // 2), Image.LANCZOS), float) / 255
r, g, b = a[..., 0], a[..., 1], a[..., 2]
hi, lo = a.max(-1), a.min(-1); d = np.maximum(hi - lo, 1e-4)
sector = np.where(hi == r, np.mod((g - b) / d + 6, 6), np.where(hi == g, (b - r) / d + 2, (r - g) / d + 4))
sector = np.where(sector > 5, 0, sector)                      # magenta-ish reds wrap to red
t = np.clip((4 - sector) / 4, 0, 1)
# the rainbow's dark ends (navy, maroon) push past its blue and red
t = np.where(sector >= 3.5, t - .12 * (1 - hi), t); t = np.where(sector <= .5, t + .12 * (1 - hi), t)
t = np.clip((t + .12) / 1.24, 0, 1)
# the rainbow's hues bunch at a few values (a two-tone map read straight): spread them out by rank,
# keeping their order, so every shade of the palette gets its share as on Planck's map
order = np.argsort(t.ravel(), kind='stable'); rank = np.empty(t.size); rank[order] = np.linspace(0, 1, t.size)
u = 2 * rank.reshape(t.shape) - 1; t = .5 + .5 * np.sign(u) * np.abs(u) ** 2   # most near the middle, few at the deep ends
stops = np.array([[0, 0, 40, 200], [.1, 0, 100, 240], [.25, 60, 160, 245], [.38, 140, 210, 245], [.47, 200, 238, 240],
                  [.53, 250, 238, 205], [.62, 252, 210, 140], [.75, 248, 165, 70], [.9, 230, 100, 15], [1, 150, 35, 0]], float)
outc = np.stack([np.interp(t, stops[:, 0], stops[:, k]) for k in (1, 2, 3)], -1)
Image.fromarray(outc.clip(0, 255).astype(np.uint8)).save(out, quality=90)
