#!/usr/bin/env node
'use strict';
// GhostWire CLI — a haunted terminal for dead formats and forgotten tools.
// Usage:
//   node src/cli.js list
//   node src/cli.js summon ".swf"
//   node src/cli.js seance "I miss my buddy list"
//   node src/cli.js haunt            (a random spirit answers)
const fs = require('fs');
const path = require('path');
const { buildIndex, summon, formatCard, seedFromString } = require('./medium');
const { mulberry32 } = require('./rng');

const root = path.join(__dirname, '..');
const spirits = JSON.parse(fs.readFileSync(path.join(root, 'data', 'spirits.json'), 'utf8'));
const weights = JSON.parse(fs.readFileSync(path.join(root, 'model', 'weights.json'), 'utf8'));
const index = buildIndex(spirits);

const [cmd, ...rest] = process.argv.slice(2);
const arg = rest.join(' ').trim();

if (cmd === 'list') {
  for (const s of spirits) console.log(`${s.born}–${s.died}  ${s.name} (${s.kind})`);
  console.log(`\n${spirits.length} spirits in the registry.`);
} else if (cmd === 'summon' || cmd === 'seance') {
  if (!arg) { console.error(`Usage: node src/cli.js ${cmd} "<name or memory>"`); process.exit(2); }
  console.log(formatCard(summon(index, weights, arg)));
} else if (cmd === 'haunt') {
  const rand = mulberry32(seedFromString('haunt:' + new Date().toDateString()));
  const s = spirits[Math.floor(rand() * spirits.length)];
  console.log('A spirit pushes through uninvited…\n');
  console.log(formatCard(summon(index, weights, s.id)));
} else {
  console.log('GhostWire — séance for dead file formats & forgotten tools');
  console.log('Commands: list | summon "<query>" | seance "<memory>" | haunt');
}
