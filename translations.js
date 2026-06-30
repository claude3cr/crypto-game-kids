// ============================================================================
// i18n — Spanish primary, plus English / Dutch / Polish (he understands all 4).
// UI strings live here; the gold "crypto term" on buttons (BULL/BEAR/SAFE/SCAM/
// BUY) stays English everywhere — that's the real crypto vocabulary he's learning.
// ============================================================================

export const LANGS = [
  { code:'es', flag:'🇪🇸' },
  { code:'en', flag:'🇬🇧' },
  { code:'nl', flag:'🇳🇱' },
  { code:'pl', flag:'🇵🇱' },
];

export const STR = {
  es: {
    tapGame: 'toca un juego',
    titles: { 'bull-or-bear':'Toro o Oso', cohete:'Cohete', cuidado:'Cuidado', palabras:'Palabras' },
    bb_prompt:'¿SUBE o BAJA?', bb_up:'SUBE', bb_down:'BAJA',
    cd_prompt:'¿BUENO o MALO?', cd_yes:'SÍ', cd_no:'NO',
    ck_prompt:'¡TOCA EL COHETE!', ck_miss:'¡CASI!',
    wg_prompt:'¿QUÉ ES?',
    praise: ['¡MUY BIEN!','¡BIEN!','¡GENIAL!','¡SÍ!','¡PERFECTO!'],
  },
  en: {
    tapGame: 'tap a game',
    titles: { 'bull-or-bear':'Bull or Bear', cohete:'Rocket', cuidado:'Careful', palabras:'Words' },
    bb_prompt:'UP or DOWN?', bb_up:'UP', bb_down:'DOWN',
    cd_prompt:'GOOD or BAD?', cd_yes:'YES', cd_no:'NO',
    ck_prompt:'TAP THE ROCKET!', ck_miss:'ALMOST!',
    wg_prompt:'WHAT IS IT?',
    praise: ['GREAT!','NICE!','AWESOME!','YES!','PERFECT!'],
  },
  nl: {
    tapGame: 'tik op een spel',
    titles: { 'bull-or-bear':'Stier of Beer', cohete:'Raket', cuidado:'Pas op', palabras:'Woorden' },
    bb_prompt:'OMHOOG of OMLAAG?', bb_up:'OMHOOG', bb_down:'OMLAAG',
    cd_prompt:'GOED of FOUT?', cd_yes:'JA', cd_no:'NEE',
    ck_prompt:'TIK OP DE RAKET!', ck_miss:'BIJNA!',
    wg_prompt:'WAT IS HET?',
    praise: ['SUPER!','GOED!','GEWELDIG!','JA!','PERFECT!'],
  },
  pl: {
    tapGame: 'dotknij grę',
    titles: { 'bull-or-bear':'Byk czy Niedźwiedź', cohete:'Rakieta', cuidado:'Uwaga', palabras:'Słowa' },
    bb_prompt:'W GÓRĘ czy W DÓŁ?', bb_up:'W GÓRĘ', bb_down:'W DÓŁ',
    cd_prompt:'DOBRY czy ZŁY?', cd_yes:'TAK', cd_no:'NIE',
    ck_prompt:'DOTKNIJ RAKIETĘ!', ck_miss:'PRAWIE!',
    wg_prompt:'CO TO JEST?',
    praise: ['BRAWO!','DOBRZE!','SUPER!','TAK!','IDEALNIE!'],
  },
};

const KEY = 'crypto-kids.lang';
let _lang = 'es';
const _subs = [];

export const i18n = {
  get lang(){ return _lang; },
  flag(){ return (LANGS.find(l => l.code === _lang) || LANGS[0]).flag; },
  load(){ try { const s = localStorage.getItem(KEY); if (s && STR[s]) _lang = s; } catch {} },
  set(code){ if (!STR[code]) return; _lang = code; try { localStorage.setItem(KEY, code); } catch {} _subs.forEach(f => f()); },
  next(){ const i = LANGS.findIndex(l => l.code === _lang); this.set(LANGS[(i + 1) % LANGS.length].code); },
  t(key){ const v = STR[_lang][key]; return v !== undefined ? v : STR.es[key]; },
  title(id){ return STR[_lang].titles[id] || STR.es.titles[id] || id; },
  praise(){ const p = STR[_lang].praise; return p[(Math.random() * p.length) | 0]; },
  onChange(f){ _subs.push(f); },
};
