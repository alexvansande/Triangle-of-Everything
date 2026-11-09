// The cosmic event horizon as an object: everything inside 16.6 Gly of us (36.6% of the CMB's
// radius on the comoving scale, out to z 1.8), the galaxies whose light sent now can still reach us.
// No shell: the horizon is not a surface, so its edge is the zoom's dashed ring. Inside, the zoom's
// own contents (scripts/powers-of-ten-build-cosmic-web.mjs → public/powers-of-ten/
// event-horizon-icon.bin): the supercluster web in the inner 46%, its brush strands, and the sea of
// galaxies from there to the edge, creamy near and orange at the horizon. It turns with the
// observable universe's object (src/cmb-object.js), whose pieces it is built from.
import {knotCloud,strandSprites,templateLight,iconBasis,FILL,ZOOM_SPHERE_PX,HORIZON} from './cmb-object.js';
export function eventHorizonObject(){
 if(!document.createElement('canvas').getContext('webgl'))return null;
 // the strands of the outer shell, and a trace of the middle one (12% of this sphere: at full strength
 // a white dot); the innermost is 2% of it. Strengths set by eye against the zoom at the ring's scale
 const cloud=knotCloud('/powers-of-ten/event-horizon-icon.bin',.35),strands=strandSprites({scale:1/HORIZON,show:radius=>radius>.1?.22:radius>.02?.02:0}),light=templateLight();
 const canvas=document.createElement('canvas'),ctx=canvas.getContext('2d'),work=document.createElement('canvas'),wctx=work.getContext('2d');
 return {canvas,ready:()=>light.ready()&&cloud.settled(),draw(size=512,seconds=0){
  if(canvas.width!==size){canvas.width=canvas.height=size;}
  const S=Math.round(size*Math.min(2,Math.max(1,1536/size)));if(work.width!==S){work.width=work.height=S;}
  wctx.clearRect(0,0,S,S);
  const basis=iconBasis(seconds),R=FILL*S/2,pixel=1.2*FILL*S/ZOOM_SPHERE_PX;   // 2.7 times nearer than the CMB's object: its galaxies a little larger
  wctx.save();wctx.beginPath();wctx.arc(S/2,S/2,R,0,7);wctx.clip();
  wctx.fillStyle='#03030c';wctx.fillRect(0,0,S,S);
  cloud.draw(wctx,S,basis,pixel);
  strands.draw(wctx,S,basis,pixel);
  wctx.restore();
  // the horizon: the zoom's dashed ring (full-journey.js drawSpheres), 56 dashes round
  const dash=2*Math.PI*R/56;
  wctx.save();wctx.setLineDash([dash*.57,dash*.43]);wctx.lineWidth=Math.max(1.5,S/170);wctx.strokeStyle='rgba(170,205,255,.9)';
  wctx.beginPath();wctx.arc(S/2,S/2,R-wctx.lineWidth/2,0,2*Math.PI);wctx.stroke();wctx.restore();
  ctx.clearRect(0,0,size,size);ctx.imageSmoothingQuality='high';ctx.drawImage(work,0,0,size,size);
  light.shade(ctx,size);
  return canvas;
 }};
}
