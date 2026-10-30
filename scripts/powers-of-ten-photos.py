#!/usr/bin/env python3
"""Real photographs for the powers-of-ten zoom, from the General Sherman tree's crown
to the whole Earth: square frames 10^s metres wide (s from 1.6 to 7.35 in steps of
0.25, ×1.78 each), centred on the tree, north up, each an orthographic view of the
globe (so they nest exactly and the last ones are the whole disc).

  NAIP (USDA/USGS, 0.3 m, public domain)        up to 10^4.35 m (22 km)
  Sentinel-2 cloudless 2016 (EOX, 10 m, CC BY 4.0) up to 10^6.1 m (1,260 km)
  Blue Marble Next Generation (NASA, public domain) beyond

Writes video/powers-of-ten/photos/s+1.60.jpg … and manifest.json (the plates format
tools/powers-of-ten/plates.js reads, plus each frame's source). No clouds in them: with
--clouds the script writes the clouds of 15 June 2024 (MODIS Terra's true colour, NASA
GIBS, public domain; the day the zoom's globe shows) as see-through overlays for the same
frames from 10^3.85 m up, in photos/clouds/: each cloud is cut out by how much brighter
MODIS is than the cloud-free photo of the same ground (so snow, bright in both, stays out).

The three sources differ in colour (NAIP is paler and greener), so at each handover
the finer source's top frame is shifted (per channel, mean and spread) to match the
coarser source on the same ground, easing back to its own colours over the three
frames below it: no jump, and no frame pushed far. The shifts are measured on small
test frames first.

  python3 scripts/powers-of-ten-photos.py [--px 4000] [--only 1.6,1.85] [--out DIR]
"""
import argparse, io, json, math, os, time, urllib.request
import numpy as np
from PIL import Image

# the General Sherman tree (OpenStreetMap node 313753662)
LAT0, LON0 = 36.5816453, -118.7514430
R = 6371008.8  # mean Earth radius, m
NAIP = "https://imagery.nationalmap.gov/arcgis/rest/services/USGSNAIPPlus/ImageServer/exportImage"
EOX = "https://tiles.maps.eox.at/wms"
GIBS = "https://gibs.earthdata.nasa.gov/wms/epsg4326/best/wms.cgi"
CLOUD_DAY = "2024-06-15"
SOURCES = {
    "naip": ("NAIP, USDA Farm Service Agency / USGS The National Map (public domain)", 4.35),
    "s2": ("Sentinel-2 cloudless 2016 by EOX IT Services GmbH, https://s2maps.eu (contains modified Copernicus Sentinel data 2016), CC BY 4.0", 6.1),
    "bm": ("Blue Marble Next Generation, NASA Earth Observatory (public domain), via EOX", 99),
}


def source_for(s):
    for k, (_, top) in SOURCES.items():
        if s <= top + 1e-9:
            return k


def get(url, tries=4):
    for i in range(tries):
        try:
            with urllib.request.urlopen(url, timeout=300) as r:
                return r.read()
        except Exception as e:
            if i == tries - 1:
                raise
            time.sleep(2 ** (i + 1))


def fetch(src, west, south, east, north, w, h):
    """An image of a lat/lon box (EPSG:4326), w × h pixels, as a float array."""
    if src.startswith("modis"):
        # modis / modis721, Terra's, with the gaps between its swaths filled from Aqua's
        # (three hours later the same day)
        bands = "Bands721" if src.endswith("721") else "TrueColor"
        url = lambda sat: (f"{GIBS}?SERVICE=WMS&VERSION=1.1.1&REQUEST=GetMap&LAYERS=MODIS_{sat}_CorrectedReflectance_{bands}&STYLES="
                           f"&SRS=EPSG:4326&BBOX={west},{south},{east},{north}&WIDTH={w}&HEIGHT={h}&FORMAT=image/jpeg&TIME={CLOUD_DAY}")
        terra, aqua = [np.asarray(Image.open(io.BytesIO(get(url(sat)))).convert("RGB"), dtype=np.float32) for sat in ("Terra", "Aqua")]
        gap = (terra.max(-1) < 4)[..., None]
        return np.where(gap, aqua, terra)
    elif src == "naip":
        url = (f"{NAIP}?bbox={west},{south},{east},{north}&bboxSR=4326&imageSR=4326&size={w},{h}"
               "&format=jpg&f=image&interpolation=RSP_BilinearInterpolation")
    else:
        layer = "s2cloudless" if src == "s2" else "bluemarble"
        url = (f"{EOX}?service=WMS&version=1.1.1&request=GetMap&layers={layer}&styles=&srs=EPSG:4326"
               f"&bbox={west},{south},{east},{north}&width={w}&height={h}&format=image/jpeg")
    data = get(url)
    return np.asarray(Image.open(io.BytesIO(data)).convert("RGB"), dtype=np.float32)


def ortho_latlon(width, px):
    """Lat/lon (degrees) of each pixel of a square orthographic frame width m across,
    centred on the tree, north up; NaN off the globe."""
    t = (np.arange(px) + 0.5) / px - 0.5
    x, y = np.meshgrid(t * width, -t * width)
    rho = np.hypot(x, y) / R
    with np.errstate(invalid="ignore", divide="ignore"):
        c = np.arcsin(np.clip(rho, 0, 1))
        p0 = math.radians(LAT0)
        lat = np.arcsin(np.cos(c) * math.sin(p0) + np.where(rho > 0, y / R * np.sin(c) * math.cos(p0) / rho, 0))
        lon = math.radians(LON0) + np.arctan2(x / R * np.sin(c), rho * math.cos(p0) * np.cos(c) - y / R * math.sin(p0) * np.sin(c))
    lat, lon = np.degrees(lat), (np.degrees(lon) + 180) % 360 - 180
    off = rho > 1
    lat[off] = np.nan; lon[off] = np.nan
    return lat, lon


def sample(img, west, south, east, north, lat, lon):
    """Bilinear sample of an equirectangular image of a box at lat/lon."""
    h, w, _ = img.shape
    fx = (lon - west) / (east - west) * w - 0.5
    fy = (north - lat) / (north - south) * h - 0.5
    ok = np.isfinite(fx)
    fx = np.where(ok, fx, 0); fy = np.where(ok, fy, 0)
    x0 = np.clip(np.floor(fx).astype(int), 0, w - 2); y0 = np.clip(np.floor(fy).astype(int), 0, h - 2)
    tx = np.clip(fx - x0, 0, 1)[..., None]; ty = np.clip(fy - y0, 0, 1)[..., None]
    out = (img[y0, x0] * (1 - tx) * (1 - ty) + img[y0, x0 + 1] * tx * (1 - ty)
           + img[y0 + 1, x0] * (1 - tx) * ty + img[y0 + 1, x0 + 1] * tx * ty)
    out[~ok] = 0
    return out


_world = {}


def frame(s, px, src=None):
    width, src = 10 ** s, src or source_for(s)
    lat, lon = ortho_latlon(width, px)
    if width >= 2 * R * 0.999 or np.isnan(lat).any():
        # the whole disc: the world's picture, in two halves (the WMS caps a request's size)
        if src not in _world:
            _world[src] = np.concatenate([fetch(src, -180, -90, 0, 90, 4096, 4096), fetch(src, 0, -90, 180, 90, 4096, 4096)], axis=1)
        return sample(_world[src], -180, -90, 180, 90, lat, lon), src
    # the box the frame covers, a little padded
    south, north = np.nanmin(lat), np.nanmax(lat)
    west, east = np.nanmin(lon), np.nanmax(lon)
    pad = 0.01 * max(north - south, east - west)
    south, north, west, east = south - pad, north + pad, west - pad, east + pad
    # as many source pixels as the frame has, the box's own shape (4,000 is the most a request may ask)
    aspect = (east - west) * math.cos(math.radians(LAT0)) / (north - south)
    w = min(4000, int(px * max(1, aspect) * 1.02)); h = min(4000, int(w / aspect))
    img = fetch(src, west, south, east, north, w, h)
    return sample(img, west, south, east, north, lat, lon), src


def stats(img):
    v = img.reshape(-1, 3)
    return v.mean(0), v.std(0) + 1e-6


def match(fine, coarse, s_lo, s_hi, n=400):
    """The per-channel shift (gain, offset) that brings source fine's colours to
    source coarse's, measured on the same ground: the frame 10^s_lo wide, as each
    source shows it."""
    a, _ = frame(s_lo, n, fine)
    b, _ = frame(s_lo, n, coarse)
    (ma, sa), (mb, sb) = stats(a), stats(b)
    g = sb / sa
    return g, mb - g * ma


def clouds(steps, out, px):
    """See-through cloud overlays (RGBA PNG) for the frames from 10^3.85 m up."""
    cdir = os.path.join(out, "clouds")
    os.makedirs(cdir, exist_ok=True)
    plates = []
    for s in [v for v in steps if v >= 3.85 - 1e-9]:
        t0 = time.time()
        tc, _ = frame(s, px, "modis")
        b7, _ = frame(s, px, "modis721")
        base = np.asarray(Image.open(os.path.join(out, f"s+{s:.2f}.jpg")).convert("RGB").resize((px, px), Image.LANCZOS), dtype=np.float32)
        lum = lambda a: (0.299 * a[..., 0] + 0.587 * a[..., 1] + 0.114 * a[..., 2]) / 255
        Lt, Lb = lum(tc), lum(base)
        mx, mn = tc.max(-1), tc.min(-1)
        sat = (mx - mn) / np.maximum(mx, 1)
        # well brighter than the ground beneath and bright outright (not the ocean's
        # haze or glint), grey-white, and bright at 2.1 µm too (band 7: snow and ice
        # are dark there, show cyan in 7-2-1, while clouds stay white)
        a = (np.clip((Lt - Lb - 0.15) / np.maximum(0.85 - Lb, 0.15), 0, 1) * np.clip((Lt - 0.35) / 0.2, 0, 1)
             * np.clip((0.35 - sat) / 0.2, 0, 1) * np.clip((b7[..., 0] / 255 - 0.2) / 0.2, 0, 1))
        a = a ** 0.8
        rgb = np.clip(tc * 0.6 + 255 * 0.4, 0, 255)
        img = np.dstack([rgb, 255 * a]).astype(np.uint8)
        name = f"s+{s:.2f}.webp"
        Image.fromarray(img, "RGBA").save(os.path.join(cdir, name), quality=85, method=5)
        plates.append({"s": s, "file": name, "width_m": round(10 ** s, 1), "cover": round(float(a.mean()), 3)})
        print(f"clouds/{name}  cover {a.mean():.0%}  {time.time() - t0:.0f} s", flush=True)
    json.dump({"day": CLOUD_DAY, "source": "MODIS Terra Corrected Reflectance (true colour), NASA GIBS (public domain)",
               "plates": plates}, open(os.path.join(cdir, "manifest.json"), "w"), indent=1)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--px", type=int, default=4000)
    ap.add_argument("--only", default="")
    ap.add_argument("--clouds", action="store_true", help="write the cloud overlays (from the photos already made)")
    ap.add_argument("--out", default=os.path.join(os.path.dirname(__file__), "..", "video", "powers-of-ten", "photos"))
    a = ap.parse_args()
    os.makedirs(a.out, exist_ok=True)
    steps = [round(1.6 + 0.25 * i, 2) for i in range(24)]
    if a.only:
        steps = [float(v) for v in a.only.split(",")]
    if a.clouds:
        return clouds(steps, a.out, min(a.px, 2048))
    man_path = os.path.join(a.out, "manifest.json")
    man = json.load(open(man_path)) if os.path.exists(man_path) else {"plates": []}
    have = {p["s"]: p for p in man["plates"]}
    # at each handover the finer source's top frame takes the coarser one's colours,
    # easing back to its own over 0.75 decades
    shift = {"s2": (*match("s2", "bm", 6.1, 6.35), 6.1), "naip": (*match("naip", "s2", 4.35, 4.6), 4.35)}
    print("colour shifts (gain, offset):", {k: (np.round(v[0], 3).tolist(), np.round(v[1], 1).tolist()) for k, v in shift.items()}, flush=True)
    for s in steps:
        t0 = time.time()
        img, src = frame(s, a.px)
        if src in shift:
            g, o, top = shift[src]
            w = min(1, max(0, (s - (top - 0.75)) / 0.75))
            img = img * (1 + w * (g - 1)) + w * o
        name = f"s+{s:.2f}.jpg"
        Image.fromarray(np.clip(img, 0, 255).astype(np.uint8)).save(os.path.join(a.out, name), quality=88)
        have[s] = {"s": s, "file": name, "width_m": round(10 ** s, 1), "source": src}
        print(f"{name}  {10 ** s:,.0f} m  {src}  {time.time() - t0:.0f} s", flush=True)
    man = {
        "centre": {"lat": LAT0, "lon": LON0, "what": "the General Sherman tree (OpenStreetMap node 313753662)"},
        "projection": "orthographic, centred on the tree, north up; each frame 10^s m across",
        "credits": {k: v[0] for k, v in SOURCES.items()},
        "plates": [have[k] for k in sorted(have)],
    }
    json.dump(man, open(man_path, "w"), indent=1)


if __name__ == "__main__":
    main()
