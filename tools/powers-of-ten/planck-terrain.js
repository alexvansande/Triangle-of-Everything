// Crisp, inexpensive endpoint. No WebGL terrain or postprocessing is constructed.
import {rng} from './math.js';
import {stepRGBLife} from './life-colour.js';
import {buildLifeCatalog} from './life-catalog.js';
import {timeAtProgress,VIDEO_START_SCALE,VIDEO_END_SCALE} from './zoom-timeline.js';
const PLANCK=1.616255e-35;
export function planckTerrain(){
 const finalImage=new Image();finalImage.src='/video/powers-of-ten/generated/lenia-terrain-v1/planck-relief.png';
 const frozen=document.createElement('canvas');let captured=false;
 const FREEZE_PIXELS=2048,FREEZE_SPAN=FREEZE_PIXELS*PLANCK;
 const LIFE_SIZE=256,LIFE_OFFSET=896,lifeSeed=new Uint8Array(256*256),patternBits=new Uint8Array(FREEZE_PIXELS*FREEZE_PIXELS);
 let lifeCells,lifeGeneration=0,lifeStart=null,terrainPixels;
 const rgb=[[255,0,0],[0,255,0],[0,0,255]];
 function animateLife(cam){
  if(cam.F>100*PLANCK){lifeStart=null;lifeGeneration=0;lifeCells=null;return false;}
  const video=new URLSearchParams(location.search).has('renderZoom');
  if(lifeStart===null)lifeStart=cam.t;
  const crossing=video?timeAtProgress((VIDEO_START_SCALE-Math.log10(100*PLANCK))/(VIDEO_START_SCALE-VIDEO_END_SCALE)):lifeStart;
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

 return{pending:()=>!captured&&!finalImage.complete,draw(cam){
  const frozenView=cam.F*Math.max(cam.W,cam.H)/cam.min<=FREEZE_SPAN&&PLANCK*cam.min/cam.F>=1;
  if(!frozenView)return false;
  if(!captured){
   if(!finalImage.complete||!finalImage.naturalWidth)return true;
   frozen.width=frozen.height=FREEZE_PIXELS;frozen.getContext('2d').drawImage(finalImage,0,0);paintPlanckPatterns();captured=true;
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
  return true;
 }};
}
