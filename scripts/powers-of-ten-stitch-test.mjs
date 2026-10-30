// Stitch the eight overlapped L1 test tiles around the finer foliage plate.
import sharp from 'sharp';
import { mkdir, writeFile, access } from 'node:fs/promises';
import { resolve } from 'node:path';
const root = resolve(import.meta.dirname, '..');
const dir = `${root}/video/powers-of-ten/generated/canopy-test`;
const positions = [['NW',0,0],['N',1,0],['NE',2,0],['W',0,1],['C',1,1],['E',2,1],['SW',0,2],['S',1,2],['SE',2,2]];
const n=3072, core=1024, pad=128, size=1280;
const sum=new Float32Array(n*n*3), weights=new Float32Array(n*n);
for (const [name,col,row] of positions) {
  const path=name==='C'?`${dir}/tiles/L2-context.png`:`${dir}/tiles/${name}.png`;
  const raw=await sharp(path).resize(size,size).removeAlpha().toColourspace('srgb').raw().toBuffer();
  const fade=x=>Math.min(1,(x+0.5)/(2*pad),(size-x-0.5)/(2*pad));
  for(let y=0;y<size;y++) {
    const yy=row*core+y-pad; if(yy<0||yy>=n)continue;
    for(let x=0;x<size;x++) {
      const xx=col*core+x-pad; if(xx<0||xx>=n)continue;
      const w=fade(x)*fade(y), j=yy*n+xx, i=(y*size+x)*3;
      weights[j]+=w;
      for(let c=0;c<3;c++)sum[j*3+c]+=raw[i+c]*w;
    }
  }
}
const out=Buffer.alloc(n*n*3);
for(let i=0;i<n*n;i++)for(let c=0;c<3;c++)out[i*3+c]=Math.round(sum[i*3+c]/weights[i]);
await mkdir(`${dir}/plates`,{recursive:true});
await sharp(out,{raw:{width:n,height:n,channels:3}}).png().toFile(`${dir}/plates/L1.png`);
await sharp(`${dir}/references/L0-photo.png`).png().toFile(`${dir}/plates/L0.png`);
const plates=[{s:1.6,file:'L0.png'},{s:1.6-Math.log10(3),file:'L1.png'}];
for(const [name,s] of [['40m',1.6],['120m',1.6+Math.log10(3)]]){
  try{await access(`${dir}/intermediates/${name}.png`)}catch{continue}
  const old=plates.findIndex(p=>p.s===s);if(old>=0)plates.splice(old,1);
  plates.push({s,file:`../intermediates/${name}.png`});
}
for(const [k,name] of [[2,'4.42m'],[3,'1.47m'],[4,'49.1cm'],[5,'16.4cm'],[6,'5.46cm']]){
  try{await access(`${dir}/ladybug-chain/level-${name}.png`)}catch{continue}
  plates.push({s:1.6-k*Math.log10(3),file:`../ladybug-chain/level-${name}.png`});
}
try{
 await access(`${dir}/ladybug-chain/level-5.46cm-dew-v1.png`);
 plates.find(p=>p.file.endsWith('level-5.46cm.png')).file='../ladybug-chain/level-5.46cm-dew-v1.png';
 for(const [k,name] of [[7,'18.2mm'],[8,'6.07mm'],[9,'2.02mm']]){
  await access(`${dir}/ladybug-chain/level-${name}-dew-v1.png`);
  plates.push({s:1.6-k*Math.log10(3),file:`../ladybug-chain/level-${name}-dew-v1.png`,x:-0.0024387,y:-0.001001});
 }
}catch(e){if(e.code!=='ENOENT')throw e}
// Green-only foliage revisions preserve original assets for comparison.
for(const p of plates){
 const names={'level-1.47m.png':'level-1.47m-green-v1.png','level-49.1cm.png':'level-49.1cm-green-v1.png','level-16.4cm.png':'level-16.4cm-green-v1.png','level-5.46cm-dew-v1.png':'level-5.46cm-dew-v1-green-v1.png'};
 const name=p.file.split('/').pop(),replacement=names[name];
 if(replacement){try{await access(`${dir}/ladybug-chain/${replacement}`);p.file=`../ladybug-chain/${replacement}`}catch{}}
}
await writeFile(`${dir}/plates/manifest.json`,JSON.stringify({plates:plates.sort((a,b)=>b.s-a.s)},null,2));
console.log(`Stitched ${dir}/plates/L1.png`);
