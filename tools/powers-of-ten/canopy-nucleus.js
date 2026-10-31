// A registered 3× image pyramid, with the nuclear envelope on its own plane.
const smooth=(a,b,x)=>{const t=Math.max(0,Math.min(1,(x-a)/(b-a)));return t*t*(3-2*t)};
const ROOT='/video/powers-of-ten/generated/canopy-test/micro/anatomy-v9/';
function load(file,feather=true){const p={};const img=new Image();img.onload=()=>{
 if(!feather){p.img=img;return}const n=img.naturalWidth,c=document.createElement('canvas');c.width=c.height=n;const ctx=c.getContext('2d');ctx.drawImage(img,0,0);ctx.globalCompositeOperation='destination-in';
 for(const vertical of [false,true]){const g=ctx.createLinearGradient(0,0,vertical?0:n,vertical?n:0);g.addColorStop(0,'#0000');g.addColorStop(.25,'#000');g.addColorStop(.75,'#000');g.addColorStop(1,'#0000');ctx.fillStyle=g;ctx.fillRect(0,0,n,n)}p.img=c;
};img.src=ROOT+file;return p}
export function nucleusInterior(){
 const chromatinBack=load('chromatin-depth-v1/background.png'),chromatinFront=load('chromatin-depth-v1/foreground.png');
 const details=Array.from({length:7},(_,i)=>Object.assign(load(`level-${i+1}.png`),{level:i+1,span:12e-6/3**(i+1)}));
 return {ready:()=>details.every(p=>!!p.img)&&!!chromatinBack.img&&!!chromatinFront.img,draw(ctx,x,y,k,s,min){
  if(details.some(p=>!p.img)||!chromatinBack.img||!chromatinFront.img)return;
  ctx.save();
  const span=12e-6/27;
  // At2.2× frame coverage the whole screen is in the flat parent's opaque
  // centre. Only then separate the exact registered planes in depth.
  const travel=Math.max(0,Math.log10(span/2.2)-s);
  const ease=travel-.14*(1-Math.exp(-travel/.14));
  for(const p of details){
   const side=p.span*k;if(side>40*min)continue;
   ctx.globalAlpha=smooth(.3,.95,side/min);
   if(p.level===3){
    const rear=side*10**(-.16*ease);ctx.filter=`blur(${Math.min(18,20*ease)*min/960}px)`;
    ctx.drawImage(chromatinBack.img,x-rear/2,y-rear/2,rear,rear);ctx.filter='none';
   }else ctx.drawImage(p.img,x-side/2,y-side/2,side,side);
  }
  // Foreground crosses above the finer DNA planes rather than fading under
  // their rectangular textures. It stays opaque and exits geometrically.
  {const side=span*k*10**(.85*ease);if(side<40*min){ctx.globalAlpha=smooth(.3,.95,span*k/min);ctx.filter=`blur(${Math.min(30,25*ease)*min/960}px)`;ctx.drawImage(chromatinFront.img,x-side/2,y-side/2,side,side);ctx.filter='none';}}
  ctx.restore();
 }};
}
