import puppeteer from 'puppeteer-core';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
const b=await puppeteer.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true,args:['--no-sandbox']});
try{
 const p=await b.newPage();await p.setViewport({width:1200,height:950});const errors=[];p.on('pageerror',e=>{errors.push(e.message);console.error(e.stack)});
 await p.goto('http://127.0.0.1:5173/?og-shot',{waitUntil:'networkidle0'});await p.waitForFunction(()=>window.__toeOg?.ready());
 await p.evaluate(()=>{const v=window.__toeOg.plot();window.__toeOg.place('sun',110,v.w*.75,v.h*.65)});
 await p.waitForFunction(()=>document.querySelector('.obj-icon[data-slug="sun"]')?.parentNode.querySelector('.icon-fallback-dot')?.getAttribute('display')==='none');
 await p.waitForSelector('.click-target[data-slug="sun"]');
 const frames=await p.evaluate(async()=>{
  const im=document.querySelector('.obj-icon[data-slug="sun"]'),g=im.parentNode,c=im,hit=document.querySelector('.click-target[data-slug="sun"]');
  const read=()=>{const a=im.getBoundingClientRect(),b=c.getBoundingClientRect(),m=g.transform.baseVal.consolidate().matrix;return{k:g.__iconGrowth??1,width:a.width,ratio:b.width/a.width,dx:b.x+b.width/2-a.x-a.width/2,dy:b.y+b.height/2-a.y-a.height/2,x:m.e,y:m.f}};
  const samples=[read()];hit.dispatchEvent(new MouseEvent('mouseenter'));const start=performance.now();
  await new Promise(resolve=>{function frame(){samples.push(read());if(performance.now()-start<330)requestAnimationFrame(frame);else resolve()}requestAnimationFrame(frame)});
  hit.dispatchEvent(new MouseEvent('mouseleave'));return samples;
 });
 assert.ok(frames.length>5);const first=frames[0],last=frames.at(-1);assert.ok(last.k>1.49);
 for(let i=0;i<frames.length;i++){
  const f=frames[i],t=(f.k-1)/(last.k-1);
  assert.ok(Math.abs(f.ratio-first.ratio)<.001,'icon must keep its shape every frame');
  assert.ok(Math.abs(f.dx/f.width-first.dx/first.width)<.001);
  assert.ok(Math.abs(f.dy/f.width-first.dy/first.width)<.001);
  assert.ok(Math.abs(f.x-(first.x+(last.x-first.x)*t))<.02,'parallax and size must share progress');
  assert.ok(Math.abs(f.y-(first.y+(last.y-first.y)*t))<.02);
  if(i)assert.ok(f.k>=frames[i-1].k-1e-6,'hover must not reverse or overshoot');
 }
 const reversal=await p.evaluate(async()=>{
  await new Promise(r=>setTimeout(r,260));const im=document.querySelector('.obj-icon[data-slug="sun"]'),g=im.parentNode,hit=document.querySelector('.click-target[data-slug="sun"]');
  hit.dispatchEvent(new MouseEvent('mouseenter'));await new Promise(r=>setTimeout(r,70));const before=g.__iconGrowth;
  hit.dispatchEvent(new MouseEvent('mouseleave'));const after=g.__iconGrowth;await new Promise(r=>setTimeout(r,280));return {before,after,end:g.__iconGrowth};
 });assert.equal(reversal.before,reversal.after);assert.equal(reversal.end,1);
 // Catalogue pictures use the same growth clock and must move with their size.
 await p.goto('about:blank');await p.goto('http://127.0.0.1:5173/#5,15.9,34.98',{waitUntil:'networkidle0'});
 await p.$eval('#search-btn',e=>e.click());await p.waitForFunction(()=>document.activeElement?.id==='search-input');
 await p.$eval('#search-input',e=>{e.value='Loch Ness';e.dispatchEvent(new Event('input'))});
 await p.waitForFunction(()=>document.querySelector('.search-name')?.textContent==='Loch Ness');await p.keyboard.press('Enter');
 await p.waitForFunction(()=>[...document.querySelectorAll('.dust-picture')].some(g=>g.__data__.name==='Loch Ness'));
 await new Promise(r=>setTimeout(r,800));
 const dustPoint=await p.evaluate(()=>{const g=[...document.querySelectorAll('.dust-picture')].find(g=>g.__data__.name==='Loch Ness'),r=g.querySelector('image').getBoundingClientRect();return{x:r.x+r.width/2,y:r.y+r.height/2}});
 await p.mouse.move(dustPoint.x,dustPoint.y);
 const dust=await p.evaluate(async()=>{
  const g=[...document.querySelectorAll('.dust-picture')].find(g=>g.__data__.name==='Loch Ness');
  const samples=[],start=performance.now();
  await new Promise(resolve=>{function frame(){const im=g.querySelector('image'),m=g.transform.baseVal.consolidate().matrix;samples.push({k:g.__iconGrowth??1,width:im.getBoundingClientRect().width,x:m.e,y:m.f});if(performance.now()-start<330)requestAnimationFrame(frame);else resolve()}requestAnimationFrame(frame)});
  return samples;
 });
 for(const d of dust)assert.ok(Math.abs(d.width/d.k-dust[0].width/dust[0].k)<.05);
 assert.ok(dust.at(-1).k>1.49);
 await p.emulateMediaFeatures([{name:'prefers-reduced-motion',value:'reduce'}]);await p.goto('about:blank');await p.goto('http://127.0.0.1:5173/?og-shot',{waitUntil:'networkidle0'});await p.waitForFunction(()=>window.__toeOg?.ready());
 await p.evaluate(()=>window.__toeOg.place('sun',110,600,400));
 await p.waitForSelector('.click-target[data-slug="sun"]');
 const reduced=await p.$eval('.click-target[data-slug="sun"]',hit=>{hit.dispatchEvent(new MouseEvent('mouseenter'));return document.querySelector('.obj-icon[data-slug="sun"]').parentNode.__iconGrowth});assert.ok(reduced>=1.5);
 assert.deepEqual(errors,[]);await fs.mkdir('docs/star-light-review',{recursive:true});await fs.writeFile('docs/star-light-review/hover-motion.json',JSON.stringify({frames,reversal,dust,reduced,errors},null,2)+'\n');
 console.log('PASS: every-frame backing alignment and straight ease-out depth, smooth reversal, immediate reduced-motion hover.');
}finally{await b.close()}
