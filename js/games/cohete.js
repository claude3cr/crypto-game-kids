// ============================================================================
// Cohete 🚀 — PREPOSITIONING, toddler-sized.
// The grown-up idea (from crypto-youtube: getting into an `upcoming` project
// BEFORE it launches): "buy early, before the rocket takes off."
//
// A rocket sits on the pad while a fuel bar fills. TAP THE ROCKET before it
// launches → you got in early, you ride it up, coin. If it launches first →
// "¡CASI!" it leaves without you (no coin, no punishment), then resets.
// Lesson: be early. Words + praise everywhere so he reads.
// ============================================================================

let state = null;

function start(root, services){
  const t = services.i18n;
  root.innerHTML = `
    <div class="game cohete">
      <div class="stage" id="ckStage">
        <div class="prompt">${t.t('ck_prompt')}<span class="en">BUY EARLY!</span></div>
        <button class="rocket" id="ckRocket" aria-label="Cohete">🚀</button>
        <div class="pad"></div>
        <div class="fuel"><div class="fuel-bar" id="ckFuel"></div></div>
      </div>
    </div>`;

  const stage  = root.querySelector('#ckStage');
  const rocket = root.querySelector('#ckRocket');
  const fuel   = root.querySelector('#ckFuel');
  state = { stage, rocket, fuel, services, launchTimer:null, nextTimer:null, locked:false };

  rocket.addEventListener('click', onTap);
  newRound();
}

function newRound(){
  const s = state; if (!s) return;
  s.locked = false;
  s.stage.querySelectorAll('.praise, .confetti').forEach(n => n.remove());
  s.rocket.className = 'rocket';                 // reset to pad
  s.rocket.textContent = '🚀';

  // fuel bar fills over a random window (3.0–4.5s — gentle for a 4yo); when full → auto-launch
  const window = 3000 + Math.random() * 1500;
  s.fuel.style.transition = 'none';
  s.fuel.style.width = '0%';
  void s.fuel.offsetWidth;
  s.fuel.style.transition = `width ${window}ms linear`;
  s.fuel.style.width = '100%';

  s.launchTimer = setTimeout(() => launchWithout(), window);
}

function onTap(){
  const s = state; if (!s || s.locked) return;
  s.locked = true;
  clearTimeout(s.launchTimer);
  s.services.audio.unlock();
  s.services.audio.good();
  s.fuel.style.transition = 'none';
  s.rocket.classList.add('ride');               // rides up with a happy face
  s.rocket.textContent = '🚀';
  s.services.reward(s.rocket);
  praise(s.stage, s.services.i18n.praise());
  confetti(s.stage);
  s.nextTimer = setTimeout(newRound, 1300);
}

function launchWithout(){
  const s = state; if (!s || s.locked) return;
  s.locked = true;
  s.services.audio.bad();
  s.rocket.classList.add('gone');               // leaves without him
  praise(s.stage, s.services.i18n.t('ck_miss'));
  s.nextTimer = setTimeout(newRound, 1300);
}

function stop(){
  const s = state; if (!s) return;
  clearTimeout(s.launchTimer); clearTimeout(s.nextTimer);
  // neutralize the in-flight CSS fuel transition so a rapid Home/lang switch
  // can't leave a half-filled bar flashing on rebuild
  if (s.fuel){ s.fuel.style.transition = 'none'; s.fuel.style.width = '0%'; }
  if (s.rocket){ s.rocket.className = 'rocket'; }
  state = null;
}

function el(tag, cls){ const e = document.createElement(tag); if (cls) e.className = cls; return e; }
function praise(stage, text){ const p = el('div','praise'); p.textContent = text; stage.appendChild(p); setTimeout(()=>p.remove(),1200); }
function confetti(stage){
  const wrap = el('div','confetti'); const bits=['🎉','⭐','🪙','🚀','✨'];
  for(let i=0;i<14;i++){ const c=document.createElement('span'); c.textContent=bits[(Math.random()*bits.length)|0]; c.style.left=(Math.random()*100)+'%'; c.style.animationDelay=(Math.random()*0.25)+'s'; wrap.appendChild(c);}
  stage.appendChild(wrap); setTimeout(()=>wrap.remove(),1300);
}

export default { id:'cohete', title:'Cohete', icon:'🚀', start, stop };
