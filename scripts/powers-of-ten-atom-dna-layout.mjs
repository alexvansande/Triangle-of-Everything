import sharp from 'sharp';
import {writeFile,readFile} from 'node:fs/promises';
import {DNA_SPAN} from '../tools/powers-of-ten/atomic-bridge-geometry.js';
const root=new URL('../video/powers-of-ten/generated/atomic-bridge-v1/',import.meta.url),n=1254,k=n/(DNA_SPAN/1e-10),q=Math.SQRT1_2;
const point=(r,t,z)=>[n/2+k*(q*z+q*r*Math.cos(t)),n/2+k*(q*z-q*r*Math.cos(t))];
let s=`<svg xmlns="http://www.w3.org/2000/svg" width="1254" height="1254"><rect width="1254" height="1254" fill="#07080b"/>`;
const rails=[[],[]];
for(let i=-13;i<=13;i++){
 const z=i*3.38,t=i*Math.PI/5;
 const a=point(9,t,z),b=point(9,t+155*Math.PI/180,z);rails[0].push(a);rails[1].push(b);
 s+=`<path d="M${a} L${b}" stroke="#9c7f72" stroke-width="14"/>`;
 for(let j=1;j<9;j++){const f=j/9,x=a[0]+f*(b[0]-a[0]),y=a[1]+f*(b[1]-a[1]);s+=`<circle cx="${x}" cy="${y}" r="11" fill="${j%3?'#b4a59e':'#7c93d2'}"/>`;}
}
for(const rail of rails){s+=`<polyline points="${rail.map(p=>p.join(',')).join(' ')}" fill="none" stroke="#a3b7ee" stroke-width="23" stroke-linejoin="round"/>`;for(const[x,y]of rail)s+=`<circle cx="${x}" cy="${y}" r="18" fill="#adbce9"/>`;}
const photo=(await readFile(new URL('basepair-flat.png',root))).toString('base64');s+=`<image href="data:image/png;base64,${photo}" x="418" y="418" width="418" height="418"/>`;
s+='<text x="25" y="45" fill="#d5dcf1" font-family="Arial" font-size="24">B-DNA · 5.487 nm FIELD · 2 nm DIAMETER · 3.38 nm PITCH · FIXED CENTRAL H</text></svg>';
await writeFile(new URL('dna-layout.svg',root),s);await sharp(Buffer.from(s)).png().toFile(new URL('dna-layout.png',root).pathname);
