// Run against the local dev server; CHART_URL and CHROME_PATH are optional.
import puppeteer from 'puppeteer-core';
import assert from 'node:assert/strict';
const b=await puppeteer.launch({executablePath:process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true,args:['--no-sandbox']});
try {
 const p=await b.newPage(); await p.setViewport({width:1440,height:1000}); const errors=[];p.on('pageerror',e=>errors.push(e.message));
 await p.goto((process.env.CHART_URL || 'http://127.0.0.1:5173/')+'#5.0,15.9,34.98',{waitUntil:'networkidle0'});
 async function search(q){await p.evaluate(()=>{if(!document.querySelector('#search-box').classList.contains('expanded'))document.querySelector('#search-btn').click();});await p.waitForFunction(()=>document.activeElement?.id==='search-input');await p.$eval('#search-input',(el,q)=>{el.value=q;el.dispatchEvent(new Event('input'));},q);}
 await search('Loch Ness');await p.waitForFunction(()=>document.querySelector('.search-item .search-name')?.textContent==='Loch Ness');
 await p.keyboard.press('Enter');
 await p.waitForFunction(()=>[...document.querySelectorAll('.dust-named')].some(el=>el.__data__?.text==='Loch Ness'&&el.__data__?.icon));
 await new Promise(r=>setTimeout(r,900));
 console.log('Loch Ness',await p.evaluate(()=>{const e=[...document.querySelectorAll('.dust-named')].find(e=>e.__data__?.text==='Loch Ness');return {hash:location.hash,...e.__data__};}));

 await p.mouse.move(1100,650);await p.mouse.down();await p.mouse.move(1180,680,{steps:8});await p.mouse.up();
 assert(await p.evaluate(()=>[...document.querySelectorAll('.dust-named')].some(el=>el.__data__?.text==='Loch Ness'&&el.__data__?.icon)));
 // Non-famous entries must be visible too, even when labels and dust were disabled.
 const obscure='Khar Lake';
 await p.evaluate(()=>{for(const id of ['set-dust','set-labels']){const e=document.getElementById(id);e.checked=false;e.dispatchEvent(new Event('change'));}});
 await search(obscure);await p.keyboard.press('Enter');await new Promise(r=>setTimeout(r,900));
 assert(await p.evaluate(name=>[...document.querySelectorAll('.dust-named')].some(el=>el.__data__?.text===name),obscure));
 await search('Earth');assert.equal(await p.$eval('.search-name',el=>el.textContent),'Earth');await p.keyboard.press('Enter');
 await search('zzzznonexistent');assert.match(await p.$eval('#search-results',el=>el.textContent),/No matches/);
 assert.deepEqual(errors,[]); console.log('PASS: catalogue, keyboard selection, icon, pan persistence, disabled-layer selection, curated search, no matches.');
}finally{await b.close();}
