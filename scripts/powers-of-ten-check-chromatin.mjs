import sharp from 'sharp';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
const root=new URL('../video/powers-of-ten/generated/canopy-test/micro/anatomy-v9/',import.meta.url),path=f=>new URL(f,root).pathname;
// The rear is the original registered nucleus crop, with no child fluid tile.
const registered=await sharp(path('nucleus-raw.png')).resize(1065,1065).extend({left:62,right:127,top:98,bottom:91,extendWith:'mirror'}).png().toBuffer();
const expected=await sharp(registered).extract({left:418,top:418,width:418,height:418}).resize(1254,1254).raw().toBuffer();
const actual=await sharp(path('nuclear-pieces-v2/background.png')).raw().toBuffer();assert.ok(actual.equals(expected),'persistent rear texture must remain the original nucleus pattern');
const scene=JSON.parse(await readFile(path('nuclear-pieces-v2/scene.json'))),stack=[];
for(const p of scene.parts){
 const file=path('nuclear-pieces-v2/'+p.name+'.png'),{data,info}=await sharp(file).raw().toBuffer({resolveWithObject:true});assert.equal(info.channels,4);assert.equal(info.width,1254);
 let clear=0;for(let i=3;i<data.length;i+=4)if(data[i]<=1)clear++;assert.ok(clear/(info.width*info.height)>.10,`${p.name} must have actual transparent background`);
 if(['field','target','purple'].includes(p.name))for(let x=0;x<info.width;x++)assert.ok(data[x*4+3]<2,'no hard rectangular edge on the wider piece');
 const size=Math.round(1254*p.span/scene.backgroundSpan_m);stack.push({input:await sharp(file).resize(size,size).png().toBuffer(),left:Math.floor((1254-size)/2),top:Math.floor((1254-size)/2)});
}
const flat=await sharp(path('nuclear-pieces-v2/background.png')).composite(stack).raw().toBuffer();assert.ok(flat.equals(await sharp(path('level-2.png')).raw().toBuffer()),'parent is the exact common-scale scene, not a separately generated inset');
assert.ok((await sharp(path('../pollen-v4/amoeba-inner.png')).raw().toBuffer()).equals(await sharp(path('level-0.png')).raw().toBuffer()),'whole-cell parent propagates the new scene');
assert.ok(scene.rootDepthStart_m<scene.backgroundSpan_m/2,'depth begins after common parent covers the screen');
console.log('Passed: unchanged nuclear rear texture; four true-alpha foreground pieces; no hard tile edges; exact layered parent and whole-cell propagation; delayed depth.');
