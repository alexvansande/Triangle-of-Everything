// The conversion of luminous pictures from screen-blend art to plain
// transparent pictures (scripts/unscreen-icons.mjs runs it; the resolution
// tiers re-run it on the original masters, scripts/generate-icon-resolutions.mjs):
//
//   opacity = the brightest channel (50% grey → white at 50% opacity)
//   colour  = original ÷ opacity (exact over black; over brighter ground a
//             saturated colour comes out a touch darker than screen did)
//
// with what the map used to draw under each one baked in:
//   - stars and the observable universe: their own solid body, a little inside
//     its outline, so the black can't show as a shadow round the glow;
//   - black holes: the shadow circle (softened inward), and their mass palette
//     (src/black-hole-palette.js), applied before the conversion;
//   - diffuse nebulae, galaxies, comets: the faint dark core, and the 1.05×
//     brightness they were drawn with;
//   - everything else: the soft dark disc (0.8 → 0 at 0.52 of the picture).
import sharp from 'sharp';
import { starBodyGeometry } from '../src/star-light.js';
import { isDiffuseSpaceArt, spaceCoreGeometry, SPACE_ART_BRIGHTNESS } from '../src/space-art.js';
import { BLACK_HOLE_PALETTE } from '../src/black-hole-palette.js';

const BODY_INSET = 0.016;   // of the picture's width: how far inside a star's outline its black body stops
const BODY_BLUR = 0.01;     // softness of that edge
const HOLE_SOFT = 0.12;     // of the shadow radius, inward
// Dividing by a small opacity turns dim noise into bright speckle that WebP
// stores badly: below this opacity the colour eases into a blurred version.
const FAINT = 0.3, FAINT_BLUR = 1 / 256;   // blur sigma, of the picture's width
// Their bright, faint glow costs more bytes at the usual WebP settings.
export const UNSCREENED_WEBP = { quality: 85, alphaQuality: 60, effort: 6 };

const smooth = t => { t = Math.min(1, Math.max(0, t)); return t * t * (3 - 2 * t); };
const stopAt = (stops, t) => {
  if (t >= 1) return 0;
  for (let k = 1; k < stops.length; k++) if (t <= stops[k][0]) {
    const [t0, a0] = stops[k - 1], [t1, a1] = stops[k];
    return a0 + (a1 - a0) * (t - t0) / (t1 - t0);
  }
  return 0;
};
const CORE_STOPS = [[0, .35], [.5, .15], [1, 0]];   // #space-core-gradient
const SOFT_STOPS = [[0, .8], [.5, .5], [1, 0]];     // #icon-bg-grad

/** Separable square min (erode) or two-pass box mean (blur) over an N×N map. */
function filter2d(m, N, rad, op) {
  if (rad < 1) return m;
  const tmp = new Float32Array(N * N);
  for (const [from, to, horiz] of [[m, tmp, true], [tmp, m, false]]) {
    for (let u = 0; u < N; u++) for (let v = 0; v < N; v++) {
      let acc = op === 'min' ? 1 : 0, n = 0;
      for (let k = -rad; k <= rad; k++) {
        const w = v + k;
        if (w < 0 || w >= N) { if (op === 'min') acc = 0; continue; }
        const val = horiz ? from[u * N + w] : from[w * N + u];
        if (op === 'min') acc = Math.min(acc, val); else { acc += val; n++; }
      }
      to[horiz ? u * N + v : v * N + u] = op === 'min' ? acc : acc / n;
    }
  }
  return m;
}

function rampLut(ramp) {
  const c = ramp.map(h => [1, 3, 5].map(k => parseInt(h.slice(k, k + 2), 16)));
  const lut = new Uint8Array(256 * 3);
  for (let i = 0; i < 256; i++) {
    const t = i / 255 * (c.length - 1), k = Math.min(c.length - 2, Math.floor(t)), f = t - k;
    for (let j = 0; j < 3; j++) lut[i * 3 + j] = Math.round(c[k][j] + (c[k + 1][j] - c[k][j]) * f);
  }
  return lut;
}

/** What goes under `slug`'s light: opacity at pixel (x, y) of the N×N picture. */
function backingFor(slug, cat, src, N) {
  const body = starBodyGeometry(slug, .5, .5, 1);
  if (body) {
    const hasAlpha = src[3] < 128;   // a star cut out on transparency, not art on black
    if (hasAlpha) {
      const m = new Float32Array(N * N);
      for (let i = 0; i < N * N; i++) m[i] = smooth((src[i * 4 + 3] / 255 - 0.85) / 0.14);
      filter2d(m, N, Math.round(BODY_INSET * N), 'min');
      const blur = Math.round(BODY_BLUR * N);
      filter2d(filter2d(m, N, blur, 'mean'), N, blur, 'mean');
      return { kind: 'body', at: (x, y) => m[Math.min(N - 1, y) * N + Math.min(N - 1, x)] };
    }
    const r = body.r * N, e0 = r * (1 - HOLE_SOFT);
    return { kind: 'hole', at: (x, y) => smooth((r - Math.hypot(x + .5 - body.cx * N, y + .5 - body.cy * N)) / (r - e0)) };
  }
  if (isDiffuseSpaceArt(cat, slug)) {
    const c = spaceCoreGeometry(slug, .5, .5, 1);
    return { kind: 'core', gain: SPACE_ART_BRIGHTNESS, at: (x, y) => stopAt(CORE_STOPS, Math.hypot(x + .5 - c.cx * N, y + .5 - c.cy * N) / (c.r * N)) };
  }
  return { kind: 'soft', at: (x, y) => stopAt(SOFT_STOPS, Math.hypot(x + .5 - N / 2, y + .5 - N / 2) / (.52 * N)) };
}

/** `input` letterboxed to a transparent square (as the resolution tiers do), at most `max` px. */
export async function convert(input, slug, cat, max = Infinity) {
  const { width: W, height: H } = await sharp(input).metadata();
  const N = Math.min(max, Math.max(W, H));
  const src = await sharp(input).ensureAlpha().resize(N, N, { fit: 'contain', background: '#0000' }).raw().toBuffer();
  const backing = backingFor(slug, cat, src, N);
  const lut = BLACK_HOLE_PALETTE[slug] && rampLut(BLACK_HOLE_PALETTE[slug].ramp);
  const gain = backing.gain || 1, out = Buffer.alloc(N * N * 4);
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
    const i = (y * N + x) * 4, a0 = src[i + 3] / 255;
    let r = src[i], g = src[i + 1], b = src[i + 2];
    if (lut) { const l = Math.round(0.2126 * r + 0.7152 * g + 0.0722 * b); r = lut[l * 3]; g = lut[l * 3 + 1]; b = lut[l * 3 + 2]; }
    // light as screen saw it: premultiplied by the picture's own alpha
    r = Math.min(1, r / 255 * a0 * gain); g = Math.min(1, g / 255 * a0 * gain); b = Math.min(1, b / 255 * a0 * gain);
    let a = Math.max(r, g, b);
    let fr = a ? r / a : 0, fg = a ? g / a : 0, fb = a ? b / a : 0;
    const back = backing.at(x, y);
    if (back > 0) {
      const ao = a + back * (1 - a);
      fr *= a / ao; fg *= a / ao; fb *= a / ao; a = ao;
    }
    out[i] = Math.round(fr * 255); out[i + 1] = Math.round(fg * 255); out[i + 2] = Math.round(fb * 255); out[i + 3] = Math.round(a * 255);
  }
  return { kind: backing.kind, image: sharp(await smoothFaint(out, N), { raw: { width: N, height: N, channels: 4 } }) };
}

async function smoothFaint(px, N) {
  const pm = Buffer.alloc(N * N * 4);
  for (let i = 0; i < N * N; i++) { const a = px[i * 4 + 3]; for (let j = 0; j < 3; j++) pm[i * 4 + j] = Math.round(px[i * 4 + j] * a / 255); pm[i * 4 + 3] = a; }
  const bl = await sharp(pm, { raw: { width: N, height: N, channels: 4 } }).blur(Math.max(0.3, FAINT_BLUR * N)).raw().toBuffer();
  for (let i = 0; i < N * N; i++) {
    const a = px[i * 4 + 3] / 255; if (a >= FAINT) continue;
    const t = a / FAINT, ba = bl[i * 4 + 3];
    for (let j = 0; j < 3; j++) { const f = ba ? Math.min(255, bl[i * 4 + j] * 255 / ba) : 0; px[i * 4 + j] = Math.round(f + (px[i * 4 + j] - f) * t); }
  }
  return px;
}
