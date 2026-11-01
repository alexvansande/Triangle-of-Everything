// A monochrome Julia zoom, sampled into the exact cells that begin Conway Life.
import {ramp} from './math.js';
export const PLANCK_LENGTH=1.616255e-35;
export const PLANCK_END=Math.log10(PLANCK_LENGTH*32);
export function lifeStep(cells,n){
 const next=new Uint8Array(cells.length);
 for(let y=0;y<n;y++)for(let x=0;x<n;x++){
  let neighbours=0;for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++)if(dx||dy)neighbours+=cells[((y+dy+n)%n)*n+(x+dx+n)%n];
  const i=y*n+x;next[i]=neighbours===3||(cells[i]&&neighbours===2)?1:0;
 }return next;
}
export function planckPattern(){
 const canvas=document.createElement('canvas'),gl=canvas.getContext('webgl',{alpha:true,premultipliedAlpha:true}),n=256;
 if(!gl)return{name:'fractal depths',range:[-36,-18.7],draw(){}};
 // Zoom about a repelling fixed point of z²+c. Perturbation arithmetic keeps
 // tiny offsets separate from the fixed orbit, retaining detail over 14 decades.
 const cr=-.74543,ci=.11301,a=1-4*cr,b=-4*ci,r=Math.hypot(a,b),zr=(1+Math.sqrt((r+a)/2))/2,zi=-Math.sqrt((r-a)/2)/2;
 function shader(type,source){const s=gl.createShader(type);gl.shaderSource(s,source);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(s));return s;}
 const program=gl.createProgram();gl.attachShader(program,shader(gl.VERTEX_SHADER,'attribute vec2 p;varying vec2 uv;void main(){uv=p;gl_Position=vec4(p,0.,1.);}'));
 gl.attachShader(program,shader(gl.FRAGMENT_SHADER,`
 precision highp float;varying vec2 uv;uniform sampler2D life;uniform vec2 aspect;uniform float frameCells,pixelation,alpha,mode;
 const vec2 Z=vec2(${zr},${zi});
 vec2 cmul(vec2 a,vec2 b){return vec2(a.x*b.x-a.y*b.y,a.x*b.y+a.y*b.x);}
 float fractal(vec2 world){
  vec2 d=world*${PLANCK_LENGTH/1e-19*4.};float iterations=0.,radius=0.;
  for(int i=0;i<180;i++){
   d=cmul(2.*Z,d)+cmul(d,d);radius=dot(Z+d,Z+d);iterations=float(i)+1.;if(radius>100.)break;
  }
  if(radius<=100.)return 0.;
  float smoothN=iterations+1.-log2(max(.001,log2(sqrt(radius))));
  float bands=.5+.5*cos(smoothN*2.6);
  return smoothstep(.2,.83,bands);
 }
 float bayer(vec2 p){
  // 8×8 ordered dither, anchored to the Planck-cell lattice.
  vec2 q=mod(p,8.);float v=0.;
  for(int i=0;i<3;i++){vec2 bit=mod(q,2.);v=v*4.+mod(bit.x+bit.y,2.)*2.+bit.y;q=floor(q/2.);}
  return (v+.5)/64.;
 }
 void main(){
  vec2 world=uv*.5*aspect*frameCells,cell=floor(world),centre=cell+.5;
  float value;
  if(mode>1.5)value=texture2D(life,(mod(cell+128.,256.)+.5)/256.).r;
  else{
   float px=mode>.5?1.:pixelation;
   float grey=fractal(mix(world,centre,px));
   float binary=step(bayer(cell),grey);
   value=mix(grey,binary,px);
  }
  gl_FragColor=vec4(vec3(value*alpha),alpha);
 }`));gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(program));
 const quad=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,quad);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),gl.STATIC_DRAW);
 const texture=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,texture);for(const p of [gl.TEXTURE_MIN_FILTER,gl.TEXTURE_MAG_FILTER])gl.texParameteri(gl.TEXTURE_2D,p,gl.NEAREST);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.REPEAT);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.REPEAT);
 let cells=new Uint8Array(n*n),seeded=false,last=-1,hold=0,acc=0;
 const loc=name=>gl.getUniformLocation(program,name);
 function render(w,h,frameCells,pixelation,mode,alpha,aspect){
  if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;}
  gl.viewport(0,0,w,h);gl.useProgram(program);gl.bindBuffer(gl.ARRAY_BUFFER,quad);const pos=gl.getAttribLocation(program,'p');gl.enableVertexAttribArray(pos);gl.vertexAttribPointer(pos,2,gl.FLOAT,false,0,0);
  gl.bindTexture(gl.TEXTURE_2D,texture);gl.texImage2D(gl.TEXTURE_2D,0,gl.LUMINANCE,n,n,0,gl.LUMINANCE,gl.UNSIGNED_BYTE,Uint8Array.from(cells,v=>v*255));
  gl.uniform1i(loc('life'),0);gl.uniform2f(loc('aspect'),...aspect);gl.uniform1f(loc('frameCells'),frameCells);gl.uniform1f(loc('pixelation'),pixelation);gl.uniform1f(loc('mode'),mode);gl.uniform1f(loc('alpha'),alpha);gl.drawArrays(gl.TRIANGLE_STRIP,0,4);
 }
 function seedFromFractal(){
  // Read the actual GPU dither image, not a separately approximated CPU seed.
  render(n,n,n,1,1,1,[1,1]);const rgba=new Uint8Array(n*n*4);gl.readPixels(0,0,n,n,gl.RGBA,gl.UNSIGNED_BYTE,rgba);
  for(let i=0;i<cells.length;i++)cells[i]=rgba[i*4]>127?1:0;
  seeded=true;hold=0;acc=0;
 }
 return{name:'fractal → Planck Life',range:[-36,-18.7],draw(cam){
  const alpha=1-ramp(cam.s,-20.1,-19.25);if(!alpha)return;
  const pixelation=1-ramp(cam.s,PLANCK_END+.08,PLANCK_END+1.3),atEnd=cam.s<=PLANCK_END+.02;
  const dt=last<0?0:Math.min(.1,Math.max(0,cam.t-last));last=cam.t;
  if(!atEnd){seeded=false;hold=0;acc=0;}
  else{
   if(!seeded)seedFromFractal();hold+=dt;
   // Hold the unchanged dither briefly so its first generation can be seen.
   if(hold>.9){acc+=dt;if(acc>.16){cells=lifeStep(cells,n);acc-=.16;}}
  }
  const w=Math.min(1400,cam.W),h=Math.round(w*cam.H/cam.W);
  render(w,h,10**(cam.s-Math.log10(PLANCK_LENGTH)),pixelation,atEnd?2:0,alpha,[cam.W/cam.min,cam.H/cam.min]);
  cam.ctx.drawImage(canvas,0,0,cam.W,cam.H);
 }};
}
