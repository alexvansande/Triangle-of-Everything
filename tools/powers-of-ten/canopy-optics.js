// Independent foreground flybys. Foliage focus is handled by canopy-depth.js.
const smooth=(a,b,x)=>{const t=Math.max(0,Math.min(1,(x-a)/(b-a)));return t*t*(3-2*t)};
export function canopyOptics(){
  const plane=new Image();plane.src='/video/powers-of-ten/generated/canopy-test/plane-photographic-v3.png';
  const bird=new Image();bird.src='/video/powers-of-ten/generated/canopy-test/bird-flyby-v1.png';
  return {
    bird(cam){
      if(window.canopyTest?.bird===false||!bird.complete||!bird.naturalWidth)return;
      // Foreground parallax, independent of terrain and reversible with zoom.
      const d=cam.s-1.35;if(d>.82)return;
      const near=10**(-1.85*d),n=.33*cam.min*near;
      const x=cam.W/2-.20*cam.min*near,y=cam.H/2-.10*cam.min*near;
      const blur=closeFlybyBlur(near,cam.min);
      if(outsideFrame(cam,x,y,n,.18,blur))return;
      const ctx=cam.ctx;ctx.save();ctx.globalAlpha=1-smooth(.48,.82,d);
      ctx.translate(x,y);ctx.rotate(.18);
      ctx.filter=`blur(${blur}px)`;
      ctx.drawImage(bird,-n/2,-n/2,n,n);ctx.restore();
    },
    plane(cam){
      if(window.canopyTest?.airplane===false||!plane.complete||!plane.naturalWidth)return;
      // Like crossings.js: the nearer object moves/shrinks faster than the ground.
      const d=cam.s-3.42;
      const near=10**(-1.7*d),n=.28*cam.min*near;
      const x=cam.cx+.21*cam.min*near,y=cam.cy-.15*cam.min*near;
      // Fade only at 6 → 2 pixels in the 3840px video master.
      // Normalize by frame size so preview and exported video agree.
      const masterPixels=n/cam.min*3840;if(masterPixels<=2)return;
      const blur=closeFlybyBlur(near,cam.min);
      if(outsideFrame(cam,x,y,n,-.6,blur))return;
      const alpha=smooth(2,6,masterPixels);
      const ctx=cam.ctx;ctx.save();ctx.globalAlpha=alpha;ctx.translate(x,y);ctx.rotate(-.6);
      ctx.filter=`blur(${blur}px)`;ctx.drawImage(plane,-n/2,-n/2,n,n);ctx.restore();
    }
  };
}

// Cull only once the rotated sprite and its blur are completely outside the
// visible square. A nearby object leaves through the frame, never by fading.
function outsideFrame(cam,x,y,size,angle,blur){
 const r=size*.5*(Math.abs(Math.cos(angle))+Math.abs(Math.sin(angle)))+3*blur;
 const half=cam.min/2,cx=cam.W/2,cy=cam.H/2;
 return x+r<cx-half||x-r>cx+half||y+r<cy-half||y-r>cy+half;
}

// Keep the distant pass crisp, then defocus strongly as a near object fills
// the frame. Strength is identical in the preview and the 3840px master.
export function closeFlybyBlur(near,framePixels){
 return 42*smooth(1.35,5,near)*framePixels/960;
}
