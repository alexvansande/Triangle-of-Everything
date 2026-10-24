// Register the custom overhead plan shadow with the selected elevated icon.
import fs from 'node:fs/promises';
import sharp from 'sharp';
const dir='content/icons/studies/stonehenge';
const settings={mode:'generated',source:'imagegen',registered:true,anchorBase:false,flipY:false,opacity:0.55,generatedScale:0.3333,generatedBlur:2,distance:0,x:44,y:54,reviewed:true,generator:'stonehenge-overhead-shadow-v1',note:'NW light projects a broken circular plan of the stone group toward SE. Preserve during scripted shadow batches.'};
const layer=await sharp(dir+'/shadow-raw.png').trim().resize(256,256,{fit:'contain',background:'#0000'}).blur(2).ensureAlpha().linear([1,1,1,settings.opacity],[0,0,0,0]).png().toBuffer();
const master=await sharp({create:{width:768,height:768,channels:4,background:'#0000'}}).composite([{input:layer,left:Math.round((768-256)/2+settings.x),top:Math.round((768-256)/2+settings.y)}]).png().toBuffer();
await fs.writeFile(dir+'/shadow-registered.png',master);
await sharp(master).resize(256,256).webp({quality:90,alphaQuality:100}).toFile('content/icons/shadows/stonehenge.webp');
const p='content/icons/shadows/overrides.json',o=JSON.parse(await fs.readFile(p));o.stonehenge={...settings,updated:new Date().toISOString()};await fs.writeFile(p,JSON.stringify(o,null,2)+'\n');
