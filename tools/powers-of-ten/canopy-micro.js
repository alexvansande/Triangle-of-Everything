import {microSpecimens,microDust,microCommunity} from './canopy-micro-specimens.js';
// The shell persists; pollen recedes behind the approaching smaller cell.
const smooth=(a,b,x)=>{const t=Math.max(0,Math.min(1,(x-a)/(b-a)));return t*t*(3-2*t)};
const ROOT='/video/powers-of-ten/generated/canopy-test/micro/';
const SPAN=10**1.6/3**9;
export function canopyMicro(){
 const planes={};for(const [name,file] of Object.entries({shell:'layers-v3/shell',reflections:'layers-v3/reflections',flat:'pollen-v4/flat',pollen:'pollen-v4/pollen',amoeba:'pollen-v4/amoeba',...Object.fromEntries(microCommunity.map(p=>[p.file,'pollen-v4/'+p.file]))})){const img=new Image();img.src=ROOT+file+'.png';planes[name]=img}
 const layer=document.createElement('canvas');
 function specimen(ctx,p,x,y,k,relative=1,blur=0){
  const scale=p.diameter/p.bodyPixels*k*relative;
  ctx.save();ctx.globalAlpha=p.opacity;ctx.filter=`blur(${blur}px)`;
  ctx.translate(x+p.x*k*relative,y+p.y*k*relative);ctx.rotate(p.angle||0);
  ctx.drawImage(planes[p.file],-p.center[0]*scale,-p.center[1]*scale,1254*scale,1254*scale);ctx.restore();
 }
 return {draw(cam){
  if(window.canopyTest?.enabled===false||Object.values(planes).some(p=>!p.complete||!p.naturalWidth))return;
  const opacity=1-smooth(Math.log10(.0015),Math.log10(.0018),cam.s);if(!opacity)return;
  const {W,H}=cam.screen;if(layer.width!==W||layer.height!==H){layer.width=W;layer.height=H}
  const ctx=layer.getContext('2d');ctx.clearRect(0,0,W,H);
  const travel=Math.max(0,Math.log10(.0013)-cam.s),eased=travel-.14*(1-Math.exp(-travel/.14));
  const back=10**(-.55*eased),near=10**(.75*eased),unit=SPAN*cam.k/1254;
  const dx=cam.cx-cam.W/2+(570/1254-.5)*SPAN*27*cam.k;
  const dy=cam.cy-cam.H/2+(605/1254-.5)*SPAN*27*cam.k;
  // Keep a fixed optical axis through the amoeba. Pollen remains off-axis
  // at its registered world position; only depth planes change zoom speed.
  const x=W/2+dx,y=H/2+dy;
  if(!travel){ctx.drawImage(planes.flat,x-627*unit,y-627*unit,1254*unit,1254*unit)}else{
   const strength=smooth(0,.65,travel);
   ctx.filter=`blur(${44*strength*cam.min/960}px)`;
   ctx.drawImage(planes.shell,W/2+(dx-627*unit)*back,H/2+(dy-627*unit)*back,1254*unit*back,1254*unit*back);ctx.filter='none';
   // Surrounding pollen and distinct amoebae occupy their own depth planes.
   for(const p of microCommunity){
    const relative=10**(-p.lag*eased);
    specimen(ctx,p,x,y,cam.k,relative,(5+Math.abs(p.lag)*32)*strength*cam.min/960);
   }
   const dustDepth=10**(-.25*eased);
   for(const p of microDust)specimen(ctx,{...microSpecimens[0],...p,file:'pollen'},x,y,cam.k,dustDepth,9*strength*cam.min/960);
   const pass=1-smooth(Math.log10(25e-6),Math.log10(90e-6),cam.s);
   // After the pollen visit, focus moves to the nearer cell. The grain
   // remains behind it, with slower relative zoom and increasing defocus.
   const pollenTravel=Math.max(0,Math.log10(90e-6)-cam.s);
   const pollenEase=pollenTravel-.12*(1-Math.exp(-pollenTravel/.12));
   const pollenDepth=10**(-.55*pollenEase);
   specimen(ctx,microSpecimens[0],x,y,cam.k,pollenDepth,48*pass*cam.min/960);
   specimen(ctx,microSpecimens[1],x,y,cam.k,1,6*(1-pass)*strength*cam.min/960);
   ctx.filter=`blur(${80*strength*cam.min/960}px)`;
   ctx.drawImage(planes.reflections,W/2+(dx+(22-627)*unit)*near,H/2+(dy+(53-627)*unit)*near,1116*unit*near,1116*unit*near);ctx.filter='none';
  }
  cam.ctx.save();cam.ctx.setTransform(1,0,0,1,0,0);cam.ctx.globalAlpha=opacity;cam.ctx.drawImage(layer,0,0);cam.ctx.restore();
 }};
}
