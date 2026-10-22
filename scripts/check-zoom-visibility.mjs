// Dev-server integration check: objects inside the viewport may only appear
// while zooming in, and may only disappear while zooming out.
import puppeteer from 'puppeteer-core';
import fs from 'node:fs/promises';
const browser=await puppeteer.launch({executablePath:process.env.CHROME_PATH||'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true,args:['--no-sandbox']});
try {
  const page=await browser.newPage();await page.setViewport({width:1440,height:1000});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto((process.env.CHART_URL||'http://127.0.0.1:5173/')+'?og-shot',{waitUntil:'networkidle0'});
  await page.waitForFunction(()=>window.__toeOg?.ready());
  const reports=[];
  for(const slug of ['human','earth','observable-universe']) {
    const report=await page.evaluate(slug=>{
      const api=window.__toeOg,plot=api.plot();
      const scales=[];for(let k=1;k<=200;k*=1.08)scales.push(k);
      const report={slug,checked:0,curated:0,dust:0,changes:[]};
      for(const direction of ['in','out']){
        let previous=null;
        for(const k of direction==='in'?scales:[...scales].reverse()){
          api.place(slug,k,plot.w/2,plot.h/2);
          const now=new Map();
          for(const node of document.querySelectorAll('.obj-g,.dust-named')){
            const d=node.__data__;if(!d)continue;
            const key=d.slug?'curated:'+d.slug:'dust:'+d.i;
            now.set(key,{x:d.sx,y:d.sy,icon:!!(d._showIcon||d.icon)});
          }
          // Only inspect objects safely inside both frames: viewport exits
          // are clipping, not changes in the visibility hierarchy.
          const inside=p=>p&&p.x>180&&p.x<plot.w-180&&p.y>160&&p.y<plot.h-160;
          if(previous)for(const key of new Set([...previous.keys(),...now.keys()])){
            const a=previous.get(key),b=now.get(key);
            // The collection candidates can be absent entirely when hidden.
            // Convert either known point to the other zoom's coordinates.
            const ratio=k/previous.k;
            const prior=a||{x:plot.w/2+(b.x-plot.w/2)/ratio,y:plot.h/2+(b.y-plot.h/2)/ratio,icon:false};
            const next=b||{x:plot.w/2+(a.x-plot.w/2)*ratio,y:plot.h/2+(a.y-plot.h/2)*ratio,icon:false};
            if(!inside(prior)||!inside(next))continue;
            report.checked++;if(key.startsWith('dust:'))report.dust++;else report.curated++;
            if(direction==='in'?prior.icon&&!next.icon:!prior.icon&&next.icon)report.changes.push({key,direction,k});
          }
          now.k=k;previous=now;
        }
      }
      return report;
    },slug);
    reports.push(report);console.log(JSON.stringify(report));
    if(report.changes.length||report.checked<100)throw Error('Non-monotonic icon visibility');
  }
  if(errors.length)throw Error(errors.join('\n'));
  await fs.mkdir('docs/visibility-review',{recursive:true});
  await fs.writeFile('docs/visibility-review/zoom-report.json',JSON.stringify(reports,null,2)+'\n');
} finally {await browser.close()}
