// Last-scattering shell using the supplied WMAP five-year ILC RGB map.
// Hue is a temperature display palette; opacity follows red-to-blue hue.
import {image} from './image.js';
// (src: a lighter copy of the map for the app's rotating icon, src/cmb-object.js)
// The shell's look (the author's values, 2026-11-08, set on the app's object with the sliders of
// tools/cmb-icon-capture.html, then used here too): its opacity for red, yellow, green, cyan and blue
// patches (was .6 .5 .4 .3 .2: the warm ones stay as paint, the cold ones are windows), and what the
// near and far halves keep of it. src/cmb-object.js CMB_LOOK takes its defaults from here.
// limb: how much thicker the shell gets towards its edge (the limb), where the line of sight runs
// through more of a thin shell: its opacity o becomes 1-(1-o)^(1/cos), cos the angle it is crossed
// at; 0 is the flat paint it was. rind: the 2% of the radius behind the surface, from the CMB
// (45.3 Gly) to the edge of the observable universe (46.2), hot opaque plasma: a warm glow, 3000 K,
// by the length of sight through it, so a rim just outside the paint. Both the author's ask, 2026-11-08.
export const CMB_OPACITY={stops:[.81,.27,.12,.08,.05],near:.8,far:.53,limb:.7,rind:.6};
export function cmbSphere(src='/powers-of-ten/wmap-ilc-5yr-rgb.png'){
 const canvas=document.createElement('canvas'),gl=canvas.getContext('webgl',{alpha:true,premultipliedAlpha:true,antialias:false,depth:false});
 const map=image(src);let program,buffer,texture,failed=!gl;
 if(gl)try{
  function shader(type,source){const s=gl.createShader(type);gl.shaderSource(s,source);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(s));return s;}
  program=gl.createProgram();gl.attachShader(program,shader(gl.VERTEX_SHADER,`attribute vec2 aPosition;varying vec2 vPosition;void main(){vPosition=aPosition;gl_Position=vec4(aPosition,0.,1.);}`));
  gl.attachShader(program,shader(gl.FRAGMENT_SHADER,`
   precision highp float;varying vec2 vPosition;uniform sampler2D uMap;uniform vec3 uN,uR,uU;uniform float uDistance,uAlpha,uPass,uWhole,uBlue,uLimb,uRind;uniform vec4 uStops;const float TAN=.3639702343;
   const float RIND=1.0404;const vec3 PLASMA=vec3(1.,.72,.42);   // (1.02)², and a 3000 K glow
   float thick(float o,float c){return 1.-pow(1.-o,mix(1.,1./max(c,.14),uLimb));}
   float shellOpacity(vec3 colour){
    // Inverted blue alone cannot distinguish red/yellow/green (all B=0).
    // Recover their hue sector: R=0, Y=1, G=2, C=3, B=4.
    float hi=max(colour.r,max(colour.g,colour.b)),lo=min(colour.r,min(colour.g,colour.b));
    float delta=max(hi-lo,.0001),sector;
    if(hi==colour.r)sector=mod((colour.g-colour.b)/delta+6.,6.);
    else if(hi==colour.g)sector=(colour.b-colour.r)/delta+2.;
    else sector=(colour.r-colour.g)/delta+4.;
    // Combined shell opacity by hue, straight lines between red, yellow, green, cyan and blue:
    // CMB_OPACITY.stops unless the view sets its own five (view.stops).
    float o=mix(uStops.x,uStops.y,clamp(sector,0.,1.));o=mix(o,uStops.z,clamp(sector-1.,0.,1.));
    o=mix(o,uStops.w,clamp(sector-2.,0.,1.));return mix(o,uBlue,clamp(sector-3.,0.,1.));
   }
   void main(){vec3 eye=uN*uDistance,ray=normalize(-uN+TAN*(vPosition.x*uR+vPosition.y*uU));
    float ee=dot(eye,eye),b=dot(eye,ray),disc=b*b+1.-ee,gain=min(1.,uAlpha/.365);
    // the rind, from outside only, in the last pass: the sight line's length through the layer in
    // front of the surface (through all of it where the line misses the surface)
    float outer=b*b+RIND-ee,rind=0.;
    if(uRind>0.&&uPass>.5&&b<0.&&outer>0.){float path=disc>0.?sqrt(outer)-sqrt(disc):2.*sqrt(outer);
     rind=gain*uRind*(1.-exp(-7.*path))*smoothstep(1.03,1.3,sqrt(ee));}
    if(disc<0.){if(rind<=0.)discard;gl_FragColor=vec4(PLASMA*rind,rind);return;}
    float cross=sqrt(disc),farT=-b+cross,nearT=-b-cross;if(farT<=0.)discard;
    vec3 farP=normalize(eye+farT*ray);
    vec2 uv=vec2(fract(.5-atan(farP.y,farP.x)/6.28318530718),.5-asin(clamp(farP.z,-1.,1.))/3.14159265359);
    vec3 farColour=texture2D(uMap,uv).rgb;
    // Divide the desired combined opacity between the two hemispheres.
    // Two identical red samples combine to .60, blue samples to .20.
    float farAlpha=gain*(1.-sqrt(1.-thick(shellOpacity(farColour),cross)));

    vec3 nearP=normalize(eye+max(0.,nearT)*ray);
    vec2 nuv=vec2(fract(.5-atan(nearP.y,nearP.x)/6.28318530718),.5-asin(clamp(nearP.z,-1.,1.))/3.14159265359);
    vec3 nearColour=texture2D(uMap,nuv).rgb;
    float nearMask=thick(shellOpacity(nearColour),cross);
    // uWhole: the near half takes the whole opacity, so what's inside is seen through it at that much
    // (red 60%, blue 20%: the app's icon, src/cmb-object.js); the zoom shares it between the halves
    float nearAlpha=gain*mix(1.-sqrt(1.-nearMask),nearMask,uWhole)*smoothstep(0.,.12,nearT);
    float alpha=mix(farAlpha,nearAlpha,uPass);
    gl_FragColor=vec4(PLASMA*rind,rind)+vec4(mix(farColour,nearColour,uPass)*alpha,alpha)*(1.-rind);
   }`));gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(program));
  buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),gl.STATIC_DRAW);
 }catch(e){failed=true;console.error('CMB sphere',e);}
 return {get available(){return !failed;},ready:()=>!failed&&map.complete&&map.naturalWidth>0,draw(ctx,size,view,basis,pass=0){
  if(failed||!map.complete||!map.naturalWidth||view.a<=0||!(size>0))return;   // size 0: the page laid out hidden; drawing a 0×0 canvas throws and stops the loop
  if(!texture){texture=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,texture);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,map);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.REPEAT);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);}
  if(canvas.width!==size){canvas.width=size;canvas.height=size;}
  gl.viewport(0,0,size,size);gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT);gl.useProgram(program);gl.bindBuffer(gl.ARRAY_BUFFER,buffer);const a=gl.getAttribLocation(program,'aPosition');gl.enableVertexAttribArray(a);gl.vertexAttribPointer(a,2,gl.FLOAT,false,0,0);
  const loc=n=>gl.getUniformLocation(program,n);for(const [name,v]of [['uN',basis.n],['uR',basis.r],['uU',basis.u]])gl.uniform3fv(loc(name),v);
  gl.uniform1f(loc('uDistance'),view.dist);gl.uniform1f(loc('uAlpha'),view.a);gl.uniform1f(loc('uPass'),pass);gl.uniform1f(loc('uWhole'),view.whole?1:0);const stops=view.stops||CMB_OPACITY.stops;gl.uniform4f(loc('uStops'),stops[0],stops[1],stops[2],stops[3]);gl.uniform1f(loc('uBlue'),stops[4]);gl.uniform1f(loc('uLimb'),view.limb??CMB_OPACITY.limb);gl.uniform1f(loc('uRind'),view.rind??CMB_OPACITY.rind);gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,texture);gl.uniform1i(loc('uMap'),0);gl.drawArrays(gl.TRIANGLE_STRIP,0,4);ctx.drawImage(canvas,0,0);
 }};
}
