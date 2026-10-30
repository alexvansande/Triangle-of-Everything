// Three matched, sharp canopy planes. Subtle parallax starts after replacement.
const smooth=(a,b,x)=>{const t=Math.max(0,Math.min(1,(x-a)/(b-a)));return t*t*(3-2*t)};
const ROOT='/video/powers-of-ten/generated/canopy-test/';
function image(src,feather=false){const p={};const img=new Image();img.onload=()=>{
 if(!feather){p.img=img;return}const n=img.naturalWidth,c=document.createElement('canvas');c.width=c.height=n;const x=c.getContext('2d');x.drawImage(img,0,0,n,n);x.globalCompositeOperation='destination-in';
 for(const v of [0,1]){const g=x.createLinearGradient(0,0,v?0:n,v?n:0);g.addColorStop(0,'#0000');g.addColorStop(.045,'#000');g.addColorStop(.955,'#000');g.addColorStop(1,'#0000');x.fillStyle=g;x.fillRect(0,0,n,n)}p.img=c;
 };img.src=ROOT+src;return p}
export function canopyCrownDepth(){
 const planes=[['back-v1.png',.08],['mid-v1.png',.035],['near-matched.png',0]].map(([file,lag])=>Object.assign(image('canopy-depth/'+file),{lag}));
 const details=[['1.47m',3],['49.1cm',4],['16.4cm',5],['5.46cm',6]].map(([name,k])=>Object.assign(image('ladybug-chain/matched/'+name+'.png',true),{span:10**1.6/3**k}));
 const layer=document.createElement('canvas');
 return {draw(cam){
  if(window.canopyTest?.enabled===false||window.canopyTest?.crownDepth===false||cam.s<-.5)return;
  const opacity=1-smooth(Math.log10(3.2),Math.log10(3.9),cam.s);if(!opacity||planes.some(p=>!p.img))return;
  const {W,H}=cam.screen;if(layer.width!==W||layer.height!==H){layer.width=W;layer.height=H}
  const ctx=layer.getContext('2d');ctx.clearRect(0,0,W,H);
  const travel=Math.max(0,Math.log10(3)-cam.s),ease=travel-.16*(1-Math.exp(-travel/.16));
  const dx=cam.cx-cam.W/2,dy=cam.cy-cam.H/2;
  for(const p of planes){const relative=10**(-p.lag*ease),side=(10**1.6/9)*cam.k*relative;ctx.drawImage(p.img,W/2+dx*relative-side/2,H/2+dy*relative-side/2,side,side)}
  for(const p of details){if(!p.img)continue;const side=p.span*cam.k;if(side<3||side>40*cam.min)continue;ctx.globalAlpha=smooth(.3,.95,side/cam.min);ctx.drawImage(p.img,W/2+dx-side/2,H/2+dy-side/2,side,side)}ctx.globalAlpha=1;
  cam.ctx.save();cam.ctx.setTransform(1,0,0,1,0,0);cam.ctx.globalAlpha=opacity;cam.ctx.drawImage(layer,0,0);cam.ctx.restore();
 }};
}
