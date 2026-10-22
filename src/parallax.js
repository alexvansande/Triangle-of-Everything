// Screen-space depth, evaluated from the camera position every frame.
// No velocity or accumulated drift: recorded and interactive pans agree.
export const PARALLAX = Object.freeze({ dust: 2, labels: 4, icon: 0.28, hover: 0.20, variation: 0.12 });

// Stable identity, not array order or frame randomness: the same miniature
// keeps its depth through reloads, searches and camera reversals.
export function iconDepth(key = "") {
  if (!key) return 1;
  let hash = 2166136261;
  for (const char of key) hash = Math.imul(hash ^ char.codePointAt(0), 16777619);
  return 1 + ((hash >>> 0) / 0xffffffff * 2 - 1) * PARALLAX.variation;
}

export function planePoint(x, y, width, height, depth = 0) {
  return { x: x + (2 * x / Math.max(1, width) - 1) * depth,
    y: y + (2 * y / Math.max(1, height) - 1) * depth };
}

export function unprojectPlane(x, y, width, height, depth = 0) {
  return { x: (x + depth) / (1 + 2 * depth / Math.max(1, width)),
    y: (y + depth) / (1 + 2 * depth / Math.max(1, height)) };
}

export function planeTransform(width, height, depth = 0) {
  return `matrix(${1 + 2 * depth / Math.max(1, width)},0,0,${1 + 2 * depth / Math.max(1, height)},${-depth},${-depth})`;
}

export function iconPoint(x, y, width, height, bodySize, growth = 1, enabled = true, key = "") {
  if (!enabled) return { x, y };
  const nx = 2 * x / Math.max(1, width) - 1, ny = 2 * y / Math.max(1, height) - 1;
  const norm = Math.max(1, Math.hypot(nx, ny));
  const amount = Math.max(0, bodySize) * (PARALLAX.icon * iconDepth(key) + PARALLAX.hover * (Math.max(1, growth) - 1));
  return { x: x + nx / norm * amount, y: y + ny / norm * amount };
}
