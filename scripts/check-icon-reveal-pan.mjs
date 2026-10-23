// Regression: disappearing dust pictures must not interrupt map redraws.
import puppeteer from 'puppeteer-core';
import assert from 'node:assert/strict';
const browser=await puppeteer.launch({executablePath:process.env.CHROME_PATH||'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true,args:['--no-sandbox']});
try {
  const page=await browser.newPage(),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.setViewport({width:1100,height:850});
  await page.goto((process.env.TEST_URL||'http://127.0.0.1:5173')+'/#-0.0,0.4,41.76',{waitUntil:'networkidle0'});
  await page.mouse.move(500,350);
  for(const deltaY of [150,150,150,150,150,-150,-150,-150,-150,-150]) {
    await page.mouse.wheel({deltaY});await new Promise(r=>setTimeout(r,70));
  }
  // Pan while reveal animations are still active, then inspect world alignment.
  const snapshot=()=>page.evaluate(()=>{
    const n=[...document.querySelectorAll('.icon-g')].find(g=>g.__reveal?.target===1);
    const shadow=[...document.querySelectorAll('.icon-shadow')].find(g=>g.__data__.key===n?.__data__.slug);
    return {slug:n?.__data__.slug,x:n?.querySelector('.obj-icon')?.getBoundingClientRect().x,
      shadow:shadow?.querySelector('.sh-img')?.getBoundingClientRect().x};
  });
  const before=await snapshot();
  await page.mouse.move(500,350);await page.mouse.down();await page.mouse.move(600,390,{steps:8});await page.mouse.up();
  const after=await snapshot();
  assert.deepEqual(errors,[],'zoom/pan must not abort a redraw');
  assert.ok(before.slug&&before.slug===after.slug,'same picture remains visible');
  assert.ok(after.x-before.x>70,'picture follows pan immediately');
  assert.ok(after.shadow-before.shadow>70,'shadow follows pan immediately');
  console.log('Zoom thresholds and active-transition pan passed: no errors, picture and shadow track the map.');
} finally {await browser.close();}
