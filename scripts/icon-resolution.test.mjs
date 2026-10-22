import test from 'node:test';
import assert from 'node:assert/strict';
import {iconPixelRequirement,chooseIconResolution} from '../src/icon-resolution.js';

const variants=[128,256,512,1024].map(width=>({width,url:`${width}.webp`}));
test('reserves Retina pixels for the actual hover size, including minimum hover size',()=>{
  assert.equal(iconPixelRequirement(128,2),384);
  assert.equal(chooseIconResolution(variants,iconPixelRequirement(128,2)).width,512);
  assert.equal(iconPixelRequirement(14,3),192);
  assert.equal(chooseIconResolution(variants,iconPixelRequirement(14,3)).width,256);
});
test('uses the smallest sufficient tier and highest available when source is limited',()=>{
  assert.equal(chooseIconResolution(variants,128).width,128);
  assert.equal(chooseIconResolution(variants,129).width,256);
  assert.equal(chooseIconResolution(variants,1800).width,1024);
  assert.equal(chooseIconResolution(variants.slice(0,1),384).width,128);
  assert.equal(chooseIconResolution([],128),null);
});
