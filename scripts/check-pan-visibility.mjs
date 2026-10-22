// Browser regression: run with the dev server active. Override CHART_URL/CHROME_PATH if needed.
import puppeteer from 'puppeteer';
import fs from 'node:fs/promises';
const b=await puppeteer.launch({executablePath:process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true,args:['--no-sandbox']});
try{
 const p=await b.newPage();await p.setViewport({width:1440,height:1000});let errors=[];p.on('pageerror',e=>errors.push(e.message));
 const reports=[];
 for(const hash of ['6.2,19.4,24.67','2.9,6.3,22.41','1.1,-0.2,22.41']){
  await p.goto('about:blank');await p.goto((process.env.CHART_URL || 'http://127.0.0.1:5173/')+'#'+hash,{waitUntil:'networkidle0'});await p.waitForSelector('.dust-named');
  const snapshot=()=>p.evaluate(()=>{
   const items={};
   for(const el of document.querySelectorAll('.obj-g,.dust-named')){const d=el.__data__;if(!d)continue;const key=d.slug?'curated:'+d.slug:'dust:'+d.i;items[key]={x:d.sx,y:d.sy,icon:!!(d._showIcon||d.icon),label:d._showLabel??true};}
   return items;
  });
  const before=await snapshot();const counts={samples:0,checked:0,changes:[]};
  await p.mouse.move(1170,500);await p.mouse.down();
  for(const dx of [1,2,3,10,25,60,100,150,100,50,5,0,-30,-70,-120,-60,0]){
   await p.mouse.move(1170+dx,500+dx*.2);await new Promise(r=>setTimeout(r,35));const now=await snapshot();
   const common=Object.keys(before).find(k=>now[k]);if(!common)throw Error('No shared objects');
   const tx=now[common].x-before[common].x,ty=now[common].y-before[common].y;
   for(const key of new Set([...Object.keys(before),...Object.keys(now)])){
    const a=before[key],c=now[key];const x=a?.x??c.x-tx,y=a?.y??c.y-ty;
    if(x<280||x>950||y<220||y>650||x+tx<180||x+tx>1050||y+ty<120||y+ty>750)continue;
    counts.checked++;
    if(!a||!c||a.icon!==c.icon||a.label!==c.label)counts.changes.push({key,a,c,dx});
   }
   counts.samples++;
  }
  await p.mouse.up();await new Promise(r=>setTimeout(r,600));const after=await snapshot();
  console.log(hash,JSON.stringify(counts));reports.push({hash,...counts});
  if(counts.changes.length)throw Error('Visibility changed while panning');if(counts.checked<10)throw Error('Insufficient objects checked');
 }
 if(errors.length)throw Error(errors.join('\n'));
 await fs.mkdir('docs/visibility-review',{recursive:true});await fs.writeFile('docs/visibility-review/pan-report.json',JSON.stringify(reports,null,2)+'\n');
 console.log('Pan visibility stable in all three chart regions');
}finally{await b.close();}
