// Distances are in resting object diameters. Camera perspective and light
// projection are independent: only depth is shared between the two models.
export const WALL_SCENE = {
  observerDistance: 3,
  restingGap: 0.5,
  lightDistance: 8,
  lightSlope: 0.8,
};

export function wallShadowAtDepth(radius, depth, scene = WALL_SCENE) {
  const diameter = radius * 2;
  const gap = scene.restingGap * diameter;
  const light = scene.lightDistance * diameter;
  const z = Math.min(Math.max(0, depth), (light - gap) * 0.9);
  const magnification = (light - gap) / (light - gap - z);
  // Point-light projection on a stationary wall, relative to its resting position.
  const travel = scene.lightSlope * light *
    ((gap + z) / (light - gap - z) - gap / (light - gap));
  return {
    radius: radius * magnification,
    travel,
    opacity: 1 / (1 + 0.8 * z / diameter),
    blur: 0.06 * z,
  };
}

export function wallShadowState(radius, growth = 1, scene = WALL_SCENE) {
  // Invert perspective growth k = D / (D - z). UI magnification describes
  // the object's approach to the viewer; it does not scale the shadow directly.
  const depth = scene.observerDistance * radius * 2 * (1 - 1 / Math.max(1, growth));
  return wallShadowAtDepth(radius, depth, scene);
}

export const ROUND_SHADOW_OPACITY = 0.6;

export function wallShadowImageGeometry({ sx, sy, r, anchorBase, registered, round }, growth = 1) {
  const state = wallShadowState(r, growth);
  // Legacy base-anchored artwork already contains its registration offset.
  // Add wall separation, but do not apply the old texture offset a second time.
  const off = (registered ? 0 : (anchorBase ? 0.65 * r + 4 : 2 * r + 8) * 0.85) + state.travel;
  const size = 6 * state.radius;
  const south = anchorBase || registered ? 0 : 0.3 * r;
  return {
    x: sx + off * Math.SQRT1_2 - size / 2,
    y: sy + off * Math.SQRT1_2 + south - size / 2,
    width: size, height: size,
    opacity: (round ? ROUND_SHADOW_OPACITY : 0.85) * state.opacity, blur: state.blur,
  };
}
