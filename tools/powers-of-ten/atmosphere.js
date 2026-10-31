// Persistent sharp cloud planes above the terrain; perspective takes them
// through the frame edges as the camera crosses each altitude.
export function atmosphereLayer(){
 const images=[1,2,3,4,5,6,8].map(i=>{
  const p={image:null},im=new Image();
  im.onload=()=>{const c=document.createElement('canvas');c.width=im.naturalWidth;c.height=im.naturalHeight;const x=c.getContext('2d');x.drawImage(im,0,0);const pixels=x.getImageData(0,0,c.width,c.height);for(let j=3;j<pixels.data.length;j+=4)pixels.data[j]=Math.min(255,pixels.data[j]*2.5);x.putImageData(pixels,0,0);p.image=c};
  im.src=`/video/powers-of-ten/photos/clouds/wisp-${i}.webp`;return p;
 });
 const planes=[
  [8500,-22000,-9000,36000,0],[8500,26000,15000,40000,1],
  [7000,-3500,1200,5800,2],[7000,3800,-1800,6200,3],
  [4200,-1400,-900,2300,4],[4200,1550,800,2600,5],
 ];
 return {draw(cam){
  if(cam.s<3.45||cam.s>6.9||window.canopyTest?.clouds===false)return;
  const altitude=cam.F/(2*Math.tan(25*Math.PI/180)),ctx=cam.ctx;
  const far=Math.max(0,Math.min(1,(6.9-cam.s)/.45));
  ctx.save();ctx.globalAlpha=far;
  for(const [height,x,y,span,i] of planes){
   const im=images[i].image;if(!im||altitude<=height)continue;
   const magnification=altitude/(altitude-height),side=span*cam.k*magnification;
   const px=cam.cx+x*cam.k*magnification,py=cam.cy+y*cam.k*magnification;
   const extent=side/2,left=(cam.W-cam.screen.W)/2,top=(cam.H-cam.screen.H)/2;
   if(px+extent<left||px-extent>left+cam.screen.W||py+extent<top||py-extent>top+cam.screen.H)continue;
   // No close-range alpha fade: cloud transparency belongs to its texture.
   ctx.filter=`blur(${Math.max(0,Math.min(12,(magnification-2)*2))*cam.min/960}px)`;
   ctx.drawImage(im,px-extent,py-extent,side,side);
  }
  ctx.restore();
 }};
}
