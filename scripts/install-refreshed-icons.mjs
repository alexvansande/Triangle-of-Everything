// Normalize reviewed generated masters to the chart's shared framing, preserving alpha.
import fs from 'node:fs/promises';import sharp from 'sharp';
import {generateIconResolutions} from './generate-icon-resolutions.mjs';
const dir='content/icons/refresh-2026-10-22',names=process.argv.slice(2);
if(!names.length)throw Error('Supply reviewed slugs explicitly');
const queue=JSON.parse(await fs.readFile('docs/illustration-refresh-queue.json','utf8'));
const checks=JSON.parse(await fs.readFile(dir+'/sizing.json','utf8').catch(()=>'{}'));
// Reject missing inputs before replacing any member of a batch.
for(const name of names){
 if(!/^[a-z0-9-]+$/.test(name)||queue.keepExisting.includes(name))throw Error('Protected or invalid slug: '+name);
 await fs.access(dir+'/'+name+'-raw.png');
}
for(const name of names){
 if(!/^[a-z0-9-]+$/.test(name)||queue.keepExisting.includes(name))throw Error('Protected or invalid slug: '+name);
 const input=dir+'/'+name+'-raw.png';const {data,info}=await sharp(input).ensureAlpha().raw().toBuffer({resolveWithObject:true});
 let x0=info.width,y0=info.height,x1=0,y1=0,edge=0;
 for(let y=0;y<info.height;y++)for(let x=0;x<info.width;x++)if(data[(y*info.width+x)*4+3]>64){x0=Math.min(x0,x);y0=Math.min(y0,y);x1=Math.max(x1,x);y1=Math.max(y1,y);if(x===0||y===0||x===info.width-1||y===info.height-1)edge++}
 if(edge)throw Error('Solid subject touches source edge: '+name);
 x0=Math.max(0,x0-6);y0=Math.max(0,y0-6);x1=Math.min(info.width-1,x1+6);y1=Math.min(info.height-1,y1+6);
 const master=await sharp(input).extract({left:x0,top:y0,width:x1-x0+1,height:y1-y0+1}).resize(1166,1166,{fit:'contain',background:'#0000'}).extend({top:44,bottom:44,left:44,right:44,background:'#0000'}).png().toBuffer();
 // Archive every old installed tier once, before replacing it.
 for(const rel of ['src/'+name+'.png',name+'.webp',...[128,256,512,1024].map(n=>'resolutions/'+n+'/'+name+'.webp')]){
  const dest=dir+'/previous/'+rel;await fs.mkdir(dest.slice(0,dest.lastIndexOf('/')),{recursive:true});
  await fs.copyFile('content/icons/'+rel,dest,1).catch(e=>{if(!['ENOENT','EEXIST'].includes(e.code))throw e});
 }
 await fs.writeFile(dir+'/'+name+'-object.png',master);await fs.writeFile('content/icons/src/'+name+'.png',master);
 await sharp(master).resize(128,128).webp({quality:90,alphaQuality:100}).toFile('content/icons/'+name+'.webp');
 checks[name]={source:input,solidSourceBox:[x0,y0,x1,y1],solidEdgePixels:edge,canvas:1254,targetLongest:1166};
 for(const item of [...queue.refresh,...queue.new])if(item.slug===name)item.status='artwork-installed-shadow-pending';
 console.log('Installed',name);
}
await generateIconResolutions(names);
await fs.writeFile(dir+'/sizing.json',JSON.stringify(checks,null,2)+'\n');await fs.writeFile('docs/illustration-refresh-queue.json',JSON.stringify(queue,null,2)+'\n');
