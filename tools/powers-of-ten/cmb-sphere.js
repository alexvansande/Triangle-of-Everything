// Continuous last-scattering shell, textured with the repository's Planck
// SMICA scalar map. Red is a display palette, not visible-light emission.
import {image} from './micro.js';
export function cmbSphere(){
 const canvas=document.createElement('canvas'),gl=canvas.getContext('webgl',{alpha:true,premultipliedAlpha:true,antialias:false,depth:false});
 const map=image('/spectrum/sky-spectrum/cmb.png');let program,buffer,texture,failed=!gl;
 if(gl)try{
  function shader(type,source){const s=gl.createShader(type);gl.shaderSource(s,source);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(s));return s;}
  program=gl.createProgram();gl.attachShader(program,shader(gl.VERTEX_SHADER,`attribute vec2 aPosition;varying vec2 vPosition;void main(){vPosition=aPosition;gl_Position=vec4(aPosition,0.,1.);}`));
  gl.attachShader(program,shader(gl.FRAGMENT_SHADER,`
   precision highp float;varying vec2 vPosition;uniform sampler2D uMap;uniform vec3 uN,uR,uU;uniform float uDistance,uAlpha;const float TAN=.3639702343;
   void main(){vec3 eye=uN*uDistance,ray=normalize(-uN+TAN*(vPosition.x*uR+vPosition.y*uU));
    float b=dot(eye,ray),disc=b*b+1.-dot(eye,eye);if(disc<0.)discard;
    float farT=-b+sqrt(disc),nearT=-b-sqrt(disc);if(farT<=0.)discard;
    vec3 farP=normalize(eye+farT*ray);
    vec2 uv=vec2(fract(.5-atan(farP.y,farP.x)/6.28318530718),.5-asin(clamp(farP.z,-1.,1.))/3.14159265359);
    float t=texture2D(uMap,uv).r;
    // A translucent two-red shell, never a black-backed opaque picture.
    vec3 farColour=mix(vec3(.24,.018,.048),vec3(.72,.16,.19),smoothstep(.12,.88,t));
    float shellWeight=.35+.65*pow(1.-sqrt(max(0.,disc)),2.);
    float farAlpha=uAlpha*shellWeight;
    float nearAlpha=farAlpha*smoothstep(0.,.12,nearT);
    vec3 nearP=normalize(eye+max(0.,nearT)*ray);
    vec2 nuv=vec2(fract(.5-atan(nearP.y,nearP.x)/6.28318530718),.5-asin(clamp(nearP.z,-1.,1.))/3.14159265359);
    vec3 nearColour=mix(vec3(.24,.018,.048),vec3(.72,.16,.19),smoothstep(.12,.88,texture2D(uMap,nuv).r));
    float alpha=farAlpha+nearAlpha*(1.-farAlpha);
    gl_FragColor=vec4(farColour*farAlpha*(1.-nearAlpha)+nearColour*nearAlpha,alpha);
   }`));gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(program));
  buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),gl.STATIC_DRAW);
 }catch(e){failed=true;console.error('CMB sphere',e);}
 return {draw(ctx,size,view,basis){
  if(failed||!map.complete||!map.naturalWidth||view.a<=0)return;
  if(!texture){texture=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,texture);gl.texImage2D(gl.TEXTURE_2D,0,gl.LUMINANCE,gl.LUMINANCE,gl.UNSIGNED_BYTE,map);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.REPEAT);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);}
  if(canvas.width!==size){canvas.width=size;canvas.height=size;}
  gl.viewport(0,0,size,size);gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT);gl.useProgram(program);gl.bindBuffer(gl.ARRAY_BUFFER,buffer);const a=gl.getAttribLocation(program,'aPosition');gl.enableVertexAttribArray(a);gl.vertexAttribPointer(a,2,gl.FLOAT,false,0,0);
  const loc=n=>gl.getUniformLocation(program,n);for(const [name,v]of [['uN',basis.n],['uR',basis.r],['uU',basis.u]])gl.uniform3fv(loc(name),v);
  gl.uniform1f(loc('uDistance'),view.dist);gl.uniform1f(loc('uAlpha'),view.a);gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,texture);gl.uniform1i(loc('uMap'),0);gl.drawArrays(gl.TRIANGLE_STRIP,0,4);ctx.drawImage(canvas,0,0);
 }};
}
