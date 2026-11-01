// One continuous code-rendered approach: guanine → selected hydrogen cloud.
// The proton/quark renderer remains a separate live layer at the same origin.
import {ramp,rng} from './math.js';
import {core,makeGuanineScene,GUANINE_SPAN,GUANINE_LIGHT,SNAPSHOT_TIME,YAW,PITCH} from './guanine-scene.js';
const ROOT='/video/powers-of-ten/generated/guanine-bridge-v2/';
export function guanineApproach(){
 const img=new Image();img.src=ROOT+'guanine-flat.png';
 let renderer,near,back;
 try{renderer=new core.Renderer({alpha:true});const create=(include,approach=false)=>{const scene=makeGuanineScene(include,approach),view=new core.HopfView(renderer,null,scene.particle);view.yaw=YAW;view.pitch=PITCH;return {...scene,view};};near=create(j=>j===12,true);back=create(j=>j!==12);}catch(e){console.warn('Guanine renderer',e);}
 const rear=document.createElement('canvas'),front=document.createElement('canvas'),mix=document.createElement('canvas');let resolution=0;
 const random=rng(105),wisps=Array.from({length:75},()=>({x:random(),y:random(),r:.03+.13*random(),phase:random()*7}));
 const ready=()=>img.complete&&img.naturalWidth>0&&!!renderer;
 return {name:'Guanine hydrogen approach',range:[-16.2,-6.5],ready,draw(cam){
  if(!ready())return;const {ctx,W,H,min,s,dpr}=cam;
  for(const c of [rear,front,mix])if(c.width!==W||c.height!==H){c.width=W;c.height=H;}
  const c=mix.getContext('2d');c.clearRect(0,0,W,H);
  const live=1-ramp(s,-9.35,-8.8),depth=1-ramp(s,-10.1,-9.4),inside=1-ramp(s,-11.5,-10.2),black=ramp(s,-16,-14.4);
  const flatSide=GUANINE_SPAN*cam.k;
  if(live<1){c.globalAlpha=1-live;c.drawImage(img,cam.cx-flatSide/2,cam.cy-flatSide/2,flatSide,flatSide);c.globalAlpha=1;}
  if(live>0&&inside<1){
   const px=Math.min(1600,Math.ceil(W/128)*128);if(resolution!==px){renderer.resize(px);resolution=px;}
   const span=cam.F*W/min,flow=SNAPSHOT_TIME+(cam.t-SNAPSHOT_TIME)*(1-ramp(s,-9.85,-9.4));
   for(const [part,canvas]of [[back,rear],[near,front]]){
    const p=canvas.getContext('2d');p.clearRect(0,0,W,H);part.frame(span,depth,1-ramp(s,-10.3,-9.35),W/dpr);part.view.radius=part.particle.frame.radius;part.view.yaw=YAW;part.view.pitch=PITCH;const blend=part===near?1-ramp(s,-10.3,-9.35):0,light={...GUANINE_LIGHT,width:1-.45*blend,bloom:.12+.88*blend,exposure:1+.1*blend};part.view.update(flow,light);renderer.render(part.view,light,[p,0,0,W,H]);
   }
   const defocus=(1-ramp(s,-10.4,-9.35));
   c.globalAlpha=live*(1-inside);c.filter=`blur(${32*defocus*min/960}px)`;c.drawImage(rear,0,0);c.filter='none';
   if(defocus){c.globalCompositeOperation='source-atop';c.fillStyle=`rgba(1,9,30,${.88*defocus})`;c.fillRect(0,0,W,H);c.globalCompositeOperation='source-over';}
   c.drawImage(front,0,0);c.globalAlpha=1;
  }
  // Distant electron light remains blue and diffuse inside the selected cloud,
  // then disappears well before the quark view. Never an enlarged nucleus ball.
  const fog=(1-ramp(s,-10.6,-9.65))*black;
  if(fog>0){
   c.save();c.globalCompositeOperation='lighter';
   // Distant cloud fibers surround the nucleus, rather than an empty black
   // stage. Broad curved sweeps retain their direction through the approach.
   c.filter=`blur(${min*.003}px)`;
   for(let i=0;i<58;i++){
    const q=i/57,offset=(q-.5)*H*1.8,drift=min*.012*Math.sin(cam.t*.055+q*6);
    c.beginPath();c.moveTo(-W*.2,H*.45+offset+drift);
    c.bezierCurveTo(W*.25,H*.02+offset,W*.65,H*.92+offset,W*1.2,H*.38+offset+drift);
    c.strokeStyle=`rgba(24,107,199,${fog*(.075+.065*Math.sin(i*2.4)**2)})`;
    c.lineWidth=min*(.0012+.0018*(.5+.5*Math.sin(i*1.7)));c.stroke();
   }
   c.filter=`blur(${min*.018}px)`;
   for(const w of wisps){const x=(w.x+.012*Math.sin(cam.t*.08+w.phase))*W,y=w.y*H,r=w.r*min,g=c.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,`rgba(12,48,104,${.14*fog})`);g.addColorStop(1,'rgba(0,5,24,0)');c.fillStyle=g;c.fillRect(x-r,y-r,2*r,2*r);}
   c.restore();
  }
  ctx.save();ctx.globalAlpha=1;ctx.drawImage(mix,0,0);ctx.restore();
 }};
}
