# GhostWire — a séance for dead file formats & forgotten internet tools

> *The ghost in the machine is the maker who came before.*

**GhostWire** is a haunted terminal that holds a Día de los Muertos **ofrenda for dead software**: file formats no player opens any more, and tools a generation grew up on — Flash, GeoCities, AIM, RealMedia, Vine, Gopher, Netscape, Encarta, and more. Name a format, a tool, or a memory, and GhostWire's medium answers with a remembrance card: its lifespan, its cause of death, what to leave on its altar, a haunting score — and a line of remembrance generated on the spot.

It is **not** an ofrenda for dead GitHub repos (a fine idea someone else shipped first this week) — this altar is for the *formats and tools themselves*, the layer underneath the repos.

## The open-source AI at its core

No API. No key. No download. GhostWire's intelligence is **a tiny trigram language model built from scratch in this repo**, plus TF-IDF retrieval — both running entirely locally:

- `scripts/train.js` trains the model on `data/corpus.txt` (30 original remembrance lines written for this project) and writes **`model/weights.json` — the project's own open weights**: 269 trigram contexts, small enough to read in an editor, MIT-licensed, reproducible byte-for-context by re-running the trainer (a test proves the committed weights match a fresh train).
- `src/medium.js` retrieves the right spirit with TF-IDF over the registry in `data/spirits.json` (18 spirits, each with born/died years, cause of death, surviving artifacts, and an altar ritual), then generates the remembrance line with the trigram model, seeded deterministically from the spirit + your query.
- The same `medium.js` runs in Node (CLI + demo server) and in the browser — one file, no bundler, no dependencies at all.

## Run it

```bash
npm test                                  # 9 tests, node:test, zero dependencies
node scripts/train.js                     # retrain the model -> model/weights.json
node src/cli.js list                      # the registry of the dead
node src/cli.js summon ".swf"             # an ofrenda card for Flash
node src/cli.js seance "my buddy list"    # AIM answers
node src/cli.js haunt                     # a random spirit pushes through
npm start                                 # web demo -> http://localhost:8788
```

Example:

```
┌─ OFRENDA ─────────────────────────────────────────
│ Adobe Flash (.swf)  (1996–2020, 6 years gone)
│ Kind: format · Haunting score: 30/100
│ Cause of death: The browser vendors withdrew the plugin and the open web grew up without it.
│ Leave on the altar: Leave a vector star and a loading bar that never quite finishes.
│ The medium speaks: "buffering as patience and patience as ritual"
└───────────────────────────────────────────────────
```

## Project layout

| Path | What it is |
|---|---|
| `data/spirits.json` | The registry of the dead — 18 formats & tools |
| `data/corpus.txt` | The remembrance corpus the model trains on |
| `model/weights.json` | The trained open weights (committed, reproducible) |
| `src/medium.js` | TF-IDF retrieval + generation (Node + browser, UMD) |
| `src/model.js` | The trigram language model (train + generate) |
| `src/cli.js` | The haunted terminal |
| `src/server.js` | Zero-dependency demo server + `/api/summon` |
| `public/index.html` | The web ofrenda |
| `test/medium.test.js` | 9 tests — retrieval, generation, honesty about unknown spirits |

## Challenge provenance

Built **from scratch inside the DEV Hacktoberfest AI Challenge Week 4 window (Oct 26–31, 2026)** — first commit 2026-10-27 (Asia/Dubai). No pre-existing project code is used; nothing here predates the window. Any commits after the Oct 31 deadline will be noted here as required by the challenge rules.

## License

MIT — the code, the corpus, and the model weights. Take the weights; teach your own machine a ghost.
