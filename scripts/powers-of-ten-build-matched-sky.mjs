// Deterministic coloured stochastic dither -> one3D point per dither sample.
// Both all-sky maps are rasterized from exactly the exported point buffers.
import sharp from 'sharp';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {resolve} from 'node:path';
import {rng,lb,KPC,LY,dot,cross,norm} from '../tools/powers-of-ten/math.js';
const root=resolve(import.meta.dirname,'..'),out=resolve(root,'video/powers-of-ten/generated/matched-sky-v1');await mkdir(out,{recursive:true});
const random=rng(20261101),W=1024,H=512,N=720000,AW=8192,AH=4096;
const {data}=await sharp(resolve(root,'video/powers-of-ten/generated/galaxy-handoff-v2/sky-diffuse.png')).resize(W,H).removeAlpha().raw().toBuffer({resolveWithObject:true});
// Exclude the four photographic neighbour directions, especially the old
// Magellanic patches; fill their sky floor from neighbouring
// longitudes. Their telescope photographs live in extragalactic.js instead.
for(let y=0;y<H;y++)for(let x=0;x<W;x++){
 const u=(x+.5)/W,v=(y+.5)/H;
 if(((u-.721)/.045)**2+((v-.683)/.055)**2<1||((u-.659)/.032)**2+((v-.744)/.043)**2<1||((u-.1634)/.012)**2+((v-.6198)/.015)**2<1||((u-.1289)/.005)**2+((v-.6741)/.006)**2<1){const from=3*(y*W+(x+Math.round(.09*W))%W),to=3*(y*W+x);for(let c=0;c<3;c++)data[to+c]=data[from+c];}
}
const cdf=new Float64Array(W*H);let total=0;
for(let y=0;y<H;y++)for(let x=0;x<W;x++){const k=y*W+x,L=(.2126*data[3*k]+.7152*data[3*k+1]+.0722*data[3*k+2])/255;total+=L*Math.cos((.5-(y+.5)/H)*Math.PI);cdf[k]=total;}
function lower(a,v){let l=0,h=a.length;while(l<h){const m=(l+h)>>1;if(a[m]<v)l=m+1;else h=m;}return l;}
// Reuse the established disc/arm/bulge conditional-distance model's samples.
// Angular dither samples are new; the closest angular cell supplies a real
// positive modelled distance without changing the sample's direction or colour.
const previous=await readFile(resolve(root,'video/powers-of-ten/generated/galaxy-handoff-v2/galaxy-points.bin'));
const old=new Float32Array(previous.buffer,previous.byteOffset,previous.length/4),depthBuckets=Array.from({length:128*64},()=>[]);
for(let j=0;j<old.length;j+=8){if(old[j+3]<1/35)continue;const u=((.5-Math.atan2(old[j+1],old[j])/(2*Math.PI))%1+1)%1,v=.5-Math.asin(old[j+2])/Math.PI;depthBuckets[Math.min(63,(v*64)|0)*128+Math.min(127,(u*128)|0)].push([old[j+3],old[j+7]]);}
const galaxy=new Float32Array(N*10),radius=2*Math.PI/AH;
for(let j=0;j<N;j++){
 const k=lower(cdf,random()*total),u=(k%W+random())/W,v=(((k/W)|0)+random())/H,ray=lb((.5-u)*360,(.5-v)*180);
 const bucket=depthBuckets[Math.min(63,(v*64)|0)*128+Math.min(127,(u*128)|0)],sample=bucket.length?bucket[(random()*bucket.length)|0]:[1/(.08+random()*.3),.01];
 const R=data[3*k]/255,G=data[3*k+1]/255,B=data[3*k+2]/255,L=Math.max(.001,.2126*R+.7152*G+.0722*B);
 galaxy.set([...ray,sample[0],R/L,G/L,B/L,sample[1],radius,.65],j*10);
}
const meta=JSON.parse(await readFile(resolve(root,'tools/sky-points/points.json'))),raw=Buffer.from((await readFile(resolve(root,'tools/sky-points/points.txt'),'utf8')).trim(),'base64');
const ab=raw.buffer.slice(raw.byteOffset,raw.byteOffset+raw.length),dirs=new Int16Array(ab,meta.dir.offset,meta.dir.length),logs=new Uint16Array(ab,meta.logd.offset,meta.logd.length),aux=new Uint8Array(ab,meta.aux.offset,meta.aux.length),types=new Uint8Array(ab,meta.type.offset,meta.type.length),starData=[];
function star(ray,d,c,kind){const rgb=c<.3?[.65,.79,1]:c<1?[1,.94,.82]:[1,.7,.44],importance=(kind===0?1:.55)*(.45+.55/Math.sqrt(Math.max(1,d/8)));starData.push(...norm(ray),KPC/(d*LY),...rgb,1,(.00055+.0018*importance),.8+1.5*importance);}
for(let i=0;i<meta.count;i++){const d=10**(meta.logMin+logs[i]/65535*(meta.logMax-meta.logMin));if(types[i]>1||d<.01||d>150)continue;star([dirs[i*3],-dirs[i*3+2],dirs[i*3+1]],d,aux[i]/255*4-.4,types[i]);}
for(const [l,b,d,c]of [[313.94,-1.93,4.24,1.5],[315.73,-.68,4.37,.7],[31,14.1,5.96,1.5],[227.23,-8.89,8.6,0],[67.45,19.24,25,0],[199.79,-8.96,550,1.5],[84.28,1.99,2600,.1]]){
 const ray=lb(l,b),exists=starData.some((_,i)=>i%10===0&&Math.abs(KPC/(starData[i+3]*LY)-d)<.05&&dot(ray,starData.slice(i,i+3))>.9999);if(!exists)star(ray,d,c,0);
}
const stars=new Float32Array(starData);
function kernel(r,orb){return orb?.7*Math.exp(-12*r)+.3*Math.exp(-3*r):Math.exp(-4*r);}
async function atlas(points,name,orb){
 const pixels=new Float32Array(AW*AH*3);
 for(let j=0;j<points.length;j+=10){
  const ray=Array.from(points.subarray(j,j+3)),right=norm(cross(Math.abs(ray[2])>.98?[0,1,0]:[0,0,1],ray)),up=cross(ray,right),rad=points[j+8],u=((.5-Math.atan2(ray[1],ray[0])/(2*Math.PI))%1+1)%1,v=.5-Math.asin(ray[2])/Math.PI;
  const ry=rad/Math.PI*AH*1.5,rx=Math.min(AW/2,ry/(2*Math.max(.001,Math.cos((.5-v)*Math.PI))));
  for(let y=Math.max(0,Math.floor(v*AH-ry));y<=Math.min(AH-1,Math.ceil(v*AH+ry));y++)for(let xx=Math.floor(u*AW-rx);xx<=Math.ceil(u*AW+rx);xx++){
   const x=(xx%AW+AW)%AW,dir=lb((.5-(x+.5)/AW)*360,(.5-(y+.5)/AH)*180),den=dot(dir,ray);if(den<=0)continue;
   const a=dot(dir,right)/den/rad,b=dot(dir,up)/den/rad,r=a*a+b*b;if(r>1)continue;
   const q=(y*AW+x)*3,e=kernel(r,orb)*points[j+9];for(let c=0;c<3;c++)pixels[q+c]+=points[j+4+c]*e;
  }
 }
 const rgb=Buffer.alloc(AW*AH*3);for(let i=0;i<rgb.length;i++)rgb[i]=Math.round(Math.min(1,pixels[i])*255);
 await sharp(rgb,{raw:{width:AW,height:AH,channels:3}}).png().toFile(resolve(out,name+'-map.png'));
 await writeFile(resolve(out,name+'-points.bin'),Buffer.from(points.buffer));
 console.log(name,points.length/10,'points and8192×4096 map');
}
await atlas(galaxy,'galaxy',false);await atlas(stars,'nearby',true);
await writeFile(resolve(out,'scene.json'),JSON.stringify({version:1,seed:20261101,atlas:[AW,AH],stride:10,fields:['rayX','rayY','rayZ','inverseDistanceKpc','red','green','blue','finiteModelWeight','angularSupportRadians','peakRadiance'],galaxyCount:N,nearbyCount:stars.length/10,galaxySource:'../galaxy-handoff-v2/sky-diffuse.png',galaxyMethod:'Colour-preserving seeded radiance-weighted noise dither; each sample is a single real3D point. LMC/SMC/M31/M33 sky patches excluded, no external-galaxy distance particles. Disc/bulge/arm depths inherited by angular cell from the established model.',nearbySource:'/tools/sky-points/points.txt; Hipparcos/Gaia≤150ly plus named landmarks to2600ly',photometry:'Nearby sizes and glow intensities are visual weights from catalogue kind and distance, not calibrated apparent magnitudes.',projection:'Galactic equirectangular, longitude increases left, latitude north up; Sun at origin; point position=ray/inverseDistanceKpc.',kernel:'Galaxy exp(-4r²), nearby .7exp(-12r²)+.3exp(-3r²), circular unit-support; identical CPU atlas and GPU live equations; additive RGB clamped after accumulation.',limitation:'8-bit atlas quantisation and bilinear texture filtering introduce subtexel differences from live rasterization; matching attributes and angular footprints are exact.'},null,2)+'\n');
