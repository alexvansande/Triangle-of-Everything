// Only narrated/video views spend work on the rotating icon; the chart uses PNGs.
export async function startCmbIcons(chart,{busy=()=>false}={}){
 const q=new URLSearchParams(location.search);if(!q.has('narrate')&&!q.has('render')&&q.get('cmb3d')!=='1')return;
 const overlay=document.createElement('canvas');overlay.style.cssText='position:absolute;inset:0;width:100%;height:100%;pointer-events:none';chart.append(overlay);const ctx=overlay.getContext('2d');
 let object=null,loading=false,failed=false;
 function draw(){
  const box=chart.getBoundingClientRect(),dpr=Math.min(2,devicePixelRatio||1),W=Math.round(box.width*dpr),H=Math.round(box.height*dpr);if(overlay.width!==W||overlay.height!==H){overlay.width=W;overlay.height=H;}ctx.clearRect(0,0,W,H);
  const images=[...chart.querySelectorAll('image.obj-icon[data-slug="observable-universe"]')].filter(im=>{const r=im.getBoundingClientRect();return r.width>2&&r.right>box.left&&r.left<box.right&&r.bottom>box.top&&r.top<box.bottom});
  if(!images.length){window.__cmbIconPending=0;return;}
  if(!object&&!loading&&!failed){loading=true;import('./cmb-object.js').then(m=>{object=m.cmbObject();failed=!object;loading=false}).catch(e=>{failed=true;loading=false;console.warn('CMB icon: keeping still image',e)})}
  window.__cmbIconPending=failed?0:(!object?.ready()?1:0);if(!object?.ready())return;
  const rect=chart.querySelector('#clip rect'),g=chart.querySelector('g[clip-path="url(#clip)"]'),m=g?.getScreenCTM();ctx.save();if(rect&&m){const a=new DOMPoint(rect.x.baseVal.value,rect.y.baseVal.value).matrixTransform(m),b=new DOMPoint(rect.x.baseVal.value+rect.width.baseVal.value,rect.y.baseVal.value+rect.height.baseVal.value).matrixTransform(m);ctx.beginPath();ctx.rect((a.x-box.left)*dpr,(a.y-box.top)*dpr,(b.x-a.x)*dpr,(b.y-a.y)*dpr);ctx.clip();}
  for(const im of images){const r=im.getBoundingClientRect();let alpha=1;for(let n=im;n&&n!==chart;n=n.parentElement)alpha*=+getComputedStyle(n).opacity;if(alpha<.01)continue;const size=Math.max(64,Math.min(1024,Math.ceil(r.width*dpr/64)*64));object.draw(size,window.__cmbIconTime??performance.now()/1000);im.style.visibility='hidden';ctx.globalAlpha=alpha;ctx.drawImage(object.canvas,(r.left-box.left)*dpr,(r.top-box.top)*dpr,r.width*dpr,r.height*dpr);}ctx.restore();
 }
 function tick(){requestAnimationFrame(tick);if(!busy())draw()}requestAnimationFrame(tick);return{draw};
}
