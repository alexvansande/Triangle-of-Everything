// Galactic longitude is zero at the equirectangular map's centre, increases
// towards its left, and latitude is positive upwards. Distances are in kpc.
import {ramp,dot} from './math.js';
export const GALAXY_PHASES={starFade:[15.35,15.85],starDepth:[15.85,17.6],galaxyFade:[18.8,19.25],galaxyDepth:[19.25,21.35]};
export function skyDirection(u,v){const l=(.5-u)*2*Math.PI,b=(.5-v)*Math.PI;return [Math.cos(b)*Math.cos(l),Math.cos(b)*Math.sin(l),Math.sin(b)];}
export function skyUV(p){const d=Math.hypot(...p);return [((.5-Math.atan2(p[1],p[0])/(2*Math.PI))%1+1)%1,.5-Math.asin(Math.max(-1,Math.min(1,p[2]/d)))/Math.PI];}
export function handoffPhase(s){const P=GALAXY_PHASES;return {starFade:ramp(s,...P.starFade),starDepth:ramp(s,...P.starDepth),galaxyFade:ramp(s,...P.galaxyFade),galaxyDepth:ramp(s,...P.galaxyDepth)};}
export function projectRay(ray,inverseDistance,camera,distance,depth){
 const q=ray.map((v,i)=>v-camera.n[i]*distance*depth*inverseDistance),den=-dot(q,camera.n);
 return den>1e-7?[dot(q,camera.r)/den,dot(q,camera.u)/den]:[NaN,NaN];
}
