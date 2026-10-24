// Long wall shadows plus a restrained AI-generated refractive-light texture.
// node scripts/generate-lake-shadows.mjs
import fs from 'node:fs/promises';
import sharp from 'sharp';
import puppeteer from 'puppeteer-core';
import {LONG_SHADOW_PRESET} from '../src/long-shadow.js';
const allLakes=['loch-ness','caspian-sea','dead-sea','lake-baikal','lake-nyos','lake-superior','lake-tahoe','lake-victoria','sea-of-galilee','hallstatter-see','konigssee','titicaca','lake-geneva','lake-erie','lake-tanganyika','great-salt-lake','crater-lake'];
const lakes=process.argv.length>2?[...new Set(process.argv.slice(2))]:allLakes;
for(const slug of lakes)if(!allLakes.includes(slug))throw Error(`Unknown lake: ${slug}`);
const root='content/icons/shadow-candidates/lake-long-caustics';
const config='content/icons/shadows/overrides.json';
const overrides=JSON.parse(await fs.readFile(config,'utf8'));
const light=(await fs.readFile(`${root}/caustic-light.png`)).toString('base64');
await fs.mkdir(`${root}/previous`,{recursive:true});
async function preserve(from,to){await fs.copyFile(from,to,1).catch(e=>{if(e.code!=='EEXIST'&&e.code!=='ENOENT')throw e})}
await preserve(config,`${root}/previous/overrides.json`);
const renderer=Buffer.from(await fs.readFile('src/long-shadow.js')).toString('base64');
const browser=await puppeteer.launch({executablePath:process.env.CHROME_PATH||'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true,args:['--no-sandbox']});
const prepared=[];
try{
 const page=await browser.newPage();
 await page.evaluate(async code=>{window.renderer=await import('data:text/javascript;base64,'+code)},renderer);
 for(const slug of lakes){
  const source=`content/icons/resolutions/512/${slug}.webp`;
  const icon=(await fs.readFile(source).catch(()=>fs.readFile(`content/icons/${slug}.webp`))).toString('base64');
  const result=await page.evaluate(async({icon,light,settings})=>{
   async function image(src){const im=new Image;im.src=src;await im.decode();return im}
   const im=await image('data:image/webp;base64,'+icon),shine=await image('data:image/png;base64,'+light);
   const canvas=document.createElement('canvas');canvas.width=canvas.height=768;
   window.renderer.drawLongShadow(canvas,im,settings,256);
   const c=canvas.getContext('2d'),cast=c.getImageData(0,0,768,768);
   const object=document.createElement('canvas');object.width=object.height=768;
   const oc=object.getContext('2d');oc.drawImage(im,256,256,256,256);
   const alpha=oc.getImageData(0,0,768,768).data;
   let sum=0,cx=0,cy=0;
   for(let y=256;y<512;y++)for(let x=256;x<512;x++){const a=alpha[(y*768+x)*4+3];sum+=a;cx+=x*a;cy+=y*a}
   cx/=sum;cy/=sum;
   const points=[];
   // Place highlights within exposed shadow coverage, not in transparent
   // margins or under the object. Keep them separate, with a dimmer second spot.
   for(const distance of [0.32,0.58]){
    const tx=cx+256*distance,ty=cy+256*distance;let best=null,score=-Infinity;
    for(let y=256;y<680;y+=2)for(let x=256;x<680;x+=2){
     const i=(y*768+x)*4,a=cast.data[i+3];
     if(a<25||alpha[i+3]>20||points.some(p=>Math.hypot(x-p.x,y-p.y)<48))continue;
     const s=a/128-((x-tx)**2+(y-ty)**2)/(90*90);
     if(s>score){score=s;best={x,y}}
    }
    if(best)points.push(best);
   }
   const optics=document.createElement('canvas');optics.width=optics.height=768;const l=optics.getContext('2d');
   points.forEach((p,i)=>{l.save();l.translate(p.x,p.y);l.rotate(i?-.3:.2);l.globalAlpha=i?.36:.55;l.drawImage(shine,-36,-36,72,72);l.restore()});
   // Limit the feathered light to the cast's coverage, while retaining its
   // luminance: this is a light patch inside a shadow, not another silhouette.
   const pixels=l.getImageData(0,0,768,768);
   for(let i=0;i<768*768;i++)pixels.data[i*4+3]*=Math.min(1,cast.data[i*4+3]/45);
   l.putImageData(pixels,0,0);c.drawImage(optics,0,0);
   return {png:canvas.toDataURL('image/png').split(',')[1],points};
  },{icon,light,settings:LONG_SHADOW_PRESET});
  const png=Buffer.from(result.png,'base64');
  await fs.writeFile(`${root}/${slug}.png`,png);
  const webp=await sharp(png).resize(256,256).webp({quality:95,alphaQuality:100}).toBuffer();
  prepared.push({slug,webp,points:result.points});
  console.log(`Prepared ${slug}: ${result.points.length} caustic spots`);
 }
}finally{await browser.close()}
for(const {slug,webp,points} of prepared){
 await preserve(`content/icons/shadows/${slug}.webp`,`${root}/previous/${slug}.webp`);
 await preserve(`content/icons/shadow-candidates/${slug}.png`,`${root}/previous/${slug}-candidate.png`);
 await fs.copyFile(`${root}/${slug}.png`,`content/icons/shadow-candidates/${slug}.png`);
 await fs.writeFile(`content/icons/shadows/${slug}.webp`,webp);
 // The studio candidate is the complete registered layer, with .5 shadow
 // opacity already baked in. Default controls must not scale or dim it again.
 overrides[slug]={...LONG_SHADOW_PRESET,mode:'generated',source:'alpha-long-caustic',registered:true,anchorBase:false,opacity:1,bakedShadowOpacity:LONG_SHADOW_PRESET.opacity,generatedScale:1,generatedBlur:0,distance:0,x:0,y:0,reviewed:true,generator:'lake-long-caustic-v1',causticPoints:points,updated:new Date().toISOString()};
}
await fs.writeFile(config,JSON.stringify(overrides,null,2)+'\n');
console.log(`Installed ${prepared.length} lake shadows; previous versions preserved in ${root}/previous.`);
