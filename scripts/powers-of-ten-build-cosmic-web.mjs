// Seeded illustrative density volume, NOT a survey or a cosmological simulation.
// Voronoi edges (three similarly close void seeds) form filaments; four-way
// encounters form knots. A warped field avoids a regular lattice appearance.
import {writeFile} from 'node:fs/promises';
import {rng} from '../tools/powers-of-ten/math.js';
const random=rng(31012026),out=new URL('../video/powers-of-ten/generated/cosmic-web-v1/',import.meta.url);
function hash(x,y,z,s){let h=Math.imul(x,374761393)^Math.imul(y,668265263)^Math.imul(z,2147483647)^s;h=Math.imul(h^(h>>>13),1274126177);return ((h^(h>>>16))>>>0)/4294967296;}
function field(x,y,z,cell){
 x/=cell;y/=cell;z/=cell;
 const a=x+.28*Math.sin(y*.67+z*.31),b=y+.28*Math.sin(z*.73+x*.29),c=z+.28*Math.sin(x*.61+y*.37);
 const ix=Math.floor(a),iy=Math.floor(b),iz=Math.floor(c);let d1=9,d2=9,d3=9,d4=9;
 for(let i=-1;i<=1;i++)for(let j=-1;j<=1;j++)for(let k=-1;k<=1;k++){
  const X=ix+i,Y=iy+j,Z=iz+k;
  const dx=X+.12+.76*hash(X,Y,Z,17)-a,dy=Y+.12+.76*hash(X,Y,Z,37)-b,dz=Z+.12+.76*hash(X,Y,Z,67)-c,d=Math.sqrt(dx*dx+dy*dy+dz*dz);
  if(d<d1){d4=d3;d3=d2;d2=d1;d1=d}else if(d<d2){d4=d3;d3=d2;d2=d}else if(d<d3){d4=d3;d3=d}else if(d<d4)d4=d;
 }
 const edge=Math.exp(-(((d3-d1)/.085)**2)),sheet=Math.exp(-(((d2-d1)/.033)**2)),knot=Math.exp(-(((d4-d1)/.11)**2));
 return {density:.006+.70*edge+.07*sheet+.23*knot,knot};
}
const points=[],counts=[];
// The outer component is deliberately coarse-grained for legibility at the
// marble view. These are density tracers, not individually identified galaxies.
for(const cfg of [{count:150000,radius:.075,cell:.0022,lod:0},{count:260000,radius:.955,cell:.075,lod:1}]){
 let accepted=0,tries=0;
 while(accepted<cfg.count){
  tries++;const x=random()*2-1,y=random()*2-1,z=random()*2-1,r=Math.hypot(x,y,z);if(r>1)continue;
  const X=x*cfg.radius,Y=y*cfg.radius,Z=z*cfg.radius,f=field(X,Y,Z,cfg.cell);
  if(random()>f.density)continue;
  const temp=random(),warm=temp<.18,blue=temp>.96;
  const rgb=blue?[.52,.55,.76]:warm?[1,.59,.45]:[.86,.28,.32];
  const edge=Math.min(1,(1-r)/.14),weight=edge*edge*(3-2*edge)*(.55+.45*random());
  points.push(X,Y,Z,...rgb,weight,f.knot,cfg.lod);accepted++;
 }
 counts.push({...cfg,tries});
}
await writeFile(new URL('points.bin',out),Buffer.from(new Float32Array(points).buffer));
await writeFile(new URL('scene.json',out),JSON.stringify({version:1,seed:31012026,radius_ly:46e9,stride:9,fields:['x_R','y_R','z_R','red','green','blue','weight','knot','lod'],counts,interpretation:'Illustrative coarse-grained density reconstruction of filaments, sheets, knots and voids. Not observed filament coordinates; outer component is a schematic aggregate, not individual galaxies or a calibrated matter simulation. The CMB remains its separate Planck scalar-map shell.',references:['https://science.nasa.gov/universe/galaxies/large-scale-structures/','https://www.esa.int/Science_Exploration/Space_Science/Planck/The_cosmic_microwave_background_and_the_distribution_of_matter_in_the_Universe']},null,2)+'\n');
console.log('Built',points.length/9,'3D density tracers',counts);
