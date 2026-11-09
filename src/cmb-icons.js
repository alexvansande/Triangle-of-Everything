// The observable universe and Our Universe (everything inside the cosmic event horizon) turn live, in 3D, wherever they're on screen: the
// app and the videos (the author, 2026-11-03 and 2026-11-08). Each one's code loads the first time it's
// in view; ?cmb3d=0 keeps the still pictures.
const LIVE={
 'observable-universe':()=>import('./cmb-object.js').then(m=>m.cmbObject()),
 'our-universe':()=>import('./event-horizon-object.js').then(m=>m.eventHorizonObject()),
};
export async function startCmbIcons(chart,{busy=()=>false}={}){
 const q=new URLSearchParams(location.search);if(q.get('cmb3d')==='0')return;
 const overlay=document.createElement('canvas');overlay.style.cssText='position:absolute;inset:0;width:100%;height:100%;pointer-events:none';chart.append(overlay);const ctx=overlay.getContext('2d');
 const state=Object.fromEntries(Object.keys(LIVE).map(slug=>[slug,{object:null,loading:false,failed:false}])),selector=Object.keys(LIVE).map(slug=>`image.obj-icon[data-slug="${slug}"]`).join(',');
 function draw(){
  const box=chart.getBoundingClientRect(),dpr=Math.min(2,devicePixelRatio||1),W=Math.round(box.width*dpr),H=Math.round(box.height*dpr);if(overlay.width!==W||overlay.height!==H){overlay.width=W;overlay.height=H;}ctx.clearRect(0,0,W,H);
  const images=[...chart.querySelectorAll(selector)].filter(im=>{const r=im.getBoundingClientRect();return r.width>2&&r.right>box.left&&r.left<box.right&&r.bottom>box.top&&r.top<box.bottom});
  if(!images.length){window.__cmbIconPending=0;return;}
  let pending=0;
  for(const im of images){const st=state[im.dataset.slug];
   if(!st.object&&!st.loading&&!st.failed){st.loading=true;LIVE[im.dataset.slug]().then(o=>{st.object=o;st.failed=!o;st.loading=false}).catch(e=>{st.failed=true;st.loading=false;console.warn('CMB icon: keeping still image',im.dataset.slug,e)})}
   if(!st.failed&&!st.object?.ready())pending=1;}
  window.__cmbIconPending=pending;
  const rect=chart.querySelector('#clip rect'),g=chart.querySelector('g[clip-path="url(#clip)"]'),m=g?.getScreenCTM();ctx.save();if(rect&&m){const a=new DOMPoint(rect.x.baseVal.value,rect.y.baseVal.value).matrixTransform(m),b=new DOMPoint(rect.x.baseVal.value+rect.width.baseVal.value,rect.y.baseVal.value+rect.height.baseVal.value).matrixTransform(m);ctx.beginPath();ctx.rect((a.x-box.left)*dpr,(a.y-box.top)*dpr,(b.x-a.x)*dpr,(b.y-a.y)*dpr);ctx.clip();}
  for(const im of images){const object=state[im.dataset.slug].object;if(!object?.ready())continue;
   const r=im.getBoundingClientRect();let alpha=1;for(let n=im;n&&n!==chart;n=n.parentElement)alpha*=+getComputedStyle(n).opacity;if(alpha<.01)continue;const size=Math.max(64,Math.min(1024,Math.ceil(r.width*dpr/64)*64));object.draw(size,window.__cmbIconTime??performance.now()/1000);im.style.visibility='hidden';ctx.globalAlpha=alpha;ctx.drawImage(object.canvas,(r.left-box.left)*dpr,(r.top-box.top)*dpr,r.width*dpr,r.height*dpr);}ctx.restore();
 }
 function tick(){requestAnimationFrame(tick);if(!busy())draw()}requestAnimationFrame(tick);return{draw};
}
