// Galactic longitude is zero at the equirectangular map's centre, increases
// towards its left, and latitude is positive upwards. Distances are in kpc.
import {ramp,dot,KPC,LY} from './math.js';
export const GALAXY_PHASES={starFade:[15.35,16.5],starDepth:[15.8,16.7],galaxyFade:[18.8,19.25],galaxyDepth:[18.8,19.25]};
export function skyDirection(u,v){const l=(.5-u)*2*Math.PI,b=(.5-v)*Math.PI;return [Math.cos(b)*Math.cos(l),Math.cos(b)*Math.sin(l),Math.sin(b)];}
export function skyUV(p){const d=Math.hypot(...p);return [((.5-Math.atan2(p[1],p[0])/(2*Math.PI))%1+1)%1,.5-Math.asin(Math.max(-1,Math.min(1,p[2]/d)))/Math.PI];}
export function handoffPhase(s){const P=GALAXY_PHASES;return {starFade:ramp(s,...P.starFade),starDepth:ramp(s,...P.starDepth),galaxyFade:ramp(s,...P.galaxyFade),galaxyDepth:ramp(s,...P.galaxyDepth)};}
export function projectRay(ray,inverseDistance,camera,distance,depth){
 const q=ray.map((v,i)=>v-camera.n[i]*distance*depth*inverseDistance),den=-dot(q,camera.n);
 return den>1e-7?[dot(q,camera.r)/den,dot(q,camera.u)/den]:[NaN,NaN];
}

// Optical sky dome: cross outside at6,000ly frame width, leave only2%
// illumination by50,000ly, and retire completely at70,000ly.
export const SHELL_TIMING={start:Math.log10(6000*LY),barely:Math.log10(50000*LY),end:Math.log10(70000*LY)};
export function galacticShell(s){
 const {start,barely,end}=SHELL_TIMING;
 const crossingRadius=6000*LY/(2*Math.tan(25*Math.PI/180)*KPC*1.02);
 const radius=s<=start?8+(crossingRadius-8)*ramp(s,18.8,start):crossingRadius+(1.3-crossingRadius)*ramp(s,start,end);
 const distance=10**s/(2*Math.tan(25*Math.PI/180)*KPC)*ramp(s,18.8,19.25);
 const ratio=distance/radius;
 const alpha=ratio<=1.02?1:(1-.98*ramp(s,start,barely))*(1-ramp(s,barely,end));
 return {radius,distance,ratio,alpha};
}
