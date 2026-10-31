// One equirectangular map, two registered image-to-point handoffs. Both point
// catalogue stars start at infinity. Galactic points gain depth while the
// still-lit sky shell shrinks; the shell retires only after we cross outside.
import {ramp,dot,lb,LY,KPC,rng,cameraAt} from './math.js';
import {image} from './micro.js';
import {handoffPhase,projectRay,galacticShell} from './galaxy-geometry.js';
const BASE='/video/powers-of-ten/generated/galaxy-handoff-v2/';
const TAN=Math.tan(25*Math.PI/180);
export function galaxyHandoff(){
 const canvas=document.createElement('canvas');
 const gl=canvas.getContext('webgl',{alpha:true,premultipliedAlpha:true,antialias:false,depth:false,preserveDrawingBuffer:true});
 const original=image('/video/powers-of-ten/sky/sky-4k.jpg'),clean=image(BASE+'sky-diffuse.png');
 let textures=null,galaxy=null,stars=null,meta=null,failed=!gl;
 function program(vs,fs){
  const compile=(type,src)=>{const s=gl.createShader(type);gl.shaderSource(s,src);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(s));return s;};
  const p=gl.createProgram();gl.attachShader(p,compile(gl.VERTEX_SHADER,vs));gl.attachShader(p,compile(gl.FRAGMENT_SHADER,fs));gl.linkProgram(p);if(!gl.getProgramParameter(p,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(p));return p;
 }
 let skyProgram,pointProgram,quad;
 if(gl)try{
  skyProgram=program(`attribute vec2 aPosition;varying vec2 vPosition;void main(){vPosition=aPosition;gl_Position=vec4(aPosition,0.,1.);}`,`
   precision highp float;varying vec2 vPosition;uniform sampler2D uOriginal,uClean;uniform vec3 uR,uU,uN;uniform vec2 uFov;uniform float uMix,uAlpha,uSphereRadius,uSphereDistance;
   float grain(vec3 p){return fract(sin(dot(floor(p),vec3(127.1,311.7,74.7)))*43758.5453);}
   void main(){vec3 ray=normalize(-uN+vPosition.x*uFov.x*uR+vPosition.y*uFov.y*uU);
    // Raycast the far wall of a world-space sphere, viewed from C=D*n.
    // Keeping the far root avoids a texture jump as we cross its near wall.
    vec3 eye=uN*uSphereDistance;float b=dot(eye,ray);
    float discriminant=b*b+uSphereRadius*uSphereRadius-dot(eye,eye);
    if(discriminant<0.)discard;
    float travel=-b+sqrt(discriminant);if(travel<=0.)discard;
    vec3 skyRay=normalize(eye+travel*ray);
    vec2 uv=vec2(fract(.5-atan(skyRay.y,skyRay.x)/6.28318530718),.5-asin(clamp(skyRay.z,-1.,1.))/3.14159265359);
    vec3 diffuse=texture2D(uClean,uv).rgb;
    // World-direction grain is stationary on the celestial sphere, not animated
    // screen noise. It wraps naturally at the equirectangular longitude seam.
    float detail=(grain(skyRay*1600.)-.5)*.7+(grain(skyRay*4700.)-.5)*.3;
    diffuse=max(vec3(0.),diffuse*(1.+.22*detail)+vec3(.012*detail));
    vec3 rgb=mix(texture2D(uOriginal,uv).rgb,diffuse,uMix);
    gl_FragColor=vec4(rgb*uAlpha,uAlpha);}`);
  pointProgram=program(`
   precision highp float;attribute vec3 aRay,aColour;attribute float aInvD,aWeight;uniform vec3 uR,uU,uN;uniform vec2 uScale;uniform float uDistance,uDepth,uSize,uEnergy,uModel;varying vec3 vColour;varying float vEnergy;
   void main(){vec3 q=aRay-uN*(uDistance*uDepth*aInvD);float den=-dot(q,uN),r2=max(dot(q,q),.0001);
    if(den<=.000001){gl_Position=vec4(2.,2.,2.,1.);gl_PointSize=1.;vEnergy=0.;}
    else{gl_Position=vec4(dot(q,uR)/den*uScale.x,dot(q,uU)/den*uScale.y,0.,1.);gl_PointSize=uSize;
     float cosine=den/sqrt(r2);vEnergy=min(4.,mix(aWeight,mix(1.,aWeight,uDepth),uModel)*uEnergy/r2/max(.12,cosine*cosine*cosine));}vColour=aColour;}`,`
   precision highp float;varying vec3 vColour;varying float vEnergy;
   void main(){vec2 p=gl_PointCoord*2.-1.;float r=dot(p,p);if(r>1.)discard;float a=exp(-4.*r)*vEnergy;gl_FragColor=vec4(vColour*a,a);}`);
  quad=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,quad);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),gl.STATIC_DRAW);
 }catch(e){failed=true;console.error('Galactic handoff shaders',e);}
 function upload(data){const buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,data,gl.STATIC_DRAW);return {buffer,count:data.length/8};}
 if(gl&&!failed)Promise.all([fetch(BASE+'galaxy-points.json').then(r=>{if(!r.ok)throw Error('galaxy metadata');return r.json()}),fetch(BASE+'galaxy-points.bin').then(r=>{if(!r.ok)throw Error('galaxy geometry');return r.arrayBuffer()})]).then(([m,b])=>{meta=m;galaxy=upload(new Float32Array(b));}).catch(e=>{failed=true;console.error('Galactic handoff assets',e);});
 function loadTextures(){
  if(textures||!gl||!original.complete||!original.naturalWidth||!clean.complete||!clean.naturalWidth)return;
  textures=[original,clean].map(img=>{
   // Power-of-two textures give genuine wraparound at the longitude seam in WebGL1.
   const c=document.createElement('canvas');c.width=img===original?4096:2048;c.height=c.width/2;c.getContext('2d').drawImage(img,0,0,c.width,c.height);
   const t=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,t);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,c);
   gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.REPEAT);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);return t;
  });
 }
 function setStars(data,named=[]){
  if(!gl||failed||stars||!data)return;
  const out=[];
  for(let j=0;j<data.n;j++){
   if(data.dist[j]>150)break;
   const d=data.dist[j];if(d<.01)continue;
   const c=data.col[j]/255*4-.4,rgb=c<.3?[.65,.79,1]:c<1?[1,.94,.82]:[1,.7,.44];
   out.push(data.pos[3*j]/d,data.pos[3*j+1]/d,data.pos[3*j+2]/d,KPC/(d*LY),...rgb,data.kind[j]===0?1:.22);
  }
  for(const [name,l,b,d] of named){
   const ray=lb(l,b),exists=out.some((_,i)=>i%8===0&&Math.abs(KPC/(out[i+3]*LY)-d)<.05&&ray[0]*out[i]+ray[1]*out[i+1]+ray[2]*out[i+2]>.9999);
   if(!exists)out.push(...ray,KPC/(d*LY),...(name==='Betelgeuse'?[1,.6,.35]:[.85,.9,1]),1);
  }
  stars=upload(new Float32Array(out));
 }
 function ready(){loadTextures();return !failed&&textures&&galaxy&&stars;}
 const uniform=(p,n)=>gl.getUniformLocation(p,n);
 function basis(p,cam){gl.uniform3fv(uniform(p,'uR'),cam.cam.r);gl.uniform3fv(uniform(p,'uU'),cam.cam.u);gl.uniform3fv(uniform(p,'uN'),cam.cam.n);}
 function points(group,cam,depth,energy,size,model=0){
  const p=pointProgram;gl.useProgram(p);basis(p,cam);gl.bindBuffer(gl.ARRAY_BUFFER,group.buffer);
  for(const [name,n,offset]of [['aRay',3,0],['aInvD',1,12],['aColour',3,16],['aWeight',1,28]]){const a=gl.getAttribLocation(p,name);gl.enableVertexAttribArray(a);gl.vertexAttribPointer(a,n,gl.FLOAT,false,32,offset);}
  gl.uniform2f(uniform(p,'uScale'),cam.min/cam.W/TAN,cam.min/cam.H/TAN);gl.uniform1f(uniform(p,'uDistance'),cam.F/(2*TAN*KPC));gl.uniform1f(uniform(p,'uDepth'),depth);gl.uniform1f(uniform(p,'uSize'),size);gl.uniform1f(uniform(p,'uModel'),model);gl.uniform1f(uniform(p,'uEnergy'),energy);gl.drawArrays(gl.POINTS,0,group.count);
 }
 function draw(cam){
  if(!ready())return;
  if(canvas.width!==cam.W||canvas.height!==cam.H){canvas.width=cam.W;canvas.height=cam.H;}
  gl.viewport(0,0,cam.W,cam.H);gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT);gl.disable(gl.DEPTH_TEST);gl.disable(gl.BLEND);
  const phase=handoffPhase(cam.s),visible=ramp(cam.s,6.9,7.6),galaxyAlpha=1-ramp(cam.s,24.4,24.9);
  const shell=galacticShell(cam.s),skyAlpha=visible*shell.alpha,p=skyProgram;
  gl.useProgram(p);basis(p,cam);gl.bindBuffer(gl.ARRAY_BUFFER,quad);const a=gl.getAttribLocation(p,'aPosition');gl.enableVertexAttribArray(a);gl.vertexAttribPointer(a,2,gl.FLOAT,false,0,0);
  for(let i=0;i<2;i++){gl.activeTexture(gl.TEXTURE0+i);gl.bindTexture(gl.TEXTURE_2D,textures[i]);gl.uniform1i(uniform(p,i?'uClean':'uOriginal'),i);}
  gl.uniform2f(uniform(p,'uFov'),TAN*cam.W/cam.min,TAN*cam.H/cam.min);gl.uniform1f(uniform(p,'uMix'),phase.starFade);gl.uniform1f(uniform(p,'uAlpha'),skyAlpha);
  gl.uniform1f(uniform(p,'uSphereRadius'),shell.radius);gl.uniform1f(uniform(p,'uSphereDistance'),shell.distance);gl.drawArrays(gl.TRIANGLE_STRIP,0,4);
  // The star field fades in over the still-lit shell; the shell itself stays
  // opaque until the camera is outside. Points and shell share the same target.
  gl.enable(gl.BLEND);gl.blendFunc(gl.ONE,gl.ONE);
  if(phase.galaxyFade>0&&galaxyAlpha>0){
   const size=(3.3-.9*phase.galaxyDepth)*cam.min/960;
   const fluxFootprint=(6-2.7*ramp(phase.galaxyDepth,.65,1))*cam.min/960,kernel=.19276*fluxFootprint**2;
   const energy=meta.radianceIntegral/galaxy.count*cam.min**2/(4*TAN*TAN*kernel);
   points(galaxy,cam,phase.galaxyDepth,energy*phase.galaxyFade*galaxyAlpha*(1+phase.galaxyDepth)*(.4+.6*(1-shell.alpha)),size,1);
  }
  if(phase.starFade>0)points(stars,cam,phase.starDepth,2.1*phase.starFade*visible*(1-ramp(cam.s,21.4,22.2)),4.3*cam.min/960);
  cam.ctx.save();cam.ctx.globalCompositeOperation='lighter';cam.ctx.drawImage(canvas,0,0);cam.ctx.restore();
  drawCrossingDots(cam);
  // The solar system becomes its own central star, at the same world location.
  const sunAlpha=ramp(cam.s,15.2,16)*(1-ramp(cam.s,21.6,22.3));
  if(sunAlpha>.001){const ctx=cam.ctx;ctx.save();ctx.globalAlpha=sunAlpha;const rad=4*cam.dpr;const g=ctx.createRadialGradient(cam.cx,cam.cy,0,cam.cx,cam.cy,rad*3);g.addColorStop(0,'#fff6d9');g.addColorStop(.15,'#ffd28c');g.addColorStop(1,'#ffc16a00');ctx.fillStyle=g;ctx.beginPath();ctx.arc(cam.cx,cam.cy,rad*3,0,Math.PI*2);ctx.fill();ctx.restore();}
 }
 // Fixed world-space specks near the camera's shell-crossing corridor.
 // They enter/leave geometrically, remain opaque nearby and retire subpixel.
 const random=rng(70731),crossingDots=Array.from({length:36},()=>{
  const s=20.48+random()*.58,b=cameraAt(s),D=galacticShell(s).distance;
  const angle=random()*Math.PI*2,offset=.3+random()*1.2;
  const p=b.n.map((v,i)=>v*D+offset*(Math.cos(angle)*b.r[i]+Math.sin(angle)*b.u[i]));
  return {p,radius:.004+random()*.008};
 });
 function drawCrossingDots(cam){
  if(cam.s<20.3||cam.s>22)return;
  const D=cam.F/(2*TAN*KPC),focal=cam.min/(2*TAN),ctx=cam.ctx;
  ctx.save();
  for(const point of crossingDots){
   const den=D-dot(point.p,cam.cam.n);if(den<=.001)continue;
   const x=cam.cx+focal*dot(point.p,cam.cam.r)/den,y=cam.cy-focal*dot(point.p,cam.cam.u)/den;
   const radius=Math.min(24*cam.dpr,focal*point.radius/den);
   if(radius<.3*cam.dpr||x<-radius||y<-radius||x>cam.W+radius||y>cam.H+radius)continue;
   ctx.globalAlpha=ramp(radius/cam.dpr,.3,.85);
   ctx.filter=radius>4*cam.dpr?`blur(${Math.min(7*cam.dpr,(radius-4*cam.dpr)*.4)}px)`:'none';
   ctx.fillStyle='#e2eeff';ctx.beginPath();ctx.arc(x,y,radius,0,Math.PI*2);ctx.fill();
  }
  ctx.restore();
 }
 function projectStar(cam,p){const d=Math.hypot(...p),ray=p.map(v=>v/d);const q=projectRay(ray,KPC/d,cam.cam,cam.F/(2*TAN*KPC),handoffPhase(cam.s).starDepth);return [cam.cx+q[0]*cam.min/(2*TAN),cam.cy-q[1]*cam.min/(2*TAN)];}
 return {ready,setStars,draw,projectStar,background:{name:'matched galactic sky',range:[6.8,25],draw}};
}
