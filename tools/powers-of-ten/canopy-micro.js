// Fixed physical coordinates through the drop's optical boundary.
const smooth=(a,b,x)=>{const t=Math.max(0,Math.min(1,(x-a)/(b-a)));return t*t*(3-2*t)};
const ROOT='/video/powers-of-ten/generated/canopy-test/micro/';
const SPAN=10**1.6/3**6;
export function canopyMicro(){
 const amoeba=new Image(),water=new Image(),shell=new Image();
 amoeba.src=ROOT+'amoeba-v1.png';water.src=ROOT+'water-v1.png';
 shell.src=ROOT+'../ladybug-chain/level-2.02mm-natural-v3.png';
 // Catalogue logR is log10 radius in centimetres. The alpha body bounds
 // exclude transparent margins, so the actual organism, not canvas, is 447.7µm.
 const diameter=2*10**(-1.65)/100,bodyPixels=1471;
 const field=document.createElement('canvas');
 return {draw(cam){
  if(window.canopyTest?.enabled===false||!amoeba.complete||!amoeba.naturalWidth||!water.complete||!water.naturalWidth||!shell.complete||!shell.naturalWidth)return;
  // Replace with the identical sharp parent first; focus changes only inside.
  const replacement=1-smooth(Math.log10(.0015),Math.log10(.0018),cam.s);if(!replacement)return;
  const focus=1-smooth(Math.log10(.00065),Math.log10(.0014),cam.s);
  const interior=1-smooth(Math.log10(.00045),Math.log10(.00085),cam.s);
  const {W,H}=cam.screen;if(field.width!==W||field.height!==H){field.width=W;field.height=H}
  const ctx=field.getContext('2d'),x=W/2+cam.cx-cam.W/2+(570/1254-.5)*SPAN*cam.k,y=H/2+cam.cy-cam.H/2+(605/1254-.5)*SPAN*cam.k;
  ctx.globalCompositeOperation='source-over';ctx.clearRect(0,0,W,H);
  const parentSide=SPAN/27*cam.k;
  ctx.globalAlpha=1;
  ctx.filter=`blur(${18*focus*cam.min/960}px)`;
  ctx.drawImage(shell,x-parentSide/2,y-parentSide/2,parentSide,parentSide);
  ctx.filter='none';
  // The rim has left the central video crops before the water field changes.
  const side=.0016*cam.k;ctx.globalAlpha=interior;
  ctx.drawImage(water,x-side/2,y-side/2,side,side);
  ctx.globalAlpha=focus;
  ctx.filter=`blur(${12*(1-focus)*cam.min/960}px)`;
  const pixelScale=diameter*cam.k/bodyPixels;
  ctx.drawImage(amoeba,x-769.5*pixelScale,y-510.5*pixelScale,1536*pixelScale,1024*pixelScale);
  ctx.filter='none';ctx.globalAlpha=1;
  // Feather only the optical boundary of the 1.16mm bead, not the cell.
  const r=.00058*cam.k,g=ctx.createRadialGradient(x,y,.84*r,x,y,r);
  g.addColorStop(0,'#000');g.addColorStop(1,'#0000');
  ctx.globalCompositeOperation='destination-in';ctx.fillStyle=g;ctx.fillRect(0,0,W,H);ctx.globalCompositeOperation='source-over';
  cam.ctx.save();cam.ctx.setTransform(1,0,0,1,0,0);cam.ctx.globalAlpha=replacement;cam.ctx.drawImage(field,0,0);cam.ctx.restore();
 }};
}
