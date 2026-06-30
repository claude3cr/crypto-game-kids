// ============================================================================
// Bull or Bear?  — the one trading instinct: which way is it going, up or down?
//   Up   → 🐂 BULL / SUBE  (green)
//   Down → 🐻 BEAR / BAJA  (red)
//
// The loop never changes. Each round picks a SCENARIO — a different *way of
// showing direction*. Add one later = write a (stage, dir) => cleanup function
// and push it into SCENARIOS. Words (SUBE/BAJA, the question, praise) are shown
// everywhere so he reads while he plays.
// ============================================================================

// ---- scenarios (each must make UP vs DOWN unmistakable) --------------------

function arrowScenario(stage, dir){
  const scene = el('div', 'scene');
  const arrow = el('div', 'big-arrow ' + dir);
  arrow.textContent = dir === 'up' ? '⬆️' : '⬇️';
  scene.appendChild(arrow); stage.appendChild(scene);
  return () => scene.remove();
}

// coin RIDES a big colored arrow so the direction is obvious even mid-flight
function coinScenario(stage, dir){
  const scene = el('div', 'scene');
  const rider = el('div', 'rider ' + dir);
  rider.innerHTML = `<div class="r-arrow">${dir === 'up' ? '⬆️' : '⬇️'}</div><div class="r-coin">🪙</div>`;
  scene.appendChild(rider); stage.appendChild(scene);
  return () => scene.remove();
}

function chartScenario(stage, dir){
  const scene = el('div', 'scene');
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('class', 'chart');
  svg.setAttribute('viewBox', '0 0 400 240');
  svg.setAttribute('preserveAspectRatio', 'none');
  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  const d = dir === 'up'
    ? 'M20,210 L110,170 L190,180 L280,90 L380,30'
    : 'M20,30 L110,80 L190,70 L280,160 L380,210';
  path.setAttribute('d', d); path.setAttribute('class', dir);
  // an arrow head at the end of the line
  const head = el('div', 'chart-head ' + dir);
  head.textContent = dir === 'up' ? '⬆️' : '⬇️';
  svg.appendChild(path); scene.appendChild(svg); scene.appendChild(head);
  stage.appendChild(scene);
  return () => scene.remove();
}

const SCENARIOS = [arrowScenario, coinScenario, chartScenario];

// ---- game ------------------------------------------------------------------

let state = null;

function start(root, services){
  const t = services.i18n;
  root.innerHTML = `
    <div class="game">
      <div class="stage" id="bbStage">
        <div class="prompt">${t.t('bb_prompt')}</div>
      </div>
      <div class="choices">
        <button class="choice bull" data-dir="up" aria-label="up">
          <span class="ani">🐂</span><span class="word">${t.t('bb_up')}</span><span class="en">BULL</span>
        </button>
        <button class="choice bear" data-dir="down" aria-label="down">
          <span class="ani">🐻</span><span class="word">${t.t('bb_down')}</span><span class="en">BEAR</span>
        </button>
      </div>
    </div>`;

  const stage   = root.querySelector('#bbStage');
  const choices = [...root.querySelectorAll('.choice')];
  state = { stage, choices, services, cleanup:null, dir:null, locked:false, timer:null };

  choices.forEach(btn => btn.addEventListener('click', () => onChoose(btn)));
  newRound();
}

function newRound(){
  const s = state; if (!s) return;
  s.locked = false;
  if (s.cleanup){ s.cleanup(); s.cleanup = null; }
  s.choices.forEach(b => b.classList.remove('win', 'wrong'));
  stage_clearTransient(s.stage);

  s.dir = Math.random() < 0.5 ? 'up' : 'down';
  const scenario = SCENARIOS[(Math.random() * SCENARIOS.length) | 0];
  s.cleanup = scenario(s.stage, s.dir);
}

function onChoose(btn){
  const s = state; if (!s || s.locked) return;
  s.services.audio.unlock();
  if (btn.dataset.dir === s.dir){
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

function stop(){
  const s = state; if (!s) return;
  clearTimeout(s.timer);
  if (s.cleanup) s.cleanup();
  state = null;
}

// ---- helpers ---------------------------------------------------------------

function el(tag, cls){ const e = document.createElement(tag); if (cls) e.className = cls; return e; }
function stage_clearTransient(stage){ stage.querySelectorAll('.scene, .praise, .confetti').forEach(n => n.remove()); }

function praise(stage, text){
  const p = el('div', 'praise'); p.textContent = text;
  stage.appendChild(p); setTimeout(() => p.remove(), 1100);
}

function confetti(stage){
  const wrap = el('div', 'confetti');
  const bits = ['🎉','⭐','🪙','✨','🐂'];
  for (let i = 0; i < 14; i++){
    const c = document.createElement('span');
    c.textContent = bits[(Math.random()*bits.length)|0];
    c.style.left = (Math.random()*100) + '%';
    c.style.animationDelay = (Math.random()*0.25) + 's';
    wrap.appendChild(c);
  }
  stage.appendChild(wrap); setTimeout(() => wrap.remove(), 1300);
}

export default { id:'bull-or-bear', title:'Toro o Oso', icon:'🐂', start, stop };
