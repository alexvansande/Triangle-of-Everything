import {image} from './image.js';
// Brief illustrative camera encounters, independent of catalogue body positions.
// Depth is the clock: motion-blur samples and reverse playback follow one path.
export function planetaryFlybys(){
 const passes=[
  {s:16.05,file:'comet-67p',direction:1,y:-.17,tilt:.65,size:.46},
  {s:12.55,file:'neptune',direction:-1,y:.22,tilt:-.25,size:.70},
  {s:8.58,file:'moon',direction:1,y:-.23,tilt:.15,size:.58},
 ].map(p=>({...p,img:image(`/content/icons/${p.file}.webp`)}));
 return{name:'close planetary flybys',range:[8.3,16.3],pending:()=>passes.some(p=>!p.img.complete),draw(cam){
  for(const p of passes){
   const t=(p.s+.16-cam.s)/.32;if(t<0||t>1||!p.img.naturalWidth)continue;
   // Both ends lie beyond even the square master. No opacity gate or popping.
   const x=cam.cx+p.direction*(t-.5)*4*cam.min;
   const y=cam.cy+(p.y+.12*(t-.5))*cam.min;
   const diameter=p.size*cam.min*(.7+.6*t),blur=(2+12*t*t)*cam.dpr;
   const c=cam.ctx;c.save();c.translate(x,y);c.rotate(p.tilt+.18*t);
   c.filter=`blur(${blur}px)`;
   c.drawImage(p.img,-diameter/2,-diameter/2,diameter,diameter);c.restore();
  }
 }};
}
