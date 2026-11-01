import sharp from 'sharp';
import fs from 'node:fs/promises';
export async function guanineNuclear({path,bases,fade,n}){
 const source=path('../../../guanine-bridge-v2/'),dir=path('nuclear-pieces-v2/');
 if(!await fs.access(source+'field-carrier.png').then(()=>true,()=>false))return false;
 const spans=Array.from({length:9},(_,i)=>12e-6/3**i),back=bases[2];
 await fs.writeFile(dir+'background.png',back);
 const parts=[['field',3,'field-carrier.png'],['hero',5,'hero-carrier.png'],['dna',7,'dna-carrier.png']];
 const plates=[];
 for(const[name,level,file]of parts){
  let input=await sharp(source+file).resize(n,n).ensureAlpha().png().toBuffer();
  if(name==='field')input=await fade(input,n);
  await fs.writeFile(dir+name+'.png',input);plates.push({name,level,span:spans[level],input});
 }
 const empty=await sharp({create:{width:n,height:n,channels:4,background:'#0000'}}).png().toBuffer();await fs.writeFile(dir+'purple.png',empty);
 const guanine=await fs.readFile(source+'guanine-flat.png');await fs.writeFile(dir+'guanine.png',guanine);plates.push({name:'guanine',level:8,span:spans[8],input:guanine});
 async function world(level){
  const crop=Math.max(1,Math.round(n*spans[level]/spans[2]));
  const background=level===2?back:await sharp(back).extract({left:Math.floor((n-crop)/2),top:Math.floor((n-crop)/2),width:crop,height:crop}).resize(n,n).png().toBuffer();
  const stack=[];
  for(const p of plates){let size=Math.max(1,Math.round(n*p.span/spans[level])),im;
   if(size>n){const c=Math.max(1,Math.round(n*n/size));im=await sharp(p.input).extract({left:Math.floor((n-c)/2),top:Math.floor((n-c)/2),width:c,height:c}).resize(n,n).png().toBuffer();size=n;}
   else im=await sharp(p.input).resize(size,size).png().toBuffer();
   stack.push({input:im,left:Math.floor((n-size)/2),top:Math.floor((n-size)/2)});
  }
  return sharp(background).composite(stack).png().toBuffer();
 }
 for(let level=2;level<=7;level++)await fs.writeFile(path(`level-${level}.png`),await world(level));
 let child=await fs.readFile(path('level-2.png'));
 for(let level=1;level>=0;level--){child=await sharp(bases[level]).composite([{input:await fade(child,418),left:418,top:418}]).png().toBuffer();await fs.writeFile(path(`level-${level}.png`),child);}
 await fs.writeFile(path('../pollen-v4/amoeba-inner.png'),child);
 await fs.writeFile(dir+'scene.json',JSON.stringify({version:4,native:[n,n],backgroundSpan_m:spans[2],axis:[n/2,n/2],parts:plates.map(({input,...p})=>p),rootDepthStart_m:spans[2]/2.2,guanineSource:'../../../guanine-bridge-v2/guanine-flat.png',nucleusSource:'../../../guanine-bridge-v2/nucleus-raw.png',note:'Each generated parent has the exact transparent finer source removed from its support and reinserted at the common physical scale. Runtime guanine uses that same code-rendered source before continuous live 3D. Nuclear background persists and is blurred/darkened by the app.'},null,2)+'\n');
 return true;
}
