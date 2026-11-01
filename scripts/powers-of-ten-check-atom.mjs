import assert from 'node:assert/strict';
import sharp from 'sharp';
import {readFile} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {basePairGeometry,HYDROGEN_SPAN,PAIR_SPAN,DNA_SPAN} from '../tools/powers-of-ten/atomic-bridge-geometry.js';
const root=new URL('../video/powers-of-ten/generated/atomic-bridge-v1/',import.meta.url),p=f=>new URL(f,root).pathname;
assert.equal(PAIR_SPAN/HYDROGEN_SPAN,3);assert.equal(DNA_SPAN/PAIR_SPAN,3);
const g=basePairGeometry();assert.deepEqual(g.atoms[g.target].slice(1).map(x=>x||0),[0,0,0]);assert.equal(g.N_H_angstrom,1.01);
const raw=async f=>sharp(p(f)).ensureAlpha().raw().toBuffer();
const h=await raw('hydrogen.png'),src=await raw('hydrogen-source.png');let max=0;
for(let i=0;i<h.length;i+=4)for(let c=0;c<3;c++)max=Math.max(max,Math.abs(Math.round(h[i+c]*h[i+3]/255+[3,2,5][c]*(1-h[i+3]/255))-src[i+c]));
assert(max<=2,`Hydrogen matte error ${max}`);
for(const [parent,carrier,child] of [['basepair-flat.png','basepair.png','hydrogen.png'],['dna-flat.png','dna-carrier.png','basepair-flat.png']]){
 const input=await sharp(p(child)).resize(418,418).png().toBuffer();
 const expected=await sharp(p(carrier)).composite([{input,left:418,top:418}]).ensureAlpha().raw().toBuffer();
 assert.deepEqual(await raw(parent),expected,parent+' registration');
}
const now=await readFile(new URL('../tools/powers-of-ten/small.js',import.meta.url),'utf8'),old=execFileSync('git',['show','HEAD:tools/powers-of-ten/small.js'],{encoding:'utf8'});
for(const name of ['quarkLayer','protonLayer']){const part=s=>s.slice(s.indexOf('const '+name+' ='),s.indexOf('\n  };',s.indexOf('const '+name+' ='))+5);assert.equal(part(now),part(old),name+' unchanged');}
console.log('Passed: physical 3× spans, fixed target H, native fiber matte, exact nested composites, unchanged proton and quark layers.');
