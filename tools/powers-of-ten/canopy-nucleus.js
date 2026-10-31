// A registered 3× image pyramid, with the nuclear envelope on its own plane.
const smooth=(a,b,x)=>{const t=Math.max(0,Math.min(1,(x-a)/(b-a)));return t*t*(3-2*t)};
const ROOT='/video/powers-of-ten/generated/canopy-test/micro/anatomy-v9/';
function load(file,feather=true){const p={};const img=new Image();img.onload=()=>{
 if(!feather){p.img=img;return}const n=img.naturalWidth,c=document.createElement('canvas');c.width=c.height=n;const ctx=c.getContext('2d');ctx.drawImage(img,0,0);ctx.globalCompositeOperation='destination-in';
 for(const vertical of [false,true]){const g=ctx.createLinearGradient(0,0,vertical?0:n,vertical?n:0);g.addColorStop(0,'#0000');g.addColorStop(.25,'#000');g.addColorStop(.75,'#000');g.addColorStop(1,'#0000');ctx.fillStyle=g;ctx.fillRect(0,0,n,n)}p.img=c;
};img.src=ROOT+file;return p}
export function nucleusInterior(){
 const details=Array.from({length:7},(_,i)=>Object.assign(load(`level-${i+1}.png`),{span:12e-6/3**(i+1)}));
 return {ready:()=>details.every(p=>!!p.img),draw(ctx,x,y,k,s,min){
  if(details.some(p=>!p.img))return;
  ctx.save();
  for(const p of details){const side=p.span*k;if(side>40*min)continue;ctx.globalAlpha=smooth(.3,.95,side/min);ctx.drawImage(p.img,x-side/2,y-side/2,side,side)}
  ctx.restore();
 }};
}
