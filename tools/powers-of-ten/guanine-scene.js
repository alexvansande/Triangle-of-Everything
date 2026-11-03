// Shared source for native captures and the live molecular approach.
import {DNA_COORDINATES} from './dna-coordinates.js';
import {loadMolecularCore} from './load-molecular-core.js';
const {core,MOLECULES,molecularCloudParticle,molecularAtomRadius}=await loadMolecularCore();
export {core};
export const GUANINE_SPAN=12e-6/3**8,DNA_SPAN=GUANINE_SPAN*3;
export const DNA_CODE_SPAN=GUANINE_SPAN*3;
export const SNAPSHOT_TIME=3,YAW=.6,PITCH=.6;
export const GUANINE_LOOK={cloudAtomRadius:1.15,cloudFibers:140,cloudGain:1.9,cloudContrast:.65,cloudWidth:.0115,dashes:5,dashLength:1,dashSpeed:3,spin:1.7,showCloud:true,showNucleus:false,bonds:0,backbone:0};
export const GUANINE_LIGHT={own:true,drift:true,flow:true,bloom:.12,exposure:1,width:1,core:.75};
// PubChem guanine coordinates (Å): H12 is the N1-bound hydrogen. H11 on
// glycosidic N9 is replaced by a C1′ attachment stub; target H stays unchanged.
export function guanineGeometry(){
 const raw=MOLECULES['guanine-g'],target=12,origin=raw[target].slice(1),atoms=raw.map(a=>[a[0],...a.slice(1).map((v,i)=>v-origin[i])]);
 const n=raw[1].slice(1),h=raw[11].slice(1),length=Math.hypot(...h.map((v,i)=>v-n[i]));
 atoms[11]=['C',...n.map((v,i)=>v+1.47*(h[i]-v)/length-origin[i])];
 return {atoms,target,origin_A:origin,targetName:'Guanine N1-bound H',normalization:Math.max(...atoms.map(a=>Math.hypot(...a.slice(1))))+2,hydrogenEnvelopeRadius_m:molecularAtomRadius('H',GUANINE_LOOK.cloudAtomRadius)*1e-10};
}
export function makeGuanineScene(include,approach=false,dna=false){
 Object.assign(core.LOOK,GUANINE_LOOK);
 const geometry=guanineGeometry(),look={...GUANINE_LOOK,cloudOrb:dna?1:0};
 if(dna){geometry.atoms=DNA_COORDINATES.atoms;geometry.normalization=Math.max(...geometry.atoms.map(a=>Math.hypot(...a.slice(1))))+2;}
 let widthLimit=Infinity;
 const p=molecularCloudParticle('guanine-g',{...geometry,include,look,orbs:dna,fibersForAtom:dna?j=>j===12?140:j<17?36:6:undefined,maxWidth:()=>widthLimit});
 // In the outer handoff use the exact frozen capture camera. Once the PNG
 // is gone the same camera approaches H, revealing genuine local 3D depth.
 const fullFov=28*Math.PI/180,captureDistance=(dna?DNA_CODE_SPAN:GUANINE_SPAN)/1e-10/(2*Math.tan(fullFov/2));
 p.frame={center:[0,0,0],radius:1};
 function frame(span,depth=0,blend=0,pixels=960){
  const widthA=span/1e-10,distance=captureDistance*(1-depth)+widthA/(2*Math.tan(fullFov/2))*depth;
  if(approach){
   if(dna)look.cloudOrb=1-blend;
   // Preserve the frozen handoff, then ease toward the hydrogen outer layer.
   for(const [key,target] of Object.entries({cloudWidth:.005,cloudGain:2.75,cloudContrast:1.15,dashes:12,spin:.6}))look[key]=GUANINE_LOOK[key]+(target-GUANINE_LOOK[key])*blend;
   // World-space ribbons otherwise inflate with magnification. Bound their
   // projected width even on the near surface, in CSS pixels.
   const radiusA=geometry.hydrogenEnvelopeRadius_m/1e-10;
   const nearRatio=Math.max(.08,(distance-radiusA)/distance);
   const cap=1.1*widthA/geometry.normalization/pixels*nearRatio;
   widthLimit=blend>0?cap/blend:Infinity;
  }
  p.fov=2*Math.atan(widthA/(2*distance));p.frame.radius=distance/geometry.normalization*Math.sin(p.fov/2)/1.32;
 }
 frame(GUANINE_SPAN);
 return {particle:p,geometry,frame};
}
