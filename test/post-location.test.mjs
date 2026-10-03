import test from 'node:test';
import assert from 'node:assert/strict';
import { parsePostLocation } from '../services/post-location.js';
test('optional location stays null; zero coordinates remain valid', () => {
  assert.deepEqual(parsePostLocation({}), {latitude:null,longitude:null});
  assert.deepEqual(parsePostLocation({latitude:0,longitude:0}), {latitude:0,longitude:0});
});
test('accepts coordinates from JSON and numeric strings', () => {
  assert.deepEqual(parsePostLocation({latitude:'16.0544',longitude:'108.2022'}), {latitude:16.0544,longitude:108.2022});
});
test('rejects partial, non numeric, boolean, array and whitespace input', () => {
  for(const body of [{latitude:16},{latitude:16,longitude:''},{latitude:'x',longitude:100},{latitude:true,longitude:100},{latitude:[],longitude:100},{latitude:' ',longitude:100}]) assert.throws(() => parsePostLocation(body));
});
test('rejects invalid range and infinity', () => {
  for(const body of [{latitude:91,longitude:100},{latitude:16,longitude:181},{latitude:Infinity,longitude:100}]) assert.throws(() => parsePostLocation(body));
});
