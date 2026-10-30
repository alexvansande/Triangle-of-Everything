import test from 'node:test';
import assert from 'node:assert/strict';
import {spaceImagePriority as tier} from '../src/space-image-priority.js';
import {priorityCircles} from '../src/visibility-hierarchy.js';

test('photos outrank generated artwork, including AI reconstructions of photos',()=>{
  for(const slug of ['earth','jupiter','iapetus','charon']) assert.equal(tier(slug,'planet'),0);
  for(const slug of ['kepler-22b','55-cnc-e','phoebe','253-mathilde','ida','gaspra','titania','ariel']) assert.equal(tier(slug,'planet'),2);
  assert.equal(tier('m87','blackhole'),2); // Current icon is generated, despite an observed reference.
  assert.equal(tier('andromeda-m31','galaxy'),0);
  assert.equal(tier('not-documented','planet'),1);
  assert.equal(tier('stonehenge','macro'),1);
});

test('editorial rank cannot promote generated art ahead of a colliding photograph',()=>{
 const ai={id:'AI',sx:0,sy:0,r:10,imagePriority:2,z:0};
 const photo={id:'photo',sx:5,sy:0,r:10,imagePriority:0,z:99};
 const ordered=[ai,photo].sort((a,b)=>a.imagePriority-b.imagePriority||a.z-b.z);
 assert.deepEqual([...priorityCircles(ordered,o=>o.r)].map(o=>o.id),['photo']);
 // Catalogue photo ignores a lower-priority featured blocker.
 assert.ok(priorityCircles([photo],o=>o.r,1,[ai]).has(photo));
 assert.equal(priorityCircles([ai],o=>o.r,1,[photo]).size,0);
});

test('merged featured/catalogue hierarchy remains stable under panning and zoom',()=>{
 const items=[{id:'featuredPhoto',x:0,imagePriority:0},{id:'cataloguePhoto',x:20,imagePriority:0},{id:'featuredAI',x:24,imagePriority:2}];
 let previous=new Set();
 for(const k of [0.2,0.5,1,2,5,10]){
  const select=pan=>new Set([...priorityCircles(items.map(o=>({...o,sx:o.x*k+pan,sy:pan})),()=>5)].map(o=>o.id));
  const now=select(0);assert.deepEqual(select(900),now);
  for(const id of previous)assert.ok(now.has(id));previous=now;
 }
});

test('Laniakea always takes precedence over the voids',()=>{
  for(const slug of ['bootes-void','eridanus-supervoid','kbc-void']) assert.ok(tier(slug,'largescale')>=tier('laniakea','largescale'));
});
