// Telescope photographs form an independent angular background. The SAME
// textured planes then acquire their catalogue distances, without a second
// image, a screen-space recenter, or an alpha fade between different positions.
import {ramp,eqToGal,add,mul,dot,KPC} from './math.js';
import {image} from './micro.js';
export const EXTRAGALACTIC_PHASE={replace:[18.45,18.85],depth:[20.25,21.55]};
// Image-centre coordinates, field of view and north orientation are from the
// observatories' image metadata. Distance is kpc; angle is degrees.
export const GALAXY_PHOTOS=[
 {id:'lmc',name:'Large Magellanic Cloud',ra:81.294083,dec:-70.072986,d:50,w:461.9/60,h:515.88/60,north:2.4,mask:[.50,.48,.47,.43,-.6],gain:1.7},
 {id:'smc',name:'Small Magellanic Cloud',ra:13.763167,dec:-72.964047,d:62,w:354.37/60,h:313.48/60,north:-1.2,mask:[.50,.48,.30,.42,.5],gain:1.9},
 {id:'m31',name:'Andromeda · M31',ra:10.75225,dec:41.260869,d:765,w:362/60,h:234.12/60,north:-1.9,mask:[.50,.50,.18,.49,-.62],gain:1.35},
 {id:'m33',name:'Triangulum · M33',ra:23.467167,dec:30.673936,d:840,w:68.01/60,h:57.04/60,north:-90,mask:[.50,.50,.48,.46,-.5],gain:1.4},
];
const D=Math.PI/180,TAN=Math.tan(25*D);
export function photoFrame(g){
 const ra=g.ra*D,dec=g.dec*D,t=g.north*D;
 const ray=eqToGal([Math.cos(dec)*Math.cos(ra),Math.cos(dec)*Math.sin(ra),Math.sin(dec)]);
 const north=eqToGal([-Math.sin(dec)*Math.cos(ra),-Math.sin(dec)*Math.sin(ra),Math.cos(dec)]),east=eqToGal([-Math.sin(ra),Math.cos(ra),0]);
 return {ray,right:add(mul(east,-Math.cos(t)),mul(north,Math.sin(t))),up:add(mul(east,Math.sin(t)),mul(north,Math.cos(t)))};
}
export function photoDepth(s){return ramp(s,...EXTRAGALACTIC_PHASE.depth);}
export function photoProjection(g,cam,s){
 const f=photoFrame(g),distance=10**s/(2*TAN*KPC),q=add(f.ray,mul(cam.n,-distance*photoDepth(s)/g.d)),den=-dot(q,cam.n);
 return {q,den,x:dot(q,cam.r)/den,y:dot(q,cam.u)/den};
}
export function extragalacticLayer(){
 const canvas=document.createElement('canvas'),gl=canvas.getContext('webgl',{alpha:true,premultipliedAlpha:true,depth:false,antialias:false});
 let program,buffer,failed=!gl;
 const photos=GALAXY_PHOTOS.map(g=>({...g,...photoFrame(g),img:image('/video/powers-of-ten/galaxies/'+g.id+'.jpg')}));
 if(gl)try{
  function shader(type,src){const sh=gl.createShader(type);gl.shaderSource(sh,src);gl.compileShader(sh);if(!gl.getShaderParameter(sh,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(sh));return sh;}
  program=gl.createProgram();
  gl.attachShader(program,shader(gl.VERTEX_SHADER,`precision highp float;attribute vec2 aUV;varying vec2 vUV;uniform vec3 uRay,uRight,uUp,uN,uR,uU;uniform vec2 uSize,uScale;uniform float uOffset;void main(){vUV=aUV;vec3 q=uRay+(aUV.x-.5)*uSize.x*uRight+(.5-aUV.y)*uSize.y*uUp-uN*uOffset;float z=-dot(q,uN);gl_Position=vec4(dot(q,uR)*uScale.x,dot(q,uU)*uScale.y,0.,z);}`));
  gl.attachShader(program,shader(gl.FRAGMENT_SHADER,`precision highp float;varying vec2 vUV;uniform sampler2D uPhoto;uniform vec4 uMask;uniform float uAngle,uAlpha,uGain;void main(){vec2 p=vUV-uMask.xy;float c=cos(uAngle),s=sin(uAngle);vec2 q=vec2(c*p.x-s*p.y,s*p.x+c*p.y)/uMask.zw;float mask=1.-smoothstep(.65,1.,length(q));vec3 rgb=max(vec3(0.),texture2D(uPhoto,vUV).rgb-vec3(.025));rgb*=mask*uAlpha*uGain;gl_FragColor=vec4(rgb,1.);}`));
  gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(program));
  buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([0,0,1,0,0,1,1,1]),gl.STATIC_DRAW);
 }catch(e){failed=true;console.error('Extragalactic photographs',e);}
 const uniform=n=>gl.getUniformLocation(program,n);
 function ready(){
  if(failed||!photos.every(g=>g.img.complete&&g.img.naturalWidth))return false;
  for(const g of photos)if(!g.texture){g.texture=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,g.texture);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGB,gl.RGB,gl.UNSIGNED_BYTE,g.img);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);}
  return true;
 }
 return {name:'photographic neighbouring galaxies',range:[7,25.3],ready,
 draw(cam){
  if(!ready())return;
  if(canvas.width!==cam.W||canvas.height!==cam.H){canvas.width=cam.W;canvas.height=cam.H;}
  gl.viewport(0,0,cam.W,cam.H);gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT);gl.useProgram(program);gl.enable(gl.BLEND);gl.blendFunc(gl.ONE,gl.ONE);gl.disable(gl.DEPTH_TEST);
  gl.bindBuffer(gl.ARRAY_BUFFER,buffer);const a=gl.getAttribLocation(program,'aUV');gl.enableVertexAttribArray(a);gl.vertexAttribPointer(a,2,gl.FLOAT,false,0,0);
  for(const [u,v]of [['uN',cam.cam.n],['uR',cam.cam.r],['uU',cam.cam.u]])gl.uniform3fv(uniform(u),v);
  gl.uniform2f(uniform('uScale'),cam.min/cam.W/TAN,cam.min/cam.H/TAN);
  const labels=[],cores=[];
  const depth=photoDepth(cam.s),distance=cam.F/(2*TAN*KPC),alpha=ramp(cam.s,7,7.6)*(1-ramp(cam.s,24.6,25.2));
  for(const g of photos){
   gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,g.texture);gl.uniform1i(uniform('uPhoto'),0);
   for(const [u,v]of [['uRay',g.ray],['uRight',g.right],['uUp',g.up]])gl.uniform3fv(uniform(u),v);
   gl.uniform2f(uniform('uSize'),2*Math.tan(g.w*D/2),2*Math.tan(g.h*D/2));
   gl.uniform1f(uniform('uOffset'),distance*depth/g.d);gl.uniform4fv(uniform('uMask'),g.mask.slice(0,4));gl.uniform1f(uniform('uAngle'),g.mask[4]);gl.uniform1f(uniform('uAlpha'),alpha*ramp(cam.s,...EXTRAGALACTIC_PHASE.replace));gl.uniform1f(uniform('uGain'),g.gain);gl.drawArrays(gl.TRIANGLE_STRIP,0,4);
   const p=photoProjection(g,cam.cam,cam.s);if(p.den>0){const k=cam.min/(2*TAN),x=cam.cx+p.x*k,y=cam.cy-p.y*k,r= Math.tan(g.h*D/2)/p.den*k;
    const size=Math.max(2*Math.tan(g.w*D/2),2*Math.tan(g.h*D/2))/p.den*k;
    if(size<5*cam.dpr)cores.push([x,y,alpha*ramp(size/cam.dpr,.04,.7)*(1-ramp(size/cam.dpr,2,5))]);
    labels.push([x,y-r-8*cam.dpr,g.name,alpha*ramp(size/cam.dpr,.6,2)*ramp(cam.s,19.2,19.65)*(1-ramp(cam.s,23.5,24.2))]);}
  }
  // Additive photographic light has no rectangular black borders.
  const ctx=cam.ctx;ctx.save();ctx.globalCompositeOperation='lighter';ctx.drawImage(canvas,0,0);ctx.restore();
  ctx.save();ctx.fillStyle='#dfdceb';
  for(const [x,y,a] of cores){ctx.globalAlpha=a;ctx.beginPath();ctx.arc(x,y,.85*cam.dpr,0,Math.PI*2);ctx.fill();}ctx.restore();
  for(const args of labels)cam.labelPx(...args);
 }};
}
