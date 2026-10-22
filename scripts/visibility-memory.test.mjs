import test from 'node:test';
import assert from 'node:assert/strict';
import { VisibilityMemory } from '../src/visibility-memory.js';

test('preserves visible and hidden decisions across pan and small zoom reversals',()=>{
  const memory=new VisibilityMemory();
  memory.update([50,-50],'same settings');
  memory.decisions.set('visible',true);memory.decisions.set('hidden',false);
  const epoch=memory.epoch;
  for(const scale of [50,50.0000000001,54,49,53]) {
    assert.equal(memory.update([scale,-scale],'same settings'),false);
    assert.equal(memory.decisions.get('visible'),true);
    assert.equal(memory.decisions.get('hidden'),false);
  }
  assert.equal(memory.epoch,epoch);
});
test('meaningful zoom or settings changes allow a new pass without a timer reset on pan',()=>{
  const memory=new VisibilityMemory();memory.update([50,-50],'on');
  memory.decisions.set('hidden',false);
  assert.equal(memory.update([57,-57],'on'),true);
  assert.equal(memory.decisions.size,0);
  memory.decisions.set('visible',true);
  assert.equal(memory.update([57,-57],'off'),true);
  assert.equal(memory.decisions.size,0);
});
