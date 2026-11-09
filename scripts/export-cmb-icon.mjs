// The still pictures of the app's two turning universe objects (src/cmb-object.js, src/event-horizon-object.js),
// drawn by their own code at 2048 px from tools/cmb-icon-capture.html on the dev server (npm run dev;
// --base for another address), then the icon sizes and the manifest entry.
//   node scripts/export-cmb-icon.mjs [observable-universe] [our-universe]     (default: both)
import p from 'puppeteer-core';import fs from 'node:fs';import sharp from 'sharp';import crypto from 'node:crypto';
const args=process.argv.slice(2),at=args.indexOf('--base'),base=at>=0?args.splice(at,2)[1]:'http://localhost:5173';
const SOURCES={'observable-universe':'content/icons/src/observable universe.png','our-universe':'content/icons/src/our universe.png'};
const slugs=args.length?args:Object.keys(SOURCES);for(const s of slugs)if(!SOURCES[s])throw Error('unknown object '+s);
const b=await p.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true,args:['--no-sandbox']});
try{const page=await b.newPage();page.on('pageerror',e=>console.log(e.message));await page.goto(base+'/tools/cmb-icon-capture.html?px=256&bare=1');
 for(const slug of slugs){
  await page.waitForFunction(s=>window.cmbIcons?.[s]?.ready(),{},slug);await new Promise(r=>setTimeout(r,1000));
  const out=await page.evaluate(s=>{const o=window.cmbIcons[s],t=performance.now();for(let i=0;i<30;i++)o.draw(256,i/30);const ms=(performance.now()-t)/30;o.draw(2048,0);return{ms,url:o.canvas.toDataURL()}},slug);
  fs.writeFileSync(SOURCES[slug],Buffer.from(out.url.split(',')[1],'base64'));console.log(slug,out.ms.toFixed(1),'ms a frame at 256');}
}finally{await b.close()}
const file='content/icons/resolutions/manifest.json',manifest=JSON.parse(fs.readFileSync(file));
for(const slug of slugs){const source=SOURCES[slug];
 for(const size of [128,256,512,1024])await sharp(source).resize(size,size).webp({lossless:true}).toFile(size===128?`content/icons/${slug}.webp`:`content/icons/resolutions/${size}/${slug}.webp`);
 const fingerprint=crypto.createHash('sha256').update(fs.readFileSync(source)).digest('hex');
 if(manifest[slug])Object.assign(manifest[slug],{fingerprint,sourceDifference:0});
 else manifest[slug]={fingerprint,baseWidth:128,source,reason:'matching master',sourceDifference:0,variants:[256,512,1024].map(width=>({width,path:`${width}/${slug}.webp`}))};}
fs.writeFileSync(file,JSON.stringify(manifest,null,2)+'\n');
