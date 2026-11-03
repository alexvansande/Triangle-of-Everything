import fs from 'node:fs';import sharp from 'sharp';
const root='video/powers-of-ten/generated/terrain-composite-v3',out='video/powers-of-ten/generated/terrain-soft-v1';fs.mkdirSync(out,{recursive:true});const m=JSON.parse(fs.readFileSync(root+'/manifest.json'));
const smooth=(a,b,x)=>{const t=Math.max(0,Math.min(1,(x-a)/(b-a)));return t*t*(3-2*t)};const frames=[];
for(let i=0;i<m.frames;i++){const depth=-(m.firstScale-i*m.step),strength=smooth(18.4,19.1,depth)*(1-smooth(20.1,20.8,depth));if(strength<.01)continue;const file=String(i).padStart(3,'0')+'.webp';await sharp(root+'/'+file).blur(Math.max(.3,m.resolution/m.padding*.0045*strength)).webp({quality:93}).toFile(out+'/'+file);frames.push(i)}
fs.writeFileSync(out+'/manifest.json',JSON.stringify({frames,source:'terrain-composite-v3',range:[-20.8,-18.4],reason:'Soften enlarged Lenia sample pixels around 60 zm; Planck endpoint unchanged'},null,2)+'\n');console.log('Softened',frames.length,'images');
