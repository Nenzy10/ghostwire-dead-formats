'use strict';
/**
 * A tiny trigram language model, implemented from scratch in this repo.
 * Training reads data/corpus.txt and produces model/weights.json — the
 * project's own open weights: small enough to read, free to reuse (MIT),
 * and they run entirely locally. No API, no key, no download.
 */
const { mulberry32 } = require('./rng');

const START = '<s>';

function tokenize(text) {
  return String(text).toLowerCase().replace(/[^a-z0-9' ]/g, ' ').split(/\s+/).filter(Boolean);
}

function train(lines) {
  const transitions = {};
  for (const line of lines) {
    const words = [START, START, ...tokenize(line), '</s>'];
    for (let i = 2; i < words.length; i++) {
      const key = words[i - 2] + ' ' + words[i - 1];
      (transitions[key] ||= []).push(words[i]);
    }
  }
  return { format: 'ghostwire-trigram-v1', trainedOn: lines.length, transitions };
}

function generate(model, { seed = 1, maxWords = 28, prompt = '' } = {}) {
  const rand = mulberry32(seed);
  const promptWords = tokenize(prompt);
  let prev2 = promptWords.length >= 2 ? promptWords[promptWords.length - 2] : START;
  let prev1 = promptWords.length >= 1 ? promptWords[promptWords.length - 1] : START;
  const out = [];
  for (let i = 0; i < maxWords; i++) {
    const options = model.transitions[prev2 + ' ' + prev1]
      || model.transitions[START + ' ' + prev1]
      || model.transitions[START + ' ' + START];
    if (!options || !options.length) break;
    const next = options[Math.floor(rand() * options.length)];
    if (next === '</s>') break;
    out.push(next);
    prev2 = prev1; prev1 = next;
  }
  return out.join(' ');
}

module.exports = { tokenize, train, generate, START };
