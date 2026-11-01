import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {PARTICLES,LOOK} from '../public/hopf/hopf-core.js';
const path=new URL('../public/hopf/molecular-clouds.js',import.meta.url);
let source=await readFile(path,'utf8');
for(const f of ['./hopf-core.js','./molecules.js','./big-molecules.js','./molecular-element-colors.js'])source=source.replaceAll("'"+f+"'",JSON.stringify(new URL(f,path).href));
source=source.replace("'/src/data.js'",JSON.stringify(new URL('../src/data.js',import.meta.url).href));
const {molecularCloudParticle,elementCloudColor,molecularAtomRadius,bundleRotation}=await import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'));
for(const id of ['water','hydrogen','deuterium','oxygen'])assert.equal(molecularCloudParticle(id),PARTICLES.find(p=>p.id===id));
for(const id of ['guanine-g','adenine-a','thymine-t','cytosine-c','dna']){
 const p=molecularCloudParticle(id),made=p.make();assert(made.fibers.length>0);assert.equal(made.solidCount,0);
 for(const f of made.fibers.slice(0,200))for(const u of [.1,.5,.9]){
  const q=f.curve(u,1),[color,intensity]=f.field(q,1,u);assert(q.every(Number.isFinite));assert(color.every(Number.isFinite));assert(Number.isFinite(intensity));assert(f.width>0);assert.equal(f.glow,undefined);
 }
}
const {MOLECULAR_ELEMENT_COLORS,MOLECULAR_ELEMENT_SYMBOLS}=await import('../public/hopf/molecular-element-colors.js');
assert.equal(MOLECULAR_ELEMENT_COLORS.length,119);assert.equal(MOLECULAR_ELEMENT_SYMBOLS.length,118);
assert(MOLECULAR_ELEMENT_COLORS.slice(1).every(c=>/^#[0-9a-f]{6}$/.test(c)));
for(const [el,c] of [['H','#3fe6ff'],['C','#3155e7'],['N','#9365ed'],['O','#ffe266'],['P','#55dfba'],['S','#b9a0ef'],['FE','#dcdcdc'],['NB','#7c7f85'],['TL','#771b17'],['OG','#b42ae0']])assert.equal(elementCloudColor(el),c);
console.log('Passed: independent molecular fibers, finite geometry/light, exact user palette, original water and smaller particles untouched.');

assert(new Set(['H','C','N','O','P','S'].map(elementCloudColor)).size===6,'spectral colours distinguish molecular elements');
assert(molecularAtomRadius('C')+molecularAtomRadius('N')>1.45,'bonded atoms must contact');
const v=[.2,.3,.8],a=bundleRotation(1,[1,2,3])(v),b=bundleRotation(2,[2,3,4])(v);assert(Math.hypot(...a.map((x,i)=>x-b[i]))>.1,'independent bundle orientations');assert(Math.abs(Math.hypot(...a)-Math.hypot(...v))<1e-12);
