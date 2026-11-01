import sharp from 'sharp';import {readFile,writeFile} from 'node:fs/promises';
const root=new URL('../video/powers-of-ten/generated/guanine-bridge-v2/',import.meta.url),p=f=>new URL(f,root).pathname,n=1254;
let state=2244;const rand=()=>{state=(1664525*state+1013904223)>>>0;return state/4294967296};
let svg=`<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${n}" height="${n}">`;
for(let chain=0;chain<40;chain++){
 let x=rand()*n,y=rand()*n,angle=rand()*6.28;const pts=[];
 for(let j=0;j<14;j++){pts.push([x,y,10+rand()*7]);angle+=(rand()-.5)*1.6;x+=Math.cos(angle)*40;y+=Math.sin(angle)*40;}
 svg+=`<path d="M${pts.map(([x,y])=>x+','+y).join(' L')}" fill="none" stroke="#5364c4" stroke-width="4"/>`;
 for(const[x,y,r]of pts)svg+=`<ellipse cx="${x}" cy="${y}" rx="${r}" ry="${r*.8}" fill="#a7b4d3" stroke="#787ee7" stroke-width="3"/>`;
}
const child=(await readFile(p('hero-flat.png'))).toString('base64');svg+=`<image x="557" y="557" width="140" height="140" xlink:href="data:image/png;base64,${child}"/></svg>`;
await writeFile(p('field-guide.svg'),svg);await sharp(Buffer.from(svg)).png().toFile(p('field-guide.png'));
