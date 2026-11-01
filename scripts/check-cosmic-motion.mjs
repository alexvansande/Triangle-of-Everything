import assert from 'node:assert/strict';
import {cosmicOrbit} from '../tools/powers-of-ten/cosmic-motion.js';
import {cameraAt} from '../tools/powers-of-ten/math.js';
const dot=(a,b)=>a.reduce((n,x,i)=>n+x*b[i],0);
const basis=cameraAt(27.05),turned=cosmicOrbit(basis,.8);
for(const v of Object.values(turned))assert(Math.abs(dot(v,v)-1)<1e-10);
for(const [a,b] of [['r','n'],['r','u'],['n','u']])assert(Math.abs(dot(turned[a],turned[b]))<1e-10);
assert.deepEqual(turned.u,basis.u);assert(dot(turned.n,basis.n)<.8,'view direction must change; not just screen roll');
assert.deepEqual(cosmicOrbit(basis,0),basis);
console.log('Passed: continuous orthonormal 3D orbit changes sightline, preserves roll axis and zero-angle camera.');
const h=1e-4,flat=s=>Object.values(cameraAt(s)).flat();
for(const s of [6.4,10.1,13.5,19.2,22.1,25.2,27.1]){
 const a=flat(s-h),b=flat(s),c=flat(s+h);for(let i=0;i<a.length;i++)assert(Math.abs((b[i]-a[i])/h-(c[i]-b[i])/h)<.004,'continuous angular velocity at '+s);
}
for(let s=6.4;s<27.1;s+=.01){const a=cameraAt(s),b=cameraAt(s+.01);assert(Math.acos(Math.min(1,dot(a.n,b.n)))/.01<60*Math.PI/180,'no catch-up spin');}
console.log('Passed: smooth velocity at every Earth-to-CMB anchor; sightline turns stay below60° per decade.');
