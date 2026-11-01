import {rng,ramp,LY} from './math.js';
export function buildFilaments(){
 const r=rng(8701),strands=[];
 for(const [count,radius]of [[90,.075],[150,.91]]){
  const nodes=[];while(nodes.length<count){const p=[r()*2-1,r()*2-1,r()*2-1];if(Math.hypot(...p)<1)nodes.push(p.map(v=>v*radius));}
  const edges=new Set();nodes.forEach((p,i)=>{
   const neighbours=nodes.map((q,j)=>({j,d:Math.hypot(...p.map((v,k)=>v-q[k]))})).filter(q=>q.j!==i).sort((a,b)=>a.d-b.d).slice(0,3);
   for(const {j}of neighbours){const key=[Math.min(i,j),Math.max(i,j)].join(':');if(edges.has(key))continue;edges.add(key);const q=nodes[j],length=Math.hypot(...p.map((v,k)=>v-q[k])),bend=[r()-.5,r()-.5,r()-.5];
    for(let brush=0;brush<4;brush++){const pts=[];for(let t=0;t<=32;t++){const u=t/32,envelope=Math.sin(Math.PI*u);const point=p.map((v,k)=>v+(q[k]-v)*u+envelope*length*(bend[k]*.9+.018*Math.sin(u*9+brush*1.4+k)));const radius=Math.hypot(...point);pts.push(radius>.97?point.map(v=>v*.97/radius):point);}strands.push({pts,brush,radius});}
   }
  });
 }return strands;
}
export function filamentBrush(){
 const strands=buildFilaments(),R=46e9*LY,TAN=Math.tan(20*Math.PI/180);
 return cam=>{
  if(!cam.cmbView)return;const a=ramp(cam.s,24.3,25.2),projection=ramp(cam.s,25.6,26.45);if(!a)return;
  const dot=(p,v)=>p.reduce((s,w,i)=>s+w*v[i],0),scale=(1-projection)*2*R*cam.min/(cam.F*cam.W)+projection/TAN,ctx=cam.ctx;
  ctx.save();ctx.globalCompositeOperation='screen';ctx.lineCap='round';ctx.lineJoin='round';
  for(const line of strands){const visible=line.radius<.1?1-ramp(cam.s,25.35,26.1):ramp(cam.s,25.1,25.8);if(!visible)continue;ctx.beginPath();let begun=false;
   for(const p of line.pts){const z=dot(p,cam.cam.n),w=1-projection+projection*(cam.cmbView.dist-z);if(w<.02){begun=false;continue;}const x=cam.W/2+dot(p,cam.cam.r)*scale/w*cam.W/2,y=cam.H/2-dot(p,cam.cam.u)*scale/w*cam.H/2;if(begun)ctx.lineTo(x,y);else{ctx.moveTo(x,y);begun=true;}}
   ctx.strokeStyle=`rgba(255,${183+line.brush*13},${83+line.brush*18},${a*visible*(.14+.028*line.brush)})`;ctx.lineWidth=(line.brush===0?3.8:1.15)*cam.dpr;ctx.stroke();
  }ctx.restore();
 };
}
