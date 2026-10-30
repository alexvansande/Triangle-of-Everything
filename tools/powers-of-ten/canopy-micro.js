import {smallAmoebas} from './canopy-micro-specimens.js';
// Three registered optical planes: shell, suspended cell, reflecting surface.
const smooth=(a,b,x)=>{const t=Math.max(0,Math.min(1,(x-a)/(b-a)));return t*t*(3-2*t)};
const ROOT='/video/powers-of-ten/generated/canopy-test/micro/layers-v3/';
const SPAN=10**1.6/3**9;
export function canopyMicro(){
 const planes={};for(const name of ['shell','amoeba','reflections','flat']){const img=new Image();img.src=ROOT+name+'.png';planes[name]=img}
 const layer=document.createElement('canvas');
 // These pixel registrations also build the flattened parent in match-drop.mjs.
 const cell={left:482,top:531,width:289,height:193};
 const front={left:22,top:53,width:1116,height:1116};
 return {draw(cam){
  if(window.canopyTest?.enabled===false||Object.values(planes).some(p=>!p.complete||!p.naturalWidth))return;
  const opacity=1-smooth(Math.log10(.0015),Math.log10(.0018),cam.s);if(!opacity)return;
  const {W,H}=cam.screen;if(layer.width!==W||layer.height!==H){layer.width=W;layer.height=H}
  const ctx=layer.getContext('2d');ctx.clearRect(0,0,W,H);
  const travel=Math.max(0,Math.log10(.0013)-cam.s);
  const eased=travel-.14*(1-Math.exp(-travel/.14));
  const back=10**(-.55*eased),near=10**(.75*eased);
  const targetSpan=SPAN*27;
  const dx=cam.cx-cam.W/2+(570/1254-.5)*targetSpan*cam.k;
  const dy=cam.cy-cam.H/2+(605/1254-.5)*targetSpan*cam.k;
  const unit=SPAN*cam.k/1254;
  if(!travel){
   // The flat parent is the exact composite; no motion or blur during handoff.
   ctx.drawImage(planes.flat,W/2+dx-627*unit,H/2+dy-627*unit,1254*unit,1254*unit);
  }else{
   const strength=smooth(0,.65,travel);
   ctx.filter=`blur(${44*strength*cam.min/960}px)`;
   ctx.drawImage(planes.shell,W/2+(dx-627*unit)*back,H/2+(dy-627*unit)*back,1254*unit*back,1254*unit*back);
   // A separate suspended-water plane recedes more slowly than the hero cell.
   const smallDepth=10**(-.25*eased);
   ctx.filter=`blur(${9*strength*cam.min/960}px)`;
   for(const p of smallAmoebas){
    ctx.save();ctx.globalAlpha=p.opacity;
    ctx.translate(W/2+(dx+(p.x-627)*unit)*smallDepth,H/2+(dy+(p.y-627)*unit)*smallDepth);
    ctx.rotate(p.angle);
    ctx.drawImage(planes.amoeba,-p.width*unit*smallDepth/2,-p.height*unit*smallDepth/2,p.width*unit*smallDepth,p.height*unit*smallDepth);
    ctx.restore();
   }
   ctx.filter='none';ctx.globalAlpha=.68;
   ctx.drawImage(planes.amoeba,W/2+dx+(cell.left-627)*unit,H/2+dy+(cell.top-627)*unit,cell.width*unit,cell.height*unit);
   ctx.globalAlpha=1;
   // Surface approaches faster than the specimen, stays opaque and exits by
   // geometry. Defocus increases with optical separation, not image opacity.
   ctx.filter=`blur(${80*strength*cam.min/960}px)`;
   ctx.drawImage(planes.reflections,W/2+(dx+(front.left-627)*unit)*near,H/2+(dy+(front.top-627)*unit)*near,front.width*unit*near,front.height*unit*near);
   ctx.filter='none';
  }
  cam.ctx.save();cam.ctx.setTransform(1,0,0,1,0,0);cam.ctx.globalAlpha=opacity;cam.ctx.drawImage(layer,0,0);cam.ctx.restore();
 }};
}
