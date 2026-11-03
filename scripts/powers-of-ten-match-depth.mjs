// Derive flat review plates from the exact two optical planes, not new scenes.
import sharp from 'sharp';
import {mkdir,readFile,writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
const dir=resolve(import.meta.dirname,'../video/powers-of-ten/generated/canopy-test');
const chain=dir+'/ladybug-chain',out=chain+'/matched';await mkdir(out,{recursive:true});
async function edge(image,n){
 const data=Buffer.alloc(n*n*4,255);
 for(let y=0;y<n;y++)for(let x=0;x<n;x++)data[(y*n+x)*4+3]=Math.round(255*Math.min(1,(x+.5)/(n*.045),(n-x-.5)/(n*.045))*Math.min(1,(y+.5)/(n*.045),(n-y-.5)/(n*.045)));
 return sharp(image).resize(n,n).ensureAlpha().composite([{input:data,raw:{width:n,height:n,channels:4},blend:'dest-in'}]).png().toBuffer();
}
// A 3× canvas retains the finest spray's original pixels in the central third.
// The wider foreground/background retain their original native detail.
const n=3762,third=n/3;
// Match the new dew close-ups inward-to-outward before assembling the leaf.
let detail=dir+'/micro/pollen-v4/flat.png';
for(const name of ['6.07mm','18.2mm']){
 const patch=await edge(detail,418),target=out+'/'+name+'.png';
 await sharp(chain+`/level-${name}-natural-v3.png`).resize(1254,1254).composite([{input:patch,left:418,top:418}]).png().toFile(target);detail=target;
}
const patch=await edge(detail,418);
const fineSource=await sharp(chain+'/foreground-dew-natural-v3.png').composite([{input:patch,left:361,top:396}]).png().toBuffer();
const fine=await edge(fineSource,third);
const foreground=await sharp(chain+'/foreground-16.4cm-v1.png').resize(n,n).composite([{input:fine,left:third,top:third}]).png().toBuffer();
await writeFile(out+'/foreground.png',foreground);
const stack=await sharp(chain+'/background-sharp-v2.png').resize(n,n).composite([{input:foreground}]).removeAlpha().png().toBuffer();
await sharp(stack).resize(1254,1254).png().toFile(out+'/16.4cm.png');
await sharp(stack).extract({left:third,top:third,width:third,height:third}).png().toFile(out+'/5.46cm.png');
// Rebuild every parent centre from the same child, preserving outer context.
let child=out+'/16.4cm.png';
for(const [name,original,size] of [
 ['49.1cm',chain+'/level-49.1cm-green-v1.png',1254],
 ['1.47m',chain+'/level-1.47m-green-v1.png',1254],
 ['4.42m',chain+'/level-4.42m.png',1254],
 ['13.27m',dir+'/plates/L1.png',3072],
 ['40m',dir+'/intermediates/40m.png',1254],
 ['120m',dir+'/intermediates/120m.png',1254],
]){
 const core=size/3,patch=await edge(child,core),target=out+'/'+name+'.png';
 if(name==='4.42m'){
  const canopy=dir+'/canopy-depth';
  const near=await sharp(canopy+'/near-v1.png').resize(n,n).composite([{input:await edge(child,third),left:third,top:third}]).png().toBuffer();
  await writeFile(canopy+'/near-matched.png',near);
  const stack=await sharp(canopy+'/back-v1.png').resize(n,n).composite([{input:await sharp(canopy+'/mid-v1.png').resize(n,n).toBuffer()},{input:near}]).png().toBuffer();
  await sharp(stack).resize(size,size).png().toFile(target);
 }else await sharp(original).resize(size,size).composite([{input:patch,left:core,top:core}]).png().toFile(target);
 child=target;
}
const manifest=JSON.parse(await readFile(dir+'/plates/manifest.json','utf8'));
const names=['120m','40m','13.27m','4.42m','1.47m','49.1cm','16.4cm','5.46cm'];
for(let i=0;i<8;i++)manifest.plates[i].file='../ladybug-chain/matched/'+names[i]+'.png';
for(let k=0;k<3;k++){
 const p=manifest.plates[8+k];p.file='../ladybug-chain/'+(k<2?'matched/':'')+['18.2mm.png','6.07mm.png','../micro/pollen-v4/flat.png'][k];
 p.x=(570/1254-.5)*(10**1.6/3**6);p.y=(605/1254-.5)*(10**1.6/3**6);
}
await writeFile(dir+'/plates/manifest.json',JSON.stringify(manifest,null,2));
console.log('Matched flat plates to the shared sharp background + foreground stack.');
