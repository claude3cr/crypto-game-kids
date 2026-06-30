# CLAUDE.md — crypto-kids (canonical context)

Read this first. Durable source of truth so a fresh session can continue.

## What it is
A fullscreen iPad web game teaching a ~3.5-year-old **one real trading instinct at a time**,
dumbed down from grown-up crypto. Public repo, GitHub Pages, no backend, no build step.
- Live: https://claude3cr.github.io/crypto-kids/
- Local: `~/crypto-kids`. Remote: `claude3cr/crypto-kids` (Pages = branch `main`, folder `/` root).
- Sessions run from `~/.claude3`; `cd "$HOME/crypto-kids"` for commands.
- Sibling project it borrows concepts from: `~/crypto-youtube` (the private digest).

## Core decisions (locked — don't relitigate)
- **Audience**: one almost-4-year-old, mostly Spanish, now learning letters/words.
- **Sound effects** synthesized via Web Audio (`audio.js`), no audio files, no voice/narration.
- **Words ARE shown** (he's learning to read): **Spanish primary** (SUBE/BAJA, SÍ/NO, the
  `¿…?` prompt, praise like ¡MUY BIEN!) + a **gold English crypto term** (BULL/BEAR, SAFE/
  SCAM, BUY EARLY) so he picks up real crypto lingo. One language toggle is a future option.
- **No fail state**: right = chime + confetti + coin; wrong = soft boop + wobble + retry.
  No score shown, no timer, no game-over. Goal at this age = keep tapping, stay happy.
- **Reward economy**: correct answer → 1 coin (flies to jar); every 5 coins → 1 ⭐.
  Lifetime totals persist in `localStorage` (`crypto-kids.wallet.v1`).
- **Big touch targets**: bull/bear fill the bottom ~42% of the screen; consistent positions
  (bull left/up/green, bear right/down/red) to aid first-time learning.
- **No build step, no framework, no external libs.** Plain ES modules served by Pages.
- **One game per concept; one scenario per *way of showing* a concept.** Grow by adding
  scenarios/games, never by adding difficulty curves or pressure.
- **iPad app feel**: `manifest.webmanifest` + apple meta = Add to Home Screen, fullscreen.
  `sw.js` caches the shell for offline play.

## Mapping to grown-up crypto (`crypto-youtube`) — 3 games live
- `bull-or-bear` 🐂/🐻 = the `creatorStance` field (bullish/bearish), direction up/down.
- `cohete` 🚀 = prepositioning: getting into an `upcoming` project / token sale *before* launch.
- `cuidado` 🚦 = the conflict/warning flags (sponsored, disclosedHolding, `warning` stance).
- Next (~14): real charts, spot opportunities, actual trading — new games/scenarios.

## Architecture
```
index.html              shell; iPad fullscreen meta; loads app.js (module)
app.js                  ENGINE — wallet, top bar, home grid, start/stop a game
audio.js                synthesized SFX: good/bad/coin/star (+ unlock() on first tap)
js/games/index.js       GAME REGISTRY (order = home order; `locked:true` = coming-soon card)
js/games/bull-or-bear.js  direction up/down + SCENARIOS list (arrow/coin-rides-arrow/chart)
js/games/cohete.js      prepositioning — tap rocket before the fuel bar fills (no fail)
js/games/cuidado.js     risk — good coin vs scam (✅/⚠️), tap SÍ/NO
sw.js                   offline cache (bump CACHE + ?v= on shell changes)
icon.svg, manifest.webmanifest, .nojekyll
```

### Game contract
A game is an object:
```js
export default {
  id: 'my-game', title:'Nombre', icon:'🎮',
  start(root, services){ /* render into `root` (#screen); begin */ },
  stop(){ /* clear timers, listeners, DOM */ },
};
```
`services` = `{ audio, reward(fromEl) }`.
- `audio.good() / bad() / coin() / star() / unlock()` — call `unlock()` on the first tap (iOS).
- `reward(fromEl)` — call on a **correct** answer; engine adds the coin, handles the star,
  animates a coin flying from `fromEl` to the jar, and persists. The game still plays its
  own `audio.good()` and visual celebration.
The engine renders the top bar (home + wallet); the game owns everything in `#screen`.

### Scenario contract (inside bull-or-bear)
`(stage, direction) => cleanupFn`, where `direction` is `'up'|'down'` (the correct answer)
and `stage` is the drawing area. Push new ones into `SCENARIOS`. Current: arrow, coin, chart.

## Adding things
- **New scenario** (another way to show up/down): add a function to `bull-or-bear.js`,
  push into `SCENARIOS`. Style hooks live in `style.css` under "Scenario visuals".
- **New game**: new module in `js/games/`, import + add to `js/games/index.js`. Flip the
  matching `locked` placeholder card to the real module.
- After editing a shell file, **bump `?v=N`** in `index.html` (and the SHELL list + `CACHE`
  in `sw.js`) so the iPad doesn't serve stale cached assets.

## Deploy
```
cd "$HOME/crypto-kids"
git add -A && git commit -m "..."
git push                      # remote MUST be the SSH alias github-proton (claude3cr acct)
```
Push remote MUST be `git@github-proton:claude3cr/crypto-kids.git` (plain github.com = wrong
account). Pages auto-deploys from `main` (root). See `~/.claude3` memory `[[github-ssh-aliases]]`.

## Gotchas
- ES modules + service worker need **https** — they work on Pages but NOT via `file://`.
  To test locally run a static server (`python3 -m http.server` in the repo) and open the URL.
- `.nojekyll` is required so Pages serves everything as-is.
- iOS only allows audio to start from a user gesture → `Audio.unlock()` runs on first tap.
