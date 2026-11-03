// Resumable, validated final terrain composites. Isolate short GPU batches.
import puppeteer from 'puppeteer-core';import fs from 'node:fs';import crypto from 'node:crypto';import sharp from 'sharp';
const root='video/powers-of-ten/generated/terrain-composite-v3';fs.mkdirSync(root,{recursive:true});
const meta={firstScale:-14.7,step:1/24,frames:433,padding:2,resolution:1536,format:'WebP',includes:['fractal terrain','rule-evolved Lenia pigment and relief','lighting','emboss','chromatic aberration','bloom']};
meta.sourceHash=crypto.createHash('sha256').update(fs.readFileSync('tools/powers-of-ten/quantum-terrain.js')).digest('hex');
if(fs.existsSync(root+'/manifest.json')){const old=JSON.parse(fs.readFileSync(root+'/manifest.json'));if(old.sourceHash!==meta.sourceHash)throw Error('Generator changed: clear composite output before rebuilding');}
async function valid(buffer){try{const stats=await sharp(buffer).resize(64,64).stats();const rgb=stats.channels.slice(0,3),mean=rgb.reduce((s,c)=>s+c.mean,0)/3;return mean>15&&mean<230&&Math.max(...rgb.map(c=>c.stdev))>1}catch{return false}}
let browser,page,batch=0;
async function close(){if(browser)await browser.close();browser=page=null;batch=0;}
async function start(software=false){await close();browser=await puppeteer.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true,args:['--no-sandbox',...(software?['--use-angle=swiftshader','--enable-unsafe-swiftshader']:[])]});page=await browser.newPage();await page.setRequestInterception(true);page.on('request',r=>r.url().includes('/@vite/client')?r.abort():r.continue());await page.goto('http://127.0.0.1:5188/tools/terrain-bake.html?bakeTerrain=1&renderZoom=1');await page.waitForFunction(()=>window.baker?.ready(),{timeout:60000});}
try{
 let skipped=0;
 for(let i=0;i<meta.frames;i++){
  const file=`${root}/${String(i).padStart(3,'0')}.webp`;
  if(fs.existsSync(file)&&await valid(fs.readFileSync(file))){skipped++;continue}
  if(fs.existsSync(file))fs.unlinkSync(file);
  let saved=false;
  for(let attempt=0;attempt<4&&!saved;attempt++){
   if(!page||batch>=16||attempt)await start(false);
   try{
    let url=null;for(let retry=0;retry<300&&!url;retry++){url=await page.evaluate(({s,n,p})=>window.baker.snapshot(s,n,p),{s:meta.firstScale-i*meta.step,n:meta.resolution,p:meta.padding});if(!url)await new Promise(r=>setTimeout(r,30));}
    if(!url)throw Error('Dependencies not ready');const bytes=Buffer.from(url.split(',')[1]||'','base64');
    if(!await valid(bytes))throw Error('Blank/invalid GPU output');fs.writeFileSync(file,bytes);saved=true;batch++;
   }catch(e){console.log('Retry frame',i,attempt+1,e.message.slice(0,90));await close()}
  }
  if(!saved)throw Error('Could not bake valid frame '+i);
  if(i%8===0)console.log('Baked',i,'/',meta.frames,'reused',skipped);
 }
 fs.writeFileSync(root+'/manifest.json',JSON.stringify(meta,null,2));console.log('All frames validated');
}finally{await close()}
