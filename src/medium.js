'use strict';
/**
 * The Medium: TF-IDF retrieval over the spirit registry + remembrance
 * generation with the repo's own trigram model. Works in Node and,
 * via the UMD tail, in the browser demo (public/index.html).
 */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  root.GhostWire = api;
})(typeof self !== 'undefined' ? self : this, function () {
  // --- RNG (kept dependency-free so the browser demo needs no bundler) ---
  function mulberry32(seed) { let a = seed >>> 0; return function () { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
  function seedFromString(str) { let h = 2166136261; const s = String(str); for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
  function tokenize(text) { return String(text).toLowerCase().replace(/[^a-z0-9' ]/g, ' ').split(/\s+/).filter(Boolean); }

  const STOP = new Set(['the', 'a', 'an', 'of', 'for', 'and', 'or', 'to', 'in', 'on', 'was', 'is', 'it', 'its', 'i', 'my', 'me']);

  function spiritText(s) { return [s.name, s.kind, s.cause, s.ritual, ...(s.artifacts || [])].join(' '); }

  function buildIndex(spirits) {
    const docs = spirits.map((s) => tokenize(spiritText(s)).filter((w) => !STOP.has(w)));
    const df = {};
    docs.forEach((doc) => new Set(doc).forEach((w) => { df[w] = (df[w] || 0) + 1; }));
    return { spirits, docs, df, n: spirits.length };
  }

  function retrieve(index, query, k = 3) {
    const q = [...new Set(tokenize(query).filter((w) => !STOP.has(w)))];
    const scored = index.spirits.map((spirit, i) => {
      const doc = index.docs[i];
      const tf = {};
      doc.forEach((w) => { tf[w] = (tf[w] || 0) + 1; });
      let score = 0;
      for (const w of q) {
        if (!tf[w]) continue;
        const idf = Math.log(1 + index.n / (1 + (index.df[w] || 0)));
        score += (tf[w] / doc.length) * idf * 10;
        // A direct name / extension hit is the strongest omen.
        if (spirit.name.toLowerCase().includes(w) || spirit.id === w) score += 2;
      }
      return { spirit, score: Number(score.toFixed(4)) };
    }).filter((r) => r.score > 0).sort((a, b) => b.score - a.score);
    return scored.slice(0, k);
  }

  function generateFromWeights(weights, { seed = 1, maxWords = 28, prompt = '' } = {}) {
    const rand = mulberry32(seed);
    const pw = tokenize(prompt);
    let p2 = pw.length >= 2 ? pw[pw.length - 2] : '<s>';
    let p1 = pw.length >= 1 ? pw[pw.length - 1] : '<s>';
    const out = [];
    for (let i = 0; i < maxWords; i++) {
      const options = weights.transitions[p2 + ' ' + p1] || weights.transitions['<s> ' + p1] || weights.transitions['<s> <s>'];
      if (!options || !options.length) break;
      const next = options[Math.floor(rand() * options.length)];
      if (next === '</s>') break;
      out.push(next); p2 = p1; p1 = next;
    }
    return out.join(' ');
  }

  function hauntingScore(spirit, currentYear) {
    // 0..100: how long dead + how much of it survives only in memory.
    const yearsDead = Math.max(0, currentYear - spirit.died);
    return Math.min(100, Math.round(yearsDead * 3 + (spirit.artifacts ? spirit.artifacts.length * 4 : 0)));
  }

  function summon(index, weights, query, { currentYear = new Date().getFullYear() } = {}) {
    const hits = retrieve(index, query, 3);
    if (!hits.length) return { found: false, query, message: 'The terminal is silent. No spirit answers to that name — try `list`.' };
    const { spirit } = hits[0];
    const remembrance = generateFromWeights(weights, {
      seed: seedFromString(spirit.id + ':' + query),
      prompt: 'we remember',
      maxWords: 26,
    });
    return {
      found: true,
      spirit,
      yearsDead: Math.max(0, currentYear - spirit.died),
      hauntingScore: hauntingScore(spirit, currentYear),
      remembrance,
      alsoAnswered: hits.slice(1).map((h) => h.spirit.name),
    };
  }

  function formatCard(result) {
    if (!result.found) return result.message;
    const s = result.spirit;
    const lines = [
      '┌─ OFRENDA ─────────────────────────────────────────',
      `│ ${s.name}  (${s.born}–${s.died}, ${result.yearsDead} years gone)`,
      `│ Kind: ${s.kind} · Haunting score: ${result.hauntingScore}/100`,
      `│ Cause of death: ${s.cause}`,
      `│ Leave on the altar: ${s.ritual}`,
      `│ The medium speaks: “${result.remembrance}”`,
    ];
    if (result.alsoAnswered.length) lines.push(`│ Also answering faintly: ${result.alsoAnswered.join(', ')}`);
    lines.push('└───────────────────────────────────────────────────');
    return lines.join('\n');
  }

  return { tokenize, buildIndex, retrieve, generateFromWeights, hauntingScore, summon, formatCard, seedFromString };
});
