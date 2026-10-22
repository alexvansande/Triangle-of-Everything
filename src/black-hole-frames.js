// Fractions of the full icon canvas, measured around the dark central regions.
// These describe an illustration's apparent shadow, not an event-horizon radius.
export const BLACK_HOLE_FRAMES = Object.freeze({
  'stellar-bh': {cx:.49, cy:.45, r:.17},
  'sgr-a': {cx:.51, cy:.47, r:.135},
  'm87': {cx:.49, cy:.40, r:.17},
  'ton-618': {cx:.50, cy:.445, r:.08},
});
// Standard object body diameter is about 90% of its nominal icon box.
export const BLACK_HOLE_SIZE_MULT = Object.fromEntries(
  Object.entries(BLACK_HOLE_FRAMES).map(([slug,frame])=>[slug,.45/frame.r])
);
