// Separate optical planes: sharp foreground, slower independently blurred back.
const smooth=(a,b,x)=>{const t=Math.max(0,Math.min(1,(x-a)/(b-a)));return t*t*(3-2*t)};
const DIR='/video/powers-of-ten/generated/canopy-test/ladybug-chain/';
const SPAN=10**1.6/3**6;
function feather(img){
  const n=img.naturalWidth,c=document.createElement('canvas');c.width=c.height=n;
  const ctx=c.getContext('2d');ctx.drawImage(img,0,0,n,n);ctx.globalCompositeOperation='destination-in';
  for(const v of [false,true]){
    const g=ctx.createLinearGradient(0,0,v?0:n,v?n:0);
    g.addColorStop(0,'#0000');g.addColorStop(.045,'#000');g.addColorStop(.955,'#000');g.addColorStop(1,'#0000');
    ctx.fillStyle=g;ctx.fillRect(0,0,n,n);
  }
  return c;
}
export function canopyDepth(){
  let background=null;const back=new Image();back.onload=()=>background=back;back.src=DIR+'background-sharp-v2.png';
  const specs=[
    {file:'matched/foreground.png',span:SPAN*3,raw:true},
    ...[['18.2mm',1],['6.07mm',2],['2.02mm',3]].map(([name,k])=>({file:name==='2.02mm'?'../micro/layers-v3/flat.png':`matched/${name}.png`,span:SPAN/3**k,x:(570/1254-.5)*SPAN,y:(605/1254-.5)*SPAN,detail:true})),
  ];
  for(const p of specs){const img=new Image();img.onload=()=>p.img=p.raw?img:feather(img);img.src=DIR+p.file}
  const layer=document.createElement('canvas'),blurred=document.createElement('canvas');
  let backKey='';
  return {draw(cam){
    if(window.canopyTest?.enabled===false||window.canopyTest?.depth===false)return;
    // First finish replacing the flat scene (14 → 10 cm), then introduce
    // parallax below 9 cm. No relative layer motion during the handoff.
    const opacity=1-smooth(Math.log10(.10),Math.log10(.14),cam.s);
    if(opacity<=0||!background||!specs[0].img)return;
    const {W,H}=cam.screen;
    for(const c of [layer,blurred])if(c.width!==W||c.height!==H){c.width=W;c.height=H;backKey=''}
    const ctx=layer.getContext('2d'),b=blurred.getContext('2d');
    // Lock both planes to the same 1× zoom until the handoff has finished.
    // Ease the back from 1× to 0.55× without a scale or velocity jump.
    const travel=Math.max(0,Math.log10(.09)-cam.s);
    const lag=.45*(travel-.15*(1-Math.exp(-travel/.15)));
    const side=SPAN*3*cam.k*10**(-lag);
    const strength=smooth(0,.7,travel);
    const radius=window.canopyTest?.macro===false?0:29*strength*cam.min/960;
    // Blur the entire back plane before compositing. Pad beyond frame to avoid halos.
    const dx=cam.cx-cam.W/2,dy=cam.cy-cam.H/2;
    const backShift=10**(-lag);
    const key=[W,H,cam.s,dx,dy,window.canopyTest?.macro].join(':');
    if(backKey!==key){
      b.clearRect(0,0,W,H);b.filter=`blur(${radius}px)`;
      b.drawImage(background,W/2+dx*backShift-side/2,H/2+dy*backShift-side/2,side,side);b.filter='none';backKey=key;
    }
    ctx.setTransform(1,0,0,1,0,0);ctx.clearRect(0,0,W,H);ctx.drawImage(blurred,0,0);
    // Convert the rotated world canvas centre into the stage's pixel coordinates.
    for(const p of specs){
      if(!p.img)continue;const n=p.span*cam.k;if(n<2||n>cam.min*40)continue;
      ctx.globalAlpha=p.detail?smooth(.28,.95,n/cam.min):1;
      // Keep the lower spray: width coverage by a transparent finer cutout
      // does not mean its holes or lower edge have replaced this branch.
      // The opaque shell close-ups eventually cover it naturally.
      ctx.drawImage(p.img,W/2+dx+(p.x||0)*cam.k-n/2,H/2+dy+(p.y||0)*cam.k-n/2,n,n);
    }
    ctx.globalAlpha=1;
    cam.ctx.save();cam.ctx.setTransform(1,0,0,1,0,0);cam.ctx.globalAlpha=opacity;cam.ctx.drawImage(layer,0,0);cam.ctx.restore();
  }};
}
