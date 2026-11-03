// Shared atom-centred Hopf bundles; luminous orb envelopes are opt-in.
// Atom Lab defaults keep the original pure-fiber appearance.
import {PARTICLES,LOOK,atomicCloudProfile} from './hopf-core.js';
import {MOLECULES} from './molecules.js';
import {BIG} from './big-molecules.js';
import {MOLECULAR_COLORS_BY_SYMBOL} from './molecular-element-colors.js';
const Z={H:1,C:6,N:7,O:8,F:9,P:15,S:16,CL:17,FE:26,ZN:30,MG:12,CA:20,NA:11,K:19};
// Covalent contact radii: directly touching atoms, without bond cylinders.
const radii={H:.31,C:.76,N:.71,O:.66,F:.57,P:1.07,S:1.05,CL:1.02,FE:1.32,ZN:1.22,MG:1.41,CA:1.76,NA:1.66,K:2.03};
export const molecularAtomRadius=(el,size=1.1)=>(radii[el.toUpperCase()]||.8)*size;
const fract=x=>x-Math.floor(x);
export function bundleRotation(index,at){
 const seed=index*12.9898+at[0]*7.23+at[1]*19.37+at[2]*31.7;
 const u=fract(Math.sin(seed+1.1)*43758.5453),v=fract(Math.sin(seed+9.2)*22578.1459),w=fract(Math.sin(seed+19.7)*19642.3491);
 const q=[Math.sqrt(1-u)*Math.sin(2*Math.PI*v),Math.sqrt(1-u)*Math.cos(2*Math.PI*v),Math.sqrt(u)*Math.sin(2*Math.PI*w),Math.sqrt(u)*Math.cos(2*Math.PI*w)];
 return p=>{const [x,y,z,s]=q,t=[2*(y*p[2]-z*p[1]),2*(z*p[0]-x*p[2]),2*(x*p[1]-y*p[0])];return [p[0]+s*t[0]+y*t[2]-z*t[1],p[1]+s*t[1]+z*t[0]-x*t[2],p[2]+s*t[2]+x*t[1]-y*t[0]];};
}
const lin=v=>(v/255)**2.2;
export const elementCloudColor=el=>MOLECULAR_COLORS_BY_SYMBOL[el.toUpperCase()]||MOLECULAR_COLORS_BY_SYMBOL.C;
const rgb=hex=>[1,3,5].map(i=>lin(parseInt(hex.slice(i,i+2),16)));
const profiles=new Map();
export function molecularCloudParticle(id,options={}){
 const source=PARTICLES.find(p=>p.id===id),big=BIG[id],atoms=options.atoms||MOLECULES[id]||big?.dots;
 if(id==='water'||!source||!atoms)return source;
 const look=options.look||LOOK;
 const R=options.normalization||big?.R||Math.max(...atoms.map(a=>Math.hypot(...a.slice(1))))+2;
 return {...source,N:48,ticks:[],frame:{center:[0,0,0],get radius(){return .92/look.cloudMolecularZoom;}},
  why:'Separate atom-centred Hopf fiber bundles at the molecular coordinates. Each bundle is lit by the element’s radially averaged outer-electron density, with a contact display radius so bonded neighbours touch directly. Element colours follow the exact user-supplied 118-element display palette. Each atom has a stable independent 3D fiber orientation. No bond lines. Large structures use fewer fibers per atom to keep the lab interactive.',
  make(){
   const fibers=[],defaultCount=Math.max(4,Math.min(look.cloudFibers,Math.floor(18000/atoms.length)));
   atoms.forEach(([el,x,y,z],j)=>{
    if(options.include&&!options.include(j))return;
    el=el.toUpperCase();const atomicZ=Z[el]||6;
    if(!profiles.has(atomicZ))profiles.set(atomicZ,atomicCloudProfile(atomicZ));
    const profile=profiles.get(atomicZ),color=rgb(elementCloudColor(el)),radius=molecularAtomRadius(el,look.cloudAtomRadius)/R,at=[x/R,y/R,z/R],orient=bundleRotation(j,[x,y,z]);
    const count=options.fibersForAtom?.(j)??defaultCount;
    if(options.orbs)for(let axis=0;axis<3;axis++)fibers.push({
     glow:true,open:false,spin:0,flat:1,
     get width(){return radius*.72;},
     intensity:()=>.34*(look.cloudOrb??0),
     curve(u){const t=u*2*Math.PI,q=[radius*.32*Math.cos(t),radius*.32*Math.sin(t),0];return q.map((_,i)=>at[i]+q[(i+axis)%3]);},
     color:()=>color
    });
    for(let k=0;k<count;k++){
     const eta=Math.acos(1-2*(k+.5)/count)/2,ce=Math.cos(eta),se=Math.sin(eta),xi=k*Math.PI*(3-Math.sqrt(5))+j*.731;
     fibers.push({open:true,spin:0,flat:1,
      get width(){return Math.min(look.cloudWidth*radius,options.maxWidth?.()??Infinity);},
      curve(u,flow){const th=Math.PI*u,a=xi+th+look.spin*flow,den=1+se*Math.sin(th);return orient([ce*Math.cos(a)/den,se*Math.cos(th)/den,-ce*Math.sin(a)/den]).map((v,i)=>at[i]+radius*v);},
      field(q,t,u){
       const r=Math.hypot(...q.map((v,i)=>(v-at[i])/radius)),idx=Math.min(profile.length-1,Math.floor(r*(profile.length-1))),rho=profile[idx];
       const fade=Math.max(0,Math.min(1,(1-r)/.12)),dash=look.dashes===0||look.dashLength>=1?1:((u*look.dashes-t*look.dashSpeed*.08)%1+1)%1<look.dashLength?1:0;
       return [color,look.showCloud?.9*Math.sqrt(120/count)*look.cloudGain*(1-.84*(look.cloudOrb??0))*(.28+.72*Math.pow(rho,look.cloudContrast))*fade*dash*(1+r*r)**2/4:0];
      },color:()=>color});
    }
   });
   return {fibers,solidCount:0,step(){}};
  }};
}
