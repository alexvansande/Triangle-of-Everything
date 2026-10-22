// Register reviewed AI optical layers using one common wall-shadow preset.
import fs from 'node:fs/promises';
import sharp from 'sharp';
const dir='content/icons/refresh-2026-10-22';
const jobs=JSON.parse(await fs.readFile(dir+'/prompts-caustics.json','utf8'));
for(const {slug} of jobs)await fs.access(`${dir}/${slug}-shadow-raw.png`);
const config='content/icons/shadows/overrides.json';
const overrides=JSON.parse(await fs.readFile(config,'utf8'));
const queue=JSON.parse(await fs.readFile('docs/illustration-refresh-queue.json','utf8'));
await fs.mkdir(dir+'/previous/shadows',{recursive:true});
await fs.copyFile(config,dir+'/previous/shadows/overrides.json',1).catch(e=>{if(e.code!=='EEXIST')throw e});
const settings={mode:'generated',source:'imagegen',registered:true,anchorBase:false,flipY:false,generatedScale:0.4,opacity:0.5,generatedBlur:0,distance:0,x:30,y:30,reviewed:true};
for(const {slug} of jobs){
 const input=`${dir}/${slug}-shadow-raw.png`;
 // Preserve the full feathered alpha, with enough padding that the export cannot clip it.
 const candidate=await sharp(input).resize(1166,1166,{fit:'contain',background:'#0000'}).extend({top:44,bottom:44,left:44,right:44,background:'#0000'}).png().toBuffer();
 await fs.writeFile(`content/icons/shadow-candidates/${slug}.png`,candidate);
 const layer=await sharp(candidate).resize(307,307).ensureAlpha().linear([1,1,1,settings.opacity],[0,0,0,0]).png().toBuffer();
 const master=await sharp({create:{width:768,height:768,channels:4,background:'#0000'}}).composite([{input:layer,left:Math.round((768-307)/2+settings.x),top:Math.round((768-307)/2+settings.y)}]).png().toBuffer();
 await fs.copyFile(`content/icons/shadows/${slug}.webp`,`${dir}/previous/shadows/${slug}.webp`,1).catch(e=>{if(!['ENOENT','EEXIST'].includes(e.code))throw e});
 await fs.writeFile(`${dir}/${slug}-shadow.png`,master);
 await sharp(master).resize(256,256).webp({quality:90,alphaQuality:100}).toFile(`content/icons/shadows/${slug}.webp`);
 overrides[slug]={...settings,updated:new Date().toISOString(),generator:'imagegen-lake-wall-v1'};
 queue.refresh.find(i=>i.slug===slug).status='complete';
}
await fs.writeFile(config,JSON.stringify(overrides,null,2)+'\n');
await fs.writeFile('docs/illustration-refresh-queue.json',JSON.stringify(queue,null,2)+'\n');
console.log(`Installed ${jobs.length} AI lake caustic layers with the same placement and opacity.`);
