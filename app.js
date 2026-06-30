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
import { i18n, LANGS } from './translations.js';

const NAME = 'Ignacio';                 // who's playing — shown on the home screen
const STORE_KEY = 'crypto-kids.wallet.v1';

// games whose "just unlocked!" celebration has already played (persisted, so it
// only pulses the first time the child reaches the star threshold)
const UNLOCK_KEY = 'crypto-kids.announced.v1';
const announced = new Set((() => { try { return JSON.parse(localStorage.getItem(UNLOCK_KEY)) || []; } catch { return []; } })());
function announceUnlock(id){ announced.add(id); try { localStorage.setItem(UNLOCK_KEY, JSON.stringify([...announced])); } catch {} }

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
    <div class="home-header">
      <div class="home-brand">📈 Learning Crypto</div>
      <div class="home-title"><button class="name-btn" id="nameBtn">${NAME}</button>, ${i18n.t('tapGame')} 👇</div>
    </div>
    <div class="home-cards" id="homeCards"></div>`;
  const cards = home.querySelector('#homeCards');
  GAMES.forEach(g => {
    const need = g.requires || 0;
    const unlocked = wallet.stars >= need;
    const justUnlocked = unlocked && need > 0 && !announced.has(g.id);
    const card = document.createElement('button');
    card.className = 'game-card' + (unlocked ? '' : ' locked') + (justUnlocked ? ' justunlocked' : '');
    const badge = unlocked ? '' : `<span class="req">🔒 ${need}⭐</span>`;
    card.innerHTML = `<span class="ico">${g.icon}</span><span class="label">${i18n.title(g.id)}</span>${badge}`;
    if (unlocked){
      card.addEventListener('click', () => startGame(g));
      if (justUnlocked){ announceUnlock(g.id); }   // celebrate first time it opens
    } else {
      // locked: gentle "not yet" — boop + shake, no navigation
      card.addEventListener('click', () => {
        Audio.unlock(); Audio.bad();
        card.classList.remove('shake'); void card.offsetWidth; card.classList.add('shake');
      });
    }
    cards.appendChild(card);
  });
  screen.appendChild(home);
  if ([...cards.querySelectorAll('.justunlocked')].length) Audio.star();

  // Ignacio's name is tappable too — a little personalized celebration
  home.querySelector('#nameBtn').addEventListener('click', (e) => {
    e.stopPropagation();
    Audio.unlock(); Audio.star();
    bump('nameBtn'); nameSparkle(e.currentTarget);
  });
}

// a burst of sparkles from Ignacio's name
function nameSparkle(anchor){
  const r = anchor.getBoundingClientRect();
  const bits = ['⭐','✨','🎉','🪙','💫'];
  for (let i = 0; i < 12; i++){
    const s = document.createElement('div');
    s.className = 'flycoin'; s.textContent = bits[(Math.random()*bits.length)|0];
    s.style.left = (r.left + r.width/2 - 16) + 'px';
    s.style.top  = (r.top + r.height/2 - 16) + 'px';
    document.body.appendChild(s);
    const ang = Math.random()*Math.PI*2, dist = 60 + Math.random()*120;
    requestAnimationFrame(() => {
      s.style.transform = `translate(${Math.cos(ang)*dist}px, ${Math.sin(ang)*dist + 40}px) rotate(${(Math.random()*360)|0}deg)`;
      s.style.opacity = '0';
    });
    setTimeout(() => s.remove(), 700);
  }
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

// ---------- language bar (all 4 flags always visible; tap to pick) ----------
const langBar = document.getElementById('langBar');
function renderLangBar(){
  langBar.innerHTML = '';
  LANGS.forEach(l => {
    const b = document.createElement('button');
    b.className = 'flag' + (l.code === i18n.lang ? ' active' : '');
    b.textContent = l.flag;
    b.setAttribute('aria-label', l.code);
    b.setAttribute('aria-pressed', l.code === i18n.lang ? 'true' : 'false');
    b.addEventListener('click', () => { Audio.unlock(); i18n.set(l.code); });
    langBar.appendChild(b);
  });
}
i18n.onChange(() => {
  document.documentElement.lang = i18n.lang;   // keep <html lang> honest for VoiceOver
  renderLangBar();
  if (active) startGame(active);   // rebuild the running game in the new language
  else showHome();                 // re-render home (greeting + card titles)
});

// ---------- hidden parent gesture: long-press the wallet to reset coins/stars ----------
(function setupWalletReset(){
  const w = document.getElementById('wallet');
  let timer = null;
  const start = () => { timer = setTimeout(() => {
    wallet.coins = 0; wallet.stars = 0; wallet.render(); wallet.save();
    Audio.unlock(); Audio.star(); bump('coinCount'); bump('starCount');
  }, 1500); };
  const cancel = () => { clearTimeout(timer); };
  w.addEventListener('pointerdown', start);
  ['pointerup','pointerleave','pointercancel'].forEach(ev => w.addEventListener(ev, cancel));
})();

// ---------- boot ----------
wallet.load();
i18n.load();
document.documentElement.lang = i18n.lang;
renderLangBar();
showHome();

// Offline support for "Add to Home Screen". Best-effort; harmless if it fails.
// When a new version deploys, the fresh service worker activates and takes
// control → reload once so the installed app picks up the update automatically
// (otherwise the home-screen app can keep serving the old cached build).
if ('serviceWorker' in navigator) {
  let refreshing = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (refreshing) return; refreshing = true; location.reload();
  });
  window.addEventListener('load', () => navigator.serviceWorker.register('./sw.js').catch(()=>{}));
}
