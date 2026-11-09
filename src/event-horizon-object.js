// The cosmic event horizon as an object: everything inside 16.6 Gly of us (36.6% of the CMB's
// radius on the comoving scale, out to z 1.8), the galaxies whose light sent now can still reach us.
// No shell: the horizon is not a surface, so its edge is the zoom's dashed ring. Inside, the zoom's
// own contents (scripts/powers-of-ten-build-cosmic-web.mjs → public/powers-of-ten/
// event-horizon-icon.bin): the supercluster web in the inner 46%, its brush strands, and the sea of
// galaxies from there to the edge, creamy near and orange at the horizon. It turns with the
// observable universe's object (src/cmb-object.js), whose pieces it is built from.
// No black inside: the chart shows through the disc, dimmed by BACKDROP.tint and, where it turns
// live (src/cmb-icons.js), blurred (the author, 2026-11-09: "not a completely black background, at
// most a blurred one"). The still picture (scripts/export-cmb-icon.mjs) keeps the tint's alpha.
import {knotCloud,strandSprites,templateLight,iconBasis,FILL,ZOOM_SPHERE_PX,HORIZON} from './cmb-object.js';
// tint (r,g,b,alpha): laid over the chart inside the disc (the galaxies' glow is tuned against dark);
// blur: the frosted pane's radius as a fraction of the disc's width; fill: the disc's share of the picture
export const BACKDROP={tint:[3,3,12,.5],blur:.035,fill:FILL};
// The disc as light over the chart: a pixel's alpha is the tint's plus its brightness, its colour the
// tint's plus its light, so the galaxies stay as bright as they were against black and the chart shows
// where they are not (a translucent fill alone capped every bright pixel at the fill's alpha: grey)
const BG=[3,3,12],[TR,TG,TB,TA]=BACKDROP.tint;
function lift(ctx,size){const img=ctx.getImageData(0,0,size,size),d=img.data;
 for(let i=0;i<d.length;i+=4){if(!d[i+3])continue;const lr=Math.max(0,d[i]-BG[0]),lg=Math.max(0,d[i+1]-BG[1]),lb=Math.max(0,d[i+2]-BG[2]),a=TA+(1-TA)*Math.max(lr,lg,lb)/255;
  d[i]=Math.min(255,(TR*TA+lr)/a);d[i+1]=Math.min(255,(TG*TA+lg)/a);d[i+2]=Math.min(255,(TB*TA+lb)/a);d[i+3]=Math.round(a*d[i+3]);}
 ctx.putImageData(img,0,0);}
export function eventHorizonObject(){
 if(!document.createElement('canvas').getContext('webgl'))return null;
 // the strands of the outer shell, and a trace of the middle one (12% of this sphere: at full strength
 // a white dot); the innermost is 2% of it. Strengths set by eye against the zoom at the ring's scale
 const cloud=knotCloud('/powers-of-ten/event-horizon-icon.bin',.35),strands=strandSprites({scale:1/HORIZON,show:radius=>radius>.1?.22:radius>.02?.02:0}),light=templateLight();
 const canvas=document.createElement('canvas'),ctx=canvas.getContext('2d'),work=document.createElement('canvas'),wctx=work.getContext('2d');
 return {canvas,backdrop:BACKDROP,ready:()=>light.ready()&&cloud.settled(),draw(size=512,seconds=0){
  if(canvas.width!==size){canvas.width=canvas.height=size;}
  const S=Math.round(size*Math.min(2,Math.max(1,1536/size)));if(work.width!==S){work.width=work.height=S;}
  wctx.clearRect(0,0,S,S);
  const basis=iconBasis(seconds),R=FILL*S/2,pixel=1.2*FILL*S/ZOOM_SPHERE_PX;   // 2.7 times nearer than the CMB's object: its galaxies a little larger
  wctx.save();wctx.beginPath();wctx.arc(S/2,S/2,R,0,7);wctx.clip();
  wctx.fillStyle='#03030c';wctx.fillRect(0,0,S,S);   // the dark the light is measured against (lift)
  cloud.draw(wctx,S,basis,pixel);
  strands.draw(wctx,S,basis,pixel);
  wctx.restore();
  // the horizon: the zoom's dashed ring (full-journey.js drawSpheres), 56 dashes round
  const dash=2*Math.PI*R/56;
  wctx.save();wctx.setLineDash([dash*.57,dash*.43]);wctx.lineWidth=Math.max(1.5,S/170);wctx.strokeStyle='rgba(170,205,255,.9)';
  wctx.beginPath();wctx.arc(S/2,S/2,R-wctx.lineWidth/2,0,2*Math.PI);wctx.stroke();wctx.restore();
  ctx.clearRect(0,0,size,size);ctx.imageSmoothingQuality='high';ctx.drawImage(work,0,0,size,size);
  lift(ctx,size);
  light.shade(ctx,size);
  return canvas;
 }};
}
