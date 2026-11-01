import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
const root=new URL('../video/powers-of-ten/generated/cosmic-web-v1/',import.meta.url),meta=JSON.parse(await readFile(new URL('scene.json',root))),raw=await readFile(new URL('points.bin',root));
assert.equal(raw.length,meta.counts.reduce((n,c)=>n+c.count,0)*meta.stride*4);
const p=new Float32Array(raw.buffer,raw.byteOffset,raw.byteLength/4),octants=[new Set(),new Set()],counts=[0,0],bins=new Uint32Array(16**3);
for(let i=0;i<p.length;i+=9){
 const [x,y,z,r,g,b,w,k,lod]=p.subarray(i,i+9);assert.ok([x,y,z,r,g,b,w,k,lod].every(Number.isFinite));assert.ok(lod===0||lod===1);
 assert.ok(Math.hypot(x,y,z)<=meta.counts[lod].radius+1e-6);assert.ok(w>=0&&w<=1&&k>=0&&k<=1);assert.ok(r>0&&r<=1&&g>0&&g<=1&&b>0&&b<=1);
 counts[lod]++;octants[lod].add((x>0?1:0)+(y>0?2:0)+(z>0?4:0));
 if(lod===1&&Math.abs(x)<.35&&Math.abs(y)<.35&&Math.abs(z)<.35){const c=[x,y,z].map(v=>Math.floor((v+.35)/.7*16));bins[(c[0]*16+c[1])*16+c[2]]++;}
}
assert.deepEqual(counts,meta.counts.map(c=>c.count));for(const set of octants)assert.equal(set.size,8);
// Inside this fully contained cube, uniform noise has Poisson variance≈mean.
// A substantially higher ratio verifies real void/filament density structure.
const mean=bins.reduce((a,b)=>a+b,0)/bins.length,variance=bins.reduce((a,b)=>a+(b-mean)**2,0)/bins.length;
assert.ok(variance/mean>2,'density must be clustered into filaments and voids, not a uniform noise ball');
console.log('Passed:',counts.join(' + '),'finite3D density samples, correct radial bounds/alpha, all octants; voxel variance/mean',Math.round(variance/mean*100)/100);
