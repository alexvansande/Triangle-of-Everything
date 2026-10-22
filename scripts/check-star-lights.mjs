import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import puppeteer from 'puppeteer-core';
import frames from '../src/star-body-frames.json' with {type:'json'};
const dir='docs/star-light-review';await fs.mkdir(dir,{recursive:true});
const b=await puppeteer.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true,args:['--no-sandbox']});
const pause=()=>new Promise(r=>setTimeout(r,500));
try{
 const p=await b.newPage();await p.setViewport({width:1200,height:950});const errors=[];p.on('pageerror',e=>errors.push(e.message));
 await p.goto('http://127.0.0.1:5173/tools/star-shine-study.html',{waitUntil:'networkidle0'});
 await p.screenshot({path:dir+'/study-rest.png'});
 await p.click('#all');await pause();await p.screenshot({path:dir+'/study-hover.png'});
 const study=await p.$$eval('.scene',els=>els.map(e=>{const s=e.querySelector('.star').getBoundingClientRect(),b=e.querySelector('.star-backing').getBoundingClientRect();return {id:e.id,size:s.width,dx:b.x+b.width/2-s.x-s.width/2,dy:b.y+b.height/2-s.y-s.height/2,r:b.width/2}}));
 for(const d of study){const f=frames[{sun:'sun',red:'red-dwarf',ember:'t-brown-dwarf',gradient:'sun'}[d.id]];assert.ok(Math.abs(d.dx-(f.cx-.5)*d.size)<.1);assert.ok(Math.abs(d.dy-(f.cy-.5)*d.size)<.1);assert.ok(Math.abs(d.r-f.r*d.size)<.1)}
 await p.goto('http://127.0.0.1:5173/?og-shot',{waitUntil:'networkidle0'});await p.waitForFunction(()=>window.__toeOg?.ready());
 const samples=[];
 for(const slug of ['sun','red-dwarf','t-brown-dwarf']){
  await p.evaluate(s=>{const v=window.__toeOg.plot();window.__toeOg.place(s,110,v.w*.5,v.h*.5)},slug);await pause();
  await p.waitForFunction(s=>document.querySelector(`.obj-icon[data-slug="${s}"]`)?.parentNode.querySelector('.icon-bg')?.getAttribute('display')!=='none',{},slug);
  const measure=()=>p.evaluate(s=>{const im=document.querySelector(`.obj-icon[data-slug="${s}"]`),disc=im.parentNode.querySelector('.icon-bg'),r=im.getBoundingClientRect(),c=disc.getBoundingClientRect(),g=[...document.querySelectorAll('.icon-shadow')].find(e=>e.__data__.key===s),light=g.querySelector('.sh-glow'),shadow=g.querySelector('.sh-img');return{width:r.width,dx:c.x+c.width/2-r.x-r.width/2,dy:c.y+c.height/2-r.y-r.height/2,radius:c.width/2,lights:[...document.querySelectorAll('.icon-shadow')].filter(e=>e.__data__.key===s).length,glow:light.getAttribute('display')!=='none',cx:+light.getAttribute('cx'),cy:+light.getAttribute('cy'),rx:+light.getAttribute('rx'),ry:+light.getAttribute('ry'),opacity:+light.getAttribute('opacity'),shadow:shadow.getAttribute('display')!=='none',shadowWidth:+shadow.getAttribute('width'),shadowOpacity:+shadow.getAttribute('opacity')}} ,slug);
  const rest=await measure();await p.screenshot({path:`${dir}/${slug}-rest.png`});
  await p.$eval(`.click-target[data-slug="${slug}"]`,e=>e.dispatchEvent(new MouseEvent('mouseenter')));await pause();
  const hover=await measure();await p.screenshot({path:`${dir}/${slug}-hover.png`});
  for(const d of [rest,hover]){const f=frames[slug];assert.ok(Math.abs(d.dx-(f.cx-.5)*d.width)<.2);assert.ok(Math.abs(d.dy-(f.cy-.5)*d.width)<.2);assert.ok(Math.abs(d.radius-f.r*d.width)<.2);assert.equal(d.lights,1)}
  assert.ok(hover.width>rest.width);
  if(slug==='t-brown-dwarf'){assert.ok(rest.shadow&&!rest.glow);assert.ok(hover.shadowWidth>rest.shadowWidth);assert.ok(hover.shadowOpacity<rest.shadowOpacity)}
  else{assert.ok(rest.glow&&!rest.shadow);assert.equal(rest.rx,rest.ry);assert.equal(rest.cx,hover.cx);assert.equal(rest.cy,hover.cy);assert.ok(hover.rx>rest.rx);assert.ok(hover.opacity<rest.opacity)}
  samples.push({slug,rest,hover});
  await p.$eval(`.click-target[data-slug="${slug}"]`,e=>e.dispatchEvent(new MouseEvent('mouseleave')));await pause();
 }
 assert.deepEqual(errors,[]);await fs.writeFile(dir+'/checks.json',JSON.stringify({study,samples,errors},null,2)+'\n');console.log('PASS: measured backing alignment, wall-anchored circular light, hover spread/dimming, and single brown-dwarf optical layer.');
}finally{await b.close()}
