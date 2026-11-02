import {filamentBrush} from './cosmic-filaments.js';
// An illustrative 3D density volume. It is deliberately separate from the
// observed Planck CMB temperature shell and from the nearby galaxy catalogue.
import {ramp,LY} from './math.js';
const ROOT='/video/powers-of-ten/generated/cosmic-web-v1/',R=46e9*LY,TAN=Math.tan(20*Math.PI/180);
export function cosmicWeb(){
 const brush=filamentBrush();
 const canvas=document.createElement('canvas'),gl=canvas.getContext('webgl',{alpha:true,premultipliedAlpha:true,antialias:false,depth:false});
 let program,buffer,count=0,failed=!gl;
 if(gl)try{
  function shader(type,source){const sh=gl.createShader(type);gl.shaderSource(sh,source);gl.compileShader(sh);if(!gl.getShaderParameter(sh,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(sh));return sh;}
  program=gl.createProgram();gl.attachShader(program,shader(gl.VERTEX_SHADER,`
   precision highp float;attribute vec3 aPosition,aColour;attribute float aWeight,aKnot,aLod;
   uniform vec3 uR,uU,uN;uniform float uScale,uProjection,uDistance,uAlpha,uPixel,uSlab,uFeature,uOuter,uPass;
   varying vec3 vColour;varying float vAlpha;
   void main(){float z=dot(aPosition,uN),w=mix(1.,uDistance-z,uProjection);
    if(w<=.005){gl_Position=vec4(3.,3.,0.,1.);gl_PointSize=1.;vAlpha=0.;vColour=vec3(0.);return;}
    float scale=mix(uScale,${1/TAN},uProjection);
    gl_Position=vec4(dot(aPosition,uR)*scale,dot(aPosition,uU)*scale,0.,w);
    float thinSlab=.035+.965*exp(-z*z/(uSlab*uSlab));
    float slab=mix(thinSlab,.55+.45*clamp((z+1.)*.5,0.,1.),uProjection);
    float resolved=aLod>.5?1.:uFeature;
    float outerGate=aLod>.5?uOuter:1.;
    float energy=(.7+2.8*aKnot)*aWeight*slab*resolved*outerGate;
    float depthSize=mix(1.,clamp(uDistance/max(w,.2),.65,2.),uProjection);
    float size=mix(.85+1.25*aKnot,2.5+2.*aKnot,uPass)*uPixel*depthSize;
    gl_PointSize=size;vColour=mix(vec3(.66,.32,.045),vec3(1.,.86,.46),clamp(aKnot*.85+aWeight*.15,0.,1.));
    vAlpha=uAlpha*energy*mix(.95,.12*aKnot*aKnot,uPass);
   }`));
  gl.attachShader(program,shader(gl.FRAGMENT_SHADER,`precision highp float;varying vec3 vColour;varying float vAlpha;void main(){vec2 p=gl_PointCoord*2.-1.;float r=dot(p,p);if(r>1.)discard;float a=vAlpha*exp(-3.5*r);gl_FragColor=vec4(vColour*a,0.);}`));
  gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(program));
  fetch(ROOT+'points.bin').then(r=>{if(!r.ok)throw Error('density data missing');return r.arrayBuffer()}).then(raw=>{buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(raw),gl.STATIC_DRAW);count=raw.byteLength/36;}).catch(e=>{failed=true;console.error('Cosmic web data',e)});
 }catch(e){failed=true;console.error('Cosmic web shader',e)}
 const loc=n=>gl.getUniformLocation(program,n);
 return{name:'extended cosmic web',range:[23.8,27.5],ready:()=>!failed&&count>0,draw(cam){
  if(failed||!count||!cam.cmbView)return;
  if(canvas.width!==cam.W){canvas.width=cam.W;canvas.height=cam.H;}gl.viewport(0,0,cam.W,cam.H);gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT);
  gl.useProgram(program);gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.enable(gl.BLEND);gl.blendFunc(gl.ONE,gl.ONE);gl.disable(gl.DEPTH_TEST);
  for(const[name,n,offset]of [['aPosition',3,0],['aWeight',1,24],['aKnot',1,28],['aLod',1,32]]){const a=gl.getAttribLocation(program,name);gl.enableVertexAttribArray(a);gl.vertexAttribPointer(a,n,gl.FLOAT,false,36,offset);}
  for(const[name,v]of [['uR',cam.cam.r],['uU',cam.cam.u],['uN',cam.cam.n]])gl.uniform3fv(loc(name),v);
  gl.uniform1f(loc('uScale'),2*R*cam.min/(cam.F*cam.W));gl.uniform1f(loc('uProjection'),ramp(cam.s,25.6,26.45));gl.uniform1f(loc('uDistance'),cam.cmbView.dist);
  gl.uniform1f(loc('uAlpha'),.22*ramp(cam.s,24.3,25.15)*(.8-.25*ramp(cam.s,26.4,27.1)));
  gl.uniform1f(loc('uOuter'),ramp(cam.s,25.1,25.8));
  gl.uniform1f(loc('uPixel'),cam.dpr);gl.uniform1f(loc('uSlab'),Math.min(.045,Math.max(.001,cam.F/R*.12)));gl.uniform1f(loc('uFeature'),1-ramp(cam.s,Math.log10(20e9*LY),Math.log10(50e9*LY)));
  for(const pass of [1,0]){gl.uniform1f(loc('uPass'),pass);gl.drawArrays(gl.POINTS,0,count);}
  const c=cam.ctx;c.save();c.globalCompositeOperation='lighter';c.globalAlpha=1-.78*ramp(cam.s,26.3,27.0);c.drawImage(canvas,0,0);c.restore();brush(cam);
 }};
}
