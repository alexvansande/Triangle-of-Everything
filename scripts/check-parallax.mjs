// Local browser regression for camera-driven layer depth and picking.
import puppeteer from 'puppeteer-core';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
const b=await puppeteer.launch({executablePath:process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true,args:['--no-sandbox']});
const base=process.env.CHART_URL || 'http://127.0.0.1:5173/';
try {
 const p=await b.newPage();await p.setViewport({width:1440,height:1000});const errors=[];p.on('pageerror',e=>{errors.push(e.message);console.error(e.message)});
 await p.goto(base+'?og-shot#10,29.9,59.44',{waitUntil:'networkidle0'});
 await p.waitForFunction(()=>window.__toeOg?.ready());
 const samples=[];
 for(const fraction of [.15,.5,.85,.5,.15]) {
  await p.evaluate(f=>{const v=window.__toeOg.plot();window.__toeOg.place('saturn',180,v.w*f,v.h*.5)},fraction);
  await new Promise(r=>setTimeout(r,80));
  samples.push(await p.evaluate(()=>{
   const image=document.querySelector('.obj-icon[data-slug="saturn"]'),d=image.parentNode.__data__,m=image.parentNode.transform.baseVal.consolidate().matrix;
   const shadow=[...document.querySelectorAll('.icon-shadow')].find(el=>el.__data__.key==='saturn').__data__;
   const label=document.querySelector('[data-label-slug="saturn"]');
   return {x:d.sx,y:d.sy,dx:m.e,dy:m.f,body:+image.getAttribute('width')/2,shadowX:shadow.sx,shadowY:shadow.sy,font:label.getBoundingClientRect().height};
  }));
 }
 for(const s of samples){assert.ok(Math.hypot(s.dx,s.dy)<=s.body*.28*1.12+1e-6);assert.equal(s.shadowX,s.x);assert.equal(s.shadowY,s.y)}
 assert.ok(samples[0].dx<0&&samples[2].dx>0);assert.ok(Math.abs(samples[1].dx)<1e-6);assert.ok(Math.abs(samples[0].dx-samples[4].dx)<1e-6);
 assert.ok(Math.max(...samples.map(s=>s.font))-Math.min(...samples.map(s=>s.font))<.1,'labels must not scale');
 // A real pointer drag follows the same projection as camera/narration moves.
 await p.mouse.move(1050,600);await p.mouse.down();await p.mouse.move(1150,630,{steps:8});await p.mouse.up();
 await new Promise(r=>setTimeout(r,650));
 await p.$eval('#click-targets',e=>e.style.setProperty('display','block','important'));
 const target=await p.$('.click-target[data-slug="saturn"]');assert.ok(target);
 const hit=await p.evaluate(()=>{const im=document.querySelector('.obj-icon[data-slug="saturn"]').getBoundingClientRect(),t=document.querySelector('.click-target[data-slug="saturn"]').getBoundingClientRect();return Math.hypot(im.x+im.width/2-t.x-t.width/2,im.y+im.height/2-t.y-t.height/2)});assert.ok(hit<1);
 await p.$eval('.click-target[data-slug="saturn"]',e=>e.dispatchEvent(new MouseEvent('mouseenter')));await new Promise(r=>setTimeout(r,190));
 const hover=await p.evaluate(()=>{const im=document.querySelector('.obj-icon[data-slug="saturn"]'),g=im.parentNode,m=g.transform.baseVal.consolidate().matrix;return {dx:m.e,dy:m.f,top:g===g.parentNode.lastElementChild,scale:getComputedStyle(im).transform}});
 assert.ok(hover.top);assert.notEqual(hover.scale,'none');
 await fs.mkdir('docs/parallax-review',{recursive:true});await p.screenshot({path:'docs/parallax-review/saturn-hover.png'});
 // Named dust pictures must paint above the labels and remain pickable.
 await p.goto('about:blank');await p.goto(base+'#5,15.9,34.98',{waitUntil:'networkidle0'});
 await p.evaluate(()=>{if(!document.querySelector('#search-box').classList.contains('expanded'))document.querySelector('#search-btn').click()});await p.waitForFunction(()=>document.activeElement?.id==='search-input');await p.$eval('#search-input',el=>{el.value='Loch Ness';el.dispatchEvent(new Event('input'))});await p.waitForFunction(()=>document.querySelector('.search-name')?.textContent==='Loch Ness');await p.keyboard.press('Enter');
 await p.waitForSelector('.dust-picture .dn-icon');await new Promise(r=>setTimeout(r,900));
 await p.mouse.move(1100,650);await p.mouse.down();await p.mouse.move(1240,690,{steps:8});await p.mouse.up();await new Promise(r=>setTimeout(r,650));
 const dust=await p.evaluate(()=>{const group=[...document.querySelectorAll('.dust-picture')].find(e=>e.__data__.name==='Loch Ness');const m=group.transform.baseVal.consolidate().matrix,r=group.querySelector('image').getBoundingClientRect();return {parent:group.parentNode.getAttribute('class'),dx:m.e,dy:m.f,x:r.x+r.width/2,y:r.y+r.height/2};});
 assert.equal(dust.parent,'picture-layer');
 await p.mouse.move(dust.x,dust.y);await new Promise(r=>setTimeout(r,200));
 dust.picked=await p.$eval('.tt-name',el=>el.textContent);assert.equal(dust.picked,'Loch Ness');
 await p.screenshot({path:'docs/parallax-review/loch-ness.png'});
 // Reduced-motion and explicit comparison switch leave all planes at anchors.
 await p.emulateMediaFeatures([{name:'prefers-reduced-motion',value:'reduce'}]);await p.goto('about:blank');await p.goto(base+'?og-shot#10,29.9,59.44',{waitUntil:'networkidle0'});await p.waitForFunction(()=>window.__toeOg?.ready());
 await p.evaluate(()=>window.__toeOg.place('saturn',180,150,300));
 const reduced=await p.$eval('.obj-icon[data-slug="saturn"]',im=>{const m=im.parentNode.transform.baseVal.consolidate().matrix;return [m.e,m.f]});assert.deepEqual(reduced,[0,0]);
 assert.deepEqual(errors,[]);await fs.writeFile('docs/parallax-review/report.json',JSON.stringify({samples,hover,dust,reduced,errors},null,2)+'\n');console.log('PASS: camera pans, pointer pan, anchor bounds, steady text size, click targets, hover depth, dust picking and reduced motion.');
}finally{await b.close()}
