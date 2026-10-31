import {nuclearPieces} from './powers-of-ten-nuclear-pieces.mjs';
import sharp from 'sharp';
import fs from 'node:fs/promises';
const root=new URL('../video/powers-of-ten/generated/canopy-test/micro/',import.meta.url),dir=new URL('anatomy-v9/',root),n=1254;
const path=f=>new URL(f,dir).pathname;
// Matched 3x pyramid, metre dimensions and one common axis.
export const spans=Array.from({length:8},(_,i)=>12e-6/3**i);
async function fade(input,size){const a=Buffer.alloc(size*size*4,255);for(let y=0;y<size;y++)for(let x=0;x<size;x++){const t=Math.min(1,Math.min(x+.5,y+.5,size-x-.5,size-y-.5)/(size*.22));a[(y*size+x)*4+3]=Math.round(255*t*t*(3-2*t))}return sharp(input).resize(size,size).ensureAlpha().composite([{input:a,raw:{width:size,height:size,channels:4},blend:'dest-in'}]).png().toBuffer()}
const rawNames=['cell','nucleus',null,'chromatin','chromatin-bridge','nucleosomes',null,'dna-matched'];
const bases=[];
for(let i=0;i<rawNames.length;i++){
 if(rawNames[i])bases[i]=await sharp(path(rawNames[i]+'-raw.png')).resize(n,n).ensureAlpha().png().toBuffer();
 else bases[i]=await sharp(bases[i-1]).extract({left:418,top:418,width:418,height:418}).resize(n,n).png().toBuffer();
}
// Register generator drift against the SVG design: body about8µm and nucleus2µm.
const cell=await sharp(path('cell-raw.png')).resize(874,874).png().toBuffer();
bases[0]=await sharp({create:{width:n,height:n,channels:4,background:'#0000'}}).composite([{input:cell,left:145,top:185}]).png().toBuffer();
bases[1]=await sharp(path('nucleus-raw.png')).resize(1065,1065).extend({left:62,right:127,top:98,bottom:91,extendWith:'mirror'}).png().toBuffer();
// Rebuild intermediate crops from the registered source.
bases[2]=await sharp(bases[1]).extract({left:418,top:418,width:418,height:418}).resize(n,n).png().toBuffer();
// Finest DNA is detail enhancement of the exact 1/9 central crop of the
// nucleosome source. It already has the correct position, scale and twist.
// Carry a real off-axis cytoplasmic ribosome from the same close-up.
const rib=await sharp(path('ribosome-raw.png')).resize(13,13).png().toBuffer();
bases[1]=await sharp(bases[1]).composite([{input:rib,left:940,top:720}]).png().toBuffer();
const depthPath=path('chromatin-depth-v1/');
const hasDepth=await fs.access(depthPath+'foreground-raw.png').then(()=>true,()=>false);
let child=bases[7];await fs.writeFile(path('level-7.png'),child);
for(let i=6;i>=0;i--){
 if(i===3&&hasDepth){
  // The child's exact finished centre belongs to the rear plane. All coarse
  // parents are derived from the same composite, never an independent image.
  const back=await sharp(depthPath+'background-raw.png').resize(n,n).ensureAlpha().composite([{input:await fade(child,418),left:418,top:418}]).png().toBuffer();
  const front=await sharp(depthPath+'foreground-raw.png').resize(n,n).ensureAlpha().png().toBuffer();
  child=await sharp(back).composite([{input:front}]).png().toBuffer();
  await fs.writeFile(depthPath+'background.png',back);await fs.writeFile(depthPath+'foreground.png',front);await fs.writeFile(depthPath+'flat.png',child);
 }else child=await sharp(bases[i]).composite([{input:await fade(child,418),left:418,top:418}]).png().toBuffer();
 await fs.writeFile(path(`level-${i}.png`),child);
}
// New hero has a 12µm source square. Its fixed camera axis is the square centre.
await fs.writeFile(new URL('pollen-v4/amoeba-inner.png',root),child);
await fs.writeFile(path('scene.json'),JSON.stringify({frameSpans_m:spans,axis:[627,627],body_diameter_m:8e-6,body_size_status:'Provisional illustrative small amoeba; not species validated.',nucleus_diameter_m:2e-6,nucleus_centre_m:[-.5e-6,0],nucleolus_diameter_m:.7e-6,nucleosome_diameter_m:11e-9,DNA_diameter_m:2e-9,DNA_pitch_m:3.4e-9,ribosome_diameter_m:25e-9,ribosome_view_frame_m:40e-9,note:'Sharp matched composites. Molecular images are illustrative reconstructions with approximate generated geometry, not experimental density maps. DNA morphology is generated, not an atomically validated coordinate model.'},null,2));
await nuclearPieces({path,bases,fade,n});
console.log('Matched cell → nucleus → chromatin → nucleosome → DNA, fixed optical axis.');
