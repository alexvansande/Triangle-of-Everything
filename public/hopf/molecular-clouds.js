// Atom Lab only: separate atom-centred Hopf bundles, no connector geometry.
import {PARTICLES,LOOK,atomicCloudProfile} from './hopf-core.js';
import {MOLECULES} from './molecules.js';
import {BIG} from './big-molecules.js';
import {ELEMENT_COLORS_BY_Z} from './periodic-palette.js';
const Z={H:1,C:6,N:7,O:8,F:9,P:15,S:16,CL:17,FE:26,ZN:30,MG:12,CA:20,NA:11,K:19};
const radii={H:1.2,C:1.7,N:1.55,O:1.52,P:1.8,S:1.8};
const lin=v=>(v/255)**2.2;
export const elementCloudColor=el=>ELEMENT_COLORS_BY_Z[Z[el.toUpperCase()]||6];
const rgb=hex=>[1,3,5].map(i=>lin(parseInt(hex.slice(i,i+2),16)));
const profiles=new Map();
export function molecularCloudParticle(id){
 const source=PARTICLES.find(p=>p.id===id),big=BIG[id],atoms=MOLECULES[id]||big?.dots;
 if(id==='water'||!source||!atoms)return source;
 const R=big?.R||Math.max(...atoms.map(a=>Math.hypot(...a.slice(1))))+2;
 return {...source,N:48,ticks:[],frame:{center:[0,0,0],get radius(){return .92/LOOK.cloudMolecularZoom;}},
  why:'Separate atom-centred Hopf fiber bundles at the molecular coordinates. Each bundle is lit by the element’s radially averaged outer-electron density, with a space-filling display radius. Colours use the same element-family palette as the periodic table. No bond lines. Large structures use fewer fibers per atom to keep the lab interactive.',
  make(){
   const fibers=[],count=Math.max(4,Math.min(LOOK.cloudFibers,Math.floor(9000/atoms.length)));
   atoms.forEach(([el,x,y,z],j)=>{
    el=el.toUpperCase();const atomicZ=Z[el]||6;
    if(!profiles.has(atomicZ))profiles.set(atomicZ,atomicCloudProfile(atomicZ));
    const profile=profiles.get(atomicZ),color=rgb(elementCloudColor(el)),radius=(radii[el]||1.7)*LOOK.cloudAtomRadius/R,at=[x/R,y/R,z/R];
    for(let k=0;k<count;k++){
     const eta=Math.acos(1-2*(k+.5)/count)/2,ce=Math.cos(eta),se=Math.sin(eta),xi=k*Math.PI*(3-Math.sqrt(5))+j*.731;
     fibers.push({open:true,spin:0,flat:1,
      get width(){return LOOK.cloudWidth*radius;},
      curve(u,flow){const th=Math.PI*u,a=xi+th+LOOK.spin*flow,den=1+se*Math.sin(th);return [at[0]+radius*ce*Math.cos(a)/den,at[1]+radius*se*Math.cos(th)/den,at[2]-radius*ce*Math.sin(a)/den];},
      field(q,t,u){
       const r=Math.hypot(...q.map((v,i)=>(v-at[i])/radius)),idx=Math.min(profile.length-1,Math.floor(r*(profile.length-1))),rho=profile[idx];
       const fade=Math.max(0,Math.min(1,(1-r)/.12)),dash=LOOK.dashes===0||LOOK.dashLength>=1?1:((u*LOOK.dashes-t*LOOK.dashSpeed*.08)%1+1)%1<LOOK.dashLength?1:0;
       return [color,LOOK.showCloud?3*Math.sqrt(120/count)*LOOK.cloudGain*Math.pow(rho,LOOK.cloudContrast)*fade*dash*(1+r*r)**2/4:0];
      },color:()=>color});
    }
   });
   return {fibers,solidCount:0,step(){}};
  }};
}
