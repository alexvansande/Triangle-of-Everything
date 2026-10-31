import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import sharp from 'sharp';
import {skyDirection,skyUV,handoffPhase,projectRay,galacticShell} from '../tools/powers-of-ten/galaxy-geometry.js';
import {cameraAt,KPC,LY} from '../tools/powers-of-ten/math.js';
const close=(a,b,t=1e-9)=>assert.ok(Math.abs(a-b)<t,`${a} ≠ ${b}`);
for(let y=1;y<32;y++)for(let x=0;x<64;x++){
 const u=(x+.3)/64,v=y/32,d=skyDirection(u,v),uv=skyUV(d);
 close(uv[0],u);close(uv[1],v);close(Math.hypot(...d),1);
}
assert.deepEqual(skyDirection(.5,.5),[1,0,0]);
assert.equal(handoffPhase(15.8).starDepth,0);
assert.ok(handoffPhase(16).starDepth>0&&handoffPhase(16).starFade<1,'stellar parallax starts gradually while the background changes');
assert.equal(handoffPhase(16.7).starDepth,1);
assert.ok(handoffPhase(19).galaxyDepth>0&&handoffPhase(19).galaxyFade>0,'galactic depth now begins while stars fade in');
for(let s=18.8;s<21.2;s+=.01){const shell=galacticShell(s);if(shell.ratio<=1)assert.equal(shell.alpha,1,'sky must stay fully lit inside the sphere');}
const frame=ly=>Math.log10(ly*LY);
assert.equal(galacticShell(frame(5000)).alpha,1);
close(galacticShell(frame(6000)).alpha,1);
close(galacticShell(frame(50000)).alpha,.02);
assert.equal(galacticShell(frame(70000)).alpha,0);
// Both sides of the old turn threshold must share the same limiting basis.
const before=cameraAt(20.15-1e-6),after=cameraAt(20.15+1e-6);
for(const axis of ['r','u','n'])for(let i=0;i<3;i++)close(before[axis][i],after[axis][i],1e-5);
let previous=cameraAt(frame(13000));
for(let j=1;j<=100;j++){
 const now=cameraAt(frame(13000)+(frame(16000)-frame(13000))*j/100);
 const cosine=previous.n.reduce((sum,v,i)=>sum+v*now.n[i],0);
 assert.ok(Math.acos(Math.max(-1,Math.min(1,cosine)))<.5*Math.PI/180,'no sudden camera step between13k and16kly');previous=now;
}
assert.equal(handoffPhase(18).starDepth,1);assert.equal(handoffPhase(22).galaxyDepth,1);
const basis=cameraAt(15.6),ray=basis.n.map((v,i)=>-v+.12*basis.r[i]);
for(const inverse of [.001,1,10000]){
 const q=projectRay(ray,inverse,basis,100000,0);
 close(q[0],.12);close(q[1],0);
}
const dist=.002,D=.01,depth=.6,p=ray.map(v=>v*dist),q=projectRay(ray,1/dist,basis,D,depth);
const dot=(a,b)=>a.reduce((sum,v,i)=>sum+v*b[i],0),den=D*depth-dot(p,basis.n);
close(q[0],dot(p,basis.r)/den);close(q[1],dot(p,basis.u)/den);
const raw=await readFile(new URL('../video/powers-of-ten/generated/galaxy-handoff-v2/galaxy-points.bin',import.meta.url));
const points=new Float32Array(raw.buffer,raw.byteOffset,raw.byteLength/4);
let thin=0;const histogram=new Uint32Array(64*32);
for(let i=0;i<points.length;i+=8){
 close(Math.hypot(points[i],points[i+1],points[i+2]),1,1e-6);
 const uv=skyUV([points[i],points[i+1],points[i+2]]);histogram[Math.min(31,(uv[1]*32)|0)*64+Math.min(63,(uv[0]*64)|0)]++;
 assert.ok(points[i+3]>0&&Number.isFinite(points[i+3]));
 for(let k=0;k<8;k++)assert.ok(Number.isFinite(points[i+k]));
 assert.ok(points[i+7]>0);
 if(Math.abs(points[i+2]/points[i+3])<.8)thin++;
}
assert.ok(thin/(points.length/8)>.8,'model remains a thin galactic disc with a bulge');
const source=await sharp(new URL('../video/powers-of-ten/generated/galaxy-handoff-v2/sky-diffuse.png',import.meta.url).pathname).resize(512,256).removeAlpha().raw().toBuffer();
const expected=new Float64Array(64*32);let sum=0;
for(let y=0;y<256;y++)for(let x=0;x<512;x++){
 const k=3*(y*512+x),L=(.2126*source[k]+.7152*source[k+1]+.0722*source[k+2])/255;
 const w=L*Math.cos((.5-(y+.5)/256)*Math.PI);expected[(y>>3)*64+(x>>3)]+=w;sum+=w;
}
let variation=0;for(let k=0;k<histogram.length;k++)variation+=Math.abs(histogram[k]/(points.length/8)-expected[k]/sum)/2;
assert.ok(variation<.06,'dot density must reproduce the source brightness map over solid angle');
console.log(`Angular brightness-map total variation: ${variation.toFixed(4)}`);
console.log(`Passed: spherical-map round trips; distance-independent angular registration; early stellar parallax; smooth13k–16kly camera;6k–50kly sphere fade; finite projection; ${points.length/8} valid rays, ${(100*thin/(points.length/8)).toFixed(1)}% within0.8kpc of the plane.`);
