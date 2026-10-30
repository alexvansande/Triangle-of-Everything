// Build the flat photographic parent from the same registered optical planes.
import sharp from 'sharp';
import {microSpecimens,microDust} from '../tools/powers-of-ten/canopy-micro-specimens.js';
import {writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
const root=resolve(import.meta.dirname,'../video/powers-of-ten/generated/canopy-test');
const dir=root+'/micro/pollen-v4',old=root+'/micro/layers-v3';
const n=1254,span=10**1.6/3**9,front={width:1116,height:1116,left:22,top:53};
const layers=[];
for(const p of [...microDust.map(d=>({...microSpecimens[0],...d,file:'pollen'})),...microSpecimens]){
 const width=Math.max(1,Math.round(p.diameter/p.bodyPixels/span*n*1254));
 const raw=await sharp(dir+'/'+p.file+'.png').resize(width,width).ensureAlpha().raw().toBuffer({resolveWithObject:true});
 for(let i=3;i<raw.data.length;i+=4)raw.data[i]=Math.round(raw.data[i]*p.opacity);
 const rotated=await sharp(raw.data,{raw:raw.info}).rotate((p.angle||0)*180/Math.PI,{background:'#0000'}).png().toBuffer({resolveWithObject:true});
 const cx=n/2+p.x/span*n+(627-p.center[0])*width/1254;
 const cy=n/2+p.y/span*n+(627-p.center[1])*width/1254;
 layers.push({input:rotated.data,left:Math.round(cx-rotated.info.width/2),top:Math.round(cy-rotated.info.height/2)});
}
const flat=await sharp(old+'/shell.png').composite([...layers,{input:await sharp(old+'/reflections.png').resize(front.width,front.height).png().toBuffer(),left:front.left,top:front.top}]).png().toBuffer();
await writeFile(dir+'/flat.png',flat);
await writeFile(dir+'/scene.json',JSON.stringify({span,n,droplet_diameter_m:.00116,specimens:microSpecimens,dust:microDust,front,handoff_m:[.0018,.0015],depth_start_m:.0013,review_stops_m:[180e-6,18e-6],minimum_frame_m:6e-6},null,2));
console.log('Matched pollen → small amoeba parent assembled.');
