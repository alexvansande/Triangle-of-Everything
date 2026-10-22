import frames from './space-art-frames.json' with {type:'json'};
// Comparison treatment for diffuse light, not solid stellar/planetary bodies.
export const SPACE_ART_BRIGHTNESS = 1.05;
// Feather only the outer 14% on each axis: a circular crop would cut long tails.
const stops = '<stop offset="0" stop-color="white" stop-opacity="0"/><stop offset=".06" stop-color="white" stop-opacity=".3"/><stop offset=".14" stop-color="white"/><stop offset=".86" stop-color="white"/><stop offset=".94" stop-color="white" stop-opacity=".3"/><stop offset="1" stop-color="white" stop-opacity="0"/>';
export const SPACE_ART_DEFS = `
<radialGradient id="space-core-gradient"><stop offset="0" stop-color="black" stop-opacity=".35"/><stop offset=".5" stop-color="black" stop-opacity=".15"/><stop offset="1" stop-color="black" stop-opacity="0"/></radialGradient>
<linearGradient id="space-edge-x" x1="0%" x2="100%">${stops}</linearGradient>
<linearGradient id="space-edge-y" x1="0%" x2="0%" y1="0%" y2="100%">${stops}</linearGradient>
<mask id="space-edge-x-mask" maskUnits="objectBoundingBox" maskContentUnits="objectBoundingBox" x="0" y="0" width="1" height="1"><rect width="1" height="1" fill="url(#space-edge-x)"/></mask>
<mask id="space-edge-mask" maskUnits="objectBoundingBox" maskContentUnits="objectBoundingBox" x="0" y="0" width="1" height="1"><rect width="1" height="1" fill="url(#space-edge-y)" mask="url(#space-edge-x-mask)"/></mask>`+
Object.entries(frames).map(([slug,f])=>`<mask id="space-edge-${slug}" maskUnits="objectBoundingBox" maskContentUnits="objectBoundingBox" x="0" y="0" width="1" height="1"><rect x="${f.x}" y="${f.y}" width="${f.w}" height="${f.h}" fill="url(#space-edge-y)" mask="url(#space-edge-x-mask)"/></mask>`).join('');

export function spaceEdgeMask(slug) {return `url(#${frames[slug]?'space-edge-'+slug:'space-edge-mask'})`}
export function spaceEdgeCss(slug) {
  const f=frames[slug]||{x:0,y:0,w:1,h:1};
  const gradient=(direction,start,length)=>`linear-gradient(${direction},transparent 0%,${[[0,0],[.06,.3],[.14,1],[.86,1],[.94,.3],[1,0]].map(([t,a])=>`rgba(0,0,0,${a}) ${(start+t*length)*100}%`).join(',')},transparent 100%)`;
  return gradient('to right',f.x,f.w)+','+gradient('to bottom',f.y,f.h);
}

export function spaceCoreGeometry(slug,x,y,size,growth=1) {
  const comet=slug==='halleys-comet';
  return {cx:x+(comet?-.26:0)*size*growth,cy:y,r:size*growth*(comet?.20:.28)};
}
export function isDiffuseSpaceArt(cat,slug='') {
  // The universe illustration is a defined sphere, not a diffuse photograph:
  // rectangular edge feathering erases its circular rim and makes it look square.
  if(slug.includes('void')||slug==='heat-death'||slug==='stellar-nursery'||slug==='observable-universe')return false;
  return cat==='galaxy'||cat==='largescale'||[
    'halleys-comet','hale-bopp','planetary-nebula',
    'supernova-remnant','nebulae','ngc-7538','bubble-nebula','proto-pn',
  ].includes(slug);
}
