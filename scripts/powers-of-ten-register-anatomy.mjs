import fs from 'node:fs/promises';
import sharp from 'sharp';
const dir=new URL('../video/powers-of-ten/generated/canopy-test/micro/anatomy-layout-v8/',import.meta.url);
const raw=new URL('render-raw.png',dir).pathname;
const data=async box=>'data:image/png;base64,'+(await sharp(raw).extract(box).png().toBuffer()).toString('base64');
let s=await fs.readFile(new URL('layout.svg',dir),'utf8');
const cytoplasm=await data({left:590,top:290,width:110,height:140});
const nucleus=await data({left:476,top:494,width:280,height:280});
const nucleolus=await data({left:568,top:587,width:95,height:95});
const food=await data({left:293,top:415,width:120,height:120});
const water=await data({left:818,top:680,width:140,height:140});
// Generated image is appearance only; final contours come exclusively from SVG.
const defs=`<pattern id="cyto-texture" width="1440" height="1440" patternUnits="userSpaceOnUse"><image href="${cytoplasm}" width="1440" height="1440"/></pattern>`;
s=s.replace('</defs>',defs+'</defs>');
s=s.replace(/(<g id="cytoplasm"[^>]*>)[\s\S]*?<\/g>/,`$1<rect width="1440" height="1440" fill="url(#cyto-texture)" opacity=".62"/></g>`);
let n=0;
const clipped=(image,x,y,w,h,shape)=>{let id=`texture-mask-${n++}`;return `<defs><clipPath id="${id}">${shape}</clipPath></defs><image href="${image}" x="${x}" y="${y}" width="${w}" height="${h}" preserveAspectRatio="none" clip-path="url(#${id})"/>`;};
for(const [i,x,y,r] of [[1,440,590,53],[2,890,630,44],[3,490,855,40]])s=s.replace(new RegExp(`<g id="food-vacuole-${i}">[\\s\\S]*?<\\/g>`),`<g id="food-vacuole-${i}">${clipped(food,x-r,y-r,r*2,r*2,`<circle cx="${x}" cy="${y}" r="${r}"/>`)}</g>`);
s=s.replace(/<g id="contractile-vacuole">[\s\S]*?<\/g>/,`<g id="contractile-vacuole">${clipped(water,833,763,124,124,'<circle cx="895" cy="825" r="62"/>')}</g>`);
const mito=await data({left:435,top:351,width:100,height:70});
for(const [i,x,y,a] of [[1,550,510,25],[2,830,500,-20],[3,975,735,45],[4,590,935,10],[5,370,745,80]])s=s.replace(new RegExp(`<g id="mitochondrion-${i}"[\\s\\S]*?<\\/g>`),`<g id="mitochondrion-${i}" transform="translate(${x} ${y}) rotate(${a})">${clipped(mito,-37,-20,74,40,'<ellipse rx="37" ry="20"/>')}</g>`);
s=s.replace(/<g id="chromatin"[\s\S]*?<\/g>/,`<g id="chromatin">${clipped(nucleus,544,604,232,232,'<circle cx="660" cy="720" r="116"/>')}</g>`);
// Restore the exact nucleolus boundary on top of the nuclear texture.
s=s.replace(/<g id="nucleolus">[\s\S]*?<\/g>/,`<g id="nucleolus">${clipped(nucleolus,618,678,84,84,'<circle cx="660" cy="720" r="42"/>')}</g>`);
await fs.writeFile(new URL('render-registered.svg',dir),s);
await sharp(Buffer.from(s)).png().toFile(new URL('render-registered.png',dir).pathname);
console.log('Registered SVG masks: nucleus (660,720), diameter 240; nucleolus diameter 84; target (720,720).');
