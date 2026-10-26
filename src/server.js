'use strict';
// Zero-dependency demo server: serves the haunted-terminal web demo and a
// tiny JSON API. Run: npm start  ->  http://localhost:8788
const http = require('http');
const fs = require('fs');
const path = require('path');
const { buildIndex, summon, formatCard } = require('./medium');

const root = path.join(__dirname, '..');
const spirits = JSON.parse(fs.readFileSync(path.join(root, 'data', 'spirits.json'), 'utf8'));
const weights = JSON.parse(fs.readFileSync(path.join(root, 'model', 'weights.json'), 'utf8'));
const index = buildIndex(spirits);
const PORT = process.env.PORT || 8788;

const server = http.createServer((req, res) => {
  const url = new URL(req.url, 'http://localhost');
  if (url.pathname === '/api/summon') {
    const q = url.searchParams.get('q') || '';
    const result = summon(index, weights, q);
    res.writeHead(200, { 'content-type': 'application/json' });
    return res.end(JSON.stringify({ ...result, card: formatCard(result) }, null, 2));
  }
  if (url.pathname === '/api/spirits') {
    res.writeHead(200, { 'content-type': 'application/json' });
    return res.end(JSON.stringify(spirits));
  }
  const file = url.pathname === '/' ? 'index.html' : url.pathname.slice(1);
  const safe = path.normalize(file).replace(/^(\.\.[/\\])+/, '');
  const full = path.join(root, 'public', safe);
  if (!full.startsWith(path.join(root, 'public')) || !fs.existsSync(full)) {
    res.writeHead(404); return res.end('not found');
  }
  const type = full.endsWith('.html') ? 'text/html' : full.endsWith('.js') ? 'text/javascript' : 'text/plain';
  res.writeHead(200, { 'content-type': type });
  return res.end(fs.readFileSync(full));
});

if (require.main === module) {
  server.listen(PORT, () => console.log(`GhostWire demo on http://localhost:${PORT}`));
}
module.exports = server;
