// Persistent nuclear texture, with each closer molecular piece on true alpha.
const smooth=(a,b,x)=>{const t=Math.max(0,Math.min(1,(x-a)/(b-a)));return t*t*(3-2*t)};
const ROOT='/video/powers-of-ten/generated/canopy-test/micro/anatomy-v9/';
function load(file,feather=false){const p={},img=new Image();img.onload=()=>{
 if(!feather){p.img=img;return}const n=img.naturalWidth,c=document.createElement('canvas');c.width=c.height=n;const ctx=c.getContext('2d');ctx.drawImage(img,0,0);ctx.globalCompositeOperation='destination-in';
 for(const vertical of [false,true]){const g=ctx.createLinearGradient(0,0,vertical?0:n,vertical?n:0);g.addColorStop(0,'#0000');g.addColorStop(.25,'#000');g.addColorStop(.75,'#000');g.addColorStop(1,'#0000');ctx.fillStyle=g;ctx.fillRect(0,0,n,n)}p.img=c;
};img.src=ROOT+file;return p}
export function nucleusInterior(){
 const base='nuclear-pieces-v2/',background=load(base+'background.png',true),coarse=load('level-1.png',true),layer=document.createElement('canvas');
 const parts=[['field',3],['hero',5],['dna',7],['purple',3]].map(([name,level])=>Object.assign(load(base+name+'.png'),{name,span:12e-6/3**level}));
 const required=[background,coarse,...parts],ready=()=>required.every(p=>!!p.img);
 const eased=(travel)=>travel-.14*(1-Math.exp(-travel/.14));
 return {ready,draw(ctx,x,y,k,s,min){
  if(!ready())return;const rootSpan=12e-6/9,rootSide=rootSpan*k;
  const alpha=smooth(.3,.95,rootSide/min);ctx.save();
  const coarseSide=4e-6*k;if(coarseSide<40*min){ctx.globalAlpha=smooth(.3,.95,coarseSide/min);ctx.drawImage(coarse.img,x-coarseSide/2,y-coarseSide/2,coarseSide,coarseSide);}
  if(!alpha){ctx.restore();return;}
  const W=ctx.canvas.width,H=ctx.canvas.height;if(layer.width!==W||layer.height!==H){layer.width=W;layer.height=H;}
  const c=layer.getContext('2d');c.clearRect(0,0,W,H);
  // Replace the complete flat parent at a common scale before depth or blur.
  const rootTravel=Math.max(0,Math.log10(rootSpan/2.2)-s),backEase=eased(rootTravel),backSide=rootSide*10**(-.35*backEase);
  // Crop before drawing/filtering, so persistent rear planes can grow well
  // beyond the viewport without allocating giant offscreen blur surfaces.
  function plane(img,side,blur){
   const pad=Math.ceil(blur*3+2),left=x-side/2,top=y-side/2,dx=Math.max(-pad,left),dy=Math.max(-pad,top),dw=Math.min(W+pad,left+side)-dx,dh=Math.min(H+pad,top+side)-dy;
   if(dw<=0||dh<=0)return;const n=img.width||img.naturalWidth;c.filter=`blur(${blur}px)`;c.drawImage(img,(dx-left)/side*n,(dy-top)/side*n,dw/side*n,dh/side*n,dx,dy,dw,dh);
  }
  plane(background.img,backSide,Math.min(24,12*backEase)*min/960);c.filter='none';
  for(const p of parts){
   const relative=p.name==='purple'?10**(.55*backEase):p.name==='field'?10**(-.18*backEase):1;
   const blur=p.name==='purple'?Math.min(30,16*backEase):p.name==='field'?Math.min(36,18*backEase):0;
   const side=p.span*k*relative;
   // Purple chains have an empty centre and exit through that passage.
   // The populated rear field stays behind every closer foreground piece.
   if(p.name==='purple'&&side>40*min)continue;
   plane(p.img,side,blur*min/960);
  }
  c.filter='none';ctx.globalAlpha=alpha;ctx.drawImage(layer,0,0);ctx.restore();
 }};
}
