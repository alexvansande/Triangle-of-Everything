// Six offline rule-evolved populations. Frame selection depends only on depth.
const BASE='/video/powers-of-ten/generated/lenia-animation-v2/';
export const leniaFrameAt=(depth,layer,count=90)=>Math.max(0,Math.min(count-1,(depth-(5+layer*7)+7)/14*count));
export function leniaAnimation(){
 const atlas=document.createElement('canvas');atlas.width=1536;atlas.height=256;const ctx=atlas.getContext('2d');
 const cache=new Map(),loading=new Set();let available=false,checked=false,wanted=[],lastKey='',version=0,frameCount=30;
 fetch(BASE+'manifest.json').then(r=>{if(!r.ok)throw Error('No baked animation');return r.json()}).then(meta=>{frameCount=meta.frames;available=true;checked=true}).catch(e=>{checked=true;console.warn('Lenia animation: retaining still catalog',e)});
 function load(key){
  if(cache.has(key))return cache.get(key);
  if(!loading.has(key)){loading.add(key);fetch(BASE+key+'.webp').then(r=>{if(!r.ok)throw Error(key);return r.blob()}).then(createImageBitmap).then(bitmap=>{cache.set(key,bitmap);loading.delete(key);for(const [k,b]of cache)if(cache.size>24&&!wanted.includes(k)){b.close();cache.delete(k);}}).catch(e=>{loading.delete(key);console.error(e)});}
  return null;
 }
 return{pending:()=>!checked||(available&&wanted.some(k=>!cache.has(k))),update(depth){
  if(!available)return null;
  const frames=Array.from({length:6},(_,j)=>leniaFrameAt(depth,j,frameCount));
  wanted=frames.flatMap((f,j)=>[Math.floor(f),Math.min(frameCount-1,Math.floor(f)+1)].map(n=>`${j}-${String(n).padStart(2,'0')}`));
  let ready=true;for(const key of wanted)if(!load(key))ready=false;
  // Decode the frames immediately ahead and behind the current sample.
  // Neighbour prefetches do not block this frame or increase decoded memory past 6 MiB.
  for(let j=0;j<6;j++)for(const n of [Math.floor(frames[j])-1,Math.ceil(frames[j])+1])if(n>=0&&n<frameCount)load(`${j}-${String(n).padStart(2,'0')}`);
  if(!ready)return null;
  const key=frames.map(f=>f.toFixed(4)).join('/');if(key===lastKey)return null;lastKey=key;
  ctx.globalCompositeOperation='source-over';ctx.globalAlpha=1;ctx.fillStyle='black';ctx.fillRect(0,0,1536,256);
  for(let j=0;j<6;j++){
   const f=frames[j],a=Math.floor(f),t=f-a;
   ctx.globalAlpha=1;ctx.drawImage(cache.get(`${j}-${String(a).padStart(2,'0')}`),j*256,0);
   ctx.globalAlpha=t;ctx.drawImage(cache.get(`${j}-${String(Math.min(frameCount-1,a+1)).padStart(2,'0')}`),j*256,0);
  }
  ctx.globalAlpha=1;version++;return atlas;
 },get version(){return version}};
}
