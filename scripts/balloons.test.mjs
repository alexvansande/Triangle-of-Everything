import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { applyBulkObjects } from '../src/bulk-density.js';
import { buildSearchIndex, searchObjects } from '../src/object-search.js';

const objects = JSON.parse(fs.readFileSync(new URL('../src/objects.json', import.meta.url)));
const bySlug = new Map(applyBulkObjects(objects).map(o => [o.slug, o]));
const volume = o => 4 * Math.PI / 3 * (10 ** o.logR / 100) ** 3;

test('weather balloon expands with conserved total mass and inflated-volume placement', () => {
  const launch = bySlug.get('weather-balloon'), burst = bySlug.get('weather-balloon-near-burst');
  assert.equal(launch.logM, burst.logM);
  assert.ok(Math.abs(volume(launch) - Math.PI / 6 * 1.5 ** 3) < .001);
  assert.ok(Math.abs(volume(burst) / volume(launch) - (6.03504 / 1.5) ** 3) < .01);
  assert.ok(burst.rho < launch.rho / 60);
});

test('balloon density uses gas volume and bubbles include their enclosed air', () => {
  assert.ok(Math.abs(volume(bySlug.get('hot-air-balloon')) - 77500 * .028316846592) < .1);
  assert.ok(Math.abs(volume(bySlug.get('zeppelin-nt')) - 8425) < .1);
  const bubble = bySlug.get('soap-bubble');
  const massGrams = 10 ** bubble.logM;
  assert.ok(massGrams > .020 && massGrams < .021);
  assert.ok(bubble.rho > .001225);
});

test('14-bis is curated ahead of dust and new names are searchable by common aliases', () => {
  assert.equal(bySlug.get('14-bis').subcat, 'machine');
  assert.equal(bySlug.get('14-bis').z, 2);
  const index = buildSearchIndex(objects, []);
  for (const [query, slug] of [['Santos Dumont', '14-bis'], ['airships', 'zeppelin-nt'],
    ['hot air balloons', 'hot-air-balloon'], ['soap bubbles', 'soap-bubble'],
    ['party balloons', 'helium-party-balloon'], ['atmospheric balloon launch', 'weather-balloon']]) {
    assert.equal(searchObjects(index, query)[0]?.slug, slug);
  }
});
