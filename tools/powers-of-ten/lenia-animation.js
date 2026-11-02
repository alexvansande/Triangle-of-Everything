// Six offline rule-evolved populations. Frame selection depends only on depth.
const BASE='/video/powers-of-ten/generated/lenia-animation-v1/';
export const leniaFrameAt=(depth,layer)=>Math.max(0,Math.min(29,(depth-(5+layer*7)+7)/14*30));
export function leniaAnimation(){
 const atlas=document.createElement('canvas');atlas.width=1536;atlas.height=256;const ctx=atlas.getContext('2d');
 const cache=new Map(),loading=new Set();let available=false,checked=false,wanted=[],lastKey='',version=0;
 fetch(BASE+'manifest.json').then(r=>{if(!r.ok)throw Error('No baked animation');return r.json()}).then(()=>{available=true;checked=true}).catch(e=>{checked=true;console.warn('Lenia animation: retaining still catalog',e)});
 function load(key){
  if(cache.has(key))return cache.get(key);
  if(!loading.has(key)){loading.add(key);fetch(BASE+key+'.webp?v=steps10').then(r=>{if(!r.ok)throw Error(key);return r.blob()}).then(createImageBitmap).then(bitmap=>{cache.set(key,bitmap);loading.delete(key);for(const [k,b]of cache)if(cache.size>18&&!wanted.includes(k)){b.close();cache.delete(k);}}).catch(e=>{loading.delete(key);console.error(e)});}
  return null;
 }
 return{pending:()=>!checked||(available&&wanted.some(k=>!cache.has(k))),update(depth){
  if(!available)return null;
  const frames=Array.from({length:6},(_,j)=>leniaFrameAt(depth,j));
  wanted=frames.flatMap((f,j)=>[Math.floor(f),Math.min(29,Math.floor(f)+1)].map(n=>`${j}-${String(n).padStart(2,'0')}`));
  let ready=true;for(const key of wanted)if(!load(key))ready=false;
  if(!ready)return null;
  const key=frames.map(f=>f.toFixed(4)).join('/');if(key===lastKey)return null;lastKey=key;
  ctx.globalCompositeOperation='source-over';ctx.globalAlpha=1;ctx.fillStyle='black';ctx.fillRect(0,0,1536,256);
  for(let j=0;j<6;j++){
   const f=frames[j],a=Math.floor(f),t=f-a;
   ctx.globalAlpha=1;ctx.drawImage(cache.get(`${j}-${String(a).padStart(2,'0')}`),j*256,0);
   ctx.globalAlpha=t;ctx.drawImage(cache.get(`${j}-${String(Math.min(29,a+1)).padStart(2,'0')}`),j*256,0);
  }
  ctx.globalAlpha=1;version++;return atlas;
 },get version(){return version}};
}
