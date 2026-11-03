// Last-scattering shell using the supplied WMAP five-year ILC RGB map.
// Hue is a temperature display palette; opacity follows red-to-blue hue.
import {image} from './image.js';
// (src: a lighter copy of the map for the app's rotating icon, src/cmb-object.js)
export function cmbSphere(src='/powers-of-ten/wmap-ilc-5yr-rgb.png'){
 const canvas=document.createElement('canvas'),gl=canvas.getContext('webgl',{alpha:true,premultipliedAlpha:true,antialias:false,depth:false});
 const map=image(src);let program,buffer,texture,failed=!gl;
 if(gl)try{
  function shader(type,source){const s=gl.createShader(type);gl.shaderSource(s,source);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(s));return s;}
  program=gl.createProgram();gl.attachShader(program,shader(gl.VERTEX_SHADER,`attribute vec2 aPosition;varying vec2 vPosition;void main(){vPosition=aPosition;gl_Position=vec4(aPosition,0.,1.);}`));
  gl.attachShader(program,shader(gl.FRAGMENT_SHADER,`
   precision highp float;varying vec2 vPosition;uniform sampler2D uMap;uniform vec3 uN,uR,uU;uniform float uDistance,uAlpha,uPass,uWhole;const float TAN=.3639702343;
   float shellOpacity(vec3 colour){
    // Inverted blue alone cannot distinguish red/yellow/green (all B=0).
    // Recover their hue sector: R=0, Y=1, G=2, C=3, B=4.
    float hi=max(colour.r,max(colour.g,colour.b)),lo=min(colour.r,min(colour.g,colour.b));
    float delta=max(hi-lo,.0001),sector;
    if(hi==colour.r)sector=mod((colour.g-colour.b)/delta+6.,6.);
    else if(hi==colour.g)sector=(colour.b-colour.r)/delta+2.;
    else sector=(colour.r-colour.g)/delta+4.;
    float warmth=clamp(1.-sector/4.,0.,1.);
    // Combined shell opacity: red .60, yellow .50, green .40, cyan .30, blue .20.
    return mix(.20,.60,warmth);
   }
   void main(){vec3 eye=uN*uDistance,ray=normalize(-uN+TAN*(vPosition.x*uR+vPosition.y*uU));
    float b=dot(eye,ray),disc=b*b+1.-dot(eye,eye);if(disc<0.)discard;
    float farT=-b+sqrt(disc),nearT=-b-sqrt(disc);if(farT<=0.)discard;
    vec3 farP=normalize(eye+farT*ray);
    vec2 uv=vec2(fract(.5-atan(farP.y,farP.x)/6.28318530718),.5-asin(clamp(farP.z,-1.,1.))/3.14159265359);
    vec3 farColour=texture2D(uMap,uv).rgb;
    // Divide the desired combined opacity between the two hemispheres.
    // Two identical red samples combine to .60, blue samples to .20.
    float farAlpha=min(1.,uAlpha/.365)*(1.-sqrt(1.-shellOpacity(farColour)));

    vec3 nearP=normalize(eye+max(0.,nearT)*ray);
    vec2 nuv=vec2(fract(.5-atan(nearP.y,nearP.x)/6.28318530718),.5-asin(clamp(nearP.z,-1.,1.))/3.14159265359);
    vec3 nearColour=texture2D(uMap,nuv).rgb;
    float nearMask=shellOpacity(nearColour);
    // uWhole: the near half takes the whole opacity, so what's inside is seen through it at that much
    // (red 60%, blue 20%: the app's icon, src/cmb-object.js); the zoom shares it between the halves
    float nearAlpha=min(1.,uAlpha/.365)*mix(1.-sqrt(1.-nearMask),nearMask,uWhole)*smoothstep(0.,.12,nearT);
    float alpha=mix(farAlpha,nearAlpha,uPass);
    gl_FragColor=vec4(mix(farColour,nearColour,uPass)*alpha,alpha);
   }`));gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(program));
  buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),gl.STATIC_DRAW);
 }catch(e){failed=true;console.error('CMB sphere',e);}
 return {get available(){return !failed;},ready:()=>!failed&&map.complete&&map.naturalWidth>0,draw(ctx,size,view,basis,pass=0){
  if(failed||!map.complete||!map.naturalWidth||view.a<=0)return;
  if(!texture){texture=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,texture);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,map);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.REPEAT);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);}
  if(canvas.width!==size){canvas.width=size;canvas.height=size;}
  gl.viewport(0,0,size,size);gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT);gl.useProgram(program);gl.bindBuffer(gl.ARRAY_BUFFER,buffer);const a=gl.getAttribLocation(program,'aPosition');gl.enableVertexAttribArray(a);gl.vertexAttribPointer(a,2,gl.FLOAT,false,0,0);
  const loc=n=>gl.getUniformLocation(program,n);for(const [name,v]of [['uN',basis.n],['uR',basis.r],['uU',basis.u]])gl.uniform3fv(loc(name),v);
  gl.uniform1f(loc('uDistance'),view.dist);gl.uniform1f(loc('uAlpha'),view.a);gl.uniform1f(loc('uPass'),pass);gl.uniform1f(loc('uWhole'),view.whole?1:0);gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,texture);gl.uniform1i(loc('uMap'),0);gl.drawArrays(gl.TRIANGLE_STRIP,0,4);ctx.drawImage(canvas,0,0);
 }};
}
