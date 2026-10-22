// Fractions of the full icon canvas, measured around the dark central regions.
// These describe an illustration's apparent shadow, not an event-horizon radius.
export const BLACK_HOLE_FRAMES = Object.freeze({
  'stellar-bh': {cx:.49, cy:.45, r:.17},
  'sgr-a': {cx:.51, cy:.47, r:.135},
  'm87': {cx:.49, cy:.40, r:.17},
  'ton-618': {cx:.50, cy:.445, r:.08},
});
// Keep the full luminous artwork modest; core matching alone over-enlarges disks.
export const BLACK_HOLE_SIZE_MULT = Object.fromEntries(
  Object.keys(BLACK_HOLE_FRAMES).map(slug=>[slug,1.45])
);
// Preserve the inner ring, gently taper the extended gas to transparent at edges.
export const BLACK_HOLE_MASK_DEFS = `
<radialGradient id="black-hole-fade"><stop offset="0" stop-color="white"/><stop offset=".45" stop-color="white"/><stop offset=".65" stop-color="white" stop-opacity=".85"/><stop offset=".82" stop-color="white" stop-opacity=".35"/><stop offset="1" stop-color="white" stop-opacity="0"/></radialGradient>
<mask id="black-hole-edge" maskUnits="objectBoundingBox" maskContentUnits="objectBoundingBox" x="0" y="0" width="1" height="1"><rect width="1" height="1" fill="url(#black-hole-fade)"/></mask>`;
export const blackHoleMask = slug => BLACK_HOLE_FRAMES[slug] ? 'url(#black-hole-edge)' : null;
