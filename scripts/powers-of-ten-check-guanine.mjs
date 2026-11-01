import assert from 'node:assert/strict';import sharp from 'sharp';import {readFile} from 'node:fs/promises';import {execFileSync} from 'node:child_process';
const root=new URL('../video/powers-of-ten/generated/guanine-bridge-v2/',import.meta.url),p=f=>new URL(f,root).pathname;
const capture=JSON.parse(await readFile(p('capture.json')));assert.equal(capture.geometry.target,12);assert.deepEqual(capture.geometry.atoms[12].slice(1).map(v=>v||0),[0,0,0]);assert.equal(capture.geometry.atoms[12][0],'H');
const N=capture.geometry.atoms[2].slice(1);assert(Math.abs(Math.hypot(...N)-1.016)<.003,'target remains N1-bound hydrogen');
const raw=async file=>sharp(p(file)).ensureAlpha().raw().toBuffer();
const flat=await sharp(p('surroundings-native.png')).composite([{input:p('hydrogen-native.png')}]).ensureAlpha().raw().toBuffer();assert.deepEqual(await raw('guanine-flat.png'),flat,'PNG is the exact registered code-rendered stack');
for(const [name,child,ratio]of [['dna','guanine',3],['hero','dna',9],['field','hero',9]]){
 const n=1254,size=Math.round(n/ratio),left=Math.floor((n-size)/2),small=await sharp(p(child+'-flat.png')).resize(size,size).png().toBuffer();
 const expected=await sharp(p(name+'-carrier.png')).composite([{input:small,left,top:left}]).ensureAlpha().raw().toBuffer();assert.deepEqual(await raw(name+'-flat.png'),expected,name+' contains exact finer registered child');
}
for(const file of ['hydrogen-native.png','surroundings-native.png','dna-carrier.png','hero-carrier.png','field-carrier.png']){
 const data=await raw(file);let clear=0;for(let i=3;i<data.length;i+=4)if(data[i]<2)clear++;assert(clear/(data.length/4)>.05,file+' genuine alpha');
}
const now=await readFile(new URL('../tools/powers-of-ten/small.js',import.meta.url),'utf8'),old=execFileSync('git',['show','HEAD:tools/powers-of-ten/small.js'],{encoding:'utf8'});
for(const name of ['quarkLayer','protonLayer']){const part=s=>s.slice(s.indexOf('const '+name+' ='),s.indexOf('\n  };',s.indexOf('const '+name+' ='))+5);assert.equal(part(now),part(old),name+' animation unchanged');}
console.log('Passed: target hydrogen, exact native alpha capture, registered generated parents, transparent foregrounds, preserved proton/quark layers.');
