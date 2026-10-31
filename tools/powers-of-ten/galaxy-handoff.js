// Matched galaxy → interior light → local stars → solar-system sky.
// All randomness is seeded. The final particle positions sample the same plate
// we reveal underneath them; only after registration do they become background.
import {ramp,win,rng,dot,cameraAt,LY,KPC} from './math.js';
import {image} from './micro.js';
export const GALAXY_HANDOFF={start:21.65,flat:20.05,plateStart:20.05,starPerspectiveStart:19.1,starPerspectiveEnd:18.25};
const mix=(a,b,t)=>a+(b-a)*t;
const ready=i=>i.complete&&i.naturalWidth>0;
export function galaxyHandoff(gc){
  const plate=image('/video/powers-of-ten/generated/galaxy-handoff-v1/distant-milky-way.png');
  const ref=cameraAt(GALAXY_HANDOFF.flat),random=rng(8934);
  let samples=null,localStars=[],meshTexture=null;
  function prepare(){
    if(samples||!ready(plate))return;
    const c=document.createElement('canvas');c.width=c.height=96;
    const g=c.getContext('2d',{willReadFrequently:true});g.drawImage(plate,0,0,96,96);
    const data=g.getImageData(0,0,96,96).data;
    meshTexture=document.createElement('canvas');meshTexture.width=plate.naturalWidth;meshTexture.height=plate.naturalHeight;
    const mg=meshTexture.getContext('2d');mg.drawImage(plate,0,0);
    mg.globalCompositeOperation='destination-in';
    for(const vertical of [false,true]){
      const fade=mg.createLinearGradient(0,0,vertical?0:meshTexture.width,vertical?meshTexture.height:0);
      fade.addColorStop(0,'#0000');fade.addColorStop(.15,'#000');fade.addColorStop(.85,'#000');fade.addColorStop(1,'#0000');
      mg.fillStyle=fade;mg.fillRect(0,0,meshTexture.width,meshTexture.height);
    }
    // Grid stratification keeps dark dust lanes intact. No independent random
    // lights are added to the diffuse plate, and no bright foreground stars bake in.
    samples=[];
    const anchor=cameraAt(16.5);
    const angle=Math.atan2(dot(ref.r,anchor.u),dot(ref.r,anchor.r)),cs=Math.cos(angle),sn=Math.sin(angle);
    for(let y=0;y<96;y++)for(let x=0;x<96;x++){
      const j=y*96+x,k=4*j;
      samples.push({light:(data[k]+data[k+1]+data[k+2])/765});
      const light=(data[k]+data[k+1]+data[k+2])/765;
      if(random()<light*.85){
        const xx=((x+random())/96-.5)*Math.SQRT2*1.24;
        const yy=((y+random())/96-.5)*Math.SQRT2*1.24;
        const sx=xx*cs-yy*sn,sy=xx*sn+yy*cs;
        const depth=(35+random()**2*900)*LY;
        const tangent=2*Math.tan(25*Math.PI/180);
        localStars.push({p:anchor.r.map((v,i)=>depth*(sx*tangent*v-sy*tangent*anchor.u[i]-anchor.n[i])),light});
      }
    }
  }
  // The same plate transform is used by both the 3D cloud's destination and
  // the full-resolution image. Overscan protects both delivery crops and roll.
  function frame(cam){
    const angle=Math.atan2(dot(ref.r,cam.cam.u),dot(ref.r,cam.cam.r));
    const side=Math.hypot(cam.screen.W,cam.screen.H)*1.24;
    return {angle,side,c:Math.cos(angle),sn:Math.sin(angle)};
  }
  function target(p,cam,f){
    const x=(p.u-.5)*f.side,y=(p.v-.5)*f.side;
    return [cam.cx+x*f.c-y*f.sn,cam.cy+x*f.sn+y*f.c];
  }
  function paintPlate(cam,alpha,additive=false){
    if(alpha<.001||!ready(plate))return;
    const {ctx}=cam,f=frame(cam);ctx.save();ctx.globalAlpha=alpha;
    if(additive)ctx.globalCompositeOperation="lighter";
    ctx.translate(cam.cx,cam.cy);ctx.rotate(f.angle);
    ctx.drawImage(plate,-f.side/2,-f.side/2,f.side,f.side);ctx.restore();
  }
  const background={name:'matched galactic sky',range:[6.8,20.1],draw(cam){
    const a=cam.s<=19.65?ramp(cam.s,6.9,7.6):0;
    paintPlate(cam,a);
  }};
  function drawGalaxy(cam,alpha){
    prepare();if(!samples)return false;
    const t=1-ramp(cam.s,GALAXY_HANDOFF.flat,GALAXY_HANDOFF.start);
    if(t<.001)return false;
    if(t>.999999){
      const replace=1-ramp(cam.s,19.65,20.05);
      paintPlate(cam,alpha*(1-replace));paintPlate(cam,alpha*replace,true);return true;
    }
    const f=frame(cam),ctx=cam.ctx,N=24,vertices=[];
    const turn=t*Math.PI*.48,ct=Math.cos(turn),st=Math.sin(turn);
    const k=cam.min/10**Math.max(cam.s,21.1);
    // A continuous textured light volume avoids visible particle-sized squares.
    // Its vertices are the same image coordinates as the destination sky.
    for(let y=0;y<=N;y++)for(let x=0;x<=N;x++){
      const u=x/N,v=y/N,dx=(u-.5)*34*KPC,dy=(v-.5)*34*KPC;
      const ix=Math.min(95,Math.floor(u*96)),iy=Math.min(95,Math.floor(v*96));
      const dz=(samples[iy*96+ix].light-.25)*1.4*KPC;
      const p=[gc[0]+ct*dx+st*dz,gc[1]+dy,gc[2]-st*dx+ct*dz];
      const q=target({u,v},cam,f);
      vertices.push([mix(cam.cx+k*dot(p,cam.cam.r),q[0],t),mix(cam.cy-k*dot(p,cam.cam.u),q[1],t),u*plate.naturalWidth,v*plate.naturalHeight]);
    }
    ctx.save();ctx.globalAlpha=alpha*ramp(t,0,.2);
    for(let y=0;y<N;y++)for(let x=0;x<N;x++){
      const a=vertices[y*(N+1)+x],b=vertices[y*(N+1)+x+1];
      const c=vertices[(y+1)*(N+1)+x],d=vertices[(y+1)*(N+1)+x+1];
      triangle(ctx,meshTexture,a,b,c);triangle(ctx,meshTexture,d,c,b);
    }
    ctx.restore();return true;
  }
  function triangle(ctx,img,p,q,r){
    const sx=q[2]-p[2],sy=q[3]-p[3],tx=r[2]-p[2],ty=r[3]-p[3],det=sx*ty-sy*tx;
    if(Math.abs(det)<1e-8)return;
    const dx=q[0]-p[0],dy=q[1]-p[1],ex=r[0]-p[0],ey=r[1]-p[1];
    const a=(dx*ty-ex*sy)/det,b=(dy*ty-ey*sy)/det;
    const c=(ex*sx-dx*tx)/det,d=(ey*sx-dy*tx)/det;
    const cx=(p[0]+q[0]+r[0])/3,cy=(p[1]+q[1]+r[1])/3;
    const expand=v=>{const l=Math.hypot(v[0]-cx,v[1]-cy)||1;return [v[0]+.35*(v[0]-cx)/l,v[1]+.35*(v[1]-cy)/l]};
    const P=expand(p),Q=expand(q),R=expand(r);
    ctx.save();ctx.beginPath();ctx.moveTo(...P);ctx.lineTo(...Q);ctx.lineTo(...R);ctx.closePath();ctx.clip();
    ctx.transform(a,b,c,d,p[0]-a*p[2]-c*p[3],p[1]-b*p[2]-d*p[3]);ctx.drawImage(img,0,0);ctx.restore();
  }
  function drawStars(cam,data){
    prepare();
    if(!data||cam.s>21||cam.s<6.9)return;
    const alpha=win(cam.s,6.9,7.6,18.8,19.5),perspective=1-ramp(cam.s,18.25,19.1);
    if(alpha<.01)return;
    const ctx=cam.ctx,{r,u,n}=cam.cam,D=cam.F/(2*Math.tan(25*Math.PI/180));
    // Far stars tend continuously towards angular positions as D → 0. No
    // star-field swap, camera recentering, or whole-field opacity fade at the Sun.
    const limit=Math.max(1200,cam.F/LY*3),count=lowerBound(data.dist,limit);
    const stride=1;
    ctx.save();ctx.globalAlpha=alpha;
    for(const star of localStars){
      const z=dot(star.p,n),den=D-z;
      if(den<=D*.001)continue;
      const scale=mix(1,D/den,perspective);
      const x=cam.cx+dot(star.p,r)*cam.k*scale,y=cam.cy-dot(star.p,u)*cam.k*scale;
      if(x<0||y<0||x>cam.W||y>cam.H)continue;
      ctx.globalAlpha=alpha*(.4+.5*star.light);ctx.fillStyle='#f2e3cf';
      const size=(.65+star.light)*cam.dpr;ctx.fillRect(x-size/2,y-size/2,size,size);
    }
    ctx.globalAlpha=alpha;
    for(let j=0;j<count;j+=stride){
      if(data.kind[j]!==0)continue;
      const p=[data.pos[j*3]*LY,data.pos[j*3+1]*LY,data.pos[j*3+2]*LY];
      const z=dot(p,n),den=D-z;
      if(perspective>.999&&den<=D*.001)continue;
      const sc=den>0?D/den:0;
      const project=mix(1,sc,perspective);
      if(project<=0)continue;
      const x=cam.cx+dot(p,r)*cam.k*project,y=cam.cy-dot(p,u)*cam.k*project;
      if(x<0||y<0||x>cam.W||y>cam.H)continue;
      const colour=data.col[j]/255*4-.4;
      ctx.fillStyle=colour<.3?'#b6ceff':colour<1?'#fff1dc':'#ffd0a0';
      const size=(data.kind[j]===0?1.9:1.05)*cam.dpr;
      ctx.fillRect(x-size/2,y-size/2,size,size);
    }
    ctx.restore();
  }
  function projectStar(cam,p){
    const D=cam.F/(2*Math.tan(25*Math.PI/180)),z=dot(p,cam.cam.n),den=D-z;
    const blend=1-ramp(cam.s,18.25,19.1);
    if(blend>.999&&den<=D*.001)return [NaN,NaN];
    const scale=mix(1,den>0?D/den:0,blend);
    return [cam.cx+dot(p,cam.cam.r)*cam.k*scale,cam.cy-dot(p,cam.cam.u)*cam.k*scale];
  }
  return {background,drawGalaxy,drawStars,projectStar,ready:()=>ready(plate)};
}
function lowerBound(a,v){let lo=0,hi=a.length;while(lo<hi){const m=(lo+hi)>>1;if(a[m]<v)lo=m+1;else hi=m;}return lo;}
