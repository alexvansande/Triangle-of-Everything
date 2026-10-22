// Artistic mass-ordered palette, not a physical temperature measurement.
// Applied at display time so original EHT observations remain intact.
export const BLACK_HOLE_PALETTE = Object.freeze({
  'stellar-bh': { label: 'Warm copper', filter: 'hue-rotate(-14deg) saturate(0.88)' },
  'sgr-a': { label: 'Amber gold', filter: 'hue-rotate(8deg) saturate(0.78)' },
  'm87': { label: 'Cool ivory blue', filter: 'hue-rotate(170deg) saturate(0.45)' },
  'ton-618': { label: 'Soft blue', filter: 'hue-rotate(185deg) saturate(0.65)' },
});
export const blackHoleFilter = slug => BLACK_HOLE_PALETTE[slug]?.filter || '';
