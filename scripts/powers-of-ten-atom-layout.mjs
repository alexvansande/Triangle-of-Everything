import sharp from 'sharp';
import {writeFile,readFile} from 'node:fs/promises';
import {basePairGeometry,PAIR_SPAN} from '../tools/powers-of-ten/atomic-bridge-geometry.js';
const root=new URL('../video/powers-of-ten/generated/atomic-bridge-v1/',import.meta.url),G=basePairGeometry(),n=1254,k=n/(PAIR_SPAN/1e-10);
const col={H:'#d9ffff',C:'#b4a7a1',N:'#6b95ef',O:'#df786e'};
const P=a=>[n/2+a[1]*k,n/2-a[2]*k];
let svg=`<svg xmlns="http://www.w3.org/2000/svg" width="${n}" height="${n}" viewBox="0 0 ${n} ${n}"><rect width="100%" height="100%" fill="#030205"/>`;
for(let i=0;i<G.atoms.length;i++)for(let j=i+1;j<G.atoms.length;j++){
 const a=G.atoms[i],b=G.atoms[j],d=Math.hypot(...a.slice(1).map((v,t)=>v-b[t+1]));if(d>(a[0]==='H'||b[0]==='H'?1.25:1.7))continue;
 const p=P(a),q=P(b);svg+=`<path d="M${p} L${q}" stroke="#a5a9ba" stroke-width="7"/>`;
}
for(let i=0;i<G.atoms.length;i++){const a=G.atoms[i],[x,y]=P(a),r=a[0]==='H'?17:27;svg+=`<circle cx="${x}" cy="${y}" r="${r}" fill="${col[a[0]]}"/><text x="${x}" y="${y+6}" text-anchor="middle" font-family="Arial" font-size="18" fill="#16202a">${a[0]}</text>`;}
svg+='<circle cx="627" cy="627" r="35" fill="none" stroke="#ffffff" stroke-width="3"/>';
svg+='<text x="40" y="60" fill="#b2c5db" font-family="Arial" font-size="25">A–T BASE-PAIR FRAGMENT · 1.829 nm FIELD · CENTRAL N3-BOUND H</text></svg>';
await writeFile(new URL('basepair-layout.svg',root),svg);await sharp(Buffer.from(svg)).png().toFile(new URL('basepair-layout.png',root).pathname);
await writeFile(new URL('geometry.json',root),JSON.stringify(G,null,2)+'\n');
