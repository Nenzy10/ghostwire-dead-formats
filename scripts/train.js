'use strict';
// Train the tiny trigram model on data/corpus.txt -> model/weights.json
const fs = require('fs');
const path = require('path');
const { train } = require('../src/model');

const root = path.join(__dirname, '..');
const lines = fs.readFileSync(path.join(root, 'data', 'corpus.txt'), 'utf8')
  .split('\n').map((l) => l.trim()).filter(Boolean);
const weights = train(lines);
fs.writeFileSync(path.join(root, 'model', 'weights.json'), JSON.stringify(weights, null, 1) + '\n');
console.log(`Trained on ${lines.length} lines -> ${Object.keys(weights.transitions).length} trigram contexts written to model/weights.json`);
