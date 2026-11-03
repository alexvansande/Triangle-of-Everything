// Expand the organism field while retaining native centre pixels and world scale.
import sharp from 'sharp';
import {resolve} from 'node:path';
const dir=resolve(import.meta.dirname,'../video/powers-of-ten/generated/canopy-test/micro/pollen-v4');
const n=1254,full=n*3;
const fine=await sharp(dir+'/water-life-raw.png').ensureAlpha().raw().toBuffer();
const wide=await sharp(dir+'/water-life-wide-raw.png').resize(full,full).ensureAlpha().raw().toBuffer();
const weight=(x,y,size,edge=.06)=>{const t=Math.min(1,Math.min(x+.5,y+.5,size-x-.5,size-y-.5)/(size*edge));return t*t*(3-2*t)};
// Crossfade actual alpha layers, clearing the expanded source under the exact
// centre, including its transparent gaps. This avoids doubling the organisms.
for(let y=0;y<n;y++)for(let x=0;x<n;x++){
 const i=(y*n+x)*4,j=((y+n)*full+x+n)*4,w=weight(x,y,n);
 const af=fine[i+3]/255*w,ab=wide[j+3]/255*(1-w),a=af+ab*(1-af);
 for(let k=0;k<3;k++)wide[j+k]=a?Math.round((fine[i+k]*af+wide[j+k]*ab*(1-af))/a):0;
 wide[j+3]=Math.round(a*255);
}
for(let y=0;y<full;y++)for(let x=0;x<full;x++)wide[(y*full+x)*4+3]=Math.round(wide[(y*full+x)*4+3]*weight(x,y,full,.18));
await sharp(wide,{raw:{width:full,height:full,channels:4}}).png().toFile(dir+'/water-life-wide.png');
console.log('Matched 720µm water field with original native 240µm centre.');
