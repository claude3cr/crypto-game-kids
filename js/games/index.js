// The game registry. Order here = order on the home screen.
// To add a game: create its module, import it, add it to the array.
// `locked:true` would show a greyed-out "coming soon" card.
import bullOrBear from './bull-or-bear.js';
import cohete from './cohete.js';
import cuidado from './cuidado.js';
import palabras from './palabras.js';

export const GAMES = [
  bullOrBear,   // ~4: direction up/down (bullish/bearish)
  cohete,       // ~6-8: prepositioning — get in before the launch
  cuidado,      // ~6-8: risk / warning flags — good coin vs scam
  palabras,     // ~4: crypto word game — learn to read crypto words
];
