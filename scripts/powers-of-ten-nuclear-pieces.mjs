// Assemble one world scene from clean nuclear texture plus transparent objects.
import sharp from 'sharp';
import fs from 'node:fs/promises';
export async function nuclearPieces({path,bases,fade,n}){
 const dir=path('nuclear-pieces-v2/');
 for(const f of ['field','field-fill','hero','dna'])if(!await fs.access(dir+f+'-raw.png').then(()=>true,()=>false))return false;
 const spans=Array.from({length:8},(_,i)=>12e-6/3**i),back=bases[2];
 const parts=[['field',3,dir+'field-raw.png'],['hero',5,dir+'hero-raw.png'],['dna',7,dir+'dna-raw.png'],['purple',3,path('chromatin-depth-v1/foreground-raw.png')]];
 await fs.writeFile(dir+'background.png',back);
 const plates=[];
 for(const[name,level,source]of parts){let input=await sharp(source).resize(n,n).ensureAlpha().png().toBuffer();if(name==='field')input=await sharp(input).composite([{input:await sharp(dir+'field-fill-raw.png').resize(418,418).png().toBuffer(),left:418,top:418}]).png().toBuffer();if(['field','purple'].includes(name))input=await fade(input,n);await fs.writeFile(dir+name+'.png',input);plates.push({name,level,span:spans[level],input});}
 async function world(level){
  // Texture is the very same nuclear interior, never a new pale fluid tile.
  const crop=Math.max(1,Math.round(n*spans[level]/spans[2]));
  const background=level===2?back:await sharp(back).extract({left:Math.floor((n-crop)/2),top:Math.floor((n-crop)/2),width:crop,height:crop}).resize(n,n).png().toBuffer();
  const composite=[];
  for(const p of plates){let size=Math.max(1,Math.round(n*p.span/spans[level])),im;
   if(size>n){const c=Math.max(1,Math.round(n*n/size));im=await sharp(p.input).extract({left:Math.floor((n-c)/2),top:Math.floor((n-c)/2),width:c,height:c}).resize(n,n).png().toBuffer();size=n;}
   else im=await sharp(p.input).resize(size,size).png().toBuffer();
   composite.push({input:im,left:Math.floor((n-size)/2),top:Math.floor((n-size)/2)});
  }
  return sharp(background).composite(composite).png().toBuffer();
 }
 for(let level=2;level<=7;level++)await fs.writeFile(path(`level-${level}.png`),await world(level));
 let child=await fs.readFile(path('level-2.png'));
 for(let level=1;level>=0;level--){child=await sharp(bases[level]).composite([{input:await fade(child,418),left:418,top:418}]).png().toBuffer();await fs.writeFile(path(`level-${level}.png`),child);}
 await fs.writeFile(path('../pollen-v4/amoeba-inner.png'),child);
 await fs.writeFile(dir+'scene.json',JSON.stringify({version:2,native:[n,n],backgroundSpan_m:spans[2],axis:[n/2,n/2],parts:plates.map(({input,...p})=>p),rootDepthStart_m:spans[2]/2.2,note:'All closer objects are transparent. Nuclear texture is the persistent rear plane; field pattern remains a separate middle plane. Parents use this same zero-depth scene. Sizes are inherited illustrative molecular scales.'},null,2)+'\n');
 return true;
}
