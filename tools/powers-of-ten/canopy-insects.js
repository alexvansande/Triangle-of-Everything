// In-context photograph patch: pose, feet, lighting and contact shadows together.
export function catalogueInsects(){
  const img=new Image();let patch=null;
  img.onload=()=>{
    const n=img.naturalWidth,c=document.createElement('canvas');c.width=c.height=n;
    const x=c.getContext('2d');x.drawImage(img,0,0,n,n);
    // Keep only local feet/contact-shadow neighbourhoods, not a square of sharp
    // background that would look like a tiny inserted photograph when zoomed out.
    const mask=document.createElement('canvas');mask.width=mask.height=n;const m=mask.getContext('2d');
    for(const [cx,cy,r] of [[.485,.48,.15],[.72,.40,.11]]){
      m.save();m.translate(cx*n,cy*n);m.scale(r*n,r*n);
      const g=m.createRadialGradient(0,0,.5,0,0,1);g.addColorStop(0,'#000');g.addColorStop(.25,'#000');g.addColorStop(1,'#0000');
      m.fillStyle=g;m.fillRect(-1,-1,2,2);m.restore();
    }
    x.globalCompositeOperation='destination-in';x.drawImage(mask,0,0);
    patch=c;
  };
  img.src='/video/powers-of-ten/generated/canopy-test/ladybug-chain/matched/5.46cm.png';
  return {draw(cam){
    if(!patch)return;
    const side=(10**1.6/3**6)*cam.k;if(side<3||side>cam.min*8)return;
    // Keep the tiny insects growing continuously rather than fading in late.
    cam.ctx.save();cam.ctx.globalAlpha=1;
    cam.ctx.drawImage(patch,cam.cx-side/2,cam.cy-side/2,side,side);cam.ctx.restore();
  }};
}
