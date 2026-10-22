// SVG <image> has no srcset. Reserve enough pixels for hover before it begins.
export function iconPixelRequirement(cssSize, dpr = 1, reserveHover = true) {
  const size = Math.max(0, Number(cssSize) || 0);
  return Math.ceil((reserveHover ? Math.max(64, size * 1.5) : size) * Math.max(1, dpr || 1));
}

export function chooseIconResolution(variants, pixels) {
  if (!variants?.length) return null;
  return variants.find(v => v.width >= pixels) || variants[variants.length - 1];
}
