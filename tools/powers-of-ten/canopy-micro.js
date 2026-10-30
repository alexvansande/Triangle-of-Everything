// Registered photographic fields: surface focus gives way to the drop interior.
const smooth=(a,b,x)=>{const t=Math.max(0,Math.min(1,(x-a)/(b-a)));return t*t*(3-2*t)};
const ROOT='/video/powers-of-ten/generated/canopy-test/micro/';
const SPAN=10**1.6/3**6;
export function canopyMicro(){
 const shell=new Image(),wide=new Image(),detail=new Image();
 shell.src=ROOT+'../ladybug-chain/level-2.02mm-natural-v3.png';
 wide.src=ROOT+'field-wide-matched-v2.png';detail.src=ROOT+'field-detail-v2.png';
 // Calibrate the photographed body, not its canvas. Catalogue diameter: 447.7µm.
 const diameter=2*10**(-1.65)/100,detailSpan=diameter*1254/755;
 const wideSpan=detailSpan*1254/602;
 const wideCenter=[320+631.5*602/1254,320+605.5*602/1254];
 const surface=document.createElement('canvas'),interior=document.createElement('canvas');
 return {draw(cam){
  if(window.canopyTest?.enabled===false||[shell,wide,detail].some(p=>!p.complete||!p.naturalWidth))return;
  // Exact sharp replacement precedes any optical change.
  const replacement=1-smooth(Math.log10(.0015),Math.log10(.0018),cam.s);if(!replacement)return;
  const focus=1-smooth(Math.log10(.00072),Math.log10(.0014),cam.s);
  const reveal=1-smooth(Math.log10(.00070),Math.log10(.00125),cam.s);
  const {W,H}=cam.screen;
  for(const c of [surface,interior])if(c.width!==W||c.height!==H){c.width=W;c.height=H}
  const x=W/2+cam.cx-cam.W/2+(570/1254-.5)*SPAN*cam.k;
  const y=H/2+cam.cy-cam.H/2+(605/1254-.5)*SPAN*cam.k;
  const ctx=surface.getContext('2d'),water=interior.getContext('2d');
  ctx.clearRect(0,0,W,H);ctx.globalAlpha=1;
  // Defocus the whole surface coherently, rather than leaving a sharp ring
  // around an artificially blurred patch. Blur is always applied at runtime.
  const parentSide=SPAN/27*cam.k;
  ctx.filter=`blur(${22*focus*cam.min/960}px)`;
  ctx.drawImage(shell,x-parentSide/2,y-parentSide/2,parentSide,parentSide);ctx.filter='none';
  water.clearRect(0,0,W,H);water.globalCompositeOperation='source-over';water.globalAlpha=1;
  water.filter=`blur(${10*(1-focus)*cam.min/960}px)`;
  const scale=wideSpan*cam.k/1254;
  water.drawImage(wide,x-wideCenter[0]*scale,y-wideCenter[1]*scale,1254*scale,1254*scale);
  // The finer field replaces its own exact registered parent centre.
  const detailScale=detailSpan*cam.k/1254;
  const left=x-631.5*detailScale,top=y-605.5*detailScale;
  const margin=.08*1254*detailScale;
  const coverage=Math.min(W/2-left,H/2-top,left+1254*detailScale-W/2,top+1254*detailScale-H/2);
  if(coverage>cam.min/2+margin)water.drawImage(detail,left,top,1254*detailScale,1254*detailScale);
  water.filter='none';
  // Keep the new view within the physical bead until its boundary exits frame.
  const r=.00058*cam.k,g=water.createRadialGradient(x,y,.80*r,x,y,r);
  g.addColorStop(0,'#000');g.addColorStop(1,'#0000');
  water.globalCompositeOperation='destination-in';water.fillStyle=g;water.fillRect(0,0,W,H);
  water.globalCompositeOperation='source-over';
  ctx.globalAlpha=reveal;ctx.drawImage(interior,0,0);ctx.globalAlpha=1;
  cam.ctx.save();cam.ctx.setTransform(1,0,0,1,0,0);cam.ctx.globalAlpha=replacement;cam.ctx.drawImage(surface,0,0);cam.ctx.restore();
 }};
}
