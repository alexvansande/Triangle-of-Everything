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
execFileSync(process.execPath,[`${root}/scripts/powers-of-ten-match-anatomy.mjs`],{cwd:root,stdio:'inherit'});
execFileSync(process.execPath,[`${root}/scripts/powers-of-ten-match-water.mjs`],{cwd:root,stdio:'inherit'});
execFileSync(process.execPath,[`${root}/scripts/powers-of-ten-match-drop.mjs`],{cwd:root,stdio:'inherit'});
execFileSync(process.execPath,[`${root}/scripts/powers-of-ten-match-depth.mjs`],{cwd:root,stdio:'inherit'});
await cp(`${root}/${generated}`,`${runtime}/${generated}`,{recursive:true});
await cp(`${root}/video/powers-of-ten/generated/matched-sky-v1`,`${runtime}/video/powers-of-ten/generated/matched-sky-v1`,{recursive:true});
await cp(`${root}/video/powers-of-ten/galaxies`,`${runtime}/video/powers-of-ten/galaxies`,{recursive:true});
await cp(`${root}/video/powers-of-ten/generated/galaxy-handoff-v2`,`${runtime}/video/powers-of-ten/generated/galaxy-handoff-v2`,{recursive:true});
await cp(`${root}/tools/powers-of-ten/canopy-test.js`,`${runtime}/tools/powers-of-ten/canopy-test.js`);
await cp(`${root}/tools/powers-of-ten/canopy-insects.js`,`${runtime}/tools/powers-of-ten/canopy-insects.js`);
await cp(`${root}/tools/powers-of-ten/canopy-optics.js`,`${runtime}/tools/powers-of-ten/canopy-optics.js`);
await cp(`${root}/tools/powers-of-ten/canopy-depth.js`,`${runtime}/tools/powers-of-ten/canopy-depth.js`);
for(const file of ['scale-overlay.js','canopy-crown-depth.js','canopy-micro.js','canopy-micro-specimens.js','canopy-nucleus.js'])await cp(`${root}/tools/powers-of-ten/${file}`,`${runtime}/tools/powers-of-ten/${file}`);
for(const slug of ['ladybug','ant','boeing-747'])await cp(`${root}/content/icons/resolutions/1024/${slug}.webp`,`${runtime}/content/icons/resolutions/1024/${slug}.webp`);
// Share the complete route rather than reconstructing a legacy bounded viewer.
for(const file of ['full-journey.js','small.js','space.js','distance-labels.js','galaxy-handoff.js','galaxy-geometry.js','extragalactic.js','cmb-sphere.js','math.js'])await cp(`${root}/tools/powers-of-ten/${file}`,`${runtime}/tools/powers-of-ten/${file}`);
await writeFile(`${runtime}/tools/powers-of-ten/main.js`,'import "./full-journey.js";\n');
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
