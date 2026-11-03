// Isolated CMB icon: observed temperature shell around a sparse 3D filament volume.
import {cmbSphere} from '../tools/powers-of-ten/cmb-sphere.js';
import {buildFilaments} from '../tools/powers-of-ten/cosmic-filaments.js';
import {cameraAt} from '../tools/powers-of-ten/math.js';
import {cosmicOrbit} from '../tools/powers-of-ten/cosmic-motion.js';
const lightingURL=new URL('../content/icons/src/sphere template.png',import.meta.url).href;
export function cmbObject(){
 const shell=cmbSphere(),canvas=document.createElement('canvas'),ctx=canvas.getContext('2d'),copy=document.createElement('canvas'),lighting=new Image();lighting.src=lightingURL;
 if(!shell.available)return null;
 const lines=buildFilaments().filter(l=>l.radius>.5&&l.brush===0).map(l=>({...l,pts:l.pts.filter((_,i)=>i%4===0)}));
 const dot=(a,b)=>a.reduce((s,v,i)=>s+v*b[i],0),tan=Math.tan(20*Math.PI/180),distance=Math.sqrt(1+1/(.92*tan)**2);
 return {canvas,ready:()=>shell.ready()&&lighting.complete&&lighting.naturalWidth>0,draw(size=512,seconds=0){
  if(canvas.width!==size){canvas.width=canvas.height=copy.width=copy.height=size;}
  ctx.clearRect(0,0,size,size);
  const basis=cosmicOrbit(cameraAt(Math.log10(176e9*9.4607e15)),.8+seconds*.035),view={dist:distance,a:.365};
  shell.draw(ctx,size,view,basis,0);
  ctx.save();ctx.globalCompositeOperation='screen';ctx.lineCap='round';
  for(const l of lines){ctx.beginPath();l.pts.forEach((p,i)=>{const w=distance-dot(p,basis.n),x=size/2+dot(p,basis.r)/tan/w*size/2,y=size/2-dot(p,basis.u)/tan/w*size/2;if(i)ctx.lineTo(x,y);else ctx.moveTo(x,y)});ctx.strokeStyle=`rgba(${l.colour.join(',')},.90)`;ctx.lineWidth=Math.max(.5,size/1600);ctx.stroke();}ctx.restore();
  shell.draw(ctx,size,view,basis,1);
  // Reference lighting remains fixed in screen space while the volume turns.
  if(lighting.complete&&lighting.naturalWidth){const c=copy.getContext('2d');c.clearRect(0,0,size,size);c.drawImage(lighting,0,0,size,size);const mask=c.getImageData(0,0,size,size).data,pixels=ctx.getImageData(0,0,size,size);for(let i=0;i<pixels.data.length;i+=4)for(let k=0;k<3;k++)pixels.data[i+k]*=.3+.7*mask[i+k]/255;ctx.putImageData(pixels,0,0);}
  return canvas;
 }};
}
