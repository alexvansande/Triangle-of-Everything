import {rng,ramp,LY} from './math.js';
// Illustrative colour basins, anchored to the same galactic directions as
// the named 2MRS attractors. Outer patches continue the palette, not survey data.
const basins=[[311.5,30.7,200,[190,140,255]],[150.6,-13.3,73,[110,170,255]],[58.1,88,100,[120,230,160]],[31.5,44.5,150,[255,130,150]]].map(([l,b,d,c])=>{l*=Math.PI/180;b*=Math.PI/180;return {p:[Math.cos(b)*Math.cos(l),Math.cos(b)*Math.sin(l),Math.sin(b)].map(v=>v*d/14103),c}});
function regionColour(p){
 const gold=[255,195,95],rad=Math.hypot(...p);
 let chosen=null,best=0;
 for(const b of basins){const distance=Math.hypot(...p.map((v,k)=>v-b.p[k]));const weight=Math.exp(-distance*distance/(.008*.008));if(weight>best){best=weight;chosen=b.c}}
 if(best<.1){const field=Math.sin(p[0]*19+1.2)*Math.cos(p[1]*14-.4)*Math.sin(p[2]*17+2.3);best=Math.max(0,(field-.28)/.72)*.65;chosen=basins[Math.floor((Math.sin(p[0]*7+p[2]*9)+1)*1.99)].c}
 const mix=Math.min(.8,best);return gold.map((v,k)=>Math.round(v+(chosen[k]-v)*mix));
}
export function buildFilaments(){
 const r=rng(8701),strands=[];
 for(const [count,radius]of [[160,.006],[180,.045],[260,.24],[340,.91]]){
  const nodes=[];while(nodes.length<count){const p=[r()*2-1,r()*2-1,r()*2-1];if(Math.hypot(...p)<1)nodes.push(p.map(v=>v*radius));}
  const edges=new Set();nodes.forEach((p,i)=>{
   const neighbours=nodes.map((q,j)=>({j,d:Math.hypot(...p.map((v,k)=>v-q[k]))})).filter(q=>q.j!==i).sort((a,b)=>a.d-b.d).slice(0,4);
   for(const {j}of neighbours){const key=[Math.min(i,j),Math.max(i,j)].join(':');if(edges.has(key))continue;edges.add(key);const q=nodes[j],length=Math.hypot(...p.map((v,k)=>v-q[k])),bend=[r()-.5,r()-.5,r()-.5];
    // Hyperspirograph brush: independent rough passes plus correlated,
    // multi-frequency divergence. All offsets stay in world space.
    for(let brush=0;brush<4;brush++){
     const phases=Array.from({length:3},()=>Array.from({length:4},()=>r()*Math.PI*2));
     const pts=[];for(let t=0;t<=64;t++){
      const u=t/64,envelope=Math.sin(Math.PI*u);
      const point=p.map((v,k)=>{
       let drift=0;for(let wave=0;wave<4;wave++)drift+=Math.sin(u*Math.PI*2*(1.3+wave*1.7)+phases[k][wave])/(1+wave*.8);
       return v+(q[k]-v)*u+envelope*length*(bend[k]*.9+.045*drift+.007*(r()-.5));
      });const radial=Math.hypot(...point);pts.push(radial>.97?point.map(v=>v*.97/radial):point);
     }strands.push({pts,brush,radius,length,colour:regionColour(pts[32])});
    }
   }
  });
 }return strands;
}
export function filamentBrush(){
 const strands=buildFilaments(),grain=filamentGrain(strands),R=46e9*LY,TAN=Math.tan(20*Math.PI/180);
 return cam=>{
  if(!cam.cmbView)return;const a=ramp(cam.s,23.8,24.6)*(1-.60*ramp(cam.s,26.3,27.0)),projection=ramp(cam.s,25.6,26.45);if(!a)return;
  const dot=(p,v)=>p.reduce((s,w,i)=>s+w*v[i],0),scale=(1-projection)*2*R*cam.min/(cam.F*cam.W)+projection/TAN,ctx=cam.ctx;
  ctx.save();ctx.globalCompositeOperation='screen';ctx.lineCap='round';ctx.lineJoin='round';
  for(const line of strands){const extent=2*R*line.radius/cam.F,visible=ramp(extent,.3,.75)*(1-ramp(extent,7,18));if(!visible)continue;ctx.beginPath();let begun=false;
   for(const p of line.pts){const z=dot(p,cam.cam.n),w=1-projection+projection*(cam.cmbView.dist-z);if(w<.02){begun=false;continue;}const x=cam.W/2+dot(p,cam.cam.r)*scale/w*cam.W/2,y=cam.H/2-dot(p,cam.cam.u)*scale/w*cam.H/2;if(begun)ctx.lineTo(x,y);else{ctx.moveTo(x,y);begun=true;}}
   ctx.strokeStyle=`rgba(${line.colour.join(",")},${a*visible*(.018+.008*line.brush)})`;ctx.lineWidth=(line.brush===0?3.2:.65)*cam.dpr;ctx.stroke();
  }ctx.restore();grain(cam,a,projection,scale);
 };
}

// Fine galaxies/density grains surrounding the same curved 3D centre lines.
// Fixed seeds prevent texture crawling as the camera moves.
export function buildFilamentGrain(strands){
 const random=rng(53491),points=[];
 for(const line of strands){if(line.brush!==0)continue;
  for(let i=0;i<line.pts.length-1;i++){
   const u=i/(line.pts.length-1),envelope=.2+.8*Math.sin(u*Math.PI),p=line.pts[i];
   for(let j=0;j<7;j++){
    const width=line.length*(j===0?.0015:.022)*envelope,t=random(),next=line.pts[i+1];
    const q=p.map((v,k)=>v+(next[k]-v)*t+(random()+random()+random()-1.5)*width);
    points.push(...q,line.radius,.35+random()*.65,.6+random()*.9,random(),...line.colour.map(c=>c/255));
   }
  }
 }return new Float32Array(points);
}
function filamentGrain(strands){
 const canvas=document.createElement('canvas'),gl=canvas.getContext('webgl',{alpha:true,premultipliedAlpha:true,antialias:false});
 if(!gl)return()=>{};
 const compile=(type,source)=>{const sh=gl.createShader(type);gl.shaderSource(sh,source);gl.compileShader(sh);if(!gl.getShaderParameter(sh,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(sh));return sh;};
 const program=gl.createProgram();
 gl.attachShader(program,compile(gl.VERTEX_SHADER,`
 precision highp float;attribute vec3 point,region;attribute float radius,weight,size,tint;
 uniform vec3 right,up,normal;uniform float projection,distance,scale,frame,alpha,pixel,pass;
 varying float energy,hue;varying vec3 regionTint;
 void main(){
  float z=dot(point,normal),w=mix(1.,distance-z,projection);
  float extent=radius/frame;
  float visible=smoothstep(.3,.75,extent)*(1.-smoothstep(7.,18.,extent));
  if(w<.02||visible<.001){gl_Position=vec4(3.,3.,0.,1.);energy=0.;gl_PointSize=1.;return;}
  gl_Position=vec4(dot(point,right)*scale,dot(point,up)*scale,0.,w);
  float perspective=mix(1.,clamp(distance/w,.6,2.5),projection);
  gl_PointSize=pixel*size*perspective*mix(1.35,5.,pass);
  energy=alpha*visible*weight*mix(.48,.045,pass);hue=tint;regionTint=region;
 }`));
 gl.attachShader(program,compile(gl.FRAGMENT_SHADER,`
 precision highp float;varying float energy,hue;varying vec3 regionTint;
 void main(){float r=length(gl_PointCoord*2.-1.);if(r>1.)discard;
  vec3 colour=mix(regionTint*.68,mix(regionTint,vec3(1.),.25),hue);
  gl_FragColor=vec4(colour*energy*exp(-4.*r*r),0.);
 }`));gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(program));
 const data=buildFilamentGrain(strands),buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,data,gl.STATIC_DRAW);
 const U=name=>gl.getUniformLocation(program,name);
 return(cam,alpha,projection,scale)=>{
  if(canvas.width!==cam.W||canvas.height!==cam.H){canvas.width=cam.W;canvas.height=cam.H;}
  gl.viewport(0,0,cam.W,cam.H);gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT);gl.useProgram(program);gl.bindBuffer(gl.ARRAY_BUFFER,buffer);
  for(const[name,n,offset]of [['point',3,0],['radius',1,12],['weight',1,16],['size',1,20],['tint',1,24],['region',3,28]]){const a=gl.getAttribLocation(program,name);gl.enableVertexAttribArray(a);gl.vertexAttribPointer(a,n,gl.FLOAT,false,40,offset);}
  gl.enable(gl.BLEND);gl.blendFunc(gl.ONE,gl.ONE);
  for(const[name,value]of [['right',cam.cam.r],['up',cam.cam.u],['normal',cam.cam.n]])gl.uniform3fv(U(name),value);
  for(const[name,value]of [['projection',projection],['distance',cam.cmbView.dist],['scale',scale],['frame',cam.F/(2*46e9*LY)],['alpha',alpha],['pixel',cam.dpr]])gl.uniform1f(U(name),value);
  for(const pass of [1,0]){gl.uniform1f(U('pass'),pass);gl.drawArrays(gl.POINTS,0,data.length/10);}
  cam.ctx.save();cam.ctx.globalCompositeOperation='lighter';cam.ctx.drawImage(canvas,0,0);cam.ctx.restore();
 };
}
