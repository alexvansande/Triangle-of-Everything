import test from 'node:test';
import assert from 'node:assert/strict';
import {priorityCircles} from '../src/visibility-hierarchy.js';

test('hidden higher priorities prevent the A → B → A collision cascade',()=>{
  // C blocks B but not A at low zoom. Greedy winners show C+A, then
  // C+B (hiding A), then all three. The fixed hierarchy waits for B too.
  const source=[{id:'C',x:0},{id:'B',x:9},{id:'A',x:14}];
  const names=k=>[...priorityCircles(source.map(p=>({...p,sx:p.x*k,sy:0})),()=>5)].map(p=>p.id);
  assert.deepEqual(names(1),['C']);
  assert.deepEqual(names(1.2),['C','B']);
  assert.deepEqual(names(2.1),['C','B','A']);
});

test('zoom reveals a nested set and zoom out hides in reverse with varied radii',()=>{
  const source=Array.from({length:120},(_,i)=>({id:i,x:Math.sin(i*7)*40,y:Math.cos(i*11)*40,r:3+i%9}));
  let previous=new Set();
  for(let k=.3;k<80;k*=1.06){
    const objects=source.map(p=>({...p,sx:p.x*k+500,sy:p.y*k-100}));
    const current=new Set([...priorityCircles(objects,p=>p.r*(1+.4*Math.log(k/.3)),1.3)].map(p=>p.id));
    for(const id of previous)assert.ok(current.has(id),`lost ${id} at ${k}`);
    previous=current;
  }
});

test('world positions and editorial order determine visibility, not pan or prior winners',()=>{
  const objects=[{id:'first',sx:0,sy:0,r:8},{id:'second',sx:10,sy:0,r:8},{id:'third',sx:35,sy:4,r:4}];
  const select=items=>[...priorityCircles(items,p=>p.r)].map(p=>p.id);
  assert.deepEqual(select(objects),['first','third']);
  assert.deepEqual(select(objects.map(o=>({...o,sx:o.sx-1500,sy:o.sy+700}))),select(objects));
  assert.equal(priorityCircles(objects,p=>p.r,1,[{sx:0,sy:0,r:100}]).size,0);
});
