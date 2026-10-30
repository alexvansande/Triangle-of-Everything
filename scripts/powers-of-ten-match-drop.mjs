// Registered native planes, shared by the flattened parent and runtime scene.
import sharp from 'sharp';
import {writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
const root=resolve(import.meta.dirname,'../video/powers-of-ten/generated/canopy-test');
const dir=root+'/micro/layers-v3',n=1254,span=10**1.6/3**9;
const diameter=2*10**(-1.65)/100;
const cellWidth=Math.round(diameter/span*n*1536/1473);
const cellHeight=Math.round(cellWidth*1024/1536);
const cellLeft=Math.round(n/2-769/1536*cellWidth),cellTop=Math.round(n/2-508.5/1024*cellHeight);
const frontWidth=Math.round(.00116/span*n*1254/808);
const frontLeft=Math.round(n/2-679.5/1254*frontWidth),frontTop=Math.round(n/2-645/1254*frontWidth);
// Opacity belongs to the material, shared by flat and depth renderings.
const cell=await sharp(dir+'/amoeba.png').resize(cellWidth,cellHeight).ensureAlpha().raw().toBuffer({resolveWithObject:true});
for(let i=3;i<cell.data.length;i+=4)cell.data[i]=Math.round(cell.data[i]*.68);
const flat=await sharp(dir+'/shell.png').composite([
 {input:cell.data,raw:cell.info,left:cellLeft,top:cellTop},
 {input:await sharp(dir+'/reflections.png').resize(frontWidth,frontWidth).png().toBuffer(),left:frontLeft,top:frontTop}
]).png().toBuffer();
await writeFile(dir+'/flat.png',flat);
const scene={span,diameter_m:diameter,droplet_diameter_m:.00116,n,cell:{width:cellWidth,height:cellHeight,left:cellLeft,top:cellTop,opacity:.68,body_pixels:1473,source_width:1536},front:{width:frontWidth,height:frontWidth,left:frontLeft,top:frontTop},handoff_m:[.0018,.0015],depth_start_m:.0013};
await writeFile(dir+'/scene.json',JSON.stringify(scene,null,2));
console.log(scene);
