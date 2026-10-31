// A registered 3× image pyramid, with the nuclear envelope on its own plane.
const smooth=(a,b,x)=>{const t=Math.max(0,Math.min(1,(x-a)/(b-a)));return t*t*(3-2*t)};
const ROOT='/video/powers-of-ten/generated/canopy-test/micro/nucleus-v6/';
function load(file,feather=true){const p={};const img=new Image();img.onload=()=>{
 if(!feather){p.img=img;return}const n=img.naturalWidth,c=document.createElement('canvas');c.width=c.height=n;const ctx=c.getContext('2d');ctx.drawImage(img,0,0);ctx.globalCompositeOperation='destination-in';
 for(const vertical of [false,true]){const g=ctx.createLinearGradient(0,0,vertical?0:n,vertical?n:0);g.addColorStop(0,'#0000');g.addColorStop(.25,'#000');g.addColorStop(.75,'#000');g.addColorStop(1,'#0000');ctx.fillStyle=g;ctx.fillRect(0,0,n,n)}p.img=c;
};img.src=ROOT+file;return p}
export function nucleusInterior(){
 const flat=load('2um.png'),back=load('background.png'),front=load('envelope.png',false);
 const details=[['667nm',1],['222nm',2],['74nm',3]].map(([name,k])=>Object.assign(load(name+'.png'),{span:2e-6/3**k}));
 return {ready:()=>!!flat.img&&!!back.img&&!!front.img&&details.every(p=>!!p.img),draw(ctx,x,y,k,s,min){
  if(!flat.img||!back.img||!front.img||details.some(p=>!p.img))return;
  const side=2e-6*k,opacity=smooth(.3,.95,side/min);if(!opacity)return;
  const travel=Math.max(0,Math.log10(1.3e-6)-s),ease=travel-.14*(1-Math.exp(-travel/.14));
  ctx.globalAlpha=opacity;
  ctx.drawImage(travel?back.img:flat.img,x-side/2,y-side/2,side,side);
  for(const p of details){const n=p.span*k;if(n>40*min)continue;ctx.globalAlpha=smooth(.3,.95,n/min);ctx.drawImage(p.img,x-n/2,y-n/2,n,n)}
  if(travel){
   const near=10**(.55*ease),n=side*near;
   // Preserve the envelope at full material opacity as it passes out of frame.
   // Focus blur starts only after the exact sharp parent has been replaced.
   if(n<min*12){ctx.globalAlpha=1;ctx.filter=`blur(${32*smooth(0,.65,travel)*min/960}px)`;ctx.drawImage(front.img,x-n/2,y-n/2,n,n);ctx.filter='none'}
  }
  ctx.globalAlpha=1;
 }};
}
