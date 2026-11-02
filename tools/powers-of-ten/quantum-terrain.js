import {leniaAnimation} from './lenia-animation.js';
import {timeAtProgress,VIDEO_END_SCALE} from './zoom-timeline.js';
// Rule-evolved multichannel Lenia over grayscale terrain. Lenia is not a QFT simulation.
// Bend references: demos/visual/terrain-3d (value-noise heightfield,
// ray intersection and slope lighting), demos/lenia (Orbium seed).
import {ramp,rng} from './math.js';
import {stepRGBLife} from './life-colour.js';
import {buildLifeCatalog} from './life-catalog.js';
const PLANCK=1.616255e-35,FIELD=1e-18;
export function quantumTerrain(){
 const animation=leniaAnimation();
 const canvas=document.createElement('canvas'),gl=canvas.getContext('webgl2',{alpha:true,antialias:false,preserveDrawingBuffer:new URLSearchParams(location.search).has('bake')});
 let ready=false,program,texture,strataTexture;
 const finalImage=new Image();finalImage.src='/video/powers-of-ten/generated/lenia-terrain-v1/planck-relief.png';
 const image=document.createElement('canvas');image.width=image.height=1024;
 Promise.all(['multichannel.json','found-creatures.json'].map(f=>fetch('/video/powers-of-ten/generated/lenia-terrain-v1/'+f).then(r=>r.json()))).then(async([mover,library])=>{
  const {cells,width,height}=mover;
  const seed=document.createElement('canvas');seed.width=width;seed.height=height;const c=seed.getContext('2d'),pixels=c.createImageData(width,height);
  cells.forEach((v,i)=>{pixels.data.set([...v,255],i*4)});c.putImageData(pixels,0,0);
  const found=new Image();found.src='/video/powers-of-ten/generated/lenia-terrain-v1/'+library.atlas;
  await found.decode();
  const seeds=[seed,...library.creatures.map(form=>{
   const c=document.createElement('canvas');c.width=form.width;c.height=form.height;
   c.getContext('2d').drawImage(found,form.x,form.y,form.width,form.height,0,0,c.width,c.height);return c;
  })];
  found.removeAttribute('src');
  const ctx=image.getContext('2d');ctx.fillStyle='#000';ctx.fillRect(0,0,1024,1024);ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';ctx.filter='blur(2px)';
  const random=rng(79113),forms=[[0,0,0,1]];
  // Irregular field, a deliberate centre, no square lattice of organisms.
  for(let i=0;i<50;i++){const x=(random()-.5)*1.1,y=(random()-.5)*1.1;if(Math.hypot(x,y)<.14)continue;forms.push([x,y,random()*Math.PI*2,.6+random()*.7])}
  for(const [index,[x,y,a,size]] of forms.entries())for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){ctx.save();ctx.translate(512+(x+dx)*1024,512+(y+dy)*1024);ctx.rotate(a);const w=113*size;const shape=seeds[index===0?0:index%seeds.length];ctx.drawImage(shape,-w*.55,-w*.55,w,w);ctx.restore()}
  // Six distinct populations from the user's Flow Lenia discoveries.
  // Small packed textures keep the rich world independent of live simulation.
  const atlas=document.createElement('canvas');atlas.width=1536;atlas.height=256;
  const a=atlas.getContext('2d');a.fillStyle='#000';a.fillRect(0,0,1536,256);
  for(let layer=0;layer<6;layer++){
   const tile=document.createElement('canvas');tile.width=tile.height=256;
   const t=tile.getContext('2d');t.fillStyle='#000';t.fillRect(0,0,256,256);t.filter='blur(.4px)';t.globalCompositeOperation='screen';
   const random=rng(5513+layer*1777);
   for(let i=0;i<16;i++){
    const shape=seeds[1+(layer*7+i%7)%(seeds.length-1)];
    const x=i===0?128:random()*256,y=i===0?128:random()*256;
    const size=35+random()*45,angle=random()*Math.PI*2;
    for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){
     t.save();t.translate(x+dx*256,y+dy*256);t.rotate(angle);
     t.drawImage(shape,-size/2,-size/2,size,size);t.restore();
    }
   }a.drawImage(tile,layer*256,0);
  }
  strataTexture=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,strataTexture);
  gl.texImage2D(gl.TEXTURE_2D,0,gl.RGB8,gl.RGB,gl.UNSIGNED_BYTE,atlas);
  gl.generateMipmap(gl.TEXTURE_2D);
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR_MIPMAP_LINEAR);
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
  for(const key of [gl.TEXTURE_WRAP_S,gl.TEXTURE_WRAP_T])gl.texParameteri(gl.TEXTURE_2D,key,gl.CLAMP_TO_EDGE);
  atlas.width=atlas.height=1;
  texture=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,texture);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGB8,gl.RGB,gl.UNSIGNED_BYTE,image);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.REPEAT);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.REPEAT);ready=true;
 }).catch(e=>console.error('Lenia terrain seed',e));
 if(!gl)return{name:'quantum terrain',range:[-36,-14.7],draw(){}};
 const compile=(type,src)=>{const sh=gl.createShader(type);gl.shaderSource(sh,src);gl.compileShader(sh);if(!gl.getShaderParameter(sh,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(sh));return sh};
 program=gl.createProgram();gl.attachShader(program,compile(gl.VERTEX_SHADER,`#version 300 es
 in vec2 position;void main(){gl_Position=vec4(position,0.,1.);}`));
 gl.attachShader(program,compile(gl.FRAGMENT_SHADER,`#version 300 es
 precision highp float;uniform vec2 resolution;uniform float depth,span,unit,quality,resolveNoise;uniform sampler2D field,strataField;out vec4 frag;
 float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
 float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*f*(f*(f*6.-15.)+10.);return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+1.),f.x),f.y);}
 // Styles belong to immutable world octaves, not the current camera
 // depth. Their valleys therefore enlarge into the next landscape instead
 // of changing shape while we look at them.
 float band(float k,float a,float b){
  float z=(k-(a+b)*.5)/((b-a)*.43),bell=exp(-.5*z*z);
  return bell*smoothstep(.015,.045,bell);
 }
 float landform(vec2 q,float k){
  // Roughly two-decade chapters with overlapping, quieter neighbours.
  float hillWeight=.28+1.6*band(k,33.,51.);
  float base=noise(q),height=base*hillWeight,totalWeight=hillWeight;
  float waves=band(k,-12.,-3.),faults=band(k,-5.,4.);
  float craters=band(k,2.,11.),canyon=band(k,10.,19.);
  float folds=band(k,18.,27.),ridges=band(k,20.,29.);
  float membranes=band(k,27.,36.),labyrinth=.25*band(k,23.,32.);
  float delta=.25*band(k,9.,20.),badlands=.25*band(k,15.,26.);
  if(waves>0.){
   vec2 w=q-(vec2(17.31,29.73)+vec2(k*13.57,k*7.13));
   float ripples=1.8*sin(length(w)*4.4+.2*noise(q*.5))+sin(length(w-vec2(.8,-.6))*3.7);
   height+=(.5+ripples*.135)*(waves*.83);totalWeight+=waves*.83;
  }
  if(delta>0.||badlands>0.){
   vec2 w=q*vec2(1.1,.65)+vec2(noise(q*.6+4.),noise(q*.6-3.))*.8;
   float mainDistance=abs(noise(w)-.5);
   float trunk=exp(-pow(mainDistance/.045,2.));
   float tributaries=exp(-pow((noise(w*3.1+8.)-.5)/.045,2.))*(1.-smoothstep(.06,.24,mainDistance));
   float fine=exp(-pow((noise(w*8.3-2.)-.5)/.04,2.))*(1.-smoothstep(.02,.12,mainDistance));
   float channels=trunk*.4+tributaries*.22+fine*.09;
   height+=(.58+.22*noise(w*.65)-channels)*(delta*.93);totalWeight+=delta*.93;
   float terraces=smoothstep(.2,.32,base)*.22+smoothstep(.44,.55,base)*.25+smoothstep(.68,.8,base)*.2;
   height+=(.16+terraces-channels*.8)*(badlands*.9);totalWeight+=badlands*.9;
  }
  // Narrow valleys winding between broad, gently terraced plateaus.
  if(canyon>0.){
  float angle=hash(vec2(k,17.))*6.2831853;
  mat2 turn=mat2(cos(angle),-sin(angle),sin(angle),cos(angle));
  vec2 bent=turn*q;
  bent+=vec2(noise(bent*.47+13.),noise(bent*.47-9.))*.72;
  float river=noise(bent),valley=1.-smoothstep(.035,.145,abs(river-.49));
  // Broad recessed floors and steeper canyon walls, not raised filaments.
  float plateau=.70-valley*.62+.08*noise(bent*2.3);
  height+=(plateau)*(canyon*.88);totalWeight+=canyon*.88;
  }
  // Crater bowls and raised rims, contained inside each seeded cell.
  if(craters>0.){
   vec2 cell=floor(q),local=fract(q);float crater=0.;
   for(int y=-1;y<=1;y++)for(int x=-1;x<=1;x++){
    vec2 offset=vec2(float(x),float(y)),id=cell+offset;
    if(hash(id+83.)<.48){
     vec2 centre=offset+.5+.9*(vec2(hash(id),hash(id+3.))-.5);
     float radius=length(local-centre),r=.13+.24*hash(id+7.);
     float bowl=-.48*exp(-radius*radius/(r*r*.63));
     float rim=.24*exp(-pow((radius-r)/(.025+r*.08),2.));
     crater+=(bowl+rim)*(1.-smoothstep(r*1.25,r*1.65,radius));
    }
   }
   height+=(.5+crater+.12*(base-.5))*(craters*1.35);totalWeight+=craters*1.35;
  }
  if(faults>0.){
   float angle=1.15;
   float trace=dot(q,vec2(cos(angle),sin(angle)))*.65+.55*noise(q*.6);
   float wave=sin(trace*6.2831853),crack=exp(-pow(wave/.14,2.));
   float displaced=.5+.16*sin(trace*6.2831853+.6)-.28*crack;
   height+=(displaced+.1*(base-.5))*(faults*1.1);totalWeight+=faults*1.1;
  }
  if(membranes>0.){
   vec2 cell=floor(q),local=fract(q);float first=10.,second=10.;
   for(int y=-1;y<=1;y++)for(int x=-1;x<=1;x++){
    vec2 offset=vec2(float(x),float(y));vec2 id=cell+offset;
    vec2 site=offset+.5+.65*(vec2(hash(id),hash(id+31.7))-.5);
    float d=length(site-local);if(d<first){second=first;first=d;}else second=min(second,d);
   }
   float wall=exp(-pow((second-first)/.07,2.));
   height+=(.62-.50*wall+.10*base)*(membranes*1.1);totalWeight+=membranes*1.1;
  }
  if(labyrinth>0.){
   vec2 w=q+vec2(noise(q*.9+11.),noise(q*.9-7.))*1.5;
   float stripes=.5+.5*sin(w.x*5.+w.y*3.8+4.*noise(w*.7));
   float paths=smoothstep(.3,.7,stripes);
   height+=(.22+.5*paths+.08*base)*(labyrinth*.5);totalWeight+=labyrinth*.5;
  }
  if(folds>0.){
  float folded=noise(q+vec2(sin(q.y*2.1),sin(q.x*1.4))*.65);
  height+=(.64-.48*pow(.5+.5*sin(folded*8.),3.))*(folds*.8);totalWeight+=folds*.8;
  }
  // Low at the strand centre: this is a carved channel, not a crest.
  float ridge=sqrt(pow(base*2.-1.,2.)+.003);
  float result=(height+ridge*ridges*.65)/(totalWeight+ridges*.65);
  return result;
 }
 // Photoshop-style Color blend: retain relief luminance while adopting
 // the field hue/saturation, clipping back into the RGB gamut.
 float luminance(vec3 c){return dot(c,vec3(.3,.59,.11));}
 vec3 setLuminance(vec3 c,float target){
  c+=target-luminance(c);float lo=min(c.r,min(c.g,c.b)),hi=max(c.r,max(c.g,c.b));
  if(lo<0.)c=target+(c-target)*target/max(target-lo,.0001);
  if(hi>1.)c=target+(c-target)*(1.-target)/max(hi-target,.0001);
  return clamp(c,0.,1.);
 }
 float creature(vec2 p){vec2 uv=.5+p*span;return dot(texture(field,uv).rgb,vec3(1.));}
 // World-anchored, irregular stamps. Each neighbourhood has its own
 // position, angle and scale; the source texture never repeats as a square tile.
 vec3 cellularStrata(vec2 p){
  vec3 colour=vec3(0.);
  for(int j=0;j<6;j++){
   float layer=5.+float(j)*7.,f=exp2(layer-depth);
   // Subpixel populations contribute their average pigment, not an aliased
   // random stamp mask. This also avoids large-coordinate hash precision noise.
   vec3 average=textureLod(strataField,vec2((.5+float(j))/6.,.5),8.).rgb*.55;
   float resolved=1.-smoothstep(min(resolution.x,resolution.y)/128.,min(resolution.x,resolution.y)/32.,f);
   colour+=average*(1.-resolved);
   if(resolved<.001)continue;
   float angle=float(j)*1.13;mat2 turn=mat2(cos(angle),-sin(angle),sin(angle),cos(angle));
   vec2 q=turn*p*f+vec2(.13,.21)*float(j),cell=floor(q);
   float lod=clamp(log2(max(1.,256.*f/min(resolution.x,resolution.y))),0.,8.);
   for(int y=-1;y<=1;y++)for(int x=-1;x<=1;x++){
    vec2 id=cell+vec2(float(x),float(y));
    vec2 seed=id+vec2(float(j)*31.7,17.3);
    vec2 centre=id+vec2(.15)+.7*vec2(hash(seed),hash(seed+19.1));
    float theta=hash(seed+43.8)*6.2831853;
    float size=.65+.3*hash(seed+71.2);
    mat2 rotation=mat2(cos(theta),-sin(theta),sin(theta),cos(theta));
    vec2 uv=.5+rotation*(q-centre)/size;
    if(uv.x>0.&&uv.y>0.&&uv.x<1.&&uv.y<1.){
     vec2 edge=smoothstep(vec2(0.),vec2(.12),uv)*smoothstep(vec2(0.),vec2(.12),1.-uv);
     colour+=textureLod(strataField,vec2((uv.x+float(j))/6.,uv.y),lod).rgb*edge.x*edge.y*resolved;
    }
   }
  }return colour;
 }
 float terrain(vec2 p){
  float sum=0.;float base=floor(depth);
  // Each octave is anchored to its own immutable seed. Rebasing octave
  // indices avoids tiny floating-point positions over 17 physical decades.
  for(int j=-5;j<=9;j++){float k=base+float(j),f=exp2(k-depth);vec2 origin=vec2(17.31,29.73)+vec2(k*13.57,k*7.13);
   float gate=smoothstep(.04,.12,f)*(1.-smoothstep(150.,350.,f));
   float n=landform(p*f+origin,k)-landform(origin,k);
   sum+=n*pow(f,-.83)*gate;
  }
  // Below the Lenia texture's resolvable scale, continue its local tangent
  // analytically. Dividing tiny texture interpolation errors by span made
  // the old heightfield develop magnified staircase cliffs.
  vec2 centre=vec2(.5);float delta=.002;
  vec2 gradient=vec2(dot(texture(field,centre+vec2(delta,0)).rgb-texture(field,centre-vec2(delta,0)).rgb,vec3(1.)),
                     dot(texture(field,centre+vec2(0,delta)).rgb-texture(field,centre-vec2(0,delta)).rgb,vec3(1.)))/(2.*delta);
  float tangent=dot(gradient,p);
  float relief=tangent;
  if(span>.002)relief=mix(tangent,(creature(p)-creature(vec2(0)))/span,smoothstep(.002,.012,span));
  float cellular=dot(cellularStrata(p)-cellularStrata(vec2(0)),vec3(1.));
  return sum*.075+relief*.007+cellular*.009;
 }
 void main(){
  // Planck units become actual nearest-neighbour output cells. No Life
  // tiles, iteration or crossfade replaces the field at the endpoint.
  float pixel=max(1.,unit*min(resolution.x,resolution.y));
  vec2 screen=(floor(gl_FragCoord.xy/pixel)+.5)*pixel;
  vec2 uv=(screen-.5*resolution)/min(resolution.x,resolution.y);
  // Orthographic nadir view: map-like framing, with all depth expressed
  // by the shared heightfield, normals and cast shadows.
  vec3 ray=vec3(0.,0.,-1.);
  vec3 p=vec3(uv,terrain(uv));float e=max(.0015,unit*.45),h=p.z;
  vec3 normal=normalize(vec3(terrain(p.xy-vec2(e,0))-terrain(p.xy+vec2(e,0)),terrain(p.xy-vec2(0,e))-terrain(p.xy+vec2(0,e)),2.*e));
  vec3 light=normalize(vec3(-.75,.55,.48));float diffuse=max(0.,dot(normal,light));
  float shadow=1.;
  // March toward the light through the very same terrain, so raised
  // Lenia rims and mountains cast shadows onto neighbouring slopes.
  for(int i=0;i<22;i++){
   if(float(i)>=quality)break;
   float travel=.005*pow(1.26,float(i)*22./quality);vec3 probe=p+light*travel;
   float clearance=probe.z-terrain(probe.xy);
   shadow=min(shadow,clamp(14.*(clearance+.0015)/travel,0.,1.));
  }
  float ao=clamp(.9+(h-terrain(p.xy+vec2(.035)))*2.,.68,1.);
  float value=(.29+.53*diffuse*shadow)*ao;
  value+=shadow*.10*pow(max(0.,dot(reflect(-light,normal),-ray)),18.);
  // Soft directional bas-relief, sharing the Lenia and fractal height.
  float emboss=.54+.38*dot(normal.xy,normalize(vec2(-1.,1.)));
  value=mix(value,emboss,.72);
  vec2 fieldUV=.5+p.xy*span;vec3 channels=vec3(0.);
  channels=texture(field,fieldUV).rgb;
  float presence=clamp(dot(channels,vec3(1.))*2.5,0.,1.)*smoothstep(.002,.012,span)*(1.-smoothstep(2.,10.,span));
  vec3 strata=cellularStrata(p.xy);
  float strataPresence=clamp(dot(strata,vec3(1.))*1.5,0.,.48);
  channels+=strata*.38;presence=max(presence,strataPresence);
  vec3 pigment=channels/max(max(channels.r,channels.g),max(channels.b,.001));
  vec3 colour=mix(vec3(clamp(value,.055,.94)),setLuminance(pigment,value),presence*.92);
  // Muted broad RGB clouds, applied as Color at 30%, keeping relief intact.
  vec3 clouds=vec3(0.);float cloudWeight=0.;
  for(int j=-1;j<=1;j++){
   float octave=floor(depth/6.)+float(j),d=octave*6.-depth;
   float weight=exp(-d*d/32.);vec2 q=p.xy*exp2(d)+vec2(octave*11.17,octave*7.31);
   clouds+=vec3(noise(q*.45+3.),noise(q*.45+19.),noise(q*.45-8.))*weight;cloudWeight+=weight;
  }
  clouds/=max(cloudWeight,.001);
  vec3 tint=mix(vec3(.5),clouds,.5);
  float tintFade=smoothstep(1e-12,1e-8,span);
  colour=mix(colour,setLuminance(tint,luminance(colour)),.30*tintFade*(1.-presence*.7));
  if(resolveNoise>.5){
   float physical=span*1e-18;
   float amount=1.-smoothstep(-33.,-31.,log(physical)/log(10.));
   vec2 cell=floor(uv*physical/1.616255e-35)+1024.;
   vec3 speck=vec3(step(.78,hash(cell+17.)),step(.78,hash(cell+100.)),step(.78,hash(cell+183.)));
   // Subpixel cells average to their mean coverage instead of shimmering.
   float resolved=smoothstep(.35,1.,1.616255e-35/physical*min(resolution.x,resolution.y));
   colour=mix(colour,mix(vec3(.22),speck,resolved),amount);
  }
  frag=vec4(colour,1.);
 }`));gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(program));
 const buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),gl.STATIC_DRAW);
 // Output-only chromatic aberration: never fed back into the heightfield
 // or the frozen Planck screenshot, so it cannot distort subsequent zooms.
 const aberrated=document.createElement('canvas'),bloom=document.createElement('canvas');
 function drawAberrated(cam){
  if(aberrationVersion===surfaceVersion){cam.ctx.drawImage(aberrated,0,0,cam.W,cam.H);return;}aberrationVersion=surfaceVersion;
  if(aberrated.width!==canvas.width||aberrated.height!==canvas.height){aberrated.width=canvas.width;aberrated.height=canvas.height;}
  const c=aberrated.getContext('2d'),w=canvas.width,h=canvas.height;
  const offset=5*Math.min(w,h)/2000;
  c.globalCompositeOperation='source-over';c.clearRect(0,0,w,h);
  // Mask each shifted copy to one colour channel, then add the channels.
  for(const [colour,dx,dy] of [['#ff0000',-offset,0],['#00ff00',0,offset],['#0000ff',0,0]]){
   const layer=colourLayers[colour],l=layer.getContext('2d');
   if(layer.width!==w||layer.height!==h){layer.width=w;layer.height=h;}
   l.globalCompositeOperation='copy';l.drawImage(canvas,dx,dy);
   l.globalCompositeOperation='multiply';l.fillStyle=colour;l.fillRect(0,0,w,h);
   c.globalCompositeOperation='lighter';c.drawImage(layer,0,0);
  }
  if(bloom.width!==w||bloom.height!==h){bloom.width=w;bloom.height=h;}
  const glow=bloom.getContext('2d');glow.clearRect(0,0,w,h);
  glow.filter=`blur(${Math.max(.7,w*.002)}px) brightness(1.15)`;glow.drawImage(aberrated,0,0);glow.filter='none';
  c.save();c.globalCompositeOperation='screen';c.globalAlpha=.16;c.drawImage(bloom,0,0);c.restore();
  cam.ctx.drawImage(aberrated,0,0,cam.W,cam.H);
 }
 const colourLayers=Object.fromEntries(['#ff0000','#00ff00','#0000ff'].map(c=>[c,document.createElement('canvas')]));
 const frozen=document.createElement('canvas');let captured=false;
 const FREEZE_PIXELS=2048,FREEZE_SPAN=FREEZE_PIXELS*PLANCK;
 const LIFE_SIZE=256,LIFE_OFFSET=896,lifeSeed=new Uint8Array(256*256),patternBits=new Uint8Array(FREEZE_PIXELS*FREEZE_PIXELS);
 let lifeCells,lifeGeneration=0,lifeStart=null,terrainPixels;
 const rgb=[[255,0,0],[0,255,0],[0,0,255]];
 function animateLife(cam){
  if(cam.F>100*PLANCK){lifeStart=null;lifeGeneration=0;lifeCells=null;return false;}
  const video=new URLSearchParams(location.search).has('renderZoom');
  if(lifeStart===null)lifeStart=cam.t;
  const crossing=video?timeAtProgress((window.canopyTest.maximum-Math.log10(100*PLANCK))/(window.canopyTest.maximum-VIDEO_END_SCALE)):lifeStart;
  const generation=Math.max(0,Math.floor((cam.t-crossing)*6));
  if(!lifeCells||generation<lifeGeneration){lifeCells=lifeSeed.slice();lifeGeneration=0;}
  while(lifeGeneration<generation){lifeCells=stepRGBLife(lifeCells,LIFE_SIZE);lifeGeneration++;}
  return true;
 }
 const ease=(a,b,x)=>{const t=Math.max(0,Math.min(1,(x-a)/(b-a)));return t*t*(3-2*t)};
 function pixelHash(x,y,salt){let n=Math.imul(x+salt,374761393)^Math.imul(y-salt,668265263);n=Math.imul(n^(n>>>13),1274126177);return ((n^(n>>>16))>>>0)/4294967296;}
 function pixelColour(x,y,animate,count){
  const cell=y*FREEZE_PIXELS+x,i=cell*4,X=x-LIFE_OFFSET,Y=y-LIFE_OFFSET;
  const terrain=terrainPixels[cell];let bits=patternBits[cell];
  const noiseAmount=1-ease(-33,-31,Math.log10(count*PLANCK)),patternAmount=1-ease(100,320,count);
  // Noise and motifs share the same Planck lattice. Retain the motif's
  // live cells from the start; extra noise resolves away around them.
  if(!animate&&pixelHash(x,y,91)>patternAmount){
   const density=.10+.22*terrain/255;
   for(let c=0;c<3;c++)if(pixelHash(x,y,17+c*83)<density)bits|=1<<c;
  }
  if(animate&&X>=0&&Y>=0&&X<LIFE_SIZE&&Y<LIFE_SIZE)bits=lifeCells[Y*LIFE_SIZE+X];
  const colour=[bits&1?255:0,bits&2?255:0,bits&4?255:0];
  return colour.map(v=>Math.round(terrain+(v-terrain)*noiseAmount));
 }
 function paintPlanckPatterns(){
  const context=frozen.getContext('2d'),frame=context.getImageData(0,0,FREEZE_PIXELS,FREEZE_PIXELS);
  const pixels=frame.data,random=rng(83019),catalog=buildLifeCatalog(16).filter(p=>['glider','blinker','toad','beacon','pulsar','block','beehive','boat','lwss'].includes(p.name));
  const colours=rgb;terrainPixels=new Uint8Array(FREEZE_PIXELS*FREEZE_PIXELS);
  for(let i=0;i<terrainPixels.length;i++)terrainPixels[i]=pixels[i*4];
  function place(pattern,cx,cy,colour,turns=0){
   for(let y=0;y<16;y++)for(let x=0;x<16;x++)if(pattern.cells[y*16+x]){
    let X=x-8,Y=y-8;for(let j=0;j<turns;j++)[X,Y]=[-Y,X];
    X+=cx;Y+=cy;if(X<0||Y<0||X>=FREEZE_PIXELS||Y>=FREEZE_PIXELS)continue;
    if(X>=LIFE_OFFSET&&Y>=LIFE_OFFSET&&X<LIFE_OFFSET+LIFE_SIZE&&Y<LIFE_OFFSET+LIFE_SIZE)lifeSeed[(Y-LIFE_OFFSET)*LIFE_SIZE+X-LIFE_OFFSET]|=1<<colours.indexOf(colour);
    patternBits[Y*FREEZE_PIXELS+X]|=1<<colours.indexOf(colour);
    const i=(Y*FREEZE_PIXELS+X)*4,light=.78+.22*pixels[i]/255;
    for(let c=0;c<3;c++)pixels[i+c]=Math.round(colour[c]*light);
   }
  }
  // Fixed motifs are baked into the screenshot before their cells resolve.
  // One source pixel is one Planck length; empty cells retain the terrain.
  for(let y=12;y<FREEZE_PIXELS;y+=24)for(let x=12;x<FREEZE_PIXELS;x+=24){
   const X=x+Math.floor(random()*9)-4,Y=y+Math.floor(random()*9)-4;
   if(Math.hypot(X-1024,Y-1024)<22)continue;
   place(catalog[Math.floor(random()*catalog.length)],X,Y,colours[Math.floor(random()*3)],Math.floor(random()*4));
  }
  // Denser final neighbourhood: moving ships and oscillators, with the
  // centre reserved for three independent RGB flight paths.
  const movers=['glider','glider','glider','lwss','blinker','toad','beacon'];
  for(let y=-65;y<=65;y+=8)for(let x=-65;x<=65;x+=8){
   if(Math.hypot(x,y)<24)continue;
   const kind=movers[Math.floor(random()*movers.length)];
   place(catalog.find(p=>p.name===kind),1024+x+Math.floor(random()*3),1024+y+Math.floor(random()*3),colours[Math.floor(random()*3)],Math.floor(random()*4));
  }
  // A seeded, irregular inner neighbourhood. Separate starting positions
  // and headings give passing traffic rather than a synchronised rendezvous.
  const glider=catalog.find(p=>p.name==='glider');
  const launches=[[-4,-1,0,0],[7,-2,1,1],[2,6,2,2]];
  for(const [x,y,c,turn]of launches)place(glider,1024+x,1024+y,colours[c],turn);
  const occupied=launches.map(([x,y])=>[x,y]);
  const innerKinds=['glider','glider','lwss','blinker','toad','beacon','boat','beehive'];
  for(let attempt=0,added=0;attempt<800&&added<30;attempt++){
   const x=Math.round((random()-.5)*46),y=Math.round((random()-.5)*46);
   if(Math.hypot(x,y)>24||occupied.some(([X,Y])=>Math.hypot(x-X,y-Y)<6))continue;
   occupied.push([x,y]);
   const kind=innerKinds[Math.floor(random()*innerKinds.length)];
   place(catalog.find(p=>p.name===kind),1024+x,1024+y,colours[Math.floor(random()*3)],Math.floor(random()*4));
   added++;
  }
  // Keep only one grayscale byte per cell and the pattern bitfield.
  frozen.width=frozen.height=1;
 }

 let lastSurfaceKey="",surfaceVersion=0,aberrationVersion=-1;
 function renderSurface(W,H,span,freeze=false){
  const animated=freeze?null:animation.update(Math.log2(FIELD/span));
  if(animated){gl.bindTexture(gl.TEXTURE_2D,strataTexture);gl.texSubImage2D(gl.TEXTURE_2D,0,0,0,gl.RGB,gl.UNSIGNED_BYTE,animated);gl.generateMipmap(gl.TEXTURE_2D);}
  const key=`${W}/${H}/${span}/${freeze}/${animation.version}`;if(key===lastSurfaceKey)return;lastSurfaceKey=key;surfaceVersion++;
  if(canvas.width!==W||canvas.height!==H){canvas.width=W;canvas.height=H;}
  gl.viewport(0,0,W,H);gl.useProgram(program);gl.bindBuffer(gl.ARRAY_BUFFER,buffer);const attr=gl.getAttribLocation(program,'position');gl.enableVertexAttribArray(attr);gl.vertexAttribPointer(attr,2,gl.FLOAT,false,0,0);
  const u=n=>gl.getUniformLocation(program,n);gl.uniform2f(u('resolution'),W,H);gl.uniform1f(u('depth'),Math.log2(FIELD/span));gl.uniform1f(u('span'),span/FIELD);gl.uniform1f(u('unit'),0);gl.uniform1f(u('resolveNoise'),freeze?0:1);gl.uniform1f(u('quality'),new URLSearchParams(location.search).has('renderZoom')?22:10);gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,texture);gl.uniform1i(u('field'),0);gl.activeTexture(gl.TEXTURE1);gl.bindTexture(gl.TEXTURE_2D,strataTexture);gl.uniform1i(u('strataField'),1);gl.drawArrays(gl.TRIANGLE_STRIP,0,4);
 }
 return{name:'rule-evolved Lenia relief → frozen Planck terrain image',range:[-36,-14.7],ready:()=>ready,pending:()=>!ready||animation.pending()||(!captured&&!finalImage.complete),draw(cam){
  const alpha=1-ramp(cam.s,-15.75,-14.8);if(!ready||alpha<=0)return;
  const frozenView=cam.F*Math.max(cam.W,cam.H)/cam.min<=FREEZE_SPAN&&PLANCK*cam.min/cam.F>=1;
  cam.ctx.save();cam.ctx.globalAlpha=alpha;cam.ctx.imageSmoothingEnabled=false;
  if(frozenView){
   if(!captured){
    // Screenshot once, at one fixed physical span and lighting. From here
    // on only this bitmap is magnified: no terrain, normals or shadows rerun.
    if(!finalImage.complete||!finalImage.naturalWidth){cam.ctx.restore();return;}
    frozen.width=frozen.height=FREEZE_PIXELS;frozen.getContext('2d').drawImage(finalImage,0,0);paintPlanckPatterns();captured=true;
    // Release full-size GPU/compositing targets; rebuild only if zooming out.
    for(const target of [canvas,aberrated,bloom,...Object.values(colourLayers)])target.width=target.height=1;
    lastSurfaceKey='';aberrationVersion=-1;
    finalImage.removeAttribute('src');
   }
   const animate=animateLife(cam);
   const size=FREEZE_SPAN/cam.F*cam.min;
   const cell=size/FREEZE_PIXELS,ox=(cam.W-size-cell)/2,oy=(cam.H-size-cell)/2;
   if(cell>=1){
    cam.ctx.filter='none';
    const x0=Math.max(0,Math.floor(-ox/cell)),x1=Math.min(FREEZE_PIXELS,Math.ceil((cam.W-ox)/cell));
    const y0=Math.max(0,Math.floor(-oy/cell)),y1=Math.min(FREEZE_PIXELS,Math.ceil((cam.H-oy)/cell));
    for(let y=y0;y<y1;y++)for(let x=x0;x<x1;x++){
     const colour=pixelColour(x,y,animate,cam.F/PLANCK);cam.ctx.fillStyle=`rgb(${colour.join(",")})`;
     const left=Math.round(ox+x*cell),top=Math.round(oy+y*cell);
     cam.ctx.fillRect(left,top,Math.round(ox+(x+1)*cell)-left,Math.round(oy+(y+1)*cell)-top);
    }
   }
  }else{
   const scale=Math.min(1,(new URLSearchParams(location.search).has('renderZoom')?1600:640)/Math.max(cam.W,cam.H));
   renderSurface(Math.round(cam.W*scale),Math.round(cam.H*scale),cam.F);
   drawAberrated(cam);
  }
  cam.ctx.restore();
 }};
}
