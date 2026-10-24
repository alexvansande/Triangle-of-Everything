// Register the custom overhead plan shadow with the selected elevated icon.
import fs from 'node:fs/promises';
import sharp from 'sharp';
const dir='content/icons/studies/stonehenge';
const settings={mode:'generated',source:'imagegen',registered:true,anchorBase:false,flipY:false,opacity:0.55,generatedScale:0.3333,generatedBlur:2,distance:0,x:44,y:54,reviewed:true,generator:'stonehenge-overhead-shadow-v2',stretchSE:1.65,blurNear:2,blurFar:18,note:'NW light projects the broken circular plan, stretched southeast with progressively softer edges. Preserve during scripted shadow batches.'};
const layer=await sharp(dir+'/shadow-raw.png').trim().resize(256,256,{fit:'contain',background:'#0000'}).blur(2).ensureAlpha().linear([1,1,1,settings.opacity],[0,0,0,0]).png().toBuffer();
const base=await sharp({create:{width:768,height:768,channels:4,background:'#0000'}}).composite([{input:layer,left:Math.round((768-256)/2+settings.x),top:Math.round((768-256)/2+settings.y)}]).png().toBuffer();
// Stretch along the NW–SE diagonal, keeping the near edge anchored.
const size=768, anchor=310, stretch=settings.stretchSE;
const input=await sharp(base).raw().toBuffer(), pixels=Buffer.alloc(size*size*4);
for(let y=0;y<size;y++)for(let x=0;x<size;x++){
  const dx=x-anchor,dy=y-anchor,along=(dx+dy)/2/stretch,across=(dx-dy)/2;
  const sx=anchor+along+across,sy=anchor+along-across;
  const ix=Math.floor(sx),iy=Math.floor(sy),fx=sx-ix,fy=sy-iy;
  if(ix<0||iy<0||ix>=size-1||iy>=size-1)continue;
  for(let c=0;c<4;c++)pixels[(y*size+x)*4+c]=Math.round(
    input[(iy*size+ix)*4+c]*(1-fx)*(1-fy)+input[(iy*size+ix+1)*4+c]*fx*(1-fy)+
    input[((iy+1)*size+ix)*4+c]*(1-fx)*fy+input[((iy+1)*size+ix+1)*4+c]*fx*fy);
}
const levels=await Promise.all([2,7,12,18].map(sigma=>sharp(pixels,{raw:{width:size,height:size,channels:4}}).blur(sigma).raw().toBuffer()));
const mixed=Buffer.alloc(pixels.length);
for(let y=0;y<size;y++)for(let x=0;x<size;x++){
 const t=Math.max(0,Math.min(1,(x+y-640)/580))*3,lo=Math.floor(t),hi=Math.min(3,lo+1),f=t-lo;
 for(let c=0;c<4;c++){const i=(y*size+x)*4+c;mixed[i]=Math.round(levels[lo][i]*(1-f)+levels[hi][i]*f);}
}
const master=await sharp(mixed,{raw:{width:size,height:size,channels:4}}).png().toBuffer();
await fs.writeFile(dir+'/shadow-registered.png',master);
await sharp(master).resize(256,256).webp({quality:90,alphaQuality:100}).toFile('content/icons/shadows/stonehenge.webp');
const p='content/icons/shadows/overrides.json',o=JSON.parse(await fs.readFile(p));o.stonehenge={...settings,updated:new Date().toISOString()};await fs.writeFile(p,JSON.stringify(o,null,2)+'\n');
