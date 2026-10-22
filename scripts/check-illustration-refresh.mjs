import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import puppeteer from 'puppeteer-core';
const dir='docs/illustration-refresh-review';await fs.mkdir(dir,{recursive:true});
const b=await puppeteer.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true,args:['--no-sandbox']});
try{
 const p=await b.newPage();await p.setViewport({width:1280,height:1000});const errors=[];p.on('pageerror',e=>errors.push(e.message));
 await p.goto('http://127.0.0.1:5173/tools/illustration-refresh-review.html',{waitUntil:'networkidle0'});await p.waitForFunction(()=>window.reviewReady?.());
 await p.screenshot({path:dir+'/lakes-rest.png'});await p.click('#hoverAll');await p.screenshot({path:dir+'/lakes-hover.png'});await p.click('#hoverAll');
 for(const [filter,file] of [['balloon','balloons'],['bis','aircraft']]){await p.$eval('#filter',(e,v)=>{e.value=v;e.dispatchEvent(new Event('input'))},filter);await p.screenshot({path:dir+'/'+file+'.png'});}
 await p.$eval('#filter',e=>{e.value='';e.dispatchEvent(new Event('input'))});
 await p.setViewport({width:390,height:844});assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
 assert.equal(errors.length,0,errors.join('\n'));
 // Verify runtime Vite mappings, including the seven formerly missing chart entries.
 const check=await p.evaluate(async()=>{const a=await import('/src/assets.js');const names=['14-bis','helium-party-balloon','weather-balloon','weather-balloon-near-burst','hot-air-balloon','zeppelin-nt','soap-bubble'];return names.map(slug=>({slug,icon:!!a.ICON_BY_SLUG[slug],shadow:!!a.SHADOW_BY_SLUG[slug],hiRes:a.iconUrlForSize(slug,256,2)}))});
 assert.ok(check.every(x=>x.icon&&x.shadow&&x.hiRes.includes('/resolutions/')));
 await fs.writeFile(dir+'/browser-check.json',JSON.stringify({errors,newObjects:check,mobileFits:true},null,2));console.log('Review loads; hover controls work; all seven new chart objects resolve high-resolution artwork and shadows; mobile fits.');
}finally{await b.close()}
