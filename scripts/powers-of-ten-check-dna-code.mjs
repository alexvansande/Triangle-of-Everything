import assert from 'node:assert/strict';import sharp from 'sharp';import {readFile} from 'node:fs/promises';
import {DNA_COORDINATES as D} from '../tools/powers-of-ten/dna-coordinates.js';
assert.equal(D.atoms.length,490);assert.deepEqual(D.atoms[12],['H',0,0,0]);
assert(D.atoms.every(a=>a.length===4&&a.slice(1).every(Number.isFinite)));assert(D.atoms.some(a=>a[0]==='P'));
assert(Math.abs(Math.hypot(...D.atoms[2].slice(1))-1.016)<.003);
const root=new URL('../video/powers-of-ten/generated/dna-code-v3/',import.meta.url),p=f=>new URL(f,root).pathname;
const flat=await sharp(p('surroundings-native.png')).composite([{input:p('hydrogen-native.png')}]).raw().toBuffer();assert.deepEqual(await sharp(p('dna-flat.png')).raw().toBuffer(),flat,'native PNG is the exact live layer stack');
for(const [name,child]of [['hero','dna'],['field','hero']]){
 const expected=await sharp(p(name+'-carrier.png')).composite([{input:await sharp(p(child+'-flat.png')).resize(139,139).png().toBuffer(),left:557,top:557}]).raw().toBuffer();assert.deepEqual(await sharp(p(name+'-flat.png')).raw().toBuffer(),expected,'exact native child in '+name);
}
const cap=JSON.parse(await readFile(p('capture.json')));assert.equal(cap.span_m,12e-6/3**7);assert.equal(cap.orbDominant,true);
const src=await readFile(new URL('../tools/powers-of-ten/guanine-approach.js',import.meta.url),'utf8');assert(src.includes('DNA_CODE_SPAN*cam.k'));assert(src.includes('makeGuanineScene(include,approach,true)'));
console.log('Passed: 490 coordinate-based atoms, unchanged target H, exact native source stack, registered larger parents, orb-based live DNA route.');
