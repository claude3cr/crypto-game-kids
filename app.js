// ============================================================================
// Crypto Kids — engine
// ----------------------------------------------------------------------------
// The engine owns the durable, cross-game stuff:
//   • the "wallet" (lifetime coins + stars, saved in localStorage)
//   • the top bar (home button + jar/stars display)
//   • the home screen (a grid of game cards)
//   • starting / stopping games
//
// A GAME is just an object: { id, title, icon, locked?, start(root, services), stop() }.
// A game owns everything inside #screen while it runs. It talks back to the
// engine only through `services` (see makeServices). To add a new game later,
// write a module and list it in games/index.js — nothing here needs to change.
// ============================================================================
import { Audio } from './audio.js';
import { GAMES } from './js/games/index.js';
import { i18n } from './translations.js';

const NAME = 'Ignacio';                 // who's playing — shown on the home screen
const STORE_KEY = 'crypto-kids.wallet.v1';

// ---------- wallet (coins → every 5 = a star) ----------
const wallet = {
  coins: 0, stars: 0,
  load(){
    try { const s = JSON.parse(localStorage.getItem(STORE_KEY)); if (s){ this.coins = s.coins|0; this.stars = s.stars|0; } } catch {}
    this.render();
  },
  save(){ try { localStorage.setItem(STORE_KEY, JSON.stringify({coins:this.coins, stars:this.stars})); } catch {} },
  render(){
    const c = document.getElementById('coinCount'), s = document.getElementById('starCount');
    if (c) c.textContent = this.coins; if (s) s.textContent = this.stars;
  },
  // Called by a game on a correct answer. Adds a coin, fires the star reward
  // every 5th coin, animates, and persists. `fromEl` = where the coin flies from.
  reward(fromEl){
    this.coins++;
    Audio.coin();
    bump('coinCount');
    flyCoin(fromEl);
    if (this.coins % 5 === 0){ this.stars++; Audio.star(); bump('starCount'); }
    this.render(); this.save();
  },
};

function bump(id){ const el = document.getElementById(id); if(!el) return; el.classList.remove('bump'); void el.offsetWidth; el.classList.add('bump'); }

// a coin emoji flies from the tapped choice toward the jar
function flyCoin(fromEl){
  const jar = document.querySelector('.wallet .jar');
  if (!fromEl || !jar) return;
  const a = fromEl.getBoundingClientRect(), b = jar.getBoundingClientRect();
  const coin = document.createElement('div');
  coin.className = 'flycoin'; coin.textContent = '🪙';
  coin.style.left = (a.left + a.width/2 - 21) + 'px';
  coin.style.top  = (a.top + a.height/2 - 21) + 'px';
  document.body.appendChild(coin);
  requestAnimationFrame(() => {
    coin.style.transform = `translate(${b.left + b.width/2 - (a.left+a.width/2)}px, ${b.top + b.height/2 - (a.top+a.height/2)}px) scale(.4)`;
    coin.style.opacity = '0';
  });
  setTimeout(() => coin.remove(), 650);
}

// ---------- navigation ----------
const screen = document.getElementById('screen');
const homeBtn = document.getElementById('homeBtn');
let active = null;   // currently running game

function makeServices(){
  return {
    audio: Audio,
    i18n,                                        // games read their words/praise from here
    reward: (fromEl) => wallet.reward(fromEl),   // correct answer → coin
  };
}

function showHome(){
  if (active){ try { active.stop(); } catch {} active = null; }
  homeBtn.hidden = true;
  screen.innerHTML = '';
  const home = document.createElement('div');
  home.className = 'home';
  home.innerHTML = `
    <div class="home-brand">📈 Learning Crypto</div>
    <div class="home-title">${NAME}, ${i18n.t('tapGame')} 👇</div>`;
  GAMES.forEach(g => {
    const card = document.createElement('button');
    card.className = 'game-card' + (g.locked ? ' locked' : '');
    card.innerHTML = `<span class="ico">${g.icon}</span><span class="label">${i18n.title(g.id)}</span>`;
    if (!g.locked) card.addEventListener('click', () => startGame(g));
    home.appendChild(card);
  });
  screen.appendChild(home);
}

function startGame(g){
  Audio.unlock();
  if (active){ try { active.stop(); } catch {} }
  screen.innerHTML = '';
  active = g;
  homeBtn.hidden = false;
  g.start(screen, makeServices());
}

homeBtn.addEventListener('click', () => { Audio.unlock(); showHome(); });

// ---------- language toggle (cycles 🇪🇸 → 🇬🇧 → 🇳🇱 → 🇵🇱) ----------
const langBtn = document.getElementById('langBtn');
langBtn.addEventListener('click', () => { Audio.unlock(); i18n.next(); });
i18n.onChange(() => {
  langBtn.textContent = i18n.flag();
  if (active) startGame(active);   // rebuild the running game in the new language
  else showHome();                 // re-render home (greeting + card titles)
});

// ---------- boot ----------
wallet.load();
i18n.load();
langBtn.textContent = i18n.flag();
showHome();

// Offline support for "Add to Home Screen". Best-effort; harmless if it fails.
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => navigator.serviceWorker.register('./sw.js').catch(()=>{}));
}
