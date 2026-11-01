import sharp from 'sharp';
import {writeFile,readFile} from 'node:fs/promises';
const root=new URL('../video/powers-of-ten/generated/guanine-bridge-v2/',import.meta.url),p=f=>new URL(f,root).pathname,n=1254,span=12e-6/3**7/1e-10;
const capture=JSON.parse(await readFile(p('capture.json'))),yaw=capture.yaw,pitch=capture.pitch,cp=Math.cos(pitch),sp=Math.sin(pitch),cy=Math.cos(yaw),sy=Math.sin(yaw);
const project=([x,y,z])=>[n/2+n/span*(cy*x-sy*z),n/2-n/span*(-sp*sy*x+cp*y-sp*cy*z)];
let svg=`<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${n}" height="${n}">`;
const pts=[];
for(let i=-8;i<=8;i++)for(const strand of [0,1]){
 const th=i*Math.PI/5+strand*155*Math.PI/180,z=i*3.38;
 const at=(r,offset=0)=>[r*Math.cos(th+offset),r*Math.sin(th+offset),z];
 pts.push(['P',at(8.9),1.07,'#55dfba'],['O',at(8.3,.12),.66,'#ffe266'],['C',at(6.9,.18),.76,'#3155e7']);
 if(i!==0)for(let k=0;k<9;k++){const t=k/8,a=at(5.9,.25),b=[-a[0],-a[1],z];pts.push([k%3?'C':'N',a.map((v,j)=>v+(b[j]-v)*t),.72,k%3?'#3155e7':'#9365ed']);}
}
for(const [el,at,r,color]of pts.sort((a,b)=>a[1][2]-b[1][2])){const [x,y]=project(at);svg+=`<circle cx="${x}" cy="${y}" r="${r*n/span*1.15}" fill="${color}" fill-opacity=".6" stroke="${color}"/>`;}
const child=(await readFile(p('guanine-flat.png'))).toString('base64');svg+=`<image x="418" y="418" width="418" height="418" xlink:href="data:image/png;base64,${child}"/></svg>`;
await writeFile(p('dna-guide.svg'),svg);await sharp(Buffer.from(svg)).png().toFile(p('dna-guide.png'));
