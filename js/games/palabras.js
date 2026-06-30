// ============================================================================
// Palabras 🔤 — a crypto WORD game (learn to read crypto words).
// A picture appears; two word buttons below. Tap the word that matches the
// picture. Big word in his chosen language + the gold English crypto word, so
// he learns letters AND the real crypto vocabulary at the same time.
// No fail: wrong = soft boop + wobble + try again.
// ============================================================================

const WORDS = [
  { emoji:'🪙', es:'MONEDA',   en:'COIN',    nl:'MUNT',    pl:'MONETA'   },
  { emoji:'🐂', es:'TORO',     en:'BULL',    nl:'STIER',   pl:'BYK'      },
  { emoji:'🐻', es:'OSO',      en:'BEAR',    nl:'BEER',    pl:'BANIA'    },
  { emoji:'🚀', es:'COHETE',   en:'ROCKET',  nl:'RAKET',   pl:'RAKIETA'  },
  { emoji:'💎', es:'DIAMANTE', en:'DIAMOND', nl:'DIAMANT', pl:'DIAMENT'  },
  { emoji:'💰', es:'DINERO',   en:'MONEY',   nl:'GELD',    pl:'KASA'     },
  { emoji:'📈', es:'GRÁFICO',  en:'CHART',   nl:'GRAFIEK', pl:'WYKRES'   },
  { emoji:'⭐', es:'ESTRELLA', en:'STAR',    nl:'STER',    pl:'GWIAZDA'  },
];

let state = null;

function start(root, services){
  const t = services.i18n;
  root.innerHTML = `
    <div class="game palabras">
      <div class="stage" id="wgStage">
        <div class="prompt">${t.t('wg_prompt')}</div>
        <div class="wg-pic" id="wgPic"></div>
      </div>
      <div class="choices" id="wgChoices"></div>
    </div>`;

  const stage   = root.querySelector('#wgStage');
  const pic     = root.querySelector('#wgPic');
  const choices = root.querySelector('#wgChoices');
  state = { stage, pic, choices, services, target:null, locked:false, timer:null };
  newRound();
}

function pick(n, exclude){
  // pick n distinct words, none in `exclude`
  const pool = WORDS.filter(w => !exclude.includes(w));
  const out = [];
  while (out.length < n && pool.length){
    out.push(pool.splice((Math.random()*pool.length)|0, 1)[0]);
  }
  return out;
}

function newRound(){
  const s = state; if (!s) return;
  const lang = s.services.i18n.lang;
  s.locked = false;
  s.stage.querySelectorAll('.praise, .confetti').forEach(n => n.remove());

  const [target] = pick(1, []);
  const [distract] = pick(1, [target]);
  s.target = target;
  s.pic.textContent = target.emoji;

  // two buttons: correct + distractor, in random order
  const opts = Math.random() < 0.5 ? [target, distract] : [distract, target];
  s.choices.innerHTML = opts.map((w, i) => {
    const correct = w === target ? '1' : '0';
    const en = (lang === 'en') ? '' : `<span class="en">${w.en}</span>`;   // avoid showing the word twice
    return `<button class="choice word-btn w${i+1}" data-correct="${correct}">
      <span class="big-word">${w[lang]}</span>${en}
    </button>`;
  }).join('');

  [...s.choices.querySelectorAll('.choice')].forEach(b => b.addEventListener('click', () => onChoose(b)));
}

function onChoose(btn){
  const s = state; if (!s || s.locked) return;
  s.services.audio.unlock();
  if (btn.dataset.correct === '1'){
    s.locked = true;
    s.services.audio.good();
    btn.classList.add('win');
    s.services.reward(btn);
    praise(s.stage, s.services.i18n.praise());
    confetti(s.stage);
    s.timer = setTimeout(newRound, 1100);
  } else {
    s.services.audio.bad();
    btn.classList.remove('wrong'); void btn.offsetWidth; btn.classList.add('wrong');
  }
}

function stop(){ const s = state; if (!s) return; clearTimeout(s.timer); state = null; }

function el(tag, cls){ const e = document.createElement(tag); if (cls) e.className = cls; return e; }
function praise(stage, text){ const p = el('div','praise'); p.textContent = text; stage.appendChild(p); setTimeout(()=>p.remove(),1100); }
function confetti(stage){
  const wrap = el('div','confetti'); const bits=['🎉','⭐','🪙','✨','🔤'];
  for(let i=0;i<14;i++){ const c=document.createElement('span'); c.textContent=bits[(Math.random()*bits.length)|0]; c.style.left=(Math.random()*100)+'%'; c.style.animationDelay=(Math.random()*0.25)+'s'; wrap.appendChild(c);}
  stage.appendChild(wrap); setTimeout(()=>wrap.remove(),1300);
}

export default { id:'palabras', title:'Palabras', icon:'🔤', start, stop };
