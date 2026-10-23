import {test} from 'node:test';
import assert from 'node:assert/strict';
import {revealShape} from '../src/icon-reveal.js';
test('reveal ends at a dot and opens beyond square image corners',()=>{
  const dot=revealShape(0,128),full=revealShape(1,128);
  assert.equal(dot.radius,2.8);assert.equal(dot.cover,1);assert.equal(dot.scale,.5);
  assert.ok(full.radius>=128/Math.SQRT2);assert.equal(full.cover,0);assert.equal(full.scale,1);
});
test('cover appears late and final settling briefly undershoots dot radius',()=>{
  assert.equal(revealShape(.5,128).cover,0);
  assert.ok(revealShape(.12,128).cover>0);
  assert.ok(revealShape(.04,128).radius<2.8);
  assert.equal(revealShape(0,128).radius,2.8);
});
