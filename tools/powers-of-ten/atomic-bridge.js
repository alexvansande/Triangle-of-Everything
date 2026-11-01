// The photographic/molecular stretch inherits the actual Hopf cloud as its
// exact centred seed. All three images share a physical origin and3× spans.
import {ramp} from './math.js';
import {HYDROGEN_SPAN,PAIR_SPAN} from './atomic-bridge-geometry.js';
const ROOT='/video/powers-of-ten/generated/atomic-bridge-v1/';
export const atomBridgePhase=s=>ramp(s,-9.65,-9.2);
export function atomicBridge(){
 const parts=[['basepair',PAIR_SPAN],['hydrogen',HYDROGEN_SPAN]].map(([name,span])=>{const img=new Image();img.src=ROOT+name+'.png';return{name,span,img}}),layer=document.createElement('canvas');
 const ready=()=>parts.every(p=>p.img.complete&&p.img.naturalWidth>0);
 return {name:'DNA to Hopf hydrogen bridge',range:[-10.5,-6.3],ready,draw(cam){
  if(!ready())return;const opacity=atomBridgePhase(cam.s);
  if(layer.width!==cam.W||layer.height!==cam.H){layer.width=cam.W;layer.height=cam.H}const c=layer.getContext('2d');c.clearRect(0,0,cam.W,cam.H);
  for(const p of parts){const side=p.span*cam.k,a=p.name==='hydrogen'?opacity:1;if(side<2*cam.dpr||!a)continue;
   // Crop the source to the visible output before magnifying it; no enormous
   // canvas or new camera centre when moving through the electron cloud.
   const left=cam.cx-side/2,top=cam.cy-side/2,x=Math.max(0,left),y=Math.max(0,top),w=Math.min(cam.W,left+side)-x,h=Math.min(cam.H,top+side)-y;
   if(w<=0||h<=0)continue;const n=p.img.naturalWidth;c.globalAlpha=a;c.drawImage(p.img,(x-left)/side*n,(y-top)/side*n,w/side*n,h/side*n,x,y,w,h);
  }
  cam.ctx.save();cam.ctx.globalAlpha=1;cam.ctx.drawImage(layer,0,0);cam.ctx.restore();
 }};
}
