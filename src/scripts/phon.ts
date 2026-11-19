import { icon } from './icons';
import { SYMBOLS, SYMBOL_MAP, UNITS, UNIT_WORDS, MINIMAL_PAIRS, KEYBOARD, type Sym } from '../data/phonetics';
import { tokenize, diff, stripStress, describe, CONFUSE, KEYMAP, KEY_HINT, isMark } from './ipa';
import { S, save, grade, isDue, logSymbol } from './store';
import { IPA_ENTRIES, BY_ID } from './data';
import { $, $$, esc, shuffle, pick, sample, uniqueBy, sayBtn, slowBtn, isTouch, toast } from './ui';
import { runSession, mcq, setKeyHandler, type Ex } from './session';
import { sfx } from './sfx';

type W = [string, string]; // [word, ipa]
const toks = (ipa: string) => tokenize(ipa);
const core = (ipa: string) => stripStress(toks(ipa));
const has = (w: W, sym: string) => toks(w[1]).includes(sym);
const ipaHtml = (ipa: string) => `<span class="ipa">/${esc(ipa)}/</span>`;

// ---------------- pools ----------------
function unitWords(u: number): W[] {
  const unit = UNITS.find((x) => x.id === u)!;
  if (u === 13) return IPA_ENTRIES.map((e) => [e.word, e.ipa] as W);
  const fromSyms = unit.syms.flatMap((s) => SYMBOL_MAP[s].ex);
  return uniqueBy([...fromSyms, ...(UNIT_WORDS[u] ?? [])], (w) => w[0]);
}
function learnedSyms(u: number): Set<string> {
  const s = new Set<string>();
  UNITS.filter((x) => x.id <= u).forEach((x) => x.syms.forEach((y) => s.add(y)));
  if (u >= 12) SYMBOLS.forEach((y) => s.add(y.sym));
  return s;
}
const ALL_WORDS: W[] = uniqueBy([...SYMBOLS.flatMap((s) => s.ex), ...Object.values(UNIT_WORDS).flat()], (w) => w[0]);

type Ctx = { unit: number; focus: string[]; learned: Set<string>; stress: boolean; pool: W[]; typable: W[] };
function ctxFor(u: number): Ctx {
  const learned = learnedSyms(u);
  const unit = UNITS.find((x) => x.id === u)!;
  const own = unitWords(u);
  const review = u > 1 && u < 13 ? sample(UNITS.filter((x) => x.id < u).flatMap((x) => unitWords(x.id)), 12) : [];
  const pool = uniqueBy([...own, ...review], (w) => w[0]);
  const typable = (u === 13 ? own : uniqueBy([...own, ...ALL_WORDS], (w) => w[0])).filter((w) => core(w[1]).every((t) => learned.has(t)));
  const focus = unit.syms.length ? unit.syms.filter((s) => !isMark(s)) : [];
  return { unit: u, focus: focus.length ? focus : SYMBOLS.filter((s) => s.kind !== 'mark').map((s) => s.sym), learned, stress: u >= 12, pool, typable };
}

// ---------------- IPA input (on-screen + physical keyboard) ----------------
export function ipaInput(el: HTMLElement, onSubmit: (tokens: string[]) => void, opts: { stress: boolean }) {
  const showKb = S.settings.keyboard === 'show' || (S.settings.keyboard === 'auto' && isTouch());
  el.insertAdjacentHTML('beforeend', `
    <div class="ipa-input">
      <div class="ipa-box" tabindex="0"><span class="sl">/</span><span class="ipa-val"></span><span class="caret"></span><span class="sl">/</span></div>
      <div class="ipa-tools">
        <button class="btn sm bk" type="button" aria-label="Delete">${icon('backspace')}</button>
        <button class="btn sm clr" type="button">Clear</button>
        <button class="btn sm kbt" type="button">${icon('keyboard')}<span>${showKb ? 'Hide' : 'Show'} keyboard</span></button>
        <button class="btn primary chk" type="button">Check</button>
      </div>
      <div class="kb ${showKb ? '' : 'hidden'}">${KEYBOARD.filter((g) => opts.stress || g.label !== 'Marks' || true).map((g) => `<div class="kb-g"><div class="kb-l">${g.label}</div><div class="kb-keys">${g.keys.map((k) => `<button type="button" class="key" data-k="${k}">${k}</button>`).join('')}</div></div>`).join('')}</div>
      ${isTouch() ? '' : `<details class="keyhint"><summary>${icon('keyboard')} Typing on a PC keyboard</summary><p>Press a key; press it again quickly to cycle. Backspace deletes, Enter checks.</p><div class="kh">${KEY_HINT.map(([k, v]) => `<span><kbd>${esc(k)}</kbd> ${esc(v)}</span>`).join('')}</div><p class="muted">Other letters (p b k f v h m l r w g) type themselves. <kbd>:</kbd> adds ː. ${opts.stress ? 'Stress marks count in this unit.' : 'Stress marks are ignored until Unit 12.'}</p></details>`}
    </div>`);
  const val = $('.ipa-val', el), cycleHint = document.createElement('div');
  cycleHint.className = 'cycle';
  $('.ipa-box', el).after(cycleHint);
  let t: string[] = [];
  let lastKey = '', lastTime = 0, cycleIdx = 0;
  const render = () => { val.textContent = t.join(''); };
  const push = (s: string) => {
    if (s === 'ː') {
      if (t.length && !t[t.length - 1].endsWith('ː')) { t[t.length - 1] += 'ː'; t = tokenize(t.join('')); }
    } else t.push(s);
    render();
  };
  $$('.key', el).forEach((b) => (b.onclick = () => { sfx.key(); lastKey = ''; push(b.dataset.k!); }));
  $('.bk', el).onclick = () => { t.pop(); render(); };
  $('.clr', el).onclick = () => { t = []; render(); };
  $('.kbt', el).onclick = (e) => { const kb = $('.kb', el); kb.classList.toggle('hidden'); $('span', e.currentTarget as HTMLElement).textContent = kb.classList.contains('hidden') ? 'Show keyboard' : 'Hide keyboard'; };
  let submitted = false;
  const submit = () => { if (submitted || !t.length) return; submitted = true; setKeyHandler(null); onSubmit(t.slice()); };
  $('.chk', el).onclick = submit;
  setKeyHandler((e) => {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    if (e.key === 'Enter') { e.preventDefault(); submit(); return; }
    if (e.key === 'Backspace') { e.preventDefault(); t.pop(); lastKey = ''; render(); return; }
    const k = e.key.toLowerCase();
    const now = Date.now();
    const list = KEYMAP[k] ?? KEYMAP[e.key];
    if (list) {
      e.preventDefault();
      if (k === lastKey && now - lastTime < 1500 && list.length > 1 && t.length) {
        cycleIdx = (cycleIdx + 1) % list.length;
        t[t.length - 1] = list[cycleIdx];
        render();
      } else {
        cycleIdx = 0;
        push(list[0]);
      }
      sfx.key();
      lastKey = list[0] === 'ː' ? '' : k;
      lastTime = now;
      cycleHint.innerHTML = list.length > 1 ? list.map((s, i) => `<span class="${i === cycleIdx ? 'on' : ''}">${esc(s)}</span>`).join(' ') + ` <small>press <kbd>${esc(k)}</kbd> again to cycle</small>` : '';
      return;
    }
    if (SYMBOL_MAP[e.key] || 'ɪæʌɒʊəɜɑɔθðʃʒŋˈˌː'.includes(e.key)) { e.preventDefault(); push(e.key === 'ː' ? 'ː' : e.key); }
  });
}

// Compare and produce feedback html; also logs per-symbol stats.
export function judge(ipa: string, got: string[], stress: boolean) {
  let want = toks(ipa);
  if (!stress) { want = stripStress(want); got = stripStress(got); }
  const ops = diff(want, got);
  const ok = ops.every((o) => o.op === 'ok');
  ops.forEach((o) => { if (o.want && !isMark(o.want)) logSymbol(o.want, o.op === 'ok' ? o.want : o.op === 'sub' ? o.got! : null); });
  const row = ops.map((o) => {
    if (o.op === 'ok') return `<span class="tk ok">${esc(o.want!)}</span>`;
    if (o.op === 'sub') return `<span class="tk sub" title="you: ${esc(o.got!)}"><s>${esc(o.got!)}</s>${esc(o.want!)}</span>`;
    if (o.op === 'del') return `<span class="tk del">${esc(o.want!)}</span>`;
    return `<span class="tk ins"><s>${esc(o.got!)}</s></span>`;
  }).join('');
  const notes = uniqueBy(ops.filter((o) => o.op !== 'ok'), (o) => `${o.op}${o.want}${o.got}`).map((o) => {
    if (o.op === 'sub') {
      const w = SYMBOL_MAP[o.want!], g = SYMBOL_MAP[o.got!];
      if (isMark(o.want!) || isMark(o.got!)) return `<li><b>Stress:</b> the stress is in a different place. ${w ? esc(w.how) : ''}</li>`;
      return `<li>You wrote ${describe(o.got!)} but the sound is ${describe(o.want!)}${w ? ` ${sayBtn(w.key)}` : ''}${g ? ` vs ${sayBtn(g.key)}` : ''}.<br><small>${w ? esc(w.how) : ''}${w?.tip ? ' ' + esc(w.tip) : ''}</small></li>`;
    }
    if (o.op === 'del') {
      const w = SYMBOL_MAP[o.want!];
      if (isMark(o.want!)) return `<li><b>Missing stress mark</b> ${esc(o.want!)} — put it <i>before</i> the stressed syllable.</li>`;
      return `<li>Missing ${describe(o.want!)}.${w ? ` <small>${esc(w.tip)}</small>` : ''}</li>`;
    }
    if (isMark(o.got!)) return `<li>Extra stress mark ${esc(o.got!)} in the wrong place.</li>`;
    return `<li>Extra sound ${describe(o.got!)} — it is not pronounced here.${o.got === 'r' ? ' <small>Remember: British English does not pronounce r before a consonant or at the end of a word.</small>' : ''}</li>`;
  });
  const html = `<div class="cmp"><div><small>Yours</small> <span class="ipa">/${esc(got.join(''))}/</span></div><div><small>Check</small> /${row}/</div></div>${notes.length ? `<ul class="notes">${notes.join('')}</ul>` : ''}`;
  return { ok, html };
}

// ---------------- exercises ----------------
const wordOpt = (w: W, showIpa = false) => `${esc(w[0])}${showIpa ? ' ' + ipaHtml(w[1]) : ''} ${sayBtn(w[0])}`;
const revealW = (w: W) => `<div class="reveal"><b>${esc(w[0])}</b> ${ipaHtml(w[1])} ${sayBtn(w[0])} ${slowBtn(w[0])}</div>`;

function mutate(ipa: string, prefer: string[]): string | null {
  const t = toks(ipa);
  const idx = t.map((x, i) => i).filter((i) => CONFUSE[t[i]]?.length);
  if (!idx.length) return null;
  const pref = idx.filter((i) => prefer.includes(t[i]));
  const i = pick(pref.length ? pref : idx);
  const n = t.slice();
  n[i] = pick(CONFUSE[t[i]]);
  return n.join('');
}

function symInWord(c: Ctx): Ex | null {
  const f = pick(c.focus);
  const words = c.pool.filter((w) => has(w, f));
  if (!words.length) return null;
  const w = pick(words);
  const wt = toks(w[1]);
  const distract = uniqueBy(shuffle([...(CONFUSE[f] ?? []), ...c.focus, ...SYMBOLS.filter((s) => s.kind === SYMBOL_MAP[f].kind).map((s) => s.sym)]).filter((s) => s !== f && !wt.includes(s) && SYMBOL_MAP[s]), (x) => x).slice(0, 3);
  return {
    type: 'p-sym', label: 'Which sound?', retry: () => symInWord(c)!,
    render: (el, done) => {
      el.innerHTML = `<div class="q-label">Which of these sounds is in this word?</div><div class="prompt big">${esc(w[0])} ${sayBtn(w[0])} ${slowBtn(w[0])}</div>`;
      setTimeout(() => ($('[data-say]', el) as HTMLElement)?.click(), 200);
      const opts = shuffle([f, ...distract]);
      mcq(el, opts.map((s) => ({ html: `<span class="sym">${esc(s)}</span> <small>${esc(SYMBOL_MAP[s].key)}</small>`, ok: s === f })), (ok) => {
        logSymbol(f, ok ? f : null);
        done({ ok, answer: `/${esc(f)}/`, html: revealW(w) + `<div class="muted">/${esc(f)}/ = ${esc(SYMBOL_MAP[f].how)}</div>` });
      }, 'grid');
    },
  };
}

function wordWithSym(c: Ctx): Ex | null {
  const f = pick(c.focus);
  const yes = c.pool.filter((w) => has(w, f));
  const no = c.pool.filter((w) => !has(w, f));
  if (!yes.length || no.length < 3) return null;
  const w = pick(yes);
  const opts = shuffle([w, ...sample(no, 3)]);
  return {
    type: 'p-word', label: 'Find the sound', retry: () => wordWithSym(c)!,
    render: (el, done) => {
      el.innerHTML = `<div class="q-label">Which word contains the sound…</div><div class="prompt big"><span class="sym">/${esc(f)}/</span> <small class="muted">as in "${esc(SYMBOL_MAP[f].key)}"</small> ${sayBtn(SYMBOL_MAP[f].key)}</div><div class="hint">Use the speaker buttons to hear each word before choosing.</div>`;
      mcq(el, opts.map((o) => ({ html: wordOpt(o), ok: o === w })), (ok) => {
        logSymbol(f, ok ? f : null);
        done({ ok, answer: esc(w[0]), html: opts.map((o) => `<div>${esc(o[0])} ${ipaHtml(o[1])} ${sayBtn(o[0])}</div>`).join('') });
      });
    },
  };
}

function pairsFor(c: Ctx) {
  return MINIMAL_PAIRS.filter(([, a, , b]) => {
    if (c.unit >= 12) return true;
    const ta = toks(a), tb = toks(b);
    const d = [...ta.filter((x) => !tb.includes(x)), ...tb.filter((x) => !ta.includes(x))];
    return d.some((x) => c.focus.includes(x)) && [...ta, ...tb].every((x) => isMark(x) || c.learned.has(x) || c.unit >= 5);
  });
}
function minimal(c: Ctx, pairs = pairsFor(c)): Ex | null {
  if (!pairs.length) return null;
  const p = pick(pairs);
  const A: W = [p[0], p[1]], B: W = [p[2], p[3]];
  const target = Math.random() < 0.5 ? A : B;
  return {
    type: 'p-pair', label: 'Minimal pair', retry: () => minimal(c, pairs)!,
    render: (el, done) => {
      el.innerHTML = `<div class="q-label">Listen. Which word do you hear?</div><div class="prompt center">${sayBtn(target[0], 'Play', 'huge')} ${slowBtn(target[0])}</div>`;
      setTimeout(() => ($('[data-say]', el) as HTMLElement)?.click(), 200);
      mcq(el, [A, B].map((o) => ({ html: `${esc(o[0])} ${ipaHtml(o[1])}`, ok: o === target })), (ok) => {
        const ta = toks(A[1]), tb = toks(B[1]);
        const da = ta.find((x, i) => x !== tb[i]) ?? '', db = tb.find((x, i) => x !== ta[i]) ?? '';
        if (da && SYMBOL_MAP[da]) logSymbol(target === A ? da : db, ok ? (target === A ? da : db) : (target === A ? db : da));
        done({ ok, answer: esc(target[0]), html: `<div>${esc(A[0])} ${ipaHtml(A[1])} ${sayBtn(A[0])} &nbsp;vs&nbsp; ${esc(B[0])} ${ipaHtml(B[1])} ${sayBtn(B[0])}</div>${da && db ? `<div class="muted">Difference: /${esc(da)}/ vs /${esc(db)}/</div>` : ''}` });
      }, 'row');
    },
  };
}

function readIPA(c: Ctx): Ex | null {
  const pool = c.unit === 1 ? c.pool : c.pool;
  if (pool.length < 4) return null;
  const w = pick(pool);
  const opts = shuffle([w, ...sample(pool.filter((x) => x !== w && x[0].toLowerCase() !== w[0].toLowerCase()), 3)]);
  return {
    type: 'p-read', label: 'Read the IPA', retry: () => readIPA(c)!,
    render: (el, done) => {
      el.innerHTML = `<div class="q-label">Which word is this transcription?</div><div class="prompt big">${ipaHtml(w[1])}</div>`;
      mcq(el, opts.map((o) => ({ html: esc(o[0]), ok: o === w })), (ok) => done({ ok, answer: esc(w[0]), html: revealW(w) }));
    },
  };
}

function pickIPA(c: Ctx, words = c.unit === 1 ? c.pool : c.typable.length >= 4 ? c.typable : c.pool): Ex | null {
  const w = pick(words);
  const muts = uniqueBy(Array.from({ length: 12 }, () => mutate(w[1], c.focus)).filter((x): x is string => !!x && x !== w[1]), (x) => x).slice(0, 3);
  if (muts.length < 2) return null;
  return {
    type: 'p-pick', label: 'Choose the transcription', retry: () => pickIPA(c, words)!,
    render: (el, done) => {
      el.innerHTML = `<div class="q-label">Choose the correct British transcription</div><div class="prompt big">${esc(w[0])} ${sayBtn(w[0])} ${slowBtn(w[0])}</div>`;
      const opts = shuffle([w[1], ...muts]);
      mcq(el, opts.map((o) => ({ html: ipaHtml(o), ok: o === w[1] })), (ok, i) => {
        const r = judge(w[1], toks(opts[i]), true);
        done({ ok, answer: ipaHtml(w[1]), html: revealW(w) + (ok ? '' : r.html) });
      });
    },
  };
}

function edgeSound(c: Ctx): Ex | null {
  const last = Math.random() < 0.4;
  const words = ALL_WORDS.filter((w) => { const t = core(w[1]); const s = last ? t[t.length - 1] : t[0]; return c.learned.has(s); });
  if (!words.length) return null;
  const w = pick(words);
  const t = core(w[1]);
  const s = last ? t[t.length - 1] : t[0];
  const distract = uniqueBy(shuffle([...(CONFUSE[s] ?? []), ...[...c.learned]]).filter((x) => x !== s && SYMBOL_MAP[x] && SYMBOL_MAP[x].kind === 'consonant'), (x) => x).slice(0, 3);
  return {
    type: 'p-edge', label: 'First / last sound', retry: () => edgeSound(c)!,
    render: (el, done) => {
      el.innerHTML = `<div class="q-label">What is the <b>${last ? 'LAST' : 'FIRST'}</b> sound of this word?</div><div class="prompt big">${esc(w[0])} ${sayBtn(w[0])} ${slowBtn(w[0])}</div><div class="hint">Listen — think about the sound, not the spelling!</div>`;
      mcq(el, shuffle([s, ...distract]).map((x) => ({ html: `<span class="sym">${esc(x)}</span>`, ok: x === s })), (ok) => {
        logSymbol(s, ok ? s : null);
        done({ ok, answer: `/${esc(s)}/`, html: revealW(w) });
      }, 'grid');
    },
  };
}

function build(c: Ctx, words = c.typable): Ex | null {
  if (!words.length) return null;
  const w = pick(words);
  let t = toks(w[1]);
  if (!c.stress) t = stripStress(t);
  if (t.length > 12) return null;
  const extra = uniqueBy(shuffle(t.flatMap((x) => CONFUSE[x] ?? [])).filter((x) => !t.includes(x)), (x) => x).slice(0, Math.min(3, Math.max(2, Math.floor(t.length / 2))));
  return {
    type: 'p-build', label: 'Build the transcription', retry: () => build(c, words)!,
    render: (el, done) => {
      el.innerHTML = `<div class="q-label">Build the transcription — tap the sounds in order</div><div class="prompt big">${esc(w[0])} ${sayBtn(w[0])} ${slowBtn(w[0])}</div>
        <div class="built ipa-box"><span class="sl">/</span><span class="bv"></span><span class="sl">/</span></div>
        <div class="tiles"></div><div class="ipa-tools"><button class="btn sm undo" type="button">${icon('backspace')}<span>Undo</span></button><button class="btn primary chk" type="button">Check</button></div>`;
      const bv = $('.bv', el), tiles = $('.tiles', el);
      const chosen: HTMLElement[] = [];
      shuffle([...t, ...extra]).forEach((s) => {
        const b = document.createElement('button');
        b.type = 'button'; b.className = 'tile ipa-t'; b.textContent = s;
        b.onclick = () => { if (b.classList.contains('used')) return; sfx.key(); b.classList.add('used'); chosen.push(b); bv.textContent = chosen.map((x) => x.textContent).join(''); };
        tiles.appendChild(b);
      });
      $('.undo', el).onclick = () => { const b = chosen.pop(); b?.classList.remove('used'); bv.textContent = chosen.map((x) => x.textContent).join(''); };
      const check = () => { if (!chosen.length) return; setKeyHandler(null); const r = judge(w[1], chosen.map((x) => x.textContent!), c.stress); done({ ok: r.ok, answer: ipaHtml(w[1]), html: revealW(w) + (r.ok ? '' : r.html) }); };
      $('.chk', el).onclick = check;
      setKeyHandler((e) => { if (e.key === 'Enter') check(); if (e.key === 'Backspace') ($('.undo', el) as HTMLElement).click(); });
    },
  };
}

function typeIPA(c: Ctx, words = c.typable, onRes?: (w: W, ok: boolean) => void): Ex | null {
  if (!words.length) return null;
  const w = pick(words);
  return {
    type: 'p-type', label: 'Type the IPA', item: w[0], retry: () => typeIPA(c, words, onRes)!,
    onResult: (ok, first) => { if (first) onRes?.(w, ok); },
    render: (el, done) => {
      el.innerHTML = `<div class="q-label">Type the British transcription</div><div class="prompt big">${esc(w[0])} ${sayBtn(w[0])} ${slowBtn(w[0])}</div>`;
      ipaInput(el, (got) => { const r = judge(w[1], got, c.stress); done({ ok: r.ok, answer: ipaHtml(w[1]), html: revealW(w) + r.html }); }, { stress: c.stress });
    },
  };
}

// Silent teaching cards
function theoryCard(u: (typeof UNITS)[number]): Ex {
  return {
    type: 'teach', label: 'Theory', silent: true,
    render: (el, done) => {
      el.innerHTML = `<div class="q-label">Unit ${u.id} · ${esc(u.title)}</div><div class="theory">${u.theory.map((p) => `<p>${esc(p)}</p>`).join('')}</div><button class="btn primary big go">Start</button>`;
      const go = () => { setKeyHandler(null); done({ ok: true }); };
      $('.go', el).onclick = go;
      setKeyHandler((e) => { if (e.key === 'Enter') go(); });
    },
  };
}
export function symbolCard(s: Sym, withBtn = true) {
  const stat = S.sym[s.sym];
  const pairs = MINIMAL_PAIRS.filter(([, a, , b]) => toks(a).includes(s.sym) !== toks(b).includes(s.sym)).slice(0, 4);
  return `<div class="symcard">
    <div class="sc-head"><div class="sc-sym">${esc(s.sym)}</div><div><b>${esc(s.name)}</b><div class="muted">${esc(s.kind)} · as in <b>${esc(s.key)}</b> ${sayBtn(s.key)} ${slowBtn(s.key)}</div></div></div>
    <p><b>How:</b> ${esc(s.how)}</p>
    <p class="tip">${icon('bulb')}<span>${esc(s.tip)}</span></p>
    <p><b>Spellings:</b> ${esc(s.spell)}</p>
    <div class="exs">${s.ex.map((w) => `<div class="exw">${esc(w[0])} ${ipaHtml(w[1])} ${sayBtn(w[0])}</div>`).join('')}</div>
    ${pairs.length ? `<p><b>Don't confuse:</b> ${pairs.map((p) => `${esc(p[0])} ${sayBtn(p[0])} / ${esc(p[2])} ${sayBtn(p[2])}`).join(' · ')}</p>` : ''}
    ${stat ? `<p class="muted">Your accuracy on /${esc(s.sym)}/: ${Math.round((stat.c / (stat.c + stat.w)) * 100)}% (${stat.c + stat.w} answers)</p>` : ''}
    ${withBtn ? '<button class="btn primary big go">Next</button>' : ''}
  </div>`;
}
function symIntro(s: Sym): Ex {
  return {
    type: 'teach', label: 'Sound', silent: true,
    render: (el, done) => {
      el.innerHTML = `<div class="q-label">New sound</div>${symbolCard(s)}`;
      setTimeout(() => ($('[data-say]', el) as HTMLElement)?.click(), 300);
      const go = () => { setKeyHandler(null); done({ ok: true }); };
      $('.go', el).onclick = go;
      setKeyHandler((e) => { if (e.key === 'Enter') go(); });
    },
  };
}

function fill(c: Ctx, gens: ((c: Ctx) => Ex | null)[], n: number): Ex[] {
  const out: Ex[] = [];
  let guard = 0;
  while (out.length < n && guard++ < 200) {
    const x = pick(gens)(c);
    if (x) out.push(x);
  }
  return out;
}

export function lessonExercises(u: number, level: number): Ex[] {
  const c = ctxFor(u);
  const unit = UNITS.find((x) => x.id === u)!;
  const ex: Ex[] = [];
  if (level === 1) {
    ex.push(theoryCard(unit));
    if (u !== 1) unit.syms.forEach((s) => ex.push(symIntro(SYMBOL_MAP[s])));
    else ex.push(...['b', 'v', 'z', 'w'].map((s) => symIntro(SYMBOL_MAP[s])));
  }
  const L: Record<number, ((c: Ctx) => Ex | null)[]> =
    u === 1
      ? { 1: [edgeSound, wordWithSym, readIPA], 2: [edgeSound, readIPA, wordWithSym], 3: [edgeSound, readIPA] }
      : u === 13
        ? { 1: [readIPA, (c) => pickIPA(c, c.pool)], 2: [build, (c) => pickIPA(c, c.pool), readIPA], 3: [typeIPA, typeIPA, build] }
        : u === 12
          ? { 1: [pickIPA, readIPA, minimal], 2: [build, pickIPA, minimal], 3: [typeIPA, typeIPA, build] }
          : { 1: [symInWord, wordWithSym, minimal, readIPA], 2: [pickIPA, minimal, build, readIPA, symInWord], 3: [typeIPA, typeIPA, typeIPA, build, minimal] };
  ex.push(...fill(c, L[level], 10));
  return ex;
}

// ---------------- screens ----------------
export const unitUnlocked = (u: number) => u === 1 || (S.units[u - 1] ?? 0) >= 1;
const LEVELS = ['Discover', 'Practise', 'Master'];

export function phonHome(root: HTMLElement, nav: (r: string) => void) {
  const due = IPA_ENTRIES.filter((e) => isDue(S.ipaWords[e.id])).length;
  root.innerHTML = `
    <h1>Phonetics <small class="muted">British English</small></h1>
    <div class="actions">
      <button class="act" data-go="phon/library"><span class="ai">${icon('letters')}</span><div><b>Sound library</b><small>All 44 sounds — how to make them, with audio</small></div></button>
      <button class="act" data-go="phon/pairs"><span class="ai">${icon('headphones')}</span><div><b>Minimal pairs trainer</b><small>ship/sheep, think/sink… train your ear</small></div></button>
      <button class="act ${due ? 'hot' : ''}" data-go="phon/drill" ${unitUnlocked(13) || Object.keys(S.ipaWords).length ? '' : ''}><span class="ai">${icon('pen')}</span><div><b>Transcribe your vocab${due ? ` (${due} due)` : ''}</b><small>Spaced repetition on your textbook words</small></div></button>
    </div>
    <h2>Course</h2>
    <div class="path">${UNITS.map((u) => {
      const open = unitUnlocked(u.id), lv = S.units[u.id] ?? 0;
      return `<div class="unit ${open ? '' : 'locked'} ${lv >= 3 ? 'done' : ''}">
        <div class="u-num">${lv >= 3 ? icon('crown') : open ? u.id : icon('lock')}</div>
        <div class="u-body"><b>${esc(u.title)}</b><small>${esc(u.desc)}</small>
          <div class="u-levels">${LEVELS.map((name, i) => {
            const can = open && lv >= i;
            return `<button class="lvl-btn ${lv > i ? 'done' : ''}" ${can ? '' : 'disabled'} data-go="phon/lesson/${u.id}/${i + 1}">${lv > i ? icon('check') : ''}${name}</button>`;
          }).join('')}</div>
        </div></div>`;
    }).join('')}</div>`;
  $$('[data-go]', root).forEach((b) => (b.onclick = () => nav(b.dataset.go!)));
}

export function phonLesson(root: HTMLElement, u: number, level: number, nav: (r: string) => void) {
  if (!unitUnlocked(u)) return nav('phon');
  const unit = UNITS.find((x) => x.id === u)!;
  runSession(root, lessonExercises(u, level), {
    title: `${unit.title} · ${LEVELS[level - 1]}`, xpPer: 3, back: () => nav('phon'),
    onFinish: (r) => {
      const acc = r.correct / Math.max(1, r.correct + r.wrong);
      const prev = S.units[u] ?? 0;
      if (level > prev && acc >= 0.6) {
        S.units[u] = level; save();
        if (level === 1 && UNITS.find((x) => x.id === u + 1)) { sfx.unlock(); toast(`Unit ${u + 1} unlocked!`); }
      } else if (level > prev) toast('Get at least 60% first-try to complete this level.');
    },
  });
}

export function library(root: HTMLElement, nav: (r: string) => void, sel?: string) {
  const groups: [string, Sym['kind'][]][] = [['Short vowels', ['short vowel']], ['Long vowels', ['long vowel']], ['Diphthongs', ['diphthong']], ['Consonants', ['consonant']], ['Weak vowels & stress', ['weak vowel', 'mark']]];
  root.innerHTML = `<button class="back" data-go="phon">${icon('left')}Phonetics</button><h1>Sound library</h1><p class="muted">Tap a symbol to learn it. Colour = your accuracy (grey = not practised yet).</p>
    ${groups.map(([g, kinds]) => `<h3>${g}</h3><div class="symgrid">${SYMBOLS.filter((s) => kinds.includes(s.kind)).map((s) => {
      const st = S.sym[s.sym]; const a = st ? st.c / (st.c + st.w) : -1;
      return `<button class="symbtn ${a < 0 ? '' : a >= 0.85 ? 'g' : a >= 0.6 ? 'y' : 'r'}" data-s="${esc(s.sym)}"><b>${esc(s.sym)}</b><small>${esc(s.key)}</small></button>`;
    }).join('')}</div>`).join('')}
    <div class="symdetail"></div>`;
  const det = $('.symdetail', root);
  const show = (sym: string) => { det.innerHTML = symbolCard(SYMBOL_MAP[sym], false); det.scrollIntoView({ behavior: 'smooth' }); };
  $$('.symbtn', root).forEach((b) => (b.onclick = () => show(b.dataset.s!)));
  $$('[data-go]', root).forEach((b) => (b.onclick = () => nav(b.dataset.go!)));
  if (sel) show(sel);
}

export function pairsTrainer(root: HTMLElement, nav: (r: string) => void) {
  const c = ctxFor(12);
  const ex = Array.from({ length: 15 }, () => minimal(c, MINIMAL_PAIRS)!).filter(Boolean);
  runSession(root, ex, { title: 'Minimal pairs', back: () => nav('phon') });
}

export function vocabDrill(root: HTMLElement, nav: (r: string) => void, only?: string) {
  const c = ctxFor(13);
  let words: W[];
  if (only) {
    const e = BY_ID[only];
    words = [[e.word, e.ipa]];
  } else {
    const due = IPA_ENTRIES.filter((e) => isDue(S.ipaWords[e.id]));
    const fresh = IPA_ENTRIES.filter((e) => !S.ipaWords[e.id] && S.vocab[e.id]).concat(IPA_ENTRIES.filter((e) => !S.ipaWords[e.id]));
    const chosen = uniqueBy([...shuffle(due).slice(0, 7), ...fresh.slice(0, 10)], (e) => e.id).slice(0, 8);
    words = chosen.map((e) => [e.word, e.ipa]);
  }
  const res = (w: W, ok: boolean) => grade(S.ipaWords, w[0], ok);
  const ex: Ex[] = [];
  words.forEach((w) => {
    const box = S.ipaWords[w[0]]?.box ?? 0;
    if (box < 2 && !only) { const p = pickIPA(c, [w]); if (p) ex.push(p); }
    ex.push(typeIPA(c, [w], res)!);
  });
  if (only) { const b = build(c, words); if (b) ex.unshift(b); }
  runSession(root, ex, { title: only ? `IPA: ${only}` : 'Transcribe your vocab', xpPer: 3, back: () => nav(only ? `vocab/word/${encodeURIComponent(only)}` : 'phon') });
}
