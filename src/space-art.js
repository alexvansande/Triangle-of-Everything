// Comparison treatment for diffuse light, not solid stellar/planetary bodies.
export const SPACE_ART_BRIGHTNESS = 1.25;
export function isDiffuseSpaceArt(cat,slug='') {
  if(slug.includes('void')||slug==='heat-death')return false;
  return cat==='galaxy'||cat==='largescale'||[
    'halleys-comet','hale-bopp','stellar-nursery','planetary-nebula',
    'supernova-remnant','nebulae','ngc-7538','bubble-nebula','proto-pn',
  ].includes(slug);
}
