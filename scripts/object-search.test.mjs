import test from 'node:test';
import assert from 'node:assert/strict';
import { buildSearchIndex, searchObjects } from '../src/object-search.js';

test('search includes catalogue names, aliases, accents and exact-match priority', () => {
  const entries = [{ name: 'Loch Ness', dustIndex: 3 },
    { name: 'Königssee', dustIndex: 4 },
    { name: 'Andromeda', aliases: ['M31'], dustIndex: 5 }];
  const index = buildSearchIndex([{ name: 'Loch Ness monster' }], entries);
  assert.equal(searchObjects(index, ' loch ness ')[0].dustIndex, 3);
  assert.equal(searchObjects(index, 'konigssee')[0].dustIndex, 4);
  assert.equal(searchObjects(index, 'm31')[0].dustIndex, 5);
  assert.deepEqual(searchObjects(index, ''), []);
  assert.deepEqual(searchObjects(index, 'nonexistent'), []);
});

test('curated duplicates win while different objects at identical coordinates remain distinct', () => {
  const curated = { name: 'Earth', slug: 'earth', logR: 1, logM: 2 };
  const other = { name: 'Other', dustIndex: 1, logR: 1, logM: 2 };
  const index = buildSearchIndex([curated], [{ name: 'Earth', dustIndex: 0 }, other]);
  assert.deepEqual(searchObjects(index, 'Earth'), [curated]);
  assert.deepEqual(searchObjects(index, 'Other'), [other]);
});
