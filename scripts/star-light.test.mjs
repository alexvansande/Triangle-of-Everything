import test from 'node:test';
import assert from 'node:assert/strict';
import {starBodyGeometry,starWallLight,BROWN_DWARFS,stellarLightProfile} from '../src/star-light.js';
import {shadowExclusion} from './shadow-eligibility.mjs';
import {shadowAction} from './generate-shadows.mjs';

test('off-center solar backing follows visible body through magnification',()=>{
 const rest=starBodyGeometry('sun',200,300,100),hover=starBodyGeometry('sun',200,300,100,1.5);
 assert.ok(rest.cx<200);
 assert.ok(Math.abs(hover.cx-200-(rest.cx-200)*1.5)<1e-10);
 assert.equal(hover.r,rest.r*1.5);
 assert.equal(starBodyGeometry('protostar',200,300,100),null);
});
test('wall lights stay anchored and spread independently of the growing source',()=>{
 const d={slug:'sun',sx:200,sy:300,r:50};
 const rest=starWallLight(d),hover=starWallLight(d,1.5);
 assert.equal(rest.rx,rest.ry);assert.equal(hover.rx,hover.ry);
 assert.equal(rest.cx,hover.cx);assert.equal(rest.cy,hover.cy);
 assert.ok(hover.rx/rest.rx>1.5);assert.ok(hover.opacity<rest.opacity);
 assert.ok(Math.abs(hover.opacity*hover.rx**2-rest.opacity*rest.rx**2)<1e-8);
});
test('brown dwarfs preserve their hybrid shadow while ordinary stars stay excluded',async()=>{
 for(const slug of BROWN_DWARFS){
  assert.equal(await shadowExclusion(slug),null);
  assert.equal(shadowAction(slug,null,new Set()),'custom');
 }
 assert.ok(await shadowExclusion('sun'));
});
test('brown dwarfs trade shadow for a broader brighter aura from Y to T to L',()=>{
 const [y,t,l]=['y','t','l'].map(type=>stellarLightProfile(type+'-brown-dwarf'));
 assert.ok(y.shadow>t.shadow&&t.shadow>l.shadow);
 assert.ok(y.spread<t.spread&&t.spread<l.spread);
 assert.ok(y.opacity<t.opacity&&t.opacity<l.opacity);
});
test('stellar halo intensity increases with chart mass and stays bounded',()=>{
 const low=stellarLightProfile('red-dwarf',32.1),sun=stellarLightProfile('sun',33.3),high=stellarLightProfile('blue-supergiant',34.7);
 assert.ok(low.opacity<sun.opacity&&sun.opacity<high.opacity);
 assert.ok(stellarLightProfile('test',100).opacity<=.62);
 assert.ok(Number.isFinite(stellarLightProfile('test',NaN).opacity));
});
