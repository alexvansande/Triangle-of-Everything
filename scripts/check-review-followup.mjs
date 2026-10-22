import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import puppeteer from 'puppeteer-core';
const dir='docs/illustration-refresh-review/followup';await fs.mkdir(dir,{recursive:true});
const browser=await puppeteer.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true,args:['--no-sandbox']});
try{
 const page=await browser.newPage();await page.setViewport({width:1280,height:1000});const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:5173/tools/star-shine-study.html',{waitUntil:'networkidle0'});
 const backing=()=>page.$$eval('.scene',els=>els.map(el=>{const b=el.querySelector('.star-backing'),s=el.querySelector('.star'),r=b.getBoundingClientRect(),a=s.getBoundingClientRect();return {black:getComputedStyle(b).backgroundColor,blend:getComputedStyle(b).mixBlendMode,width:r.width,starWidth:a.width,dx:r.x+r.width/2-a.x-a.width/2,dy:r.y+r.height/2-a.y-a.height/2,visibility:getComputedStyle(b).visibility}}));
 const rest=await backing();assert.equal(rest.length,4);for(const b of rest){assert.equal(b.black,'rgb(0, 0, 0)');assert.equal(b.blend,'normal');assert.ok(Math.abs(b.dx)<1&&Math.abs(b.dy)<1);assert.ok(b.width<b.starWidth&&b.width>b.starWidth*.8)}
 await page.screenshot({path:dir+'/star-backing-rest.png'});
 await page.click('#all');await new Promise(r=>setTimeout(r,450));const hover=await backing();hover.forEach((b,i)=>assert.ok(Math.abs(b.width/rest[i].width-1.5)<.01));
 await page.screenshot({path:dir+'/star-backing-hover.png'});await page.click('#objects');assert.ok((await backing()).every(b=>b.visibility==='hidden'));
 await page.goto('http://127.0.0.1:5173/tools/illustration-refresh-review.html',{waitUntil:'networkidle0'});await page.waitForFunction(()=>window.reviewReady?.());
 await page.screenshot({path:dir+'/closer-lakes.png'});
 for(const slug of ['soap-bubble','mt-everest']){await page.$eval('#filter',(e,s)=>{e.value=s;e.dispatchEvent(new Event('input'))},slug);await page.screenshot({path:dir+'/'+slug+'.png'});}
 assert.deepEqual(errors,[]);await fs.writeFile(dir+'/browser-check.json',JSON.stringify({rest,hover,errors},null,2)+'\n');
 console.log('Black backing circles stay centered, grow with stars and hide with them; updated lake/bubble/Everest review loads without errors.');
}finally{await browser.close()}
