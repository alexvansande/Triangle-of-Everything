// Prepare a pinned, isolated copy of Claude's viewer without changing the dirty checkout.
import { execFileSync, spawn } from 'node:child_process';
import { readFile, writeFile, mkdir, cp, symlink, access } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pipeline } from 'node:stream/promises';
const root=resolve(import.meta.dirname,'..');
const runtime=process.argv[2]||'/private/tmp/powers-of-ten-test';
const revision='15ff3f9';
await mkdir(runtime,{recursive:true});
try{await access(`${runtime}/package.json`)}catch{
  const archive=spawn('git',['archive',revision],{cwd:root,stdio:['ignore','pipe','inherit']});
  const unpack=spawn('tar',['-x','-C',runtime],{stdio:['pipe','inherit','inherit']});
  await pipeline(archive.stdout,unpack.stdin);
  await new Promise((ok,no)=>unpack.on('close',code=>code===0?ok():no(Error('Archive extraction failed'))));
}
try{await access(`${runtime}/node_modules`)}catch{await symlink(`${root}/node_modules`,`${runtime}/node_modules`)}
const generated='video/powers-of-ten/generated/canopy-test';
execFileSync(process.execPath,[`${root}/scripts/powers-of-ten-match-nucleus.mjs`],{cwd:root,stdio:'inherit'});
execFileSync(process.execPath,[`${root}/scripts/powers-of-ten-match-water.mjs`],{cwd:root,stdio:'inherit'});
execFileSync(process.execPath,[`${root}/scripts/powers-of-ten-match-drop.mjs`],{cwd:root,stdio:'inherit'});
execFileSync(process.execPath,[`${root}/scripts/powers-of-ten-match-depth.mjs`],{cwd:root,stdio:'inherit'});
await cp(`${root}/${generated}`,`${runtime}/${generated}`,{recursive:true});
await cp(`${root}/tools/powers-of-ten/canopy-test.js`,`${runtime}/tools/powers-of-ten/canopy-test.js`);
await cp(`${root}/tools/powers-of-ten/canopy-insects.js`,`${runtime}/tools/powers-of-ten/canopy-insects.js`);
await cp(`${root}/tools/powers-of-ten/canopy-optics.js`,`${runtime}/tools/powers-of-ten/canopy-optics.js`);
await cp(`${root}/tools/powers-of-ten/canopy-depth.js`,`${runtime}/tools/powers-of-ten/canopy-depth.js`);
for(const file of ['scale-overlay.js','canopy-crown-depth.js','canopy-micro.js','canopy-micro-specimens.js','canopy-nucleus.js'])await cp(`${root}/tools/powers-of-ten/${file}`,`${runtime}/tools/powers-of-ten/${file}`);
for(const slug of ['ladybug','ant','boeing-747'])await cp(`${root}/content/icons/resolutions/1024/${slug}.webp`,`${runtime}/content/icons/resolutions/1024/${slug}.webp`);
const centre=JSON.parse(await readFile(`${root}/${generated}/centre.json`,'utf8'));
const manifest=JSON.parse(await readFile(`${root}/${generated}/plates/manifest.json`,'utf8'));
const micro=JSON.parse(await readFile(`${root}/${generated}/micro/scene.json`,'utf8'));
const minimum=Math.min(micro.minimum_s,...manifest.plates.map(p=>p.s));
let main=execFileSync('git',['show',`${revision}:tools/powers-of-ten/main.js`],{cwd:root,encoding:'utf8'});
main="import { drawScaleOverlay } from './scale-overlay.js';\nimport { canopyCrownDepth } from './canopy-crown-depth.js';\nimport { canopyMicro } from './canopy-micro.js';\nimport { canopyDepth } from './canopy-depth.js';\nimport { canopyOptics } from './canopy-optics.js';\nimport { catalogueInsects } from './canopy-insects.js';\n"+main;
main=main.replace('const S_MIN = -35.3, S_MAX = 27.6;',`const canopyTest = new URLSearchParams(location.search).has('canopytest');\nconst insects=catalogueInsects();\nconst S_MIN = canopyTest ? ${minimum} : -35.3, S_MAX = canopyTest ? 5.1 : 27.6;\nwindow.canopyTest = {enabled:true,minimum:${minimum}};`);
main=main.replace('const plates = await platesLayer(q.get("plates") === "1");',`const rawPlates = await platesLayer(canopyTest || q.get('plates') === '1', canopyTest ? '/${generated}/plates/' : '/video/powers-of-ten/plates/', 0.4, {square:canopyTest,floor:canopyTest?${minimum}:undefined});\nconst plates={covers:s=>(!canopyTest||window.canopyTest.enabled)?rawPlates.covers(s):new Set(),draw:cam=>{if(!canopyTest||window.canopyTest.enabled)rawPlates.draw(cam)}};`);
main=main.replace('photos.draw(cam); clouds.draw(cam); plates.draw(cam);',`photos.draw(canopyTest ? {...cam,cx:cam.cx-(${centre.offset_east_m})*cam.k,cy:cam.cy+(${centre.offset_north_m})*cam.k} : cam); if(!canopyTest)clouds.draw(cam); plates.draw(cam);`);
main=main.replace('"/video/powers-of-ten/photos/", 0.3, { fadeOutAt: PHOTOS_OUT });','"/video/powers-of-ten/photos/", 0.3, { fadeOutAt: PHOTOS_OUT, extendLow:canopyTest });');
main=main.replace('plates.draw(cam); }','if(canopyTest)insects.draw(cam); plates.draw(cam); if(canopyTest){crown.draw(cam);depth.draw(cam);microscope.draw(cam);optics.plane(cam);optics.bird(cam);} }');
// Steer gently onto the off-centre shell droplet as the macro approach starts.
main=main.replace('if (L.name === "earth") {', `if (L.name === "earth") { if(canopyTest){const t=Math.max(0,Math.min(1,(-cam.s-.7)/1.05)),f=t*t*(3-2*t);cam.cx-=(-0.0024822744142255736)*cam.k*f;cam.cy-=(-0.0009580708265432034)*cam.k*f;}`);
main=main.replace('const insects=catalogueInsects();','const insects=canopyTest?catalogueInsects():null,optics=canopyTest?canopyOptics():null,depth=canopyTest?canopyDepth():null,crown=canopyTest?canopyCrownDepth():null,microscope=canopyTest?canopyMicro():null;');
main+=`\nif(canopyTest) (await import('./canopy-test.js')).mountCanopyTest();\n`;
main=main.replace('if (state.grid) drawGrid({ ...cam, W, H, cx: W / 2, cy: H / 2 });','drawScaleOverlay({ ...cam, W, H, cx: W / 2, cy: H / 2 }, {grid:state.grid,labels:state.labels,canopy:canopyTest});');
await writeFile(`${runtime}/tools/powers-of-ten/main.js`,main);
let plates=execFileSync('git',['show',`${revision}:tools/powers-of-ten/plates.js`],{cwd:root,encoding:'utf8'});
plates=plates.replace('img: null, loading: false', 'img: null, loading: false, x:p.x||0, y:p.y||0');
plates=plates.replaceAll('cam.cx - side / 2, cam.cy - side / 2', 'cam.cx + p.x*cam.k - side / 2, cam.cy + p.y*cam.k - side / 2');
plates=plates.replace('p.img = feather(img);','p.img = opts.square ? featherSquare(img) : feather(img);');
plates=plates.replace('const lo = plates[plates.length - 1].s,','const lo = opts.floor ?? (opts.extendLow ? 0 : plates[plates.length - 1].s),');
plates=plates.replace('cam.ctx.globalAlpha = a;','cam.ctx.globalAlpha = a; if(opts.square){const f=Math.max(0,Math.min(1,(side/cam.min-.3)/.65));cam.ctx.globalAlpha*=f*f*(3-2*f);}');
plates+=`\nfunction featherSquare(img){\n const n=img.naturalWidth,c=document.createElement('canvas');c.width=c.height=n;\n const x=c.getContext('2d');x.drawImage(img,0,0,n,n);x.globalCompositeOperation='destination-in';\n for(const vertical of [false,true]){const g=x.createLinearGradient(0,0,vertical?0:n,vertical?n:0);g.addColorStop(0,'#0000');g.addColorStop(.04,'#000');g.addColorStop(.96,'#000');g.addColorStop(1,'#0000');x.fillStyle=g;x.fillRect(0,0,n,n)}\n return c;\n}\n`;
await writeFile(`${runtime}/tools/powers-of-ten/plates.js`,plates);
console.log('Preview ready: http://127.0.0.1:5187/tools/powers-of-ten.html?canopytest=1&s=1.123&roll=0&crossings=0&grid=0&labels=0');
if(process.argv.includes('--serve')){
 const server=spawn(process.execPath,[`${root}/node_modules/vite/bin/vite.js`,'--host','127.0.0.1','--port','5187','--strictPort'],{cwd:runtime,stdio:'inherit'});
 server.on('exit',code=>process.exit(code??1));
}
