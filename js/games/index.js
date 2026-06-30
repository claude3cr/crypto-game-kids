// The game registry. Order here = order on the home screen.
// To add a game: create its module, import it, add it to the array.
// `locked:true` would show a greyed-out "coming soon" card.
import bullOrBear from './bull-or-bear.js';
import cohete from './cohete.js';
import cuidado from './cuidado.js';
import palabras from './palabras.js';
import sectores from './sectores.js';

// `requires` = ⭐ needed to unlock (earned: 1 star per 5 correct answers).
// First two are free; the rest unlock as he plays and earns stars.
export const GAMES = [
  { ...bullOrBear, requires: 0  },   // 1st — free
  { ...cohete,     requires: 0  },   // 2nd — free
  { ...cuidado,    requires: 2  },   // 3rd — 2 ⭐
  { ...palabras,   requires: 5  },   // 4th — 5 ⭐
  { ...sectores,   requires: 10 },   // 5th — 10 ⭐
];
