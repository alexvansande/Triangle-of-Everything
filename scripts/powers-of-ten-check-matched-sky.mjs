import assert from 'node:assert/strict';
import sharp from 'sharp';
import {readFile} from 'node:fs/promises';
import {lb,dot,cross,norm} from '../tools/powers-of-ten/math.js';
import {handoffPhase} from '../tools/powers-of-ten/galaxy-geometry.js';
const root=new URL('../video/powers-of-ten/generated/matched-sky-v1/',import.meta.url),meta=JSON.parse(await readFile(new URL('scene.json',root)));
for(const [name,orb]of [['galaxy',false],['nearby',true]]){
 const raw=await readFile(new URL(name+'-points.bin',root)),points=new Float32Array(raw.buffer,raw.byteOffset,raw.length/4);
 assert.equal(points.length/10,meta[name==='galaxy'?'galaxyCount':'nearbyCount']);
 for(let i=0;i<points.length;i+=10){assert.ok(Math.abs(Math.hypot(points[i],points[i+1],points[i+2])-1)<1e-6);for(let j=0;j<10;j++)assert.ok(Number.isFinite(points[i+j]));assert.ok(points[i+3]>0&&points[i+8]>0&&points[i+9]>0);if(!orb)assert.ok(1/points[i+3]<35,'galaxies excluded from Milky Way point distances');}
 const {data,info}=await sharp(new URL(name+'-map.png',root).pathname).raw().toBuffer({resolveWithObject:true});assert.equal(info.width,8192);assert.equal(info.height,4096);
 // Independently evaluate the spherical billboard equation at12 point-centred
 // atlas pixels, summing the entire buffer. This verifies actual exported maps,
 // including overlap, positions, colours, footprint, kernel and8-bit radiance.
 for(let t=0;t<12;t++){
  const j=((t*7919+127)%(points.length/10))*10,p=points.subarray(j,j+3),u=((.5-Math.atan2(p[1],p[0])/(2*Math.PI))%1+1)%1,v=.5-Math.asin(p[2])/Math.PI,x=Math.min(8191,(u*8192)|0),y=Math.min(4095,(v*4096)|0),ray=lb((.5-(x+.5)/8192)*360,(.5-(y+.5)/4096)*180),sum=[0,0,0];
  for(let i=0;i<points.length;i+=10){const d=points.subarray(i,i+3),den=dot(ray,d);if(den<.9999)continue;const right=norm(cross(Math.abs(d[2])>.98?[0,1,0]:[0,0,1],d)),up=cross(d,right),r=(dot(ray,right)/den/points[i+8])**2+(dot(ray,up)/den/points[i+8])**2;if(r>1)continue;const a=(orb?.7*Math.exp(-12*r)+.3*Math.exp(-3*r):Math.exp(-4*r))*points[i+9];for(let c=0;c<3;c++)sum[c]+=points[i+4+c]*a;}
  for(let c=0;c<3;c++)assert.ok(Math.abs(Math.round(Math.min(1,sum[c])*255)-data[(y*8192+x)*3+c])<=1,`${name} atlas pixel and3D kernel differ`);
 }
 console.log(name,points.length/10,'valid3D points,8K map,12 full-buffer radiance/footprint comparisons passed');
}
for(const s of [15.5,16,16.49]){const p=handoffPhase(s);assert.equal(p.starDepth,0);}
assert.equal(handoffPhase(16.5).starFade,1);assert.equal(handoffPhase(18.8).galaxyFade,1);assert.equal(handoffPhase(18.8).galaxyDepth,0);
console.log('Passed: full map replacement precedes depth for both populations.');
