import {planckTerrain} from './planck-terrain.js';
import {ramp} from './math.js';
const ROOT='/video/powers-of-ten/generated/terrain-composite-v3/';
const SOFT='/video/powers-of-ten/generated/terrain-soft-v1/';
export function bakedTerrain(){
 let soft=new Set(),meta=null,failed=false,wanted=[],last=null;const cache=new Map(),loading=new Set();
 Promise.all([ROOT,SOFT].map(path=>fetch(path+'manifest.json').then(r=>{if(!r.ok)throw Error('Baked terrain manifest missing');return r.json()}))).then(([m,b])=>{soft=new Set(b.frames);meta=m}).catch(e=>{failed=true;console.error(e)});
 function load(i){if(cache.has(i))return cache.get(i);if(!loading.has(i)){loading.add(i);fetch((soft.has(i)?SOFT:ROOT)+String(i).padStart(3,'0')+'.webp').then(r=>{if(!r.ok)throw Error('Missing terrain frame '+i);return r.blob()}).then(createImageBitmap).then(b=>{cache.set(i,b);loading.delete(i);for(const [n,old]of cache)if(cache.size>4&&!wanted.includes(n)){old.close();cache.delete(n);}}).catch(e=>{loading.delete(i);console.error(e)})}return null;}
 return{pending:()=>!failed&&(!meta||wanted.some(i=>!cache.has(i))),draw(cam){
  if(!meta)return;
  const d=Math.max(0,Math.min(meta.frames-1,(meta.firstScale-cam.s)/meta.step)),a=Math.floor(d),b=Math.min(meta.frames-1,a+1),t=d-a;
  wanted=[a,b];const A=load(a),B=load(b);if(A&&B)last={a,b,t};if(!last)return;
  cam.ctx.imageSmoothingEnabled=true;cam.ctx.imageSmoothingQuality='high';
  for(const [i,weight]of [[last.a,1],[last.b,last.t]]){
   const image=cache.get(i);if(!image)continue;
   const span=meta.padding*10**(meta.firstScale-i*meta.step),side=span/cam.F*cam.min;
   cam.ctx.save();cam.ctx.globalAlpha*=weight;cam.ctx.drawImage(image,(cam.W-side)/2,(cam.H-side)/2,side,side);cam.ctx.restore();
  }
 }};
}

export function imageTerrain(){
 const frames=bakedTerrain(),planck=planckTerrain();
 return{name:'baked Lenia terrain → crisp Planck cells',range:[-36,-14.7],ready:()=>true,pending:()=>frames.pending()||planck.pending(),draw(cam){
  const alpha=1-ramp(cam.s,-15.75,-14.8);if(alpha<=0)return;
  cam.ctx.save();cam.ctx.globalAlpha*=alpha;cam.ctx.imageSmoothingEnabled=false;
  if(!planck.draw(cam))frames.draw(cam);
  cam.ctx.restore();
 }};
}
