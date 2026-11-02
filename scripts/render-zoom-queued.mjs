import {spawn} from 'node:child_process';
import fs from 'node:fs';
const args=process.argv.slice(2), take=args[0];
const meta=JSON.parse(fs.readFileSync(`public/narration/${take}/words.json`));
if(!fs.existsSync(meta.renderSource+'/tools/powers-of-ten.html')) throw Error('Zoom source is missing: '+meta.renderSource);
const port=5197;
const server=spawn(process.execPath,[meta.renderSource+'/node_modules/vite/bin/vite.js','--host','127.0.0.1','--port',String(port),'--strictPort'],{cwd:meta.renderSource,stdio:'inherit'});
let child; const cleanup=()=>{child?.kill('SIGTERM');server.kill('SIGTERM')};
process.on('SIGTERM',cleanup);process.on('SIGINT',cleanup);
try {
 let ready=false; for(let i=0;i<100;i++){try{const r=await fetch(`http://127.0.0.1:${port}/tools/powers-of-ten.html`);if(r.ok){ready=true;break}}catch{} await new Promise(r=>setTimeout(r,200))}
 if(!ready)throw Error('Zoom server did not start');
 const remove=new Set(['--url','--workers']);const rest=[];
 for(let i=1;i<args.length;i++){if(remove.has(args[i])){i++;continue}rest.push(args[i])}
 child=spawn(process.execPath,['scripts/narration-render.mjs',take,...rest,'--url',`http://127.0.0.1:${port}`,'--workers','2'],{stdio:'inherit'});
 const code=await new Promise(r=>child.on('exit',r));if(code!==0)throw Error('Zoom render failed: '+code);
}finally{server.kill('SIGTERM')}
