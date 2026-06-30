// ============================================================================
// Cuidado 🚦 — RISK / WARNING FLAGS, toddler-sized.
// The grown-up idea (from crypto-youtube: sponsored / warning / scam flags):
// "some coins are good, some are dangerous — be careful."
//
// One coin appears: GOOD (shiny, ✅, happy) or BAD (red, ⚠️, scary, shaking).
//   GOOD → tap SÍ ✅ (green, left)
//   BAD  → tap NO 🛑 (red, right)
// Right judgment → coin + praise. Wrong → soft boop + wobble + try again.
// No fail. Words: BUENO / MALO / SÍ / NO / CUIDADO so he reads.
// ============================================================================

const GOOD = ['🪙','💎','🟡'];
const BAD  = ['⚠️','💀','🦂'];
let state = null;

function start(root, services){
  const t = services.i18n;
  root.innerHTML = `
    <div class="game cuidado">
      <div class="stage" id="cdStage">
        <div class="prompt">${t.t('cd_prompt')}</div>
        <div class="item" id="cdItem"></div>
      </div>
      <div class="choices">
        <button class="choice safe"   data-pick="good" aria-label="good">
          <span class="ani">✅</span><span class="word">${t.t('cd_yes')}</span><span class="en">SAFE</span>
        </button>
        <button class="choice danger" data-pick="bad" aria-label="bad">
          <span class="ani">🛑</span><span class="word">${t.t('cd_no')}</span><span class="en">SCAM</span>
        </button>
      </div>
    </div>`;

  const stage   = root.querySelector('#cdStage');
  const item    = root.querySelector('#cdItem');
  const choices = [...root.querySelectorAll('.choice')];
  state = { stage, item, choices, services, kind:null, locked:false, timer:null };

  choices.forEach(b => b.addEventListener('click', () => onChoose(b)));
  newRound();
}

function newRound(){
  const s = state; if (!s) return;
  s.locked = false;
  s.choices.forEach(b => b.classList.remove('win','wrong'));
  s.stage.querySelectorAll('.praise, .confetti').forEach(n => n.remove());

  s.kind = Math.random() < 0.5 ? 'good' : 'bad';
  s.item.className = 'item ' + s.kind;
  if (s.kind === 'good'){
    s.item.innerHTML = `<span class="face">${GOOD[(Math.random()*GOOD.length)|0]}</span><span class="badge">✅</span>`;
  } else {
    s.item.innerHTML = `<span class="face">${BAD[(Math.random()*BAD.length)|0]}</span><span class="badge">⚠️</span>`;
  }
}

function onChoose(btn){
  const s = state; if (!s || s.locked) return;
  s.services.audio.unlock();
  if (btn.dataset.pick === s.kind){
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
  const wrap = el('div','confetti'); const bits=['🎉','⭐','🪙','✨','💎'];
  for(let i=0;i<14;i++){ const c=document.createElement('span'); c.textContent=bits[(Math.random()*bits.length)|0]; c.style.left=(Math.random()*100)+'%'; c.style.animationDelay=(Math.random()*0.25)+'s'; wrap.appendChild(c);}
  stage.appendChild(wrap); setTimeout(()=>wrap.remove(),1300);
}

export default { id:'cuidado', title:'Cuidado', icon:'🚦', start, stop };
