import {spawn, execFileSync} from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
const args=process.argv.slice(2), take=args[0];
// output/videos/<take>.wait: hold the render (and the round) until the file is gone (the author, 2026-11-03:
// the zoom only after long video 1 and its Shorts are rendered and uploaded)
while(fs.existsSync(`output/videos/${take}.wait`)) await new Promise(r=>setTimeout(r,30000));
const meta=JSON.parse(fs.readFileSync(`public/narration/${take}/words.json`));
// the zoom video renders the zoom's own page (words.json renderPage); a take over the zoom (video/zoom-takes.json)
// renders the chart's page, from the --url server, with the zoom's frame from this one
const under=JSON.parse(fs.readFileSync('video/zoom-takes.json','utf8'))[take];
const source=under?under.source:meta.renderSource;
if(!fs.existsSync(source+'/tools/powers-of-ten.html')) throw Error('Zoom source is missing: '+source);
// render from a frozen copy (an APFS clone, instant): the zoom's own session keeps editing its source, and
// a file changed mid-render reloaded the page under the renderer (2026-11-01, 21:56)
const src=path.resolve(`output/videos/${take}.src`);
fs.rmSync(src,{recursive:true,force:true});
execFileSync('cp',['-cR',source,src]);
console.log(`zoom source frozen from ${source} (${execFileSync('git',['-C',src,'log','-1','--format=%h %s']).toString().trim()})`);
const port=under?5198:5197;   // its own, so a take over the zoom can render beside the zoom video
const {createServer}=await import(path.join(src,'node_modules/vite/dist/node/index.js'));
// no file watching and no hot reload, and only the zoom's page scanned for dependencies
const server=await createServer({root:src,configFile:path.join(src,'vite.config.js'),
 server:{host:'127.0.0.1',port,strictPort:true,hmr:false,watch:null},optimizeDeps:{entries:['tools/powers-of-ten.html']}});
await server.listen();
let child; const cleanup=()=>{child?.kill('SIGTERM');server.close();process.exit(1)};
process.on('SIGTERM',cleanup);process.on('SIGINT',cleanup);
try {
 const remove=new Set(under?['--workers']:['--url','--workers']);const rest=[];let workers=2;
 for(let i=1;i<args.length;i++){if(args[i]==='--workers')workers=+args[i+1];if(remove.has(args[i])){i++;continue}rest.push(args[i])}
 // each worker loads the whole zoom: no more than 3 (the zoom video: 2)
 child=spawn(process.execPath,['scripts/narration-render.mjs',take,...rest,...(under?['--zoom',`http://127.0.0.1:${port}`,'--workers',String(Math.min(3,workers||3))]:['--url',`http://127.0.0.1:${port}`,'--workers','2'])],{stdio:'inherit'});
 const code=await new Promise(r=>child.on('exit',r));if(code!==0)throw Error('Zoom render failed: '+code);
}finally{await server.close();fs.rmSync(src,{recursive:true,force:true})}
