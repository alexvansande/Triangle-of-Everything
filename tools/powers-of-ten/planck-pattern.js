// An artistic cellular hierarchy, resolving into actual Conway Life cells.
// The intermediate scales are procedural; they are not a metacell simulation.
import {ramp,rng} from './math.js';
export const PLANCK_LENGTH=1.616255e-35;
export function lifeStep(cells,n){
 const next=new Uint8Array(cells.length);
 for(let y=0;y<n;y++)for(let x=0;x<n;x++){
  let neighbours=0;for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++)if(dx||dy)neighbours+=cells[((y+dy+n)%n)*n+(x+dx+n)%n];
  const i=y*n+x;next[i]=neighbours===3||(cells[i]&&neighbours===2)?1:0;
 }return next;
}
export function planckPattern(){
 const canvas=document.createElement('canvas'),gl=canvas.getContext('webgl',{alpha:true,premultipliedAlpha:true}),n=256,random=rng(314159);
 let cells=Uint8Array.from({length:n*n},()=>random()<.3?1:0),last=-1,acc=0,program,texture;
 // Oscillators and gliders keep the central final view active after long travel.
 function seed(){cells.fill(0);const shapes=[[[0,0],[1,0],[2,0]],[[1,0],[2,1],[0,2],[1,2],[2,2]],[[0,0],[1,0],[2,0],[2,1],[1,2]]];
  for(let y=8;y<n;y+=8)for(let x=8;x<n;x+=8){const shape=shapes[Math.floor(random()*shapes.length)];for(const [dx,dy]of shape)cells[(y+dy)*n+x+dx]=1;}
  for(const [x,y]of [[128,127],[129,127],[127,128],[128,128],[128,129]])cells[y*n+x]=1;}
 if(!gl)return{name:'cellular depth',range:[-36,-18.7],draw(){}};
 function shader(type,source){const s=gl.createShader(type);gl.shaderSource(s,source);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(s));return s;}
 program=gl.createProgram();gl.attachShader(program,shader(gl.VERTEX_SHADER,'attribute vec2 p;varying vec2 uv;void main(){uv=p;gl_Position=vec4(p,0.,1.);}'));
 gl.attachShader(program,shader(gl.FRAGMENT_SHADER,`
 precision highp float;varying vec2 uv;uniform sampler2D life;uniform vec2 aspect;uniform float zoom,alpha;
 float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
 float layer(vec2 p,float k){
  vec2 q=p*exp2(zoom-k)+vec2(87.37,113.23)+vec2(k*17.37,k*23.71);
  vec2 cell=floor(q),f=fract(q);float h=hash(cell+floor(k)*13.);
  float living=texture2D(life,(mod(cell,256.)+.5)/256.).r;
  // Tiny tiled arcs, channels and cellular islands, rather than a familiar set.
  vec2 v=h>.5?f:vec2(1.-f.x,f.y);
  float d=min(abs(length(v)-.5),abs(length(v-1.)-.5));
  float paths=1.-smoothstep(.045,.12,d);
  float boxes=step(.17,f.x)*step(f.x,.83)*step(.17,f.y)*step(f.y,.83)*living;
  return max(paths*.8,boxes);
 }
 void main(){vec2 p=uv*.5*aspect;float k=max(0.,floor(zoom-4.5)),f=clamp(zoom-4.5-k,0.,1.);
  float a=layer(p,k),b=layer(p,k+1.);
  float pattern=mix(a,b,smoothstep(0.,1.,f));
  pattern=max(pattern,layer(p,k-2.)*.27);
  vec2 q=p*exp2(zoom)+vec2(128.,128.);vec2 cell=floor(q),inCell=fract(q);
  float alive=texture2D(life,(mod(cell,256.)+.5)/256.).r;
  float square=step(.07,inCell.x)*step(inCell.x,.93)*step(.07,inCell.y)*step(inCell.y,.93);
  float finalView=1.-smoothstep(5.2,8.,zoom);
  float value=mix(pattern,alive*square,finalView);
  gl_FragColor=vec4(vec3(value*alpha),alpha);
 }`));gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(program));
 const quad=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,quad);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),gl.STATIC_DRAW);
 texture=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,texture);for(const p of [gl.TEXTURE_MIN_FILTER,gl.TEXTURE_MAG_FILTER])gl.texParameteri(gl.TEXTURE_2D,p,gl.NEAREST);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.REPEAT);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.REPEAT);
 let seeded=false;
 return{name:'cellular depth → Planck Life',range:[-36,-18.7],draw(cam){
  const a=1-ramp(cam.s,-20.1,-19.25);if(!a)return;
  const final=cam.s<-32.2;if(final&&!seeded){seed();seeded=true;}
  if(last<0)last=cam.t;acc+=Math.min(.1,Math.max(0,cam.t-last));last=cam.t;
  if(acc>.14){cells=lifeStep(cells,n);acc-=.14;}
  const w=Math.min(1400,cam.W),h=Math.round(w*cam.H/cam.W);if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;}
  gl.viewport(0,0,w,h);gl.useProgram(program);gl.bindBuffer(gl.ARRAY_BUFFER,quad);const pos=gl.getAttribLocation(program,'p');gl.enableVertexAttribArray(pos);gl.vertexAttribPointer(pos,2,gl.FLOAT,false,0,0);
  gl.bindTexture(gl.TEXTURE_2D,texture);gl.texImage2D(gl.TEXTURE_2D,0,gl.LUMINANCE,n,n,0,gl.LUMINANCE,gl.UNSIGNED_BYTE,Uint8Array.from(cells,v=>v*255));
  gl.uniform1i(gl.getUniformLocation(program,'life'),0);gl.uniform2f(gl.getUniformLocation(program,'aspect'),cam.W/cam.min,cam.H/cam.min);gl.uniform1f(gl.getUniformLocation(program,'zoom'),(cam.s-Math.log10(PLANCK_LENGTH))/Math.log10(2));gl.uniform1f(gl.getUniformLocation(program,'alpha'),a);gl.drawArrays(gl.TRIANGLE_STRIP,0,4);
  cam.ctx.drawImage(canvas,0,0,cam.W,cam.H);
  if(final&&cam.labels){cam.ctx.save();cam.ctx.fillStyle='#fff';cam.ctx.font=`${12*cam.dpr}px system-ui`;cam.ctx.fillText('One cell = one Planck length · Conway’s Game of Life',16*cam.dpr,cam.H-20*cam.dpr);cam.ctx.restore();}
 }};
}
