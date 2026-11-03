// Derive an edge-free photographic template from the existing observatory M33
// image. Its flyby placement is illustrative, not M33's catalogue position.
import sharp from 'sharp';
const root=new URL('../video/powers-of-ten/galaxies/',import.meta.url);
const {data,info}=await sharp(new URL('m33.jpg',root).pathname).ensureAlpha().raw().toBuffer({resolveWithObject:true});
for(let y=0;y<info.height;y++)for(let x=0;x<info.width;x++){
 const i=4*(y*info.width+x),r=Math.hypot((x/info.width-.5)/.49,(y/info.height-.5)/.47),t=Math.max(0,Math.min(1,(r-.55)/.45));
 for(let c=0;c<3;c++)data[i+c]=Math.max(0,data[i+c]-10);
 data[i+3]=Math.round(255*(1-t*t*(3-2*t)));
}
await sharp(data,{raw:info}).png().toFile(new URL('m33-flyby.png',root).pathname);
