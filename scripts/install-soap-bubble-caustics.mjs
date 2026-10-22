// Register the reviewed transparent optical layer with the closer lake preset.
import fs from 'node:fs/promises';
import sharp from 'sharp';
const dir='content/icons/refresh-2026-10-22/review-followup';
const settings={mode:'generated',source:'imagegen',registered:true,anchorBase:false,flipY:false,generatedScale:0.4,opacity:0.5,generatedBlur:0,distance:0,x:30,y:30,reviewed:true};
const candidate=await sharp(dir+'/soap-bubble-caustics-raw.png')
  .resize(1166,1166,{fit:'contain',background:'#0000'})
  .extend({top:44,bottom:44,left:44,right:44,background:'#0000'}).png().toBuffer();
await fs.writeFile('content/icons/shadow-candidates/soap-bubble.png',candidate);
const layer=await sharp(candidate).resize(307,307).ensureAlpha()
  .linear([1,1,1,settings.opacity],[0,0,0,0]).png().toBuffer();
const master=await sharp({create:{width:768,height:768,channels:4,background:'#0000'}})
  .composite([{input:layer,left:Math.round((768-307)/2+settings.x),top:Math.round((768-307)/2+settings.y)}]).png().toBuffer();
await fs.writeFile(dir+'/soap-bubble-shadow.png',master);
await sharp(master).resize(256,256).webp({quality:90,alphaQuality:100}).toFile('content/icons/shadows/soap-bubble.webp');
const file='content/icons/shadows/overrides.json',overrides=JSON.parse(await fs.readFile(file,'utf8'));
overrides['soap-bubble']={...settings,updated:new Date().toISOString(),generator:'imagegen-bubble-wall-v1'};
await fs.writeFile(file,JSON.stringify(overrides,null,2)+'\n');
console.log('Installed the soap bubble optical wall layer.');
