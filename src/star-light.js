import frames from './star-body-frames.json' with { type: 'json' };

// Measured visible disc centers/radii, excluding flares and transparent halos.
export const STAR_BODY_FRAMES = frames;
export const BROWN_DWARFS = new Set(['y-brown-dwarf','t-brown-dwarf','l-brown-dwarf']);
export function starBodyGeometry(slug, x, y, size, growth=1) {
  const frame=frames[slug];
  if(!frame)return null;
  return {cx:x+(frame.cx-.5)*size*growth,cy:y+(frame.cy-.5)*size*growth,r:frame.r*size*growth};
}
export function starWallLight({sx,sy,r,slug},growth=1) {
  const frame=frames[slug]||{cx:.5,cy:.5};
  const spread=1+1.1*(Math.max(1,growth)-1);
  return {cx:sx+(frame.cx-.5)*2*r,cy:sy+(frame.cy-.5)*2*r,
    rx:r*2.7*spread,ry:r*2.7*spread,transform:null,
    opacity:.22/(spread*spread)};
}
