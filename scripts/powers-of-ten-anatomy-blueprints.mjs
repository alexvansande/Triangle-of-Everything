import fs from 'node:fs/promises';
import sharp from 'sharp';
const dir=new URL('../video/powers-of-ten/generated/canopy-test/micro/anatomy-v9/',import.meta.url);
await fs.mkdir(dir,{recursive:true});
const wrap=s=>`<svg xmlns="http://www.w3.org/2000/svg" width="1254" height="1254" viewBox="0 0 1200 1200"><rect width="1200" height="1200" fill="#c2c6bf"/>${s}</svg>`;
let nuc='<circle cx="450" cy="600" r="300" fill="#c5c1cf" stroke="#706b80" stroke-width="8"/><circle cx="450" cy="600" r="291" fill="none" stroke="#81788e" stroke-width="3"/>';
for(let i=0;i<80;i++){const a=i*2.399,r=270*Math.sqrt(i/80),x=450+Math.cos(a)*r,y=600+Math.sin(a)*r;nuc+=`<path d="M${x} ${y} q-13 -15 -26 0 t-26 0 t-26 0" fill="none" stroke="#8c7b9b" stroke-width="${2+i%5}"/>`;}
nuc+='<circle cx="450" cy="600" r="105" fill="#6b5b7a"/>';
let seed=941;const rnd=()=>((seed=Math.imul(seed,1664525)+1013904223>>>0)/4294967296);
let chrom='';for(let j=0;j<50;j++){let x=rnd()*1400-100,y=rnd()*1400-100,path=`M${x} ${y}`;for(let k=0;k<8;k++){const nx=x+(rnd()-.5)*200,ny=y+(rnd()-.5)*200;path+=` Q${x+(rnd()-.5)*96} ${y+(rnd()-.5)*96} ${nx} ${ny}`;x=nx;y=ny;}chrom+=`<path d="${path}" fill="none" stroke="#8d8194" stroke-width="${12+rnd()*35}" opacity="${.3+rnd()*.5}"/>`;}
// 49.38 nm frame: 11nm diameter histone/DNA core particles (~267units).
let beads='';for(const [x,y] of [[250,280],[920,270],[240,930],[980,910]]){beads+=`<ellipse cx="${x}" cy="${y}" rx="130" ry="85" fill="#b8a391" stroke="#8f9da3" stroke-width="12"/><path d="M${x-125} ${y-15} Q${x} ${y+130} ${x+125} ${y-15} M${x-125} ${y-45} Q${x} ${y+100} ${x+125} ${y-45}" fill="none" stroke="#8799a3" stroke-width="10"/>`;}
beads+='<path d="M350 350 Q450 430 600 600 T900 870" stroke="#8799a3" stroke-width="49" fill="none"/>';
// B-DNA: 2 nm diameter, 3.4 nm pitch. 5.487nm frame.
let dna='';const width=2/5.48696845*1200,pitch=3.4/5.48696845*1200;
for(let j=0;j<2;j++){let d='';for(let y=-100;y<=1300;y+=4){const x=600+width/2*Math.sin((y-600)/pitch*Math.PI*2+j*Math.PI);d+=`${y===-100?'M':'L'}${x} ${y}`;}dna+=`<path d="${d}" stroke="${j?'#c4b095':'#91a6b0'}" stroke-width="35" fill="none"/>`;}
for(let y=0;y<1200;y+=.34/5.48696845*1200){const a=width/2*Math.sin((y-600)/pitch*Math.PI*2);dna+=`<path d="M${600-a} ${y} H${600+a}" stroke="#a6a18e" stroke-width="17"/>`;}
const rib='<path d="M250 630 C150 300 440 170 690 240 C960 290 1060 570 910 730 Q650 860 410 760 Z" fill="#b69e87"/><path d="M330 730 Q550 650 850 740 C1000 1040 460 1100 330 730Z" fill="#9aa8ad"/><path d="M140 760 Q500 650 1100 850" fill="none" stroke="#887f95" stroke-width="20"/>';
for(const [name,s] of [['nucleus',nuc],['chromatin',chrom],['nucleosomes',beads],['dna',dna],['ribosome',rib]]){const svg=wrap(s);await fs.writeFile(new URL(`${name}-layout.svg`,dir),svg);await sharp(Buffer.from(svg)).png().toFile(new URL(`${name}-layout.png`,dir).pathname);}
