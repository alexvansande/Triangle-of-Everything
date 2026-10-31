import assert from 'node:assert/strict';
const calls=[];
function context(){return {globalAlpha:1,createLinearGradient(){return {addColorStop(){}}},save(){},restore(){},translate(){},rotate(){},clearRect(){},fillRect(){},drawImage(...args){calls.push({alpha:this.globalAlpha,mode:this.globalCompositeOperation,args});},getImageData(){return {data:new Uint8ClampedArray(96*96*4).fill(150)}}};}
globalThis.document={createElement(){return {width:0,height:0,getContext:()=>context()}}};
globalThis.Image=class {complete=true;naturalWidth=1254;naturalHeight=1254;decode(){return Promise.resolve()}};
const {galaxyHandoff}=await import('../tools/powers-of-ten/galaxy-handoff.js');
const {cameraAt,LY}=await import('../tools/powers-of-ten/math.js');
const h=galaxyHandoff([0,0,0]);
function cam(s){return {ctx:context(),s,F:10**s,k:960/10**s,W:1358,H:1358,min:960,cx:679,cy:679,dpr:1,screen:{W:960,H:960},cam:cameraAt(s)}};
h.drawGalaxy(cam(19.9),1);
for(const s of [19.99,19.9,19.7]){
 calls.length=0;h.drawGalaxy(cam(s),1);
 assert.equal(calls.length,2,'registered handoff draws the same full-resolution plate twice');
 assert.equal(calls[0].args[0],calls[1].args[0]);
 assert.deepEqual(calls[0].args.slice(1),calls[1].args.slice(1));
 assert.ok(Math.abs(calls[0].alpha+calls[1].alpha-1)<1e-12,'no brightness dip');
 assert.equal(calls[1].mode,'lighter');
}
const b=cameraAt(12),p=b.n.map((v,i)=>-v*100*LY+b.r[i]*30*LY);
const a=h.projectStar(cam(12),p),z=h.projectStar(cam(10),p);
assert.ok(Math.hypot(a[0]-z[0],a[1]-z[1])<.1,'distant stars settle continuously into angular sky');
const behind=b.n.map(v=>v*100*LY);
assert.ok(h.projectStar(cam(12),behind).every(Number.isNaN),'behind-camera stars are culled');
console.log('Passed: identical plate registration, conserved handoff brightness, stable distant-star projection and behind-camera culling.');
