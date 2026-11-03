// Isolated CMB icon: observed temperature shell around the zoom's own 3D cosmic web, as the zoom
// opens on it (tools/powers-of-ten, at about 220 Gly): the density cloud's supercluster knots, the
// brush strands and their grain, all inside the WMAP shell.
import {cmbSphere} from '../tools/powers-of-ten/cmb-sphere.js';
import {buildFilaments,buildFilamentGrain} from '../tools/powers-of-ten/cosmic-filaments.js';
import {cameraAt} from '../tools/powers-of-ten/math.js';
import {cosmicOrbit} from '../tools/powers-of-ten/cosmic-motion.js';
const lightingURL=new URL('../content/icons/src/sphere template.png',import.meta.url).href;
// the template's sphere inside its 233×225 picture (fitted to its outline): it goes exactly on the
// shell's disc, or the strip between the two was multiplied by its empty surround, a dark second rim
const TEMPLATE={x:114.6,y:116.7,r:100.7};
// the zoom's opening scale (log10 of the frame width in metres): where its knots and strands are brightest
const OPENING=27.1,FILL=.92,TAN=Math.tan(20*Math.PI/180),DISTANCE=Math.sqrt(1+1/(FILL*TAN)**2);
const LY=9.4607e15,ZOOM_SPHERE_PX=454;   // the CMB's width in the zoom's frame at its opening
// radians a second: a turn in about 40 s, so it shows turning in the few seconds a video holds on it
// (the author, 2026-11-03: "the rotation makes it much better"; it was .035, a turn in 3 minutes)
const SPIN=.15;

// The density cloud's coarse points (video/powers-of-ten/generated/cosmic-web-v1, lod 1): every knot
// and a weighted sample of the rest, 8 bytes each (public/powers-of-ten/cosmic-web-icon.bin).
function knotCloud(){
 const canvas=document.createElement('canvas'),gl=canvas.getContext('webgl',{alpha:true,premultipliedAlpha:true,antialias:false,depth:false});
 let program,buffer,count=0,failed=!gl;
 if(gl)try{
  const shader=(type,source)=>{const s=gl.createShader(type);gl.shaderSource(s,source);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(s));return s;};
  program=gl.createProgram();
  // cosmic-web.js's shader at full projection (the CMB view)
  gl.attachShader(program,shader(gl.VERTEX_SHADER,`
   precision highp float;attribute vec3 aPosition;attribute vec2 aWK;
   uniform vec3 uR,uU,uN;uniform float uDistance,uAlpha,uPixel,uPass;varying vec3 vColour;varying float vAlpha;
   void main(){float weight=aWK.x*9.,knot=aWK.y,z=dot(aPosition,uN),w=uDistance-z;
    if(w<=.005){gl_Position=vec4(3.,3.,0.,1.);gl_PointSize=1.;vAlpha=0.;vColour=vec3(0.);return;}
    gl_Position=vec4(dot(aPosition,uR)*${1/TAN},dot(aPosition,uU)*${1/TAN},0.,w);
    float slab=.55+.45*clamp((z+1.)*.5,0.,1.),energy=(.7+2.8*knot)*weight*slab;
    gl_PointSize=mix(.85+1.25*knot,2.5+2.*knot,uPass)*uPixel*clamp(uDistance/max(w,.2),.65,2.);
    vColour=mix(vec3(.66,.32,.045),vec3(1.,.86,.46),clamp(knot*.85+min(weight,1.)*.15,0.,1.));
    vAlpha=uAlpha*energy*mix(.95,.12*knot*knot,uPass);
   }`));
  gl.attachShader(program,shader(gl.FRAGMENT_SHADER,`precision highp float;varying vec3 vColour;varying float vAlpha;void main(){vec2 p=gl_PointCoord*2.-1.;float r=dot(p,p);if(r>1.)discard;float a=vAlpha*exp(-3.5*r);gl_FragColor=vec4(vColour*a,0.);}`));
  gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(program));
  fetch('/powers-of-ten/cosmic-web-icon.bin').then(r=>{if(!r.ok)throw Error('knots missing');return r.arrayBuffer()}).then(raw=>{buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,raw,gl.STATIC_DRAW);count=raw.byteLength/8;}).catch(e=>{failed=true;console.warn('CMB icon: no knots',e)});
 }catch(e){failed=true;console.warn('CMB icon knots',e)}
 const loc=n=>gl.getUniformLocation(program,n);
 return{settled:()=>failed||count>0,draw(ctx,size,basis,pixel){
  if(failed||!count)return;
  if(canvas.width!==size){canvas.width=canvas.height=size;}gl.viewport(0,0,size,size);gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT);
  gl.useProgram(program);gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.enable(gl.BLEND);gl.blendFunc(gl.ONE,gl.ONE);
  const p=gl.getAttribLocation(program,'aPosition'),wk=gl.getAttribLocation(program,'aWK');
  gl.enableVertexAttribArray(p);gl.vertexAttribPointer(p,3,gl.SHORT,true,8,0);gl.enableVertexAttribArray(wk);gl.vertexAttribPointer(wk,2,gl.UNSIGNED_BYTE,true,8,6);
  for(const[name,v]of [['uR',basis.r],['uU',basis.u],['uN',basis.n]])gl.uniform3fv(loc(name),v);
  // the zoom's opening brightness: .22 × (.8 − .12) × 3
  gl.uniform1f(loc('uDistance'),DISTANCE);gl.uniform1f(loc('uAlpha'),.449);gl.uniform1f(loc('uPixel'),pixel);
  for(const pass of [1,0]){gl.uniform1f(loc('uPass'),pass);gl.drawArrays(gl.POINTS,0,count);}
  ctx.save();ctx.globalCompositeOperation='lighter';ctx.drawImage(canvas,0,0);ctx.restore();
 }};
}

// The zoom's brush strands (cosmic-filaments.js filamentBrush) and their grain, as GPU points: the brush
// strokes ~3,400 strands as 2D paths, 118 ms a frame at 256 px, too slow for a picture that turns. Each
// strand becomes a row of overlapping points of its width, with the brush's strength shared out along
// the row; the grain is thinned to a quarter at four times the strength. Only what the zoom shows at
// its opening scale is kept (its visibility rule, extent 0.3 to 0.75).
function strandSprites(){
 const canvas=document.createElement('canvas'),gl=canvas.getContext('webgl',{alpha:true,premultipliedAlpha:true,antialias:false,depth:false});
 if(!gl)return {draw(){}};
 const ramp=(x,a,b)=>Math.max(0,Math.min(1,(x-a)/(b-a))),R=46e9*LY,frame=10**OPENING/(2*R),A=1.65*.5;  // the brush's alpha there, halved: as points they read twice as bright (checked against the zoom's opening frame)
 // a point's share of its stroke: the spacing over the width, both in the zoom's pixels
 const PX_PER_R=.5*ZOOM_SPHERE_PX/FILL/(TAN*DISTANCE);
 const visible=radius=>{const e=radius/frame;return ramp(e,.3,.75)*(1-ramp(e,7,18));};
 const data=[],push=(p,c,alpha,size,grow,soft)=>data.push(p[0],p[1],p[2],c[0],c[1],c[2],alpha,size,grow,soft);
 const strands=buildFilaments();
 for(const l of strands){const v=visible(l.radius);if(!v)continue;
  const width=l.brush===0?3.2:.65,step=l.brush===0?.0077:.0035,alpha=A*v*(.018+.008*l.brush),c=l.colour.map(x=>x/255);
  for(let i=0;i<l.pts.length-1;i++){const p=l.pts[i],q=l.pts[i+1],d=Math.hypot(q[0]-p[0],q[1]-p[1],q[2]-p[2]),n=Math.max(1,Math.ceil(d/step));
   for(let k=0;k<n;k++){const t=k/n;push([p[0]+(q[0]-p[0])*t,p[1]+(q[1]-p[1])*t,p[2]+(q[2]-p[2])*t],c,alpha*Math.min(1,(d/n)*PX_PER_R/width),width,0,0);}}
 }
 const grain=buildFilamentGrain(strands);
 for(let i=0;i<grain.length;i+=40){   // every fourth point (10 floats each)
  const v=visible(grain[i+3]);if(!v)continue;const tint=grain[i+6],region=[grain[i+7],grain[i+8],grain[i+9]];
  const c=region.map(x=>x*.68+(x*.75+.25-x*.68)*tint);
  for(const pass of [1,0])push([grain[i],grain[i+1],grain[i+2]],c,4*A*v*grain[i+4]*(pass?.045:.48),grain[i+5]*(pass?5:1.35),1,1);
 }
 const shader=(type,source)=>{const s=gl.createShader(type);gl.shaderSource(s,source);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(s));return s;};
 const program=gl.createProgram();
 gl.attachShader(program,shader(gl.VERTEX_SHADER,`precision highp float;attribute vec3 aP,aC;attribute float aA,aS,aGrow,aSoft;uniform vec3 uR,uU,uN;uniform float uDistance,uPixel;varying vec3 vC;varying float vA,vSoft;
  void main(){float w=uDistance-dot(aP,uN);if(w<.02){gl_Position=vec4(3.,3.,0.,1.);gl_PointSize=1.;vA=0.;return;}
   gl_Position=vec4(dot(aP,uR)*${1/TAN},dot(aP,uU)*${1/TAN},0.,w);
   gl_PointSize=max(1.,aS*uPixel*mix(1.,clamp(uDistance/w,.6,2.5),aGrow));vC=aC;vA=aA;vSoft=aSoft;}`));
 gl.attachShader(program,shader(gl.FRAGMENT_SHADER,`precision highp float;varying vec3 vC;varying float vA,vSoft;void main(){float r=length(gl_PointCoord*2.-1.);if(r>1.)discard;
  float a=vA*mix(1.-smoothstep(.6,1.,r),exp(-4.*r*r),vSoft);gl_FragColor=vec4(vC*a,0.);}`));
 gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS)){console.warn('CMB icon strands',gl.getProgramInfoLog(program));return {draw(){}};}
 const buffer=gl.createBuffer(),count=data.length/10;gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(data),gl.STATIC_DRAW);
 const loc=n=>gl.getUniformLocation(program,n);
 return {count,draw(ctx,size,basis,pixel){
  if(canvas.width!==size){canvas.width=canvas.height=size;}gl.viewport(0,0,size,size);gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT);
  gl.useProgram(program);gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.enable(gl.BLEND);gl.blendFunc(gl.ONE,gl.ONE);
  for(const[name,n,off]of [['aP',3,0],['aC',3,12],['aA',1,24],['aS',1,28],['aGrow',1,32],['aSoft',1,36]]){const a=gl.getAttribLocation(program,name);gl.enableVertexAttribArray(a);gl.vertexAttribPointer(a,n,gl.FLOAT,false,40,off);}
  for(const[name,v]of [['uR',basis.r],['uU',basis.u],['uN',basis.n]])gl.uniform3fv(loc(name),v);
  gl.uniform1f(loc('uDistance'),DISTANCE);gl.uniform1f(loc('uPixel'),pixel);gl.drawArrays(gl.POINTS,0,count);
  ctx.save();ctx.globalCompositeOperation='lighter';ctx.drawImage(canvas,0,0);ctx.restore();
 }};
}

export function cmbObject(){
 const shell=cmbSphere('/powers-of-ten/wmap-ilc-5yr-2k.webp');
 if(!shell.available)return null;
 const knots=knotCloud(),strands=strandSprites(),lighting=new Image();lighting.src=lightingURL;
 const canvas=document.createElement('canvas'),ctx=canvas.getContext('2d'),work=document.createElement('canvas'),wctx=work.getContext('2d');
 let mask=null,maskSize=0;
 const shade=size=>{   // the template's light, screen-fixed, multiplied in (white where it has none)
  if(maskSize!==size){const c=document.createElement('canvas');c.width=c.height=size;const m=c.getContext('2d'),R=FILL*size/2;
   m.fillStyle='#fff';m.fillRect(0,0,size,size);m.drawImage(lighting,TEMPLATE.x-TEMPLATE.r,TEMPLATE.y-TEMPLATE.r,2*TEMPLATE.r,2*TEMPLATE.r,size/2-R,size/2-R,2*R,2*R);
   mask=m.getImageData(0,0,size,size).data;maskSize=size;}
  const pixels=ctx.getImageData(0,0,size,size),d=pixels.data;
  for(let i=0;i<d.length;i+=4)if(d[i+3])for(let k=0;k<3;k++)d[i+k]*=.3+.7*mask[i+k]/255;
  ctx.putImageData(pixels,0,0);
 };
 return {canvas,ready:()=>shell.ready()&&lighting.complete&&lighting.naturalWidth>0&&knots.settled(),draw(size=512,seconds=0){
  if(canvas.width!==size){canvas.width=canvas.height=size;}
  // drawn at up to twice the size and scaled down: the shell's silhouette is a hard cut in its shader
  const S=Math.round(size*Math.min(2,Math.max(1,1536/size)));if(work.width!==S){work.width=work.height=S;}
  wctx.clearRect(0,0,S,S);
  const basis=cosmicOrbit(cameraAt(Math.log10(176e9*LY)),.8+seconds*SPIN),pixel=FILL*S/ZOOM_SPHERE_PX;
  // the space inside the shell: the zoom's glow is tuned against black, and over the chart's colour
  // it washed out to a pale haze
  wctx.fillStyle='#03030c';wctx.beginPath();wctx.arc(S/2,S/2,FILL*S/2,0,7);wctx.fill();
  shell.draw(wctx,S,{dist:DISTANCE,a:.365},basis,0);
  knots.draw(wctx,S,basis,pixel);
  strands.draw(wctx,S,basis,pixel);
  shell.draw(wctx,S,{dist:DISTANCE,a:.365,whole:true},basis,1);   // the strands seen through the near half
  ctx.clearRect(0,0,size,size);ctx.imageSmoothingQuality='high';ctx.drawImage(work,0,0,size,size);
  if(lighting.complete&&lighting.naturalWidth)shade(size);
  return canvas;
 }};
}
