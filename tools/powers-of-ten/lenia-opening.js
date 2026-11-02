const BASE='/video/powers-of-ten/generated/lenia-opening-v2/';
export const openingFrameAt=(s,count=90)=>Math.max(0,Math.min(count-1,(-15.5-s)/5*(count-1)));
export function openingLenia(){
 let meta=null,checked=false,wanted=[],last='',version=0;const cache=new Map(),loading=new Set();
 const canvas=document.createElement('canvas');canvas.width=canvas.height=256;const ctx=canvas.getContext('2d');
 fetch(BASE+'manifest.json').then(r=>{if(!r.ok)throw Error('Opening Lenia bake missing');return r.json()}).then(m=>{meta=m;checked=true}).catch(e=>{checked=true;console.warn(e)});
 function load(n){if(cache.has(n))return cache.get(n);if(!loading.has(n)){loading.add(n);fetch(BASE+String(n).padStart(2,'0')+'.webp').then(r=>{if(!r.ok)throw Error('Opening frame '+n);return r.blob()}).then(createImageBitmap).then(b=>{loading.delete(n);cache.set(n,b);for(const [key,old]of cache)if(cache.size>4&&!wanted.includes(key)){old.close();cache.delete(key);}}).catch(e=>{loading.delete(n);console.error(e)})}return null;}
 return{pending:()=>!checked||wanted.some(n=>!cache.has(n)),get version(){return version},get worldSpan(){return meta?.worldSpan??.7},update(s){
  if(!meta)return null;
  if(s< -21){wanted=[];for(const b of cache.values())b.close();cache.clear();last='';return null;}
  const f=openingFrameAt(s,meta.frames),a=Math.floor(f),b=Math.min(meta.frames-1,a+1),t=f-a;wanted=[a,b];
  const A=load(a),B=load(b);if(!A||!B)return null;
  const key=f.toFixed(5);if(key===last)return null;last=key;
  ctx.globalAlpha=1;ctx.globalCompositeOperation='copy';ctx.drawImage(A,0,0);
  ctx.globalCompositeOperation='source-over';ctx.globalAlpha=t;ctx.drawImage(B,0,0);ctx.globalAlpha=1;
  version++;return canvas;
 }};
}
