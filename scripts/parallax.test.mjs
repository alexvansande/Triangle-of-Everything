import test from 'node:test';
import assert from 'node:assert/strict';
import { iconPoint, planePoint, unprojectPlane, PARALLAX } from '../src/parallax.js';

test('normal icons retain their anchor inside the body circle throughout the viewport', () => {
  for (const [w,h] of [[390,844],[1440,900],[900,1440]]) for (const body of [14,64,200]) {
    for (let x=-200;x<w+200;x+=37) for(let y=-200;y<h+200;y+=41) {
      const p=iconPoint(x,y,w,h,body);
      assert.ok(Math.hypot(p.x-x,p.y-y)<=body*0.28+1e-9);
    }
    const a=iconPoint(0,h/2,w,h,body),b=iconPoint(w,h/2,w,h,body);
    assert.ok((b.x-w)-a.x<body);
  }
});
test('layer travel is ordered, hover is closer, and camera reversal has no drift', () => {
  const args=[1200,400,1440,900];
  const dust=planePoint(...args,PARALLAX.dust),label=planePoint(...args,PARALLAX.labels);
  const icon=iconPoint(...args,100),hover=iconPoint(...args,100,1.5);
  assert.ok(dust.x>args[0]&&label.x>dust.x&&icon.x>label.x&&hover.x>icon.x);
  iconPoint(10,200,1440,900,100);
  assert.deepEqual(iconPoint(...args,100),icon);
  assert.deepEqual(iconPoint(...args,100,1,false),{x:args[0],y:args[1]});
  assert.deepEqual(iconPoint(720,450,1440,900,100),{x:720,y:450});
});
test('dust picking inverts the displayed plane, including edges and resize', () => {
  for(const [w,h] of [[390,844],[1440,900]])for(const depth of [0,2,4])for(const x of [-10,0,w/2,w,w+10]) {
    const p=planePoint(x,h*.8,w,h,depth),q=unprojectPlane(p.x,p.y,w,h,depth);
    assert.ok(Math.abs(q.x-x)<1e-9&&Math.abs(q.y-h*.8)<1e-9);
  }
});
