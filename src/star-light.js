import {BLACK_HOLE_FRAMES} from './black-hole-frames.js';
import frames from './star-body-frames.json' with { type: 'json' };

// The red-dwarf artwork highlights this catalogue star rather than the generic point.
frames['toi-700'] = frames['red-dwarf'];

// Measured visible disc centers/radii, excluding flares and transparent halos.
export const STAR_BODY_FRAMES = frames;
// Screen-blended spheres can use an aligned opaque backing without emitting light.
export const SHADOWED_SCREEN_SPHERES = new Set(['observable-universe']);
const nonLuminousFrames = {
  'observable-universe': {cx:0.50159490,cy:0.49202552,r:0.47567783},
};
export const BROWN_DWARFS = new Set(['y-brown-dwarf','t-brown-dwarf','l-brown-dwarf']);
const BROWN_LIGHTS = {
  'y-brown-dwarf': {shadow:1,opacity:.055,spread:1.9,color:'#ff6438'},
  't-brown-dwarf': {shadow:.65,opacity:.16,spread:2.5,color:'#ff8a46'},
  'l-brown-dwarf': {shadow:.35,opacity:.25,spread:2.9,color:'#ffb262'},
};
export function stellarLightProfile(slug,logM=33.3) {
  if(BROWN_LIGHTS[slug])return BROWN_LIGHTS[slug];
  // A bounded visual mass cue, not a physical luminosity calculation.
  const mass=Number.isFinite(logM)?logM:33.3;
  return {shadow:0,opacity:Math.max(.26,Math.min(.62,.40+.11*(mass-33.3))),
    spread:Math.max(2.7,Math.min(3.65,3.1+.25*(mass-33.3)))};
}
export function starBodyGeometry(slug, x, y, size, growth=1) {
  const frame=frames[slug]||BLACK_HOLE_FRAMES[slug]||nonLuminousFrames[slug];
  if(!frame)return null;
  return {cx:x+(frame.cx-.5)*size*growth,cy:y+(frame.cy-.5)*size*growth,r:frame.r*size*growth};
}
export function starWallLight({sx,sy,r,slug,logM},growth=1) {
  const frame=frames[slug]||{cx:.5,cy:.5};
  const spread=1+1.1*(Math.max(1,growth)-1);
  const profile=stellarLightProfile(slug,logM);
  return {cx:sx+(frame.cx-.5)*2*r,cy:sy+(frame.cy-.5)*2*r,
    rx:r*profile.spread*spread,ry:r*profile.spread*spread,transform:null,
    opacity:profile.opacity/(spread*spread)};
}
