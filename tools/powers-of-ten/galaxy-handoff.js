// The two8K skies and live3D clouds share exported sample identities and
// angular Gaussian kernels. No independently generated image is crossfaded in.
import {ramp,dot,LY,KPC,AU} from './math.js';
import {image} from './micro.js';
import {handoffPhase,projectRay} from './galaxy-geometry.js';
const BASE='/video/powers-of-ten/generated/matched-sky-v1/',TAN=Math.tan(25*Math.PI/180);
export function galaxyHandoff(){
 const canvas=document.createElement('canvas'),gl=canvas.getContext('webgl',{alpha:true,premultipliedAlpha:true,antialias:false,depth:false});
 const preview=new URLSearchParams(location.search).get('skyrender');
 const maps=[image(BASE+'galaxy-map.png'),image(BASE+'nearby-map.png')];
 let meta,groups,textures,skyProgram,pointProgram,quad,failed=!gl,ext=gl?.getExtension('ANGLE_instanced_arrays');if(!ext)failed=true;
 function program(vs,fs){function shader(type,src){const sh=gl.createShader(type);gl.shaderSource(sh,src);gl.compileShader(sh);if(!gl.getShaderParameter(sh,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(sh));return sh;}const p=gl.createProgram();gl.attachShader(p,shader(gl.VERTEX_SHADER,vs));gl.attachShader(p,shader(gl.FRAGMENT_SHADER,fs));gl.linkProgram(p);if(!gl.getProgramParameter(p,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(p));return p;}
 if(!failed)try{
  skyProgram=program(`attribute vec2 aCorner;varying vec2 vCorner;void main(){vCorner=aCorner;gl_Position=vec4(aCorner,0.,1.);}`,`precision highp float;varying vec2 vCorner;uniform sampler2D uGalaxy,uNearby;uniform vec3 uR,uU,uN;uniform vec2 uFov;uniform vec2 uAlpha;void main(){vec3 ray=normalize(-uN+vCorner.x*uFov.x*uR+vCorner.y*uFov.y*uU);vec2 uv=vec2(fract(.5-atan(ray.y,ray.x)/6.28318530718),.5-asin(clamp(ray.z,-1.,1.))/3.14159265359);gl_FragColor=vec4(texture2D(uGalaxy,uv).rgb*uAlpha.x+texture2D(uNearby,uv).rgb*uAlpha.y,1.);}`);
  pointProgram=program(`
   precision highp float;attribute vec2 aCorner;attribute vec3 aRay,aColour;attribute float aInvD,aWeight,aRadius,aPeak;uniform vec3 uR,uU,uN;uniform vec2 uScale;uniform float uDistance,uDepth,uAlpha,uModel,uPixel;varying vec2 vCorner;varying vec3 vColour;
   void main(){vec3 right=normalize(cross(abs(aRay.z)>.98?vec3(0.,1.,0.):vec3(0.,0.,1.),aRay)),up=cross(aRay,right);
    right=normalize(mix(right,uR,uDepth));up=normalize(mix(up,uU,uDepth));
    vec3 centre=aRay-uN*uDistance*uDepth*aInvD;float support=max(aRadius,uPixel*max(0.,-dot(centre,uN))*uDepth);vec3 q=centre+support*(aCorner.x*right+aCorner.y*up);float den=-dot(q,uN);
    gl_Position=vec4(dot(q,uR)*uScale.x,dot(q,uU)*uScale.y,0.,den);vCorner=aCorner;
    float energy=min(6.,mix(1.,aWeight/max(.01,dot(centre,centre)),uDepth*uModel)*mix(1.,6.,uDepth*uModel));
    vColour=aColour*aPeak*uAlpha*energy;
   }`,`precision highp float;varying vec2 vCorner;varying vec3 vColour;uniform float uModel;void main(){float r=dot(vCorner,vCorner);if(r>1.)discard;float a=uModel>.5?exp(-4.*r):.7*exp(-12.*r)+.3*exp(-3.*r);gl_FragColor=vec4(vColour*a,0.);}`);
  quad=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,quad);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),gl.STATIC_DRAW);
  Promise.all([fetch(BASE+'scene.json').then(r=>r.json()),...['galaxy','nearby'].map(n=>fetch(BASE+n+'-points.bin').then(r=>{if(!r.ok)throw Error(n+' data missing');return r.arrayBuffer();}))]).then(([m,...raw])=>{meta=m;groups=raw.map(raw=>{const buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(raw),gl.STATIC_DRAW);return {buffer,count:raw.byteLength/40};});}).catch(e=>{failed=true;console.error('Matched sky data',e);});
 }catch(e){failed=true;console.error('Matched sky shader',e);}
 function ready(){
  if(failed||!groups||!maps.every(im=>im.complete&&im.naturalWidth))return false;
  if(!textures){textures=maps.map(im=>{const t=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,t);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGB,gl.RGB,gl.UNSIGNED_BYTE,im);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.REPEAT);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);return t;});}
  return true;
 }
 const loc=(p,n)=>gl.getUniformLocation(p,n);
 function basis(p,cam){for(const[n,v]of [['uR',cam.cam.r],['uU',cam.cam.u],['uN',cam.cam.n]])gl.uniform3fv(loc(p,n),v);}
 function corners(p){gl.bindBuffer(gl.ARRAY_BUFFER,quad);const a=gl.getAttribLocation(p,'aCorner');gl.enableVertexAttribArray(a);ext.vertexAttribDivisorANGLE(a,0);gl.vertexAttribPointer(a,2,gl.FLOAT,false,0,0);}
 function points(group,cam,depth,alpha,model){
  if(alpha<=0)return;const p=pointProgram;gl.useProgram(p);basis(p,cam);corners(p);gl.bindBuffer(gl.ARRAY_BUFFER,group.buffer);
  const attributes=[['aRay',3,0],['aInvD',1,12],['aColour',3,16],['aWeight',1,28],['aRadius',1,32],['aPeak',1,36]];
  for(const[n,size,offset]of attributes){const a=gl.getAttribLocation(p,n);gl.enableVertexAttribArray(a);gl.vertexAttribPointer(a,size,gl.FLOAT,false,40,offset);ext.vertexAttribDivisorANGLE(a,1);}
  gl.uniform2f(loc(p,'uScale'),cam.min/cam.W/TAN,cam.min/cam.H/TAN);gl.uniform1f(loc(p,'uDistance'),cam.F/(2*TAN*KPC));gl.uniform1f(loc(p,'uDepth'),depth);gl.uniform1f(loc(p,'uAlpha'),alpha);gl.uniform1f(loc(p,'uModel'),model);gl.uniform1f(loc(p,'uPixel'),.9*cam.dpr*2*TAN/cam.min);ext.drawArraysInstancedANGLE(gl.TRIANGLE_STRIP,0,4,group.count);
  for(const[n]of attributes){const a=gl.getAttribLocation(p,n);ext.vertexAttribDivisorANGLE(a,0);gl.disableVertexAttribArray(a);}
 }
 function draw(cam){
  if(!ready())return;if(canvas.width!==cam.W||canvas.height!==cam.H){canvas.width=cam.W;canvas.height=cam.H;}gl.viewport(0,0,cam.W,cam.H);gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT);gl.disable(gl.BLEND);gl.disable(gl.DEPTH_TEST);
  const phase=handoffPhase(cam.s);
  if(preview==='map'||preview==='dots'){phase.starFade=phase.galaxyFade=preview==='dots'?1:0;phase.starDepth=phase.galaxyDepth=0;}
  const visible=ramp(cam.s,6.9,7.6),galaxyAlpha=1-ramp(cam.s,24.4,24.9),p=skyProgram;
  gl.useProgram(p);basis(p,cam);corners(p);for(let i=0;i<2;i++){gl.activeTexture(gl.TEXTURE0+i);gl.bindTexture(gl.TEXTURE_2D,textures[i]);gl.uniform1i(loc(p,i?'uNearby':'uGalaxy'),i);}
  gl.uniform2f(loc(p,'uFov'),TAN*cam.W/cam.min,TAN*cam.H/cam.min);gl.uniform2f(loc(p,'uAlpha'),visible*(1-phase.galaxyFade),visible*(1-phase.starFade));gl.drawArrays(gl.TRIANGLE_STRIP,0,4);
  gl.enable(gl.BLEND);gl.blendFunc(gl.ONE,gl.ONE);
  points(groups[0],cam,phase.galaxyDepth,visible*phase.galaxyFade*galaxyAlpha,1);
  const stellarPixels=2600*LY*cam.k/cam.dpr,stellarRetire=preview?1:ramp(stellarPixels,.35,1.2);
  points(groups[1],cam,phase.starDepth,visible*phase.starFade*stellarRetire,0);
  cam.ctx.save();cam.ctx.globalCompositeOperation='lighter';cam.ctx.drawImage(canvas,0,0);cam.ctx.restore();
  // Solar-system light remains at the shared origin as it becomes a star.
  const sunAlpha=ramp(cam.s,15.2,16)*stellarRetire;
  if(sunAlpha>.001){const c=cam.ctx,rad=(4+4*(1-ramp(1e5*AU*cam.k/cam.dpr,1,8)))*(1-.72*ramp(cam.s,19.3,21.4))*cam.dpr;c.save();c.globalAlpha=sunAlpha;const g=c.createRadialGradient(cam.cx,cam.cy,0,cam.cx,cam.cy,rad*3);g.addColorStop(0,'#fff6d9');g.addColorStop(.15,'#ffd28c');g.addColorStop(1,'#ffc16a00');c.fillStyle=g;c.beginPath();c.arc(cam.cx,cam.cy,rad*3,0,Math.PI*2);c.fill();c.restore();}
 }
 function projectStar(cam,p){const d=Math.hypot(...p),q=projectRay(p.map(v=>v/d),KPC/d,cam.cam,cam.F/(2*TAN*KPC),handoffPhase(cam.s).starDepth);return[cam.cx+q[0]*cam.min/(2*TAN),cam.cy-q[1]*cam.min/(2*TAN)];}
 return{ready,setStars(){},draw,projectStar,background:{name:'matched galactic sky',range:[6.8,25],draw}};
}
