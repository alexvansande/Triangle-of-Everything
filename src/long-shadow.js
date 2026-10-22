export const LONG_SHADOW_PRESET = Object.freeze({
  mode: 'long', source: 'alpha-long-shadow', anchorBase: false, flipY: false,
  opacity: 0.5, longLength: 0.8, longGap: 0.06, longAngle: 45,
  longNear: 1.5, longFar: 18, longFade: 1,
});

// A frontal cutout projected along one light direction. Samples are combined
// by maximum coverage, not source-over, so more samples never darken the cast.
export function sweepShadowAlpha(masks, size, {
  lengthPx, gapPx = 0, angle = 45, fade = 1, stepPx = 2, bounds,
}) {
  const out = new Uint8ClampedArray(size * size);
  const steps = Math.max(1, Math.ceil(lengthPx / stepPx));
  const radians = angle * Math.PI / 180;
  const box = bounds || { x0: 0, y0: 0, x1: size, y1: size };
  for (let n = 0; n <= steps; n++) {
    const t = n / steps;
    const strength = Math.pow(1 - t * fade, 1.35);
    if (!strength) continue;
    const mask = masks[Math.round(t * (masks.length - 1))];
    const travel = gapPx + lengthPx * t;
    const dx = Math.round(Math.cos(radians) * travel);
    const dy = Math.round(Math.sin(radians) * travel);
    const x0 = Math.max(box.x0, -dx), x1 = Math.min(box.x1, size - dx);
    const y0 = Math.max(box.y0, -dy), y1 = Math.min(box.y1, size - dy);
    for (let y = y0; y < y1; y++) {
      let from = y * size + x0, to = (y + dy) * size + x0 + dx;
      for (let x = x0; x < x1; x++, from++, to++) {
        const a = Math.round(mask[from] * strength);
        if (a > out[to]) out[to] = a;
      }
    }
  }
  return out;
}

// Browser/editor renderer. The 3× texture is registered to the icon center;
// the chart must not add the legacy rest-position offset a second time.
export function drawLongShadow(canvas, icon, settings = {}, iconSize = 256) {
  const size = canvas.width;
  const near = settings.longNear ?? 1.5;
  const far = Math.max(near, settings.longFar ?? 18);
  const length = settings.longLength ?? 0.8;
  const gap = settings.longGap ?? 0.06;
  const angle = settings.longAngle ?? 45;
  const fade = settings.longFade ?? 1;
  const temp = document.createElement('canvas');
  temp.width = temp.height = size;
  const ctx = temp.getContext('2d', { willReadFrequently: true });
  const pad = (size - iconSize) / 2;
  const masks = [];
  for (let level = 0; level < 9; level++) {
    ctx.clearRect(0, 0, size, size);
    ctx.filter = `blur(${near + (far - near) * level / 8}px)`;
    ctx.drawImage(icon, pad, pad, iconSize, iconSize);
    const rgba = ctx.getImageData(0, 0, size, size).data;
    const mask = new Uint8ClampedArray(size * size);
    for (let i = 0; i < mask.length; i++) mask[i] = rgba[i * 4 + 3];
    masks.push(mask);
  }
  const margin = Math.ceil(far * 4 + 2);
  const alpha = sweepShadowAlpha(masks, size, {
    lengthPx: length * iconSize, gapPx: gap * iconSize, angle, fade,
    bounds: {
      x0: Math.max(0, pad - margin), y0: Math.max(0, pad - margin),
      x1: Math.min(size, pad + iconSize + margin),
      y1: Math.min(size, pad + iconSize + margin),
    },
  });
  const dest = canvas.getContext('2d');
  const pixels = dest.createImageData(size, size);
  const strength = settings.opacity ?? 0.5;
  for (let i = 0; i < alpha.length; i++) {
    pixels.data[i * 4] = 20;
    pixels.data[i * 4 + 1] = 15;
    pixels.data[i * 4 + 2] = 46;
    pixels.data[i * 4 + 3] = Math.round(alpha[i] * strength);
  }
  dest.putImageData(pixels, 0, 0);
}
