import test from 'node:test';
import assert from 'node:assert/strict';
import { sweepShadowAlpha } from '../src/long-shadow.js';
import { wallShadowImageGeometry } from '../src/shadow-geometry.js';
import { shadowAction } from './generate-shadows.mjs';

test('bulk generation preserves caustics and spheres and excludes screen artwork',()=>{
 const round=new Set(['earth']);
 for(const name of ['1-ml-of-water','1-liter-of-water','1-tonne-of-water','loch-ness','soap-bubble','lake-baikal','caspian-sea'])assert.equal(shadowAction(name,null,round),'caustics');
 assert.equal(shadowAction('earth',null,round),'round');
 assert.equal(shadowAction('_sphere',null,round),'round');
 assert.equal(shadowAction('sun','Screen-blended artwork',round),'excluded');
 assert.equal(shadowAction('elephant',null,round),'generate');
 assert.equal(shadowAction('saturn',null,round),'custom');
 assert.equal(shadowAction('saturn','Screen-blended artwork',round),'excluded');
});

test('sweeps down-right with a fade, without flipping the silhouette',()=>{
 const size=32,mask=new Uint8ClampedArray(size*size);mask[4*size+3]=255;
 const out=sweepShadowAlpha([mask],size,{lengthPx:12,stepPx:1});
 assert.equal(out[4*size+3],255);
 assert.ok(out[7*size+6]>out[10*size+9]);
 assert.ok(out[10*size+9]>0);
 assert.equal(out[3*size+4],0);
 assert.equal(out[4*size+2],0);
});
test('overlapping samples preserve opacity instead of accumulating darkness',()=>{
 const mask=new Uint8ClampedArray(32*32).fill(100);
 for(const stepPx of [1,2]){
  const out=sweepShadowAlpha([mask],32,{lengthPx:8,fade:0,stepPx});
  assert.equal(Math.max(...out),100);
 }
});
test('zero-length projection translates a silhouette without distortion',()=>{
 const mask=new Uint8ClampedArray(16*16);mask[3*16+2]=180;mask[4*16+2]=60;
 const out=sweepShadowAlpha([mask],16,{lengthPx:0,gapPx:3,angle:0});
 assert.equal(out[3*16+5],180);assert.equal(out[4*16+5],60);assert.equal(out[3*16+2],0);
});
test('registered textures rest at icon center and move independently on hover',()=>{
 const d={sx:200,sy:200,r:64,registered:true};
 const rest=wallShadowImageGeometry(d),hover=wallShadowImageGeometry(d,1.5);
 assert.equal(rest.x+rest.width/2,200);assert.equal(rest.y+rest.height/2,200);
 assert.ok(hover.x+hover.width/2>200);assert.ok(hover.y+hover.height/2>200);
 assert.ok(hover.width>rest.width);assert.notEqual(hover.width/rest.width,1.5);
 assert.ok(hover.opacity<rest.opacity);assert.ok(hover.blur>rest.blur);
 const legacy=wallShadowImageGeometry({...d,registered:false});
 assert.ok(legacy.x>rest.x);assert.ok(legacy.y>rest.y);
});

test('shared round shadows use 45% opacity while custom textures keep their multiplier',()=>{
 const d={sx:200,sy:200,r:64,round:true};
 assert.equal(wallShadowImageGeometry(d).opacity,0.45);
 const hover=wallShadowImageGeometry(d,1.5);
 assert.ok(hover.opacity<0.6);
 assert.equal(wallShadowImageGeometry({...d,round:false,registered:true}).opacity,0.85);
});
