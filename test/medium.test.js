'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const { buildIndex, retrieve, summon, hauntingScore, tokenize } = require('../src/medium');
const { train, generate } = require('../src/model');

const root = path.join(__dirname, '..');
const spirits = JSON.parse(fs.readFileSync(path.join(root, 'data', 'spirits.json'), 'utf8'));
const weights = JSON.parse(fs.readFileSync(path.join(root, 'model', 'weights.json'), 'utf8'));
const corpus = fs.readFileSync(path.join(root, 'data', 'corpus.txt'), 'utf8').split('\n').filter(Boolean);
const index = buildIndex(spirits);

test('registry holds at least 15 spirits, each fully mourned', () => {
  assert.ok(spirits.length >= 15);
  for (const s of spirits) {
    assert.ok(s.id && s.name && s.kind && s.cause && s.ritual);
    assert.ok(Number.isInteger(s.born) && Number.isInteger(s.died) && s.died >= s.born);
    assert.ok(Array.isArray(s.artifacts) && s.artifacts.length >= 2);
  }
});

test('tokenize normalises case and punctuation', () => {
  assert.deepEqual(tokenize('Flash, .SWF!'), ['flash', 'swf']);
});

test('retrieval finds Flash for an extension query', () => {
  const hits = retrieve(index, '.swf cartoons');
  assert.ok(hits.length >= 1);
  assert.equal(hits[0].spirit.id, 'swf');
});

test('retrieval finds GeoCities for a neighbourhood memory', () => {
  const hits = retrieve(index, 'guestbook visitor counters homepage neighbourhoods');
  assert.equal(hits[0].spirit.id, 'geocities');
});

test('summon returns a complete ofrenda card', () => {
  const r = summon(index, weights, 'vine loops', { currentYear: 2026 });
  assert.equal(r.found, true);
  assert.equal(r.spirit.id, 'vine');
  assert.equal(r.yearsDead, 9);
  assert.ok(r.remembrance.length > 0);
  assert.ok(r.hauntingScore > 0 && r.hauntingScore <= 100);
});

test('summon is honest about unknown spirits', () => {
  const r = summon(index, weights, 'zzzzqqqq nonexistentthing');
  assert.equal(r.found, false);
});

test('haunting score grows with years dead and is capped', () => {
  const old = hauntingScore({ died: 1999, artifacts: ['a', 'b', 'c'] }, 2026);
  const recent = hauntingScore({ died: 2022, artifacts: ['a'] }, 2026);
  assert.ok(old > recent && old <= 100);
});

test('the in-repo trigram model trains and generates deterministically', () => {
  const m = train(corpus);
  assert.equal(m.format, 'ghostwire-trigram-v1');
  assert.ok(Object.keys(m.transitions).length > 20);
  const a = generate(m, { seed: 42, prompt: 'we remember' });
  const b = generate(m, { seed: 42, prompt: 'we remember' });
  assert.equal(a, b);
  assert.ok(a.length > 0);
});

test('committed weights match a fresh train on the committed corpus', () => {
  const fresh = train(corpus);
  assert.equal(weights.trainedOn, fresh.trainedOn);
  assert.equal(Object.keys(weights.transitions).length, Object.keys(fresh.transitions).length);
});
