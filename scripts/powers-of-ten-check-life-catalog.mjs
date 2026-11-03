import assert from 'node:assert/strict';import {buildLifeCatalog,seedLifeCatalog} from '../tools/powers-of-ten/life-catalog.js';import {lifeStep} from '../tools/powers-of-ten/planck-pattern.js';import {buildFilaments} from '../tools/powers-of-ten/cosmic-filaments.js';
const catalog=buildLifeCatalog();assert(catalog.length>=16);
for(const p of catalog){assert.equal(p.cells.length,256);assert.equal(p.grey,p.cells.reduce((s,v)=>s+v,0)/256);}
for(const name of ['block','beehive','boat','tub']){const p=catalog.find(p=>p.name===name);assert.deepEqual(lifeStep(p.cells,16),p.cells,name+' stable');}
for(const name of ['blinker','toad','beacon']){const p=catalog.find(p=>p.name===name);assert.deepEqual(lifeStep(lifeStep(p.cells,16),16),p.cells,name+' period 2');}
const pulsar=catalog.find(p=>p.name==='pulsar');assert.deepEqual(lifeStep(lifeStep(lifeStep(pulsar.cells,16),16),16),pulsar.cells,'pulsar period 3');
const greys=Float32Array.from({length:1024},(_,i)=>i/1023),seed=seedLifeCatalog(greys);assert.equal(seed.size,512);assert.deepEqual(seed.cells,seedLifeCatalog(greys).cells);assert(seed.noise>40&&seed.noise<200);
const dark=seedLifeCatalog(new Float32Array(1024)),light=seedLifeCatalog(new Float32Array(1024).fill(1));assert(light.cells.reduce((s,v)=>s+v,0)>dark.cells.reduce((s,v)=>s+v,0)*3,'tile brightness follows source grayscale');
const lines=buildFilaments();assert(lines.length>500);assert.equal(lines.length%4,0);for(const l of lines){assert.equal(l.pts.length,33);assert(l.pts.every(p=>p.every(Number.isFinite)&&Math.hypot(...p)<1));}
console.log('Passed: density-scored 16×16 motifs, still lifes, period-2 and period-3 oscillators, repeatable mixed/noise seeding, four finite curved strands per 3D connection.');
