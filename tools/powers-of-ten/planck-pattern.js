// A monochrome Julia zoom resolving into density-matched Life catalog tiles.
import {ramp} from './math.js';
import {seedLifeCatalog} from './life-catalog.js';
export const PLANCK_LENGTH=1.616255e-35;
export const PLANCK_END=Math.log10(PLANCK_LENGTH*128);
export function lifeStep(cells,n){
 const next=new Uint8Array(cells.length);
 for(let y=0;y<n;y++)for(let x=0;x<n;x++){
  let neighbours=0;for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++)if(dx||dy)neighbours+=cells[((y+dy+n)%n)*n+(x+dx+n)%n];
  const i=y*n+x;next[i]=neighbours===3||(cells[i]&&neighbours===2)?1:0;
 }return next;
}
export function planckPattern(){
 const canvas=document.createElement('canvas'),gl=canvas.getContext('webgl',{alpha:true,premultipliedAlpha:true}),n=512;
 if(!gl)return{name:'fractal depths',range:[-36,-18.7],draw(){}};
 // Zoom about a repelling fixed point of z²+c. Perturbation arithmetic keeps
 // tiny offsets separate from the fixed orbit, retaining detail over 14 decades.
 const cr=-.12,ci=.74,a=1-4*cr,b=-4*ci,r=Math.hypot(a,b),zr=(1-Math.sqrt((r+a)/2))/2,zi=Math.sqrt((r-a)/2)/2;
 function shader(type,source){const s=gl.createShader(type);gl.shaderSource(s,source);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(s));return s;}
 const program=gl.createProgram();gl.attachShader(program,shader(gl.VERTEX_SHADER,'attribute vec2 p;varying vec2 uv;void main(){uv=p;gl_Position=vec4(p,0.,1.);}'));
 gl.attachShader(program,shader(gl.FRAGMENT_SHADER,`
 precision highp float;varying vec2 uv;uniform sampler2D life;uniform vec2 aspect;uniform float frameCells,pixelation,alpha,mode;
 const vec2 Z=vec2(${zr},${zi});
 vec2 cmul(vec2 a,vec2 b){return vec2(a.x*b.x-a.y*b.y,a.x*b.y+a.y*b.x);}
 float fractal(vec2 world){
  vec2 d=world*${PLANCK_LENGTH/1e-19*4.};float iterations=0.,radius=0.;
  for(int i=0;i<512;i++){
   d=cmul(2.*Z,d)+cmul(d,d);radius=dot(Z+d,Z+d);iterations=float(i)+1.;if(radius>100.)break;
  }
  if(radius<=100.)return 1.;
  float smoothN=iterations+1.-log2(max(.001,log2(sqrt(radius))));
  float bands=.5+.5*cos(smoothN*2.6);
  return smoothstep(.2,.83,bands);
 }
 void main(){
  vec2 world=uv*.5*aspect*frameCells,cell=floor(world);
  float grey=fractal(world);
  float alive=texture2D(life,(mod(cell+256.,512.)+.5)/512.).r;
  float value=mode>2.5?grey:mode>1.5?alive:mix(grey,alive,pixelation);
  float entry=clamp(alpha,0.,1.);
  float reveal=1.-smoothstep(entry*1.8,entry*1.8+.2,length(uv*aspect));
  gl_FragColor=vec4(vec3(value*alpha*reveal),alpha*reveal);
 }`));gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(program));
 const quad=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,quad);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),gl.STATIC_DRAW);
 const texture=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,texture);for(const p of [gl.TEXTURE_MIN_FILTER,gl.TEXTURE_MAG_FILTER])gl.texParameteri(gl.TEXTURE_2D,p,gl.NEAREST);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.REPEAT);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.REPEAT);
 let cells=new Uint8Array(n*n),seeded=false,last=-1,acc=0;
 const loc=name=>gl.getUniformLocation(program,name);
 function render(w,h,frameCells,pixelation,mode,alpha,aspect){
  if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;}
  gl.viewport(0,0,w,h);gl.useProgram(program);gl.bindBuffer(gl.ARRAY_BUFFER,quad);const pos=gl.getAttribLocation(program,'p');gl.enableVertexAttribArray(pos);gl.vertexAttribPointer(pos,2,gl.FLOAT,false,0,0);
  gl.bindTexture(gl.TEXTURE_2D,texture);gl.texImage2D(gl.TEXTURE_2D,0,gl.LUMINANCE,n,n,0,gl.LUMINANCE,gl.UNSIGNED_BYTE,Uint8Array.from(cells,v=>v*255));
  gl.uniform1i(loc('life'),0);gl.uniform2f(loc('aspect'),...aspect);gl.uniform1f(loc('frameCells'),frameCells);gl.uniform1f(loc('pixelation'),pixelation);gl.uniform1f(loc('mode'),mode);gl.uniform1f(loc('alpha'),alpha);gl.drawArrays(gl.TRIANGLE_STRIP,0,4);
 }
 function seedFromFractal(){
  // One grayscale sample selects a padded 16×16 catalog motif.
  const tiles=n/16;render(tiles,tiles,n,0,3,1,[1,1]);const rgba=new Uint8Array(tiles*tiles*4);gl.readPixels(0,0,tiles,tiles,gl.RGBA,gl.UNSIGNED_BYTE,rgba);
  const greys=Float32Array.from({length:tiles*tiles},(_,i)=>rgba[i*4]/255);
  cells=seedLifeCatalog(greys,tiles).cells;seeded=true;acc=0;
 }
 return{name:'fractal → Planck Life',range:[-36,-18.7],draw(cam){
  const alpha=1-ramp(cam.s,-20.1,-19.25);if(!alpha)return;
  const pixelation=1-ramp(cam.s,PLANCK_END+.05,PLANCK_END+.55);
  const dt=last<0?0:Math.min(.1,Math.max(0,cam.t-last));last=cam.t;
  if(pixelation<=0){seeded=false;acc=0;}
  else{
   if(!seeded)seedFromFractal();
   const rate=.25+7.75*pixelation*pixelation;acc+=dt*rate;
   if(acc>=1){cells=lifeStep(cells,n);acc-=1;}
  }
  const w=Math.min(1400,cam.W),h=Math.round(w*cam.H/cam.W);
  render(w,h,10**(cam.s-Math.log10(PLANCK_LENGTH)),pixelation,0,alpha,[cam.W/cam.min,cam.H/cam.min]);
  cam.ctx.drawImage(canvas,0,0,cam.W,cam.H);
 }};
}
