# Crypto Kids 🐂🐻

A first-ever iPad game for a 3.5-year-old, teaching **one real trading instinct at a
time**, dumbed down from grown-up crypto concepts. Sound effects only, no reading, no
losing — just tap and stack coins.

**Play:** https://claude3cr.github.io/crypto-game-kids/
(On the iPad: Share → *Add to Home Screen* → it opens fullscreen like an app, works offline.)

## v1 — "Toro o Oso" (Bull or Bear?)
Something moves **up or down** (an arrow, a coin, a chart). He taps the 🐂 **bull** (up,
green) or the 🐻 **bear** (down, red).
- ✅ right → happy chime, confetti, a coin drops in the jar. Every 5 coins = ⭐.
- ❌ wrong → soft boop, gentle wobble, try again. **No score, no timer, no game over.**

This is the `creatorStance` (bullish/bearish) idea from
[`crypto-youtube`](https://github.com/claude3cr/crypto-youtube), toddler-sized.

## The growth path
Each new idea is a new **game** (home-screen card) or a new **scenario** inside a game.
Greyed-out 🔒 cards on the home screen show what's coming:

| Age | Concept | Lives as |
|----|---------|----------|
| ~4 (now) | direction: up vs down | game `bull-or-bear` |
| ~6–8 | **prepositioning** — catch the rocket *before* it launches | game `preposition` 🚀 |
| ~6–8 | **risk / warning flags** — when to be careful | game `risk` 🚦 |
| ~14 | real charts, spot opportunities, actual trading | future games |

## How it's built (so it's easy to extend)
No build step. Plain ES modules, served straight from GitHub Pages.

```
index.html            shell + iPad fullscreen meta
app.js                engine: wallet (coins/stars), home screen, game switching
audio.js              synthesized sound effects (no audio files)
js/games/index.js     the game registry  ← add games here
js/games/bull-or-bear.js  v1 game + its SCENARIOS list  ← add scenarios here
sw.js                 offline cache
```

**Add a scenario** to Bull or Bear: write a `(stage, direction) => cleanup` function in
`bull-or-bear.js` and push it into `SCENARIOS`. **Add a whole game:** make a module with
`{ id, title, icon, start(root, services), stop() }` and list it in `js/games/index.js`.
See `CLAUDE.md` for the full contract.
