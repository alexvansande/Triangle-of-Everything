import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import sharp from 'sharp';
import {GALAXY_PHOTOS,photoFrame,photoProjection,photoDepth,EXTRAGALACTIC_PHASE} from '../tools/powers-of-ten/extragalactic.js';
import {cameraAt,dot,KPC,LY} from '../tools/powers-of-ten/math.js';
const close=(a,b,e=1e-8)=>assert.ok(Math.abs(a-b)<e,`${a} != ${b}`);
assert.ok(EXTRAGALACTIC_PHASE.replace[1]<EXTRAGALACTIC_PHASE.depth[0]);
assert.equal(photoDepth(20.25),0);assert.equal(photoDepth(21.55),1);
for(const g of GALAXY_PHOTOS){
 const f=photoFrame(g);for(const v of [f.ray,f.right,f.up])close(Math.hypot(...v),1);
 close(dot(f.ray,f.right),0);close(dot(f.ray,f.up),0);close(dot(f.right,f.up),0);
 // At replacement, the textured background is independent of target distance.
 const c=cameraAt(19.65),a=photoProjection(g,c,19.65),b=photoProjection({...g,d:g.d*10},c,19.65);
 close(a.x,b.x);close(a.y,b.y);
 // The completed stage is exactly the perspective projection of the real point.
 const s=23,D=10**s/(2*Math.tan(25*Math.PI/180)*KPC),p=f.ray.map(x=>x*g.d),cam=cameraAt(s),q=photoProjection(g,cam,s),den=D-dot(p,cam.n);
 close(q.x,dot(p,cam.r)/den);close(q.y,dot(p,cam.u)/den);
 const {width,height}=await sharp(new URL(`../video/powers-of-ten/galaxies/${g.id}.jpg`,import.meta.url).pathname).metadata();assert.ok(width>2000&&height>2000);
}
// Preserve the established interior sightline; never steer toward a galaxy
// just to keep its photograph in a delivery crop.
for(const s of [18.2,19.3,19.65,20,20.15]){
 const a=cameraAt(18.2),b=cameraAt(s);
 for(const axis of ['r','u','n'])for(let i=0;i<3;i++)close(a[axis][i],b[axis][i]);
}
// Camera keys and projection changes are continuous, including reversing zoom.
for(let s=18;s<23;s+=.002){const a=cameraAt(s),b=cameraAt(s+.002);assert.ok(dot(a.n,b.n)>.9998);}
const credits=JSON.parse(await readFile(new URL('../video/powers-of-ten/galaxies/SOURCES.json',import.meta.url)));for(const g of GALAXY_PHOTOS)assert.ok(credits[g.id+'.jpg'].credit);
console.log('Passed: photograph coordinate frames, angular registration, finite distances, 4K source images, unchanged interior sightline, camera continuity and source credits.');
