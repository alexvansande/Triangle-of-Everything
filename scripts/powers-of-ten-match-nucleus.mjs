import sharp from 'sharp';
import {writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
const root=resolve(import.meta.dirname,'../video/powers-of-ten/generated/canopy-test/micro'),dir=root+'/nucleus-v6';
export async function feather(input,n){const a=Buffer.alloc(n*n*4,255);for(let y=0;y<n;y++)for(let x=0;x<n;x++){const t=Math.min(1,Math.min(x+.5,y+.5,n-x-.5,n-y-.5)/(n*.25));a[(y*n+x)*4+3]=Math.round(255*t*t*(3-2*t))}return sharp(input).resize(n,n).ensureAlpha().composite([{input:a,raw:{width:n,height:n,channels:4},blend:'dest-in'}]).png().toBuffer()}
let child=dir+'/nucleosomes-raw.png';
await sharp(child).resize(1254,1254).png().toFile(dir+'/74nm.png');child=dir+'/74nm.png';
for(const [name,raw] of [['222nm','beads'],['667nm','chromatin']]){const patch=await feather(child,418),file=dir+'/'+name+'.png';await sharp(dir+'/'+raw+'-raw.png').resize(1254,1254).composite([{input:patch,left:418,top:418}]).png().toFile(file);child=file}
await sharp(dir+'/background-raw.png').resize(1254,1254).composite([{input:await feather(child,418),left:418,top:418}]).png().toFile(dir+'/background.png');
await sharp(dir+'/envelope-raw.png').resize(1004,1004).extend({left:125,right:125,top:125,bottom:125,background:'#0000'}).png().toFile(dir+'/envelope.png');
const flat=await sharp(dir+'/background.png').composite([{input:dir+'/envelope.png'}]).png().toBuffer();await writeFile(dir+'/2um.png',flat);
// The current world axis passes through source pixel649.5,617.5. Keep it fixed.
const patch=await feather(flat,288);
await sharp(root+'/pollen-v4/amoeba.png').composite([{input:patch,left:506,top:474}]).png().toFile(root+'/pollen-v4/amoeba-inner.png');
await writeFile(dir+'/scene.json',JSON.stringify({spans_m:[2e-6,2e-6/3,2e-6/9,2e-6/27],source_target_pixels:[649.5,617.5],amoeba_body_m:8e-6,nuclear_envelope_diameter_m:1.4e-6,depth_start_m:1.3e-6,minimum_frame_m:2e-6/27,note:'Illustrative spatial reconstruction below optical resolution. Native image scales approximate molecular dimensions; matched central patches preserve spatial continuity. Future target is central linker DNA toward Hopf atom.'},null,2));
console.log('Matched nucleus chain into the existing fixed-axis amoeba.');
