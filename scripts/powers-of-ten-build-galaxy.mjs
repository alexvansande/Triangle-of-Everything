// Build a galaxy by sampling an equirectangular radiance map, then assigning
// distance along each fixed sightline from a disc/bulge/spiral density model.
import sharp from 'sharp';
import {readFile,writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {rng} from '../tools/powers-of-ten/math.js';
const root=resolve(import.meta.dirname,'..'),out=resolve(root,'video/powers-of-ten/generated/galaxy-handoff-v2');
const W=512,H=256,N=360000,random=rng(20261031);
const {data}=await sharp(resolve(out,'sky-diffuse.png')).resize(W,H).removeAlpha().raw().toBuffer({resolveWithObject:true});
const cdf=new Float64Array(W*H);let total=0,lumSum=0;
for(let y=0;y<H;y++)for(let x=0;x<W;x++){
 const k=y*W+x,r=data[3*k]/255,g=data[3*k+1]/255,b=data[3*k+2]/255;
 const L=.2126*r+.7152*g+.0722*b,solid=Math.cos((.5-(y+.5)/H)*Math.PI);
 total+=L*solid;lumSum+=L*solid;cdf[k]=total;
}
function lower(a,v){let l=0,h=a.length;while(l<h){const m=(l+h)>>1;if(a[m]<v)l=m+1;else h=m;}return l;}
const GW=256,GH=512,STEPS=160,step=.22,depths=new Float64Array(GW*GH*STEPS),depthTotals=new Float64Array(GW*GH);
function density(x,y,z){
 const X=x-8.2,R=Math.hypot(X,y),phi=Math.atan2(y,X);
 if(R>18)return 0;
 const disc=Math.exp(-R/3.3-(z/.18)**2);
 const thick=.005*Math.exp(-R/4-(z/.4)**2);
 const armPhase=4*(phi-Math.log(Math.max(R,.4)/6.8)/Math.tan(18*Math.PI/180));
 const arms=.35+1.7*Math.exp((Math.cos(armPhase)-1)/.18);
 const bulge=3.5*Math.exp(-.5*((X/1.6)**2+(y/.7)**2+(z/.55)**2));
 return disc*(R<3.5?1:arms)+thick+bulge;
}
for(let y=0;y<GH;y++)for(let x=0;x<GW;x++){
 const l=(.5-(x+.5)/GW)*2*Math.PI,b=(.5-(y+.5)/GH)*Math.PI;
 const dx=Math.cos(b)*Math.cos(l),dy=Math.cos(b)*Math.sin(l),dz=Math.sin(b);let sum=0;
 for(let i=0;i<STEPS;i++){const d=(i+.5)*step;sum+=density(dx*d,dy*d,dz*d)*d*d;depths[(y*GW+x)*STEPS+i]=sum;}
 depthTotals[y*GW+x]=sum;
}
const radianceIntegral=lumSum*(2*Math.PI/W)*(Math.PI/H);
let modelIntegral=0;
for(let y=0;y<GH;y++)for(let x=0;x<GW;x++)modelIntegral+=depthTotals[y*GW+x]*Math.cos((.5-(y+.5)/GH)*Math.PI)*(2*Math.PI/GW)*(Math.PI/GH);
const points=new Float32Array(N*8),face=new Float32Array(768*768*3);let min=Infinity,max=0;
for(let j=0;j<N;j++){
 const k=lower(cdf,random()*total),x=k%W,y=(k/W)|0,u=(x+random())/W,v=(y+random())/H;
 const l=(.5-u)*2*Math.PI,b=(.5-v)*Math.PI,dir=[Math.cos(b)*Math.cos(l),Math.cos(b)*Math.sin(l),Math.sin(b)];
 const cell=Math.min(GH-1,(v*GH)|0)*GW+Math.min(GW-1,(u*GW)|0),sum=depthTotals[cell];
 const target=random()*sum;let a=0,z=STEPS-1;
 while(a<z){const m=(a+z)>>1;if(depths[cell*STEPS+m]<target)a=m+1;else z=m;}
 let distance=(a+random())*step;
 if(sum<1e-12)distance=.05+random()*.35;
 // Preserve the extended Magellanic clouds as external systems, not local dust.
 if(((u-.721)/.026)**2+((v-.683)/.031)**2<1)distance=50+(random()-.5)*8;
 if(((u-.659)/.018)**2+((v-.744)/.024)**2<1)distance=62+(random()-.5)*6;
 distance=Math.max(.015,distance);min=Math.min(min,distance);max=Math.max(max,distance);
 const R=data[3*k]/255,G=data[3*k+1]/255,B=data[3*k+2]/255,L=Math.max(.001,.2126*R+.7152*G+.0722*B);
 // The map fixes initial angular radiance. After depth appears, correct for
 // extinction and the model's angular mass distribution so far arms aren't
 // permanently underrepresented just because dust hides them from the Sun.
 const modelWeight=distance>35?.025:Math.max(.00001,depthTotals[cell]/L*radianceIntegral/modelIntegral*8.2**2/distance**2);
 points.set([...dir,1/distance,R/L,G/L,B/L,modelWeight],j*8);
 const px=Math.floor((dir[0]*distance-8.2+20)/40*768),py=Math.floor((dir[1]*distance+20)/40*768);
 if(px>=0&&px<768&&py>=0&&py<768){const q=3*(py*768+px);const intrinsic=(distance/8.2)**2*modelWeight;face[q]+=R/L*intrinsic;face[q+1]+=G/L*intrinsic;face[q+2]+=B/L*intrinsic;}
}
await writeFile(resolve(out,'galaxy-points.bin'),Buffer.from(points.buffer));
await writeFile(resolve(out,'galaxy-points.json'),JSON.stringify({count:N,stride:8,fields:['directionX','directionY','directionZ','inverseDistanceKpc','redOverLuminance','greenOverLuminance','blueOverLuminance','finiteModelWeight'],radianceIntegral,seed:20261031,distanceKpc:[min,max],galacticCentreKpc:[8.2,0,0],model:'Conditional distance along fixed sightline; thin/thick disc, bar-bulge, four logarithmic arms; Magellanic clouds50/62kpc',source:'sky-diffuse.png'},null,2)+'\n');
const rgb=Buffer.alloc(768*768*3);for(let i=0;i<rgb.length;i++)rgb[i]=Math.round(255*(1-Math.exp(-face[i]*.14)));
await sharp(rgb,{raw:{width:768,height:768,channels:3}}).png().toFile(resolve(out,'face-on-check.png'));
console.log(JSON.stringify({points:N,radianceIntegral,distanceKpc:[min,max],native:await sharp(resolve(out,'sky-diffuse.png')).metadata()}));
