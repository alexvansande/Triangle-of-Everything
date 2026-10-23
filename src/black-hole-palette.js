// Artistic mass-ordered palette, not a physical temperature measurement: the
// heavier the black hole, the hotter (bluer, then violet) its light. Applied at
// display time, so the original EHT observations stay intact.
//
// Each is a gradient map: the picture's brightness picks a colour along its
// ramp (black shadow → glow → hottest light). Icon and photo go through the
// same ramp, so a dive onto Sgr A* or M87* doesn't change hue as the photo
// fades in over the picture.
export const BLACK_HOLE_PALETTE = Object.freeze({
  'stellar-bh': { label: 'Red and orange', ramp: ['#000000', '#3a0300', '#a81a08', '#f0561c', '#ff9a3c', '#ffe0b0'] },
  'sgr-a': { label: 'Orange and yellow', ramp: ['#000000', '#3a1200', '#c45210', '#f59a1e', '#ffd23c', '#fff4c4'] },
  'm87': { label: 'Blue and radioactive green', ramp: ['#000000', '#020c3a', '#0a48d8', '#18a8e8', '#5cff6a', '#e6ffd0'] },
  'ton-618': { label: 'Ultraviolet', ramp: ['#000000', '#12002e', '#4a10c0', '#8a2cff', '#d65cff', '#f8e4ff'] },
});

export const blackHoleFilter = slug => BLACK_HOLE_PALETTE[slug] ? `url(#bh-tone-${slug})` : '';

/** Put the palette's filters in an SVG <defs> (a d3 selection); CSS filters
 *  anywhere on the page (the chart's pictures, the dives' photos) use them. */
export function installBlackHoleTones(defs) {
  const channel = (hex, k) => parseInt(hex.slice(1 + 2 * k, 3 + 2 * k), 16) / 255;
  for (const [slug, { ramp }] of Object.entries(BLACK_HOLE_PALETTE)) {
    const f = defs.append('filter').attr('id', `bh-tone-${slug}`).attr('color-interpolation-filters', 'sRGB')
      .attr('x', 0).attr('y', 0).attr('width', 1).attr('height', 1);
    // brightness into every channel (alpha kept), then each channel along the ramp
    f.append('feColorMatrix').attr('type', 'matrix')
      .attr('values', '0.2126 0.7152 0.0722 0 0  0.2126 0.7152 0.0722 0 0  0.2126 0.7152 0.0722 0 0  0 0 0 1 0');
    const ct = f.append('feComponentTransfer');
    ['R', 'G', 'B'].forEach((c, k) => ct.append(`feFunc${c}`).attr('type', 'table')
      .attr('tableValues', ramp.map(h => channel(h, k).toFixed(3)).join(' ')));
  }
}
