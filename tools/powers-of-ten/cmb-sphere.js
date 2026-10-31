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
    // Render the far wall on both sides of the crossing: the same texels
    // remain visible as we pull out, with no front/back texture switch.
    float travel=-b+sqrt(disc);if(travel<=0.)discard;vec3 p=normalize(eye+travel*ray);
    vec2 uv=vec2(fract(.5-atan(p.y,p.x)/6.28318530718),.5-asin(clamp(p.z,-1.,1.))/3.14159265359);
    float t=clamp(texture2D(uMap,uv).r,0.,1.);
    vec3 low=vec3(.12,.003,.016),mid=vec3(.65,.035,.085),high=vec3(1.,.64,.60);
    vec3 colour=t<.5?mix(low,mid,t*2.):mix(mid,high,(t-.5)*2.);
    // Restrained limb falloff gives the exterior a spherical silhouette;
    // the microwave temperature pattern itself supplies all surface detail.
    float limb=mix(1.,.70+.30*pow(abs(dot(p,ray)),.35),smoothstep(1.,1.7,uDistance));
    gl_FragColor=vec4(colour*limb*uAlpha,uAlpha);
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
