// Registered transparent refinements. Child composites are the actual runtime
// pieces, never independently generated approximations of the smaller view.
import sharp from 'sharp';
import {readFile,writeFile,access} from 'node:fs/promises';
const root=new URL('../video/powers-of-ten/generated/guanine-bridge-v2/',import.meta.url),p=f=>new URL(f,root).pathname,n=1254;
const smooth=t=>{t=Math.max(0,Math.min(1,t));return t*t*(3-2*t)};
export async function assemble(name,childName,ratio=3){
 const child=await sharp(p(childName+'-flat.png')).resize(Math.round(n/ratio),Math.round(n/ratio)).ensureAlpha().png().toBuffer(),size=Math.round(n/ratio),left=Math.floor((n-size)/2),mask=await sharp(child).raw().toBuffer();
 const {data}=await sharp(p(name+'-raw.png')).resize(n,n).ensureAlpha().raw().toBuffer({resolveWithObject:true});
 for(let y=0;y<size;y++)for(let x=0;x<size;x++){
  const a=mask[(y*size+x)*4+3]/255,w=smooth((a-.005)/.12);data[((y+left)*n+x+left)*4+3]=Math.round(data[((y+left)*n+x+left)*4+3]*(1-w));
 }
 const carrier=await sharp(data,{raw:{width:n,height:n,channels:4}}).png().toBuffer();await writeFile(p(name+'-carrier.png'),carrier);
 await sharp(carrier).composite([{input:child,left,top:left}]).png().toFile(p(name+'-flat.png'));
}
if(await access(p('dna-raw.png')).then(()=>true,()=>false))await assemble('dna','guanine');
if(await access(p('hero-raw.png')).then(()=>true,()=>false))await assemble('hero','dna',9);
if(await access(p('field-raw.png')).then(()=>true,()=>false))await assemble('field','hero',9);
