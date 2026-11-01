// One registered world scene: actual Hopf H field + molecular fragment + DNA.
// Source alpha planes are shared by runtime and all wider flat parents.
import sharp from 'sharp';
import {readFile,writeFile} from 'node:fs/promises';
import {HYDROGEN_SPAN,PAIR_SPAN,DNA_SPAN} from '../tools/powers-of-ten/atomic-bridge-geometry.js';
const root=new URL('../video/powers-of-ten/generated/atomic-bridge-v1/',import.meta.url),path=f=>new URL(f,root).pathname,n=1254;
// FINAL_FS emits premultiplied light, with alpha=max(R,G,B). The capture was
// over known RGB(3,2,5): solve that matte exactly (to8-bit rounding), retaining
// the code renderer's genuine transparency rather than a black image square.
const {data}=await sharp(path('hydrogen-source.png')).ensureAlpha().raw().toBuffer({resolveWithObject:true}),bg=[3,2,5];
for(let i=0;i<data.length;i+=4){let a=0;for(let c=0;c<3;c++)a=Math.max(a,(data[i+c]-bg[c])/(255-bg[c]));a=Math.max(0,Math.min(1,a));for(let c=0;c<3;c++)data[i+c]=a?Math.max(0,Math.min(255,Math.round((data[i+c]-(1-a)*bg[c])/a))):0;data[i+3]=Math.round(255*a);}
const hydrogen=await sharp(data,{raw:{width:n,height:n,channels:4}}).png().toBuffer();await writeFile(path('hydrogen.png'),hydrogen);
const base=await sharp(path('basepair-raw.png')).resize(n,n).ensureAlpha().png().toBuffer();await writeFile(path('basepair.png'),base);
const h418=await sharp(hydrogen).resize(418,418).png().toBuffer();const baseFlat=await sharp(base).composite([{input:h418,left:418,top:418}]).png().toBuffer();await writeFile(path('basepair-flat.png'),baseFlat);
// The exact centred molecular child replaces the central rung. Clear its
// support before composing, so semi-transparent atoms cannot be drawn twice.
const {data:dna}=await sharp(path('dna-registered-raw.png')).resize(n,n).ensureAlpha().raw().toBuffer({resolveWithObject:true});
const child=await sharp(baseFlat).resize(418,418).png().toBuffer();
const mask=await sharp(child).ensureAlpha().raw().toBuffer();
for(let y=0;y<418;y++)for(let x=0;x<418;x++){
 const i=((y+418)*n+x+418)*4,a=mask[(y*418+x)*4+3]/255,t=Math.max(0,Math.min(1,(a-.01)/.11)),w=t*t*(3-2*t);dna[i+3]=Math.round(dna[i+3]*(1-w));
}
// Feather only the outer handoff; the parent removes this exact support.
for(let y=0;y<n;y++)for(let x=0;x<n;x++){
 const t=Math.min(1,Math.min(x+.5,y+.5,n-x-.5,n-y-.5)/(n*.22)),w=t*t*(3-2*t);dna[(y*n+x)*4+3]=Math.round(dna[(y*n+x)*4+3]*w);
}
const carrier=await sharp(dna,{raw:{width:n,height:n,channels:4}}).png().toBuffer();await writeFile(path('dna-carrier.png'),carrier);
const flat=await sharp(carrier).composite([{input:child,left:418,top:418}]).png().toBuffer();await writeFile(path('dna-flat.png'),flat);
await writeFile(path('scene.json'),JSON.stringify({version:1,native:[n,n],spans_m:{hydrogen:HYDROGEN_SPAN,basepair:PAIR_SPAN,dna:DNA_SPAN},axis:[627,627],ratio:3,target:'Thymine N3-bound hydrogen in an adenine–thymine base-pair fragment',parents:'dna-flat is dna-carrier + centred418px basepair-flat; basepair-flat is basepair + centred418px actual Hopf hydrogen. Runtime uses the same separate foreground planes.',live_handoff_log10_m:[-9.65,-9.2],frozen_snapshot_time:3,limitation:'Atomic H uses the particle explorer free-atom1s density/Hopf fiber depiction. Molecular surfaces are illustrative reconstructions guided by the registered3DNA fragment, not a bonded-electron calculation. Proton/quark rendering stays live and unchanged.'},null,2)+'\n');
console.log('Matched actual Hopf cloud → A–T fragment → DNA:',HYDROGEN_SPAN,PAIR_SPAN,DNA_SPAN);
